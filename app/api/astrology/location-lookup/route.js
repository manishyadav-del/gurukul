import { NextResponse } from "next/server";
import {
  getAvailableCountries,
  getStatesForCountry,
  getTownsForState,
  searchAllLocations,
  filterByFirstLetter,
  estimateTzFromLongitude,
  formatTzOffset,
} from "@/components/astrology/worldLocations";

export const runtime = "nodejs";

/**
 * GET /api/astrology/location-lookup
 * 
 * Supports:
 * - ?action=countries
 * - ?action=states&country=India[&letter=u]
 * - ?action=towns&country=India&state=Uttar+Pradesh[&letter=v]
 * - ?q=varanasi[&online=1]
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const query = searchParams.get("q");
    const country = searchParams.get("country");
    const state = searchParams.get("state");
    const letter = searchParams.get("letter") || searchParams.get("firstLetter");
    const online = searchParams.get("online") === "1" || searchParams.get("online") === "true";

    // 1. Return countries
    if (action === "countries") {
      let countries = getAvailableCountries();
      if (letter) {
        countries = filterByFirstLetter(countries, letter);
      }
      return NextResponse.json({ success: true, countries });
    }

    // 2. Return states for country
    if (action === "states") {
      if (!country) {
        return NextResponse.json({ error: "Missing required parameter: country" }, { status: 400 });
      }
      let states = getStatesForCountry(country);
      if (letter) {
        states = filterByFirstLetter(states, letter);
      }
      return NextResponse.json({ success: true, country, states });
    }

    // 3. Return towns for state
    if (action === "towns") {
      if (!country || !state) {
        return NextResponse.json({ error: "Missing required parameters: country, state" }, { status: 400 });
      }
      let towns = getTownsForState(country, state);
      if (letter) {
        towns = filterByFirstLetter(towns, letter);
      }
      return NextResponse.json({ success: true, country, state, towns });
    }

    // 4. Query search across database
    if (query) {
      const localMatches = searchAllLocations(query, 20);

      // If local matches exist or online fallback not requested, return local matches
      if (localMatches.length > 0 || !online || query.trim().length < 3) {
        return NextResponse.json({
          success: true,
          query,
          source: "local_database",
          results: localMatches,
        });
      }

      // 5. Online geocoding fallback via OpenStreetMap Nominatim for obscure villages
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "GurukulAstrology/1.0 (contact: info@gurukul.local)",
            "Accept-Language": "en",
          },
          signal: AbortSignal.timeout(3500),
        });

        if (res.ok) {
          const data = await res.json();
          const onlineResults = (data || []).map((item) => {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            const estTz = estimateTzFromLongitude(lon);
            const city = item.address?.city || item.address?.town || item.address?.village || item.address?.suburb || item.name;
            const stateName = item.address?.state || item.address?.region || "";
            const countryName = item.address?.country || "";

            return {
              name: item.display_name,
              shortName: city || item.name,
              state: stateName,
              country: countryName,
              lat,
              lon,
              tz: estTz,
              tzStr: `UTC${formatTzOffset(estTz)}`,
              isSacred: false,
              source: "geocoded",
            };
          });

          return NextResponse.json({
            success: true,
            query,
            source: "nominatim_geocoded",
            results: onlineResults,
          });
        }
      } catch {
        // Fallback gracefully to whatever local matches we have
      }

      return NextResponse.json({
        success: true,
        query,
        source: "local_database",
        results: localMatches,
      });
    }

    return NextResponse.json({
      error: "Provide either ?action=countries|states|towns or ?q=<search_term>",
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to lookup location" }, { status: 500 });
  }
}

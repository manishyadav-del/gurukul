import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { getFamilyMember, updateFamilyMember } from "@/server/family/familyService";
import { calculateBirthChart } from "@/server/astrology/engine";
import prisma from "@/lib/prisma";

// GET /api/family/[id]/kundli — Fetch or calculate Kundli for family member
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const member = await getFamilyMember(id, authUser.id);
    if (!member) {
      return NextResponse.json({ error: "Family member not found" }, { status: 404 });
    }

    // If birthProfile with chart already exists, return it
    if (member.birthProfile?.birthChart) {
      return NextResponse.json({
        success: true,
        profile: member.birthProfile,
        chart: member.birthProfile.birthChart,
      });
    }

    // If member has birth details, calculate on-the-fly and persist
    if (member.dateOfBirth && member.birthTime && member.birthPlace) {
      const dob = new Date(member.dateOfBirth);
      const [hStr, mStr] = member.birthTime.split(":");
      const lat = member.latitude || 28.6139;
      const lon = member.longitude || 77.2090;

      const chart = calculateBirthChart({
        name: member.name,
        year: dob.getUTCFullYear(),
        month: dob.getUTCMonth() + 1,
        day: dob.getUTCDate(),
        hour: parseInt(hStr || "12", 10),
        minute: parseInt(mStr || "0", 10),
        latitude: lat,
        longitude: lon,
        timezone: member.timezone || "Asia/Kolkata",
        birthPlace: member.birthPlace,
        gender: member.gender || "Not Specified",
      });

      // Save BirthProfile and BirthChart
      const profileRecord = await prisma.birthProfile.create({
        data: {
          userId: authUser.id,
          name: member.name,
          birthDate: new Date(chart.profile.utcDate),
          birthTime: member.birthTime,
          birthPlace: member.birthPlace,
          latitude: lat,
          longitude: lon,
          timezone: member.timezone || "Asia/Kolkata",
          gender: member.gender,
          language: "en",
          birthChart: {
            create: {
              ascendant: chart.ascendant.siderealTotalDegree,
              lagnaSign: chart.ascendant.sign,
              lagnaDegree: chart.ascendant.degree,
              ayanamsa: chart.calculation.ayanamsa,
              ayanamsaValue: chart.calculation.ayanamsaValue,
              moonSign: chart.moon.sign,
              moonNakshatra: chart.moon.nakshatra,
              moonPada: chart.moon.pada,
              currentDasha: chart.dasha.currentMahadasha,
              dashaBalance: chart.dasha.balanceText,
              calculationEngine: chart.calculation.calculationEngine,
              engineVersion: chart.calculation.engineVersion,
              chartData: chart,
              planets: {
                create: chart.planets.map((p) => ({
                  planet: p.planet,
                  sign: p.sign,
                  house: p.house,
                  degree: p.degree,
                  speed: p.speed,
                  nakshatra: p.nakshatra,
                  pada: p.pada,
                  retrograde: p.retrograde,
                  signLord: p.signLord,
                  nakshatraLord: p.nakshatraLord,
                })),
              },
            },
          },
        },
        include: {
          birthChart: { include: { planets: true } },
        },
      });

      // Link to family member
      await prisma.familyMember.update({
        where: { id: member.id },
        data: { birthProfileId: profileRecord.id },
      });

      return NextResponse.json({
        success: true,
        profile: profileRecord,
        chart: profileRecord.birthChart,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Family member does not have sufficient birth details (date of birth, birth time, and birth place are required to generate Kundli).",
      },
      { status: 422 }
    );
  } catch (error) {
    console.error("GET /api/family/[id]/kundli error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve family member Kundli" },
      { status: error.statusCode || 500 }
    );
  }
}

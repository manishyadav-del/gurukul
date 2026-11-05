/**
 * Birth Details Validator and Time Normalizer
 */

/**
 * Parses timezone input into offset in minutes from UTC.
 * Accepts "+05:30", "-04:00", "+5.5", 5.5, or standard IANA zone names.
 * 
 * @param {string|number} tz
 * @returns {number} Offset in minutes from UTC (e.g. +330 for IST +05:30)
 */
export function parseTimezoneOffsetMinutes(tz) {
  if (typeof tz === "number" && !isNaN(tz)) {
    // Treat as hours offset
    return Math.round(tz * 60);
  }

  if (typeof tz !== "string" || !tz.trim()) {
    // Default to Indian Standard Time (+05:30) if unspecified
    return 330;
  }

  const clean = tz.trim();

  // Match ISO offset "+05:30", "-08:00", "+0530", "+05", "-4"
  const offsetMatch = clean.match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (offsetMatch) {
    const sign = offsetMatch[1] === "-" ? -1 : 1;
    const hours = parseInt(offsetMatch[2], 10);
    const minutes = offsetMatch[3] ? parseInt(offsetMatch[3], 10) : 0;
    return sign * (hours * 60 + minutes);
  }

  // Handle common zone names
  const upper = clean.toUpperCase();
  if (upper === "UTC" || upper === "GMT" || upper === "Z") return 0;
  if (upper === "IST" || upper === "ASIA/KOLKATA" || upper === "ASIA/CALCUTTA") return 330;
  if (upper === "EST") return -300;
  if (upper === "EDT") return -240;
  if (upper === "CST") return -360;
  if (upper === "CDT") return -300;
  if (upper === "MST") return -420;
  if (upper === "MDT") return -360;
  if (upper === "PST") return -480;
  if (upper === "PDT") return -420;

  // Try standard Intl API timezone offset resolution
  try {
    const d = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: clean,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(d);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (tzPart && tzPart.value) {
      const match = tzPart.value.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
      if (match) {
        const sign = match[1].startsWith("-") ? -1 : 1;
        const h = Math.abs(parseInt(match[1], 10));
        const m = match[2] ? parseInt(match[2], 10) : 0;
        return sign * (h * 60 + m);
      }
    }
  } catch {
    // Fall back to IST default
  }

  return 330;
}

/**
 * Validates birth details input for chart calculation.
 * 
 * @param {Object} input
 * @returns {{ isValid: boolean, errors: string[], normalized: Object }}
 */
export function validateBirthDetails(input = {}) {
  const errors = [];

  // 1. Name validation
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name || name.length < 2) {
    errors.push("Name is required and must be at least 2 characters.");
  } else if (name.length > 100) {
    errors.push("Name cannot exceed 100 characters.");
  }

  // 2. Birth Date validation (YYYY-MM-DD)
  let birthDateStr = "";
  if (input.birthDate instanceof Date && !isNaN(input.birthDate)) {
    birthDateStr = input.birthDate.toISOString().split("T")[0];
  } else if (typeof input.birthDate === "string") {
    birthDateStr = input.birthDate.trim();
  }

  const dateMatch = birthDateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!dateMatch) {
    errors.push("Birth date must be in YYYY-MM-DD format.");
  } else {
    const year = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const day = parseInt(dateMatch[3], 10);

    if (year < 1850 || year > 2150) {
      errors.push("Birth year must be between 1850 and 2150.");
    }
    if (month < 1 || month > 12) {
      errors.push("Birth month must be between 1 and 12.");
    }
    if (day < 1 || day > 31) {
      errors.push("Birth day must be between 1 and 31.");
    }
  }

  // 3. Birth Time validation (HH:mm or HH:mm:ss)
  const birthTimeStr = typeof input.birthTime === "string" ? input.birthTime.trim() : "12:00";
  const timeMatch = birthTimeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  let hour = 12;
  let minute = 0;
  let second = 0;

  if (!timeMatch) {
    errors.push("Birth time must be in HH:mm or HH:mm:ss 24-hour format (e.g. 14:30).");
  } else {
    hour = parseInt(timeMatch[1], 10);
    minute = parseInt(timeMatch[2], 10);
    second = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
      errors.push("Birth time is out of valid range (00:00:00 to 23:59:59).");
    }
  }

  // 4. Latitude validation (-90 to +90)
  const lat = typeof input.latitude === "number"
    ? input.latitude
    : parseFloat(input.latitude ?? "28.6139"); // Default: New Delhi
  if (isNaN(lat) || lat < -90 || lat > 90) {
    errors.push("Latitude must be a valid number between -90 and 90 degrees.");
  }

  // 5. Longitude validation (-180 to +180)
  const lng = typeof input.longitude === "number"
    ? input.longitude
    : parseFloat(input.longitude ?? "77.2090"); // Default: New Delhi
  if (isNaN(lng) || lng < -180 || lng > 180) {
    errors.push("Longitude must be a valid number between -180 and 180 degrees.");
  }

  // 6. Timezone offset resolution
  const offsetMinutes = parseTimezoneOffsetMinutes(input.timezone ?? "+05:30");

  // 7. Language
  let language = "en";
  if (input.language) {
    const langLower = String(input.language).toLowerCase();
    if (["hi", "hindi"].includes(langLower)) language = "hi";
    else if (["sa", "sanskrit"].includes(langLower)) language = "sa";
  }

  // Construct exact UTC Date object for planetary calculation
  let utcDate = null;
  if (errors.length === 0) {
    const pad = (n) => String(n).padStart(2, "0");
    const [y, m, d] = birthDateStr.split("-").map((v) => parseInt(v, 10));

    // Calculate local timestamp in UTC milliseconds:
    // Local date elements in UTC representation
    const localUtcMs = Date.UTC(y, m - 1, d, hour, minute, second);
    // Subtract timezone offset to get actual UTC time
    const actualUtcMs = localUtcMs - offsetMinutes * 60 * 1000;
    utcDate = new Date(actualUtcMs);
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalized: errors.length === 0
      ? {
          name,
          birthDate: birthDateStr,
          birthTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`,
          birthPlace: typeof input.birthPlace === "string" ? input.birthPlace.trim() : "New Delhi, India",
          latitude: lat,
          longitude: lng,
          timezone: input.timezone || "+05:30",
          timezoneOffsetMinutes: offsetMinutes,
          gender: input.gender || "unspecified",
          language,
          utcDate,
        }
      : null,
  };
}

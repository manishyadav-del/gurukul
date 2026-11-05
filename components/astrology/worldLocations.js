/**
 * Curated World Cities & Custom Location Utilities for Vedic Astrology
 * 
 * Supports accurate planetary positions, Ascendant (Lagna), Sunrise, Sunset,
 * Choghadiya, and Panchang for any location on Earth.
 */

export const WORLD_CITIES = [
  // Sacred & Pilgrimage Centers (India & Nepal)
  { name: "Ayodhya, Uttar Pradesh, India",   lat: 26.7922, lon: 82.1998, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Varanasi (Kashi), UP, India",     lat: 25.3176, lon: 82.9739, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Haridwar, Uttarakhand, India",    lat: 29.9457, lon: 78.1642, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Rishikesh, Uttarakhand, India",   lat: 30.0869, lon: 78.2676, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Ujjain (Mahakal), MP, India",     lat: 23.1765, lon: 75.7885, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Mathura / Vrindavan, UP, India",  lat: 27.4924, lon: 77.6737, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Tirupati, Andhra Pradesh, India", lat: 13.6288, lon: 79.4192, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Puri (Jagannath), Odisha, India", lat: 19.8135, lon: 85.8312, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Deoria, Uttar Pradesh, India",    lat: 26.5024, lon: 83.7791, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },

  // Major Metros & Cities (India)
  { name: "New Delhi, India",                lat: 28.6139, lon: 77.2090, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },
  { name: "Mumbai, Maharashtra, India",      lat: 19.0760, lon: 72.8777, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },
  { name: "Bengaluru, Karnataka, India",     lat: 12.9716, lon: 77.5946, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },
  { name: "Kolkata, West Bengal, India",     lat: 22.5726, lon: 88.3639, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },
  { name: "Chennai, Tamil Nadu, India",      lat: 13.0827, lon: 80.2707, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },
  { name: "Hyderabad, Telangana, India",     lat: 17.3850, lon: 78.4867, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },
  { name: "Ahmedabad, Gujarat, India",       lat: 23.0225, lon: 72.5714, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },
  { name: "Jaipur, Rajasthan, India",        lat: 26.9124, lon: 75.7873, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },
  { name: "Pune, Maharashtra, India",        lat: 18.5204, lon: 73.8567, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },
  { name: "Lucknow, Uttar Pradesh, India",   lat: 26.8467, lon: 80.9462, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },
  { name: "Patna, Bihar, India",             lat: 25.5941, lon: 85.1376, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },
  { name: "Chandigarh, India",               lat: 30.7333, lon: 76.7794, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },

  // Asia & Middle East
  { name: "Kathmandu, Nepal",                lat: 27.7172, lon: 85.3240, tz: 5.75, tzStr: "Asia/Kathmandu", category: "Asia & Middle East" },
  { name: "Colombo, Sri Lanka",              lat: 6.9271,  lon: 79.8612, tz: 5.5,  tzStr: "Asia/Colombo",   category: "Asia & Middle East" },
  { name: "Dubai, United Arab Emirates",     lat: 25.2048, lon: 55.2708, tz: 4.0,  tzStr: "Asia/Dubai",     category: "Asia & Middle East" },
  { name: "Singapore",                       lat: 1.3521,  lon: 103.8198,tz: 8.0,  tzStr: "Asia/Singapore", category: "Asia & Middle East" },
  { name: "Bangkok, Thailand",               lat: 13.7563, lon: 100.5018,tz: 7.0,  tzStr: "Asia/Bangkok",   category: "Asia & Middle East" },
  { name: "Tokyo, Japan",                    lat: 35.6762, lon: 139.6503,tz: 9.0,  tzStr: "Asia/Tokyo",     category: "Asia & Middle East" },
  { name: "Seoul, South Korea",              lat: 37.5665, lon: 126.9780,tz: 9.0,  tzStr: "Asia/Seoul",     category: "Asia & Middle East" },
  { name: "Hong Kong",                       lat: 22.3193, lon: 114.1694,tz: 8.0,  tzStr: "Asia/Hong_Kong", category: "Asia & Middle East" },
  { name: "Kuala Lumpur, Malaysia",          lat: 3.1390,  lon: 101.6869,tz: 8.0,  tzStr: "Asia/Kuala_Lumpur", category: "Asia & Middle East" },
  { name: "Bali, Indonesia",                 lat: -8.4095, lon: 115.1889,tz: 8.0,  tzStr: "Asia/Makassar",  category: "Asia & Middle East" },

  // Europe & UK
  { name: "London, United Kingdom",          lat: 51.5074, lon: -0.1278, tz: 0.0,  tzStr: "Europe/London",  category: "Europe & UK" },
  { name: "Paris, France",                   lat: 48.8566, lon: 2.3522,  tz: 1.0,  tzStr: "Europe/Paris",   category: "Europe & UK" },
  { name: "Berlin, Germany",                 lat: 52.5200, lon: 13.4050, tz: 1.0,  tzStr: "Europe/Berlin",  category: "Europe & UK" },
  { name: "Rome, Italy",                     lat: 41.9028, lon: 12.4964, tz: 1.0,  tzStr: "Europe/Rome",    category: "Europe & UK" },
  { name: "Amsterdam, Netherlands",          lat: 52.3676, lon: 4.9041,  tz: 1.0,  tzStr: "Europe/Amsterdam", category: "Europe & UK" },
  { name: "Zurich, Switzerland",             lat: 47.3769, lon: 8.5417,  tz: 1.0,  tzStr: "Europe/Zurich",  category: "Europe & UK" },
  { name: "Moscow, Russia",                  lat: 55.7558, lon: 37.6173, tz: 3.0,  tzStr: "Europe/Moscow",  category: "Europe & UK" },

  // Americas
  { name: "New York, USA",                   lat: 40.7128, lon: -74.0060,tz: -5.0, tzStr: "America/New_York", category: "Americas" },
  { name: "San Francisco, USA",              lat: 37.7749, lon: -122.4194,tz:-8.0, tzStr: "America/Los_Angeles", category: "Americas" },
  { name: "Chicago, USA",                    lat: 41.8781, lon: -87.6298,tz: -6.0, tzStr: "America/Chicago", category: "Americas" },
  { name: "Dallas / Fort Worth, USA",        lat: 32.7767, lon: -96.7970,tz: -6.0, tzStr: "America/Chicago", category: "Americas" },
  { name: "Toronto, Canada",                 lat: 43.6532, lon: -79.3832,tz: -5.0, tzStr: "America/Toronto", category: "Americas" },
  { name: "Vancouver, Canada",               lat: 49.2827, lon: -123.1207,tz:-8.0, tzStr: "America/Vancouver", category: "Americas" },
  { name: "Mexico City, Mexico",             lat: 19.4326, lon: -99.1332,tz: -6.0, tzStr: "America/Mexico_City", category: "Americas" },
  { name: "São Paulo, Brazil",               lat: -23.5505,lon: -46.6333,tz: -3.0, tzStr: "America/Sao_Paulo", category: "Americas" },

  // Australia & Oceania
  { name: "Sydney, Australia",               lat: -33.8688,lon: 151.2093,tz: 10.0, tzStr: "Australia/Sydney", category: "Australia & Pacific" },
  { name: "Melbourne, Australia",            lat: -37.8136,lon: 144.9631,tz: 10.0, tzStr: "Australia/Melbourne", category: "Australia & Pacific" },
  { name: "Auckland, New Zealand",           lat: -36.8485,lon: 174.7633,tz: 12.0, tzStr: "Pacific/Auckland", category: "Australia & Pacific" },

  // Africa
  { name: "Cairo, Egypt",                    lat: 30.0444, lon: 31.2357, tz: 2.0,  tzStr: "Africa/Cairo", category: "Africa" },
  { name: "Johannesburg, South Africa",      lat: -26.2041,lon: 28.0473, tz: 2.0,  tzStr: "Africa/Johannesburg", category: "Africa" },
  { name: "Nairobi, Kenya",                  lat: -1.2921, lon: 36.8219, tz: 3.0,  tzStr: "Africa/Nairobi", category: "Africa" },
];

/**
 * Format numeric timezone offset (e.g. 5.5, -5, 0) into standard ISO string (+05:30, -05:00, +00:00).
 */
export function formatTzOffset(tzHours) {
  if (typeof tzHours !== "number" || isNaN(tzHours)) return "+05:30";
  const sign = tzHours < 0 ? "-" : "+";
  const abs = Math.abs(tzHours);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  return `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Estimate timezone offset in hours based on geographical longitude (-180 to +180).
 */
export function estimateTzFromLongitude(lon) {
  const numLon = parseFloat(lon);
  if (isNaN(numLon)) return 5.5;
  // Earth rotates 15 degrees per hour. Round to nearest 0.5 hour.
  const rawHours = numLon / 15;
  const res = Math.round(rawHours * 2) / 2;
  return res === 0 ? 0 : res;
}

/**
 * Common standard timezone options for select dropdowns.
 */
export const COMMON_TIMEZONES = [
  { value: "-10:00", label: "UTC-10:00 (Hawaii)" },
  { value: "-08:00", label: "UTC-08:00 (Pacific Time - Los Angeles, SF)" },
  { value: "-07:00", label: "UTC-07:00 (Mountain Time - Denver, Phoenix)" },
  { value: "-06:00", label: "UTC-06:00 (Central Time - Chicago, Dallas, Mexico)" },
  { value: "-05:00", label: "UTC-05:00 (Eastern Time - New York, Toronto)" },
  { value: "-04:00", label: "UTC-04:00 (Atlantic Time / Santiago)" },
  { value: "-03:00", label: "UTC-03:00 (Buenos Aires, São Paulo)" },
  { value: "+00:00", label: "UTC±00:00 (GMT / London, Dublin, Lisbon)" },
  { value: "+01:00", label: "UTC+01:00 (CET - Paris, Berlin, Rome, Madrid)" },
  { value: "+02:00", label: "UTC+02:00 (EET - Cairo, Athens, Johannesburg)" },
  { value: "+03:00", label: "UTC+03:00 (Moscow, Riyadh, Nairobi)" },
  { value: "+03:30", label: "UTC+03:30 (Tehran)" },
  { value: "+04:00", label: "UTC+04:00 (Dubai, Abu Dhabi, Baku)" },
  { value: "+04:30", label: "UTC+04:30 (Kabul)" },
  { value: "+05:00", label: "UTC+05:00 (Karachi, Tashkent)" },
  { value: "+05:30", label: "UTC+05:30 (IST - India & Sri Lanka)" },
  { value: "+05:45", label: "UTC+05:45 (Nepal - Kathmandu)" },
  { value: "+06:00", label: "UTC+06:00 (Dhaka, Almaty)" },
  { value: "+06:30", label: "UTC+06:30 (Yangon)" },
  { value: "+07:00", label: "UTC+07:00 (Bangkok, Jakarta, Hanoi)" },
  { value: "+08:00", label: "UTC+08:00 (Singapore, Beijing, Hong Kong, Perth)" },
  { value: "+09:00", label: "UTC+09:00 (JST - Tokyo, Seoul)" },
  { value: "+09:30", label: "UTC+09:30 (Adelaide, Darwin)" },
  { value: "+10:00", label: "UTC+10:00 (AEST - Sydney, Melbourne, Brisbane)" },
  { value: "+11:00", label: "UTC+11:00 (Solomon Islands, Vladivostok)" },
  { value: "+12:00", label: "UTC+12:00 (NZST - Auckland, Wellington, Fiji)" },
];

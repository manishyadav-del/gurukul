/**
 * Curated World Cities & Hierarchical Location Utilities for Vedic Astrology
 * 
 * Supports accurate planetary positions, Ascendant (Lagna), Sunrise, Sunset,
 * Choghadiya, and Panchang for any location on Earth.
 * 
 * Features:
 * - Country -> State -> Town / City hierarchical data structure
 * - Filter options by typing first letter (instant typeahead / autocomplete)
 * - Automatic Latitude, Longitude, and Timezone calculation
 * - Curated Sacred Pilgrimage Sites and Global Metros
 */

// --- 1. Comprehensive Hierarchical Location Database ---
export const LOCATION_HIERARCHY = {
  "India": {
    code: "IN",
    defaultTz: 5.5,
    tzStr: "Asia/Kolkata",
    states: {
      "Uttar Pradesh": [
        { name: "Ayodhya", lat: 26.7922, lon: 82.1998, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Ram Janmabhoomi" },
        { name: "Varanasi (Kashi)", lat: 25.3176, lon: 82.9739, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Kashi Vishwanath" },
        { name: "Mathura", lat: 27.4924, lon: 77.6737, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Krishna Janmabhoomi" },
        { name: "Vrindavan", lat: 27.5807, lon: 77.7006, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Banke Bihari Mandir" },
        { name: "Prayagraj (Allahabad)", lat: 25.4358, lon: 81.8463, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Triveni Sangam" },
        { name: "Lucknow", lat: 26.8467, lon: 80.9462, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Gorakhpur", lat: 26.7606, lon: 83.3732, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Gorakhnath Dham" },
        { name: "Deoria", lat: 26.5024, lon: 83.7791, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Somnath Mandir / Deoraha Baba" },
        { name: "Kanpur", lat: 26.4499, lon: 80.3319, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Agra", lat: 27.1767, lon: 78.0081, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Noida", lat: 28.5355, lon: 77.3910, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Ghaziabad", lat: 28.6692, lon: 77.4538, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Meerut", lat: 28.9845, lon: 77.7064, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Bareilly", lat: 28.3670, lon: 79.4304, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Aligarh", lat: 27.8974, lon: 78.0880, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Moradabad", lat: 28.8389, lon: 78.7768, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Saharanpur", lat: 29.9679, lon: 77.5460, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Shakumbhari Devi" },
        { name: "Jhansi", lat: 25.4484, lon: 78.5685, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Muzaffarnagar", lat: 29.4727, lon: 77.7085, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Firozabad", lat: 27.1592, lon: 78.3957, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Mirzapur (Vindhyachal)", lat: 25.1337, lon: 82.5644, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Maa Vindhyavasini" },
        { name: "Chitrakoot", lat: 25.1764, lon: 80.8653, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Kamadgiri & Mandakini" },
        { name: "Naimisharanya (Sitapur)", lat: 27.3512, lon: 80.4905, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "88,000 Rishi Tapobhumi" },
        { name: "Kushinagar", lat: 26.7410, lon: 83.8890, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true },
        { name: "Ballia", lat: 25.7581, lon: 84.1497, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Bhrigu Rishi Ashram" },
        { name: "Azamgarh", lat: 26.0736, lon: 83.1859, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Ghazipur", lat: 25.5840, lon: 83.5770, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Jaunpur", lat: 25.7464, lon: 82.6837, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Basti", lat: 26.8140, lon: 82.7630, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Gonda", lat: 27.1300, lon: 81.9600, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Sultanpur", lat: 26.2648, lon: 82.0727, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Banda", lat: 25.4824, lon: 80.3344, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Farrukhabad", lat: 27.3826, lon: 79.5829, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Hapur", lat: 28.7306, lon: 77.7759, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Etawah", lat: 26.7855, lon: 79.0154, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Uttarakhand": [
        { name: "Haridwar", lat: 29.9457, lon: 78.1642, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Har Ki Pauri" },
        { name: "Rishikesh", lat: 30.0869, lon: 78.2676, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Yoga Capital" },
        { name: "Dehradun", lat: 30.3165, lon: 78.0322, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Badrinath", lat: 30.7433, lon: 79.4938, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Badri Vishal Dham" },
        { name: "Kedarnath", lat: 30.7352, lon: 79.0669, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Jyotirlinga Temple" },
        { name: "Gangotri", lat: 30.9947, lon: 78.9398, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Bhagirathi Source" },
        { name: "Yamunotri", lat: 31.0140, lon: 78.4600, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Yamuna Source" },
        { name: "Nainital", lat: 29.3919, lon: 79.4542, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Naina Devi Shaktipeeth" },
        { name: "Haldwani", lat: 29.2183, lon: 79.5130, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Roorkee", lat: 29.8543, lon: 77.8880, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Almora (Jageshwar)", lat: 29.5971, lon: 79.6591, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true },
        { name: "Joshimath (Jyotirmath)", lat: 30.5574, lon: 79.5667, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Adi Shankaracharya Peeth" },
        { name: "Mussoorie", lat: 30.4598, lon: 78.0644, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Rudraprayag", lat: 30.2844, lon: 78.9811, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true },
        { name: "Devprayag", lat: 30.1458, lon: 78.5986, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Origin of River Ganga" },
      ],
      "Delhi": [
        { name: "New Delhi", lat: 28.6139, lon: 77.2090, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Central Delhi", lat: 28.6448, lon: 77.2167, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "South Delhi", lat: 28.5355, lon: 77.2000, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "North Delhi", lat: 28.7041, lon: 77.1025, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Dwarka", lat: 28.5921, lon: 77.0460, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Rohini", lat: 28.7495, lon: 77.0565, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "East Delhi", lat: 28.6276, lon: 77.2784, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "West Delhi", lat: 28.6663, lon: 77.1006, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Maharashtra": [
        { name: "Mumbai", lat: 19.0760, lon: 72.8777, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Siddhivinayak & Mumbadevi" },
        { name: "Pune", lat: 18.5204, lon: 73.8567, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Nashik", lat: 19.9975, lon: 73.7898, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Kumbh Mela & Panchavati" },
        { name: "Trimbakeshwar", lat: 19.9322, lon: 73.5307, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Trimbakeshwar Jyotirlinga" },
        { name: "Shirdi", lat: 19.7667, lon: 74.4767, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Sai Baba Sansthan" },
        { name: "Kolhapur", lat: 16.7050, lon: 74.2433, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Mahalakshmi Temple" },
        { name: "Nagpur", lat: 21.1458, lon: 79.0882, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Thane", lat: 19.2183, lon: 72.9781, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Chhatrapati Sambhajinagar (Aurangabad)", lat: 19.8762, lon: 75.3433, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Grishneshwar Jyotirlinga" },
        { name: "Solapur", lat: 17.6599, lon: 75.9064, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Pandharpur", lat: 17.6775, lon: 75.3267, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Vitthal Rukmini Mandir" },
        { name: "Navi Mumbai", lat: 19.0330, lon: 73.0297, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Amravati", lat: 20.9374, lon: 77.7796, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Nanded", lat: 19.1383, lon: 77.3210, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Hazur Sahib" },
        { name: "Sangli", lat: 16.8524, lon: 74.5815, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Jalgaon", lat: 21.0077, lon: 75.5626, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Akola", lat: 20.7002, lon: 77.0082, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Satara", lat: 17.6805, lon: 73.9935, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Madhya Pradesh": [
        { name: "Ujjain (Mahakal)", lat: 23.1765, lon: 75.7885, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Mahakaleshwar Jyotirlinga" },
        { name: "Omkareshwar", lat: 22.2435, lon: 76.1511, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Omkareshwar Jyotirlinga" },
        { name: "Bhopal", lat: 23.2599, lon: 77.4126, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Indore", lat: 22.7196, lon: 75.8577, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Gwalior", lat: 26.2183, lon: 78.1828, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Jabalpur", lat: 23.1815, lon: 79.9864, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Bhedaghat & Narmada Aarti" },
        { name: "Khajuraho", lat: 24.8318, lon: 79.9199, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Ancient Temple Complex" },
        { name: "Maihar", lat: 24.2694, lon: 80.7589, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Maa Sharda Mandir" },
        { name: "Amarkantak", lat: 22.6734, lon: 81.7584, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Source of River Narmada" },
        { name: "Sagar", lat: 23.8388, lon: 78.7378, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Dewas", lat: 22.9676, lon: 76.0534, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Chamunda & Tulja Devi" },
        { name: "Satna", lat: 24.6005, lon: 80.8322, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Ratlam", lat: 23.3315, lon: 75.0367, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Rewa", lat: 24.5362, lon: 81.3037, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Vidisha", lat: 23.5251, lon: 77.8081, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Gujarat": [
        { name: "Dwarka", lat: 22.2442, lon: 68.9685, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Dwarkadhish Dham" },
        { name: "Somnath (Veraval)", lat: 20.8880, lon: 70.4010, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "First Jyotirlinga" },
        { name: "Ahmedabad", lat: 23.0225, lon: 72.5714, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Surat", lat: 21.1702, lon: 72.8311, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Vadodara", lat: 22.3072, lon: 73.1812, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Rajkot", lat: 22.3039, lon: 70.8022, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Gandhinagar (Akshardham)", lat: 23.2156, lon: 72.6369, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true },
        { name: "Ambaji", lat: 24.3314, lon: 72.8533, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Arasuri Ambaji Shaktipeeth" },
        { name: "Pavagadh", lat: 22.4589, lon: 73.5312, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Maa Kalika Mandir" },
        { name: "Bhavnagar", lat: 21.7645, lon: 72.1519, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Jamnagar", lat: 22.4707, lon: 70.0577, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Junagadh (Girnar)", lat: 21.5222, lon: 70.4579, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Dattatreya Tapobhumi" },
        { name: "Anand", lat: 22.5645, lon: 72.9289, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Bhuj", lat: 23.2420, lon: 69.6669, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Rajasthan": [
        { name: "Pushkar", lat: 26.4897, lon: 74.5511, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Brahma Mandir & Sarovar" },
        { name: "Nathdwara (Shreenathji)", lat: 24.9312, lon: 73.8208, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Pushtimarg Peeth" },
        { name: "Khatu Shyamji (Sikar)", lat: 27.3622, lon: 75.3995, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Barbarika Shyam Kund" },
        { name: "Salasar Balaji (Churu)", lat: 27.7225, lon: 74.7214, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Siddhapeeth Hanuman" },
        { name: "Jaipur (Govind Dev Ji)", lat: 26.9124, lon: 75.7873, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true },
        { name: "Jodhpur", lat: 26.2389, lon: 73.0243, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Kota", lat: 25.2138, lon: 75.8648, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Bikaner (Karni Mata)", lat: 28.0229, lon: 73.3119, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true },
        { name: "Ajmer", lat: 26.4499, lon: 74.6399, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Udaipur", lat: 24.5854, lon: 73.7125, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Jagdish Mandir" },
        { name: "Mount Abu", lat: 24.5926, lon: 72.7156, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Dilwara Temples" },
        { name: "Bhilwara", lat: 25.3475, lon: 74.6380, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Alwar", lat: 27.5530, lon: 76.6346, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Jaisalmer", lat: 26.9157, lon: 70.9083, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Bihar": [
        { name: "Gaya (Vishnupad)", lat: 24.7955, lon: 85.0002, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Pitru Tarpan & Phalgu" },
        { name: "Bodh Gaya", lat: 24.6961, lon: 84.9869, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Mahabodhi Temple" },
        { name: "Patna", lat: 25.5941, lon: 85.1376, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Patna Sahib & Patan Devi" },
        { name: "Buxar", lat: 25.5647, lon: 83.9777, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Vishwamitra Ashram & Tadka Vadh" },
        { name: "Sitamarhi", lat: 26.5983, lon: 85.4950, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Mata Sita Janmabhoomi" },
        { name: "Rajgir", lat: 25.0298, lon: 85.4214, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Hot Springs & Buddhist Circuit" },
        { name: "Muzaffarpur", lat: 26.1209, lon: 85.3647, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Baba Garibnath Mandir" },
        { name: "Bhagalpur", lat: 25.2425, lon: 87.0139, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Darbhanga", lat: 26.1542, lon: 85.8918, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Shyama Mai Mandir" },
        { name: "Bihar Sharif", lat: 25.1982, lon: 85.5149, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Arrah (Bhojpur)", lat: 25.5541, lon: 84.6667, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Aranya Devi" },
        { name: "Begusarai", lat: 25.4182, lon: 86.1272, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Purnia", lat: 25.7771, lon: 87.4753, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Samastipur", lat: 25.8629, lon: 85.7811, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Chapra (Saran)", lat: 25.7811, lon: 84.7543, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Ambika Bhavani" },
        { name: "Sasaram", lat: 24.9510, lon: 84.0289, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Tara Chandi Temple" },
        { name: "Hajipur", lat: 25.6858, lon: 85.2146, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Motihari", lat: 26.6469, lon: 84.9142, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Karnataka": [
        { name: "Udupi", lat: 13.3409, lon: 74.7421, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Sri Krishna Matha" },
        { name: "Gokarna", lat: 14.5479, lon: 74.3188, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Mahabaleshwar Atmalinga" },
        { name: "Hampi (Kishkindha)", lat: 15.3350, lon: 76.4600, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Virupaksha & Anjanadri Hill" },
        { name: "Sringeri", lat: 13.4187, lon: 75.2570, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Sharada Peetham" },
        { name: "Dharmasthala", lat: 12.9566, lon: 75.3789, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Manjunatha Swamy" },
        { name: "Murudeshwar", lat: 14.0940, lon: 74.4899, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Giant Shiva Statue" },
        { name: "Bengaluru", lat: 12.9716, lon: 77.5946, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Mysuru", lat: 12.2958, lon: 76.6394, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Chamundeshwari Temple" },
        { name: "Mangaluru", lat: 12.9141, lon: 74.8560, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Mangaladevi Temple" },
        { name: "Hubballi-Dharwad", lat: 15.3647, lon: 75.1240, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Belagavi", lat: 15.8497, lon: 74.4977, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Kalaburagi", lat: 17.3297, lon: 76.8343, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Shivamogga", lat: 13.9299, lon: 75.5681, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Tamil Nadu": [
        { name: "Rameswaram", lat: 9.2876, lon: 79.3129, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Ramanathaswamy Jyotirlinga & Char Dham" },
        { name: "Madurai", lat: 9.9252, lon: 78.1198, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Meenakshi Amman Temple" },
        { name: "Tiruchirappalli (Srirangam)", lat: 10.7905, lon: 78.7047, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Ranganathaswamy Temple" },
        { name: "Kanchipuram", lat: 12.8342, lon: 79.7036, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Kamakshi Amman & Ekambareswarar" },
        { name: "Chidambaram (Nataraja)", lat: 11.3992, lon: 79.6936, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Akasha Lingam" },
        { name: "Thanjavur (Brihadisvara)", lat: 10.7870, lon: 79.1378, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Great Living Chola Temple" },
        { name: "Tiruvannamalai (Arunachala)", lat: 12.2253, lon: 79.0747, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Agni Lingam & Ramana Ashram" },
        { name: "Palani", lat: 10.4500, lon: 77.5200, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Murugan Dhandayuthapani" },
        { name: "Kanyakumari", lat: 8.0883, lon: 77.5385, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Bhagavathy Amman & Triveni Sangam" },
        { name: "Chennai", lat: 13.0827, lon: 80.2707, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Kapaleeshwarar Temple" },
        { name: "Coimbatore", lat: 11.0168, lon: 76.9558, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Adiyogi Shiva" },
        { name: "Salem", lat: 11.6643, lon: 78.1460, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Tirunelveli", lat: 8.7139, lon: 77.7567, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Nellaiappar Temple" },
        { name: "Tiruppur", lat: 11.1085, lon: 77.3411, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Vellore", lat: 12.9165, lon: 79.1325, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Golden Temple Sripuram" },
      ],
      "Andhra Pradesh": [
        { name: "Tirupati", lat: 13.6288, lon: 79.4192, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Tirumala Venkateswara (Balaji)" },
        { name: "Srisailam", lat: 16.0737, lon: 78.8687, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Mallikarjuna Jyotirlinga & Bhramaramba" },
        { name: "Srikalahasti", lat: 13.7498, lon: 79.6984, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Vayu Lingam & Rahu Ketu Kshetra" },
        { name: "Vijayawada (Kanakadurga)", lat: 16.5062, lon: 80.6480, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true },
        { name: "Simhachalam (Visakhapatnam)", lat: 17.7667, lon: 83.2500, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Varaha Lakshmi Narasimha" },
        { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Guntur", lat: 16.3067, lon: 80.4365, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Nellore", lat: 14.4426, lon: 79.9865, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Kurnool", lat: 15.8281, lon: 78.0373, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Rajahmundry", lat: 17.0005, lon: 81.8040, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Godavari Ghats" },
      ],
      "Telangana": [
        { name: "Hyderabad", lat: 17.3850, lon: 78.4867, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Bhagyalakshmi & Chilkur Balaji" },
        { name: "Bhadrachalam", lat: 17.6689, lon: 80.8936, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Sita Ramachandra Swamy" },
        { name: "Yadagirigutta", lat: 17.5898, lon: 78.9467, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Lakshmi Narasimha Swamy" },
        { name: "Vemulawada", lat: 18.4687, lon: 78.8672, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Rajarajeshwara Temple" },
        { name: "Warangal", lat: 17.9689, lon: 79.5941, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Thousand Pillar Temple & Ramappa" },
        { name: "Nizamabad", lat: 18.6725, lon: 78.0941, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Karimnagar", lat: 18.4386, lon: 79.1288, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Khammam", lat: 17.2473, lon: 80.1514, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Odisha": [
        { name: "Puri", lat: 19.8135, lon: 85.8312, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Jagannath Dham (Char Dham)" },
        { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Lingaraj Temple (Ekamra Kshetra)" },
        { name: "Konark", lat: 19.8876, lon: 86.0945, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Sun Temple" },
        { name: "Cuttack", lat: 20.4625, lon: 85.8828, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Maa Cuttack Chandi" },
        { name: "Rourkela", lat: 22.2604, lon: 84.8536, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Sambalpur", lat: 21.4669, lon: 83.9812, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Samaleswari Temple" },
      ],
      "West Bengal": [
        { name: "Kolkata", lat: 22.5726, lon: 88.3639, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Kalighat & Dakshineswar Kali" },
        { name: "Mayapur", lat: 23.4233, lon: 88.3897, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "ISKCON World Headquarters" },
        { name: "Navadvipa", lat: 23.4087, lon: 88.3657, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Chaitanya Mahaprabhu Janmabhoomi" },
        { name: "Tarapith", lat: 24.1147, lon: 87.8016, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Maa Tara Siddhapeeth" },
        { name: "Kalimpong", lat: 27.0594, lon: 88.4695, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Darjeeling", lat: 27.0410, lon: 88.2663, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Howrah", lat: 22.5958, lon: 88.2636, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Belur Math" },
        { name: "Siliguri", lat: 26.7271, lon: 88.3953, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Asansol", lat: 23.6739, lon: 86.9524, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Kalyaneshwari Temple" },
        { name: "Durgapur", lat: 23.5204, lon: 87.3119, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Punjab": [
        { name: "Amritsar", lat: 31.6340, lon: 74.8723, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Golden Temple & Durgiana Mandir" },
        { name: "Anandpur Sahib", lat: 31.2355, lon: 76.4988, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Takht Sri Keshgarh Sahib" },
        { name: "Ludhiana", lat: 30.9010, lon: 75.8573, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Jalandhar", lat: 31.3260, lon: 75.5762, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Devi Talab Mandir" },
        { name: "Patiala", lat: 30.3398, lon: 76.3869, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Kali Devi Mandir" },
        { name: "Bathinda", lat: 30.2110, lon: 74.9455, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Mohali", lat: 30.7046, lon: 76.7179, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Haryana": [
        { name: "Kurukshetra (Jyotisar)", lat: 29.9695, lon: 76.8783, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Gita Upadesh & Brahma Sarovar" },
        { name: "Gurugram", lat: 28.4595, lon: 77.0266, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Sheetla Mata Mandir" },
        { name: "Faridabad", lat: 28.4089, lon: 77.3178, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Panipat", lat: 29.3909, lon: 76.9635, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Ambala", lat: 30.3782, lon: 76.7767, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Karnal", lat: 29.6857, lon: 76.9905, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Karna Lake" },
        { name: "Rohtak", lat: 28.8955, lon: 76.6066, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Hisar", lat: 29.1492, lon: 75.7217, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Panchkula", lat: 30.6942, lon: 76.8606, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Mansa Devi Temple" },
      ],
      "Kerala": [
        { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Padmanabhaswamy Temple" },
        { name: "Guruvayur", lat: 10.5946, lon: 76.0407, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Guruvayurappan (Krishna)" },
        { name: "Sabarimala", lat: 9.4404, lon: 77.0819, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Ayyappa Temple" },
        { name: "Kochi", lat: 9.9312, lon: 76.2673, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Chottanikkara Bhagavathy" },
        { name: "Kozhikode", lat: 11.2588, lon: 75.7804, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Thrissur", lat: 10.5276, lon: 76.2144, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Vadakkunnathan Temple" },
        { name: "Alappuzha", lat: 9.4981, lon: 76.3388, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Ambalappuzha Sri Krishna" },
      ],
      "Himachal Pradesh": [
        { name: "Shimla", lat: 31.1048, lon: 77.1734, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Jakhu Hanuman Temple" },
        { name: "Dharamshala", lat: 32.2190, lon: 76.3234, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Chamunda Devi & Dalai Lama" },
        { name: "Jwalamukhi", lat: 31.8767, lon: 76.3228, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Jwala Ji Shaktipeeth" },
        { name: "Chintpurni", lat: 31.8105, lon: 76.1011, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Chhinnamastika Devi" },
        { name: "Kangra", lat: 32.0998, lon: 76.2691, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Brajeshwari Devi Shaktipeeth" },
        { name: "Manali", lat: 32.2432, lon: 77.1892, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Hadimba Devi & Manu Temple" },
        { name: "Kullu (Bijli Mahadev)", lat: 31.9579, lon: 77.1095, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true },
        { name: "Mandi", lat: 31.7087, lon: 76.9320, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Chhoti Kashi (81 Temples)" },
        { name: "Solan", lat: 30.9045, lon: 77.0967, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Shoolini Mata" },
      ],
      "Jammu & Kashmir": [
        { name: "Katra", lat: 32.9916, lon: 74.9318, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Maa Vaishno Devi Bhavan" },
        { name: "Srinagar", lat: 34.0837, lon: 74.7973, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Shankaracharya Temple & Kheer Bhawani" },
        { name: "Jammu", lat: 32.7266, lon: 74.8570, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Raghunath Temple & Bawe Wali Mata" },
        { name: "Pahalgam (Amarnath)", lat: 34.0150, lon: 75.3263, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Amarnath Cave Base" },
      ],
      "Jharkhand": [
        { name: "Deoghar", lat: 24.4826, lon: 86.6975, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Baidyanath Dham Jyotirlinga" },
        { name: "Ranchi", lat: 23.3441, lon: 85.3096, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Jagannath Temple & Pahari Mandir" },
        { name: "Rajrappa", lat: 23.6300, lon: 85.7100, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Chhinnamasta Temple" },
        { name: "Jamshedpur", lat: 22.8046, lon: 86.2029, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Dhanbad", lat: 23.7957, lon: 86.4304, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Shakti Mandir" },
        { name: "Bokaro", lat: 23.6693, lon: 86.1511, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Chhattisgarh": [
        { name: "Raipur", lat: 21.2514, lon: 81.6296, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Doodhadhari Math" },
        { name: "Dongargarh", lat: 21.1895, lon: 80.7588, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Maa Bamleshwari Devi" },
        { name: "Bilaspur", lat: 22.0797, lon: 82.1409, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Ratanpur Mahamaya" },
        { name: "Bhilai-Durg", lat: 21.1938, lon: 81.3509, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Assam": [
        { name: "Guwahati", lat: 26.1445, lon: 91.7362, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Maa Kamakhya Shaktipeeth" },
        { name: "Dibrugarh", lat: 27.4728, lon: 94.9120, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Silchar", lat: 24.8333, lon: 92.7789, tz: 5.5, tzStr: "Asia/Kolkata" },
        { name: "Jorhat", lat: 26.7509, lon: 94.2037, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Majuli Island Satras" },
      ],
      "Goa": [
        { name: "Panaji", lat: 15.4909, lon: 73.8278, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Mahalaxmi Temple" },
        { name: "Ponda", lat: 15.4026, lon: 74.0152, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Mangueshi & Shanta Durga" },
        { name: "Margao", lat: 15.2832, lon: 73.9862, tz: 5.5, tzStr: "Asia/Kolkata" },
      ],
      "Chandigarh": [
        { name: "Chandigarh", lat: 30.7333, lon: 76.7794, tz: 5.5, tzStr: "Asia/Kolkata", isSacred: true, note: "Chandi Mandir" },
      ],
    }
  },
  "Nepal": {
    code: "NP",
    defaultTz: 5.75,
    tzStr: "Asia/Kathmandu",
    states: {
      "Bagmati": [
        { name: "Kathmandu", lat: 27.7172, lon: 85.3240, tz: 5.75, tzStr: "Asia/Kathmandu", isSacred: true, note: "Pashupatinath & Guhyeshwari" },
        { name: "Lalitpur (Patan)", lat: 27.6644, lon: 85.3188, tz: 5.75, tzStr: "Asia/Kathmandu" },
        { name: "Bhaktapur", lat: 27.6710, lon: 85.4298, tz: 5.75, tzStr: "Asia/Kathmandu" },
      ],
      "Gandaki": [
        { name: "Pokhara", lat: 28.2096, lon: 83.9856, tz: 5.75, tzStr: "Asia/Kathmandu", isSacred: true, note: "Bindhyabasini Mandir" },
        { name: "Muktinath", lat: 28.8167, lon: 83.8714, tz: 5.75, tzStr: "Asia/Kathmandu", isSacred: true, note: "Saligram Shila Kshetra" },
      ],
      "Madhesh": [
        { name: "Janakpur", lat: 26.7288, lon: 85.9244, tz: 5.75, tzStr: "Asia/Kathmandu", isSacred: true, note: "Janaki Mandir (Mithila)" },
        { name: "Birgunj", lat: 27.0136, lon: 84.8773, tz: 5.75, tzStr: "Asia/Kathmandu" },
      ],
      "Lumbini": [
        { name: "Lumbini", lat: 27.4833, lon: 83.2833, tz: 5.75, tzStr: "Asia/Kathmandu", isSacred: true, note: "Birthplace of Gautama Buddha" },
        { name: "Butwal", lat: 27.7006, lon: 83.4484, tz: 5.75, tzStr: "Asia/Kathmandu" },
      ],
    }
  },
  "United States": {
    code: "US",
    defaultTz: -5.0,
    tzStr: "America/New_York",
    states: {
      "New York": [
        { name: "New York City", lat: 40.7128, lon: -74.0060, tz: -5.0, tzStr: "America/New_York" },
        { name: "Buffalo", lat: 42.8864, lon: -78.8784, tz: -5.0, tzStr: "America/New_York" },
        { name: "Albany", lat: 42.6526, lon: -73.7562, tz: -5.0, tzStr: "America/New_York" },
      ],
      "California": [
        { name: "Los Angeles", lat: 34.0522, lon: -118.2437, tz: -8.0, tzStr: "America/Los_Angeles" },
        { name: "San Francisco", lat: 37.7749, lon: -122.4194, tz: -8.0, tzStr: "America/Los_Angeles" },
        { name: "San Diego", lat: 32.7157, lon: -117.1611, tz: -8.0, tzStr: "America/Los_Angeles" },
        { name: "San Jose (Silicon Valley)", lat: 37.3382, lon: -121.8863, tz: -8.0, tzStr: "America/Los_Angeles" },
        { name: "Sacramento", lat: 38.5816, lon: -121.4944, tz: -8.0, tzStr: "America/Los_Angeles" },
      ],
      "Texas": [
        { name: "Houston", lat: 29.7604, lon: -95.3698, tz: -6.0, tzStr: "America/Chicago" },
        { name: "Dallas", lat: 32.7767, lon: -96.7970, tz: -6.0, tzStr: "America/Chicago" },
        { name: "Austin", lat: 30.2672, lon: -97.7431, tz: -6.0, tzStr: "America/Chicago" },
        { name: "San Antonio", lat: 29.4241, lon: -98.4936, tz: -6.0, tzStr: "America/Chicago" },
      ],
      "Illinois": [
        { name: "Chicago", lat: 41.8781, lon: -87.6298, tz: -6.0, tzStr: "America/Chicago" },
      ],
      "Washington": [
        { name: "Seattle", lat: 47.6062, lon: -122.3321, tz: -8.0, tzStr: "America/Los_Angeles" },
      ],
      "Florida": [
        { name: "Miami", lat: 25.7617, lon: -80.1918, tz: -5.0, tzStr: "America/New_York" },
        { name: "Orlando", lat: 28.5383, lon: -81.3792, tz: -5.0, tzStr: "America/New_York" },
        { name: "Tampa", lat: 27.9506, lon: -82.4572, tz: -5.0, tzStr: "America/New_York" },
      ],
      "Massachusetts": [
        { name: "Boston", lat: 42.3601, lon: -71.0589, tz: -5.0, tzStr: "America/New_York" },
      ],
      "Georgia": [
        { name: "Atlanta", lat: 33.7490, lon: -84.3880, tz: -5.0, tzStr: "America/New_York" },
      ],
      "Colorado": [
        { name: "Denver", lat: 39.7392, lon: -104.9903, tz: -7.0, tzStr: "America/Denver" },
      ],
      "Arizona": [
        { name: "Phoenix", lat: 33.4484, lon: -112.0740, tz: -7.0, tzStr: "America/Phoenix" },
      ],
      "Hawaii": [
        { name: "Honolulu", lat: 21.3069, lon: -157.8583, tz: -10.0, tzStr: "Pacific/Honolulu" },
      ],
    }
  },
  "United Kingdom": {
    code: "GB",
    defaultTz: 0.0,
    tzStr: "Europe/London",
    states: {
      "England": [
        { name: "London", lat: 51.5074, lon: -0.1278, tz: 0.0, tzStr: "Europe/London" },
        { name: "Manchester", lat: 53.4808, lon: -2.2426, tz: 0.0, tzStr: "Europe/London" },
        { name: "Birmingham", lat: 52.4862, lon: -1.8904, tz: 0.0, tzStr: "Europe/London" },
        { name: "Leeds", lat: 53.8008, lon: -1.5491, tz: 0.0, tzStr: "Europe/London" },
        { name: "Liverpool", lat: 53.4084, lon: -2.9916, tz: 0.0, tzStr: "Europe/London" },
        { name: "Bristol", lat: 51.4545, lon: -2.5879, tz: 0.0, tzStr: "Europe/London" },
        { name: "Oxford", lat: 51.7520, lon: -1.2577, tz: 0.0, tzStr: "Europe/London" },
        { name: "Cambridge", lat: 52.2053, lon: 0.1218, tz: 0.0, tzStr: "Europe/London" },
      ],
      "Scotland": [
        { name: "Edinburgh", lat: 55.9533, lon: -3.1883, tz: 0.0, tzStr: "Europe/London" },
        { name: "Glasgow", lat: 55.8642, lon: -4.2518, tz: 0.0, tzStr: "Europe/London" },
      ],
      "Wales": [
        { name: "Cardiff", lat: 51.4816, lon: -3.1791, tz: 0.0, tzStr: "Europe/London" },
      ],
    }
  },
  "Canada": {
    code: "CA",
    defaultTz: -5.0,
    tzStr: "America/Toronto",
    states: {
      "Ontario": [
        { name: "Toronto", lat: 43.6532, lon: -79.3832, tz: -5.0, tzStr: "America/Toronto" },
        { name: "Ottawa", lat: 45.4215, lon: -75.6972, tz: -5.0, tzStr: "America/Toronto" },
        { name: "Mississauga", lat: 43.5890, lon: -79.6441, tz: -5.0, tzStr: "America/Toronto" },
        { name: "Brampton", lat: 43.7315, lon: -79.7624, tz: -5.0, tzStr: "America/Toronto" },
      ],
      "British Columbia": [
        { name: "Vancouver", lat: 49.2827, lon: -123.1207, tz: -8.0, tzStr: "America/Vancouver" },
        { name: "Victoria", lat: 48.4284, lon: -123.3656, tz: -8.0, tzStr: "America/Vancouver" },
      ],
      "Quebec": [
        { name: "Montreal", lat: 45.5017, lon: -73.5673, tz: -5.0, tzStr: "America/Toronto" },
      ],
      "Alberta": [
        { name: "Calgary", lat: 51.0447, lon: -114.0719, tz: -7.0, tzStr: "America/Edmonton" },
        { name: "Edmonton", lat: 53.5461, lon: -113.4938, tz: -7.0, tzStr: "America/Edmonton" },
      ]
    }
  },
  "Australia": {
    code: "AU",
    defaultTz: 10.0,
    tzStr: "Australia/Sydney",
    states: {
      "New South Wales": [
        { name: "Sydney", lat: -33.8688, lon: 151.2093, tz: 10.0, tzStr: "Australia/Sydney" },
        { name: "Newcastle", lat: -32.9283, lon: 151.7817, tz: 10.0, tzStr: "Australia/Sydney" },
      ],
      "Victoria": [
        { name: "Melbourne", lat: -37.8136, lon: 144.9631, tz: 10.0, tzStr: "Australia/Melbourne" },
      ],
      "Queensland": [
        { name: "Brisbane", lat: -27.4698, lon: 153.0251, tz: 10.0, tzStr: "Australia/Brisbane" },
        { name: "Gold Coast", lat: -28.0167, lon: 153.4000, tz: 10.0, tzStr: "Australia/Brisbane" },
      ],
      "Western Australia": [
        { name: "Perth", lat: -31.9505, lon: 115.8605, tz: 8.0, tzStr: "Australia/Perth" },
      ],
      "South Australia": [
        { name: "Adelaide", lat: -34.9285, lon: 138.6007, tz: 9.5, tzStr: "Australia/Adelaide" },
      ]
    }
  },
  "United Arab Emirates": {
    code: "AE",
    defaultTz: 4.0,
    tzStr: "Asia/Dubai",
    states: {
      "Emirates": [
        { name: "Dubai", lat: 25.2048, lon: 55.2708, tz: 4.0, tzStr: "Asia/Dubai" },
        { name: "Abu Dhabi", lat: 24.4539, lon: 54.3773, tz: 4.0, tzStr: "Asia/Dubai" },
        { name: "Sharjah", lat: 25.3463, lon: 55.4209, tz: 4.0, tzStr: "Asia/Dubai" },
        { name: "Ajman", lat: 25.4052, lon: 55.5136, tz: 4.0, tzStr: "Asia/Dubai" },
      ]
    }
  },
  "Singapore": {
    code: "SG",
    defaultTz: 8.0,
    tzStr: "Asia/Singapore",
    states: {
      "Singapore": [
        { name: "Singapore", lat: 1.3521, lon: 103.8198, tz: 8.0, tzStr: "Asia/Singapore" },
      ]
    }
  },
  "Germany": {
    code: "DE",
    defaultTz: 1.0,
    tzStr: "Europe/Berlin",
    states: {
      "Germany": [
        { name: "Berlin", lat: 52.5200, lon: 13.4050, tz: 1.0, tzStr: "Europe/Berlin" },
        { name: "Munich", lat: 48.1351, lon: 11.5820, tz: 1.0, tzStr: "Europe/Berlin" },
        { name: "Frankfurt", lat: 50.1109, lon: 8.6821, tz: 1.0, tzStr: "Europe/Berlin" },
        { name: "Hamburg", lat: 53.5511, lon: 9.9937, tz: 1.0, tzStr: "Europe/Berlin" },
      ]
    }
  },
  "France": {
    code: "FR",
    defaultTz: 1.0,
    tzStr: "Europe/Paris",
    states: {
      "France": [
        { name: "Paris", lat: 48.8566, lon: 2.3522, tz: 1.0, tzStr: "Europe/Paris" },
        { name: "Marseille", lat: 43.2965, lon: 5.3698, tz: 1.0, tzStr: "Europe/Paris" },
        { name: "Lyon", lat: 45.7640, lon: 4.8357, tz: 1.0, tzStr: "Europe/Paris" },
      ]
    }
  },
  "Japan": {
    code: "JP",
    defaultTz: 9.0,
    tzStr: "Asia/Tokyo",
    states: {
      "Japan": [
        { name: "Tokyo", lat: 35.6762, lon: 139.6503, tz: 9.0, tzStr: "Asia/Tokyo" },
        { name: "Osaka", lat: 34.6937, lon: 135.5023, tz: 9.0, tzStr: "Asia/Tokyo" },
        { name: "Kyoto", lat: 35.0116, lon: 135.7681, tz: 9.0, tzStr: "Asia/Tokyo" },
      ]
    }
  },
  "Sri Lanka": {
    code: "LK",
    defaultTz: 5.5,
    tzStr: "Asia/Colombo",
    states: {
      "Sri Lanka": [
        { name: "Colombo", lat: 6.9271, lon: 79.8612, tz: 5.5, tzStr: "Asia/Colombo" },
        { name: "Kandy", lat: 7.2906, lon: 80.6337, tz: 5.5, tzStr: "Asia/Colombo" },
      ]
    }
  },
  "Thailand": {
    code: "TH",
    defaultTz: 7.0,
    tzStr: "Asia/Bangkok",
    states: {
      "Thailand": [
        { name: "Bangkok", lat: 13.7563, lon: 100.5018, tz: 7.0, tzStr: "Asia/Bangkok" },
        { name: "Chiang Mai", lat: 18.7883, lon: 98.9853, tz: 7.0, tzStr: "Asia/Bangkok" },
      ]
    }
  },
  "Indonesia": {
    code: "ID",
    defaultTz: 8.0,
    tzStr: "Asia/Makassar",
    states: {
      "Indonesia": [
        { name: "Bali (Denpasar)", lat: -8.4095, lon: 115.1889, tz: 8.0, tzStr: "Asia/Makassar" },
        { name: "Jakarta", lat: -6.2088, lon: 106.8456, tz: 7.0, tzStr: "Asia/Jakarta" },
      ]
    }
  },
  "Malaysia": {
    code: "MY",
    defaultTz: 8.0,
    tzStr: "Asia/Kuala_Lumpur",
    states: {
      "Malaysia": [
        { name: "Kuala Lumpur", lat: 3.1390, lon: 101.6869, tz: 8.0, tzStr: "Asia/Kuala_Lumpur" },
      ]
    }
  },
  "Russia": {
    code: "RU",
    defaultTz: 3.0,
    tzStr: "Europe/Moscow",
    states: {
      "Russia": [
        { name: "Moscow", lat: 55.7558, lon: 37.6173, tz: 3.0, tzStr: "Europe/Moscow" },
        { name: "Saint Petersburg", lat: 59.9343, lon: 30.3351, tz: 3.0, tzStr: "Europe/Moscow" },
      ]
    }
  },
  "South Africa": {
    code: "ZA",
    defaultTz: 2.0,
    tzStr: "Africa/Johannesburg",
    states: {
      "South Africa": [
        { name: "Johannesburg", lat: -26.2041, lon: 28.0473, tz: 2.0, tzStr: "Africa/Johannesburg" },
        { name: "Cape Town", lat: -33.9249, lon: 18.4241, tz: 2.0, tzStr: "Africa/Johannesburg" },
      ]
    }
  },
  "Egypt": {
    code: "EG",
    defaultTz: 2.0,
    tzStr: "Africa/Cairo",
    states: {
      "Egypt": [
        { name: "Cairo", lat: 30.0444, lon: 31.2357, tz: 2.0, tzStr: "Africa/Cairo" },
      ]
    }
  },
  "Brazil": {
    code: "BR",
    defaultTz: -3.0,
    tzStr: "America/Sao_Paulo",
    states: {
      "Brazil": [
        { name: "São Paulo", lat: -23.5505, lon: -46.6333, tz: -3.0, tzStr: "America/Sao_Paulo" },
      ]
    }
  },
  "New Zealand": {
    code: "NZ",
    defaultTz: 12.0,
    tzStr: "Pacific/Auckland",
    states: {
      "New Zealand": [
        { name: "Auckland", lat: -36.8485, lon: 174.7633, tz: 12.0, tzStr: "Pacific/Auckland" },
      ]
    }
  },
  "Switzerland": {
    code: "CH",
    defaultTz: 1.0,
    tzStr: "Europe/Zurich",
    states: {
      "Switzerland": [
        { name: "Zurich", lat: 47.3769, lon: 8.5417, tz: 1.0, tzStr: "Europe/Zurich" },
      ]
    }
  },
  "Italy": {
    code: "IT",
    defaultTz: 1.0,
    tzStr: "Europe/Rome",
    states: {
      "Italy": [
        { name: "Rome", lat: 41.9028, lon: 12.4964, tz: 1.0, tzStr: "Europe/Rome" },
      ]
    }
  },
  "Netherlands": {
    code: "NL",
    defaultTz: 1.0,
    tzStr: "Europe/Amsterdam",
    states: {
      "Netherlands": [
        { name: "Amsterdam", lat: 52.3676, lon: 4.9041, tz: 1.0, tzStr: "Europe/Amsterdam" },
      ]
    }
  }
};

// --- 2. Presets Array (WORLD_CITIES) for Backward Compatibility ---
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
  { name: "Badrinath, Uttarakhand, India",   lat: 30.7433, lon: 79.4938, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Kedarnath, Uttarakhand, India",   lat: 30.7352, lon: 79.0669, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Rameswaram, Tamil Nadu, India",   lat: 9.2876,  lon: 79.3129, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Dwarka, Gujarat, India",          lat: 22.2442, lon: 68.9685, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Somnath, Gujarat, India",         lat: 20.8880, lon: 70.4010, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },
  { name: "Gaya (Vishnupad), Bihar, India",  lat: 24.7955, lon: 85.0002, tz: 5.5,  tzStr: "Asia/Kolkata", category: "Sacred India" },

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
  { name: "Gorakhpur, Uttar Pradesh, India", lat: 26.7606, lon: 83.3732, tz: 5.5,  tzStr: "Asia/Kolkata", category: "India" },

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

// --- 3. Utility Functions for Formatting & Longitude Timezone Estimation ---

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

// --- 4. Hierarchy Helper Functions ---

/**
 * Returns all available country names, with India and Nepal prioritized.
 */
export function getAvailableCountries() {
  const countries = Object.keys(LOCATION_HIERARCHY);
  // Sort with India first, Nepal second, then alphabetical
  return countries.sort((a, b) => {
    if (a === "India") return -1;
    if (b === "India") return 1;
    if (a === "Nepal") return -1;
    if (b === "Nepal") return 1;
    return a.localeCompare(b);
  });
}

/**
 * Returns all states/provinces for a given country.
 */
export function getStatesForCountry(countryName) {
  if (!countryName || !LOCATION_HIERARCHY[countryName]) return [];
  return Object.keys(LOCATION_HIERARCHY[countryName].states || {}).sort((a, b) => a.localeCompare(b));
}

/**
 * Returns all towns/cities for a country and state.
 */
export function getTownsForState(countryName, stateName) {
  if (!countryName || !stateName || !LOCATION_HIERARCHY[countryName]) return [];
  const stateTowns = LOCATION_HIERARCHY[countryName].states?.[stateName] || [];
  return [...stateTowns].sort((a, b) => {
    // Sacred places first, then alphabetical
    if (a.isSacred && !b.isSacred) return -1;
    if (!a.isSacred && b.isSacred) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Filter an array of items (strings or objects with name) by user input starting with the first letter!
 * Prioritizes:
 * 1. Items starting with the search prefix (e.g. typing 'u' -> Uttar Pradesh, Uttarakhand)
 * 2. Items containing the search term elsewhere
 */
export function filterByFirstLetter(items, query) {
  if (!query || !query.trim()) return items;
  const q = query.trim().toLowerCase();
  
  const startsWithList = [];
  const containsList = [];

  for (const item of items) {
    const text = typeof item === "string" ? item : (item.name || "");
    const lower = text.toLowerCase();
    
    if (lower.startsWith(q)) {
      startsWithList.push(item);
    } else if (lower.includes(q)) {
      containsList.push(item);
    }
  }

  return [...startsWithList, ...containsList];
}

/**
 * Comprehensive Hindi / Devanagari mapping for Sacred Shrines, Indian Metros, and Global Cities.
 * Enables instant Hindi search for queries like "अयोध्या", "टोक्यो", "वाराणसी", "काशी", etc.
 */
export const HINDI_LOCATION_MAP = {
  // Sacred Tirthas & Shrines
  "अयोध्या": "Ayodhya",
  "वाराणसी": "Varanasi",
  "काशी": "Varanasi",
  "बनारस": "Varanasi",
  "मथुरा": "Mathura",
  "वृन्दावन": "Vrindavan",
  "वृंदावन": "Vrindavan",
  "हरिद्वार": "Haridwar",
  "ऋषिकेश": "Rishikesh",
  "उज्जैन": "Ujjain",
  "प्रयागराज": "Prayagraj",
  "इलाहाबाद": "Prayagraj",
  "चित्रकूट": "Chitrakoot",
  "नैमिषारण्य": "Naimisharanya",
  "विंध्याचल": "Vindhyachal",
  "मिर्जापुर": "Mirzapur",
  "बद्रीनाथ": "Badrinath",
  "केदारनाथ": "Kedarnath",
  "गंगोत्री": "Gangotri",
  "यमुनोत्री": "Yamunotri",
  "ओंकारेश्वर": "Omkareshwar",
  "सोमनाथ": "Somnath",
  "द्वारका": "Dwarka",
  "रामेश्वरम": "Rameswaram",
  "जगन्नाथ पुरी": "Puri",
  "पुरी": "Puri",
  "तिरुपति": "Tirupati",
  "शिरडी": "Shirdi",
  "त्र्यंबकेश्वर": "Trimbakeshwar",
  "त्रयंबकेश्वर": "Trimbakeshwar",
  "भीमाशंकर": "Bhimashankar",
  "घृष्णेश्वर": "Grishneshwar",
  "मल्लिकार्जुन": "Mallikarjuna",
  "महाकालेश्वर": "Ujjain",
  "वैद्यनाथ": "Deoghar",
  "देवघर": "Deoghar",
  "नागेश्वर": "Nageshwar",
  "बोधगया": "Bodh Gaya",
  "गया": "Gaya",
  "अमृतसर": "Amritsar",
  "कामाख्या": "Kamakhya",
  "गुवाहाटी": "Guwahati",
  "वैष्णो देवी": "Katra",
  "कटरा": "Katra",
  "अमरनाथ": "Pahalgam",
  "पुष्कर": "Pushkar",
  "अजमेर": "Ajmer",
  "सबरीमाला": "Sabarimala",
  "हम्पी": "Hampi",
  "गोकर्ण": "Gokarna",
  "उडुपी": "Udupi",
  "श्रृंगेरी": "Sringeri",
  "तंजावुर": "Thanjavur",
  "कांचीपुरम": "Kanchipuram",
  "मदुरै": "Madurai",
  "कन्याकुमारी": "Kanyakumari",
  "कुंभकोणम": "Kumbakonam",
  "कुरुक्षेत्र": "Kurukshetra",

  // Major Indian Cities & Metros
  "दिल्ली": "Delhi",
  "नई दिल्ली": "New Delhi",
  "मुंबई": "Mumbai",
  "बम्बई": "Mumbai",
  "कोलकाता": "Kolkata",
  "कलकत्ता": "Kolkata",
  "चेन्नई": "Chennai",
  "मद्रास": "Chennai",
  "बेंगलुरु": "Bengaluru",
  "बैंगलोर": "Bengaluru",
  "हैदराबाद": "Hyderabad",
  "अहमदाबाद": "Ahmedabad",
  "पुणे": "Pune",
  "सूरत": "Surat",
  "जयपुर": "Jaipur",
  "लखनऊ": "Lucknow",
  "कानपुर": "Kanpur",
  "नागपुर": "Nagpur",
  "इंदौर": "Indore",
  "भोपाल": "Bhopal",
  "पटना": "Patna",
  "वडोदरा": "Vadodara",
  "गाजियाबाद": "Ghaziabad",
  "लुधियाना": "Ludhiana",
  "आगरा": "Agra",
  "नासिक": "Nashik",
  "फरीदाबाद": "Faridabad",
  "मेरठ": "Meerut",
  "राजकोट": "Rajkot",
  "श्रीनगर": "Srinagar",
  "जबलपुर": "Jabalpur",
  "ग्वालियर": "Gwalior",
  "विजयवाड़ा": "Vijayawada",
  "जोधपुर": "Jodhpur",
  "रायपुर": "Raipur",
  "कोटा": "Kota",
  "चंडीगढ़": "Chandigarh",
  "देहरादून": "Dehradun",
  "नोएडा": "Noida",
  "गोरखपुर": "Gorakhpur",
  "झांसी": "Jhansi",
  "बरेली": "Bareilly",
  "अलीगढ़": "Aligarh",
  "मुरादाबाद": "Moradabad",
  "सहारनपुर": "Saharanpur",
  "मैसूर": "Mysuru",
  "उदयपुर": "Udaipur",
  "धनबाद": "Dhanbad",
  "रांची": "Ranchi",
  "शिमला": "Shimla",

  // Global Mega-Cities
  "टोक्यो": "Tokyo",
  "क्योटो": "Kyoto",
  "ओसाका": "Osaka",
  "काठमांडू": "Kathmandu",
  "पोखरा": "Pokhara",
  "जनकपुर": "Janakpur",
  "लुंबिनी": "Lumbini",
  "लंदन": "London",
  "पेरिस": "Paris",
  "न्यूयॉर्क": "New York",
  "दुबई": "Dubai",
  "अबू धाबी": "Abu Dhabi",
  "सिंगापुर": "Singapore",
  "कुआलालंपुर": "Kuala Lumpur",
  "सिडनी": "Sydney",
  "मेलबर्न": "Melbourne",
  "टोरंटो": "Toronto",
  "वैंकूवर": "Vancouver",
  "सैन फ्रांसिस्को": "San Francisco",
  "लॉस एंजिल्स": "Los Angeles",
  "शिकागो": "Chicago",
  "बर्लिन": "Berlin",
  "मास्को": "Moscow",
  "बैंकॉक": "Bangkok",
  "कोलंबो": "Colombo",
  "ढाका": "Dhaka",

  // Countries & States
  "भारत": "India",
  "जापान": "Japan",
  "नेपाल": "Nepal",
  "अमेरिका": "USA",
  "यूके": "UK",
  "इंग्लैंड": "UK",
  "ब्रिटेन": "UK",
  "कनाडा": "Canada",
  "ऑस्ट्रेलिया": "Australia",
  "जर्मनी": "Germany",
  "फ्रांस": "France",
  "यूएई": "UAE",
  "रूस": "Russia",
  "उत्तर प्रदेश": "Uttar Pradesh",
  "उत्तराखंड": "Uttarakhand",
  "मध्य प्रदेश": "Madhya Pradesh",
  "महाराष्ट्र": "Maharashtra",
  "गुजरात": "Gujarat",
  "राजस्थान": "Rajasthan",
  "बिहार": "Bihar",
};

/**
 * Unified Search across all Countries, States, and Towns in the database.
 * Supports both English and Hindi/Devanagari queries (e.g. "अयोध्या", "Tokyo", "वाराणसी").
 * Returns array of matches with full hierarchical details and auto-calculated coordinates.
 */
export function searchAllLocations(query, maxResults = 25) {
  if (!query || query.trim().length === 0) return [];
  const rawQuery = query.trim();
  const q = rawQuery.toLowerCase();

  // Check for Devanagari Hindi characters
  const hasDevanagari = /[\u0900-\u097F]/.test(rawQuery);
  let translatedTerms = [];

  if (hasDevanagari) {
    // 1. Direct match in HINDI_LOCATION_MAP
    if (HINDI_LOCATION_MAP[rawQuery]) {
      translatedTerms.push(HINDI_LOCATION_MAP[rawQuery].toLowerCase());
    }
    // 2. Substring replacements
    let replaced = rawQuery;
    for (const [hi, en] of Object.entries(HINDI_LOCATION_MAP)) {
      if (rawQuery.includes(hi)) {
        translatedTerms.push(en.toLowerCase());
        replaced = replaced.replace(new RegExp(hi, "g"), en);
      }
    }
    if (replaced !== rawQuery) {
      translatedTerms.push(replaced.toLowerCase().trim());
    }
  }

  const results = [];

  for (const [countryName, countryData] of Object.entries(LOCATION_HIERARCHY)) {
    const defaultTz = countryData.defaultTz;
    const defaultTzStr = countryData.tzStr;

    for (const [stateName, towns] of Object.entries(countryData.states)) {
      for (const town of towns) {
        const townName = town.name.toLowerCase();
        const stateLower = stateName.toLowerCase();
        const countryLower = countryName.toLowerCase();
        const fullHierarchyLower = `${townName}, ${stateLower}, ${countryLower}`;

        let score = -1;

        // Check English query
        if (townName.startsWith(q)) score = 100;
        else if (townName.includes(q)) score = 70;
        else if (stateLower.startsWith(q)) score = 50;
        else if (countryLower.startsWith(q)) score = 30;
        else if (fullHierarchyLower.includes(q)) score = 20;

        // Check Translated Hindi terms if applicable
        if (score < 100 && translatedTerms.length > 0) {
          for (const term of translatedTerms) {
            if (townName.startsWith(term)) {
              score = Math.max(score, 100);
            } else if (townName.includes(term)) {
              score = Math.max(score, 85);
            } else if (stateLower.startsWith(term)) {
              score = Math.max(score, 60);
            } else if (countryLower.startsWith(term)) {
              score = Math.max(score, 40);
            } else if (fullHierarchyLower.includes(term)) {
              score = Math.max(score, 30);
            }
          }
        }

        if (score > 0) {
          results.push({
            name: `${town.name}, ${stateName}, ${countryName}`,
            shortName: town.name,
            state: stateName,
            country: countryName,
            lat: town.lat,
            lon: town.lon,
            tz: town.tz !== undefined ? town.tz : defaultTz,
            tzStr: town.tzStr || defaultTzStr,
            isSacred: !!town.isSacred,
            note: town.note || "",
            score,
          });
        }
      }
    }
  }

  // Sort by match score descending, then sacred, then alphabetical
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.isSacred && !b.isSacred) return -1;
    if (!a.isSacred && b.isSacred) return 1;
    return a.name.localeCompare(b.name);
  });

  return results.slice(0, maxResults);
}

/**
 * Resolves full location details (lat, lon, tz, tzStr) from user input automatically.
 */
export function resolveLocationAutomatically(input) {
  if (!input) return null;

  // 1. If object with coordinates already
  if (typeof input === "object" && input.lat !== undefined && input.lon !== undefined) {
    const lat = parseFloat(input.lat);
    const lon = parseFloat(input.lon);
    const tz = input.tz !== undefined ? parseFloat(input.tz) : estimateTzFromLongitude(lon);
    return {
      name: input.name || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      lat,
      lon,
      tz,
      tzStr: input.tzStr || `UTC${formatTzOffset(tz)}`,
      category: input.category || "Custom",
    };
  }

  // 2. If string, search in database
  const query = String(input).trim();
  const matches = searchAllLocations(query, 1);
  if (matches.length > 0) {
    const m = matches[0];
    return {
      name: m.name,
      lat: m.lat,
      lon: m.lon,
      tz: m.tz,
      tzStr: m.tzStr,
      category: m.country === "India" ? (m.isSacred ? "Sacred India" : "India") : "Custom",
    };
  }

  // 3. Check preset WORLD_CITIES
  const presetMatch = WORLD_CITIES.find(
    (c) => c.name.toLowerCase().includes(query.toLowerCase())
  );
  if (presetMatch) {
    return {
      name: presetMatch.name,
      lat: presetMatch.lat,
      lon: presetMatch.lon,
      tz: presetMatch.tz,
      tzStr: presetMatch.tzStr || `UTC${formatTzOffset(presetMatch.tz)}`,
      category: presetMatch.category,
    };
  }

  return null;
}

/**
 * server/astrology/horoscopeOverviewKnowledge.js
 * 
 * Classical Vedic Horoscope (Janma Kundli) Foundations & Systematic Interpretation Guide.
 * Grounded in Brihat Parashara Hora Shastra, Brihat Jataka, and Phaladeepika.
 * Free of fatalistic predictions, superstitious claims, or fear-based dogma.
 */

export const HOROSCOPE_OVERVIEW = {
  id: "horoscope-foundations",
  title: "Foundations of Vedic Astrology (Jyotisha Shastra)",
  subtitle: "Understanding the Janma Kundli as a Symbolic Map of Consciousness and Karma",
  introduction: {
    whatIsJanmaKundli: `A Janma Kundli (birth chart) is an exact astronomical map of the heavens captured at the precise moment and geographic location of an individual's birth. Viewed from the specific coordinates of the birth place, the horizon intersects the 360-degree zodiac belt (Rashi Chakra) to establish the eastern ascendant (Lagna). The positions of the Sun, Moon, and planets (Grahas) along with the lunar nodes (Rahu and Ketu) are mapped against the 12 Bhavas (houses) and 27 Nakshatras (lunar mansions).

In classical Vedic philosophy, the chart is not viewed as a deterministic script that strips a human being of agency. Rather, it represents the Prarabdha Karma—the accumulated inclinations, latent potentials (Samskaras), and cosmic baseline of tendencies an individual brings into this embodiment. The Sanskrit term 'Jyotisha' translates to 'the science of light' (Jyoti = divine light, Isha = lord/ruler), serving as an illuminating mirror for self-awareness, ethical alignment (Dharma), and spiritual growth.`,
    
    chartTypesComparison: [
      {
        type: "Janma Kundli (Natal Birth Chart)",
        sanskrit: "जन्म कुण्डली",
        description: "The primary root chart (D1 or Rashi Chakra). Cast once for the exact time, date, and geographic coordinates of birth. Represents the foundational psychological structure, natural temperament, life potential, and karmic matrix of the native.",
        stability: "Permanent reference chart throughout the native's entire physical lifetime.",
        primaryUse: "Analyzing core character, innate talents, physical constitution, relationship archetypes, and overarching life themes."
      },
      {
        type: "Gochara (Transit Chart)",
        sanskrit: "गोचर",
        description: "The dynamic, continuously moving snapshot of planetary positions in the sky right now relative to the natal Moon or natal Ascendant. As slow-moving planets (Jupiter, Saturn, Rahu, Ketu) enter different signs, they activate different houses in the natal chart.",
        stability: "Constantly changing; planetary speeds range from 2.5 days (Moon) to 2.5 years (Saturn) per sign.",
        primaryUse: "Understanding current cosmic climatic conditions, seasonal psychological phases, and timing of opportunities or obstacles."
      },
      {
        type: "Prashna Kundli (Horary Question Chart)",
        sanskrit: "प्रश्न कुण्डली",
        description: "A chart erected for the exact moment and location an urgent, earnest query is posed to an astrologer. Used when birth time is unknown or to gain immediate insight into a pressing situation.",
        stability: "Momentary; valid specifically for the question asked.",
        primaryUse: "Resolving immediate dilemmas, locating lost items, or clarifying imminent decisions."
      },
      {
        type: "Varshaphala (Solar Return Chart)",
        sanskrit: "वर्षफल",
        description: "Cast for the exact minute the transiting Sun returns to the identical celestial longitude it occupied at the moment of birth. Marks the beginning of the native's personal annual cycle.",
        stability: "Valid for one solar year (from birthday to birthday).",
        primaryUse: "Forecasting the themes, focal points, and energetic emphasis of a specific year of life."
      }
    ],

    birthDataCriticalRole: {
      title: "Why Exact Birth Time, Date, and Location Are Crucial",
      explanation: `The Earth completes one full 360-degree rotation on its axis in approximately 24 hours. Because the zodiac is divided into 12 equal signs of 30 degrees each:
• An entire zodiac sign passes across the Eastern Horizon in approximately 2 hours (120 minutes).
• In the D9 Navamsha chart (a key divisional harmonic dividing each sign into 9 parts of 3°20' each), a new sub-chart division rises every 13 to 14 minutes.
• In higher divisional charts like the D60 Shashtiamsha (dividing each sign into 60 segments of 0°30' each), the ascendant changes every 2 minutes.

An error of just 4 to 5 minutes in recorded birth time can displace the degree of the Lagna, alter the divisional charts, or miscalculate the beginning and ending dates of major planetary Dasha periods by several months.

Geographic coordinates (exact latitude and longitude) determine the exact local sidereal time (LST) and horizon tilt. Because cities just 50 kilometers apart experience sunrise and horizon ascensions at different moments, generic or approximate city coordinates distort house cusps.`,
      approximateTimeGuidance: `When the exact birth time is uncertain (e.g. within a 30-to-60 minute window), responsible classical practitioners:
1. Focus primarily on the Chandra Kundli (Moon Chart), since the Moon travels only ~0.5 degrees per hour and stays in the same sign for ~2.5 days.
2. Analyze the Surya Kundli (Sun Chart) for vital life energy and vocational disposition.
3. Observe planetary dignities, aspects, and conjunctions which remain consistent throughout the day.
4. Refrain from asserting fine-grained house placements or micro-period Dasha predictions until formal rectification (Nashta Jataka) has been conducted by a qualified scholar.`
    }
  },

  structuralElements: [
    {
      element: "Lagna (Ascendant)",
      sanskrit: "लग्न",
      concept: "The point of intersection between the Eastern Horizon and the Ecliptic at the moment of birth. Represents the physical incarnation, vitality, personality filter, and self-orientation. The Lagna lord (Lagnesha) is the single most vital guide of the entire horoscope."
    },
    {
      element: "12 Bhavas (Houses)",
      sanskrit: "द्वादश भावाः",
      concept: "The twelve sectors of existence radiating outward from the Ascendant. They map human life from physical emergence (1st house - Tanu) to ultimate liberation and transcendence (12th house - Vyaya), encompassing wealth, family, courage, intellect, relationships, and career."
    },
    {
      element: "12 Rashis (Zodiac Signs)",
      sanskrit: "द्वादश राशयः",
      concept: "The twelve 30-degree divisions of the sidereal zodiac (Mesha through Meena). Each sign possesses a distinct elemental quality (Fire, Earth, Air, Water), behavioral modality (Movable, Fixed, Dual), and planetary ruler, tinting how any planet located within it expresses its energy."
    },
    {
      element: "9 Grahas (Navagrahas)",
      sanskrit: "नवग्रहाः",
      concept: "The functional cosmic intelligences: Surya (Sun), Chandra (Moon), Mangala (Mars), Budha (Mercury), Guru (Jupiter), Shukra (Venus), Shani (Saturn), and the two lunar intersection nodes Rahu (North Node) and Ketu (South Node). They act as distributors of karmic fruit."
    },
    {
      element: "27 Nakshatras (Lunar Mansions)",
      sanskrit: "सप्तविंशति नक्षत्राणि",
      concept: "The ancient stellar backdrop consisting of 27 segments of 13°20' each. The Nakshatra occupied by the Moon at birth (Janma Nakshatra) sets the psychological tone, deity archetypes, and initiates the timing sequence of the Vimshottari Dasha system."
    },
    {
      element: "Dashas (Planetary Timing Periods)",
      sanskrit: "दशा पद्धति",
      concept: "The classical timeline mechanism. In the 120-year Vimshottari cycle, each Graha rules a specific multi-year era (e.g. Jupiter 16 years, Saturn 19 years, Mercury 17 years). A planet's natal dignity and house lordship unfold predominantly during its active Dasha and sub-periods (Antardashas)."
    }
  ],

  compositeInterpretationMethodology: {
    title: "The Principle of Composite Convergence",
    principles: [
      {
        name: "No Single Factor Determines an Outcome",
        rule: "A single planet in a house or sign never defines a destiny. Classical Vedic astrology strictly forbids making conclusive declarations based on isolated placements (e.g., 'Mars in 7th guarantees divorce' or 'Jupiter in 10th guarantees fame')."
      },
      {
        name: "The Rule of Threefold Confirmation (Tri-Sutra)",
        rule: "A life theme is only considered pronounced when indicated simultaneously by: (1) The House (Bhava) representing the domain, (2) The Lord of the House (Bhavesha), and (3) The Natural Signifier (Karaka) of the domain (e.g., Venus for marriage, Sun for father/vitality, Jupiter for wisdom/children)."
      },
      {
        name: "Triple Perspective (Lagna, Chandra, Surya)",
        rule: "A balanced analysis evaluates the chart from three distinct vantage points: (1) Janma Lagna (outer reality and physical life), (2) Chandra Lagna (inner perception, emotional reality, and mental comfort), and (3) Surya Lagna (soul vitality and conscious will)."
      },
      {
        name: "Dasha-Gochara Synthesis",
        rule: "A potential indicated in the natal chart can only manifest when activated by an appropriate planetary Dasha period, supported by favorable planetary transits (Gochara). Without the supporting Dasha, transit effects are brief and superficial."
      }
    ]
  },

  ethicalBoundariesAndLimitations: {
    title: "Traditional Boundaries, Ethics, and Self-Reflection",
    axioms: [
      {
        topic: "Free Will and Destiny (Purushartha & Daiva)",
        text: "Classical texts (such as the Yogavasistha and Mahabharata) state that Daiva (fate/past karma) and Purushakara (conscious human effort in the present) are like the two wheels of a chariot. Without courageous, conscious effort, past karma cannot be redirected or refined. Astrology is a navigation chart, not a prison cell."
      },
      {
        topic: "Rejection of Fear-Based Predictions",
        text: "Authentic Jyotisha condemns exploiting fear through sensationalized curses, doom scenarios (e.g., Kala Sarpa Dosha exaggerated to terrorize seekers), or high-pressure rituals. Legitimate guidance fosters calm discernment, moral rectitude, and spiritual devotion."
      },
      {
        topic: "Non-Medical and Non-Financial Scope",
        text: "Astrological indications of physical vulnerability or economic cycles are symbolic and contemplative. They must NEVER replace professional medical diagnosis, evidence-based healthcare, licensed mental health therapy, or certified legal and financial advice."
      },
      {
        topic: "Purpose of Remedial Measures (Upayas)",
        text: "Traditional remedies—such as Gayatri Japa, scriptural study, acts of charity (Dana), vegetarian discipline, and mindfulness—are internal spiritual purifications designed to steady the mind (Chitta Shuddhi), not magical transactions to outwit cosmic law."
      }
    ]
  },

  classicalReferences: [
    {
      text: "Brihat Parashara Hora Shastra (BPHS)",
      author: "Maharishi Parashara",
      importance: "The foundational encyclopedia of Indian astrology detailing Bhavas, Graha dignities, Dashas, and divisional charts."
    },
    {
      text: "Brihat Jataka",
      author: "Acharya Varahamihira (6th century CE)",
      importance: "The foremost classical treatise on natal astrology, planetary natures, and philosophical principles of karma."
    },
    {
      text: "Phaladeepika",
      author: "Mantreshwara (13th century CE)",
      importance: "A lucid masterwork clarifying planetary aspects, yogas, house lordships, and transits."
    },
    {
      text: "Saravali",
      author: "Kalyanavarma (10th century CE)",
      importance: "Comprehensive practical synthesis of planetary combinations and psychological archetypes."
    }
  ]
};

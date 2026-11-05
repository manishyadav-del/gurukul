/**
 * server/astrology/grahasKnowledge.js
 * 
 * Exhaustive Classical Guide to the Navagrahas (9 Cosmic Grahas) in Vedic Astrology.
 * Grounded in Brihat Parashara Hora Shastra, Brihat Jataka, and Saravali.
 */

export const GRAHAS_KNOWLEDGE = [
  {
    id: "surya",
    sanskritName: "Surya",
    devanagari: "सूर्य",
    englishName: "The Sun",
    nature: "Kruura (Natural Malefic/Stern Royal Father)",
    astronomicalNature: "Luminous Star at the center of the Solar System; primary source of light, heat, and life energy on Earth.",
    symbolism: "Atmakaraka (Signifier of the Soul), divine vitality, royal authority, self-respect, father, and conscious ego.",
    dignities: {
      exaltation: "Aries (Mesha) at 10°",
      debilitation: "Libra (Tula) at 10°",
      moolatrikona: "Leo (Simha) 0° - 20°",
      ownSign: "Leo (Simha) 20° - 30°",
      directionalStrength: "10th House (South / Zenith / Midday)"
    },
    relationships: {
      friends: ["Chandra (Moon)", "Mangala (Mars)", "Guru (Jupiter)"],
      neutral: ["Budha (Mercury)"],
      enemies: ["Shukra (Venus)", "Shani (Saturn)", "Rahu", "Ketu"]
    },
    aspects: "7th house from its placement (full 100% drishti).",
    coreSignifications: [
      "The Atman (innermost immortal soul and conscious self)",
      "Pita (Father), paternal lineage, kings, heads of state, and executive authority",
      "Bone structure, eyesight (right eye), cardiovascular system, and physical vitality (Prana)",
      "Courage, magnanimity, leadership charisma, and administrative aptitude"
    ],
    houseInfluenceSummary: {
      inKendras: "Bestows commanding presence, executive responsibility, and leadership dignity (especially strong in 10th with Digbala).",
      inTrikonas: "Fosters ethical statesmanship, philosophical self-confidence, and intellectual brilliance.",
      inDusthanas: "In 6th, defeats opposition and grants medical/administrative authority; in 8th or 12th, requires deliberate care for eyes, heart, and relationship with father."
    },
    commonMisconceptions: [
      "Misconception: 'The Sun in Libra is ruined and guarantees failure.' Correction: Debilitation simply alters expression toward diplomacy rather than unilateral authority. With Neecha Bhanga (cancellation of debilitation), Sun in Libra creates legendary artists, statesmen, and consensus-builders.",
      "Misconception: 'The Sun is an evil planet.' Correction: Parashara classifies Sun as Krura (stern/fiery), not Papa (sinful). It functions as a just, upright sovereign who burns away falsity."
    ],
    holisticChartContext: "The Sun's effects must always be evaluated through its house lordship (functional nature for that Lagna), whether it is combusting other planets, and its dispositor's dignity.",
    classicalCitations: "BPHS Ch. 3, v. 12-14; Brihat Jataka Ch. 2, v. 1."
  },
  {
    id: "chandra",
    sanskritName: "Chandra",
    devanagari: "चन्द्र",
    englishName: "The Moon",
    nature: "Soumya (Natural Benefic when waxing / Shukla Paksha; mild malefic when dark / Krishna Paksha)",
    astronomicalNature: "Natural satellite orbiting the Earth; modulates ocean tides, biological circadian rhythms, and nocturnal illumination.",
    symbolism: "Manaskaraka (Signifier of the Mind and Emotions), mother, nurturing, memory, empathy, and intuitive flow.",
    dignities: {
      exaltation: "Taurus (Vrishabha) at 3°",
      debilitation: "Scorpio (Vrishchika) at 3°",
      moolatrikona: "Taurus (Vrishabha) 4° - 30°",
      ownSign: "Cancer (Karka) 0° - 30°",
      directionalStrength: "4th House (North / Nadir / Midnight)"
    },
    relationships: {
      friends: ["Surya (Sun)", "Budha (Mercury)"],
      neutral: ["Mangala (Mars)", "Guru (Jupiter)", "Shukra (Venus)", "Shani (Saturn)"],
      enemies: ["None (The Moon harbors no natural enmity toward any planet)"]
    },
    aspects: "7th house from its placement (full 100% drishti).",
    coreSignifications: [
      "Manas (the receptive sensory and emotional mind, memory, and imagination)",
      "Mata (Mother), maternal care, domestic sanctuary, and unconditional affection",
      "Bodily fluids, blood circulation, lymphatic system, left eye, and breast tissue",
      "Public popularity, adaptability, poetic sensibility, and culinary creativity"
    ],
    houseInfluenceSummary: {
      inKendras: "Gives immense emotional stability, loving social presence, and public favor (exalted or in 4th with Digbala).",
      inTrikonas: "Endows deep intuitive insight, psychological wisdom, and artistic creativity.",
      inDusthanas: "In 6th, 8th, or 12th (especially when dark or afflicted by Rahu/Saturn), can cause emotional mood swings, sleep disturbances, or hypersensitivity."
    },
    commonMisconceptions: [
      "Misconception: 'Moon in Scorpio always creates depression or misery.' Correction: Moon in Scorpio gives extraordinary psychological depth, investigative brilliance, forensic intuition, and profound occult empathy when supported by its lord Mars.",
      "Misconception: 'A waxing Moon is always good and waning Moon always bad.' Correction: Both have valuable gifts; a dark Moon often grants deep introspective, contemplative, and meditative stillness."
    ],
    holisticChartContext: "The Moon is the foundation of the Chandra Lagna and the Janma Nakshatra. It reflects whether external life circumstances are received with tranquility or distress.",
    classicalCitations: "BPHS Ch. 3, v. 15-17; Brihat Jataka Ch. 2, v. 2."
  },
  {
    id: "mangala",
    sanskritName: "Mangala / Kuja",
    devanagari: "मङ्गल / कुज",
    englishName: "Mars",
    nature: "Kruura / Papa (Natural Malefic / Fiery Warrior)",
    astronomicalNature: "Terrestrial planet orbiting outside Earth's orbit; characterized by iron-oxide red surface and active tectonic history.",
    symbolism: "Bhratrukaraka (Signifier of Brothers & Comrades), physical energy, courage, protective instinct, and tactical action.",
    dignities: {
      exaltation: "Capricorn (Makara) at 28°",
      debilitation: "Cancer (Karka) at 28°",
      moolatrikona: "Aries (Mesha) 0° - 12°",
      ownSign: "Aries (Mesha) 12° - 30° & Scorpio (Vrishchika)",
      directionalStrength: "10th House (South / Zenith / Peak Action)"
    },
    relationships: {
      friends: ["Surya (Sun)", "Chandra (Moon)", "Guru (Jupiter)"],
      neutral: ["Shukra (Venus)", "Shani (Saturn)"],
      enemies: ["Budha (Mercury)"]
    },
    aspects: "4th, 7th, and 8th houses from its placement (Special full drishti on 4th and 8th).",
    coreSignifications: [
      "Parakrama (heroic valor, daring, physical stamina, and competitive drive)",
      "Younger brothers, military forces, police, engineering, surgery, and metallurgy",
      "Bone marrow, muscular system, red blood cells, bile, and inflammatory response",
      "Landed property, real estate assets, precision tools, and pioneering ventures"
    ],
    houseInfluenceSummary: {
      inKendras: "Forms Ruchaka Mahapurusha Yoga (in own or exalted sign), creating exceptional leaders, athletes, and executives.",
      inTrikonas: "Directs fiery energy into higher studies, righteous defense of ethics, and strategic foresight.",
      inDusthanas: "In 3rd and 6th, highly celebrated for decimating competitors, mastering complex technical skills, and overcoming physical illness."
    },
    commonMisconceptions: [
      "Misconception: 'Manglik Dosha (Mars in 1, 2, 4, 7, 8, 12) inevitably ruins marriage.' Correction: Over 50% of human charts have this placement. Classical texts cite dozens of cancellations (e.g. Mars in Aries, Scorpio, Capricorn, or aspected by Jupiter). It simply calls for active communication and equal energetic partnership.",
      "Misconception: 'Mars produces only violence and anger.' Correction: Mars is the force of noble protection (Dharma-Yuddha), moral courage, surgical healing, and building tangible infrastructure."
    ],
    holisticChartContext: "Evaluate whether Mars functions as a Yogakaraka (e.g., for Cancer and Leo Lagnas, where it rules both a Kendra and Trikona, becoming a pure supreme benefic).",
    classicalCitations: "BPHS Ch. 3, v. 18-20; Saravali Ch. 4, v. 8."
  },
  {
    id: "budha",
    sanskritName: "Budha",
    devanagari: "बुध",
    englishName: "Mercury",
    nature: "Soumya (Benefic by default; adopts the nature of planets it conjuncts closely)",
    astronomicalNature: "Smallest planet, closest to the Sun; swift orbital period of 88 Earth days.",
    symbolism: "Buddhikaraka (Signifier of Intellect & Discrimination), communication, commerce, linguistics, logic, and humour.",
    dignities: {
      exaltation: "Virgo (Kanya) at 15°",
      debilitation: "Pisces (Meena) at 15°",
      moolatrikona: "Virgo (Kanya) 16° - 20°",
      ownSign: "Gemini (Mithuna) & Virgo (Kanya) 21° - 30°",
      directionalStrength: "1st House (East / Ascendant / Intellectual Dawn)"
    },
    relationships: {
      friends: ["Surya (Sun)", "Shukra (Venus)"],
      neutral: ["Mangala (Mars)", "Guru (Jupiter)", "Shani (Saturn)"],
      enemies: ["Chandra (Moon)"]
    },
    aspects: "7th house from its placement (full 100% drishti).",
    coreSignifications: [
      "Buddhi (rational discrimination, memory, analytical calculation, and logic)",
      "Communication, journalism, software programming, accounting, and literature",
      "Nervous system, skin, vocal cords, sensory perception, and cognitive speed",
      "Youthfulness, humor, wit, commerce, trading, and diplomacy"
    ],
    houseInfluenceSummary: {
      inKendras: "Forms Bhadra Mahapurusha Yoga (in Gemini or Virgo in a Kendra), granting profound scholarship, mathematical mastery, and communicative influence.",
      inTrikonas: "Endows deep philosophical inquiry, poetic fluency, and ease in absorbing languages.",
      inDusthanas: "In 6th (its exaltation sign Virgo falls in 6th for Aries Lagna), creates sharp litigation skills and analytical problem-solving."
    },
    commonMisconceptions: [
      "Misconception: 'Budha-Aditya Yoga (Sun-Mercury conjunction) is rare and guarantees royal status.' Correction: Because Mercury is never more than 28 degrees from the Sun, this combination exists in over 60% of all charts. Its power depends on combustion degrees and sign dignity.",
      "Misconception: 'Mercury in Pisces is totally useless.' Correction: Mercury in Pisces gives visionary artistic imagination, intuitive non-linear thinking, and musical genius."
    ],
    holisticChartContext: "Because Mercury is impressionable, examine which planets aspect or join it; conjunction with Jupiter produces an ethical scholar, with Saturn an exacting scientist, with Mars an outspoken debater.",
    classicalCitations: "BPHS Ch. 3, v. 21-23; Brihat Jataka Ch. 2, v. 4."
  },
  {
    id: "guru",
    sanskritName: "Guru / Brihaspati",
    devanagari: "गुरु / बृहस्पति",
    englishName: "Jupiter",
    nature: "Soumya (Supreme Natural Benefic / The Great Preceptor)",
    astronomicalNature: "Largest gas giant in the Solar System; strong magnetosphere acting as a cosmic gravitational shield for Earth.",
    symbolism: "Jivakaraka (Signifier of Life & Soul expansion), divine wisdom, spiritual teachers, dharma, benevolence, and children.",
    dignities: {
      exaltation: "Cancer (Karka) at 5°",
      debilitation: "Capricorn (Makara) at 5°",
      moolatrikona: "Sagittarius (Dhanu) 0° - 10°",
      ownSign: "Sagittarius (Dhanu) 10° - 30° & Pisces (Meena)",
      directionalStrength: "1st House (East / Ascendant / Spiritual Illumination)"
    },
    relationships: {
      friends: ["Surya (Sun)", "Chandra (Moon)", "Mangala (Mars)"],
      neutral: ["Shani (Saturn)"],
      enemies: ["Budha (Mercury)", "Shukra (Venus)"]
    },
    aspects: "5th, 7th, and 9th houses from its placement (Special full trinal drishti on 5th and 9th).",
    coreSignifications: [
      "Jnana (higher spiritual knowledge, philosophical truth, and ethical guidance)",
      "Guru (spiritual preceptors, teachers, professors, and moral guardians)",
      "Santana (progeny, students, disciples, and generational legacy)",
      "Liver, arterial circulation, metabolic balance, fat tissue, and ears/hearing"
    ],
    houseInfluenceSummary: {
      inKendras: "Forms Hamsa Mahapurusha Yoga, conferring venerable moral stature, magnanimous leadership, and lifelong scholarly esteem.",
      inTrikonas: "Supremely auspicious; expands spiritual merit, philosophical writing, and intuitive devotion.",
      inDusthanas: "Tends to protect the house it occupies from destructive extremes, though its capacity to protect the houses it aspects may be slightly subdued."
    },
    commonMisconceptions: [
      "Misconception: 'Jupiter always protects everything and can never cause harm.' Correction: Functionally, for Taurus and Libra Lagnas, Jupiter rules difficult houses (8th, 6th) and can cause excessive optimism, metabolic weight gain, or over-extension if unchecked.",
      "Misconception: 'Jupiter in Capricorn brings total misfortune.' Correction: Neecha Jupiter in Capricorn grounds wisdom into practical, realistic institutional reforms, producing disciplined legal and corporate builders."
    ],
    holisticChartContext: "Jupiter's aspects are revered across all Vedic classics as the most potent harmonizing and healing force in astrology.",
    classicalCitations: "BPHS Ch. 3, v. 24-26; Saravali Ch. 4, v. 10."
  },
  {
    id: "shukra",
    sanskritName: "Shukra",
    devanagari: "शुक्र",
    englishName: "Venus",
    nature: "Soumya (Supreme Natural Benefic / Preceptor of Aesthetic & Alchemical Wisdom)",
    astronomicalNature: "Terrestrial planet with thick reflective cloud canopy; brightest natural celestial object after the Sun and Moon.",
    symbolism: "Kalatrakaraka (Signifier of Spouse & Love), refined beauty, creative arts, sensual joy, diplomacy, and healing remedies (Sanjivani).",
    dignities: {
      exaltation: "Pisces (Meena) at 27°",
      debilitation: "Virgo (Kanya) at 27°",
      moolatrikona: "Libra (Tula) 0° - 15°",
      ownSign: "Taurus (Vrishabha) & Libra (Tula) 15° - 30°",
      directionalStrength: "4th House (North / Nadir / Domestic Comfort)"
    },
    relationships: {
      friends: ["Budha (Mercury)", "Shani (Saturn)"],
      neutral: ["Mangala (Mars)", "Guru (Jupiter)"],
      enemies: ["Surya (Sun)", "Chandra (Moon)"]
    },
    aspects: "7th house from its placement (full 100% drishti).",
    coreSignifications: [
      "Prema & Saundarya (pure love, devotion, aesthetic refinement, and romantic harmony)",
      "Visual arts, music, poetry, theatre, fashion, luxury architecture, and design",
      "Reproductive vitality (Shukra Dhatu), kidneys, hormonal balance, and skin radiance",
      "Vehicles, domestic luxuries, diplomatic negotiations, and restorative medicine"
    ],
    houseInfluenceSummary: {
      inKendras: "Forms Malavya Mahapurusha Yoga, conferring sublime artistic taste, radiant charisma, and marital contentment.",
      inTrikonas: "Fosters creative brilliance, romantic romance, and appreciation for cultural heritage.",
      inDusthanas: "In the 12th house, Venus is famously praised in Vedic texts for conferring restful sleep, luxurious travels, and unattached generosity."
    },
    commonMisconceptions: [
      "Misconception: 'Venus is solely about shallow vanity and hedonism.' Correction: In Vedic tradition, Shukracharya is the master of Sanjivani Vidya (the secret knowledge of reviving the dead) and esoteric spiritual alchemy.",
      "Misconception: 'Venus in Virgo ruins all love life.' Correction: Venus in Virgo expresses devotion through meticulous acts of service, practical support, and health-conscious dedication."
    ],
    holisticChartContext: "For Capricorn and Aquarius Lagnas, Venus acts as the supreme Yogakaraka (ruling both a Kendra and Trikona simultaneously), bringing premier professional and personal elevation.",
    classicalCitations: "BPHS Ch. 3, v. 27-29; Brihat Jataka Ch. 2, v. 6."
  },
  {
    id: "shani",
    sanskritName: "Shani",
    devanagari: "शनि",
    englishName: "Saturn",
    nature: "Kruura / Papa (Great Cosmic Taskmaster & Karmic Arbiter)",
    astronomicalNature: "Spectacular ringed gas giant orbiting at the boundary of traditional naked-eye astronomical visibility.",
    symbolism: "Ayushkaraka (Signifier of Longevity & Endurance), time (Kala), discipline, humility, detachment, and service to the vulnerable.",
    dignities: {
      exaltation: "Libra (Tula) at 20°",
      debilitation: "Aries (Mesha) at 20°",
      moolatrikona: "Aquarius (Kumbha) 0° - 20°",
      ownSign: "Capricorn (Makara) & Aquarius (Kumbha) 20° - 30°",
      directionalStrength: "7th House (West / Sunset / Balance of Relationships)"
    },
    relationships: {
      friends: ["Budha (Mercury)", "Shukra (Venus)"],
      neutral: ["Guru (Jupiter)"],
      enemies: ["Surya (Sun)", "Chandra (Moon)", "Mangala (Mars)"]
    },
    aspects: "3rd, 7th, and 10th houses from its placement (Special full drishti on 3rd and 10th).",
    coreSignifications: [
      "Kala & Vairagya (inexorable time, endurance, sobering reality, and non-attachment)",
      "Longevity, laboring classes, democratic service, agriculture, mining, and justice",
      "Skeletal system, knees, joints, teeth, chronic conditions, and longevity reserve",
      "Perseverance, patience, systematic engineering, and structural organization"
    ],
    houseInfluenceSummary: {
      inKendras: "Forms Shasha Mahapurusha Yoga (in Libra, Capricorn, or Aquarius in a Kendra), elevating the native to massive administrative authority and steadfast public influence.",
      inTrikonas: "Disciplines the intellect into deep scholarly focus, historical research, and long-term planning.",
      inDusthanas: "In 6th and 8th, exceptional for longevity (Dirgha Ayu), immunity against chronic adversity, and overcoming adversaries through patience."
    },
    commonMisconceptions: [
      "Misconception: 'Shani Sade Sati (Saturn's 7.5-year transit over natal Moon) always causes devastation.' Correction: Sade Sati is a transformative crucible. It dismantles superficial illusions, deepens emotional resilience, and frequently coincides with monumental achievements, marriage, or career peaks for the disciplined.",
      "Misconception: 'Saturn is a cruel demon.' Correction: Parashara reveres Saturn as the embodiment of Yama—impartial justice. He rewards sincere hard work, humility, and truthful living with enduring legacy."
    ],
    holisticChartContext: "For Taurus and Libra Lagnas, Saturn is the premier Yogakaraka. What Saturn gives after testing can never be taken away.",
    classicalCitations: "BPHS Ch. 3, v. 30-32; Phaladeepika Ch. 14, v. 10."
  },
  {
    id: "rahu",
    sanskritName: "Rahu",
    devanagari: "राहु",
    englishName: "North Lunar Node (Dragon's Head)",
    nature: "Chhaya Graha (Shadow Planet / Intense Catalytic Amplifier)",
    astronomicalNature: "Not a physical celestial body; the northern mathematical intersection point (ascending node) where the Moon's orbital plane crosses the Earth's ecliptic plane, causing solar and lunar eclipses.",
    symbolism: "Material hunger, ambition, unconventional breakthroughs, foreign cultures, future-oriented obsession, and digital innovation.",
    dignities: {
      exaltation: "Taurus (Vrishabha) / Gemini (Mithuna) according to diverse classical schools",
      debilitation: "Scorpio (Vrishchika) / Sagittarius (Dhanu)",
      moolatrikona: "Virgo (Kanya)",
      ownSign: "Aquarius (Kumbha) co-ruler with Saturn",
      directionalStrength: "10th House (ambition in the external world)"
    },
    relationships: {
      friends: ["Budha (Mercury)", "Shukra (Venus)", "Shani (Saturn)"],
      neutral: ["Guru (Jupiter)"],
      enemies: ["Surya (Sun)", "Chandra (Moon)", "Mangala (Mars)"]
    },
    aspects: "5th, 7th, and 9th houses from its placement in the Parashari system (mirroring Jupiter's trinal gaze).",
    coreSignifications: [
      "Maya (worldly illusion, revolutionary expansion, and burning exploratory desire)",
      "Foreigners, overseas immigration, cutting-edge technology, artificial intelligence, and media",
      "Unconventional solutions, out-of-the-box disruption, and overcoming social taboos",
      "Poisons, epidemics, mysterious health imbalances, and sudden psychological swings"
    ],
    houseInfluenceSummary: {
      inKendras: "Creates unstoppable worldly ambition and foreign recognition when paired with Kendra/Trikona lords.",
      inTrikonas: "Sparks creative obsession, algorithmic genius, and avant-garde thinking.",
      inDusthanas: "In the 3rd, 6th, and 11th houses, Rahu is classically celebrated for bestowing fearless courage, crushing competitive obstacles, and generating immense financial gains."
    },
    commonMisconceptions: [
      "Misconception: 'Kala Sarpa Yoga ruins life completely.' Correction: This combination (all planets hemmed between Rahu and Ketu) is found in the charts of world leaders, visionary scientists, and global titans. It indicates an intense karmic trajectory, not an inescapable curse.",
      "Misconception: 'Rahu is purely evil.' Correction: Rahu is the cosmic catalyst that drives human exploration, breaking rigid stagnation to discover new frontiers in science, medicine, and human consciousness."
    ],
    holisticChartContext: "Rahu has no physical mass; it acts predominantly through the ruler of the sign it occupies (its dispositor) and planets aspecting it.",
    classicalCitations: "BPHS Ch. 3, v. 33-35; Saravali Ch. 4, v. 12."
  },
  {
    id: "ketu",
    sanskritName: "Ketu",
    devanagari: "केतु",
    englishName: "South Lunar Node (Dragon's Tail)",
    nature: "Chhaya Graha (Shadow Planet / Spiritual Dissolver & Liberator)",
    astronomicalNature: "The southern mathematical intersection point (descending node) where the Moon's orbit cuts the ecliptic plane, marking the opposite pole of the lunar axis (precisely 180° from Rahu).",
    symbolism: "Mokshakaraka (Signifier of Spiritual Liberation), detachment, dispassion (Vairagya), ancestral mastery, and psychic insight.",
    dignities: {
      exaltation: "Scorpio (Vrishchika) / Sagittarius (Dhanu)",
      debilitation: "Taurus (Vrishabha) / Gemini (Mithuna)",
      moolatrikona: "Pisces (Meena)",
      ownSign: "Scorpio (Vrishchika) co-ruler with Mars",
      directionalStrength: "12th House (spiritual solitude and transcendence)"
    },
    relationships: {
      friends: ["Mangala (Mars)", "Guru (Jupiter)", "Shukra (Venus)"],
      neutral: ["Budha (Mercury)", "Shani (Saturn)"],
      enemies: ["Surya (Sun)", "Chandra (Moon)"]
    },
    aspects: "5th, 7th, and 9th houses from its placement in Parashari tradition.",
    coreSignifications: [
      "Moksha (the dissolution of egoic identification and realization of pure awareness)",
      "Innate ancestral skills, past-life mastery that feels effortless in this life",
      "Intuitive gut feeling, non-verbal contemplation, mathematics, and laser-like research",
      "Disinterest in material praise, sudden closures, and spiritual transcendence"
    ],
    houseInfluenceSummary: {
      inKendras: "Brings dispassion to external status and redirects attention toward internal mastery.",
      inTrikonas: "Bestows profound spiritual discrimination, mastery of mantra meditation, and esoteric wisdom.",
      inDusthanas: "In 8th and 12th, Ketu is considered supremely placed for meditative samadhi, mystical realization, and liberation from rebirth."
    },
    commonMisconceptions: [
      "Misconception: 'Ketu only causes losses.' Correction: Ketu dissolves attachment to transient things so you can experience permanent reality. In the material sphere, Ketu often grants uncanny technical, mathematical, or medical mastery.",
      "Misconception: 'Ketu makes a person useless for society.' Correction: Ketu produces selfless humanitarians, brilliant researchers, and profound philosophers whose detachment allows them to serve without selfish bias."
    ],
    holisticChartContext: "Ketu functions like Mars ('Kujavat Ketu'), delivering sharp, piercing, surgical insight. Its dispositor indicates the field where spiritual detachment must be cultivated.",
    classicalCitations: "BPHS Ch. 3, v. 36-38; Phaladeepika Ch. 14, v. 14."
  }
];

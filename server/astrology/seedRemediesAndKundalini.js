/**
 * Seed Verified Vedic Remedies and Kundalini Educational Modules
 * 
 * Sources:
 * - Brihat Parashara Hora Shastra (BPHS, Ch. 84 Graha Shanti)
 * - Surya Siddhanta & Rigveda (3.62.10)
 * - Valmiki Ramayana (Aditya Hridaya Stotra, Yuddha Kanda)
 * - Shiva Purana (Rudra Samhita) & Shukla Yajurveda (3.60)
 * - Hatha Yoga Pradipika & Shiva Samhita (Prana & Chakra Foundations)
 * - Devi Bhagavata Purana (Navagraha Shanti & Daan)
 */

import prisma from "../../lib/prisma.js";

export const INITIAL_REMEDIES = [
  // 1. SUNDAY / SUN (Surya)
  {
    title: "Surya Arghya & Gayatri Meditative Contemplation",
    slug: "surya-arghya-gayatri",
    category: "PUJA",
    deity: "Surya Deva",
    planetaryAssociation: "Sun",
    purpose: "Supports clarity of mind, vitality, self-confidence, and a disciplined start to the week.",
    materials: [
      "Clean copper vessel (Tambe ka lota)",
      "Fresh potable water",
      "Pinch of red sandalwood powder or red flower (optional)",
    ],
    instructions: [
      "Rise during early morning hours, preferably within one hour of sunrise.",
      "Fill a clean copper vessel with fresh water.",
      "Stand facing East toward the rising sun in a posture of reverence.",
      "Raise the vessel with both hands above eye level and slowly offer the water in a steady stream.",
      "Gently look toward the sun through the falling water stream (never gaze directly at the harsh sun).",
      "Silently or softly chant the Gayatri or Surya Mantra 3, 7, or 12 times.",
      "Touch the spilled water with your right ring finger and gently touch your forehead and eyelids in gratitude."
    ],
    durationMinutes: 10,
    suitableTiming: "Sunrise / Pratah-kaal (within 1 hour after sunrise)",
    sanskritMantra: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥",
    transliteration: "Oṃ bhūr bhuvaḥ svaḥ tat savitur vareṇyaṃ bhargo devasya dhīmahi dhiyo yo naḥ pracodayāt ||",
    mantraMeaning: "We meditate on the supreme transcendental radiance of the solar deity; may that divine illumination inspire and awaken our intellect.",
    tradition: "Rigvedic & Surya Siddhanta Tradition",
    sourceReference: "Rigveda 3.62.10; Brihat Parashara Hora Shastra, Ch. 84 (Surya Shanti)",
    costLevel: "FREE",
    accessibilityAlternatives: "If water offering outdoors is not feasible, sit comfortably facing East, place both palms in Anjali Mudra, and practice 11 silent recitations of the mantra with quiet gratitude.",
    applicableWeekdays: [0], // Sunday
    applicableTithis: ["Pratipada", "Saptami", "Purnima", "All"],
    applicableNakshatras: ["Krittika", "Uttara Phalguni", "Uttara Ashadha", "All"],
    isVerified: true,
    status: "PUBLISHED",
  },

  // 2. MONDAY / MOON (Chandra / Shiva)
  {
    title: "Chandra Shanti & Shiva Somavara Japa",
    slug: "chandra-shanti-shiva-somavara",
    category: "MANTRA",
    deity: "Lord Shiva & Chandra Deva",
    planetaryAssociation: "Moon",
    purpose: "Promotes emotional equanimity, calming of an overactive mind, restful sleep, and mental serenity.",
    materials: [
      "Rudraksha or Lotus seed mala (optional)",
      "Small diya with pure ghee or sesame oil (optional)",
      "Fresh white flowers or plain milk for Shiva offering (optional)",
    ],
    instructions: [
      "Bathe or wash hands and feet before practice in the evening or morning.",
      "Sit in a quiet space facing North or East in a relaxed, erect posture.",
      "Take 3 deep, steady breaths to center awareness in the chest (Anahata).",
      "Chant the Chandra Beej Mantra or Om Namah Shivaya 108 times (one mala) or for 10 minutes.",
      "Maintain a slow, meditative cadence, feeling the cooling, soothing presence of lunar energy.",
      "Conclude with 2 minutes of silent stillness, observing the breath without judgment."
    ],
    durationMinutes: 15,
    suitableTiming: "Sandhya-kaal (Sunset / Dusk) or Early Morning",
    sanskritMantra: "ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः ॥ / ॐ नमः शिवाय ॥",
    transliteration: "Oṃ śrāṃ śrīṃ śrauṃ saḥ candramase namaḥ || / Oṃ namaḥ śivāya ||",
    mantraMeaning: "Salutations to Chandra, the celestial deity governing the mind and emotions; Salutations to Lord Shiva, the embodiment of auspicious quietude.",
    tradition: "Shaiva & Vedic Horoscopy Tradition",
    sourceReference: "Brihat Parashara Hora Shastra, Ch. 84; Shiva Purana, Vidyeshvara Samhita",
    costLevel: "FREE",
    accessibilityAlternatives: "No rosary or ritual items required. Sit on a comfortable chair or mat, close your eyes, and repeat 'Om Somaya Namah' 27 times mentally.",
    applicableWeekdays: [1], // Monday
    applicableTithis: ["Purnima", "Dwitiya", "Ekadashi", "All"],
    applicableNakshatras: ["Rohini", "Hasta", "Shravana", "All"],
    isVerified: true,
    status: "PUBLISHED",
  },

  // 3. TUESDAY / MARS (Mangala / Hanuman)
  {
    title: "Mangala Shanti & Hanuman Sankat Mochan Path",
    slug: "mangala-shanti-hanuman-sankat-mochan",
    category: "PUJA",
    deity: "Sri Hanuman & Mangala Deva",
    planetaryAssociation: "Mars",
    purpose: "Cultivates courage, discipline, constructive channelization of anger or impulsiveness, and overcoming inertia.",
    materials: [
      "Mustard oil or ghee lamp",
      "A red flower or jaggery (gud) for offering (optional)",
      "Clean mat (Asana)",
    ],
    instructions: [
      "Sit comfortably facing East or South in a clean room.",
      "Light a traditional lamp with mindfulness.",
      "Offer mental reverence to Sri Hanuman, the archetype of selfless devotion and unyielding courage.",
      "Recite the Hanuman Chalisa or the Mangala Mantra 1 to 3 times with clear, reverent diction.",
      "Dedicate any inner anger, frustration, or fear to the divine flame, resolving to act with patience.",
      "Partake of a small piece of jaggery or fruit as prasad."
    ],
    durationMinutes: 15,
    suitableTiming: "Morning or Tuesday Evening",
    sanskritMantra: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः ॥ / ॐ हनुमते नमः ॥",
    transliteration: "Oṃ krāṃ krīṃ krauṃ saḥ bhaumāya namaḥ || / Oṃ hanumate namaḥ ||",
    mantraMeaning: "Salutations to Mangala, the deity of righteous vitality; Salutations to Sri Hanuman, the remover of afflictions and source of courage.",
    tradition: "Vaishnava & Parasara Astrological Tradition",
    sourceReference: "Brihat Parashara Hora Shastra, Ch. 84; Valmiki Ramayana, Sundara Kanda",
    costLevel: "FREE",
    accessibilityAlternatives: "Mental reading or listening to Hanuman Chalisa with focused attention. If physical posture is difficult, practice seated in any comfortable position.",
    applicableWeekdays: [2], // Tuesday
    applicableTithis: ["Chaturthi", "Ashtami", "Navami", "Chaturdashi", "All"],
    applicableNakshatras: ["Mrigashirsha", "Chitra", "Dhanishta", "All"],
    isVerified: true,
    status: "PUBLISHED",
  },

  // 4. WEDNESDAY / MERCURY (Budha / Vishnu)
  {
    title: "Budha Shanti, Tulsi Vandan & Mindful Communication",
    slug: "budha-shanti-tulsi-communication",
    category: "HABIT",
    deity: "Budha Deva & Lord Vishnu",
    planetaryAssociation: "Mercury",
    purpose: "Enhances articulate communication, analytical intellect, truthful speech, and reconciliation of disputes.",
    materials: [
      "Sacred Tulsi plant (optional)",
      "Clean water for watering plants",
      "Green moong beans or green vegetables for donation (optional)",
    ],
    instructions: [
      "Begin the morning by offering water to a sacred Tulsi plant or houseplant with quiet reverence.",
      "Take a conscious vow of 'Satya & Mitabhashana' (truthful, gentle, and measured speech) for the day.",
      "Chant the Budha Gayatri or Vishnu Stotra 21 or 108 times.",
      "Practice 5 minutes of mindful listening: in conversations today, listen fully without interrupting.",
      "Optional act of charity: Offer green grass/fodder to a cow, or donate green moong/vegetables to those in need."
    ],
    durationMinutes: 10,
    suitableTiming: "Morning / Pratah-kaal",
    sanskritMantra: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः ॥ ॐ नमो भगवते वासुदेवाय ॥",
    transliteration: "Oṃ brāṃ brīṃ brauṃ saḥ budhāya namaḥ || Oṃ namo bhagavate vāsudevāya ||",
    mantraMeaning: "Salutations to Budha, the celestial embodiment of discernment and intellect; Salutations to Lord Vasudeva (Vishnu), the preserver of cosmic balance.",
    tradition: "Vedic & Vaishnava Tradition",
    sourceReference: "Brihat Parashara Hora Shastra, Ch. 84; Vishnu Purana 1.22",
    costLevel: "FREE",
    accessibilityAlternatives: "Watering any domestic green plant and maintaining a silence period (Mauna) for 15 minutes during the afternoon.",
    applicableWeekdays: [3], // Wednesday
    applicableTithis: ["Tritiya", "Panchami", "Trayodashi", "All"],
    applicableNakshatras: ["Ashlesha", "Jyeshtha", "Revati", "All"],
    isVerified: true,
    status: "PUBLISHED",
  },

  // 5. THURSDAY / JUPITER (Brihaspati / Guru)
  {
    title: "Guru Brihaspati Puja & Vidya Daan (Sharing Knowledge)",
    slug: "guru-brihaspati-vidya-daan",
    category: "DAAN",
    deity: "Brihaspati Deva & Dakshinamurti",
    planetaryAssociation: "Jupiter",
    purpose: "Awakens higher wisdom, spiritual discernment, respect for mentors, and auspiciousness in family life.",
    materials: [
      "Yellow cloth or yellow flowers (optional)",
      "Turmeric powder or saffron water",
      "Notebooks, pens, or educational funds for sharing (optional)",
    ],
    instructions: [
      "Wear clean, sober clothing (traditional yellow or light tones are praised in scriptures).",
      "Express sincere gratitude to your parents, teachers, and spiritual mentors, either in person or mentally.",
      "Sit facing North-East (Ishanya, the direction governed by Jupiter).",
      "Chant the Guru Mantra or Brihaspati Beej Mantra 108 times.",
      "Perform a gesture of Vidya Daan: gift a book, tutor a student, share uplifting knowledge, or support educational charity.",
      "Reflect on a passage of sacred scripture or philosophical text for 10 minutes."
    ],
    durationMinutes: 20,
    suitableTiming: "Morning (Brahma Muhurta or Pratah-kaal)",
    sanskritMantra: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः ॥ ॐ गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः । गुरुः साक्षात् परं ब्रह्म तस्मै श्रीगुरवे नमः ॥",
    transliteration: "Oṃ grāṃ grīṃ grauṃ saḥ gurave namaḥ || Oṃ gururbrahmā gururviṣṇuḥ gururdevo maheśvaraḥ | guruḥ sākṣāt paraṃ brahma tasmai śrīgurave namaḥ ||",
    mantraMeaning: "Salutations to Guru Brihaspati, preceptor of the celestials. The teacher is Brahma, Vishnu, and Shiva; the teacher is verily the supreme consciousness manifest. To that venerable guide, our deepest reverence.",
    tradition: "Guru-Shishya & Smarta Vedic Tradition",
    sourceReference: "Brihat Parashara Hora Shastra, Ch. 84; Guru Gita, Skanda Purana",
    costLevel: "FREE",
    accessibilityAlternatives: "Send a message of heartfelt gratitude to a teacher or mentor who positively impacted your life.",
    applicableWeekdays: [4], // Thursday
    applicableTithis: ["Panchami", "Ekadashi", "Purnima", "All"],
    applicableNakshatras: ["Punarvasu", "Vishakha", "Purva Bhadrapada", "All"],
    isVerified: true,
    status: "PUBLISHED",
  },

  // 6. FRIDAY / VENUS (Shukra / Mahalakshmi)
  {
    title: "Shukra Shanti & Sri Suktam Contemplation",
    slug: "shukra-shanti-sri-suktam",
    category: "PUJA",
    deity: "Mahalakshmi & Shukra Deva",
    planetaryAssociation: "Venus",
    purpose: "Fosters harmony in relationships, appreciation of sacred beauty, abundance, and artistic refinement.",
    materials: [
      "Ghee lamp or incense stick",
      "White or pink fragrant flower (optional)",
      "Clean white or silk mat",
    ],
    instructions: [
      "Ensure personal cleanliness and tidy your household altar or living space.",
      "Light a lamp dedicated to Sri Mahalakshmi, the divine mother of grace and auspicious prosperity.",
      "Chant the Shukra Beej Mantra 21 or 108 times, or recite the Sri Suktam from the Rigveda.",
      "Practice conscious appreciation: acknowledge three blessings in your relationship and physical surroundings.",
      "Avoid engaging in bitter criticism, vulgarity, or domestic arguments today.",
      "Optional Daan: Donate food, sweets, or support to women in need or elderly mothers."
    ],
    durationMinutes: 15,
    suitableTiming: "Evening twilight (Sandhya) or Morning",
    sanskritMantra: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः ॥ ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद श्रीं ह्रीं श्रीं ॐ महालक्ष्म्यै नमः ॥",
    transliteration: "Oṃ drāṃ drīṃ drauṃ saḥ śukrāya namaḥ || Oṃ śrīṃ hrīṃ śrīṃ kamale kamalālaye prasīda prasīda śrīṃ hrīṃ śrīṃ oṃ mahālakṣmyai namaḥ ||",
    mantraMeaning: "Salutations to Shukra, the celestial preceptor of refined wisdom and grace; Salutations to Mahalakshmi, residing in the lotus, bestowing supreme contentment and auspicious grace.",
    tradition: "Vedic Shakta & Parashara Tradition",
    sourceReference: "Rigveda Parishishta (Sri Suktam); Brihat Parashara Hora Shastra, Ch. 84",
    costLevel: "FREE",
    accessibilityAlternatives: "Clean a corner of your home with reverence and maintain peaceful, gentle speech throughout the evening.",
    applicableWeekdays: [5], // Friday
    applicableTithis: ["Shukla Paksha", "Panchami", "Purnima", "All"],
    applicableNakshatras: ["Bharani", "Purva Phalguni", "Purva Ashadha", "All"],
    isVerified: true,
    status: "PUBLISHED",
  },

  // 7. SATURDAY / SATURN (Shani / Hanuman / Shiva)
  {
    title: "Shani Shanti, Seva (Selfless Service) & Deepam",
    slug: "shani-shanti-seva-deepam",
    category: "DAAN",
    deity: "Shani Deva & Lord Shiva",
    planetaryAssociation: "Saturn",
    purpose: "Instills patience, humility, perseverance, reduction of karmic friction, and compassion for the underprivileged.",
    materials: [
      "Sesame oil (Til ka tel) or mustard oil lamp",
      "Black sesame seeds (optional)",
      "Footwear, warm clothing, or dark grains/oil for charitable donation (optional)",
    ],
    instructions: [
      "Light an oil lamp (preferably with sesame or mustard oil) under a Peepal tree or in a quiet prayer corner after sunset.",
      "Chant the Shani Gayatri or Maha Mrityunjaya Mantra 11 or 108 times with slow, deep breathing.",
      "Practice humble self-reflection: acknowledge your past mistakes without self-condemnation, resolving to rectify your habits.",
      "Perform an act of physical seva (selfless labor): clean a public space, assist a manual laborer, or feed stray animals.",
      "Treat all service workers, elders, and domestic helpers with sincere respect and dignity.",
      "Avoid consuming excessive tamasic foods, alcohol, or engaging in deceit."
    ],
    durationMinutes: 20,
    suitableTiming: "Evening after sunset (Pradosha-kaal)",
    sanskritMantra: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः ॥ ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥",
    transliteration: "Oṃ prāṃ prīṃ prauṃ saḥ śanaiścarāya namaḥ || Oṃ tryambakaṃ yajāmahe sugandhiṃ puṣṭivardhanam | urvārukamiva bandhanān mṛtyor mukṣīya māmṛtāt ||",
    mantraMeaning: "Salutations to Shanaishchara, the celestial dispenser of justice through patient time. We worship the three-eyed Lord Shiva, fragrant and nourishing all beings; as a ripe fruit detaches from its stalk, may we be liberated from the bondage of mortality into the nectar of immortality.",
    tradition: "Rigveda (7.59.12); Brihat Parashara Hora Shastra, Ch. 84 (Shani Shanti)",
    costLevel: "FREE",
    accessibilityAlternatives: "Spend 10 minutes helping someone who is overburdened with manual labor or feed birds/stray dogs with quiet compassion.",
    applicableWeekdays: [6], // Saturday
    applicableTithis: ["Amavasya", "Ashtami", "Chaturdashi", "All"],
    applicableNakshatras: ["Pushya", "Anuradha", "Uttara Bhadrapada", "All"],
    isVerified: true,
    status: "PUBLISHED",
  },

  // 8. UNIVERSAL / WHAT TO AVOID DURING RAHU KAAL
  {
    title: "Rahu Kaal Observance & Mindful Discernment",
    slug: "rahu-kaal-mindful-discernment",
    category: "AVOIDANCE",
    deity: "Durga Mata & Rahu Deva",
    planetaryAssociation: "Rahu",
    purpose: "Prevents impulsive commitments, miscommunication, and deceptive illusions during unsettled time windows.",
    materials: [],
    instructions: [
      "Identify the daily Rahu Kaal window from the verified Panchang schedule.",
      "During this 90-minute window, refrain from signing major irrevocable legal contracts, inaugurating new businesses, or making hasty financial investments.",
      "Use this period constructively for routine duties, cleaning, proofreading, spiritual recitation, or quiet contemplation.",
      "If crucial work must be performed, recite the Durga Mantra 9 times beforehand with sincere prayer for clarity.",
      "Avoid participating in gossip, malicious rumor-spreading, or impulsive gambling."
    ],
    durationMinutes: 5,
    suitableTiming: "During the designated daily Rahu Kaal interval",
    sanskritMantra: "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे ॥ / ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः ॥",
    transliteration: "Oṃ aiṃ hrīṃ klīṃ cāmuṇḍāyai vicce || / Oṃ bhrāṃ bhrīṃ bhrauṃ saḥ rāhave namaḥ ||",
    mantraMeaning: "Salutations to the Supreme Divine Mother Chamunda, embodiment of ultimate spiritual discernment dispelling ignorance and illusion.",
    tradition: "Classical Muhurta & Shakta Tradition",
    sourceReference: "Muhurta Chintamani; Brihat Samhita, Ch. 5 & 10",
    costLevel: "FREE",
    accessibilityAlternatives: "Pause for 60 seconds before sending important emails or signing documents, taking 3 deep breaths to ground your presence.",
    applicableWeekdays: [0, 1, 2, 3, 4, 5, 6], // Daily
    applicableTithis: ["All"],
    applicableNakshatras: ["All"],
    isVerified: true,
    status: "PUBLISHED",
  },
];

export const INITIAL_KUNDALINI_MODULES = [
  // Module 1: Foundations & Historical Context
  {
    title: "Foundations & Historical Context of Kundalini",
    slug: "foundations-historical-context",
    subtitle: "Understanding the Traditional Yogic Paradigm without Sensationalism",
    level: "BEGINNER",
    chakraAssociation: "All",
    chakraElement: "Consciousness",
    bijaMantra: "OM",
    historicalContext: "In classical Indian philosophy, the term 'Kundalini' (from 'kundala', meaning coiled or spiral) represents the dormant potential of primordial cosmic consciousness (Prana-Shakti) within every human being. Earliest philosophical references appear in the Upanishads (e.g. Katha, Chandogya, and Yoga Kundalini Upanishad), later systematized in medieval Hatha Yoga scriptures such as Swami Svatmarama's Hatha Yoga Pradipika, the Shiva Samhita, and the non-dual Shaiva Tantras of Kashmir (Abhinavagupta's Tantraloka). In this traditional lineage, spiritual maturation is not a forceful, dramatic explosion, but a gentle, harmonized ripening of physical health, moral purity (Yama & Niyama), and psychological stability.",
    practices: [
      {
        step: 1,
        title: "Sattvic Grounding & Intent",
        text: "Sit comfortably with a straight yet relaxed spine. Recognize that spiritual practice is about cultivating inner peace, kindness, and clear awareness rather than seeking psychic phenomena or sensational states."
      },
      {
        step: 2,
        title: "Observation of Natural Breath",
        text: "Without altering your breath, observe the natural inflow and outflow at the tip of your nostrils for 5 minutes. Notice how stillness in breath immediately reflects as stillness in the mind."
      },
      {
        step: 3,
        title: "Dedication of Merit",
        text: "Conclude by quietly wishing peace and freedom from suffering for all living beings (Lokah Samastah Sukhino Bhavantu)."
      }
    ],
    safetyGuidance: "CRITICAL SAFETY GUIDANCE:\n1. Never attempt aggressive, forceful breath retention (Kumbhaka) or rapid hyperventilation without years of supervised foundation.\n2. Do not interpret ordinary physiological sensations (tingling, muscle twitches, temperature shifts) as signs of Kundalini awakening.\n3. Spiritual practice must never replace medical, psychiatric, or psychological treatment. If experiencing dizziness, anxiety, or disorientation, cease immediately, drink warm water, and ground yourself in physical activity.",
    sourceReferences: [
      { text: "Yoga Kundalini Upanishad", chapter: "Chapter 1, Verses 1-8" },
      { text: "Hatha Yoga Pradipika", chapter: "Chapter 3 (Mudras & Bandhas), Verses 1-4" },
      { text: "Shiva Samhita", chapter: "Patala 2 & 4" }
    ],
    order: 1,
    status: "PUBLISHED",
  },

  // Module 2: The Seven Chakras
  {
    title: "The Seven Chakras: Symbolic Energy Architecture",
    slug: "seven-chakras-energy-architecture",
    subtitle: "Classical Energetic Centers, Elements, and Psychological Dimensions",
    level: "BEGINNER",
    chakraAssociation: "All",
    chakraElement: "All",
    bijaMantra: "LAM, VAM, RAM, YAM, HAM, OM",
    historicalContext: "The word 'Chakra' means wheel or lotus vortex in Sanskrit. Traditional treatises like the Shat-Chakra-Nirupana (written by Purnananda Swami in 1526 CE) describe seven primary centers along the central energy channel (Sushumna Nadi). Each center corresponds to a gross physical element (Mahabhuta), a psychological domain, and an innate quality of consciousness: Muladhara (Earth/Stability), Svadhisthana (Water/Fluidity), Manipura (Fire/Willpower), Anahata (Air/Compassion), Vishuddha (Ether/Expression), Ajna (Mind/Intuition), and Sahasrara (Consciousness/Unity). Classical texts emphasize integrating all centers harmoniously rather than forcing energy upward prematurely.",
    practices: [
      {
        step: 1,
        title: "Ascending Body Scan Awareness",
        text: "Begin at the base of your pelvis (Muladhara). Breathe calmly into this area, cultivating a sense of physical safety and being firmly rooted on Earth."
      },
      {
        step: 2,
        title: "Heart-Centered Breath (Anahata)",
        text: "Gently move your awareness to the center of your chest. With each soft inhalation, feel the chest softly expanding with unconditional warmth and acceptance."
      },
      {
        step: 3,
        title: "Quiet Eyebrow Center Focus (Ajna)",
        text: "Gently rest awareness between the eyebrows. Avoid straining your physical eyes. Cultivate a calm, open space of witness consciousness (Sakshi Bhava)."
      }
    ],
    safetyGuidance: "Do not obsess over 'chakra blockages' or attribute chronic medical illnesses to individual chakras. Traditional masters viewed chakras as focal points for meditative visualization and ethical contemplation, not diagnostic medical tools.",
    sourceReferences: [
      { text: "Shat-Chakra-Nirupana", chapter: "Verses 1 to 49" },
      { text: "Goraksha Paddhati", chapter: "Chapter 1, Verses 52-70" },
      { text: "Taittiriya Aranyaka", chapter: "Vedic cosmology sections" }
    ],
    order: 2,
    status: "PUBLISHED",
  },

  // Module 3: Posture & Natural Breath
  {
    title: "Sthira-Sukham: Posture Alignment & Natural Breath",
    slug: "posture-alignment-natural-breath",
    subtitle: "Patanjali's Formula for Steady, Joyful Stillness",
    level: "BEGINNER",
    chakraAssociation: "Muladhara (Root)",
    chakraElement: "Earth (Prithvi)",
    bijaMantra: "LAM",
    historicalContext: "In the Yoga Sutras of Patanjali (2.46), posture is defined concisely: 'Sthira-sukham asanam' — posture must be steady (sthira) and comfortable (sukha). Without comfort, the nervous system enters mild sympathetic distress (fight-or-flight), creating tension that obstructs quiet meditation. Classical masters taught that natural, unhurried diaphragmatic breathing harmonizes the autonomic nervous system, balancing the Prana Vayu (vitalizing energy) and Apana Vayu (grounding energy).",
    practices: [
      {
        step: 1,
        title: "Establishing the Base (Asana)",
        text: "Sit on a firm cushion or chair. Ensure your knees are relaxed and your hips are slightly higher than your knees to maintain the natural lumbar curve."
      },
      {
        step: 2,
        title: "Relaxing Facial & Shoulder Muscles",
        text: "Release tension in your jaw, soften the tongue away from the palate, and allow the shoulder blades to slide gently down the back."
      },
      {
        step: 3,
        title: "Gentle Diaphragmatic Breathing",
        text: "Place a hand over your navel. As you breathe in softly, feel your abdomen gently expand. As you breathe out, feel it effortlessly recede. Maintain this for 8 to 10 quiet minutes."
      }
    ],
    safetyGuidance: "STOP IMMEDIATELY if you experience lightheadedness, tingling in fingers, air hunger, or rapid heart rate. Return to your ordinary posture, open your eyes, and look at objects in the room.",
    sourceReferences: [
      { text: "Patanjali Yoga Sutras", chapter: "Sadhana Pada 2.46 - 2.48" },
      { text: "Gheranda Samhita", chapter: "Pranayama Prakarana, Verses 1-15" }
    ],
    order: 3,
    status: "PUBLISHED",
  },

  // Module 4: Muladhara Grounding
  {
    title: "Grounding Awareness & Muladhara Meditation",
    slug: "muladhara-grounding-meditation",
    subtitle: "Cultivating Emotional Security, Stability, and Earth Connection",
    level: "BEGINNER",
    chakraAssociation: "Muladhara (Root)",
    chakraElement: "Earth (Prithvi)",
    bijaMantra: "LAM (लम्)",
    historicalContext: "Muladhara ('Mula' = root, 'Adhara' = support) is the four-petaled lotus located at the perineal base. Associated with the Earth element (Prithvi) and the sense of smell (Gandha), it governs our foundational psychological need for survival, safety, and stability. When this center is harmonized through ethical living and steady meditation, a seeker feels anchored and unshakeable amidst the fluctuating challenges of life.",
    practices: [
      {
        step: 1,
        title: "Rooted Visualization",
        text: "Visualize strong, warm tree roots extending from the base of your spine deep into the heart of the Earth, anchoring your physical body."
      },
      {
        step: 2,
        title: "Soft Bija Resonance",
        text: "Gently chant the seed syllable 'LAM' (लम्) on comfortable exhalations for 3 to 5 minutes, feeling the grounding resonance in the pelvic basin."
      },
      {
        step: 3,
        title: "Affirmation of Inner Trust",
        text: "Silently contemplate: 'I am safe in this moment. The Earth supports my physical life, and I walk with steady purpose.'"
      }
    ],
    safetyGuidance: "Avoid intense physical pelvic contractions (Mula Bandha) for extended periods without in-person lineage guidance. Keep the physical engagement subtle and gentle.",
    sourceReferences: [
      { text: "Shat-Chakra-Nirupana", chapter: "Verses 4-13" },
      { text: "Mahanirvana Tantra", chapter: "Ullasa 5" }
    ],
    order: 4,
    status: "PUBLISHED",
  },

  // Module 5: Anahata Compassion
  {
    title: "Heart-Centered Contemplation & Anahata Expansion",
    slug: "anahata-heart-compassion",
    subtitle: "The Unstruck Sound: Awakening Benevolence, Healing, and Devotion",
    level: "INTERMEDIATE",
    chakraAssociation: "Anahata (Heart)",
    chakraElement: "Air (Vayu)",
    bijaMantra: "YAM (यम्)",
    historicalContext: "Anahata literally translates to 'unstruck sound' — the primordial cosmic vibration that sounds without two objects colliding. Located at the center of the chest, Anahata is associated with the Air element (Vayu) and twelve golden petals. It bridges the foundational physical chakras with the higher cognitive centers. Traditional texts describe it as the dwelling place of the Jivatma (individual soul) and the seat of Bhakti (devotion) and Karuna (boundless compassion).",
    practices: [
      {
        step: 1,
        title: "Chest Expansion & Breathing",
        text: "Place both hands softly over the center of your chest. Inhale deeply, imagining an expanding warm golden light filling the ribcage."
      },
      {
        step: 2,
        title: "Gentle Seed Mantra",
        text: "Softly vibrate the seed sound 'YAM' (यम्) 21 times, tuning into the vibration within the heart space."
      },
      {
        step: 3,
        title: "Universal Metta (Loving-Kindness)",
        text: "Radiate thoughts of well-being first to loved ones, then to neutral acquaintances, and finally to those with whom you have experienced conflict."
      }
    ],
    safetyGuidance: "Emotional release (tears, warmth, sudden relief) is common during heart-opening practices. Allow emotions to flow without judgment; if feeling overwhelmed, open your eyes and gently touch the floor with both palms.",
    sourceReferences: [
      { text: "Shat-Chakra-Nirupana", chapter: "Verses 22-27" },
      { text: "Bhagavad Gita", chapter: "Chapter 12 (Bhakti Yoga), Verses 13-20" }
    ],
    order: 5,
    status: "PUBLISHED",
  },

  // Module 6: Classical Kashmir Shaivism
  {
    title: "The Classical Philosophy of Kundalini in Kashmir Shaivism",
    slug: "kashmir-shaivism-philosophical-theory",
    subtitle: "Consciousness, Spanda, and Non-Dual Realization",
    level: "THEORY",
    chakraAssociation: "Crown (Sahasrara)",
    chakraElement: "Pure Consciousness",
    bijaMantra: "OM (ॐ)",
    historicalContext: "In the Trika school of Kashmir Shaivism (developed by sages Vasugupta, Somananda, and Abhinavagupta), Kundalini is understood not merely as an energetic serpent, but as Chit-Shakti — the dynamic, creative self-awareness of Shiva. Here, spiritual awakening is termed 'Pratyabhijna' (recognition): realizing that your fundamental nature is already identical with universal consciousness. This non-dual view replaces forceful asceticism with refined aesthetic contemplation, intellectual inquiry (Jnana), and quiet recognition of divine fullness (Purnata).",
    practices: [
      {
        step: 1,
        title: "Contemplation of the Witness (Sakshi)",
        text: "Observe thoughts, sounds, and physical sensations as waves arising within a vast, unblemished ocean of consciousness."
      },
      {
        step: 2,
        title: "The Gap Between Thoughts (Sandhi)",
        text: "Pay gentle attention to the subtle pause between one thought ending and the next thought beginning. In that gap resides the primordial stillness."
      },
      {
        step: 3,
        title: "Non-Dual Resting",
        text: "Rest for 10 minutes without making an effort to alter, control, or grasp any experience."
      }
    ],
    safetyGuidance: "Philosophical study requires emotional grounding and intellectual humility. Do not use non-dual philosophy to dismiss everyday ethical responsibilities or neglect physical health.",
    sourceReferences: [
      { text: "Shiva Sutras of Vasugupta", chapter: "Section 1 (Shambhavopaya)" },
      { text: "Spanda Karika", chapter: "Nisyanda 1, Karikas 1-4" },
      { text: "Tantraloka of Abhinavagupta", chapter: "Ahnika 3 & 4" }
    ],
    order: 6,
    status: "PUBLISHED",
  },
];

export async function seedRemediesAndKundalini() {
  console.log("Seeding verified Daily Remedies...");
  let remedyCount = 0;
  for (const r of INITIAL_REMEDIES) {
    await prisma.dailyRemedy.upsert({
      where: { slug: r.slug },
      update: { ...r },
      create: { ...r },
    });
    remedyCount++;
  }
  console.log(`✓ Seeded ${remedyCount} Daily Remedies`);

  console.log("Seeding verified Kundalini Educational Modules...");
  let moduleCount = 0;
  for (const m of INITIAL_KUNDALINI_MODULES) {
    await prisma.kundaliniModule.upsert({
      where: { slug: m.slug },
      update: { ...m },
      create: { ...m },
    });
    moduleCount++;
  }
  console.log(`✓ Seeded ${moduleCount} Kundalini Modules`);
}

// Run directly if invoked via CLI
if (process.argv[1]?.includes("seedRemediesAndKundalini.js")) {
  seedRemediesAndKundalini()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}

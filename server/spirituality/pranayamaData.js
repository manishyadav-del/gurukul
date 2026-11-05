/**
 * server/spirituality/pranayamaData.js
 *
 * Classical Pranayama & Subtle Anatomy Knowledge Data
 *
 * Lineage Sources:
 * - Hatha Yoga Pradipika (Swami Svatmarama, Ch. 2: Pranayama)
 * - Gheranda Samhita (Upadesha 5: Pranayama)
 * - Shiva Samhita (Patala 3 & 5)
 * - Shat-Chakra-Nirupana (Purnananda Swami, 1526 CE)
 * - Goraksha Paddhati & Goraksha Samhita
 *
 * Safety & Integrity Standards:
 * - Strictly non-medical: Subtle vital contemplation, not medical treatment.
 * - Gentle mindfulness: Zero forced Kumbhaka (extreme breath retention) or violent hyperventilation.
 * - Explicit stop cues for dizziness, shortness of breath, or discomfort.
 */

export const PRANAYAMA_PRACTICES = [
  {
    id: "anulom_vilom",
    nameEn: "Anulom Vilom (Gentle Alternate Nostril)",
    nameHi: "अनुलोम विलोम प्राणायाम",
    descriptionEn: "Smooth, unhurried alternate nostril breathing without breath retention, balancing autonomic tone.",
    descriptionHi: "बिना कुम्भक के बाएं और दाएं नथुने से सहज, समरस श्वसन जो मन को शांत करता है।",
    traditionalText: "Hatha Yoga Pradipika (Chapter 2, Verses 7–10)",
    ratio: "4:4 (Inhale 4s, Exhale 4s - Smooth & Balanced)",
    inhaleSec: 4,
    holdSec: 0,
    exhaleSec: 4,
    recommendedFor: "Anxiety, mental fatigue, evening settling, emotional balance, beginners.",
    instructionSteps: [
      "Sit in an upright posture with shoulders relaxed.",
      "Close your right nostril with the right thumb; inhale gently through the left nostril for 4 seconds.",
      "Close your left nostril with the ring finger; release the right thumb and exhale smoothly through the right nostril for 4 seconds.",
      "Inhale through the right nostril for 4 seconds.",
      "Close the right nostril and exhale through the left nostril for 4 seconds. This completes one cycle.",
    ],
    precautions: "Do not force or hurry the breath. Keep the facial muscles, jaw, and shoulders relaxed.",
  },
  {
    id: "nadi_shodhana",
    nameEn: "Nadi Shodhana (Subtle Channel Purification)",
    nameHi: "नाड़ी शोधन प्राणायाम",
    descriptionEn: "Classical alternate nostril flow cultivating purification of the 72,000 subtle channels (Nadis).",
    descriptionHi: "इड़ा एवं पिंगला नाड़ियों की शुद्धि तथा प्राण के सुषुम्ना में प्रवेश की शास्त्रीय तैयारी।",
    traditionalText: "Gheranda Samhita (5.38–45) & Hatha Yoga Pradipika (2.19–20)",
    ratio: "4:4 (Gentle 4s Inhale, 4s Exhale - Traditional non-retention variant for seekers)",
    inhaleSec: 4,
    holdSec: 0,
    exhaleSec: 4,
    recommendedFor: "Nervous agitation, clearing mental sluggishness, pre-meditation centering.",
    instructionSteps: [
      "Adopt Vishnu Mudra with your right hand (index and middle fingers folded to palm).",
      "Empty both lungs gently, then close the right nostril and inhale through the left for 4s.",
      "Exhale through the right nostril for 4s with tranquil awareness.",
      "Inhale through the right for 4s, then exhale through the left for 4s.",
      "Maintain a slow, silent, unbroken stream of breath without audible friction.",
    ],
    precautions: "Never practice with a blocked nose. If congested, breathe normally through both nostrils.",
  },
  {
    id: "bhramari",
    nameEn: "Bhramari (Humming Bee Resonance)",
    nameHi: "भ्रामरी प्राणायाम",
    descriptionEn: "Soft melodic humming on a slow exhalation, stimulating vagal parasympathetic relaxation.",
    descriptionHi: "भ्रमर (मधुमक्खी) के मधुर गुंजन समान ॐकार ध्वनि, मस्तिष्क की तंत्रिकाओं को शांत करती है।",
    traditionalText: "Hatha Yoga Pradipika (Chapter 2, Verse 68) & Gheranda Samhita (5.78)",
    ratio: "4:6 (Inhale 4s, Prolonged Humming Exhale 6s)",
    inhaleSec: 4,
    holdSec: 0,
    exhaleSec: 6,
    recommendedFor: "Overactive thinking, insomnia, headaches, anger, sensory overwhelm.",
    instructionSteps: [
      "Close your eyes and bring your thumbs softly to the ear cartilage (Shanmukhi Mudra or simple ear closure).",
      "Inhale deeply yet smoothly through the nose for 4 seconds.",
      "On the exhale, produce a smooth, steady, low-pitched humming sound ('Mmmmmm') like a gentle bee for 6 seconds.",
      "Feel the sound vibration massaging the crown, third eye, and cerebral cortex.",
    ],
    precautions: "Do not hum loudly or strain your throat. Keep the teeth slightly separated.",
  },
  {
    id: "ujjayi",
    nameEn: "Ujjayi (Ocean / Victorious Breath)",
    nameHi: "उज्जयी प्राणायाम",
    descriptionEn: "Gentle partial contraction of the glottis producing a soft, soothing ocean murmur in the throat.",
    descriptionHi: "कंठ में मन्द घर्षण द्वारा समुद्र की लहरों जैसी शांत ध्वनि उत्पन्न करने वाला प्राण-संयम।",
    traditionalText: "Hatha Yoga Pradipika (Chapter 2, Verses 51–53)",
    ratio: "4:4 (Inhale 4s, Exhale 4s with gentle throat resonance)",
    inhaleSec: 4,
    holdSec: 0,
    exhaleSec: 4,
    recommendedFor: "Sustaining meditative focus, internal heating, balancing sluggishness, steadying attention.",
    instructionSteps: [
      "Sit tall and breathe naturally through the nose.",
      "Slightly constrict the back of your throat (as if fogging a mirror with your mouth closed).",
      "Draw air smoothly across this gentle constriction on both inhale and exhale.",
      "Listen to the soft, rhythmic whisper of your breath, like waves lapping upon a distant shore.",
    ],
    precautions: "The sound should be soft enough only for you to hear. Never tighten your neck muscles aggressively.",
  },
  {
    id: "bhastrika",
    nameEn: "Gentle Bhastrika (Rhythmic Bellows Breath)",
    nameHi: "सहज भस्त्रिका प्राणायाम",
    descriptionEn: "Gentle, rhythmic diaphragmatic expansion and contraction activating metabolic and pranic vitality.",
    descriptionHi: "धौंकनी के समान उदर का समरस संकोच-प्रसार, प्राणिक ऊर्जा और जाठराग्नि का संतुलन।",
    traditionalText: "Gheranda Samhita (5.75–77) & Hatha Yoga Pradipika (2.59–67)",
    ratio: "2:2 (Gentle rhythmic 2s Inhale, 2s Exhale - Gentle Seeker variant)",
    inhaleSec: 2,
    holdSec: 0,
    exhaleSec: 2,
    recommendedFor: "Morning lethargy, mental fog, sluggish metabolism, cold constitution.",
    instructionSteps: [
      "Sit firmly with a straight spine and chest open.",
      "Inhale smoothly through both nostrils expanding the belly for 2 seconds.",
      "Exhale naturally contracting the belly for 2 seconds with equal force.",
      "Maintain a smooth, even, rhythmic cadence without jerky strain or breathless gasping.",
      "After 10 to 15 gentle cycles, rest in quiet, effortless stillness.",
    ],
    precautions: "Contraindicated for hypertension, heart ailments, vertigo, or pregnancy. Discontinue immediately if lightheaded.",
  },
  {
    id: "mindful_breathing",
    nameEn: "Sama Vritti (Equal Mindful Breathing)",
    nameHi: "समवृत्ति प्राणायाम (संतुलित श्वास)",
    descriptionEn: "Harmonious equality between the length of inhalation and exhalation, resetting baseline equilibrium.",
    descriptionHi: "पूरक और रेचक का पूर्ण साम्य, जो चित्त और स्नायुतंत्र को तत्काल संतुलित करता है।",
    traditionalText: "Patanjali Yoga Sutras (2.50: 'दीर्घसूक्ष्मः')",
    ratio: "5:5 (Smooth 5s Inhale, Smooth 5s Exhale)",
    inhaleSec: 5,
    holdSec: 0,
    exhaleSec: 5,
    recommendedFor: "General stress reduction, pre-study focus, evening unwind, daily mindfulness foundation.",
    instructionSteps: [
      "Relax your body and place your hands in your lap.",
      "Inhale slowly through the nose counting mentally: 1, 2, 3, 4, 5.",
      "Without pause or holding, exhale smoothly: 1, 2, 3, 4, 5.",
      "Experience the breath as an unbroken, continuous circle of awareness.",
    ],
    precautions: "If 5 seconds feels too long, reduce comfortably to 3 or 4 seconds. Never gasp for air.",
  },
  {
    id: "sheetali",
    nameEn: "Sheetali (Cooling Breath)",
    nameHi: "शीतली प्राणायाम",
    descriptionEn: "Cooling air intake through rolled tongue, calming Pitta heat and fiery agitation.",
    descriptionHi: "जिह्वा को नली बनाकर शीतल वायु का अंतर्ग्रहण, पित्त शमन।",
    traditionalText: "Hatha Yoga Pradipika (Chapter 2, Verses 57–58)",
    ratio: "4:4 (Inhale 4s, Gentle Exhale 4s)",
    inhaleSec: 4,
    holdSec: 0,
    exhaleSec: 4,
    recommendedFor: "Excess internal heat, summer irritability, acidity, mental burning.",
    instructionSteps: [
      "Roll the sides of your tongue into a small tube.",
      "Draw cool air in through this tube for 4 seconds.",
      "Withdraw the tongue, close your lips, and exhale slowly through both nostrils for 4 seconds.",
    ],
    precautions: "Do not practice in cold winter environments or if suffering from respiratory phlegm.",
  },
];

export const SUBTLE_NADIS = [
  {
    id: "ida",
    name: "Ida Nadi (इड़ा नाड़ी)",
    element: "Chandra (Moon / Lunar)",
    nostril: "Left Nostril (वाम नासिका)",
    nature: "Cooling, introspective, intuitive, creative, receptive, parasympathetic rest.",
    color: "Moonlight Silver / White (शुभ्र चन्द्रकान्त)",
    sanskritEtymology: "'Idā' signifies nourishment, comfort, and restorative lunar nectar (Soma).",
    originAndPath:
      "Originates at the left side of Muladhara Chakra, coils around the central spinal channel (Sushumna) intersecting at each chakra, and terminates at the left nostril and Ajna.",
    guidance: "Dominant during peaceful reflection, creative study, prayer, and restorative sleep.",
    scripturalReference: "Shiva Samhita (Patala 2, Verses 13–15): 'इड़ा चन्द्रमयी प्रोक्ता सुषुम्ना सूर्यगामिनी...'",
    chakraIntersections: "Muladhara ➔ Svadhisthana ➔ Manipura ➔ Anahata ➔ Vishuddha ➔ Ajna",
  },
  {
    id: "pingala",
    name: "Pingala Nadi (पिंगला नाड़ी)",
    element: "Surya (Sun / Solar)",
    nostril: "Right Nostril (दक्षिण नासिका)",
    nature: "Warming, dynamic, analytical, metabolic, sympathetic active engagement.",
    color: "Golden Red / Crimson (तप्त काञ्चन / अरुण)",
    sanskritEtymology: "'Piṅgalā' denotes tawny, fiery, solar brilliance and catalytic digestive fire.",
    originAndPath:
      "Originates at the right side of Muladhara Chakra, winds reciprocally upward around Sushumna, crossing Ida at each chakra, and terminates at the right nostril and Ajna.",
    guidance: "Dominant during vigorous physical action, digestion, debate, and executive leadership.",
    scripturalReference: "Hatha Yoga Pradipika (Chapter 2, Verse 10): 'चन्द्रेण पिङ्गलया वा उभयोः समता भवेत्...'",
    chakraIntersections: "Muladhara ➔ Svadhisthana ➔ Manipura ➔ Anahata ➔ Vishuddha ➔ Ajna",
  },
  {
    id: "sushumna",
    name: "Sushumna Nadi (सुषुम्ना नाड़ी)",
    element: "Agni / Brahman (Supreme Spiritual Flame)",
    nostril: "Equally open through both nostrils (सम प्राण)",
    nature: "Neutral, transcendent, non-dual contemplative stillness, seat of Kundalini ascension.",
    color: "Luminous Lightning / Radiant Gold (विद्युद्वत् तेजोमयी)",
    sanskritEtymology: "'Su-ṣumṇā' denotes supreme graciousness, harmonious union, and divine tranquility.",
    originAndPath:
      "Extends from the base of the spine (Muladhara) directly through the interior core of the spinal column (Merudanda) to the fontanelle of Sahasrara (Brahmarandhra). Contains the inner Vajrini and Chitrini nadis.",
    guidance: "Opens during deep meditation, twilight (Sandhya), and moments of selfless absorption.",
    scripturalReference: "Shat-Chakra-Nirupana (Verse 1): 'मेरुर्बाह्ये सरति शशिसूर्यौ... मध्यगा सा सुषुम्ना...'",
    chakraIntersections: "Encompasses all Seven Chakras along the vertical cosmic axis of consciousness.",
  },
];

export const THREE_GRANTHIS = [
  {
    id: "brahma_granthi",
    name: "Brahma Granthi (ब्रह्म ग्रन्थि)",
    location: "Muladhara / Svadhisthana region (आधार मण्डल)",
    significance: "Knot of Physical Survival & Material Identification",
    sanskritMeaning: "'Brahma' signifies creation and the physical organism; 'Granthi' means subtle knot.",
    description:
      "The primary spiritual knot tethering consciousness to biological self-preservation instincts, physical security fears, and possessive attachment to material comfort.",
    traditionsComparison: {
      shatChakraNirupana: "Located within the pericarp of Muladhara around the Svayambhu Linga.",
      gorakshaPaddhati: "Located between Muladhara and Svadhisthana; pierced by Mula Bandha and ethical grounding.",
      hathaYogaPradipika: "Piercing produces joyful lightness and release of existential trembling (4.70–71).",
    },
    unravelingPath:
      "Rooted in ethical grounding (Yama), selfless generosity (Dana), conscious non-hoarding (Aparigraha), and calm realization that life is divinely sustained.",
  },
  {
    id: "vishnu_granthi",
    name: "Vishnu Granthi (विष्णु ग्रन्थि)",
    location: "Anahata Chakra (हृदय प्रदेश)",
    significance: "Knot of Emotional Attachment & Egoic Sentimentalism",
    sanskritMeaning: "'Vishnu' governs preservation, relationships, and sentimental affection.",
    description:
      "The intermediate spiritual knot tethering consciousness to interpersonal emotional codependency, pride in spiritual virtue, moral self-righteousness, and yearning for social praise.",
    traditionsComparison: {
      shatChakraNirupana: "Located at Anahata; pierced when universal compassion transcends personal emotional preference.",
      gorakshaPaddhati: "Associated with the sound of the divine conch (Shankha Nada) and deep inner rejoicing.",
      hathaYogaPradipika: "Piercing brings effortless devotion, radiant goodwill, and freedom from grief (4.72–73).",
    },
    unravelingPath:
      "Cultivated through universal compassion (Karuna), selfless service (Nishkama Seva), forgiveness, and Bhakti surrendering emotional control.",
  },
  {
    id: "rudra_granthi",
    name: "Rudra Granthi (रुद्र ग्रन्थि)",
    location: "Ajna Chakra / Bhrumadhya (भ्रूमध्य / आज्ञा)",
    significance: "Knot of Intellectual Dogmatism & Spiritual Pride",
    sanskritMeaning: "'Rudra' signifies dissolution and the ultimate threshold of the individual ego.",
    description:
      "The supreme spiritual knot tethering consciousness to philosophical vanity, intellectual sectarian sectarianism, pride in subtle psychic experiences, and subtle duality between seeker and sought.",
    traditionsComparison: {
      shatChakraNirupana: "Located within Ajna around the Itara Linga; dissolved when the mind merges into the void.",
      gorakshaPaddhati: "Piercing unveils the cosmic flute sound (Venu Nada) and non-dual Sahaja Samadhi.",
      hathaYogaPradipika: "Piercing culminates in the nectar-flow of immortality and cessation of all thought-forms (4.74–76).",
    },
    unravelingPath:
      "Dissolved through humble discernment (Viveka), surrender of spiritual conceit, quiet witness consciousness (Sakshi Bhava), and non-dual absorption.",
  },
];

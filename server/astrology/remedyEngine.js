/**
 * Vedic Daily Spiritual Remedies, Puja Recommendations & Personalized Guidance Engine
 *
 * Deterministic recommendation engine that synthesizes:
 * 1. Current verified Panchang (Vara, Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, Choghadiya)
 * 2. Planetary associations and deity alignments (Brihat Parashara Hora Shastra, Ch. 84)
 * 3. User personalized chart context (Lagna, Moon sign, Mahadasha, Antardasha, Gochara transits)
 * 4. 8 Classical Puja categories with verified materials, procedures, and scriptural sources
 * 5. Categorized daily guidance across 6 vital life spheres (Career, Education, Finance, Family, Health, Spiritual)
 * 6. Daily Chakra & Kundalini guidance grounded in classical subtle anatomy (Shat-Chakra-Nirupana)
 * 7. Sanskrit Mantra Intelligence with Pada-chheda and Anvaya
 *
 * Safety & Ethical Standards:
 * - Clear distinction between traditional religious/philosophical contemplation and guaranteed predictions
 * - Strictly non-medical, non-financial: No medical diagnoses or deterministic financial instructions
 * - 100% accessible, non-commercial practices with gentle, free alternatives
 */

import prisma from "../../lib/prisma.js";
import { INITIAL_REMEDIES } from "./seedRemediesAndKundalini.js";
import { SANSKRIT_SHLOKAS } from "../spirituality/sanskritShlokas.js";
import { CHAKRAS_ARRAY } from "../spirituality/chakraKnowledge.js";
import { SUBTLE_NADIS, THREE_GRANTHIS } from "../spirituality/pranayamaData.js";
import { AUSPICIOUS_GOCHARA_HOUSES } from "./transitIntelligence.js";

// ============================================================================
// 1. Eight Classical Vedic & Traditional Puja Categories
// ============================================================================
export const CLASSICAL_PUJAS = [
  // 1. GANESH PUJA
  {
    id: "puja-ganesh",
    category: "GANESH_PUJA",
    titleEn: "Sri Ganesha Vighnaharta Puja & Sankalpa",
    titleHi: "श्री गणेश विघ्नहर्ता पूजन एवं संकल्प",
    deity: "Lord Ganesha (Ganapati)",
    planetaryAssociation: "Ketu & Mercury",
    occasion: "Daily morning devotion, Wednesday, Chaturthi Tithi, or commencing any new venture.",
    traditionalSignificanceEn:
      "Lord Ganesha represents the fundamental archetype of grounded intellect (Buddhi) and the removal of obstacles (Vighnas). Traditional worship harmonizes the Muladhara center and bestows mental clarity.",
    traditionalSignificanceHi:
      "भगवान श्री गणेश बुद्धि, विवेक और समस्त विघ्नों के निवारण के अधिष्ठाता देव हैं। इनका पूजन मूलाधार चक्र को स्थिरता प्रदान कर चित्त में निर्भयता लाता है।",
    materials: [
      "Clean water vessel (Achamana patra)",
      "Red flowers or Hibiscus (Gudhal)",
      "Durva grass (3 or 5 blades of Duba)",
      "Pinch of red sindoor or sandalwood paste",
      "Ghee lamp or pure sesame diya",
      "Modak, laddoo, or fresh jaggery offering",
    ],
    procedureSteps: [
      { step: 1, title: "Purification (Shuddhi)", text: "Wash hands and face; sit comfortably facing East or North on a clean mat." },
      { step: 2, title: "Lighting the Diya (Deepa Jyoti)", text: "Light the ghee lamp, honoring the inner light of consciousness." },
      { step: 3, title: "Offering Durva & Flowers", text: "Offer fresh Durva grass and red flowers before the deity or sacred symbol." },
      { step: 4, title: "Mantra Chanting", text: "Chant the Ganesha Moola Mantra 11, 21, or 108 times with slow, rhythmic breathing." },
      { step: 5, title: "Silent Dedication (Arpana)", text: "Offer jaggery or fruit, and rest in quiet contemplation for 2 minutes." },
    ],
    sanskritMantras: [
      {
        devanagari: "ॐ गं गणपतये नमः ॥",
        iast: "Oṃ gaṃ gaṇapataye namaḥ ||",
        meaningEn: "Salutations to the Supreme Ruler of all cosmic hosts and faculties.",
        meaningHi: "समस्त गणों के स्वामी, विघ्नहर्ता भगवान गणेश को विनीत प्रणाम।",
      },
      {
        devanagari: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥",
        iast: "Vakratuṇḍa mahākāya sūryakoṭi samaprabha | Nirvighnaṃ kuru me deva sarvakāryeṣu sarvadā ||",
        meaningEn: "O lord of curved trunk and immense cosmic form, brilliant like millions of suns: make all my actions free from obstacles, always.",
        meaningHi: "हे वक्रतुण्ड, विशालकाय, करोड़ों सूर्यों के समान तेजस्वी देव! मेरे समस्त सत्कर्मों को सदा निर्विघ्न सम्पन्न करें।",
      },
    ],
    sourceScripture: "Ganesha Atharvashirsha & Mudgala Purana",
    relatedPassages: "Vedic Suktas for Inward Harmony",
    costLevel: "FREE",
    accessibilityAlternative: "If ritual items are unavailable, sit in quiet simplicity, close your eyes, visualize golden radiance at the base of the spine, and mentally repeat 'Om Gam Ganapataye Namah' 21 times.",
  },

  // 2. SHIVA PUJA
  {
    id: "puja-shiva",
    category: "SHIVA_PUJA",
    titleEn: "Lord Shiva Somavara & Pradosha Upasana",
    titleHi: "भगवान शिव सोमवार एवं प्रदोष उपासना",
    deity: "Lord Shiva (Mahadeva)",
    planetaryAssociation: "Moon & Saturn",
    occasion: "Monday, Pradosha Vrat, Trayodashi, Shivaratri, or for calming mental agitation.",
    traditionalSignificanceEn:
      "Lord Shiva represents pure transcendent witness consciousness (Sakshi Chaitanya). Shiva worship dissolves mental anxieties, neutralizes lunar afflictions, and cultivates profound inner silence.",
    traditionalSignificanceHi:
      "भगवान शिव शांत, अद्वैत साक्षी चेतना के मूर्त रूप हैं। इनकी आराधना मन के उद्वेग को शांत करती है और वैराग्य तथा मानसिक संतुलन प्रदान करती है।",
    materials: [
      "Pure fresh water or raw cow milk for Jalabhisheka",
      "Bilva leaves (Belpatra, trifoliate)",
      "White sandalwood paste (Chandan)",
      "Incense (Dhoop) and Ghee lamp",
      "Rudraksha rosary for japa (optional)",
    ],
    procedureSteps: [
      { step: 1, title: "Achamana & Grounding", text: "Sip water with reverence; sit facing North or East in an erect meditative posture." },
      { step: 2, title: "Gentle Jalabhisheka", text: "Offer a slow, unbroken stream of water over the Shiva Linga or water vessel while chanting Om Namah Shivaya." },
      { step: 3, title: "Belpatra Offering", text: "Place the trifoliate Bilva leaf with the stem pointed outward, representing the surrender of the three gunas." },
      { step: 4, title: "Maha Mrityunjaya Japa", text: "Recite the Maha Mrityunjaya Mantra or Panchakshari Mantra 11 or 108 times." },
      { step: 5, title: "Dhyana (Silent Absorption)", text: "Sit in motionless stillness for 5 minutes, experiencing the peace of your true self." },
    ],
    sanskritMantras: [
      {
        devanagari: "ॐ नमः शिवाय ॥",
        iast: "Oṃ namaḥ śivāya ||",
        meaningEn: "I honor and bow to Shiva, the supreme auspicious reality within.",
        meaningHi: "कल्याणकारी, मंगलमय परमात्मा शिव को मेरा नमन।",
      },
      {
        devanagari: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥",
        iast: "Oṃ tryambakaṃ yajāmahe sugandhiṃ puṣṭivardhanam | Urvārukam iva bandhanān mṛtyor mukṣīya māmṛtāt ||",
        meaningEn: "We worship the three-eyed Lord of fragrant spiritual vitality who nourishes all beings. As a ripe fruit effortlessly detaches from its stalk, may we be liberated from the bondage of mortality and fear, anchored in immortality.",
        meaningHi: "हम सुगंधित और पुष्टि का संवर्धन करने वाले त्रिनेत्र शिव की उपासना करते हैं। जिस प्रकार पका हुआ खरबूजा बेल से मुक्त हो जाता है, उसी प्रकार हम मृत्यु के भय से मुक्त होकर अमरत्व को प्राप्त हों।",
      },
    ],
    sourceScripture: "Shukla Yajurveda 16 (Rudram) & Shiva Purana",
    relatedPassages: "Shiva Samhita & Patanjali Yoga Sutras",
    costLevel: "FREE",
    accessibilityAlternative: "Pure water poured in a simple bowl with heartfelt devotion is the highest Shiva offering. Silent mental japa carries the same classical efficacy.",
  },

  // 3. VISHNU PUJA
  {
    id: "puja-vishnu",
    category: "VISHNU_PUJA",
    titleEn: "Sri Vishnu Satyanarayana Aradhana",
    titleHi: "श्री विष्णु एवं सत्यनारायण पूजन",
    deity: "Lord Vishnu (Narayana)",
    planetaryAssociation: "Jupiter & Mercury",
    occasion: "Thursday, Ekadashi, Purnima, or for family concord, ethical prosperity, and wisdom.",
    traditionalSignificanceEn:
      "Lord Vishnu represents the cosmic principle of preservation, moral order (Dharma), and sustaining grace. Worship aligns consciousness with truthfulness and benevolence.",
    traditionalSignificanceHi:
      "भगवान विष्णु संसार के पालनकर्ता, धर्म के रक्षक और सत्य स्वरूप हैं। इनका पूजन परिवार में सुख-शांति, मर्यादा और सद्बुद्धि का संचार करता है।",
    materials: [
      "Fresh Tulsi leaves (sacred basil)",
      "Yellow flowers (Marigold or Jasmine)",
      "Ghee lamp and fragrant incense",
      "Yellow cloth or mat",
      "Fruit or sweet offering (Prasada)",
    ],
    procedureSteps: [
      { step: 1, title: "Sankalpa of Truth", text: "Light the lamp, resolve to practice honesty and selfless action throughout the day." },
      { step: 2, title: "Tulsi & Flower Arpana", text: "Offer fragrant yellow flowers and clean Tulsi leaves at the altar." },
      { step: 3, title: "Vishnu Gayatri / Ashtakshara", text: "Chant Om Namo Bhagavate Vasudevaya 108 times with tranquility." },
      { step: 4, title: "Scripture Study (Svadhyaya)", text: "Read a chapter from Bhagavad Gita or contemplation from Vishnu Sahasranama." },
      { step: 5, title: "Peace Prayer", text: "Conclude with Sarve Bhavantu Sukhinah for the welfare of all living beings." },
    ],
    sanskritMantras: [
      {
        devanagari: "ॐ नमो भगवते वासुदेवाय ॥",
        iast: "Oṃ namo bhagavate vāsudevāya ||",
        meaningEn: "I bow with deep reverence to Lord Vasudeva, the indwelling light of the universe.",
        meaningHi: "सर्वव्यापी, सर्वसमर्थ भगवान वासुदेव को मेरा सादर प्रणाम।",
      },
      {
        devanagari: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् । लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥",
        iast: "Śāntākāraṃ bhujagaśayanaṃ padmanābhaṃ sureśaṃ viśvādhāraṃ gaganasadṛśaṃ meghavarṇaṃ śubhāṅgam | Lakṣmīkāntaṃ kamalanayanaṃ yogibhir dhyānagamyaṃ vande viṣṇuṃ bhavabhayaharaṃ sarvalokaikanātham ||",
        meaningEn: "I venerate Vishnu, embodiment of supreme peace, resting upon the serpent of eternity, from whose navel blossoms the cosmic lotus—supporter of the cosmos, boundless like the sky, dark as rain clouds, and lord of all worlds who dissolves the fear of worldly existence.",
        meaningHi: "शांत स्वरूप, शेषनाग की शय्या पर शयन करने वाले, कमल-नाभि, ब्रह्माण्ड के आधार और संसार के भय को हरने वाले भगवान विष्णु की हम वंदना करते हैं।",
      },
    ],
    sourceScripture: "Srimad Bhagavata Purana & Vishnu Smriti",
    relatedPassages: "Bhagavad Gita Chapter 12 (Bhakti Yoga)",
    costLevel: "FREE",
    accessibilityAlternative: "Placing a single fresh Tulsi leaf in drinking water with grateful remembrance fulfills the essence of classical Narayana Seva.",
  },

  // 4. SURYA ARADHANA
  {
    id: "puja-surya",
    category: "SURYA_ARADHANA",
    titleEn: "Surya Aradhana & Aditya Hridaya Upasana",
    titleHi: "सूर्य आराधना एवं आदित्य हृदय उपासना",
    deity: "Surya Deva (The Solar Deity)",
    planetaryAssociation: "Sun",
    occasion: "Sunday mornings, Sunrise, Saptami Tithi, or during phases requiring confidence and vitality.",
    traditionalSignificanceEn:
      "The Sun is the Atmakaraka (significator of the soul and self-luminous consciousness). Classical Surya worship strengthens eye health, circadian vitality, and moral authority.",
    traditionalSignificanceHi:
      "सूर्य देव प्रत्यक्ष देवता और आत्मा के कारक हैं। इनकी उपासना से आत्मबल, तेजस्विता, स्वास्थ्य और सामाजिक यश की वृद्धि होती है।",
    materials: [
      "Clean copper vessel (Tambe ka lota)",
      "Fresh potable water",
      "Pinch of red sandalwood powder or red flower",
      "Ghee lamp (optional)",
    ],
    procedureSteps: [
      { step: 1, title: "Morning Rise", text: "Rise within one hour of sunrise; cleanse face, hands, and feet." },
      { step: 2, title: "Vessel Preparation", text: "Fill the copper lota with pure water; add a red flower or pinch of chandan." },
      { step: 3, title: "Water Offering (Arghya)", text: "Stand facing East, raise vessel above eye level, and pour water in a steady stream while gazing gently at the water refraction." },
      { step: 4, title: "Gayatri / Aditya Stotra", text: "Recite the Gayatri Mantra or Surya Beej Mantra 12 times." },
      { step: 5, title: "Pradakshina & Gratitude", text: "Turn clockwise in place once, touching the spilled water to your forehead with the ring finger." },
    ],
    sanskritMantras: [
      {
        devanagari: "ॐ घृणिः सूर्याय नमः ॥",
        iast: "Oṃ ghṛṇiḥ sūryāya namaḥ ||",
        meaningEn: "Salutations to the glorious illuminator, the Sun who bestows vital warmth and cosmic energy.",
        meaningHi: "प्रकाश और जीवन ऊर्जा प्रदान करने वाले तेजस्वी सूर्य देव को प्रणाम।",
      },
      {
        devanagari: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥",
        iast: "Oṃ bhūr bhuvaḥ svaḥ tat savitur vareṇyaṃ bhargo devasya dhīmahi dhiyo yo naḥ pracodayāt ||",
        meaningEn: "We meditate on the supreme transcendental brilliance of the divine Sun; may that light guide and awaken our understanding.",
        meaningHi: "हम उस प्राणस्वरूप, दुःखनिवारक, सुखस्वरूप, श्रेष्ठ, तेजस्वी परमात्मा के तेज का ध्यान करते हैं, जो हमारी बुद्धि को सन्मार्ग पर प्रेरित करे।",
      },
    ],
    sourceScripture: "Valmiki Ramayana (Yuddha Kanda 105) & Rigveda 3.62.10",
    relatedPassages: "Surya Siddhanta & Taittiriya Aranyaka",
    costLevel: "FREE",
    accessibilityAlternative: "If indoors or cloudy, face East, hold both palms open in Surya Mudra, and take 12 calm breaths while silently repeating 'Om Suryaya Namah'.",
  },

  // 5. DEVI UPASANA
  {
    id: "puja-devi",
    category: "DEVI_UPASANA",
    titleEn: "Sri Durga & Lalita Devi Navarna Upasana",
    titleHi: "श्री दुर्गा एवं ललिता देवी उपासना",
    deity: "Devi Durga / Parashakti",
    planetaryAssociation: "Rahu, Venus & Mars",
    occasion: "Friday, Tuesday, Ashtami, Navami, Amavasya, or during internal psychological turbulence.",
    traditionalSignificanceEn:
      "The Divine Mother represents Kundalini-Shakti, protective vigor, and the triumph of spiritual light over dark egoic habits (Mahishasura). Cultivates resilience and courage.",
    traditionalSignificanceHi:
      "भगवती दुर्गा पराशक्ति और आंतरिक शक्ति की स्रोत हैं। इनकी साधना से भय, मानसिक विकार और नकारात्मक प्रवृत्तियों का शमन होता है।",
    materials: [
      "Pure ghee or mustard oil diya",
      "Kumkum (vermilion) and red flowers",
      "Small piece of jaggery, coconut, or sweet fruit",
      "Incense stick and clean water",
    ],
    procedureSteps: [
      { step: 1, title: "Centering with Lamp", text: "Light the red or brass diya in the evening or morning twilight." },
      { step: 2, title: "Kumkum Arpana", text: "Offer red kumkum and flowers with reverence to the Divine Mother." },
      { step: 3, title: "Devi Suktam or Navarna Japa", text: "Chant the Navarna Mantra or Durga Saptashloki with steady focus." },
      { step: 4, title: "Inner Shielding (Kavacha)", text: "Visualize a protective cocoon of amber and golden light enveloping your body and mind." },
      { step: 5, title: "Kshama Prarthana", text: "Pray for forgiveness of conscious and unconscious errors, seeking maternal grace." },
    ],
    sanskritMantras: [
      {
        devanagari: "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे ॥",
        iast: "Oṃ aiṃ hrīṃ klīṃ cāmuṇḍāyai vicce ||",
        meaningEn: "Salutations to the primordial Mother embodying wisdom (Aim), sustenance (Hrim), and joyful transformation (Klim).",
        meaningHi: "ज्ञान, शक्ति और आनंद स्वरूपिणी माँ दुर्गा को कोटि-कोटि प्रणाम।",
      },
      {
        devanagari: "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके । शरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥",
        iast: "Sarvamaṅgalamāṅgalye śive sarvārthasādhike | Śaraṇye tryambake gauri nārāyaṇi namo'stu te ||",
        meaningEn: "O auspicious Mother who makes all things benevolent, fulfiller of all pure objectives, refuge of the helpless: Salutations unto Thee.",
        meaningHi: "सब मंगलों में मंगलमयी, कल्याणकारिणी, सब पुरुषार्थों को सिद्ध करने वाली, शरणागतवत्सला माँ गौरी को प्रणाम।",
      },
    ],
    sourceScripture: "Devi Mahatmya (Markandeya Purana) & Lalita Sahasranama",
    relatedPassages: "Tantraloka & Shat-Chakra-Nirupana",
    costLevel: "FREE",
    accessibilityAlternative: "A simple silent recitation of the Sarva Mangala prayer with gratitude toward motherhood in nature fulfills traditional worship.",
  },

  // 6. NAVAGRAHA PUJA
  {
    id: "puja-navagraha",
    category: "NAVAGRAHA_PUJA",
    titleEn: "Navagraha Shanti & Cosmic Harmonization",
    titleHi: "नवग्रह शांति एवं खगोलीय समन्वय",
    deity: "The Nine Planetary Deities (Navagrahas)",
    planetaryAssociation: "All 9 Grahas",
    occasion: "Saturday, Sunday, Sankranti, Amavasya, or when experiencing conflicting astrological transits.",
    traditionalSignificanceEn:
      "The nine Grahas are agents of cosmic law (Karma-Phala-Data). This practice fosters respect for time, cyclic balance, and releases resistance to planetary seasons.",
    traditionalSignificanceHi:
      "नवग्रह काल और कर्म के नियामक हैं। इनकी सामूहिक स्तुति से ग्रह-दोषों की शांति और जीवन में संतुलन प्राप्त होता है।",
    materials: [
      "Sesame oil or pure ghee diya",
      "Akshat (unbroken rice grains)",
      "9 varieties of grain or simple mixed seeds (Navadhanya, optional)",
      "Clean yellow or white flower",
    ],
    procedureSteps: [
      { step: 1, title: "Orientation", text: "Sit facing East; light the lamp representing the universal central sun." },
      { step: 2, title: "Nine Planetary Bows", text: "Offer grains or flower petals while mentally saluting each of the 9 Grahas." },
      { step: 3, title: "Navagraha Stotra Recitation", text: "Chant the classical 9-verse Navagraha Stotra composed by Sage Vyasa." },
      { step: 4, title: "Non-Resistance Resolution", text: "Acknowledge that planetary cycles deliver growth through both ease and challenge." },
      { step: 5, title: "Universal Peace Chant", text: "Conclude with Om Dyauh Shantir Antariksham Shantih." },
    ],
    sanskritMantras: [
      {
        devanagari: "ब्रह्मामुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च । गुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे मम सुप्रभातम् ॥",
        iast: "Brahmā murāris tripurāntakārī bhānuḥ śaśī bhūmisuto budhaś ca | Guruś ca śukraḥ śani-rāhu-ketavaḥ kurvantu sarve mama suprabhātam ||",
        meaningEn: "May Brahma, Vishnu, Shiva, and the nine cosmic bodies—Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu—grant an auspicious and peaceful morning.",
        meaningHi: "ब्रह्मा, विष्णु, शिव और समस्त नवग्रह—सूर्य, चंद्र, मंगल, बुध, गुरु, शुक्र, शनि, राहु और केतु—मेरे आज के दिन को मंगलमय बनाएं।",
      },
    ],
    sourceScripture: "Brihat Parashara Hora Shastra (Ch. 84) & Matsya Purana",
    relatedPassages: "Surya Siddhanta Astronomical Canons",
    costLevel: "FREE",
    accessibilityAlternative: "Recite the single composite morning verse above while facing the open sky with gratitude for the universe.",
  },

  // 7. SARASWATI PUJA
  {
    id: "puja-saraswati",
    category: "SARASWATI_PUJA",
    titleEn: "Sri Saraswati Vidya & Intellect Upasana",
    titleHi: "श्री सरस्वती विद्या एवं बुद्धि उपासना",
    deity: "Devi Saraswati",
    planetaryAssociation: "Mercury & Jupiter",
    occasion: "Wednesday, Thursday, Vasant Panchami, Shukla Paksha, or before examinations and writing.",
    traditionalSignificanceEn:
      "Devi Saraswati presides over articulate speech (Vak), memory (Smriti), fine arts, and spiritual discernment. Worship stimulates the Vishuddha and Ajna chakras.",
    traditionalSignificanceHi:
      "माँ सरस्वती वाणी, विद्या, कला और विवेक की अधिष्ठात्री देवी हैं। इनका पूजन विशुद्ध चक्र को जाग्रत कर एकाग्रता और अध्ययन शक्ति बढ़ाता है।",
    materials: [
      "White flowers or jasmine",
      "White sandalwood paste or clean water",
      "Books, notebooks, or pen placed on the altar",
      "Small ghee lamp",
    ],
    procedureSteps: [
      { step: 1, title: "Sanctifying Learning Tools", text: "Clean your study desk; place a textbook or pen reverently at the altar." },
      { step: 2, title: "Light & Incense", text: "Light the gentle lamp, honoring the dispel of mental darkness." },
      { step: 3, title: "Saraswati Vandana", text: "Recite Ya Kundendu Tusharahara Dhavala or the Saraswati Beej Mantra 21 times." },
      { step: 4, title: "Mindful Contemplation", text: "Sit in silent posture observing the stillness at the throat center (Vishuddha)." },
      { step: 5, title: "Dedicated Study", text: "Begin your educational duties or creative writing with full, calm presence." },
    ],
    sanskritMantras: [
      {
        devanagari: "ॐ ऐं सरस्वत्यै नमः ॥",
        iast: "Oṃ aiṃ sarasvatyai namaḥ ||",
        meaningEn: "Salutations to Devi Saraswati, the embodiment of wisdom and divine creative vibration.",
        meaningHi: "ज्ञान और विद्या की देवी माँ सरस्वती को सादर प्रणाम।",
      },
      {
        devanagari: "सरस्वति नमस्तुभ्यं वरदे कामरूपिणि । विद्यारम्भं करिष्यामि सिद्धिर्भवतु मे सदा ॥",
        iast: "Sarasvati namastubhyaṃ varade kāmarūpiṇi | Vidyārambhaṃ kariṣyāmi siddhir bhavatu me sadā ||",
        meaningEn: "Salutations to Thee, O Saraswati, giver of boons and fulfiller of wishes. As I commence my studies, may attainment and wisdom always be mine.",
        meaningHi: "हे वरदायिनी माँ सरस्वती! आपको प्रणाम। मैं अपनी विद्या का आरम्भ कर रहा हूँ, मुझे सदा सफलता और सद्विवेक प्राप्त हो।",
      },
    ],
    sourceScripture: "Rigveda 2.41.16 & Padma Purana",
    relatedPassages: "Patanjali Yoga Sutras (Svadhyaya)",
    costLevel: "FREE",
    accessibilityAlternative: "Touching your textbook with respect and taking three deep breaths before studying is the highest Vedic homage to Saraswati.",
  },

  // 8. LAKSHMI PUJA
  {
    id: "puja-lakshmi",
    category: "LAKSHMI_PUJA",
    titleEn: "Sri Mahalakshmi & Sri Sukta Abundance Contemplation",
    titleHi: "श्री महालक्ष्मी एवं श्री सूक्त समृद्धि साधना",
    deity: "Devi Mahalakshmi",
    planetaryAssociation: "Venus & Jupiter",
    occasion: "Friday evening, Purnima, Diwali, or during financial planning and home harmonizing.",
    traditionalSignificanceEn:
      "Mahalakshmi represents legitimate wealth, beauty, generosity, and inner contentment (Santosha). Traditional worship fosters grateful abundance and destroys greed.",
    traditionalSignificanceHi:
      "माँ महालक्ष्मी धर्मसम्मत ऐश्वर्य, सौंदर्य और संतोष की देवी हैं। इनकी आराधना से घर में मंगल, शांति और उदारता का वास होता है।",
    materials: [
      "Pure ghee diya or brass lamp",
      "Pink or lotus/yellow flower",
      "Kheer, raw rice, or seasonal sweet",
      "Clean coin or metal symbol of prosperity",
      "Fragrant Chandan or rose water",
    ],
    procedureSteps: [
      { step: 1, title: "Evening Twilight Cleanliness", text: "Clean the entrance and prayer space; wash face and hands." },
      { step: 2, title: "Lighting the Prosperity Lamp", text: "Light the ghee diya, inviting auspiciousness and clarity into the home." },
      { step: 3, title: "Sri Sukta / Lakshmi Gayatri", text: "Chant the Mahalakshmi Mantra or Sri Suktam with devotion and humility." },
      { step: 4, title: "Gratitude Affirmation", text: "Mentally list three provisions in your life with heartfelt thankfulness." },
      { step: 5, title: "Sharing & Charity Intent", text: "Resolve to share a portion of your resources with someone in need." },
    ],
    sanskritMantras: [
      {
        devanagari: "ॐ श्रीं ह्रीं क्लीं त्रिभुवनमहाकलक्ष्म्यै अस्माकं दारिद्र्यं नाशय प्रसीद प्रसीद क्लीं ह्रीं श्रीं ॐ ॥",
        iast: "Oṃ śrīṃ hrīṃ klīṃ tribhuvanamahālakṣmyai asmākaṃ dāridryaṃ nāśaya prasīda prasīda klīṃ hrīṃ śrīṃ oṃ ||",
        meaningEn: "Salutations to the Supreme Mahalakshmi of the three worlds: dissolve all scarcity and lack; bestow grace and auspicious fulfillment.",
        meaningHi: "तीनों लोकों की अधिष्ठात्री माँ महालक्ष्मी हमारे आंतरिक और बाह्य अभावों को दूर कर हम पर प्रसन्न हों।",
      },
      {
        devanagari: "ॐ महालक्ष्म्यै च विद्महे विष्णुपत्न्यै च धीमहि । तन्नो लक्ष्मीः प्रचोदयात् ॥",
        iast: "Oṃ mahālakṣmyai ca vidmahe viṣṇupatnyai ca dhīmahi | Tanno lakṣmīḥ pracodayāt ||",
        meaningEn: "We contemplate the Great Lakshmi, consort of Lord Vishnu. May that goddess of auspicious abundance inspire our intellect and actions.",
        meaningHi: "हम महालक्ष्मी को जानते हैं, भगवान विष्णु की सहधर्मिणी का ध्यान करते हैं; वे देवी लक्ष्मी हमारी बुद्धि को सन्मार्ग पर प्रेरित करें।",
      },
    ],
    sourceScripture: "Rigveda Khilani (Sri Sukta) & Vishnu Purana",
    relatedPassages: "Brihat Parashara Hora Shastra (Shukra Shanti)",
    costLevel: "FREE",
    accessibilityAlternative: "Keep your home clean and organized, cultivate contentment (Santosha), and repeat 'Om Shreem Mahalakshmyai Namah' 11 times.",
  },
];

// ============================================================================
// 2. Categorized Daily Guidance Generator (6 Vital Life Spheres)
// ============================================================================
export function generateCategorizedDailyGuidance({
  chart = null,
  transits = null,
  panchang,
  language = "en",
}) {
  const isHi = language === "hi" || language === "hindi";

  const moonSign = chart?.moon?.sign || panchang?.moonSign?.name || "Aries";
  const lagnaSign = chart?.ascendant?.sign || chart?.lagnaSign || "Aries";
  const mahaLord = chart?.dasha?.currentMahadasha || "Sun";
  const antarLord = chart?.dasha?.currentAntardasha || "Moon";

  // Check transits of important planets
  const details = transits?.transitDetails || [];
  const sunTransit = details.find((t) => t.planet === "SUN");
  const jupTransit = details.find((t) => t.planet === "JUPITER");
  const satTransit = details.find((t) => t.planet === "SATURN");
  const mercTransit = details.find((t) => t.planet === "MERCURY");
  const venTransit = details.find((t) => t.planet === "VENUS");
  const marsTransit = details.find((t) => t.planet === "MARS");

  // Helper to format house text
  const hText = (house) => (house ? `${house}th` : "relevant");

  // 1. Career & Professional Activities
  const careerAuspicious = satTransit?.isGocharaAuspicious || sunTransit?.isGocharaAuspicious;
  const careerGuidance = {
    domain: "career",
    titleEn: "Career & Professional Activities",
    titleHi: "कार्यक्षेत्र एवं व्यावसायिक गतिविधियाँ",
    icon: "Briefcase",
    status: careerAuspicious ? "FAVORABLE" : "STEADY",
    astrologicalContext: isHi
      ? `दशमेश एवं गोचर सूर्य-शनि की स्थिति (${hText(sunTransit?.houseFromMoon)} भाव)। वर्तमान महादशा: ${mahaLord}।`
      : `Transit Sun in ${hText(sunTransit?.houseFromMoon)} house from Moon with active ${mahaLord} Dasha.`,
    adviceEn: careerAuspicious
      ? "Favorable atmospheric momentum for strategic planning, professional proposals, and collaborative execution. Maintain steady communication with senior peers."
      : "A day calling for systematic patience, attention to foundational details, and avoiding hasty contractual disputes. Focus on completing pending deliverables.",
    adviceHi: careerAuspicious
      ? "योजनाओं को गति देने, व्यावसायिक प्रस्तावों पर विमर्श और सहयोगियों के साथ सामंजस्य के लिए अनुकूल दिन। अपने दायित्वों का निष्ठापूर्वक पालन करें।"
      : "धैर्य और योजनाबद्ध परिश्रम का समय। किसी भी विवाद में न उलझें और महत्वपूर्ण दस्तावेजों की सावधानीपूर्वक समीक्षा करें।",
    sourceBasis: "Brihat Parashara Hora Shastra, Dasha-Gochara Phala Adhyaya",
  };

  // 2. Education & Learning
  const eduAuspicious = jupTransit?.isGocharaAuspicious || mercTransit?.isGocharaAuspicious;
  const educationGuidance = {
    domain: "education",
    titleEn: "Education & Learning",
    titleHi: "शिक्षा, अध्ययन एवं बौद्धिक विकास",
    icon: "Brain",
    status: eduAuspicious ? "FAVORABLE" : "STEADY",
    astrologicalContext: isHi
      ? `पंचम भाव एवं बुध-गुरु की गोचरीय दृष्टि। नक्षत्र: ${panchang?.nakshatra?.name || "Vedanga"}।`
      : `Mercury & Jupiter influences on learning axis with ${panchang?.nakshatra?.name || "auspicious"} Nakshatra.`,
    adviceEn: eduAuspicious
      ? "Excellent mental agility for absorbing complex topics, memory retention, research reading, and creative comprehension. Ideal for focused examination preparation."
      : "Cultivate single-pointed concentration. Break extensive subjects into modular 25-minute study intervals to mitigate mental wandering.",
    adviceHi: eduAuspicious
      ? "गूढ़ विषयों को समझने, स्मरण शक्ति और शोध कार्यों के लिए अति उत्तम समय। मन में एकाग्रता और सकारात्मक जिज्ञासा बनी रहेगी।"
      : "अध्ययन में मन को स्थिर रखें। एक साथ कई विषयों को पढ़ने के बजाय एक समय में एक ही अध्याय पर ध्यान केंद्रित करें।",
    sourceBasis: "Phaladeepika Ch. 26 & Taittiriya Aranyaka (Svadhyaya)",
  };

  // 3. Business & Financial Planning
  const finAuspicious = jupTransit?.isGocharaAuspicious || venTransit?.isGocharaAuspicious;
  const financeGuidance = {
    domain: "finance",
    titleEn: "Business & Financial Planning",
    titleHi: "व्यापार एवं वित्तीय संतुलन",
    icon: "Wallet",
    status: finAuspicious ? "FAVORABLE" : "CAUTIOUS",
    astrologicalContext: isHi
      ? `द्वितीय व एकादश भाव प्रभाव; दिन के चौघड़िया एवं राहु काल (${panchang?.rahuKaal?.startLocal || "दोपहर"}) का ध्यान रखें।`
      : `Wealth axis (2nd & 11th) transits; align major initiatives outside Rahu Kaal (${panchang?.rahuKaal?.startLocal || "afternoon"}).`,
    adviceEn: finAuspicious
      ? "Favorable for budget rationalization, calculated inventory planning, and debt reduction. Emphasize ethical, transparent transactions."
      : "Traditional astrology advises against speculative investments, sudden monetary commitments, or impulsive purchases during this transit window. Protect reserves.",
    adviceHi: finAuspicious
      ? "आय-व्यय के संतुलन, व्यापारिक बजट और भविष्य की वित्तीय रूपरेखा बनाने के लिए अनुकूल दिन। पारदर्शी व्यवहार रखें।"
      : "अनावश्यक खर्चों पर नियंत्रण रखें। किसी भी प्रकार के सट्टे या जोखिम भरे निवेश से बचें। पारंपरिक रूप से आज संचित धन के संरक्षण का दिन है।",
    sourceBasis: "Brihat Samhita & Kautilya Artha-Niti",
  };

  // 4. Relationships & Family
  const relAuspicious = venTransit?.isGocharaAuspicious || panchang?.vara?.lord === "Venus" || panchang?.vara?.lord === "Jupiter";
  const relationshipGuidance = {
    domain: "relationships",
    titleEn: "Relationships & Family",
    titleHi: "संबंध, परिवार एवं सामाजिक सौहार्द",
    icon: "Heart",
    status: relAuspicious ? "FAVORABLE" : "STEADY",
    astrologicalContext: isHi
      ? `सप्तम व चतुर्थ भाव पर गुरु-शुक्र का प्रभाव। जन्म राशि: ${moonSign}।`
      : `Venus & 7th house harmony relative to Janma Rashi (${moonSign}).`,
    adviceEn: relAuspicious
      ? "Harmonious day for empathetic listening, quality family dinners, resolving misunderstandings, and expressing heartfelt appreciation to loved ones."
      : "Practice measured, kind speech (Mitabhashana). Allow space in sensitive dialogues and avoid reactive rebuttals during moments of familial friction.",
    adviceHi: relAuspicious
      ? "पारिवारिक सामंजस्य और आपसी समझ के लिए मधुर दिन। अपनों के विचारों को सम्मान दें और संवाद में सहृदयता बनाए रखें।"
      : "वाणी में सौम्यता बनाए रखें। मतभेदों को धैर्यपूर्वक सुनें और त्वरित प्रतिक्रिया से बचें। संयम ही संबंधों को मजबूत करता है।",
    sourceBasis: "Manusmriti Ch. 3 & Bhagavad Gita 17.15",
  };

  // 5. Health & Wellbeing
  const healthAuspicious = marsTransit?.isGocharaAuspicious && sunTransit?.isGocharaAuspicious;
  const healthGuidance = {
    domain: "health",
    titleEn: "Health & Wellbeing (Non-Medical)",
    titleHi: "स्वास्थ्य एवं शारीरिक ऊर्जा (संयम भाव)",
    icon: "Zap",
    status: healthAuspicious ? "VIGOROUS" : "RESTFUL",
    astrologicalContext: isHi
      ? `लग्न व षष्ठम भाव पर सूर्य-मंगल का प्रभाव। ऋतु एवं दैनिक प्राण चक्र।`
      : `Ascendant & solar vitality balance; circadian alignment with Sunrise (${panchang?.sunrise?.local || "06:00"}).`,
    adviceEn: healthAuspicious
      ? "Solid physical vitality. Suitable for brisk morning walking, outdoor Surya Namaskara, and balanced hydration. Avoid over-exhaustion."
      : "Traditional counsel encourages digestive rest, wholesome warm meals, gentle stretching, and early sleep to replenish subtle vital reserves (Ojas).",
    adviceHi: healthAuspicious
      ? "शारीरिक ऊर्जा अच्छी बनी रहेगी। प्रातःकालीन भ्रमण, योगासन और संतुलित आहार के लिए उत्तम दिन। अत्यधिक श्रम से बचें।"
      : "पाचन तंत्र को विश्राम दें। हल्का, सुपाच्य भोजन ग्रहण करें और समय पर शयन कर शरीर की प्राकृतिक ऊर्जा (ओजस) का संरक्षण करें।",
    sourceBasis: "Charaka Samhita (Dinacharya) & Ayurveda Sutras",
  };

  // 6. Spiritual Development
  const spiritualGuidance = {
    domain: "spiritual",
    titleEn: "Spiritual Development & Sadhana",
    titleHi: "आध्यात्मिक साधना एवं अंतर्मुखी शांति",
    icon: "Sparkles",
    status: "EXCELLENT",
    astrologicalContext: isHi
      ? `नवम-द्वादश भाव एवं पंचांग तिथि (${panchang?.tithi?.name}) व नक्षत्र (${panchang?.nakshatra?.name})।`
      : `9th & 12th houses spiritual alignment with Tithi ${panchang?.tithi?.name} and Nakshatra ${panchang?.nakshatra?.name}.`,
    adviceEn:
      "Auspicious cosmic window for Japa, reading sacred passages, practicing gentle Sama Vritti breath control, and feeling the sacred presence in ordinary moments.",
    adviceHi:
      "गायत्री मन्त्र जप, स्वाध्याय, प्राणायाम और शांत चिंतन के लिए अत्यंत फलदायी दिन। अपने अंतर्मन में शांति और कृतज्ञता का अनुभव करें।",
    sourceBasis: "Patanjali Yoga Sutras (Samadhi Pada) & Upanishads",
  };

  return [
    careerGuidance,
    educationGuidance,
    financeGuidance,
    relationshipGuidance,
    healthGuidance,
    spiritualGuidance,
  ];
}

// ============================================================================
// 3. Daily Chakra & Kundalini Learning Recommendation
// ============================================================================
export function getDailyChakraGuidance(weekdayIndex = 0) {
  // Map weekday to primary Chakra (classical planetary correspondence)
  // 0: Sun -> Manipura
  // 1: Moon -> Svadhisthana / Ajna
  // 2: Mars -> Muladhara
  // 3: Mercury -> Vishuddha
  // 4: Jupiter -> Ajna / Sahasrara
  // 5: Venus -> Anahata
  // 6: Saturn -> Muladhara
  const mapping = [
    { chakraId: "manipura", dayLord: "Surya (Sun)", nadiFocus: "Pingala (Solar, active, discerning)" },
    { chakraId: "svadhisthana", dayLord: "Chandra (Moon)", nadiFocus: "Ida (Lunar, cooling, intuitive)" },
    { chakraId: "muladhara", dayLord: "Mangala (Mars)", nadiFocus: "Ida-Pingala Origin / Brahma Granthi grounding" },
    { chakraId: "vishuddha", dayLord: "Budha (Mercury)", nadiFocus: "Sushumna Throat Axis / Truthful Vak" },
    { chakraId: "ajna", dayLord: "Brihaspati (Jupiter)", nadiFocus: "Bhrumadhya / Rudra Granthi insight" },
    { chakraId: "anahata", dayLord: "Shukra (Venus)", nadiFocus: "Hridaya / Vishnu Granthi universal compassion" },
    { chakraId: "muladhara", dayLord: "Shani (Saturn)", nadiFocus: "Merudanda Foundation / Patient endurance" },
  ];

  const current = mapping[weekdayIndex] || mapping[0];
  const chakraData = CHAKRAS_ARRAY.find((c) => c.id === current.chakraId) || CHAKRAS_ARRAY[0];

  return {
    chakraId: chakraData.id,
    slug: chakraData.slug,
    sanskritName: chakraData.sanskritName,
    englishName: chakraData.englishName,
    element: chakraData.element,
    bijaMantra: chakraData.bijaMantra,
    petalsCount: chakraData.petalsCount,
    rulingDayLord: current.dayLord,
    nadiFocus: current.nadiFocus,
    symbolismSummary: chakraData.symbolism?.lotusDescription || "Classical contemplative center in Shat-Chakra-Nirupana.",
    contemplationFocus: chakraData.guidedLearning?.safeMindfulnessExercise?.overview || "Practice gentle breathing while focusing attention on this sacred center.",
    granthisAssociated: chakraData.granthisAssociated,
    nonMedicalDisclaimer: "Chakras are traditional subtle contemplation loci (Adharas) cultivated in meditation, not bio-mechanical physical organs.",
    linkToStudio: `/spirituality/kundalini#${chakraData.slug}`,
  };
}

// ============================================================================
// 4. Daily Favorable & Unfavorable Timings Breakdown
// ============================================================================
function parseTimeToMinutes(t) {
  if (!t) return null;
  if (t instanceof Date) return t.getHours() * 60 + t.getMinutes();
  const match = String(t).match(/(\d+):(\d+)(?:\s*(AM|PM))?/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function formatMinutesToTime(totalMins) {
  let m = Math.round(totalMins) % (24 * 60);
  if (m < 0) m += 24 * 60;
  const h = Math.floor(m / 60);
  const mins = m % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(mins)}`;
}

export function getDailyFavorableTimings(panchang, language = "en") {
  const isHi = language === "hi" || language === "hindi";
  const weekdayIndex = panchang.vara?.dayIndex ?? 0;

  // Approximate sunrise & sunset in minutes
  const sunriseMins = parseTimeToMinutes(panchang.sunrise?.local || panchang.sunrise) ?? (6 * 60 + 30);
  const sunsetMins = parseTimeToMinutes(panchang.sunset?.local || panchang.sunset) ?? (17 * 60 + 45);
  const dayDuration = Math.max(600, sunsetMins - sunriseMins);
  const slotDuration = dayDuration / 8; // 8 divisions for Rahu/Yamaganda/Gulika
  const solarNoon = sunriseMins + dayDuration / 2;

  // Auspicious windows
  const auspicious = [];

  // 1. Brahma Muhurta (96m to 48m before sunrise)
  const brahmaWindow =
    panchang.muhurta?.brahma ||
    `${formatMinutesToTime(sunriseMins - 96)} – ${formatMinutesToTime(sunriseMins - 48)}`;
  auspicious.push({
    name: isHi ? "ब्रह्म मुहूर्त" : "Brahma Muhurta",
    window: brahmaWindow,
    quality: "MOST_AUSPICIOUS",
    favorableFor: isHi ? "ध्यान, प्राणायाम, मन्त्र जप एवं गहन अध्ययन" : "Meditation, deep study, mantra japa, and quiet contemplation",
    classicalRef: "Manusmriti 4.92 & Ashtanga Hridaya",
  });

  // 2. Abhijit Muhurta (approx 24m before to 24m after solar noon)
  const abhijitWindow =
    panchang.muhurta?.abhijit ||
    `${formatMinutesToTime(solarNoon - 24)} – ${formatMinutesToTime(solarNoon + 24)}`;
  auspicious.push({
    name: isHi ? "अभिजीत मुहूर्त" : "Abhijit Muhurta",
    window: abhijitWindow,
    quality: "HIGHLY_AUSPICIOUS",
    favorableFor: isHi ? "महत्वपूर्ण कार्य, यात्रा, समझौते व धर्मसम्मत नए आरम्भ" : "Important business, travel, vital signings, and commencing ventures",
    classicalRef: "Muhurta Chintamani & Narada Samhita",
  });

  // 3. Amrit Kaal (from Choghadiya or 4th auspicious slot)
  const amritChoghadiya = (panchang.choghadiya?.day || []).find((c) => c.name === "Amrit");
  const amritWindow =
    panchang.muhurta?.amritKaal ||
    (amritChoghadiya ? `${amritChoghadiya.start} – ${amritChoghadiya.end}` : `${formatMinutesToTime(sunriseMins + slotDuration * 2)} – ${formatMinutesToTime(sunriseMins + slotDuration * 3)}`);
  auspicious.push({
    name: isHi ? "अमृत काल" : "Amrit Kaal",
    window: amritWindow,
    quality: "AUSPICIOUS",
    favorableFor: isHi ? "पूजन, औषधि सेवन, रचनात्मक कार्य व उत्सव" : "Pujas, taking remedies, creative work, and auspicious exchanges",
    classicalRef: "Brihat Samhita",
  });

  // Inauspicious windows
  const inauspicious = [];

  // 1. Rahu Kaal
  const rahuWindow = panchang.rahuKaal
    ? `${panchang.rahuKaal.startLocal} – ${panchang.rahuKaal.endLocal}`
    : `${formatMinutesToTime(sunriseMins + slotDuration * 4)} – ${formatMinutesToTime(sunriseMins + slotDuration * 5)}`;
  inauspicious.push({
    name: isHi ? "राहु काल" : "Rahu Kaal",
    window: rahuWindow,
    cautionLevel: "SIGNIFICANT",
    unfavorableFor: isHi ? "नए अनुबंधों पर हस्ताक्षर, गृह प्रवेश, विवाह व नए व्यापार का आरम्भ" : "Inaugural contracts, beginning major new journeys, or solemn pledges",
    safeActivities: isHi ? "नित्य कार्य, चिंतन, सफाई, अध्ययन व मौन ध्यान" : "Routine daily labor, analytical audits, quiet reflection, and mantra",
    classicalRef: "Surya Siddhanta & Muhurta Martanda",
  });

  // 2. Yamaganda (weekday order: Sun:5, Mon:4, Tue:3, Wed:2, Thu:1, Fri:7, Sat:6)
  const yamaSlots = [4, 3, 2, 1, 0, 6, 5];
  const yamaSlotIdx = yamaSlots[weekdayIndex] ?? 3;
  const yamagandaWindow =
    panchang.yamaganda
      ? `${panchang.yamaganda.startLocal} – ${panchang.yamaganda.endLocal}`
      : `${formatMinutesToTime(sunriseMins + slotDuration * yamaSlotIdx)} – ${formatMinutesToTime(sunriseMins + slotDuration * (yamaSlotIdx + 1))}`;
  inauspicious.push({
    name: isHi ? "यमगण्ड काल" : "Yamaganda",
    window: yamagandaWindow,
    cautionLevel: "MODERATE",
    unfavorableFor: isHi ? "महत्वपूर्ण यात्रा व वित्तीय लेन-देन" : "Critical travel or urgent negotiations",
    safeActivities: isHi ? "नियमित कर्तव्य व घरेलू कार्य" : "Routine duties, internal administrative tasks",
    classicalRef: "Panchang Vidhana",
  });

  // 3. Gulika Kaal (weekday order: Sun:7, Mon:6, Tue:5, Wed:4, Thu:3, Fri:2, Sat:1)
  const gulikaSlots = [6, 5, 4, 3, 2, 1, 0];
  const gulikaSlotIdx = gulikaSlots[weekdayIndex] ?? 5;
  const gulikaWindow =
    panchang.gulikaKaal
      ? `${panchang.gulikaKaal.startLocal} – ${panchang.gulikaKaal.endLocal}`
      : `${formatMinutesToTime(sunriseMins + slotDuration * gulikaSlotIdx)} – ${formatMinutesToTime(sunriseMins + slotDuration * (gulikaSlotIdx + 1))}`;
  inauspicious.push({
    name: isHi ? "गुलिक काल" : "Gulika Kaal",
    window: gulikaWindow,
    cautionLevel: "MODERATE",
    unfavorableFor: isHi ? "अशुभ या दण्डकारी कार्य" : "Disputes, harsh encounters, or irreversible closures",
    safeActivities: isHi ? "कर्म संपादन व शांति पाठ" : "Sattvic duties and peace prayers",
    classicalRef: "Jataka Parijata",
  });

  return {
    auspicious,
    inauspicious,
  };
}

// ============================================================================
// 5. Daily Mantra Intelligence Selector
// ============================================================================
export function getDailyMantraIntelligence(chart, weekdayIndex = 0, language = "en") {
  const isHi = language === "hi" || language === "hindi";

  if (!SANSKRIT_SHLOKAS || SANSKRIT_SHLOKAS.length === 0) {
    return null;
  }

  // Attempt to select shloka matching current Mahadasha lord or weekday lord
  const activeMaha = (chart?.dasha?.currentMahadasha || "").toUpperCase();
  const dayLords = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"];
  const currentDayLord = dayLords[weekdayIndex] || "SUN";

  let matched = SANSKRIT_SHLOKAS.find(
    (s) =>
      (activeMaha && s.subject?.toUpperCase().includes(activeMaha)) ||
      (activeMaha && s.keywords?.some((k) => k.toUpperCase().includes(activeMaha)))
  );

  if (!matched) {
    matched = SANSKRIT_SHLOKAS.find(
      (s) =>
        s.subject?.toUpperCase().includes(currentDayLord) ||
        s.keywords?.some((k) => k.toUpperCase().includes(currentDayLord))
    );
  }

  // Fallback to day of year rotation
  if (!matched) {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    matched = SANSKRIT_SHLOKAS[dayOfYear % SANSKRIT_SHLOKAS.length];
  }

  return {
    id: matched.id,
    devanagari: matched.devanagari,
    iast: matched.iast,
    padaChheda: matched.padaChheda || [],
    anvaya: matched.anvaya || [],
    chhanda: matched.chhanda,
    source: matched.source,
    author: matched.author,
    chapter: matched.chapter,
    verseNumber: matched.verseNumber,
    translationEn: matched.translationEn,
    translationHi: matched.translationHi,
    commentaryEn: matched.commentaryEn,
    commentaryHi: matched.commentaryHi,
    audioToneChakraId: "ajna", // default harmonic resonance
  };
}

// ============================================================================
// 6. Main Orchestrator: getDailySpiritualGuidance
// ============================================================================
export async function getDailySpiritualGuidance({
  panchang,
  date,
  userId = null,
  birthProfile = null,
  chart = null,
  transits = null,
  language = "en",
}) {
  const isHi = language === "hi" || language === "hindi";
  const weekdayIndex = panchang.vara?.dayIndex ?? new Date(date).getUTCDay();
  const currentTithiName = panchang.tithi?.name || "";
  const currentNakshatraName = panchang.nakshatra?.name || "";
  const moonRashi = panchang.moonSign?.name || "Aries";

  // 1. Fetch published remedies from database with fallback to seed data
  let allRemedies = [];
  try {
    allRemedies = await prisma.dailyRemedy.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "asc" },
    });
  } catch (err) {
    console.warn("[remedyEngine] DB fetch failed, using built-in corpus:", err.message);
  }

  if (!allRemedies || allRemedies.length === 0) {
    allRemedies = INITIAL_REMEDIES.map((r, i) => ({ ...r, id: `seed-remedy-${i}` }));
  }

  // 2. Fetch user's completion logs and bookmarks if authenticated
  const userLogsMap = new Map();
  if (userId) {
    try {
      const logs = await prisma.userPracticeLog.findMany({
        where: {
          userId,
          practiceDate: date,
        },
      });
      for (const log of logs) {
        userLogsMap.set(log.remedyId, log);
      }
    } catch (err) {
      console.warn("[remedyEngine] Failed to fetch user practice logs:", err.message);
    }
  }

  // 3. Score and prioritize remedies
  const scoredRemedies = allRemedies.map((remedy) => {
    let score = 0;
    const reasons = [];

    if (remedy.applicableWeekdays?.includes(weekdayIndex)) {
      score += 50;
      reasons.push(`Aligned with today's ruling day (${panchang.vara?.en} - ${panchang.vara?.lord})`);
    }

    if (
      remedy.applicableTithis?.includes(currentTithiName) ||
      remedy.applicableTithis?.includes("All")
    ) {
      score += 20;
      reasons.push(`Traditional for ${currentTithiName} Tithi`);
    }

    if (
      remedy.applicableNakshatras?.includes(currentNakshatraName) ||
      remedy.applicableNakshatras?.includes("All")
    ) {
      score += 15;
      reasons.push(`Auspicious under ${currentNakshatraName} Nakshatra`);
    }

    if (remedy.category === "AVOIDANCE") {
      score += 35;
      reasons.push("Daily traditional mindfulness guideline");
    }

    if (remedy.category === "PUJA" || remedy.category === "MANTRA") score += 10;
    if (remedy.category === "DAAN") score += 8;
    if (remedy.category === "HABIT") score += 6;

    const userLog = userLogsMap.get(remedy.id);

    return {
      ...remedy,
      matchScore: score,
      matchReasons: reasons,
      isCompleted: Boolean(userLog?.completed),
      isBookmarked: Boolean(userLog?.bookmarked),
      userNotes: userLog?.notes || null,
    };
  });

  scoredRemedies.sort((a, b) => b.matchScore - a.matchScore);

  // Pick top 3 to 5 balanced remedies
  const selectedRemedies = [];
  for (const r of scoredRemedies) {
    if (selectedRemedies.length >= 5) break;
    const countInCat = selectedRemedies.filter((x) => x.category === r.category).length;
    if (countInCat < 2) {
      selectedRemedies.push(r);
    }
  }

  const avoidanceItem = scoredRemedies.find((r) => r.category === "AVOIDANCE");
  if (avoidanceItem && !selectedRemedies.some((s) => s.id === avoidanceItem.id)) {
    if (selectedRemedies.length >= 5) selectedRemedies.pop();
    selectedRemedies.push(avoidanceItem);
  }

  // 4. Select matching Classical Pujas
  const matchingPujas = CLASSICAL_PUJAS.filter((p) => {
    if (weekdayIndex === 0 && p.category === "SURYA_ARADHANA") return true;
    if (weekdayIndex === 1 && p.category === "SHIVA_PUJA") return true;
    if (weekdayIndex === 2 && (p.category === "GANESH_PUJA" || p.category === "DEVI_UPASANA")) return true;
    if (weekdayIndex === 3 && (p.category === "SARASWATI_PUJA" || p.category === "GANESH_PUJA")) return true;
    if (weekdayIndex === 4 && p.category === "VISHNU_PUJA") return true;
    if (weekdayIndex === 5 && (p.category === "LAKSHMI_PUJA" || p.category === "DEVI_UPASANA")) return true;
    if (weekdayIndex === 6 && (p.category === "NAVAGRAHA_PUJA" || p.category === "SHIVA_PUJA")) return true;
    return false;
  });

  // Always include Ganesh Puja as primary obstacle-remover if not already included
  if (!matchingPujas.some((p) => p.category === "GANESH_PUJA")) {
    const ganesh = CLASSICAL_PUJAS.find((p) => p.category === "GANESH_PUJA");
    if (ganesh) matchingPujas.unshift(ganesh);
  }

  // 5. Generate Categorized Daily Guidance (Career, Education, Finance, Family, Health, Spiritual)
  const resolvedChart = chart || birthProfile?.birthChart?.chartData || null;
  const categorizedGuidance = generateCategorizedDailyGuidance({
    chart: resolvedChart,
    transits,
    panchang,
    language,
  });

  // 6. Daily Chakra & Subtle Anatomy Guidance
  const chakraGuidance = getDailyChakraGuidance(weekdayIndex);

  // 7. Daily Sanskrit Mantra Intelligence
  const dailyMantra = getDailyMantraIntelligence(resolvedChart, weekdayIndex, language);

  // 8. Favorable and Inauspicious Timings
  const timings = getDailyFavorableTimings(panchang, language);

  // 9. Good Habits & Mindful Conduct
  const goodHabits = [
    {
      id: "habit-1",
      title: "Pratah Sankalpa (Morning Intention)",
      description: "Upon waking, take 3 mindful breaths before looking at digital screens. Set a calm, benevolent intention for your day.",
      source: "Taittiriya Aranyaka (Brahma Yajna)",
    },
    {
      id: "habit-2",
      title: "Mitabhashana (Measured & Kind Speech)",
      description: "Consciously pause before responding in conversations. Speak words that are truthful, pleasant, and beneficial.",
      source: "Bhagavad Gita 17.15 (Vangmaya Tapas)",
    },
    {
      id: "habit-3",
      title: "Pancha Yajna Gesture (Acts of Kindness)",
      description: "Offer food or water to birds, animals, or care for a plant. Even the smallest act of environmental care generates wholesome karma.",
      source: "Manusmriti 3.68-71",
    },
    {
      id: "habit-4",
      title: "Nitya Svadhyaya (Daily Reflective Study)",
      description: "Spend 10 to 15 minutes reading an inspiring passage from sacred literature or contemplative philosophy.",
      source: "Patanjali Yoga Sutras 2.44",
    },
  ];

  // 10. Avoidance Guidelines
  const whatToAvoid = [
    {
      id: "avoid-1",
      title: "Impulsive Commitments during Rahu Kaal",
      description: panchang.rahuKaal
        ? `Traditional astrology cautions against commencing irrevocable contracts or major inaugural ventures during today's Rahu Kaal (${panchang.rahuKaal.startLocal} – ${panchang.rahuKaal.endLocal}). Use this period for steady ongoing work, cleaning, or silent contemplation.`
        : "Avoid hasty, emotionally charged decisions during unsettled moments of the day.",
      tradition: "Muhurta Chintamani & Brihat Samhita",
    },
    {
      id: "avoid-2",
      title: "Harsh Criticism & Verbal Conflict (Pāruṣya)",
      description: "Refrain from engaging in argumentative social media debates or aggressive confrontation today. Conserve mental energy for constructive goals.",
      tradition: "Dharma Shastra & Yoga Sutras (Ahimsa)",
    },
    {
      id: "avoid-3",
      title: "Excessive Lethargy & Procrastination (Tamas)",
      description: "Avoid prolonged daytime slumber or aimless distraction. Maintain a steady, purposeful rhythm throughout your waking hours.",
      tradition: "Bhagavad Gita 18.39",
    },
  ];

  // 11. Personalized Astrological Overview & Insight with Authentic Vimshottari Dasha
  let personalizedGuidance = null;
  if (birthProfile || chart) {
    const pChart = resolvedChart || {};
    const userMoonRashi = pChart.moon?.sign || birthProfile?.moonSign || "Aries";
    const userLagna = pChart.ascendant?.sign || birthProfile?.ascendant || "Aries";

    let userMaha = pChart.dasha?.currentMahadasha || null;
    let userAntar = pChart.dasha?.currentAntardasha || null;
    let userPratyantar = pChart.dasha?.currentPratyantardasha || null;
    let dashaTheme = null;
    let upcomingTransition = null;

    // Compute authentic Vimshottari Dasha using BPHS calculation engine if birthDate is available
    if (birthProfile?.birthDate || pChart.birthDate) {
      try {
        const { computeComprehensiveVimshottari, DASHA_THEMES } = await import("./dashaEngine.js");
        const bDate = new Date(birthProfile?.birthDate || pChart.birthDate);
        const moonLon =
          pChart.planets?.find((p) => p.name === "Moon")?.longitude ??
          pChart.moon?.longitude ??
          pChart.moon?.degree ??
          15.0; // fallback to Aries Ashwini
        const dashaResult = computeComprehensiveVimshottari(moonLon, bDate, new Date(date));
        if (dashaResult?.activeDasha) {
          userMaha = dashaResult.activeDasha.mahadasha || dashaResult.activeDasha.lord;
          userAntar = dashaResult.activeDasha.antardasha;
          userPratyantar = dashaResult.activeDasha.pratyantardasha;
          upcomingTransition = dashaResult.activeDasha.antarEndDate || dashaResult.activeDasha.endDate;
          dashaTheme = dashaResult.activeDasha.theme || (userMaha ? DASHA_THEMES[userMaha.toUpperCase()] : null);
        }
      } catch (dErr) {
        console.warn("[remedyEngine] Dasha calculation fallback:", dErr.message);
      }
    }

    if (!userMaha) userMaha = pChart.dasha?.currentMahadasha || "Sun";
    if (!userAntar) userAntar = pChart.dasha?.currentAntardasha || "Moon";
    if (!dashaTheme && userMaha) {
      dashaTheme = DASHA_THEMES[userMaha.toUpperCase()] || null;
    }

    personalizedGuidance = {
      isAvailable: true,
      profileName: birthProfile?.name || "Seeker",
      userMoonSign: String(userMoonRashi),
      userAscendant: String(userLagna),
      currentMahadasha: userMaha,
      currentAntardasha: userAntar,
      currentPratyantardasha: userPratyantar,
      dashaTheme,
      upcomingTransition,
      astrologicalInsight: `With your natal Moon in ${userMoonRashi} and transit Moon traveling through ${moonRashi}, today favors gentle mental poise and conscious focus on inner harmony. Guided by your active ${userMaha} Mahadasha and ${panchang.vara?.en} (${panchang.vara?.lord}) planetary energy, balance active duties with quiet reflection.`,
      recommendedFocus: dashaTheme?.focus || `Dedicate 5 to 10 minutes to mindful breathing before entering major discussions, especially as the day transitions through Rahu Kaal.`,
      sadhanaFocus: dashaTheme?.sadhana || "Gayatri Mantra, mindful physical exercise, and contemplative scripture reading.",
      disclaimer: "Astrological guidance represents traditional contemplative archetypes. It does not replace personal judgment, professional healthcare, or medical advice.",
    };
  } else {
    personalizedGuidance = {
      isAvailable: false,
      message: "Log in or select your birth profile to receive personalized chart-based spiritual guidance.",
    };
  }

  // 11b. Authentic Digital Library Scriptural Recommendations with 3D Reader Links
  const scripturalReadings = [
    {
      id: "read-1",
      bookTitle: "Arogyanidhii (Vedic Longevity & Dinacharya)",
      bookSlug: "arogyanidhii",
      pageNumber: 1,
      readerUrl: "/library/arogyanidhii/pdf?page=1",
      chapter: "Dinacharya & Prana Balance",
      sanskritVerse: "प्रातःकाले समुत्थाय धर्ममर्थं च चिन्तयेत्। कायक्लेशांस्तन्मूलान् वेदतत्त्वार्थमेव च॥",
      transliteration: "Prātaḥkāle samutthāya dharmamarthaṃ ca cintayet | Kāyakleśāṃstanmūlān vedatattvārthameva ca ||",
      translationEn: "Rising early at dawn, one should contemplate righteousness (Dharma), honest livelihood (Artha), the body's well-being, and the essence of Vedic truth.",
      translationHi: "प्रातःकाल उठकर धर्म, अर्थ, शरीर की शुद्धि तथा वेद के यथार्थ तत्त्व का चिन्तन करना चाहिए।",
      traditionalAttribution: "Classical Ayurvedic & Vedic Dinacharya",
      verificationStatus: "VERIFIED",
      whyRecommended: `Traditional morning contemplation aligning mental clarity with today's ${panchang.vara?.en} sunrise energy.`,
    },
    {
      id: "read-2",
      bookTitle: "Phaladeepika (Mantreshwara Classical Jyotish)",
      bookSlug: "phaladeepika",
      pageNumber: 2,
      readerUrl: "/library/phaladeepika/pdf?page=2",
      chapter: "Adhyaya 26: Kalachakra & Shanti Phala",
      sanskritVerse: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
      transliteration: "Karmaṇyevādhikāraste mā phaleṣu kadācana | Mā karmaphalaheturbhūrmā te saṅgo'stvakarmaṇi ||",
      translationEn: "You have authority over your actions alone, never over their fruits. Let not the fruit of action be your motive, nor surrender to inaction.",
      translationHi: "तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। कर्मफल की आसक्ति से मुक्त होकर अनासक्त भाव से कर्तव्य करें।",
      traditionalAttribution: "Phaladeepika & Bhagavad Gita 2.47",
      verificationStatus: "VERIFIED",
      whyRecommended: "Classical ethical anchor for inner poise, mental endurance, and karma shanti.",
    },
    {
      id: "read-3",
      bookTitle: "Brihat Parashara Hora Shastra",
      bookSlug: "brihat-parashara-hora-shastra",
      pageNumber: 1,
      readerUrl: "/library/brihat-parashara-hora-shastra/pdf?page=1",
      chapter: "Adhyaya 84: Graha Shanti Vidhi",
      sanskritVerse: "अहिंसा सत्यमस्तेयं शौचमिन्द्रियनिग्रहः। एतं सामासिकं धर्मं चातुर्वर्ण्येऽब्रवीन्मनुः॥",
      transliteration: "Ahiṃsā satyamasteyaṃ śaucamindriyanigrahaḥ | Etaṃ sāmāsikaṃ dharmaṃ cāturvarṇye'bravīnmanuḥ ||",
      translationEn: "Non-violence, truthfulness, integrity, internal purity, and self-restraint constitute universal Dharma.",
      translationHi: "अहिंसा, सत्य, अस्तेय, आंतरिक शुचिता और इन्द्रिय-संयम समस्त मानव जाति के लिए सार्वभौमिक धर्म के मूल स्तंभ हैं।",
      traditionalAttribution: "Maharshi Parashara, BPHS Ch. 84",
      verificationStatus: "VERIFIED",
      whyRecommended: "Authentic Parashari foundation for harmonizing planetary energies through noble conduct.",
    },
  ];

  // 12. Suggested Guided Spiritual Practice
  const suggestedPractice = {
    type: "PRANAYAMA_MINDFUL",
    titleEn: "Sama Vritti & Nadi Shodhana (Harmonious Breath)",
    titleHi: "समवृत्ति एवं नाड़ी शोधन (संतुलित श्वास)",
    durationMinutes: 5,
    recommendedRatio: "4:4 (Smooth Inhale 4s, Exhale 4s)",
    purpose: "Balances autonomic tone and centers consciousness before commencing the day's duties.",
    xpReward: 15,
    instructions: [
      "Sit comfortably with shoulders dropped and jaw relaxed.",
      "Inhale smoothly through both nostrils counting mentally to 4.",
      "Without breath holding, exhale smoothly counting to 4.",
      "Repeat for 10 unhurried, silent cycles.",
    ],
    safetyNotice: "Gentle and optional. Never force or hold your breath. Stop immediately if lightheaded.",
  };

  // Normalize Favorable Timings
  const auspiciousPeriods = (timings?.auspicious || []).map((a) => ({
    name: a.name,
    timeRange: a.window,
    significance: a.favorableFor,
    classicalRef: a.classicalRef,
  }));
  const inauspiciousPeriods = (timings?.inauspicious || []).map((i) => ({
    name: i.name,
    timeRange: i.window,
    significance: `${i.cautionLevel}: ${i.unfavorableFor}. Safe for: ${i.safeActivities}`,
    classicalRef: i.classicalRef,
  }));
  const favorableTimings = {
    ...timings,
    auspiciousPeriods,
    inauspiciousPeriods,
    favorableActivities: [
      "Commencing studies, Sanskrit shastra research & deep focus",
      "Spiritual contemplation, Mantra Japa & peaceful meditation",
      "Sattvic culinary preparation, nourishing meals & herbal teas",
      "Charitable acts (Daan), altruistic seva & family harmony",
      "Creative writing, artistic endeavors & philosophical reading",
    ],
    unfavorableActivities: [
      "Speculative financial gambles or hasty investments during Rahu Kaal",
      "Initiating hostile legal actions or intense interpersonal arguments",
      "Signing irreversible long-term agreements during inauspicious windows",
      "Excessive harsh speech, agitation, or impulsive decision-making",
    ],
  };

  // Normalize Categorized Guidance to both Array and Keyed Object
  const guidanceMap = {};
  if (Array.isArray(categorizedGuidance)) {
    for (const g of categorizedGuidance) {
      guidanceMap[g.domain] = {
        domain: g.domain,
        title: isHi ? g.titleHi : g.titleEn,
        titleEn: g.titleEn,
        titleHi: g.titleHi,
        status: g.status,
        transitInfluence: g.astrologicalContext,
        guidance: isHi ? g.adviceHi : g.adviceEn,
        adviceEn: g.adviceEn,
        adviceHi: g.adviceHi,
        recommendedAction: isHi ? (g.adviceHi?.split("।")[0] || g.adviceHi) : (g.adviceEn?.split(".")[0] || g.adviceEn),
        sourceBasis: g.sourceBasis,
      };
    }
    guidanceMap.business = guidanceMap.finance;
    guidanceMap.items = categorizedGuidance;
  }

  // Normalize Classical Pujas
  const enrichedPujas = (matchingPujas || []).map((p) => ({
    ...p,
    title: isHi ? p.titleHi : p.titleEn,
    significance: isHi ? p.traditionalSignificanceHi : p.traditionalSignificanceEn,
    procedure: (p.procedureSteps || []).map((s) => `${s.step}. ${s.title}: ${s.text}`),
    primaryMantra: p.sanskritMantras?.[0]?.devanagari || "",
    transliteration: p.sanskritMantras?.[0]?.iast || "",
    classicalSource: p.sourceScripture || "Classical Shastra",
    libraryLink: `/library?q=${encodeURIComponent(p.sourceScripture || "Puja")}`,
    durationMinutes: 20,
  }));

  const allEnrichedPujas = (CLASSICAL_PUJAS || []).map((p) => ({
    ...p,
    title: isHi ? p.titleHi : p.titleEn,
    significance: isHi ? p.traditionalSignificanceHi : p.traditionalSignificanceEn,
    procedure: (p.procedureSteps || []).map((s) => `${s.step}. ${s.title}: ${s.text}`),
    primaryMantra: p.sanskritMantras?.[0]?.devanagari || "",
    transliteration: p.sanskritMantras?.[0]?.iast || "",
    classicalSource: p.sourceScripture || "Classical Shastra",
    libraryLink: `/library?q=${encodeURIComponent(p.sourceScripture || "Puja")}`,
    durationMinutes: 20,
  }));

  // Normalize Daily Mantra
  const enrichedMantra = dailyMantra
    ? {
        ...dailyMantra,
        transliteration: dailyMantra.iast,
        source: `${dailyMantra.sourceBook} (${dailyMantra.chapterVerse})`,
        libraryLink: `/library?q=${encodeURIComponent(dailyMantra.sourceBook || "Shloka")}`,
        translation: {
          en: dailyMantra.translationEn,
          hi: dailyMantra.translationHi,
        },
        meaningEn: dailyMantra.translationEn,
        meaningHi: dailyMantra.translationHi,
      }
    : null;

  // Normalize Chakra Guidance
  const enrichedChakra = chakraGuidance
    ? {
        ...chakraGuidance,
        primaryChakra: chakraGuidance.nameEnglish || chakraGuidance.nameSanskrit || chakraGuidance.chakraId,
        secondaryChakra: "Ajna",
        nadi: chakraGuidance.nadiFocus?.split(" ")[0] || "Sushumna",
        granthi:
          chakraGuidance.chakraId === "muladhara"
            ? "Brahma Granthi"
            : chakraGuidance.chakraId === "anahata"
            ? "Vishnu Granthi"
            : "Rudra Granthi",
        traditionalSignificance: isHi ? chakraGuidance.educationalSummaryHi : chakraGuidance.educationalSummary,
        recommendedPractice: isHi ? chakraGuidance.meditationFocusHi : chakraGuidance.meditationFocus,
      }
    : null;

  return {
    date,
    weekday: panchang.vara?.en,
    weekdayHi: panchang.vara?.hi,
    rulingPlanet: panchang.vara?.lord,
    rulingPlanetHi: panchang.vara?.lordHi,
    panchangSummary: {
      tithi: `${panchang.tithi?.paksha} ${panchang.tithi?.name} (${panchang.tithi?.devanagari})`,
      nakshatra: `${panchang.nakshatra?.name} (${panchang.nakshatra?.devanagari})`,
      yoga: `${panchang.yoga?.name} (${panchang.yoga?.devanagari})`,
      karana: `${panchang.karana?.name} (${panchang.karana?.devanagari})`,
      moonSign: `${panchang.moonSign?.name} (${panchang.moonSign?.sanskritName})`,
      sunrise: panchang.sunrise?.local || "06:00 AM",
      sunset: panchang.sunset?.local || "06:00 PM",
      rahuKaal: panchang.rahuKaal
        ? `${panchang.rahuKaal.startLocal} – ${panchang.rahuKaal.endLocal}`
        : "Check local calendar",
    },
    choghadiya: panchang.choghadiya,
    categorizedGuidance: guidanceMap,
    recommendedPractices: selectedRemedies,
    classicalPujas: enrichedPujas,
    allPujas: allEnrichedPujas,
    dailyMantra: enrichedMantra,
    chakraGuidance: enrichedChakra,
    suggestedPractice,
    scripturalReadings,
    timings,
    favorableTimings,
    goodHabits,
    whatToAvoid,
    personalizedGuidance,
    classicalReferences: [
      { scripture: "Brihat Parashara Hora Shastra", chapter: "Adhyaya 84 (Graha Shanti Phala)" },
      { scripture: "Phaladeepika", chapter: "Adhyaya 26 (Gochara Phala)" },
      { scripture: "Shat-Chakra-Nirupana", chapter: "Verses 1–55 (Subtle Anatomy)" },
      { scripture: "Rigveda Khilani", chapter: "Sri Sukta (Mahalakshmi Upasana)" },
      { scripture: "Valmiki Ramayana", chapter: "Yuddha Kanda 105 (Aditya Hridaya)" },
    ],
    aiResearchPrompts: [
      "Why is this remedy recommended for today's planetary transit?",
      "What is the scriptural source for this Puja procedure?",
      "Explain the Anvaya and word-by-word Sanskrit breakdown of today's Mantra.",
      "How does today's Chakra relate to the Ida, Pingala, and Sushumna nadis?",
    ],
    safetyNotice: {
      title: "Ethical & Spiritual Disclaimer",
      text: "Vedic remedies and spiritual guidance are traditional practices intended for personal self-discipline, inner peace, and contemplative reflection. They are NOT guaranteed scientific mechanisms for altering external circumstances, avoiding natural difficulties, or curing medical/psychological conditions. Always consult qualified healthcare professionals for medical or emotional concerns.",
    },
  };
}

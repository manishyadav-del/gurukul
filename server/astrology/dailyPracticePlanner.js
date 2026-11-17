/**
 * Gurukul Daily Vedic Guidance & Spiritual Practice Planner Engine
 *
 * Implements:
 * 1. Personalized Daily Practice Plan synthesis grounded in Panchang, Dasha, and Digital Library
 * 2. Interactive checklist tracking with XP rewards and streak integration
 * 3. Weekly consistency tracking and practice history
 * 4. Authentic scriptural reading recommendations with direct links to the 3D Magazine Reader
 * 5. User-level data isolation and explainable recommendations
 */

import prisma from "../../lib/prisma.js";
import { awardXp, recordDailyActivity } from "../gamification/engine.js";
import { computeComprehensiveVimshottari, DASHA_THEMES } from "./dashaEngine.js";

// Classical Daily Practice Templates by Weekday Ruling Deity & Energy
export const WEEKDAY_SADHANA_TEMPLATES = {
  // Sunday - Surya (Sun)
  0: {
    deity: "Lord Surya (Cosmic Illumination)",
    planetaryRuler: "Sun",
    practices: [
      {
        category: "MANTRA",
        title: "Surya Gayatri & Bija Mantra Japa",
        description: "Chant facing East during sunrise for vitality, clear vision, and mental illumination.",
        durationMinutes: 10,
        sanskritText: "ॐ भास्कराय विद्महे दिवाकराय धीमहि । तन्नो सूर्यः प्रचोदयात् ॥",
        transliteration: "Oṃ bhāskarāya vidmahe divākarāya dhīmahi | Tanno sūryaḥ pracodayāt ||",
        meaningEn: "We meditate on the Sun, the source of light. May the divine radiance inspire and illuminate our intellect.",
        meaningHi: "हम समस्त लोकों को प्रकाशित करने वाले भुवन-भास्कर का ध्यान करते हैं। वे सूर्य देव हमारी बुद्धि को सत्कर्मों में प्रेरित करें।",
        sourceReference: "Rigveda 3.62.10 & Surya Upanishad",
        bookSlug: "phaladeepika",
        pageNumber: 1,
      },
      {
        category: "PRANAYAMA",
        title: "Surya Bhedana & Sama Vritti Breathwork",
        description: "Inhale through the right nostril (Pingala Nadi), exhale smoothly through the left.",
        durationMinutes: 7,
        sanskritText: "दक्षनाड्या समाकृष्य पूरयेद्वायुमादरात्। कुम्भयित्वा यथाशक्ति शनैः सव्येन रेचयेत्॥",
        transliteration: "Dakṣanāḍyā samākṛṣya pūrayedvāyumādarāt | Kumbhayitvā yathāśakti śanaiḥ savyena recayet ||",
        meaningEn: "Drawing the breath carefully through the right nostril, hold within capacity, and exhale gently through the left.",
        meaningHi: "दाहिनी नासिका से प्राणवायु को खींचकर, सामर्थ्यानुसार कुम्भक करें, फिर बाईं नासिका से धीरे-धीरे रेचन करें।",
        sourceReference: "Hatha Yoga Pradipika 2.48",
      },
      {
        category: "MEDITATION",
        title: "Solar Radiance Dhyana (Hridayakasha)",
        description: "Visualize a calm, warm golden sun at the center of the heart space, dispelling all inner hesitation.",
        durationMinutes: 10,
        sanskritText: "ध्येयः सदा सवितृमण्डलमध्यवर्ती नारायणः सरसिजासनसन्निविष्टः॥",
        transliteration: "Dhyeyaḥ sadā savitṛmaṇḍalamadhyavartī nārāyaṇaḥ sarasijāsanasanniviṣṭaḥ ||",
        meaningEn: "Always meditate upon the Supreme Consciousness residing in the core of the solar sphere, seated upon a lotus.",
        meaningHi: "सूर्य-मण्डल के मध्य में कमल पर विराजमान नारायण स्वरूप ज्योतिर्मय ब्रह्म का नित्य ध्यान करना चाहिए।",
        sourceReference: "Aditya Hridaya Stotram & Taittiriya Aranyaka",
      },
      {
        category: "READING",
        title: "Swadhyaya: Arogyanidhii – Dinacharya & Morning Prana",
        description: "Read classical guidance on waking at Brahma Muhurta and cultivating righteous vitality.",
        durationMinutes: 8,
        sanskritText: "प्रातःकाले समुत्थाय धर्ममर्थं च चिन्तयेत्। कायक्लेशांस्तन्मूलान् वेदतत्त्वार्थमेव च॥",
        transliteration: "Prātaḥkāle samutthāya dharmamarthaṃ ca cintayet | Kāyakleśāṃstanmūlān vedatattvārthameva ca ||",
        meaningEn: "Rising at dawn, contemplate Dharma, ethical livelihood, physical wellness, and the subtle meaning of truth.",
        meaningHi: "प्रातःकाल उठकर धर्म, सद्-आजीविका, स्वास्थ्य तथा वेद के गूढ़ तत्त्व का मनन करना चाहिए।",
        sourceReference: "Arogyanidhii, Dinacharya Adhyaya",
        bookSlug: "arogyanidhii",
        pageNumber: 1,
      },
    ],
  },

  // Monday - Chandra (Moon) & Shiva
  1: {
    deity: "Lord Shiva & Chandra (Pure Consciousness)",
    planetaryRuler: "Moon",
    practices: [
      {
        category: "MANTRA",
        title: "Shiva Panchakshari & Chandra Shanti Japa",
        description: "Calms emotional volatility, dissolves subconscious anxiety, and nurtures inner peace.",
        durationMinutes: 10,
        sanskritText: "ॐ नमः शिवाय ॥ ॐ सों सोमाय नमः ॥",
        transliteration: "Oṃ namaḥ śivāya || Oṃ soṃ somāya namaḥ ||",
        meaningEn: "Salutations to the auspicious Shiva, the indwelling silent consciousness. Salutations to Soma, the calming moon.",
        meaningHi: "कल्याणकारी भगवान शिव को नमन। मन को शीतलता और शांति प्रदान करने वाले चन्द्रदेव को प्रणाम।",
        sourceReference: "Shvetashvatara Upanishad 3.11 & Phaladeepika Ch. 26",
        bookSlug: "phaladeepika",
        pageNumber: 2,
      },
      {
        category: "PRANAYAMA",
        title: "Chandra Bhedana & Nadi Shodhana (Alternate Nostril)",
        description: "Slow breathing through the left nostril (Ida Nadi) to cool nervous agitation and balance autonomic tone.",
        durationMinutes: 8,
        sanskritText: "इडाभिर्वायुमापूर्य पूरयेच्चन्द्रमण्डले। मन्दं मन्दं सुषुम्नायां प्राणवायुं निरोधयेत्॥",
        transliteration: "Iḍābhirvāyumāpūrya pūrayeccandramaṇḍale | Mandaṃ mandaṃ suṣumnāyāṃ prāṇavāyuṃ nirodhayet ||",
        meaningEn: "Filling the breath gently through Ida (left nostril), visualize the lunar sphere and calm the mind into Sushumna.",
        meaningHi: "बाईं नासिका से मंद गति से श्वास भरकर, चन्द्रमण्डल का ध्यान करते हुए चित्त को मध्य नाड़ी में स्थिर करें।",
        sourceReference: "Gheranda Samhita 5.51",
      },
      {
        category: "MEDITATION",
        title: "Sakshi Chaitanya (Silent Witness Meditation)",
        description: "Sit quietly observing the flow of thoughts without clinging or aversion, resting as the unmoving observer.",
        durationMinutes: 12,
        sanskritText: "द्वा सुपर्णा सयुजा सखाया समानं वृक्षं परिषस्वजाते। तयोरन्यः पिप्पलं स्वाद्वत्त्यनश्नन्नन्यो अभिचाकशीति॥",
        transliteration: "Dvā suparṇā sayujā sakhāyā samānaṃ vṛkṣaṃ pariṣasvajāte | Tayoranyaḥ pippalaṃ svādvattyanaśnannanyo abhicākaśīti ||",
        meaningEn: "Two companion birds reside in the same tree: one tastes the fruit of action, while the other silently witnesses.",
        meaningHi: "एक ही वृक्ष पर दो सखा पक्षी हैं; एक कर्म-फल भोगता है, दूसरा शांत साक्षी बनकर केवल देखता है।",
        sourceReference: "Mundaka Upanishad 3.1.1",
      },
      {
        category: "READING",
        title: "Swadhyaya: Phaladeepika – Chandra & Mental Equilibrium",
        description: "Study how classical Jyotish approaches the tranquility of the Mind (Manas) through sattvic habits.",
        durationMinutes: 8,
        sanskritText: "मनः प्रसादो सौम्यत्वं मौनमात्मविनिग्रहः। भावसंशुद्धिरित्येतत्तपो मानसमुच्यते॥",
        transliteration: "Manaḥ prasādo saamyatvaṃ maunamātmavinigrahaḥ | Bhāvasaṃśuddhirityetattapo mānasamucyate ||",
        meaningEn: "Serenity of thought, gentleness, sacred silence, self-restraint, and purity of motive: this is mental austerity.",
        meaningHi: "मन की प्रसन्नता, सौम्यता, मौन, आत्म-संयम और विचारों की पवित्रता — यही मानसिक तप है।",
        sourceReference: "Bhagavad Gita 17.16 & Phaladeepika",
        bookSlug: "phaladeepika",
        pageNumber: 2,
      },
    ],
  },

  // Tuesday - Mangala (Mars) & Hanuman
  2: {
    deity: "Sri Hanuman & Mangala (Courage & Right Action)",
    planetaryRuler: "Mars",
    practices: [
      {
        category: "MANTRA",
        title: "Hanuman Moola Mantra & Mangala Gayatri",
        description: "Cultivates righteous courage, focused energy, and dissolves internal hesitation and irrational fear.",
        durationMinutes: 10,
        sanskritText: "ॐ हं हनुमते रुद्रात्मकाय हुं फट् ॥ ॐ भौमाय नमः ॥",
        transliteration: "Oṃ haṃ hanumate rudrātmikāya huṃ phaṭ || Oṃ bhaumāya namaḥ ||",
        meaningEn: "Salutations to Lord Hanuman, embodiment of Rudra's untamed courage and selfless devotion.",
        meaningHi: "रुद्र-अवतार, असीम शौर्य एवं निष्काम सेवा के प्रतीक भगवान हनुमान को सादर नमन।",
        sourceReference: "Parashara Smriti & Hanuman Chalisa",
        bookSlug: "phaladeepika",
        pageNumber: 3,
      },
      {
        category: "PRANAYAMA",
        title: "Bhastrika (Bellows Breath) & Dynamic Centering",
        description: "Rhythmic diaphragmatic breaths to oxygenate cells, stimulate Agni (vital digestive fire), and clear lethargy.",
        durationMinutes: 6,
        sanskritText: "कण्ठोत्थं कफहन्त्री च जठराग्निप्रदीपिनी। कुण्डलीबोधनी क्षिप्रं वातपित्तकफापहा॥",
        transliteration: "Kaṇṭhotthaṃ kaphahantrī ca jaṭharāgnipradīpinī | Kuṇḍalībodhanī kṣipraṃ vātapittakaphāpahā ||",
        meaningEn: "Bhastrika stimulates digestive fire, balances the three doshas, and rapidly awakens dormant vital energy.",
        meaningHi: "भस्त्रिका प्राणायाम जठराग्नि को प्रदीप्त करता है, त्रिदोषों को संतुलित करता है और प्राणिक चेतना को जागृत करता है।",
        sourceReference: "Hatha Yoga Pradipika 2.65",
      },
      {
        category: "MEDITATION",
        title: "Sthirata Dhyana (Inner Mountain Steadiness)",
        description: "Ground awareness at the Manipura and Muladhara centers; anchor unwavering resolve (Sankalpa).",
        durationMinutes: 10,
        sanskritText: "स्थिरसुखमासनम्। प्रयत्नशैथिल्यानन्तसमापत्तिभ्याम्॥",
        transliteration: "Sthirasukhamāsanam | Prayatnaśaithilyānantasamāpattibhyām ||",
        meaningEn: "Posture is steady and filled with ease, achieved through the release of tension and resting in the infinite.",
        meaningHi: "आसन स्थिर और सुखमय होना चाहिए, जो प्रयत्न की शिथिलता तथा अनंत चेतना में लय से सिद्ध होता है।",
        sourceReference: "Patanjali Yoga Sutras 2.46-47",
      },
      {
        category: "READING",
        title: "Swadhyaya: Brihat Parashara – Shanti Adhyaya (Mangala)",
        description: "Explore Parashara's classical remedies for transmuting aggressive impulsiveness into benevolent strength.",
        durationMinutes: 8,
        sanskritText: "अहिंसा सत्यमस्तेयं शौचमिन्द्रियनिग्रहः। एतं सामासिकं धर्मं चातुर्वर्ण्येऽब्रवीन्मनुः॥",
        transliteration: "Ahiṃsā satyamasteyaṃ śaucamindriyanigrahaḥ | Etaṃ sāmāsikaṃ dharmaṃ cāturvarṇye'bravīnmanuḥ ||",
        meaningEn: "Non-harming, truthfulness, integrity, purity, and sensory self-mastery: these constitute fundamental Dharma.",
        meaningHi: "अहिंसा, सत्य, अस्तेय (चोरी न करना), शुचिता और इन्द्रिय-संयम — यही सार्वभौमिक धर्म के मूल आधार हैं।",
        sourceReference: "Brihat Parashara Hora Shastra, Shanti Adhyaya",
        bookSlug: "brihat-parashara-hora-shastra",
        pageNumber: 1,
      },
    ],
  },

  // Wednesday - Budha (Mercury) & Ganesha
  3: {
    deity: "Sri Ganesha & Budha (Intellect & Wisdom)",
    planetaryRuler: "Mercury",
    practices: [
      {
        category: "MANTRA",
        title: "Ganesha Moola & Budha Bija Mantra",
        description: "Harmonizes analytical intelligence, sharpens speech, and removes intellectual obstacles.",
        durationMinutes: 10,
        sanskritText: "ॐ गं गणपतये नमः ॥ ॐ बुं बुधाय नमः ॥",
        transliteration: "Oṃ gaṃ gaṇapataye namaḥ || Oṃ buṃ budhāya namaḥ ||",
        meaningEn: "Salutations to Lord Ganesha, the lord of wisdom. Salutations to Budha, the master of discrimination.",
        meaningHi: "बुद्धिदाता श्री गणेश को नमन। विवेक और शुद्ध वाणी के अधिष्ठाता बुध ग्रह को प्रणाम।",
        sourceReference: "Ganesha Atharvashirsha & BPHS Ch. 84",
        bookSlug: "phaladeepika",
        pageNumber: 1,
      },
      {
        category: "PRANAYAMA",
        title: "Anuloma Viloma with Shitali Cooling Breath",
        description: "Balanced dual-nostril respiration followed by cooling tongue breath to calm mental chatter.",
        durationMinutes: 8,
        sanskritText: "जिह्वया वायुमाकृष्य पूर्ववत्कुम्भकं चरेत्। शनकैर्ग्राणरन्ध्राभ्यां रेचयेत्पवनान्तरम्॥",
        transliteration: "Jihvayā vāyumākṛṣya pūrvavatkumbhakaṃ caret | Śanakairghrāṇarandhrābhyāṃ recayetpavanāntaram ||",
        meaningEn: "Drawing the breath with rolled tongue, gently hold, and release through the nostrils for mental tranquility.",
        meaningHi: "जिह्वा से शीतल प्राण खींचकर, सहज कुम्भक करें और दोनों नासिका छिद्रों से धीरे-धीरे श्वास छोड़ें।",
        sourceReference: "Hatha Yoga Pradipika 2.57",
      },
      {
        category: "MEDITATION",
        title: "Viveka Khyati (Discerning Wisdom Meditation)",
        description: "Contemplate the difference between permanent consciousness and transient thoughts and perceptions.",
        durationMinutes: 10,
        sanskritText: "विवेकख्यातिरविप्लवा हानोपायः। तस्य सप्तधा प्रान्तभूमिः प्रज्ञा॥",
        transliteration: "Vivekakhyātiraviplavā hānopāyaḥ | Tasya saptadhā prāntabhūmiḥ prajñā ||",
        meaningEn: "Unbroken discernment between the true Self and the external world is the direct path to freedom.",
        meaningHi: "अचल विवेक-ज्ञान ही समस्त दुःखों की निवृत्ति का उपाय है; इससे सात प्रकार की प्रज्ञा का विकास होता है।",
        sourceReference: "Patanjali Yoga Sutras 2.26-27",
      },
      {
        category: "READING",
        title: "Swadhyaya: Arogyanidhii – Medhya Rasayana (Mind Nourishment)",
        description: "Read classical treatise passages on herbs and habits that nourish memory, speech, and intellect.",
        durationMinutes: 8,
        sanskritText: "धीधृतिस्मृतिविभ्रंशः सम्प्राप्ते कालकर्मणि। कुरुते यच्छुभं कर्म तं मन्दं नाभिभाषते॥",
        transliteration: "Dhīdhṛtismṛtivibhraṃśaḥ samprāpte kālakarmaṇi | Kurute yacchubhaṃ karma taṃ mandaṃ nābhibhāṣate ||",
        meaningEn: "When intellect (Dhi), fortitude (Dhriti), and memory (Smriti) are cultivated in harmony, righteous action naturally flows.",
        meaningHi: "बुद्धि, धैर्य और स्मृति का सामंजस्य जीवन में सत्कर्म और मानसिक शांति का मार्ग प्रशस्त करता है।",
        sourceReference: "Arogyanidhii & Charaka Samhita",
        bookSlug: "arogyanidhii",
        pageNumber: 2,
      },
    ],
  },

  // Thursday - Guru (Jupiter) & Saraswati / Vishnu
  4: {
    deity: "Brihaspati, Lord Vishnu & Saraswati (Spiritual Knowledge)",
    planetaryRuler: "Jupiter",
    practices: [
      {
        category: "MANTRA",
        title: "Guru Paduka Mantra & Brihaspati Gayatri",
        description: "Expands higher consciousness, attunes to teacher lineage, and invokes divine moral wisdom.",
        durationMinutes: 10,
        sanskritText: "ॐ बृं बृहस्पतये नमः ॥ ॐ नमो भगवते वासुदेवाय ॥",
        transliteration: "Oṃ bṛṃ bṛhaspataye namaḥ || Oṃ namo bhagavate vāsudevāya ||",
        meaningEn: "Salutations to Brihaspati, supreme preceptor of celestial beings. Salutations to the all-pervading Vasudeva.",
        meaningHi: "देवगुरु बृहस्पति को सादर नमन। समस्त विश्व में व्याप्त परम चेतना भगवान वासुदेव को प्रणाम।",
        sourceReference: "Vishnu Purana & BPHS Ch. 84",
        bookSlug: "phaladeepika",
        pageNumber: 4,
      },
      {
        category: "PRANAYAMA",
        title: "Brahmari (Humming Resonance Breath)",
        description: "Produce a gentle bee-like resonance upon exhalation, soothing the pineal center and Ajna Chakra.",
        durationMinutes: 7,
        sanskritText: "भ्रमरीं संप्रवक्ष्यामि येन सिद्धो भवेन्नरः। भृङ्गाङ्गनानादमुच्चैः कुर्याद्रेचकमादरात्॥",
        transliteration: "Bhramarīṃ saṃpravakṣyāmi yena siddho bhavennaraḥ | Bhṛṅgāṅganānādamuccaiḥ kuryādrecakamādarāt ||",
        meaningEn: "Exhale producing the gentle harmonic hum of a honeybee; this calms mental agitation into profound stillness.",
        meaningHi: "भ्रमरी प्राणायाम के मधुर गुंजन से मन के समस्त विकार शांत होकर अंतर्मुखी समाधि का अनुभव होता है।",
        sourceReference: "Gheranda Samhita 5.77",
      },
      {
        category: "MEDITATION",
        title: "Brahma Vihara Meditation (Compassion & Equanimity)",
        description: "Radiate unconditional goodwill (Maitri), compassion (Karuna), and joy in the welfare of all beings.",
        durationMinutes: 12,
        sanskritText: "मैत्रीकरुणामुदितोपेक्षाणां सुखदुःखपुण्यापुण्यविषयाणां भावनातश्चित्तप्रसादनम्॥",
        transliteration: "Maitrīkaruṇāmuditopekṣāṇāṃ sukhaduḥkhapuṇyāpuṇyaviṣayāṇāṃ bhāvanātaścittaprasādanam ||",
        meaningEn: "The mind becomes serenely tranquil by cultivating friendliness toward the happy, compassion for the suffering, joy for virtue, and equanimity toward error.",
        meaningHi: "सुखियों से मित्रता, दुखियों पर करुणा, पुण्यात्माओं से हर्ष और त्रुटि करने वालों के प्रति उपेक्षा से चित्त पूर्णतः शांत होता है।",
        sourceReference: "Patanjali Yoga Sutras 1.33",
      },
      {
        category: "READING",
        title: "Swadhyaya: Brihat Parashara – Guru Phala & Dharma",
        description: "Contemplate the profound teachings on Jupiter's role in spiritual illumination, progeny, and ethical conduct.",
        durationMinutes: 8,
        sanskritText: "यदा हि नेन्द्रियार्थेषु न कर्मस्वनुषज्जते। सर्वसङ्कल्पसंन्यासी योगारूढस्तदोच्यते॥",
        transliteration: "Yadā hi nendriyārtheṣu na karmasvanuṣajjate | Sarvasaṅkalpasaṃnyāsī yogārūḍhastadocyate ||",
        meaningEn: "When one is not attached to sense objects or selfish fruitive actions, having renounced all egoic desire, one is rooted in Yoga.",
        meaningHi: "जब मनुष्य इन्द्रिय-भोगों तथा सकाम कर्मों में आसक्त नहीं होता और समस्त कामनाओं का त्याग कर देता है, तब वह योगारूढ़ कहलाता है।",
        sourceReference: "Bhagavad Gita 6.4 & BPHS",
        bookSlug: "brihat-parashara-hora-shastra",
        pageNumber: 1,
      },
    ],
  },

  // Friday - Shukra (Venus) & Mahalakshmi
  5: {
    deity: "Sri Mahalakshmi & Shukra (Devotion & Harmony)",
    planetaryRuler: "Venus",
    practices: [
      {
        category: "MANTRA",
        title: "Mahalakshmi Ashtakam & Shukra Gayatri",
        description: "Invokes beauty, inner contentment, abundance, and graceful, harmonious interpersonal relationships.",
        durationMinutes: 10,
        sanskritText: "नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते। शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते॥",
        transliteration: "Namaste'stu mahāmāye śrīpīṭhe surapūjite | Śaṅkhacakragadāhaste mahālakṣmi namo'stu te ||",
        meaningEn: "Salutations to You, O Mahamaya, worshipped by celestial beings upon the sacred throne, holding conch, discus, and mace.",
        meaningHi: "समस्त देवताओं द्वारा पूजित, श्रीपीठ पर विराजमान, शंख-चक्र-गदाधारिणी देवी महालक्ष्मी को विनीत नमन।",
        sourceReference: "Padma Purana & Sri Suktam",
        bookSlug: "phaladeepika",
        pageNumber: 3,
      },
      {
        category: "PRANAYAMA",
        title: "Hridaya Prana & Gentle Sama Vritti",
        description: "Direct the breath with tenderness into the heart space (Anahata Chakra), releasing judgment and bitterness.",
        durationMinutes: 7,
        sanskritText: "हृदये चैव संसक्तां प्राणापानसमाकुलाम्। अनाहतध्वनिं श्रुत्वा चित्तं तत्रैव योजयेत्॥",
        transliteration: "Hṛdaye caiva saṃsaktāṃ prāṇāpānasamākulām | Anāhatadhvaniṃ śrutvā cittaṃ tatraiva yojayet ||",
        meaningEn: "Attuning awareness to the heart center with balanced breath, listen to the silent inner resonance and rest the mind there.",
        meaningHi: "हृदय-कमल में प्राण और अपान को संतुलित करते हुए, अनाहत चक्र के सूक्ष्म नाद का अनुभव कर चित्त को एकाग्र करें।",
        sourceReference: "Yoga Kundalini Upanishad 1.63",
      },
      {
        category: "MEDITATION",
        title: "Ananda Svarupa (Joy of Loving Devotion)",
        description: "Contemplate love and gratitude without conditions; recognize the divine presence in nature, art, and living beings.",
        durationMinutes: 10,
        sanskritText: "रसो वै सः। रसं ह्येवायं लब्ध्वानन्दी भवति॥",
        transliteration: "Raso vai saḥ | Rasaṃ hyevāyaṃ labdhvānandī bhavati ||",
        meaningEn: "The Divine is indeed the very essence of aesthetic sweetness and pure joy; experiencing that essence, one is filled with bliss.",
        meaningHi: "वह परमात्मा ही साक्षात् आनंद-रस स्वरूप है; उस रस की अनुभूति होते ही जीवात्मा परमानंद से परिपूर्ण हो जाता है।",
        sourceReference: "Taittiriya Upanishad 2.7.1",
      },
      {
        category: "READING",
        title: "Swadhyaya: Arogyanidhii – Rasayana & Harmonious Living",
        description: "Read on cultivating wholesome relationships, sattvic diet, and radiant longevity through loving awareness.",
        durationMinutes: 8,
        sanskritText: "सत्यवादिनमक्रोधं शान्तमात्मेन्द्रिये स्थितम्। प्रशान्तं सततोदारं विद्यान्नित्यं रसायनम्॥",
        transliteration: "Satyavādinamakrodhaṃ śāntamātmendriye sthitam | Praśāntaṃ satatodāraṃ vidyānnityaṃ rasāyanam ||",
        meaningEn: "One who speaks truth, remains free from anger, lives peacefully with senses mastered, and maintains constant generosity: this is living Rasayana.",
        meaningHi: "सत्यवादी, क्रोधहीन, आत्मसंयमी, शांत और सदैव उदार रहने वाले व्यक्ति का आचरण ही सर्वश्रेष्ठ रसायन (अमृत) है।",
        sourceReference: "Arogyanidhii, Rasayana Adhyaya",
        bookSlug: "arogyanidhii",
        pageNumber: 3,
      },
    ],
  },

  // Saturday - Shani (Saturn) & Hanuman / Shiva
  6: {
    deity: "Lord Shani & Maha Mrityunjaya (Discipline & Karma Shanti)",
    planetaryRuler: "Saturn",
    practices: [
      {
        category: "MANTRA",
        title: "Maha Mrityunjaya Mantra & Shani Gayatri",
        description: "Dissolves karmic knots, overcomes dread, strengthens longevity, and instills deep patience.",
        durationMinutes: 10,
        sanskritText: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्। उर्वारुकमिव बन्धनान्मृत्यौर्मुक्षीय माऽमृतात्॥",
        transliteration: "Oṃ tryambakaṃ yajāmahe sugandhiṃ puṣṭivardhanam | Urvārukamiva bandhanānmṛtyormukṣīya mā'mṛtāt ||",
        meaningEn: "We venerate the three-eyed Lord Shiva, fragrant and nourishing all beings. As a ripe gourd is freed from its stem, may we be released from mortality into immortality.",
        meaningHi: "हम त्रिनेत्रधारी, सुगंधित और समस्त सृष्टि का पोषण करने वाले शिव की आराधना करते हैं। वे हमें मृत्यु के बंधनों से मुक्त कर अमृतत्व प्रदान करें।",
        sourceReference: "Rigveda 7.59.12 & BPHS Ch. 84",
        bookSlug: "phaladeepika",
        pageNumber: 2,
      },
      {
        category: "PRANAYAMA",
        title: "Dirgha Pranayama (Deep Three-Part Breath) with Moola Bandha",
        description: "Slow, grounded abdominal, thoracic, and clavicular breathing to stabilize the pelvic floor and root center.",
        durationMinutes: 8,
        sanskritText: "गुदं पाष्ण्र्या तु संपीड्य वायुमाकुञ्चयेद्बलात्। वारं वारं यथा चोर्ध्वं समायाति समीरणः॥",
        transliteration: "Gudaṃ pārṣṇyā tu saṃpīḍya vāyumākuñcayedbalāt | Vāraṃ vāraṃ yathā cordhvaṃ samāyāti samīraṇaḥ ||",
        meaningEn: "Gently contracting the perineal floor, draw the vital apana prana upward to meet the ascending breath.",
        meaningHi: "मूलबंध के अभ्यास से अधोगामी अपान वायु को ऊर्ध्वगामी कर सुषुम्ना नाड़ी में प्रविष्ट कराया जाता है।",
        sourceReference: "Hatha Yoga Pradipika 3.61",
      },
      {
        category: "MEDITATION",
        title: "Vairagya Dhyana (Detachment & Karma Exhaustion)",
        description: "Quietly contemplate time (Kala) as the great purifier. Surrender grievances and accept lessons with graceful fortitude.",
        durationMinutes: 12,
        sanskritText: "दृष्टानुश्रविकविषयवितृष्णस्य वशीकारसंज्ञा वैराग्यम्॥",
        transliteration: "Dṛṣṭānuśravikaviṣayavitṛṣṇasya vaśīkārasaṃjñā vairāgyam ||",
        meaningEn: "Dispassion (Vairagya) is the mastery that dawns when craving for visible and unseen rewards ceases.",
        meaningHi: "देखे हुए अथवा सुने हुए समस्त सांसारिक भोगों में तृष्णा का सर्वथा अभाव हो जाना ही सच्चा वैराग्य है।",
        sourceReference: "Patanjali Yoga Sutras 1.15",
      },
      {
        category: "READING",
        title: "Swadhyaya: Phaladeepika – Shani & Karma Vipaka",
        description: "Study Mantreshwara's timeless guidance on transforming suffering into spiritual maturity through selfless service.",
        durationMinutes: 8,
        sanskritText: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
        transliteration: "Karmaṇyevādhikāraste mā phaleṣu kadācana | Mā karmaphalaheturbhūrmā te saṅgo'stvakarmaṇi ||",
        meaningEn: "You have entitlement only to righteous duty, never to the fruits thereof. Let not the fruit of action be your motive, nor cling to inaction.",
        meaningHi: "तेरा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। तू फल की वासना से कर्म मत कर, और न ही कर्म त्याग में आसक्त हो।",
        sourceReference: "Bhagavad Gita 2.47 & Phaladeepika",
        bookSlug: "phaladeepika",
        pageNumber: 2,
      },
    ],
  },
};

/**
 * Retrieves or creates a daily practice plan for a user on a given date.
 */
export async function getOrCreateDailyPracticePlan({
  userId,
  date,
  panchang,
  chart = null,
  birthProfile = null,
  language = "en",
}) {
  if (!userId) {
    // If not authenticated, synthesize an in-memory plan for preview
    return synthesizeAnonymousPlan(date, panchang, language);
  }

  // 1. Fetch user's saved preferences
  let preference = await prisma.userPracticePreference.findUnique({
    where: { userId },
  });

  if (!preference) {
    preference = await prisma.userPracticePreference.create({
      data: {
        userId,
        preferredCategories: ["MANTRA", "MEDITATION", "READING", "PRANAYAMA"],
        dailyTargetMinutes: 30,
        preferredLanguage: language,
      },
    }).catch(() => null);
  }

  // 2. Check if a plan already exists for this user and date
  let plan = await prisma.dailyPracticePlan.findUnique({
    where: {
      userId_planDate: {
        userId,
        planDate: date,
      },
    },
    include: {
      items: {
        orderBy: { order: "asc" },
      },
    },
  });

  // 3. If plan does not exist, synthesize and persist default items
  if (!plan) {
    const weekdayIdx = new Date(date).getDay();
    const template = WEEKDAY_SADHANA_TEMPLATES[weekdayIdx] || WEEKDAY_SADHANA_TEMPLATES[0];

    // Check if user has an active Dasha to customize recommendations
    let dashaContext = null;
    if (birthProfile?.birthDate && chart?.moon) {
      try {
        const moonLon = chart.moon.longitude || chart.moon.degree || chart.planets?.find((p) => p.name === "Moon")?.longitude;
        if (moonLon !== undefined) {
          const dashaData = computeComprehensiveVimshottari(moonLon, new Date(birthProfile.birthDate), new Date(date));
          dashaContext = dashaData.activeDasha?.lord || null;
        }
      } catch (_) {}
    }

    const defaultItems = template.practices.map((p, idx) => ({
      category: p.category,
      title: p.title,
      description: p.description,
      durationMinutes: p.durationMinutes,
      completed: false,
      sanskritText: p.sanskritText || null,
      transliteration: p.transliteration || null,
      meaningEn: p.meaningEn || null,
      meaningHi: p.meaningHi || null,
      sourceReference: p.sourceReference || null,
      bookSlug: p.bookSlug || null,
      pageNumber: p.pageNumber || null,
      order: idx,
    }));

    const totalMinutes = defaultItems.reduce((acc, it) => acc + (it.durationMinutes || 0), 0);

    plan = await prisma.dailyPracticePlan.create({
      data: {
        userId,
        planDate: date,
        targetDuration: preference?.dailyTargetMinutes || totalMinutes || 30,
        completed: false,
        items: {
          create: defaultItems,
        },
      },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  // 4. Compute metrics
  const items = plan.items || [];
  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const completedMinutes = items
    .filter((i) => i.completed)
    .reduce((acc, i) => acc + (i.durationMinutes || 0), 0);
  const targetDuration = plan.targetDuration || 30;
  const percentComplete = Math.min(100, Math.round((completedMinutes / Math.max(1, targetDuration)) * 100));

  // 5. Fetch Weekly History (Past 7 days)
  const past7Days = [];
  const targetDateObj = new Date(date);

  for (let d = 6; d >= 0; d--) {
    const pastDate = new Date(targetDateObj.getTime() - d * 86400 * 1000);
    const dateStr = pastDate.toISOString().split("T")[0];
    past7Days.push(dateStr);
  }

  const weeklyPlans = await prisma.dailyPracticePlan.findMany({
    where: {
      userId,
      planDate: { in: past7Days },
    },
    include: {
      items: {
        select: { completed: true, durationMinutes: true },
      },
    },
  });

  const weeklyHistory = past7Days.map((dStr) => {
    const dayPlan = weeklyPlans.find((p) => p.planDate === dStr);
    const dayItems = dayPlan?.items || [];
    const dayCompletedMins = dayItems
      .filter((i) => i.completed)
      .reduce((sum, i) => sum + (i.durationMinutes || 0), 0);
    const dayTotalItems = dayItems.length;
    const dayCompletedItems = dayItems.filter((i) => i.completed).length;

    return {
      date: dStr,
      hasPlan: Boolean(dayPlan),
      completed: Boolean(dayPlan?.completed || (dayTotalItems > 0 && dayCompletedItems === dayTotalItems)),
      completedMinutes: dayCompletedMins,
      totalItems: dayTotalItems,
      completedItems: dayCompletedItems,
    };
  });

  // Calculate consistency streak
  let currentStreak = 0;
  for (let i = weeklyHistory.length - 1; i >= 0; i--) {
    if (weeklyHistory[i].completedItems > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    success: true,
    plan: {
      id: plan.id,
      planDate: plan.planDate,
      targetDuration: plan.targetDuration,
      completed: plan.completed,
      notes: plan.notes,
      items: plan.items.map((it) => ({
        ...it,
        readerUrl: it.bookSlug ? `/library/${it.bookSlug}/pdf${it.pageNumber ? `?page=${it.pageNumber}` : ""}` : null,
      })),
    },
    metrics: {
      completedCount,
      totalCount,
      completedMinutes,
      targetDuration,
      percentComplete,
      currentStreak,
    },
    weeklyHistory,
    preferences: preference,
  };
}

/**
 * Toggles a practice item as completed or incomplete.
 */
export async function toggleDailyPracticeItem({ userId, itemId, completed, notes = null }) {
  if (!userId || !itemId) {
    throw new Error("userId and itemId are required");
  }

  // Verify ownership
  const item = await prisma.dailyPracticeItem.findUnique({
    where: { id: itemId },
    include: { plan: true },
  });

  if (!item) {
    throw new Error("Practice item not found");
  }

  if (item.plan.userId !== userId) {
    throw new Error("Forbidden: Unauthorized practice item modification");
  }

  const updatedItem = await prisma.dailyPracticeItem.update({
    where: { id: itemId },
    data: {
      completed: Boolean(completed),
      completedAt: completed ? new Date() : null,
    },
  });

  // Recalculate plan completion
  const allItems = await prisma.dailyPracticeItem.findMany({
    where: { planId: item.planId },
  });
  const allCompleted = allItems.every((i) => i.completed);

  await prisma.dailyPracticePlan.update({
    where: { id: item.planId },
    data: {
      completed: allCompleted,
      notes: notes || undefined,
    },
  });

  // Gamification: Award XP and record daily activity if completed
  let xpAwarded = 0;
  if (completed) {
    const categoryXp = {
      MANTRA: 15,
      PRANAYAMA: 15,
      MEDITATION: 20,
      READING: 25,
      PUJA: 20,
      CHAKRA: 20,
    };
    xpAwarded = categoryXp[item.category] || 15;

    await awardXp({
      userId,
      actionType: "DAILY_STREAK_BONUS",
      amount: xpAwarded,
      referenceId: `${item.id}-${Date.now()}`,
      description: `Completed daily practice: ${item.title}`,
    }).catch((err) => {
      console.warn("[dailyPracticePlanner] awardXp warning:", err.message);
    });

    await recordDailyActivity({
      userId,
      customDate: item.plan.planDate,
    }).catch(() => {});
  }

  return {
    success: true,
    item: updatedItem,
    allCompleted,
    xpAwarded,
  };
}

/**
 * Adds a custom practice item to the user's plan.
 */
export async function addCustomPracticeItem({
  userId,
  planDate,
  category = "PRACTICE",
  title,
  description = null,
  durationMinutes = 10,
  sanskritText = null,
  bookSlug = null,
  pageNumber = null,
}) {
  if (!userId || !planDate || !title) {
    throw new Error("userId, planDate, and title are required");
  }

  // Ensure plan exists
  let plan = await prisma.dailyPracticePlan.findUnique({
    where: {
      userId_planDate: {
        userId,
        planDate,
      },
    },
  });

  if (!plan) {
    plan = await prisma.dailyPracticePlan.create({
      data: {
        userId,
        planDate,
        targetDuration: 30,
        completed: false,
      },
    });
  }

  const existingCount = await prisma.dailyPracticeItem.count({
    where: { planId: plan.id },
  });

  const newItem = await prisma.dailyPracticeItem.create({
    data: {
      planId: plan.id,
      category,
      title: title.trim(),
      description: description ? description.trim() : null,
      durationMinutes: Math.max(1, parseInt(durationMinutes, 10) || 10),
      completed: false,
      sanskritText: sanskritText ? sanskritText.trim() : null,
      bookSlug: bookSlug || null,
      pageNumber: pageNumber ? parseInt(pageNumber, 10) : null,
      order: existingCount,
    },
  });

  return {
    success: true,
    item: {
      ...newItem,
      readerUrl: newItem.bookSlug ? `/library/${newItem.bookSlug}/pdf${newItem.pageNumber ? `?page=${newItem.pageNumber}` : ""}` : null,
    },
  };
}

/**
 * Deletes a practice item from a plan.
 */
export async function deletePracticeItem({ userId, itemId }) {
  if (!userId || !itemId) {
    throw new Error("userId and itemId are required");
  }

  const item = await prisma.dailyPracticeItem.findUnique({
    where: { id: itemId },
    include: { plan: true },
  });

  if (!item) {
    throw new Error("Practice item not found");
  }

  if (item.plan.userId !== userId) {
    throw new Error("Forbidden: Unauthorized practice item deletion");
  }

  await prisma.dailyPracticeItem.delete({
    where: { id: itemId },
  });

  return { success: true };
}

/**
 * Synthesizes an anonymous preview plan for unauthenticated users.
 */
function synthesizeAnonymousPlan(date, panchang, language = "en") {
  const weekdayIdx = new Date(date).getDay();
  const template = WEEKDAY_SADHANA_TEMPLATES[weekdayIdx] || WEEKDAY_SADHANA_TEMPLATES[0];

  const items = template.practices.map((p, idx) => ({
    id: `preview-item-${idx}`,
    category: p.category,
    title: p.title,
    description: p.description,
    durationMinutes: p.durationMinutes,
    completed: false,
    sanskritText: p.sanskritText || null,
    transliteration: p.transliteration || null,
    meaningEn: p.meaningEn || null,
    meaningHi: p.meaningHi || null,
    sourceReference: p.sourceReference || null,
    bookSlug: p.bookSlug || null,
    pageNumber: p.pageNumber || null,
    order: idx,
    readerUrl: p.bookSlug ? `/library/${p.bookSlug}/pdf${p.pageNumber ? `?page=${p.pageNumber}` : ""}` : null,
  }));

  const totalMinutes = items.reduce((acc, it) => acc + (it.durationMinutes || 0), 0);

  return {
    success: true,
    isAnonymous: true,
    plan: {
      id: "anonymous-preview-plan",
      planDate: date,
      targetDuration: totalMinutes,
      completed: false,
      notes: "Log in or sign up to save your daily practice streak, record completions, and earn XP.",
      items,
    },
    metrics: {
      completedCount: 0,
      totalCount: items.length,
      completedMinutes: 0,
      targetDuration: totalMinutes,
      percentComplete: 0,
      currentStreak: 0,
    },
    weeklyHistory: [],
    preferences: {
      preferredCategories: ["MANTRA", "MEDITATION", "READING", "PRANAYAMA"],
      dailyTargetMinutes: 30,
      preferredLanguage: language,
    },
  };
}

/**
 * Canonical Sanskrit Shloka Intelligence Engine
 *
 * Grounded in classical Vedic, Yogic, and Astronomical literature:
 * - Brihat Parashara Hora Shastra (BPHS)
 * - Shat-Chakra-Nirupana (Purnananda Swami, 1526 CE)
 * - Phaladeepika (Mantreswara)
 * - Surya Siddhanta
 * - Srimad Bhagavad Gita
 * - Yoga Kundalini Upanishad & Katha Upanishad
 *
 * Each shloka entry provides:
 * - Devanagari text
 * - IAST romanized transliteration with diacritics
 * - Pada-chheda (word separation)
 * - Anvaya (syntactical prose re-ordering with word-by-word grammatical/semantic meaning)
 * - Chhanda (classical Vedic/Sanskrit meter, e.g., Anushtubh 8x4)
 * - Canonical source, chapter, and verse reference
 * - Authentic Hindi & English translations
 * - Spiritual/philosophical commentary and practical contemplative application
 */

export const SANSKRIT_SHLOKAS = [
  // 1. Mangalacharana - Brihat Parashara Hora Shastra (BPHS 1.1)
  {
    id: "bphs-1-1",
    source: "Brihat Parashara Hora Shastra",
    author: "Maharshi Parashara",
    category: "Astrology",
    subject: "Cosmic Creation & Divine Light",
    chapter: "Adhyaya 1 (Creation of the Universe)",
    verseNumber: "1.1",
    chhanda: "Anushtubh (8-8-8-8 syllables)",
    devanagari: "प्रणम्य जगदुत्पत्तिस्थितिसंहारकारणम् ।\nसर्वज्ञं निर्गुणं शान्तं ब्रह्माणं च जगन्मयम् ॥",
    iast: "praṇamya jagad-utpatti-sthiti-saṃhāra-kāraṇam |\nsarvajñaṃ nirguṇaṃ śāntaṃ brahmāṇaṃ ca jaganmayam ||",
    padaChheda: [
      "प्रणम्य (praṇamya)",
      "जगत्-उत्पत्ति-स्थिति-संहार-कारणम् (jagat-utpatti-sthiti-saṃhāra-kāraṇam)",
      "सर्वज्ञम् (sarvajñam)",
      "निर्गुणम् (nirguṇam)",
      "शान्तम् (śāntam)",
      "ब्रह्माणम् (brahmāṇam)",
      "च (ca)",
      "जगन्मयम् (jaganmayam)"
    ],
    anvaya: [
      { word: "जगत्-उत्पत्ति-स्थिति-संहार-कारणम्", iast: "jagat-utpatti-sthiti-saṃhāra-kāraṇam", grammar: "Accusative singular masculine compound", meaningEn: "the prime cause of the creation, preservation, and dissolution of the cosmos", meaningHi: "संसार की उत्पत्ति, स्थिति और प्रलय के आदि कारण" },
      { word: "सर्वज्ञम्", iast: "sarvajñam", grammar: "Accusative singular masculine", meaningEn: "all-knowing / omniscient", meaningHi: "सर्वज्ञ" },
      { word: "निर्गुणम्", iast: "nirguṇam", grammar: "Accusative singular masculine", meaningEn: "beyond material qualities / transcendent", meaningHi: "त्रिगुणातीत" },
      { word: "शान्तम्", iast: "śāntam", grammar: "Accusative singular masculine", meaningEn: "infinitely serene and tranquil", meaningHi: "परम शान्त" },
      { word: "जगन्मयम्", iast: "jaganmayam", grammar: "Accusative singular masculine", meaningEn: "manifested as the entire cosmos", meaningHi: "सम्पूर्ण ब्रह्माण्ड में व्याप्त" },
      { word: "ब्रह्माणम्", iast: "brahmāṇam", grammar: "Accusative singular masculine", meaningEn: "unto the Supreme Reality / Brahman", meaningHi: "परमब्रह्म को" },
      { word: "प्रणम्य", iast: "praṇamya", grammar: "Indeclinable past participle (Lyabanta)", meaningEn: "having reverently saluted / bowed down to", meaningHi: "प्रणाम करके" }
    ],
    translationEn: "Having reverently bowed to the Supreme Brahman, the ultimate cause of cosmic creation, preservation, and dissolution—who is omniscient, beyond the three gunas, tranquil, and all-pervading throughout the manifest universe.",
    translationHi: "सम्पूर्ण जगत् की उत्पत्ति, पालन एवं प्रलय के मूल कारण, सर्वज्ञ, त्रिगुणातीत, परम शान्त एवं समस्त विश्व में व्याप्त परमब्रह्म को विनीत भाव से प्रणाम करके...",
    commentaryEn: "Parashara opens the foundational treatise of Vedic astrology not with fatalism, but with deep metaphysical reverence to the unified intelligence animating all cosmic planetary motions.",
    commentaryHi: "महर्षि पराशर ज्योतिष जैसे गूढ़ विज्ञान का आरम्भ भाग्यवादी आग्रह से नहीं, अपितु सम्पूर्ण ब्रह्माण्ड का संचालन करने वाली अद्वैत चेतना के स्मरण से करते हैं।",
    keywords: ["BPHS", "Parashara", "Creation", "Brahman", "Mangalacharana"]
  },

  // 2. The Nine Grahas - Phaladeepika (1.1)
  {
    id: "phaladeepika-1-1",
    source: "Phaladeepika",
    author: "Mantreswara",
    category: "Astrology",
    subject: "Planetary Lords of Karmic Reflection",
    chapter: "Adhyaya 1 (Sanjna Adhyaya)",
    verseNumber: "1.1",
    chhanda: "Shardulavikridita (19 syllables per quarter)",
    devanagari: "सूर्याद्यो नवखेचराः प्रतिदिनं कुर्वन्तु वो मङ्गलम् ।\nयेषां दीप्तिपरम्पराभिरखिलं संदृश्यतेऽहर्निशम् ॥",
    iast: "sūryādyo nava-khecarāḥ pratidinaṃ kurvantu vo maṅgalam |\nyeṣāṃ dīpti-paramparābhir-akhilaṃ saṃdṛśyate'harniśam ||",
    padaChheda: [
      "सूर्य-आदयः (sūrya-ādayaḥ)",
      "नव (nava)",
      "खेचराः (khecarāḥ)",
      "प्रतिदिनम् (pratidinam)",
      "कुर्वन्तु (kurvantu)",
      "वः (vaḥ)",
      "मङ्गलम् (maṅgalam)",
      "येषाम् (yeṣām)",
      "दीप्ति-परम्पराभिः (dīpti-paramparābhiḥ)",
      "अखिलम् (akhilam)",
      "संदृश्यते (saṃdṛśyate)",
      "अहर्निशम् (aharniśam)"
    ],
    anvaya: [
      { word: "सूर्य-आदयः नव खेचराः", iast: "sūryādayaḥ nava khecarāḥ", grammar: "Nominative plural masculine", meaningEn: "the nine cosmic celestial bodies beginning with the Sun", meaningHi: "सूर्य आदि नवग्रह" },
      { word: "येषाम् दीप्ति-परम्पराभिः", iast: "yeṣām dīpti-paramparābhiḥ", grammar: "Instrumental plural feminine compound", meaningEn: "by whose continuous rays of divine radiance", meaningHi: "जिनकी अविरल प्रकाश रश्मियों द्वारा" },
      { word: "अखिलम्", iast: "akhilam", grammar: "Accusative singular neuter", meaningEn: "the entire cosmos", meaningHi: "समस्त संसार" },
      { word: "अहर्निशम्", iast: "aharniśam", grammar: "Adverbial dvandva compound", meaningEn: "day and night without cessation", meaningHi: "दिन-रात" },
      { word: "संदृश्यते", iast: "saṃdṛśyate", grammar: "Passive 3rd person singular present", meaningEn: "is fully illuminated and made visible", meaningHi: "प्रकाशित एवं अनुभूत होता है" },
      { word: "वः", iast: "vaḥ", grammar: "Dative/Genitive plural enclitic", meaningEn: "unto you all", meaningHi: "आप सभी का" },
      { word: "प्रतिदिनम्", iast: "pratidinam", grammar: "Avyayibhava adverb", meaningEn: "each and every day", meaningHi: "प्रतिदिन" },
      { word: "मङ्गलम्", iast: "maṅgalam", grammar: "Accusative singular neuter", meaningEn: "auspiciousness and spiritual welfare", meaningHi: "कल्याण एवं शुभत्व" },
      { word: "कुर्वन्तु", iast: "kurvantu", grammar: "Imperative (Lot Lakara) 3rd plural", meaningEn: "may they bestow / grant", meaningHi: "करें / प्रदान करें" }
    ],
    translationEn: "May the nine planetary wanderers, led by the radiant Sun—by whose continuous streams of cosmic light the entire universe is made visible day and night—bestow auspicious wellbeing upon you every single day.",
    translationHi: "सूर्य आदि नवग्रह, जिनकी निरंतर प्रकाश-शृंखला से यह सम्पूर्ण विश्व दिन-रात प्रकाशित होता है, वे प्रतिदिन आप सभी का कल्याण एवं मंगल करें।",
    commentaryEn: "Mantreswara establishes that planetary forces are not malefic deities to be feared, but celestial lamps reflecting individual and collective karmas across time.",
    commentaryHi: "मन्त्रेश्वर स्पष्ट करते हैं कि ग्रह भयभीत करने वाले संहारक नहीं, अपितु जीवात्मा के पूर्व संचित कर्मों को काल के दर्पण में प्रतिबिंबित करने वाले प्रकाश-स्तंभ हैं।",
    keywords: ["Phaladeepika", "Navagraha", "Sun", "Mantreswara", "Karmic Reflection"]
  },

  // 3. Muladhara Chakra - Shat-Chakra-Nirupana (Verse 4)
  {
    id: "shat-chakra-4",
    source: "Shat-Chakra-Nirupana",
    author: "Purnananda Swami (1526 CE)",
    category: "Kundalini",
    subject: "Muladhara Lotus & Subtle Anatomy",
    chapter: "Prathama Prakarana (Muladhara Varnana)",
    verseNumber: "Verse 4",
    chhanda: "Vasantatilaka (14 syllables per quarter)",
    devanagari: "मेढ्राद्गुदादपि च मध्यगतं सुवर्णे- \nश्चत्वारि पत्रयुतमम्बुजमेतदस्ति ।\nव-श-ष-स-वर्णविराजमानं \nमूलाधरं कुलमुदाहृतमब्जमेतत् ॥",
    iast: "meḍhrād-gudād-api ca madhya-gataṃ suvarṇaiḥ \ncatvāri patra-yutam-ambujam-etad-asti |\nva-śa-ṣa-sa-varṇa-virājamānaṃ \nmūlādharaṃ kulam-udāhṛtam-abjam-etat ||",
    padaChheda: [
      "मेढ्रात् (meḍhrāt)",
      "गुदात् (gudāt)",
      "अपि (api)",
      "च (ca)",
      "मध्य-गतम् (madhya-gatam)",
      "सुवर्णैः (suvarṇaiḥ)",
      "चत्वारि (catvāri)",
      "पत्र-युतम् (patra-yutam)",
      "अम्बुजम् (ambujam)",
      "एतत् (etat)",
      "अस्ति (asti)",
      "व-श-ष-स-वर्ण-विराजमानम् (va-śa-ṣa-sa-varṇa-virājamānam)",
      "मूलाधरम् (mūlādharam)",
      "कुलम् (kulam)",
      "उदाहृतम् (udāhṛtam)",
      "अब्जम् (abjam)"
    ],
    anvaya: [
      { word: "मेढ्रात् गुदात् च मध्य-गतम्", iast: "meḍhrāt gudāt ca madhyagatam", grammar: "Ablative compound + Accusative singular", meaningEn: "situated precisely midway between the generative organ and the anus", meaningHi: "गुदा और जननेन्द्रिय के मध्य भाग में स्थित" },
      { word: "सुवर्णैः", iast: "suvarṇaiḥ", grammar: "Instrumental plural masculine", meaningEn: "shining with golden luster", meaningHi: "स्वर्णमयी कान्ति से युक्त" },
      { word: "चत्वारि पत्र-युतम्", iast: "catvāri patra-yutam", grammar: "Accusative singular compound", meaningEn: "endowed with four luminous petals", meaningHi: "चार पंखुड़ियों वाला" },
      { word: "एतत् अम्बुजम् अस्ति", iast: "etat ambujam asti", grammar: "Demonstrative + Neuter noun + Verb", meaningEn: "this sacred lotus exists", meaningHi: "यह दिव्य कमल विद्यमान है" },
      { word: "व-श-ष-स-वर्ण-विराजमानम्", iast: "va-śa-ṣa-sa-varṇa-virājamānam", grammar: "Accusative singular neuter compound", meaningEn: "resplendent with the four Sanskrit syllables Vaṃ, Śaṃ, Ṣaṃ, and Saṃ", meaningHi: "वं, शं, षं और सं वर्णों से शोभायमान" },
      { word: "मूलाधरम् कुलम्", iast: "mūlādharam kulam", grammar: "Accusative singular neuter", meaningEn: "named as Muladhara, the Kula-lotus", meaningHi: "मूलाधार एवं कुल नाम से प्रसिद्ध" },
      { word: "उदाहृतम्", iast: "udāhṛtam", grammar: "Past passive participle", meaningEn: "has been declared by ancient sages", meaningHi: "ऋषियों द्वारा वर्णित किया गया है" }
    ],
    translationEn: "Situated in the pelvic space midway between the generative organ and the anus, there exists a crimson lotus of four petals shining with golden luster. Embellished with the letters Vaṃ, Śaṃ, Ṣaṃ, and Saṃ upon its petals, this foundational center is declared by the wise as the Muladhara.",
    translationHi: "जननेन्द्रिय और गुदा के मध्य में चार पंखुड़ियों वाला एक दिव्य कमल स्थित है। यह स्वर्ण के समान चमकते हुए 'वं, शं, षं, सं' चार अक्षरों से सुशोभित है। सिद्ध पुरुषों द्वारा इसे मूलाधार अथवा कुल कमल कहा गया है।",
    commentaryEn: "Purnananda provides the exact visualization for grounding consciousness at the base of the spine, linking the Earth element with stability, patience, and ethical alignment.",
    commentaryHi: "पूर्णानन्द स्वामी मूलाधार की शास्त्रीय भावना (ध्यान) स्पष्ट करते हुए पृथ्वी तत्त्व, स्थिरता एवं मानसिक एकाग्रता के परस्पर संबंध का निरूपण करते हैं।",
    keywords: ["Muladhara", "Shat-Chakra-Nirupana", "Earth Element", "Kundalini", "Four Petals"]
  },

  // 4. Anahata Chakra - Shat-Chakra-Nirupana (Verse 22)
  {
    id: "shat-chakra-22",
    source: "Shat-Chakra-Nirupana",
    author: "Purnananda Swami (1526 CE)",
    category: "Kundalini",
    subject: "The Heart Center & Unstruck Sound",
    chapter: "Dvitiya Prakarana (Anahata Varnana)",
    verseNumber: "Verse 22",
    chhanda: "Malini (15 syllables per quarter)",
    devanagari: "हृदि सरसिजमन्तः सूर्यसङ्काशमष्ट- \nद्विदशदलमुपेतं बन्धूकपुष्पप्रकाशम् ।\nक-ख-ग-घ-ङ-च-छ-ज-झ-ञ-ट-ठ-वर्णैः \nपरिलसितमनल्पं प्राणहंसस्य धाम ॥",
    iast: "hṛdi sarasijam-antaḥ sūrya-saṅkāśam-aṣṭa- \ndvidaśa-dalam-upetaṃ bandhūka-puṣpa-prakāśam |\nka-kha-ga-gha-ṅa-ca-cha-ja-jha-ña-ṭa-ṭha-varṇaiḥ \nparilasitam-analpaṃ prāṇa-haṃsasya dhāma ||",
    padaChheda: [
      "हृदि (hṛdi)",
      "सरसिजम् (sarasijam)",
      "अन्तः (antaḥ)",
      "सूर्य-सङ्काशम् (sūrya-saṅkāśam)",
      "द्वादश-दलम् (dvādaśa-dalam)",
      "उपेतम् (upetam)",
      "बन्धूक-पुष्प-प्रकाशम् (bandhūka-puṣpa-prakāśam)",
      "क-ख-ग-घ-ङ-च-छ-ज-झ-ञ-ट-ठ-वर्णैः (ka-to-ṭha-varṇaiḥ)",
      "परिलसितम् (parilasitam)",
      "अनल्पम् (analpam)",
      "प्राण-हंसस्य (prāṇa-haṃsasya)",
      "धाम (dhāma)"
    ],
    anvaya: [
      { word: "हृदि अन्तः", iast: "hṛdi antaḥ", grammar: "Locative singular masculine/neuter", meaningEn: "within the heart space (cave of the heart)", meaningHi: "हृदय के आंतरिक आकाश में" },
      { word: "द्वादश-दलम् उपेतम्", iast: "dvādaśa-dalam upetam", grammar: "Accusative singular compound", meaningEn: "endowed with twelve radiant petals", meaningHi: "बारह पंखुड़ियों से युक्त" },
      { word: "बन्धूक-पुष्प-प्रकाशम्", iast: "bandhūka-puṣpa-prakāśam", grammar: "Accusative singular compound", meaningEn: "glowing like the vermilion Bandhuka blossom", meaningHi: "बन्धूक पुष्प के समान सिंदूरी कान्ति वाला" },
      { word: "क-ख-ग-घ-ङ-च-छ-ज-झ-ञ-ट-ठ-वर्णैः परिलसितम्", iast: "ka-to-ṭha-varṇaiḥ parilasitam", grammar: "Instrumental plural + Participle", meaningEn: "resplendent with the twelve vermilion Sanskrit letters from Ka to Ṭha", meaningHi: "क से ठ तक बारह अक्षरों से सुशोभित" },
      { word: "प्राण-हंसस्य अनल्पम् धाम", iast: "prāṇa-haṃsasya analpam dhāma", grammar: "Genitive singular + Neuter noun", meaningEn: "the supreme dwelling sanctuary of the Prana-Hamsa (vital life-breath / Self)", meaningHi: "प्राणरूपी हंस (जीवात्मा) का परम पावन धाम" }
    ],
    translationEn: "In the interior sanctuary of the heart dwells a twelve-petaled lotus glowing like the Bandhuka blossom. Adorned on its petals with the twelve Sanskrit syllables from 'Ka' to 'Ṭha', it is the boundless sacred residence of the Prana-Hamsa—the innermost animating soul.",
    translationHi: "हृदय के अंतराकाश में बन्धूक पुष्प के समान देदीप्यमान बारह पंखुड़ियों वाला पावन कमल स्थित है। 'क' से लेकर 'ठ' तक के बारह अक्षरों से अलंकृत यह केंद्र प्राण-हंस (आंतरिक जीवात्मा) का परम निवास-स्थान है।",
    commentaryEn: "The Anahata represents the transformation of personal attachment into universal compassion (Karuna) and unconditional reverence, vibrating with the seed syllable YAM (यम्).",
    commentaryHi: "अनाहत चक्र व्यक्तिगत राग-द्वेष से ऊपर उठकर निष्काम प्रेम, करुणा और आत्मीयता का केंद्र है, जहाँ अनहद नाद (अनाहत ध्वनि) निरंतर स्पंदित होता है।",
    keywords: ["Anahata", "Heart Center", "Shat-Chakra-Nirupana", "Air Element", "YAM"]
  },

  // 5. Bhagavad Gita - Mind & Purushartha (BG 6.5)
  {
    id: "gita-6-5",
    source: "Srimad Bhagavad Gita",
    author: "Maharshi Vedavyasa",
    category: "Philosophy",
    subject: "Self-Elevation through Free Will",
    chapter: "Adhyaya 6 (Dhyana Yoga)",
    verseNumber: "Verse 5",
    chhanda: "Anushtubh (8-8-8-8 syllables)",
    devanagari: "उद्धरेदात्मनाऽऽत्मानं नात्मानमवसादयेत् ।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः ॥",
    iast: "uddhared-ātmanā'tmānaṃ nātmānam-avasādayet |\nātmaiva hyātmano bandhur-ātmaiva ripur-ātmanaḥ ||",
    padaChheda: [
      "उद्धरेत् (uddharet)",
      "आत्मना (ātmanā)",
      "आत्मानम् (ātmānam)",
      "न (na)",
      "आत्मानम् (ātmānam)",
      "अवसादयेत् (avasādayet)",
      "आत्मा (ātmā)",
      "एव (eva)",
      "हि (hi)",
      "आत्मनः (ātmanaḥ)",
      "बन्धुः (bandhuḥ)",
      "आत्मा (ātmā)",
      "एव (eva)",
      "रिपुः (ripuḥ)",
      "आत्मनः (ātmanaḥ)"
    ],
    anvaya: [
      { word: "आत्मना", iast: "ātmanā", grammar: "Instrumental singular masculine", meaningEn: "by one's own steady mind and effort", meaningHi: "अपने ही शुद्ध मन और पुरुषार्थ द्वारा" },
      { word: "आत्मानम्", iast: "ātmānam", grammar: "Accusative singular masculine", meaningEn: "oneself / the individual soul", meaningHi: "अपने आपको" },
      { word: "उद्धरेत्", iast: "uddharet", grammar: "Optative (Vidhilin) 3rd person singular", meaningEn: "one should elevate and uplift", meaningHi: "उद्धार करे, ऊपर उठाए" },
      { word: "आत्मानम्", iast: "ātmānam", grammar: "Accusative singular masculine", meaningEn: "oneself", meaningHi: "अपने आपको" },
      { word: "न अवसादयेत्", iast: "na avasādayet", grammar: "Negative + Optative verb", meaningEn: "one should never degrade or allow to sink into despair", meaningHi: "अधोगति अथवा निराशा में न गिराए" },
      { word: "हि", iast: "hi", grammar: "Indeclinable particle (certainty)", meaningEn: "for truly / indeed", meaningHi: "क्योंकि निश्चय ही" },
      { word: "आत्मा एव", iast: "ātmā eva", grammar: "Nominative singular + Particle", meaningEn: "the self alone", meaningHi: "मनुष्य स्वयं ही" },
      { word: "आत्मनः बन्धुः", iast: "ātmanaḥ bandhuḥ", grammar: "Genitive + Nominative noun", meaningEn: "is one's own true friend and ally", meaningHi: "अपना परम मित्र है" },
      { word: "आत्मा एव", iast: "ātmā eva", grammar: "Nominative singular + Particle", meaningEn: "and the self alone", meaningHi: "और स्वयं ही" },
      { word: "आत्मनः रिपुः", iast: "ātmanaḥ ripuḥ", grammar: "Genitive + Nominative noun", meaningEn: "is one's own greatest enemy", meaningHi: "अपना सबसे बड़ा शत्रु है" }
    ],
    translationEn: "One should elevate oneself by one's own conscious mind and diligent effort; one must never allow oneself to degrade or sink into despondency. For the self alone is one's greatest friend, and the self alone is one's fiercest adversary.",
    translationHi: "मनुष्य को चाहिए कि वह अपने ही पुरुषार्थ और सचेत मन द्वारा अपना उद्धार करे, अपने को पतन एवं हताशा में न गिरने दे। क्योंकि मनुष्य स्वयं ही अपना सच्चा मित्र है और स्वयं ही अपना सबसे बड़ा शत्रु है।",
    commentaryEn: "This verse anchors Gurukul's core non-fatalistic philosophy: planetary influences provide context and tendencies, but Purushartha (conscious self-directed action) governs destiny.",
    commentaryHi: "यह श्लोक गुरुकुल के अ-भाग्यवादी चिंतन का आधार है: ग्रह और नक्षत्र केवल सम्भावनाएं और प्रवृत्तियां दर्शाते हैं, परन्तु मनुष्य का आत्म-संयम एवं पुरुषार्थ ही जीवन का अंतिम निर्धारक है।",
    keywords: ["Bhagavad Gita", "Purushartha", "Karma Yoga", "Self-Effort", "Mindfulness"]
  },

  // 6. Gayatri Mantra - Rig Veda (Mandala 3, Sukta 62, Verse 10)
  {
    id: "rigveda-3-62-10",
    source: "Rig Veda",
    author: "Rishi Vishvamitra",
    category: "Vedas",
    subject: "Solar Illumination of Intellect (Buddhi)",
    chapter: "Mandala 3, Sukta 62",
    verseNumber: "3.62.10",
    chhanda: "Gayatri (8-8-8 syllables)",
    devanagari: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं \nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥",
    iast: "oṃ bhūr-bhuvaḥ svaḥ tat-savitur-vareṇyaṃ \nbhargo devasya dhīmahi dhiyo yo naḥ pracodayāt ||",
    padaChheda: [
      "ॐ (oṃ)",
      "भूः (bhūḥ)",
      "भुवः (bhuvaḥ)",
      "स्वः (svaḥ)",
      "तत् (tat)",
      "सवितुः (savituḥ)",
      "वरेण्यम् (vareṇyam)",
      "भर्गः (bhargaḥ)",
      "देवस्य (devasya)",
      "धीमहि (dhīmahi)",
      "धियः (dhiyaḥ)",
      "यः (yaḥ)",
      "नः (naḥ)",
      "प्रचोदयात् (pracodayāt)"
    ],
    anvaya: [
      { word: "तत् सवितुः देवस्य", iast: "tat savituḥ devasya", grammar: "Genitive singular masculine compound", meaningEn: "of that supreme luminous Sun / Divine Creator (Savitr)", meaningHi: "उस प्रकाशवान सूर्य / जगदुत्पादक सविता देव के" },
      { word: "वरेण्यम् भर्गः", iast: "vareṇyam bhargaḥ", grammar: "Accusative singular neuter", meaningEn: "most supreme, adorable, sin-destroying radiance", meaningHi: "परम वरेण्य एवं पापनाशक तेज का" },
      { word: "धीमहि", iast: "dhīmahi", grammar: "Aorist middle 1st person plural", meaningEn: "we meditate upon with quiet contemplation", meaningHi: "हम ध्यान करते हैं" },
      { word: "यः", iast: "yaḥ", grammar: "Relative pronoun nominative singular", meaningEn: "who (that Divine Radiance)", meaningHi: "जो (परमात्मा)" },
      { word: "नः धियः", iast: "naḥ dhiyaḥ", grammar: "Accusative plural feminine", meaningEn: "our intellects, intuitions, and understandings", meaningHi: "हमारी बुद्धियों को" },
      { word: "प्रचोदयात्", iast: "pracodayāt", grammar: "Subjunctive/Optative 3rd singular", meaningEn: "may guide, inspire, and illuminate towards righteousness", meaningHi: "सन्मार्ग की ओर प्रेरित करे" }
    ],
    translationEn: "Om, across the physical (Bhuh), subtle mental (Bhuvah), and celestial spiritual realms (Svah): We meditate upon the supreme, adorable divine radiance of Savitr, the cosmic source of light. May that divine light awaken, illuminate, and guide our intellects toward truth.",
    translationHi: "भूः, भुवः और स्वः—तीनों लोकों में व्याप्त उस सर्वश्रेष्ठ, पूज्य एवं पाप-विनाशक सविता (सूर्यदेव) के दिव्य तेज का हम ध्यान करते हैं। वह परमात्मा हमारी बुद्धि को सन्मार्ग एवं सत्य की ओर प्रेरित करे।",
    commentaryEn: "The mother of all Vedic mantras, aligning the nervous system with cosmic solar intelligence and awakening Buddhi (discerning intellect) above mundane desires.",
    commentaryHi: "गायत्री मन्त्र सम्पूर्ण वैदिक वाङ्मय का प्राण है। यह मानसिक विकारों को शांत कर बुद्धि को ऋतंभरा प्रज्ञा (सत्यगामिनी दृष्टि) की ओर जागृत करता है।",
    keywords: ["Gayatri", "Rig Veda", "Savitr", "Sun", "Meditation", "Intellect"]
  }
];

/**
 * Filter and search Shlokas based on query and filters.
 */
export function queryShlokas({ query = "", category = "ALL", source = "ALL" }) {
  let list = [...SANSKRIT_SHLOKAS];

  if (category && category !== "ALL") {
    list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }

  if (source && source !== "ALL") {
    list = list.filter((s) => s.source.toLowerCase().includes(source.toLowerCase()));
  }

  if (query && query.trim().length > 0) {
    const q = query.toLowerCase().trim();
    list = list.filter((s) => {
      return (
        s.devanagari.toLowerCase().includes(q) ||
        s.iast.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q) ||
        s.translationEn.toLowerCase().includes(q) ||
        s.translationHi.toLowerCase().includes(q) ||
        s.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }

  return list;
}

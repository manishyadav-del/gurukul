/**
 * server/spirituality/meditationData.js
 *
 * Classical Guided Meditation Curricula for Gurukul
 *
 * Grounded in authentic Yogic and Vedic literature:
 * - Patanjali Yoga Sutras (Samadhi Pada & Sadhana Pada)
 * - Srimad Bhagavad Gita (Chapter 6: Dhyana Yoga)
 * - Shat-Chakra-Nirupana (Purnananda Swami, 1526 CE)
 * - Shiva Samhita (Patala 5: Dhyana Prakarana)
 * - Hatha Yoga Pradipika (Chapter 4: Samadhi Lakshan)
 * - Dhyanabindu Upanishad & Amritabindu Upanishad
 *
 * Safety & Non-Dogmatic Scope:
 * - Strictly gentle, contemplative awareness (Sakshi Bhava / Bhavana).
 * - Zero extreme breath retentions or forceful energetic claims.
 * - Non-medical: Meditations are spiritual and philosophical practices.
 */

export const MEDITATION_CATEGORIES = [
  { id: "ALL", nameEn: "All Practices", nameHi: "समस्त साधनाएँ" },
  { id: "BEGINNER", nameEn: "Beginner Stillness", nameHi: "आरम्भिक स्थिरता" },
  { id: "MINDFUL_BREATH", nameEn: "Mindful Breathing", nameHi: "सचेत प्राण ध्यान" },
  { id: "CHAKRA_FOCUSED", nameEn: "Chakra Contemplation", nameHi: "चक्र भावना" },
  { id: "MANTRA_JAPA", nameEn: "Mantra & Sacred Sound", nameHi: "मन्त्र एवं नाद ध्यान" },
  { id: "TRADITIONAL_YOGIC", nameEn: "Traditional Yogic Dhyana", nameHi: "शास्त्रीय योग ध्यान" },
];

export const MEDITATION_PRACTICES = [
  // 1. Beginner: Sukhasana Stillness & Body Scan
  {
    id: "sukhasana_stillness",
    category: "BEGINNER",
    titleEn: "Sukhasana Stillness & Gentle Body Scan",
    titleHi: "सुखासन स्थिरता एवं काया-अवलोकन",
    subtitleEn: "Establishing physical ease and quiet mental observation.",
    subtitleHi: "शारीरिक स्थिरता एवं शांत साक्षी भाव का आरम्भ।",
    traditionalSource: "Patanjali Yoga Sutras (2.46: 'स्थिरसुखमासनम्')",
    author: "Maharishi Patanjali",
    tradition: "Classical Raja Yoga",
    durations: [3, 5, 10, 15],
    defaultDuration: 5,
    recommendedChakra: "muladhara",
    bijaSound: "LAM",
    ambientOption: "tibetan_bowl",
    recommendedFor: "Beginners, mental fatigue, physical restlessness, evening wind-down.",
    overviewEn:
      "A foundational seated practice cultivating Patanjali's core principle of Asana: posture that is simultaneously steady (sthira) and comfortable (sukha). Systematically relaxes muscular holding patterns while sustaining effortless awareness.",
    overviewHi:
      "महर्षि पतंजलि के 'स्थिरसुखमासनम्' सूत्र पर आधारित आरम्भिक अभ्यास। शरीर की मांसपेशियों को तनावमुक्त करते हुए चित्त को शांत एवं सजग अवस्था में स्थापित करता है।",
    steps: [
      {
        phase: "Preparation (स्थिति)",
        timeSec: 45,
        instructionEn:
          "Sit comfortably with your spine tall yet unforced. Rest your hands gently on your knees. Soften your jaw, shoulders, and eyes.",
        instructionHi:
          "रीढ़ को सीधा रखते हुए सहज भाव से बैठें। हाथों को घुटनों पर रखें और कंधों तथा मुखमंडल को पूर्णतः तनावमुक्त करें।",
      },
      {
        phase: "Grounding (पृथ्वी स्पर्श)",
        timeSec: 60,
        instructionEn:
          "Feel the physical points of contact between your body and the seat beneath you. Acknowledge the reliable, steady support of the ground.",
        instructionHi:
          "आसन और शरीर के संपर्क बिन्दुओं का अनुभव करें। पृथ्वी के स्थिर और अचंचल आधार के प्रति कृतज्ञता अनुभव करें।",
      },
      {
        phase: "Breath Observation (प्राण अवलोकन)",
        timeSec: 120,
        instructionEn:
          "Notice the natural flow of air entering and leaving the nostrils. Do not change or force the breath; simply observe it as an impartial witness.",
        instructionHi:
          "नासिकाग्र पर स्वाभाविक श्वास के आने और जाने का केवल अवलोकन करें। श्वास को बदलने का प्रयास न करें, केवल साक्षी बनें।",
      },
      {
        phase: "Quiet Rest (प्रशांत स्थिति)",
        timeSec: 75,
        instructionEn:
          "Rest in quiet presence. When thoughts arise, gently acknowledge them like drifting clouds and return attention to your natural breath.",
        instructionHi:
          "पूर्ण शांति में स्थित रहें। विचारों के आने पर उनसे लड़े बिना, पुनः अपना ध्यान स्वाभाविक श्वास पर लौटाएँ।",
      },
    ],
    safetyNoticeEn:
      "If you experience back stiffness or restlessness, adjust your posture or lean against a comfortable support. Practice with ease.",
  },

  // 2. Mindful Breathing: Prana Samyama
  {
    id: "prana_samyama",
    category: "MINDFUL_BREATH",
    titleEn: "Prana Samyama — Ocean of Natural Breath",
    titleHi: "प्राण संयम — सहज श्वास ध्यान",
    subtitleEn: "Cultivating rhythmic awareness of the vital life force.",
    subtitleHi: "प्राण ऊर्जा का सजग एवं सामंजस्यपूर्ण अवलोकन।",
    traditionalSource: "Bhagavad Gita (Chapter 4, Verse 29 & Chapter 6, Verses 11–12)",
    author: "Maharishi Veda Vyasa",
    tradition: "Vedanta & Dhyana Yoga",
    durations: [5, 10, 15, 20],
    defaultDuration: 10,
    recommendedChakra: "anahata",
    bijaSound: "YAM",
    ambientOption: "cosmic_om",
    recommendedFor: "Emotional balance, stress release, sharpening concentration, heart stillness.",
    overviewEn:
      "Expounded in the Gita, this meditation guides consciousness to rest upon the transition point between in-breath and out-breath. It gently calms the sympathetic nervous system, inducing tranquil equilibrium.",
    overviewHi:
      "श्रीमद्भगवद्गीता के छठे अध्याय के आधार पर प्राण और अपान की समरसता का अभ्यास। यह हृदय चक्र को शांत कर मानसिक चंचलता को दूर करता है।",
    steps: [
      {
        phase: "Centering (आसन संस्तरण)",
        timeSec: 60,
        instructionEn:
          "Establish an upright, dignified posture. Close your eyes softly and bring your hands to Chin Mudra on your lap.",
        instructionHi:
          "रीढ़ को सीधा कर शांत भाव से बैठें। हाथों में चिन्मुद्रा धारण कर नेत्रों को कोमलता से बंद करें।",
      },
      {
        phase: "Heart Space Awareness (हृदय ध्यान)",
        timeSec: 120,
        instructionEn:
          "Bring your gentle awareness to the center of your chest (Anahata). Feel the soft expansion on every natural inhale and release on every exhale.",
        instructionHi:
          "अपना ध्यान छाती के मध्य अनाहत क्षेत्र में केंद्रित करें। प्रत्येक श्वास के साथ हृदय क्षेत्र के कोमल विस्तार का अनुभव करें।",
      },
      {
        phase: "Observing the Pause (संधि काल)",
        timeSec: 180,
        instructionEn:
          "Observe the minute, natural stillness between the end of an inhale and the beginning of an exhale. Do not hold the breath; simply notice that moment of effortless calm.",
        instructionHi:
          "श्वास के पूर्ण होने और उच्छ्वास के आरम्भ के बीच के सूक्ष्म संधि-क्षण का सजग अवलोकन करें। सांस रोकने का कोई प्रयास न करें।",
      },
      {
        phase: "Effortless Radiance (आत्म प्रकाश)",
        timeSec: 120,
        instructionEn:
          "Visualize the breath as warm, luminous vitality nourishing every cell. Rest in quiet gratitude.",
        instructionHi:
          "प्राण को प्रकाशमय चैतन्य के रूप में अनुभव करें जो शरीर के प्रत्येक अंग को नवजीवन दे रहा है। कृतज्ञ भाव में विश्राम करें।",
      },
    ],
    safetyNoticeEn:
      "Maintain completely natural breathing. Never strain the chest or hold the breath under pressure.",
  },

  // 3. Chakra-Focused: Muladhara Earth Grounding
  {
    id: "muladhara_grounding",
    category: "CHAKRA_FOCUSED",
    titleEn: "Muladhara Prithvi Bhavana — Base Foundation Grounding",
    titleHi: "मूलाधार पृथ्वी भावना — आधार स्तम्भ ध्यान",
    subtitleEn: "Cultivating unshakeable stability, patience, and freedom from existential fear.",
    subtitleHi: "धैर्य, स्थिरता एवं अस्तित्वगत भय से मुक्ति की शास्त्रीय भावना।",
    traditionalSource: "Shat-Chakra-Nirupana (Verses 4–13) & Shiva Samhita (Patala 2)",
    author: "Purnananda Swami & Shiva Agama",
    tradition: "Tantric Yoga Shastra",
    durations: [5, 10, 15],
    defaultDuration: 5,
    recommendedChakra: "muladhara",
    bijaSound: "LAM",
    ambientOption: "tanpura_drone",
    recommendedFor: "Anxiety, feeling scattered, lack of routine, physical tension in lower body.",
    overviewEn:
      "A classical contemplative visualization on the root foundation (Muladhara) and the golden Earth element (Prithvi Tattva). Anchors scattered thoughts into sovereign patience and gravitational stability.",
    overviewHi:
      "षट्चक्र निरूपण के अनुसार मूलाधार में चार दल वाले रक्त कमल एवं पृथ्वी तत्त्व के पीले चौकोर यन्त्र का ध्यान। यह चित्त को दृढ़ता एवं धैर्य प्रदान करता है।",
    steps: [
      {
        phase: "Pelvic Grounding (मूलाधार स्पर्श)",
        timeSec: 60,
        instructionEn:
          "Settle your attention deeply into the base of your spine and pelvic floor. Feel the firmness of the earth supporting your physical weight.",
        instructionHi:
          "मेरूदंड के आधार भाग और मूलाधार क्षेत्र में चेतना को स्थिर करें। पृथ्वी के अटूट सहारे को अनुभव करें।",
      },
      {
        phase: "Bija Sound Contemplation (लम् नाद भावना)",
        timeSec: 150,
        instructionEn:
          "Internally or in a soft whisper, resonate the seed syllable 'LAM' at your root center. Feel its steady, compact vibration grounding the body.",
        instructionHi:
          "मानसिक रूप से 'लम्' (LAM) बीज मन्त्र का गुंजन मूलाधार में अनुभव करें। पृथ्वी तत्त्व की सघन स्थिरता का स्मरण करें।",
      },
      {
        phase: "Dissolving Fear (अभय प्राप्ति)",
        timeSec: 120,
        instructionEn:
          "With each natural exhalation, release all anxiety about past debts or future uncertainty into the steady earth. Know that you are supported right now.",
        instructionHi:
          "प्रत्येक रेचक (श्वास छोड़ने) के साथ समस्त भय और असुरक्षा की भावना को भूमि में विलीन कर अभय की अनुभूति करें।",
      },
    ],
    safetyNoticeEn:
      "If you experience physical heaviness or lethargy, open your eyes and rub your palms together gently.",
  },

  // 4. Chakra-Focused: Anahata Heart Radiance
  {
    id: "anahata_radiance",
    category: "CHAKRA_FOCUSED",
    titleEn: "Anahata Hridaya Dhyana — Unstruck Sound of Compassion",
    titleHi: "अनाहत हृदय ध्यान — अनिर्वचनीय करुणा प्रकाश",
    subtitleEn: "Expanding the twelve-petalled golden lotus of unconditional love.",
    subtitleHi: "द्वादश दल कमल एवं असीम करुणा का शास्त्रीय चिंतन।",
    traditionalSource: "Shat-Chakra-Nirupana (Verses 22–27) & Hatha Yoga Pradipika (4.65)",
    author: "Purnananda Swami & Svatmarama",
    tradition: "Classical Tantra & Nada Yoga",
    durations: [5, 10, 15, 20],
    defaultDuration: 10,
    recommendedChakra: "anahata",
    bijaSound: "YAM",
    ambientOption: "tibetan_bowl",
    recommendedFor: "Grief, relational bitterness, emotional exhaustion, opening loving kindness.",
    overviewEn:
      "Focuses upon the Anahata lotus at the center of the chest. It dissolves interpersonal grievances through universal compassion (Karuna) and selfless presence.",
    overviewHi:
      "हृदय कमल में अनाहत नाद और वायु तत्त्व के धूसर षट्कोण यन्त्र का ध्यान। यह व्यक्तिगत अहंकार और राग-द्वेष को सार्वभौमिक प्रेम में रूपांतरित करता है।",
    steps: [
      {
        phase: "Awakening Chest Center (हृदय सरसिज)",
        timeSec: 60,
        instructionEn:
          "Place one palm gently over the center of your chest. Feel the steady rhythm of your heartbeat and the natural warmth under your palm.",
        instructionHi:
          "दाहिनी हथेली को छाती के मध्य रखें। हृदय की धड़कन और उसकी स्वाभाविक ऊष्मा का शांत अनुभव करें।",
      },
      {
        phase: "Twelve-Petalled Lotus (द्वादश दल भावना)",
        timeSec: 180,
        instructionEn:
          "Visualize a radiant lotus of twelve petals unfolding in the inner cave of your heart. Inhale gentleness; exhale forgiveness.",
        instructionHi:
          "हृदय गुहा में बारह पंखुड़ियों वाले दिव्य कमल के खिलने की भावना करें। श्वास के साथ करुणा लें, उच्छ्वास के साथ क्षमा दें।",
      },
      {
        phase: "Bija Resonating YAM (यम् मन्त्र गुंजन)",
        timeSec: 180,
        instructionEn:
          "Silently sound the bija 'YAM', the vibration of the Air element (Vayu). Allow the breath to feel as expansive as the sky.",
        instructionHi:
          "मानसिक रूप से 'यम्' (YAM) मन्त्र का स्पंदन करें। अपने हृदय को आकाश के समान असीम और मुक्त अनुभव करें।",
      },
    ],
    safetyNoticeEn:
      "If emotional tears arise, allow them without judgment. Stop the visualization if you feel overwhelmed.",
  },

  // 5. Chakra-Focused: Ajna Third Eye Light
  {
    id: "ajna_light",
    category: "CHAKRA_FOCUSED",
    titleEn: "Ajna Bhrumadhya Dhyana — Inner Light of Pure Discernment",
    titleHi: "आज्ञा भ्रूमध्य ध्यान — विवेक एवं अंतर्ज्योति",
    subtitleEn: "Stillness between the eyebrows cultivating Viveka (spiritual discernment).",
    subtitleHi: "भ्रूमध्य में आत्म-ज्योति और विवेक का शांत अवलोकन।",
    traditionalSource: "Shat-Chakra-Nirupana (Verses 32–38) & Shiva Samhita (Patala 5.43)",
    author: "Purnananda Swami & Shiva Agama",
    tradition: "Tantric Raja Yoga",
    durations: [5, 10, 15],
    defaultDuration: 5,
    recommendedChakra: "ajna",
    bijaSound: "OM",
    ambientOption: "cosmic_om",
    recommendedFor: "Mental clarity, decision paralysis, spiritual intuition, overcoming confusion.",
    overviewEn:
      "Concentration upon the space between the eyebrows (Bhrumadhya) where Ida and Pingala converge into Sushumna. Calms excessive analytical chatter and fosters unclouded intuitive clarity.",
    overviewHi:
      "भ्रूमध्य में दो पंखुड़ियों वाले आज्ञा कमल एवं प्रणव (ॐ) का ध्यान। यहाँ इड़ा और पिंगला नाड़ियाँ सुषुम्ना में मिलकर मन को एकाग्र करती हैं।",
    steps: [
      {
        phase: "Stillness of Gaze (दृष्टि स्थिरता)",
        timeSec: 60,
        instructionEn:
          "Keep your eyes closed with the inner gaze gently resting toward the center of your forehead. Do not cross or strain the eyes.",
        instructionHi:
          "नेत्र बंद रखते हुए अंतर-दृष्टि को सहजता से भ्रूमध्य (दोनों भौंहों के बीच) की ओर रखें। आंखों पर कोई दबाव न डालें।",
      },
      {
        phase: "The Two Petals (हं-क्षं भावना)",
        timeSec: 150,
        instructionEn:
          "Contemplate the luminous two-petalled lotus inscribed with the sacred syllables 'HAM' and 'KSHAM', balancing intellect and intuition.",
        instructionHi:
          "शुभ्र दो पंखुड़ियों वाले कमल पर 'हं' और 'क्षं' अक्षरों का ध्यान करें जो बुद्धि और सहजज्ञान का संतुलन करते हैं।",
      },
      {
        phase: "The Sacred Pranava OM (प्रणव ॐकार)",
        timeSec: 150,
        instructionEn:
          "Let the sound of 'OM' resonate through the center of your head like a serene golden bell. Rest in thought-free awareness.",
        instructionHi:
          "मस्तिष्क के मध्य ॐकार के शांत, दिव्य नाद का अनुभव करें। समस्त विचारों से परे शुद्ध चैतन्य में विश्राम करें।",
      },
    ],
    safetyNoticeEn:
      "Never strain the optical muscles. If you feel any forehead tension or headache, immediately relax your gaze downward toward your breath.",
  },

  // 6. Mantra Meditation: So-Ham Hamsa Sadhana
  {
    id: "so_ham_hamsa",
    category: "MANTRA_JAPA",
    titleEn: "So-Ham Hamsa Sadhana — Natural Breath Mantra",
    titleHi: "सोऽहं हंस साधना — अजपा जप ध्यान",
    subtitleEn: "Attuning to the spontaneous syllable of creation within every inhalation and exhalation.",
    subtitleHi: "प्रत्येक श्वास-प्रश्वास में गूँजने वाले अजपा-गायत्री मन्त्र का ध्यान।",
    traditionalSource: "Hatha Yoga Pradipika (4.65) & Dhyanabindu Upanishad (Verses 61–63)",
    author: "Swami Svatmarama & Upanishadic Sages",
    tradition: "Ajapa Japa Yoga",
    durations: [5, 10, 15, 20],
    defaultDuration: 10,
    recommendedChakra: "anahata",
    bijaSound: "HAM",
    ambientOption: "tanpura_drone",
    recommendedFor: "Overcoming alienation, quietening repetitive mental loops, non-dual contemplation.",
    overviewEn:
      "Ajapa Japa is the effortless, continuous recitation that the breath spontaneously performs: 'SO' upon inhalation ('He / Pure Awareness'), and 'HAM' upon exhalation ('I am That').",
    overviewHi:
      "प्राण स्वाभाविक रूप से प्रति मिनट 'सकार' से श्वास लेता है और 'हकार' से छोड़ता है। यही 'सोऽहं' (मैं वही परमतत्त्व हूँ) का पवित्र अजपा जप है।",
    steps: [
      {
        phase: "Aligning Awareness (प्रणयन)",
        timeSec: 60,
        instructionEn:
          "Sit in peaceful silence. Allow your breath to find its own unhurried, natural rhythm through the nostrils.",
        instructionHi:
          "शांत भाव से बैठें। श्वास को अपनी स्वाभाविक गति से नासिका द्वारा चलने दें।",
      },
      {
        phase: "The Sound 'SO' on Inhale (पूरक में सो)",
        timeSec: 180,
        instructionEn:
          "As air enters your nose, silently listen to the soft, natural whisper: 'SOOOOO...'. Feel pure universal consciousness entering your being.",
        instructionHi:
          "श्वास लेते समय मन ही मन 'सो...' (SO) की सूक्ष्म ध्वनि का श्रवण करें। परब्रह्म की चेतना को अपने भीतर भरें।",
      },
      {
        phase: "The Sound 'HAM' on Exhale (रेचक में हम्)",
        timeSec: 180,
        instructionEn:
          "As air leaves, hear the quiet whisper: 'HUMMM... / HAM'. Feel all individual separation dissolving into the vast whole.",
        instructionHi:
          "श्वास छोड़ते समय 'हम्...' (HAM) ध्वनि का स्मरण करें। समस्त संकीर्ण सीमाओं को विलीन कर विराट से एकाकार हों।",
      },
    ],
    safetyNoticeEn:
      "Do not vocalize or force the syllables. Let the breath murmur the sound effortlessly.",
  },

  // 7. Traditional Yogic: Sakshi Bhava (Witness Consciousness)
  {
    id: "sakshi_bhava",
    category: "TRADITIONAL_YOGIC",
    titleEn: "Sakshi Bhava — The Silent Witness Consciousness",
    titleHi: "साक्षी भाव — दृष्टा चेतना ध्यान",
    subtitleEn: "Resting as the unattached seer of all thoughts, sensations, and emotions.",
    subtitleHi: "मन के समस्त विचारों और भावनाओं के अनासक्त दृष्टा रूप में अवस्थान।",
    traditionalSource: "Patanjali Yoga Sutras (1.3: 'तदा द्रष्टुः स्वरूपेऽवस्थानम्')",
    author: "Maharishi Patanjali",
    tradition: "Classical Darshana",
    durations: [5, 10, 15, 20],
    defaultDuration: 10,
    recommendedChakra: "sahasrara",
    bijaSound: "OM",
    ambientOption: "silent",
    recommendedFor: "Overcoming rumination, emotional reactiveness, establishing deep inner peace.",
    overviewEn:
      "The culmination of Raja Yoga: when the mental modifications (vrittis) are observed without clinging or aversion, the Seer (Drashta) abides peacefully in its authentic transcendental nature.",
    overviewHi:
      "पतंजलि योगदर्शन का सर्वोच्च लक्ष्य: 'तदा द्रष्टुः स्वरूपेऽवस्थानम्'। जब चित्त की वृत्तियाँ शांत होती हैं, तब आत्मा अपने विशुद्ध, निर्मल स्वरूप में स्थित हो जाती है।",
    steps: [
      {
        phase: "Observing Thoughts as Clouds (विचार दर्शन)",
        timeSec: 120,
        instructionEn:
          "Notice thoughts arising in the mind. Do not push them away, and do not follow their storylines. Simply watch them come and go like clouds across a vast sky.",
        instructionHi:
          "मन में उठने वाले विचारों को केवल देखें। न उनसे चिपके, न उनका विरोध करें। आकाश में तैरते बादलों की भाँति उन्हें आने और जाने दें।",
      },
      {
        phase: "Inquiring: 'Who is Aware?' (दृष्टा अन्वेषण)",
        timeSec: 180,
        instructionEn:
          "Gently ask yourself: 'Who is the silent seer aware of these thoughts?' Notice that the seer is neither happy nor sad, but pure, unchanging awareness.",
        instructionHi:
          "स्वयं से शांत प्रश्न पूछें: 'इन विचारों को जानने वाला साक्षी कौन है?' अनुभव करें कि दृष्टा सदा शांत, निर्लेप और साक्षी है।",
      },
      {
        phase: "Abiding in Being (स्वरूप स्थिति)",
        timeSec: 180,
        instructionEn:
          "Rest as the vast, timeless sky of awareness. No effort is needed. You are already whole and complete.",
        instructionHi:
          "निस्तरंग, असीम चेतना रूप में विश्राम करें। किसी प्रयास की आवश्यकता नहीं। आप स्वरूपतः पूर्ण और शांत हैं।",
      },
    ],
    safetyNoticeEn:
      "If you feel dissociated or uncomfortable, open your eyes, feel your feet on the floor, and stretch gently.",
  },
];

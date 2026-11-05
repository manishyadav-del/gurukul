/**
 * Vedic Kundli Comprehensive Interpretation & Explanation Engine
 * 
 * Provides bilingual (English & Hindi) classical explanations for:
 * - Lagna (Ascendant) life trajectory and temperament
 * - Moon Sign (Chandra Rashi) mind, emotions and inner nature
 * - Sun Sign (Surya Rashi) soul purpose, vitality and authority
 * - Nakshatra & Pada spiritual character
 * - 12 Bhavas (Houses) detailed domain significations
 * - Planetary placements in houses (Graha Bhava Phala)
 * - Vimshottari Mahadasha timeline analysis
 * - Classical Yogas (Gajakesari, Budhaditya, Raja Yogas, Mangal Dosha, etc.)
 */

export const PLANET_NAMES_HI = {
  Sun: "सूर्य",
  Moon: "चन्द्र",
  Mars: "मंगल",
  Mercury: "बुध",
  Jupiter: "बृहस्पति (गुरु)",
  Venus: "शुक्र",
  Saturn: "शनि",
  Rahu: "राहु",
  Ketu: "केतु",
  SUN: "सूर्य",
  MOON: "चन्द्र",
  MARS: "मंगल",
  MERCURY: "बुध",
  JUPITER: "बृहस्पति (गुरु)",
  VENUS: "शुक्र",
  SATURN: "शनि",
  RAHU: "राहु",
  KETU: "केतु",
};

export const RASHI_NAMES_HI = {
  Aries: "मेष",
  Taurus: "वृषभ",
  Gemini: "मिथुन",
  Cancer: "कर्क",
  Leo: "सिंह",
  Virgo: "कन्या",
  Libra: "तुला",
  Scorpio: "वृश्चिक",
  Sagittarius: "धनु",
  Capricorn: "मकर",
  Aquarius: "कुम्भ",
  Pisces: "मीन",
};

export function getPlanetName(planet, language = "en") {
  if (language === "hi" || language === "hindi") {
    const key = (planet || "").trim();
    return PLANET_NAMES_HI[key] || PLANET_NAMES_HI[key.toUpperCase()] || planet;
  }
  return planet;
}

export function getRashiName(rashi, language = "en") {
  if (language === "hi" || language === "hindi") {
    const key = (rashi || "").trim();
    return RASHI_NAMES_HI[key] || rashi;
  }
  return rashi;
}

export const LAGNA_EXPLANATIONS = {
  Aries: {
    nameEn: "Aries Ascendant (मेष लग्न)",
    nameHi: "मेष लग्न (Aries Ascendant)",
    lordEn: "Mars (Mangala)",
    lordHi: "मंगल (Mangala)",
    elementEn: "Fire (Agni)",
    elementHi: "अग्नि तत्व",
    overviewEn:
      "With Aries as your Lagna, you are naturally driven, bold, courageous, and pioneering. Ruled by Mars, you possess vitality, quick decision-making, and an instinctive spirit of leadership. You meet life's obstacles head-on and thrive when initiating new enterprises.",
    overviewHi:
      "मेष लग्न के जातक स्वभाव से साहसी, ऊर्जावान, स्वतंत्र विचार वाले और नेतृत्व क्षमता से संपन्न होते हैं। इसके स्वामी मंगल ग्रह हैं, जो आपको त्वरित निर्णय लेने, कर्मठता और चुनौतियों का सामना डटकर करने की अद्भुत शक्ति प्रदान करते हैं।",
    traitsEn: ["Pioneering spirit", "High physical vitality", "Direct & honest", "Natural executive impulse"],
    traitsHi: ["नेतृत्व की स्वाभाविक क्षमता", "अदम्य साहस एवं पराक्रम", "स्पष्टवादी एवं कर्मठ", "नवीन कार्यों की पहल"],
    careerEn: "Suited for administration, defense, engineering, entrepreneurship, and pioneer professions.",
    careerHi: "प्रशासन, रक्षा सेवा, तकनीकी क्षेत्र, स्वतंत्र व्यवसाय एवं नेतृत्वकारी पदों में विशेष सफलता।",
  },
  Taurus: {
    nameEn: "Taurus Ascendant (वृषभ लग्न)",
    nameHi: "वृषभ लग्न (Taurus Ascendant)",
    lordEn: "Venus (Shukra)",
    lordHi: "शुक्र (Shukra)",
    elementEn: "Earth (Prithvi)",
    elementHi: "पृथ्वी तत्व",
    overviewEn:
      "Taurus Lagna is ruled by Venus, conferring patience, stability, enduring determination, and an innate appreciation for aesthetic refinement, harmony, and material security. You possess a steady temperament and build lasting prosperity through perseverance.",
    overviewHi:
      "वृषभ लग्न के जातक धैर्यवान, स्थिर, कलाप्रिय और व्यावहारिक बुद्धि से संपन्न होते हैं। लग्न के स्वामी शुक्र होने के कारण आप सौंदर्य, सामंजस्य और भौतिक समृद्धि को महत्व देते हैं। आप अटूट संकल्प के धनी होते हैं और निरंतर प्रयास से स्थायी सफलता पाते हैं।",
    traitsEn: ["Steadfast determination", "Aesthetic sensibility", "Financial prudence", "Reliable & loyal"],
    traitsHi: ["स्थिर एवं गंभीर स्वभाव", "कला एवं सौंदर्य के प्रति आकर्षण", "आर्थिक सूझबूझ", "विश्वसनीय व्यक्तित्व"],
    careerEn: "Excels in finance, banking, creative arts, architecture, commerce, and sustainable assets.",
    careerHi: "वित्त, बैंकिंग, ललित कला, वाणिज्य, स्थापत्य एवं मूल्यवान संपत्तियों से जुड़े कार्यों में लाभ।",
  },
  Gemini: {
    nameEn: "Gemini Ascendant (मिथुन लग्न)",
    nameHi: "मिथुन लग्न (Gemini Ascendant)",
    lordEn: "Mercury (Budha)",
    lordHi: "बुध (Budha)",
    elementEn: "Air (Vayu)",
    elementHi: "वायु तत्व",
    overviewEn:
      "Gemini Lagna is ruled by Mercury, blessing you with quick wit, sharp intellectual curiosity, articulate communication, and adaptability. You enjoy gathering multidisciplinary wisdom, engaging in scholarly discourse, and connecting people.",
    overviewHi:
      "मिथुन लग्न के जातक अत्यंत बुद्धिमान, बहुमुखी प्रतिभा के धनी, जिज्ञासु और कुशल वक्ता होते हैं। इसके स्वामी बुध देव हैं, जो आपको तार्किक चिंतन, तीव्र स्मरण शक्ति और संचार कला में निपुण बनाते हैं। आप नए विचारों का स्वागत करते हैं।",
    traitsEn: ["Intellectual curiosity", "Exceptional eloquence", "Adaptable mindset", "Analytical acuity"],
    traitsHi: ["तीक्ष्ण बुद्धि एवं हाजिरजवाबी", "कुशल संवाद शैली", "बहुमुखी प्रतिभा", "नवीन ज्ञान की खोज"],
    careerEn: "Thrives in media, journalism, data analysis, literature, advisory, diplomacy, and commerce.",
    careerHi: "मीडिया, पत्रकारिता, शोध, लेखन, कूटनीति, सूचना प्रौद्योगिकी एवं व्यापार में ख्याति।",
  },
  Cancer: {
    nameEn: "Cancer Ascendant (कर्क लग्न)",
    nameHi: "कर्क लग्न (Cancer Ascendant)",
    lordEn: "Moon (Chandra)",
    lordHi: "चन्द्रमा (Chandra)",
    elementEn: "Water (Jala)",
    elementHi: "जल तत्व",
    overviewEn:
      "Cancer Lagna is ruled by the Moon, making you profoundly empathetic, intuitive, protective, and emotionally responsive. You possess strong nurturing instincts, deep devotion to family, and a natural ability to sense subtle undercurrents in your environment.",
    overviewHi:
      "कर्क लग्न के स्वामी चन्द्रमा हैं। यह आपको संवेदनशील, सहृदय, अंतःप्रेरणा से युक्त और परिवार-पोषक स्वभाव प्रदान करता है। आपके भीतर गहन सहानुभूति, दूसरों के सुख-दुख को समझने की क्षमता और नैतिक आदर्शों के प्रति अटूट निष्ठा होती है।",
    traitsEn: ["Profound intuition", "Empathic nature", "Protective loyalty", "Imaginative vision"],
    traitsHi: ["गहन अंतर्ज्ञान एवं संवेदनशीलता", "परोपकारी एवं स्नेही स्वभाव", "रचनात्मक कल्पनाशीलता", "पारिवारिक समर्पण"],
    careerEn: "Ideal for healthcare, education, counseling, social enterprise, marine sciences, and hospitality.",
    careerHi: "चिकित्सा, परामर्श, शिक्षा, समाज सेवा, मानव संसाधन एवं जनसंपर्क क्षेत्रों में उल्लेखनीय सफलता।",
  },
  Leo: {
    nameEn: "Leo Ascendant (सिंह लग्न)",
    nameHi: "सिंह लग्न (Leo Ascendant)",
    lordEn: "Sun (Surya)",
    lordHi: "सूर्य (Surya)",
    elementEn: "Fire (Agni)",
    elementHi: "अग्नि तत्व",
    overviewEn:
      "Leo Lagna is ruled by the royal Sun, bestowing natural majesty, magnanimity, moral dignity, and authoritative leadership. You radiate warmth and generosity, despise pettiness, and take pride in uplifting those under your stewardship.",
    overviewHi:
      "सिंह लग्न के स्वामी ग्रहों के राजा सूर्य देव हैं। यह आपको स्वाभिमानी, तेजस्वी, उदार हृदय और जन्मजात नेतृत्व की गरिमा प्रदान करता है। आप सिद्धांतवादी होते हैं, समाज में सम्मानजनक स्थान प्राप्त करते हैं और अपने लोगों का संरक्षण करते हैं।",
    traitsEn: ["Commanding presence", "Generous & noble", "High self-respect", "Inspiring leadership"],
    traitsHi: ["तेजस्वी एवं प्रभावशाली व्यक्तित्व", "उदारता एवं दानशीलता", "आत्मसम्मान एवं कर्तव्यनिष्ठा", "प्रेरणादायी नेतृत्व"],
    careerEn: "Suited for governance, public administration, judicial authority, politics, and organizational leadership.",
    careerHi: "शासन-प्रशासन, उच्च पद, राजनीति, न्यायपालिका एवं विशाल संगठनों के सर्वोच्च नेतृत्व में सफलता।",
  },
  Virgo: {
    nameEn: "Virgo Ascendant (कन्या लग्न)",
    nameHi: "कन्या लग्न (Virgo Ascendant)",
    lordEn: "Mercury (Budha)",
    lordHi: "बुध (Budha)",
    elementEn: "Earth (Prithvi)",
    elementHi: "पृथ्वी तत्व",
    overviewEn:
      "Virgo Lagna is ruled by analytical Mercury, giving you an eye for precision, meticulous craftsmanship, service-oriented dedication, and discriminating intellect. You solve complex issues methodically and strive for excellence.",
    overviewHi:
      "कन्या लग्न के जातक सूक्ष्मदर्शी, व्यावहारिक, कर्तव्यपरायण और व्यवस्थित होते हैं। इसके स्वामी बुध देव हैं। आप हर कार्य को बारीकी और दक्षता से पूरा करते हैं। सेवा भावना और व्यावहारिक समस्याओं का समाधान आपकी प्रमुख शक्ति है।",
    traitsEn: ["Methodical precision", "Service orientation", "Discriminating intellect", "Practical problem-solver"],
    traitsHi: ["बारीक विश्लेषण की क्षमता", "अनुशासित एवं व्यवस्थित कार्यशैली", "सेवा भाव एवं समर्पण", "व्यावहारिक बुद्धिमत्ता"],
    careerEn: "Excels in medicine, scientific research, accounting, audit, editorial, law, and analytics.",
    careerHi: "चिकित्सा, वैज्ञानिक अनुसंधान, वित्तीय लेखा-परीक्षण, कानून, संपादन एवं डेटा विश्लेषण।",
  },
  Libra: {
    nameEn: "Libra Ascendant (तुला लग्न)",
    nameHi: "तुला लग्न (Libra Ascendant)",
    lordEn: "Venus (Shukra)",
    lordHi: "शुक्र (Shukra)",
    elementEn: "Air (Vayu)",
    elementHi: "वायु तत्व",
    overviewEn:
      "Libra Lagna is ruled by Venus, imbuing you with a strong commitment to justice, balance, diplomatic charm, and cultured elegance. You seek fairness in all relationships and excel at resolving disputes through peaceful mediation.",
    overviewHi:
      "तुला लग्न के जातक न्यायप्रिय, सौम्य, शिष्टाचारी और सामंजस्य स्थापित करने में कुशल होते हैं। इसके स्वामी शुक्र देव हैं, जो आपको सौम्य व्यक्तित्व, संतुलन की दृष्टि और सामाजिक आकर्षण प्रदान करते हैं। आप परस्पर सौहार्द के पक्षधर होते हैं।",
    traitsEn: ["Diplomatic tact", "Sense of justice", "Refined aesthetics", "Harmonious partnerships"],
    traitsHi: ["कूटनीतिक सूझबूझ", "सत्य एवं न्याय के प्रति निष्ठा", "कलात्मक दृष्टिकोण", "सामाजिक प्रतिष्ठा"],
    careerEn: "Ideal for judiciary, international diplomacy, public relations, consulting, fashion, and commerce.",
    careerHi: "न्यायपालिका, कूटनीति, जनसंपर्क, अंतरराष्ट्रीय व्यापार, परामर्श एवं कला जगत में ख्याति।",
  },
  Scorpio: {
    nameEn: "Scorpio Ascendant (वृश्चिक लग्न)",
    nameHi: "वृश्चिक लग्न (Scorpio Ascendant)",
    lordEn: "Mars (Mangala)",
    lordHi: "मंगल (Mangala)",
    elementEn: "Water (Jala)",
    elementHi: "जल तत्व",
    overviewEn:
      "Scorpio Lagna is ruled by mystical Mars, giving you extraordinary emotional endurance, piercing insight, profound secrecy, and the power of transformation. You perceive beneath superficial masks and possess unbreakable willpower.",
    overviewHi:
      "वृश्चिक लग्न के स्वामी ऊर्जावान मंगल देव हैं। यह लग्न अदम्य इच्छाशक्ति, गहन अंतर्दृष्टि, पराक्रम और आत्म-रूपांतरण की अद्भुत क्षमता प्रदान करता है। आप गूढ़ ज्ञान के प्रति आकर्षित होते हैं और किसी भी रहस्य को भेदने में सक्षम हैं।",
    traitsEn: ["Unshakeable willpower", "Penetrating insight", "Emotional depth", "Resilient recovery"],
    traitsHi: ["अटूट मानसिक संकल्प", "गूढ़ रहस्यों को समझने की दृष्टि", "दृढ़ इच्छाशक्ति", "चुनौतियों से उबरने का साहस"],
    careerEn: "Flourishes in surgery, investigative forensics, intelligence, occult sciences, defense, and research.",
    careerHi: "शल्य चिकित्सा, गुप्तचर सेवा, रक्षा, शोध, अपराध अन्वेषण एवं गूढ़ विज्ञान (ज्योतिष/तंत्र)।",
  },
  Sagittarius: {
    nameEn: "Sagittarius Ascendant (धनु लग्न)",
    nameHi: "धनु लग्न (Sagittarius Ascendant)",
    lordEn: "Jupiter (Brihaspati)",
    lordHi: "बृहस्पति (Brihaspati)",
    elementEn: "Fire (Agni)",
    elementHi: "अग्नि तत्व",
    overviewEn:
      "Sagittarius Lagna is ruled by divine Guru (Jupiter), endowing you with noble idealism, philosophical optimism, love for dharma, and thirst for higher spiritual truth. You act as a natural mentor, teacher, and righteous guide.",
    overviewHi:
      "धनु लग्न के स्वामी देवगुरु बृहस्पति हैं। यह लग्न आपको उच्च दार्शनिक दृष्टिकोण, धर्मनिष्ठा, आशावादिता और गुरु-तुल्य ज्ञान प्रदान करता है। आप सत्य, न्याय और नैतिक मूल्यों के संरक्षक होते हैं तथा समाज का मार्गदर्शन करते हैं।",
    traitsEn: ["Philosophical wisdom", "Dharmic conviction", "Generous optimism", "Truth-seeking spirit"],
    traitsHi: ["धार्मिक एवं आध्यात्मिक दृष्टिकोण", "उच्च नैतिक आदर्श", "सदाचारी एवं आशावादी", "शिक्षण एवं मार्गदर्शन की प्रेरणा"],
    careerEn: "Thrives in academia, higher philosophy, spiritual ministry, jurisprudence, writing, and advisory.",
    careerHi: "उच्च शिक्षा, दर्शनशास्त्र, धर्म-अध्यात्म, विधि परामर्श, साहित्य एवं मार्गदर्शन।",
  },
  Capricorn: {
    nameEn: "Capricorn Ascendant (मकर लग्न)",
    nameHi: "मकर लग्न (Capricorn Ascendant)",
    lordEn: "Saturn (Shani)",
    lordHi: "शनि (Shani)",
    elementEn: "Earth (Prithvi)",
    elementHi: "पृथ्वी तत्व",
    overviewEn:
      "Capricorn Lagna is ruled by karmic Saturn, bestowing steady discipline, relentless patience, pragmatic ambition, and deep reverence for duty. You construct lasting achievements brick-by-brick and achieve pinnacle authority over time.",
    overviewHi:
      "मकर लग्न के स्वामी कर्मफलदाता शनि देव हैं। यह लग्न आपको अपार धैर्य, अनुशासन, व्यावहारिक दूरदर्शिता और अटूट कर्तव्यनिष्ठा प्रदान करता है। आप समय के महत्व को समझते हैं और निरंतर परिश्रम से जीवन में स्थायी उत्थान पाते हैं।",
    traitsEn: ["Iron discipline", "Pragmatic endurance", "Organizational mastery", "Patience in adversity"],
    traitsHi: ["कठोर परिश्रम एवं अनुशासन", "व्यावहारिक दूरदर्शिता", "कर्तव्यपरायणता", "धैर्यपूर्वक सफलता की ओर अग्रसर"],
    careerEn: "Suited for corporate governance, civil infrastructure, engineering, mining, planning, and long-term enterprise.",
    careerHi: "प्रशासनिक प्रबंधन, उद्योग, इंजीनियरिंग, दीर्घकालिक योजनाएं एवं आधारभूत संरचना निर्माण।",
  },
  Aquarius: {
    nameEn: "Aquarius Ascendant (कुम्भ लग्न)",
    nameHi: "कुम्भ लग्न (Aquarius Ascendant)",
    lordEn: "Saturn (Shani)",
    lordHi: "शनि (Shani)",
    elementEn: "Air (Vayu)",
    elementHi: "वायु तत्व",
    overviewEn:
      "Aquarius Lagna is ruled by visionary Saturn, blessing you with innovative genius, humanitarian ideals, philosophical detachment, and original thinking. You think decades ahead and are motivated by the collective welfare of society.",
    overviewHi:
      "कुम्भ लग्न के स्वामी शनि देव हैं। यह लग्न आपको मौलिक विचारक, जनकल्याणकारी, वैज्ञानिक दृष्टि से संपन्न और दूरदर्शी बनाता है। आप रूढ़िवादिता से दूर रहकर समाज में सकारात्मक परिवर्तन और मानव मात्र के कल्याण के लिए समर्पित रहते हैं।",
    traitsEn: ["Visionary perspective", "Humanitarian compassion", "Original ingenuity", "Philosophical detachment"],
    traitsHi: ["क्रांतिकारी एवं मौलिक विचार", "जनकल्याण की भावना", "वैज्ञानिक दृष्टिकोण", "स्वतंत्र एवं निस्वार्थ चिंतन"],
    careerEn: "Ideal for technological innovation, research, social reform, sociology, astronomy, and institutions.",
    careerHi: "वैज्ञानिक शोध, प्रौद्योगिकी नवाचार, सामाजिक सुधार, समाजशास्त्र, खगोलशास्त्र एवं विशाल जनकल्याणकारी संस्थाएं।",
  },
  Pisces: {
    nameEn: "Pisces Ascendant (मीन लग्न)",
    nameHi: "मीन लग्न (Pisces Ascendant)",
    lordEn: "Jupiter (Brihaspati)",
    lordHi: "बृहस्पति (Brihaspati)",
    elementEn: "Water (Jala)",
    elementHi: "जल तत्व",
    overviewEn:
      "Pisces Lagna is ruled by spiritual Jupiter, granting you profound intuition, boundless compassion, artistic sensitivity, and innate spiritual wisdom. You feel connected to the cosmic whole and possess an inherent yearning for Moksha.",
    overviewHi:
      "मीन लग्न के स्वामी देवगुरु बृहस्पति हैं। यह राशि चक्र की अंतिम जल तत्व राशि है, जो आपको गहन आध्यात्मिक चेतना, करुणा, अंतर्ज्ञान और मोक्षगामी प्रवृत्ति प्रदान करती है। आप सांसारिक सीमाओं से परे ईश्वरीय एकता का अनुभव करते हैं।",
    traitsEn: ["Cosmic intuition", "Universal empathy", "Spiritual devotion", "Imaginative creativity"],
    traitsHi: ["अतीन्द्रिय अंतर्ज्ञान", "सर्वकल्याण की भावना", "आध्यात्मिक एवं दार्शनिक प्रज्ञा", "उदार एवं सहिष्णु स्वभाव"],
    careerEn: "Excels in spiritual counseling, psychology, fine arts, poetry, oceanography, and healing sciences.",
    careerHi: "अध्यात्म, योग, मनोविज्ञान, ललित कला, साहित्य, चिकित्सा एवं परोपकारी संस्थान।",
  },
};

export const MOON_SIGN_EXPLANATIONS = {
  Aries: {
    titleEn: "Moon in Aries: Dynamic, Bold & Spontaneous Mind",
    titleHi: "मेष राशि का चन्द्रमा: ओजस्वी, साहसी एवं त्वरित मन",
    descEn:
      "Your emotional core is dynamic, quick-reacting, and forward-thrusting. You process feelings through action and value straightforward authenticity above all else.",
    descHi:
      "आपका मन ऊर्जावान और तुरंत निर्णय लेने वाला है। आप भावनाओं को कर्म के माध्यम से अभिव्यक्त करते हैं तथा स्पष्टवादिता को सर्वोपरि मानते हैं।",
  },
  Taurus: {
    titleEn: "Moon in Taurus: Exalted, Serene & Grounded Heart",
    titleHi: "वृषभ राशि का चन्द्रमा: उच्च का, शांत एवं स्थिर मन",
    descEn:
      "The Moon reaches supreme exaltation (Uchcha) in Taurus. This bestows profound emotional peace, unwavering stability, aesthetic joy, and emotional contentment.",
    descHi:
      "वृषभ राशि में चन्द्रमा उच्च का होता है। यह जातक को मानसिक शांति, अटूट भावनात्मक स्थिरता, कला-प्रेम और जीवन में संतोष प्रदान करता है।",
  },
  Gemini: {
    titleEn: "Moon in Gemini: Curious, Versatile & Intellectual Mind",
    titleHi: "मिथुन राशि का चन्द्रमा: जिज्ञासु, बहुमुखी एवं विचारशील मन",
    descEn:
      "Your mind seeks continuous intellectual engagement. You process emotional states through dialogue, study, and thoughtful analysis.",
    descHi:
      "आपका मन निरंतर नवीन ज्ञान की खोज में रहता है। आप विचारों के आदान-प्रदान और तर्क के माध्यम से भावनात्मक संतुष्टि पाते हैं।",
  },
  Cancer: {
    titleEn: "Moon in Cancer: Swakshetra, Nurturing & Deeply Intuitive",
    titleHi: "कर्क राशि का चन्द्रमा: स्वग्रही, संवेदनशील एवं वात्सल्यपूर्ण मन",
    descEn:
      "Moon is in its own home sign (Swakshetra). You possess extraordinary empathy, rich memory, maternal care, and an instinctive radar for emotional undercurrents.",
    descHi:
      "चन्द्रमा अपनी ही राशि कर्क में स्थित है। यह आपको अत्यंत संवेदनशील, स्नेही, उत्कृष्ट स्मरण शक्ति और अंतःप्रेरणा का धनी बनाता है।",
  },
  Leo: {
    titleEn: "Moon in Leo: Generous, Proud & Noble Soul",
    titleHi: "सिंह राशि का चन्द्रमा: उदार, स्वाभिमानी एवं तेजस्वी मन",
    descEn:
      "Your emotional disposition is warm, royal, and protective. You feel happiest when inspiring others and being respected for your integrity.",
    descHi:
      "आपका मन तेजस्वी और उदार है। आप सिद्धांतवादी होते हैं तथा सम्मान, निष्ठा और दूसरों को प्रेरित करने में सुख का अनुभव करते हैं।",
  },
  Virgo: {
    titleEn: "Moon in Virgo: Methodical, Helpful & Observant Mind",
    titleHi: "कन्या राशि का चन्द्रमा: सूक्ष्मदर्शी, विवेकशील एवं सेवाभावी मन",
    descEn:
      "You find calm through order, cleanliness, helpful service, and mental organization. You notice subtle discrepancies that others overlook.",
    descHi:
      "आपका मन व्यवस्थित और विवेकशील है। आप दूसरों की सहायता करने, व्यवस्थित रहने और समस्याओं का तार्किक हल निकालने में संतुष्टि पाते हैं।",
  },
  Libra: {
    titleEn: "Moon in Libra: Harmonious, Diplomatic & Relationship-Oriented",
    titleHi: "तुला राशि का चन्द्रमा: संतुलित, सौम्य एवं न्यायप्रिय मन",
    descEn:
      "Your emotions thrive on peace, symmetry, and mutual fairness. You naturally build bridges and bring discordant viewpoints into equilibrium.",
    descHi:
      "आपका मन सदैव संतुलन, न्याय और सौहार्द की तलाश में रहता है। आप विवादों को सुलझाने और परस्पर प्रेम बढ़ाने में कुशल होते हैं।",
  },
  Scorpio: {
    titleEn: "Moon in Scorpio: Neecha, Transformative & Piercing Emotions",
    titleHi: "वृश्चिक राशि का चन्द्रमा: नीच का, गूढ़ एवं अगाध आंतरिक शक्ति",
    descEn:
      "The Moon in Scorpio operates at deep, transformative depths. While emotions are intense, this placement yields unparalleled psychological resilience and occult wisdom.",
    descHi:
      "वृश्चिक राशि में चन्द्रमा नीच राशि का होता है। यह जातक को गहन भावनात्मक शक्ति, तीव्र अंतर्दृष्टि और विपरीत परिस्थितियों से उबरने का अद्वितीय साहस देता है।",
  },
  Sagittarius: {
    titleEn: "Moon in Sagittarius: Dharmic, Optimistic & Philosophical Spirit",
    titleHi: "धनु राशि का चन्द्रमा: धर्मनिष्ठ, आशावादी एवं ज्ञान-पिपासु मन",
    descEn:
      "Your emotional constitution is rooted in faith, truth, and philosophical inquiry. You have an expansive outlook and inspire hope in others.",
    descHi:
      "आपका मन सत्य, धर्म और उच्च ज्ञान के प्रति समर्पित है। आप कठिन समय में भी आशावादी बने रहते हैं और दूसरों को उचित राह दिखाते हैं।",
  },
  Capricorn: {
    titleEn: "Moon in Capricorn: Stoic, Disciplined & Responsible Mind",
    titleHi: "मकर राशि का चन्द्रमा: अनुशासित, गंभीर एवं कर्तव्यनिष्ठ मन",
    descEn:
      "Your emotions are disciplined and mature. You process life with pragmatic realism and achieve lasting peace through fulfilling your sacred responsibilities.",
    descHi:
      "आपका मन कर्तव्यपरायण, गंभीर और व्यावहारिक है। आप कठिनाइयों से विचलित नहीं होते तथा निरंतर परिश्रम से अपने लक्ष्यों को सिद्ध करते हैं।",
  },
  Aquarius: {
    titleEn: "Moon in Aquarius: Visionary, Humanitarian & Objective Thinker",
    titleHi: "कुम्भ राशि का चन्द्रमा: दूरदर्शी, निष्पक्ष एवं लोकहितैषी मन",
    descEn:
      "You possess an egalitarian, broad-minded inner temperament. You care deeply for humanity while maintaining an objective, calm detachment.",
    descHi:
      "आपका मन स्वतंत्र, वैज्ञानिक और लोककल्याण की भावना से ओतप्रोत है। आप जाति-धर्म से परे संपूर्ण मानव जाति के उत्थान का विचार करते हैं।",
  },
  Pisces: {
    titleEn: "Moon in Pisces: Transcendent, Devotional & Compassionate Heart",
    titleHi: "मीन राशि का चन्द्रमा: भक्तिभाव, असीम करुणा एवं मोक्षगामी मन",
    descEn:
      "Your emotional realm is oceanic, intuitive, and spiritually attuned. You possess effortless empathy, rich artistic imagination, and devotion to God.",
    descHi:
      "आपका मन अगाध करुणा, ईश्वर-भक्ति और आध्यात्मिक शांति से परिपूर्ण है। आप दूसरों के कष्टों को अपना समझते हैं और परोपकार में लीन रहते हैं।",
  },
};

export const BHAVA_SIGNIFICATIONS = {
  1: {
    titleEn: "1st House: Tanu Bhava (तनु भाव) - Self & Vitality",
    titleHi: "प्रथम भाव: तनु भाव - देह, स्वभाव एवं आत्मा",
    descEn:
      "Represents the physical constitution, overall vitality, life path, fame, head, and innate character. It is both a Kendra (pillar) and a Trikona (auspicious triangle).",
    descHi:
      "यह भाव शरीर, रूप-रंग, स्वास्थ्य, स्वभाव, आत्मविश्वास और संपूर्ण जीवन की दिशा का प्रतिनिधित्व करता है। यह केंद्र और त्रिकोण दोनों होने से अति महत्वपूर्ण है।",
  },
  2: {
    titleEn: "2nd House: Dhana Bhava (धन भाव) - Wealth & Speech",
    titleHi: "द्वितीय भाव: धन भाव - संचित धन, कुटुंब एवं वाणी",
    descEn:
      "Governs accumulated wealth, financial assets, speech eloquence, lineage, early childhood conditioning, and food habits.",
    descHi:
      "यह भाव पैतृक संपत्ति, बैंक बैलेंस, वाणी का प्रभाव, पारिवारिक मूल्य, खान-पान और दाहिनी आंख का विचार करता है।",
  },
  3: {
    titleEn: "3rd House: Sahaja Bhava (सहज भाव) - Courage & Initiative",
    titleHi: "तृतीय भाव: सहज भाव - पराक्रम, भाई-बहन एवं पुरुषार्थ",
    descEn:
      "Governs personal courage (Valour), initiatives, younger siblings, artistic manual skills, writing, and short travel.",
    descHi:
      "यह भाव जातक के पराक्रम, बाहुबल, छोटे भाई-बहनों, संचार कौशल, लेखन कला और आत्मबल का सूचक है।",
  },
  4: {
    titleEn: "4th House: Sukha Bhava (सुख भाव) - Home & Mother",
    titleHi: "चतुर्थ भाव: सुख भाव - माता, गृह, वाहन एवं मानसिक शांति",
    descEn:
      "Governs domestic happiness, relationship with mother, fixed assets, real estate, vehicles, and peace of heart (Hridayam).",
    descHi:
      "यह भाव मातृसुख, भूमि, भवन, वाहन, पैतृक सुख और आंतरिक मानसिक शांति का केंद्र है।",
  },
  5: {
    titleEn: "5th House: Putra Bhava (पुत्र भाव) - Intellect & Karma",
    titleHi: "पंचम भाव: पुत्र एवं विद्या भाव - बुद्धि, संतति एवं पूर्व पुण्य",
    descEn:
      "The premier Lakshmi Trikona governing creative intellect, past-life merits (Purva Punya), children, mantra initiation, and higher education.",
    descHi:
      "यह परम लक्ष्मी त्रिकोण भाव है जो पूर्व जन्मों के पुण्य, प्रखर बुद्धि, संतान सुख, मन्त्र सिद्धि और उच्च विद्या को दर्शाता है।",
  },
  6: {
    titleEn: "6th House: Ari Bhava (अरि भाव) - Overcoming Obstacles",
    titleHi: "षष्ठ भाव: अरि/रिपु भाव - रोग, ऋण, शत्रु एवं सेवा",
    descEn:
      "An Upachaya house governing daily service, discipline, health resilience, defeating competitors, debts, and overcoming difficulties through effort.",
    descHi:
      "यह उपचय भाव है जो रोगों से मुक्ति, शत्रुओं पर विजय, प्रतियोगी परीक्षाओं में सफलता, ऋण निवारण और कर्मठ सेवा का बोध कराता है।",
  },
  7: {
    titleEn: "7th House: Yuvati Bhava (युवति भाव) - Marriage & Partnership",
    titleHi: "सप्तम भाव: कलत्र/युवति भाव - विवाह, साझेदारी एवं लोक संबंध",
    descEn:
      "Governs spouse, marital compatibility, business partnerships, foreign trade, and how you relate to the external public.",
    descHi:
      "यह भाव जीवनसाथी के स्वरूप, दांपत्य सुख, व्यावसायिक साझेदारी, विदेश यात्रा और सामाजिक जनसंपर्क का प्रतिनिधि है।",
  },
  8: {
    titleEn: "8th House: Randhra Bhava (रन्ध्र भाव) - Longevity & Transformation",
    titleHi: "अष्टम भाव: आयु/रन्ध्र भाव - दीर्घायु, गूढ़ ज्ञान एवं आकस्मिक लाभ",
    descEn:
      "Governs longevity (Ayushya), sudden inheritance, research, hidden occult knowledge, deep transformations, and unearned wealth.",
    descHi:
      "यह भाव जातक की आयु, गूढ़ आध्यात्मिक रहस्य, गुप्त विद्याएं (ज्योतिष/तंत्र), आकस्मिक धन लाभ और आत्म-रूपांतरण को नियंत्रित करता है।",
  },
  9: {
    titleEn: "9th House: Dharma Bhava (धर्म भाव) - Fortune & Divine Grace",
    titleHi: "नवम भाव: भाग्य एवं धर्म भाव - ईश्वरीय कृपा, गुरु एवं तीर्थाटन",
    descEn:
      "The paramount auspicious Trikona governing divine luck (Bhagya), righteousness (Dharma), father, spiritual preceptors (Gurus), and pilgrimage.",
    descHi:
      "यह सर्वोच्च भाग्य स्थान है जो ईश्वरीय कृपा, धर्म-परायणता, पिता के संस्कार, गुरु कृपा, तीर्थ यात्रा और उच्च प्रतिष्ठा का सूचक है।",
  },
  10: {
    titleEn: "10th House: Karma Bhava (कर्म भाव) - Career & Social Stature",
    titleHi: "दशम भाव: कर्म भाव - आजीविका, पद, प्रतिष्ठा एवं समाज सेवा",
    descEn:
      "The pinnacle Kendra governing profession, career authority, leadership, ethical duties in society, and honors conferred by the state.",
    descHi:
      "यह जन्म पत्रिका का सर्वोच्च केंद्र भाव है जो कार्यक्षेत्र, सामाजिक प्रतिष्ठा, नेतृत्व, राजकीय सम्मान और आजीविका की दिशा तय करता है।",
  },
  11: {
    titleEn: "11th House: Labha Bhava (लाभ भाव) - Gains & Aspirations",
    titleHi: "एकादश भाव: लाभ भाव - आर्थिक उपलब्धि, मित्र एवं मनोकामना सिद्धि",
    descEn:
      "The house of gains (Sarvabhishta Siddhi) governing revenues, achievement of dreams, influential elder network, and broad social impact.",
    descHi:
      "यह समस्त इच्छाओं की पूर्ति का भाव है जो निरंतर आय, बड़े भाई-बहनों का सहयोग, प्रभावशाली मित्रों का साथ और समृद्धि प्रदान करता है।",
  },
  12: {
    titleEn: "12th House: Vyaya Bhava (व्यय भाव) - Liberation & Foreign Lands",
    titleHi: "द्वादश भाव: व्यय एवं मोक्ष भाव - मोक्ष, विदेश गमन एवं दान",
    descEn:
      "Governs spiritual liberation (Moksha), meditation, charitable expenses, dreams, foreign settlements, and detachment from worldly bondages.",
    descHi:
      "यह परम मोक्ष भाव है जो ध्यान, आध्यात्मिक एकांत, परोपकारी व्यय, विदेश प्रवास, अनिद्रा से मुक्ति और सांसारिक बंधनों से वैराग्य का कारक है।",
  },
};

/**
 * Computes deep planetary house interpretations in English and Hindi.
 */
export function getPlanetHouseInterpretation(planet, house, sign, isRetro, language = "en") {
  const isHi = language === "hi" || language === "hindi";

  const PLANET_NAMES = {
    SUN: { en: "Sun (Surya)", hi: "सूर्य देव" },
    MOON: { en: "Moon (Chandra)", hi: "चन्द्रमा" },
    MARS: { en: "Mars (Mangala)", hi: "मंगल ग्रह" },
    MERCURY: { en: "Mercury (Budha)", hi: "बुध देव" },
    JUPITER: { en: "Jupiter (Guru)", hi: "देवगुरु बृहस्पति" },
    VENUS: { en: "Venus (Shukra)", hi: "शुक्राचार्य" },
    SATURN: { en: "Saturn (Shani)", hi: "शनि देव" },
    RAHU: { en: "Rahu (North Node)", hi: "राहु" },
    KETU: { en: "Ketu (South Node)", hi: "केतु" },
  };

  const pUpper = (planet || "").trim().toUpperCase();
  const pObj = PLANET_NAMES[pUpper] || { en: planet, hi: planet };
  const pName = isHi ? pObj.hi : pObj.en;
  const retroText = isRetro
    ? isHi ? " (वक्री - विशेष चेष्टा बल)" : " (Retrograde - amplified chesta bala)"
    : "";

  // Interpretations grounded in Parashara Hora Shastra & Phaladeepika
  const key = `${pUpper}_${house}`;

  const SPECIFIC_INTERPRETATIONS = {
    SUN_1: {
      en: "Sun in the 1st House imparts commanding presence, strong vitality, and independent leadership. The native possesses an unshakeable sense of self-respect.",
      hi: "लग्न में सूर्य जातक को तेजस्वी व्यक्तित्व, उत्तम स्वास्थ्य और स्वाभाविक नेतृत्व क्षमता प्रदान करता है। जातक में स्वाभिमान और स्पष्टवादिता कूट-कूट कर भरी होती है।",
    },
    SUN_10: {
      en: "Sun in the 10th House achieves maximum directional strength (Digbala), forming the celebrated Kuladipaka Yoga. It confers high executive authority, governmental honor, and professional distinction.",
      hi: "दशम भाव में सूर्य दिग्बली होकर 'कुलदीपक योग' बनाता है। यह जातक को राजकीय सेवा, उच्च पद, प्रशासनिक अधिकार और कार्यक्षेत्र में सर्वोच्च यश प्रदान करता है।",
    },
    MOON_4: {
      en: "Moon in the 4th House attains Digbala in the house of happiness. It bestows maternal blessings, emotional peace, comfortable dwellings, and popularity.",
      hi: "चतुर्थ भाव में चन्द्रमा दिग्बली होता है। यह जातक को मातृसुख, मानसिक शांति, भव्य आवास, वाहन सुख और समाज में लोकप्रियता प्रदान करता है।",
    },
    MOON_9: {
      en: "Moon in the 9th House indicates a deeply devotional and dharmic mind. Fortune blossoms through spiritual pilgrimages, righteous principles, and charitable acts.",
      hi: "नवम भाव में चन्द्रमा धर्मनिष्ठ और पुण्यात्मा बनाता है। जातक को तीर्थ यात्राओं, गुरु कृपा और धार्मिक आचरण से निरंतर भाग्योदय प्राप्त होता है।",
    },
    MARS_10: {
      en: "Mars in the 10th House gains formidable Digbala. It generates tireless determination, strategic bravery, engineering acumen, and mastery over formidable obstacles.",
      hi: "दशम भाव में मंगल दिग्बली होकर अपार पराक्रम देता है। जातक कठिन से कठिन बाधाओं को पार करता है तथा रक्षा, तकनीकी, चिकित्सा अथवा उद्योग में कीर्तिमान स्थापित करता है।",
    },
    MERCURY_1: {
      en: "Mercury in the 1st House is Digbala, conferring profound intellect, sharp wit, photographic memory, and youthful charm.",
      hi: "लग्न में बुध दिग्बली होकर प्रखर बुद्धि, हाजिरजवाबी, उत्कृष्ट वाक्पटुता और बहुमुखी प्रतिभा का वरदान देता है।",
    },
    JUPITER_1: {
      en: "Jupiter in the 1st House is exceptionally auspicious (Digbala). It confers immense wisdom, noble stature, lifelong divine protection, and moral authority.",
      hi: "लग्न में बृहस्पति दिग्बली होकर एक लाख दोषों का शमन करता है। यह जातक को दीर्घायु, सत्वगुणी स्वभाव, पूज्य प्रतिष्ठा और ईश्वरीय संरक्षण प्रदान करता है।",
    },
    JUPITER_5: {
      en: "Jupiter in the 5th House blesses with extraordinary intellect, meritorious progeny, spiritual mantra siddhi, and wise advisory counsel.",
      hi: "पंचम भाव में गुरु प्रखर बुद्धि, गुणवान संतान, मन्त्र साधना में सफलता और पूर्व जन्मों के संचित पुण्यों का पूर्ण फल प्रदान करता है।",
    },
    JUPITER_9: {
      en: "Jupiter in the 9th House in its own karaka domain confers supreme fortune, dharmic living, scholarly renown, and the blessings of sacred teachers.",
      hi: "नवम भाव में गुरु परम कारक होकर अखंड भाग्योदय देता है। जातक धार्मिक, विद्वान, परोपकारी और समाज में गुरु-तुल्य आदरणीय बनता है।",
    },
    VENUS_4: {
      en: "Venus in the 4th House reaches Digbala, ensuring artistic refinement, luxurious vehicles, palatial comfort, and a blissful domestic life.",
      hi: "चतुर्थ भाव में शुक्र दिग्बली होकर समस्त भौतिक सुख, उत्तम वाहन, कलात्मक गृह एवं दांपत्य में माधुर्य प्रदान करता है।",
    },
    SATURN_7: {
      en: "Saturn in the 7th House possesses Digbala. It indicates mature partnerships, enduring marital commitment, and success through patient negotiations.",
      hi: "सप्तम भाव में शनि दिग्बली होता है। यह जातक को गंभीर एवं निष्ठावान जीवनसाथी, साझेदारी में स्थायित्व और परिपक्व व्यवहार से सफलता देता है।",
    },
    SATURN_11: {
      en: "Saturn in the 11th House is historically hailed by Parashara for producing steady, long-lasting financial gains, loyal allies, and fulfillment of deep aspirations.",
      hi: "एकादश भाव में शनि महर्षि पराशर के अनुसार अत्यंत शुभ माना गया है। यह निरंतर धन लाभ, वफादार मित्रों और जीवन की बड़ी मनोकामनाओं की पूर्ति कराता है।",
    },
    RAHU_10: {
      en: "Rahu in the 10th House bestows meteoric career rise, political prowess, unconventional innovations, and ability to influence large masses.",
      hi: "दशम भाव में राहु अप्रत्याशित व्यावसायिक उन्नति, राजनीतिक प्रभाव, आधुनिक तकनीकी कौशल और जनमानस को प्रभावित करने की शक्ति देता है।",
    },
    KETU_12: {
      en: "Ketu in the 12th House is classically revered as the primary significator of Moksha (liberation), meditative depth, and detachment from worldly illusions.",
      hi: "द्वादश भाव में केतु को मोक्ष का मुख्य कारक माना गया है। यह गहन ध्यान, आध्यात्मिक वैराग्य और जन्म-मरण के चक्र से मुक्ति की ओर प्रेरित करता है।",
    },
  };

  if (SPECIFIC_INTERPRETATIONS[key]) {
    return isHi
      ? `${pName} ${house}वें भाव में: ${SPECIFIC_INTERPRETATIONS[key].hi}${retroText}`
      : `${pName} in ${house}th House: ${SPECIFIC_INTERPRETATIONS[key].en}${retroText}`;
  }

  // General classical synthesis
  return isHi
    ? `${pName} ${house}वें भाव (${sign} राशि) में स्थित है। यह भाव से संबंधित विषयों को अपनी ऊर्जा से प्रभावित करता है।${retroText}`
    : `${pName} resides in the ${house}th House in ${sign}. It channels its natural significations into this life domain.${retroText}`;
}

/**
 * Explains active Vimshottari Mahadasha in English and Hindi.
 */
export const MAHADASHA_EXPLANATIONS = {
  Sun: {
    titleEn: "Sun (Surya) Mahadasha - 6 Years",
    titleHi: "सूर्य महादशा - 6 वर्ष का काल",
    descEn:
      "A period of awakening, professional visibility, relationship with authority, and soul discovery. Bestows executive progress when well-aspected.",
    descHi:
      "यह आत्म-जागृति, सामाजिक प्रतिष्ठा, पिता के सुख और कार्यक्षेत्र में प्रभाव बढ़ाने का समय है। इस अवधि में आत्मबल और अनुशासन की वृद्धि होती है।",
    remedyEn: "Offer Arghya to Surya at sunrise and recite Aditya Hridaya Stotram.",
    remedyHi: "प्रतिदिन प्रातःकाल सूर्य को तांबे के पात्र से अर्घ्य दें एवं आदित्य हृदय स्तोत्र का पाठ करें।",
  },
  Moon: {
    titleEn: "Moon (Chandra) Mahadasha - 10 Years",
    titleHi: "चन्द्र महादशा - 10 वर्ष का काल",
    descEn:
      "A period emphasizing emotional expansion, domestic changes, intuitive development, public relations, and maternal connections.",
    descHi:
      "यह मानसिक शांति, रचनात्मक कार्यों, मातृत्व सुख, लोक-व्यवहार और भावनात्मक विकास की समयावधि है। ध्यान और साधना से विशेष लाभ होता है।",
    remedyEn: "Honor and serve mother figures; meditate on Lord Shiva on Mondays.",
    remedyHi: "माता के चरण स्पर्श कर आशीर्वाद लें एवं सोमवार को शिवलिंग पर जल-दूध से अभिषेक करें।",
  },
  Mars: {
    titleEn: "Mars (Mangala) Mahadasha - 7 Years",
    titleHi: "मंगल महादशा - 7 वर्ष का काल",
    descEn:
      "A period of dynamic energy, property investments, bold initiatives, overcoming competitors, and surgical/technical accomplishments.",
    descHi:
      "यह साहस, पराक्रम, भूमि-भवन क्रय, तकनीकी प्रगति और शत्रुओं पर विजय की अवधि है। क्रोध पर नियंत्रण रख पुरुषार्थ में रत रहें।",
    remedyEn: "Chant Hanuman Chalisa on Tuesdays and perform physical service.",
    remedyHi: "मंगलवार को हनुमान चालीसा का पाठ करें एवं जरूरतमंदों को गुड़ और लाल मसूर की दाल का दान करें।",
  },
  Rahu: {
    titleEn: "Rahu Mahadasha - 18 Years",
    titleHi: "राहु महादशा - 18 वर्ष का काल",
    descEn:
      "A transformative period of high material ambitions, foreign travels, unconventional breakthroughs, and spiritual disillusionment leading to truth.",
    descHi:
      "यह जीवन में बड़े परिवर्तन, विदेशी संपर्कों, अप्रत्याशित सफलता और आधुनिक नवाचारों का समय है। भ्रम से बचकर धर्ममार्ग पर चलना श्रेयस्कर है।",
    remedyEn: "Feed stray birds and chant Om Ram Rahave Namah during twilight.",
    remedyHi: "पक्षियों को सात प्रकार का अन्न (सतनजा) डालें एवं संध्या समय 'ॐ रां राहवे नमः' का जप करें।",
  },
  Jupiter: {
    titleEn: "Jupiter (Guru) Mahadasha - 16 Years",
    titleHi: "बृहस्पति (गुरु) महादशा - 16 वर्ष का काल",
    descEn:
      "A golden era of spiritual knowledge, moral expansion, progeny, scholarly recognition, wealth accumulation, and divine grace.",
    descHi:
      "यह ज्ञान, समृद्धि, विवाह, संतान सुख, धर्म कर्म और ईश्वरीय कृपा का स्वर्णिम काल माना जाता है। इस अवधि में सद्बुद्धि और आदर बढ़ता है।",
    remedyEn: "Respect teachers and preceptors; donate yellow grains and study classical shastras.",
    remedyHi: "गुरुजनों का आदर करें, चने की दाल या केले का दान करें एवं श्रीमद्भगवद्गीता का अध्ययन करें।",
  },
  Saturn: {
    titleEn: "Saturn (Shani) Mahadasha - 19 Years",
    titleHi: "शनि महादशा - 19 वर्ष का काल",
    descEn:
      "A profound period of karmic restructuring, enduring discipline, steadfast patience, humility, and long-term monumental achievements.",
    descHi:
      "यह कठोर परिश्रम, संयम, आत्म-शुद्धि और स्थायी कीर्ति की आधारशिला रखने का समय है। न्यायप्रिय आचरण से शनि देव शुभ फल देते हैं।",
    remedyEn: "Perform selfless service for the working class and light a sesame oil lamp on Saturdays.",
    remedyHi: "कर्मचारियों और जरूरतमंदों की सेवा करें तथा शनिवार की संध्या को पीपल के वृक्ष के नीचे तिल के तेल का दीपक जलाएं।",
  },
  Mercury: {
    titleEn: "Mercury (Budha) Mahadasha - 17 Years",
    titleHi: "बुध महादशा - 17 वर्ष का काल",
    descEn:
      "A fertile period for intellectual development, commercial success, communicative eloquence, analytical research, and versatile accomplishments.",
    descHi:
      "यह बुद्धि के विकास, व्यापार में लाभ, लेखन, भाषण, शिक्षा और बहुमुखी संपर्कों के विस्तार की अत्यंत अनुकूल समयावधि है।",
    remedyEn: "Serve cows with green grass and chant Vishnu Sahasranama on Wednesdays.",
    remedyHi: "बुधवार को गौमाता को हरा चारा खिलाएं एवं श्री विष्णु सहस्रनाम का श्रवण या पाठ करें।",
  },
  Ketu: {
    titleEn: "Ketu Mahadasha - 7 Years",
    titleHi: "केतु महादशा - 7 वर्ष का काल",
    descEn:
      "A deeply mystical period of spiritual awakening, detachment from superficial illusions, intuitive insights, and quest for liberation (Moksha).",
    descHi:
      "यह अध्यात्म, अंतर्मुखी साधना, मोह-माया से मुक्ति और आत्म-साक्षात्कार की अवधि है। भौतिक उलझनों से निकलकर ईश्वर में ध्यान लगाएं।",
    remedyEn: "Feed street dogs with bread and meditate peacefully in morning solitude.",
    remedyHi: "श्वानों (कुत्तों) को भोजन दें, मंदिर में ध्वज अर्पित करें और प्रतिदिन मौन ध्यान का अभ्यास करें।",
  },
  Venus: {
    titleEn: "Venus (Shukra) Mahadasha - 20 Years",
    titleHi: "शुक्र महादशा - 20 वर्ष का काल",
    descEn:
      "A harmonious period of artistic expression, marital joy, material prosperity, aesthetic pleasures, and refined lifestyle.",
    descHi:
      "यह दांपत्य सुख, सौंदर्य, कला, वाहन, आभूषण और ऐश्वर्य का काल है। प्रेम और सौहार्दपूर्ण संबंधों से जीवन में आनंद की वर्षा होती है।",
    remedyEn: "Offer white flowers in temple and respect women and artistic traditions.",
    remedyHi: "शुक्रवार को कन्याओं को खीर या मिश्री का प्रसाद दें और महिलाओं का सम्मान करें।",
  },
};

/**
 * Automatically inspects chart and detects classical Yogas with shloka citations.
 */
export function detectChartYogas(chart, language = "en") {
  if (!chart || !chart.planets || !chart.houses) return [];

  const isHi = language === "hi" || language === "hindi";
  const yogas = [];

  const jupiter = chart.planets.find((p) => p.planet === "JUPITER");
  const moon = chart.planets.find((p) => p.planet === "MOON");
  const sun = chart.planets.find((p) => p.planet === "SUN");
  const mercury = chart.planets.find((p) => p.planet === "MERCURY");
  const mars = chart.planets.find((p) => p.planet === "MARS");
  const venus = chart.planets.find((p) => p.planet === "VENUS");
  const saturn = chart.planets.find((p) => p.planet === "SATURN");

  // 1. Gajakesari Yoga: Jupiter in Kendra (1, 4, 7, 10) from Moon
  if (jupiter && moon) {
    const diff = (jupiter.house - moon.house + 12) % 12 + 1;
    if ([1, 4, 7, 10].includes(diff)) {
      yogas.push({
        id: "gajakesari",
        name: isHi ? "गजकेसरी योग (Gajakesari Yoga)" : "Gajakesari Yoga",
        category: isHi ? "शुभ राजयोग" : "Auspicious Raja Yoga",
        shloka: "केन्द्रे देवगुरौ स्थिते शशिसुतात्...",
        explanation: isHi
          ? "चन्द्रमा से केंद्र (1, 4, 7, 10) में देवगुरु बृहस्पति स्थित हैं। यह महापुरुष योग जातक को असीम ज्ञान, वाक-चातुर्य, निष्कलंक यश, राजकीय आदर और दीर्घायु प्रदान करता है।"
          : "Jupiter resides in an auspicious Kendra (1st, 4th, 7th, or 10th) from the Moon. Bestows noble intellect, moral authority, enduring fame, and divine protection from adversaries.",
        status: "AUSPICIOUS",
      });
    }
  }

  // 2. Budhaditya Yoga: Sun and Mercury together
  if (sun && mercury && sun.sign === mercury.sign) {
    yogas.push({
      id: "budhaditya",
      name: isHi ? "बुधादित्य योग (Budhaditya Yoga)" : "Budhaditya Yoga",
      category: isHi ? "बुद्धि एवं यश योग" : "Intellectual Eminence Yoga",
      shloka: "रविजसौम्य समायोगात्...",
      explanation: isHi
        ? `सूर्य और बुध देव दोनों ${sun.sign} राशि में एक साथ स्थित हैं। यह प्रखर बुद्धि, प्रशासनिक क्षमता, उच्च विद्या, गणितीय कुशलता और समाज में सम्मानित प्रतिष्ठा का कारक है।`
        : `Sun and Mercury conjoin in ${sun.sign}. This celebrated conjunction fosters sharp analytical acuity, administrative aptitude, scholarly distinction, and articulate speech.`,
      status: "AUSPICIOUS",
    });
  }

  // 3. Chandra-Mangala Yoga: Moon and Mars together
  if (moon && mars && moon.sign === mars.sign) {
    yogas.push({
      id: "chandra_mangala",
      name: isHi ? "चन्द्र-मंगल योग (Chandra-Mangala Yoga)" : "Chandra-Mangala Yoga",
      category: isHi ? "धन योग" : "Prosperity & Enterprise Yoga",
      shloka: "शशिरुधिर समागमे धनसमृद्धिः...",
      explanation: isHi
        ? "चन्द्रमा और मंगल का एक ही राशि में योग जातक को साहसी, वित्तीय मामलों में चतुर, अचल संपत्ति का स्वामी और उद्यमशील बनाता है।"
        : "Moon and Mars conjoin in the same sign. Confers energetic enterprise, acumen in financial creation, real estate gains, and unwavering focus on goals.",
      status: "AUSPICIOUS",
    });
  }

  // 4. Amala Yoga: Benefic (Jupiter/Venus/Mercury) in 10th house from Lagna
  const tenthHouse = chart.houses.find((h) => h.house === 10);
  if (tenthHouse && tenthHouse.planets) {
    const hasBenefic = tenthHouse.planets.some((p) => {
      const pName = typeof p === "string" ? p : p.planet || p.name;
      return ["JUPITER", "VENUS", "MERCURY"].includes(pName?.toUpperCase());
    });
    if (hasBenefic) {
      yogas.push({
        id: "amala_yoga",
        name: isHi ? "अमला योग (Amala Yoga)" : "Amala Yoga",
        category: isHi ? "अखंड कीर्ति योग" : "Pure Reputation Yoga",
        shloka: "दशमे शुभखेचरे अमल योगः...",
        explanation: isHi
          ? "दशम भाव में शुभ ग्रह स्थित होने से 'अमला योग' बनता है। यह जातक को परोपकारी कर्म, निष्कलंक ख्याति, राज्य सम्मान और आदरणीय पद दिलाता है।"
          : "A natural benefic graces the 10th House, forming Amala Yoga. Ensures an unblemished moral career, widespread benevolence, and enduring societal renown.",
        status: "AUSPICIOUS",
      });
    }
  }

  // 5. Mangal Dosha (Kuja Dosha) Check
  if (mars) {
    const mangalHouses = [1, 2, 4, 7, 8, 12];
    if (mangalHouses.includes(mars.house)) {
      yogas.push({
        id: "mangal_dosha",
        name: isHi ? "मंगल विचार / कुज योग (Mangal Consideration)" : "Mars Placement (Mangal Consideration)",
        category: isHi ? "विवाह एवं ऊर्जा संतुलन" : "Relationship & Energy Dynamics",
        shloka: "लग्ने व्यये च पाताले जामित्रे चाष्टमे कुजे...",
        explanation: isHi
          ? `मंगल देव ${mars.house}वें भाव में स्थित हैं। यह स्थिति जातक को अपार ऊर्जा और दृढ़ स्वभाव देती है। दांपत्य जीवन में परस्पर आदर और सामंजस्य बनाए रखने हेतु कुंडली मिलान एवं हनुमान साधना अनुशंसित है।`
          : `Mars is placed in the ${mars.house}th House. Bestows high vitality and passionate drive. Traditional texts recommend conscious patience in partnerships and mutual understanding.`,
        status: "NEUTRAL",
      });
    }
  }

  return yogas;
}

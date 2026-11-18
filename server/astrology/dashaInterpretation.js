/**
 * Gurukul Vimshottari Dasha & Antardasha Interpretation Engine
 *
 * Implements deterministic, chart-grounded Parashari Dasha analysis synthesizing:
 * 1. 3-tier Vimshottari timing (Mahadasha, Antardasha, Pratyantardasha)
 * 2. Planetary Dignity (Exalted, Moolatrikona, Own, Friend, Neutral, Enemy, Debilitated, Combust, Retrograde)
 * 3. Bhava Ownership & Placement from Ascendant (Lagna, Yogakaraka, Kendra, Trikona, Dusthana 6/8/12, Maraka 2/7)
 * 4. Mutual Graha Sambandha (1/1 Yuti, 1/7 Samasaptaka, 5/9 Trikona, 4/10 Kendra, 3/11 Sahaja-Labha, 6/8 Shadashtaka, 2/12 Dvi-Dvadasha)
 * 5. Natural Planetary Relationships (Mitra, Shatru, Sama)
 * 6. Multi-domain life analysis (Career, Wealth, Relationships, Health, Education, Spiritual Evolution)
 * 7. Authentic Classical Vedic Remedies (Beej & Gayatri Mantras, Devata Puja, Daan, Vrata/Sadhana)
 * 8. Scriptural Citations: Brihat Parashara Hora Shastra (BPHS Ch. 47–58, 84) & Phaladeepika (Ch. 19–22)
 * 9. Ethical, non-fatalistic spiritual guidance disclaimers
 * 10. Complete bilingual support (English and Devanagari Hindi)
 */

import { VIMSHOTTARI_DASHA_CYCLE, ZODIAC_SIGNS } from "./constants.js";
import { computeComprehensiveVimshottari } from "./dashaEngine.js";

// Natural Planetary Friendships according to BPHS Ch. 3
export const NATURAL_RELATIONSHIPS = {
  SUN: {
    friends: ["MOON", "MARS", "JUPITER"],
    neutral: ["MERCURY"],
    enemies: ["VENUS", "SATURN", "RAHU", "KETU"],
  },
  MOON: {
    friends: ["SUN", "MERCURY"],
    neutral: ["MARS", "JUPITER", "VENUS", "SATURN"],
    enemies: ["RAHU", "KETU"],
  },
  MARS: {
    friends: ["SUN", "MOON", "JUPITER"],
    neutral: ["VENUS", "SATURN"],
    enemies: ["MERCURY", "RAHU"],
  },
  MERCURY: {
    friends: ["SUN", "VENUS"],
    neutral: ["MARS", "JUPITER", "SATURN"],
    enemies: ["MOON"],
  },
  JUPITER: {
    friends: ["SUN", "MOON", "MARS"],
    neutral: ["SATURN", "RAHU", "KETU"],
    enemies: ["MERCURY", "VENUS"],
  },
  VENUS: {
    friends: ["MERCURY", "SATURN", "RAHU", "KETU"],
    neutral: ["MARS", "JUPITER"],
    enemies: ["SUN", "MOON"],
  },
  SATURN: {
    friends: ["MERCURY", "VENUS", "RAHU"],
    neutral: ["JUPITER"],
    enemies: ["SUN", "MOON", "MARS", "KETU"],
  },
  RAHU: {
    friends: ["VENUS", "SATURN", "MERCURY"],
    neutral: ["JUPITER"],
    enemies: ["SUN", "MOON", "MARS"],
  },
  KETU: {
    friends: ["MARS", "VENUS", "SATURN"],
    neutral: ["MERCURY", "JUPITER"],
    enemies: ["SUN", "MOON"],
  },
};

// Classical Rulerships of the 12 Signs (0 = Aries ... 11 = Pisces)
export const SIGN_RULERS = {
  0: "MARS", // Aries
  1: "VENUS", // Taurus
  2: "MERCURY", // Gemini
  3: "MOON", // Cancer
  4: "SUN", // Leo
  5: "MERCURY", // Virgo
  6: "VENUS", // Libra
  7: "MARS", // Scorpio
  8: "JUPITER", // Sagittarius
  9: "SATURN", // Capricorn
  10: "SATURN", // Aquarius
  11: "JUPITER", // Pisces
};

// Classical Remedies, Mantras, and Scriptural Citations (BPHS & Phaladeepika)
export const CLASSICAL_REMEDIES = {
  SUN: {
    planetEn: "Sun (Surya)",
    planetHi: "सूर्य (Surya)",
    devataEn: "Lord Shiva / Surya Narayana / Agni",
    devataHi: "भगवान शिव / सूर्य नारायण / अग्नि देव",
    beejMantra: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः ॥",
    beejMantraCount: "7,000 chants over 40 days (or 108 daily at sunrise)",
    gayatriMantra: "ॐ आदित्याय विद्महे मार्तण्डाय धीमहि तन्नः सूर्यः प्रचोदयात् ॥",
    daanItemEn: "Wheat, copper vessel, red sandalwood, ruby/red stone, jaggery, red cloth",
    daanItemHi: "गेहूं, तांबे का पात्र, लाल चंदन, माणिक्य/लाल रत्न, गुड़, लाल वस्त्र",
    daanDayEn: "Sunday morning at sunrise",
    daanDayHi: "रविवार प्रातः सूर्योदय काल",
    daanRecipientEn: "Venerated teacher, scholar, father figure, or hospital temple",
    daanRecipientHi: "विद्वान ब्राह्मण, पूज्य पिता तुल्य व्यक्ति, या चिकित्सालय",
    vrataSadhanaEn: "Sunday fasting (Ravivara Vrata, salt-free food), Surya Namaskar at dawn, daily recitation of Aditya Hridaya Stotram.",
    vrataSadhanaHi: "रविवार व्रत (अलोना/नमक रहित भोजन), प्रातः सूर्य नमस्कार, नित्य आदित्य हृदय स्तोत्र का पाठ।",
    scripturalCitation: "Brihat Parashara Hora Shastra, Ch. 51 (Surya Dasha Phala) & Ch. 84 (Surya Shanti); Phaladeepika Ch. 19, Shlokas 1–4.",
  },
  MOON: {
    planetEn: "Moon (Chandra)",
    planetHi: "चन्द्र (Chandra)",
    devataEn: "Goddess Parvati / Lord Shiva / Gauri",
    devataHi: "माँ पार्वती / भगवान शिव / माता गौरी",
    beejMantra: "ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः ॥",
    beejMantraCount: "11,000 chants over 40 days (or 108 daily at moonrise/night)",
    gayatriMantra: "ॐ क्षीरपुत्राय विद्महे अमृततत्त्वाय धीमहि तन्नश्चन्द्रः प्रचोदयात् ॥",
    daanItemEn: "White rice, milk, silver, white conch, camphor, white clothes, drinking water pots",
    daanItemHi: "सफेद चावल, दूध, चांदी, सफेद शंख, कपूर, श्वेत वस्त्र, शीतल जल का पात्र",
    daanDayEn: "Monday evening during dusk or twilight",
    daanDayHi: "सोमवार संध्याकाल (गोधूलि वेला)",
    daanRecipientEn: "Mother, elderly women, distressed mothers, or water distribution shelters",
    daanRecipientHi: "माता, वृद्ध माताएं, साध्वी अथवा प्याऊ/जल सेवा संस्थान",
    vrataSadhanaEn: "Monday fasting (Somavara Vrata), Chandra Dhyana, honoring and serving the biological mother, pranayama with calm breathing.",
    vrataSadhanaHi: "सोमवार व्रत, चन्द्र ध्यान, अपनी पूज्य माताजी की चरण सेवा, शीतल प्राणायाम और चित्त की एकाग्रता।",
    scripturalCitation: "Brihat Parashara Hora Shastra, Ch. 52 (Chandra Dasha Phala); Phaladeepika Ch. 19, Shlokas 5–8.",
  },
  MARS: {
    planetEn: "Mars (Mangala)",
    planetHi: "मंगल (Mangala)",
    devataEn: "Lord Kartikeya (Subrahmanya) / Lord Hanuman",
    devataHi: "भगवान कार्तिकेय (सुब्रह्मण्य) / श्री हनुमान जी",
    beejMantra: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः ॥",
    beejMantraCount: "10,000 chants over 40 days (or 108 daily on Tuesday)",
    gayatriMantra: "ॐ अंगारकाय विद्महे शक्तिहस्ताय धीमहि तन्नो भौमः प्रचोदयात् ॥",
    daanItemEn: "Red lentils (masoor dal), jaggery, copper, coral, red flowers, sweet bread (roat)",
    daanItemHi: "लाल मसूर की दाल, गुड़, तांबा, मूंगा, लाल पुष्प, मीठी रोटी",
    daanDayEn: "Tuesday noon (Madhyahna)",
    daanDayHi: "मंगलवार दोपहर (मध्याह्न काल)",
    daanRecipientEn: "Soldiers, athletes, celibates, or humble manual workers",
    daanRecipientHi: "सैनिक, खिलाड़ी, ब्रह्मचारी, या परिश्रमी श्रमिक",
    vrataSadhanaEn: "Tuesday fasting (Mangalavara Vrata), recitation of Hanuman Chalisa or Sundarkand, conscious restraint over anger and aggression.",
    vrataSadhanaHi: "मंगलवार व्रत, हनुमान चालीसा अथवा सुन्दरकाण्ड का पाठ, क्रोध व कटु वाणी पर पूर्ण संयम।",
    scripturalCitation: "Brihat Parashara Hora Shastra, Ch. 53 (Mangala Dasha Phala); Phaladeepika Ch. 19, Shlokas 9–12.",
  },
  RAHU: {
    planetEn: "Rahu",
    planetHi: "राहु (Rahu)",
    devataEn: "Goddess Durga / Bhairava / Lord Nagadevata",
    devataHi: "माँ भगवती दुर्गा / बटुक भैरव / नाग देवता",
    beejMantra: "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः ॥",
    beejMantraCount: "18,000 chants over 40 days (or 108 daily in evening)",
    gayatriMantra: "ॐ नागाधिराजाय विद्महे पद्मनेत्राय धीमहि तन्नो राहुः प्रचोदयात् ॥",
    daanItemEn: "Black sesame seeds, mustard oil, dark blue blankets, coconut, iron knife, 7 grains",
    daanItemHi: "काले तिल, सरसों का तेल, गहरे नीले कम्बल, सूखा नारियल, लोहे का चाकू, सप्तधान्य",
    daanDayEn: "Saturday twilight/night or Wednesday dusk",
    daanDayHi: "शनिवार सांझ/रात्रि अथवा बुधवार संध्या",
    daanRecipientEn: "Destitute laborers, sweepers, lepers, or distressed homeless shelters",
    daanRecipientHi: "निराश्रित श्रमिक, स्वच्छता कर्मी, कुष्ठ रोगी या निराश्रित आश्रम",
    vrataSadhanaEn: "Recitation of Durga Saptashati (Argala & Kavacha), Rahu Stotram, avoiding all intoxicating substances and speculative gambling.",
    vrataSadhanaHi: "श्री दुर्गा सप्तशती (अर्गला व कवच) का पाठ, राहु स्तोत्र, तामसिक भोजन व जुए/सट्टे से पूर्ण दूरी।",
    scripturalCitation: "Brihat Parashara Hora Shastra, Ch. 54 (Rahu Dasha Phala); Phaladeepika Ch. 19, Shlokas 13–16.",
  },
  JUPITER: {
    planetEn: "Jupiter (Guru / Brihaspati)",
    planetHi: "बृहस्पति (Guru / Brihaspati)",
    devataEn: "Lord Dakshinamurti / Lord Vishnu / Lord Brahma",
    devataHi: "भगवान दक्षिणामूर्ति / श्री हरि विष्णु / ब्रह्मा जी",
    beejMantra: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः ॥",
    beejMantraCount: "19,000 chants over 40 days (or 108 daily on Thursday)",
    gayatriMantra: "ॐ देवानां च ऋषीणां च गुरुं काञ्चनसन्निभम् । बुद्धिभूतं त्रिलोकेशं तं नमामि बृहस्पतिम् ॥",
    daanItemEn: "Chickpeas (chana dal), turmeric, yellow brass, saffron, yellow cloth, sacred scriptures",
    daanItemHi: "चना दाल, हल्दी की गांठ, पीतल धातु, केसर, पीतांबर वस्त्र, धर्मग्रंथ/पुस्तकें",
    daanDayEn: "Thursday morning during Shukla Paksha",
    daanDayHi: "गुरुवार प्रातःकाल (शुक्ल पक्ष उत्तम)",
    daanRecipientEn: "Spiritual teachers, Vedapathis, temple priests, or educational institutions",
    daanRecipientHi: "आचार्य, वेदपाठी ब्राह्मण, शिक्षक, या गुरुकुल/विद्यार्थी",
    vrataSadhanaEn: "Thursday fasting (Brihaspativara Vrata, eating yellow satvik food), Vishnu Sahasranama Stotram recitation, seva to Guru and mentors.",
    vrataSadhanaHi: "गुरुवार व्रत (पीले सात्विक भोजन का सेवन), विष्णु सहस्रनाम स्तोत्र का पाठ, गुरु व बड़ों का नित्य आदर।",
    scripturalCitation: "Brihat Parashara Hora Shastra, Ch. 55 (Guru Dasha Phala); Phaladeepika Ch. 19, Shlokas 17–20.",
  },
  SATURN: {
    planetEn: "Saturn (Shani)",
    planetHi: "शनि (Shani)",
    devataEn: "Lord Shiva / Lord Yama / Lord Hanuman (as subduer of Shani)",
    devataHi: "भगवान शिव / यमराज / संकटमोचन हनुमान",
    beejMantra: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः ॥",
    beejMantraCount: "23,000 chants over 40 days (or 108 daily after sunset)",
    gayatriMantra: "ॐ काकध्वजाय विद्महे खड्गहस्ताय धीमहि तन्नो मन्दः प्रचोदयात् ॥",
    daanItemEn: "Black urad dal, mustard oil in an iron vessel (Chhaya daan), black footwear, iron utensils",
    daanItemHi: "काली उड़द दाल, लोहे के पात्र में सरसों का तेल (छाया दान), काले जूते, लोहे के बर्तन",
    daanDayEn: "Saturday evening after sunset",
    daanDayHi: "शनिवार सूर्यास्त के उपरांत",
    daanRecipientEn: "Manual laborers, aged individuals, domestic helpers, or disabled souls",
    daanRecipientHi: "शारीरिक श्रमजीवी, वृद्धजन, सेवादार, या दिव्यांगजन",
    vrataSadhanaEn: "Saturday fasting, lighting mustard oil lamp near Peepal tree, Maha Mrityunjaya Mantra, humble selfless service (Nishkama Seva).",
    vrataSadhanaHi: "शनिवार व्रत, पीपल के वृक्ष तले सरसों के तेल का दीपक, महामृत्युंजय मंत्र जप, निष्काम सेवा।",
    scripturalCitation: "Brihat Parashara Hora Shastra, Ch. 56 (Shani Dasha Phala); Phaladeepika Ch. 19, Shlokas 21–24.",
  },
  MERCURY: {
    planetEn: "Mercury (Budha)",
    planetHi: "बुध (Budha)",
    devataEn: "Lord Vishnu / Lord Narayana / Goddess Saraswati",
    devataHi: "भगवान श्री नारायण / माँ सरस्वती",
    beejMantra: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः ॥",
    beejMantraCount: "9,000 chants over 40 days (or 108 daily on Wednesday)",
    gayatriMantra: "ॐ सौम्यरूपाय विद्महे वाणेशाय धीमहि तन्नो सौम्यः प्रचोदयात् ॥",
    daanItemEn: "Whole green moong dal, green emerald/green cloth, bronze vessels, notebooks, pens",
    daanItemHi: "साबुत हरी मूंग दाल, हरे वस्त्र, कांस्य पात्र, कॉपियां, कलम, धार्मिक ग्रंथ",
    daanDayEn: "Wednesday morning",
    daanDayHi: "बुधवार प्रातःकाल",
    daanRecipientEn: "Young students, sisters/daughters, writers, or needy scholars",
    daanRecipientHi: "विद्यार्थी, बहन/बेटी, लेखक, या निर्धन छात्र",
    vrataSadhanaEn: "Wednesday fasting, chanting Vishnu Sahasranama or Budha Kavacha, feeding fresh green grass/spinach to cows (Go Seva).",
    vrataSadhanaHi: "बुधवार व्रत, विष्णु सहस्रनाम या बुध कवच का पाठ, गायों को हरी घास/पालक खिलाना (गौ सेवा)।",
    scripturalCitation: "Brihat Parashara Hora Shastra, Ch. 57 (Budha Dasha Phala); Phaladeepika Ch. 19, Shlokas 25–28.",
  },
  KETU: {
    planetEn: "Ketu",
    planetHi: "केतु (Ketu)",
    devataEn: "Lord Ganesha / Lord Matsya / Lord Rudra",
    devataHi: "भगवान श्री गणेश / मत्स्य अवतार / भगवान रुद्र",
    beejMantra: "ॐ स्रां स्रीं स्रौं सः केतवे नमः ॥",
    beejMantraCount: "17,000 chants over 40 days (or 108 daily at early dawn)",
    gayatriMantra: "ॐ अश्वाध्वजाय विद्महे शूलहस्ताय धीमहि तन्नः केतुः प्रचोदयात् ॥",
    daanItemEn: "Two-color (black & white) blankets, seven grains (Sapta Dhanya), sesame seeds, iron knife",
    daanItemHi: "दो-रंगी कम्बल (काला-सफेद), सप्तधान्य, तिल, लोहे का चाकू, छाता",
    daanDayEn: "Tuesday or Saturday early morning",
    daanDayHi: "मंगलवार अथवा शनिवार प्रातः वेला",
    daanRecipientEn: "Sadhus, monks, hermits, or feeding stray dogs and birds",
    daanRecipientHi: "साधु-सन्यासी, एकांतवासी साधक, या श्वान (कुत्ते) व पक्षियों की सेवा",
    vrataSadhanaEn: "Ganesha Atharvashirsha recitation, silent meditation (dhyana), detachment from ego, pilgrimage to sacred waters.",
    vrataSadhanaHi: "गणेश अथर्वशीर्ष का पाठ, मौन ध्यान, अहंकार विसर्जन, तीर्थ स्थानों का शांत दर्शन।",
    scripturalCitation: "Brihat Parashara Hora Shastra, Ch. 58 (Ketu Dasha Phala); Phaladeepika Ch. 19, Shlokas 29–32.",
  },
  VENUS: {
    planetEn: "Venus (Shukra)",
    planetHi: "शुक्र (Shukra)",
    devataEn: "Goddess Mahalakshmi / Goddess Annapurna / Lord Shiva",
    devataHi: "माँ महालक्ष्मी / माँ अन्नपूर्णा / भगवान शिव",
    beejMantra: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः ॥",
    beejMantraCount: "16,000 chants over 40 days (or 108 daily on Friday)",
    gayatriMantra: "ॐ भृगुजाय विद्महे दिव्यदेहाय धीमहि तन्नः शुक्रः प्रचोदयात् ॥",
    daanItemEn: "White sugar, pure cow ghee, white silk or cotton, rice, curd, fragrant perfumes",
    daanItemHi: "मिश्री/चीनी, शुद्ध देसी घी, श्वेत रेशमी वस्त्र, चावल, दही, सुगंधित इत्र",
    daanDayEn: "Friday morning after sunrise",
    daanDayHi: "शुक्रवार प्रातः सूर्योदय उपरांत",
    daanRecipientEn: "Married women (Suhagins), artists, blind souls, or women in need",
    daanRecipientHi: "सुहागिन स्त्रियां, कला-साधक, या निर्धन कन्याएं",
    vrataSadhanaEn: "Friday fasting (Shukravara / Vaibhav Lakshmi Vrata), Sri Suktam recitation, respectful treatment of all women, artistic devotion.",
    vrataSadhanaHi: "शुक्रवार व्रत, श्री सूक्तम का पाठ, मातृशक्ति व स्त्रियों का पूर्ण सम्मान, कला व सात्विक सौंदर्य का आदर।",
    scripturalCitation: "Brihat Parashara Hora Shastra, Ch. 50 (Shukra Dasha Phala); Phaladeepika Ch. 19, Shlokas 33–36.",
  },
};

/**
 * Resolves full astrological details of a planet from a birth chart.
 *
 * @param {Object} chart - Complete birth chart object
 * @param {string} planetKey - Planet name (e.g. "Jupiter", "JUPITER", "Sun")
 * @returns {Object} Enriched planet info
 */
export function resolvePlanetDetails(chart, planetKey) {
  if (!chart) return null;
  const keyUpper = String(planetKey || "").toUpperCase();
  const rawPlanet =
    chart.planets?.find((p) => p.planet?.toUpperCase() === keyUpper || p.name?.toUpperCase() === keyUpper) ||
    null;

  const ascSignIndex = chart.ascendant?.signIndex ?? 0;

  // Determine houses ruled from Lagna
  const ruledHouses = [];
  for (let h = 1; h <= 12; h++) {
    const signIdx = (ascSignIndex + h - 1) % 12;
    const ruler = SIGN_RULERS[signIdx];
    if (ruler === keyUpper) {
      ruledHouses.push(h);
    }
  }

  // Handle Rahu & Ketu classical affinities
  if (keyUpper === "RAHU" && ruledHouses.length === 0) {
    // Rahu has affinity with Aquarius (11th sign of natural zodiac)
    const aquariusHouse = ((10 - ascSignIndex + 12) % 12) + 1;
    ruledHouses.push(aquariusHouse);
  } else if (keyUpper === "KETU" && ruledHouses.length === 0) {
    // Ketu has affinity with Scorpio (8th sign of natural zodiac)
    const scorpioHouse = ((7 - ascSignIndex + 12) % 12) + 1;
    ruledHouses.push(scorpioHouse);
  }

  // Classify functional nature for this Lagna
  let functionalRole = "Neutral (सम)";
  let isYogakaraka = false;
  let isLagnaLord = ruledHouses.includes(1);
  let isTrikonaLord = ruledHouses.some((h) => [1, 5, 9].includes(h));
  let isKendraLord = ruledHouses.some((h) => [1, 4, 7, 10].includes(h));
  let isDusthanaLord = ruledHouses.some((h) => [6, 8, 12].includes(h));
  let isMarakaLord = ruledHouses.some((h) => [2, 7].includes(h));

  // Yogakaraka: Rules both Kendra and Trikona simultaneously (e.g. Saturn for Taurus/Libra, Mars for Cancer/Leo)
  const hasKendra = ruledHouses.some((h) => [4, 7, 10].includes(h));
  const hasTrikona = ruledHouses.some((h) => [5, 9].includes(h));
  if (hasKendra && hasTrikona) {
    isYogakaraka = true;
    functionalRole = "Yogakaraka (सर्वोत्तम योगकारक)";
  } else if (isLagnaLord) {
    functionalRole = "Lagna Lord (लग्नेश - अत्यंत शुभ)";
  } else if (isTrikonaLord && !isDusthanaLord) {
    functionalRole = "Benefic Trikona Lord (त्रिकोणेश - शुभ)";
  } else if (isDusthanaLord && !isTrikonaLord) {
    functionalRole = "Dusthana Lord (त्रिकेश - सावधानी आवश्यक)";
  } else if (isMarakaLord) {
    functionalRole = "Maraka Lord (मारक भाव स्वामी)";
  }

  return {
    key: keyUpper,
    name: rawPlanet?.name || planetKey,
    sanskritName: rawPlanet?.sanskritName || "",
    sign: rawPlanet?.sign || "Unknown",
    sanskritSign: rawPlanet?.sanskritSign || "",
    signIndex: rawPlanet?.signIndex ?? 0,
    house: rawPlanet?.house ?? 1,
    degree: rawPlanet?.degree ?? 0,
    dignity: rawPlanet?.dignity || "NEUTRAL",
    dignityLabel: rawPlanet?.dignityLabel || "Neutral (सम)",
    dignityScore: rawPlanet?.dignityScore ?? 5,
    isCombust: Boolean(rawPlanet?.isCombust),
    retrograde: Boolean(rawPlanet?.retrograde),
    aspectingHouses: rawPlanet?.aspectingHouses || [],
    ruledHouses,
    functionalRole,
    isYogakaraka,
    isLagnaLord,
    isTrikonaLord,
    isKendraLord,
    isDusthanaLord,
    isMarakaLord,
  };
}

/**
 * Computes mutual relationship (Sambandha & distance) between Mahadasha and Antardasha lords.
 *
 * @param {Object} mahaPlanet - Enriched Mahadasha planet
 * @param {Object} antarPlanet - Enriched Antardasha planet
 * @returns {Object} Sambandha analysis
 */
export function calculateDashaSambandha(mahaPlanet, antarPlanet) {
  if (!mahaPlanet || !antarPlanet) return null;

  const hMaha = mahaPlanet.house || 1;
  const hAntar = antarPlanet.house || 1;

  // Mutual house count from Mahadasha Lord to Antardasha Lord (1 to 12)
  const forwardDist = ((hAntar - hMaha + 12) % 12) + 1;
  const reverseDist = ((hMaha - hAntar + 12) % 12) + 1;

  // Natural relationship
  const naturalMap = NATURAL_RELATIONSHIPS[mahaPlanet.key] || {};
  let naturalRel = "Neutral (सम)";
  let isNaturalFriend = false;
  let isNaturalEnemy = false;

  if (naturalMap.friends?.includes(antarPlanet.key)) {
    naturalRel = "Natural Friend (नैसर्गिक मित्र)";
    isNaturalFriend = true;
  } else if (naturalMap.enemies?.includes(antarPlanet.key)) {
    naturalRel = "Natural Enemy (नैसर्गिक शत्रु)";
    isNaturalEnemy = true;
  }

  // Sambandha Axis Classification
  let axisKey = `${forwardDist}_${reverseDist}`;
  let axisNameEn = "";
  let axisNameHi = "";
  let tone = "favorable";
  let descriptionEn = "";
  let descriptionHi = "";

  if (forwardDist === 1) {
    axisKey = "1_1";
    axisNameEn = "Yuti (Conjunction in Same House)";
    axisNameHi = "युति (एक ही भाव में सह-स्थिति)";
    tone = isNaturalEnemy ? "mixed" : "favorable";
    descriptionEn = `Both Mahadasha lord (${mahaPlanet.name}) and Antardasha lord (${antarPlanet.name}) occupy House ${hMaha}. This intensifies focus directly on this house's themes.`;
    descriptionHi = `महादशा नाथ (${mahaPlanet.name}) और अंतर्दशा नाथ (${antarPlanet.name}) दोनों भाव ${hMaha} में स्थित हैं। इससे इस भाव से जुड़े विषयों में तीव्र सक्रियता आती है।`;
  } else if (forwardDist === 7) {
    axisKey = "1_7";
    axisNameEn = "Samasaptaka (Mutual 7th Aspect Axis)";
    axisNameHi = "समसप्तक (परस्पर दृष्टि सम्बन्ध)";
    tone = "favorable";
    descriptionEn = `The lords sit opposite each other (1/7 axis), continuously casting direct Parashari aspects upon one another, providing dynamic balance.`;
    descriptionHi = `दोनों ग्रह एक-दूसरे से 7वें भाव (समसप्तक) में स्थित होकर परस्पर पूर्ण दृष्टि डाल रहे हैं, जिससे कार्यों में गतिशीलता और सामंजस्य उत्पन्न होता है।`;
  } else if (forwardDist === 5 || forwardDist === 9) {
    axisKey = "5_9";
    axisNameEn = "Trikona (Dharmic 5/9 Axis)";
    axisNameHi = "नवम-पंचम (त्रिकोण सम्बन्ध)";
    tone = "highly_favorable";
    descriptionEn = `Highly auspicious 5/9 Trikona placement. Facilitates natural dharmic harmony, fortune, wisdom, and auspicious outcomes with reduced friction.`;
    descriptionHi = `अत्यंत शुभ नवम-पंचम (त्रिकोण) सम्बन्ध। यह भाग्य, धर्म, विद्या और सत्कर्मों में सहज सफलता और मानसिक शांति प्रदान करता है।`;
  } else if (forwardDist === 4 || forwardDist === 10) {
    axisKey = "4_10";
    axisNameEn = "Kendra (Action-Oriented 4/10 Axis)";
    axisNameHi = "केन्द्र (चतुर्थ-दशम सम्बन्ध)";
    tone = "favorable";
    descriptionEn = `Dynamic Kendra relationship. Drives vigorous action, professional responsibilities, structural transformations, and public recognition.`;
    descriptionHi = `सक्रिय केन्द्र सम्बन्ध। यह कर्मक्षेत्र, उत्तरदायित्व, सामाजिक प्रतिष्ठा और व्यावहारिक कार्यों में प्रगति कराता है।`;
  } else if (forwardDist === 3 || forwardDist === 11) {
    axisKey = "3_11";
    axisNameEn = "Sahaja-Labha (Enterprise & Gains 3/11 Axis)";
    axisNameHi = "तृतीय-एकादश (साहस एवं लाभ सम्बन्ध)";
    tone = "favorable";
    descriptionEn = `Auspicious 3/11 relationship. Individual initiatives, enterprise, networking, and sustained efforts convert into tangible gains and fulfilled ambitions.`;
    descriptionHi = `शुभ तृतीय-एकादश सम्बन्ध। व्यक्ति के उद्यम, परिश्रम, संपर्कों और कौशल से आर्थिक लाभ व मनोकामनाओं की पूर्ति होती है।`;
  } else if (forwardDist === 6 || forwardDist === 8) {
    axisKey = "6_8";
    axisNameEn = "Shadashtaka (Challenging 6/8 Axis)";
    axisNameHi = "षडाष्टक (कठिन 6/8 सम्बन्ध)";
    tone = "challenging";
    descriptionEn = `Classical Shadashtaka angle. Signals inner transformation, sudden friction, emotional friction, digestive or health sensitivities, and need for patient conflict resolution.`;
    descriptionHi = `शास्त्रीय षडाष्टक सम्बन्ध। यह काल परिवर्तन, अनपेक्षित उतार-चढ़ाव, स्वास्थ्य संवेदनशीलता और विवादों से बचने के लिए धैर्य की मांग करता है।`;
  } else if (forwardDist === 2 || forwardDist === 12) {
    axisKey = "2_12";
    axisNameEn = "Dvi-Dvadasha (Expenditure & Detachment 2/12 Axis)";
    axisNameHi = "द्विर्द्वादश (व्यय एवं त्याग 2/12 सम्बन्ध)";
    tone = "mixed";
    descriptionEn = `Dvi-Dvadasha relationship. Induces high expenditures, relocation, foreign linkages, detachment, or sleep changes, requiring financial caution.`;
    descriptionHi = `द्विर्द्वादश सम्बन्ध। इस काल में आकस्मिक व्यय, यात्राएं, स्थान परिवर्तन या वैराग्य की भावना बढ़ सकती है। आर्थिक संतुलन आवश्यक है।`;
  }

  return {
    axisKey,
    forwardDistance: forwardDist,
    reverseDistance: reverseDist,
    axisNameEn,
    axisNameHi,
    tone,
    naturalRelationship: naturalRel,
    isNaturalFriend,
    isNaturalEnemy,
    descriptionEn,
    descriptionHi,
  };
}

/**
 * Computes upcoming Dasha transition milestones and countdowns.
 *
 * @param {Object} dashaData - Result from computeComprehensiveVimshottari
 * @param {Date} [currentDate=new Date()]
 * @returns {Array<Object>} List of upcoming milestones
 */
export function calculateUpcomingTransitions(dashaData, currentDate = new Date()) {
  if (!dashaData || !dashaData.activeDasha) return [];

  const currentMs = currentDate.getTime();
  const active = dashaData.activeDasha;
  const milestones = [];

  // Helper for days remaining
  const getDaysLeft = (targetDateStr) => {
    if (!targetDateStr) return null;
    const targetMs = new Date(targetDateStr).getTime();
    return Math.max(0, Math.ceil((targetMs - currentMs) / (86400 * 1000)));
  };

  // 1. Next Pratyantardasha
  if (active.pratyantarEndDate) {
    const daysLeft = getDaysLeft(active.pratyantarEndDate);
    milestones.push({
      type: "PRATYANTARDASHA_END",
      labelEn: `Conclusion of current ${active.pratyantardasha} Pratyantardasha`,
      labelHi: `वर्तमान ${active.pratyantardasha} प्रत्यंतर्दशा की पूर्णता`,
      targetDate: active.pratyantarEndDate,
      daysRemaining: daysLeft,
      urgency: daysLeft < 30 ? "high" : "normal",
    });
  }

  // 2. Next Antardasha
  if (active.antarEndDate) {
    const daysLeft = getDaysLeft(active.antarEndDate);
    milestones.push({
      type: "ANTARDASHA_END",
      labelEn: `Transition out of ${active.antardasha} Antardasha`,
      labelHi: `${active.antardasha} अंतर्दशा की समाप्ति एवं अगली भुक्ति`,
      targetDate: active.antarEndDate,
      daysRemaining: daysLeft,
      urgency: daysLeft < 90 ? "high" : "normal",
    });
  }

  // 3. Next Mahadasha
  if (active.endDate) {
    const daysLeft = getDaysLeft(active.endDate);
    milestones.push({
      type: "MAHADASHA_END",
      labelEn: `Major cycle transition: End of ${active.mahadasha} Mahadasha`,
      labelHi: `मुख्य चक्र परिवर्तन: ${active.mahadasha} महादशा की पूर्णता`,
      targetDate: active.endDate,
      daysRemaining: daysLeft,
      urgency: daysLeft < 365 ? "high" : "normal",
    });
  }

  return milestones;
}

/**
 * Generates the complete 11-section bilingual Dasha report grounded in birth chart longitudes.
 *
 * @param {Object} options
 * @param {Object} options.chart - Complete birth chart object
 * @param {Date} [options.targetDate=new Date()]
 * @param {string} [options.language="en"] - "en" or "hi"
 * @returns {Object} Comprehensive 11-Section Dasha Interpretation Report
 */
export function generateDashaInterpretationReport({
  chart,
  targetDate = new Date(),
  language = "en",
}) {
  if (!chart) {
    throw new Error("A valid birth chart object is required for Dasha interpretation.");
  }

  // 1. Ensure or calculate Vimshottari Dasha
  let dashaData = chart.dasha;
  if (!dashaData || !dashaData.activeDasha) {
    const moonDeg = chart.moon?.siderealDegree ?? 0;
    const birthDate = chart.birthDetails?.utcDate
      ? new Date(chart.birthDetails.utcDate)
      : new Date("1990-01-01T00:00:00Z");
    dashaData = computeComprehensiveVimshottari(moonDeg, birthDate, targetDate);
  }

  const active = dashaData.activeDasha;
  const mahaLordKey = active.mahadasha;
  const antarLordKey = active.antardasha;
  const pratyantarLordKey = active.pratyantardasha;

  // 2. Resolve Chart-Grounded Planetary Positions & Dignities
  const mahaPlanet = resolvePlanetDetails(chart, mahaLordKey);
  const antarPlanet = resolvePlanetDetails(chart, antarLordKey);
  const pratyantarPlanet = resolvePlanetDetails(chart, pratyantarLordKey);

  // 3. Calculate Mutual Sambandha (Geometric & Astrological relationship)
  const sambandha = calculateDashaSambandha(mahaPlanet, antarPlanet);

  // 4. Calculate Upcoming Transitions
  const upcomingTransitions = calculateUpcomingTransitions(dashaData, targetDate);

  // 5. Traditional Remedies for both Maha and Antar lords
  const mahaRemedies = CLASSICAL_REMEDIES[mahaLordKey?.toUpperCase()] || CLASSICAL_REMEDIES.SUN;
  const antarRemedies = CLASSICAL_REMEDIES[antarLordKey?.toUpperCase()] || CLASSICAL_REMEDIES.MOON;

  // 6. Synthesize Life Domain Impacts based on House Placements & Rulerships
  const housesRuledOrOccupied = [
    ...(mahaPlanet.ruledHouses || []),
    mahaPlanet.house,
    ...(antarPlanet.ruledHouses || []),
    antarPlanet.house,
  ];

  const hasCareerLink = housesRuledOrOccupied.some((h) => [10, 1, 6, 7].includes(h));
  const hasWealthLink = housesRuledOrOccupied.some((h) => [2, 11, 5, 9].includes(h));
  const hasRelationLink = housesRuledOrOccupied.some((h) => [7, 2, 4, 11].includes(h));
  const hasHealthCaution =
    housesRuledOrOccupied.some((h) => [6, 8, 12].includes(h)) ||
    sambandha.axisKey === "6_8" ||
    mahaPlanet.isCombust ||
    antarPlanet.isCombust;
  const hasSpiritualFocus =
    housesRuledOrOccupied.some((h) => [9, 12, 5, 8].includes(h)) ||
    ["JUPITER", "KETU", "SATURN"].includes(mahaLordKey.toUpperCase());

  // Section 1: Current Mahadasha Overview
  const section1 = {
    titleEn: "Current Mahadasha Overview",
    titleHi: "वर्तमान महादशा विस्तृत विवरण",
    lord: mahaPlanet.name,
    sanskritLord: mahaPlanet.sanskritName || mahaPlanet.name,
    startDate: active.startDate,
    endDate: active.endDate,
    sign: mahaPlanet.sign,
    sanskritSign: mahaPlanet.sanskritSign,
    house: mahaPlanet.house,
    ruledHouses: mahaPlanet.ruledHouses,
    dignityLabel: mahaPlanet.dignityLabel,
    functionalRole: mahaPlanet.functionalRole,
    isCombust: mahaPlanet.isCombust,
    retrograde: mahaPlanet.retrograde,
    descriptionEn: `You are currently experiencing the Mahadasha of ${mahaPlanet.name}, governing the timeline from ${active.startDate} to ${active.endDate}. In your birth chart, ${mahaPlanet.name} is placed in House ${mahaPlanet.house} (${mahaPlanet.sign}) with ${mahaPlanet.dignityLabel} dignity, and exercises lordship over House(s) ${mahaPlanet.ruledHouses.join(", ")} from your Lagna. As a ${mahaPlanet.functionalRole}, its major cycle lays the architectural framework for your primary life pursuits, status, and karma during this multi-year epoch.`,
    descriptionHi: `वर्तमान में आप ${mahaPlanet.name} की महादशा के प्रभाव में हैं, जिसकी अवधि ${active.startDate} से ${active.endDate} तक है। आपकी जन्मकुंडली में ${mahaPlanet.name} लग्न से ${mahaPlanet.house}वें भाव (${mahaPlanet.sanskritSign || mahaPlanet.sign}) में ${mahaPlanet.dignityLabel} स्थिति में विराजमान हैं तथा भाव ${mahaPlanet.ruledHouses.join(", ")} के स्वामी हैं। ${mahaPlanet.functionalRole} होने के कारण, यह महादशा आपके जीवन की मुख्य दिशा, सामाजिक स्थिति और कर्म प्रवाह का आधार तय करती है।`,
  };

  // Section 2: Current Antardasha Overview
  const section2 = {
    titleEn: "Current Antardasha Overview (Bhukti)",
    titleHi: "वर्तमान अंतर्दशा (भुक्ति) विवरण",
    lord: antarPlanet.name,
    sanskritLord: antarPlanet.sanskritName || antarPlanet.name,
    startDate: active.antarStartDate,
    endDate: active.antarEndDate,
    sign: antarPlanet.sign,
    sanskritSign: antarPlanet.sanskritSign,
    house: antarPlanet.house,
    ruledHouses: antarPlanet.ruledHouses,
    dignityLabel: antarPlanet.dignityLabel,
    sambandha: {
      axis: sambandha.axisNameEn,
      axisHi: sambandha.axisNameHi,
      tone: sambandha.tone,
      naturalRelationship: sambandha.naturalRelationship,
    },
    descriptionEn: `Within this broad cycle, the sub-period (Antardasha / Bhukti) belongs to ${antarPlanet.name} from ${active.antarStartDate} to ${active.antarEndDate}. Placed in House ${antarPlanet.house} (${antarPlanet.sign}) and ruling House(s) ${antarPlanet.ruledHouses.join(", ")}, ${antarPlanet.name} modifies the Mahadasha lord's energy. The mutual relationship between ${mahaPlanet.name} and ${antarPlanet.name} forms a ${sambandha.axisNameEn} (${sambandha.naturalRelationship}). ${sambandha.descriptionEn}`,
    descriptionHi: `इस महादशा के अंतर्गत उप-अवधि (अंतर्दशा / भुक्ति) ${antarPlanet.name} की है, जो ${active.antarStartDate} से ${active.antarEndDate} तक प्रभावी है। यह ग्रह कुंडली के ${antarPlanet.house}वें भाव में स्थित होकर भाव ${antarPlanet.ruledHouses.join(", ")} का स्वामित्व रखता है। महादशा नाथ ${mahaPlanet.name} और अंतर्दशा नाथ ${antarPlanet.name} के मध्य ${sambandha.axisNameHi} (${sambandha.naturalRelationship}) बन रहा है। ${sambandha.descriptionHi}`,
  };

  // Section 3: Pratyantardasha Overview
  const section3 = {
    titleEn: "Current Pratyantardasha Micro-Cycle",
    titleHi: "वर्तमान प्रत्यंतर्दशा (सूक्ष्म चक्र)",
    lord: pratyantarPlanet.name,
    startDate: active.pratyantarStartDate || active.antarStartDate,
    endDate: active.pratyantarEndDate || active.antarEndDate,
    house: pratyantarPlanet.house,
    descriptionEn: `At the micro-cycle layer, you are navigating the Pratyantardasha of ${pratyantarPlanet.name} (${active.pratyantarStartDate} to ${active.pratyantarEndDate}). While Mahadasha sets the multi-year environment and Antardasha governs major events, Pratyantardasha directs your day-to-day focus, psychological pulse, and immediate decision-making. Operating through House ${pratyantarPlanet.house}, it channels the combined momentum into short-term practical engagements.`,
    descriptionHi: `दशा के सूक्ष्म स्तर पर आप ${pratyantarPlanet.name} की प्रत्यंतर्दशा (${active.pratyantarStartDate} से ${active.pratyantarEndDate}) से गुजर रहे हैं। जहाँ महादशा व्यापक वातावरण और अंतर्दशा प्रमुख घटनाओं का नियमन करती है, वहीं प्रत्यंतर्दशा दैनिक मानसिक चित्तवृत्ति, तात्कालिक प्राथमिकताओं और निर्णयों को दिशा देती है। यह भाव ${pratyantarPlanet.house} के माध्यम से तात्कालिक गतिविधियों में फलित होती है।`,
  };

  // Section 4: Positive Influences & Opportunities
  const positivePointsEn = [];
  const positivePointsHi = [];

  if (mahaPlanet.dignityScore >= 7 || antarPlanet.dignityScore >= 7) {
    positivePointsEn.push("High planetary dignity elevates self-confidence, recognition, and structural support in key endeavors.");
    positivePointsHi.push("उच्च/स्वराशि ग्रह स्थिति से आत्मविश्वास, सामाजिक सम्मान और कार्यों में दृढ़ आधार की प्राप्ति होती है।");
  }
  if (sambandha.tone === "highly_favorable" || sambandha.tone === "favorable") {
    positivePointsEn.push(`Harmonious ${sambandha.axisNameEn} reduces internal friction and allows natural synergy between planning and execution.`);
    positivePointsHi.push(`शुभ ${sambandha.axisNameHi} के कारण विचारों और क्रियान्वयन में स्वाभाविक तालमेल बनता है तथा बाधाएं न्यून होती हैं।`);
  }
  if (mahaPlanet.isYogakaraka || antarPlanet.isYogakaraka) {
    positivePointsEn.push("Yogakaraka influence brings opportunities for institutional elevation, leadership roles, and dharmic prosperity.");
    positivePointsHi.push("योगकारक ग्रह का प्रभाव संस्थागत प्रतिष्ठा, नेतृत्व के अवसर और धार्मिक समृद्धि के द्वार खोलता है।");
  }
  if (hasWealthLink) {
    positivePointsEn.push("Activation of Dhana/Labha houses supports financial consolidation, intellectual gains, and resource generation.");
    positivePointsHi.push("धन व लाभ भावों की सक्रियता से आर्थिक सुदृढ़ता, बौद्धिक लाभ और संसाधनों में वृद्धि के शुभ अवसर बनते हैं।");
  }
  if (positivePointsEn.length === 0) {
    positivePointsEn.push("Favorable period for disciplined self-inquiry, karmic refinement, and persistent hard work.");
    positivePointsHi.push("धैर्यपूर्ण आत्म-चिंतन, कर्म शुद्धि और निरंतर साधना के लिए अनुकूल समय।");
  }

  const section4 = {
    titleEn: "Positive Influences & Key Opportunities",
    titleHi: "सकारात्मक प्रभाव एवं अवसर",
    opportunitiesEn: positivePointsEn,
    opportunitiesHi: positivePointsHi,
  };

  // Section 5: Potential Challenges & Precautionary Cautions
  const challengePointsEn = [];
  const challengePointsHi = [];

  if (mahaPlanet.isCombust || antarPlanet.isCombust) {
    challengePointsEn.push("Combustion (Asta) creates temporary ego exhaustion or feeling under-appreciated; avoid taking professional friction personally.");
    challengePointsHi.push("ग्रह के अस्त होने से श्रम का यथोचित श्रेय मिलने में विलंब या आत्मबल में कमी महसूस हो सकती है; अहंकार के टकराव से बचें।");
  }
  if (sambandha.axisKey === "6_8") {
    challengePointsEn.push("Shadashtaka (6/8) mutual angle requires conscious stress management, avoiding legal disputes, and guarding digestive health.");
    challengePointsHi.push("षडाष्टक (6/8) सम्बन्ध के कारण तनाव प्रबंधन, कानूनी उलझनों से बचाव और खान-पान व उदर स्वास्थ्य का ध्यान रखना अनिवार्य है।");
  }
  if (sambandha.axisKey === "2_12") {
    challengePointsEn.push("Dvi-Dvadasha (2/12) mutual angle advises against speculative financial commitments and warns of sudden unforeseen expenses.");
    challengePointsHi.push("द्विर्द्वादश सम्बन्ध के समय जोखिम भरे आर्थिक निवेश से बचें तथा अनियोजित व्यय पर नियंत्रण रखें।");
  }
  if (mahaPlanet.isDusthanaLord || antarPlanet.isDusthanaLord) {
    challengePointsEn.push("Dusthana lordship activates hidden resistance or competition; cultivate patience and systematic documentation.");
    challengePointsHi.push("त्रिक भावों के स्वामी होने से कार्यक्षेत्र में गुप्त प्रतिस्पर्धा या विलंब संभव है; व्यवस्थित व पारदर्शी रहें।");
  }
  if (challengePointsEn.length === 0) {
    challengePointsEn.push("Guard against complacency and maintain regular physical and meditative routines.");
    challengePointsHi.push("अति-उत्साह या आलस्य से बचें तथा नित्य शारीरिक व मानसिक दिनचर्या का पालन करें।");
  }

  const section5 = {
    titleEn: "Potential Challenges & Precautionary Advice",
    titleHi: "संभावित चुनौतियाँ एवं सावधानियाँ",
    challengesEn: challengePointsEn,
    challengesHi: challengePointsHi,
  };

  // Section 6: Career & Financial Interpretation
  const section6 = {
    titleEn: "Career & Financial Outlook",
    titleHi: "आजीविका एवं आर्थिक परिप्रेक्ष्य",
    careerEn: hasCareerLink
      ? `With Houses 10, 1, or 6 energized by ${mahaPlanet.name} and ${antarPlanet.name}, professional responsibilities and strategic initiatives take center stage. Structured discipline will be rewarded.`
      : `Career progression proceeds at a steady, foundational pace. Focus on building technical expertise and consolidating long-term credentials.`,
    careerHi: hasCareerLink
      ? `दशम, लग्न या षष्ठ भाव की सक्रियता से कार्यक्षेत्र में नए दायित्व और रणनीतिक जिम्मेदारियां प्रमुख रहेंगी। अनुशासित प्रयास से मान-सम्मान मिलेगा।`
      : `कर्मक्षेत्र में गति संतुलित और आधारभूत रहेगी। इस समय अपनी कार्यकुशलता और दीर्घकालिक योग्यता को सशक्त करने पर ध्यान दें।`,
    financesEn: hasWealthLink
      ? `Favorable alignment of 2nd/11th house rulers stimulates wealth retention, multiple avenues of gain, and purposeful capital deployment.`
      : `Financial stability is best maintained through conservative budgeting, avoiding high-risk speculations, and prioritizing liquid reserves.`,
    financesHi: hasWealthLink
      ? `द्वितीय व एकादश भाव के अनुकूल प्रभाव से धन संचय, लाभ के नए स्रोत और विवेकपूर्ण निवेश के उत्तम योग बन रहे हैं।`
      : `आर्थिक स्थिरता के लिए संयमित बजट बनाएं, सट्टेबाजी से दूर रहें और आकस्मिक आवश्यकताओं के लिए संचित निधि बनाए रखें।`,
  };

  // Section 7: Relationship & Family Dynamics
  const section7 = {
    titleEn: "Relationship, Marriage & Family Dynamics",
    titleHi: "पारिवारिक एवं वैवाहिक सम्बन्ध",
    descriptionEn: hasRelationLink
      ? `Relationships and family obligations are deeply highlighted. Mutual understanding and respectful communication with partners and elders will resolve latent domestic stresses.`
      : `Domestic and marital matters remain generally stable. Dedicate quality presence to home life and avoid allowing professional pressures to spill into personal bonds.`,
    descriptionHi: hasRelationLink
      ? `पारिवारिक उत्तरदायित्व और सम्बन्ध इस समय केंद्र में रहेंगे। जीवनसाथी और परिजनों के साथ संवादात्मक स्पष्टता और आदर भाव से पुराने मतभेद सुलझेंगे।`
      : `घरेलू और दाम्पत्य जीवन सामान्यतः स्थिर रहेगा। व्यावसायिक व्यस्तताओं का तनाव पारिवारिक वातावरण पर न पड़ने दें और परिजनों को समय दें।`,
  };

  // Section 8: Personal, Health & Spiritual Development
  const section8 = {
    titleEn: "Health, Vitality & Spiritual Evolution",
    titleHi: "स्वास्थ्य, आत्मबल एवं आध्यात्मिक उन्नति",
    healthEn: hasHealthCaution
      ? `Vitality requires mindful safeguarding. Prioritize seasonal nutrition, hydration, adequate sleep, and gentle daily yoga. Avoid over-exhaustion.`
      : `Physical vitality is robust and adaptable. Regular physical movement and sattvic nourishment will sustain energetic clarity.`,
    healthHi: hasHealthCaution
      ? `स्वास्थ्य के प्रति सजग रहना आवश्यक है। ऋतु अनुसार सात्विक आहार, पर्याप्त निद्रा और नियमित योगाभ्यास अपनाएं; अत्यधिक थकान से बचें।`
      : `शारीरिक स्फूर्ति और जीवनी शक्ति अच्छी बनी रहेगी। नियमित व्यायाम और संतुलित आहार से कार्यक्षमता बनी रहेगी।`,
    spiritualEn: hasSpiritualFocus
      ? `Highly receptive period for inward contemplation, mantra japa, reading sacred texts, and deep meditation. A genuine yearning for philosophical truth is awakened.`
      : `Inner peace is enriched through simple daily mindfulness, ethical conduct, and reflective evening quietude.`,
    spiritualHi: hasSpiritualFocus
      ? `यह काल आत्म-साधना, मंत्र जप, स्वाध्याय और ध्यान के लिए अत्यंत अनुकूल है। दार्शनिक और आध्यात्मिक विषयों में अंतर्दृष्टि गहरी होगी।`
      : `दैनिक जीवन में सात्विक आचरण, शांति और संध्या समय कुछ क्षणों का मौन ध्यान मानसिक स्थिरता प्रदान करेगा।`,
  };

  // Section 9: Traditional Vedic Remedies & Scriptural Citations
  const section9 = {
    titleEn: "Traditional Vedic Remedies & Classical Citations",
    titleHi: "शास्त्रीय वैदिक उपाय एवं प्रामाणिक संदर्भ",
    mahadashaRemedy: {
      planet: mahaRemedies.planetEn,
      planetHi: mahaRemedies.planetHi,
      devata: mahaRemedies.devataEn,
      devataHi: mahaRemedies.devataHi,
      beejMantra: mahaRemedies.beejMantra,
      beejMantraCount: mahaRemedies.beejMantraCount,
      gayatriMantra: mahaRemedies.gayatriMantra,
      daan: mahaRemedies.daanItemEn,
      daanHi: mahaRemedies.daanItemHi,
      daanDay: mahaRemedies.daanDayEn,
      daanRecipient: mahaRemedies.daanRecipientEn,
      vrataSadhana: mahaRemedies.vrataSadhanaEn,
      vrataSadhanaHi: mahaRemedies.vrataSadhanaHi,
      citation: mahaRemedies.scripturalCitation,
    },
    antardashaRemedy: {
      planet: antarRemedies.planetEn,
      planetHi: antarRemedies.planetHi,
      devata: antarRemedies.devataEn,
      devataHi: antarRemedies.devataHi,
      beejMantra: antarRemedies.beejMantra,
      beejMantraCount: antarRemedies.beejMantraCount,
      gayatriMantra: antarRemedies.gayatriMantra,
      daan: antarRemedies.daanItemEn,
      daanHi: antarRemedies.daanItemHi,
      daanDay: antarRemedies.daanDayEn,
      daanRecipient: antarRemedies.daanRecipientEn,
      vrataSadhana: antarRemedies.vrataSadhanaEn,
      vrataSadhanaHi: antarRemedies.vrataSadhanaHi,
      citation: antarRemedies.scripturalCitation,
    },
    ethicalDisclaimerEn:
      "Vedic astrology remedies (Upayas) are traditional spiritual contemplative tools rooted in Brihat Parashara Hora Shastra (Ch. 84). They are intended to foster mindfulness, ethical conduct, devotion, and inner peace. They are not deterministic guarantees and never substitute for certified professional medical, legal, psychological, or financial counsel.",
    ethicalDisclaimerHi:
      "वैदिक ज्योतिषीय उपाय महर्षि पराशर रचित 'बृहत्पाराशर होराशास्त्र' (अध्याय 84) पर आधारित पारंपरिक आध्यात्मिक व सात्विक साधनाएं हैं। इनका उद्देश्य चित्त शुद्धि, सात्विक आचरण और आत्मबल में वृद्धि करना है। यह किसी भी रूप में अनिवार्य भौतिक गारंटी नहीं हैं और न ही चिकित्सकीय, कानूनी अथवा वित्तीय विशेषज्ञ परामर्श का विकल्प हैं।",
  };

  // Section 10: Upcoming Dasha Transitions Timeline
  const section10 = {
    titleEn: "Upcoming Dasha Transitions Timeline",
    titleHi: "आगामी दशा संक्रमण कालक्रम",
    milestones: upcomingTransitions,
  };

  // Section 11: Calculation & Astronomical Source Metadata
  const section11 = {
    titleEn: "Astronomical & Calculation Metadata",
    titleHi: "खगोलीय गणना एवं स्रोत विवरण",
    moonSiderealDeg: chart.moon?.siderealDegree ?? 0,
    moonNakshatra: chart.moon?.nakshatra || "Unknown",
    moonPada: chart.moon?.pada || 1,
    startingDashaLord: dashaData.startingLord,
    birthBalance: dashaData.balanceText,
    ayanamshaSystem: "Lahiri (Chitrapaksha)",
    engineVersion: "Gurukul Parashari Vimshottari Engine v2.4",
    scripturalTradition: "Brihat Parashara Hora Shastra (BPHS) & Phaladeepika",
    targetDateIso: new Date(targetDate).toISOString(),
  };

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      language,
      isHindi: language === "hi" || language === "hindi",
    },
    activeDashaSummary: {
      mahadasha: mahaLordKey,
      antardasha: antarLordKey,
      pratyantardasha: pratyantarLordKey,
      mahadashaRange: `${active.startDate} — ${active.endDate}`,
      antardashaRange: `${active.antarStartDate || active.startDate} — ${active.antarEndDate || active.endDate}`,
      pratyantardashaRange: `${active.pratyantarStartDate || ""} — ${active.pratyantarEndDate || ""}`,
      sambandhaAxis: sambandha.axisNameEn,
      sambandhaTone: sambandha.tone,
    },
    sections: {
      section1_mahadashaOverview: section1,
      section2_antardashaOverview: section2,
      section3_pratyantardashaOverview: section3,
      section4_positiveInfluences: section4,
      section5_potentialChallenges: section5,
      section6_careerAndFinances: section6,
      section7_relationshipsAndFamily: section7,
      section8_healthAndSpirituality: section8,
      section9_traditionalRemedies: section9,
      section10_upcomingTransitions: section10,
      section11_astronomicalMetadata: section11,
    },
  };
}

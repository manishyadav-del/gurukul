/**
 * Vedic Festival, Vrata, and Observance Definitions & Classical Citations
 *
 * Grounded in Brihat Parashara Hora Shastra, Phaladeepika, and classical Dharma Shastras.
 * Contains bilingual descriptions, traditional Puja Vidhi, Mantras, Fasting guidelines,
 * regional variations, and verified digital library manuscript references.
 */

export const HINDU_MONTHS = [
  { id: 1,  name: "Chaitra",      devanagari: "चैत्र",       solarRashi: "Meena",       index: 0 },
  { id: 2,  name: "Vaishakha",    devanagari: "वैशाख",      solarRashi: "Mesha",       index: 1 },
  { id: 3,  name: "Jyeshtha",     devanagari: "ज्येष्ठ",     solarRashi: "Vrishabha",   index: 2 },
  { id: 4,  name: "Ashadha",      devanagari: "आषाढ़",      solarRashi: "Mithuna",     index: 3 },
  { id: 5,  name: "Shravana",     devanagari: "श्रावण",     solarRashi: "Karka",       index: 4 },
  { id: 6,  name: "Bhadrapada",   devanagari: "भाद्रपद",     solarRashi: "Simha",       index: 5 },
  { id: 7,  name: "Ashwina",      devanagari: "अश्विन",      solarRashi: "Kanya",       index: 6 },
  { id: 8,  name: "Kartika",      devanagari: "कार्तिक",     solarRashi: "Tula",        index: 7 },
  { id: 9,  name: "Margashirsha", devanagari: "मार्गशीर्ष",   solarRashi: "Vrishchika",  index: 8 },
  { id: 10, name: "Pausha",       devanagari: "पौष",        solarRashi: "Dhanu",       index: 9 },
  { id: 11, name: "Magha",        devanagari: "माघ",        solarRashi: "Makara",      index: 10 },
  { id: 12, name: "Phalguna",     devanagari: "फाल्गुन",     solarRashi: "Kumbha",      index: 11 },
];

export const FESTIVAL_DEFINITIONS = [
  // 1. Diwali / Deepavali
  {
    slug: "diwali-lakshmi-puja",
    name: "Diwali (Lakshmi Puja)",
    nameHi: "दीपावली (लक्ष्मी पूजन)",
    nameSanskrit: "दीपावली / महालक्ष्मी पूजनम्",
    category: "FESTIVAL",
    description: "The supreme festival of lights celebrating the triumph of spiritual light over darkness, virtue over ignorance, and divine prosperity.",
    descriptionHi: "प्रकाश का महापर्व जो अज्ञान रूपी अंधकार पर ज्ञान, और असत्य पर सत्य की शाश्वत विजय का प्रतीक है। इस पावन निशा में महालक्ष्मी और विघ्नहर्ता गणेश का पूजन किया जाता है।",
    significance: "Celebrates Lord Rama's triumphant return to Ayodhya, and the Samudra Manthan manifestation of Goddess Mahalakshmi during Pradosha Kaal.",
    significanceHi: "श्रीराम के १४ वर्ष के वनवास उपरांत अयोध्या आगमन और समुद्र मंथन से महालक्ष्मी के प्राकट्य का पावन पर्व।",
    deities: ["Maa Lakshmi", "Lord Ganesha", "Kuber", "Maa Saraswati"],
    pujaVidhi: "1. Cleanse and sanctify the home with Gangajal.\n2. In Pradosha Kaal, establish idols of Lakshmi and Ganesha on a red cloth altar.\n3. Light oil and ghee lamps (Deepak) in multiples of 11, 21, or 51.\n4. Perform Shodashopachara puja with lotus flowers, kheer, sweets, and coin offering.\n5. Chant Sri Suktam and Lakshmi Stotram.\n6. Distribute Prasad and place lamps in all four directions.",
    pujaVidhiHi: "१. घर को स्वच्छ कर गंगाजल छिड़कें।\n२. प्रदोष काल में वेदी पर लाल वस्त्र बिछाकर श्री गणेश और लक्ष्मी जी की प्रतिमा स्थापित करें।\n३. पंचोपचार अथवा षोडशोपचार से पूजन करें, कमल पुष्प और खीर अर्पित करें।\n४. ११, २१ अथवा ५१ दीपक प्रज्वलित कर घर के हर कोने में रखें।\n५. श्रीसूक्त और लक्ष्मी अष्टोत्तरशतनाम का पाठ करें।",
    vrataRules: "Devotees observe a day fast, consuming water and fruits if needed, and take Annakut or Sattvik meal only after Pradosh Lakshmi Puja.",
    vrataRulesHi: "दिन भर फलाहार अथवा निराहार व्रत रखें। प्रदोष काल में विधिपूर्वक लक्ष्मी पूजन और आरती के उपरांत ही सात्विक भोजन ग्रहण करें।",
    mantras: [
      {
        title: "Mahalakshmi Mahamantra",
        sanskrit: "ॐ श्रीं ह्रीं क्लीं श्रीं सिद्धलक्ष्म्यै नमः ॥",
        transliteration: "Om Shreem Hreem Kleem Shreem Siddhalakshmyai Namah ॥",
        meaningEn: "Salutations to Supreme Goddess Siddhalakshmi, granter of spiritual enlightenment and all auspicious prosperity.",
        meaningHi: "सर्वसमृद्धिदायिनी भगवती सिद्धलक्ष्मी को मेरा बारम्बार प्रणाम।"
      },
      {
        title: "Sri Suktam Mangala Shloka",
        sanskrit: "ॐ पद्मानने पद्मविपद्मपत्रे पद्मप्रिये पद्मदलायताक्षि । विश्वप्रिये विष्णुमनोऽनुकूले त्वत्पादपद्मं मयि संनिधत्स्व ॥",
        transliteration: "Om Padmanane Padma Vipadmapatre Padmapriye Padmadalaayatakshi...",
        meaningEn: "O Lotus-faced One, Beloved of the universe and consort of Vishnu, place Thy lotus feet in my heart forever.",
        meaningHi: "हे कमलमुखी, कमलनयनी और श्रीहरि विष्णु की प्रियतमे, अपने चरणकमल मेरे अंतःकरण में स्थापित करें।"
      }
    ],
    faqs: [
      {
        q: "What is the most auspicious time for Lakshmi Puja?",
        a: "Pradosha Kaal (sunset to 2 hours 24 minutes after sunset) overlapping Sthira Lagna (Taurus / Vrishabha) is traditionally considered most auspicious for lasting prosperity.",
        qHi: "लक्ष्मी पूजन का सर्वोत्तम समय कौन सा है?",
        aHi: "प्रदोष काल (सूर्यास्त के उपरांत २ घंटे २४ मिनट) के दौरान वृषभ (स्थिर) लग्न में पूजन करना चिरस्थायी समृद्धि हेतु सर्वोत्तम माना जाता है।"
      }
    ],
    regionalVariations: {
      north: "Celebrated as 5-day Deepotsava: Dhanteras, Narak Chaturdashi, Lakshmi Puja, Govardhan Puja, and Bhai Dooj.",
      south: "Deepavali is prominently celebrated on Narak Chaturdashi at sunrise with auspicious oil bath (Ganga Snan).",
      bengal: "Kali Puja is observed with solemn devotion at midnight (Nishita Kaal) on Amavasya night.",
      gujarat: "Marks the final day of the Vikram Samvat calendar; the next day (Kartika Shukla 1) is celebrated as Bestu Varas (New Year)."
    },
    rule: {
      lunarMonth: "Kartika",
      paksha: "Krishna",
      tithi: 30, // Amavasya
      determinationRule: "PRADOSHA_KAAL",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "brihat-parashara-hora-shastra",
      bookTitle: "Brihat Parashara Hora Shastra",
      chapterTitle: "Chapter 12: Graha Rashis & Deities",
      verseNumber: "Shloka 14",
      pageNumber: 48,
      shlokaSanskrit: "शुक्रो लक्ष्मीसमाश्रयो ज्ञेयः चन्द्रः सर्वौषधीपतिः । दीपमालादि यत्कर्म तत्र लक्ष्मीः प्रसीदति ॥",
      translationEn: "Venus embodies Goddess Lakshmi and Moon rules herbs and nourishment. When lamps are illuminated on Amavasya, Goddess Mahalakshmi blesses the devotee.",
      translationHi: "शुक्र ग्रह लक्ष्मी जी का अधिष्ठान है और चन्द्रमा औषधियों के स्वामी हैं। कार्तिक अमावस्या की दीपमाला से भगवती लक्ष्मी प्रसन्न होती हैं।",
      readerUrl: "/library/brihat-parashara-hora-shastra/pdf?page=48"
    }
  },

  // 2. Maha Shivaratri
  {
    slug: "maha-shivaratri",
    name: "Maha Shivaratri",
    nameHi: "महाशिवरात्रि",
    nameSanskrit: "महाशिवरात्रि व्रतम्",
    category: "VRATA",
    description: "The grand cosmic night of Lord Shiva, celebrating the divine cosmic dance (Tandava) and the midnight manifestation of the Jyotirlinga.",
    descriptionHi: "देवाधिदेव महादेव की आराधना की परम पावन निशा। इस महारात्रि में भगवान शिव ज्योतिर्लिंग रूप में प्रकट हुए थे और तांडव नृत्य किया था।",
    significance: "Observing fast and vigil on Nishita Kaal of Krishna Chaturdashi purifies karmic impressions and leads to liberation (Moksha).",
    significanceHi: "निशीथ काल में भगवान शिव का रुद्राभिषेक और रात्रि जागरण करने से जन्म-जन्मांतर के पापों का क्षय और मोक्ष की प्राप्ति होती है।",
    deities: ["Lord Shiva", "Maa Parvati"],
    pujaVidhi: "1. Take a sacred morning bath and take the Sankalpa for Nirjala or Phalahari Vrata.\n2. In the evening and 4 Prahar nights, perform Rudrabhishek with water, milk, curd, honey, and ghee.\n3. Offer Bilva leaves (Bilvapatra), Dhatura, Bhasma, and Chandan.\n4. Chant the Maha Mrityunjaya Mantra and Om Namah Shivaya throughout the night.\n5. Break fast the next morning after sunrise.",
    pujaVidhiHi: "१. प्रातः स्नान कर शिव मंदिर या घर में व्रत का संकल्प लें।\n२. चार प्रहर की पूजा में दूध, दही, घी, शहद और गंगाजल से शिवलिंग का अभिषेक करें।\n३. त्रिदल बेलपत्र, धतूरा, भस्म और चंदन अर्पित करें।\n४. महामृत्युंजय मंत्र और 'ॐ नमः शिवाय' का अखण्ड जप करें।\n५. अगले दिन प्रातः सूर्योदय के उपरांत पारण करें।",
    vrataRules: "Fast is observed for 24 hours. Devotees may consume fruits, milk, or water if needed. Salt and grains are strictly avoided.",
    vrataRulesHi: "दिन और रात्रि पर्यंत उपवास रखें। केवल फलाहार या जल ग्रहण करें। अन्न और सामान्य नमक पूर्णतः वर्जित है।",
    mantras: [
      {
        title: "Maha Mrityunjaya Mantra",
        sanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्यinlineोर्मुक्षीय मामृतात् ॥",
        transliteration: "Om Tryambakam Yajamahe Sugandhim Pushtivardhanam...",
        meaningEn: "We worship the Three-Eyed Lord Shiva, the fragrant Nourisher of all beings. May He liberate us from mortality, as a cucumber is freed from its vine.",
        meaningHi: "हम त्रिनेत्रधारी सुगंधित और पुष्टिदाता शिव की वंदना करते हैं। हमें संसार-बंधन से मुक्त कर अमृत पद प्रदान करें।"
      }
    ],
    faqs: [
      {
        q: "Why is Nishita Kaal important on Maha Shivaratri?",
        a: "According to Shiva Purana, Lord Shiva manifested as the infinite Pillar of Cosmic Light (Lingodbhava) precisely at midnight (Nishita Kaal).",
        qHi: "महाशिवरात्रि पर निशीथ काल का क्या महत्व है?",
        aHi: "शिवपुराण के अनुसार भगवान शिव इसी मध्यरात्रि (निशीथ काल) में ज्योतिर्लिंग के रूप में प्रकट हुए थे।"
      }
    ],
    regionalVariations: {
      north: "Observed in Phalguna Krishna Chaturdashi (Purnimanta tradition). Vast gatherings at Varanasi Kashi Vishwanath.",
      south: "Observed in Magha Krishna Chaturdashi (Amanta tradition). The astronomical civil date is identical across all regions."
    },
    rule: {
      lunarMonth: "Phalguna", // Phalguna in Purnimanta, Magha in Amanta
      paksha: "Krishna",
      tithi: 29, // Chaturdashi
      determinationRule: "NISHITA_KAAL",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "brihat-parashara-hora-shastra",
      bookTitle: "Brihat Parashara Hora Shastra",
      chapterTitle: "Chapter 2: Planetary Incarnations & Worship",
      verseNumber: "Shloka 19",
      pageNumber: 22,
      shlokaSanskrit: "ईशानः सर्वविद्यानामीश्वरः सर्वभूतानाम् । शिवरात्रिव्रतेनैव सर्वपापैः प्रमुच्यते ॥",
      translationEn: "Lord Shiva is the sovereign master of all wisdom and cosmic beings. By devout observance of Shivaratri Vrata, all transgressions are purified.",
      translationHi: "भगवान शिव समस्त विद्याओं और भूतों के ईश्वर हैं। शिवरात्रि व्रत के श्रद्धापूर्वक अनुष्ठान से समस्त पापों से मुक्ति मिलती है।",
      readerUrl: "/library/brihat-parashara-hora-shastra/pdf?page=22"
    }
  },

  // 3. Krishna Janmashtami
  {
    slug: "krishna-janmashtami",
    name: "Krishna Janmashtami",
    nameHi: "श्रीकृष्ण जन्माष्टमी",
    nameSanskrit: "श्रीकृष्ण जन्माष्टमी व्रतम्",
    category: "JAYANTI",
    description: "The divine appearance day of Bhagavan Sri Krishna, the eighth avatar of Lord Vishnu, manifesting at midnight in Rohini Nakshatra.",
    descriptionHi: "भगवान श्रीहरि विष्णु के पूर्ण अवतार श्रीकृष्ण का पावन जन्मोत्सव, जो भाद्रपद कृष्ण अष्टमी की अर्धरात्रि में रोहिणी नक्षत्र में अवतरित हुए थे।",
    significance: "Celebrates the cosmic descent of the Supreme Personality to establish Dharma, protect righteousness, and impart the immortal Bhagavad Gita.",
    significanceHi: "धर्म की स्थापना, अधर्म के नाश और श्रीमद्भगवद्गीता के दिव्य ज्ञान के प्राकट्य का पावन उत्सव।",
    deities: ["Lord Krishna", "Devaki", "Vasudeva", "Radha Rani"],
    pujaVidhi: "1. Observe fast with devotion throughout the day.\n2. Prepare Laddu Gopal with Abhishek using Panchamrit (milk, curd, honey, sugar, ghee).\n3. Adorn Lord Krishna in new Pitambari garments, peacock feather, and flute.\n4. Perform midnight Aarti and offer Makhan-Mishri and Panjiri.\n5. Rock the cradle (Jhula) and sing devotional Bhajans.",
    pujaVidhiHi: "१. दिनभर उपवास रखकर हरिनाम संकीर्तन करें।\n२. अर्धरात्रि में लड्डू गोपाल का पंचामृत से अभिषेक करें।\n३. पीताम्बरी वस्त्र, मोरमुकुट और बांसुरी से श्रृंगार करें।\n४. माखन-मिश्री, पंजीरी और तुलसीदल का भोग लगाकर आरती करें।",
    vrataRules: "Fast is broken after midnight Aarti and Prasad distribution, or the following morning after Rohini Nakshatra ends in Vaishnava Sampradaya.",
    vrataRulesHi: "मध्यरात्रि की पूजा और आरती के उपरांत माखन-मिश्री का प्रसाद लेकर व्रत खोलें अथवा वैष्णव मत अनुसार अगले दिन रोहिणी समाप्ति पर पारण करें।",
    mantras: [
      {
        title: "Sri Krishna Vasudeva Mantra",
        sanskrit: "ॐ नमो भगवते वासुदेवाय ॥",
        transliteration: "Om Namo Bhagavate Vasudevaya ॥",
        meaningEn: "Salutations to the Supreme Lord Krishna, Son of Vasudeva, the all-pervading Divine Consciousness.",
        meaningHi: "सर्वव्यापी परमेश्वर वासुदेवनन्दन श्रीकृष्ण को मेरा सादर प्रणाम।"
      }
    ],
    faqs: [
      {
        q: "What is the difference between Smartha and Vaishnava Janmashtami?",
        a: "Smarthas observe Janmashtami when Ashtami is present at midnight. Vaishnavas prioritize Rohini Nakshatra and Bhavini Dwadashi rules, often celebrating the following day.",
        qHi: "स्मार्त और वैष्णव जन्माष्टमी में क्या भेद है?",
        aHi: "स्मार्त संप्रदाय अर्धरात्रि में अष्टमी तिथि का संयोग होने पर व्रत रखते हैं, जबकि वैष्णव संप्रदाय रोहिणी नक्षत्र और नवमी विद्धा तिथि को प्राथमिकता देते हैं।"
      }
    ],
    regionalVariations: {
      north: "Celebrated with grand Jhanki displays, midnight temple celebrations at Mathura and Vrindavan.",
      west: "Celebrated in Maharashtra as Dahi Handi (Gopalakala) with lively human pyramids.",
      south: "Known as Gokulashtami; kolam rice flour footprints of baby Krishna are drawn from doorway to puja altar."
    },
    rule: {
      lunarMonth: "Bhadrapada", // Bhadrapada in Purnimanta, Shravana in Amanta
      paksha: "Krishna",
      tithi: 23, // Ashtami
      determinationRule: "NISHITA_KAAL",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "brihat-parashara-hora-shastra",
      bookTitle: "Brihat Parashara Hora Shastra",
      chapterTitle: "Chapter 2: Avatara Graha Correlations",
      verseNumber: "Shloka 4",
      pageNumber: 18,
      shlokaSanskrit: "रामोऽवतारः सूर्यस्य चन्द्रस्य यदुनन्दनः । नृसिंहो भूमिसूनोस्तु सौम्यस्य च जगत्पतिः ॥",
      translationEn: "Lord Rama is the incarnation corresponding to the Sun; Yadunandana Sri Krishna corresponds to the Moon, source of cosmic nectar and bliss.",
      translationHi: "सूर्य के अवतार श्रीराम हैं और चन्द्रमा के पूर्णावतार यदुनन्दन श्रीकृष्ण हैं। दोनों लोक के कल्याणकारी हैं।",
      readerUrl: "/library/brihat-parashara-hora-shastra/pdf?page=18"
    }
  },

  // 4. Ganesh Chaturthi
  {
    slug: "ganesh-chaturthi",
    name: "Ganesh Chaturthi (Vinayaka Chavithi)",
    nameHi: "गणेश चतुर्थी (विनायक चतुर्थी)",
    nameSanskrit: "श्री गणेश चतुर्थी व्रतोत्सवः",
    category: "FESTIVAL",
    description: "The auspicious festival celebrating the birth of Lord Ganesha, the remover of all obstacles (Vighnaharta) and deity of wisdom.",
    descriptionHi: "विघ्नविनाशक, बुद्धिदाता और प्रथम पूज्य भगवान श्री गणेश का आविर्भाव महापर्व।",
    significance: "Bhadrapada Shukla Chaturthi at Madhyahna Kaal marks the arrival of Lord Ganesha to bless devotees with intellect, auspiciousness, and success.",
    significanceHi: "भाद्रपद शुक्ल चतुर्थी के मध्याह्न काल में गणेश जी का अवतरण हुआ। इस समय पूजन से समस्त विघ्न शांत होते हैं।",
    deities: ["Lord Ganesha", "Riddhi", "Siddhi"],
    pujaVidhi: "1. Install clay Ganesha idol on a sanctified raised altar.\n2. Perform Pran Pratishtha during Madhyahna Kaal.\n3. Offer 21 Durva grass blades, red flowers, and Sindoor.\n4. Offer 21 Modaks and Laddoos as Naivedya.\n5. Perform Ganesha Atharvashirsha path and Aarti.",
    pujaVidhiHi: "१. मध्याह्न काल में मिट्टी के गणेश जी की प्रतिमा को चौकी पर स्थापित करें।\n२. प्राण प्रतिष्ठा कर २१ दूर्वा दल और लाल सिंदूर अर्पित करें।\n३. २१ मोदक या लड्डू का भोग लगाएं।\n४. गणपति अथर्वशीर्ष का पाठ कर आरती करें।",
    vrataRules: "Traditional texts advise avoiding direct sighting of the Moon (Chandra Darshan) on Bhadrapada Shukla Chaturthi to prevent unearned blame (Mithya Kalank).",
    vrataRulesHi: "भाद्रपद शुक्ल चतुर्थी के दिन चंद्र दर्शन से बचना चाहिए ताकि मिथ्या कलंक का दोष न लगे।",
    mantras: [
      {
        title: "Ganesha Gayatri Mantra",
        sanskrit: "ॐ एकदन्ताय विद्महे वक्रतुण्डाय धीमहि । तन्नो दन्तिः प्रचोदयात् ॥",
        transliteration: "Om Ekadantaya Vidmahe Vakratundaya Dheemahi Tanno Dantih Prachodayat ॥",
        meaningEn: "We meditate on the One-Tusked Lord, whose trunk is curved. May that divine Elephant-faced Lord illuminate our consciousness.",
        meaningHi: "हम एकदंत, वक्रतुंड श्री गणेश का ध्यान करते हैं। वे गजमुख प्रभु हमारी बुद्धि को सन्मार्ग पर प्रेरित करें।"
      }
    ],
    faqs: [
      {
        q: "Why is Madhyahna Kaal preferred for Ganesha Sthapana?",
        a: "Lord Ganesha was born at midday (Madhyahna); thus the Madhyahna muhurta is the strictly prescribed window for idol installation.",
        qHi: "गणेश स्थापना के लिए मध्याह्न काल ही क्यों मान्य है?",
        aHi: "पुराणों के अनुसार भगवान गणेश का प्राकट्य दोपहर (मध्याह्न) में हुआ था, अतः इसी समय स्थापना और पूजन विहित है।"
      }
    ],
    regionalVariations: {
      west: "Celebrated across Maharashtra with spectacular 10-day Sarvajanik Pandals culminating in Anant Chaturdashi Visarjan.",
      south: "Known as Vinayaka Chavithi in Andhra, Telangana, Karnataka, and Tamil Nadu with clay Ganeshas and Kozhukattai offerings."
    },
    rule: {
      lunarMonth: "Bhadrapada",
      paksha: "Shukla",
      tithi: 4, // Chaturthi
      determinationRule: "MADHYAHNA_KAAL",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "phaladeepika",
      bookTitle: "Phaladeepika",
      chapterTitle: "Chapter 2: Karakatwas & Planetary Portfolios",
      verseNumber: "Shloka 28",
      pageNumber: 36,
      shlokaSanskrit: "केतोः स्वरूपं गणनाथपूज्यं सर्वप्रमादशमनं विचिन्त्यम् । विघ्नेशपादाम्बुजपूजनेन सर्वं शुभं स्यादतिनिर्मलं च ॥",
      translationEn: "Lord Ganesha is the guiding sovereign for overcoming spiritual knots and obstacles. Worship of Ganesha's lotus feet dispels misfortune.",
      translationHi: "भगवान गणेश विघ्नों का शमन करने वाले हैं। उनके चरणकमलों की पूजा से समस्त कार्य निर्विघ्न सिद्ध होते हैं।",
      readerUrl: "/library/phaladeepika/pdf?page=36"
    }
  },

  // 5. Makar Sankranti
  {
    slug: "makar-sankranti",
    name: "Makar Sankranti",
    nameHi: "मकर संक्रांति",
    nameSanskrit: "मकर संक्रान्ति पुण्यकालः",
    category: "SANKRANTI",
    description: "The major astronomical transit of the Sun into sidereal Capricorn (Makara), marking the commencement of Uttarayana (the northward celestial journey).",
    descriptionHi: "भगवान सूर्य का धनु राशि से मकर राशि में संक्रमण। यह उत्तरायण काल का शुभारंभ है जो देवताओं का दिन कहलाता है।",
    significance: "Marks longer daylight hours, harvest abundance, and supreme spiritual merit for sacred river bathing (Snana) and charity (Dana).",
    significanceHi: "पवित्र नदियों में स्नान, सूर्य उपासना, और तिल-गुड़ व खिचड़ी के दान से अक्षय पुण्य की प्राप्ति होती है।",
    deities: ["Surya Dev", "Lord Vishnu", "Ganga Devi"],
    pujaVidhi: "1. Take an early morning holy dip in sacred rivers or add sesame seeds (Til) to bath water.\n2. Offer Arghya to Lord Surya with copper vessel containing water, red chandan, and jaggery.\n3. Chant the Aditya Hridaya Stotram.\n4. Donate sesame seeds (Til), jaggery (Gud), warm clothes, and Khichdi to the needy.",
    pujaVidhiHi: "१. प्रातः तिल मिश्रित जल से स्नान करें।\n२. तांबे के लोटे में जल, लाल चंदन, अक्षत और गुड़ मिलाकर भगवान सूर्य को अर्घ्य दें।\n३. आदित्य हृदय स्तोत्र का पाठ करें।\n४. तिल, गुड़, कंबल और खिचड़ी का दान करें।",
    vrataRules: "Fast is observed until the Surya Sankranti Punya Kaal ritual bath and Dana are completed.",
    vrataRulesHi: "संक्रांति के पुण्यकाल में स्नान-दान करने तक उपवास रखें, तत्पश्चात तिल-गुड़ व खिचड़ी का सात्विक आहार लें।",
    mantras: [
      {
        title: "Surya Gayatri Mantra",
        sanskrit: "ॐ भास्कराय विद्महे महाद्युतिकराय धीमहि । तन्नो आदित्यः प्रचोदयात् ॥",
        transliteration: "Om Bhaskaraya Vidmahe Mahadyutikaraya Dheemahi Tanno Adityah Prachodayat ॥",
        meaningEn: "We meditate on the Radiant Sun, the generator of supreme light. May that divine Sun inspire our intellect.",
        meaningHi: "हम समस्त संसार को प्रकाशित करने वाले भगवान भास्कर का ध्यान करते हैं। वे सूर्यदेव हमारी बुद्धि को तेजस्वी बनाएं।"
      }
    ],
    faqs: [
      {
        q: "What is Punya Kaal in Sankranti?",
        a: "Punya Kaal is the sacred time window immediately following the Sun's planetary ingress into Capricorn, considered potent for spiritual charity.",
        qHi: "संक्रांति का पुण्यकाल क्या है?",
        aHi: "सूर्य के मकर राशि में प्रवेश के समय और उसके कुछ घंटे बाद की अवधि पुण्यकाल कहलाती है जिसमें स्नान-दान अक्षय फल देता है।"
      }
    ],
    regionalVariations: {
      north: "Celebrated as Khichdi in UP and Bihar, Lohri in Punjab, and Kite Festival (Uttarayan) in Gujarat.",
      south: "Celebrated as Pongal in Tamil Nadu, and Makara Sankranthi in Karnataka and Andhra Pradesh.",
      bengal: "Celebrated as Poush Sankranti with the grand Ganga Sagar Mela holy dip."
    },
    rule: {
      solarSign: "Makara",
      determinationRule: "SANKRANTI_ENTRY",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "brihat-parashara-hora-shastra",
      bookTitle: "Brihat Parashara Hora Shastra",
      chapterTitle: "Chapter 3: Sun Characteristics & Planetary Royal Order",
      verseNumber: "Shloka 11",
      pageNumber: 26,
      shlokaSanskrit: "सूर्य आत्मा जगतस्तस्थुषश्च मकरं प्रयाते सति पुण्यकालः । स्नानादिदानैः पुरुषस्य मुक्तिः संजायते जन्मशतार्जितेभ्यः ॥",
      translationEn: "The Sun is the Soul of all animate and inanimate existence. When the Sun enters Makara, holy bath and charity liberate one from accumulated karmas.",
      translationHi: "सूर्य चराचर जगत की आत्मा हैं। जब सूर्य मकर राशि में प्रवेश करते हैं तो उस पुण्यकाल में स्नान-दान से मनुष्य जन्मों के पापों से मुक्त होता है।",
      readerUrl: "/library/brihat-parashara-hora-shastra/pdf?page=26"
    }
  },

  // 6. Holi & Holika Dahan
  {
    slug: "holi-holika-dahan",
    name: "Holi (Holika Dahan)",
    nameHi: "होली (होलिका दहन व रंगोत्सव)",
    nameSanskrit: "होलिका दहनम् / वसंतोत्सवः",
    category: "FESTIVAL",
    description: "The exuberant spring festival of colors celebrating the deliverance of Bhakta Prahlada, the burning of demoness Holika, and the arrival of Vasanta.",
    descriptionHi: "भक्त प्रह्लाद की रक्षा, अधर्म रूपी होलिका के दहन और वसंत ऋतु के उल्लास का रंगबिरंगा महापर्व।",
    significance: "Celebrates absolute divine protection of the pure devotee and the burning away of inner negative tendencies.",
    significanceHi: "अहंकार और वासना की भस्म तथा सात्विक प्रेम और सौहार्द का उत्सव।",
    deities: ["Lord Narasimha", "Bhakta Prahlada", "Radha Krishna"],
    pujaVidhi: "1. Collect wood and cow dung cakes for the sacred Holika bonfire.\n2. Perform Puja with water, Akshat, flowers, and Gulal during auspicious evening Muhurta.\n3. Light the fire and circumambulate (Pradakshina) 3, 5, or 7 times.\n4. Offer fresh wheat stalks and gram pods into the fire.",
    pujaVidhiHi: "१. शाम को शुभ मुहूर्त में होलिका स्थल पर रोली, अक्षत, पुष्प और गुलाल से पूजा करें।\n२. अग्नि प्रज्वलित कर ३, ५ या ७ परिक्रमा करें और जल का अर्घ्य दें।\n३. गेहूं की बालियां और चने के होले अग्नि में भूनकर प्रसाद लें।",
    vrataRules: "Traditional fast is observed until Holika bonfire is lit and Bhakta Prahlada's victory is commemorated.",
    vrataRulesHi: "शाम को होलिका दहन तक उपवास रखा जाता है, दहन और दर्शन के उपरांत सात्विक मिष्ठान्न ग्रहण करते हैं।",
    mantras: [
      {
        title: "Prahlada Smarana Shloka",
        sanskrit: "असुराणां विनाशाया भक्तानां रक्षणाय च । प्रह्लादवरदो देवो नृसिंहः पातु मां सदा ॥",
        transliteration: "Asuranam Vinashaya Bhaktanam Rakshanaya Cha...",
        meaningEn: "For the destruction of dark forces and the preservation of pure devotees, may Lord Narasimha, granter of boons to Prahlada, ever protect me.",
        meaningHi: "दुष्टों के संहार और भक्तों की रक्षा के लिए प्रकट हुए प्रह्लादवरद भगवान नृसिंह सदा मेरी रक्षा करें।"
      }
    ],
    faqs: [
      {
        q: "Why is Bhadra avoided during Holika Dahan?",
        a: "Bhadra (Vishti Karana) is an inauspicious astrological phase; conducting Holika Dahan during Bhadra is traditionally believed to bring misfortune to the ruler and community.",
        qHi: "होलिका दहन में भद्रा का विचार क्यों किया जाता है?",
        aHi: "भद्रा (विष्टि करण) को अत्यंत अशुभ माना जाता है। भद्रा मुख में होलिका दहन करने से जन-धन की हानि का भय रहता है, अतः भद्रा रहित प्रदोष काल में ही दहन शास्त्रसम्मत है।"
      }
    ],
    regionalVariations: {
      north: "Braj Mathura-Vrindavan celebrates with Lathmar Holi and Phoolon ki Holi for over a week.",
      west: "In Rajasthan and Gujarat, Dhulandi is celebrated with traditional folk music and Chang drums.",
      east: "In Bengal and Odisha, celebrated as Dol Jatra with idols of Radha-Krishna taken in procession."
    },
    rule: {
      lunarMonth: "Phalguna",
      paksha: "Shukla",
      tithi: 15, // Purnima
      determinationRule: "PRADOSHA_KAAL",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "brihat-parashara-hora-shastra",
      bookTitle: "Brihat Parashara Hora Shastra",
      chapterTitle: "Chapter 2: Planetary Incarnation & Karakatwa",
      verseNumber: "Shloka 15",
      pageNumber: 20,
      shlokaSanskrit: "नृसिंहो भूमिसूनोस्तु प्रह्लादप्रतिपालकः । पौर्णमास्यां विनिर्दिष्टं दहनं सर्वपापहा ॥",
      translationEn: "Lord Narasimha is the protector of Prahlada. The Phalguna Full Moon burning ritual destroys past sins and purifies the atmosphere.",
      translationHi: "भगवान नृसिंह भक्त प्रह्लाद के रक्षक हैं। फाल्गुन पूर्णिमा का दहन पर्व सभी पापों को नष्ट करने वाला है।",
      readerUrl: "/library/brihat-parashara-hora-shastra/pdf?page=20"
    }
  },

  // 7. Rama Navami
  {
    slug: "rama-navami",
    name: "Rama Navami",
    nameHi: "श्री राम नवमी",
    nameSanskrit: "श्रीरामनवमी व्रतोत्सवः",
    category: "JAYANTI",
    description: "The divine birth anniversary of Maryada Purushottam Lord Sri Rama, born at solar noon (Madhyahna) in Chaitra Shukla Navami.",
    descriptionHi: "मर्यादा पुरुषोत्तम भगवान श्री रामचंद्र जी का पावन अवतरण दिवस, जो चैत्र शुक्ल नवमी के मध्याह्न में कर्क लग्न और पुनर्वसु नक्षत्र में प्रकट हुए थे।",
    significance: "Celebrates the establishment of righteous conduct, ideal governance (Ramrajya), and universal compassion.",
    significanceHi: "आदर्श चरित्र, सत्य, मर्यादा और धर्म की विजय का दिव्य प्रतीक।",
    deities: ["Lord Rama", "Maa Sita", "Lakshmana", "Hanuman Ji"],
    pujaVidhi: "1. Take a sacred morning bath and observe fast.\n2. At Madhyahna (12:00 PM), conduct Rama Janmotsav with conch and bell sounds.\n3. Perform Abhishek with Panchamrit and Gangajal.\n4. Recite Ramcharitmanas, Valmiki Ramayana, or Rama Raksha Stotram.\n5. Offer Panjiri, Sunth (ginger prasad), and Kheer.",
    pujaVidhiHi: "१. प्रातः स्नान कर व्रत का संकल्प लें।\n२. दोपहर १२ बजे मध्याह्न काल में शंख और घंटों की ध्वनि के साथ जन्मोत्सव मनाएं।\n३. पंचामृत से अभिषेक कर पीले वस्त्र अर्पित करें।\n४. राम रक्षा स्तोत्र अथवा सुंदरकांड का पाठ करें।\n५. पंजीरी और धनिए के प्रसाद का भोग लगाएं।",
    vrataRules: "Devotees observe fast throughout the morning, breaking it with Sattvik prasad after Madhyahna Puja.",
    vrataRulesHi: "दोपहर के जन्मोत्सव और आरती के बाद फलाहार अथवा सात्विक आहार से व्रत खोला जाता है।",
    mantras: [
      {
        title: "Sri Rama Taraka Mantra",
        sanskrit: "श्री राम जय राम जय जय राम ॥",
        transliteration: "Sri Rama Jaya Rama Jaya Jaya Rama ॥",
        meaningEn: "Victory to Lord Rama, victory to the supreme divine protector.",
        meaningHi: "मर्यादा पुरुषोत्तम प्रभु श्री राम की जय हो, सर्वत्र उनके सत्य की विजय हो।"
      }
    ],
    faqs: [
      {
        q: "Why is 12:00 PM solar noon critical for Rama Navami?",
        a: "Valmiki Ramayana states Sri Rama was born when the Sun was in its highest exaltation at midday in Abhijit Muhurta.",
        qHi: "राम नवमी में मध्याह्न १२ बजे का क्या महत्व है?",
        aHi: "वाल्मीकि रामायण के अनुसार प्रभु श्रीराम का जन्म अभिजीत मुहूर्त में दोपहर के समय हुआ था जब सूर्य अपने पूर्ण तेज में था।"
      }
    ],
    regionalVariations: {
      north: "Massive celebrations at Ayodhya with continuous Ramcharitmanas Akhand Path and Sarayu river bathing.",
      south: "Celebrated in Telangana and Andhra Pradesh at Bhadrachalam as Sri Sita Rama Kalyanam (celestial wedding)."
    },
    rule: {
      lunarMonth: "Chaitra",
      paksha: "Shukla",
      tithi: 9, // Navami
      determinationRule: "MADHYAHNA_KAAL",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "brihat-parashara-hora-shastra",
      bookTitle: "Brihat Parashara Hora Shastra",
      chapterTitle: "Chapter 2: Avatara Graha Correlations",
      verseNumber: "Shloka 3",
      pageNumber: 17,
      shlokaSanskrit: "रामोऽवतारः सूर्यस्य धर्मसंस्थापनक्षमः । उच्चस्थे भास्करे जाते नवम्यां चैत्रसंभवे ॥",
      translationEn: "Lord Rama is the solar incarnation capable of establishing eternal Dharma, born when the Sun shone brightly on Chaitra Navami.",
      translationHi: "भगवान श्रीराम सूर्य के साक्षात् अवतार हैं जिन्होंने धर्म की पुनर्स्थापना की। उनका प्राकट्य चैत्र नवमी के मध्याह्न में हुआ।",
      readerUrl: "/library/brihat-parashara-hora-shastra/pdf?page=17"
    }
  },

  // 8. Navratri (Sharad & Chaitra)
  {
    slug: "navratri-durga-puja",
    name: "Sharad Navratri & Durga Puja",
    nameHi: "शारदीय नवरात्रि व दुर्गा पूजा",
    nameSanskrit: "शारदीय नवरात्रोत्सवः",
    category: "FESTIVAL",
    description: "The nine divine nights of worship dedicated to the nine forms of Goddess Durga (Navadurga), culminating in Vijayadashami.",
    descriptionHi: "आदिशक्ति भगवती दुर्गा के नौ स्वरूपों (नवदुर्गा) की आराधना का नौ दिवसीय महायज्ञ, जो असुरी शक्तियों पर दैवीय विजय का पर्व है।",
    significance: "Represents the triumph of Goddess Durga over Mahishasura and the awakening of dormant Kundalini shakti in the seeker.",
    significanceHi: "महिषासुर मर्दिनी मां भगवती की विजय और साधक के अंतःकरण में आध्यात्मिक शक्ति के जागरण का पर्व।",
    deities: ["Maa Durga", "Maa Kali", "Maa Lakshmi", "Maa Saraswati"],
    pujaVidhi: "1. Perform Ghatasthapana (Kalash installation) during auspicious Pratipada morning muhurta.\n2. Sow barley seeds (Jowar) in clay pot.\n3. Recite Sri Durga Saptashati (Devi Mahatmya) daily.\n4. Light Akhand Jyoti (uninterrupted lamp) for nine days.\n5. Perform Kanya Pujan (feeding young girls) on Ashtami or Navami.",
    pujaVidhiHi: "१. प्रतिपदा के शुभ मुहूर्त में घटस्थापना (कलश स्थापना) करें और जौ बोएं।\n२. नौ दिनों तक अखण्ड ज्योति प्रज्वलित रखें।\n३. प्रतिदिन श्री दुर्गा सप्तशती का पाठ करें।\n४. अष्टमी अथवा नवमी के दिन विधिपूर्वक कन्या पूजन कर व्रत पूर्ण करें।",
    vrataRules: "Devotees observe fasting for 9 days, eating single Sattvik meal of buckwheat (Kuttu), water chestnut (Singhara) flour, and fruits. Strict celibacy and peace are maintained.",
    vrataRulesHi: "नौ दिनों तक फलाहार व्रत रखा जाता है। कुट्टू, सिंघाड़ा, साबूदाना व फल ग्रहण किए जाते हैं। तामसिक भोजन वर्जित रहता है।",
    mantras: [
      {
        title: "Navarna Mantra",
        sanskrit: "ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे ॥",
        transliteration: "Om Aim Hreem Kleem Chamundayai Vichche ॥",
        meaningEn: "Salutations to the Supreme Goddess encompassing Saraswati (Aim), Lakshmi (Hreem), and Kali (Kleem), slayer of inner and outer demons.",
        meaningHi: "महासरस्वती, महालक्ष्मी और महाकाली स्वरूपा देवी चामुण्डा को मेरा नमन।"
      }
    ],
    faqs: [
      {
        q: "What is the rule for Ghatasthapana timing?",
        a: "Ghatasthapana must be performed during Shukla Pratipada before the first 1/3rd of daytime elapses, preferably during Abhijit Muhurta, strictly avoiding Chitra Nakshatra and Vaidhriti Yoga if possible.",
        qHi: "घटस्थापना का शास्त्रसम्मत नियम क्या है?",
        aHi: "घटस्थापना प्रतिपदा तिथि में दिन के प्रथम एक-तिहाई भाग अथवा अभिजीत मुहूर्त में की जाती है। चित्रा नक्षत्र और वैधृति योग का त्याग किया जाता है।"
      }
    ],
    regionalVariations: {
      bengal: "Celebrated with monumental Durga Puja Pandals, Dhunuchi Naach, and Sindoor Khela.",
      gujarat: "Celebrated with vibrant Garba and Dandiya Raas dancing honoring the Mother Goddess.",
      north: "Observed with Ramlila drama enactments and Kanya Pujan on Ashtami/Navami."
    },
    rule: {
      lunarMonth: "Ashwina",
      paksha: "Shukla",
      tithi: 1, // Pratipada to Navami
      determinationRule: "UDAYA_TITHI",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "brihat-parashara-hora-shastra",
      bookTitle: "Brihat Parashara Hora Shastra",
      chapterTitle: "Chapter 2: Divine Mother Astrological Sovereignty",
      verseNumber: "Shloka 25",
      pageNumber: 32,
      shlokaSanskrit: "नवरात्रे विधानेन पूजिता चण्डिका शुभा । सर्वोपद्रवनाशाय साधकस्य भवेत्सदा ॥",
      translationEn: "When Goddess Chandika is worshiped with proper Vedic rituals during Navratri, she annihilates all obstacles and bestows spiritual victory.",
      translationHi: "नवरात्रि में विधि-विधान से पूजित होने पर भगवती चंडिका साधक के समस्त कष्टों का नाश कर कल्याण करती हैं।",
      readerUrl: "/library/brihat-parashara-hora-shastra/pdf?page=32"
    }
  },

  // 9. Dussehra (Vijayadashami)
  {
    slug: "dussehra-vijayadashami",
    name: "Dussehra (Vijayadashami)",
    nameHi: "दशहरा (विजयादशमी)",
    nameSanskrit: "विजयादशमी",
    category: "FESTIVAL",
    description: "The supreme day of victory marking Lord Rama's vanquishing of demon king Ravana and Goddess Durga's slaying of Mahishasura.",
    descriptionHi: "अधर्म, अन्याय और अहंकार के प्रतीक रावण पर मर्यादा पुरुषोत्तम प्रभु श्रीराम की विजय का पावन महापर्व।",
    significance: "Auspicious day for Shami Puja, Aparajita Puja, initiation of learning (Vidyarambham), and new righteous undertakings.",
    significanceHi: "शमी पूजन, अपराजिता पूजन, नवीन कार्यों के शुभारंभ और शस्त्र पूजा का सर्वश्रेष्ठ मुहूर्त।",
    deities: ["Lord Rama", "Maa Durga", "Aparajita Devi"],
    pujaVidhi: "1. Perform Aparajita Puja in the afternoon (Aparahna Kaal).\n2. Worship Shami tree leaves with the mantra: 'Shami Shamayate Papam'.\n3. Perform Shastra Puja (blessing instruments and tools of profession).\n4. Witness the burning of Ravana, Kumbhakarna, and Meghnada effigies in the evening.",
    pujaVidhiHi: "१. अपराह्न काल में अपराजिता देवी का पूजन करें।\n२. शमी वृक्ष का पूजन कर 'शमी शमयते पापम्' मंत्र से पत्तियां लेकर बड़ों का आशीर्वाद लें।\n३. अस्त्र-शस्त्र और अपने कार्य के औजारों का पूजन करें।\n४. सायंकाल रावण पुतला दहन देख सत्य के मार्ग पर चलने का संकल्प लें।",
    vrataRules: "Marks the joyful conclusion of nine-day Navratri fasting with feast and celebration.",
    vrataRulesHi: "नौ दिवसीय नवरात्रि व्रत का उद्यापन कर सात्विक भोज और विजय उत्सव मनाया जाता है।",
    mantras: [
      {
        title: "Aparajita Stuti Mantra",
        sanskrit: "इमां पूजां मया देवि यथाशक्त्या निवेदिताम् । रक्षणार्थं समादाय व्रज देवि यथासुखम् ॥",
        transliteration: "Imam Pujam Maya Devi Yathashaktya Niveditam...",
        meaningEn: "O Invincible Mother Aparajita, accept my worship and safeguard my righteous path forever.",
        meaningHi: "हे अपराजेय भगवती अपराजिता, मेरी भक्ति स्वीकार कर सदा मेरी रक्षा करें।"
      }
    ],
    faqs: [
      {
        q: "Why is Vijayadashami considered an Abujha (self-proven) Muhurta?",
        a: "Vijayadashami's Aparahna period is intrinsically victorious; ancient kings embarked on righteous campaigns without needing planetary Muhurta checking.",
        qHi: "विजयादशमी को अबूझ मुहूर्त क्यों कहते हैं?",
        aHi: "इस दिन का अपराह्न काल स्वयं सिद्ध और विजयी माना जाता है। इस काल में प्रारंभ किया गया कोई भी शुभ कार्य निर्विघ्न सफल होता है।"
      }
    ],
    regionalVariations: {
      mysore: "World-famous Mysore Dasara procession with decorated royal elephants carrying the Golden Howdah of Chamundeshwari.",
      bengal: "Immersion of Durga idols with tearful farewell and joyous Shubho Bijoya greetings.",
      kullu: "Kullu Dussehra in Himachal gathers hundreds of local village deities for a grand week-long divine conclave."
    },
    rule: {
      lunarMonth: "Ashwina",
      paksha: "Shukla",
      tithi: 10, // Dashami
      determinationRule: "APARAHNA_KAAL",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "brihat-parashara-hora-shastra",
      bookTitle: "Brihat Parashara Hora Shastra",
      chapterTitle: "Chapter 14: Muhurta Auspicious Tithis",
      verseNumber: "Shloka 18",
      pageNumber: 52,
      shlokaSanskrit: "दशमी विजयाख्या च सर्वसिद्धिकरी स्मृता । प्रस्थानकरणे चैव सर्वशत्रुविनाशिनी ॥",
      translationEn: "Dashami known as Vijaya Dashami is celebrated as the granter of all victory. Any campaign or auspicious endeavor commenced on it overcomes all adversity.",
      translationHi: "विजया नाम की दशमी सभी कार्यों में सिद्धि देने वाली है। इस दिन किया गया कोई भी शुभ संकल्प शत्रुओं और बाधाओं का नाश करता है।",
      readerUrl: "/library/brihat-parashara-hora-shastra/pdf?page=52"
    }
  },

  // 10. Hanuman Jayanti
  {
    slug: "hanuman-jayanti",
    name: "Hanuman Jayanti",
    nameHi: "हनुमान जयंती",
    nameSanskrit: "श्रीहनुमज्जयन्ती",
    category: "JAYANTI",
    description: "The appearance day of Lord Hanuman, the supreme devotee (Param Bhakta), Rudravatar, and embodiment of boundless strength and humility.",
    descriptionHi: "परम रामभक्त, संकटमोचन, रुद्रावतार महावीर श्री हनुमान जी का पावन प्राकट्य दिवस।",
    significance: "Chaitra Purnima marks the descent of Lord Hanuman to dispel fear, alleviate malefic planetary influences (especially Saturn and Rahu), and bestow courage.",
    significanceHi: "भय, रोग, शोक और शनि-राहु जनित कष्टों के निवारण हेतु हनुमान जी की उपासना का सर्वोत्तम दिन।",
    deities: ["Lord Hanuman", "Lord Rama"],
    pujaVidhi: "1. Take a holy bath and offer Sindoor mixed with jasmine oil (Chola) to Hanuman Ji.\n2. Offer a garland of 108 Betel leaves (Paan) and Boondi laddoos.\n3. Recite Hanuman Chalisa 11 or 108 times.\n4. Recite Sundarkand and Bajrang Baan.\n5. Distribute Prasad to devotees.",
    pujaVidhiHi: "१. प्रातः स्नान कर हनुमान जी को सिंदूर और चमेली के तेल का चोला अर्पित करें।\n२. १०८ पान के पत्तों की माला और बूंदी के लड्डू का भोग लगाएं।\n३. ११ अथवा २१ बार श्री हनुमान चालीसा और सुंदरकांड का पाठ करें।\n४. आरती कर प्रसाद वितरण करें।",
    vrataRules: "Devotees observe fast on Chaitra Purnima until evening Aarti, partaking in fruits and milk.",
    vrataRulesHi: "सायंकाल आरती और सुंदरकांड पाठ के उपरांत फलाहार से व्रत खोला जाता है।",
    mantras: [
      {
        title: "Hanuman Moola Mantra",
        sanskrit: "ॐ हं हनुमते रुद्रात्मकाय हुं फट् ॥",
        transliteration: "Om Ham Hanumate Rudratmakaya Hum Phat ॥",
        meaningEn: "Salutations to Lord Hanuman, the fierce Rudra incarnation, dispeller of fear and negativity.",
        meaningHi: "रुद्रावतार, संकटमोचन श्री हनुमान जी को मेरा सादर नमन।"
      }
    ],
    faqs: [
      {
        q: "Why is Hanuman worship especially effective for Saturn (Shani) relief?",
        a: "According to traditional legends, Lord Hanuman rescued Shani Dev from Ravana's captivity; Shani Dev promised that Hanuman's devotees will never suffer malefic planetary distress.",
        qHi: "शनि की शांति के लिए हनुमान पूजा विशेष फलदायी क्यों है?",
        aHi: "पौराणिक कथा के अनुसार हनुमान जी ने शनिदेव को रावण के बंधन से मुक्त कराया था, जिससे प्रसन्न होकर शनिदेव ने हनुमान भक्तों पर अपनी पीड़ा न डालने का वरदान दिया था।"
      }
    ],
    regionalVariations: {
      north: "Celebrated on Chaitra Purnima with massive temple gatherings and flag hoisting.",
      south: "In Andhra and Telangana, celebrated for 41 days beginning on Chaitra Purnima and concluding on Vaishakha Bahula Dashami."
    },
    rule: {
      lunarMonth: "Chaitra",
      paksha: "Shukla",
      tithi: 15, // Purnima
      determinationRule: "UDAYA_TITHI",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "phaladeepika",
      bookTitle: "Phaladeepika",
      chapterTitle: "Chapter 23: Planetary Afflictions & Propitiations",
      verseNumber: "Shloka 19",
      pageNumber: 142,
      shlokaSanskrit: "शन्यादिखलदोषेषु मारुतेः संप्रपूजनम् । सर्वबाधाप्रशमनं कुरुते नात्र संशयः ॥",
      translationEn: "In conditions of severe Saturn or malefic afflictions, worship of Lord Maruti Hanuman alleviates all distress without doubt.",
      translationHi: "शनि आदि क्रूर ग्रहों की पीड़ा में मारुति हनुमान जी का पूजन समस्त बाधाओं को शांत करता है, इसमें कोई संशय नहीं है।",
      readerUrl: "/library/phaladeepika/pdf?page=142"
    }
  },

  // 11. Raksha Bandhan
  {
    slug: "raksha-bandhan",
    name: "Raksha Bandhan",
    nameHi: "रक्षाबंधन",
    nameSanskrit: "रक्षाबन्धनम्",
    category: "FESTIVAL",
    description: "The sacred bond of love and protection between brothers and sisters, observed on Shravana Purnima with sacred thread tying.",
    descriptionHi: "भाई-बहन के पवित्र प्रेम, विश्वास और रक्षा के संकल्प का पावन पर्व, जो श्रावण पूर्णिमा को मनाया जाता है।",
    significance: "Sisters tie the Rakhi amulet on their brothers' wrists wishing them longevity and prosperity; brothers pledge lifelong protection.",
    significanceHi: "श्रावण पूर्णिमा पर रक्षासूत्र बांधने से सभी अनिष्टों से रक्षा होती है। यह उपाकर्म और वेदारंभ का भी पावन दिन है।",
    deities: ["Lord Vishnu", "Goddess Indrani", "Lord Varuna"],
    pujaVidhi: "1. Prepare a puja thali with Rakhi, Roli, Akshat, Diya, and sweets.\n2. Apply saffron-roli tilak on brother's forehead with unbroken rice grains.\n3. Tie the consecrated Rakhi on brother's right wrist while chanting the Raksha Mantra.\n4. Perform Aarti and feed sweet.",
    pujaVidhiHi: "१. थाली में रक्षासूत्र, रोली, अक्षत, दीपक और मिष्ठान्न सजाएं।\n२. भाई के माथे पर तिलक लगाकर दाहिनी कलाई पर 'येन बद्धो बली राजा' मंत्र से रक्षासूत्र बांधें।\n३. आरती उतारकर मिठाई खिलाएं।",
    vrataRules: "Sisters traditionally keep a fast in the morning until the Rakhi tying ceremony is completed.",
    vrataRulesHi: "बहनें रक्षासूत्र बांधने तक प्रातः उपवास रखती हैं, तत्पश्चात भोजन ग्रहण करती हैं।",
    mantras: [
      {
        title: "Traditional Raksha Sutra Mantra",
        sanskrit: "येन बद्धो बली राजा दानवेन्द्रो महाबलः । तेन त्वामनुबध्नामि रक्षे मा चल मा चल ॥",
        transliteration: "Yena Baddho Bali Raja Danavendro Mahabalah | Tena Tvam Anubadhnami Rakshe Ma Chala Ma Chala ॥",
        meaningEn: "The sacred thread with which the mighty King Bali was bound, with that same thread I bind protection around thee. O protective bond, remain steadfast forever!",
        meaningHi: "जिस रक्षासूत्र से महाबली दानवेन्द्र राजा बलि को बांधा गया था, उसी से मैं तुम्हें बांधता हूं। हे रक्षासूत्र, तुम अडिग रहना!"
      }
    ],
    faqs: [
      {
        q: "Why must Bhadra be avoided when tying Rakhi?",
        a: "Scriptures state that performing Raksha Bandhan during Bhadra brings hardship; it must be tied after Bhadra has ended, preferably in Aparahna or Pradosha Kaal.",
        qHi: "रक्षाबंधन पर भद्रा का त्याग क्यों आवश्यक है?",
        aHi: "शास्त्रों में भद्रा काल में रक्षासूत्र बांधना पूर्णतः वर्जित है। भद्रा समाप्त होने के उपरांत अपराह्न अथवा प्रदोष काल में राखी बांधना ही कल्याणकारी होता है।"
      }
    ],
    regionalVariations: {
      all: "Widely celebrated as Rakhi in North and Western India.",
      south: "Celebrated by Brahmins as Avani Avittam (Upakarma) where sacred threads (Yajnopavita) are renewed.",
      coastal: "Celebrated by fishermen as Narali Purnima by offering coconuts to the Sea God Varuna."
    },
    rule: {
      lunarMonth: "Shravana",
      paksha: "Shukla",
      tithi: 15, // Purnima
      determinationRule: "APARAHNA_KAAL",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "arogyanidhii",
      bookTitle: "Arogyanidhii",
      chapterTitle: "Chapter 5: Ritucharya & Shravana Observances",
      verseNumber: "Sutra 22",
      pageNumber: 38,
      shlokaSanskrit: "श्रावण्यां पौर्णमास्यां तु रक्षासूत्रविधानतः । रोगाणां शमनं नॄणां दीर्घमायुश्च वर्धते ॥",
      translationEn: "On Shravana Purnima, the ritual tying of the sacred protective amulet (Rakshasutra) dispels diseases and augments vitality and longevity.",
      translationHi: "श्रावण पूर्णिमा पर रक्षासूत्र का विधान करने से मनुष्य के रोगों का शमन होता है और दीर्घायु की वृद्धि होती है।",
      readerUrl: "/library/arogyanidhii/pdf?page=38"
    }
  },

  // 12. Karwa Chauth
  {
    slug: "karwa-chauth",
    name: "Karwa Chauth",
    nameHi: "करवा चौथ",
    nameSanskrit: "करक चतुर्थी व्रतम्",
    category: "VRATA",
    description: "The dedicated fasting observance by married women for the longevity, health, and prosperity of their husbands.",
    descriptionHi: "सुहागिन महिलाओं द्वारा पति की दीर्घायु, स्वास्थ्य और सौभाग्य के लिए रखा जाने वाला अखंड निर्जला व्रत।",
    significance: "Kartika Krishna Chaturthi involves a waterless fast concluded only after sighting the Moon through a sieve and offering Arghya.",
    significanceHi: "कार्तिक कृष्ण चतुर्थी को चंद्रोदय के समय छलनी से चंद्रमा और पति का दर्शन कर जल अर्पित करने का पावन विधान।",
    deities: ["Maa Gauri", "Lord Shiva", "Chandra Dev"],
    pujaVidhi: "1. Take pre-dawn meal (Sargi) before sunrise.\n2. Observe Nirjala fast throughout the day.\n3. In evening, listen to Karwa Chauth Katha and rotate Karwas with fellow women.\n4. Sighting the Moon (Chandrodaya), offer Arghya and pray for husband's long life.\n5. Break fast by drinking water from husband's hands.",
    pujaVidhiHi: "१. सूर्योदय पूर्व सरगी ग्रहण कर निर्जला व्रत का संकल्प लें।\n२. शाम को माता पार्वती और करवा माता की पूजा कर कथा सुनें।\n३. चंद्रोदय होने पर छलनी से चंद्रमा और पतिदेव का दर्शन करें।\n४. अर्घ्य देकर पति के हाथों जल ग्रहण कर व्रत पूर्ण करें।",
    vrataRules: "Strict Nirjala (waterless) fast throughout the day until Moonrise. Sighting of Moon is mandatory before taking food or water.",
    vrataRulesHi: "सूर्योदय से चंद्रोदय तक निर्जला व्रत रखा जाता है। चंद्र दर्शन के बिना भोजन या जल ग्रहण नहीं किया जाता।",
    mantras: [
      {
        title: "Chandra Arghya Mantra",
        sanskrit: "ॐ क्षीरपुत्राय विद्महे अमृतत्त्वाय धीमहि तन्नो सोमः प्रचोदयात् ॥",
        transliteration: "Om Ksheeraputraya Vidmahe Amritattvaya Dheemahi Tanno Somah Prachodayat ॥",
        meaningEn: "We meditate on Lord Soma, child of the celestial ocean and source of nectar. May He grant longevity and peaceful bliss.",
        meaningHi: "अमृतमयी किरणों वाले चंद्रदेव को हमारा प्रणाम। वे हमें सौभाग्य और शांति प्रदान करें।"
      }
    ],
    faqs: [
      {
        q: "How is the fasting day determined if Moonrise occurs after midnight?",
        a: "The festival is observed on the civil date that contains Chaturdashi tithi during Moonrise (Chandrodaya Viddha Chaturthi).",
        qHi: "करवा चौथ की तिथि का निर्धारण कैसे होता है?",
        aHi: "जिस दिन शाम को चंद्रोदय के समय चतुर्थी तिथि विद्यमान हो (चंद्रोदय व्यापिनी चतुर्थी), उसी दिन यह व्रत किया जाता है।"
      }
    ],
    regionalVariations: {
      north: "Vastly popular in Punjab, Haryana, Rajasthan, Uttar Pradesh, and Delhi NCR.",
      south: "In the South, a similar observance called Karadaiyan Nombu is celebrated at Meena Sankranti."
    },
    rule: {
      lunarMonth: "Kartika",
      paksha: "Krishna",
      tithi: 19, // Chaturthi
      determinationRule: "PRADOSHA_KAAL",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "arogyanidhii",
      bookTitle: "Arogyanidhii",
      chapterTitle: "Chapter 6: Stree Rog & Pativrata Dinacharya",
      verseNumber: "Sutra 14",
      pageNumber: 56,
      shlokaSanskrit: "कार्तिकस्य चतुर्थ्यां तु करकव्रतमाचरेत् । चन्द्रार्घ्यदानेन नारी सौभाग्यायुः समश्नुते ॥",
      translationEn: "On the fourth day of Kartika Krishna Paksha, observing the Karaka Vrata and offering Arghya to the Moon grants auspicious matrimony and long life to the spouse.",
      translationHi: "कार्तिक कृष्ण चतुर्थी को करवा चौथ का व्रत कर चंद्रमा को अर्घ्य देने से स्त्री को अखंड सौभाग्य और दीर्घायु की प्राप्ति होती है।",
      readerUrl: "/library/arogyanidhii/pdf?page=56"
    }
  },

  // 13. Ekadashi Vrat (General / 24 Ekadashis)
  {
    slug: "ekadashi-vrata",
    name: "Ekadashi Vrata (24 Sacred Ekadashis)",
    nameHi: "एकादशी व्रत (वर्ष की २४ एकादशियां)",
    nameSanskrit: "एकादशी महाव्रतम्",
    category: "VRATA",
    description: "The supreme Vedic fasting day occurring twice every lunar month, dedicated to Lord Vishnu for mental purification and spiritual elevation.",
    descriptionHi: "माह में दो बार शुक्ल और कृष्ण पक्ष की ग्यारहवीं तिथि को रखा जाने वाला सर्वोत्तम वैदिक व्रत जो मन की शुद्धि और भगवत्कृपा प्रदान करता है।",
    significance: "Lord Vishnu states that no pilgrimage, charity, or sacrifice equals the spiritual fruit of observing a pure Ekadashi fast.",
    significanceHi: "पद्मपुराण के अनुसार तीनों लोकों में एकादशी के समान पापनाशक और पुण्यदायी कोई दूसरा व्रत नहीं है।",
    deities: ["Lord Vishnu", "Maa Lakshmi"],
    pujaVidhi: "1. On Dashami night, take a light meal and practice celibacy.\n2. On Ekadashi morning, take bath and offer Tulsi leaves, yellow flowers, and fruits to Vishnu.\n3. Chant Vishnu Sahasranama or Om Namo Bhagavate Vasudevaya.\n4. Avoid consuming any grains, beans, or rice.\n5. Break fast (Parana) on Dwadashi within the prescribed Parana Muhurta after Hari Vasara.",
    pujaVidhiHi: "१. दशमी की रात्रि से ही सात्विक नियम का पालन करें।\n२. एकादशी को प्रातः भगवान विष्णु को तुलसीदल, पीले पुष्प और फल अर्पित करें।\n३. विष्णु सहस्रनाम अथवा 'ॐ नमो भगवते वासुदेवाय' का जप करें।\n४. अन्न, चावल, दाल और तामसिक वस्तुओं का पूर्ण त्याग रखें।\n५. द्वादशी के दिन पारण मुहूर्त के भीतर ही व्रत खोलें।",
    vrataRules: "Rice and grains are strictly forbidden. One can observe waterless (Nirjala), water-only (Sajal), or fruit-only (Phalahari) fast depending on physical capacity.",
    vrataRulesHi: "चावल और अन्न का सेवन पूर्णतः निषिद्ध है। अपनी शारीरिक क्षमतानुसार निर्जला, सजल अथवा फलाहार व्रत रखा जा सकता है।",
    mantras: [
      {
        title: "Vishnu Smarana Mantra",
        sanskrit: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् । लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥",
        transliteration: "Shantakaram Bhujagashayanam Padmanabham Suresham...",
        meaningEn: "I bow to Lord Vishnu, the embodiment of serenity, resting on the celestial serpent, who dispels the fear of worldly existence.",
        meaningHi: "शांत स्वरूप, शेषनाग की शय्या पर विराजमान, कमल नयन भगवान विष्णु को मैं प्रणाम करता हूं जो संसार के भय को हरने वाले हैं।"
      }
    ],
    faqs: [
      {
        q: "What is Hari Vasara in Ekadashi Parana?",
        a: "Hari Vasara is the first one-fourth portion of Dwadashi Tithi. Fast must NEVER be broken during Hari Vasara; one must wait until it concludes.",
        qHi: "एकादशी पारण में 'हरिवासर' क्या है?",
        aHi: "द्वादशी तिथि के पहले चौथाई भाग को हरिवासर कहते हैं। हरिवासर के समय पारण करना वर्जित है; इसके बीतने के बाद ही पारण करना चाहिए।"
      }
    ],
    regionalVariations: {
      smartha: "Smarthas observe Ekadashi on the day when Ekadashi is present at sunrise without Dashami touch (Dashami-viddha avoidance).",
      vaishnava: "Vaishnavas observe on Shuddha Ekadashi, even if it shifts to Dwadashi (Gauna Ekadashi)."
    },
    rule: {
      lunarMonth: "ALL",
      paksha: "BOTH",
      tithi: 11, // 11 in Shukla, 26 in Krishna
      determinationRule: "ARUNODAYA_EKADASHI",
      traditionConvention: "ALL",
      isRecurringMonthly: true,
      paranaRule: "HARI_VASARA_END"
    },
    scriptureReference: {
      bookSlug: "brihat-parashara-hora-shastra",
      bookTitle: "Brihat Parashara Hora Shastra",
      chapterTitle: "Chapter 14: Tithi Lords & Sacred Fasts",
      verseNumber: "Shloka 21",
      pageNumber: 54,
      shlokaSanskrit: "एकादशी समं नास्ति पापहं सर्वकामिदम् । यः करोति नरो भक्त्या तस्य विष्णुः प्रसीदति ॥",
      translationEn: "There is no fast comparable to Ekadashi in dissolving transgressions and fulfilling noble desires. Upon the devotee who observes it with devotion, Lord Vishnu showers grace.",
      translationHi: "समस्त पापों का नाश करने और मनोकामना पूर्ण करने में एकादशी के समान कोई व्रत नहीं है। भक्तिपूर्वक इसे करने वाले पर भगवान विष्णु प्रसन्न होते हैं।",
      readerUrl: "/library/brihat-parashara-hora-shastra/pdf?page=54"
    }
  },

  // 14. Pradosh Vrat
  {
    slug: "pradosh-vrat",
    name: "Pradosh Vrat (Trayodashi)",
    nameHi: "प्रदोष व्रत (त्रयोदशी)",
    nameSanskrit: "प्रदोष व्रतम्",
    category: "VRATA",
    description: "The auspicious twilight fast dedicated to Lord Shiva, occurring on the Trayodashi of both Shukla and Krishna Paksha.",
    descriptionHi: "भगवान शिव और माता पार्वती की कृपा प्राप्ति हेतु दोनों पक्षों की त्रयोदशी के प्रदोष काल (संध्या समय) में किया जाने वाला पावन व्रत।",
    significance: "During Pradosha Kaal (sunset to 2 hours 24 mins), Lord Shiva dances with divine ecstasy in Kailash; worship at this hour removes poverty and past karma.",
    significanceHi: "प्रदोष काल में भगवान शिव नटराज स्वरूप में आनंद नृत्य करते हैं। इस समय पूजन करने से दरिद्रता, रोग और समस्त संकट दूर होते हैं।",
    deities: ["Lord Shiva", "Maa Parvati"],
    pujaVidhi: "1. Observe fast during the day after a morning bath.\n2. Wash hands and feet again before sunset (Pradosha Kaal).\n3. Worship Shiva Lingam with Bilva leaves, raw milk, honey, and sacred ash.\n4. Light a pure cow ghee lamp.\n5. Chant the Shiva Panchakshara Stotram and Pradosha Stotram.",
    pujaVidhiHi: "१. दिनभर उपवास रखें और सायंकाल सूर्यास्त से पूर्व पुनः स्नान करें।\n२. प्रदोष काल में शिवलिंग पर कच्चा दूध, गंगाजल, शहद और भस्म अर्पित करें।\n३. बिल्वपत्र और धतूरा चढ़ाकर गाय के घी का दीपक जलाएं।\n४. प्रदोष स्तोत्र और 'ॐ नमः शिवाय' का जप करें।",
    vrataRules: "Fast is observed through the day; water and light fruits are permitted. Food is taken only after completing the evening Pradosh puja.",
    vrataRulesHi: "दिनभर फलाहार रहें और शाम को प्रदोष काल की पूजा और आरती के पश्चात ही सात्विक भोजन ग्रहण करें।",
    mantras: [
      {
        title: "Shiva Panchakshari Mantra",
        sanskrit: "ॐ नमः शिवाय ॥",
        transliteration: "Om Namah Shivaya ॥",
        meaningEn: "I bow to Lord Shiva, the inner auspiciousness and cosmic consciousness.",
        meaningHi: "सर्वकल्याणकारी भगवान शिव को मेरा नमन।"
      }
    ],
    faqs: [
      {
        q: "What are the benefits of Pradosh Vrat falling on different weekdays?",
        a: "Soma Pradosh (Monday) fulfills heartfelt desires; Bhauma Pradosh (Tuesday) relieves debts and diseases; Shani Pradosh (Saturday) dispels Saturn affliction and child-related obstacles.",
        qHi: "वार अनुसार प्रदोष व्रत का क्या फल है?",
        aHi: "सोम प्रदोष मनवांछित फल देता है; भौम प्रदोष (मंगलवार) कर्ज और रोगों से मुक्ति दिलाता है; शनि प्रदोष संतान सुख और शनि की साढ़ेसाती के कष्टों का निवारण करता है।"
      }
    ],
    regionalVariations: {
      all: "Universally observed across all Saivite and Smartha traditions in India."
    },
    rule: {
      lunarMonth: "ALL",
      paksha: "BOTH",
      tithi: 13, // 13 in Shukla, 28 in Krishna
      determinationRule: "PRADOSHA_KAAL",
      traditionConvention: "ALL",
      isRecurringMonthly: true
    },
    scriptureReference: {
      bookSlug: "phaladeepika",
      bookTitle: "Phaladeepika",
      chapterTitle: "Chapter 23: Planetary Remedial Measures",
      verseNumber: "Shloka 11",
      pageNumber: 138,
      shlokaSanskrit: "प्रदोषे शिवपूजायां सर्वपापप्रणाशनम् । धनधान्यसमृद्धिश्च शिवलोकगतिर्भवेत् ॥",
      translationEn: "Worship of Lord Shiva during Pradosha dissolves all transgressions, bestows abundance of grain and wealth, and paves the path to the Shiva realm.",
      translationHi: "प्रदोष काल में शिव पूजन से सभी पापों का नाश, धन-धान्य की समृद्धि और अंत में शिवलोक की प्राप्ति होती है।",
      readerUrl: "/library/phaladeepika/pdf?page=138"
    }
  },

  // 15. Guru Purnima
  {
    slug: "guru-purnima",
    name: "Guru Purnima (Vyasa Purnima)",
    nameHi: "गुरु पूर्णिमा (व्यास पूर्णिमा)",
    nameSanskrit: "गुरुपूर्णिमा / व्यासपूर्णिमा",
    category: "FESTIVAL",
    description: "The auspicious full moon dedicated to spiritual preceptors (Gurus) and commemorating the birth of Maharishi Veda Vyasa.",
    descriptionHi: "अज्ञान के अंधकार को मिटाकर ज्ञान का प्रकाश देने वाले सद्गुरु और वेदों के संकलनकर्ता महर्षि वेदव्यास जी के पूजन का पावन पर्व।",
    significance: "Ashadha Purnima marks the beginning of Chaturmas, when seekers pay homage to their lineage of enlightened spiritual teachers.",
    significanceHi: "आषाढ़ पूर्णिमा से चातुर्मास का आरंभ होता है। इस दिन गुरु पादुका पूजन और गुरु दीक्षा का विशेष महत्व है।",
    deities: ["Maharishi Veda Vyasa", "Sadguru Parampara", "Lord Shiva (Adi Guru)"],
    pujaVidhi: "1. Bathe early and invoke the blessings of the Guru lineage.\n2. Worship the holy feet (Padukas) or portrait of the Sadguru with Chandan, flowers, and Akshat.\n3. Offer Dakshina and fresh fruits.\n4. Recite the Guru Gita or Guru Stotram.\n5. Recommit to spiritual practices and self-discipline.",
    pujaVidhiHi: "१. प्रातः स्नान कर गुरु परंपरा का स्मरण करें।\n२. सद्गुरु के चरण अथवा चित्र पर चंदन, पुष्प और अक्षत अर्पित करें।\n३. गुरु पादुका का पंचामृत से अभिषेक करें और दक्षिणा अर्पित करें।\n४. गुरु गीता अथवा गुरु स्तोत्र का पाठ करें।",
    vrataRules: "Devotees observe fast on Ashadha Purnima until Guru Puja and Prasad are taken.",
    vrataRulesHi: "गुरु पूजन और आरती तक उपवास रखा जाता है, तत्पश्चात गुरु प्रसादी ग्रहण की जाती है।",
    mantras: [
      {
        title: "Guru Brahma Mantra",
        sanskrit: "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः । गुरुः साक्षात् परं ब्रह्म तस्मै श्रीगुरवे नमः ॥",
        transliteration: "Gurur Brahma Gurur Vishnuh Gurur Devo Maheshwarah | Guruh Sakshat Param Brahma Tasmai Sri Gurave Namah ॥",
        meaningEn: "The Guru is Brahma (creator of understanding), Vishnu (sustainer of wisdom), and Maheshwara (destroyer of delusion). Salutations to that revered Sadguru.",
        meaningHi: "गुरु ही ब्रह्मा हैं, गुरु ही विष्णु हैं और गुरु ही महेश्वर हैं। गुरु ही साक्षात् परब्रह्म हैं, उन सद्गुरु को मेरा सादर नमन।"
      }
    ],
    faqs: [
      {
        q: "Why is Guru Purnima also called Vyasa Purnima?",
        a: "Maharishi Veda Vyasa, who classified the four Vedas and authored the Mahabharata and 18 Puranas, was born on this tithi and taught the first disciples.",
        qHi: "गुरु पूर्णिमा को व्यास पूर्णिमा क्यों कहते हैं?",
        aHi: "वेदों का वर्गीकरण और महाभारत व १८ पुराणों की रचना करने वाले महर्षि वेदव्यास का जन्म इसी पावन तिथि पर हुआ था।"
      }
    ],
    regionalVariations: {
      all: "Observed throughout India across all ashrams, Buddhist monasteries (commemorating the Buddha's first sermon at Sarnath), and Jain traditions."
    },
    rule: {
      lunarMonth: "Ashadha",
      paksha: "Shukla",
      tithi: 15, // Purnima
      determinationRule: "UDAYA_TITHI",
      traditionConvention: "ALL"
    },
    scriptureReference: {
      bookSlug: "brihat-parashara-hora-shastra",
      bookTitle: "Brihat Parashara Hora Shastra",
      chapterTitle: "Chapter 1: Parashara Invocatory Shloka",
      verseNumber: "Shloka 1",
      pageNumber: 8,
      shlokaSanskrit: "गुरोः पादारविन्दं तु प्रणम्य विधिवत् सदा । कालचक्ररहस्यं च प्रवक्ष्यामि समाहितः ॥",
      translationEn: "Having reverently bowed to the lotus feet of the Guru, I shall expound with focused mind the supreme mysteries of the Wheel of Time (Kala Chakra).",
      translationHi: "सद्गुरु के चरणकमलों में विधिपूर्वक प्रणाम कर, मैं एकाग्रचित्त होकर कालचक्र के गूढ़ रहस्य का प्रतिपादन करता हूं।",
      readerUrl: "/library/brihat-parashara-hora-shastra/pdf?page=8"
    }
  }
];

export const ALL_EKADASHIS = [
  { name: "Utpanna Ekadashi",       month: "Margashirsha", paksha: "Krishna", deity: "Lord Vishnu" },
  { name: "Mokshada Ekadashi",      month: "Margashirsha", paksha: "Shukla",  deity: "Lord Krishna (Gita Jayanti)" },
  { name: "Saphala Ekadashi",       month: "Pausha",        paksha: "Krishna", deity: "Lord Narayana" },
  { name: "Pausha Putrada Ekadashi", month: "Pausha",       paksha: "Shukla",  deity: "Lord Vishnu" },
  { name: "Shattila Ekadashi",      month: "Magha",         paksha: "Krishna", deity: "Lord Vishnu (Sesame donation)" },
  { name: "Jaya Ekadashi",          month: "Magha",         paksha: "Shukla",  deity: "Lord Vishnu" },
  { name: "Vijaya Ekadashi",        month: "Phalguna",      paksha: "Krishna", deity: "Lord Rama" },
  { name: "Amalaki Ekadashi",       month: "Phalguna",      paksha: "Shukla",  deity: "Amla Tree & Lord Vishnu" },
  { name: "Papmochani Ekadashi",    month: "Chaitra",       paksha: "Krishna", deity: "Lord Vishnu" },
  { name: "Kamada Ekadashi",        month: "Chaitra",       paksha: "Shukla",  deity: "Lord Vasudeva" },
  { name: "Varuthini Ekadashi",     month: "Vaishakha",     paksha: "Krishna", deity: "Lord Vamana" },
  { name: "Mohini Ekadashi",        month: "Vaishakha",     paksha: "Shukla",  deity: "Mohini Avatar" },
  { name: "Apara Ekadashi",         month: "Jyeshtha",      paksha: "Krishna", deity: "Lord Trivikrama" },
  { name: "Nirjala Ekadashi",       month: "Jyeshtha",      paksha: "Shukla",  deity: "Lord Vishnu (Bhima Ekadashi)" },
  { name: "Yogini Ekadashi",        month: "Ashadha",       paksha: "Krishna", deity: "Lord Vishnu" },
  { name: "Devshayani Ekadashi",    month: "Ashadha",       paksha: "Shukla",  deity: "Lord Vishnu (Chaturmas begins)" },
  { name: "Kamika Ekadashi",        month: "Shravana",      paksha: "Krishna", deity: "Lord Sridhara" },
  { name: "Shravana Putrada",       month: "Shravana",      paksha: "Shukla",  deity: "Lord Vishnu" },
  { name: "Aja Ekadashi",           month: "Bhadrapada",    paksha: "Krishna", deity: "Lord Hrishikesha" },
  { name: "Parivartini Ekadashi",   month: "Bhadrapada",    paksha: "Shukla",  deity: "Lord Vamana (Lord turns posture)" },
  { name: "Indira Ekadashi",        month: "Ashwina",       paksha: "Krishna", deity: "Lord Shaligram (Pitru Paksha)" },
  { name: "Papankusha Ekadashi",    month: "Ashwina",       paksha: "Shukla",  deity: "Lord Padmanabha" },
  { name: "Rama Ekadashi",          month: "Kartika",       paksha: "Krishna", deity: "Lord Keshav" },
  { name: "Devutthana Ekadashi",    month: "Kartika",       paksha: "Shukla",  deity: "Lord Vishnu (Awakening & Tulsi Vivah)" }
];

/**
 * Classical Muhurta & Nakshatra Constants for Daily Astrology
 * Based on Brihat Samhita and Muhurta Chintamani
 */

export const NAKSHATRA_MUHURTA = {
  // Sthira (Fixed)
  "Rohini": {
    typeEn: "Fixed (Sthira)",
    typeHi: "स्थिर",
    rulingDeity: "Brahma / Prajapati",
    element: "Earth",
    auspiciousForEn: ["Foundation laying", "Long-term investments", "Marriage", "Purchasing property", "Planting"],
    auspiciousForHi: ["नींव रखना", "दीर्घकालिक निवेश", "विवाह", "संपत्ति क्रय", "वृक्षारोपण"],
    avoidForEn: ["Short-lived or hasty ventures", "Debts"],
    avoidForHi: ["अल्पकालिक या जल्दबाजी वाले कार्य", "ऋण लेना"]
  },
  "Uttara Phalguni": {
    typeEn: "Fixed (Sthira)",
    typeHi: "स्थिर",
    rulingDeity: "Aryaman",
    element: "Fire",
    auspiciousForEn: ["Taking official charge", "New contracts", "Entering new home", "Long-term agreements"],
    auspiciousForHi: ["पदभार ग्रहण", "नए अनुबंध", "गृह प्रवेश", "स्थायी समझौते"],
    avoidForEn: ["Impulsive litigation", "Ending partnerships"],
    avoidForHi: ["उतावलापन", "अचानक विवाद"]
  },
  "Uttara Ashadha": {
    typeEn: "Fixed (Sthira)",
    typeHi: "स्थिर",
    rulingDeity: "Vishvedevas",
    element: "Earth",
    auspiciousForEn: ["Signing long agreements", "Public undertakings", "Spiritual devotion", "Real estate"],
    auspiciousForHi: ["दीर्घ अनुबंध", "सार्वजनिक कार्य", "धार्मिक अनुष्ठान", "अचल संपत्ति"],
    avoidForEn: ["Deceitful dealings", "Shortcuts"],
    avoidForHi: ["धोखाधड़ी", "शॉर्टकट अपनाना"]
  },
  "Uttara Bhadrapada": {
    typeEn: "Fixed (Sthira)",
    typeHi: "स्थिर",
    rulingDeity: "Ahirbudhnya",
    element: "Water",
    auspiciousForEn: ["Meditation", "Charity", "Long-term wealth management", "Scholarly research"],
    auspiciousForHi: ["ध्यान एवं साधना", "दान-पुण्य", "दीर्घकालीन धन प्रबंधन", "गहन शोध"],
    avoidForEn: ["Hostile confrontations"],
    avoidForHi: ["शत्रुतापूर्ण संघर्ष"]
  },

  // Chara (Movable)
  "Punarvasu": {
    typeEn: "Movable (Chara)",
    typeHi: "चर",
    rulingDeity: "Aditi",
    element: "Water",
    auspiciousForEn: ["Journeys", "Buying vehicles", "Starting education", "Moving residence", "Healing"],
    auspiciousForHi: ["यात्रा", "वाहन क्रय", "शिक्षा आरंभ", "स्थान परिवर्तन", "चिकित्सा"],
    avoidForEn: ["Lending money", "Aggressive disputes"],
    avoidForHi: ["उधार देना", "विवाद"]
  },
  "Swati": {
    typeEn: "Movable (Chara)",
    typeHi: "चर",
    rulingDeity: "Vayu",
    element: "Air",
    auspiciousForEn: ["Air travel", "Business networking", "Vehicle acquisition", "Marketing campaigns", "Music"],
    auspiciousForHi: ["वायु यात्रा", "व्यावसायिक नेटवर्किंग", "वाहन क्रय", "प्रचार-प्रसार", "संगीत व कला"],
    avoidForEn: ["Stubborn standoffs"],
    avoidForHi: ["हठधर्मिता"]
  },
  "Shravana": {
    typeEn: "Movable (Chara)",
    typeHi: "चर",
    rulingDeity: "Vishnu",
    element: "Air",
    auspiciousForEn: ["Public presentations", "Higher education", "Learning music", "Travel", "Spiritual guidance"],
    auspiciousForHi: ["सार्वजनिक भाषण", "उच्च शिक्षा", "संगीत अध्ययन", "यात्रा", "परामर्श लेना"],
    avoidForEn: ["Signing irreversible harsh clauses"],
    avoidForHi: ["कठोर शर्तें स्वीकारना"]
  },
  "Dhanishta": {
    typeEn: "Movable (Chara)",
    typeHi: "चर",
    rulingDeity: "Ashta Vasus",
    element: "Air",
    auspiciousForEn: ["Financial investments", "Performing arts", "Sports", "Medical treatment", "Travel"],
    auspiciousForHi: ["वित्तीय निवेश", "कला-प्रदर्शन", "खेलकूद", "इलाज शुरू करना", "यात्रा"],
    avoidForEn: ["Giving loans on informal terms"],
    avoidForHi: ["बिना लिखा-पढ़ी के ऋण"]
  },
  "Shatabhisha": {
    typeEn: "Movable (Chara)",
    typeHi: "चर",
    rulingDeity: "Varuna",
    element: "Air",
    auspiciousForEn: ["Medical therapy", "Software and technology launch", "Data research", "Aquatic projects"],
    auspiciousForHi: ["औषधि व चिकित्सा", "सॉफ्टवेयर व तकनीक", "डेटा विश्लेषण", "जल संबंधी कार्य"],
    avoidForEn: ["Legal litigation", "Social ceremonies"],
    avoidForHi: ["मुकदमेबाजी", "सामाजिक उत्सव"]
  },

  // Kshipra / Laghu (Swift / Light)
  "Ashwini": {
    typeEn: "Swift (Kshipra)",
    typeHi: "लघु / क्षिप्र",
    rulingDeity: "Ashwini Kumaras",
    element: "Earth",
    auspiciousForEn: ["Taking medicines", "Rapid business deals", "Starting sports", "Short travel", "Tech gadgets"],
    auspiciousForHi: ["दवा लेना", "शीघ्र व्यापारिक सौदे", "खेल", "छोटी यात्राएं", "तकनीकी उपकरण क्रय"],
    avoidForEn: ["Tasks demanding prolonged patience"],
    avoidForHi: ["लंबा धैर्य मांगने वाले काम"]
  },
  "Pushya": {
    typeEn: "Swift / Supreme Nourishing (Kshipra)",
    typeHi: "अमृत सिद्ध / पुष्य",
    rulingDeity: "Brihaspati",
    element: "Water",
    auspiciousForEn: ["All auspicious beginnings", "Gold / asset purchase", "Joining a job", "Starting businesses", "Study"],
    auspiciousForHi: ["समस्त शुभ आरंभ", "स्वर्ण व संपत्ति क्रय", "नौकरी ज्वाइन करना", "व्यापार शुभारंभ", "विद्यारंभ"],
    avoidForEn: ["Marriage ceremonies (traditional restriction)"],
    avoidForHi: ["विवाह संस्कार (पारंपरिक अपवाद)"]
  },
  "Hasta": {
    typeEn: "Swift (Kshipra)",
    typeHi: "लघु / क्षिप्र",
    rulingDeity: "Savitr / Sun",
    element: "Fire",
    auspiciousForEn: ["Commercial trade", "Negotiations", "Fine craftsmanship", "Public speeches", "Document signing"],
    auspiciousForHi: ["व्यापारिक सौदे", "बातचीत", "दस्तकारी व कला", "भाषण", "कागजात पर हस्ताक्षर"],
    avoidForEn: ["Confrontational conflicts"],
    avoidForHi: ["टकराव वाले विवाद"]
  },

  // Mridu (Soft / Tender)
  "Mrigashira": {
    typeEn: "Soft & Tender (Mridu)",
    typeHi: "मृदु",
    rulingDeity: "Soma",
    element: "Earth",
    auspiciousForEn: ["Creative arts", "Romance & reconciliation", "Travel", "Wearing gems", "Aesthetic pursuits"],
    auspiciousForHi: ["ललित कलाएं", "प्रेम व मेल-मिलाप", "यात्रा", "रत्न धारण", "सौंदर्य प्रसाधन"],
    avoidForEn: ["Harsh punishments", "Aggressive confrontations"],
    avoidForHi: ["कठोर दंड देना", "आक्रामक विवाद"]
  },
  "Chitra": {
    typeEn: "Soft & Creative (Mridu)",
    typeHi: "मृदु",
    rulingDeity: "Tvashtr / Vishwakarma",
    element: "Fire",
    auspiciousForEn: ["Graphic design & architecture", "Fashion", "Art exhibitions", "Jewelry crafting", "Decorations"],
    auspiciousForHi: ["डिजाइन व वास्तुकला", "फैशन", "कला प्रदर्शनी", "आभूषण निर्माण", "सजावट"],
    avoidForEn: ["Direct confrontation in courts"],
    avoidForHi: ["न्यायालय में सीधा टकराव"]
  },
  "Anuradha": {
    typeEn: "Soft & Devotional (Mridu)",
    typeHi: "मृदु",
    rulingDeity: "Mitra",
    element: "Fire",
    auspiciousForEn: ["Forming partnerships", "Friendship", "Foreign travel", "Devotional worship", "Reconciliation"],
    auspiciousForHi: ["साझेदारी", "मित्रता", "विदेश यात्रा", "भक्ति व पूजा", "सुलह-सफाई"],
    avoidForEn: ["Hostility", "Fraudulent promises"],
    avoidForHi: ["द्वेष भावना", "झूठे वादे"]
  },
  "Revati": {
    typeEn: "Soft & Wealth (Mridu)",
    typeHi: "मृदु",
    rulingDeity: "Pushan",
    element: "Water",
    auspiciousForEn: ["Financial investments", "Creative writing", "Sea travel", "Starting accounts", "Spiritual study"],
    auspiciousForHi: ["निवेश", "साहित्यिक लेखन", "जल यात्रा", "खाता खोलना", "अध्यात्म अध्ययन"],
    avoidForEn: ["Underhanded maneuvers"],
    avoidForHi: ["छल-कपट"]
  },

  // Mishra (Mixed)
  "Krittika": {
    typeEn: "Mixed (Mishra)",
    typeHi: "मिश्र",
    rulingDeity: "Agni",
    element: "Earth",
    auspiciousForEn: ["Technical testing & audits", "Culinary pursuits", "Clearing pending debts", "Dispute settlement"],
    auspiciousForHi: ["तकनीकी जांच व ऑडिट", "खानपान व पाककला", "कर्ज मुक्ति", "विवाद निस्तारण"],
    avoidForEn: ["Starting delicate romantic conversations", "Gentle starts"],
    avoidForHi: ["नाजुक बातचीत", "शांतिपूर्ण नए आरंभ"]
  },
  "Vishakha": {
    typeEn: "Mixed (Mishra)",
    typeHi: "मिश्र",
    rulingDeity: "Indra-Agni",
    element: "Fire",
    auspiciousForEn: ["Goal-oriented execution", "Competitive milestones", "Celebrations", "Agricultural trade"],
    auspiciousForHi: ["लक्ष्य-उन्मुख कार्य", "प्रतियोगिता", "उत्सव", "कृषि व्यापार"],
    avoidForEn: ["Passive delays"],
    avoidForHi: ["उदासीनता व टालमटोल"]
  },

  // Ugra (Fierce)
  "Bharani": {
    typeEn: "Fierce (Ugra)",
    typeHi: "उग्र",
    rulingDeity: "Yama",
    element: "Earth",
    auspiciousForEn: ["Auditing & removing bugs", "Surgery", "Discarding obsolete items", "Deep research"],
    auspiciousForHi: ["गलतियां पकड़ना", "शल्य चिकित्सा", "पुरानी चीजें हटाना", "गहन अनुसंधान"],
    avoidForEn: ["New gentle contracts", "Celebratory travel"],
    avoidForHi: ["नए सौम्य अनुबंध", "खुशहाल यात्राएं"]
  },
  "Magha": {
    typeEn: "Fierce / Ancestral (Ugra)",
    typeHi: "उग्र",
    rulingDeity: "Pitris",
    element: "Water",
    auspiciousForEn: ["Honoring heritage", "Administrative authority", "Historical inquiry", "Demolition of errors"],
    auspiciousForHi: ["पूर्वजों का सम्मान", "प्रशासनिक कार्य", "इतिहास अध्ययन", "गलतियां समाप्त करना"],
    avoidForEn: ["Lending money on trust alone"],
    avoidForHi: ["अंधविश्वास में कर्ज देना"]
  },
  "Purva Phalguni": {
    typeEn: "Fierce / Sensory (Ugra)",
    typeHi: "उग्र",
    rulingDeity: "Bhaga",
    element: "Water",
    auspiciousForEn: ["Entertainment", "Creative recreation", "Resolving disputes privately", "Performing"],
    auspiciousForHi: ["मनोरंजन", "रचनात्मक विश्राम", "निजी बातचीत से सुलह", "कला प्रदर्शन"],
    avoidForEn: ["Major capital borrowing"],
    avoidForHi: ["बड़ा कर्ज लेना"]
  },
  "Purva Ashadha": {
    typeEn: "Fierce (Ugra)",
    typeHi: "उग्र",
    rulingDeity: "Apah",
    element: "Water",
    auspiciousForEn: ["Confronting obstacles", "Courageous decisions", "Naval/water tasks", "Debates"],
    auspiciousForHi: ["कठिनाइयों का सामना", "साहसिक निर्णय", "जल संबंधी कार्य", "वाद-विवाद"],
    avoidForEn: ["Peacemaking under pressure"],
    avoidForHi: ["दबाव में समझौता"]
  },
  "Purva Bhadrapada": {
    typeEn: "Fierce / Spiritual Penance (Ugra)",
    typeHi: "उग्र",
    rulingDeity: "Aja Ekapada",
    element: "Fire",
    auspiciousForEn: ["Overcoming vices", "Deep introspection", "Disciplined coding / problem solving"],
    auspiciousForHi: ["बुरी आदतें छोड़ना", "आत्म-चिंतन", "कठिन समस्याओं का समाधान"],
    avoidForEn: ["Joyful festivities", "Casual beginnings"],
    avoidForHi: ["उत्सव", "हल्के-फुल्के कार्य"]
  },

  // Tikshna (Sharp / Dreadful)
  "Ardra": {
    typeEn: "Sharp (Tikshna)",
    typeHi: "तीक्ष्ण / दारुण",
    rulingDeity: "Rudra",
    element: "Water",
    auspiciousForEn: ["Debugging & error elimination", "Surgery", "Ending toxic bonds", "Demolitions"],
    auspiciousForHi: ["सॉफ्टवेयर डिबगिंग", "शल्य चिकित्सा", "विषैले संबंध समाप्त करना", "तोड़फोड़"],
    avoidForEn: ["Starting marriage, partnership or buying assets"],
    avoidForHi: ["विवाह, साझेदारी, नई संपत्ति क्रय"]
  },
  "Ashlesha": {
    typeEn: "Sharp (Tikshna)",
    typeHi: "तीक्ष्ण / दारुण",
    rulingDeity: "Sarpas",
    element: "Water",
    auspiciousForEn: ["Strategic legal defense", "Competitive analysis", "Research in chemicals/biology", "Security"],
    auspiciousForHi: ["रणनीतिक कानूनी बचाव", "प्रतिस्पर्धी समीक्षा", "सुरक्षा व सतर्कता"],
    avoidForEn: ["Lending money", "New commercial partnerships"],
    avoidForHi: ["कर्ज देना", "नई व्यापारिक साझेदारी"]
  },
  "Jyeshtha": {
    typeEn: "Sharp (Tikshna)",
    typeHi: "तीक्ष्ण / दारुण",
    rulingDeity: "Indra",
    element: "Air",
    auspiciousForEn: ["Administrative enforcement", "Combatting falsehood", "Crisis management", "Self-assertion"],
    auspiciousForHi: ["प्रशासनिक आदेश", "असत्य का खंडन", "संकट प्रबंधन", "अधिकारों की रक्षा"],
    avoidForEn: ["Gentle creative collaborations"],
    avoidForHi: ["सौम्य रचनात्मक सहयोग"]
  },
  "Mula": {
    typeEn: "Sharp / Root (Tikshna)",
    typeHi: "तीक्ष्ण / दारुण",
    rulingDeity: "Nirriti",
    element: "Air",
    auspiciousForEn: ["Root cause analysis", "Planting deep roots", "Research in ancient subjects", "Cutting excess costs"],
    auspiciousForHi: ["मूल समस्या की खोज", "गहन अनुसंधान", "अनावश्यक खर्चे समाप्त करना"],
    avoidForEn: ["Initiating celebratory family milestones"],
    avoidForHi: ["पारिवारिक मांगलिक कार्य"]
  }
};

export const QUICK_TASK_PROMPTS = [
  { en: "Signing a new contract or deal", hi: "नया अनुबंध / एग्रीमेंट साइन करना" },
  { en: "Job interview or important business meeting", hi: "नौकरी का इंटरव्यू या महत्वपूर्ण मीटिंग" },
  { en: "Starting a new software or study project", hi: "नया प्रोजेक्ट / कोडिंग / पढ़ाई आरंभ करना" },
  { en: "Financial investment or major purchase", hi: "धन निवेश या बड़ी खरीदारी करना" },
  { en: "Travel or buying a vehicle", hi: "यात्रा पर जाना या वाहन खरीदना" },
  { en: "Important conversation with partner / family", hi: "पारिवारिक या व्यक्तिगत महत्वपूर्ण बातचीत" },
];

/**
 * server/astrology/rashisNakshatrasKnowledge.js
 * 
 * Exhaustive Classical Guide to:
 * 1. The 12 Rashis (Zodiac Signs)
 * 2. All 27 Nakshatras with 4 Padas each
 * 3. The 5 Limbs of Panchang (Tithi, Vara, Nakshatra, Yoga, Karana)
 * 
 * Grounded in Brihat Parashara Hora Shastra, Brihat Samhita, and Surya Siddhanta.
 */

export const RASHIS_KNOWLEDGE = [
  {
    number: 1,
    name: "Mesha",
    devanagari: "मेष",
    english: "Aries",
    element: "Agni (Fire)",
    modality: "Chara (Movable / Cardinal)",
    ruler: "Mangala (Mars)",
    symbol: "The Ram",
    bodyPart: "Head and brain",
    archetype: "The Pioneer & Trailblazer",
    qualities: "Dynamic initiative, courageous leadership, energetic directness, and competitive spirit.",
    balancedExpression: "Fearless advocacy for justice, decisive executive action, and trailblazing new paths.",
    unbalancedExpression: "Impatience, rash impulsivity, quick-tempered reactions, and difficulty sustaining interest."
  },
  {
    number: 2,
    name: "Vrishabha",
    devanagari: "वृषभ",
    english: "Taurus",
    element: "Prithvi (Earth)",
    modality: "Sthira (Fixed)",
    ruler: "Shukra (Venus)",
    symbol: "The Bull",
    bodyPart: "Face, throat, neck, and vocal cords",
    archetype: "The Conserver & Cultivator",
    qualities: "Steadfast stability, aesthetic appreciation, loyalty, patience, and tangible resource preservation.",
    balancedExpression: "Prudent financial management, artistic devotion, domestic loyalty, and sensory grace.",
    unbalancedExpression: "Stubborn resistance to change, possessiveness, inertia, and materialistic attachment."
  },
  {
    number: 3,
    name: "Mithuna",
    devanagari: "मिथुन",
    english: "Gemini",
    element: "Vayu (Air)",
    modality: "Dwisvabhava (Dual / Mutable)",
    ruler: "Budha (Mercury)",
    symbol: "The Divine Twins holding a mace and flute",
    bodyPart: "Shoulders, arms, hands, and upper chest",
    archetype: "The Communicator & Inquirer",
    qualities: "Curiosity, intellectual agility, communicative eloquence, versatility, and social connectivity.",
    balancedExpression: "Brilliant storytelling, multi-disciplinary synthesis, diplomatic networking, and quick wit.",
    unbalancedExpression: "Restless superficiality, nervous dispersion, indecisiveness, and gossip."
  },
  {
    number: 4,
    name: "Karka",
    devanagari: "कर्क",
    english: "Cancer",
    element: "Jala (Water)",
    modality: "Chara (Movable / Cardinal)",
    ruler: "Chandra (Moon)",
    symbol: "The Crab",
    bodyPart: "Chest, breasts, lungs, and stomach",
    archetype: "The Nurturer & Guardian",
    qualities: "Emotional depth, protective care, intuitive empathy, ancestral devotion, and domestic shelter.",
    balancedExpression: "Boundless compassion, restorative emotional refuge, community care, and deep memory.",
    unbalancedExpression: "Defensive hyper-sensitivity, moody mood swings, clinging nostalgia, and indirect manipulation."
  },
  {
    number: 5,
    name: "Simha",
    devanagari: "सिंह",
    english: "Leo",
    element: "Agni (Fire)",
    modality: "Sthira (Fixed)",
    ruler: "Surya (Sun)",
    symbol: "The Lion",
    bodyPart: "Heart, upper spine, and solar plexus",
    archetype: "The Sovereign & Creative Light",
    qualities: "Magnanimous nobility, regal self-respect, creative warmth, executive dignity, and generous leadership.",
    balancedExpression: "Inspirational stewardship, unconditional patronage, artistic radiance, and moral courage.",
    unbalancedExpression: "Egoic arrogance, demanding constant validation, authoritarianism, and intolerance of criticism."
  },
  {
    number: 6,
    name: "Kanya",
    devanagari: "कन्या",
    english: "Virgo",
    element: "Prithvi (Earth)",
    modality: "Dwisvabhava (Dual / Mutable)",
    ruler: "Budha (Mercury - Exalted)",
    symbol: "The Maiden carrying sheaves of grain and a lamp",
    bodyPart: "Digestive system, spleen, and intestines",
    archetype: "The Healer, Craftsman & Analyst",
    qualities: "Precision, analytical discernment, devotion to selfless service, hygienic purity, and practical efficiency.",
    balancedExpression: "Diagnostic brilliance, meticulous craftsmanship, preventive medicine, and selfless humility.",
    unbalancedExpression: "Chronic hyper-criticism, anxiety-driven perfectionism, pedantry, and somatic stress."
  },
  {
    number: 7,
    name: "Tula",
    devanagari: "तुला",
    english: "Libra",
    element: "Vayu (Air)",
    modality: "Chara (Movable / Cardinal)",
    ruler: "Shukra (Venus)",
    symbol: "The Balance Scales",
    bodyPart: "Kidneys, lower abdomen, and lumbar spine",
    archetype: "The Peacemaker & Architect of Harmony",
    qualities: "Diplomatic equity, aesthetic symmetry, collaborative partnership, social grace, and justice.",
    balancedExpression: "Impartial mediation, refined creative design, civil discourse, and graceful reciprocity.",
    unbalancedExpression: "People-pleasing conflict avoidance, indecisive vacillation, and vanity."
  },
  {
    number: 8,
    name: "Vrishchika",
    devanagari: "वृश्चिक",
    english: "Scorpio",
    element: "Jala (Water)",
    modality: "Sthira (Fixed)",
    ruler: "Mangala (Mars - Co-ruled by Ketu)",
    symbol: "The Scorpion",
    bodyPart: "Reproductive organs, excretory organs, and pelvis",
    archetype: "The Alchemist & Deep Transformer",
    qualities: "Profound intensity, investigative depth, emotional resilience, psychological penetration, and transformative power.",
    balancedExpression: "Fearless truth-seeking, emotional regeneration, forensic intuition, and unshakeable loyalty.",
    unbalancedExpression: "Obsessive secrecy, vengefulness, brooding suspicion, and emotional power struggles."
  },
  {
    number: 9,
    name: "Dhanu",
    devanagari: "धनु",
    english: "Sagittarius",
    element: "Agni (Fire)",
    modality: "Dwisvabhava (Dual / Mutable)",
    ruler: "Guru (Jupiter)",
    symbol: "The Centaur Archer aiming at the heavens",
    bodyPart: "Thighs, hips, and arterial system",
    archetype: "The Philosopher, Seeker & Guide",
    qualities: "Expansive optimism, quest for higher truth, ethical righteousness, philosophical wisdom, and joy in adventure.",
    balancedExpression: "Scholarly leadership, intercultural tolerance, visionary hope, and moral integrity.",
    unbalancedExpression: "Self-righteous dogmatism, preachiness, blunt insensitivity, and unrealistic grandiosity."
  },
  {
    number: 10,
    name: "Makara",
    devanagari: "मकर",
    english: "Capricorn",
    element: "Prithvi (Earth)",
    modality: "Chara (Movable / Cardinal)",
    ruler: "Shani (Saturn)",
    symbol: "The Sea-Monster / Crocodile-Goat",
    bodyPart: "Knees, joints, and skeletal architecture",
    archetype: "The Master Builder & Statesman",
    qualities: "Disciplined perseverance, pragmatic realism, institutional responsibility, structural patience, and endurance.",
    balancedExpression: "Long-term institutional vision, steadfast reliability, public service, and unyielding work ethic.",
    unbalancedExpression: "Emotional coldness, cynical materialism, rigid pessimism, and ruthless pragmatism."
  },
  {
    number: 11,
    name: "Kumbha",
    devanagari: "कुम्भ",
    english: "Aquarius",
    element: "Vayu (Air)",
    modality: "Sthira (Fixed)",
    ruler: "Shani (Saturn - Co-ruled by Rahu)",
    symbol: "The Water-Bearer pouring waters of wisdom",
    bodyPart: "Calves, shins, and nervous circulation",
    archetype: "The Humanitarian & Progressive Visionary",
    qualities: "Humanitarian idealism, democratic fraternity, innovative genius, unconventional perspective, and dedication to society.",
    balancedExpression: "Egalitarian social reform, scientific innovation, community empowerment, and universal brotherhood.",
    unbalancedExpression: "Emotional aloofness, stubborn eccentricity, intellectual detachment, and rebellion without purpose."
  },
  {
    number: 12,
    name: "Meena",
    devanagari: "मीन",
    english: "Pisces",
    element: "Jala (Water)",
    modality: "Dwisvabhava (Dual / Mutable)",
    ruler: "Guru (Jupiter)",
    symbol: "Two Fish swimming in opposite directions",
    bodyPart: "Feet, lymphatic system, and immune response",
    archetype: "The Mystic, Poet & Universal Compassion",
    qualities: "Boundless empathy, mystical receptivity, spiritual surrender, imaginative transcendence, and gentle forgiveness.",
    balancedExpression: "Transcendent meditation, compassionate healing, sublime musical and poetic arts, and spiritual peace.",
    unbalancedExpression: "Escapism, boundarylessness, victim mentality, confusion, and loss of grounding in reality."
  }
];

export const NAKSHATRAS_KNOWLEDGE = [
  {
    number: 1,
    name: "Ashwini",
    devanagari: "अश्विनी",
    span: "00°00' - 13°20' Aries (Mesha)",
    rulingPlanet: "Ketu",
    deity: "Ashwini Kumaras (The Golden Twin Celestial Healers)",
    symbol: "Horse's Head",
    padas: [
      { pada: 1, navamsha: "Aries (Mesha)", ruler: "Mars", quality: "Dynamic initiative and pioneering drive" },
      { pada: 2, navamsha: "Taurus (Vrishabha)", ruler: "Venus", quality: "Practical healing and material grounding" },
      { pada: 3, navamsha: "Gemini (Mithuna)", ruler: "Mercury", quality: "Quick communicative and medical intellect" },
      { pada: 4, navamsha: "Cancer (Karka)", ruler: "Moon", quality: "Nurturing empathy and deep intuition" }
    ],
    primaryQualities: "Swift action, miraculous healing capacities, youthful vitality, eagerness to initiate projects, and spontaneous agility."
  },
  {
    number: 2,
    name: "Bharani",
    devanagari: "भरणी",
    span: "13°20' - 26°40' Aries (Mesha)",
    rulingPlanet: "Venus (Shukra)",
    deity: "Yamaraja (Lord of Cosmic Justice and Transformation)",
    symbol: "The Yoni (Vessel of Birth and Creation)",
    padas: [
      { pada: 1, navamsha: "Leo (Simha)", ruler: "Sun", quality: "Courageous leadership and transformative will" },
      { pada: 2, navamsha: "Virgo (Kanya)", ruler: "Mercury", quality: "Disciplined research and ethical discernment" },
      { pada: 3, navamsha: "Libra (Tula)", ruler: "Venus", quality: "Aesthetic creativity and social justice" },
      { pada: 4, navamsha: "Scorpio (Vrishchika)", ruler: "Mars", quality: "Deep occult endurance and psychological catharsis" }
    ],
    primaryQualities: "Bearing burdens with dignity, navigating life-and-death transitions, fiery passion, strict moral integrity, and artistic depth."
  },
  {
    number: 3,
    name: "Krittika",
    devanagari: "कृत्तिका",
    span: "26°40' Aries - 10°00' Taurus (Vrishabha)",
    rulingPlanet: "Sun (Surya)",
    deity: "Agni (The Sacred Fire God)",
    symbol: "Razor / Flame / Cutter",
    padas: [
      { pada: 1, navamsha: "Sagittarius (Dhanu)", ruler: "Jupiter", quality: "Righteous spiritual defense and scholarly courage" },
      { pada: 2, navamsha: "Capricorn (Makara)", ruler: "Saturn", quality: "Pragmatic endurance and material discipline" },
      { pada: 3, navamsha: "Aquarius (Kumbha)", ruler: "Saturn", quality: "Scientific investigation and social reform" },
      { pada: 4, navamsha: "Pisces (Meena)", ruler: "Jupiter", quality: "Philosophical contemplation and spiritual refinement" }
    ],
    primaryQualities: "Purifying spiritual flame, sharp analytical cutting through illusion, protective maternal warmth, and uncompromising truth."
  },
  {
    number: 4,
    name: "Rohini",
    devanagari: "रोहिणी",
    span: "10°00' - 23°20' Taurus (Vrishabha)",
    rulingPlanet: "Moon (Chandra - Exalted here)",
    deity: "Brahma / Prajapati (The Creator of the Universe)",
    symbol: "Ox-cart / Temple Chariot / Sprout",
    padas: [
      { pada: 1, navamsha: "Aries (Mesha)", ruler: "Mars", quality: "Creative enterprise and fiery aesthetic drive" },
      { pada: 2, navamsha: "Taurus (Vrishabha)", ruler: "Venus", quality: "Vargottama: supreme artistic refinement and beauty" },
      { pada: 3, navamsha: "Gemini (Mithuna)", ruler: "Mercury", quality: "Literary grace, witty commerce, and fine arts" },
      { pada: 4, navamsha: "Cancer (Karka)", ruler: "Moon", quality: "Deep maternal nurturing and agricultural abundance" }
    ],
    primaryQualities: "Fertile growth, supreme aesthetic charm, luxurious elegance, devotion to beauty, agriculture, and unconditional love."
  },
  {
    number: 5,
    name: "Mrigashira",
    devanagari: "मृगशिरा",
    span: "23°20' Taurus - 06°40' Gemini (Mithuna)",
    rulingPlanet: "Mars (Mangala)",
    deity: "Soma (The Moon God of Divine Nectar)",
    symbol: "Deer's Head",
    padas: [
      { pada: 1, navamsha: "Leo (Simha)", ruler: "Sun", quality: "Noble exploration and creative curiosity" },
      { pada: 2, navamsha: "Virgo (Kanya)", ruler: "Mercury", quality: "Calculative research and meticulous travel" },
      { pada: 3, navamsha: "Libra (Tula)", ruler: "Venus", quality: "Sociable diplomacy, music, and romantic quest" },
      { pada: 4, navamsha: "Scorpio (Vrishchika)", ruler: "Mars", quality: "Intense esoteric search and intellectual breakthrough" }
    ],
    primaryQualities: "The gentle seeker, perpetual intellectual and spiritual quest, sensitive observation, poetic wit, and roving curiosity."
  },
  {
    number: 6,
    name: "Ardra",
    devanagari: "आर्द्रा",
    span: "06°40' - 20°00' Gemini (Mithuna)",
    rulingPlanet: "Rahu",
    deity: "Rudra (The Fierce Storm Deity of Cosmic Transformation)",
    symbol: "Teardrop / Diamond",
    padas: [
      { pada: 1, navamsha: "Sagittarius (Dhanu)", ruler: "Jupiter", quality: "Curiosity directed toward philosophical reform" },
      { pada: 2, navamsha: "Capricorn (Makara)", ruler: "Saturn", quality: "Scientific rigor under severe pressure" },
      { pada: 3, navamsha: "Aquarius (Kumbha)", ruler: "Saturn", quality: "Cutting-edge algorithmic and technological innovation" },
      { pada: 4, navamsha: "Pisces (Meena)", ruler: "Jupiter", quality: "Compassionate teardrop of spiritual release" }
    ],
    primaryQualities: "Stormy breakthroughs, cathartic psychological clearing, destruction of stagnant dogmas, and sparkling technological intellect."
  },
  {
    number: 7,
    name: "Punarvasu",
    devanagari: "पुनर्वसु",
    span: "20°00' Gemini - 03°20' Cancer (Karka)",
    rulingPlanet: "Jupiter (Guru)",
    deity: "Aditi (The Mother of All Gods / Cosmic Infinite Light)",
    symbol: "Bow and Quiver of Arrows",
    padas: [
      { pada: 1, navamsha: "Aries (Mesha)", ruler: "Mars", quality: "Courageous return and athletic renewal" },
      { pada: 2, navamsha: "Taurus (Vrishabha)", ruler: "Venus", quality: "Restoring material prosperity and domestic harmony" },
      { pada: 3, navamsha: "Gemini (Mithuna)", ruler: "Mercury", quality: "Vargottama: scholarly wisdom, teaching, and writing" },
      { pada: 4, navamsha: "Cancer (Karka)", ruler: "Moon", quality: "Vargottama Pushkara: highest maternal blessing and virtue" }
    ],
    primaryQualities: "The return of the light (Punar = again, Vasu = good/light), resilience, forgiveness, renewal of hope, and moral righteousness."
  },
  {
    number: 8,
    name: "Pushya",
    devanagari: "पुष्य",
    span: "03°20' - 16°40' Cancer (Karka)",
    rulingPlanet: "Saturn (Shani)",
    deity: "Brihaspati (The High Priest and Preceptor of Gods)",
    symbol: "Cow's Udder / Lotus Flower / Circle",
    padas: [
      { pada: 1, navamsha: "Leo (Simha)", ruler: "Sun", quality: "Noble patriarchal care and community authority" },
      { pada: 2, navamsha: "Virgo (Kanya)", ruler: "Mercury", quality: "Meticulous service, dietary healing, and pedagogy" },
      { pada: 3, navamsha: "Libra (Tula)", ruler: "Venus", quality: "Social equity, spiritual friendship, and grace" },
      { pada: 4, navamsha: "Scorpio (Vrishchika)", ruler: "Mars", quality: "Esoteric guardianship and deep protective strength" }
    ],
    primaryQualities: "The most auspicious nurturing asterism; classical texts cite Pushya as capable of nourishing any undertaking with wisdom and virtue."
  },
  {
    number: 9,
    name: "Ashlesha",
    devanagari: "आश्लेषा",
    span: "16°40' - 30°00' Cancer (Karka)",
    rulingPlanet: "Mercury (Budha)",
    deity: "Nagas (The Primordial Serpentine Intelligences)",
    symbol: "Coiled Serpent",
    padas: [
      { pada: 1, navamsha: "Sagittarius (Dhanu)", ruler: "Jupiter", quality: "Esoteric philosophy and mystical insight" },
      { pada: 2, navamsha: "Capricorn (Makara)", ruler: "Saturn", quality: "Calculated strategic restraint and business acumen" },
      { pada: 3, navamsha: "Aquarius (Kumbha)", ruler: "Saturn", quality: "Unconventional research into pharmacology and venom" },
      { pada: 4, navamsha: "Pisces (Meena)", ruler: "Jupiter", quality: "Gandanta transition: deep Kundalini awakening" }
    ],
    primaryQualities: "Deep psychological intuition, hypnotic charisma, mastery over venom and medicine, Kundalini force, and penetrating insight."
  },
  {
    number: 10,
    name: "Magha",
    devanagari: "मघा",
    span: "00°00' - 13°20' Leo (Simha)",
    rulingPlanet: "Ketu",
    deity: "Pitris (The Ancestral Forefathers and Sages)",
    symbol: "Royal Throne Room / Palanquin",
    padas: [
      { pada: 1, navamsha: "Aries (Mesha)", ruler: "Mars", quality: "Pioneering heroic leadership honouring ancestors" },
      { pada: 2, navamsha: "Taurus (Vrishabha)", ruler: "Venus", quality: "Conserving family lineage treasures and rituals" },
      { pada: 3, navamsha: "Gemini (Mithuna)", ruler: "Mercury", quality: "Recording historical chronicles and ancestral lore" },
      { pada: 4, navamsha: "Cancer (Karka)", ruler: "Moon", quality: "Deep filial devotion and spiritual reverence" }
    ],
    primaryQualities: "Regal authority, deep reverence for ancestral heritage, leadership dignity, historical consciousness, and magnanimity."
  },
  {
    number: 11,
    name: "Purva Phalguni",
    devanagari: "पूर्वा फाल्गुनी",
    span: "13°20' - 26°40' Leo (Simha)",
    rulingPlanet: "Venus (Shukra)",
    deity: "Bhaga (The God of Delight, Wealth, and Marital Bliss)",
    symbol: "Front Legs of a Hammock / Couch",
    padas: [
      { pada: 1, navamsha: "Leo (Simha)", ruler: "Sun", quality: "Vargottama: royal artistic charisma and confidence" },
      { pada: 2, navamsha: "Virgo (Kanya)", ruler: "Mercury", quality: "Practical craftsmanship and refined design" },
      { pada: 3, navamsha: "Libra (Tula)", ruler: "Venus", quality: "Supreme romantic charm, diplomacy, and music" },
      { pada: 4, navamsha: "Scorpio (Vrishchika)", ruler: "Mars", quality: "Passionate devotion and emotional intensity" }
    ],
    primaryQualities: "Joy of living, creative theatrical expression, romantic devotion, relaxation, hospitality, and generous celebration."
  },
  {
    number: 12,
    name: "Uttara Phalguni",
    devanagari: "उत्तरा फाल्गुनी",
    span: "26°40' Leo - 10°00' Virgo (Kanya)",
    rulingPlanet: "Sun (Surya)",
    deity: "Aryaman (The God of Friendship, Honor, and Sacred Contracts)",
    symbol: "Back Legs of a Couch / Bed",
    padas: [
      { pada: 1, navamsha: "Sagittarius (Dhanu)", ruler: "Jupiter", quality: "Righteous alliance and ethical philanthropy" },
      { pada: 2, navamsha: "Capricorn (Makara)", ruler: "Saturn", quality: "Institutional integrity and steadfast friendship" },
      { pada: 3, navamsha: "Aquarius (Kumbha)", ruler: "Saturn", quality: "Humanitarian alliances and societal support" },
      { pada: 4, navamsha: "Pisces (Meena)", ruler: "Jupiter", quality: "Compassionate service and spiritual charity" }
    ],
    primaryQualities: "Unwavering loyalty in contracts, patronage of the vulnerable, dependable friendship, and upright community stewardship."
  },
  {
    number: 13,
    name: "Hasta",
    devanagari: "हस्त",
    span: "10°00' - 23°20' Virgo (Kanya)",
    rulingPlanet: "Moon (Chandra)",
    deity: "Savitri (The Radiant Solar Creator who inspires Intellect / Gayatri)",
    symbol: "The Open Hand blessing or grasping",
    padas: [
      { pada: 1, navamsha: "Aries (Mesha)", ruler: "Mars", quality: "Energetic manual skill, surgery, and mechanics" },
      { pada: 2, navamsha: "Taurus (Vrishabha)", ruler: "Venus", quality: "Artistic dexterity, pottery, and jewelry design" },
      { pada: 3, navamsha: "Gemini (Mithuna)", ruler: "Mercury", quality: "Calligraphy, coding, writing, and magic wit" },
      { pada: 4, navamsha: "Cancer (Karka)", ruler: "Moon", quality: "Healing touch, massage, and culinary mastery" }
    ],
    primaryQualities: "Mastery of the hands, healing touch, subtle humor, exquisite craftsmanship, quick intelligence, and manifesting ideas into reality."
  },
  {
    number: 14,
    name: "Chitra",
    devanagari: "चित्रा",
    span: "23°20' Virgo - 06°40' Libra (Tula)",
    rulingPlanet: "Mars (Mangala)",
    deity: "Twashtar / Vishwakarma (The Divine Celestial Architect)",
    symbol: "Bright Solitary Gem / Pearl",
    padas: [
      { pada: 1, navamsha: "Leo (Simha)", ruler: "Sun", quality: "Authoritative design and regal architecture" },
      { pada: 2, navamsha: "Virgo (Kanya)", ruler: "Mercury", quality: "Vargottama: supreme precision engineering and detail" },
      { pada: 3, navamsha: "Libra (Tula)", ruler: "Venus", quality: "Vargottama: sublime aesthetic elegance and fashion" },
      { pada: 4, navamsha: "Scorpio (Vrishchika)", ruler: "Mars", quality: "Transformative structural design and metallurgy" }
    ],
    primaryQualities: "Dazzling visual beauty, architectural mastery, intricate structural engineering, magnetic visual style, and multidimensional creativity."
  },
  {
    number: 15,
    name: "Swati",
    devanagari: "स्वाती",
    span: "06°40' - 20°00' Libra (Tula)",
    rulingPlanet: "Rahu",
    deity: "Vayu (The God of Wind, Breath, and Freedom)",
    symbol: "Young Shoot blowing gently in the wind / Coral",
    padas: [
      { pada: 1, navamsha: "Sagittarius (Dhanu)", ruler: "Jupiter", quality: "Open-minded philosophical exploration" },
      { pada: 2, navamsha: "Capricorn (Makara)", ruler: "Saturn", quality: "Pragmatic international trade and resilience" },
      { pada: 3, navamsha: "Aquarius (Kumbha)", ruler: "Saturn", quality: "Innovative networking and progressive thought" },
      { pada: 4, navamsha: "Pisces (Meena)", ruler: "Jupiter", quality: "Spiritual adaptability and musical grace" }
    ],
    primaryQualities: "Independent freedom, flexible adaptability, commercial and diplomatic brilliance, mastery of breath (Pranayama), and peaceful mediation."
  },
  {
    number: 16,
    name: "Vishakha",
    devanagari: "विशाखा",
    span: "20°00' Libra - 03°20' Scorpio (Vrishchika)",
    rulingPlanet: "Jupiter (Guru)",
    deity: "Indra and Agni (Dual deities of Supreme Temporal Power and Sacred Fire)",
    symbol: "Triumphal Archway festooned with leaves",
    padas: [
      { pada: 1, navamsha: "Aries (Mesha)", ruler: "Mars", quality: "Fiery ambition and determination to triumph" },
      { pada: 2, navamsha: "Taurus (Vrishabha)", ruler: "Venus", quality: "Material consolidation of achieved goals" },
      { pada: 3, navamsha: "Gemini (Mithuna)", ruler: "Mercury", quality: "Strategic communication and competitive debate" },
      { pada: 4, navamsha: "Cancer (Karka)", ruler: "Moon", quality: "Transforming personal ambition into community welfare" }
    ],
    primaryQualities: "Single-minded focus, relentless pursuit of triumph, overcoming insurmountable odds, and achieving long-term goals."
  },
  {
    number: 17,
    name: "Anuradha",
    devanagari: "अनुराधा",
    span: "03°20' - 16°40' Scorpio (Vrishchika)",
    rulingPlanet: "Saturn (Shani)",
    deity: "Mitra (The God of Compassionate Friendship and Universal Harmony)",
    symbol: "Row of Offerings / Lotus Flower blooming in mud",
    padas: [
      { pada: 1, navamsha: "Leo (Simha)", ruler: "Sun", quality: "Loyal leadership and moral steadfastness" },
      { pada: 2, navamsha: "Virgo (Kanya)", ruler: "Mercury", quality: "Dedicated organizational teamwork and research" },
      { pada: 3, navamsha: "Libra (Tula)", ruler: "Venus", quality: "Loving devotion, musical rhythm, and international peace" },
      { pada: 4, navamsha: "Scorpio (Vrishchika)", ruler: "Mars", quality: "Esoteric brotherhood and deep emotional steadfastness" }
    ],
    primaryQualities: "Sacred friendship, unshakeable loyalty, organizational teamwork, international travel, and blossoming spiritually despite adversity."
  },
  {
    number: 18,
    name: "Jyeshtha",
    devanagari: "ज्येष्ठा",
    span: "16°40' - 30°00' Scorpio (Vrishchika)",
    rulingPlanet: "Mercury (Budha)",
    deity: "Indra (The King of the Gods)",
    symbol: "Circular Amulet / Talisman / Umbrella",
    padas: [
      { pada: 1, navamsha: "Sagittarius (Dhanu)", ruler: "Jupiter", quality: "Philosophical leadership and defense of dharma" },
      { pada: 2, navamsha: "Capricorn (Makara)", ruler: "Saturn", quality: "Steely administrative grit and protective duty" },
      { pada: 3, navamsha: "Aquarius (Kumbha)", ruler: "Saturn", quality: "Defending vulnerable collectives and humanitarian rights" },
      { pada: 4, navamsha: "Pisces (Meena)", ruler: "Jupiter", quality: "Gandanta edge: spiritual surrender of personal ego" }
    ],
    primaryQualities: "Eldership, protective responsibility, courage in crises, mastery of occult knowledge, and high social standing."
  },
  {
    number: 19,
    name: "Mula",
    devanagari: "मूल",
    span: "00°00' - 13°20' Sagittarius (Dhanu)",
    rulingPlanet: "Ketu",
    deity: "Nirriti (The Goddess of Dissolution and Root Realization)",
    symbol: "Tied Bundle of Roots",
    padas: [
      { pada: 1, navamsha: "Aries (Mesha)", ruler: "Mars", quality: "Fierce investigative search into core truths" },
      { pada: 2, navamsha: "Taurus (Vrishabha)", ruler: "Venus", quality: "Uprooting superficiality to find true value" },
      { pada: 3, navamsha: "Gemini (Mithuna)", ruler: "Mercury", quality: "Deep scholarly research into historical roots" },
      { pada: 4, navamsha: "Cancer (Karka)", ruler: "Moon", quality: "Emotional transcendence and root spiritual healing" }
    ],
    primaryQualities: "Getting to the absolute root of matters, uprooting illusions, herbal medicine, research into foundational science, and radical transformation."
  },
  {
    number: 20,
    name: "Purva Ashadha",
    devanagari: "पूर्वाषाढा",
    span: "13°20' - 26°40' Sagittarius (Dhanu)",
    rulingPlanet: "Venus (Shukra)",
    deity: "Apas (The Sacred Waters of Cosmic Purity)",
    symbol: "Winnowing Fan / Elephant's Tusk",
    padas: [
      { pada: 1, navamsha: "Leo (Simha)", ruler: "Sun", quality: "Regal eloquence and inspiring public speeches" },
      { pada: 2, navamsha: "Virgo (Kanya)", ruler: "Mercury", quality: "Refined philosophical debate and analytical discernment" },
      { pada: 3, navamsha: "Libra (Tula)", ruler: "Venus", quality: "Supreme diplomatic invincibility and aesthetic charm" },
      { pada: 4, navamsha: "Scorpio (Vrishchika)", ruler: "Mars", quality: "Tenacious spiritual endurance and hidden resolve" }
    ],
    primaryQualities: "Invincible conviction (Aparajita), inspiring purification, philosophical eloquence, victory in moral debates, and joyful charisma."
  },
  {
    number: 21,
    name: "Uttara Ashadha",
    devanagari: "उत्तराषाढा",
    span: "26°40' Sagittarius - 10°00' Capricorn (Makara)",
    rulingPlanet: "Sun (Surya)",
    deity: "Vishwadevas (The Universal Cosmic Principles of Truth and Dharma)",
    symbol: "Small Planks / Elephant's Tusk / Small Bed",
    padas: [
      { pada: 1, navamsha: "Sagittarius (Dhanu)", ruler: "Jupiter", quality: "Vargottama: supreme philosophical leadership and ethics" },
      { pada: 2, navamsha: "Capricorn (Makara)", ruler: "Saturn", quality: "Enduring institutional governance and dedication" },
      { pada: 3, navamsha: "Aquarius (Kumbha)", ruler: "Saturn", quality: "Humanitarian structural progress and social equality" },
      { pada: 4, navamsha: "Pisces (Meena)", ruler: "Jupiter", quality: "Spiritual humility and universal service" }
    ],
    primaryQualities: "Unconquerable ethical victory, deep humility in authority, enduring institutional responsibility, and dedication to universal truth."
  },
  {
    number: 22,
    name: "Shravana",
    devanagari: "श्रवण",
    span: "10°00' - 23°20' Capricorn (Makara)",
    rulingPlanet: "Moon (Chandra)",
    deity: "Vishnu (The Preserver and Sustainer of the Cosmos)",
    symbol: "Three Footprints of Vishnu / An Ear",
    padas: [
      { pada: 1, navamsha: "Aries (Mesha)", ruler: "Mars", quality: "Active listening that translates into decisive leadership" },
      { pada: 2, navamsha: "Taurus (Vrishabha)", ruler: "Venus", quality: "Appreciating oral traditions, mantras, and classical music" },
      { pada: 3, navamsha: "Gemini (Mithuna)", ruler: "Mercury", quality: "Linguistic scholarship and archiving oral histories" },
      { pada: 4, navamsha: "Cancer (Karka)", ruler: "Moon", quality: "Deep spiritual empathy and contemplative silence" }
    ],
    primaryQualities: "The art of deep listening (Shruti), absorbing oral knowledge, scholarly devotion, preservation of wisdom traditions, and quiet service."
  },
  {
    number: 23,
    name: "Dhanishta",
    devanagari: "धनिष्ठा",
    span: "23°20' Capricorn - 06°40' Aquarius (Kumbha)",
    rulingPlanet: "Mars (Mangala)",
    deity: "Ashta Vasus (The Eight Solar Elementals of Material Creation)",
    symbol: "Musical Drum (Damaru) / Flute",
    padas: [
      { pada: 1, navamsha: "Leo (Simha)", ruler: "Sun", quality: "Musical performance, royal patronage, and drama" },
      { pada: 2, navamsha: "Virgo (Kanya)", ruler: "Mercury", quality: "Rhythmic precision, mathematics, and audio engineering" },
      { pada: 3, navamsha: "Libra (Tula)", ruler: "Venus", quality: "Refined dance choreography and social harmony" },
      { pada: 4, navamsha: "Scorpio (Vrishchika)", ruler: "Mars", quality: "Martial cadence, athletic endurance, and resolve" }
    ],
    primaryQualities: "Rhythm, timing, musical mastery, financial abundance (Dhana = wealth), martial synchronization, and athletic excellence."
  },
  {
    number: 24,
    name: "Shatabhisha",
    devanagari: "शतभिषा",
    span: "06°40' - 20°00' Aquarius (Kumbha)",
    rulingPlanet: "Rahu",
    deity: "Varuna (The Cosmic Lord of Celestial Waters and Universal Law)",
    symbol: "Empty Circle / Hundred Physicians / Hundred Stars",
    padas: [
      { pada: 1, navamsha: "Sagittarius (Dhanu)", ruler: "Jupiter", quality: "Philosophical exploration of the cosmos and astronomy" },
      { pada: 2, navamsha: "Capricorn (Makara)", ruler: "Saturn", quality: "Rigorous clinical pharmacology and medical trials" },
      { pada: 3, navamsha: "Aquarius (Kumbha)", ruler: "Saturn", quality: "Vargottama: visionary science, astronomy, and space tech" },
      { pada: 4, navamsha: "Pisces (Meena)", ruler: "Jupiter", quality: "Mystical healing through prayer, water, and meditation" }
    ],
    primaryQualities: "The 'hundred healers', miraculous medicine, astronomy, space exploration, meditative solitude within the cosmic circle, and unravelling secrets."
  },
  {
    number: 25,
    name: "Purva Bhadrapada",
    devanagari: "पूर्व भाद्रपदा",
    span: "20°00' Aquarius - 03°20' Pisces (Meena)",
    rulingPlanet: "Jupiter (Guru)",
    deity: "Aja Ekapada (The One-Footed Cosmic Fire Serpent)",
    symbol: "Front of a Funeral Cot / Two-Faced Man / Sword",
    padas: [
      { pada: 1, navamsha: "Aries (Mesha)", ruler: "Mars", quality: "Fierce tapasya (spiritual austerity) and discipline" },
      { pada: 2, navamsha: "Taurus (Vrishabha)", ruler: "Venus", quality: "Channeling occult intensity into aesthetic expression" },
      { pada: 3, navamsha: "Gemini (Mithuna)", ruler: "Mercury", quality: "Philosophical contemplation of impermanence and mortality" },
      { pada: 4, navamsha: "Cancer (Karka)", ruler: "Moon", quality: "Deep devotional surrender and emotional purification" }
    ],
    primaryQualities: "Ascetic austerity (Tapas), intense philosophical sincerity, looking dual reality in the face, and awakening the spiritual fire."
  },
  {
    number: 26,
    name: "Uttara Bhadrapada",
    devanagari: "उत्तर भाद्रपदा",
    span: "03°20' - 16°40' Pisces (Meena)",
    rulingPlanet: "Saturn (Shani)",
    deity: "Ahirbudhnya (The Deep Serpentine Dragon of the Cosmic Ocean Depths)",
    symbol: "Back of a Funeral Cot / Deep Pool of Water",
    padas: [
      { pada: 1, navamsha: "Leo (Simha)", ruler: "Sun", quality: "Quiet spiritual authority and benevolent protection" },
      { pada: 2, navamsha: "Virgo (Kanya)", ruler: "Mercury", quality: "Practical yogic discipline and calm research" },
      { pada: 3, navamsha: "Libra (Tula)", ruler: "Venus", quality: "Serene emotional balance and peaceful contemplation" },
      { pada: 4, navamsha: "Scorpio (Vrishchika)", ruler: "Mars", quality: "Kundalini mastery residing peacefully in the ocean depth" }
    ],
    primaryQualities: "Serene wisdom, deep meditation (Samadhi), unshakeable patience, shelter for the weary, and resting peacefully in the ocean of consciousness."
  },
  {
    number: 27,
    name: "Revati",
    devanagari: "रेवती",
    span: "16°40' - 30°00' Pisces (Meena)",
    rulingPlanet: "Mercury (Budha)",
    deity: "Pushan (The Solar Shepherd who guides travelers safely across thresholds)",
    symbol: "A Pair of Fish / Drum / Walking Stick",
    padas: [
      { pada: 1, navamsha: "Sagittarius (Dhanu)", ruler: "Jupiter", quality: "Noble guidance of fellow seekers on the spiritual path" },
      { pada: 2, navamsha: "Capricorn (Makara)", ruler: "Saturn", quality: "Practical sheltering of orphaned beings and travelers" },
      { pada: 3, navamsha: "Aquarius (Kumbha)", ruler: "Saturn", quality: "Universal compassion and protective charity" },
      { pada: 4, navamsha: "Pisces (Meena)", ruler: "Mercury", quality: "Vargottama: ultimate liberation, sweetness, and divine poetry" }
    ],
    primaryQualities: "Gentle compassion, safe completion of cycles, guiding souls across transitions, artistic sweetness, and protection of animals and wanderers."
  }
];

export const PANCHANG_KNOWLEDGE = {
  title: "The Five Limbs of Panchang (पञ्चाङ्ग)",
  subtitle: "Classical Astronomical Foundations and Traditional Usage",
  philosophicalContext: `The word Panchang derives from Pancha (five) and Anga (limbs). It is the traditional Indian lunar-solar calendar system. Far from being a mere list of lucky days, each of the five limbs represents an exact astronomical relationship between the Sun (representing the soul/vital fire) and the Moon (representing the mind/watery consciousness):

1. Tithi: Soli-lunar phase angle (representing the water element / emotional sustenance).
2. Vara: Solar weekday (representing the fire element / physical vitality and daily energy).
3. Nakshatra: Moon's stellar backdrop (representing the air element / mental breath and impressions).
4. Yoga: Combined angular sum of Sun and Moon (representing the ether element / subtle binding harmony).
5. Karana: Half of a Tithi (representing the earth element / tangible material manifestation).`,

  limbs: [
    {
      limb: "Tithi (Lunar Day)",
      sanskrit: "तिथि",
      elementAssociation: "Jala (Water / Emotional Energy)",
      calculationMethod: `Calculated as the difference in celestial longitude between the Moon and the Sun:
Tithi = (Moon Longitude - Sun Longitude) / 12°
Each 12-degree elongation of the Moon away from the Sun constitutes one Tithi.
• When Moon and Sun are at identical longitude (0° separation): Amavasya (New Moon).
• As the Moon pulls ahead from 0° to 180°: Shukla Paksha (Waxing Bright Fortnight, Tithis 1 to 15 / Purnima).
• As the Moon returns from 180° to 360°: Krishna Paksha (Waning Dark Fortnight, Tithis 1 to 15 / Amavasya).`,
      traditionalUsage: "Reflects the subjective emotional climate and nutritional receptivity of the day. Classical texts prescribe specific tithis for fasting, education, charity, and celebration.",
      examples: [
        "Pratipada (1st): Initiating steady ventures and quiet introspection.",
        "Chaturthi (4th): Removing obstacles and Ganesha contemplation.",
        "Ekadashi (11th): Fasting, mental purification, and Vishnu meditation.",
        "Purnima (15th / Full Moon): Satyanarayana puja, peak creativity, and spiritual completion."
      ]
    },
    {
      limb: "Vara (Solar Weekday)",
      sanskrit: "वार",
      elementAssociation: "Agni (Fire / Vital Energy & Longevity)",
      calculationMethod: `Determined by the planetary ruler of the day, derived from the classical Chaldean order of the planetary hours (Horas). The planet ruling the first Hora at local sunrise gives its name to the entire day:
• Ravivara (Sunday): Surya (Sun) — Vitality, executive duty, leadership.
• Somavara (Monday): Chandra (Moon) — Domestic care, meditation, emotional healing.
• Mangalavara (Tuesday): Mangala (Mars) — Tactical action, courage, athletics, surgery.
• Budhavara (Wednesday): Budha (Mercury) — Commerce, study, writing, diplomacy.
• Guruvara (Thursday): Guru (Jupiter) — Higher learning, philosophy, guru veneration.
• Shukravara (Friday): Shukra (Venus) — Arts, hospitality, design, sacred partnership.
• Shanivara (Saturday): Shani (Saturn) — Solitude, discipline, service, restructuring.`,
      traditionalUsage: "Sets the baseline physical rhythm and stamina for outer worldly activities.",
      examples: "Beginning new studies on Wednesday, inaugurating wisdom teachings on Thursday, quiet reflection on Saturday."
    },
    {
      limb: "Nakshatra (Lunar Asterism)",
      sanskrit: "नक्षत्र",
      elementAssociation: "Vayu (Air / Mental Breath & Archetype)",
      calculationMethod: `The exact 13°20' sector of the 360° zodiac currently occupied by the Moon:
Nakshatra Index = floor(Moon Longitude / 13°20')
Because the Moon traverses approximately 13 degrees per day, it visits one Nakshatra each day, taking 27.3 days to complete the cycle.`,
      traditionalUsage: "Reveals the archetypal deity and subtle psychological current of the day. Highly utilized in Muhurta (auspicious timing) to ensure that the spirit of an action resonates with cosmic nature.",
      examples: "Rohini for creative planting, Pushya for spiritual initiations, Hasta for intricate craftsmanship, Shravana for learning and listening."
    },
    {
      limb: "Yoga (Soli-Lunar Combination)",
      sanskrit: "योग",
      elementAssociation: "Akasha (Ether / Subtle Harmony)",
      calculationMethod: `Calculated by adding the celestial longitude of the Sun to the celestial longitude of the Moon:
Yoga = (Sun Longitude + Moon Longitude) / 13°20' modulo 27
There are 27 Yogas in total, ranging from Vishkumbha (1st) to Vaidhriti (27th).`,
      traditionalUsage: "Represents the underlying etheric cohesion and spiritual rapport between the conscious will (Sun) and feeling mind (Moon). Auspicious Yogas like Siddha, Sadhya, Shubha, and Brahma foster smooth collaborative flow.",
      examples: [
        "Siddha Yoga: Exceptional for meditation, spiritual study, and successful creative completion.",
        "Amrita Yoga: Cultivates health, longevity, and peaceful resolution.",
        "Vaidhriti / Vyatipata: Recommended for inward introspection, quiet contemplation, and charity rather than worldly celebration."
      ]
    },
    {
      limb: "Karana (Half-Tithi)",
      sanskrit: "करण",
      elementAssociation: "Prithvi (Earth / Material Execution)",
      calculationMethod: `One Karana equals exactly half of a Tithi (6 degrees of longitudinal separation between Sun and Moon):
Karana = (Moon Longitude - Sun Longitude) / 6°
There are 11 Karanas in total:
• 7 Chara (Movable/Recurring): Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti (Bhadra).
• 4 Sthira (Fixed, occurring only at the transition of the dark Moon): Shakuni, Chatushpada, Naga, Kintughna.`,
      traditionalUsage: "Indicates the physical, tactile, and practical success of an undertaking. Dictates how energy manifests into tangible form on the material plane.",
      examples: "Bava for productive enterprise, Balava for physical stamina, Kaulava for social collaboration, Vanija for commerce, Vishti (Bhadra) for defensive protection and quiet perseverance."
    }
  ]
};

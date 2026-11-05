/**
 * server/astrology/bhavasKnowledge.js
 * 
 * Comprehensive Classical Guide to the 12 Bhavas (Houses) of Vedic Astrology.
 * Grounded in Brihat Parashara Hora Shastra, Phaladeepika, and Jataka Parijata.
 */

export const BHAVAS_KNOWLEDGE = [
  {
    number: 1,
    sanskritName: "Tanu Bhava",
    devanagari: "तनु भाव",
    englishName: "House of Self & Physical Incarnation",
    karakaGraha: "Surya (Sun)",
    classifications: ["Kendra (Angle)", "Trikona (Trine)", "Dharma Bhava (Duty & Virtue)"],
    primarySignifications: [
      "Physical body, overall constitution, vitality, and complexion",
      "Head, brain, facial appearance, and sensory awareness",
      "Innate temperament, self-identity, ego orientation, and disposition",
      "Beginning of life, childhood conditions, and general fortune in the world"
    ],
    modernLifeDomains: {
      career: "Personal charisma, executive presence, initiative, self-starter ventures, and foundational drive.",
      relationships: "How you project yourself to others, your boundaries, and the persona you bring into partnerships.",
      psychology: "Self-worth, resilience against stress, mental clarity, and fundamental worldview.",
      materialStability: "General physical longevity and capacity to sustain work effort and endure life's challenges.",
      innerLife: "Alignment with your soul's authentic calling (Svadharma) and conscious awareness."
    },
    commonMisconceptions: [
      "Misconception: 'The 1st house is just like the Western Sun sign.' Correction: In Vedic astrology, the 1st house is determined by the rising constellation (Lagna) on the exact Eastern horizon at birth, not where the Sun was in that month.",
      "Misconception: 'A challenging planet in the 1st house means a weak or flawed personality.' Correction: Natural malefics like Saturn or Mars in the 1st house can bestow extraordinary discipline, stamina, perseverance, and high grit when well-placed."
    ],
    howToAnalyze: {
      bhaveshaLordship: "The ruler of the 1st house is called the Lagnesha. Its strength, house placement, and dignity serve as the primary rudder of the entire birth chart.",
      occupyingPlanets: "Directly color the native's appearance, demeanor, and immediate instinctive reactions.",
      aspectingPlanets: "Introduce secondary psychological influences and external support or friction.",
      balancedExample: "A native with Leo rising (Simha Lagna) and Sun (Lagnesha) placed in the 10th house in Taurus (Vrishabha) with Venus: Demonstrates an ambitious, dignified demeanor with leadership acumen in creative, administrative, or aesthetic professions."
    },
    classicalCitations: "BPHS Ch. 11, v. 1-3; Phaladeepika Ch. 14, v. 1-2."
  },
  {
    number: 2,
    sanskritName: "Dhana / Kutumba Bhava",
    devanagari: "धन / कुटुम्ब भाव",
    englishName: "House of Accumulated Resources & Family Values",
    karakaGraha: "Guru (Jupiter) for wealth; Budha (Mercury) for speech",
    classifications: ["Maraka (Terminal indicator)", "Artha Bhava (Resource & Material Security)"],
    primarySignifications: [
      "Liquid wealth, savings, banking, inherited assets, and family treasures",
      "Immediate family lineage, household upbringing, and ancestral values",
      "Speech, vocal tone, honesty, eloquence, and linguistic capability",
      "Mouth, teeth, tongue, throat, right eye, and dietary habits"
    ],
    modernLifeDomains: {
      career: "Financial management, banking, public speaking, teaching, culinary arts, and negotiation.",
      relationships: "Warmth within family of origin, fidelity to family traditions, and domestic hospitality.",
      psychology: "Psychological feeling of emotional and financial security; what one truly values.",
      materialStability: "Personal balance sheet, capacity to save money, and financial resilience.",
      innerLife: "Cultivation of truthful, benevolent speech (Satyam Priyam Hitam cha Yat) and conscious consumption."
    },
    commonMisconceptions: [
      "Misconception: 'The 2nd house is Maraka (killer house), so planets here cut life short.' Correction: Maraka is a technical classification indicating timing of life transitions, but planets here primarily foster wealth, familial heritage, and speech unless afflicted at the end of longevity cycles.",
      "Misconception: 'Having Mars in the 2nd house guarantees poverty.' Correction: Mars in the 2nd can create decisive, assertive speech and proactive wealth-building through direct effort."
    ],
    howToAnalyze: {
      bhaveshaLordship: "The 2nd lord's connection to the 11th (gains) or 9th (fortune) creates powerful Dhana Yogas (wealth combinations).",
      occupyingPlanets: "Determine vocal expression (e.g. Mercury grants quick wit, Venus grants melodious singing, Saturn grants sparse, measured speech) and nutritional preferences.",
      aspectingPlanets: "Modify financial flow and familial harmony.",
      balancedExample: "Jupiter in the 2nd house in Pisces (Meena): Endows the individual with a resonant, wise, and soothing voice, generosity with money, strong adherence to family ethics, and high financial integrity."
    },
    classicalCitations: "BPHS Ch. 11, v. 4-5; Jataka Parijata Ch. 11, v. 10."
  },
  {
    number: 3,
    sanskritName: "Sahaja / Bhratru Bhava",
    devanagari: "सहज / भ्रातृ भाव",
    englishName: "House of Courage, Initiative & Communication",
    karakaGraha: "Mangala (Mars) for courage/siblings; Budha (Mercury) for communication",
    classifications: ["Upachaya (House of growth through time)", "Kama Bhava (Desire & Action)"],
    primarySignifications: [
      "Parakrama (valour, personal bravery, enterprise, and grit)",
      "Younger siblings, cousins, neighbors, and peer circle",
      "Manual dexterity, hands, arms, shoulders, upper respiratory tract, and right ear",
      "Short journeys, writing, journalism, marketing, crafts, and fine motor skills"
    ],
    modernLifeDomains: {
      career: "Media production, authorship, coding, digital communication, sales, athletic competition, and arts.",
      relationships: "Comradery with siblings, peer dynamics, and collaborative team communication.",
      psychology: "Courage to take calculated risks, willingness to persevere, and initiative in starting projects.",
      materialStability: "Self-earned wealth (Purushartha) built through relentless personal effort rather than inheritance.",
      innerLife: "Discipline of self-effort (Abhyasa) and the courage to break outdated habit patterns."
    },
    commonMisconceptions: [
      "Misconception: 'The 3rd house is a Leena/mild dusthana with little value.' Correction: Being an Upachaya house, planets here improve with maturity. Strong 3rd house planets create pioneering entrepreneurs, legendary writers, and Olympic champions.",
      "Misconception: 'Malefics in the 3rd house ruin relationships with siblings.' Correction: Malefics like Mars, Sun, or Saturn in the 3rd house give formidable bravery and competitive stamina, though communication style may be blunt."
    ],
    howToAnalyze: {
      bhaveshaLordship: "Connection of the 3rd lord with the 10th lord indicates self-made entrepreneurial success and energetic leadership.",
      occupyingPlanets: "Reflect communication style: Mercury produces articulate writing, Mars produces decisive courage, Venus brings artistic or musical dexterity.",
      aspectingPlanets: "Determine whether effort meets with encouragement or resistance.",
      balancedExample: "Mars in the 3rd house in Capricorn (Makara, exalted): Produces fearless determination, athletic stamina, tactical acumen, and immense protective dedication to peers and siblings."
    },
    classicalCitations: "BPHS Ch. 11, v. 6-7; Phaladeepika Ch. 14, v. 4."
  },
  {
    number: 4,
    sanskritName: "Sukha / Bandhu Bhava",
    devanagari: "सुख / बन्धु भाव",
    englishName: "House of Inner Peace, Home & Mother",
    karakaGraha: "Chandra (Moon) for mother and emotions; Budha (Mercury) for education; Shukra (Venus) for conveyances",
    classifications: ["Kendra (Pillar/Angle)", "Moksha Bhava (Liberation & Emotional Resolution)"],
    primarySignifications: [
      "Matru (Mother), maternal lineage, and maternal nurturing",
      "Hridaya (Heart), chest, lungs, and emotional well-being",
      "Real estate, landed property, homes, vehicles, and fixed comforts",
      "Formal school education, domestic tranquility, and mental sanctuary"
    ],
    modernLifeDomains: {
      career: "Real estate development, interior architecture, primary education, hospitality, and agriculture.",
      relationships: "Deep emotional attachment to mother, feeling of safety in one's private living space.",
      psychology: "Underlying contentment (Sukha), psychological safety, and freedom from chronic anxiety.",
      materialStability: "Home ownership, security of permanent shelter, and vehicle reliability.",
      innerLife: "Heart-centered contemplation, resting in the cave of the spiritual heart (Hridaya Guha)."
    },
    commonMisconceptions: [
      "Misconception: 'A planet here only dictates vehicle or house ownership.' Correction: The 4th house is fundamentally the seat of emotional contentment and psychological peace. A native can have immense wealth, but with an afflicted 4th house, peace of mind remains elusive.",
      "Misconception: 'Saturn in the 4th house denies happiness.' Correction: Saturn in the 4th house can foster deep contemplative solitude, grounded patience, and long-term security through ancestral or stone-built property."
    ],
    howToAnalyze: {
      bhaveshaLordship: "The 4th lord in Kendra or Trikona positions indicates good family background, academic success, and domestic comforts.",
      occupyingPlanets: "Directly impact mood stability: Jupiter or Venus creates happiness and loving family atmosphere; Rahu creates domestic restlessness.",
      aspectingPlanets: "Influence emotional serenity and maternal health.",
      balancedExample: "Moon in the 4th house in Cancer (Karka, Swakshetra): Forms a powerful Digbala (directional strength) and Hamsa/Gaja Kesari combination, giving deep empathy, domestic tranquility, loving maternal bond, and inner emotional balance."
    },
    classicalCitations: "BPHS Ch. 11, v. 8-9; Brihat Jataka Ch. 1, v. 15."
  },
  {
    number: 5,
    sanskritName: "Putra / Buddhi Bhava",
    devanagari: "पुत्र / बुद्धि भाव",
    englishName: "House of Creative Intellect, Progeny & Past Merit",
    karakaGraha: "Guru (Jupiter) for wisdom, philosophy, and children",
    classifications: ["Trikona (Trine of Grace)", "Dharma Bhava (Righteous Action)"],
    primarySignifications: [
      "Purva Punya (accumulated spiritual and intellectual merit from prior deeds)",
      "Buddhi (creative intelligence, discrimination, insight, and wisdom)",
      "Progeny, children, mentoring students, and generative creativity",
      "Mantra recitation, intuitive foresight, speculative acumen, and romance"
    ],
    modernLifeDomains: {
      career: "Creative direction, software design, consulting, teaching, research, fund investment, and strategy.",
      relationships: "Romantic courtship, unconditional affection, joyful recreation, and raising children.",
      psychology: "Intellectual brilliance, optimism, playful self-expression, and faith in benevolent destiny.",
      materialStability: "Prudent speculative foresight, wise capital allocation, and inventive problem-solving.",
      innerLife: "Mastery of mantra meditation, devotion (Bhakti), and realization of divine grace."
    },
    commonMisconceptions: [
      "Misconception: 'The 5th house is only for children.' Correction: It is the primary house of discriminative intellect (Dhi Shakti), creative vision, and philosophical discernment.",
      "Misconception: 'Rahu in the 5th denies children or sanity.' Correction: Rahu in the 5th can indicate groundbreaking unconventional genius, foreign cultural creations, or cutting-edge algorithmic thinking."
    ],
    howToAnalyze: {
      bhaveshaLordship: "The 5th lord is an unconditional benefic for any Lagna. Its conjunction with the 9th or 1st lord produces the highest Raja Yogas.",
      occupyingPlanets: "Indicate how the intellect thinks: Mercury produces analytical brilliance; Jupiter produces ethical wisdom; Sun gives decisive executive strategy.",
      aspectingPlanets: "Enhance or disturb mental focus and study discipline.",
      balancedExample: "Mercury in the 5th house in Gemini or Virgo: Produces a brilliant scholar, exceptional author or coder, razor-sharp memory, and delightful communicative rapport with children and protégés."
    },
    classicalCitations: "BPHS Ch. 11, v. 10-11; Phaladeepika Ch. 14, v. 6."
  },
  {
    number: 6,
    sanskritName: "Ari / Ripu / Roga Bhava",
    devanagari: "अरि / रिपु / रोग भाव",
    englishName: "House of Service, Overcoming Obstacles & Health Management",
    karakaGraha: "Mangala (Mars) for victory over rivals; Shani (Saturn) for endurance through service",
    classifications: ["Dusthana (Challenging sector)", "Upachaya (Growth through discipline over time)", "Artha Bhava (Work & Routine)"],
    primarySignifications: [
      "Shatru (adversaries, legal disputes, competition, and conflicting interests)",
      "Roga (acute health vulnerabilities, digestive tract, and preventive hygiene)",
      "Rina (debts, loans, contractual obligations, and financial commitments)",
      "Seva (selfless daily service, employment, teamwork, and care for vulnerable beings/pets)"
    ],
    modernLifeDomains: {
      career: "Medicine, law, dispute resolution, public health, civil service, debugging, auditing, and athletics.",
      relationships: "Handling conflicts constructively, navigating contractual negotiations without animosity.",
      psychology: "Grit in the face of setbacks, daily organizational habits, and freedom from perfectionism.",
      materialStability: "Prudent debt management, paying off loans systematically, and building steady emergency reserves.",
      innerLife: "Karma Yoga (selfless action without attachment to fruits) and conquering the internal enemies (Shad-Ripus: Kama, Krodha, Lobha, Moha, Mada, Matsarya)."
    },
    commonMisconceptions: [
      "Misconception: 'The 6th house brings only disease and ruin.' Correction: As an Upachaya house, strong planets in the 6th grant peerless competitive superiority, medical prowess, and the capacity to crush any obstacle through disciplined labor.",
      "Misconception: 'Planets in the 6th are permanently spoiled.' Correction: Malefics like Mars and Saturn in the 6th are traditionally celebrated because they overcome competitors, silence critics, and maintain robust immunity."
    ],
    howToAnalyze: {
      bhaveshaLordship: "The 6th lord reveals where friction or problem-solving demands attention.",
      occupyingPlanets: "Natural malefics here thrive by conquering difficulties, whereas delicate natural benefics (Venus, Moon) require conscious boundary-setting to avoid emotional burnout.",
      aspectingPlanets: "Show how external allies or stressors influence daily work.",
      balancedExample: "Mars in the 6th house in Scorpio or Capricorn: Creates an indomitable defender, champion surgeon or litigation attorney, possessing fearless discipline and high stamina in high-pressure conflicts."
    },
    classicalCitations: "BPHS Ch. 11, v. 12-13; Jataka Parijata Ch. 11, v. 34."
  },
  {
    number: 7,
    sanskritName: "Yuvati / Jaya Bhava",
    devanagari: "युवति / जाया भाव",
    englishName: "House of Partnerships, Marriage & Significant Others",
    karakaGraha: "Shukra (Venus) for romance/spousal harmony; Guru (Jupiter) for marital sanctity",
    classifications: ["Kendra (Angle)", "Maraka (Terminal reflection)", "Kama Bhava (Desire & Mutuality)"],
    primarySignifications: [
      "Kalatra (spouse, life partner, and sacred marital alliance)",
      "Business co-founders, contractual agreements, and public commercial transactions",
      "Social interactions with the public, foreign residency, and long-distance travel",
      "Lower abdomen, kidneys, urinary system, and pelvis"
    ],
    modernLifeDomains: {
      career: "Business partnerships, client relations, diplomacy, public relations, and cross-cultural trade.",
      relationships: "Equal mutual commitment, marital devotion, collaborative balance, and resolving interpersonal projection.",
      psychology: "Capacity to view the world from another person's perspective; overcoming self-centeredness.",
      materialStability: "Joint ventures, contracts with clear legal accountability, and public market credibility.",
      innerLife: "Seeing the divine in the 'other' through sacred relationship and reciprocal devotion."
    },
    commonMisconceptions: [
      "Misconception: 'Any malefic aspect on the 7th means immediate divorce.' Correction: Marriage stability depends on the Navamsha (D9) chart, 7th lord strength, Jupiter's mitigating aspect, and mutual maturity.",
      "Misconception: 'The 7th house is only for marriage.' Correction: It is the house of all one-on-one formal engagements, trade alliances, and public transactions."
    ],
    howToAnalyze: {
      bhaveshaLordship: "The 7th lord's placement shows where and how you encounter significant partners and business collaborators.",
      occupyingPlanets: "Directly shape the character and archetype of the partner (e.g. Jupiter brings wise/ethical partner; Mercury brings youthful, intellectual partner).",
      aspectingPlanets: "Determine external familial or social pressures on the partnership.",
      balancedExample: "Jupiter in the 7th house in Sagittarius (Dhanu): Bestows a noble, magnanimous, highly educated spouse, mutual spiritual reverence in marriage, and prosperous ethical business partnerships."
    },
    classicalCitations: "BPHS Ch. 11, v. 14-15; Phaladeepika Ch. 14, v. 8."
  },
  {
    number: 8,
    sanskritName: "Randhra / Ayur Bhava",
    devanagari: "रन्ध्र / आयुर् भाव",
    englishName: "House of Transformation, Longevity & Esoteric Wisdom",
    karakaGraha: "Shani (Saturn) for longevity and endurance",
    classifications: ["Dusthana (Challenging sector)", "Moksha Bhava (Spiritual Transformation)"],
    primarySignifications: [
      "Ayus (longevity, life span, vitality reserve, and manner of rejuvenation)",
      "Unearned wealth, inheritance, spousal assets, insurance, and joint tax holdings",
      "Sudden psychological transformations, crises, breakthroughs, and rebirth",
      "Esoteric sciences, Jyotisha, research, forensic investigation, and deep subconscious mind"
    ],
    modernLifeDomains: {
      career: "Data science, investigative journalism, deep research, biotechnology, taxation, and depth psychology.",
      relationships: "Deep emotional intimacy, shared financial vulnerability, and psychological transparency.",
      psychology: "Capacity to metabolize grief, transform traumatic experience into wisdom, and confront shadow material.",
      materialStability: "Wills, estates, royalties, pensions, venture funding, and crisis management.",
      innerLife: "Awakening of Kundalini Shakti, mastery over the fear of death, and mystical transcendence."
    },
    commonMisconceptions: [
      "Misconception: 'The 8th house means early death or disaster.' Correction: Classical texts praise a strong 8th house for conferring long life (Dirgha Ayu), deep scholarly research capabilities, and massive unearned wealth through wills or discoveries.",
      "Misconception: 'An active 8th house is inherently sinister.' Correction: The 8th house is the realm of profound spiritual alchemy—turning lead into gold through self-inquiry."
    ],
    howToAnalyze: {
      bhaveshaLordship: "The 8th lord shows where transformative disruptions catalyze spiritual growth.",
      occupyingPlanets: "Indicate how the native handles the unknown: Saturn here gives long life and sober patience; Ketu gives mystical insight.",
      aspectingPlanets: "Modify the intensity and recovery speed from life transitions.",
      balancedExample: "Saturn placed in the 8th house in Libra (Tula, exalted): Classical indicator of profound longevity (Dirgha Ayu), deep psychological resilience, solemn research focus, and capacity to remain unshakeable in crises."
    },
    classicalCitations: "BPHS Ch. 11, v. 16-17; Phaladeepika Ch. 14, v. 9."
  },
  {
    number: 9,
    sanskritName: "Dharma / Bhagya Bhava",
    devanagari: "धर्म / भाग्य भाव",
    englishName: "House of Higher Wisdom, Grace & Ethical Living",
    karakaGraha: "Guru (Jupiter) for dharma and wisdom; Surya (Sun) for father and guru",
    classifications: ["Trikona (Supreme Trine of Grace)", "Dharma Bhava (Cosmic Order & Ethics)"],
    primarySignifications: [
      "Bhagya (divine grace, good fortune, and ease of spiritual opportunity)",
      "Dharma (ethical righteousness, moral conduct, and philosophical integrity)",
      "Guru, spiritual mentors, father, teachers, and ancestral wisdom traditions",
      "Higher education, philosophy, jurisprudence, pilgrimages, and long-distance cultural journeys"
    ],
    modernLifeDomains: {
      career: "Higher academia, constitutional law, international publishing, ethics boards, and spiritual mentorship.",
      relationships: "Reverence for teachers, deep moral loyalty in relationships, and intercultural friendships.",
      psychology: "Unshakable philosophical optimism, ethical moral compass, and faith in universal order.",
      materialStability: "Natural serendipity, timely assistance during crises, and legitimate prosperity earned through virtue.",
      innerLife: "Study of sacred scriptures, devotion to truth, and direct pilgrimage to sacred spaces (Tirtha Yatra)."
    },
    commonMisconceptions: [
      "Misconception: 'The 9th house guarantees you will win the lottery without working.' Correction: Bhagya (fortune) is the harvest of past ethical deeds; it provides fertile ground, but conscious effort (Purushakara) is required to sow and harvest.",
      "Misconception: 'Any affliction here means you have bad karma.' Correction: Challenges in the 9th encourage developing personal moral discernment rather than relying blindly on dogmatic institutions."
    ],
    howToAnalyze: {
      bhaveshaLordship: "The 9th lord is the supreme benefic planet in any horoscope. Its conjunction with the 10th or 1st lord produces the renowned Dharma-Karmadhipati Raja Yoga.",
      occupyingPlanets: "Reveal philosophical leanings: Jupiter gives traditional Vedantic devotion; Sun gives righteous authority; Mercury brings comparative linguistics and philosophy.",
      aspectingPlanets: "Highlight the quality of relationships with mentors and father figures.",
      balancedExample: "Sun and Jupiter conjunction in the 9th house in Sagittarius (Dhanu): Bestows immense moral authority, deep reverence for wisdom traditions, exceptional mentorship, and international scholarly recognition."
    },
    classicalCitations: "BPHS Ch. 11, v. 18-19; Brihat Jataka Ch. 1, v. 16."
  },
  {
    number: 10,
    sanskritName: "Karma / Rajya Bhava",
    devanagari: "कर्म / राज्य भाव",
    englishName: "House of Career, Public Reputation & Worldly Action",
    karakaGraha: "Budha (Mercury) for commerce; Surya (Sun) for authority; Shani (Saturn) for service; Guru (Jupiter) for ethics",
    classifications: ["Kendra (Highest Angle / Zenith)", "Upachaya (Continuous growth)", "Artha Bhava (Purposeful achievement)"],
    primarySignifications: [
      "Karma (one's active vocational contribution, profession, and career achievements)",
      "Rajya (status, executive authority, government recognition, and social standing)",
      "Public dignity, leadership legacy, fame, and professional achievements",
      "Knees, joints, spine, and the structural skeleton that supports physical movement"
    ],
    modernLifeDomains: {
      career: "Executive leadership, public office, corporate direction, entrepreneurship, and professional mastery.",
      relationships: "Relationship with authority figures, bosses, state institutions, and public stakeholders.",
      psychology: "Professional ambition, accountability, pride in good craftsmanship, and sense of duty.",
      materialStability: "Steady earning power through public vocation and sustained career advancement.",
      innerLife: "Living one's career as sacred service (Lokasamgraha - the welfare of the world)."
    },
    commonMisconceptions: [
      "Misconception: 'If the 10th house is empty, you will have no career.' Correction: Most successful professionals have an empty 10th house; career is directed by the 10th lord, its placement, aspects, and the Sun/Saturn.",
      "Misconception: 'Saturn in the 10th destroys careers.' Correction: Saturn in the 10th produces monumental, enduring career heights (such as statesmen and justices), built steadily through immense discipline and patience."
    ],
    howToAnalyze: {
      bhaveshaLordship: "The 10th lord is the key to vocational trajectory. Its dignity in the D1 and D10 (Dashamsha) charts shows career longevity.",
      occupyingPlanets: "Exert powerful Digbala (directional strength for Sun and Mars) and color one's public persona.",
      aspectingPlanets: "Indicate external support or public scrutiny.",
      balancedExample: "Mars in the 10th house in Capricorn (Makara, exalted): Forms Ruchaka Mahapurusha Yoga with supreme Digbala, bestowing exceptional executive drive, courage in leadership, and unmatched strategic execution."
    },
    classicalCitations: "BPHS Ch. 11, v. 20-21; Phaladeepika Ch. 14, v. 11."
  },
  {
    number: 11,
    sanskritName: "Labha / Aya Bhava",
    devanagari: "लाभ / आय भाव",
    englishName: "House of Gains, Aspirations & Social Networks",
    karakaGraha: "Guru (Jupiter) for wealth and expansion",
    classifications: ["Upachaya (Continuous expansion)", "Kama Bhava (Fulfilment of noble desires)"],
    primarySignifications: [
      "Labha (realized profits, income streams, bonus earnings, and financial windfalls)",
      "Fulfilment of long-cherished ambitions, aspirations, and life dreams",
      "Elder siblings, influential mentors, professional syndicates, and expansive social circles",
      "Left ear, shins, calves, ankles, and general vitality in social spaces"
    ],
    modernLifeDomains: {
      career: "Community leadership, digital networks, tech platforms, fundraising, venture capital, and trade associations.",
      relationships: "Friendships with influential peers, elder sibling bonds, and camaraderie within large movements.",
      psychology: "Expansive optimism regarding future goals, communal consciousness, and progressive humanitarian ideals.",
      materialStability: "Diverse multiple streams of recurring income and realization of return on capital.",
      innerLife: "Sharing one's abundance generously with society and dedicating profits to noble causes."
    },
    commonMisconceptions: [
      "Misconception: 'Any planet in the 11th creates instantaneous unearned riches.' Correction: The 11th is an Upachaya house; gains grow systematically through skill, persistent networking, and sustained value delivery.",
      "Misconception: 'Benefics in the 11th make a person greedy.' Correction: Classical texts state that Jupiter or Venus in the 11th generates wealth utilized for righteous philanthropy and community welfare."
    ],
    howToAnalyze: {
      bhaveshaLordship: "The 11th lord connected with the 2nd lord forms the classical Maha-Dhana Yoga (great wealth combination).",
      occupyingPlanets: "All planets—both natural benefics and malefics—are welcomed in the 11th house because they generate gains through their specific traits.",
      aspectingPlanets: "Determine how easily social connections translate into practical success.",
      balancedExample: "Jupiter in the 11th house in Sagittarius or Pisces: Creates expansive, clean income through education, publishing, or advisory roles, accompanied by a loyal network of noble mentors and friends."
    },
    classicalCitations: "BPHS Ch. 11, v. 22-23; Jataka Parijata Ch. 11, v. 72."
  },
  {
    number: 12,
    sanskritName: "Vyaya / Moksha Bhava",
    devanagari: "व्यय / मोक्ष भाव",
    englishName: "House of Surrender, Solitude, Foreign Lands & Liberation",
    karakaGraha: "Shani (Saturn) for detachment; Ketu for spiritual liberation (Moksha)",
    classifications: ["Dusthana (Hidden sector)", "Moksha Bhava (Ultimate Liberation)"],
    primarySignifications: [
      "Moksha (spiritual liberation, transcendence of ego, and final beatitude)",
      "Vyaya (expenditure, letting go, philanthropy, and financial outflow)",
      "Foreign lands, overseas immigration, remote settlements, and secluded institutions",
      "Sleep quality, dreams, subconscious integration, feet, and left eye"
    ],
    modernLifeDomains: {
      career: "International diplomacy, multinational enterprises, humanitarian NGOs, creative writing, retreat centers, and hospital administration.",
      relationships: "Unconditional love that asks for nothing in return; periods of intentional solitude for personal renewal.",
      psychology: "Capacity to surrender control, find comfort in quiet solitude, and dissolve rigid psychological attachments.",
      materialStability: "Budgeting against wasteful expenditures; redirecting resources into meaningful philanthropic investments.",
      innerLife: "Ashram retreats, deep meditation (Dhyana), selfless service without ego, and preparation for spiritual release."
    },
    commonMisconceptions: [
      "Misconception: 'The 12th house only causes bankruptcy and jail.' Correction: The 12th house is the house of foreign travel, multinational success, creative imagination, and above all, Moksha—the ultimate goal of human life.",
      "Misconception: 'Having planets in the 12th ruins worldly success.' Correction: Many international ambassadors, visionary artists, monks, and global business founders have prominent 12th-house placements."
    ],
    howToAnalyze: {
      bhaveshaLordship: "The 12th lord shows where you spend energy, resources, and where foreign connections or spiritual breakthroughs manifest.",
      occupyingPlanets: "Indicate how one handles solitude: Venus gives aesthetic enjoyment and foreign luxury; Ketu gives supreme dispassion and mystical insight.",
      aspectingPlanets: "Reveal whether isolation is restorative or stressful.",
      balancedExample: "Venus in the 12th house in Pisces (Meena, exalted): Highly praised in classical Vedic texts for luxurious comfort, restorative sleep, boundless compassion, artistic sensitivity, and peaceful international travels."
    },
    classicalCitations: "BPHS Ch. 11, v. 24-25; Phaladeepika Ch. 14, v. 13."
  }
];

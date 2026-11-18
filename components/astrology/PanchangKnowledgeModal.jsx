"use client";

import React from "react";
import {
  X,
  BookOpen,
  Sparkles,
  Sun,
  Moon,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

/**
 * Curated Shastric Knowledge for Panchang Elements
 */
export const PANCHANG_KNOWLEDGE_BASE = {
  tithi: {
    titleEn: "Tithi (Lunar Day)",
    titleHi: "तिथि (चन्द्र दिवस)",
    descEn: "A Tithi represents the precise 12° angular distance between the Moon and Sun. Tithis govern the psychological and energetic atmosphere of each day.",
    descHi: "सूर्य और चंद्रमा के बीच प्रत्येक 12° के कोणीय अंतर को तिथि कहते हैं। तिथि दिन की मानसिक व आध्यात्मिक ऊर्जा को निर्धारित करती है।",
    shastraQuote: "तिथेश्च श्रियमाप्नोति — 'By knowing and observing the Tithi, one attains prosperity and mental clarity.'",
    categories: [
      { name: "Nanda (नंदा)", tithis: "1, 6, 11", effect: "Delight, joy, celebration, commencement of learning." },
      { name: "Bhadra (भद्रा)", tithis: "2, 7, 12", effect: "Auspicious works, travel, investments, and ceremonies." },
      { name: "Jaya (जया)", tithis: "3, 8, 13", effect: "Victory, resolving conflicts, courage, spiritual prowess." },
      { name: "Rikta (रिक्ता)", tithis: "4, 9, 14", effect: "Cleansing, shadow work, asceticism; avoid major new ventures." },
      { name: "Poorna (पूर्णा)", tithis: "5, 10, 15", effect: "Fulfilment, completion, marriage, major celebrations." },
    ],
  },
  nakshatra: {
    titleEn: "Nakshatra (Lunar Mansion)",
    titleHi: "नक्षत्र (चंद्र नक्षत्र)",
    descEn: "The 27 Nakshatras form the sidereal star-grid through which the Moon travels. Each Nakshatra spans 13°20' and is presided over by a Vedic deity who imparts distinct cosmic attributes.",
    descHi: "आकाशमंडल के 360° को 27 समान भागों (प्रत्येक 13°20') में बाँटा गया है। प्रत्येक नक्षत्र के एक अधिष्ठाता देव होते हैं जो जातक के स्वभाव को आकार देते हैं।",
    shastraQuote: "नक्षत्राद् हरते पापं — 'Knowledge of the active Nakshatra neutralizes negative karma and aligns one with cosmic harmony.'",
    ganaTypes: [
      { name: "Deva (देव गण)", nature: "Sattvic, compassionate, peaceful, devoted to higher truth." },
      { name: "Manushya (मनुष्य गण)", nature: "Rajasic, dynamic, industrious, balanced worldly temperament." },
      { name: "Rakshasa (राक्षस गण)", nature: "Tamasic/Fierce, penetrating intellect, assertive, protective power." },
    ],
  },
  yoga: {
    titleEn: "Yoga (Solar-Lunar Union)",
    titleHi: "योग (सूर्य-चंद्र संयोग)",
    descEn: "Yoga is calculated by adding the sidereal longitudes of the Sun and Moon. There are 27 Yogas that govern health, emotional resilience, and the subtle auspiciousness of daily actions.",
    descHi: "सूर्य और चंद्र के भोगांशों के योग से 27 योग बनते हैं। यह शरीर के स्वास्थ्य, संबंध और कार्यों की सफलता में अत्यंत महत्वपूर्ण भूमिका निभाते हैं।",
    shastraQuote: "योगाद् रोगनिवारणम् — 'Understanding the active Yoga preserves health and prevents bodily disharmony.'",
    auspiciousYogas: ["Priti", "Ayushman", "Saubhagya", "Shobhana", "Sukarman", "Dhriti", "Vriddhi", "Dhruva", "Harshana", "Siddhi", "Variyan", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra"],
    cautionYogas: ["Vishkambha", "Atiganda", "Shoola", "Ganda", "Vyaghata", "Vajra", "Vyatipata", "Parigha", "Vaidhriti"],
  },
  karana: {
    titleEn: "Karana (Half-Tithi)",
    titleHi: "करण (अर्ध-तिथि)",
    descEn: "A Karana equals half a Tithi (6° of lunar distance). There are 11 Karanas in total: 7 moveable and 4 fixed. Karana determines the success and momentum of dynamic daily deeds.",
    descHi: "तिथि के आधे भाग (6°) को करण कहते हैं। कुल 11 करण होते हैं (7 चर और 4 स्थिर)। करण से कार्यों की सफलता व सिद्धि का निर्णय होता है।",
    shastraQuote: "करणात् कार्यसिद्धिः — 'One attains complete success in designated deeds by undertaking them in their corresponding Karana.'",
    bhadraNotice: "Vishti (विष्टि) Karana is classically known as Bhadra. It is considered intense and ideal for research, destruction of obstacles, and spiritual defense, while marriage and new construction are traditionally deferred.",
  },
  vara: {
    titleEn: "Vara (Weekday & Planetary Ruler)",
    titleHi: "वार (सप्ताह का दिन व ग्रहाधिपति)",
    descEn: "Each day from sunrise to next sunrise is ruled by one of the seven classical visible Grahas, governing physical vitality, longevity, and optimal daily routines.",
    descHi: "सूर्योदय से अगले सूर्योदय तक का दिन वार कहलाता है, जिसके स्वामी 7 नवग्रहों में से एक होते हैं। वार से दीर्घायु व बल की प्राप्ति होती है।",
    shastraQuote: "वाराद् आयुर्विवर्धनम् — 'Right observance of the weekday Graha enhances longevity, vitality, and physical vigour.'",
  },
  muhurta: {
    titleEn: "Auspicious & Inauspicious Timings",
    titleHi: "शुभ व अशुभ मुहूर्त काल",
    descEn: "Vedic time measurement divides daytime and nighttime into precise Muhurta windows (each approx 48 minutes). Aligning key tasks with auspicious Muhurtas guarantees cosmic support.",
    descHi: "वैदिक काल-गणना में दिन-रात को 30 मुहूर्तों में बाँटा गया है। शुभ मुहूर्तों में कार्य आरंभ करने से दैवीय सहायता प्राप्त होती है।",
    shastraQuote: "मुहूर्ते सर्वकार्याणि — 'All noble tasks prosper when commenced in an auspicious cosmic window.'",
  },
};

export default function PanchangKnowledgeModal({
  isOpen,
  onClose,
  elementKey = "tithi",
  currentData,
  isHi = false,
  onOpenExplorer,
}) {
  if (!isOpen) return null;

  const info = PANCHANG_KNOWLEDGE_BASE[elementKey] || PANCHANG_KNOWLEDGE_BASE.tithi;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#ede5d6] shadow-2xl max-w-lg w-full p-6 space-y-4 relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ede5d6] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#faf7f0] text-[#c4903c] border border-[#ede5d6]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-serif leading-tight">
                {isHi ? info.titleHi : info.titleEn}
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                {isHi ? "वैदिक शास्त्र सम्मत ज्ञान व रहस्य" : "Vedic Shastric Wisdom & Astrological Significance"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Value Banner */}
        {currentData && (
          <div className="bg-[#faf7f0] border border-[#ede5d6] rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#ede5d6] flex items-center justify-center text-[#c4903c]">
                {elementKey === "tithi" && <Moon className="w-5 h-5" />}
                {elementKey === "nakshatra" && <Sparkles className="w-5 h-5" />}
                {elementKey === "yoga" && <Sun className="w-5 h-5" />}
                {elementKey === "karana" && <Compass className="w-5 h-5" />}
                {elementKey === "vara" && <Clock className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  {isHi ? "आज सक्रिय" : "Currently Active Today"}
                </span>
                <span className="text-sm font-bold text-stone-900 font-serif">
                  {currentData.name || currentData.title || currentData.value}
                </span>
                {currentData.sub && (
                  <span className="text-xs text-stone-500 block">{currentData.sub}</span>
                )}
              </div>
            </div>
            {currentData.status && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {currentData.status}
              </span>
            )}
          </div>
        )}

        {/* Classical Shastra Quote */}
        {info.shastraQuote && (
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 font-medium italic flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#c4903c] shrink-0 mt-0.5" />
            <div>
              <span>{info.shastraQuote}</span>
              <span className="text-[10px] text-stone-500 block mt-0.5 not-italic font-sans">
                — Brihat Parashara Hora Shastra / Muhurta Chintamani
              </span>
            </div>
          </div>
        )}

        {/* Shastric Description */}
        <div className="text-xs text-stone-700 leading-relaxed space-y-2">
          <p>{isHi ? info.descHi : info.descEn}</p>
        </div>

        {/* Element-specific breakdowns */}
        {elementKey === "tithi" && info.categories && (
          <div className="space-y-1.5 pt-2 border-t border-[#ede5d6]">
            <h4 className="text-xs font-bold text-stone-800">
              {isHi ? "5 प्रकार की तिथियाँ व उनका प्रभाव:" : "The 5 Classical Tithi Classifications:"}
            </h4>
            <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto">
              {info.categories.map((cat) => (
                <div key={cat.name} className="p-2 rounded-lg bg-[#faf8f4] border border-[#ede5d6] text-[11px]">
                  <span className="font-bold text-[#13382c]">{cat.name}</span>{" "}
                  <span className="text-stone-500 font-mono">({cat.tithis}):</span>{" "}
                  <span className="text-stone-700">{cat.effect}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {elementKey === "yoga" && (
          <div className="space-y-2 pt-2 border-t border-[#ede5d6] text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isHi ? "शुभ व कल्याणकारी योग (18 योग)" : "Highly Benefic Yogas (18 Yogas):"}</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-normal">
              {info.auspiciousYogas.join(", ")}
            </p>

            <div className="flex items-center gap-1.5 text-amber-700 font-bold pt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isHi ? "सावधानी / साधना हेतु योग (9 योग)" : "Inauspicious / Introspection Yogas (9 Yogas):"}</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-normal">
              {info.cautionYogas.join(", ")}
            </p>
          </div>
        )}

        {elementKey === "karana" && info.bhadraNotice && (
          <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-[11px] text-orange-950 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <p>{info.bhadraNotice}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#ede5d6]">
          {onOpenExplorer && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenExplorer(elementKey);
              }}
              className="text-xs font-semibold text-[#13382c] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isHi ? "ज्ञान ग्राफ में गहराई से देखें" : "Explore in Knowledge Graph"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-2 rounded-xl bg-[#13382c] text-white text-xs font-bold hover:bg-[#1a4a3b] transition cursor-pointer"
          >
            {isHi ? "समझ गया" : "Got it"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { Clock, Star, Flame, Scale, Sunrise, Sunset } from "lucide-react";

export default function PanchangCard() {
  const panchangData = [
    { label: "Tithi", value: "Ashtami (Till 14:32)", icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Nakshatra", value: "Rohini (Till 18:21)", icon: Star, color: "text-purple-600 bg-purple-50" },
    { label: "Yoga", value: "Siddhi", icon: Flame, color: "text-orange-600 bg-orange-50" },
    { label: "Karana", value: "Bava", icon: Scale, color: "text-blue-600 bg-blue-50" },
    { label: "Sunrise", value: "06:11 AM", icon: Sunrise, color: "text-amber-500 bg-amber-50" },
    { label: "Sunset", value: "05:48 PM", icon: Sunset, color: "text-rose-500 bg-rose-50" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
          Today's Panchang
        </h3>
        <div className="text-right">
          <span className="text-[11px] font-semibold text-stone-700 block">
            14 October 2026
          </span>
          <span className="text-[10px] text-stone-400 block -mt-0.5">Wednesday</span>
        </div>
      </div>

      {/* Grid of 6 Attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
        {panchangData.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-stone-50 transition"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                  {item.label}
                </span>
                <span className="text-xs font-semibold text-stone-800 truncate block">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

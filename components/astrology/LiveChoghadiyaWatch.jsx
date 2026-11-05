"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Clock,
  Sun,
  Moon,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info,
  Calendar,
  MapPin,
  X,
  ShieldCheck,
  Compass,
  Check,
  Settings2,
  RotateCcw,
  Layers,
} from "lucide-react";

/**
 * Classical Vedic guidance metadata for each of the 7 Choghadiya types
 * Sources: Muhurta Chintamani, Surya Siddhanta, Brihat Samhita
 */
const CHOGHADIYA_GUIDANCE = {
  Amrit: {
    key: "Amrit",
    nameEn: "Amrit (Nectar)",
    nameHi: "अमृत",
    lord: "Moon (चन्द्र)",
    quality: "good",
    nature: "Best (सर्वोत्तम / अति शुभ)",
    descriptionEn: "Supreme auspicious period conferring nectarine vitality, peace, and lasting prosperity.",
    descriptionHi: "सर्वोत्तम एवं परम कल्याणकारी समय। सभी प्रकार के शुभ एवं मांगलिक कार्यों के लिए अत्यंत फलदायी।",
    favorableForEn: "Initiating long-term projects, travel, medical treatments, ceremonies, education, signing contracts.",
    favorableForHi: "नवीन कार्य प्रारंभ, यात्रा, चिकित्सा, गृह प्रवेश, विद्यारंभ, मांगलिक कार्य।",
    avoidEn: "Destructive activities, lawsuits, or conflicts.",
    avoidHi: "विवाद, कलह अथवा अनैतिक कार्य।",
  },
  Shubh: {
    key: "Shubh",
    nameEn: "Shubh (Auspicious)",
    nameHi: "शुभ",
    lord: "Jupiter (बृहस्पति)",
    quality: "good",
    nature: "Auspicious (शुभ)",
    descriptionEn: "Benevolent period governed by Guru, conferring wisdom, spiritual grace, and righteous success.",
    descriptionHi: "देवगुरु बृहस्पति द्वारा शासित शुभ काल। धार्मिक अनुष्ठान, विवाह एवं ज्ञानार्जन हेतु उत्तम।",
    favorableForEn: "Religious ceremonies, wedding talks, spiritual sadhana, financial investments, educational ventures.",
    favorableForHi: "पूजा-पाठ, विवाह चर्चा, धार्मिक अनुष्ठान, निवेश, नवीन प्रतिष्ठान का उद्घाटन।",
    avoidEn: "Deceitful or unethical practices.",
    avoidHi: "अधर्म एवं असत्य आचरण।",
  },
  Labh: {
    key: "Labh",
    nameEn: "Labh (Gainful)",
    nameHi: "लाभ",
    lord: "Mercury (बुध)",
    quality: "good",
    nature: "Gainful & Prosperous (लाभदायक)",
    descriptionEn: "Highly beneficial period governed by Budha, fostering financial profit, trade, and learning.",
    descriptionHi: "बुध ग्रह द्वारा शासित लाभकारी काल। व्यापारिक लाभ, खाता-बही पूजन एवं वाणिज्य हेतु श्रेष्ठ।",
    favorableForEn: "Launching commercial businesses, buying stock, opening accounts, learning new skills, meetings.",
    favorableForHi: "व्यापारिक लेन-देन, नए खाते खोलना, दुकान शुरू करना, वाणिज्यिक अनुबंध।",
    avoidEn: "Speculative gambling without sound preparation.",
    avoidHi: "अविवेकपूर्ण सट्टेबाजी।",
  },
  Char: {
    key: "Char",
    nameEn: "Char (Motion / Neutral)",
    nameHi: "चर",
    lord: "Venus (शुक्र)",
    quality: "neutral",
    nature: "Dynamic & Moving (सामान्य / चलायमान)",
    descriptionEn: "Period of dynamic movement and flow, well-suited for travel and vehicular acquisition.",
    descriptionHi: "शुक्र द्वारा शासित गतिशील समय। यात्रा, वाहन क्रय एवं चलायमान गतिविधियों के लिए उत्तम।",
    favorableForEn: "Journeys, vehicle purchases, machinery operation, dynamic movement, dance, arts.",
    favorableForHi: "यात्रा आरंभ, वाहन क्रय, गतिमान कार्य, कला एवं मनोरंजन।",
    avoidEn: "Fixed investments or laying foundation stones requiring long-term immobility.",
    avoidHi: "स्थिर कार्य जैसे नींव डालना अथवा अचल सम्पत्ति का दीर्घकालिक संकल्प।",
  },
  Rog: {
    key: "Rog",
    nameEn: "Rog (Disease / Inauspicious)",
    nameHi: "रोग",
    lord: "Mars (मंगल)",
    quality: "bad",
    nature: "Challenging (अशुभ / रोग कारक)",
    descriptionEn: "Volatile period governed by Mangal; creates physical strain, disagreements, and debility.",
    descriptionHi: "मंगल ग्रह द्वारा शासित अशुभ काल। इस समय नए कार्यों के शुभारंभ से रोग एवं बाधा की आशंका रहती है।",
    favorableForEn: "Defeating adversaries, competitive sports, surgeries, boundary defense.",
    favorableForHi: "शत्रु दमन, शल्य चिकित्सा (ऑपरेशन), प्रतिस्पर्धी अभ्यास।",
    avoidEn: "Auspicious beginnings, lending money, signing partnership contracts, travel.",
    avoidHi: "मांगलिक कार्य, ऋण देना, नया अनुबंध, शुभ यात्रा।",
  },
  Kaal: {
    key: "Kaal",
    nameEn: "Kaal (Loss / Inauspicious)",
    nameHi: "काल",
    lord: "Saturn (शनि)",
    quality: "bad",
    nature: "Destructive / Inauspicious (अशुभ / काल)",
    descriptionEn: "Heavy period governed by Shani; delays, loss of wealth, and hindrances in new endeavors.",
    descriptionHi: "शनिदेव द्वारा शासित प्रतिकूल समय। नए उपक्रमों में विलंब एवं हानि कारक माना गया है।",
    favorableForEn: "Deep solitary research, scrap disposal, dealing with iron/machinery, ascetic contemplation.",
    favorableForHi: "एकांत साधना, लोहे व मशीनरी का कार्य, पुरानी वस्तुओं का निस्तारण।",
    avoidEn: "All auspicious undertakings, marriages, traveling, purchasing luxury assets.",
    avoidHi: "समस्त मांगलिक कार्य, यात्रा, नए व्यापार का आरंभ।",
  },
  Udveg: {
    key: "Udveg",
    nameEn: "Udveg (Agitation / Inauspicious)",
    nameHi: "उद्वेग",
    lord: "Sun (सूर्य)",
    quality: "bad",
    nature: "Agitating (अशुभ / चिंताजनक)",
    descriptionEn: "Restless period governed by Surya; may induce anxiety, tension, or conflict with authorities.",
    descriptionHi: "सूर्य ग्रह द्वारा शासित चिंताजनक काल। मानसिक अशांति एवं कलह उत्पन्न कर सकता है।",
    favorableForEn: "Government-related compliance, filing formal petitions, spiritual meditation, Sun salutations.",
    favorableForHi: "सरकारी कार्य, औपचारिक प्रार्थना, सूर्य उपासना एवं आत्म-चिंतन।",
    avoidEn: "Peaceful negotiations, business launches, marital celebrations.",
    avoidHi: "पारिवारिक समझौते, व्यापार शुभारंभ, वैवाहिक बातचीत।",
  },
};

/**
 * Synthesizes a soothing temple bell chime using Web Audio API (zero external asset dependencies).
 */
function playTempleChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Primary fundamental: 528 Hz (Solfeggio Transformation / Heart resonance)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(528, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(532, ctx.currentTime + 0.8);
    gain1.gain.setValueAtTime(0.18, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 1.4);

    // Harmonic overtone: 1056 Hz (gentle bell shimmer)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1056, ctx.currentTime);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();
    osc2.stop(ctx.currentTime + 0.9);
  } catch (err) {
    console.debug("Web Audio chime suppressed:", err);
  }
}

/**
 * Formats milliseconds into HH:MM:SS format
 */
function formatHMS(ms) {
  if (ms <= 0 || isNaN(ms)) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function LiveChoghadiyaWatch({
  choghadiya,
  selectedDate,
  timezoneOffsetHours = 5.5,
  locationName = "New Delhi",
  language = "en",
}) {
  const isHi = language === "hi" || language === "hindi";

  // Mounted guard for hydration safety
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());

  // Tabs: day | night | all
  const [activeTab, setActiveTab] = useState("day");

  // User alert preferences (persisted in localStorage where available)
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [audioChimeEnabled, setAudioChimeEnabled] = useState(true);
  const [remind10m, setRemind10m] = useState(false);
  const [remind5m, setRemind5m] = useState(true);
  const [remindOnStart, setRemindOnStart] = useState(true);
  const [showAlertSettingsModal, setShowAlertSettingsModal] = useState(false);
  const [notifiedSlots, setNotifiedSlots] = useState({});

  // Display mode for progress: circular vs linear
  const [progressDisplayMode, setProgressDisplayMode] = useState("both"); // circular | linear | both

  // Selected slot for deep modal inspection
  const [selectedSlotForDetails, setSelectedSlotForDetails] = useState(null);

  // In-app alert banner
  const [currentAlertBanner, setCurrentAlertBanner] = useState(null);

  // Reference to track previous slot for transition notifications
  const prevSlotIdRef = useRef(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    setMounted(true);
    setNow(new Date());

    try {
      const savedPrefs = localStorage.getItem("gurukul_choghadiya_prefs_v2");
      if (savedPrefs) {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.alertsEnabled !== undefined) setAlertsEnabled(parsed.alertsEnabled);
        if (parsed.audioChimeEnabled !== undefined) setAudioChimeEnabled(parsed.audioChimeEnabled);
        if (parsed.remind10m !== undefined) setRemind10m(parsed.remind10m);
        if (parsed.remind5m !== undefined) setRemind5m(parsed.remind5m);
        if (parsed.remindOnStart !== undefined) setRemindOnStart(parsed.remindOnStart);
      }
    } catch (e) {
      console.debug("Could not read alert preferences:", e);
    }

    // Interval timer for 1-second live clock update
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    // Visibility change handler: resync instantly when tab gains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setNow(new Date());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Save preferences to localStorage on change
  const savePreferences = (newPrefs) => {
    try {
      localStorage.setItem("gurukul_choghadiya_prefs_v2", JSON.stringify(newPrefs));
    } catch (e) {
      console.debug("Could not save alert preferences:", e);
    }
  };

  // Check if viewing today's actual local date
  const isViewingToday = useMemo(() => {
    if (!selectedDate) return true;
    const tzMs = timezoneOffsetHours * 3600 * 1000;
    const localNow = new Date(now.getTime() + tzMs);
    const todayStr = localNow.toISOString().split("T")[0];
    return selectedDate === todayStr;
  }, [selectedDate, now, timezoneOffsetHours]);

  // Combine all 16 slots (8 day + 8 night) with fallback parsing
  const all16Slots = useMemo(() => {
    if (!choghadiya) return [];
    const day = Array.isArray(choghadiya.day) ? choghadiya.day : [];
    const night = Array.isArray(choghadiya.night) ? choghadiya.night : [];
    return [...day, ...night];
  }, [choghadiya]);

  // Determine current active slot based on the live `now` timestamp
  const { currentSlot, currentSlotIndex, isCurrentlyDay, elapsedMs, remainingMs, progressPercent } = useMemo(() => {
    if (!all16Slots.length) {
      return {
        currentSlot: null,
        currentSlotIndex: -1,
        isCurrentlyDay: true,
        elapsedMs: 0,
        remainingMs: 0,
        progressPercent: 0,
      };
    }

    const nowMs = now.getTime();

    // 1. First attempt exact ms match using startMs / endMs
    let matchedSlot = null;
    let matchedIdx = -1;

    for (let i = 0; i < all16Slots.length; i++) {
      const s = all16Slots[i];
      let startMs = s.startMs || (s.startUtc ? new Date(s.startUtc).getTime() : null);
      let endMs = s.endMs || (s.endUtc ? new Date(s.endUtc).getTime() : null);

      if (startMs && endMs && nowMs >= startMs && nowMs < endMs) {
        matchedSlot = s;
        matchedIdx = i;
        break;
      }
    }

    // 2. Fallback using startLocal / endLocal HH:MM matching against local time of `now`
    if (!matchedSlot) {
      const tzMs = timezoneOffsetHours * 3600 * 1000;
      const localNow = new Date(nowMs + tzMs);
      const nowH = localNow.getUTCHours();
      const nowM = localNow.getUTCMinutes();
      const nowTotalMin = nowH * 60 + nowM;

      for (let i = 0; i < all16Slots.length; i++) {
        const s = all16Slots[i];
        if (s.startLocal && s.endLocal) {
          const [sH, sM] = s.startLocal.split(":").map(Number);
          const [eH, eM] = s.endLocal.split(":").map(Number);
          const startMin = sH * 60 + sM;
          const endMin = eH * 60 + eM;

          if (endMin > startMin) {
            if (nowTotalMin >= startMin && nowTotalMin < endMin) {
              matchedSlot = s;
              matchedIdx = i;
              break;
            }
          } else {
            // Crosses midnight
            if (nowTotalMin >= startMin || nowTotalMin < endMin) {
              matchedSlot = s;
              matchedIdx = i;
              break;
            }
          }
        }
      }
    }

    // Fallback if still null: check static isActive or default to first slot
    if (!matchedSlot) {
      matchedSlot = all16Slots.find((s) => s.isActive) || all16Slots[0];
      matchedIdx = all16Slots.indexOf(matchedSlot);
    }

    // Calculate elapsed and remaining
    let startMs = matchedSlot?.startMs || (matchedSlot?.startUtc ? new Date(matchedSlot.startUtc).getTime() : null);
    let endMs = matchedSlot?.endMs || (matchedSlot?.endUtc ? new Date(matchedSlot.endUtc).getTime() : null);

    let elapsed = 0;
    let remaining = 0;
    let progress = 0;

    if (startMs && endMs && endMs > startMs) {
      const totalSpan = endMs - startMs;
      elapsed = Math.max(0, Math.min(totalSpan, nowMs - startMs));
      remaining = Math.max(0, endMs - nowMs);
      progress = Math.min(100, Math.max(0, Math.round((elapsed / totalSpan) * 100)));
    } else {
      const fallbackSpan = 90 * 60 * 1000;
      elapsed = fallbackSpan / 2;
      remaining = fallbackSpan / 2;
      progress = 50;
    }

    return {
      currentSlot: matchedSlot,
      currentSlotIndex: matchedIdx,
      isCurrentlyDay: matchedSlot ? matchedSlot.isDay : true,
      elapsedMs: elapsed,
      remainingMs: remaining,
      progressPercent: progress,
    };
  }, [all16Slots, now, timezoneOffsetHours]);

  // Duration string for current slot
  const currentSlotDurationStr = useMemo(() => {
    if (!currentSlot) return "1h 30m";
    const startMs = currentSlot.startMs || (currentSlot.startUtc ? new Date(currentSlot.startUtc).getTime() : null);
    const endMs = currentSlot.endMs || (currentSlot.endUtc ? new Date(currentSlot.endUtc).getTime() : null);
    if (startMs && endMs && endMs > startMs) {
      const diffMin = Math.round((endMs - startMs) / 60000);
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
    return "1h 30m";
  }, [currentSlot]);

  // Next upcoming slot
  const nextSlot = useMemo(() => {
    if (!all16Slots.length || currentSlotIndex === -1) return null;
    const nextIdx = (currentSlotIndex + 1) % all16Slots.length;
    return all16Slots[nextIdx];
  }, [all16Slots, currentSlotIndex]);

  // Slots to display in the grid based on activeTab
  const displayedSlots = useMemo(() => {
    if (activeTab === "day") return choghadiya?.day || [];
    if (activeTab === "night") return choghadiya?.night || [];
    return all16Slots;
  }, [activeTab, choghadiya, all16Slots]);

  // Check alert notifications when remaining time hits threshold (5 min, 10 min, or slot transition)
  useEffect(() => {
    if (!alertsEnabled || !currentSlot || !isViewingToday) return;

    const slotId = `${currentSlot.type}-${currentSlot.startLocal}`;

    // A. Slot transition notification (when new period starts)
    if (remindOnStart && prevSlotIdRef.current && prevSlotIdRef.current !== slotId) {
      const startKey = `${slotId}-started`;
      if (!notifiedSlots[startKey]) {
        setNotifiedSlots((prev) => ({ ...prev, [startKey]: true }));

        const startMsg = isHi
          ? `शुभ आरंभ: ${currentSlot.nameHi} चौघड़िया प्रारंभ हो गया है (${currentSlot.startLocal} – ${currentSlot.endLocal}, स्वामी: ${currentSlot.lord})`
          : `New Period: ${currentSlot.nameEn} Choghadiya has started (${currentSlot.startLocal} – ${currentSlot.endLocal}, Lord: ${currentSlot.lord}).`;

        setCurrentAlertBanner(startMsg);

        if (audioChimeEnabled) playTempleChime();

        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(isHi ? "वैदिक चौघड़िया परिवर्तन सूचना" : "Vedic Choghadiya Transition", {
              body: startMsg,
              icon: "/favicon.ico",
            });
          } catch (e) {
            console.debug("Notification error:", e);
          }
        }
      }
    }
    prevSlotIdRef.current = slotId;

    // B. Pre-transition reminder (5m or 10m)
    const remainingMinutes = remainingMs / 60000;

    const checkReminder = (threshold, label) => {
      const slotKey = `${slotId}-${threshold}m`;
      if (remainingMinutes <= threshold && remainingMinutes > threshold - 1 && !notifiedSlots[slotKey]) {
        setNotifiedSlots((prev) => ({ ...prev, [slotKey]: true }));

        const alertMsg = isHi
          ? `सावधान: वर्तमान ${currentSlot.nameHi} चौघड़िया समाप्त होने में केवल ${threshold} मिनट शेष हैं। आगामी मुहूर्त: ${nextSlot?.nameHi || ""}`
          : `Notice: Current ${currentSlot.nameEn} Choghadiya ends in ${threshold} minutes. Upcoming: ${nextSlot?.nameEn || ""}`;

        setCurrentAlertBanner(alertMsg);

        if (audioChimeEnabled) playTempleChime();

        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(isHi ? "वैदिक चौघड़िया समाप्ति सूचना" : "Vedic Choghadiya Ending Alert", {
              body: alertMsg,
              icon: "/favicon.ico",
            });
          } catch (e) {
            console.debug("Notification error:", e);
          }
        }
      }
    };

    if (remind10m) checkReminder(10, "10m");
    if (remind5m) checkReminder(5, "5m");
  }, [
    alertsEnabled,
    remainingMs,
    remind10m,
    remind5m,
    remindOnStart,
    currentSlot,
    nextSlot,
    notifiedSlots,
    audioChimeEnabled,
    isViewingToday,
    isHi,
  ]);

  // Request browser notification permission
  const handleToggleAlerts = async () => {
    if (!alertsEnabled) {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          const perm = await Notification.requestPermission();
          if (perm === "granted") {
            setAlertsEnabled(true);
            savePreferences({ alertsEnabled: true, audioChimeEnabled, remind10m, remind5m, remindOnStart });
          } else {
            setAlertsEnabled(true);
            savePreferences({ alertsEnabled: true, audioChimeEnabled, remind10m, remind5m, remindOnStart });
          }
        } else {
          setAlertsEnabled(true);
          savePreferences({ alertsEnabled: true, audioChimeEnabled, remind10m, remind5m, remindOnStart });
        }
      } else {
        setAlertsEnabled(true);
        savePreferences({ alertsEnabled: true, audioChimeEnabled, remind10m, remind5m, remindOnStart });
      }
    } else {
      setAlertsEnabled(false);
      setCurrentAlertBanner(null);
      savePreferences({ alertsEnabled: false, audioChimeEnabled, remind10m, remind5m, remindOnStart });
    }
  };

  // Local time formatting for clock display
  const localTimeObj = useMemo(() => {
    const tzMs = timezoneOffsetHours * 3600 * 1000;
    const local = new Date(now.getTime() + tzMs);
    const hours = local.getUTCHours();
    const minutes = local.getUTCMinutes();
    const seconds = local.getUTCSeconds();
    const hh = String(hours % 12 || 12).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    return {
      hours,
      minutes,
      seconds,
      display24: `${String(hours).padStart(2, "0")}:${mm}:${ss}`,
      display12: `${hh}:${mm}:${ss} ${ampm}`,
      hours12: hours % 12 || 12,
    };
  }, [now, timezoneOffsetHours]);

  // Analog Clock angles
  const secondHandAngle = (localTimeObj.seconds / 60) * 360;
  const minuteHandAngle = ((localTimeObj.minutes + localTimeObj.seconds / 60) / 60) * 360;
  const hourHandAngle = (((localTimeObj.hours % 12) + localTimeObj.minutes / 60) / 12) * 360;

  // Quality badge styling
  const getQualityBadgeStyle = (quality) => {
    if (quality === "good") {
      return "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300/40";
    }
    if (quality === "neutral") {
      return "bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-300/40";
    }
    return "bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-300/40";
  };

  const getQualityThemeBg = (quality) => {
    if (quality === "good") return "from-emerald-950/85 via-emerald-900/60 to-stone-900";
    if (quality === "neutral") return "from-sky-950/85 via-sky-900/60 to-stone-900";
    return "from-rose-950/85 via-amber-950/60 to-stone-900";
  };

  // Safe fallback if unmounted
  if (!mounted) {
    return (
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs animate-pulse space-y-4">
        <div className="h-6 w-48 bg-stone-200 rounded-md"></div>
        <div className="h-44 bg-stone-100 rounded-2xl"></div>
      </div>
    );
  }

  // Handle unavailable data state
  if (!choghadiya || (!choghadiya.day?.length && !choghadiya.night?.length)) {
    return (
      <div className="bg-white border border-stone-200 rounded-3xl p-8 text-center space-y-3 shadow-xs">
        <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
        <h3 className="font-serif font-bold text-stone-900 text-lg">
          {isHi ? "चौघड़िया डेटा लोड हो रहा है..." : "Choghadiya Calculations Unavailable"}
        </h3>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          {isHi
            ? `${locationName} के लिए सूर्योदय एवं सूर्यास्त आधारित चौघड़िया मुहूर्त की गणना की जा रही है।`
            : `Calculating astronomical day & night intervals for ${locationName}. Please verify coordinates or reload.`}
        </p>
      </div>
    );
  }

  const currentMeta = CHOGHADIYA_GUIDANCE[currentSlot?.type] || CHOGHADIYA_GUIDANCE["Char"];

  // Circular ring stroke calculation
  const ringRadius = 50;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (ringCircumference * progressPercent) / 100;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* HISTORICAL / FUTURE DATE PREVIEW BANNER                       */}
      {/* ------------------------------------------------------------- */}
      {!isViewingToday && selectedDate && (
        <div className="bg-sky-50 border border-sky-200 text-sky-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              {isHi
                ? `आप ${selectedDate} की चौघड़िया सारणी देख रहे हैं (पूर्वावलोकन)। लाइव उलटी गिनती आज के वर्तमान समय पर सक्रिय होती है।`
                : `Viewing calculated Choghadiya schedule for ${selectedDate} (Preview Mode). Real-time countdown runs for today's live time.`}
            </span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* IN-APP ALERT BANNER (If Triggered)                           */}
      {/* ------------------------------------------------------------- */}
      {currentAlertBanner && (
        <div className="bg-amber-500/10 border border-amber-500/40 text-amber-950 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <Bell className="w-4 h-4 text-amber-700 animate-bounce" />
            <span>{currentAlertBanner}</span>
          </div>
          <button
            onClick={() => setCurrentAlertBanner(null)}
            className="p-1 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-200/50"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MASTER LIVE CHOGHADIYA WATCH & REAL-TIME COUNTDOWN HERO       */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${getQualityThemeBg(
          currentSlot?.quality
        )} text-white p-6 sm:p-8 shadow-md border border-stone-700/60 transition-colors duration-700`}
      >
        {/* Subtle background ornamentation */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT COLUMN: Premium Analog & Digital Watch (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
            {/* Analog Clock Face */}
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-stone-900/90 border-4 border-[#c4903c]/70 shadow-2xl flex items-center justify-center">
              {/* Hour markers */}
              {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => {
                const angle = (n / 12) * 360;
                return (
                  <div
                    key={n}
                    className="absolute text-[10px] font-serif font-bold text-amber-200/80"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-400%) rotate(-${angle}deg)`,
                    }}
                  >
                    {n}
                  </div>
                );
              })}

              {/* Minute ticks */}
              <div className="absolute inset-1 rounded-full border border-stone-700/60 pointer-events-none" />

              {/* Hour Hand */}
              <div
                className="absolute w-1.5 h-11 bg-amber-100 rounded-full origin-bottom shadow-md"
                style={{
                  bottom: "50%",
                  transform: `rotate(${hourHandAngle}deg)`,
                  transition: "transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
                }}
              />

              {/* Minute Hand */}
              <div
                className="absolute w-1 h-16 bg-[#c4903c] rounded-full origin-bottom shadow-md"
                style={{
                  bottom: "50%",
                  transform: `rotate(${minuteHandAngle}deg)`,
                  transition: "transform 0.2s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
                }}
              />

              {/* Second Hand */}
              <div
                className="absolute w-0.5 h-18 bg-rose-500 rounded-full origin-bottom shadow-xs"
                style={{
                  bottom: "50%",
                  transform: `rotate(${secondHandAngle}deg)`,
                  transition: "transform 0.1s linear",
                }}
              />

              {/* Center Jewel */}
              <div className="absolute w-3.5 h-3.5 rounded-full bg-[#c4903c] border-2 border-stone-900 shadow-sm" />
            </div>

            {/* Digital Clock Readout & Timezone */}
            <div className="text-center space-y-1">
              <span className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-amber-100 drop-shadow-xs">
                {localTimeObj.display12}
              </span>
              <div className="flex items-center justify-center gap-2 text-[11px] text-stone-300">
                <MapPin className="w-3 h-3 text-[#c4903c]" />
                <span>{locationName}</span>
                <span>•</span>
                <span>UTC {timezoneOffsetHours >= 0 ? `+${timezoneOffsetHours}` : timezoneOffsetHours}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Choghadiya Status & Real-Time Countdown (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Header pill & Live indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-700/60 pb-3">
              <div className="flex items-center gap-2">
                {isViewingToday ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {isHi ? "सक्रिय चौघड़िया मुहूर्त (LIVE NOW)" : "ACTIVE CHOGHADIYA (LIVE NOW)"}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    {isHi ? `चौघड़िया पूर्वावलोकन (${selectedDate})` : `SCHEDULE PREVIEW (${selectedDate})`}
                  </span>
                )}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
                  {isCurrentlyDay ? (isHi ? "दिन काल" : "Day Period") : (isHi ? "रात्रि काल" : "Night Period")}
                </span>
              </div>

              {/* Notification & Sound Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleAlerts}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                    alertsEnabled
                      ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
                      : "bg-stone-800/80 text-stone-400 border-stone-700 hover:text-white"
                  }`}
                  title={alertsEnabled ? "Transition alerts active" : "Enable transition alerts"}
                >
                  {alertsEnabled ? <Bell className="w-3.5 h-3.5 text-amber-400" /> : <BellOff className="w-3.5 h-3.5" />}
                  <span>{alertsEnabled ? (isHi ? "अलर्ट चालू" : "Alerts ON") : (isHi ? "अलर्ट बंद" : "Alerts OFF")}</span>
                </button>

                {alertsEnabled && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowAlertSettingsModal(true)}
                      className="p-1.5 rounded-xl border border-stone-700 bg-stone-800 text-amber-200 hover:bg-stone-700 text-xs transition"
                      title="Alert settings"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setAudioChimeEnabled(!audioChimeEnabled)}
                      className={`p-1.5 rounded-xl border text-xs transition cursor-pointer ${
                        audioChimeEnabled
                          ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
                          : "bg-stone-800 text-stone-400 border-stone-700"
                      }`}
                      title={audioChimeEnabled ? "Chime sound enabled" : "Chime sound muted"}
                    >
                      {audioChimeEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Current Choghadiya Title & Quality Badge */}
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
                  <span>{isHi ? currentSlot?.nameHi : currentSlot?.nameEn}</span>
                  <span className="text-sm sm:text-base font-normal text-amber-200/90 font-sans">
                    ({isHi ? currentMeta.nameEn : currentMeta.nameHi})
                  </span>
                </h2>
                <p className="text-xs text-stone-300 mt-1">
                  {isHi ? currentMeta.nature : currentMeta.descriptionEn}
                </p>
              </div>

              <span
                className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${
                  currentSlot?.quality === "good"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50"
                    : currentSlot?.quality === "neutral"
                    ? "bg-sky-500/20 text-sky-300 border-sky-400/50"
                    : "bg-rose-500/20 text-rose-300 border-rose-400/50"
                }`}
              >
                {currentSlot?.quality === "good"
                  ? isHi ? "श्रेष्ठ / शुभ" : "Auspicious"
                  : currentSlot?.quality === "neutral"
                  ? isHi ? "सामान्य / चर" : "Neutral"
                  : isHi ? "अशुभ / त्याज्य" : "Inauspicious"}
              </span>
            </div>

            {/* Time Slot Bounds & Ruling Planet */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  {isHi ? "मुहूर्त समय व अवधि" : "Window & Duration"}
                </span>
                <span className="text-sm font-bold text-amber-200 block mt-0.5">
                  {currentSlot?.startLocal} – {currentSlot?.endLocal} ({currentSlotDurationStr})
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  {isHi ? "अधिपति ग्रह" : "Ruling Planet"}
                </span>
                <span className="text-sm font-bold text-amber-200 block mt-0.5">
                  {isHi ? currentMeta.lord : currentSlot?.lord || "Venus"}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">
                  {isHi ? "आगामी मुहूर्त" : "Upcoming Next"}
                </span>
                <span className="text-sm font-bold text-stone-200 block mt-0.5 truncate">
                  {nextSlot ? `${isHi ? nextSlot.nameHi : nextSlot.nameEn} (${nextSlot.startLocal})` : "—"}
                </span>
              </div>
            </div>

            {/* Real-Time Countdown Meter & Dual Progress (Circular + Linear) */}
            <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-3">
              {isViewingToday ? (
                <>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Digital Countdown */}
                    <div className="space-y-1 text-center sm:text-left">
                      <span className="text-xs text-stone-300 font-medium block">
                        {isHi ? "वर्तमान मुहूर्त में शेष समय:" : "Remaining in Current Period:"}
                      </span>
                      <span className="font-mono text-2xl sm:text-3xl font-bold text-amber-400 tracking-wider">
                        {formatHMS(remainingMs)}
                      </span>
                      <div className="text-[11px] text-stone-400 flex items-center gap-2 justify-center sm:justify-start">
                        <span>
                          {isHi ? "बीता समय: " : "Elapsed: "}
                          <strong className="text-stone-200 font-mono">{formatHMS(elapsedMs)}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          {isHi ? "अवधि: " : "Span: "}
                          <strong className="text-stone-200 font-mono">{currentSlotDurationStr}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Circular Dial Indicator */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r={ringRadius}
                          className="text-stone-800 stroke-current"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r={ringRadius}
                          className={`${
                            currentSlot?.quality === "good"
                              ? "text-emerald-400"
                              : currentSlot?.quality === "neutral"
                              ? "text-sky-400"
                              : "text-rose-400"
                          } stroke-current transition-all duration-1000 ease-linear`}
                          strokeWidth="8"
                          strokeDasharray={ringCircumference}
                          strokeDashoffset={ringOffset}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-mono font-bold text-amber-200">{progressPercent}%</span>
                        <span className="text-[8px] uppercase tracking-wider text-stone-400">
                          {isHi ? "पूर्ण" : "Done"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Linear Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden relative border border-stone-700/60">
                    <div
                      className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                        currentSlot?.quality === "good"
                          ? "bg-gradient-to-r from-emerald-500 to-amber-400"
                          : currentSlot?.quality === "neutral"
                          ? "bg-gradient-to-r from-sky-500 to-indigo-400"
                          : "bg-gradient-to-r from-rose-500 to-amber-500"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5 text-xs text-stone-300">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-400">
                      {isHi ? "मुहूर्त काल अवधि:" : "Period Duration:"}
                    </span>
                    <span className="font-mono text-lg font-bold text-amber-300">
                      {currentSlotDurationStr}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    {isHi
                      ? `यह चौघड़िया ${currentSlot?.startLocal} से ${currentSlot?.endLocal} तक मान्य है। लाइव उल्टी गिनती वर्तमान तिथि पर चलती है।`
                      : `This Choghadiya period spans from ${currentSlot?.startLocal} to ${currentSlot?.endLocal}. Real-time countdown runs when viewing today.`}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Action: Learn More About Current Slot */}
            <button
              onClick={() => setSelectedSlotForDetails(currentSlot)}
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition cursor-pointer"
            >
              <span>{isHi ? "इस मुहूर्त के कार्य एवं शास्त्रीय नियम देखें" : "View classical rules & recommended activities"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 16-PERIOD INTERACTIVE CHOGHADIYA TIMELINE & CARDS GRID        */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#c4903c]" />
              <h3 className="font-serif font-bold text-stone-900 text-lg sm:text-xl">
                {isHi ? "दैनिक 16 चौघड़िया मुहूर्त समय-सारणी" : "Complete 16-Period Choghadiya Schedule"}
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {isHi
                ? "स्थान विशेष के वास्तविक सूर्योदय एवं सूर्यास्त पर आधारित 8 दिन और 8 रात के पूर्ण कालखंड।"
                : "Continuous astronomical cycles of 8 daytime and 8 nighttime intervals based on exact sunrise & sunset."}
            </p>
          </div>

          {/* Day / Night / All Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("day")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "day"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHi ? "दिन (8)" : "Day (8)"}</span>
              {isViewingToday && isCurrentlyDay && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("night")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "night"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isHi ? "रात (8)" : "Night (8)"}</span>
              {isViewingToday && !isCurrentlyDay && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#c4903c]" />
              <span>{isHi ? "सम्पूर्ण 16 काल" : "All 16 (24h)"}</span>
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {displayedSlots.map((slot, i) => {
            const isLive = isViewingToday && currentSlot && slot.startLocal === currentSlot.startLocal && slot.isDay === currentSlot.isDay;
            const isNext = isViewingToday && nextSlot && slot.startLocal === nextSlot.startLocal && slot.isDay === nextSlot.isDay;
            const isCompleted = isViewingToday && slot.endMs && now.getTime() >= slot.endMs;
            const meta = CHOGHADIYA_GUIDANCE[slot.type] || CHOGHADIYA_GUIDANCE["Char"];

            // Calculate duration for this slot
            let slotDur = "1h 30m";
            if (slot.startMs && slot.endMs && slot.endMs > slot.startMs) {
              const diffMin = Math.round((slot.endMs - slot.startMs) / 60000);
              const h = Math.floor(diffMin / 60);
              const m = diffMin % 60;
              slotDur = h > 0 ? `${h}h ${m}m` : `${m}m`;
            }

            return (
              <div
                key={i}
                onClick={() => setSelectedSlotForDetails(slot)}
                className={`group p-4 rounded-2xl border transition-all duration-300 relative cursor-pointer flex flex-col justify-between ${
                  isLive
                    ? "bg-amber-50/95 border-[#c4903c] ring-2 ring-[#c4903c]/60 shadow-md scale-[1.01]"
                    : isNext
                    ? "bg-stone-50/90 border-amber-300 hover:border-amber-400 hover:bg-white shadow-2xs"
                    : isCompleted
                    ? "bg-stone-50/60 border-stone-200/70 opacity-85 hover:opacity-100 hover:bg-white"
                    : "bg-white border-stone-200/90 hover:border-stone-400 hover:shadow-xs"
                }`}
              >
                {/* Badges on top */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-stone-400 flex items-center gap-1">
                    {slot.isDay ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                    <span>Slot {slot.index || i + 1}</span>
                  </span>

                  {isLive ? (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      {isHi ? "सक्रिय" : "LIVE NOW"}
                    </span>
                  ) : isNext ? (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                      {isHi ? "आगामी" : "UPCOMING"}
                    </span>
                  ) : isCompleted ? (
                    <span className="text-[10px] text-stone-500 font-semibold flex items-center gap-0.5">
                      <Check className="w-3 h-3 text-emerald-600" />
                      {isHi ? "बीता हुआ" : "Completed"}
                    </span>
                  ) : null}
                </div>

                {/* Name & Quality Badge */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-serif font-bold text-base sm:text-lg text-stone-900 group-hover:text-amber-800 transition">
                      {isHi ? slot.nameHi : slot.nameEn}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${getQualityBadgeStyle(
                        slot.quality
                      )}`}
                    >
                      {slot.quality === "good"
                        ? isHi ? "शुभ" : "Good"
                        : slot.quality === "neutral"
                        ? isHi ? "मध्यम" : "Neutral"
                        : isHi ? "अशुभ" : "Bad"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                    <span>{slot.startLocal} – {slot.endLocal}</span>
                    <span className="text-[10px] font-mono text-stone-400 font-normal">({slotDur})</span>
                  </div>
                </div>

                {/* Live progress indicator if currently live */}
                {isLive && (
                  <div className="w-full bg-amber-200/60 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-[#c4903c] h-full transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}

                {/* Card footer: Lord & click to inspect */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span>
                    {isHi ? "स्वामी: " : "Lord: "}
                    <strong className="text-stone-700">{isHi ? meta.lord : slot.lord}</strong>
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold group-hover:underline flex items-center">
                    {isHi ? "विवरण" : "Details"}
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ALERT PREFERENCES & REMINDER CONTROLS                  */}
      {/* ------------------------------------------------------------- */}
      {showAlertSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#c4903c]" />
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {isHi ? "चौघड़िया अलर्ट एवं सूचना सेटिंग" : "Choghadiya Notification Settings"}
                </h3>
              </div>
              <button
                onClick={() => setShowAlertSettingsModal(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-700">
              <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                <div>
                  <span className="font-bold text-stone-900 block">
                    {isHi ? "अलर्ट सक्षम करें" : "Enable Alerts"}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {isHi ? "ब्राउज़र एवं इन-ऐप सूचनाएं प्राप्त करें" : "Receive browser and in-app banner alerts"}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={alertsEnabled}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setAlertsEnabled(val);
                    savePreferences({ alertsEnabled: val, audioChimeEnabled, remind10m, remind5m, remindOnStart });
                  }}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                <div>
                  <span className="font-bold text-stone-900 block">
                    {isHi ? "शास्त्रीय मंदिर ध्वनि (528 Hz)" : "Temple Bell Sound (528 Hz)"}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {isHi ? "अलर्ट के समय मधुर घंटी की ध्वनि बजाएं" : "Play soothing harmonic chime on alerts"}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={audioChimeEnabled}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setAudioChimeEnabled(val);
                    savePreferences({ alertsEnabled, audioChimeEnabled: val, remind10m, remind5m, remindOnStart });
                  }}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
              </label>

              <div className="space-y-2 pt-1">
                <span className="font-bold text-stone-800 text-[11px] uppercase tracking-wider block">
                  {isHi ? "सूचना समय (Alert Timing):" : "Alert Timing:"}
                </span>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remind10m}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setRemind10m(val);
                      savePreferences({ alertsEnabled, audioChimeEnabled, remind10m: val, remind5m, remindOnStart });
                    }}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                  <span>{isHi ? "मुहूर्त समाप्त होने से 10 मिनट पूर्व" : "10 minutes before period ends"}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remind5m}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setRemind5m(val);
                      savePreferences({ alertsEnabled, audioChimeEnabled, remind10m, remind5m: val, remindOnStart });
                    }}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                  <span>{isHi ? "मुहूर्त समाप्त होने से 5 मिनट पूर्व" : "5 minutes before period ends"}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remindOnStart}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setRemindOnStart(val);
                      savePreferences({ alertsEnabled, audioChimeEnabled, remind10m, remind5m, remindOnStart: val });
                    }}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                  <span>{isHi ? "नया मुहूर्त प्रारंभ होने पर" : "When a new period starts"}</span>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => playTempleChime()}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isHi ? "ध्वनि परीक्षण" : "Test Chime"}</span>
              </button>
              <button
                onClick={() => setShowAlertSettingsModal(false)}
                className="px-4 py-1.5 bg-[#13382c] text-white rounded-xl text-xs font-semibold hover:bg-stone-900 transition"
              >
                {isHi ? "सहेजें" : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DEEP CHOGHADIYA SLOT INSPECTION                        */}
      {/* ------------------------------------------------------------- */}
      {selectedSlotForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-2xl text-stone-900">
                    {isHi ? selectedSlotForDetails.nameHi : selectedSlotForDetails.nameEn}
                  </h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getQualityBadgeStyle(
                      selectedSlotForDetails.quality
                    )}`}
                  >
                    {selectedSlotForDetails.quality === "good"
                      ? isHi ? "शुभ काल" : "Auspicious"
                      : selectedSlotForDetails.quality === "neutral"
                      ? isHi ? "मध्यम काल" : "Neutral"
                      : isHi ? "अशुभ काल" : "Inauspicious"}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {selectedSlotForDetails.isDay ? (isHi ? "दिन का मुहूर्त" : "Day Slot") : (isHi ? "रात्रि का मुहूर्त" : "Night Slot")} •{" "}
                  {selectedSlotForDetails.startLocal} – {selectedSlotForDetails.endLocal}
                </p>
              </div>

              <button
                onClick={() => setSelectedSlotForDetails(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Classical Guidance */}
            {(() => {
              const info = CHOGHADIYA_GUIDANCE[selectedSlotForDetails.type] || CHOGHADIYA_GUIDANCE["Char"];
              return (
                <div className="space-y-4 text-xs text-stone-700">
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 leading-relaxed">
                    <span className="font-bold text-stone-900 block mb-0.5">
                      {isHi ? "शास्त्रीय स्वरूप एवं फल:" : "Classical Significance:"}
                    </span>
                    {isHi ? info.descriptionHi : info.descriptionEn}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="font-bold text-stone-500 uppercase text-[10px] block">
                        {isHi ? "अधिपति ग्रह" : "Ruling Deity / Planet"}
                      </span>
                      <span className="font-serif font-bold text-stone-900 text-sm mt-0.5 block">
                        {isHi ? info.lord : selectedSlotForDetails.lord}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="font-bold text-stone-500 uppercase text-[10px] block">
                        {isHi ? "मुहूर्त प्रकृति" : "Nature"}
                      </span>
                      <span className="font-serif font-bold text-stone-900 text-sm mt-0.5 block">
                        {isHi ? info.nature : selectedSlotForDetails.nature}
                      </span>
                    </div>
                  </div>

                  {/* Favorable Activities */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      {isHi ? "अनुकूल एवं शुभ कार्य:" : "Recommended / Favorable Activities:"}
                    </span>
                    <p className="text-emerald-900 leading-relaxed">
                      {isHi ? info.favorableForHi : info.favorableForEn}
                    </p>
                  </div>

                  {/* Activities to Avoid */}
                  <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                    <span className="font-bold text-rose-950 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                      {isHi ? "वर्जित अथवा सावधानियां:" : "Activities to Avoid / Caution:"}
                    </span>
                    <p className="text-rose-900 leading-relaxed">
                      {isHi ? info.avoidHi : info.avoidEn}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSlotForDetails(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition"
              >
                {isHi ? "बंद करें" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

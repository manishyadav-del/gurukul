"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  BookOpen,
  Flame,
  ShieldCheck,
  User,
  Bot,
  Plus,
  Trash2,
  Edit3,
  MessageSquare,
  Globe,
  RefreshCw,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers,
  HelpCircle,
  AlertCircle,
  Check,
} from "lucide-react";

export default function PersonalJyotishAssistant({ chart, profile, initialLanguage = "en" }) {
  const [language, setLanguage] = useState(initialLanguage);
  const isHi = language === "hi" || language === "hindi";

  // Conversations
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [convsLoading, setConvsLoading] = useState(false);
  const [editingConvId, setEditingConvId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // Chat messages
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inspector State ("Ask About My Kundli")
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedGraha, setSelectedGraha] = useState("JUPITER");
  const [selectedHouse, setSelectedHouse] = useState(1);

  // Sidebar toggle for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // Suggested Prompts
  const suggestedQuestions = isHi
    ? [
        "मेरी वर्तमान महादशा क्या है और इसका क्या प्रभाव है?",
        "मेरी वर्तमान अंतर्दशा का विश्लेषण करें।",
        "वर्तमान में मेरे ग्रहों का गोचर क्या संकेत कर रहा है?",
        "मेरी कुंडली में लग्न और चंद्र राशि का क्या महत्व है?",
        "मेरी कुंडली में प्रमुख शुभ योग कौन से हैं?",
        "क्या मेरी पत्रिका में साढ़े साती या शनि की ढैया का प्रभाव है?",
        "बृहत् पराशर होरा शास्त्र के अनुसार मेरी सक्रिय दशा के शास्त्रीय नियम क्या हैं?",
      ]
    : [
        "What is my current Mahadasha and its primary life focus?",
        "Explain my current Antardasha sub-period.",
        "What does my current planetary transit indicate?",
        "Explain my Lagna (Ascendant) and Moon sign.",
        "What are the important classical Yogas in my Kundli?",
        "Explain my Sade Sati and Saturn transit phase.",
        "Which classical texts discuss my active planetary combination?",
        "Find relevant passages from Brihat Parashara Hora Shastra.",
      ];

  // Fetch Conversations List
  const fetchConversations = useCallback(async () => {
    setConvsLoading(true);
    try {
      const res = await fetch("/api/astrology/ai-assistant/conversations");
      const data = await res.json();
      if (res.ok && data.conversations) {
        setConversations(data.conversations);
        if (data.conversations.length > 0 && !activeConvId) {
          // Load most recent conversation
          loadConversation(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setConvsLoading(false);
    }
  }, [activeConvId]);

  // Load Single Conversation
  const loadConversation = async (convId) => {
    setActiveConvId(convId);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/astrology/ai-assistant/conversations/${convId}`);
      const data = await res.json();
      if (res.ok && data.conversation) {
        setMessages(
          data.conversation.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            citations: m.sources || [],
            metadata: m.metadata || {},
          }))
        );
      }
    } catch (err) {
      setError("Failed to load conversation history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle New Conversation
  const handleNewConversation = () => {
    setActiveConvId(null);
    setMessages([
      {
        id: "intro",
        role: "assistant",
        content: isHi
          ? "नमस्ते! मैं आपका व्यक्तिगत वैदिक ज्योतिष अनुसंधान सहायक हूँ। आपकी जन्मपत्रिका, दशा काल और महर्षि पराशर आदि ऋषियों के प्रामाणिक ग्रंथों के आधार पर उत्तर देने के लिए उपस्थित हूँ।"
          : "Namaste! I am your Personal Vedic Jyotish Research Assistant. Grounded strictly in your birth chart calculations, active Vimshottari Dasha, and classical manuscript treatises, I am here to guide your inquiry.",
        citations: [],
      },
    ]);
  };

  // Rename Conversation
  const handleRename = async (id, e) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    try {
      const res = await fetch(`/api/astrology/ai-assistant/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: editTitle.trim() } : c))
        );
        setEditingConvId(null);
      }
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  // Delete Conversation
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm(isHi ? "क्या आप इस चर्चा को हटाना चाहते हैं?" : "Delete this conversation?")) return;
    try {
      const res = await fetch(`/api/astrology/ai-assistant/conversations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConvId === id) {
          handleNewConversation();
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Submit Query
  const handleSend = async (queryText = inputQuery) => {
    const q = queryText.trim();
    if (!q || loading) return;

    setError(null);
    setInputQuery("");

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: q,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/astrology/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          chart,
          profileId: profile?.id || null,
          conversationId: activeConvId,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to retrieve astrology guidance.");
      }

      if (!activeConvId && data.conversationId) {
        setActiveConvId(data.conversationId);
        fetchConversations();
      }

      const assistantMessage = {
        id: data.messageId || `asst-${Date.now()}`,
        role: "assistant",
        content: data.content,
        sections: data.sections || [],
        citations: data.citations || [],
        sourceComparison: data.sourceComparison || null,
        summaryPills: data.summaryPills || [],
        followUpQuestions: data.followUpQuestions || [],
        disclaimer: data.disclaimer || "",
        hasSufficientEvidence: data.hasSufficientEvidence,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.message || "Failed to communicate with Jyotish Assistant.");
    } finally {
      setLoading(false);
    }
  };

  // Ask About Graha/House from Inspector
  const handleInspectorAsk = (type) => {
    let q = "";
    if (type === "graha") {
      const gObj = chart?.planets?.find((p) => p.planet === selectedGraha);
      q = isHi
        ? `मेरी कुंडली में ${selectedGraha} ग्रह (भाव: ${gObj?.house || "अज्ञात"}, राशि: ${gObj?.sign || "अज्ञात"}) की शास्त्रीय स्थिति और प्रभाव स्पष्ट करें।`
        : `Explain the classical significance and influence of ${selectedGraha} (House ${gObj?.house || "N/A"}, Sign: ${gObj?.sign || "N/A"}) in my birth chart.`;
    } else {
      q = isHi
        ? `मेरी कुंडली के ${selectedHouse}वें भाव के अधिपति और उसमें स्थित ग्रहों के आधार पर इस भाव का फलादेश बताएं।`
        : `Explain the indications of House ${selectedHouse} in my Kundli based on its ruling sign and occupying planets.`;
    }
    setInspectorOpen(false);
    handleSend(q);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-lg overflow-hidden flex flex-col lg:flex-row min-h-[720px] max-h-[880px]">
      {/* 1. Left Sidebar: Conversations History & Controls */}
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } lg:block w-full lg:w-72 bg-gradient-to-b from-[#13382c] to-[#184537] text-amber-50 p-4 border-r border-[#c4903c]/20 shrink-0 flex flex-col justify-between`}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c4903c]" />
              <span className="font-serif font-bold text-sm tracking-wide">
                {isHi ? "ज्योतिष संवाद" : "Jyotish Assistant"}
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-stone-300 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewConversation}
            className="w-full py-2.5 px-3 rounded-xl bg-[#c4903c] hover:bg-[#d4a359] text-[#13382c] font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isHi ? "नया संवाद आरंभ करें" : "New Discussion"}</span>
          </button>

          {/* Conversation History List */}
          <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
            <div className="text-[10px] text-amber-300/70 uppercase tracking-wider font-semibold px-2 mb-1">
              {isHi ? "पूर्व संवाद इतिहास" : "Recent Discussions"}
            </div>

            {convsLoading ? (
              <div className="text-center py-6 text-xs text-amber-200/60">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-[#c4903c]" />
                <span>Loading...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-6 text-xs text-amber-200/50 px-2 italic">
                {isHi ? "कोई पूर्व संवाद नहीं" : "No past discussions recorded."}
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = activeConvId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => loadConversation(c.id)}
                    className={`group relative flex items-center justify-between p-2 rounded-xl text-xs transition cursor-pointer ${
                      isActive
                        ? "bg-white/15 text-white font-semibold border border-white/20 shadow-xs"
                        : "text-amber-100/80 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {editingConvId === c.id ? (
                      <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full bg-black/40 text-xs px-2 py-1 rounded text-white border border-amber-400/40 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={(e) => handleRename(c.id, e)}
                          className="p-1 hover:text-emerald-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 truncate pr-2">
                          <MessageSquare className="w-3.5 h-3.5 text-[#c4903c] shrink-0" />
                          <span className="truncate">{c.title}</span>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingConvId(c.id);
                              setEditTitle(c.title);
                            }}
                            className="p-1 hover:text-amber-300"
                            title="Rename"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(c.id, e)}
                            className="p-1 hover:text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Profile Status & Language Toggle */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          {chart && (
            <div className="p-2.5 rounded-xl bg-black/25 text-[11px] text-amber-200/90 border border-white/10 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-[#c4903c]" />
                <span>{chart.ascendant?.sign || "Lagna"} Lagna • {chart.moon?.sign || "Moon"} Rashi</span>
              </div>
              <div className="text-[10px] text-amber-300/80">
                Dasha: {chart.dasha?.currentMahadasha}/{chart.dasha?.currentAntardasha}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-300 text-[11px]">{isHi ? "भाषा" : "Language"}</span>
            <button
              onClick={() => setLanguage(isHi ? "en" : "hi")}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-amber-200 flex items-center gap-1 cursor-pointer transition"
            >
              <Globe className="w-3 h-3 text-[#c4903c]" />
              <span>{isHi ? "English" : "हिन्दी"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between bg-[#fcfaf5]">
        {/* Top Chat Bar */}
        <div className="p-4 bg-white border-b border-stone-200/80 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-stone-100 text-stone-700 hover:bg-stone-200"
            >
              <MessageSquare className="w-4 h-4 text-[#13382c]" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-stone-900 text-base">
                  {isHi ? "गुरुकुल एआई ज्योतिष शोध सहायक" : "Gurukul AI Jyotish Assistant"}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  RAG Classical Grounding
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                {isHi
                  ? "बृहत् पराशर होरा शास्त्र एवं शास्त्रीय पांडुलिपियों पर आधारित प्रामाणिक विश्लेषण"
                  : "Authentic, non-fatalistic synthesis strictly supported by classical Jyotish treatises"}
              </p>
            </div>
          </div>

          {/* "Ask About My Kundli" Button */}
          {chart && (
            <button
              onClick={() => setInspectorOpen(!inspectorOpen)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#c4903c]" />
              <span className="hidden sm:inline">{isHi ? "कुंडली से पूछें" : "Ask About Kundli"}</span>
            </button>
          )}
        </div>

        {/* Kundli Inspector Drawer */}
        {inspectorOpen && chart && (
          <div className="bg-amber-50/80 p-4 border-b border-amber-200 animate-in slide-in-from-top-2 duration-150 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#c4903c]" />
                <span>{isHi ? "विशिष्ट ग्रह अथवा भाव का चयन करें" : "Targeted Kundli Factor Inspector"}</span>
              </span>
              <button onClick={() => setInspectorOpen(false)} className="text-stone-400 hover:text-stone-600 text-xs">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <select
                  value={selectedGraha}
                  onChange={(e) => setSelectedGraha(e.target.value)}
                  className="flex-1 bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  {chart.planets?.map((p) => (
                    <option key={p.planet} value={p.planet}>
                      {p.name || p.planet} (House {p.house}, {p.sign})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleInspectorAsk("graha")}
                  className="px-3 py-1.5 bg-[#13382c] text-white rounded-xl font-semibold hover:bg-[#1a4a3b] text-xs shrink-0 cursor-pointer"
                >
                  {isHi ? "ग्रह से पूछें" : "Analyze Graha"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedHouse}
                  onChange={(e) => setSelectedHouse(parseInt(e.target.value, 10))}
                  className="flex-1 bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  {chart.houses?.map((h) => (
                    <option key={h.house} value={h.house}>
                      House {h.house} ({h.name || h.sign})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleInspectorAsk("house")}
                  className="px-3 py-1.5 bg-[#13382c] text-white rounded-xl font-semibold hover:bg-[#1a4a3b] text-xs shrink-0 cursor-pointer"
                >
                  {isHi ? "भाव से पूछें" : "Analyze House"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages Feed */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#13382c] text-amber-200 flex items-center justify-center shrink-0 shadow-xs border border-[#c4903c]/30">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm space-y-3 shadow-xs ${
                    isUser
                      ? "bg-[#13382c] text-amber-50 rounded-tr-none"
                      : "bg-white text-stone-800 border border-stone-200/80 rounded-tl-none space-y-4"
                  }`}
                >
                  {/* Summary Pills for Assistant Answers */}
                  {!isUser && m.summaryPills && m.summaryPills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pb-2 border-b border-stone-100">
                      {m.summaryPills.map((pill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-semibold border border-amber-200"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-line leading-relaxed">
                    {m.content}
                  </div>

                  {/* Classical Source Comparison Card */}
                  {!isUser && m.sourceComparison?.hasMultipleSources && (
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 space-y-2 mt-3">
                      <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#c4903c]" />
                        <span>{isHi ? "शास्त्रीय ग्रंथों की तुलना (Classical Source Divergence)" : "Comparative Classical Perspectives"}</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-stone-700">
                        {m.sourceComparison.divergences?.map((d, idx) => (
                          <div key={idx} className="p-2 bg-white rounded-lg border border-amber-100">
                            <span className="font-bold text-stone-900">{d.source}: </span>
                            <span>{isHi ? d.perspectiveHi : d.perspectiveEn}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scriptural Citations Links */}
                  {!isUser && m.citations && m.citations.length > 0 && (
                    <div className="pt-3 border-t border-stone-100 space-y-2">
                      <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                        {isHi ? "गुरुकुल डिजिटल पुस्तकालय से सत्यापित साक्ष्य" : "Verified Citations from Gurukul Digital Library"}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.citations.map((c, idx) => (
                          <Link
                            key={idx}
                            href={c.readerUrl || "/library"}
                            className="p-2.5 rounded-xl bg-[#fbf9f4] hover:bg-amber-50 border border-stone-200/80 hover:border-amber-300 transition text-[11px] space-y-1 block group"
                          >
                            <div className="font-bold text-stone-900 group-hover:text-[#13382c] flex items-center justify-between">
                              <span className="truncate">{c.bookTitle}</span>
                              <ExternalLink className="w-3 h-3 text-stone-400 shrink-0 ml-1" />
                            </div>
                            <div className="text-[10px] text-stone-500 truncate">
                              {c.chapterTitle} • Page {c.pageNumber || c.sourcePage || "Folio"}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up question chips */}
                  {!isUser && m.followUpQuestions && m.followUpQuestions.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 space-y-1.5">
                      <div className="text-[10px] text-stone-400 font-semibold">{isHi ? "संबंधित प्रश्न:" : "Related questions:"}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.followUpQuestions.map((fq, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(fq)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-stone-900 transition text-left cursor-pointer"
                          >
                            {fq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#c4903c] text-[#13382c] flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-stone-500 pl-12 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c4903c]" />
              <span>{isHi ? "दशा, गोचर एवं शास्त्रीय ग्रंथ संदर्भों का समन्वय हो रहा है..." : "Aligning chart factors, transits & scriptural passages..."}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Bottom Suggested Prompts & Input Box */}
        <div className="p-4 bg-white border-t border-stone-200/80 space-y-3">
          {/* Quick Prompts Carousel */}
          {messages.length <= 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {suggestedQuestions.map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sq)}
                  className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-amber-50 hover:text-amber-900 border border-stone-200/80 text-[11px] text-stone-700 whitespace-nowrap transition cursor-pointer"
                >
                  {sq}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                isHi
                  ? "अपनी दशा, गोचर, कुंडली या शास्त्रीय संदर्भों के विषय में पूछें..."
                  : "Ask about your active Mahadasha, transits, Kundli placements, or scriptures..."
              }
              className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#c4903c] placeholder-stone-400"
            />

            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-[#13382c] hover:bg-[#1a4a3b] text-white font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4 text-[#c4903c]" />
              <span className="hidden sm:inline">{isHi ? "पूछें" : "Ask"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

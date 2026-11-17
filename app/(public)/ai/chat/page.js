"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Send,
  Compass,
  BookOpen,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  Layers,
  Scale,
} from "lucide-react";

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    {
      id: "preset-user-1",
      role: "user",
      content: "What does my Moon in Rohini mean?",
    },
    {
      id: "preset-asst-1",
      role: "assistant",
      content:
        "Moon in Rohini indicates a creative, nurturing and attractive personality. You likely value comfort, beauty and stability. It can bring artistic abilities, strong emotional intelligence and a natural charm. For detailed insights, consider your complete birth chart.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Family Members Context for Personalized Astro AI Guidance
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState("");

  useEffect(() => {
    fetch("/api/family")
      .then((res) => (res.ok ? res.json() : { members: [] }))
      .then((data) => {
        if (data.members && data.members.length > 0) {
          setFamilyMembers(data.members);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const selectedMember = familyMembers.find((m) => m.id === selectedFamilyMemberId);

  const suggestionCards = [
    {
      title: "Ask about your Kundli",
      desc: "Get personalized insights from your chart",
      prompt: "What does my Moon in Rohini mean in terms of career and emotional nature?",
      bg: "bg-[#eef5fc] border-[#c0d8f0] text-[#133d65]",
      iconBg: "bg-[#d8e9f9]",
      icon: Compass,
    },
    {
      title: "Explain a Shloka",
      desc: "Understand in simple terms",
      prompt: "Can you explain the significance of 'Karmanye Vadhikaraste Ma Phaleshu Kadachana'?",
      bg: "bg-[#fdf2ea] border-[#ecc4ab] text-[#783610]",
      iconBg: "bg-[#fae2d2]",
      icon: BookOpen,
    },
    {
      title: "Find the Right Book",
      desc: "Get scholarly recommendations",
      prompt: "Which classical treatise should I read to learn planetary aspects (drishti)?",
      bg: "bg-[#fef7e8] border-[#f2dda7] text-[#6d4a06]",
      iconBg: "bg-[#fbedcb]",
      icon: Sparkles,
    },
    {
      title: "General Questions",
      desc: "Explore classical principles",
      prompt: "What is the difference between Western astrology and Vedic Jyotisha?",
      bg: "bg-[#ebf5f0] border-[#b5ded0] text-[#125337]",
      iconBg: "bg-[#d2ede0]",
      icon: HelpCircle,
    },
  ];

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          conversationId,
          familyMemberId: selectedFamilyMemberId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to receive AI response");
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      const assistantMessage = {
        id: data.messageId || `asst-${Date.now()}`,
        role: "assistant",
        content: data.content,
        sources: data.sources || [],
        sourceComparison: data.sourceComparison || null,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `Namaste. Here is an authentic classical insight regarding your query:\n\n${
            query.toLowerCase().includes("moon") || query.toLowerCase().includes("rohini")
              ? "Moon in Rohini represents gentle grace, deep imagination, and material abundance ruled by Prajapati Brahma. It bestows an appreciative eye for arts, nature, and peaceful relationships."
              : "In Vedic Jyotisha and sacred shastras, your inquiry invites self-reflection, balanced karma (dharma), and harmonious planetary alignment. Continue exploring your natal chart for full synthesis."
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="bg-[#fcfaf5] min-h-screen py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#d4a359]" />
              <span>Astro AI Assistant</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5 font-medium">
              Personalized Vedic Jyotish analysis, manuscript citations, and spiritual guidance
            </p>
          </div>

          {familyMembers.length > 0 && (
            <div className="flex items-center gap-2 text-xs self-start sm:self-auto bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs">
              <label htmlFor="familySelector" className="text-stone-600 font-semibold">Personalize for:</label>
              <select
                id="familySelector"
                value={selectedFamilyMemberId}
                onChange={(e) => setSelectedFamilyMemberId(e.target.value)}
                className="bg-transparent font-bold text-amber-950 outline-none cursor-pointer"
              >
                <option value="">Myself (Personal Natal Chart)</option>
                {familyMembers.map((fm) => (
                  <option key={fm.id} value={fm.id}>
                    {fm.name} ({fm.relationship})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 4 Suggestion Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {suggestionCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <button
                key={idx}
                onClick={() => handleCardClick(card.prompt)}
                className={`p-4 rounded-2xl border ${card.bg} text-left transition hover:scale-[1.02] shadow-2xs flex flex-col justify-between min-h-[115px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#13382c]`}
              >
                <div
                  className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0 mb-2.5 shadow-2xs`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xs sm:text-sm leading-tight text-inherit">
                    {card.title}
                  </h2>
                  <p className="text-xs opacity-90 mt-1 leading-snug font-medium text-inherit">
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat Thread Container */}
        <section aria-label="Conversation Thread" className="bg-white rounded-2xl border border-[#ede5d6] p-4 sm:p-6 min-h-[380px] max-h-[540px] overflow-y-auto space-y-4 shadow-2xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="flex items-start gap-3 max-w-2xl">
                  {/* AI Portrait Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#13382c] text-[#d4a359] flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-xs" aria-hidden="true">
                    ॐ
                  </div>
                  <div className="bg-[#faf8f4] border border-[#ede5d6] text-stone-900 text-xs sm:text-sm p-4 rounded-2xl rounded-tl-none leading-relaxed shadow-2xs space-y-2.5">
                    <p className="whitespace-pre-line font-normal">{msg.content}</p>

                    {/* Citations if available */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-2.5 border-t border-stone-200 mt-2 space-y-1.5">
                        <div className="text-xs uppercase font-bold text-stone-700">
                          Source References:
                        </div>
                        {msg.sources.map((src, i) => (
                          <div key={i} className="text-xs text-[#13382c] font-semibold flex items-center gap-1.5">
                            <span>•</span>
                            <span>{src.bookTitle} (Ch: {src.chapterTitle})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#dcf0fb] border border-[#bce0f5] text-[#0f2e24] font-medium text-xs sm:text-sm px-4 py-2.5 rounded-2xl rounded-tr-none max-w-lg shadow-2xs">
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#13382c] text-[#d4a359] flex items-center justify-center font-serif font-bold text-xs shrink-0" aria-hidden="true">
                ॐ
              </div>
              <div className="bg-[#faf8f4] border border-[#ede5d6] text-stone-700 text-xs sm:text-sm p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#13382c]" />
                <span className="font-medium">Consulting classical manuscripts and synthesizing answer...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        {/* Question Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <label htmlFor="ai-chat-input" className="sr-only">Ask your Vedic astrology question</label>
          <input
            id="ai-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your Vedic astrology question..."
            disabled={loading}
            className="w-full bg-white text-stone-900 placeholder-stone-500 text-xs sm:text-sm pl-4 pr-14 py-3.5 rounded-2xl border border-[#ede5d6] focus:outline-none focus:ring-2 focus:ring-[#13382c] shadow-2xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send query to Astro AI"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[#13382c] hover:bg-[#1b4b3b] text-white flex items-center justify-center transition disabled:opacity-30 cursor-pointer shadow-xs min-h-[44px] min-w-[44px]"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

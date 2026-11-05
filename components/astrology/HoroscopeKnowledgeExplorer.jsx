"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Network,
  Compass,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  BookOpen,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  X,
  Send,
  Loader2,
  ShieldCheck,
  Flame,
  Award,
} from "lucide-react";

export default function HoroscopeKnowledgeExplorer({
  date,
  city,
  panchangData,
  reportData,
  selectedRashi = "Aries",
  language = "en",
  onNavigateTab = null,
  initialTargetConcept = null,
}) {
  const isHi = language === "hi";

  // Graph Data State
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [graphError, setGraphError] = useState(null);

  // Selected Node State
  const [selectedNode, setSelectedNode] = useState(null);
  const [elementDetails, setElementDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // AI RAG Explanation State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [customPrompt, setCustomPrompt] = useState("");

  // SVG Pan & Zoom State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Fetch the live calculated graph whenever date, city, or selectedRashi changes
  const fetchGraph = useCallback(async () => {
    setLoadingGraph(true);
    setGraphError(null);
    try {
      const params = new URLSearchParams({
        date,
        lat: city?.lat?.toString() || "28.6139",
        lon: city?.lon?.toString() || "77.2090",
        tz: city?.tz?.toString() || "5.5",
        timezone: city?.tzStr || "Asia/Kolkata",
        selectedRashi,
        language,
      });

      const res = await fetch(`/api/astrology/horoscope-graph?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to compute graph`);
      const data = await res.json();
      setGraphData({ nodes: data.nodes || [], edges: data.edges || [] });

      // If initial target was provided or default to center/first node
      if (initialTargetConcept) {
        const found = (data.nodes || []).find((n) => n.slug?.includes(initialTargetConcept) || n.id?.includes(initialTargetConcept));
        if (found) setSelectedNode(found);
      } else if (data.nodes?.length > 0 && !selectedNode) {
        setSelectedNode(data.nodes[0]);
      }
    } catch (err) {
      console.error("fetchGraph error:", err);
      setGraphError(err.message || "Failed to load live knowledge graph");
    } finally {
      setLoadingGraph(false);
    }
  }, [date, city, selectedRashi, language, initialTargetConcept]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // Fetch detailed shastric explanation when a node is selected
  useEffect(() => {
    if (!selectedNode) return;
    let isCancelled = false;

    async function loadDetails() {
      setLoadingDetails(true);
      try {
        const params = new URLSearchParams({
          date,
          lat: city?.lat?.toString() || "28.6139",
          lon: city?.lon?.toString() || "77.2090",
          tz: city?.tz?.toString() || "5.5",
          timezone: city?.tzStr || "Asia/Kolkata",
          elementType: selectedNode.category?.toLowerCase() || "element",
          elementKey: selectedNode.slug || selectedNode.id,
          language,
        });

        const res = await fetch(`/api/astrology/horoscope-graph?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled) setElementDetails(data);
        }
      } catch (err) {
        console.warn("Failed to fetch element details:", err);
      } finally {
        if (!isCancelled) setLoadingDetails(false);
      }
    }

    loadDetails();
    return () => {
      isCancelled = true;
    };
  }, [selectedNode, date, city, language]);

  // Handle RAG AI Query
  const handleAskAi = async (action = "explain_panchang", prompt = "") => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch("/api/astrology/horoscope-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          panchang: panchangData,
          transits: reportData?.transits?.all || reportData?.transits || [],
          selectedRashi,
          cityName: city?.name || "Local",
          customPrompt: prompt || customPrompt,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data);
      }
    } catch (err) {
      console.error("handleAskAi error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Graph SVG Coordinate Generation (Radial Multi-Ring Layout)
  // ---------------------------------------------------------------------------
  const { layoutNodes, layoutEdges } = useMemo(() => {
    const nodes = graphData.nodes || [];
    const edges = graphData.edges || [];
    const width = 800;
    const height = 560;
    const centerX = width / 2;
    const centerY = height / 2;

    const ring0 = nodes.filter((n) => n.ring === 0 || n.isCenter);
    const ring1 = nodes.filter((n) => n.ring === 1);
    const ring2 = nodes.filter((n) => n.ring === 2);
    const ring3 = nodes.filter((n) => n.ring === 3 || (!n.ring && !n.isCenter));

    const posMap = new Map();

    // Center node
    ring0.forEach((n) => {
      posMap.set(n.id, { ...n, x: centerX, y: centerY, r: 28 });
    });

    // Ring 1: Panchang & Muhurta (Radius = 130px)
    const r1Radius = 130;
    ring1.forEach((n, idx) => {
      const angle = (idx / Math.max(ring1.length, 1)) * 2 * Math.PI - Math.PI / 2;
      posMap.set(n.id, {
        ...n,
        x: centerX + r1Radius * Math.cos(angle),
        y: centerY + r1Radius * Math.sin(angle),
        r: 20,
      });
    });

    // Ring 2: Transits & Rashis (Radius = 220px)
    const r2Radius = 215;
    ring2.forEach((n, idx) => {
      const angle = (idx / Math.max(ring2.length, 1)) * 2 * Math.PI - Math.PI / 2;
      posMap.set(n.id, {
        ...n,
        x: centerX + r2Radius * Math.cos(angle),
        y: centerY + r2Radius * Math.sin(angle),
        r: 18,
      });
    });

    // Ring 3: Subtle Anatomy & Chakras (Radius = 265px)
    const r3Radius = 260;
    ring3.forEach((n, idx) => {
      const angle = (idx / Math.max(ring3.length, 1)) * 2 * Math.PI - Math.PI / 2;
      posMap.set(n.id, {
        ...n,
        x: centerX + r3Radius * Math.cos(angle),
        y: centerY + r3Radius * Math.sin(angle),
        r: 16,
      });
    });

    const lNodes = Array.from(posMap.values());
    const lEdges = edges
      .map((e) => {
        const s = posMap.get(e.source);
        const t = posMap.get(e.target);
        if (!s || !t) return null;
        return { ...e, x1: s.x, y1: s.y, x2: t.x, y2: t.y };
      })
      .filter(Boolean);

    return { layoutNodes: lNodes, layoutEdges: lEdges };
  }, [graphData]);

  // Filtered nodes for search
  const filteredNodes = useMemo(() => {
    let list = layoutNodes;
    if (selectedCategory !== "ALL") {
      list = list.filter((n) => n.category?.includes(selectedCategory));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (n) =>
          n.name?.toLowerCase().includes(q) ||
          n.sanskrit?.includes(q) ||
          n.calculatedValue?.toLowerCase().includes(q) ||
          n.summary?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [layoutNodes, selectedCategory, searchQuery]);

  // Pan & Zoom Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleZoom = (factor) => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * factor, 0.6), 2.5),
    }));
  };

  const handleReset = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner with Live Calculation Context */}
      <div className="bg-[#13382c] rounded-2xl p-6 text-white border border-[#235847] shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
              <Network className="w-4 h-4 text-amber-400" />
              <span>{isHi ? "प्रत्यक्ष खगोलीय ज्ञान तंत्र" : "Live Shastric Horoscope Knowledge Graph"}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#faf5eb]">
              {isHi ? "आज के पंचांग व गोचर का ज्ञान अन्वेषक" : "Live Horoscope Knowledge & Shastric Explorer"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mt-1 font-light leading-relaxed">
              {isHi
                ? "यह ज्ञान तंत्र वास्तविक खगोलीय गणनाओं (Pierre Lepetit Ephemeris व लाहिरी अयनांश) पर आधारित है। पंचांग, गोचर, चौघड़िया व सूक्ष्म चक्रों के शास्त्रीय सूत्रों का प्रत्यक्ष अवलोकन करें।"
                : "Grounded strictly in verified astronomical calculations (astronomy-engine & Lahiri Ayanamsa). Click any calculated element to view its traditional meaning, mathematical fact, and classical references."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-black/30 backdrop-blur-md rounded-xl px-3.5 py-2 border border-white/10 text-right">
              <span className="block text-[10px] text-amber-300 font-mono uppercase">
                {city?.name || "Local City"}
              </span>
              <span className="text-xs font-bold text-stone-200">
                {date} • Ayanamsa: {panchangData?.ayanamsa || "24.18"}°
              </span>
            </div>

            <button
              onClick={fetchGraph}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition"
              title="Refresh Knowledge Graph"
            >
              <RefreshCw className={`w-4 h-4 ${loadingGraph ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Live Category Filter Pills */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: "ALL", label: isHi ? "सभी तत्त्व" : "All Elements" },
            { id: "PANCHANG", label: isHi ? "पंचांग अंग" : "Panchang Limbs" },
            { id: "TRANSIT", label: isHi ? "गोचर ग्रह" : "Transit Planets" },
            { id: "RASHI", label: isHi ? "12 राशियां" : "12 Rashis" },
            { id: "CHOGHADIYA", label: isHi ? "चौघड़िया" : "Choghadiya" },
            { id: "CHAKRA", label: isHi ? "कुण्डलिनी चक्र" : "Kundalini Chakras" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer font-medium ${
                selectedCategory === cat.id
                  ? "bg-[#d4a359] text-[#13382c] font-bold shadow-xs"
                  : "bg-white/10 text-stone-200 hover:bg-white/20"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main 2-Column Explorer: Left SVG Canvas (8 cols) & Right Shastric Drawer (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PURE REACT + SVG KNOWLEDGE GRAPH CANVAS (8 COLS) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-[#ede5d6] p-4 shadow-2xs space-y-3 relative overflow-hidden flex flex-col h-[640px]">
          {/* Top Controls Bar */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-stone-100 shrink-0">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isHi ? "खोजें (सूर्य, रोहिणी, मेष, तिथि)..." : "Search (Surya, Rohini, Tithi, Aries)..."}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#d4a359]"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleZoom(1.2)}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom(0.8)}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                title="Reset View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Canvas Area */}
          <div
            className="flex-1 w-full bg-[#fcfaf5] rounded-xl border border-stone-200/70 overflow-hidden relative select-none cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {loadingGraph ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#fcfaf5]/80 z-20">
                <Loader2 className="w-7 h-7 text-[#c4903c] animate-spin" />
                <span className="text-xs font-serif text-stone-600 font-bold">
                  {isHi ? "खगोलीय ज्ञान सम्बंध लोड हो रहे हैं..." : "Rendering astronomical knowledge graph..."}
                </span>
              </div>
            ) : graphError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-red-600 z-20">
                <Info className="w-6 h-6" />
                <span className="text-xs font-bold">{graphError}</span>
              </div>
            ) : (
              <svg
                ref={svgRef}
                viewBox="0 0 800 560"
                className="w-full h-full pointer-events-auto"
              >
                <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
                  {/* Subtle Background Orbit Guide Rings */}
                  <circle cx="400" cy="280" r="130" fill="none" stroke="#e8dfce" strokeDasharray="3 3" />
                  <circle cx="400" cy="280" r="215" fill="none" stroke="#e8dfce" strokeDasharray="3 3" />
                  <circle cx="400" cy="280" r="260" fill="none" stroke="#e8dfce" strokeDasharray="3 3" />

                  {/* Graph Edges */}
                  {layoutEdges.map((e) => {
                    const isHighlighted = selectedNode && (e.source === selectedNode.id || e.target === selectedNode.id);
                    return (
                      <g key={e.id}>
                        <line
                          x1={e.x1}
                          y1={e.y1}
                          x2={e.x2}
                          y2={e.y2}
                          stroke={isHighlighted ? "#c4903c" : "#d6cbba"}
                          strokeWidth={isHighlighted ? 2.2 : 1}
                          strokeOpacity={isHighlighted ? 0.9 : 0.6}
                        />
                      </g>
                    );
                  })}

                  {/* Graph Nodes */}
                  {filteredNodes.map((n) => {
                    const isSelected = selectedNode?.id === n.id;
                    return (
                      <g
                        key={n.id}
                        transform={`translate(${n.x}, ${n.y})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(n);
                        }}
                        className="cursor-pointer transition-transform duration-100 hover:scale-110"
                      >
                        <circle
                          r={n.r}
                          fill={isSelected ? "#13382c" : n.color || "#13382c"}
                          stroke={isSelected ? "#d4a359" : "#ffffff"}
                          strokeWidth={isSelected ? 3 : 1.5}
                          className="shadow-sm"
                        />
                        <text
                          y={3}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize={n.isCenter ? 10 : 8}
                          fontWeight="bold"
                          className="pointer-events-none select-none font-serif"
                        >
                          {n.sanskrit?.slice(0, 3) || n.name?.slice(0, 3)}
                        </text>
                        <text
                          y={n.r + 11}
                          textAnchor="middle"
                          fill={isSelected ? "#13382c" : "#57534e"}
                          fontSize={9}
                          fontWeight={isSelected ? "bold" : "normal"}
                          className="pointer-events-none select-none font-mono"
                        >
                          {n.name?.split(" ")[0]}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>

          {/* Canvas Bottom Legend */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-500 pt-1 shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c4903c] inline-block" />
                <span>Cosmic Center</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] inline-block" />
                <span>Panchang Limb</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#13382c] inline-block" />
                <span>Transit Graha</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#047857] inline-block" />
                <span>Subtle Anatomy</span>
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono">
              Nodes: {graphData.nodes?.length || 0} • Edges: {graphData.edges?.length || 0}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: SHASTRIC ELEMENT INSPECTOR & RAG EXPLANATION (4 COLS) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs space-y-5 h-[640px] flex flex-col overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Element Title & Category */}
              <div className="border-b border-stone-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#c4903c]">
                    {selectedNode.categoryLabel || selectedNode.category}
                  </span>
                  {selectedNode.sanskrit && (
                    <span className="text-xs font-serif font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                      {selectedNode.sanskrit}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 mt-1">
                  {selectedNode.name}
                </h3>
              </div>

              {/* Actual Astronomical Calculation Fact */}
              <div className="bg-[#faf5eb] rounded-xl p-3 border border-[#ede2cc] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                  <Sparkles className="w-3.5 h-3.5 text-[#c4903c]" />
                  <span>{isHi ? "प्रत्यक्ष खगोलीय गणना" : "Astronomical Fact for Today"}</span>
                </div>
                <p className="text-xs font-mono text-stone-700 leading-relaxed">
                  {elementDetails?.calculatedFact || selectedNode.calculatedValue || "Live astronomical placement computed."}
                </p>
              </div>

              {/* Traditional Shastric Meaning */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block font-mono">
                  {isHi ? "शास्त्रीय महत्ता व फलित" : "Classical Significance"}
                </span>
                <p className="text-xs text-stone-800 leading-relaxed font-serif">
                  {elementDetails?.traditionalMeaning || selectedNode.summary || "Core concept in classical Vedic astrology."}
                </p>
              </div>

              {/* Classical Source Citation */}
              <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block font-mono">
                  {isHi ? "प्रामाणिक शास्त्रीय ग्रन्थ" : "Classical Treatise Reference"}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#13382c]">
                  <BookOpen className="w-3.5 h-3.5 text-[#c4903c] shrink-0" />
                  <span className="truncate">
                    {elementDetails?.classicalCitation || selectedNode.classicalSource || "Brihat Parashara Hora Shastra"}
                  </span>
                </div>
              </div>

              {/* Connected Concepts Chips */}
              {elementDetails?.connectedConcepts?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block font-mono">
                    {isHi ? "सम्बद्ध शास्त्र सम्बंध" : "Connected Shastric Nodes"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {elementDetails.connectedConcepts.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200"
                      >
                        <span className="font-bold">{c.name}</span>
                        <span className="text-[10px] text-stone-400">({c.rel})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Navigate to Section & Ask AI */}
              <div className="pt-2 border-t border-stone-100 flex flex-col gap-2 shrink-0">
                {selectedNode.linkTab && onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab(selectedNode.linkTab)}
                    className="w-full py-2 px-3 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <span>{isHi ? "इस अनुभाग को खोलें" : `Open in ${selectedNode.linkTab.toUpperCase()} View`}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAskAi("explain_panchang")}
                    disabled={aiLoading}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200/80 text-[11px] transition text-center"
                  >
                    Explain Panchang
                  </button>
                  <button
                    onClick={() => handleAskAi("explain_nakshatra")}
                    disabled={aiLoading}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold border border-purple-200/80 text-[11px] transition text-center"
                  >
                    Explain Nakshatra
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-2">
              <Network className="w-8 h-8 text-stone-300" />
              <p className="text-xs">
                {isHi
                  ? "ज्ञान तंत्र से किसी भी ग्रह, तिथि, नक्षत्र अथवा राशि पर क्लिक करें।"
                  : "Click any node in the knowledge graph to explore its calculated value and shastric provenance."}
              </p>
            </div>
          )}

          {/* AI Grounded Response Panel */}
          {aiLoading ? (
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex items-center gap-2 text-xs text-stone-600">
              <Loader2 className="w-4 h-4 animate-spin text-[#c4903c]" />
              <span>Grounding shastric response with verified citations...</span>
            </div>
          ) : aiResponse ? (
            <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-amber-900 font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#c4903c]" />
                  <span>AI Shastra Explanation</span>
                </span>
                <button
                  onClick={() => setAiResponse(null)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-stone-800 leading-relaxed font-serif">
                {aiResponse.explanation}
              </p>
              {aiResponse.citations?.length > 0 && (
                <div className="pt-2 border-t border-amber-200/60 text-[10px] text-stone-500 font-mono">
                  <span>Cited Manuscripts: </span>
                  {aiResponse.citations.map((c) => `${c.bookTitle} (${c.chapter})`).join(", ")}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

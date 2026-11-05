"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  Filter,
  Layers,
  BookOpen,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  Bookmark,
} from "lucide-react";

export default function InteractiveKnowledgeGraph({
  initialCategory = "ALL",
  centerSlug = null,
  onSelectConcept = null,
}) {
  // Graph Data State
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Query State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState("ALL");
  const [selectedScripture, setSelectedScripture] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCenter, setCurrentCenter] = useState(centerSlug);
  const [depth, setDepth] = useState(1);

  // Path Finder State
  const [pathFinderOpen, setPathFinderOpen] = useState(false);
  const [pathStart, setPathStart] = useState("");
  const [pathEnd, setPathEnd] = useState("");
  const [pathResult, setPathResult] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);

  // Selected Node Details Drawer
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [nodeDetails, setNodeDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // SVG Pan & Zoom State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Node Positions (Force / Radial Layout Simulation)
  const [positions, setPositions] = useState({});
  const [draggedNode, setDraggedNode] = useState(null);

  // Load Graph Data from API
  const fetchGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== "ALL") {
        params.set("category", selectedCategory);
      }
      if (selectedSubCategory && selectedSubCategory !== "ALL") {
        params.set("subCategory", selectedSubCategory);
      }
      if (selectedScripture && selectedScripture !== "ALL") {
        params.set("scripture", selectedScripture);
      }
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }
      if (currentCenter) {
        params.set("center", currentCenter);
      }
      if (pathStart && pathEnd) {
        params.set("pathStart", pathStart);
        params.set("pathEnd", pathEnd);
      }
      params.set("limit", "50");
      params.set("depth", String(depth));

      const res = await fetch(`/api/knowledge-graph?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load knowledge graph.");
      const data = await res.json();
      setGraphData(data);

      // Compute initial 2D Layout for nodes
      const width = 900;
      const height = 550;
      const centerX = width / 2;
      const centerY = height / 2;
      const newPos = {};

      const count = data.nodes.length;
      data.nodes.forEach((node, i) => {
        // If center node requested, put it at exact center
        if (currentCenter && (node.slug === currentCenter || node.id === currentCenter)) {
          newPos[node.id] = { x: centerX, y: centerY, vx: 0, vy: 0 };
          return;
        }

        // Multi-ring concentric radial distribution based on category
        const angle = (i / Math.max(count, 1)) * 2 * Math.PI;
        let radius = 220;
        if (node.category === "KUNDALINI_SPIRITUALITY") radius = 170;
        else if (node.category === "DIGITAL_LIBRARY") radius = 290;
        else if (node.category === "VEDIC_ASTROLOGY") radius = 240;

        // Add slight pseudo-jitter to avoid perfect overlaps
        const jitter = ((i % 5) - 2) * 25;
        newPos[node.id] = {
          x: centerX + (radius + jitter) * Math.cos(angle),
          y: centerY + (radius + jitter) * Math.sin(angle),
          vx: 0,
          vy: 0,
        };
      });

      setPositions(newPos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSubCategory, searchQuery, currentCenter, depth]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // Load details when a node is clicked
  const handleNodeClick = async (node) => {
    setSelectedNodeId(node.id);
    setLoadingDetails(true);
    if (onSelectConcept) {
      onSelectConcept(node);
    }
    try {
      const res = await fetch(`/api/knowledge-graph/${node.id}`);
      if (res.ok) {
        const data = await res.json();
        setNodeDetails(data.concept);
      }
    } catch (e) {
      console.error("Error loading concept details:", e);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Center Graph on a specific concept
  const handleCenterOnConcept = (slugOrId) => {
    setCurrentCenter(slugOrId);
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  // Clear Center
  const handleClearCenter = () => {
    setCurrentCenter(null);
  };

  // Pan handlers
  const handleMouseDown = (e) => {
    if (draggedNode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e) => {
    if (draggedNode) {
      // Reposition dragged node
      setPositions((prev) => ({
        ...prev,
        [draggedNode]: {
          x: (e.clientX - (svgRef.current?.getBoundingClientRect().left || 0) - transform.x) / transform.scale,
          y: (e.clientY - (svgRef.current?.getBoundingClientRect().top || 0) - transform.y) / transform.scale,
          vx: 0,
          vy: 0,
        },
      }));
      return;
    }

    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  // Zoom controls
  const handleZoom = (factor) => {
    setTransform((prev) => {
      const newScale = Math.min(Math.max(prev.scale * factor, 0.4), 2.5);
      return { ...prev, scale: newScale };
    });
  };

  const handleResetZoom = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  // Find connecting path between two concepts
  const handleFindPath = async () => {
    if (!pathStart || !pathEnd) return;
    setPathLoading(true);
    setPathResult(null);
    try {
      const res = await fetch(
        `/api/knowledge-graph/path?start=${encodeURIComponent(pathStart.trim())}&end=${encodeURIComponent(pathEnd.trim())}`
      );
      const json = await res.json();
      setPathResult(json);
      if (json.found) {
        await fetchGraph();
      }
    } catch (e) {
      console.error("Path search failed:", e);
    } finally {
      setPathLoading(false);
    }
  };

  const handleClearPath = () => {
    setPathStart("");
    setPathEnd("");
    setPathResult(null);
    fetchGraph();
  };

  // Highlight active edges connected to selected node or along path
  const activeEdgeMap = useMemo(() => {
    const set = new Set();
    if (selectedNodeId) {
      graphData.edges.forEach((edge) => {
        if (edge.source === selectedNodeId || edge.target === selectedNodeId) {
          set.add(edge.id);
        }
      });
    }
    graphData.edges.forEach((edge) => {
      if (edge.isPathEdge) set.add(edge.id);
    });
    return set;
  }, [selectedNodeId, graphData.edges]);

  // Node color helper
  const getNodeColor = (node) => {
    if (node.isPathNode) return "#d97706"; // Amber highlight for path
    if (node.color) return node.color;
    if (node.category === "KUNDALINI_SPIRITUALITY") return "#047857"; // Emerald Green
    if (node.category === "DIGITAL_LIBRARY") return "#b45309"; // Amber / Gold
    if (node.category === "VEDIC_ASTROLOGY") return "#1e3a8a"; // Royal Blue
    if (node.category === "SANSKRIT_SHASTRA") return "#0f766e"; // Teal
    if (node.category === "PHILOSOPHY") return "#92400e"; // Brown
    return "#4b5563";
  };

  return (
    <div className="relative w-full rounded-3xl bg-[#fcfaf5] border border-amber-900/20 shadow-xs overflow-hidden flex flex-col min-h-[650px]">
      {/* --- TOP CONTROLS & FILTER BAR --- */}
      <div className="p-4 sm:p-5 bg-white/80 backdrop-blur-md border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Left: Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: "ALL", label: "All Concepts" },
            { id: "VEDIC_ASTROLOGY", label: "Vedic Astrology" },
            { id: "KUNDALINI_SPIRITUALITY", label: "Kundalini & Subtle Anatomy" },
            { id: "SANSKRIT_SHASTRA", label: "Sanskrit Shastra" },
            { id: "DIGITAL_LIBRARY", label: "Classical Manuscripts" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setSelectedSubCategory("ALL");
              }}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#13382c] text-amber-300 font-bold shadow-xs"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {cat.label}
            </button>
          ))}

          {/* Scripture Filter */}
          <select
            value={selectedScripture}
            onChange={(e) => setSelectedScripture(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Classical Texts</option>
            <option value="Parashara">Brihat Parashara Hora Shastra</option>
            <option value="Phaladeepika">Phaladeepika</option>
            <option value="Brihat Jataka">Brihat Jataka</option>
            <option value="Kundalini">Shat-Chakra-Nirupana</option>
          </select>
        </div>

        {/* Center: Search & Path Finder Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPathFinderOpen((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              pathFinderOpen || pathResult
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
            title="Highlight path between two concepts"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Path Finder</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 w-36 sm:w-44"
            />
          </div>

          {currentCenter && (
            <button
              onClick={handleClearCenter}
              className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 hover:bg-amber-200"
              title="Reset center node"
            >
              <span>Focused</span>
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={fetchGraph}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
            title="Refresh Graph"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* --- PATH FINDER EXPANDABLE BAR --- */}
      {pathFinderOpen && (
        <div className="px-5 py-3 bg-amber-50/90 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1 duration-150">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-serif font-bold text-amber-950 flex items-center gap-1">
              <Compass className="w-4 h-4 text-amber-700" />
              <span>Trace Classical Trail:</span>
            </span>

            <input
              type="text"
              placeholder="From: e.g. graha-surya"
              value={pathStart}
              onChange={(e) => setPathStart(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs font-mono w-44"
            />

            <ArrowRight className="w-3.5 h-3.5 text-amber-700" />

            <input
              type="text"
              placeholder="To: e.g. yoga-budhaditya"
              value={pathEnd}
              onChange={(e) => setPathEnd(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs font-mono w-44"
            />

            <button
              onClick={handleFindPath}
              disabled={pathLoading || !pathStart || !pathEnd}
              className="px-3.5 py-1 rounded-lg bg-[#13382c] hover:bg-[#1b4b3c] text-amber-300 font-bold text-xs transition disabled:opacity-50"
            >
              {pathLoading ? "Tracing..." : "Find Path"}
            </button>

            {(pathResult || pathStart || pathEnd) && (
              <button
                onClick={handleClearPath}
                className="px-2.5 py-1 rounded-lg text-stone-600 hover:text-stone-900 text-xs font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {pathResult && (
            <div className="text-[11px] font-mono text-stone-800 space-y-1 max-w-3xl">
              {pathResult.found ? (
                <>
                  <div className="text-emerald-800 font-bold flex items-center gap-1.5 flex-wrap">
                    <span>✓ Classical Path found ({pathResult.length} hops):</span>
                    <span className="font-sans font-medium text-stone-900 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                      {pathResult.summaryTrail || pathResult.pathNodes.map((n) => n.name).join(" → ")}
                    </span>
                  </div>
                  {pathResult.pathEdges && pathResult.pathEdges.length > 0 && (
                    <div className="flex flex-col gap-1 pt-1.5 border-t border-amber-200/60 font-sans text-stone-700">
                      {pathResult.pathEdges.map((edge, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <span className="font-bold text-amber-800 shrink-0">[{idx + 1}]</span>
                          <span>{edge.narrative || edge.title || edge.relationshipType}</span>
                          <span className="text-stone-500 italic text-[10px] shrink-0">
                            — {edge.classicalSource || "Classical Lineage"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-rose-700 font-medium">{pathResult.message}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- GRAPH CANVAS CONTAINER --- */}
      <div
        className="relative flex-1 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
            <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-serif italic text-stone-600">
              Traversing Classical Knowledge Graph...
            </span>
          </div>
        )}

        {/* Floating Zoom & Canvas Controls */}
        <div className="absolute bottom-5 left-5 z-20 bg-white/90 backdrop-blur-md rounded-2xl p-1.5 shadow-md border border-stone-200 flex flex-col gap-1">
          <button
            onClick={() => handleZoom(1.2)}
            className="p-2 hover:bg-stone-100 text-stone-700 rounded-xl transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            className="p-2 hover:bg-stone-100 text-stone-700 rounded-xl transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 hover:bg-stone-100 text-stone-700 rounded-xl transition"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Graph Statistics HUD */}
        <div className="absolute top-4 left-4 z-20 bg-white/80 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-xs border border-stone-200/80 text-[11px] font-mono text-stone-600 flex items-center gap-3">
          <span>{graphData.nodes.length} Nodes</span>
          <span>•</span>
          <span>{graphData.edges.length} Canonical Edges</span>
          <span>•</span>
          <span className="text-emerald-800 font-bold">100% Shastra Verified</span>
        </div>

        {/* --- MAIN INTERACTIVE SVG GRAPH --- */}
        <svg
          ref={svgRef}
          className="w-full h-[620px]"
          viewBox="0 0 900 550"
          style={{ width: "100%", height: "100%", minHeight: "580px" }}
        >
          <defs>
            <marker
              id="arrowhead"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
            </marker>
            <marker
              id="arrowhead-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
            </marker>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g
            transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
            style={{ transition: isDragging ? "none" : "transform 0.1s ease-out" }}
          >
            {/* 1. EDGES / RELATIONSHIP LINES */}
            {graphData.edges.map((edge) => {
              const src = positions[edge.source];
              const tgt = positions[edge.target];
              if (!src || !tgt) return null;

              const isActive = activeEdgeMap.has(edge.id);

              return (
                <g key={edge.id} className="cursor-pointer">
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isActive ? "#d97706" : "#cbd5e1"}
                    strokeWidth={isActive ? 2.5 : 1.2}
                    strokeDasharray={edge.status === "AI_DISCOVERED" ? "4,4" : undefined}
                    markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                    className="transition-colors duration-150"
                  />
                  {/* Midpoint Label if active */}
                  {isActive && (
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 6}
                      fill="#92400e"
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="bg-white"
                    >
                      {edge.title || edge.relationshipType}
                    </text>
                  )}
                </g>
              );
            })}

            {/* 2. NODES / CONCEPTS */}
            {graphData.nodes.map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;

              const isSelected = selectedNodeId === node.id;
              const isCenter = currentCenter && (node.slug === currentCenter || node.id === currentCenter);
              const color = getNodeColor(node);
              const radius = isCenter ? 26 : Math.min(Math.max(16 + (node.degree || 1) * 2, 18), 24);

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggedNode(node.id);
                  }}
                >
                  {/* Outer Glow on Selection */}
                  {isSelected && (
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                      className="animate-spin"
                      style={{ animationDuration: "12s" }}
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={radius}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 3 : 2}
                    filter={isSelected ? "url(#glow)" : undefined}
                    className="transition-transform group-hover:scale-110"
                  />

                  {/* Center Node Crown Indicator */}
                  {isCenter && (
                    <circle
                      r={radius - 4}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Node Sanskrit / Short Label inside */}
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill="#ffffff"
                    fontSize={node.sanskrit ? "11" : "9"}
                    fontFamily="serif"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                  >
                    {node.sanskrit || node.name.slice(0, 3)}
                  </text>

                  {/* Label Below Node */}
                  <text
                    textAnchor="middle"
                    dy={radius + 14}
                    fill="#1f2937"
                    fontSize="11"
                    fontFamily="sans-serif"
                    fontWeight={isSelected ? "bold" : "600"}
                    className="pointer-events-none select-none drop-shadow-xs"
                  >
                    {node.name.length > 20 ? `${node.name.slice(0, 18)}...` : node.name}
                  </text>

                  {/* SubCategory Tag */}
                  {node.subCategory && (
                    <text
                      textAnchor="middle"
                      dy={radius + 26}
                      fill="#6b7280"
                      fontSize="9"
                      fontFamily="monospace"
                      className="pointer-events-none select-none uppercase"
                    >
                      {node.subCategory}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* --- NODE DETAILS SLIDE-OVER DRAWER --- */}
        {selectedNodeId && (
          <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white/95 backdrop-blur-md shadow-2xl border-l border-stone-200 z-30 p-5 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-stone-200">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                  {nodeDetails?.subCategory || "Concept"}
                </span>
                <h3 className="font-serif font-bold text-lg text-stone-900 leading-tight">
                  {nodeDetails?.name || "Loading..."}
                </h3>
                {nodeDetails?.sanskrit && (
                  <p className="text-sm font-serif font-bold text-amber-900">
                    {nodeDetails.sanskrit} {nodeDetails.iast ? `(${nodeDetails.iast})` : ""}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-500">
                <div className="w-6 h-6 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Fetching shastric citations...</span>
              </div>
            ) : nodeDetails ? (
              <div className="space-y-4 text-xs">
                {/* Center / Focus Button */}
                <button
                  onClick={() => handleCenterOnConcept(nodeDetails.slug || nodeDetails.id)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold border border-amber-200/80 transition flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-4 h-4 text-amber-700" />
                  <span>Center Graph & Expand Neighborhood</span>
                </button>

                {/* Summary / Traditional Meaning */}
                <div className="space-y-1">
                  <span className="font-bold uppercase tracking-wider text-stone-500 text-[10px]">
                    Classical Signification
                  </span>
                  <p className="text-stone-800 leading-relaxed bg-[#fcfaf5] p-3 rounded-xl border border-stone-200/70 font-serif">
                    {nodeDetails.summary || nodeDetails.description || "Core shastric concept in the Gurukul lineage."}
                  </p>
                </div>

                {/* Classical Provenance */}
                {nodeDetails.traditionalMeaning && (
                  <div className="space-y-1">
                    <span className="font-bold uppercase tracking-wider text-stone-500 text-[10px]">
                      Traditional Authority / Lineage
                    </span>
                    <p className="text-stone-700 font-mono text-[11px] bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      {nodeDetails.traditionalMeaning}
                    </p>
                  </div>
                )}

                {/* Outgoing & Connected Concepts */}
                <div className="space-y-2">
                  <span className="font-bold uppercase tracking-wider text-stone-500 text-[10px] block">
                    Connected Relationships ({nodeDetails.relationshipsCount || 0})
                  </span>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto">
                    {[
                      ...(nodeDetails.outgoingRelations || []).map((r) => ({
                        concept: r.targetConcept,
                        rel: r,
                        dir: "→",
                      })),
                      ...(nodeDetails.incomingRelations || []).map((r) => ({
                        concept: r.sourceConcept,
                        rel: r,
                        dir: "←",
                      })),
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleNodeClick(item.concept)}
                        className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 cursor-pointer transition flex items-center justify-between"
                      >
                        <div className="truncate">
                          <span className="font-bold text-stone-900 font-serif block truncate">
                            {item.concept.name}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {item.rel.title || item.rel.relationshipType}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cross-Scriptural Intelligence Comparison */}
                {nodeDetails.crossScriptural && nodeDetails.crossScriptural.sources?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between font-bold uppercase tracking-wider text-amber-900 text-[10px]">
                      <span>Cross-Scriptural Comparison ({nodeDetails.crossScriptural.treatiseCount})</span>
                      <span className="text-[9px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">Verified</span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {nodeDetails.crossScriptural.sources.map((s, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1"
                        >
                          <div className="flex items-center justify-between font-mono text-[10px]">
                            <span className="font-bold text-stone-900 truncate">{s.treatise}</span>
                            <span className="text-amber-800 font-semibold">{s.relationshipType}</span>
                          </div>
                          <p className="text-[11px] text-stone-600 font-serif">
                            {s.perspective}
                          </p>
                          <p className="text-[9px] font-mono text-stone-400">
                            {s.author} • {s.tradition} • {s.chapter}
                          </p>
                        </div>
                      ))}
                    </div>

                    {nodeDetails.crossScriptural.consensus && (
                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-900 uppercase">Shastric Consensus:</span>
                        <p className="text-[11px] text-emerald-800 leading-relaxed font-serif">
                          {nodeDetails.crossScriptural.consensus}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Verified Passages in Published Books */}
                {nodeDetails.verifiedPassages?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <span className="font-bold uppercase tracking-wider text-stone-500 text-[10px] block">
                      Published Manuscript Passages ({nodeDetails.verifiedPassages.length})
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {nodeDetails.verifiedPassages.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-900/10 space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-mono text-[10px] text-stone-600">
                            <span className="font-bold truncate">{p.bookTitle}</span>
                            <span>Pg {p.sourcePage || "N/A"}</span>
                          </div>
                          <p className="italic font-serif text-stone-700 line-clamp-2">
                            "{p.snippet}"
                          </p>
                          <Link
                            href={p.readerUrl}
                            className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:underline text-[11px]"
                          >
                            <span>Open in Digital Reader</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
                  <Link
                    href={`/research?q=${encodeURIComponent(nodeDetails.name)}`}
                    className="w-full py-2.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-amber-300 font-bold text-center transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Research this Concept with AI</span>
                  </Link>
                </div>
              </div>
            ) : null}
          </aside>
        )}
      </div>
    </div>
  );
}

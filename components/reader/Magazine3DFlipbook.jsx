"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";

/**
 * Premium Realistic 3D Magazine-Style Flipbook Reader Component.
 * Engineered for instant initialization, high-DPI Sanskrit & Hindi Devanagari clarity,
 * responsive viewport sizing, realistic central spine depth, and smooth 3D page-turns.
 */
export default function Magazine3DFlipbook({
  pdfDoc,
  numPages,
  currentPage,
  onPageChange,
  scale = 1.0,
  title = "Vedic Manuscript",
  author = null,
  theme = "classic", // "classic" | "modern" | "night"
}) {
  const containerRef = useRef(null);
  const flipbookRef = useRef(null);
  const pageFlipInstanceRef = useRef(null);
  const renderedPagesRef = useRef(new Set());
  const activeRenderTasksRef = useRef({});
  const initTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  const [isInitializing, setIsInitializing] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(0.707); // Default A4 ~1:1.414 (0.707)

  // Compute responsive viewport dimensions dynamically
  const updateOptimalDimensions = useCallback((ratio = 0.707) => {
    if (typeof window === "undefined") {
      return { pageWidth: 540, pageHeight: 760, isPortrait: false };
    }

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const portrait = winW < 860;

    // Available reader viewport bounds
    const availH = Math.max(500, Math.min(980, winH - 150));
    const availW = Math.max(300, winW - (portrait ? 32 : 80));

    const safeRatio = ratio > 0.3 && ratio < 2.0 ? ratio : 0.707;

    let optimalH, optimalW;

    if (portrait) {
      optimalW = Math.min(availW, 640);
      optimalH = Math.round(optimalW / safeRatio);
      if (optimalH > availH) {
        optimalH = availH;
        optimalW = Math.round(optimalH * safeRatio);
      }
    } else {
      const maxSpreadW = availW;
      const maxSinglePageW = (maxSpreadW - 40) / 2;

      optimalH = Math.min(availH, 900);
      optimalW = Math.round(optimalH * safeRatio);

      if (optimalW > maxSinglePageW) {
        optimalW = Math.round(maxSinglePageW);
        optimalH = Math.round(optimalW / safeRatio);
      }
    }

    return {
      pageWidth: Math.max(280, optimalW),
      pageHeight: Math.max(400, optimalH),
      isPortrait: portrait,
    };
  }, []);

  const [dimensions, setDimensions] = useState(() => updateOptimalDimensions(0.707));

  // Determine authentic PDF page aspect ratio from page 1 once
  useEffect(() => {
    let isCancelled = false;
    async function determineAspectRatio() {
      if (!pdfDoc) return;
      try {
        const page1 = await pdfDoc.getPage(1);
        const vp = page1.getViewport({ scale: 1.0 });
        if (!isCancelled && vp.width > 0 && vp.height > 0) {
          const ratio = vp.width / vp.height;
          setAspectRatio(ratio);
          setDimensions(updateOptimalDimensions(ratio));
        }
      } catch (err) {
        console.warn("Could not determine PDF aspect ratio:", err);
      }
    }
    determineAspectRatio();
    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, updateOptimalDimensions]);

  // Window resize handler with 200ms debounce
  useEffect(() => {
    let resizeTimer = null;
    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setDimensions(updateOptimalDimensions(aspectRatio));
      }, 200);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, [aspectRatio, updateOptimalDimensions]);

  // High-performance canvas renderer for individual PDF pages
  const renderPageToCanvas = useCallback(
    async (pageNum) => {
      if (!pdfDoc || pageNum < 1 || pageNum > numPages) return;
      if (renderedPagesRef.current.has(pageNum)) return; // Already rendered

      const canvas = document.getElementById(`magazine-canvas-${pageNum}`);
      if (!canvas) return;

      // Cancel any ongoing task for this page
      if (activeRenderTasksRef.current[pageNum]) {
        try {
          activeRenderTasksRef.current[pageNum].cancel();
        } catch (_) {}
        delete activeRenderTasksRef.current[pageNum];
      }

      try {
        const page = await pdfDoc.getPage(pageNum);
        const baseVp = page.getViewport({ scale: 1.0 });

        // Optimal DPR clamp (1.35x max) for crisp typography with fast rasterization
        const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1.25, 1.4) : 1.25;
        const targetH = Math.min(Math.max(dimensions.pageHeight, 550), 920);
        const renderScale = (targetH / baseVp.height) * dpr;

        const viewport = page.getViewport({ scale: renderScale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.fillStyle = theme === "modern" ? "#ffffff" : "#fdfbf7";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });

        activeRenderTasksRef.current[pageNum] = renderTask;
        await renderTask.promise;

        renderedPagesRef.current.add(pageNum);
        delete activeRenderTasksRef.current[pageNum];

        // Hide placeholder loader for this page
        const loader = document.getElementById(`magazine-loader-${pageNum}`);
        if (loader) loader.style.display = "none";
      } catch (err) {
        if (err?.name !== "RenderingCancelledException") {
          console.warn(`Render page ${pageNum} error:`, err);
        }
      }
    },
    [pdfDoc, numPages, dimensions.pageHeight, theme]
  );

  // Render visible spread with immediate priority, then pre-render adjacent pages
  const renderNearbyPages = useCallback(
    (targetPage) => {
      if (!pdfDoc) return;

      const visiblePages = [];
      if (dimensions.isPortrait) {
        visiblePages.push(targetPage);
      } else {
        const leftPage = targetPage % 2 === 0 ? targetPage : targetPage - 1;
        const rightPage = leftPage + 1;
        if (leftPage >= 1 && leftPage <= numPages) visiblePages.push(leftPage);
        if (rightPage >= 1 && rightPage <= numPages) visiblePages.push(rightPage);
      }

      // Priority 1: Render visible pages immediately in parallel
      visiblePages.forEach((p) => {
        renderPageToCanvas(p);
      });

      // Priority 2: Pre-render adjacent folios smoothly after visible pages start painting
      if (typeof window !== "undefined") {
        setTimeout(() => {
          const bufferPages = dimensions.isPortrait
            ? [targetPage - 1, targetPage + 1]
            : [targetPage - 2, targetPage - 1, targetPage + 2, targetPage + 3];

          for (const p of bufferPages) {
            if (p >= 1 && p <= numPages && !renderedPagesRef.current.has(p)) {
              renderPageToCanvas(p);
            }
          }
        }, 120);
      }
    },
    [pdfDoc, numPages, dimensions.isPortrait, renderPageToCanvas]
  );

  // Initialize PageFlip 3D Engine
  useEffect(() => {
    let isCancelled = false;
    let pageFlipInstance = null;

    async function initPageFlip() {
      if (!pdfDoc || !flipbookRef.current || numPages < 1) {
        setIsInitializing(false);
        return;
      }

      setIsInitializing(true);
      renderedPagesRef.current.clear();

      // Safety timeout: Guarantee loader dismisses within 1000ms max under all conditions
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = setTimeout(() => {
        if (!isCancelled) {
          setIsInitializing(false);
        }
      }, 900);

      try {
        const mod = await import("page-flip");
        const PageFlip = mod.PageFlip || mod.default?.PageFlip || mod.default;

        if (isCancelled || !flipbookRef.current) {
          setIsInitializing(false);
          return;
        }

        // Clean up previous instance
        if (pageFlipInstanceRef.current) {
          try {
            pageFlipInstanceRef.current.destroy();
          } catch (_) {}
          pageFlipInstanceRef.current = null;
        }

        const containerEl = flipbookRef.current;
        containerEl.innerHTML = "";

        const flipWrapper = document.createElement("div");
        flipWrapper.className = "stf__mount_point";
        containerEl.appendChild(flipWrapper);

        // Build DOM elements for each folio page programmatically
        const fragment = document.createDocumentFragment();
        for (let index = 0; index < numPages; index++) {
          const pageNum = index + 1;
          const isFrontCover = pageNum === 1;
          const isBackCover = pageNum === numPages;
          const isHardCover = isFrontCover || isBackCover;
          const isLeftPage = pageNum % 2 === 0;

          const pageEl = document.createElement("div");
          pageEl.className = `magazine-page-item overflow-hidden relative flex flex-col justify-between ${
            theme === "modern"
              ? "bg-white text-stone-900"
              : theme === "night"
              ? "bg-[#181a19] text-stone-200"
              : "bg-[#fdfbf7] text-stone-900 border-[#eae0cc]"
          } ${isHardCover ? "data-density-hard" : "data-density-soft"}`;
          pageEl.setAttribute("data-density", isHardCover ? "hard" : "soft");
          pageEl.style.boxSizing = "border-box";
          pageEl.style.backgroundColor = theme === "modern" ? "#ffffff" : "#fdfbf7";
          if (!isHardCover) {
            pageEl.style.boxShadow = isLeftPage
              ? "-3px 0 0 -1px #ede4d1, -6px 0 0 -2px #e2d8c3, -9px 0 0 -3px #d6ccb5"
              : "3px 0 0 -1px #ede4d1, 6px 0 0 -2px #e2d8c3, 9px 0 0 -3px #d6ccb5";
          }

          let html = "";
          // Central spine gutter depth
          if (!isFrontCover) {
            html += `<div class="absolute inset-y-0 w-16 pointer-events-none z-10 ${
              isLeftPage
                ? "right-0 bg-gradient-to-l from-black/24 via-black/8 to-transparent"
                : "left-0 bg-gradient-to-r from-black/24 via-black/8 to-transparent"
            }"></div>`;

            // Vedic Silk Headband (Shirabandha) at Spine
            html += `<div class="absolute top-0 w-5 h-1.5 z-20 pointer-events-none ${
              isLeftPage ? "right-0 rounded-tl-sm" : "left-0 rounded-tr-sm"
            } bg-gradient-to-r from-[#b8860b] via-[#8b261e] to-[#b8860b] shadow-xs"></div>
            <div class="absolute bottom-0 w-5 h-1.5 z-20 pointer-events-none ${
              isLeftPage ? "right-0 rounded-bl-sm" : "left-0 rounded-br-sm"
            } bg-gradient-to-r from-[#b8860b] via-[#8b261e] to-[#b8860b] shadow-xs"></div>`;
          }

          // Subtle Paper Curvature
          html += `<div class="absolute inset-0 pointer-events-none z-10 bg-gradient-to-b from-white/10 via-transparent to-black/5"></div>`;

          // Placeholder loader
          html += `<div id="magazine-loader-${pageNum}" class="absolute inset-0 flex flex-col items-center justify-center bg-[#f8f5ed] z-5 pointer-events-none p-4 text-center space-y-2">
            <div class="w-12 h-16 rounded-md border border-[#d4a359]/30 bg-[#ede5d6]/50 animate-pulse"></div>
            <span class="text-[10px] font-serif text-stone-500">Page ${pageNum}</span>
          </div>`;

          // PDF Page Canvas
          html += `<div class="relative w-full h-full flex items-center justify-center overflow-hidden">
            <canvas id="magazine-canvas-${pageNum}" class="max-w-full max-h-full block object-contain shadow-2xs pointer-events-none"></canvas>
          </div>`;

          // Folio footer
          html += `<div class="absolute bottom-2 inset-x-0 px-4 flex items-center justify-between text-[10px] font-mono text-stone-400 pointer-events-none z-10 opacity-75">
            <span>${isLeftPage ? pageNum : ""}</span>
            <span class="font-serif italic text-stone-400 truncate max-w-[150px]">${pageNum > 1 && title ? title : ""}</span>
            <span>${!isLeftPage ? pageNum : ""}</span>
          </div>`;

          pageEl.innerHTML = html;
          fragment.appendChild(pageEl);
        }
        flipWrapper.appendChild(fragment);

        const pageFlip = new PageFlip(flipWrapper, {
          width: dimensions.pageWidth,
          height: dimensions.pageHeight,
          size: "stretch",
          minWidth: 260,
          maxWidth: 1100,
          minHeight: 380,
          maxHeight: 1400,
          maxShadowOpacity: 0.5,
          showCover: true,
          mobileScrollSupport: false,
          usePortrait: dimensions.isPortrait,
          startPage: Math.max(0, currentPage - 1),
          drawShadow: true,
          flippingTime: 550,
          useMouseEvents: true,
          swipeDistance: 25,
        });

        const pageElements = flipWrapper.querySelectorAll(".magazine-page-item");
        if (pageElements && pageElements.length > 0) {
          pageFlip.loadFromHTML(pageElements);
          pageFlipInstanceRef.current = pageFlip;
          pageFlipInstance = pageFlip;

          pageFlip.on("flip", (e) => {
            const newIndex = e.data;
            const newPageNum = newIndex + 1;
            onPageChange(newPageNum);
            renderNearbyPages(newPageNum);
          });

          // Unblock reader UI immediately
          setIsInitializing(false);

          // Render visible spread immediately
          renderNearbyPages(currentPage);
        } else {
          setIsInitializing(false);
        }
      } catch (err) {
        console.error("PageFlip initialization error:", err);
        setIsInitializing(false);
      }
    }

    initPageFlip();

    return () => {
      isCancelled = true;
      clearTimeout(initTimeoutRef.current);
      if (pageFlipInstance) {
        try {
          pageFlipInstance.destroy();
        } catch (_) {}
      }
      pageFlipInstanceRef.current = null;
    };
  }, [pdfDoc, numPages, dimensions.isPortrait, dimensions.pageWidth, dimensions.pageHeight]);

  // Sync external page changes
  useEffect(() => {
    if (pageFlipInstanceRef.current && !isInitializing) {
      const currentFlipIndex = pageFlipInstanceRef.current.getCurrentPageIndex();
      const targetIndex = Math.max(0, currentPage - 1);
      if (currentFlipIndex !== targetIndex) {
        try {
          pageFlipInstanceRef.current.flip(targetIndex);
          renderNearbyPages(currentPage);
        } catch (_) {}
      }
    }
  }, [currentPage, isInitializing, renderNearbyPages]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") {
        pageFlipInstanceRef.current?.flipPrev();
      } else if (e.key === "ArrowRight") {
        pageFlipInstanceRef.current?.flipNext();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[580px] sm:min-h-[780px] flex items-center justify-center p-1 sm:p-4 select-none overflow-hidden"
      style={{
        transform: scale !== 1.0 ? `scale(${scale})` : undefined,
        transformOrigin: "center center",
        transition: "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
      }}
    >
      {/* Loading Overlay with 900ms Safety Timeout */}
      {isInitializing && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a1a13]/80 backdrop-blur-xs text-[#fdfaf5] space-y-3">
          <Loader2 className="w-9 h-9 text-[#d4a359] animate-spin" />
          <p className="font-serif font-bold text-sm text-[#fdfaf5]">
            Opening Vedic Manuscript...
          </p>
          <span className="text-xs text-amber-200/60 font-mono">
            Synchronizing Classical Folios
          </span>
        </div>
      )}

      {/* 3D Physical Magazine Container */}
      <div
        className="relative mx-auto"
        style={{
          perspective: "2600px",
        }}
      >
        {/* Flipbook Host Root Element */}
        <div
          ref={flipbookRef}
          className="magazine-flipbook-host overflow-hidden rounded-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
        />
      </div>
    </div>
  );
}

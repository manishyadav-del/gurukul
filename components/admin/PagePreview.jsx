"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, Image as ImageIcon } from "lucide-react";

export default function PagePreview({ imageUrl, blocks = [], pageNumber = 1, width = 600, height = 800 }) {
  const [zoom, setZoom] = useState(1);
  const [showBoxes, setShowBoxes] = useState(false);
  const [selectedBlockOrder, setSelectedBlockOrder] = useState(null);

  const handleZoomIn = () => setZoom((z) => Math.min(3, z + 0.25));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 flex flex-col h-full shadow-inner">
      {/* Header Toolbar */}
      <div className="bg-stone-950/80 px-4 py-2.5 flex items-center justify-between border-b border-stone-800 text-stone-300 text-xs">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-stone-200">Original Scanned Page #{pageNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          {blocks && blocks.length > 0 && (
            <button
              onClick={() => setShowBoxes(!showBoxes)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
                showBoxes
                  ? "bg-amber-600 text-white"
                  : "bg-stone-800 hover:bg-stone-700 text-stone-300"
              }`}
            >
              {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Boxes ({blocks.length})</span>
            </button>
          )}

          <div className="flex items-center bg-stone-800 rounded-lg p-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-stone-700 rounded-md transition text-stone-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-stone-300">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-stone-700 rounded-md transition text-stone-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 hover:bg-stone-700 rounded-md transition text-stone-400 hover:text-white ml-1 border-l border-stone-700"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="relative flex-1 overflow-auto p-4 flex items-center justify-center min-h-[500px] bg-stone-950/40">
        {imageUrl ? (
          <div
            className="relative transition-transform duration-150 origin-top shadow-2xl rounded-sm overflow-hidden"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              src={imageUrl}
              alt={`Page ${pageNumber}`}
              className="max-w-full h-auto block select-none pointer-events-none"
              style={{ maxHeight: "80vh" }}
            />

            {/* OCR Bounding Boxes Overlay */}
            {showBoxes && blocks && blocks.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {blocks.map((b) => {
                  const bbox = b.bbox || (b.x !== null ? { x: b.x, y: b.y, width: b.width, height: b.height } : null);
                  if (!bbox) return null;

                  const isSelected = selectedBlockOrder === (b.order || b.blockOrder);

                  return (
                    <div
                      key={b.id || b.order || b.blockOrder}
                      className={`absolute border transition-colors ${
                        isSelected
                          ? "border-amber-400 bg-amber-400/30"
                          : "border-emerald-500/80 bg-emerald-500/10 hover:border-amber-300"
                      }`}
                      style={{
                        left: `${bbox.x}px`,
                        top: `${bbox.y}px`,
                        width: `${bbox.width}px`,
                        height: `${bbox.height}px`,
                      }}
                      title={`Block #${b.order || b.blockOrder}: ${b.text}`}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 text-stone-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">No Page Image Rendered</p>
            <p className="text-xs text-stone-600 mt-1">This page will render during ingestion.</p>
          </div>
        )}
      </div>
    </div>
  );
}

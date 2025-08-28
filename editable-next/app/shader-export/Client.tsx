"use client";

import { useCallback, useRef, useState } from "react";
import HeroCanvas from "../../components/HeroCanvas";

export default function ShaderExportClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
    // Allow a short delay for first frames to render
    setTimeout(() => setReady(true), 400);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      setDownloading(true);
      // Wait a couple frames to ensure a fresh render
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `fater-shader-1200x630.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setDownloading(false);
    }
  }, []);

  return (
    <main style={{ padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Shader Export (1200×630)</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>
        This renders the hero shader without text at share-image dimensions. Click Export to download a PNG.
      </p>

      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: 1200,
          height: 630,
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {/* Render the shader exactly at 1200x630, pixelRatio=1 to avoid scaling */}
        <HeroCanvas fixed={false} phase="hero" onCanvasReady={handleCanvasReady} pixelRatio={1} />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={handleDownload}
          disabled={!ready || downloading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
            background: ready ? "#1f2937" : "#111827",
            color: "#fff",
            cursor: ready ? "pointer" : "not-allowed",
          }}
        >
          {downloading ? "Exporting…" : "Export PNG"}
        </button>
      </div>
    </main>
  );
}

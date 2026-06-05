import React, { useEffect, useRef } from "react";
import { AudioAnalyzerResult } from "../hooks/useAudioAnalyzer";

export interface WaveformVisualizerProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  /** The analyzer result from useAudioAnalyzer */
  analyzer?: AudioAnalyzerResult;
  /** Color of the waveform */
  color?: string;
  /** Line width of the waveform */
  lineWidth?: number;
  /** Canvas rendering scaling for high DPI displays (default: window.devicePixelRatio) */
  dpr?: number;
}

export const WaveformVisualizer = React.forwardRef<HTMLCanvasElement, WaveformVisualizerProps>(
  (
    {
      analyzer,
      color = "#ffffff",
      lineWidth = 2,
      dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      style,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalRef;

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !analyzer?.waveformData) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Handle Resize and High DPI
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      let animationFrameId: number;

      const render = () => {
        const width = rect.width;
        const height = rect.height;
        const data = analyzer.waveformData;

        ctx.clearRect(0, 0, width, height);

        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();

        const sliceWidth = width / data.length;
        let x = 0;

        for (let i = 0; i < data.length; i++) {
          // Normalize Web Audio API time domain data (usually between -1 and 1)
          const v = data[i];
          const y = (v * height) / 2 + height / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();

        animationFrameId = requestAnimationFrame(render);
      };

      render();

      return () => cancelAnimationFrame(animationFrameId);
    }, [analyzer, color, lineWidth, dpr]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          ...style,
        }}
        {...props}
      />
    );
  }
);

WaveformVisualizer.displayName = "WaveformVisualizer";

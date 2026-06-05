import React, { useEffect, useRef } from "react";
import { AudioAnalyzerResult } from "../hooks/useAudioAnalyzer";

export interface SiriVisualizerProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  /** The analyzer result from useAudioAnalyzer */
  analyzer?: AudioAnalyzerResult;
  /** Direct amplitude value (0-1) to use if analyzer is not provided */
  amplitude?: number;
  /** Colors of the flowing waves */
  colors?: string[];
  /** Speed of the wave animation */
  speed?: number;
  /** Canvas rendering scaling for high DPI displays (default: window.devicePixelRatio) */
  dpr?: number;
}

export const SiriVisualizer = React.forwardRef<HTMLCanvasElement, SiriVisualizerProps>(
  (
    {
      analyzer,
      amplitude: fallbackAmplitude = 0,
      colors = ["rgba(255, 50, 100, 0.5)", "rgba(50, 150, 255, 0.5)", "rgba(50, 255, 150, 0.5)"],
      speed = 0.02,
      dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      style,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalRef;
    
    // Store smoothed amplitude for interpolation
    const smoothedAmpRef = useRef(0);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      };
      
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      let animationFrameId: number;
      let phase = 0;

      const drawWave = (
        width: number,
        height: number,
        color: string,
        amplitude: number,
        frequency: number,
        phaseOffset: number
      ) => {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        
        for (let x = 0; x <= width; x += 2) {
          // Attenuate wave at edges for a bubble/orb-like middle if desired, 
          // or just a continuous wave. Here we do continuous with slight edge taper.
          const xProgress = x / width;
          const edgeAttenuation = Math.sin(xProgress * Math.PI);
          
          const y =
            height / 2 +
            Math.sin(xProgress * frequency * Math.PI * 2 + phase + phaseOffset) *
              amplitude * edgeAttenuation;

          ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      };

      const render = () => {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = "screen";

        const targetAmplitude = analyzer ? analyzer.amplitude : fallbackAmplitude;
        
        // Smoothly interpolate amplitude
        smoothedAmpRef.current += (targetAmplitude - smoothedAmpRef.current) * 0.1;
        
        // Base amplitude mapping (pixel scale)
        const baseHeight = height * 0.05;
        const activeHeight = height * 0.3 * smoothedAmpRef.current;
        const currentAmp = baseHeight + activeHeight;

        phase += speed;

        colors.forEach((color, i) => {
          // Vary frequency, phase offset, and height slightly per layer
          const layerFrequency = 1 + i * 0.5;
          const phaseOffset = i * (Math.PI / 2);
          const layerAmplitude = currentAmp * (1 - i * 0.15);
          
          drawWave(width, height, color, layerAmplitude, layerFrequency, phaseOffset);
        });

        animationFrameId = requestAnimationFrame(render);
      };

      render();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", resizeCanvas);
      };
    }, [analyzer, fallbackAmplitude, colors, speed, dpr]);

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

SiriVisualizer.displayName = "SiriVisualizer";

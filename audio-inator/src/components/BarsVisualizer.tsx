import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { AudioAnalyzerResult } from "../hooks/useAudioAnalyzer";

export interface BarsVisualizerProps extends HTMLMotionProps<"div"> {
  /** The analyzer result from useAudioAnalyzer */
  analyzer?: AudioAnalyzerResult;
  /** Direct stream to use (if analyzer is not provided) */
  stream?: MediaStream;
  /** Number of bars to display */
  bars?: number;
  /** Base height of the bars in pixels */
  baseHeight?: number;
  /** Maximum height of the bars in pixels */
  maxHeight?: number;
  /** Bar width in pixels */
  barWidth?: number;
  /** Spacing between bars in pixels */
  spacing?: number;
  /** Corner radius of the bars */
  radius?: number;
  /** Color of the bars */
  color?: string;
  /** Amplitude sensitivity multiplier */
  sensitivity?: number;
  /** Fallback amplitude if no analyzer or stream is provided */
  amplitude?: number;
}

export const BarsVisualizer = React.forwardRef<HTMLDivElement, BarsVisualizerProps>(
  (
    {
      analyzer,
      bars = 5,
      baseHeight = 16,
      maxHeight = 64,
      barWidth = 8,
      spacing = 4,
      radius = 4,
      color = "currentColor",
      sensitivity = 1.2,
      amplitude: fallbackAmplitude = 0,
      style,
      ...props
    },
    ref
  ) => {
    // If an analyzer is passed, we use its amplitude and frequency data.
    // Alternatively we can use a direct amplitude prop.
    const effectiveAmplitude = analyzer ? analyzer.amplitude : fallbackAmplitude;
    const frequencyData = analyzer?.frequencyData;

    // Generate bar heights based on frequency data if available, or just fallback amplitude
    const renderBars = Array.from({ length: bars }).map((_, i) => {
      let barScale = effectiveAmplitude;
      
      if (frequencyData && frequencyData.length > 0) {
        // Map bar index to a frequency bin
        const binIndex = Math.floor((i / bars) * (frequencyData.length * 0.5));
        // frequencyData values are generally in dB (-100 to 0)
        const db = frequencyData[binIndex] || -100;
        // Normalize roughly to 0-1
        const normalizedFreq = Math.max(0, (db + 100) / 100);
        barScale = normalizedFreq * sensitivity;
      } else {
        // Pseudo-randomize if only using overall amplitude to make it look alive
        const offset = Math.sin(i * 1.5 + Date.now() / 200) * 0.2 + 0.8;
        barScale = effectiveAmplitude * sensitivity * offset;
      }

      // Ensure minimal height and bound by maxHeight
      const targetHeight = Math.max(
        baseHeight,
        Math.min(maxHeight, baseHeight + barScale * maxHeight)
      );

      return (
        <motion.div
          key={i}
          animate={{ height: targetHeight }}
          transition={{
            type: "spring",
            bounce: 0,
            damping: 20,
            stiffness: 300,
          }}
          style={{
            width: barWidth,
            borderRadius: radius,
            backgroundColor: color,
            flexShrink: 0,
          }}
        />
      );
    });

    return (
      <motion.div
        ref={ref}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: spacing,
          height: maxHeight,
          ...style,
        }}
        {...props}
      >
        {renderBars}
      </motion.div>
    );
  }
);

BarsVisualizer.displayName = "BarsVisualizer";

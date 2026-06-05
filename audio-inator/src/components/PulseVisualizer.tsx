import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { AudioAnalyzerResult } from "../hooks/useAudioAnalyzer";

export interface PulseVisualizerProps extends HTMLMotionProps<"div"> {
  /** The analyzer result from useAudioAnalyzer */
  analyzer?: AudioAnalyzerResult;
  /** Direct amplitude value (0-1) to use if analyzer is not provided */
  amplitude?: number;
  /** Number of concentric rings */
  rings?: number;
  /** Base size of the inner circle */
  baseSize?: number;
  /** Color of the rings */
  color?: string;
  /** Sensitivity multiplier for the scale */
  sensitivity?: number;
}

export const PulseVisualizer = React.forwardRef<HTMLDivElement, PulseVisualizerProps>(
  (
    {
      analyzer,
      amplitude: fallbackAmplitude = 0,
      rings = 3,
      baseSize = 40,
      color = "#ffffff",
      sensitivity = 1.5,
      style,
      ...props
    },
    ref
  ) => {
    const effectiveAmplitude = analyzer ? analyzer.amplitude : fallbackAmplitude;
    const isSpeaking = analyzer ? analyzer.isSpeaking : effectiveAmplitude > 0.05;

    return (
      <motion.div
        ref={ref}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: baseSize * 4,
          height: baseSize * 4,
          ...style,
        }}
        {...props}
      >
        {/* Inner solid circle */}
        <motion.div
          animate={{
            scale: 1 + effectiveAmplitude * sensitivity * 0.5,
          }}
          transition={{
            type: "spring",
            bounce: 0,
            damping: 20,
            stiffness: 300,
          }}
          style={{
            position: "absolute",
            width: baseSize,
            height: baseSize,
            borderRadius: "50%",
            backgroundColor: color,
            zIndex: rings + 1,
          }}
        />

        {/* Concentric pulsing rings */}
        {Array.from({ length: rings }).map((_, i) => {
          const delay = i * 0.1;
          const targetScale = isSpeaking ? 1 + effectiveAmplitude * sensitivity * (i + 1) : 1;
          const targetOpacity = isSpeaking ? 0.3 - i * 0.05 : 0;

          return (
            <motion.div
              key={i}
              animate={{
                scale: targetScale,
                opacity: targetOpacity,
              }}
              transition={{
                type: "spring",
                bounce: 0,
                damping: 15,
                stiffness: 150,
                delay: isSpeaking ? delay : 0,
              }}
              style={{
                position: "absolute",
                width: baseSize,
                height: baseSize,
                borderRadius: "50%",
                border: `2px solid ${color}`,
                boxSizing: "border-box",
                zIndex: rings - i,
              }}
            />
          );
        })}
      </motion.div>
    );
  }
);

PulseVisualizer.displayName = "PulseVisualizer";

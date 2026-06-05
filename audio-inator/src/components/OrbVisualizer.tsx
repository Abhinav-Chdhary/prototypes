import React, { useMemo } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { AudioAnalyzerResult } from "../hooks/useAudioAnalyzer";

export interface OrbVisualizerProps extends Omit<HTMLMotionProps<"div">, "children"> {
  /** The analyzer result from useAudioAnalyzer */
  analyzer?: AudioAnalyzerResult;
  /** Direct amplitude value (0-1) to use if analyzer is not provided */
  amplitude?: number;
  /** Base size of the orb in pixels */
  baseSize?: number;
  /** Maximum scale multiplier when speaking */
  maxScale?: number;
  /** Color of the orb */
  color?: string;
  /** Optional inner color for a gradient effect */
  innerColor?: string;
  /** Enable breathing idle animation when not speaking */
  enableBreathing?: boolean;
}

export const OrbVisualizer = React.forwardRef<HTMLDivElement, OrbVisualizerProps>(
  (
    {
      analyzer,
      amplitude: fallbackAmplitude = 0,
      baseSize = 100,
      maxScale = 1.5,
      color = "#ffffff",
      innerColor,
      enableBreathing = true,
      style,
      ...props
    },
    ref
  ) => {
    const effectiveAmplitude = analyzer ? analyzer.amplitude : fallbackAmplitude;
    const isSpeaking = analyzer ? analyzer.isSpeaking : effectiveAmplitude > 0.05;

    const scale = 1 + effectiveAmplitude * (maxScale - 1);
    const blur = 10 + effectiveAmplitude * 20;

    const backgroundStyle = useMemo(() => {
      if (innerColor) {
        return `radial-gradient(circle at 30% 30%, ${innerColor}, ${color})`;
      }
      return color;
    }, [color, innerColor]);

    return (
      <motion.div
        ref={ref}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: baseSize * maxScale,
          height: baseSize * maxScale,
          ...style,
        }}
      >
        <motion.div
          animate={
            isSpeaking
              ? {
                  scale: scale,
                  boxShadow: `0 0 ${blur}px ${color}`,
                }
              : {
                  scale: enableBreathing ? [1, 1.05, 1] : 1,
                  boxShadow: `0 0 10px ${color}`,
                }
          }
          transition={
            isSpeaking
              ? {
                  type: "spring",
                  bounce: 0.2,
                  damping: 15,
                  stiffness: 200,
                }
              : {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
          style={{
            width: baseSize,
            height: baseSize,
            borderRadius: "50%",
            background: backgroundStyle,
          }}
          {...props}
        />
      </motion.div>
    );
  }
);

OrbVisualizer.displayName = "OrbVisualizer";

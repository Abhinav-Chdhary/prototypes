import { useState, useEffect, useRef, useCallback } from "react";

export interface AudioAnalyzerOptions {
  /** A MediaStream, usually from navigator.mediaDevices.getUserMedia */
  stream?: MediaStream;
  /** An HTMLAudioElement to analyze */
  audioElement?: HTMLAudioElement;
  /** An existing AudioContext to use */
  audioContext?: AudioContext;
  /** FFT Size for the analyzer node, must be power of 2. Default is 256. */
  fftSize?: number;
  /** Smoothing time constant (0-1). Default is 0.8 */
  smoothingTimeConstant?: number;
  /** Direct amplitude value if bypassing the Web Audio API */
  amplitude?: number;
}

export interface AudioAnalyzerResult {
  /** The current overall volume/amplitude from 0 to 1 */
  amplitude: number;
  /** The frequency data array (bars) */
  frequencyData: Float32Array;
  /** The time domain waveform data array (wave) */
  waveformData: Float32Array;
  /** Boolean indicating if speaking is detected (amplitude > threshold) */
  isSpeaking: boolean;
}

const DEFAULT_FFT_SIZE = 256;
const SPEAKING_THRESHOLD = 0.05;

/**
 * Headless hook to analyze audio from various sources and extract
 * reactive amplitude, frequency, and waveform data for visualizers.
 */
export function useAudioAnalyzer(
  options: AudioAnalyzerOptions = {}
): AudioAnalyzerResult {
  const {
    stream,
    audioElement,
    audioContext: externalContext,
    fftSize = DEFAULT_FFT_SIZE,
    smoothingTimeConstant = 0.8,
    amplitude: manualAmplitude,
  } = options;

  const [amplitude, setAmplitude] = useState(manualAmplitude ?? 0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [frequencyData, setFrequencyData] = useState<Float32Array>(
    new Float32Array(fftSize / 2)
  );
  const [waveformData, setWaveformData] = useState<Float32Array>(
    new Float32Array(fftSize)
  );

  const contextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const requestRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    if (analyzerRef.current) {
      analyzerRef.current.disconnect();
    }
    // Only close the context if we created it internally
    if (contextRef.current && !externalContext) {
      // Don't await closing, just fire and forget to avoid hook state issues
      contextRef.current.close().catch(() => {});
    }
    contextRef.current = null;
    analyzerRef.current = null;
    sourceRef.current = null;
  }, [externalContext]);

  useEffect(() => {
    if (manualAmplitude !== undefined) {
      setAmplitude(manualAmplitude);
      setIsSpeaking(manualAmplitude > SPEAKING_THRESHOLD);
      return;
    }

    if (!stream && !audioElement) {
      // Return flat data if no source is provided
      setAmplitude(0);
      setIsSpeaking(false);
      setFrequencyData(new Float32Array(fftSize / 2));
      setWaveformData(new Float32Array(fftSize));
      return;
    }

    cleanup();

    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = externalContext || new AudioContextClass();
      contextRef.current = ctx;

      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = fftSize;
      analyzer.smoothingTimeConstant = smoothingTimeConstant;
      analyzerRef.current = analyzer;

      if (stream) {
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyzer);
        sourceRef.current = source;
      } else if (audioElement) {
        const source = ctx.createMediaElementSource(audioElement);
        source.connect(analyzer);
        // Important: connect back to destination to hear it
        analyzer.connect(ctx.destination);
        sourceRef.current = source;
      }

      const freqData = new Float32Array(analyzer.frequencyBinCount);
      const waveData = new Float32Array(analyzer.fftSize);

      const update = () => {
        if (!analyzerRef.current) return;

        analyzerRef.current.getFloatFrequencyData(freqData);
        analyzerRef.current.getFloatTimeDomainData(waveData);

        // Calculate RMS amplitude from waveform
        let sumSquares = 0;
        for (let i = 0; i < waveData.length; i++) {
          sumSquares += waveData[i] * waveData[i];
        }
        const rms = Math.sqrt(sumSquares / waveData.length);
        // Scale RMS to a roughly 0-1 range (RMS for sine wave is ~0.707, but voice varies)
        const currentAmp = Math.min(1, rms * 3);

        setAmplitude(currentAmp);
        setIsSpeaking(currentAmp > SPEAKING_THRESHOLD);
        
        // We clone arrays so React detects state change if needed, 
        // though for perf, visualizers should probably use refs.
        // For this library, we'll return copies. 
        // Framer motion can handle rapid state updates nicely.
        setFrequencyData(new Float32Array(freqData));
        setWaveformData(new Float32Array(waveData));

        requestRef.current = requestAnimationFrame(update);
      };

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      requestRef.current = requestAnimationFrame(update);
    } catch (err) {
      console.error("Audio-inator: Failed to initialize audio context", err);
    }

    return cleanup;
  }, [
    stream,
    audioElement,
    externalContext,
    fftSize,
    smoothingTimeConstant,
    manualAmplitude,
    cleanup,
  ]);

  return {
    amplitude,
    frequencyData,
    waveformData,
    isSpeaking,
  };
}

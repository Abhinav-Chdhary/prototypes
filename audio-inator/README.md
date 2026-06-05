# audio-inator

The best React audio visualization library for modern AI voice applications. 
Build beautiful, responsive, and performant audio visualizers for your voice agents, podcast tools, and realtime AI applications.

## Features

- 🎨 **Premium Visualizations**: Inspired by top AI tools (ChatGPT, Siri, Linear, ElevenLabs)
- 🧠 **Headless Engine**: `useAudioAnalyzer` hook to process any audio source
- ⚡ **Performant**: 60fps animations with `requestAnimationFrame` and Framer Motion spring physics
- 🔌 **Universal Sources**: Works with `MediaStream`, `AudioContext`, `HTMLAudioElement`, or manual amplitude inputs
- 🌳 **Tree-shakeable**: ESM first, zero runtime errors, strictly typed

## Installation

```bash
npm install audio-inator
# or
yarn add audio-inator
# or
pnpm add audio-inator
# or
bun add audio-inator
```

*Note: `framer-motion` and `react` are required peer dependencies.*

## Getting Started

### 1. Initialize the Audio Engine

```tsx
import { useAudioAnalyzer, BarsVisualizer } from "audio-inator";

function MyAgent() {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(setStream);
  }, []);

  const analyzer = useAudioAnalyzer({ stream });

  return (
    <div>
      <BarsVisualizer analyzer={analyzer} color="#3b82f6" />
    </div>
  );
}
```

### 2. Manual Amplitude Mode (e.g., OpenAI Realtime API)

If your backend already provides amplitude values, you can pass them directly to the visualizers, bypassing the Web Audio API entirely.

```tsx
import { OrbVisualizer } from "audio-inator";

function ChatGPTClone({ serverAmplitude }) {
  return (
    <OrbVisualizer 
      amplitude={serverAmplitude} 
      color="#10b981" 
      maxScale={1.8} 
    />
  );
}
```

## Available Visualizers

### `<BarsVisualizer />`
A classic equalizer bar visualizer with spring-animated heights.

```tsx
<BarsVisualizer
  analyzer={analyzer}
  bars={5}
  baseHeight={16}
  maxHeight={100}
  barWidth={12}
  spacing={8}
  radius={6}
  color="#60a5fa"
/>
```

### `<SiriVisualizer />`
Organic, multi-layered flowing waves similar to Apple Siri.

```tsx
<SiriVisualizer
  analyzer={analyzer}
  colors={["rgba(255, 50, 100, 0.5)", "rgba(50, 150, 255, 0.5)"]}
  speed={0.02}
  style={{ width: "300px", height: "100px" }}
/>
```

### `<OrbVisualizer />`
A glowing, breathing orb that scales based on audio amplitude. Perfect for conversational agents.

```tsx
<OrbVisualizer
  analyzer={analyzer}
  baseSize={100}
  maxScale={1.5}
  color="#eab308"
  enableBreathing={true}
/>
```

### `<PulseVisualizer />`
Concentric rings that pulse outwards based on volume. Low CPU usage.

```tsx
<PulseVisualizer
  analyzer={analyzer}
  rings={3}
  color="#10b981"
  baseSize={40}
/>
```

### `<WaveformVisualizer />`
A real time-domain waveform rendering using HTML Canvas.

```tsx
<WaveformVisualizer
  analyzer={analyzer}
  color="#f43f5e"
  lineWidth={3}
  style={{ width: "100%", height: "150px" }}
/>
```

## Advanced Usage

### Using with HTMLAudioElement

```tsx
const audioRef = useRef<HTMLAudioElement>(null);
const analyzer = useAudioAnalyzer({ audioElement: audioRef.current });

return (
  <>
    <audio ref={audioRef} src="/test.mp3" controls />
    <WaveformVisualizer analyzer={analyzer} />
  </>
);
```

## License

MIT

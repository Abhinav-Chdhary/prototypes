import React, { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { WaveformVisualizer } from "../components/WaveformVisualizer";
import { useAudioAnalyzer } from "../hooks/useAudioAnalyzer";

const meta: Meta<typeof WaveformVisualizer> = {
  title: "Visualizers/WaveformVisualizer",
  component: WaveformVisualizer,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    color: { control: "color" },
    lineWidth: { control: { type: "number", min: 1, max: 10 } },
  },
};

export default meta;
type Story = StoryObj<typeof WaveformVisualizer>;

// A helper component to simulate waveform data for storybook since we can't easily mock an AudioContext stream in a simple story without user interaction
const MockWaveform = (props: any) => {
  const [data, setData] = useState(new Float32Array(256));

  useEffect(() => {
    let animationFrameId: number;
    let phase = 0;

    const animate = () => {
      const arr = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        // Create a fake moving waveform
        arr[i] = Math.sin((i / 256) * Math.PI * 4 + phase) * 0.5 * Math.sin(phase * 0.5);
      }
      setData(arr);
      phase += 0.1;
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <WaveformVisualizer
      {...props}
      analyzer={{
        waveformData: data,
        amplitude: 0.5,
        frequencyData: new Float32Array(128),
        isSpeaking: true,
      }}
    />
  );
};

export const Default: Story = {
  render: (args) => <MockWaveform {...args} />,
  args: {
    style: { width: "400px", height: "100px" },
    color: "#f43f5e",
    lineWidth: 3,
  },
};

export const Idle: Story = {
  render: (args) => (
    <WaveformVisualizer
      {...args}
      analyzer={{
        waveformData: new Float32Array(256),
        amplitude: 0,
        frequencyData: new Float32Array(128),
        isSpeaking: false,
      }}
    />
  ),
  args: {
    style: { width: "400px", height: "100px" },
    color: "#9ca3af",
    lineWidth: 2,
  },
};

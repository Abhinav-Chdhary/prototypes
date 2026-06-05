import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BarsVisualizer } from "../components/BarsVisualizer";

const meta: Meta<typeof BarsVisualizer> = {
  title: "Visualizers/BarsVisualizer",
  component: BarsVisualizer,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    amplitude: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Direct amplitude value for testing",
    },
    color: { control: "color" },
    bars: { control: { type: "number", min: 1, max: 50 } },
    baseHeight: { control: "number" },
    maxHeight: { control: "number" },
    barWidth: { control: "number" },
    spacing: { control: "number" },
    radius: { control: "number" },
    sensitivity: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof BarsVisualizer>;

export const Default: Story = {
  args: {
    amplitude: 0.5,
    bars: 5,
    baseHeight: 16,
    maxHeight: 100,
    barWidth: 12,
    spacing: 8,
    radius: 6,
    color: "#60a5fa",
    sensitivity: 1.2,
  },
};

export const Idle: Story = {
  args: {
    amplitude: 0.1,
    bars: 7,
    color: "#a78bfa",
  },
};

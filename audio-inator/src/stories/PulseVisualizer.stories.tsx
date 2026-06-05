import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PulseVisualizer } from "../components/PulseVisualizer";

const meta: Meta<typeof PulseVisualizer> = {
  title: "Visualizers/PulseVisualizer",
  component: PulseVisualizer,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    amplitude: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Direct amplitude value for testing",
    },
    color: { control: "color" },
    rings: { control: { type: "number", min: 1, max: 10 } },
    baseSize: { control: "number" },
    sensitivity: { control: { type: "range", min: 0, max: 3, step: 0.1 } },
  },
};

export default meta;
type Story = StoryObj<typeof PulseVisualizer>;

export const Default: Story = {
  args: {
    amplitude: 0.6,
    rings: 3,
    baseSize: 40,
    color: "#10b981",
    sensitivity: 1.5,
  },
};

export const Idle: Story = {
  args: {
    amplitude: 0,
    rings: 3,
    color: "#6b7280",
  },
};

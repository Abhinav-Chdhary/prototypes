import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OrbVisualizer } from "../components/OrbVisualizer";

const meta: Meta<typeof OrbVisualizer> = {
  title: "Visualizers/OrbVisualizer",
  component: OrbVisualizer,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    amplitude: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Direct amplitude value for testing",
    },
    color: { control: "color" },
    innerColor: { control: "color" },
    baseSize: { control: "number" },
    maxScale: { control: { type: "range", min: 1, max: 3, step: 0.1 } },
    enableBreathing: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof OrbVisualizer>;

export const Default: Story = {
  args: {
    amplitude: 0.5,
    baseSize: 100,
    maxScale: 1.5,
    color: "#eab308",
    innerColor: "#fef08a",
    enableBreathing: true,
  },
};

export const Idle: Story = {
  args: {
    amplitude: 0.0,
    baseSize: 100,
    color: "#ffffff",
    enableBreathing: true,
  },
};

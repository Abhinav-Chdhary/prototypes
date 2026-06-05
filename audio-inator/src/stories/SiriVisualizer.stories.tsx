import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SiriVisualizer } from "../components/SiriVisualizer";

const meta: Meta<typeof SiriVisualizer> = {
  title: "Visualizers/SiriVisualizer",
  component: SiriVisualizer,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    amplitude: {
      control: { type: "range", min: 0, max: 1, step: 0.01 },
      description: "Direct amplitude value for testing",
    },
    speed: { control: { type: "range", min: 0, max: 0.1, step: 0.005 } },
  },
};

export default meta;
type Story = StoryObj<typeof SiriVisualizer>;

export const Default: Story = {
  args: {
    amplitude: 0.6,
    speed: 0.02,
    style: { width: "300px", height: "150px" },
    colors: [
      "rgba(255, 50, 100, 0.7)",
      "rgba(50, 150, 255, 0.7)",
      "rgba(50, 255, 150, 0.7)"
    ]
  },
};

export const Idle: Story = {
  args: {
    amplitude: 0,
    speed: 0.01,
    style: { width: "300px", height: "150px" },
  },
};

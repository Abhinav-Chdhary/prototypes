import React from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Group, RoundedRect } from '@shopify/react-native-skia';
import { SharedValue, useDerivedValue } from 'react-native-reanimated';

type ParticleSpec = {
  angle: number;
  speed: number;
  gravity: number;
  spin: number;
  delay: number;
  width: number;
  height: number;
  drift: number;
  color: string;
};

type ConfettiBurstProps = {
  progress: SharedValue<number>;
  width: number;
  height: number;
};

const PARTICLE_COLORS = ['#7EF0FF', '#FFE066', '#FF7A90', '#A58BFF', '#7BFFB2'];
const PARTICLE_COUNT = 34;

function createSeededRandom(seed: number) {
  let value = seed;

  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

const PARTICLES: ParticleSpec[] = Array.from({ length: PARTICLE_COUNT }, (_, index) => {
  const random = createSeededRandom(index * 97 + 13);
  const direction = -2.28 + random() * 1.42;

  return {
    angle: direction,
    speed: 180 + random() * 160,
    gravity: 210 + random() * 120,
    spin: (random() > 0.5 ? 1 : -1) * (Math.PI * (1.8 + random() * 2.4)),
    delay: random() * 0.18,
    width: 8 + random() * 9,
    height: 10 + random() * 12,
    drift: -34 + random() * 68,
    color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
  };
});

function clamp01(value: number) {
  'worklet';

  return Math.min(1, Math.max(0, value));
}

function ConfettiPiece({
  burstX,
  burstY,
  progress,
  spec,
}: {
  burstX: number;
  burstY: number;
  progress: SharedValue<number>;
  spec: ParticleSpec;
}) {
  const transform = useDerivedValue(() => {
    const localProgress = clamp01((progress.value - spec.delay) / (1 - spec.delay));
    const launch = localProgress * 1.08;
    const translateX =
      burstX + Math.cos(spec.angle) * spec.speed * launch + spec.drift * localProgress * localProgress;
    const translateY =
      burstY + Math.sin(spec.angle) * spec.speed * launch + spec.gravity * localProgress * localProgress;
    const rotation = spec.spin * localProgress;
    const scale = 0.72 + Math.sin(localProgress * Math.PI) * 0.36;

    return [
      { translateX },
      { translateY },
      { rotate: rotation },
      { scale },
    ];
  });

  const opacity = useDerivedValue(() => {
    const localProgress = clamp01((progress.value - spec.delay) / (1 - spec.delay));

    if (localProgress <= 0) {
      return 0;
    }

    if (localProgress < 0.68) {
      return 1;
    }

    return 1 - (localProgress - 0.68) / 0.32;
  });

  return (
    <Group opacity={opacity as never} origin={{ x: 0, y: 0 }} transform={transform as never}>
      <RoundedRect
        x={-spec.width / 2}
        y={-spec.height / 2}
        width={spec.width}
        height={spec.height}
        r={2}
        color={spec.color}
      />
    </Group>
  );
}

export function ConfettiBurst({ progress, width, height }: ConfettiBurstProps) {
  const burstX = width / 2;
  const burstY = Math.max(150, height * 0.28);

  return (
    <Canvas pointerEvents="none" style={StyleSheet.absoluteFill}>
      {PARTICLES.map((spec, index) => (
        <ConfettiPiece burstX={burstX} burstY={burstY} key={`${spec.color}-${index}`} progress={progress} spec={spec} />
      ))}
    </Canvas>
  );
}

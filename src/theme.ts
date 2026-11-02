import { spring } from "remotion";

export const THEME = {
  colors: {
    bgDark: "#07080b",
    bgMeshGlow: "#0e1424",
    sunCore: "#ff7b00",
    sunGlow: "#ffc837",
    earthOcean: "#1d4ed8",
    earthAtmo: "#38bdf8",
    vacuumVoid: "#030406",
    textPrimary: "#f8fafc",
    textMuted: "#94a3b8",
    accentYellow: "#fbbf24",
    accentCyan: "#06b6d4",
    accentRed: "#f43f5e",
    borderSubtle: "rgba(255, 255, 255, 0.12)",
    cardGlass: "rgba(15, 23, 42, 0.75)",
  },
  fonts: {
    heading: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  springs: {
    snappy: { damping: 14, mass: 0.6, stiffness: 140 },
    bouncy: { damping: 10, mass: 0.5, stiffness: 180 },
    gentle: { damping: 20, mass: 1.0, stiffness: 80 },
  },
} as const;

export type SpringPreset = (typeof THEME.springs)[keyof typeof THEME.springs];

export const getSpringValue = (
  frame: number,
  fps: number,
  delay: number = 0,
  config: SpringPreset = THEME.springs.snappy
) => {
  return spring({
    frame: frame - delay,
    fps,
    config,
  });
};

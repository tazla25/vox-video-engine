import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme.js";

export const BgMesh: React.FC<{ glowColor?: string }> = ({
  glowColor = THEME.colors.bgMeshGlow,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle breathing sine wave (idle element breathes rule)
  const breath = Math.sin((frame / fps) * 1.5) * 6;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: THEME.colors.bgDark,
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {/* Primary Radial Glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          width: 900 + breath * 10,
          height: 900 + breath * 10,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(7, 8, 11, 0) 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Space Grid Accent */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${THEME.colors.borderSubtle} 1px, transparent 1px), linear-gradient(90deg, ${THEME.colors.borderSubtle} 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          opacity: 0.15,
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 80%)",
        }}
      />

      {/* Procedural Star Dots */}
      {[
        { x: 120, y: 240, r: 2, phase: 0 },
        { x: 380, y: 180, r: 1.5, phase: 1.2 },
        { x: 890, y: 320, r: 2.5, phase: 2.4 },
        { x: 210, y: 840, r: 1.8, phase: 0.8 },
        { x: 740, y: 920, r: 2.2, phase: 1.9 },
        { x: 960, y: 1340, r: 1.5, phase: 3.1 },
        { x: 150, y: 1600, r: 2.0, phase: 0.5 },
        { x: 820, y: 1720, r: 2.8, phase: 2.1 },
      ].map((star, i) => {
        const starOpacity = 0.35 + 0.45 * Math.sin((frame / fps) * 3 + star.phase);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: star.x,
              top: star.y,
              width: star.r * 2,
              height: star.r * 2,
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              opacity: starOpacity,
              boxShadow: `0 0 8px rgba(255, 255, 255, ${starOpacity})`,
            }}
          />
        );
      })}
    </div>
  );
};

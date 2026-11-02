import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { THEME, getSpringValue } from "../theme.js";
import { KineticText } from "../components/KineticText.js";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring entrance for Sun graphic
  const sunEntrance = getSpringValue(frame, fps, 10, THEME.springs.bouncy);
  // Breathing pulsation for Sun corona
  const pulse = Math.sin((frame / fps) * 4) * 8;
  const rotation = (frame / fps) * 15;

  // Camera subtle Ken Burns slow zoom (1.0 -> 1.06)
  const zoom = interpolate(frame, [0, 350], [1.0, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "160px 48px 300px",
        transform: `scale(${zoom})`,
        zIndex: 10,
      }}
    >
      {/* Top Category Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 20px",
          borderRadius: "999px",
          backgroundColor: "rgba(251, 191, 36, 0.15)",
          border: `1px solid ${THEME.colors.accentYellow}`,
          color: THEME.colors.accentYellow,
          fontFamily: THEME.fonts.mono,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        <span>☀️</span>
        <span>ASTRONOMY PARADOX</span>
      </div>

      {/* Center 3D Graphic: Blazing Sun in Void */}
      <div
        style={{
          position: "relative",
          width: 480,
          height: 480,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${sunEntrance})`,
        }}
      >
        {/* Outer Solar Flare Corona */}
        <div
          style={{
            position: "absolute",
            width: 380 + pulse * 2,
            height: 380 + pulse * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255, 123, 0, 0.5) 0%, rgba(255, 200, 55, 0.2) 50%, rgba(0,0,0,0) 70%)`,
            filter: "blur(20px)",
            transform: `rotate(${rotation}deg)`,
          }}
        />

        {/* Blazing Core */}
        <div
          style={{
            position: "relative",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, #fff 0%, ${THEME.colors.sunGlow} 40%, ${THEME.colors.sunCore} 100%)`,
            boxShadow: `0 0 80px ${THEME.colors.sunCore}, 0 0 160px ${THEME.colors.sunGlow}`,
          }}
        />

        {/* Space Temperature Card Floating */}
        <div
          style={{
            position: "absolute",
            bottom: -30,
            right: 0,
            padding: "12px 24px",
            borderRadius: "14px",
            backgroundColor: THEME.colors.cardGlass,
            border: `1px solid ${THEME.colors.borderSubtle}`,
            backdropFilter: "blur(12px)",
            color: THEME.colors.textPrimary,
            fontFamily: THEME.fonts.mono,
            fontSize: 22,
            fontWeight: 700,
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          }}
        >
          <span style={{ color: THEME.colors.sunGlow }}>🔥 CORE: </span>
          <span>15,000,000°C</span>
        </div>
      </div>

      {/* Bottom Kinetic Headline */}
      <div style={{ maxWidth: 840, textAlign: "center" }}>
        <KineticText
          text="The Sun is a blazing ball of fire..."
          highlightWords={["blazing", "fire"]}
          delayFrames={15}
          fontSize={62}
          accentColor={THEME.colors.sunGlow}
        />
        <div style={{ height: 24 }} />
        <KineticText
          text="Yet Deep Space is Pitch Black. WHY?"
          highlightWords={["Pitch", "Black", "WHY?"]}
          delayFrames={55}
          fontSize={68}
          accentColor={THEME.colors.accentYellow}
        />
      </div>
    </div>
  );
};

import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { THEME, getSpringValue } from "../theme.js";
import { KineticText } from "../components/KineticText.js";

export const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for vacuum chamber card
  const cardEntrance = getSpringValue(frame, fps, 10, THEME.springs.snappy);
  // Unhindered light ray passing through void
  const beamX = interpolate(frame % 70, [0, 70], [-250, 250]);

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
        zIndex: 10,
      }}
    >
      {/* Top Tag */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 20px",
          borderRadius: "999px",
          backgroundColor: "rgba(244, 63, 94, 0.15)",
          border: `1px solid ${THEME.colors.accentRed}`,
          color: THEME.colors.accentRed,
          fontFamily: THEME.fonts.mono,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        <span>🌌</span>
        <span>THE VACUUM REVEAL</span>
      </div>

      {/* Center 3D Card: Deep Space Vacuum Simulation */}
      <div
        style={{
          position: "relative",
          width: 540,
          height: 440,
          borderRadius: "24px",
          backgroundColor: "rgba(3, 4, 6, 0.85)",
          border: `2px solid ${THEME.colors.borderSubtle}`,
          boxShadow: "0 25px 60px rgba(0,0,0,0.9)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          transform: `scale(${cardEntrance}) perspective(1000px) rotateX(8deg)`,
          overflow: "hidden",
        }}
      >
        {/* Holographic grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(244,63,94,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.08) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Straight Light Beam Passing With Zero Reflection */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Main Laser Path */}
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: 4,
              backgroundColor: "rgba(255, 200, 55, 0.3)",
            }}
          />
          {/* Moving Photon Pulse */}
          <div
            style={{
              position: "absolute",
              left: `calc(50% + ${beamX}px)`,
              width: 60,
              height: 8,
              borderRadius: "4px",
              backgroundColor: THEME.colors.sunGlow,
              boxShadow: `0 0 20px ${THEME.colors.sunGlow}, 0 0 40px ${THEME.colors.sunGlow}`,
            }}
          />
        </div>

        {/* Big Vacuum Stat Counter */}
        <div
          style={{
            marginTop: 30,
            textAlign: "center",
            fontFamily: THEME.fonts.mono,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: THEME.colors.accentRed,
              letterSpacing: "-2px",
              textShadow: `0 0 30px ${THEME.colors.accentRed}88`,
            }}
          >
            0 PARTICLES
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: THEME.colors.textMuted,
              marginTop: 6,
            }}
          >
            NO PARTICLES TO BOUNCE LIGHT INTO YOUR EYES
          </div>
        </div>
      </div>

      {/* Bottom Kinetic Headline */}
      <div style={{ maxWidth: 840, textAlign: "center" }}>
        <KineticText
          text="In space, it is a pure vacuum..."
          highlightWords={["pure", "vacuum..."]}
          delayFrames={10}
          fontSize={60}
          accentColor={THEME.colors.accentCyan}
        />
        <div style={{ height: 20 }} />
        <KineticText
          text="With ZERO particles to bounce light, Darkness Wins!"
          highlightWords={["ZERO", "Darkness", "Wins!"]}
          delayFrames={45}
          fontSize={66}
          accentColor={THEME.colors.accentRed}
        />
      </div>
    </div>
  );
};

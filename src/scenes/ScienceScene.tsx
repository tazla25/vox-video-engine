import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { THEME, getSpringValue } from "../theme.js";
import { KineticText } from "../components/KineticText.js";

export const ScienceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for Earth
  const earthProgress = getSpringValue(frame, fps, 10, THEME.springs.bouncy);
  // Animated light rays scattering
  const rayProgress = interpolate(frame % 90, [0, 90], [0, 1]);

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
      {/* Top Scientific Tag */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 20px",
          borderRadius: "999px",
          backgroundColor: "rgba(56, 189, 248, 0.15)",
          border: `1px solid ${THEME.colors.earthAtmo}`,
          color: THEME.colors.earthAtmo,
          fontFamily: THEME.fonts.mono,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        <span>🌍</span>
        <span>THE EARTH SHIELD</span>
      </div>

      {/* Center Scientific Diagram: Earth + Atmospheric Halo */}
      <div
        style={{
          position: "relative",
          width: 500,
          height: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${earthProgress})`,
        }}
      >
        {/* Glowing Atmosphere Ring (Scattering Layer) */}
        <div
          style={{
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: "50%",
            border: `6px solid ${THEME.colors.earthAtmo}`,
            boxShadow: `0 0 50px ${THEME.colors.earthAtmo}, inset 0 0 50px ${THEME.colors.earthAtmo}`,
            opacity: 0.85,
          }}
        />

        {/* Earth Planet Globe */}
        <div
          style={{
            position: "relative",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, #60a5fa 0%, ${THEME.colors.earthOcean} 60%, #0f172a 100%)`,
            boxShadow: "0 0 60px rgba(29, 78, 216, 0.6)",
            overflow: "hidden",
          }}
        >
          {/* Subtle Continent Shapes */}
          <div
            style={{
              position: "absolute",
              top: 50,
              left: 40,
              width: 100,
              height: 120,
              borderRadius: "40%",
              backgroundColor: "#22c55e",
              opacity: 0.6,
              filter: "blur(6px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 40,
              right: 60,
              width: 120,
              height: 90,
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              opacity: 0.6,
              filter: "blur(6px)",
            }}
          />
        </div>

        {/* Scattering Photon Rays Animation */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rayDistance = 180 + rayProgress * 50;
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * rayDistance;
          const y = Math.sin(rad) * rayDistance;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: THEME.colors.earthAtmo,
                boxShadow: `0 0 12px ${THEME.colors.earthAtmo}`,
                opacity: 1 - rayProgress,
              }}
            />
          );
        })}

        {/* Rayleigh Scattering Badge */}
        <div
          style={{
            position: "absolute",
            bottom: -20,
            padding: "10px 22px",
            borderRadius: "12px",
            backgroundColor: THEME.colors.cardGlass,
            border: `1px solid ${THEME.colors.earthAtmo}`,
            backdropFilter: "blur(12px)",
            color: THEME.colors.textPrimary,
            fontFamily: THEME.fonts.mono,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          <span style={{ color: THEME.colors.earthAtmo }}>🔬 RAYLEIGH SCATTERING</span>
        </div>
      </div>

      {/* Bottom Kinetic Headline */}
      <div style={{ maxWidth: 840, textAlign: "center" }}>
        <KineticText
          text="On Earth, our thick atmosphere acts like a mirror..."
          highlightWords={["thick", "atmosphere", "mirror"]}
          delayFrames={10}
          fontSize={60}
          accentColor={THEME.colors.earthAtmo}
        />
        <div style={{ height: 20 }} />
        <KineticText
          text="Scattering sunlight in every direction!"
          highlightWords={["Scattering", "direction!"]}
          delayFrames={45}
          fontSize={66}
          accentColor={THEME.colors.accentYellow}
        />
      </div>
    </div>
  );
};

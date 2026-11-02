import React from "react";
import { useCurrentFrame, useVideoConfig, OffthreadVideo, staticFile, interpolate } from "remotion";
import { THEME, getSpringValue } from "../theme";
import { KineticText } from "../components/KineticText";

export const ScienceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow Ken Burns zoom on real Earth footage
  const videoZoom = interpolate(frame, [0, 350], [1.0, 1.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardEntrance = getSpringValue(frame, fps, 10, THEME.springs.bouncy);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Layer 1: Real NASA Earth Spinning Atmosphere Footage */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${videoZoom})`,
          transformOrigin: "center center",
        }}
      >
        <OffthreadVideo
          src={staticFile("assets/earth_broll.mp4")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Layer 2: Cinematic Atmospheric Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(7, 8, 11, 0.75) 0%, rgba(7, 8, 11, 0.25) 35%, rgba(7, 8, 11, 0.35) 65%, rgba(7, 8, 11, 0.92) 100%)",
        }}
      />

      {/* Layer 3: Foreground Content & Typography */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "160px 48px 320px",
          zIndex: 20,
        }}
      >
        {/* Top Tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 24px",
            borderRadius: "999px",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            border: `1.5px solid ${THEME.colors.earthAtmo}`,
            boxShadow: `0 0 25px ${THEME.colors.earthAtmo}55`,
            backdropFilter: "blur(16px)",
            transform: `scale(${cardEntrance})`,
          }}
        >
          <span style={{ fontSize: 24 }}>🌍</span>
          <span
            style={{
              fontFamily: THEME.fonts.mono,
              fontSize: 20,
              fontWeight: 800,
              color: THEME.colors.earthAtmo,
              letterSpacing: "2px",
            }}
          >
            ISS ORBIT | ATMOSPHERE SCATTERING
          </span>
        </div>

        {/* Center Scientific Annotation Card */}
        <div
          style={{
            padding: "20px 32px",
            borderRadius: "18px",
            backgroundColor: "rgba(7, 8, 11, 0.8)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${THEME.colors.earthAtmo}`,
            boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${THEME.colors.earthAtmo}33`,
            fontFamily: THEME.fonts.mono,
            textAlign: "center",
            transform: `scale(${cardEntrance}) perspective(800px) rotateX(8deg)`,
            maxWidth: 680,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 900, color: THEME.colors.earthAtmo, letterSpacing: "1px" }}>
            🔬 RAYLEIGH SCATTERING
          </div>
          <div style={{ fontSize: 18, color: THEME.colors.textPrimary, marginTop: 8, lineHeight: 1.4 }}>
            NITROGEN & OXYGEN MOLECULES SCATTER BLUE WAVELENGTHS (400nm) ACROSS OUR SKY
          </div>
        </div>

        {/* Bottom Kinetic Headline */}
        <div style={{ maxWidth: 880, textAlign: "center" }}>
          <KineticText
            text="On Earth, our thick atmosphere acts like a mirror..."
            highlightWords={["thick", "atmosphere", "mirror..."]}
            delayFrames={10}
            fontSize={62}
            accentColor={THEME.colors.earthAtmo}
          />
          <div style={{ height: 24 }} />
          <KineticText
            text="Scattering sunlight in every direction!"
            highlightWords={["Scattering", "direction!"]}
            delayFrames={45}
            fontSize={68}
            accentColor={THEME.colors.accentYellow}
          />
        </div>
      </div>
    </div>
  );
};

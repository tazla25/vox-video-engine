import React from "react";
import { useCurrentFrame, useVideoConfig, OffthreadVideo, staticFile, interpolate } from "remotion";
import { THEME, getSpringValue } from "../theme";
import { KineticText } from "../components/KineticText";

export const RevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow Ken Burns zoom into deep cosmic void
  const videoZoom = interpolate(frame, [0, 400], [1.0, 1.18], {
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
      {/* Layer 1: Real NASA Hubble Deep Field Cosmic Void Footage */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${videoZoom})`,
          transformOrigin: "center center",
        }}
      >
        <OffthreadVideo
          src={staticFile("assets/void_broll.mp4")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Layer 2: Deep Dark Cosmic Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(7, 8, 11, 0.8) 0%, rgba(7, 8, 11, 0.3) 35%, rgba(7, 8, 11, 0.4) 65%, rgba(7, 8, 11, 0.95) 100%)",
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
            border: `1.5px solid ${THEME.colors.accentRed}`,
            boxShadow: `0 0 25px ${THEME.colors.accentRed}55`,
            backdropFilter: "blur(16px)",
            transform: `scale(${cardEntrance})`,
          }}
        >
          <span style={{ fontSize: 24 }}>🌌</span>
          <span
            style={{
              fontFamily: THEME.fonts.mono,
              fontSize: 20,
              fontWeight: 800,
              color: THEME.colors.accentRed,
              letterSpacing: "2px",
            }}
          >
            HUBBLE ULTRA DEEP FIELD | THE VACUUM
          </span>
        </div>

        {/* Center Shocking Stat Counter Card */}
        <div
          style={{
            padding: "24px 36px",
            borderRadius: "20px",
            backgroundColor: "rgba(3, 4, 6, 0.85)",
            backdropFilter: "blur(24px)",
            border: `1.5px solid ${THEME.colors.accentRed}`,
            boxShadow: "0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(244,63,94,0.3)",
            fontFamily: THEME.fonts.mono,
            textAlign: "center",
            transform: `scale(${cardEntrance}) perspective(800px) rotateX(10deg)`,
            maxWidth: 680,
          }}
        >
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              color: THEME.colors.accentRed,
              letterSpacing: "-1px",
              textShadow: "0 0 40px rgba(244,63,94,0.7)",
            }}
          >
            0 PARTICLES
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: THEME.colors.textPrimary,
              marginTop: 10,
              lineHeight: 1.4,
            }}
          >
            NO MATTER TO BOUNCE PHOTONS INTO YOUR EYES
          </div>
        </div>

        {/* Bottom Kinetic Headline */}
        <div style={{ maxWidth: 880, textAlign: "center" }}>
          <KineticText
            text="In space, it is a pure vacuum..."
            highlightWords={["pure", "vacuum..."]}
            delayFrames={10}
            fontSize={64}
            accentColor={THEME.colors.accentCyan}
          />
          <div style={{ height: 24 }} />
          <KineticText
            text="With ZERO particles to bounce light, Darkness Wins!"
            highlightWords={["ZERO", "Darkness", "Wins!"]}
            delayFrames={45}
            fontSize={70}
            accentColor={THEME.colors.accentRed}
          />
        </div>
      </div>
    </div>
  );
};

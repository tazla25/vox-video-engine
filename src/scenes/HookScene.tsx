import React from "react";
import { useCurrentFrame, useVideoConfig, OffthreadVideo, staticFile, interpolate } from "remotion";
import { THEME, getSpringValue } from "../theme";
import { KineticText } from "../components/KineticText";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slow Ken Burns zoom on the real NASA solar footage
  const videoZoom = interpolate(frame, [0, 350], [1.0, 1.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cardEntrance = getSpringValue(frame, fps, 15, THEME.springs.bouncy);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {/* Layer 1: Real NASA Solar Flare 4K/HD Footage */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${videoZoom})`,
          transformOrigin: "center center",
        }}
      >
        <OffthreadVideo
          src={staticFile("assets/sun_broll.mp4")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Layer 2: Cinematic Documentary Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(7, 8, 11, 0.75) 0%, rgba(7, 8, 11, 0.2) 35%, rgba(7, 8, 11, 0.3) 65%, rgba(7, 8, 11, 0.9) 100%)",
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
        {/* Top Official Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 24px",
            borderRadius: "999px",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            border: `1.5px solid ${THEME.colors.sunGlow}`,
            boxShadow: `0 0 25px ${THEME.colors.sunGlow}55`,
            backdropFilter: "blur(16px)",
            transform: `scale(${cardEntrance})`,
          }}
        >
          <span style={{ fontSize: 24 }}>☀️</span>
          <span
            style={{
              fontFamily: THEME.fonts.mono,
              fontSize: 20,
              fontWeight: 800,
              color: THEME.colors.sunGlow,
              letterSpacing: "2px",
            }}
          >
            NASA SDO | SOLAR FLARE ARCHIVE
          </span>
        </div>

        {/* Center Technical Telemetry Card */}
        <div
          style={{
            padding: "16px 28px",
            borderRadius: "16px",
            backgroundColor: "rgba(7, 8, 11, 0.75)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
            fontFamily: THEME.fonts.mono,
            display: "flex",
            gap: "24px",
            transform: `scale(${cardEntrance}) perspective(800px) rotateX(10deg)`,
          }}
        >
          <div>
            <div style={{ fontSize: 16, color: THEME.colors.textMuted }}>SURFACE</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: THEME.colors.accentYellow }}>
              5,500°C
            </div>
          </div>
          <div style={{ width: 1, backgroundColor: "rgba(255,255,255,0.2)" }} />
          <div>
            <div style={{ fontSize: 16, color: THEME.colors.textMuted }}>PLASMA CORE</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: THEME.colors.sunCore }}>
              15,000,000°C
            </div>
          </div>
        </div>

        {/* Bottom Kinetic Headline */}
        <div style={{ maxWidth: 880, textAlign: "center" }}>
          <KineticText
            text="The Sun is a blazing ball of fire..."
            highlightWords={["blazing", "fire..."]}
            delayFrames={10}
            fontSize={64}
            accentColor={THEME.colors.sunGlow}
          />
          <div style={{ height: 24 }} />
          <KineticText
            text="Yet Deep Space is Pitch Black. WHY?"
            highlightWords={["Pitch", "Black.", "WHY?"]}
            delayFrames={55}
            fontSize={70}
            accentColor={THEME.colors.accentYellow}
          />
        </div>
      </div>
    </div>
  );
};

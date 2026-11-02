import React from "react";
import {
  OffthreadVideo,
  Img,
  staticFile,
  useCurrentFrame,
  interpolate,
  Loop,
} from "remotion";
import { THEME, getSpringValue } from "../theme";

export interface DynamicShotClip {
  clipId: string;
  shotId: string;
  sceneId: string;
  startFrame: number;
  durationInFrames: number;
  assetRef: string;
  visualType: string;
  layerIndex: number;
  transform?: {
    scale?: number;
    x?: number;
    y?: number;
    opacity?: number;
  };
  motionEffect?: string;
  screenTextOrDiagram?: string;
}

export interface DynamicShotProps {
  clip: DynamicShotClip;
  fps: number;
  width: number;
  height: number;
}

export const DynamicShot: React.FC<DynamicShotProps> = ({
  clip,
  fps,
  width,
  height,
}) => {
  const frame = useCurrentFrame();

  // Reject missing asset references before rendering rather than displaying error banners
  if (!clip.assetRef || clip.assetRef.trim() === "") {
    throw new Error(
      `[DynamicShot Validation Failure] Missing asset specification for shot "${clip.shotId}" in scene "${clip.sceneId}". Silent fallback banned.`
    );
  }

  // Normalize path relative to Remotion's public/ folder
  const normalizedPath = clip.assetRef.startsWith("public/")
    ? clip.assetRef.slice(7)
    : clip.assetRef.startsWith("/")
    ? clip.assetRef.slice(1)
    : clip.assetRef;

  const fileUrl = staticFile(normalizedPath);

  const isVideo = /\.(mp4|webm|mov|mkv)$/i.test(normalizedPath);
  const isImageOrSvg = /\.(svg|png|jpg|jpeg|webp)$/i.test(normalizedPath);

  // Subtle continuous push-in zoom (1.0x to 1.10x)
  const videoZoom = interpolate(
    frame,
    [0, Math.max(1, clip.durationInFrames)],
    [1.0, 1.10],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const badgeEntrance = getSpringValue(frame, fps, 10, THEME.springs.bouncy);

  // Determine icon based on asset name / shot
  let icon = "🔭";
  if (clip.assetRef.includes("sun")) icon = "☀️";
  else if (clip.assetRef.includes("earth")) icon = "🌍";
  else if (clip.assetRef.includes("void")) icon = "🌌";
  else if (clip.assetRef.includes("diagram") || clip.visualType === "VECTOR_ANIMATION") icon = "📐";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width,
        height,
        overflow: "hidden",
        backgroundColor: "#07080b",
      }}
    >
      {/* Layer 1: Scaled Media Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${videoZoom})`,
          transformOrigin: "center center",
        }}
      >
        {isVideo && (
          <Loop durationInFrames={Math.max(1, clip.durationInFrames)}>
            <OffthreadVideo
              src={fileUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Loop>
        )}

        {isImageOrSvg && (
          <Img
            src={fileUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              backgroundColor: "#07080b",
            }}
          />
        )}

        {!isVideo && !isImageOrSvg && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#18181b",
              color: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: THEME.fonts.mono,
              fontSize: 20,
            }}
          >
            [UNRECOGNIZED MEDIA FORMAT: {clip.assetRef}]
          </div>
        )}
      </div>

      {/* Layer 2: Documentary Gradient Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(7, 8, 11, 0.75) 0%, rgba(7, 8, 11, 0.2) 35%, rgba(7, 8, 11, 0.3) 65%, rgba(7, 8, 11, 0.9) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 3: Top Scientific Telemetry Badge */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: "50%",
          transform: `translateX(-50%) scale(${badgeEntrance})`,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 24px",
          borderRadius: 999,
          backgroundColor: "rgba(15, 23, 42, 0.85)",
          border: `1.5px solid ${THEME.colors.sunGlow}`,
          boxShadow: `0 0 25px ${THEME.colors.sunGlow}44`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          zIndex: 20,
        }}
      >
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span
          style={{
            fontFamily: THEME.fonts.mono,
            fontSize: 18,
            fontWeight: 800,
            color: THEME.colors.sunGlow,
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          {clip.visualType.replace(/_/g, " ")} // {clip.shotId.toUpperCase()}
        </span>
      </div>

      {/* Layer 4: Screen Text / Tactical Telemetry HUD (Safely elevated above subtitle zone) */}
      {clip.screenTextOrDiagram && (
        <div
          style={{
            position: "absolute",
            bottom: 360,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 22px",
            borderRadius: 12,
            backgroundColor: "rgba(10, 15, 30, 0.85)",
            border: `1.5px solid ${THEME.colors.accentYellow}88`,
            boxShadow: `0 4px 20px rgba(0, 0, 0, 0.7)`,
            fontFamily: THEME.fonts.mono,
            fontSize: 18,
            fontWeight: 700,
            color: THEME.colors.accentYellow,
            letterSpacing: "1.2px",
            zIndex: 25,
            textAlign: "center",
            maxWidth: "78%",
            lineHeight: 1.3,
          }}
        >
          {clip.screenTextOrDiagram}
        </div>
      )}
    </div>
  );
};

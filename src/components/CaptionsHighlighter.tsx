import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";

interface WordCaption {
  word: string;
  startMs: number;
  endMs: number;
}

interface CaptionsHighlighterProps {
  captions: WordCaption[];
}

export const CaptionsHighlighter: React.FC<CaptionsHighlighterProps> = ({
  captions,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Current time in milliseconds
  const currentMs = (frame / fps) * 1000;

  if (!captions || captions.length === 0) {
    return null;
  }

  // Hide captions before audio begins or after audio finishes (+ 600ms grace)
  if (currentMs < captions[0].startMs - 200 || currentMs > captions[captions.length - 1].endMs + 600) {
    return null;
  }

  // Find the active word
  const activeIndex = captions.findIndex(
    (c) => currentMs >= c.startMs && currentMs <= c.endMs
  );

  // If between words during narration, hold previous word
  let safeIndex = activeIndex;
  if (safeIndex === -1) {
    safeIndex = captions.findIndex((c) => c.startMs > currentMs);
    if (safeIndex === -1) safeIndex = captions.length - 1;
    else safeIndex = Math.max(0, safeIndex - 1);
  }

  // Clean 4-word window for maximum 2 lines with zero HUD collision
  const windowStart = Math.max(0, safeIndex - 1);
  const windowEnd = Math.min(captions.length, windowStart + 4);
  const visibleWords = captions.slice(windowStart, windowEnd);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 170,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "12px 24px",
        borderRadius: "14px",
        backgroundColor: "rgba(7, 8, 11, 0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.75)",
        zIndex: 40,
        maxWidth: "76%",
        maxHeight: "130px",
        overflow: "hidden",
      }}
    >
      {visibleWords.map((item, idx) => {
        const globalIdx = windowStart + idx;
        const isActive = globalIdx === activeIndex;

        return (
          <span
            key={globalIdx}
            style={{
              fontFamily: THEME.fonts.heading,
              fontSize: isActive ? 38 : 34,
              fontWeight: isActive ? 900 : 600,
              color: isActive ? THEME.colors.accentYellow : "#cbd5e1",
              transform: isActive ? "scale(1.08)" : "scale(1.0)",
              transition: "transform 0.08s ease, color 0.08s ease",
              textShadow: isActive ? `0 0 14px ${THEME.colors.accentYellow}cc` : "none",
              lineHeight: 1.25,
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
};

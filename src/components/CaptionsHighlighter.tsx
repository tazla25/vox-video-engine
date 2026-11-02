import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme.js";

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

  // Find the active word
  const activeIndex = captions.findIndex(
    (c) => currentMs >= c.startMs && currentMs <= c.endMs
  );

  // If no word is currently active, find closest past word or return empty
  if (activeIndex === -1 && captions.length > 0 && currentMs > captions[captions.length - 1].endMs + 800) {
    return null;
  }

  // Display a window of 3-5 words around the active index
  const safeIndex = activeIndex !== -1 ? activeIndex : 0;
  const windowStart = Math.max(0, safeIndex - 2);
  const windowEnd = Math.min(captions.length, safeIndex + 3);
  const visibleWords = captions.slice(windowStart, windowEnd);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 180,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "16px 28px",
        borderRadius: "16px",
        backgroundColor: THEME.colors.cardGlass,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${THEME.colors.borderSubtle}`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        zIndex: 40,
        maxWidth: "88%",
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
              fontSize: isActive ? 42 : 36,
              fontWeight: isActive ? 900 : 600,
              color: isActive ? THEME.colors.accentYellow : THEME.colors.textMuted,
              transform: isActive ? "scale(1.1)" : "scale(1.0)",
              transition: "transform 0.08s ease, color 0.08s ease",
              textShadow: isActive ? `0 0 16px ${THEME.colors.accentYellow}` : "none",
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
};

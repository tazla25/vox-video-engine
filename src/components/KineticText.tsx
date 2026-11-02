import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { THEME, getSpringValue } from "../theme";

interface KineticTextProps {
  text: string;
  highlightWords?: string[];
  delayFrames?: number;
  fontSize?: number;
  accentColor?: string;
  center?: boolean;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  highlightWords = [],
  delayFrames = 0,
  fontSize = 58,
  accentColor = THEME.colors.accentYellow,
  center = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: center ? "center" : "flex-start",
        gap: "14px 18px",
        fontFamily: THEME.fonts.heading,
        fontWeight: 800,
        fontSize,
        lineHeight: 1.25,
        color: THEME.colors.textPrimary,
        textShadow: "0 4px 20px rgba(0,0,0,0.8)",
      }}
    >
      {words.map((word, i) => {
        // Stagger each word by 4 frames
        const wordDelay = delayFrames + i * 4;
        const progress = getSpringValue(frame, fps, wordDelay, THEME.springs.snappy);

        const isHighlighted = highlightWords.some(
          (hw) => hw.toLowerCase() === word.replace(/[.,?!]/g, "").toLowerCase()
        );

        const translateY = (1 - progress) * 45;
        const opacity = Math.min(1, Math.max(0, progress * 1.5));
        const scale = 0.85 + progress * 0.15;

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              padding: "4px 8px",
              borderRadius: "8px",
              backgroundColor: isHighlighted ? accentColor : "transparent",
              color: isHighlighted ? THEME.colors.bgDark : THEME.colors.textPrimary,
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity,
              boxShadow: isHighlighted ? `0 0 25px ${accentColor}88` : "none",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

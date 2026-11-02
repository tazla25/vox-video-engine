import React from "react";
import {
  Composition,
  Sequence,
  Audio,
  staticFile,
  useVideoConfig,
} from "remotion";
import { GrainOverlay } from "./components/GrainOverlay";
import { CaptionsHighlighter } from "./components/CaptionsHighlighter";
import { HookScene } from "./scenes/HookScene";
import { ScienceScene } from "./scenes/ScienceScene";
import { RevealScene } from "./scenes/RevealScene";

// Import word captions
import captionsData from "../public/captions.json";

// Calculate dynamic duration from captions or default to 1100 frames (18.33s @ 60fps)
const lastCaption = (captionsData as Array<{ endMs: number }>)[captionsData.length - 1];
const dynamicAudioSeconds = lastCaption ? (lastCaption.endMs / 1000) + 1.2 : 18.33;
const COMPOSITION_DURATION_IN_FRAMES = Math.max(1100, Math.round(dynamicAudioSeconds * 60));

const MainComposition: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  // Distribute scene sequences proportionally across the full duration
  const scene1Duration = Math.round(durationInFrames * 0.32);
  const scene2Duration = Math.round(durationInFrames * 0.34);
  const scene3Duration = durationInFrames - scene1Duration - scene2Duration;

  return (
    <div
      style={{
        position: "relative",
        width: 1080,
        height: 1920,
        backgroundColor: "#07080b",
        overflow: "hidden",
      }}
    >
      {/* Layer 1: Real NASA Footage Sequential Scenes */}
      <Sequence from={0} durationInFrames={scene1Duration} name="Hook_RealSun">
        <HookScene />
      </Sequence>

      <Sequence from={scene1Duration} durationInFrames={scene2Duration} name="Science_RealEarth">
        <ScienceScene />
      </Sequence>

      <Sequence from={scene1Duration + scene2Duration} durationInFrames={scene3Duration} name="Reveal_RealVoid">
        <RevealScene />
      </Sequence>

      {/* Layer 2: Audio Layers (Voice + Cinematic Ambient Synth Drone) */}
      <Audio src={staticFile("narration.mp3")} volume={1.0} />
      <Audio src={staticFile("ambient_drone.mp3")} volume={0.25} />

      {/* Layer 3: Synced Word-by-Word Karaoke Subtitles */}
      <CaptionsHighlighter captions={captionsData} />

      {/* Layer 4: Organic Film Grain & Vignette */}
      <GrainOverlay />
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VoxShort"
        component={MainComposition}
        durationInFrames={COMPOSITION_DURATION_IN_FRAMES}
        fps={60}
        width={1080}
        height={1920}
      />
    </>
  );
};

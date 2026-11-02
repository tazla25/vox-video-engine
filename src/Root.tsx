import React from "react";
import {
  Composition,
  Sequence,
  Audio,
  staticFile,
} from "remotion";
import { GrainOverlay } from "./components/GrainOverlay";
import { CaptionsHighlighter } from "./components/CaptionsHighlighter";
import { HookScene } from "./scenes/HookScene";
import { ScienceScene } from "./scenes/ScienceScene";
import { RevealScene } from "./scenes/RevealScene";

// Import word captions
import captionsData from "../public/captions.json";

const MainComposition: React.FC = () => {
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
      <Sequence from={0} durationInFrames={350} name="Hook_RealSun">
        <HookScene />
      </Sequence>

      <Sequence from={350} durationInFrames={350} name="Science_RealEarth">
        <ScienceScene />
      </Sequence>

      <Sequence from={700} durationInFrames={400} name="Reveal_RealVoid">
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
        durationInFrames={1100}
        fps={60}
        width={1080}
        height={1920}
      />
    </>
  );
};

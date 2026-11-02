import React from "react";
import {
  Composition,
  Sequence,
  Audio,
  staticFile,
} from "remotion";
import { BgMesh } from "./components/BgMesh";
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
      {/* Layer 1: Ambient Starfield & Grid Mesh */}
      <BgMesh />

      {/* Layer 2 & 3: Sequential Scenes */}
      <Sequence from={0} durationInFrames={350} name="Hook">
        <HookScene />
      </Sequence>

      <Sequence from={350} durationInFrames={350} name="Science">
        <ScienceScene />
      </Sequence>

      <Sequence from={700} durationInFrames={400} name="Reveal">
        <RevealScene />
      </Sequence>

      {/* Layer 4: Voiceover Audio & Word-Synced Captions */}
      <Audio src={staticFile("narration.mp3")} />
      <CaptionsHighlighter captions={captionsData} />

      {/* Layer 5: Film Grain & Vignette */}
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

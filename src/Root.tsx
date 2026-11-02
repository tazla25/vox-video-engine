import React from "react";
import {
  Composition,
  Sequence,
  Audio,
  staticFile,
} from "remotion";
import { GrainOverlay } from "./components/GrainOverlay";
import { CaptionsHighlighter } from "./components/CaptionsHighlighter";
import { DynamicShot, DynamicShotClip } from "./components/DynamicShot";

// Import validated data-driven timeline manifest and word captions
import timelineData from "../public/timeline.json";
import captionsData from "../public/captions.json";

export interface TimelineManifest {
  projectId: string;
  fps: number;
  totalFrames: number;
  width: number;
  height: number;
  clips: DynamicShotClip[];
}

export const TimelineComposition: React.FC<{ timeline?: TimelineManifest }> = ({
  timeline = timelineData as unknown as TimelineManifest,
}) => {
  const { clips, fps, width, height } = timeline;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        backgroundColor: "#07080b",
        overflow: "hidden",
      }}
    >
      {/* Layer 1: Dynamically Rendered Sequential Clips from Timeline Manifest */}
      {clips.map((clip) => (
        <Sequence
          key={clip.clipId}
          from={clip.startFrame}
          durationInFrames={clip.durationInFrames}
          name={`${clip.sceneId}_${clip.shotId}`}
        >
          <DynamicShot
            clip={clip}
            fps={fps}
            width={width}
            height={height}
          />
        </Sequence>
      ))}

      {/* Layer 2: Audio Layers (Voice + Cinematic Ambient Synth Drone) */}
      <Audio src={staticFile("narration.mp3")} volume={1.0} />
      <Audio src={staticFile("ambient_drone.mp3")} volume={0.15} />

      {/* Layer 3: Synced Word-by-Word Karaoke Subtitles */}
      <CaptionsHighlighter captions={captionsData} />

      {/* Layer 4: Organic Film Grain & Vignette */}
      <GrainOverlay />
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  const timeline = timelineData as unknown as TimelineManifest;

  return (
    <>
      {/* Full 1080x1920 Vertical Short composition */}
      <Composition
        id="VoxShort"
        component={TimelineComposition}
        durationInFrames={timeline.totalFrames}
        fps={timeline.fps}
        width={1080}
        height={1920}
        defaultProps={{
          timeline: {
            ...timeline,
            width: 1080,
            height: 1920,
          },
        }}
      />

      {/* Standard 1920x1080 Horizontal Documentary composition */}
      <Composition
        id="VoxVideo"
        component={TimelineComposition}
        durationInFrames={timeline.totalFrames}
        fps={timeline.fps}
        width={1920}
        height={1080}
        defaultProps={{
          timeline: {
            ...timeline,
            width: 1920,
            height: 1080,
          },
        }}
      />
    </>
  );
};

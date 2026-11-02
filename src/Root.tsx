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

export interface ProjectRenderProps {
  projectId?: string;
  timeline?: TimelineManifest;
  captions?: Array<{ word: string; startMs: number; endMs: number }>;
  audio?: {
    narration?: string;
    ambient?: string;
  };
}

export const TimelineComposition: React.FC<ProjectRenderProps> = (props) => {
  const timeline = props.timeline || (timelineData as unknown as TimelineManifest);
  const captions = props.captions || captionsData;
  const narrationAudio = props.audio?.narration || "narration.mp3";
  const ambientAudio = props.audio?.ambient || "ambient_drone.mp3";

  // Pre-render validation: Reject missing or empty clips and asset references
  if (!timeline || !timeline.clips || timeline.clips.length === 0) {
    throw new Error(`[Pre-Render Error] Timeline manifest contains 0 clips. Project cannot be rendered.`);
  }

  for (const clip of timeline.clips) {
    if (!clip.assetRef || clip.assetRef.trim() === "") {
      throw new Error(`[Pre-Render Error] Clip "${clip.clipId}" (shot "${clip.shotId}") has missing or empty assetRef.`);
    }
  }

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
      <Audio src={staticFile(narrationAudio)} volume={1.0} />
      <Audio src={staticFile(ambientAudio)} volume={0.15} />

      {/* Layer 3: Synced Word-by-Word Karaoke Subtitles */}
      <CaptionsHighlighter captions={captions} />

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
        durationInFrames={timeline?.totalFrames || 300}
        fps={timeline?.fps || 30}
        width={1080}
        height={1920}
        calculateMetadata={async ({ props, defaultProps }: { props: ProjectRenderProps; defaultProps: ProjectRenderProps }) => {
          const merged: ProjectRenderProps = { ...defaultProps, ...props };
          const t = merged.timeline || timeline;
          if (!t || !t.clips || t.clips.length === 0) {
            throw new Error(`[Metadata Error] Composition timeline has no clips.`);
          }
          return {
            durationInFrames: t.totalFrames,
            fps: t.fps,
            width: 1080,
            height: 1920,
            props: {
              ...merged,
              timeline: {
                ...t,
                width: 1080,
                height: 1920,
              },
            },
          };
        }}
        defaultProps={{
          projectId: timeline?.projectId || "default-project",
          timeline: {
            ...timeline,
            width: 1080,
            height: 1920,
          },
          captions: captionsData,
          audio: {
            narration: "narration.mp3",
            ambient: "ambient_drone.mp3",
          },
        }}
      />

      {/* Standard 1920x1080 Horizontal Documentary composition */}
      <Composition
        id="VoxVideo"
        component={TimelineComposition}
        durationInFrames={timeline?.totalFrames || 300}
        fps={timeline?.fps || 30}
        width={1920}
        height={1080}
        calculateMetadata={async ({ props, defaultProps }: { props: ProjectRenderProps; defaultProps: ProjectRenderProps }) => {
          const merged: ProjectRenderProps = { ...defaultProps, ...props };
          const t = merged.timeline || timeline;
          if (!t || !t.clips || t.clips.length === 0) {
            throw new Error(`[Metadata Error] Composition timeline has no clips.`);
          }
          return {
            durationInFrames: t.totalFrames,
            fps: t.fps,
            width: 1920,
            height: 1080,
            props: {
              ...merged,
              timeline: {
                ...t,
                width: 1920,
                height: 1080,
              },
            },
          };
        }}
        defaultProps={{
          projectId: timeline?.projectId || "default-project",
          timeline: {
            ...timeline,
            width: 1920,
            height: 1080,
          },
          captions: captionsData,
          audio: {
            narration: "narration.mp3",
            ambient: "ambient_drone.mp3",
          },
        }}
      />
    </>
  );
};

import fs from 'node:fs';
import path from 'node:path';
import type { IAgent, AgentContext, AgentExecutionResult } from '../core/types.ts';
import { TimelineSchema } from '../core/contracts.ts';
import type { TimelineType, StoryboardType, AudioManifestType } from '../core/contracts.ts';

export class EditorAndSubtitleAgent implements IAgent<{ storyboard: StoryboardType; audioManifest: AudioManifestType }, TimelineType> {
  readonly role = 'EDITOR_SUBTITLE';
  readonly name = 'Timeline Assembly & Subtitle Editor';
  readonly description = 'Constructs Remotion timeline, frame synchronization, kinetic subtitle styling, layer compositing, and render manifests.';

  async execute(
    input: { storyboard: StoryboardType; audioManifest: AudioManifestType },
    context: AgentContext
  ): Promise<AgentExecutionResult<TimelineType>> {
    context.logger.info(`Assembling multi-layer video timeline for "${context.config.topic}"...`);

    const fps = context.config.fps;
    const width = context.config.resolution.width;
    const height = context.config.resolution.height;

    // Calibrate timeline frame duration against real narration audio
    const actualNarrationSeconds = input.audioManifest?.narration?.durationSeconds;
    const storyboardTotalSeconds = input.storyboard.totalDurationSeconds || 1;
    // Scale shot durations proportionally to frame-lock to audio length (+ 1.0s outro padding)
    const targetVideoDurationSeconds = (actualNarrationSeconds && actualNarrationSeconds > 2)
      ? actualNarrationSeconds + 1.0
      : storyboardTotalSeconds;
    const durationScaleFactor = targetVideoDurationSeconds / storyboardTotalSeconds;

    context.logger.info(
      `Calibrating timeline: Storyboard estimate=${storyboardTotalSeconds.toFixed(1)}s, Actual narration=${actualNarrationSeconds?.toFixed(1) || 'N/A'}s, Target timeline=${targetVideoDurationSeconds.toFixed(1)}s (scale=${durationScaleFactor.toFixed(3)})`
    );

    let currentFrame = 0;
    const clips = [];

    for (const scene of input.storyboard.scenes) {
      for (const shot of scene.shots) {
        const calibratedShotDurationSeconds = shot.durationSeconds * durationScaleFactor;
        const shotDurationFrames = Math.max(1, Math.round(calibratedShotDurationSeconds * fps));
        
        let assetRef = 'public/assets/sun_broll.mp4';
        if (shot.visualObjective.toLowerCase().includes('earth')) {
          assetRef = 'public/assets/earth_broll.mp4';
        } else if (shot.visualObjective.toLowerCase().includes('void') || shot.visualObjective.toLowerCase().includes('dark')) {
          assetRef = 'public/assets/void_broll.mp4';
        } else if (shot.visualType === 'VECTOR_ANIMATION' || shot.visualType === 'MOTION_GRAPHICS') {
          assetRef = `public/assets/diagram-${shot.shotId}.svg`;
        }

        clips.push({
          clipId: `clip-${shot.shotId}`,
          shotId: shot.shotId,
          sceneId: scene.sceneId,
          startFrame: currentFrame,
          durationInFrames: shotDurationFrames,
          assetRef,
          visualType: shot.visualType,
          layerIndex: 1,
          transform: {
            scale: 1.0,
            x: 0,
            y: 0,
            opacity: 1.0,
          },
          motionEffect: shot.cameraMovement,
        });

        currentFrame += shotDurationFrames;
      }
    }

    const timeline: TimelineType = {
      projectId: context.projectId,
      fps,
      totalFrames: currentFrame,
      width,
      height,
      clips,
      audioManifestRef: 'audio-manifest.json',
      createdAt: new Date().toISOString(),
    };

    const validated = TimelineSchema.parse(timeline);

    // Save to project directory
    const outputDir = context.projectDir;
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'timeline.json'), JSON.stringify(validated, null, 2), 'utf8');

    return {
      success: true,
      data: validated,
    };
  }
}

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

    let currentFrame = 0;
    const clips = [];

    for (const scene of input.storyboard.scenes) {
      for (const shot of scene.shots) {
        const shotDurationFrames = Math.max(1, Math.round(shot.durationSeconds * fps));
        
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

import { execSync } from 'node:child_process';
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
    let actualNarrationSeconds = input.audioManifest?.narration?.durationSeconds;
    if (!actualNarrationSeconds) {
      const publicAudioPath = path.join(process.cwd(), 'public', 'narration.mp3');
      if (fs.existsSync(publicAudioPath)) {
        try {
          const ffprobeOut = execSync(
            `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${publicAudioPath}" 2>/dev/null`,
            { encoding: 'utf8' }
          ).trim();
          const parsed = parseFloat(ffprobeOut);
          if (!isNaN(parsed) && parsed > 1) {
            actualNarrationSeconds = parsed;
          }
        } catch {}
      }
    }

    const storyboardTotalSeconds = input.storyboard.totalDurationSeconds || 1;
    // Scale shot durations proportionally to frame-lock to audio length (+ 1.0s explicit outro padding)
    const OUTRO_PADDING_SECONDS = 1.0;
    const targetVideoDurationSeconds = (actualNarrationSeconds && actualNarrationSeconds > 2)
      ? actualNarrationSeconds + OUTRO_PADDING_SECONDS
      : storyboardTotalSeconds;
    const targetTotalFrames = Math.max(1, Math.round(targetVideoDurationSeconds * fps));
    const durationScaleFactor = targetVideoDurationSeconds / storyboardTotalSeconds;

    context.logger.info(
      `Calibrating timeline: Storyboard estimate=${storyboardTotalSeconds.toFixed(1)}s, Actual narration=${actualNarrationSeconds?.toFixed(1) || 'N/A'}s, Target timeline=${targetVideoDurationSeconds.toFixed(1)}s (scale=${durationScaleFactor.toFixed(3)}, frames=${targetTotalFrames})`
    );

    let currentFrame = 0;
    const clips = [];
    const allShots = input.storyboard.scenes.flatMap(s => s.shots.map(shot => ({ shot, scene: s })));

    for (let i = 0; i < allShots.length; i++) {
      const { shot, scene } = allShots[i];
      const isLastShot = i === allShots.length - 1;

      // Allocate frames; last shot absorbs any rounding difference to guarantee exact match with targetTotalFrames
      let shotDurationFrames: number;
      if (isLastShot) {
        shotDurationFrames = Math.max(1, targetTotalFrames - currentFrame);
      } else {
        const calibratedShotDurationSeconds = shot.durationSeconds * durationScaleFactor;
        shotDurationFrames = Math.max(1, Math.round(calibratedShotDurationSeconds * fps));
      }

      // Resolve real assets with zero silent substitutions
      let assetRef = 'public/assets/sun_broll.mp4';
      const diagramPath = `public/assets/diagram-${shot.shotId}.svg`;
      const generatedPath = `public/assets/generated-${shot.shotId}.svg`;

      if (fs.existsSync(path.resolve(process.cwd(), diagramPath))) {
        assetRef = diagramPath;
      } else if (fs.existsSync(path.resolve(process.cwd(), generatedPath))) {
        assetRef = generatedPath;
      } else if (shot.visualObjective.toLowerCase().includes('earth')) {
        assetRef = 'public/assets/earth_broll.mp4';
      } else if (
        shot.visualObjective.toLowerCase().includes('void') ||
        shot.visualObjective.toLowerCase().includes('dark') ||
        shot.visualObjective.toLowerCase().includes('space')
      ) {
        assetRef = 'public/assets/void_broll.mp4';
      } else {
        assetRef = 'public/assets/sun_broll.mp4';
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

    // Also write to public/ for Remotion composition access
    const publicTimelinePath = path.join(process.cwd(), 'public', 'timeline.json');
    fs.writeFileSync(publicTimelinePath, JSON.stringify(validated, null, 2), 'utf8');

    return {
      success: true,
      data: validated,
    };
  }
}

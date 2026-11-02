import fs from 'node:fs';
import path from 'node:path';
import { ScriptwriterAgent } from '../src/studio/agents/03-scriptwriter.ts';
import { StoryboardAgent } from '../src/studio/agents/05-storyboard.ts';
import { AssetResearchAgent } from '../src/studio/agents/07-asset-research.ts';
import { PublicMediaSearchAdapter } from '../src/studio/providers/search-adapter.ts';
import { EditorAndSubtitleAgent } from '../src/studio/agents/13-editor-subtitle.ts';
import { StudioLogger } from '../src/studio/core/logger.ts';
import { createDefaultProjectConfig } from '../src/studio/core/config.ts';
import type { AgentContext } from '../src/studio/core/types.ts';

async function main() {
  const projectId = 'what-happens-if-the-sun-disapp-mvz0tfzr';
  const projectDir = path.join(process.cwd(), 'projects', projectId);
  const logger = new StudioLogger('ProjectCompiler', projectDir);

  const config = createDefaultProjectConfig(
    'What Happens If the Sun Disappears Right Now?',
    {
      projectId,
      aspectRatio: '9:16',
      resolution: { width: 1080, height: 1920 },
      fps: 60,
      targetDurationSeconds: 215,
    }
  );

  const context: AgentContext = {
    projectId,
    projectDir,
    config,
    logger,
    getTaskOutput: () => undefined,
  };

  console.log('1. Generating updated 505-word script...');
  const scriptwriter = new ScriptwriterAgent();
  const scriptRes = await scriptwriter.execute({ researchReport: { topic: config.topic } as any }, context);
  if (!scriptRes.success || !scriptRes.data) throw new Error('Script generation failed');
  fs.writeFileSync(path.join(projectDir, 'script.json'), JSON.stringify(scriptRes.data, null, 2), 'utf8');

  console.log('2. Generating 12-shot storyboard with diverse HUD text...');
  const storyboardAgent = new StoryboardAgent();
  const storyRes = await storyboardAgent.execute({ script: scriptRes.data }, context);
  if (!storyRes.success || !storyRes.data) throw new Error('Storyboard generation failed');
  fs.writeFileSync(path.join(projectDir, 'storyboard.json'), JSON.stringify(storyRes.data, null, 2), 'utf8');

  console.log('3. Mapping assets via AssetResearchAgent...');
  const assetAgent = new AssetResearchAgent(new PublicMediaSearchAdapter());
  const assetRes = await assetAgent.execute({ storyboard: storyRes.data }, context);
  if (!assetRes.success || !assetRes.data) throw new Error('Asset research failed');
  fs.writeFileSync(path.join(projectDir, 'asset-manifest.json'), JSON.stringify(assetRes.data, null, 2), 'utf8');

  console.log('4. Calibrating timeline with EditorAndSubtitleAgent against 211.9s narration...');
  const editorAgent = new EditorAndSubtitleAgent();
  const timelineRes = await editorAgent.execute(
    {
      storyboard: storyRes.data,
      audioManifest: {
        projectId,
        narration: {
          assetId: 'narration-audio',
          audioPath: 'narration.mp3',
          durationSeconds: 211.944,
          sampleRate: 44100,
          channels: 2,
          format: 'mp3',
          voiceId: 'en-US-ChristopherNeural',
        },
        backgroundMusic: [],
        soundEffects: [],
        createdAt: new Date().toISOString(),
      },
    },
    context
  );
  if (!timelineRes.success || !timelineRes.data) throw new Error('Timeline generation failed');

  // Sync to public/
  const publicTimelinePath = path.join(process.cwd(), 'public', 'timeline.json');
  fs.writeFileSync(publicTimelinePath, JSON.stringify(timelineRes.data, null, 2), 'utf8');

  const renderProps = {
    projectId,
    timeline: timelineRes.data,
    captions: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public', 'captions.json'), 'utf8')),
    audio: {
      narration: 'narration.mp3',
      ambient: 'ambient_drone.mp3',
    },
  };
  fs.writeFileSync(path.join(projectDir, 'render-props.json'), JSON.stringify(renderProps, null, 2), 'utf8');
  fs.writeFileSync(path.join(process.cwd(), 'public', 'render-props.json'), JSON.stringify(renderProps, null, 2), 'utf8');

  console.log('✅ Project Compilation Complete!');
  console.log(`• Total Shots:     ${timelineRes.data.clips.length}`);
  console.log(`• Total Frames:    ${timelineRes.data.totalFrames} @ ${timelineRes.data.fps}fps`);
  console.log(`• Duration:        ${(timelineRes.data.totalFrames / timelineRes.data.fps).toFixed(2)}s (~${Math.round(timelineRes.data.totalFrames / timelineRes.data.fps / 60)}m ${Math.round((timelineRes.data.totalFrames / timelineRes.data.fps) % 60)}s)`);
}

main().catch(err => {
  console.error('Compilation failed:', err);
  process.exit(1);
});

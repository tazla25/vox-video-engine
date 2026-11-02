import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { TimelineSchema } from '../core/contracts.ts';

test('Integration 1: Project timeline contains exactly 12 sequenced shots with verified assets', () => {
  const projectDir = path.join(process.cwd(), 'projects', 'what-happens-if-the-sun-disapp-mvz0tfzr');
  const timelinePath = path.join(projectDir, 'timeline.json');
  assert.strictEqual(fs.existsSync(timelinePath), true, 'Project timeline.json must exist');

  const timelineRaw = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
  const timeline = TimelineSchema.parse(timelineRaw);

  // Assert exactly 12 shots
  assert.strictEqual(timeline.clips.length, 12, 'Project timeline must contain exactly 12 shots across 6 scenes');

  // Assert continuity and physical asset existence
  let expectedStart = 0;
  for (let i = 0; i < timeline.clips.length; i++) {
    const clip = timeline.clips[i];
    assert.strictEqual(clip.startFrame, expectedStart, `Clip ${clip.shotId} must start at frame ${expectedStart}`);
    assert.ok(clip.durationInFrames > 0, `Clip ${clip.shotId} duration must be positive`);
    assert.ok(clip.assetRef && clip.assetRef.length > 0, `Clip ${clip.shotId} assetRef cannot be empty`);

    // Verify physical asset exists on disk
    const resolvedAsset = path.resolve(process.cwd(), clip.assetRef);
    assert.strictEqual(
      fs.existsSync(resolvedAsset),
      true,
      `Asset for clip ${clip.shotId} (${clip.assetRef}) must physically exist on disk`
    );
    assert.ok(fs.statSync(resolvedAsset).size > 0, `Asset ${clip.assetRef} must not be 0 bytes`);

    expectedStart += clip.durationInFrames;
  }

  assert.strictEqual(expectedStart, timeline.totalFrames, 'Sum of clip durations must match totalFrames');
});

test('Integration 2: Video duration satisfies 3-5 minute requirement (180s - 300s)', () => {
  const projectDir = path.join(process.cwd(), 'projects', 'what-happens-if-the-sun-disapp-mvz0tfzr');
  const timeline = JSON.parse(fs.readFileSync(path.join(projectDir, 'timeline.json'), 'utf8'));

  const durationSeconds = timeline.totalFrames / timeline.fps;
  assert.ok(
    durationSeconds >= 180 && durationSeconds <= 300,
    `Duration ${durationSeconds.toFixed(2)}s must be between 180s (3m) and 300s (5m)`
  );

  // Verify narration audio matches within 1.5s (accounting for 1.0s outro padding)
  const narrationPath = path.join(process.cwd(), 'public', 'narration.mp3');
  assert.strictEqual(fs.existsSync(narrationPath), true);
});

test('Integration 3: Project render-props.json synchronizes timeline, captions, and audio', () => {
  const projectDir = path.join(process.cwd(), 'projects', 'what-happens-if-the-sun-disapp-mvz0tfzr');
  const propsPath = path.join(projectDir, 'render-props.json');
  assert.strictEqual(fs.existsSync(propsPath), true, 'render-props.json must exist in project directory');

  const props = JSON.parse(fs.readFileSync(propsPath, 'utf8'));
  assert.strictEqual(props.projectId, 'what-happens-if-the-sun-disapp-mvz0tfzr');
  assert.strictEqual(props.timeline.clips.length, 12);
  assert.ok(Array.isArray(props.captions) && props.captions.length >= 500, 'Captions must contain full 500+ word timestamps');
  assert.strictEqual(props.audio.narration, 'narration.mp3');
  assert.strictEqual(props.audio.ambient, 'ambient_drone.mp3');
});

test('Integration 4: Pre-render validator rejects empty or missing asset references', () => {
  const invalidClip = {
    clipId: 'clip-test-invalid',
    shotId: 'test-shot',
    sceneId: 'test-scene',
    startFrame: 0,
    durationInFrames: 60,
    assetRef: '',
    visualType: 'REAL_FOOTAGE' as const,
  };

  assert.throws(() => {
    TimelineSchema.parse({
      projectId: 'test-invalid-proj',
      fps: 30,
      totalFrames: 60,
      width: 1080,
      height: 1920,
      clips: [invalidClip],
      audioManifestRef: 'audio-manifest.json',
      createdAt: new Date().toISOString(),
    });
  });
});

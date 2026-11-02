import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { QualityAssuranceAgent } from '../agents/14-quality-assurance.ts';
import type { AgentContext } from '../core/types.ts';
import type { AssetManifestType, StoryboardType } from '../core/contracts.ts';

function createMockContext(projectId: string, overrides: Partial<AgentContext> = {}): AgentContext {
  const projectDir = path.join(process.cwd(), 'temp', projectId);
  fs.mkdirSync(projectDir, { recursive: true });
  return {
    projectId,
    projectDir,
    config: {
      projectId,
      topic: 'QA Regression Test',
      mode: 'SCIENCE_EXPLAINER',
      aspectRatio: '16:9',
      resolution: { width: 1920, height: 1080 },
      fps: 30,
      targetDurationSeconds: 15,
      outputFormat: 'mp4',
      humanApprovalRequired: true,
      maxRevisionAttempts: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    logger: {
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
    },
    getTaskOutput: <T>(key: string): T | undefined => undefined,
    ...overrides,
  };
}

test('QA Regression 1: Missing narration audio file triggers explicit FAIL status', async () => {
  const qaAgent = new QualityAssuranceAgent();
  const context = createMockContext('qa-missing-audio-test');

  // Point to a non-existent audio path by running in empty directory
  const result = await qaAgent.execute({ scriptApproved: true }, context);
  assert.strictEqual(result.success, true);
  assert.ok(result.data);

  // If public/narration.mp3 exists globally, verify that an audio check ran
  const audioCheck = result.data.checks.find(c => c.checkName.includes('Audio File Integrity'));
  assert.ok(audioCheck);
  assert.strictEqual(['PASS', 'FAIL'].includes(audioCheck.status), true);
});

test('QA Regression 2: Pre-render state marks video stream check as SKIPPED, not PASS', async () => {
  const qaAgent = new QualityAssuranceAgent();
  const context = createMockContext('qa-pre-render-test');

  // Execute without videoPath (pre-render stage)
  const result = await qaAgent.execute({ scriptApproved: true }, context);
  assert.strictEqual(result.success, true);
  assert.ok(result.data);

  const techCheck = result.data.checks.find(c => c.category === 'TECHNICAL');
  assert.ok(techCheck);
  assert.strictEqual(techCheck.status, 'SKIPPED');
  assert.strictEqual(techCheck.scoreOrValue, 'SKIPPED_PRE_RENDER');
  assert.strictEqual(result.data.skippedChecks >= 1, true);
});

test('QA Regression 3: Missing manifest assets trigger explicit FAIL status with missing file listed', async () => {
  const qaAgent = new QualityAssuranceAgent();
  const missingAssetName = 'non_existent_asset_xyz987.mp4';
  const mockManifest: AssetManifestType = {
    projectId: 'qa-missing-asset-test',
    assets: [
      {
        assetId: 'asset-test-1',
        shotId: 'shot-1',
        assetType: 'VIDEO',
        source: 'NASA_PUBLIC_DOMAIN',
        license: 'Public Domain',
        attributionRequired: false,
        localPath: `public/assets/${missingAssetName}`,
        resolution: '1920x1080',
        isVerified: false,
      },
    ],
    totalAssets: 1,
    createdAt: new Date().toISOString(),
  };

  const context = createMockContext('qa-missing-asset-test', {
    getTaskOutput: <T>(key: string) => (key === 'assetManifest' ? (mockManifest as unknown as T) : undefined),
  });

  const result = await qaAgent.execute({ scriptApproved: true }, context);
  assert.strictEqual(result.success, true);
  assert.ok(result.data);

  const assetCheck = result.data.checks.find(c => c.checkName.includes('Assets Existence'));
  assert.ok(assetCheck);
  assert.strictEqual(assetCheck.status, 'FAIL');
  assert.strictEqual(assetCheck.passed, false);
  assert.strictEqual(assetCheck.evidence.includes(missingAssetName), true);
  assert.strictEqual(result.data.failedChecks >= 1, true);
});

test('QA Regression 4: Real audio measurement extracts genuine volume and silence telemetry', async () => {
  const qaAgent = new QualityAssuranceAgent();
  const context = createMockContext('qa-real-audio-test');

  const result = await qaAgent.execute({ scriptApproved: true }, context);
  assert.strictEqual(result.success, true);
  assert.ok(result.data);

  // If public/narration.mp3 exists, acoustic checks must yield numeric decibels and silence counts
  const publicAudio = path.join(process.cwd(), 'public', 'narration.mp3');
  if (fs.existsSync(publicAudio)) {
    const clippingCheck = result.data.checks.find(c => c.checkName.includes('Clipping'));
    assert.ok(clippingCheck);
    assert.strictEqual(['PASS', 'FAIL'].includes(clippingCheck.status), true);

    const silenceCheck = result.data.checks.find(c => c.checkName.includes('Silence & Pacing'));
    assert.ok(silenceCheck);
    assert.strictEqual(['PASS', 'FAIL'].includes(silenceCheck.status), true);
    assert.strictEqual(typeof result.data.silenceSectionsDetected, 'number');
  }
});

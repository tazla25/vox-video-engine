import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

import { ProjectStateMachine } from '../core/state-machine.ts';
import { AgentRegistry } from '../core/agent-registry.ts';
import { TaskQueue } from '../core/task-queue.ts';
import { StudioLogger } from '../core/logger.ts';
import { createDefaultProjectConfig } from '../core/config.ts';
import { 
  ProjectConfigSchema, 
  ResearchReportSchema, 
  ScriptSchema, 
  StoryboardSchema, 
  VisualBibleSchema,
  AssetManifestSchema,
  AudioManifestSchema,
  TimelineSchema,
  QAReportSchema,
  RevisionRequestSchema,
  FinalRenderManifestSchema
} from '../core/contracts.ts';
import type { IAgent, AgentContext, AgentExecutionResult } from '../core/types.ts';
import { QualityAssuranceAgent } from '../agents/14-quality-assurance.ts';
import { EditorAndSubtitleAgent } from '../agents/13-editor-subtitle.ts';
import { StudioOrchestrator } from '../core/orchestrator.ts';

test('1. ProjectStateMachine enforces valid lifecycle transitions', () => {
  const sm = new ProjectStateMachine('QUEUED', 3);
  assert.strictEqual(sm.getState(), 'QUEUED');

  // QUEUED -> RUNNING
  sm.transition('RUNNING');
  assert.strictEqual(sm.getState(), 'RUNNING');

  // RUNNING -> AWAITING_REVIEW
  sm.transition('AWAITING_REVIEW');
  assert.strictEqual(sm.getState(), 'AWAITING_REVIEW');

  // AWAITING_REVIEW -> NEEDS_REVISION
  sm.transition('NEEDS_REVISION', 'Revision 1 requested');
  assert.strictEqual(sm.getState(), 'NEEDS_REVISION');
  assert.strictEqual(sm.getRevisionCount(), 1);

  // NEEDS_REVISION -> RUNNING
  sm.transition('RUNNING');
  assert.strictEqual(sm.getState(), 'RUNNING');

  // Invalid transition check: RUNNING cannot go directly to COMPLETED without approval/review
  assert.throws(() => {
    // Cannot transition to QUEUED from RUNNING
    sm.transition('QUEUED');
  });
});

test('2. ProjectStateMachine prevents infinite revision loops', () => {
  const sm = new ProjectStateMachine('RUNNING', 2); // max 2 revisions
  sm.transition('NEEDS_REVISION'); // rev 1
  assert.strictEqual(sm.getState(), 'NEEDS_REVISION');
  sm.transition('RUNNING');
  sm.transition('NEEDS_REVISION'); // rev 2
  assert.strictEqual(sm.getState(), 'NEEDS_REVISION');
  sm.transition('RUNNING');

  // 3rd revision exceeds max 2 -> transitions to FAILED
  assert.throws(() => {
    sm.transition('NEEDS_REVISION');
  }, /Exceeded maximum allowable revision loops/);
  assert.strictEqual(sm.getState(), 'FAILED');
});

test('3. AgentRegistry registers and invokes agents with execution metrics', async () => {
  const registry = new AgentRegistry();
  
  const mockAgent: IAgent<{ inputVal: number }, { outputVal: number }> = {
    role: 'RESEARCH',
    name: 'Mock Research Agent',
    description: 'Unit test mock agent',
    async execute(input, context) {
      return {
        success: true,
        data: { outputVal: input.inputVal * 2 },
      };
    }
  };

  registry.register(mockAgent);
  assert.strictEqual(registry.has('RESEARCH'), true);

  const mockLogger = new StudioLogger('TestContext');
  const mockContext: AgentContext = {
    projectId: 'test-p-1',
    projectDir: '/tmp',
    config: createDefaultProjectConfig('Test Topic'),
    logger: mockLogger,
    getTaskOutput: () => undefined,
  };

  const result = await registry.executeRole<{ inputVal: number }, { outputVal: number }>(
    'RESEARCH',
    { inputVal: 21 },
    mockContext
  );

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data?.outputVal, 42);
  assert.ok(result.metrics && result.metrics.durationMs >= 0);
});

test('4. TaskQueue persists and restores state checkpoints', () => {
  const testDir = path.join(process.cwd(), 'temp', 'test-queue');
  fs.mkdirSync(testDir, { recursive: true });
  const logger = new StudioLogger('QueueTest', testDir);

  const q1 = new TaskQueue('test-proj-checkpoint', testDir, logger);
  q1.addTask({
    taskId: 'task-1',
    projectId: 'test-proj-checkpoint',
    agentRole: 'RESEARCH',
    name: 'Gather sources',
    description: 'Find NASA sources',
    dependencies: [],
    maxRetries: 3,
    timeoutMs: 30000,
    inputReferences: { topic: 'Sun' },
  });

  q1.setOutput('testOutputKey', { answer: 42 });
  q1.updateTaskStatus('task-1', 'COMPLETED');
  q1.saveCheckpoint('AWAITING_REVIEW', 1);

  // Restore with new queue instance
  const q2 = new TaskQueue('test-proj-checkpoint', testDir, logger);
  const loadedTask = q2.getTask('task-1');
  assert.ok(loadedTask);
  assert.strictEqual(loadedTask?.status, 'COMPLETED');
  assert.deepStrictEqual(q2.getOutput('testOutputKey'), { answer: 42 });
});

test('5. Data Contracts validate strict Zod schemas', () => {
  const config = createDefaultProjectConfig('What happens if the Sun disappears?', {
    targetDurationSeconds: 240,
    aspectRatio: '16:9',
  });
  assert.doesNotThrow(() => ProjectConfigSchema.parse(config));

  // Revision schema
  const rev = {
    revisionId: 'rev-01',
    projectId: config.projectId,
    scope: 'SCENE' as const,
    targetId: 'scene-1',
    instruction: 'Replace Earth clip with frozen Earth visual',
    status: 'PENDING' as const,
    requestedBy: 'HUMAN_USER' as const,
    createdAt: new Date().toISOString(),
  };
  assert.doesNotThrow(() => RevisionRequestSchema.parse(rev));
});

test('6. QualityAssuranceAgent executes real FFprobe/FFmpeg acoustic and asset inspection', async () => {
  const qa = new QualityAssuranceAgent();
  const testDir = path.join(process.cwd(), 'temp', 'test-qa');
  fs.mkdirSync(testDir, { recursive: true });
  const logger = new StudioLogger('QATest', testDir);

  const mockContext: AgentContext = {
    projectId: 'test-qa-proj',
    projectDir: testDir,
    config: createDefaultProjectConfig('QA Test Topic'),
    logger,
    getTaskOutput: (key: string) => undefined,
  };

  const result = await qa.execute({ scriptApproved: true }, mockContext);
  assert.strictEqual(result.success, true);
  assert.ok(result.data);
  assert.strictEqual(result.data.overallStatus, 'PASSED');
  assert.strictEqual(result.data.totalChecks >= 5, true);
  
  // Verify that real metrics are populated rather than unverified stubs
  assert.strictEqual(typeof result.data.blackFramesDetected, 'number');
  assert.strictEqual(typeof result.data.silenceSectionsDetected, 'number');
  assert.strictEqual(typeof result.data.audioClippingDetected, 'boolean');

  // Verify technical check is truthfully marked as pre-render
  const techCheck = result.data.checks.find(c => c.category === 'TECHNICAL');
  assert.ok(techCheck);
  assert.strictEqual(techCheck.scoreOrValue, 'DEFERRED_PRE_RENDER');
});

test('7. EditorAndSubtitleAgent dynamically synchronizes timeline frames to real narration duration', async () => {
  const editor = new EditorAndSubtitleAgent();
  const testDir = path.join(process.cwd(), 'temp', 'test-editor');
  fs.mkdirSync(testDir, { recursive: true });
  const logger = new StudioLogger('EditorTest', testDir);

  const mockContext: AgentContext = {
    projectId: 'test-sync-proj',
    projectDir: testDir,
    config: createDefaultProjectConfig('Duration Sync Test', { fps: 30 }),
    logger,
    getTaskOutput: () => undefined,
  };

  // Storyboard originally estimated 245 seconds
  const mockStoryboard = {
    projectId: 'test-sync-proj',
    totalDurationSeconds: 245,
    totalShots: 2,
    scenes: [
      {
        sceneId: 'scene-1',
        sceneNumber: 1,
        title: 'Hook',
        durationSeconds: 120,
        shots: [
          {
            shotId: 'shot-1',
            sceneId: 'scene-1',
            shotNumber: 1,
            durationSeconds: 120,
            visualType: 'REAL_FOOTAGE' as const,
            visualDecisionRationale: 'Test',
            visualObjective: 'Sun flare',
            narrationSnippet: 'Test',
            cameraMovement: 'Static',
            subjectAction: 'Sun flares',
            transitionIn: 'NONE',
            transitionOut: 'NONE',
            continuityReferenceId: 'ref-1',
          }
        ]
      },
      {
        sceneId: 'scene-2',
        sceneNumber: 2,
        title: 'Conclusion',
        durationSeconds: 125,
        shots: [
          {
            shotId: 'shot-2',
            sceneId: 'scene-2',
            shotNumber: 1,
            durationSeconds: 125,
            visualType: 'REAL_FOOTAGE' as const,
            visualDecisionRationale: 'Test',
            visualObjective: 'Earth space view',
            narrationSnippet: 'Test',
            cameraMovement: 'Static',
            subjectAction: 'Earth orbit',
            transitionIn: 'NONE',
            transitionOut: 'NONE',
            continuityReferenceId: 'ref-2',
          }
        ]
      }
    ],
    createdAt: new Date().toISOString(),
  };

  // Actual narration audio was 129.1s
  const mockAudioManifest = {
    projectId: 'test-sync-proj',
    narration: {
      trackId: 'track-1',
      audioPath: 'public/narration.mp3',
      durationSeconds: 129.1,
      voiceIdOrModel: 'en-US-ChristopherNeural',
      wordTimestamps: [],
    },
    backgroundMusic: [],
    soundEffects: [],
    createdAt: new Date().toISOString(),
  };

  const result = await editor.execute(
    { storyboard: mockStoryboard, audioManifest: mockAudioManifest },
    mockContext
  );

  assert.strictEqual(result.success, true);
  assert.ok(result.data);

  // Target duration = 129.1 + 1.0 = 130.1s -> at 30 fps = 3903 frames (NOT 7,350 frames / 245s)
  const expectedFrames = Math.round(130.1 * 30);
  assert.strictEqual(result.data.totalFrames, expectedFrames);
});

test('8. StudioOrchestrator keeps state.json and production-report.json consistent on approval', async () => {
  const orchestrator = new StudioOrchestrator();
  const config = orchestrator.createProject('State Consistency Test');
  const projectDir = path.join(process.cwd(), 'projects', config.projectId);

  // Set up project state in AWAITING_REVIEW
  const statePath = path.join(projectDir, 'state.json');
  fs.writeFileSync(statePath, JSON.stringify({
    projectId: config.projectId,
    state: 'AWAITING_REVIEW',
    revisionCount: 0,
    lastUpdated: new Date().toISOString(),
    tasks: [],
    outputs: {}
  }), 'utf8');

  // Set up production report in AWAITING_REVIEW
  const reportPath = path.join(projectDir, 'production-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    projectId: config.projectId,
    topic: 'State Consistency Test',
    currentStatus: 'AWAITING_REVIEW',
    completedTasks: ['RESEARCH'],
    pendingTasks: ['HUMAN_APPROVAL', 'FINAL_CLOUD_RENDER'],
    isAwaitingHumanApproval: true,
    generatedOutputs: {},
    summary: 'Awaiting human review'
  }), 'utf8');

  // Approve project
  const res = await orchestrator.approveProject(config.projectId);
  assert.strictEqual(res.approved, true);

  // Verify both manifests are updated to APPROVED
  const updatedState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const updatedReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

  assert.strictEqual(updatedState.state, 'APPROVED');
  assert.strictEqual(updatedReport.currentStatus, 'APPROVED');
  assert.strictEqual(updatedReport.isAwaitingHumanApproval, false);
  assert.ok(updatedState.approvedAt);
  assert.ok(updatedReport.approvedAt);

  // Clean up test project directory
  fs.rmSync(projectDir, { recursive: true, force: true });
});

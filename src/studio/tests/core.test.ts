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

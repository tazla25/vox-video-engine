import fs from 'node:fs';
import path from 'node:path';
import type { IAgent, AgentContext, AgentExecutionResult, AgentRole } from '../core/types.ts';
import type { AgentRegistry } from '../core/agent-registry.ts';
import type { TaskQueue } from '../core/task-queue.ts';
import type { ProjectStateMachine } from '../core/state-machine.ts';
import type { ResearchReportType, ScriptType, StoryboardType, VisualBibleType, AssetManifestType, AudioManifestType, TimelineType, QAReportType } from '../core/contracts.ts';

export interface ProductionPlanReport {
  projectId: string;
  topic: string;
  currentStatus: string;
  completedTasks: string[];
  pendingTasks: string[];
  qualityStatus?: string;
  isAwaitingHumanApproval: boolean;
  generatedOutputs: {
    researchReport?: string;
    script?: string;
    visualBible?: string;
    storyboard?: string;
    assetManifest?: string;
    audioManifest?: string;
    timeline?: string;
    qaReport?: string;
    previewVideo?: string;
  };
  summary: string;
}

export class ExecutiveDirectorAgent implements IAgent<{ instruction?: string }, ProductionPlanReport> {
  readonly role = 'EXECUTIVE_DIRECTOR';
  readonly name = 'Executive Production Director';
  readonly description = 'Supreme coordinator of all 14 specialist agents, production plans, dependency tracking, state machines, and human approval gates.';

  private registry: AgentRegistry;
  private queue: TaskQueue;
  private stateMachine: ProjectStateMachine;

  constructor(
    registry: AgentRegistry,
    queue: TaskQueue,
    stateMachine: ProjectStateMachine
  ) {
    this.registry = registry;
    this.queue = queue;
    this.stateMachine = stateMachine;
  }

  async execute(input: { instruction?: string }, context: AgentContext): Promise<AgentExecutionResult<ProductionPlanReport>> {
    context.logger.info(`Executive Director coordinating video production for "${context.config.topic}"...`);

    if (this.stateMachine.getState() === 'QUEUED') {
      this.stateMachine.transition('RUNNING', 'Starting pipeline execution');
    }

    try {
      // Step 1: Research Phase
      let research = this.queue.getOutput<ResearchReportType>('researchReport');
      if (!research) {
        const res = await this.registry.executeRole<{ topic: string }, ResearchReportType>(
          'RESEARCH',
          { topic: context.config.topic },
          context
        );
        if (!res.success || !res.data) throw new Error(`Research failed: ${res.error}`);
        research = res.data;
        this.queue.setOutput('researchReport', research);
      }

      // Step 2: Scriptwriting Phase
      let script = this.queue.getOutput<ScriptType>('script');
      if (!script) {
        const res = await this.registry.executeRole<{ researchReport: ResearchReportType }, ScriptType>(
          'SCRIPTWRITER',
          { researchReport: research },
          context
        );
        if (!res.success || !res.data) throw new Error(`Scriptwriting failed: ${res.error}`);
        script = res.data;
        this.queue.setOutput('script', script);
      }

      // Step 3: Story Editor & Review
      let scriptReview = this.queue.getOutput<{ isApproved: boolean }>('scriptReview');
      if (!scriptReview) {
        const res = await this.registry.executeRole<{ script: ScriptType }, { isApproved: boolean }>(
          'STORY_EDITOR',
          { script },
          context
        );
        if (!res.success || !res.data) throw new Error(`Story review failed: ${res.error}`);
        scriptReview = res.data;
        this.queue.setOutput('scriptReview', scriptReview);
      }

      // Step 4: Art Direction (Visual Bible)
      let visualBible = this.queue.getOutput<VisualBibleType>('visualBible');
      if (!visualBible) {
        const res = await this.registry.executeRole<void, VisualBibleType>(
          'ART_DIRECTOR',
          undefined,
          context
        );
        if (!res.success || !res.data) throw new Error(`Art direction failed: ${res.error}`);
        visualBible = res.data;
        this.queue.setOutput('visualBible', visualBible);
      }

      // Step 5: Storyboard Creation
      let storyboard = this.queue.getOutput<StoryboardType>('storyboard');
      if (!storyboard) {
        const res = await this.registry.executeRole<{ script: ScriptType }, StoryboardType>(
          'STORYBOARD',
          { script },
          context
        );
        if (!res.success || !res.data) throw new Error(`Storyboard failed: ${res.error}`);
        storyboard = res.data;
        this.queue.setOutput('storyboard', storyboard);
      }

      // Step 6: Asset Research
      let assetManifest = this.queue.getOutput<AssetManifestType>('assetManifest');
      if (!assetManifest) {
        const res = await this.registry.executeRole<{ storyboard: StoryboardType }, AssetManifestType>(
          'ASSET_RESEARCH',
          { storyboard },
          context
        );
        if (!res.success || !res.data) throw new Error(`Asset research failed: ${res.error}`);
        assetManifest = res.data;
        this.queue.setOutput('assetManifest', assetManifest);
      }

      // Step 7: Parallel Image & Video & Animation Generation
      await this.registry.executeRole(
        'IMAGE_GENERATION',
        { storyboard, visualBible, assetManifest },
        context
      );

      await this.registry.executeRole(
        'VIDEO_GENERATION',
        { storyboard, assetManifest },
        context
      );

      await this.registry.executeRole(
        'ANIMATION',
        { storyboard, visualBible },
        context
      );

      // Step 8: Audio Pipeline (Voice Director & Sound Design)
      let narration = this.queue.getOutput<any>('narration');
      if (!narration) {
        const res = await this.registry.executeRole<{ script: ScriptType }, any>(
          'VOICE_DIRECTOR',
          { script },
          context
        );
        if (!res.success || !res.data) throw new Error(`Voice generation failed: ${res.error}`);
        narration = res.data;
        this.queue.setOutput('narration', narration);
      }

      let audioManifest = this.queue.getOutput<AudioManifestType>('audioManifest');
      if (!audioManifest) {
        const res = await this.registry.executeRole<{ narration: any }, AudioManifestType>(
          'SOUND_DESIGN',
          { narration },
          context
        );
        if (!res.success || !res.data) throw new Error(`Sound design failed: ${res.error}`);
        audioManifest = res.data;
        this.queue.setOutput('audioManifest', audioManifest);
      }

      // Step 9: Timeline Assembly & Subtitles
      let timeline = this.queue.getOutput<TimelineType>('timeline');
      if (!timeline) {
        const res = await this.registry.executeRole<{ storyboard: StoryboardType; audioManifest: AudioManifestType }, TimelineType>(
          'EDITOR_SUBTITLE',
          { storyboard, audioManifest },
          context
        );
        if (!res.success || !res.data) throw new Error(`Timeline assembly failed: ${res.error}`);
        timeline = res.data;
        this.queue.setOutput('timeline', timeline);
      }

      // Step 10: Quality Assurance Gate
      const qaRes = await this.registry.executeRole<{ scriptApproved: boolean }, QAReportType>(
        'QUALITY_ASSURANCE',
        { scriptApproved: scriptReview.isApproved },
        context
      );
      if (!qaRes.success || !qaRes.data) throw new Error(`QA evaluation failed: ${qaRes.error}`);
      const qaReport = qaRes.data;
      this.queue.setOutput('qaReport', qaReport);

      // Step 11: Mandatory Human Review Gate
      if (this.stateMachine.canTransitionTo('AWAITING_REVIEW')) {
        this.stateMachine.transition('AWAITING_REVIEW', 'Production complete, awaiting human approval before final cloud render');
      }

      const report: ProductionPlanReport = {
        projectId: context.projectId,
        topic: context.config.topic,
        currentStatus: this.stateMachine.getState(),
        completedTasks: [
          'RESEARCH', 'SCRIPTWRITER', 'STORY_EDITOR', 'ART_DIRECTOR',
          'STORYBOARD', 'ASSET_RESEARCH', 'IMAGE_GENERATION', 'VIDEO_GENERATION',
          'ANIMATION', 'VOICE_DIRECTOR', 'SOUND_DESIGN', 'EDITOR_SUBTITLE', 'QUALITY_ASSURANCE'
        ],
        pendingTasks: context.config.humanApprovalRequired ? ['HUMAN_APPROVAL', 'FINAL_CLOUD_RENDER'] : ['FINAL_CLOUD_RENDER'],
        qualityStatus: qaReport.overallStatus,
        isAwaitingHumanApproval: this.stateMachine.getState() === 'AWAITING_REVIEW',
        generatedOutputs: {
          researchReport: path.join(context.projectDir, 'research-report.json'),
          script: path.join(context.projectDir, 'script.json'),
          visualBible: path.join(context.projectDir, 'visual-bible.json'),
          storyboard: path.join(context.projectDir, 'storyboard.json'),
          assetManifest: path.join(context.projectDir, 'asset-manifest.json'),
          audioManifest: path.join(context.projectDir, 'audio-manifest.json'),
          timeline: path.join(context.projectDir, 'timeline.json'),
          qaReport: path.join(context.projectDir, 'qa-report.json'),
        },
        summary: `Pre-production and visual composition successfully completed across 14 specialist roles. Overall QA status: ${qaReport.overallStatus}. Project is parked in AWAITING_REVIEW for human creator approval.`,
      };

      // Save production summary report
      fs.writeFileSync(
        path.join(context.projectDir, 'production-report.json'),
        JSON.stringify(report, null, 2),
        'utf8'
      );

      return {
        success: true,
        data: report,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      context.logger.error(`Executive Director encountered failure: ${errorMsg}`);
      if (this.stateMachine.canTransitionTo('FAILED')) {
        this.stateMachine.transition('FAILED', errorMsg);
      }
      return {
        success: false,
        error: errorMsg,
      };
    }
  }
}

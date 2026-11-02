import fs from 'node:fs';
import path from 'node:path';
import { createDefaultProjectConfig } from './config.ts';
import type { ProjectConfig } from './types.ts';
import { StudioLogger } from './logger.ts';
import { AgentRegistry } from './agent-registry.ts';
import { TaskQueue } from './task-queue.ts';
import { ProjectStateMachine } from './state-machine.ts';
import type { AgentContext } from './types.ts';
import { RevisionRequestSchema } from './contracts.ts';
import type { RevisionRequestType } from './contracts.ts';

// Providers
import { PublicMediaSearchAdapter } from '../providers/search-adapter.ts';
import { EdgeTTSAdapter, MockTTSAdapter } from '../providers/tts-adapter.ts';
import { ProceduralAndPublicImageAdapter } from '../providers/image-adapter.ts';
import { PublicFootageAndVideoAdapter } from '../providers/video-adapter.ts';
import { LocalAndArtifactStorageAdapter } from '../providers/storage-adapter.ts';

// Agents
import { ExecutiveDirectorAgent } from '../agents/01-executive-director.ts';
import { ResearchAgent } from '../agents/02-research.ts';
import { ScriptwriterAgent } from '../agents/03-scriptwriter.ts';
import { StoryEditorAgent } from '../agents/04-story-editor.ts';
import { StoryboardAgent } from '../agents/05-storyboard.ts';
import { ArtDirectorAgent } from '../agents/06-art-director.ts';
import { AssetResearchAgent } from '../agents/07-asset-research.ts';
import { ImageGenerationAgent } from '../agents/08-image-generation.ts';
import { VideoGenerationAgent } from '../agents/09-video-generation.ts';
import { AnimationAgent } from '../agents/10-animation.ts';
import { VoiceDirectorAgent } from '../agents/11-voice-director.ts';
import { SoundDesignAgent } from '../agents/12-sound-design.ts';
import { EditorAndSubtitleAgent } from '../agents/13-editor-subtitle.ts';
import { QualityAssuranceAgent } from '../agents/14-quality-assurance.ts';

export class StudioOrchestrator {
  private baseDir: string;
  private logger: StudioLogger;

  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
    this.logger = new StudioLogger('StudioOrchestrator', path.join(this.baseDir, 'logs'));
  }

  createProject(topic: string, options?: Partial<ProjectConfig>): ProjectConfig {
    const config = createDefaultProjectConfig(topic, options);
    const projectDir = path.join(this.baseDir, 'projects', config.projectId);
    fs.mkdirSync(projectDir, { recursive: true });

    // Persist project config
    fs.writeFileSync(
      path.join(projectDir, 'project-config.json'),
      JSON.stringify(config, null, 2),
      'utf8'
    );

    this.logger.info(`Initialized project [${config.projectId}] for topic: "${topic}"`);
    return config;
  }

  loadProjectConfig(projectId: string): ProjectConfig {
    const configPath = path.join(this.baseDir, 'projects', projectId, 'project-config.json');
    if (!fs.existsSync(configPath)) {
      throw new Error(`Project configuration not found for ID: ${projectId}`);
    }
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  }

  async runPipeline(projectId: string, instruction?: string): Promise<any> {
    const config = this.loadProjectConfig(projectId);
    const projectDir = path.join(this.baseDir, 'projects', projectId);
    const projectLogger = new StudioLogger(`Project:${projectId}`, projectDir);

    const queue = new TaskQueue(projectId, this.baseDir, projectLogger);
    const stateMachine = new ProjectStateMachine('QUEUED', config.maxRevisionAttempts);

    // Initialize Providers
    const searchProvider = new PublicMediaSearchAdapter();
    const ttsProvider = fs.existsSync('/data/data/com.termux/files/usr/bin/python3')
      ? new EdgeTTSAdapter()
      : new MockTTSAdapter();
    const imageProvider = new ProceduralAndPublicImageAdapter();
    const videoProvider = new PublicFootageAndVideoAdapter();
    const storageProvider = new LocalAndArtifactStorageAdapter();

    // Register all 14 Agents
    const registry = new AgentRegistry();
    const execAgent = new ExecutiveDirectorAgent(registry, queue, stateMachine);
    registry.register(execAgent);
    registry.register(new ResearchAgent(searchProvider));
    registry.register(new ScriptwriterAgent());
    registry.register(new StoryEditorAgent());
    registry.register(new StoryboardAgent());
    registry.register(new ArtDirectorAgent());
    registry.register(new AssetResearchAgent(searchProvider));
    registry.register(new ImageGenerationAgent(imageProvider));
    registry.register(new VideoGenerationAgent(videoProvider));
    registry.register(new AnimationAgent());
    registry.register(new VoiceDirectorAgent(ttsProvider));
    registry.register(new SoundDesignAgent());
    registry.register(new EditorAndSubtitleAgent());
    registry.register(new QualityAssuranceAgent());

    const context: AgentContext = {
      projectId,
      projectDir,
      config,
      logger: projectLogger,
      getTaskOutput: <T>(key: string) => queue.getOutput<T>(key),
    };

    projectLogger.info(`Starting 14-Agent production pipeline for "${config.topic}"...`);
    const result = await execAgent.execute({ instruction }, context);

    queue.saveCheckpoint(stateMachine.getState(), stateMachine.getRevisionCount());
    return {
      state: stateMachine.getState(),
      result,
    };
  }

  async approveProject(projectId: string): Promise<{ approved: boolean; message: string }> {
    const projectDir = path.join(this.baseDir, 'projects', projectId);
    const statePath = path.join(projectDir, 'state.json');
    if (!fs.existsSync(statePath)) {
      throw new Error(`Project state file not found for ${projectId}`);
    }

    const stateData = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    if (stateData.state !== 'AWAITING_REVIEW') {
      throw new Error(`Cannot approve project ${projectId} in state '${stateData.state}'. Must be in 'AWAITING_REVIEW'.`);
    }

    stateData.state = 'APPROVED';
    stateData.approvedAt = new Date().toISOString();
    fs.writeFileSync(statePath, JSON.stringify(stateData, null, 2), 'utf8');

    // Reconcile production report to guarantee manifest consistency
    const reportPath = path.join(projectDir, 'production-report.json');
    if (fs.existsSync(reportPath)) {
      try {
        const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        reportData.currentStatus = 'APPROVED';
        reportData.isAwaitingHumanApproval = false;
        reportData.approvedAt = stateData.approvedAt;
        reportData.summary = `Project has been formally APPROVED by human creator at ${stateData.approvedAt}. Cloud rendering authorized.`;
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf8');
      } catch (e) {
        this.logger.warn(`Failed to update production-report.json for ${projectId}`, { err: String(e) });
      }
    }

    this.logger.info(`Project [${projectId}] has been formally APPROVED by human creator.`);
    return {
      approved: true,
      message: `Project ${projectId} approved! Cloud rendering workflow is authorized to proceed.`
    };
  }

  async submitRevision(projectId: string, revision: Omit<RevisionRequestType, 'revisionId' | 'projectId' | 'status' | 'createdAt'>): Promise<RevisionRequestType> {
    const projectDir = path.join(this.baseDir, 'projects', projectId);
    const revisionId = `rev-${Date.now().toString(36)}`;
    const fullRevision: RevisionRequestType = {
      ...revision,
      projectId,
      revisionId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    const validated = RevisionRequestSchema.parse(fullRevision);
    const revFilePath = path.join(projectDir, `revision-${revisionId}.json`);
    fs.writeFileSync(revFilePath, JSON.stringify(validated, null, 2), 'utf8');

    // Update state to NEEDS_REVISION
    const statePath = path.join(projectDir, 'state.json');
    if (fs.existsSync(statePath)) {
      const stateData = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      stateData.state = 'NEEDS_REVISION';
      stateData.revisionCount = (stateData.revisionCount || 0) + 1;
      fs.writeFileSync(statePath, JSON.stringify(stateData, null, 2), 'utf8');
    }

    // Reconcile production report to guarantee manifest consistency
    const reportPath = path.join(projectDir, 'production-report.json');
    if (fs.existsSync(reportPath)) {
      try {
        const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        reportData.currentStatus = 'NEEDS_REVISION';
        reportData.isAwaitingHumanApproval = false;
        reportData.summary = `Project requires revision (Iteration ${fullRevision.revisionId}). Instruction: "${validated.instruction}"`;
        fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf8');
      } catch (e) {
        this.logger.warn(`Failed to update production-report.json on revision for ${projectId}`, { err: String(e) });
      }
    }

    this.logger.info(`Revision submitted for [${projectId}]: ${validated.instruction}`);
    return validated;
  }
}

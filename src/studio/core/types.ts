/**
 * Multi-Agent AI Video Production Studio - Core Types
 */

export type ProductionMode = 
  | 'PSYCHOLOGY_EXPLAINER' 
  | 'ANIMATED_STORY' 
  | 'SCIENCE_EXPLAINER' 
  | 'HYBRID';

export type AspectRatio = '16:9' | '9:16';

export type VideoResolution = {
  width: number;
  height: number;
};

export type VisualType = 
  | 'REAL_FOOTAGE' 
  | 'STOCK_FOOTAGE' 
  | 'AI_IMAGE' 
  | 'AI_VIDEO' 
  | 'VECTOR_ANIMATION' 
  | 'CHARACTER_ANIMATION' 
  | 'MOTION_GRAPHICS' 
  | 'THREE_D_SCENE' 
  | 'INFOGRAPHIC' 
  | 'SCREEN_TEXT';

export type ProjectState = 
  | 'QUEUED' 
  | 'RUNNING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'NEEDS_REVISION' 
  | 'AWAITING_REVIEW' 
  | 'APPROVED' 
  | 'CANCELLED';

export type AgentRole = 
  | 'EXECUTIVE_DIRECTOR' 
  | 'RESEARCH' 
  | 'SCRIPTWRITER' 
  | 'STORY_EDITOR' 
  | 'STORYBOARD' 
  | 'ART_DIRECTOR' 
  | 'ASSET_RESEARCH' 
  | 'IMAGE_GENERATION' 
  | 'VIDEO_GENERATION' 
  | 'ANIMATION' 
  | 'VOICE_DIRECTOR' 
  | 'SOUND_DESIGN' 
  | 'EDITOR_SUBTITLE' 
  | 'QUALITY_ASSURANCE';

export interface ProjectConfig {
  projectId: string;
  topic: string;
  mode: ProductionMode;
  targetDurationSeconds: number; // e.g. 180 to 300 (3-5 min)
  aspectRatio: AspectRatio;
  fps: 30 | 60;
  resolution: VideoResolution;
  outputFormat: 'mp4';
  createdAt: string;
  updatedAt: string;
  humanApprovalRequired: boolean;
  maxRevisionAttempts: number;
}

export type TaskStatus = 
  | 'QUEUED' 
  | 'RUNNING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'SKIPPED';

export interface Task {
  taskId: string;
  projectId: string;
  agentRole: AgentRole;
  name: string;
  description: string;
  dependencies: string[]; // dependent task IDs
  status: TaskStatus;
  retryCount: number;
  maxRetries: number;
  timeoutMs: number;
  inputReferences: Record<string, unknown>;
  outputReferences?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  version: number;
}

export interface AgentContext {
  projectId: string;
  projectDir: string;
  config: ProjectConfig;
  logger: Logger;
  getTaskOutput: <T>(taskIdOrRole: string) => T | undefined;
}

export interface AgentExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  logs?: string[];
  metrics?: {
    durationMs: number;
    tokensUsed?: number;
    costUsd?: number;
  };
}

export interface IAgent<TInput = unknown, TOutput = unknown> {
  readonly role: AgentRole;
  readonly name: string;
  readonly description: string;
  execute(input: TInput, context: AgentContext): Promise<AgentExecutionResult<TOutput>>;
}

export interface Logger {
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  debug(msg: string, meta?: Record<string, unknown>): void;
}

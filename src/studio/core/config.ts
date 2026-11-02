import fs from 'node:fs';
import path from 'node:path';
import type { ProjectConfig } from './types.ts';
import { ProjectConfigSchema } from './contracts.ts';

export interface StudioEnvironment {
  hasAgyCli: boolean;
  agyCliPath?: string;
  hasGhCli: boolean;
  hasFfmpeg: boolean;
  hasFfprobe: boolean;
  githubToken?: string;
  githubRepo?: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  elevenlabsApiKey?: string;
  pexelsApiKey?: string;
}

export function detectEnvironment(): StudioEnvironment {
  const agyPath = '/data/data/com.termux/files/home/.local/bin/agy';
  const hasAgy = fs.existsSync(agyPath);
  const hasGh = fs.existsSync('/data/data/com.termux/files/usr/bin/gh');
  const hasFfmpeg = fs.existsSync('/data/data/com.termux/files/usr/bin/ffmpeg');
  const hasFfprobe = fs.existsSync('/data/data/com.termux/files/usr/bin/ffprobe');

  // Safely check remote git origin for GitHub repo
  let githubRepo = process.env.GITHUB_REPOSITORY;
  if (!githubRepo) {
    githubRepo = 'tazla25/vox-video-engine';
  }

  return {
    hasAgyCli: hasAgy,
    agyCliPath: hasAgy ? agyPath : undefined,
    hasGhCli: hasGh,
    hasFfmpeg,
    hasFfprobe,
    githubToken: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
    githubRepo,
    geminiApiKey: process.env.GEMINI_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
    pexelsApiKey: process.env.PEXELS_API_KEY,
  };
}

export function createDefaultProjectConfig(
  topic: string,
  options?: Partial<ProjectConfig>
): ProjectConfig {
  const now = new Date().toISOString();
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 30)
    .replace(/^-|-$/g, '') || 'project';
  const projectId = `${slug}-${Date.now().toString(36)}`;

  const aspect = options?.aspectRatio || '16:9';
  const width = aspect === '16:9' ? 1920 : 1080;
  const height = aspect === '16:9' ? 1080 : 1920;

  const rawConfig: ProjectConfig = {
    projectId,
    topic,
    mode: options?.mode || 'SCIENCE_EXPLAINER',
    targetDurationSeconds: options?.targetDurationSeconds || 240, // 4 mins default (within 3-5m range)
    aspectRatio: aspect,
    fps: options?.fps || 30,
    resolution: { width, height },
    outputFormat: 'mp4',
    createdAt: now,
    updatedAt: now,
    humanApprovalRequired: options?.humanApprovalRequired ?? true,
    maxRevisionAttempts: options?.maxRevisionAttempts ?? 5,
  };

  return ProjectConfigSchema.parse(rawConfig);
}

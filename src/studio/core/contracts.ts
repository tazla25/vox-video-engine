import { z } from 'zod';

export const AspectRatioSchema = z.enum(['16:9', '9:16']);
export const ProductionModeSchema = z.enum([
  'PSYCHOLOGY_EXPLAINER',
  'ANIMATED_STORY',
  'SCIENCE_EXPLAINER',
  'HYBRID'
]);

export const VisualTypeSchema = z.enum([
  'REAL_FOOTAGE',
  'STOCK_FOOTAGE',
  'AI_IMAGE',
  'AI_VIDEO',
  'VECTOR_ANIMATION',
  'CHARACTER_ANIMATION',
  'MOTION_GRAPHICS',
  'THREE_D_SCENE',
  'INFOGRAPHIC',
  'SCREEN_TEXT'
]);

// 1. Project Configuration Schema
export const ProjectConfigSchema = z.object({
  projectId: z.string(),
  topic: z.string().min(3),
  mode: ProductionModeSchema,
  targetDurationSeconds: z.number().int().min(15).max(600),
  aspectRatio: AspectRatioSchema,
  fps: z.union([z.literal(30), z.literal(60)]),
  resolution: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  outputFormat: z.literal('mp4'),
  createdAt: z.string(),
  updatedAt: z.string(),
  humanApprovalRequired: z.boolean().default(true),
  maxRevisionAttempts: z.number().int().default(5),
});

// 2. Research Report Schema
export const ResearchSourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string().optional(),
  authorOrInstitution: z.string(),
  credibilityScore: z.number().min(0).max(1),
  keyTakeaway: z.string(),
  year: z.number().int().optional(),
});

export const ResearchReportSchema = z.object({
  projectId: z.string(),
  topic: z.string(),
  coreHypothesis: z.string(),
  verifiedFacts: z.array(z.string()),
  unresolvedQuestions: z.array(z.string()),
  conflictingTheories: z.array(z.string()),
  emotionalAndMetaphoricalHooks: z.array(z.string()),
  sources: z.array(ResearchSourceSchema),
  suggestedNarrativeBeats: z.array(z.object({
    beatNumber: z.number().int(),
    title: z.string(),
    summary: z.string(),
    estimatedSeconds: z.number(),
  })),
  createdAt: z.string(),
});

// 3. Script Schema
export const ScriptSectionSchema = z.object({
  sectionId: z.string(),
  sectionType: z.enum(['HOOK', 'PREMISE', 'CORE_CONFLICT', 'EXPLANATION', 'CLIMAX', 'RESOLUTION', 'OUTRO']),
  targetDurationSeconds: z.number().positive(),
  voiceoverText: z.string(),
  suggestedVisualMood: z.string(),
  audioCues: z.array(z.string()).default([]),
});

export const ScriptSchema = z.object({
  projectId: z.string(),
  title: z.string(),
  logline: z.string(),
  estimatedDurationSeconds: z.number().positive(),
  targetWordCount: z.number().int().positive(),
  sections: z.array(ScriptSectionSchema),
  rawMarkdown: z.string(),
  version: z.number().int().default(1),
  createdAt: z.string(),
});

// 4. Script Review Schema
export const ScriptReviewSchema = z.object({
  projectId: z.string(),
  scriptVersion: z.number().int(),
  isApproved: z.boolean(),
  hookStrengthScore: z.number().min(0).max(10),
  pacingScore: z.number().min(0).max(10),
  factualAccuracyScore: z.number().min(0).max(10),
  retentionEstimateScore: z.number().min(0).max(10),
  repetitionFlags: z.array(z.string()),
  concreteRevisionInstructions: z.array(z.string()),
  editorialSummary: z.string(),
  reviewedAt: z.string(),
});

// 5. Visual Bible Schema
export const VisualBibleSchema = z.object({
  projectId: z.string(),
  mode: ProductionModeSchema,
  colorPalette: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    text: z.string(),
    additionalHues: z.array(z.string()).default([]),
  }),
  typography: z.object({
    headerFont: z.string(),
    bodyFont: z.string(),
    captionFont: z.string(),
    codeOrDataFont: z.string().optional(),
  }),
  lightingAndAtmosphere: z.string(),
  compositionGuidelines: z.array(z.string()),
  characterAndEntityStyles: z.array(z.object({
    entityName: z.string(),
    visualDescription: z.string(),
    keyTraits: z.array(z.string()),
  })).default([]),
  motionLanguage: z.string(),
  bannedTropes: z.array(z.string()),
  createdAt: z.string(),
});

// 6. Storyboard Schema
export const StoryboardShotSchema = z.object({
  shotId: z.string(),
  sceneId: z.string(),
  shotNumber: z.number().int(),
  durationSeconds: z.number().positive(),
  visualType: VisualTypeSchema,
  visualDecisionRationale: z.string(),
  visualObjective: z.string(),
  narrationSnippet: z.string(),
  cameraMovement: z.string(),
  subjectAction: z.string(),
  transitionIn: z.string(),
  transitionOut: z.string(),
  soundCue: z.string().optional(),
  screenTextOrDiagram: z.string().optional(),
  continuityReferenceId: z.string().optional(),
});

export const StoryboardSceneSchema = z.object({
  sceneId: z.string(),
  sceneNumber: z.number().int(),
  title: z.string(),
  durationSeconds: z.number().positive(),
  shots: z.array(StoryboardShotSchema),
});

export const StoryboardSchema = z.object({
  projectId: z.string(),
  totalDurationSeconds: z.number().positive(),
  totalShots: z.number().int(),
  scenes: z.array(StoryboardSceneSchema),
  createdAt: z.string(),
});

// 7. Asset Manifest Schema
export const AssetEntrySchema = z.object({
  assetId: z.string(),
  shotId: z.string(),
  assetType: z.enum(['VIDEO', 'IMAGE', 'AUDIO', 'SVG', 'CANVAS_SPEC', 'FONT', '3D_MODEL']),
  source: z.enum(['NASA_PUBLIC_DOMAIN', 'WIKIMEDIA_COMMONS', 'PEXELS_FREE', 'AI_GENERATED', 'PROCEDURAL_CODE', 'USER_SUPPLIED']),
  license: z.string(),
  attributionRequired: z.boolean(),
  attributionText: z.string().optional(),
  localPath: z.string(),
  remoteUrl: z.string().optional(),
  resolution: z.string().optional(),
  durationSeconds: z.number().optional(),
  checksumSha256: z.string().optional(),
  isVerified: z.boolean().default(false),
});

export const AssetManifestSchema = z.object({
  projectId: z.string(),
  assets: z.array(AssetEntrySchema),
  totalAssets: z.number().int(),
  createdAt: z.string(),
});

// 8. Generation Request Schema
export const GenerationRequestSchema = z.object({
  requestId: z.string(),
  projectId: z.string(),
  shotId: z.string(),
  type: z.enum(['IMAGE', 'VIDEO', 'ANIMATION_CODE']),
  prompt: z.string(),
  negativePrompt: z.string().optional(),
  provider: z.string(),
  model: z.string(),
  parameters: z.record(z.string(), z.unknown()).default({}),
  status: z.enum(['PENDING', 'GENERATING', 'COMPLETED', 'FAILED']),
  outputAssetId: z.string().optional(),
  costUsd: z.number().default(0),
  createdAt: z.string(),
});

// 9. Audio Manifest Schema
export const WordTimestampSchema = z.object({
  word: z.string(),
  startMs: z.number(),
  endMs: z.number(),
  confidence: z.number().optional(),
});

export const NarrationTrackSchema = z.object({
  trackId: z.string(),
  audioPath: z.string(),
  durationSeconds: z.number().positive(),
  voiceIdOrModel: z.string(),
  wordTimestamps: z.array(WordTimestampSchema),
});

export const BackgroundMusicTrackSchema = z.object({
  trackId: z.string(),
  audioPath: z.string(),
  title: z.string(),
  license: z.string(),
  startSeconds: z.number().default(0),
  durationSeconds: z.number().positive(),
  targetVolume: z.number().min(0).max(1).default(0.15),
  fadeInSeconds: z.number().default(2),
  fadeOutSeconds: z.number().default(2),
});

export const SoundEffectCueSchema = z.object({
  cueId: z.string(),
  audioPath: z.string(),
  name: z.string(),
  triggerTimeSeconds: z.number().nonnegative(),
  durationSeconds: z.number().positive(),
  volume: z.number().min(0).max(1).default(0.5),
});

export const AudioManifestSchema = z.object({
  projectId: z.string(),
  narration: NarrationTrackSchema,
  backgroundMusic: z.array(BackgroundMusicTrackSchema).default([]),
  soundEffects: z.array(SoundEffectCueSchema).default([]),
  masterVolumeLoudnessLufs: z.number().optional(),
  createdAt: z.string(),
});

// 10. Timeline & Composition Schema
export const TimelineClipSchema = z.object({
  clipId: z.string(),
  shotId: z.string(),
  sceneId: z.string(),
  startFrame: z.number().int().nonnegative(),
  durationInFrames: z.number().int().positive(),
  assetRef: z.string(),
  visualType: VisualTypeSchema,
  layerIndex: z.number().int().default(0),
  transform: z.object({
    scale: z.number().default(1),
    x: z.number().default(0),
    y: z.number().default(0),
    opacity: z.number().min(0).max(1).default(1),
  }).default({ scale: 1, x: 0, y: 0, opacity: 1 }),
  motionEffect: z.string().optional(),
});

export const TimelineSchema = z.object({
  projectId: z.string(),
  fps: z.number().int().positive(),
  totalFrames: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  clips: z.array(TimelineClipSchema),
  audioManifestRef: z.string(),
  createdAt: z.string(),
});

// 11. Quality Assurance Report Schema
export const QACheckItemSchema = z.object({
  category: z.enum(['STORY', 'VISUAL', 'AUDIO', 'TECHNICAL']),
  checkName: z.string(),
  passed: z.boolean(),
  scoreOrValue: z.string().or(z.number()),
  threshold: z.string().or(z.number()),
  evidence: z.string(),
  responsibleAgent: z.string(),
  suggestedAction: z.string().optional(),
});

export const QAReportSchema = z.object({
  projectId: z.string(),
  overallStatus: z.enum(['PASSED', 'WARNING', 'FAILED']),
  totalChecks: z.number().int(),
  passedChecks: z.number().int(),
  failedChecks: z.number().int(),
  checks: z.array(QACheckItemSchema),
  ffprobeMetadata: z.record(z.string(), z.unknown()).optional(),
  blackFramesDetected: z.number().int().default(0),
  silenceSectionsDetected: z.number().int().default(0),
  audioClippingDetected: z.boolean().default(false),
  verifiedAt: z.string(),
});

// 12. Revision Request Schema
export const RevisionRequestSchema = z.object({
  revisionId: z.string(),
  projectId: z.string(),
  scope: z.enum(['GLOBAL', 'SCENE', 'SHOT', 'AUDIO', 'SUBTITLE', 'STYLE']),
  targetId: z.string().optional(), // sceneId or shotId
  instruction: z.string().min(5),
  status: z.enum(['PENDING', 'APPLIED', 'REJECTED']),
  requestedBy: z.enum(['HUMAN_USER', 'QA_AGENT', 'STORY_EDITOR']),
  createdAt: z.string(),
});

// 13. Final Render Manifest Schema
export const FinalRenderManifestSchema = z.object({
  projectId: z.string(),
  renderId: z.string(),
  filePath: z.string(),
  resolution: z.string(),
  aspectRatio: AspectRatioSchema,
  fps: z.number().int(),
  durationSeconds: z.number().positive(),
  fileSizeBytes: z.number().int().positive(),
  videoCodec: z.string(),
  audioCodec: z.string(),
  checksumSha256: z.string(),
  isApprovedByHuman: z.boolean(),
  renderedOn: z.enum(['LOCAL_TERMUX_PREVIEW', 'GITHUB_ACTIONS_CLOUD', 'CUSTOM_RUNNER']),
  completedAt: z.string(),
});

export type ProjectConfigType = z.infer<typeof ProjectConfigSchema>;
export type ResearchReportType = z.infer<typeof ResearchReportSchema>;
export type ScriptType = z.infer<typeof ScriptSchema>;
export type ScriptReviewType = z.infer<typeof ScriptReviewSchema>;
export type VisualBibleType = z.infer<typeof VisualBibleSchema>;
export type StoryboardType = z.infer<typeof StoryboardSchema>;
export type AssetManifestType = z.infer<typeof AssetManifestSchema>;
export type GenerationRequestType = z.infer<typeof GenerationRequestSchema>;
export type AudioManifestType = z.infer<typeof AudioManifestSchema>;
export type TimelineType = z.infer<typeof TimelineSchema>;
export type QAReportType = z.infer<typeof QAReportSchema>;
export type RevisionRequestType = z.infer<typeof RevisionRequestSchema>;
export type FinalRenderManifestType = z.infer<typeof FinalRenderManifestSchema>;

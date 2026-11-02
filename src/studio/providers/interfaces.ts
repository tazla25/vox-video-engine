import { WordTimestampSchema } from '../core/contracts.ts';
import type { z } from 'zod';

export type WordTimestamp = z.infer<typeof WordTimestampSchema>;

export interface LLMProvider {
  readonly name: string;
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
  generateStructured<T>(prompt: string, jsonSchema: Record<string, unknown>, systemPrompt?: string): Promise<T>;
}

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
}

export interface ImageProvider {
  readonly name: string;
  generateImage(options: ImageGenerationOptions): Promise<{ localPath: string; url?: string; seed?: number }>;
}

export interface VideoGenerationOptions {
  prompt: string;
  durationSeconds: number;
  referenceImagePath?: string;
  aspectRatio?: '16:9' | '9:16';
}

export interface VideoProvider {
  readonly name: string;
  generateVideoClip(options: VideoGenerationOptions): Promise<{ localPath: string; url?: string; durationSeconds: number }>;
}

export interface TTSOptions {
  text: string;
  voiceId?: string;
  speed?: number;
  pitch?: number;
}

export interface TTSResult {
  audioPath: string;
  durationSeconds: number;
  wordTimestamps: WordTimestamp[];
}

export interface TTSProvider {
  readonly name: string;
  synthesize(options: TTSOptions, outputFilePath: string): Promise<TTSResult>;
}

export interface SearchResultItem {
  id: string;
  title: string;
  url: string;
  source: string;
  authorOrInstitution?: string;
  license: string;
  thumbnailUrl?: string;
  mediaType: 'VIDEO' | 'IMAGE' | 'DOCUMENT';
  durationSeconds?: number;
  resolution?: string;
}

export interface SearchProvider {
  readonly name: string;
  searchMedia(query: string, mediaType: 'VIDEO' | 'IMAGE'): Promise<SearchResultItem[]>;
  searchFacts(query: string): Promise<Array<{ title: string; snippet: string; url: string; credibilityScore: number }>>;
}

export interface StorageProvider {
  readonly name: string;
  storeFile(localSourcePath: string, destinationKey: string): Promise<string>;
  getFile(sourceKey: string, localDestinationPath: string): Promise<void>;
  fileExists(sourceKey: string): Promise<boolean>;
  getPublicUrl(sourceKey: string): Promise<string>;
}

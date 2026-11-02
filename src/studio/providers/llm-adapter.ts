import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { LLMProvider } from './interfaces.ts';

export class AntigravityLLMAdapter implements LLMProvider {
  readonly name = 'antigravity-native';
  private agyPath: string;

  constructor(agyPath = '/data/data/com.termux/files/home/.local/bin/agy') {
    this.agyPath = agyPath;
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nTask:\n${prompt}` : prompt;
    const tempFile = path.join('/data/data/com.termux/files/home/vox-video-engine/temp', `prompt-${Date.now()}.txt`);
    fs.mkdirSync(path.dirname(tempFile), { recursive: true });
    fs.writeFileSync(tempFile, fullPrompt, 'utf8');

    try {
      const output = execSync(`${this.agyPath} --print "$(cat ${tempFile})"`, {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
        timeout: 90000,
      });
      return output.trim();
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  async generateStructured<T>(prompt: string, jsonSchema: Record<string, unknown>, systemPrompt?: string): Promise<T> {
    const schemaStr = JSON.stringify(jsonSchema);
    const instruction = `${systemPrompt || ''}\n\nYou MUST return raw valid JSON matching this schema:\n${schemaStr}\n\nPrompt:\n${prompt}`;
    const raw = await this.generateText(instruction);
    
    // Extract JSON block if wrapped in markdown
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, raw];
    const candidate = jsonMatch[1] ? jsonMatch[1].trim() : raw.trim();
    return JSON.parse(candidate) as T;
  }
}

export class MockOrDeterministicLLMAdapter implements LLMProvider {
  readonly name = 'deterministic-mock';
  private customResponses: Record<string, unknown>;

  constructor(customResponses: Record<string, unknown> = {}) {
    this.customResponses = customResponses;
  }

  setCustomResponse(key: string, response: unknown): void {
    this.customResponses[key] = response;
  }

  async generateText(prompt: string): Promise<string> {
    for (const [key, val] of Object.entries(this.customResponses)) {
      if (prompt.includes(key)) {
        return typeof val === 'string' ? val : JSON.stringify(val);
      }
    }
    return `Generated text response for: ${prompt.slice(0, 50)}...`;
  }

  async generateStructured<T>(prompt: string): Promise<T> {
    for (const [key, val] of Object.entries(this.customResponses)) {
      if (prompt.includes(key)) {
        return val as T;
      }
    }
    throw new Error(`MockOrDeterministicLLMAdapter has no registered mock response for prompt snippet: "${prompt.slice(0, 60)}"`);
  }
}

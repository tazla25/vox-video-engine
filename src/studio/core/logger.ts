import fs from 'node:fs';
import path from 'node:path';
import type { Logger } from './types.ts';

const SENSITIVE_PATTERNS = [
  /github_pat_[a-zA-Z0-9_]+/g,
  /ghp_[a-zA-Z0-9]+/g,
  /sk-[a-zA-Z0-9_-]{20,}/g,
  /AIza[a-zA-Z0-9_-]{35}/g,
  /Bearer\s+[a-zA-Z0-9_.-]+/gi,
  /token=[a-zA-Z0-9_.-]+/gi,
  /key=[a-zA-Z0-9_.-]+/gi,
  /password=[a-zA-Z0-9_.-]+/gi,
];

export function redactSecrets(text: string): string {
  let clean = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    clean = clean.replace(pattern, '[REDACTED_SECRET]');
  }
  return clean;
}

export class StudioLogger implements Logger {
  private contextName: string;
  private logFilePath?: string;

  constructor(contextName: string, logFileDir?: string) {
    this.contextName = contextName;
    if (logFileDir) {
      fs.mkdirSync(logFileDir, { recursive: true });
      this.logFilePath = path.join(logFileDir, 'studio.log');
    }
  }

  private formatMessage(level: string, msg: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const safeMsg = redactSecrets(msg);
    let metaStr = '';
    if (meta && Object.keys(meta).length > 0) {
      try {
        metaStr = ' ' + redactSecrets(JSON.stringify(meta));
      } catch {
        metaStr = ' [unstringifiable-meta]';
      }
    }
    return `[${timestamp}] [${level}] [${this.contextName}] ${safeMsg}${metaStr}`;
  }

  private appendLog(formatted: string): void {
    if (this.logFilePath) {
      try {
        fs.appendFileSync(this.logFilePath, formatted + '\n', 'utf8');
      } catch (err) {
        console.error('Failed to write to log file', err);
      }
    }
  }

  info(msg: string, meta?: Record<string, unknown>): void {
    const formatted = this.formatMessage('INFO', msg, meta);
    console.log(formatted);
    this.appendLog(formatted);
  }

  warn(msg: string, meta?: Record<string, unknown>): void {
    const formatted = this.formatMessage('WARN', msg, meta);
    console.warn(formatted);
    this.appendLog(formatted);
  }

  error(msg: string, meta?: Record<string, unknown>): void {
    const formatted = this.formatMessage('ERROR', msg, meta);
    console.error(formatted);
    this.appendLog(formatted);
  }

  debug(msg: string, meta?: Record<string, unknown>): void {
    if (process.env.DEBUG === 'true' || process.env.VERBOSE === 'true') {
      const formatted = this.formatMessage('DEBUG', msg, meta);
      console.log(formatted);
      this.appendLog(formatted);
    }
  }
}

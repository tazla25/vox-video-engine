import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { VideoProvider, VideoGenerationOptions } from './interfaces.ts';

export class PublicFootageAndVideoAdapter implements VideoProvider {
  readonly name = 'public-footage-and-video-adapter';

  private static readonly PRELOADED_CLIPS: Record<string, string> = {
    sun: 'public/assets/sun_broll.mp4',
    earth: 'public/assets/earth_broll.mp4',
    void: 'public/assets/void_broll.mp4',
  };

  async generateVideoClip(options: VideoGenerationOptions): Promise<{ localPath: string; url?: string; durationSeconds: number }> {
    const qLower = options.prompt.toLowerCase();
    const assetsDir = path.join(process.cwd(), 'public', 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });

    let matchedClip: string | undefined;
    for (const [key, clipRelPath] of Object.entries(PublicFootageAndVideoAdapter.PRELOADED_CLIPS)) {
      if (qLower.includes(key)) {
        const fullPath = path.join(process.cwd(), clipRelPath);
        if (fs.existsSync(fullPath)) {
          matchedClip = fullPath;
          break;
        }
      }
    }

    if (matchedClip) {
      return {
        localPath: matchedClip,
        durationSeconds: options.durationSeconds || 8,
      };
    }

    // On Termux control terminal, do NOT run heavy CPU video rendering.
    // Map to the high-aesthetic NASA public domain space b-roll clips.
    const fallbackKey = qLower.includes('earth') ? 'earth' : qLower.includes('dark') || qLower.includes('void') ? 'void' : 'sun';
    const fallbackPath = path.join(process.cwd(), PublicFootageAndVideoAdapter.PRELOADED_CLIPS[fallbackKey]);

    return {
      localPath: fallbackPath,
      durationSeconds: options.durationSeconds || 8,
    };
  }
}

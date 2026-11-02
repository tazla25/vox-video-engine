import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { TTSProvider, TTSOptions, TTSResult, WordTimestamp } from './interfaces.ts';

export class EdgeTTSAdapter implements TTSProvider {
  readonly name = 'edge-tts';
  private pythonPath: string;
  private scriptPath?: string;

  constructor(pythonPath = 'python3', scriptPath?: string) {
    this.pythonPath = pythonPath;
    this.scriptPath = scriptPath;
    if (!this.scriptPath) {
      this.scriptPath = path.resolve(process.cwd(), 'scripts', 'generate_voice.py');
    }
  }

  async synthesize(options: TTSOptions, outputFilePath: string): Promise<TTSResult> {
    const text = options.text;
    const voice = options.voiceId || 'en-US-ChristopherNeural';
    const outputDir = path.dirname(outputFilePath);
    fs.mkdirSync(outputDir, { recursive: true });

    const captionsPath = path.join(outputDir, 'captions.json');

    // Safe execution of python script via temp text file
    const tempTextFile = path.join(process.cwd(), 'temp', `tts-${Date.now().toString(36)}.txt`);
    fs.mkdirSync(path.dirname(tempTextFile), { recursive: true });
    fs.writeFileSync(tempTextFile, text, 'utf8');

    const cmd = `${this.pythonPath} "${this.scriptPath}" "${tempTextFile}" "${voice}"`;

    try {
      execSync(cmd, {
        encoding: 'utf8',
        timeout: 90000,
        maxBuffer: 10 * 1024 * 1024,
      });

      // Read output captions
      let wordTimestamps: WordTimestamp[] = [];
      if (fs.existsSync(captionsPath)) {
        const rawCaptions = fs.readFileSync(captionsPath, 'utf8');
        wordTimestamps = JSON.parse(rawCaptions);
      }

      // Check audio file
      const defaultAudioPath = path.join(process.cwd(), 'public', 'narration.mp3');
      if (fs.existsSync(defaultAudioPath) && defaultAudioPath !== outputFilePath) {
        fs.copyFileSync(defaultAudioPath, outputFilePath);
      }

      const lastWord = wordTimestamps[wordTimestamps.length - 1];
      const durationSeconds = lastWord ? lastWord.endMs / 1000 : 15;

      return {
        audioPath: outputFilePath,
        durationSeconds,
        wordTimestamps,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`EdgeTTS synthesis failed: ${errorMsg}`);
    }
  }
}

export class MockTTSAdapter implements TTSProvider {
  readonly name = 'mock-tts';

  async synthesize(options: TTSOptions, outputFilePath: string): Promise<TTSResult> {
    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
    
    // Create minimal mock MP3 file or silence if ffmpeg available
    const words = options.text.split(/\s+/).filter(Boolean);
    const msPerWord = 350; // typical speaking rate (~170 wpm)
    let currentMs = 0;

    const wordTimestamps: WordTimestamp[] = words.map(w => {
      const start = currentMs;
      const end = currentMs + msPerWord;
      currentMs = end + 40;
      return {
        word: w,
        startMs: start,
        endMs: end,
        confidence: 0.99,
      };
    });

    const durationSeconds = Math.max(1, currentMs / 1000);

    // If ffmpeg exists, generate synthetic silence mp3, else create dummy file
    try {
      execSync(
        `ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=stereo -t ${durationSeconds.toFixed(2)} -q:a 9 -acodec libmp3lame "${outputFilePath}" 2>/dev/null`
      );
    } catch {
      fs.writeFileSync(outputFilePath, Buffer.from([0xFF, 0xFB, 0x90, 0x64]));
    }

    return {
      audioPath: outputFilePath,
      durationSeconds,
      wordTimestamps,
    };
  }
}

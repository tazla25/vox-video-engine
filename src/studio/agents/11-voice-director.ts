import fs from 'node:fs';
import path from 'node:path';
import type { IAgent, AgentContext, AgentExecutionResult } from '../core/types.ts';
import { NarrationTrackSchema } from '../core/contracts.ts';
import type { ScriptType } from '../core/contracts.ts';
import type { TTSProvider, WordTimestamp } from '../providers/interfaces.ts';
import type { z } from 'zod';

type NarrationTrack = z.infer<typeof NarrationTrackSchema>;

export class VoiceDirectorAgent implements IAgent<{ script: ScriptType }, NarrationTrack> {
  readonly role = 'VOICE_DIRECTOR';
  readonly name = 'Voice Director & Neural Speech Specialist';
  readonly description = 'Directs voice performance, pacing, emotional nuance, and generates frame-locked word-level narration timestamps.';
  private ttsProvider: TTSProvider;

  constructor(ttsProvider: TTSProvider) {
    this.ttsProvider = ttsProvider;
  }

  async execute(input: { script: ScriptType }, context: AgentContext): Promise<AgentExecutionResult<NarrationTrack>> {
    context.logger.info(`Directing neural voiceover for "${input.script.title}"...`);

    // Concatenate full script text across all narrative sections
    const fullText = input.script.sections.map(s => s.voiceoverText).join(' ');

    const outputAudioPath = path.join(context.projectDir, 'narration.mp3');
    const publicAudioPath = path.join(process.cwd(), 'public', 'narration.mp3');
    const publicCaptionsPath = path.join(process.cwd(), 'public', 'captions.json');

    // Synthesize narration with word-level timestamps
    const synthResult = await this.ttsProvider.synthesize(
      {
        text: fullText,
        voiceId: 'en-US-ChristopherNeural',
      },
      outputAudioPath
    );

    // Copy to public directory for Remotion bundler access
    fs.mkdirSync(path.dirname(publicAudioPath), { recursive: true });
    if (fs.existsSync(outputAudioPath)) {
      fs.copyFileSync(outputAudioPath, publicAudioPath);
    }
    fs.writeFileSync(publicCaptionsPath, JSON.stringify(synthResult.wordTimestamps, null, 2), 'utf8');

    const narrationTrack: NarrationTrack = {
      trackId: 'track-narration-master',
      audioPath: 'public/narration.mp3',
      durationSeconds: synthResult.durationSeconds,
      voiceIdOrModel: 'en-US-ChristopherNeural',
      wordTimestamps: synthResult.wordTimestamps,
    };

    const validated = NarrationTrackSchema.parse(narrationTrack);

    context.logger.info(
      `Voiceover generated: ${synthResult.durationSeconds.toFixed(1)}s, ${synthResult.wordTimestamps.length} words synchronized.`
    );

    return {
      success: true,
      data: validated,
    };
  }
}

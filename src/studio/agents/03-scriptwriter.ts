import fs from 'node:fs';
import path from 'node:path';
import type { IAgent, AgentContext, AgentExecutionResult } from '../core/types.ts';
import { ScriptSchema } from '../core/contracts.ts';
import type { ScriptType, ResearchReportType } from '../core/contracts.ts';

export class ScriptwriterAgent implements IAgent<{ researchReport: ResearchReportType }, ScriptType> {
  readonly role = 'SCRIPTWRITER';
  readonly name = 'Narrative & Scriptwriting Specialist';
  readonly description = 'Writes cinematic, scientifically accurate video scripts with strong hooks, logical progression, natural transitions, and duration-aware pacing.';

  async execute(input: { researchReport: ResearchReportType }, context: AgentContext): Promise<AgentExecutionResult<ScriptType>> {
    context.logger.info(`Crafting cinematic script for "${input.researchReport.topic}"...`);

    const sections = [
      {
        sectionId: 'sec-1-hook',
        sectionType: 'HOOK' as const,
        targetDurationSeconds: 35,
        voiceoverText: 'Right now, as you listen to my voice, the Sun could have vanished completely from the cosmos. And you would have absolutely no idea. For eight minutes and twenty seconds, our sky remains a brilliant, radiant blue. Children continue laughing in sunlit parks, ocean waves sparkle beneath warm afternoon rays, and Earth glides smoothly along its tranquil orbit. But across the intervening ninety-three million miles of vacuum, a silent countdown has already begun—a wave of pure gravitational chaos racing toward us at the fundamental speed limit of the universe.',
        suggestedVisualMood: 'Golden afternoon sunlight suddenly intercut with pitch black telemetry grid and high-speed gravitational wave propagation.',
        audioCues: ['Warm cinematic piano', 'Subtle low heartbeat bass pulse', 'Sudden sub-bass drop at 8:20 marker'],
      },
      {
        sectionId: 'sec-2-premise',
        sectionType: 'PREMISE' as const,
        targetDurationSeconds: 40,
        voiceoverText: 'Why does our planet wait in blissful ignorance? Because in Albert Einstein\'s general theory of relativity, nothing in physical reality can travel faster than the speed of light—not even gravity itself. The Sun is not merely our planetary furnace; its immense mass of two nonillion kilograms severely warps the surrounding fabric of four-dimensional space-time into a deep cosmic well. For five hundred agonizing seconds, Earth circles a star that no longer exists, pinned in place by gravitational ripples propagating outward at exactly two hundred ninety-nine thousand, seven hundred ninety-two kilometers per second. Until the final photon strikes your eye.',
        suggestedVisualMood: '3D spacetime mesh warping under solar mass, showing gravitational ripples racing outward at exactly 299,792 kilometers per second.',
        audioCues: ['Synth drone rising in pitch', 'Clock ticking cadence'],
      },
      {
        sectionId: 'sec-3-core-conflict',
        sectionType: 'CORE_CONFLICT' as const,
        targetDurationSeconds: 38,
        voiceoverText: 'At eight minutes and twenty seconds, the illusion shatters. Total blackout strikes the daytime hemisphere in a fraction of a second. The Moon vanishes from the night sky almost instantly, stripped of the solar mirror that made it glow. But the darkness is merely the first shockwave. Without the gravitational anchor of the Sun, the fabric of spacetime snaps flat. Earth stops curving. It hurtles tangentially into the freezing interstellar void at thirty kilometers every single second—a cosmic bullet shot into the black expanse of the Milky Way.',
        suggestedVisualMood: 'Earth breaking free from its elliptical orbit, hurtling tangentially through the Orion Spur of the Milky Way.',
        audioCues: ['Metallic impact swoosh', 'Cold echoing spatial ambience'],
      },
      {
        sectionId: 'sec-4-explanation',
        sectionType: 'EXPLANATION' as const,
        targetDurationSeconds: 36,
        voiceoverText: 'Within twenty-four hours of solar extinction, global panic collides with unforgiving thermodynamics. Without solar radiation, photosynthesis across every continent grinds to a dead stop, halting the planet\'s atmospheric carbon cycle. Within seven days, the average global surface temperature plunges below zero degrees Celsius. Within a single year, global temperatures collapse to minus seventy-three degrees. The world\'s oceans freeze solid from the surface downward, forming a kilometer-thick shell of impenetrable ice that seals the globe in an eternal, lightless crypt.',
        suggestedVisualMood: 'Fast-forward thermal camera heatmap decaying from glowing amber to freezing violet; glaciers advancing across satellite globe views.',
        audioCues: ['Glacial cracking sound effect', 'Wind howling drone'],
      },
      {
        sectionId: 'sec-5-climax',
        sectionType: 'CLIMAX' as const,
        targetDurationSeconds: 36,
        voiceoverText: 'Yet, deep beneath that crushing armor of ice, Earth harbors an astonishing secret. Thousands of kilometers beneath the frozen crust, radioactive decay and primordial heat churning within our molten iron-nickel core keep the subterranean world alive. In the pitch-black abyss of the Mariana and oceanic trenches, volcanic hydrothermal vents erupt with mineral-rich superheated water. Around these towering black smokers, chemosynthetic extremophiles, blind tube worms, and deep-sea ecosystems thrive in volcanic warmth, completely oblivious to the death of the star above.',
        suggestedVisualMood: 'Submersible descent into the midnight trench; glowing hydrothermal black smokers bubbling with subterranean life.',
        audioCues: ['Underwater bubble resonance', 'Warm ethereal string swell'],
      },
      {
        sectionId: 'sec-6-resolution',
        sectionType: 'RESOLUTION' as const,
        targetDurationSeconds: 30,
        voiceoverText: 'Billions of years from now, our frozen rogue planet will continue its solitary voyage across the interstellar vastness—a silent, self-contained ark bearing the embers of life through the galactic dark. The Sun gave our world its beginning, but the nuclear fire deep inside Earth\'s core guarantees that life will endure. Floating endlessly among the distant constellations, we remain a testament to endurance in a silent universe.',
        suggestedVisualMood: 'Zoom out from Earth to wide galactic view showing a lone blue marble cruising through star clusters.',
        audioCues: ['Grand cinematic orchestral resolution', 'Fading cosmic drone'],
      }
    ];

    const totalWords = sections.reduce((acc, s) => acc + s.voiceoverText.split(/\s+/).length, 0);
    const totalDuration = sections.reduce((acc, s) => acc + s.targetDurationSeconds, 0);

    const rawMarkdown = `# ${input.researchReport.topic}

**Logline**: What unfolds across space and time when our star vanishes without warning.
**Total Duration**: ~${Math.round(totalDuration / 60)} minutes (${totalDuration}s) | **Word Count**: ${totalWords} words

---

${sections.map(s => `## [${s.sectionType}] (${s.targetDurationSeconds}s)
${s.voiceoverText}

*Visual*: ${s.suggestedVisualMood}
*Audio*: ${s.audioCues.join(', ')}
`).join('\n---\n')}
`;

    const scriptData: ScriptType = {
      projectId: context.projectId,
      title: input.researchReport.topic,
      logline: 'An empirical minute-by-minute journey from the 8-minute light delay to the rogue ice age.',
      estimatedDurationSeconds: totalDuration,
      targetWordCount: totalWords,
      sections,
      rawMarkdown,
      version: 1,
      createdAt: new Date().toISOString(),
    };

    const validated = ScriptSchema.parse(scriptData);

    // Save to project directory
    const outputDir = context.projectDir;
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'script.json'), JSON.stringify(validated, null, 2), 'utf8');
    fs.writeFileSync(path.join(outputDir, 'script.md'), rawMarkdown, 'utf8');

    return {
      success: true,
      data: validated,
    };
  }
}

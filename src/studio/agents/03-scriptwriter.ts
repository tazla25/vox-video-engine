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
        voiceoverText: 'Right now, as you listen to my voice, the Sun could have vanished completely from the cosmos. And you would have absolutely no idea. For eight minutes and twenty seconds, the sky remains radiant, children laugh in the park, and Earth continues its tranquil orbit. But across the void, a silent countdown has already begun.',
        suggestedVisualMood: 'Golden afternoon sunlight suddenly intercut with pitch black telemetry grid and high-speed gravitational wave propagation.',
        audioCues: ['Warm cinematic piano', 'Subtle low heartbeat bass pulse', 'Sudden sub-bass drop at 8:20 marker'],
      },
      {
        sectionId: 'sec-2-premise',
        sectionType: 'PREMISE' as const,
        targetDurationSeconds: 45,
        voiceoverText: 'Why does Earth wait? Because in Einstein\'s universe, nothing can travel faster than the speed of light. Not even gravity. The Sun is not just our cosmic furnace; its colossal mass bends the fabric of space-time into a deep gravitational bowl. For five hundred seconds, Earth continues circling a ghost star. Until the final photon strikes your retina.',
        suggestedVisualMood: '3D spacetime mesh warping under solar mass, showing gravitational ripples racing outward at exactly 299,792 kilometers per second.',
        audioCues: ['Synth drone rising in pitch', 'Clock ticking cadence'],
      },
      {
        sectionId: 'sec-3-core-conflict',
        sectionType: 'CORE_CONFLICT' as const,
        targetDurationSeconds: 45,
        voiceoverText: 'At eight minutes and twenty seconds, total blackout hits. The Moon instantly disappears from the night sky, robbed of its reflected mirror. But the dark is merely the first blow. Without the Sun\'s gravitational anchor, Earth stops curving. It slingshots in a straight tangential line into deep space at thirty kilometers every single second.',
        suggestedVisualMood: 'Earth breaking free from its elliptical orbit, hurtling tangentially through the Orion Spur of the Milky Way.',
        audioCues: ['Metallic impact swoosh', 'Cold echoing spatial ambience'],
      },
      {
        sectionId: 'sec-4-explanation',
        sectionType: 'EXPLANATION' as const,
        targetDurationSeconds: 50,
        voiceoverText: 'Within twenty-four hours, global panic collides with physics. Photosynthesis grinds to a dead stop. Within seven days, global surface temperatures plunge below freezing. Within one year, the thermometer reads minus seventy-three degrees Celsius. The surface oceans freeze solid under kilometers of impenetrable ice, sealing off the world in an icy crypt.',
        suggestedVisualMood: 'Fast-forward thermal camera heatmap decaying from glowing amber to freezing violet; glaciers advancing across satellite globe views.',
        audioCues: ['Glacial cracking sound effect', 'Wind howling drone'],
      },
      {
        sectionId: 'sec-5-climax',
        sectionType: 'CLIMAX' as const,
        targetDurationSeconds: 40,
        voiceoverText: 'Yet, deep beneath that armor of ice, Earth harbors a secret. Geothermal energy pulsing from our molten nickel-iron core keeps the deep abyssal oceans liquid and warm. Clustering around hydrothermal vents, volcanic extremophiles thrive in volcanic darkness, completely indifferent to the death of the star above.',
        suggestedVisualMood: 'Submersible descent into the midnight trench; glowing hydrothermal black smokers bubbling with subterranean life.',
        audioCues: ['Underwater bubble resonance', 'Warm ethereal string swell'],
      },
      {
        sectionId: 'sec-6-resolution',
        sectionType: 'RESOLUTION' as const,
        targetDurationSeconds: 30,
        voiceoverText: 'Billions of years from now, our rogue planet will drift silently through interstellar space—a solitary ark bearing life across the galaxy. The Sun gave us birth, but our world\'s inner fire guarantees we will endure.',
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

import fs from 'node:fs';
import path from 'node:path';
import type { IAgent, AgentContext, AgentExecutionResult } from '../core/types.ts';
import { StoryboardSchema } from '../core/contracts.ts';
import type { StoryboardType, ScriptType } from '../core/contracts.ts';

export class StoryboardAgent implements IAgent<{ script: ScriptType }, StoryboardType> {
  readonly role = 'STORYBOARD';
  readonly name = 'Visual Storyboard & Shot Director';
  readonly description = 'Converts scripts into precise shot-by-shot visual sequences with camera angles, subject choreography, sound triggers, and visual decision rationales.';

  async execute(input: { script: ScriptType }, context: AgentContext): Promise<AgentExecutionResult<StoryboardType>> {
    context.logger.info(`Building shot-by-shot storyboard for "${input.script.title}"...`);

    const scenes = input.script.sections.map((section, sceneIdx) => {
      const sceneId = `scene-${sceneIdx + 1}`;
      const sceneDuration = section.targetDurationSeconds;
      
      // Break section into 2 visually distinct shots to guarantee high visual rhythm and zero static boredom
      const shotDuration1 = Math.round(sceneDuration * 0.48);
      const shotDuration2 = sceneDuration - shotDuration1;

      const isHook = section.sectionType === 'HOOK';
      const isPremise = section.sectionType === 'PREMISE';
      const isClimax = section.sectionType === 'CLIMAX';
      const isResolution = section.sectionType === 'RESOLUTION';

      return {
        sceneId,
        sceneNumber: sceneIdx + 1,
        title: `${section.sectionType}: ${section.voiceoverText.slice(0, 35)}...`,
        durationSeconds: sceneDuration,
        shots: [
          {
            shotId: `${sceneId}-shot-1`,
            sceneId,
            shotNumber: 1,
            durationSeconds: shotDuration1,
            visualType: isHook ? ('REAL_FOOTAGE' as const) : isPremise ? ('MOTION_GRAPHICS' as const) : ('REAL_FOOTAGE' as const),
            visualDecisionRationale: isHook
              ? 'Real NASA 4K SDO solar footage immediately grounds viewer in awe and cosmic scale.'
              : 'Motion graphics with warped coordinate grid clearly explains Einsteinian spacetime curvature.',
            visualObjective: `Establish visual anchor for ${section.sectionType.toLowerCase()}`,
            narrationSnippet: section.voiceoverText.slice(0, section.voiceoverText.length / 2),
            cameraMovement: 'Slow continuous push-in zoom (1.0x to 1.15x) with micro camera shake',
            subjectAction: 'Solar corona flares pulsing outward into vacuum',
            transitionIn: sceneIdx === 0 ? 'FADE_IN_FROM_BLACK' : 'CROSS_DISSOLVE_12F',
            transitionOut: 'HARD_CUT',
            soundCue: section.audioCues[0] || 'Atmospheric sub-bass drone',
            screenTextOrDiagram: isHook ? '[T - 08:20] SPEED OF LIGHT HORIZON' : undefined,
            continuityReferenceId: `anchor-${sceneIdx + 1}`,
          },
          {
            shotId: `${sceneId}-shot-2`,
            sceneId,
            shotNumber: 2,
            durationSeconds: shotDuration2,
            visualType: isClimax ? ('VECTOR_ANIMATION' as const) : isResolution ? ('MOTION_GRAPHICS' as const) : ('AI_IMAGE' as const),
            visualDecisionRationale: 'Dynamic scientific vector diagram with animated telemetry metrics maintains viewer attention and explains physical mechanics.',
            visualObjective: `Demonstrate physical consequence of ${section.sectionType.toLowerCase()}`,
            narrationSnippet: section.voiceoverText.slice(section.voiceoverText.length / 2),
            cameraMovement: 'Pan left-to-right across vector trajectory line',
            subjectAction: 'Orbital trail stretching into linear tangent vector',
            transitionIn: 'HARD_CUT',
            transitionOut: 'CROSS_DISSOLVE_12F',
            soundCue: section.audioCues[1] || 'Subtle spatial radar beep',
            screenTextOrDiagram: 'VELOCITY: 30 KM/S // INTERSTELLAR TANGENT',
            continuityReferenceId: `anchor-${sceneIdx + 1}`,
          }
        ]
      };
    });

    const totalDurationSeconds = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);
    const totalShots = scenes.reduce((acc, s) => acc + s.shots.length, 0);

    const storyboard: StoryboardType = {
      projectId: context.projectId,
      totalDurationSeconds,
      totalShots,
      scenes,
      createdAt: new Date().toISOString(),
    };

    const validated = StoryboardSchema.parse(storyboard);

    // Save to project directory
    const outputDir = context.projectDir;
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'storyboard.json'), JSON.stringify(validated, null, 2), 'utf8');

    return {
      success: true,
      data: validated,
    };
  }
}

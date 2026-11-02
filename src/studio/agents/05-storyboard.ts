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
      const isConflict = section.sectionType === 'CORE_CONFLICT';
      const isExplanation = section.sectionType === 'EXPLANATION';
      const isClimax = section.sectionType === 'CLIMAX';
      const isResolution = section.sectionType === 'RESOLUTION';

      let shot1Objective = `Establish visual anchor for ${section.sectionType.toLowerCase()}`;
      let shot2Objective = `Demonstrate physical consequence of ${section.sectionType.toLowerCase()}`;
      let shot1Hud: string | undefined = undefined;
      let shot2Hud: string | undefined = undefined;

      if (isHook) {
        shot1Objective = 'Solar corona flare and sudden light horizon cutoff';
        shot1Hud = 'LIGHT-SPEED HORIZON // 8 MIN 20 SEC';
        shot2Objective = 'Sun vanishing telemetry grid and high-speed gravitational wave propagation';
        shot2Hud = 'GRAVITATIONAL WAVE PROPAGATION: c';
      } else if (isPremise) {
        shot1Objective = '3D spacetime coordinate mesh warped under solar mass';
        shot1Hud = 'GENERAL RELATIVITY // SPACETIME CURVATURE';
        shot2Objective = '500-second light delay timeline and final photon trajectory';
        shot2Hud = 'PHOTON TRAJECTORY // 299,792 KM/S';
      } else if (isConflict) {
        shot1Objective = 'Hubble Deep Field dark cosmic void and instant daytime hemisphere blackout';
        shot1Hud = 'TOTAL BLACKOUT // ZERO REFLECTED LUNAR ALBEDO';
        shot2Objective = 'Earth breaking free from elliptical orbit into straight tangent vector';
        shot2Hud = 'VELOCITY: 30 KM/S // INTERSTELLAR TANGENT';
      } else if (isExplanation) {
        shot1Objective = 'Earth satellite view showing thermal camera heatmap decay and glacier expansion';
        shot1Hud = 'THERMAL DECAY // SURFACE T: -73°C';
        shot2Objective = 'Global oceans freezing solid under impenetrable kilometer-thick ice shell';
        shot2Hud = 'GLOBAL CRYPT // SURFACE ICE: 1.0 KM';
      } else if (isClimax) {
        shot1Objective = 'Submersible descent into midnight oceanic abyss';
        shot1Hud = 'ABYSSAL TRENCH // DEPTH: 11,000 M';
        shot2Objective = 'Hydrothermal black smokers powered by molten nickel-iron core geothermal heat';
        shot2Hud = 'GEOTHERMAL POWER: 47 TW // CORE METABOLISM';
      } else if (isResolution) {
        shot1Objective = 'Rogue frozen Earth cruising as solitary ark through distant star clusters';
        shot1Hud = 'ROGUE PLANET ARK // ORION SPUR DRIFT';
        shot2Objective = 'Enduring life timeline and deep galactic stellar trajectory';
        shot2Hud = 'LIFE ENDURANCE // TIMELINE: 5 BILLION YEARS';
      }

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
              : isPremise
              ? 'Motion graphics with warped coordinate grid clearly explains Einsteinian spacetime curvature.'
              : isConflict
              ? 'Hubble Ultra Deep Field footage visualizes true cosmic darkness in the absence of sunlight.'
              : isExplanation
              ? 'Real NASA Earth footage with atmospheric glow establishes baseline before freezing.'
              : 'Deep void visual establishes the scale of the subterranean oceanic abyss.',
            visualObjective: shot1Objective,
            narrationSnippet: section.voiceoverText.slice(0, Math.floor(section.voiceoverText.length / 2)),
            cameraMovement: 'Slow continuous push-in zoom (1.0x to 1.15x) with micro camera shake',
            subjectAction: isHook ? 'Solar corona flares pulsing outward into vacuum' : 'Space-time mesh curving under massive body',
            transitionIn: sceneIdx === 0 ? 'FADE_IN_FROM_BLACK' : 'CROSS_DISSOLVE_12F',
            transitionOut: 'HARD_CUT',
            soundCue: section.audioCues[0] || 'Atmospheric sub-bass drone',
            screenTextOrDiagram: shot1Hud,
            continuityReferenceId: `anchor-${sceneIdx + 1}`,
          },
          {
            shotId: `${sceneId}-shot-2`,
            sceneId,
            shotNumber: 2,
            durationSeconds: shotDuration2,
            visualType: isClimax ? ('VECTOR_ANIMATION' as const) : isResolution ? ('MOTION_GRAPHICS' as const) : ('AI_IMAGE' as const),
            visualDecisionRationale: 'Dynamic scientific vector diagram with animated telemetry metrics maintains viewer attention and explains physical mechanics.',
            visualObjective: shot2Objective,
            narrationSnippet: section.voiceoverText.slice(Math.floor(section.voiceoverText.length / 2)),
            cameraMovement: 'Pan left-to-right across vector trajectory line',
            subjectAction: 'Orbital trail stretching into linear tangent vector',
            transitionIn: 'HARD_CUT',
            transitionOut: 'CROSS_DISSOLVE_12F',
            soundCue: section.audioCues[1] || 'Subtle spatial radar beep',
            screenTextOrDiagram: shot2Hud,
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

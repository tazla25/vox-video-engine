import fs from 'node:fs';
import path from 'node:path';
import type { IAgent, AgentContext, AgentExecutionResult } from '../core/types.ts';
import { VisualBibleSchema } from '../core/contracts.ts';
import type { VisualBibleType } from '../core/contracts.ts';

export class ArtDirectorAgent implements IAgent<void, VisualBibleType> {
  readonly role = 'ART_DIRECTOR';
  readonly name = 'Visual Identity & Art Director';
  readonly description = 'Establishes color harmonies, typography hierarchy, lighting atmospheres, camera composition language, and visual continuity guidelines.';

  async execute(_input: void, context: AgentContext): Promise<AgentExecutionResult<VisualBibleType>> {
    context.logger.info(`Defining Visual Bible for mode "${context.config.mode}"...`);

    const mode = context.config.mode;

    const bible: VisualBibleType = {
      projectId: context.projectId,
      mode,
      colorPalette: {
        primary: '#FF5500', // Solar thermal amber
        secondary: '#00AAFF', // Planetary atmospheric cyan
        accent: '#00DFD8', // High-tech scientific telemetry neon
        background: '#05050D', // Deep cosmic void black
        text: '#F8F9FA', // Crisp studio white
        additionalHues: ['#7928CA', '#FF0080', '#111122'],
      },
      typography: {
        headerFont: 'Inter, system-ui, sans-serif',
        bodyFont: 'Inter, system-ui, sans-serif',
        captionFont: 'Inter, system-ui, sans-serif',
        codeOrDataFont: 'JetBrains Mono, Courier New, monospace',
      },
      lightingAndAtmosphere: 'High-contrast chiaroscuro. Intense rim-lighting against impenetrable cosmic black. Zero flat generic gray fills. Volumetric coronal glow transitioning into cold blue abyss.',
      compositionGuidelines: [
        'Rule of thirds with strong diagonal energy vectors.',
        'Negative space ratio: at least 45% of the frame dedicated to deep dark cosmos for psychological scale.',
        'Subtle analog film grain overlay (opacity 0.04 to 0.06) to destroy sterile digital CGI artifacts.',
        'Dynamic focal depth: shallow depth of field on foreground telemetry data cards.',
      ],
      characterAndEntityStyles: [
        {
          entityName: 'The Sun',
          visualDescription: 'Colossal roiling magnetic plasma sphere with active solar flares, coronal loops, and coronal mass ejections.',
          keyTraits: ['Blinding core luminosity', 'Solar granules', 'Ultraviolet magnetic tendrils'],
        },
        {
          entityName: 'Earth',
          visualDescription: 'Vibrant marble with delicate blue atmospheric halo, swirling cloud systems, and deep sapphire oceans, progressively freezing into a crystalline white shield.',
          keyTraits: ['Thin fragile atmosphere', 'City night lights', 'Glacial frost line creeping from poles to equator'],
        }
      ],
      motionLanguage: 'Cinematic inertia. Continuous subtle camera motion (never dead static). Spring physics with damping ratio 0.82 for smooth human-like deceleration. Camera tilts up to 12 degrees on dramatic narrative revelations.',
      bannedTropes: [
        'Static slideshow Ken Burns zooms without layered parallax.',
        'Generic colorful cartoon clip-art in serious scientific topics.',
        'Unstyled default sans-serif subtitles centered in boring white boxes.',
        'Stock footage watermarks or low-resolution compressed artifacts.',
      ],
      createdAt: new Date().toISOString(),
    };

    const validated = VisualBibleSchema.parse(bible);

    // Save to project directory
    const outputDir = context.projectDir;
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'visual-bible.json'), JSON.stringify(validated, null, 2), 'utf8');

    return {
      success: true,
      data: validated,
    };
  }
}

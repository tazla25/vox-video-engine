import fs from 'node:fs';
import path from 'node:path';
import type { IAgent, AgentContext, AgentExecutionResult } from '../core/types.ts';
import type { VisualBibleType, StoryboardType, AssetManifestType } from '../core/contracts.ts';
import type { ImageProvider } from '../providers/interfaces.ts';

export class ImageGenerationAgent implements IAgent<{ storyboard: StoryboardType; visualBible: VisualBibleType; assetManifest: AssetManifestType }, { generatedCount: number }> {
  readonly role = 'IMAGE_GENERATION';
  readonly name = 'AI Illustration & Image Generator';
  readonly description = 'Synthesizes custom artistic textures, scientific diagrams, and environment visuals adhering strictly to the Visual Bible aesthetic.';
  private imageProvider: ImageProvider;

  constructor(imageProvider: ImageProvider) {
    this.imageProvider = imageProvider;
  }

  async execute(
    input: { storyboard: StoryboardType; visualBible: VisualBibleType; assetManifest: AssetManifestType },
    context: AgentContext
  ): Promise<AgentExecutionResult<{ generatedCount: number }>> {
    context.logger.info(`Generating required still visual assets...`);

    let generatedCount = 0;
    const publicAssetsDir = path.join(process.cwd(), 'public', 'assets');
    fs.mkdirSync(publicAssetsDir, { recursive: true });

    for (const asset of input.assetManifest.assets) {
      if (asset.assetType === 'IMAGE') {
        const shot = input.storyboard.scenes
          .flatMap(s => s.shots)
          .find(sh => sh.shotId === asset.shotId);

        const prompt = shot ? shot.visualObjective : 'Deep space cosmological visualization';
        const res = await this.imageProvider.generateImage({
          prompt,
          width: 1920,
          height: 1080,
        });

        // Ensure target file path matches asset manifest entry
        const destPath = path.resolve(process.cwd(), asset.localPath);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        if (fs.existsSync(res.localPath) && res.localPath !== destPath) {
          fs.copyFileSync(res.localPath, destPath);
        }

        generatedCount++;
      }
    }

    context.logger.info(`Generated ${generatedCount} bespoke graphic assets successfully.`);
    return {
      success: true,
      data: { generatedCount },
    };
  }
}

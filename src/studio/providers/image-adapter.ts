import fs from 'node:fs';
import path from 'node:path';
import type { ImageProvider, ImageGenerationOptions } from './interfaces.ts';

export class ProceduralAndPublicImageAdapter implements ImageProvider {
  readonly name = 'procedural-and-public-image';

  async generateImage(options: ImageGenerationOptions): Promise<{ localPath: string; url?: string; seed?: number }> {
    const outputDir = path.join(process.cwd(), 'public', 'assets', 'generated');
    fs.mkdirSync(outputDir, { recursive: true });

    const slug = options.prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 25);
    const fileName = `img-${slug}-${Date.now().toString(36)}.svg`;
    const localPath = path.join(outputDir, fileName);

    // Procedural SVG vector diagram generation based on prompt
    const width = options.width || 1920;
    const height = options.height || 1080;
    const seed = options.seed || Math.floor(Math.random() * 1000000);

    const svgContent = this.generateScientificSVG(options.prompt, width, height, seed);
    fs.writeFileSync(localPath, svgContent, 'utf8');

    return {
      localPath,
      seed,
    };
  }

  private generateScientificSVG(prompt: string, width: number, height: number, seed: number): string {
    const isSun = prompt.toLowerCase().includes('sun');
    const isEarth = prompt.toLowerCase().includes('earth');
    const isGravity = prompt.toLowerCase().includes('gravity') || prompt.toLowerCase().includes('orbit');

    const primaryColor = isSun ? '#FF5500' : isEarth ? '#00AAFF' : '#7928CA';
    const accentColor = isSun ? '#FFAA00' : '#00DFD8';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <radialGradient id="spaceGlow" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.35"/>
      <stop offset="70%" stop-color="#050510" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#000005" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>
      <stop offset="30%" stop-color="${accentColor}" stop-opacity="0.9"/>
      <stop offset="80%" stop-color="${primaryColor}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#22223a" stroke-width="1.2" stroke-dasharray="3,3"/>
    </pattern>
  </defs>

  <!-- Deep Cosmic Canvas -->
  <rect width="100%" height="100%" fill="#030308"/>
  <rect width="100%" height="100%" fill="url(#spaceGlow)"/>
  <rect width="100%" height="100%" fill="url(#grid)" opacity="0.45"/>

  <!-- Orbital Curvature / Vector Field -->
  ${isGravity ? `
  <ellipse cx="${width / 2}" cy="${height / 2}" rx="${width * 0.38}" ry="${height * 0.35}" fill="none" stroke="${accentColor}" stroke-width="2.5" stroke-dasharray="12,8" opacity="0.6"/>
  <line x1="${width * 0.15}" y1="${height * 0.5}" x2="${width * 0.85}" y2="${height * 0.5}" stroke="#ffffff" stroke-width="1" stroke-dasharray="4,6" opacity="0.3"/>
  ` : ''}

  <!-- Celestial Core or Scientific Focal Subject -->
  <circle cx="${width / 2}" cy="${height / 2}" r="${height * 0.22}" fill="url(#coreGlow)"/>
  <circle cx="${width / 2}" cy="${height / 2}" r="${height * 0.12}" fill="${primaryColor}" opacity="0.85"/>

  <!-- Telemetry HUD & Typography Labels -->
  <text x="80" y="90" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="28" font-weight="700" fill="#00DFD8" letter-spacing="3">
    [TELEMETRY // ORBITAL METRICS]
  </text>
  <text x="80" y="130" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="18" fill="#8888aa">
    FOCUS: ${prompt.toUpperCase().slice(0, 48)} | SEED: ${seed}
  </text>
  <text x="${width - 340}" y="90" font-family="'JetBrains Mono', monospace" font-size="18" fill="#8888aa" text-anchor="end">
    SYSTEM INTEGRITY: 99.98% | LATENCY: 8.33 MIN
  </text>
</svg>`;
  }
}

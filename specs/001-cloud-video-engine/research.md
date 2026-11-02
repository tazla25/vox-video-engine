# Research & Technology Decisions: Cloud-Rendered Vox-Style Engine

**Feature**: `001-cloud-video-engine`  
**Date**: 2026-11-02  
**Status**: Completed  

---

## 1. Cloud Rendering Strategy: GitHub Actions vs Local vs Paid Cloud

| Approach | Machine Specs | Cost | Mobile Load | Verdict |
|---|---|---|---|---|
| **GitHub Actions Linux Runner (`ubuntu-latest`)** | 4-Core vCPU, 16 GB RAM, 14 GB SSD | **100% Free** (unlimited on public repos) | 0% CPU/RAM | **SELECTED**. Completely isolates heavy rendering from Termux. |
| Local Termux Rendering | ARM Cortex (Phone), 3-4 GB usable RAM | Free | 100% CPU heat, OOM crash risk | **REJECTED**. Primary root cause of previous failures. |
| Modal / Replicate / AWS Lambda | GPU/vCPU | $0.05–$0.20 per render | 0% | **REJECTED**. Unnecessary cost when GitHub provides free 16GB. |

---

## 2. Animation & Video Framework: Remotion (React) vs MoviePy vs Manim

| Dimension | Remotion (React/TS) | MoviePy (Python) | Manim (Python) |
|---|---|---|---|
| **Visual Quality** | Modern web grade (Tailwind, Spring physics, SVG, typography) | 2010s raw canvas / Matplotlib | Excellent for pure math formulas, rigid for documentary |
| **Claude / LLM Code Quality** | **Superior** (LLMs generate high-tier React with ease) | Poor (fragile numpy arrays & coordinates) | Moderate (frequent layout collisions) |
| **Ecosystem** | npm, Lucide, Recharts, Three.js, CSS transforms | Limited | Limited |
| **Verdict** | **SELECTED** | **REJECTED** | **RESERVED** for pure math equations |

---

## 3. Voiceover & Timestamp Synchronization: Edge-TTS + Word Parser

- **TTS Engine**: `edge-tts` (Microsoft Azure Neural Voices)
  - Voice: `en-US-ChristopherNeural` (Authoritative, documentary cadence).
  - Cost: 100% free, zero API key required, runs locally in Termux in $<2$ seconds.
- **Word Timestamps**:
  - `edge-tts` emits native `WordBoundary` events over its WebSocket connection with exact millisecond start and duration for every spoken token.
  - No Whisper transcription needed for TTS narration; the timestamps are 100% deterministic and zero-error directly from the synthesis stream.

---

## 4. 5-Layer Motion Design Stack (Enforced by Remotion Skill)

To guarantee the output never looks like "generic AI video":
1. **Layer 1: Background Mesh**: Dark `#0a0a0c` canvas with radial gradient glow or starfield dots.
2. **Layer 2: Graphic Assets / B-roll**: High-contrast SVG diagrams, Earth/Sun vectors with Ken Burns pan.
3. **Layer 3: Kinetic Typography & Highlights**: Big bold headers (Inter/Satoshi), sliding masked words with `@remotion/spring`, highlighter SVG overlay.
4. **Layer 4: Color Grading**: Subtle cinematic vignette and contrast curve.
5. **Layer 5: Texture Overlay**: SVG-based animated film grain (`feTurbulence`) for authentic documentary warmth.

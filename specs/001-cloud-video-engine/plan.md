# Implementation Plan: Cloud-Rendered Vox-Style Motion Graphics Engine

**Branch**: `001-cloud-video-engine` | **Date**: 2026-11-02 | **Spec**: [spec.md](file:///data/data/com.termux/files/home/vox-video-engine/specs/001-cloud-video-engine/spec.md)

---

## 1. Summary

Build a mobile-first, cloud-rendered video generation pipeline. Termux runs lightweight audio generation (`edge-tts` with word boundary timestamps) and Antigravity generates modular Remotion React components following the 5-layer Vox-style motion graphics rules. Heavy 1080p 60fps MP4 video rendering is completely delegated to GitHub Actions' free 16 GB RAM / 4-core Linux runner (`ubuntu-latest`), uploading the finished `.mp4` as a downloadable artifact.

---

## 2. Technical Context

- **Platform**: Android Termux (Code & TTS generation) $\to$ GitHub Actions (Cloud Rendering)
- **Runtime**: Node.js 20 LTS (Remotion 4.x), Python 3.11+ (`edge-tts`)
- **Animation Framework**: Remotion (`remotion`, `@remotion/cli`, `@remotion/spring`)
- **Styling**: Tailwind CSS + Inline SVG Motion Physics
- **Audio & Subtitle Sync**: Edge-TTS WebSocket `WordBoundary` parser
- **Cloud Runner**: GitHub Actions `ubuntu-latest` (4 vCPUs, 16 GB RAM)
- **Output Spec**: 1080×1920 (9:16 Vertical Shorts), 60 FPS, H.264 High Profile, AAC Stereo

---

## 3. Phase -1 Pre-Implementation Gates

- ✅ **Simplicity Gate**: Exactly 3 modules:
  1. `scripts/`: Python `generate_voice.py` for Edge-TTS audio + word JSON.
  2. `src/`: Remotion Root, Theme, and 5-layer Scene Components.
  3. `.github/workflows/`: `render.yml` GitHub Actions pipeline.
- ✅ **Anti-Abstraction Gate**: Direct Remotion APIs (`useCurrentFrame`, `useVideoConfig`, `spring`, `interpolate`) and raw GitHub Actions syntax. Zero custom wrapper abstractions.
- ✅ **Integration Gate**: Validated by `contracts/video-props.schema.json`.

---

## 4. Architecture & Directory Layout

```text
vox-video-engine/
├── .github/
│   └── workflows/
│       └── render.yml              # 16 GB RAM Cloud Render Pipeline
├── package.json                    # Remotion & React dependencies
├── tsconfig.json                   # TypeScript config
├── scripts/
│   └── generate_voice.py           # Edge-TTS + WordBoundary Timestamp Generator
├── public/
│   ├── narration.mp3               # Generated neural audio
│   └── captions.json               # Word-level timestamp array
├── src/
│   ├── index.ts                    # Remotion entry point
│   ├── Root.tsx                    # Composition definition (1080x1920 @ 60fps)
│   ├── theme.ts                    # Master color palette, spring presets, fonts
│   ├── components/
│   │   ├── BgMesh.tsx              # Layer 1: Ambient gradient mesh & starfield
│   │   ├── GrainOverlay.tsx        # Layer 5: SVG film grain & subtle vignette
│   │   ├── KineticText.tsx         # Layer 3: Spring-loaded masked typography
│   │   └── CaptionsHighlighter.tsx # Layer 3: Word-by-word synced highlight badge
│   └── scenes/
│       ├── HookScene.tsx           # Scene 1: The Paradox ("Why is Space Pitch Black?")
│       ├── ScienceScene.tsx        # Scene 2: The Physics (Sun vs Earth atmosphere scattering)
│       └── RevealScene.tsx         # Scene 3: The Void (Rayleigh scattering vs Vacuum)
└── specs/
    └── 001-cloud-video-engine/
        ├── spec.md
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── contracts/
        └── tasks.md
```

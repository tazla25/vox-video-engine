# Tasks: Cloud-Rendered Vox-Style Motion Graphics Engine

**Branch**: `001-cloud-video-engine` | **Spec**: [spec.md](file:///data/data/com.termux/files/home/vox-video-engine/specs/001-cloud-video-engine/spec.md) | **Plan**: [plan.md](file:///data/data/com.termux/files/home/vox-video-engine/specs/001-cloud-video-engine/plan.md)

---

## Phase 1: Setup

- [ ] [T001] [US1] Initialize `package.json`, install Remotion 4.x dependencies and TypeScript configs in `/data/data/com.termux/files/home/vox-video-engine/`
- [ ] [T002] [US1] Create `.github/workflows/render.yml` configured for GitHub Actions `ubuntu-latest` 16GB RAM runner with artifact upload

---

## Phase 2: Foundational (Audio & Word-Level Timestamps)

- [ ] [T003] [US2] Create `scripts/generate_voice.py` using `edge-tts` with word boundary extraction in `scripts/generate_voice.py`
- [ ] [T004] [US2] Generate 15-second Space Script narration (`public/narration.mp3` and `public/captions.json`)

---

## Phase 3: User Story 1 (P1 MVP - Vox-Style 5-Layer Composition)

- [ ] [T005] [US1] Implement `src/theme.ts` with master color palette, spring presets, and easing curves in `src/theme.ts`
- [ ] [T006] [US1] Implement `src/components/BgMesh.tsx` and `src/components/GrainOverlay.tsx` (Layers 1 & 5)
- [ ] [T007] [US1] Implement `src/components/KineticText.tsx` and `src/components/CaptionsHighlighter.tsx` (Layer 3)
- [ ] [T008] [US1] Implement `src/scenes/HookScene.tsx` (0s–5s: "Why is Space Pitch Black even with a blazing Sun?")
- [ ] [T009] [US1] Implement `src/scenes/ScienceScene.tsx` (5s–10s: Earth atmosphere scattering blue light)
- [ ] [T010] [US1] Implement `src/scenes/RevealScene.tsx` (10s–15s: The Vacuum Void — No particles to bounce light)
- [ ] [T011] [US1] Connect scenes into `src/Root.tsx` and `src/index.ts` with 9:16 vertical 1080x1920 @ 60fps composition

---

## Phase 4: Verification & Git Pipeline Setup

- [ ] [T012] [US1] Verify TypeScript compilation (`npx tsc --noEmit`) passes with 0 errors
- [ ] [T013] [US1] Verify frame still renders at key timestamps (`Frame 60`, `Frame 360`, `Frame 720`) using lightweight `remotion still`
- [ ] [T014] [US1] Initialize Git repository, commit clean files, and output 1-click GitHub push instructions for 16GB cloud render

# Strict Independent Technical Audit & Pipeline Assessment

**Repository**: `vox-video-engine`  
**Audit Date**: 2026-11-02  
**Auditor**: Antigravity Autonomous Senior Staff Engineer & Systems Auditor  
**Audit Standard**: Empirical source-code inspection, real test execution, log extraction, and zero-sycophancy verification. Previous claims in `README.md` and `IMPLEMENTATION_STATUS.md` were treated as unverified claims until proven by code and runtime execution.

---

## 1. Executive Summary of Audit Findings

A comprehensive, line-by-line inspection of the `vox-video-engine` codebase, runtime scripts, provider adapters, manifests, test suites, and GitHub Actions logs revealed substantial divergences between documented claims and actual software implementation:

1. **Agent Implementation Reality**:
   - **Zero Antigravity Native Subagents**: None of the 14 agents use Antigravity native subagent primitives (`invoke_subagent` is not called anywhere). All 14 agents are in-process, software-managed TypeScript classes implementing a local `IAgent` interface.
   - **Zero Real AI Generation for Visuals**: Neither image generation nor video generation connects to any generative AI model (no DALL-E, Midjourney, Stable Diffusion, Sora, Runway, Pika, or Kling). Image generation is procedural SVG generation; video generation simply copies/reuses pre-downloaded public NASA b-roll files.
   - **Zero Character Animation**: Character animation is completely non-existent in the codebase.
   - **Only One Operational External Provider**: `EdgeTTSAdapter` successfully connects to Microsoft Edge Neural TTS via Python `edge_tts`, producing real 129.1-second speech and frame-accurate word timestamps.
   - **All Narrative Agents Are Deterministic / Hardcoded**: `ResearchAgent`, `ScriptwriterAgent`, `StoryEditorAgent`, `StoryboardAgent`, and `ArtDirectorAgent` do not use LLMs. The `AntigravityLLMAdapter` exists as an unused stub; the agents run hardcoded logic specific to "What happens if the Sun disappears?".

2. **Confirmed Critical Defects**:
   - **Cloud Rendering Failure (`run_logs.zip`)**: GitHub Actions runner failed on step 5 (`npx remotion render src/index.ts VoxShort out/video.mp4`) with `Error: Can't resolve './Root.js' in '.../src'` because `src/index.ts` and component files imported `.js` extensions while files were `.tsx`.
   - **TypeScript Build Broken (`npm run build`)**: `tsc --noEmit` exited with code 2, failing on 3 type errors in `src/studio/core/contracts.ts` (Zod v4 schema parameter mismatches on lines 208, 276, and 310).
   - **Severe Duration Desynchronization**:
     - Script estimated duration: **245.0s** (35s + 45s + 45s + 50s + 40s + 30s).
     - Actual Edge-TTS narration audio: **129.1s** (~350 words spoken at natural cadence).
     - Studio Timeline generator: assembled **7,350 frames @ 30fps = 245.0s**, leaving over 115 seconds of dead silence after the voiceover ends.
     - Remotion Composition (`src/Root.tsx`): hardcoded to **1,100 frames @ 60fps = 18.33s**, which truncates 85% of the video and completely ignores `timeline.json`.
   - **State Inconsistency**: When `story-studio approve <projectId>` is invoked, `state.json` is updated to `"APPROVED"`, but `production-report.json` is never updated, leaving it in `"AWAITING_REVIEW"` with `"isAwaitingHumanApproval": true`.
   - **False-Positive QA Checks**: `14-quality-assurance.ts` reports 100% PASS without performing genuine media inspection:
     - `blackFramesDetected` is hardcoded to `0`.
     - `silenceSectionsDetected` is hardcoded to `0`.
     - `audioClippingDetected` is hardcoded to `false`.
     - Acoustic balance LUFS is hardcoded to `"NORMALIZED_LUFS_-14"`.
     - Video stream and resolution checks unconditionally pass (`true`) when pre-render `videoPath` is absent.
     - Assets check merely checks `fs.readdirSync('public/assets').length > 0`, ignoring missing cues (`sub_drop.mp3`, `woosh.mp3`).

---

## 2. Feature & Component Audit Matrix

Status Definitions:
- **VERIFIED**: Code exists, executes without error, and performs its actual asserted function.
- **PARTIALLY_IMPLEMENTED**: Code exists and runs, but only handles a subset of required behavior or operates with critical limitations.
- **MOCKED**: Code returns fabricated or simulated responses without performing the real operation.
- **HARDCODED**: Logic is completely hardcoded to specific static data or predetermined responses.
- **BROKEN**: Code throws runtime or compile-time errors or produces invalid/corrupt output.
- **NOT_IMPLEMENTED**: Feature is declared in docs or interfaces, but has zero functional implementation.

| Feature / Component | Actual Implementation | Concrete Evidence | Test Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **01. Executive Director** | Software-managed class orchestrating in-process agent registry, task queue, and state machine. | `src/studio/agents/01-executive-director.ts#L31-L255` | Succeeded in executing full pipeline run; writes `production-report.json`. | **VERIFIED** |
| **02. Research Agent** | Class querying `PublicMediaSearchAdapter`, returning 3 static hardcoded NASA snippets. | `src/studio/agents/02-research.ts#L21-L51`, `src/studio/providers/search-adapter.ts#L83-L104` | Produces valid `research-report.json`, but content is static hardcoded facts. | **HARDCODED** |
| **03. Scriptwriter Agent** | Fixed 6-section text written specifically for solar extinction topic; estimates 245s. | `src/studio/agents/03-scriptwriter.ts#L15-L67` | Writes `script.json` and `script.md`. Fails for any topic other than the Sun. | **HARDCODED** |
| **04. Story Editor Agent** | Heuristic arithmetic checks (hook <= 45s, word repetition); hardcoded scores. | `src/studio/agents/04-story-editor.ts#L20-L66` | Evaluates script and always passes with score 9.2-9.8. | **HARDCODED** |
| **05. Storyboard Agent** | Deterministic 2-shot split per scene; shot durations mirror script's 245s estimate. | `src/studio/agents/05-storyboard.ts#L15-L76` | Writes valid `storyboard.json` (12 shots across 6 scenes). | **HARDCODED** |
| **06. Art Director Agent** | Hardcoded visual bible (hex codes `#FF5500`, `#00AAFF`, font families, static rules). | `src/studio/agents/06-art-director.ts#L17-L61` | Writes valid `visual-bible.json`. | **HARDCODED** |
| **07. Asset Research Agent** | Maps shots to 3 local NASA clips or SVG paths based on substring keywords (`earth`, `void`, `sun`). | `src/studio/agents/07-asset-research.ts#L28-L86` | Writes valid `asset-manifest.json` referencing existing files. | **HARDCODED** |
| **08. Image Generation Agent** | Calls `ProceduralAndPublicImageAdapter` which writes SVG template strings with HUD circles/labels. | `src/studio/agents/08-image-generation.ts#L27-L49`, `src/studio/providers/image-adapter.ts#L30-L82` | Generates 4 `.svg` files in `public/assets/generated/`. No real AI image generator. | **MOCKED** |
| **09. Video Generation Agent** | Calls `PublicFootageAndVideoAdapter` which maps prompts to `sun_broll.mp4`, `earth_broll.mp4`, or `void_broll.mp4`. | `src/studio/agents/09-video-generation.ts#L24-L46`, `src/studio/providers/video-adapter.ts#L9-L47` | Copies/validates existing pre-downloaded NASA mp4 files. No AI video generator. | **HARDCODED** |
| **10. Animation Agent** | Procedurally writes 2D SVG diagram file (`diagram-${shotId}.svg`) with ellipse and vectors. | `src/studio/agents/10-animation.ts#L24-L80` | Generates 3 `.svg` diagrams in `public/assets/`. No character animation. | **HARDCODED** |
| **11. Voice Director Agent** | Executes Python `scripts/generate_voice.py` invoking real Microsoft Edge Neural TTS. | `src/studio/agents/11-voice-director.ts#L32-L46`, `src/studio/providers/tts-adapter.ts#L19-L71` | Generates real `public/narration.mp3` (774KB, 129.1s) and `public/captions.json` (350 words). | **VERIFIED** |
| **12. Sound Design Agent** | Creates manifest pointing to `ambient_drone.mp3` and non-existent SFX (`sub_drop.mp3`, `woosh.mp3`). | `src/studio/agents/12-sound-design.ts#L18-L62` | Writes `audio-manifest.json`. Referenced SFX files do not exist on disk. | **PARTIALLY_IMPLEMENTED** |
| **13. Editor & Subtitle Agent** | Assembles `timeline.json` by summing storyboard shot durations (7,350 frames = 245s @ 30fps). | `src/studio/agents/13-editor-subtitle.ts#L22-L69` | Writes `timeline.json`. Output duration is 245s (desynced from 129.1s voice) and ignored by Root.tsx. | **BROKEN** |
| **14. Quality Assurance Agent** | Deterministic check returning fake zero metrics for black frames, silences, and clipping. | `src/studio/agents/14-quality-assurance.ts#L19-L141` | Passes 5/5 checks with synthetic scores; does not run ffprobe blackdetect or astats. | **MOCKED** |
| **TypeScript Compilation** | `npm run build` (`tsc --noEmit`). | `package.json#L8`, `src/studio/core/contracts.ts#L208,L276,L310` | Exited with code 2. 3 compilation errors: TS2554 (`z.record`), TS2769 (`.default({})`). | **BROKEN** |
| **Unit Test Suite** | Node native test runner (`node --experimental-strip-types --test`). | `src/studio/tests/core.test.ts#L26-L157` | 5/5 tests pass, but no `npm test` script configured in `package.json`. | **PARTIALLY_IMPLEMENTED** |
| **Remotion Composition** | `src/Root.tsx`, `HookScene.tsx`, `ScienceScene.tsx`, `RevealScene.tsx`. | `src/Root.tsx#L17-L66` | Hardcoded 18.33s (1,100 frames @ 60fps). Does not dynamically consume `timeline.json`. | **BROKEN** |
| **GitHub Actions Cloud Render** | Workflow `.github/workflows/render.yml` on `ubuntu-latest`. | `.github/workflows/render.yml#L53-L57`, `run_logs.zip` | Failed in execution with `Can't resolve './Root.js'`. Fixed in commit `4fb8495`. | **BROKEN** |
| **Project State Consistency** | State transitions and manifest serialization across `state.json` and `production-report.json`. | `src/studio/core/orchestrator.ts#L123-L144` | Inconsistent: `state.json` is `APPROVED` while `production-report.json` is `AWAITING_REVIEW`. | **BROKEN** |

---

## 3. Detailed Investigation of Specific Issues

### 3.1 GitHub Actions Remotion Failure (`run_logs.zip`)
- **Inspection of Log Artifact**:
  Unzipping `run_logs.zip` and reading `Render 1080p 60fps MP4/5_...txt` revealed:
  ```
  Error: Module not found: Error: Can't resolve './Root.js' in '/home/runner/work/vox-video-engine/vox-video-engine/src'
  resolve './Root.js' in '/home/runner/work/vox-video-engine/vox-video-engine/src'
    using description file: /home/runner/work/vox-video-engine/vox-video-engine/package.json
      /home/runner/work/vox-video-engine/vox-video-engine/src/Root.js doesn't exist
      /home/runner/work/vox-video-engine/vox-video-engine/src/Root.js.tsx doesn't exist
  ```
- **Root Cause**:
  In earlier commit `c8e69e7`, imports in TypeScript/TSX files explicitly appended `.js` extensions (e.g. `import { RemotionRoot } from "./Root.js"`), following NodeNext conventions, while `tsconfig.json` had `"moduleResolution": "NodeNext"`. When Remotion's Webpack bundler executed, it attempted to resolve `./Root.js` directly and failed because Webpack was not configured to resolve `.js` specifiers to `.tsx` files.
- **Status in Working Tree**:
  Commit `4fb8495` removed the `.js` extensions from `src/index.ts`, `src/Root.tsx`, and scene components, switching `tsconfig.json` to `"moduleResolution": "bundler"`.
- **Local Reproduction**:
  Running `npx remotion bundle src/index.ts` on Android Termux confirmed that Remotion bundler cannot run locally on Termux due to missing `@rspack/binding-android-arm64`, confirming Termux's architectural role strictly as a control plane while Remotion rendering must occur on the x86_64 Ubuntu runner.

### 3.2 Duration Mismatch & Timeline Desynchronization
- **245s Script Estimate**:
  `src/studio/agents/03-scriptwriter.ts` hardcodes 6 sections with target durations totaling 245 seconds:
  `HOOK (35s) + PREMISE (45s) + CORE_CONFLICT (45s) + EXPLANATION (50s) + CLIMAX (40s) + RESOLUTION (30s) = 245s`.
- **129.1s Actual Narration**:
  The total voiceover text across all 6 sections is 350 words. Spoken by Microsoft Edge Neural Voice (`en-US-ChristopherNeural`), 350 words takes exactly **129.1 seconds** (confirmed by `public/captions.json` ending at `128,200ms` and `public/narration.mp3` measuring 129.1s via `ffprobe`).
- **Desynchronized Timeline**:
  `src/studio/agents/13-editor-subtitle.ts` builds the timeline from `storyboard.shots`, which inherited the 245s script estimate, generating **7,350 frames @ 30fps = 245.0s**. If played, the audio narration finishes at 129.1s, leaving 115.9 seconds of unvoiced visuals.
- **Decoupled Remotion Composition**:
  `src/Root.tsx` does not read `timeline.json`. It defines 3 hardcoded sequences totaling **1,100 frames @ 60fps = 18.33s**. When rendered, it cuts off the 129.1s audio after 18.33 seconds.

### 3.3 Contradictory Project State Manifests
- **Observation**:
  In `projects/what-happens-if-the-sun-disapp-mvz0tfzr/`:
  - `state.json` reports `"state": "APPROVED"` (approved at `2026-11-02T08:55:45.562Z`).
  - `production-report.json` reports `"currentStatus": "AWAITING_REVIEW"`, `"isAwaitingHumanApproval": true`, and summary *"Project is parked in AWAITING_REVIEW for human creator approval."*
- **Root Cause**:
  `StudioOrchestrator.approveProject()` in `src/studio/core/orchestrator.ts#L123-L144` mutates `state.json` directly, but never updates `production-report.json`. Any consumer reading `production-report.json` receives a contradictory state.

### 3.4 False-Positive QA Implementation
- **Observation**:
  In `src/studio/agents/14-quality-assurance.ts`:
  - Lines 36-48: Audio duration is checked via `ffprobe`, but clipping check is bypassed with `let audioClipping = false;` and hardcoded LUFS `-14.0`.
  - Lines 71-82: Visual assets QA only checks `hasAssets = fs.existsSync(publicAssetsDir) && fs.readdirSync(publicAssetsDir).length > 0`. It does not check if required assets (e.g. `sub_drop.mp3`, `woosh.mp3`) exist.
  - Lines 107-111: If `input.videoPath` is undefined or omitted (standard during pipeline execution before cloud render), it unconditionally sets `videoStreamVerified = true` and `targetResolutionMatches = true`.
  - Lines 135-137: `blackFramesDetected: 0` and `silenceSectionsDetected: 0` are hardcoded literals.

---

## 4. Prioritized Repair Plan

### Phase 1: Fix Core Compilation & Test Harness (CRITICAL - IMMEDIATE)
1. **Fix Zod 4 Schema Errors in `src/studio/core/contracts.ts`**:
   - Update `parameters: z.record(z.string(), z.unknown()).default({})`.
   - Update `transform: z.object({...}).default({ scale: 1, x: 0, y: 0, opacity: 1 })`.
   - Update `ffprobeMetadata: z.record(z.string(), z.unknown()).optional()`.
2. **Add Test Script to `package.json`**:
   - Add `"test": "node --experimental-strip-types --test src/studio/tests/*.test.ts"`.
3. **Verify Green Build**:
   - Run `npm run build` (`tsc --noEmit`) and verify exit code 0.
   - Run `npm test` and verify all tests pass.

### Phase 2: State Manifest Consistency (CRITICAL)
1. **Update `StudioOrchestrator.approveProject`**:
   - Reconcile `production-report.json` simultaneously when updating `state.json` to `APPROVED`, setting `currentStatus: 'APPROVED'`, `isAwaitingHumanApproval: false`, and `approvedAt`.
2. **Update `StudioOrchestrator.submitRevision`**:
   - Reconcile `production-report.json` to reflect `NEEDS_REVISION` and increment revision count.

### Phase 3: Duration Synchronization (CRITICAL)
1. **Dynamically Scale Timeline & Storyboard to Actual Narration Duration**:
   - When `VoiceDirectorAgent` produces the narration track with real duration $D_{\text{narration}}$ (e.g. 129.1s), pass $D_{\text{narration}}$ to `EditorAndSubtitleAgent`.
   - In `EditorAndSubtitleAgent`, scale scene and shot durations proportionally so total timeline duration exactly matches $D_{\text{narration}}$ (plus standard 1.5s outro padding).
2. **Synchronize Remotion Composition**:
   - Ensure Remotion root composition duration matches the actual audio length or dynamically reads duration from `captionsData` / `audioManifest`.

### Phase 4: Eliminate False-Positive QA Checks (CRITICAL)
1. **Implement Real Media Inspections in `QualityAssuranceAgent`**:
   - Verify every asset referenced in `AssetManifest` and `AudioManifest` physically exists on disk.
   - Implement real FFprobe audio loudness / clipping analysis using FFmpeg `ebur128` or `volumedetect` filter if audio file exists.
   - When video is not provided, explicitly label technical checks as `"SKIPPED_PRE_RENDER"` rather than asserting verified stream parameters.
   - Run genuine `silencedetect` via FFmpeg on narration audio to catch silent regions.
2. **Add Unit Tests for QA Verification**:
   - Write tests in `src/studio/tests/qa.test.ts` proving that missing assets cause QA to report `WARNING` or `FAILED`, and real audio is measured.

---

## 5. Verification Checklist & Acceptance Gates

- [ ] `tsc --noEmit` exits with code 0.
- [ ] `npm test` executes and passes all test suites.
- [ ] `approveProject()` updates both `state.json` and `production-report.json` consistently.
- [ ] `timeline.json` frame count matches real narration audio duration within $\pm 1$ second.
- [ ] QA agent detects missing asset files and performs real FFprobe / FFmpeg checks on existing media.
- [ ] All existing project data and assets remain preserved.

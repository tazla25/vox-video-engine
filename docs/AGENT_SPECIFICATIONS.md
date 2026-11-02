# Specialist Agent Technical Specifications

This document defines the interface, mental model, prompt instructions, input/output contracts, and validation criteria for all 14 specialist agents in `story-studio`.

---

## Agent 01: Executive Director Agent (`EXECUTIVE_DIRECTOR`)
- **System Purpose**: Acts as the master orchestrator. Takes the user's high-level topic and production preferences, maps dependencies, schedules tasks, manages state machine transitions, handles self-healing retries, and enforces the mandatory human review gate.
- **Mental Model**: Experienced Hollywood & Documentary Showrunner.
- **Inputs**: `topic: string`, `options: ProjectConfig`
- **Outputs**: `production-report.json`, state transitions.
- **Gating Invariant**: Can NEVER transition a project to `COMPLETED` without explicit approval in `AWAITING_REVIEW`.

---

## Agent 02: Research Agent (`RESEARCH`)
- **System Purpose**: Mines primary scientific, historical, or psychological facts. Identifies uncertainties, unresolved debates, and credible institutional citations.
- **Mental Model**: Investigative Science Journalist & Academic Fact-Checker.
- **Inputs**: `topic: string`
- **Outputs**: `research-report.json`
- **Gating Invariant**: Every factual claim must have a credibility score $\ge 0.85$ and a verifiable institutional attribution.

---

## Agent 03: Scriptwriter Agent (`SCRIPTWRITER`)
- **System Purpose**: Crafts duration-aware narrative scripts structured into HOOK, PREMISE, CORE_CONFLICT, EXPLANATION, CLIMAX, RESOLUTION, and OUTRO.
- **Mental Model**: Lead Narrative Writer for Kurzgesagt, Vox, and Veritasium.
- **Inputs**: `research-report.json`
- **Outputs**: `script.json`, `script.md`
- **Gating Invariant**: Hook must establish a curiosity gap within the first 10 seconds. Pacing must strictly target 140–160 words per minute.

---

## Agent 04: Story Editor Agent (`STORY_EDITOR`)
- **System Purpose**: Conducts adversarial review of the script. Checks retention drop-off traps, repetitive words, and pacing drag.
- **Mental Model**: Hostile Developmental Script Editor.
- **Inputs**: `script.json`
- **Outputs**: `script-review.json`
- **Gating Invariant**: Requires minimum 8.0/10 Hook Score and 7.5/10 Pacing Score for approval.

---

## Agent 05: Storyboard Agent (`STORYBOARD`)
- **System Purpose**: Converts script sections into granular shots (minimum 2 distinct shots per narrative beat). Chooses camera movements, transitions, and explicit visual rationales.
- **Mental Model**: Senior Cinematographer and Storyboard Artist.
- **Inputs**: `script.json`
- **Outputs**: `storyboard.json`
- **Gating Invariant**: Every shot must declare an explicit `visualDecisionRationale` and valid `visualType`.

---

## Agent 06: Art Director Agent (`ART_DIRECTOR`)
- **System Purpose**: Establishes visual identity, color palette, typography hierarchy, lighting atmosphere, and banned tropes.
- **Mental Model**: Visual Designer and Colorist.
- **Inputs**: `ProductionMode`
- **Outputs**: `visual-bible.json`
- **Gating Invariant**: Flat gray fills and unstyled generic clip-art are strictly banned.

---

## Agent 07: Asset Research Agent (`ASSET_RESEARCH`)
- **System Purpose**: Discovers authentic public domain NASA b-roll, Wikimedia Commons illustrations, and CC-licensed media.
- **Mental Model**: Archival Researcher & Licensing Clearance Officer.
- **Inputs**: `storyboard.json`
- **Outputs**: `asset-manifest.json`
- **Gating Invariant**: Zero copyrighted YouTube rips. All assets must have documented public domain or commercial royalty-free license status.

---

## Agent 08: Image Generation Agent (`IMAGE_GENERATION`)
- **System Purpose**: Synthesizes custom SVG vector illustrations, orbital diagrams, and astronomical telemetry maps.
- **Mental Model**: Technical Scientific Illustrator.
- **Inputs**: `storyboard.json`, `visual-bible.json`, `asset-manifest.json`
- **Outputs**: Verified vector SVGs in `public/assets/`.

---

## Agent 09: Video Generation Agent (`VIDEO_GENERATION`)
- **System Purpose**: Generates and verifies short video clips, trims raw b-roll, and validates stream codecs.
- **Mental Model**: Motion Video Technician.
- **Inputs**: `storyboard.json`, `asset-manifest.json`
- **Outputs**: Verified video streams in `public/assets/`.
- **Gating Invariant**: Static image zooms must NEVER be misrepresented as video generation.

---

## Agent 10: Animation Agent (`ANIMATION`)
- **System Purpose**: Generates Remotion components, SVG coordinate graphs, particle motions, and dynamic camera pans.
- **Mental Model**: Remotion Motion Designer & SVG Shader Developer.
- **Inputs**: `storyboard.json`, `visual-bible.json`
- **Outputs**: Procedural SVG and Remotion code components.

---

## Agent 11: Voice Director & TTS Agent (`VOICE_DIRECTOR`)
- **System Purpose**: Generates natural neural speech and word-level timestamps (`startMs`, `endMs`) for frame-synchronized subtitles.
- **Mental Model**: Voiceover Casting Director & Audio Engineer.
- **Inputs**: `script.json`
- **Outputs**: `narration.mp3`, `captions.json`

---

## Agent 12: Sound Design Agent (`SOUND_DESIGN`)
- **System Purpose**: Selects ambient drones, sub-bass impacts, and mixes background music ducked at 12–15% under dialogue.
- **Mental Model**: Film Sound Designer & Mastering Engineer.
- **Inputs**: `NarrationTrack`
- **Outputs**: `audio-manifest.json`
- **Gating Invariant**: Integrated loudness must target -14 LUFS (YouTube broadcast standard) with zero master clipping.

---

## Agent 13: Editor & Subtitle Agent (`EDITOR_SUBTITLE`)
- **System Purpose**: Assembles timeline clips, visual layers, kinetic typography, and transitions into a complete Remotion composition.
- **Mental Model**: Lead Video Editor and Motion Compositor.
- **Inputs**: `storyboard.json`, `audio-manifest.json`
- **Outputs**: `timeline.json`

---

## Agent 14: Quality Assurance Agent (`QUALITY_ASSURANCE`)
- **System Purpose**: Executes objective technical and aesthetic audit via FFprobe, stream analyzers, and schema checkers.
- **Mental Model**: Chief Technical QA Inspector.
- **Inputs**: Full project state & render outputs.
- **Outputs**: `qa-report.json`
- **Gating Invariant**: Project cannot pass if audio is missing, black frames exceed threshold, or video streams fail container probes.

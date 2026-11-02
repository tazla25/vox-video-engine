# End-to-End Production Workflow & Operational Guide

This document describes the exact step-by-step lifecycle of producing a video with `story-studio`.

---

## 🔁 Step-by-Step Production Sequence

```
1. Initiation (CLI)
   │
   ▼
2. Topic Research & Hypothesis Formulated (Agent 02)
   │
   ▼
3. Scriptwriting: Hook, Conflict, Resolution (Agent 03)
   │
   ▼
4. Story Editorial Audit: Pacing & Retention (Agent 04)
   │
   ▼
5. Visual Identity Defined: Visual Bible (Agent 06)
   │
   ▼
6. Shot-by-Shot Storyboard Generation (Agent 05)
   │
   ▼
7. Media Asset Clearance & B-Roll Research (Agent 07)
   │
   ▼
8. Parallel Visual Synthesis (Agents 08, 09, 10)
   ├── Image Generation (SVG/Illustration)
   ├── Video Generation & B-Roll Verification
   └── Motion Graphics & Procedural Animation
   │
   ▼
9. Neural Voiceover & Sound Design (Agents 11, 12)
   ├── Edge-TTS Word-Level Timestamp Alignment
   └── Ambient Sound Mixing & Ducking (-14 LUFS)
   │
   ▼
10. Timeline Compositing & Kinetic Subtitles (Agent 13)
   │
   ▼
11. Technical & Broadcast QA Audit (Agent 14)
   │
   ▼
12. MANDATORY HUMAN REVIEW GATE (State: AWAITING_REVIEW)
   ├── Option A: `story-studio revise <id> --instruction "..."` ──► Loops to Step 8
   └── Option B: `story-studio approve <id>` ──► Triggers Cloud Runner
   │
   ▼
13. GitHub Actions Cloud Execution (16GB Runner)
   ├── Headless Remotion Chromium Rasterization
   ├── Multi-Threaded FFmpeg Encoding (1080p 60fps)
   └── Artifact Upload (Retained 7 days)
   │
   ▼
14. Final Download (`story-studio download <id>`)
```

---

## 🛠️ Typical CLI Walkthrough

### 1. Run Doctor Audit
```bash
story-studio doctor
```

### 2. Create Video Project
```bash
story-studio create "What Would Happen If the Sun Suddenly Disappeared?" \
  --mode science \
  --duration 4m \
  --aspect 16:9
```

### 3. Inspect Pre-Production & Preview Package
```bash
story-studio preview <PROJECT_ID>
story-studio status <PROJECT_ID>
```

### 4. Request Targeted Revisions (Optional)
```bash
story-studio revise <PROJECT_ID> --instruction "Emphasize the geothermal vents in the ocean trench scene."
```

### 5. Formally Approve for Cloud Rendering
```bash
story-studio approve <PROJECT_ID>
```
*Dispatches GitHub Actions workflow `render.yml` on a 16GB runner.*

### 6. Monitor Cloud Run & Download Final MP4
```bash
gh run list --repo tazla25/vox-video-engine
story-studio download <PROJECT_ID>
```

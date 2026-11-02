# Multi-Agent Video Production Studio Architecture

**System**: `story-studio`  
**Execution Runtime**: TypeScript (Node.js 26.4.0) on Android Termux (Control Terminal) + GitHub Actions 16GB Ubuntu Runners (Cloud Renderer)  
**Coordination Model**: 14 Specialist Agents under Executive Director Orchestration  

---

## 1. System Topology & Dual-Tier Execution Engine

```
                                  ┌──────────────────────────────┐
                                  │   User Input (Single Topic)  │
                                  └──────────────┬───────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       TIER 1: TERMUX CONTROL TERMINAL (<80MB RAM)                           │
│                                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              story-studio CLI Entrypoint                              │  │
│  └──────────────────────────────────────────┬────────────────────────────────────────────┘  │
│                                             │                                               │
│                                             ▼                                               │
│  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                    (1) Executive Director Agent & State Machine                       │  │
│  │           [QUEUED] ──► [RUNNING] ──► [AWAITING_REVIEW] ──► [APPROVED] ──► [COMPLETED]   │  │
│  └──────────────────────────────────────────┬────────────────────────────────────────────┘  │
│                                             │                                               │
│         ┌───────────────────────────────────┼───────────────────────────────────┐           │
│         ▼                                   ▼                                   ▼           │
│  [Pre-Production Swarm]           [Visual Production Swarm]             [Audio & Assembly]  │
│  (2) Research Agent               (7) Asset Research Agent              (11) Voice Director │
│  (3) Scriptwriter Agent           (8) Image Generation Agent            (12) Sound Design   │
│  (4) Story Editor Agent           (9) Video Generation Agent            (13) Editor/Subtitle│
│  (5) Storyboard Agent             (10) Animation Agent                                      │
│  (6) Art Director Agent                                                                     │
│                                             │                                               │
│                                             ▼                                               │
│                                ┌─────────────────────────┐                                  │
│                                │ (14) QA Auditor Agent   │                                  │
│                                └────────────┬────────────┘                                  │
│                                             │                                               │
│                                             ▼                                               │
│                                ┌─────────────────────────┐                                  │
│                                │   MANDATORY HUMAN GATE  │                                  │
│                                └────────────┬────────────┘                                  │
└─────────────────────────────────────────────┼───────────────────────────────────────────────┘
                                              │ (Authorized via `story-studio approve`)
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                 TIER 2: GITHUB ACTIONS CLOUD RENDERING (16GB RAM / 4 vCPUs)                 │
│                                                                                             │
│  • Automated 4K/1080p NASA & Pexels Asset Ingestion                                         │
│  • Headless Chromium Frame Rasterization via Remotion                                       │
│  • Multi-Threaded FFmpeg H.264 / ProRes Encoding (1080x1920 or 1920x1080 @ 60fps)          │
│  • Broadcast Audio Normalization (-14 LUFS Target)                                          │
│  • Artifact Upload & Checksum Verification                                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 14 Specialist Roles & Responsibilities

| # | Role Name | Primary Responsibility | Input Contract | Output Contract |
| :- | :--- | :--- | :--- | :--- |
| **1** | **Executive Director** | Coordinates pipeline, manages state machine, enforces checkpoints | User Topic & Config | `production-report.json` |
| **2** | **Research Agent** | Mines verified facts, citations, uncertainties, and narrative beats | `topic: string` | `research-report.json` |
| **3** | **Scriptwriter Agent** | Crafts cinematic, paced voiceover with strong curiosity hooks | `research-report.json` | `script.json`, `script.md` |
| **4** | **Story Editor Agent** | Audits retention score, repetition, pacing, and flow | `script.json` | `script-review.json` |
| **5** | **Storyboard Agent** | Deconstructs script into shot-by-shot visual sequences & rationales | `script.json` | `storyboard.json` |
| **6** | **Art Director Agent** | Defines color palette, lighting, typography, and motion guidelines | Production Mode | `visual-bible.json` |
| **7** | **Asset Research Agent** | Discovers & licenses verified NASA/public domain b-roll | `storyboard.json` | `asset-manifest.json` |
| **8** | **Image Gen Agent** | Synthesizes custom SVG diagrams and textures | Storyboard & Visual Bible | Bespoke SVG & PNG assets |
| **9** | **Video Gen Agent** | Validates video streams and prepares clip references | Storyboard & Manifest | Video motion assets |
| **10** | **Animation Agent** | Generates procedural vector animations & kinetic camera motions | Storyboard & Visual Bible | Animated SVG & Canvas specs |
| **11** | **Voice Director Agent** | Synthesizes neural TTS voiceover with word-level timestamps | `script.json` | `narration.mp3`, `captions.json` |
| **12** | **Sound Design Agent** | Curates atmospheric drones, impacts, and acoustic balance | `narration.mp3` | `audio-manifest.json` |
| **13** | **Editor & Subtitle** | Assembles Remotion timeline, frame synchronization, captions | Storyboard & Audio | `timeline.json` |
| **14** | **Quality Assurance** | Independent story, visual, audio, and FFprobe technical audit | Production state | `qa-report.json` |

---

## 3. Data Flow & Checkpoint Recovery

1. **State Persistence**: Every state mutation is written to `projects/<projectId>/state.json`.
2. **Deterministic Checkpointing**: If a pipeline halts or the user requests a revision, the orchestrator detects existing outputs in `projects/<projectId>/` and resumes execution from the exact point of interruption without repeating completed stages.
3. **Infinite Loop Protection**: State machine enforces a hard ceiling of 5 revision iterations. If exceeded, state transitions to `FAILED` with an explanatory diagnostic trace.

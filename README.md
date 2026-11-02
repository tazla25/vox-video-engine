# 🎬 Multi-Agent AI Video Production Studio (`story-studio`)

> **Autonomous Multi-Agent AI Video Studio** powered by **Antigravity CLI 1.4.12** and **GitHub Actions 16GB Cloud Runners**.  
> Transforms a single topic into a professional 3–5 minute YouTube video through 14 specialist agents with hybrid visual composition and mandatory human review.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Remotion](https://img.shields.io/badge/Remotion-4.0-red.svg)](https://www.remotion.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-v26.4-green.svg)](https://nodejs.org/)
[![Cloud Runner](https://img.shields.io/badge/Cloud%20Runner-16GB%20RAM-purple.svg)](https://github.com/features/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ⚡ Quick Start in 60 Seconds

### 1. Diagnostic Audit
Verify your environment, Antigravity CLI, FFmpeg, and cloud credentials:
```bash
story-studio doctor
```

### 2. Create Video from Single Topic
```bash
story-studio create "What Would Happen If the Sun Suddenly Disappeared?" \
  --mode science \
  --duration 4m \
  --aspect 16:9
```

### 3. Inspect Review Package & Preview
```bash
story-studio preview <PROJECT_ID>
story-studio status <PROJECT_ID>
```

### 4. Authorize Cloud Rendering
```bash
story-studio approve <PROJECT_ID>
```
*Dispatches GitHub Actions 16GB cloud runner to compile 1080p 60fps MP4.*

---

## 🏗️ The 14 Specialist Agents

Every video is autonomously produced through a coordinated team of 14 specialist roles:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   (1) EXECUTIVE DIRECTOR AGENT                         │
│  State Machine • Task Queues • Checkpoints • Retries • Human Gate      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼──────────────────────────────┐
    ▼                               ▼                              ▼
[Pre-Production]           [Visual Production]             [Audio & Editing]
(2) Research Agent         (7) Asset Research Agent        (11) Voice Director
(3) Scriptwriter Agent     (8) Image Generation Agent      (12) Sound Design
(4) Story Editor Agent     (9) Video Generation Agent      (13) Editor & Subtitles
(5) Storyboard Agent       (10) Animation Agent
(6) Art Director Agent                      │
                                            ▼
                             (14) QUALITY ASSURANCE AGENT
                             FFprobe • Stream Checks • Container Probe
                                            │
                                            ▼
                             MANDATORY HUMAN APPROVAL GATE
```

---

## 🎨 Production Modes & Hybrid Visual Engine

- **PSYCHOLOGY EXPLAINER**: Emotional storytelling, cinematic framing, visual metaphors, and atmospheric sound.
- **SCIENCE EXPLAINER**: Physical laws, vector diagrams, orbital telemetry, infographics, and 4K scientific b-roll.
- **ANIMATED STORY**: Character movement, dynamic camera transitions, and environmental continuity.
- **HYBRID**: Intelligently fuses real 4K footage with vector animation and procedural motion graphics.

---

## 📚 Complete Technical Documentation

- 🏛️ [Architecture & Topologies](file:///data/data/com.termux/files/home/vox-video-engine/docs/ARCHITECTURE.md)
- 🤖 [14 Specialist Agent Specifications](file:///data/data/com.termux/files/home/vox-video-engine/docs/AGENT_SPECIFICATIONS.md)
- ⚡ [Antigravity Capabilities Audit](file:///data/data/com.termux/files/home/vox-video-engine/docs/ANTIGRAVITY_CAPABILITIES.md)
- 🔁 [Production Workflow Guide](file:///data/data/com.termux/files/home/vox-video-engine/docs/WORKFLOW.md)
- 🔌 [Provider Setup & API Adapters](file:///data/data/com.termux/files/home/vox-video-engine/docs/PROVIDER_SETUP.md)
- 📱 [Android Termux Optimization](file:///data/data/com.termux/files/home/vox-video-engine/docs/TERMUX_SETUP.md)
- ☁️ [GitHub Actions Cloud Infrastructure](file:///data/data/com.termux/files/home/vox-video-engine/docs/GITHUB_ACTIONS_SETUP.md)
- 🛡️ [Security & Redaction Protocol](file:///data/data/com.termux/files/home/vox-video-engine/docs/SECURITY.md)
- ⚖️ [Media Licensing & Provenance](file:///data/data/com.termux/files/home/vox-video-engine/docs/LICENSING.md)
- 🧪 [Testing & Automated Verification](file:///data/data/com.termux/files/home/vox-video-engine/docs/TESTING.md)
- 🔍 [Troubleshooting Matrix](file:///data/data/com.termux/files/home/vox-video-engine/docs/TROUBLESHOOTING.md)
- ⚠️ [Known Limitations](file:///data/data/com.termux/files/home/vox-video-engine/docs/KNOWN_LIMITATIONS.md)
- 📊 [Implementation Status & Tracker](file:///data/data/com.termux/files/home/vox-video-engine/docs/IMPLEMENTATION_STATUS.md)

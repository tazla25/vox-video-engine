# Feature Specification: Cloud-Rendered Vox-Style Motion Graphics Engine

**Feature Branch**: `001-cloud-video-engine`  
**Created**: 2026-11-02  
**Status**: Approved (Locked by User Decision: 1-A 9:16 Vertical, 2-A Space Deep Science, 3-A English Christopher Neural)  
**Input**: User Request: "Build a high-aesthetic programmatic video engine using Claude/Antigravity and Remotion, eliminating mobile RAM crashes by leveraging GitHub Actions 16GB RAM cloud runner."

---

## 🎯 Executive Summary & Objectives

Build a zero-mobile-load, high-aesthetic programmatic video creation pipeline. Mobile Termux acts strictly as a lightweight creative studio (generating scripts, voiceover, and React components with <80MB RAM), while heavy video rendering (1080p 60fps frame compilation and ffmpeg encoding) is 100% offloaded to GitHub Actions' free 16 GB RAM / 4-core cloud runners.

---

## 👤 User Scenarios & Prioritized User Stories

### User Story 1 - 15-Second High-Aesthetic Vox Motion Graphic Slice (Priority: P1 - MVP)

As a creator on mobile Termux, I want to define a 15-second high-density explainer video and have it rendered in the cloud by GitHub Actions into a downloadable 1080p 60fps MP4 video, so I can produce studio-grade motion graphics without crashing my phone's RAM.

- **Why this priority**: Proves the entire end-to-end cloud pipeline: Script $\to$ Audio/Timestamps $\to$ Remotion 5-Layer Composition $\to$ GitHub Actions 16GB Runner $\to$ Downloadable MP4.
- **Independent Test Criteria**: A 15-second composition triggers a GitHub Actions workflow, finishes with 0 exit code, and produces an MP4 artifact with smooth 60fps spring physics and audio sync.

#### Acceptance Scenarios:
1. **Given** a Remotion project with a 15-second 5-layer scene stack (Mesh background, Kinetic typography, 3D perspective tilt, spring easing, and film grain),  
   **When** pushed to GitHub or triggered via workflow dispatch,  
   **Then** GitHub Actions spins up an `ubuntu-latest` 16GB runner, completes rendering in under 90 seconds, and uploads the MP4 as a downloadable workflow artifact.
2. **Given** local Termux execution,  
   **When** generating script, edge-tts audio, and Remotion scene code,  
   **Then** Termux RAM consumption remains strictly under 100 MB with zero Android LMK kills.

---

### User Story 2 - Automated Audio & Word-Level Timestamp Sync (Priority: P2)

As a creator, I want free natural neural voiceover generated automatically alongside exact word-level timestamp JSON, so every spoken word animates and highlights on screen in frame-locked synchronization.

- **Why this priority**: Vox-style videos rely entirely on tight kinetic typography locked to narration.
- **Independent Test Criteria**: Running `python3 scripts/generate_voice.py "Text"` generates `audio.mp3` and `captions.json` with word-level start/end timestamps.

#### Acceptance Scenarios:
1. **Given** a 3-sentence script,  
   **When** processed through Microsoft Edge-TTS and Whisper/captions parser,  
   **Then** produce high-fidelity MP3 and exact millisecond/frame timestamps for every spoken word.

---

### User Story 3 - 1-Click Telegram / Cloud Delivery (Priority: P3)

As a mobile user, I want the finished MP4 video delivered directly to my phone via Telegram bot or direct GitHub release link, so I don't have to navigate web dashboards to download files.

- **Why this priority**: Seamless mobile workflow efficiency.
- **Independent Test Criteria**: GitHub Action automatically POSTs the rendered MP4 file to a designated Telegram chat ID or creates a GitHub Release.

---

## 🚫 Non-Goals & Out of Scope (Strict Invariants)

1. **NO Local Video Rendering on Termux**: Never run `npx remotion render` directly inside Termux on Android. All rendering belongs exclusively in GitHub Actions cloud.
2. **NO 3D Character Rigging / Walk-Cycles**: This engine produces high-end 2D/2.5D documentary motion graphics (kinetic type, charts, maps, 3D paper tilt). It is not for Blender cartoon characters.
3. **NO Paid API Subscriptions Required**: Uses 100% free compute (GitHub Actions 16GB RAM) and free neural TTS (`edge-tts`).

---

## ❓ Critical Clarifications (Max 3 Markers)

### Clarification 1: Target Video Aspect Ratio
| Option | Answer | Implications |
|---|---|---|
| **A (Recommended)** | **9:16 Vertical (1080x1920)** | Optimized for YouTube Shorts, Instagram Reels, TikTok (highest organic virality, mobile-native). |
| B | 16:9 Landscape (1920x1080) | Optimized for standard YouTube documentary / deep-dive explainer videos. |
| C | Dual-Mode Template | Master composition easily toggled between 9:16 and 16:9 via config. |

### Clarification 2: First Prototype Topic / Niche
| Option | Answer | Implications |
|---|---|---|
| **A (Recommended)** | **Space / Deep Science** (e.g., "Why Space Is Pitch Black" or "How Spacecraft Survive Re-entry") | Visually stunning, matches Suman's ISRO passion, high Vox-style visual impact (stars, heat shield, charts). |
| B | AI / Math / IITM (e.g., "The Geometry of Neural Networks" or "Why $e^{i\pi} + 1 = 0$") | Academic, educational, high student retention. |
| C | Tech / Micro-SaaS (e.g., "How Stripe Won the Internet") | Business and engineering focus. |

### Clarification 3: Primary Narration Voice & Language
| Option | Answer | Implications |
|---|---|---|
| **A (Recommended)** | **English (Natural Neural: Christopher / Brian)** | Global reach, standard Vox documentary feel, works flawlessly with word-level caption alignment. |
| B | Bengali / Banglish Neural (`bn-IN-BashkarNeural`) | Localized audience, authentic native tone. |
| C | Custom Voiceover File | User records or supplies their own voice file. |

---

## 📊 Success Criteria

- **SC-001**: 100% zero OOM crashes on Android Termux during generation and pipeline triggers.
- **SC-002**: GitHub Actions renders a 15-second 1080p 60fps video in $< 90$ seconds.
- **SC-003**: All animations follow the 5-layer motion graphics craft (never linear interpolation, always spring physics, always staggered entrances).
- **SC-004**: Downloadable MP4 artifact verified clean via `ffprobe` (H.264 High Profile, AAC Stereo, 60.0 fps).

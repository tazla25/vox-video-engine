# Provider Configuration & API Setup Guide

`story-studio` is architected with a provider-agnostic adapter layer. It functions completely out of the box using free public and neural adapters, but can seamlessly connect to external third-party API providers when configured.

---

## 🔑 Environment Variables Reference

Create a `.env` file in the project root based on `.env.example`:

```bash
# GitHub Infrastructure Access
GITHUB_REPOSITORY=tazla25/vox-video-engine
GH_TOKEN=ghp_your_github_token_here

# LLM Providers (Optional - Antigravity CLI operates natively without external keys)
GEMINI_API_KEY=AIzaSy_your_gemini_key_here
OPENAI_API_KEY=sk-proj_your_openai_key_here

# Speech & Voiceover (Optional - Edge-TTS operates natively without keys)
ELEVENLABS_API_KEY=your_elevenlabs_key_here
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# Stock Footage & Media Search (Optional - NASA Public Domain catalog operates natively)
PEXELS_API_KEY=your_pexels_api_key_here

# Debug & Telemetry
DEBUG=false
VERBOSE=false
```

---

## 🔌 Default vs Third-Party Adapters

| Capability | Default Out-of-the-Box Adapter | Optional Paid / Hosted Adapter | Cost & Constraints |
| :--- | :--- | :--- | :--- |
| **LLM Reasoning** | Antigravity CLI (`agy -p`) + Deterministic Engine | Google Gemini 1.5/2.0 Pro, OpenAI GPT-4o | Zero cost locally via `agy` |
| **Text-to-Speech** | Microsoft Edge Neural Speech (`edge-tts`) | ElevenLabs Multilingual v2, OpenAI TTS-HD | Zero cost, realistic neural voices with word timestamps |
| **Footage / B-Roll** | NASA Scientific Visualization Studio (Public Domain) | Pexels Video API, Storyblocks | Free, NASA-credited commercial use |
| **Graphics** | Procedural SVG & Remotion Coordinate Engines | Stability AI SDXL, OpenAI DALL-E 3, Midjourney | Zero cost, razor-sharp scalable vector graphics |
| **Rendering** | GitHub Actions Ubuntu Runner (16GB RAM / 4 vCPUs) | AWS EC2 G4dn GPU Runners | Free for public repos on GitHub |

---

## 🛡️ Fallback Hierarchy

If an external provider key is omitted or hits rate limits:
1. The studio automatically logs a clear warning without crashing.
2. The orchestrator routes the request to the verified local fallback adapter (e.g. Edge-TTS or NASA Public Domain).
3. The QA Agent marks the report with a warning and preserves the provenance trace in `asset-manifest.json`.

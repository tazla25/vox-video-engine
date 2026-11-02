# Antigravity CLI & Multi-Agent Capabilities Audit

**Date**: 2026-11-02  
**Antigravity Version**: `1.4.12`  
**Host Environment**: Android Termux (aarch64)  
**Binary Location**: `/data/data/com.termux/files/home/.local/bin/agy`  

---

## 1. Verified Native Antigravity Capabilities

Through empirical execution and CLI interrogation (`agy --help`, `agy agents`, `agy models`), the following native features are verified:

### A. Execution Modes
- `--print`, `-p`: Run a single prompt non-interactively and output response directly to stdout.
- `--prompt-interactive`, `-i`: Run an initial prompt interactively and continue session.
- `--output-format [text | json | stream-json]`: Structured output formats.
- `--json-schema <file_or_string>`: Native JSON schema enforcement on CLI responses (enables 100% deterministic type safety from LLM outputs).
- `--agent <agent_name>`: Specify a dedicated agent persona/configuration for the session.
- `--model <model_id>`: Set target LLM (`gemini-3.8-flash-high`, `gemini-3.8-flash-medium`, `gemini-3.8-flash-low`, `claude-sonnet-4-6`, `claude-opus-4-6-thinking`, `gpt-oss-120b-medium`).
- `--effort <low | medium | high | xhigh | max>`: Control reasoning effort / thinking budget.
- `--dangerously-skip-permissions`: Unattended tool execution for automated CI/orchestration pipelines.

### B. Pre-Configured Native Agents
Empirically listed via `agy agents`:
1. `code-reviewer`: Senior multi-axis code reviewer.
2. `security-auditor`: Security vulnerability detection & threat modeling.
3. `test-engineer`: QA strategy, test writing, and test coverage analysis.
4. `web-performance-auditor`: Core Web Vitals, performance profiling, and optimization.

### C. Native Tooling & Subagent Invocation (Interactive Session Level)
In an active Antigravity session, the system exposes native tool calls:
- `invoke_subagent`: Asynchronously launch specialized subagents with distinct roles and isolated contexts.
- `define_subagent`: Programmatically define new subagent types during session runtime with custom system prompts and tool access.
- `manage_subagents`: List active subagents, send messages, or terminate subagents.
- `send_message`: Agent-to-agent inter-process communication.

---

## 2. Software-Managed Orchestration Layer vs Native Agent Boundaries

Because the video studio requires 14 specialized production roles (Executive Director, Research, Scriptwriter, Story Editor, Storyboard, Art Director, Asset Research, Image Gen, Video Gen, Animation, Voice Director/TTS, Sound Design, Editor/Subtitles, and QA), we establish a clear architectural boundary:

### Architecture Matrix:
| Agent Role | Native Antigravity Integration | Software-Managed Orchestration Engine |
| :--- | :--- | :--- |
| **(1) Executive Director** | Native Antigravity Subagent / agy CLI | Orchestrates state machine, task queues, dependencies |
| **(2) Research Agent** | `agy -p` with `--json-schema` & web tools | Validates source credibility, outputs `research-report.json` |
| **(3) Scriptwriter Agent** | `agy -p` with `--json-schema` & creative prompts | Generates scene-by-scene script with hook and pacing |
| **(4) Story Editor Agent** | `agy -p` with `--json-schema` | Evaluates retention, flow, and pacing; triggers revisions |
| **(5) Storyboard Agent** | `agy -p` with `--json-schema` | Transforms script into shot-by-shot visual specifications |
| **(6) Art Director Agent** | `agy -p` with `--json-schema` | Defines color palette, visual styles, and typography |
| **(7) Asset Research Agent** | `agy -p` + Search Providers (Pexels, NASA, Wikimedia) | Searches and licenses verified footage/images |
| **(8) Image Gen Agent** | Image Provider Interface (SDXL, Imagen, DALL-E, Mock) | Generates illustrations, textures, and scene backgrounds |
| **(9) Video Gen Agent** | Video Provider Interface (Runway, Luma, Kling, Mock) | Generates short cinematic clips for visual continuity |
| **(10) Animation Agent** | Remotion React & SVG/Canvas Code Generator | Programmatic 2D/3D animations, camera pans, and graphs |
| **(11) Voice Director & TTS** | Edge-TTS, ElevenLabs, or OpenAI TTS Provider | Generates audio narration and word-level timestamps |
| **(12) Sound Design Agent** | Audio Provider / Procedural Sound Assembler | Mixes background music, ambient drones, and SFX |
| **(13) Editor & Subtitles** | Remotion Timeline Assembler & FFmpeg | Combines audio, visuals, captions, and transitions |
| **(14) Quality Assurance** | Native `test-engineer` + Deterministic FFprobe validator | Multi-layer visual, audio, narrative, and technical QA |

---

## 3. Verified Execution Limits & Safeguards
1. **Single-topic Entry**: `story-studio create "<topic>" --mode <mode> --duration <duration> --aspect <aspect>` triggers the orchestration engine.
2. **Zero Hallucinated Commands**: The CLI interacts only with verified `agy`, `gh`, `git`, `node`, `npm`, and `ffmpeg` binaries.
3. **Deterministic Verification**: Every stage is validated by Zod JSON schemas and physical media checks (file size > 0, ffprobe streams present, valid frame rates).

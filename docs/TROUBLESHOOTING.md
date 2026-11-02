# Troubleshooting & Diagnostic Guide

This guide provides rapid diagnosis and solutions for common operational issues encountered in `story-studio`.

---

## 🔍 Issue Matrix & Resolutions

### 1. `story-studio doctor` reports missing `edge_tts`
- **Cause**: Python `edge-tts` package is not installed in the Termux environment.
- **Resolution**:
  ```bash
  pip install edge-tts
  ```
- **Fallback**: Studio automatically runs in Mock TTS mode generating synthetic test waveforms with word timestamps.

### 2. GitHub CLI `gh: authentication failed`
- **Cause**: Expired or missing GitHub Personal Access Token (PAT).
- **Resolution**:
  Export your valid token in Termux or configure with:
  ```bash
  export GH_TOKEN=your_personal_access_token_here
  gh auth status
  ```

### 3. Termux Process Killed by Android (Signal 9 / OOM)
- **Cause**: Running heavy Remotion or FFmpeg video compilation locally on smartphone.
- **Resolution**:
  Never execute `remotion render` locally on Termux. Use `story-studio approve <projectId>` to offload all video rasterization to GitHub Actions' free 16GB cloud runner.

### 4. `Error: Project is in state 'NEEDS_REVISION'`
- **Cause**: A revision request was logged and the project requires re-evaluation before approval.
- **Resolution**:
  Run:
  ```bash
  story-studio create "<same_topic>"
  ```
  The orchestrator will detect the checkpoint, apply the revision, update the affected assets, and bring the project back to `AWAITING_REVIEW`.

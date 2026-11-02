# Android Termux Setup & Environment Guide

This guide ensures flawless execution on Android Termux (aarch64) without memory pressure or OS task termination.

---

## 📱 Hardware & OS Constraints on Termux

- **Architecture**: `aarch64` (ARM 64-bit).
- **RAM Constraints**: Typical mobile device free RAM is 1.0–2.0 GB.
- **Android LMK (Low Memory Killer)**: Android aggressively terminates foreground/background apps that spike memory above 300–400 MB.
- **The Golden Rule**: **Termux is strictly the Control Terminal and Local Orchestrator.** Heavy Chromium frame rasterization and multi-gigabyte video encoding are offloaded to GitHub Actions cloud runners.

---

## 🛠️ Required Package Installation

Run the following in Termux:

```bash
# 1. Update Termux package repositories
pkg update -y && pkg upgrade -y

# 2. Install essential development binaries
pkg install -y nodejs-lts python git ffmpeg gh

# 3. Verify versions
node -v      # v20+ or v26+
python3 -V   # 3.11+
ffmpeg -version | head -n 1 # FFmpeg 7+ or 8+
gh --version # 2.50+

# 4. Install Edge-TTS for free neural narration
pip install edge-tts
```

---

## 🔗 Linking the CLI

The project provides a globally accessible wrapper in `~/.local/bin/story-studio`:

```bash
mkdir -p ~/.local/bin
cat << 'EOF' > ~/.local/bin/story-studio
#!/bin/bash
exec node --experimental-strip-types /data/data/com.termux/files/home/vox-video-engine/src/studio/cli/index.ts "$@"
EOF
chmod +x ~/.local/bin/story-studio
```

Verify the installation:
```bash
story-studio doctor
```

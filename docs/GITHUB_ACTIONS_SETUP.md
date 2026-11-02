# GitHub Actions Cloud Rendering Infrastructure Guide

This guide details the cloud rendering pipeline deployed in `.github/workflows/render.yml`.

---

## ☁️ Why GitHub Actions?

1. **Massive Cloud Hardware**: GitHub Actions `ubuntu-latest` provides **4 vCPUs, 16 GB of RAM, and 14 GB of high-speed SSD storage**.
2. **Zero Mobile Thermal / Memory Throttling**: Eliminates smartphone heating, battery drain, and Android LMK crashes.
3. **Automated Remotion Bundling**: Headless Chrome executes in a true Linux environment with hardware-accelerated font rendering and WebGL.

---

## 📋 Workflow Dispatch Configuration

Workflow: `.github/workflows/render.yml`

```yaml
name: Render Vox Video on 16GB Cloud

on:
  workflow_dispatch:
    inputs:
      compositionId:
        description: 'Remotion Composition ID to render'
        required: true
        default: 'VoxShort'
      codec:
        description: 'Video Codec (h264 or prores)'
        required: true
        default: 'h264'
  push:
    branches:
      - main
```

### Steps Executed in Cloud:
1. **Checkout Repository**: Pulls latest codebase, audio tracks, and component trees.
2. **Setup Node.js 20**: Configures Node runtime with npm cache.
3. **Install System FFmpeg**: Installs full Linux FFmpeg build via `apt-get install -y ffmpeg`.
4. **Fetch Real NASA 4K/HD Footage**: Downloads high-resolution NASA b-roll assets (`sun_broll.mp4`, `earth_broll.mp4`, `void_broll.mp4`).
5. **Render Remotion Video**:
   ```bash
   npx remotion render src/index.ts VoxShort out/video.mp4 --codec h264 --crf 17 --scale 1
   ```
6. **Upload Video Artifact**: Uploads `out/video.mp4` as workflow artifact `vox-space-video-1080p` with 7-day retention.

---

## 🔒 Security Best Practices for Cloud Workflows

1. **Least-Privilege Permissions**: Workflows run with default read-only GITHUB_TOKEN permissions unless explicitly granted.
2. **Never Expose Secrets in Pull Requests**: Workflows triggered by `pull_request` from forks do not have access to repository secrets.
3. **Artifact Verification**: Always verify SHA-256 checksums of artifacts downloaded from GitHub Actions.

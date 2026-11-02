# Known Limitations & Boundary Constraints

This document honestly outlines the current operational boundaries of `story-studio`.

---

## ⚠️ Known Boundaries & Current Limitations

1. **Local Termux GPU Rendering Unavailable**:
   - Android Termux lacks native desktop Vulkan/Chromium GPU acceleration for Remotion.
   - **Mitigation**: Local previews generate static SVG diagrams, audio, and manifests; 1080p 60fps MP4 compilation is executed on GitHub Actions cloud runners.

2. **Edge-TTS Rate Limits / Network Latency**:
   - Microsoft Edge TTS is a free public network service. Extreme bursts of 10+ minutes of continuous text may occasionally encounter transient network timeouts.
   - **Mitigation**: The Voice Director Agent chunks scripts into narrative sections and implements a 90-second subprocess timeout.

3. **External Generative AI Video Cost & Availability**:
   - Real-time AI video generation providers (e.g. Runway Gen-3, Luma Dream Machine) require paid third-party API keys.
   - **Mitigation**: In the absence of paid video generation keys, the Asset Research Agent defaults to NASA's 4K public domain space footage archive and high-density procedural Remotion motion graphics.

4. **GitHub Actions Concurrent Job Quotas**:
   - Free GitHub accounts are subject to concurrent job limits (typically 20 concurrent jobs).
   - **Mitigation**: The CLI queues cloud rendering dispatches sequentially.

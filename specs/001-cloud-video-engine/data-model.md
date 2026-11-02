# Data Model: Cloud Video Engine

**Feature**: `001-cloud-video-engine`  
**Date**: 2026-11-02  

---

## 1. Scene Definition & Video Props (`contracts/video-props.json`)

```typescript
export interface WordCaption {
  word: string;
  startMs: number;
  endMs: number;
}

export interface VideoScene {
  id: string;
  title: string;
  subtitle?: string;
  durationInFrames: number;
  layout: 'hook_title' | 'diagram_scatter' | 'split_comparison' | 'conclusion_impact';
  highlightWords: string[];
  graphicType: 'sun_earth_scattering' | 'vacuum_void' | 'rayleigh_graph';
}

export interface VideoMetadata {
  title: string;
  fps: number; // strictly 60 fps for smooth spring curves
  width: number; // 1080
  height: number; // 1920
  durationInFrames: number;
  audioFile: string; // relative to public/
}

export interface MasterVideoProps {
  metadata: VideoMetadata;
  scenes: VideoScene[];
  captions: WordCaption[];
  theme: {
    bg: string;
    textPrimary: string;
    textAccent: string; // Highlighter yellow/cyan
    fontFamily: string;
  };
}
```

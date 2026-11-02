# Testing Strategy & Verification Guide

This document outlines the testing architecture for `story-studio`, covering unit tests, integration tests, contract assertions, and media verification.

---

## 🧪 Test Suite Hierarchy

1. **Unit & State Machine Tests** (`src/studio/tests/core.test.ts`):
   - `ProjectStateMachine`: Tests valid state progressions (`QUEUED` $\to$ `RUNNING` $\to$ `AWAITING_REVIEW` $\to$ `APPROVED`).
   - `Revision Limit Guard`: Tests prevention of infinite loops by asserting automatic transition to `FAILED` after exceeding `maxRevisionAttempts`.
   - `AgentRegistry`: Tests registration, role discovery, input/output validation, and duration metrics.
   - `TaskQueue Checkpointing`: Tests state persistence and restoration from disk (`state.json`).
   - `Data Contract Schemas`: Tests Zod parsing on project configurations and revision requests.

2. **End-to-End Orchestrator Test**:
   - Executes all 14 specialist agents sequentially.
   - Validates that outputs are generated on disk in `projects/<projectId>/`.
   - Confirms state parks at `AWAITING_REVIEW`.

3. **FFprobe Deterministic Media Validation**:
   - Analyzes `public/narration.mp3` for duration $> 5$ seconds.
   - Validates audio stream codec (`mp3` or `aac`).
   - Probes video container streams, frame rates, and dimensions.

---

## 🏃 Running the Automated Test Suite

Run the tests directly via Node:

```bash
node --experimental-strip-types --test src/studio/tests/core.test.ts
```

### Verified Test Run Output:
```
✔ 1. ProjectStateMachine enforces valid lifecycle transitions (15ms)
✔ 2. ProjectStateMachine prevents infinite revision loops (3ms)
✔ 3. AgentRegistry registers and invokes agents with execution metrics (38ms)
✔ 4. TaskQueue persists and restores state checkpoints (23ms)
✔ 5. Data Contracts validate strict Zod schemas (13ms)
ℹ tests 5 | suites 0 | pass 5 | fail 0
```

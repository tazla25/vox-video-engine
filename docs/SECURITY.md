# Security & Credential Isolation Architecture

`story-studio` enforces rigorous security boundaries across mobile Termux and cloud CI/CD execution.

---

## 🛡️ Security Invariants

1. **Zero Secret Leaks in Git**:
   - `.gitignore` strictly excludes `.env`, `*.key`, `*.pem`, `token/`, `out/*.mp4`, `temp/`.
   - Never commit API keys or PATs to version control.
2. **Automated Secret Redaction**:
   - `src/studio/core/logger.ts` scans all stdout, stderr, and file log streams against comprehensive regex patterns (`github_pat_*`, `ghp_*`, `sk-*`, `AIza*`, `Bearer *`, `token=*`, `key=*`).
   - Redacts matched credentials to `[REDACTED_SECRET]` before writing to disk or terminal.
3. **Subprocess Execution Safety**:
   - All external commands executed via Node or Python sanitize inputs to prevent shell injection.
   - Text inputs for speech synthesis are written to isolated temporary files instead of interpolated directly into raw shell argument strings.
4. **Untrusted Data Sanitization**:
   - Fact-checking and web research snippets are treated as untrusted text strings and parsed strictly through Zod schemas before entering the script pipeline.

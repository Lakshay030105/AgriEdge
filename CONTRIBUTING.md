# Contributing to AgriEdge

Thank you for your interest in contributing to **AgriEdge**! 

AgriEdge is developed by **Team LOGIC LEGION** for the **OMNIKON National Hackathon 2026**.

---

## 📜 Hackathon Contribution Guidelines

In compliance with official Omnikon Hackathon rules:
- Only registered team members (`@Sahil-web01` and `@Lakshay030105`) may commit directly to the repository during the active hackathon phases.
- Third-party contributions will be welcomed post-hackathon after public judging concludes.

---

## 🛠️ Development Workflow

1. **Fork or Clone the Repository:**
   ```bash
   git clone https://github.com/Sahil-web01/AgriEdge.git
   cd AgriEdge
   ```

2. **Branch Naming Conventions:**
   - `feat/<feature-name>`: New capabilities (e.g., `feat/grad-cam-webgl`)
   - `fix/<bug-name>`: Bug and edge case fixes (e.g., `fix/wasm-memory-leak`)
   - `docs/<doc-name>`: Documentation and research updates (e.g., `docs/reviewer-notes`)

3. **Code Quality Standards:**
   - Ensure clean formatting and linting.
   - For frontend changes, test offline responsiveness via Chrome DevTools `Network -> Offline`.
   - For ML pipelines, ensure all exported TF.js graph shards remain under `<10MB`.

4. **Pull Requests:**
   - Clearly document the problem solved, implementation rationale, and testing steps.

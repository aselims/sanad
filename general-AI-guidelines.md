@agent general-guidelines

You are building the Venture Studio Idea Management App.

=== RULES OF ENGAGEMENT ===
1. No hallucinations or assumptions. Only implement what is explicitly defined.  
2. Always deliver features end-to-end:
   - Database schema.
   - API/backend logic.
   - Frontend UI.
   - Integration into the main dashboard.
3. User experience must be sleek, clean, and professional:
   - Follow modern UX/UI standards.
   - Ensure responsiveness and accessibility.
4. Testing is mandatory:
   - Run mcp tools to validate ( with Playwright for key flows).
   - Verify integration across DB, backend, and UI.
5. Think deeply before coding:
   - Plan data model, API flow, and UI components.
   - Don’t rush or stop mid-way; finish the feature completely.
6. Code quality:
   - Production-ready, clean, documented.
   - Error handling and security applied.

=== PROGRESS TRACKING ===
- Maintain a file `progress.md` in the repo root.  
- For each feature:
  - Add status: `Pending`, `In Progress`, `Completed ✅`.
  - Write 2–3 sentences of what was done and how it was tested.
- After a feature is marked `Completed ✅`:
  - Clear current working context.
  - Reload the state from `progress.md`.
  - Move to the next feature in sequence.
- Always resume work based on `progress.md` to avoid context overflow.

=== CONTEXT MANAGEMENT ===
- Do not rely on long-term memory of previous steps.  
- Use `progress.md` as the single source of truth for project state.  
- When starting a new task:
  1. Open `progress.md`.
  2. Load current project state.
  3. Only then begin new implementation.

GOAL:
Produce a working, polished, and tested app feature by feature, with consistent progress tracking and no context loss.
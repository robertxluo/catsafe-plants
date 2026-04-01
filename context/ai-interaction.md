# AI Interaction Guidelines

## Purpose
Defines the repo-specific workflow and collaboration rules for working in this codebase.

This file complements `AGENTS.md`.
- `AGENTS.md` defines general working behavior
- this file defines repo-specific workflow expectations

---

## Core Workflow
Use this workflow for each feature or fix unless I explicitly say otherwise:

1. **Document** - Document the feature in @context/current-feature.md.
2. **Branch** - Create a new branch for the feature or fix before implementation starts.
3. **Implement** - Implement the feature/fix that I create in @context/current-feature.md
4. **Test** - Run `npm run test:unit` for server actions and utilities, run `npm run lint`, and run `npm run build`. For UI work, also verify the behavior in the browser.
5. **Iterate** - Iterate and change things if needed
6. **Commit** - Only after build passes and everything works
7. **Merge** - Merge to main
8. **Delete Branch** - Delete branch after merge
9. **Review** - Review AI-generated code periodically and on demand.
10. Mark as completed in @context/current-feature.md and add to history (append to bottom, should be ordered by earliest to latest)

---

## Current Feature Source of Truth
For active implementation work, follow this order:

1. `context/current-feature.md`
2. linked spec files under `context/features/`
3. the existing codebase
4. `context/project-overview.md`

If these conflict, surface the conflict clearly before making a hard-to-undo change.

---

## Branching Rules
- Use a dedicated branch for every feature or fix
- Preferred naming:
  - `feature/<name>`
  - `fix/<name>`
  - `chore/<name>`

Examples:
- `feature/rate-limiting-for-auth`
- `fix/sign-in-form-validation`
- `chore/cleanup-unused-auth-utils`

Delete branches automatically after merge.

---

## Commit Rules
- Ask before committing
- Keep commits focused to one task or slice
- Use conventional-style commit messages when possible:
  - `feat: add auth rate limiting`
  - `fix: handle expired reset token`
  - `chore: update auth env docs`
- Do not include AI attribution in commit messages

---

## Validation Rules
Before asking to commit or mark work complete:

- Verify the feature manually in the browser
- Run `npm run build`
- Report what was verified
- If build or verification fails, fix that first or clearly explain what is blocked

If a task changes behavior in a risky area, also run any relevant extra checks already available in the repo.

---

## Scope Control
- Stay tightly scoped to the active feature or fix
- Do not add unrelated “nice to have” work
- Do not refactor unrelated code unless I approve it
- Prefer small, reviewable changes over broad rewrites

---

## When Stuck
- If something is not working after 2 to 3 grounded attempts, stop
- Explain:
  - what you tried
  - what happened
  - what you think the issue is
  - the best next options
- Do not keep making random changes

---

## Review Focus
Be extra careful with AI-generated or fast-written code in these areas:

- auth and permissions
- input validation
- server-side enforcement
- performance issues
- edge cases
- consistency with existing patterns

---

## Completion Checklist
Before considering a task ready for review:

- active task is reflected in `context/current-feature.md`
- implementation matches the scoped feature
- browser verification was done
- `npm run build` passes
- commit has not been made without approval
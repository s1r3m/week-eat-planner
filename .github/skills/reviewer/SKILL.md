---
name: reviewer
description: Performs a comprehensive code review against project guidelines and best practices. Use when asked to "review", "check code", or "audit" changes.
---

# Code Reviewer

Review code changes against the project's specific conventions and technical architecture.

## Process

### Step 1: Gather Context

- Read the changed files and any related context (schemas, models, tests).
- Identify if the changes are **Backend** (FastAPI/Python) or **Frontend** (Vue/TS).

### Step 2: Checklist-Based Audit

Go through the following checklist based on the domain:

#### Backend (Python/FastAPI)

- [ ] **Type Hints**: Are all functions and variables correctly type-hinted for `mypy`?
- [ ] **Models**: Are SQLAlchemy models using 2.0 async patterns?
- [ ] **Schemas**: Are Pydantic v2 schemas used for API contracts?
- [ ] **Auth**: Is `get_current_active_user()` used for protected routes?
- [ ] **Testing**: Does the change include tests in `backend/tests/` mirroring the API structure?
- [ ] **Style**: Would `make be_lint` pass? (Check line length, imports).

#### Frontend (Vue 3/TypeScript)

- [ ] **Composition API**: Is `<script setup>` used?
- [ ] **State Management**: Is `@pinia/colada` used for server state?
- [ ] **Cache Keys**: Do cache keys follow the hierarchical array convention (e.g., `['weeks', 'list']`)?
- [ ] **Redundant Fetches**: Is the `isLoaded` flag used in stores instead of truthy checks on arrays?
- [ ] **UI Components**: Are `reka-ui` primitives and `lucide-vue-next` icons used where appropriate?
- [ ] **Testing**: Are tests colocated in `__tests__/` and run with Vitest?

### Step 3: Provide Feedback

1. **Summary**: High-level overview of the quality.
2. **Critical Issues**: Blockers that violate project conventions or could cause bugs.
3. **Suggestions**: Improvements for readability or idiomatic patterns.
4. **Commands**: Remind the user of relevant `make` commands to verify changes (e.g., `make be_lint`, `make fe_test`).

## Key Principles

- **Be objective**: Reference the `copilot-instructions.md` guidelines.
- **Specific examples**: If suggesting a change, provide a code snippet of how it should look.
- **Check for tests**: Never approve a feature change without corresponding test updates.
- **Performance**: Look for common pitfalls like N+1 queries in backend or unnecessary re-renders in frontend.

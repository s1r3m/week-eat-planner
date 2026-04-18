---
name: plannotator-plan
description: "Create a structured implementation plan for features, bug fixes, or refactoring."
argument-hint: "describe the feature or task to plan"
---

# Implementation Planning

## When to Use

- Before starting any significant development task (feature, bug fix, refactor, migration).
- When a structured implementation plan is needed with clear testing requirements.

## Procedure

### Step 1: Parse Intent, Gather Context, and Setup

1. **Analyze user intent** (feature, bug, refactor, etc.).
2. **Setup**: Create `docs/plans/` directory if it does not exist.
3. **Launch Explore agent** (or use search tools) to gather relevant context:
   - Locate related code and patterns.
   - Check project structure and dependencies.
   - Identify affected components.
   - For bugs: look for logs, test failures, and recent changes.

### Step 2: Interactive Discovery

Ask questions **one at a time** using `AskUserQuestion`:

1. **Goal**: "What is the main goal?" (with suggestions).
2. **Scope**: "Which components/files are involved?" (with suggestions from discovery).
3. **Constraints**: "Any specific requirements or limitations?"
4. **Testing Approach**: "TDD (tests first)" vs "Regular (code first)".
5. **Plan Title**: Short descriptive title.

### Step 3: Propose Approaches

1. Propose 2-3 approaches with trade-offs.
2. Lead with a recommended option.
3. Skip if the solution is obvious or explicitly specified.
4. Let the user select an approach before creating the plan.

### Step 4: Create the Plan File

1. Create `docs/plans/YYYYMMDD-<task-name>.md`.
2. Follow the standard plan structure:
   - **Overview**: Problem and benefits.
   - **Context**: Involved files and patterns.
   - **Development Approach**: Testing rules (CRITICAL: Every task MUST include tests).
   - **Testing Strategy**: Unit and E2E requirements.
   - **Implementation Steps**: Atomic tasks with **Files:** block.

## Plan Structure Template

```markdown
# [Plan Title]

## Overview

- clear description of the feature/change being implemented
- problem it solves and key benefits
- how it integrates with existing system

## Context (from discovery)

- files/components involved: [list from discovery]
- related patterns found: [patterns discovered]
- dependencies identified: [dependencies]

## Development Approach

- **testing approach**: [TDD / Regular - from user preference]
- complete each task fully before moving to the next
- make small, focused changes
- **CRITICAL: every task MUST include new/updated tests**
- run tests after each change
- maintain backward compatibility

## Testing Strategy

- **unit tests**: required for every task
- **e2e tests**: if project has UI-based e2e tests (Playwright, Cypress, etc.)

## Progress Tracking

- mark completed items with `[x]` immediately when done
- add newly discovered tasks with ➕ prefix
- document issues/blockers with ⚠️ prefix

## Implementation Steps

### Task 1: [specific name]

**Files:**

- Create: `exact/path/to/new_file`
- Modify: `exact/path/to/existing`

- [ ] [specific action with file reference]
- [ ] write tests for new/changed functionality
- [ ] run tests - must pass before next task
- [ ] mark tasks as completed with `[x]`

### Task N-1: Verify acceptance criteria

- [ ] verify all requirements from Overview are implemented
- [ ] run full test suite
- [ ] verify test coverage meets project standard

### Task N: [Final] Update documentation

- [ ] update README.md if needed
- [ ] move this plan to `docs/plans/completed/`

## Technical Details

- data structures and changes
- parameters and formats
- processing flow

## Post-Completion

_Items requiring manual intervention or external systems_
```

(The standard template as defined in the skill instructions)

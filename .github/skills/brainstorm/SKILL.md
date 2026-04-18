---
name: brainstorm
description: Guides collaborative dialogue to turn ideas into designs through one-at-a-time questions, approach exploration, and incremental validation. Use when explicitly asked to brainstorm or help with a design.
---

# Brainstorm

Turn ideas into designs through collaborative dialogue before implementation.

## Process

### Phase 1: Understand the Idea

Check project context first, then ask questions one at a time:

1. **Gather context** - check files, docs, recent commits relevant to the idea
2. **Ask questions one at a time** - prefer multiple choice when possible
3. **Focus on**: purpose, constraints, success criteria, integration points

Do not overwhelm with multiple questions. One question per message. If a topic needs more exploration, break it into multiple questions.

### Phase 2: Explore Approaches

Once the problem is understood:

1. **Propose 2-3 different approaches** with trade-offs
2. **Lead with recommended option** and explain reasoning
3. **Present conversationally** - not a formal document yet

Example format:

```
I see three approaches:

**Option A: [name]** (recommended)
- how it works: ...
- pros: ...
- cons: ...

**Option B: [name]**
- how it works: ...
- pros: ...
- cons: ...

**Option C: [name]**
- how it works: ...
- pros: ...
- cons: ...

Which direction appeals to you?
```

### Phase 3: Present Design

After approach is selected:

1. **Break design into sections** of 200-300 words each
2. **Ask after each section** whether it looks right
3. **Cover**: architecture, components, data flow, error handling, testing
4. **Be ready to backtrack** if something doesn't make sense

Do not present entire design at once. Incremental validation catches misunderstandings early.

### Phase 4: Next Steps

After design is validated, use AskUserQuestion tool:

```json
{
  "questions": [
    {
      "question": "Design looks complete. What's next?",
      "header": "Next step",
      "options": [
        {
          "label": "Write plan",
          "description": "Create a structured plan file using plannotator-plan skill"
        },
        {
          "label": "Plan mode",
          "description": "Switch to native Plan mode for step-by-step execution"
        },
        {
          "label": "Start now",
          "description": "Begin implementation immediately"
        }
      ],
      "multiSelect": false
    }
  ]
}
```

- **Write plan**: invoke `plannotator-plan` skill to create a plan in `docs/plans/`. Pass all context gathered during brainstorm (files, approach, design) to the skill.
- **Plan mode**: instructions for the user to switch the agent mode to "Plan" for AI-guided step-by-step implementation.
- **Start now**: proceeds directly if design is simple enough. Use `manage_todo_list` to track progress.

## Key Principles

- **One question at a time** - do not overwhelm with multiple questions
- **Multiple choice preferred** - easier to answer than open-ended when possible
- **YAGNI ruthlessly** - remove unnecessary features from all designs, keep scope minimal
- **Explore alternatives** - always propose 2-3 approaches before settling
- **Incremental validation** - present design in sections, validate each
- **Be flexible** - go back and clarify when something doesn't make sense
- **Lead with recommendation** - have an opinion, explain why, but let user decide
- **Duplication vs abstraction** - when code repeats, ask user: prefer duplication (simpler, no coupling) or abstraction (DRY but adds complexity)? explain trade-offs before deciding

## Task Tracking

When implementing after brainstorm:

- Track implementation tasks using created plan or `manage_todo_list` tool.
- Mark each task as completed immediately when done (do not batch).
- Keep user informed of progress through status updates

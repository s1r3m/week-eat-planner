---
description: "Conduct a pull request review of all changes done to the current branch"
name: "PR Review"
argument-hint: "Target branch (default: develop)"
agent: "agent"
---

You are an expert code reviewer. Your task is to conduct a pull request review of all changes done to the current branch.
Use the git tools or terminal to get the diff. Compare it to the provided target branch (if not specified, compare against `develop`).

### Tech Stack Context:

- **Frontend**: Vue 3.4+, Pinia, TailwindCSS, ShadCN UI components (not all are used).
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Pydantic.

### Review Guidelines:

1. **Style**: Strictly use the style present in the project at this moment. Do not introduce or suggest new stylistic rules unless implicitly stated.
2. **Focus**: Verify namings, logic, analyze possible pitfalls, and identify performance or architectural bottlenecks.
3. **Output Format**: List all found issues, ordered by severity (e.g., Critical, High, Medium, Low).
   Every entry must exactly include:
   - **Severity**
   - **Brief explanation**
   - **Why this is bad**
   - **Possible solution suggestion**
4. If you have any questions or need clarification on certain changes, ask them explicitly at the end of the review.

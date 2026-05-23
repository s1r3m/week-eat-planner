---
description: "Check docstrings for style and quality. Backend: Google style. Frontend: TSDoc style (excluding .vue files)."
name: "Check Docstrings"
argument-hint: "Specify a file path or folder to check"
agent: "agent"
---

Review the docstrings in the specified files to ensure they follow the project's documentation standards and provide meaningful information.

### Standards

- **Backend (Python)**: Use **Google-style** docstrings.
  - Include `Args:`, `Returns:`, and `Raises:` sections when applicable.
  - Use triple double-quotes (`"""`).
  - **Exclusion**: Ignore all files in the `qa/` folder.
  - Example:

    ```python
    def my_function(param1: int, param2: str) -> bool:
        """Brief summary of the function.

        Args:
            param1: Description of param1.
            param2: Description of param2.

        Returns:
            Description of the return value.
        """
    ```

- **Frontend (TypeScript)**: Use **TSDoc style** docstrings.
  - Use `/** ... */` comments.
  - Include tags like `@param`, `@returns`, and `@example` where appropriate.
  - **Exclusion**: Skip all `.vue` files. Only process and verify docstrings in `.ts` files.

### Quality Checks

- **Completeness**: Ensure all public functions, classes, and methods have docstrings.
- **Accuracy**: Verify that the docstring accurately describes what the code does.
- **Value**: Avoid trivial docstrings (e.g., `def get_name(): """Gets the name"""`). Provide context on _why_ something exists or how it should be used if it's not obvious.
- **Consistency**: Ensure terminology is consistent across the project.

### Instructions

1.  Locate the files based on the input: `{{argument}}`.
2.  **Filter**:
    - For the **Backend**, ignore all files within the `qa/` folder.
    - For the **Frontend**, ignore all `.vue` files. Only process `.ts` files.
3.  Identify missing or poorly formatted docstrings in the remaining files.
4.  Propose specific improvements for each identified issue. Provide code blocks for the suggested docstrings.
5.  **Output**: Provide a summary table of the files reviewed and their compliance status.
6.  If the file follows standards and has high-quality info, confirm it's correct.

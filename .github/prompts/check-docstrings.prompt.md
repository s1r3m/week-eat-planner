---
description: "Check docstrings for style and quality. Backend: Google style. Frontend: TSDoc style."
name: "Check Docstrings"
argument-hint: "Specify a file path or folder to check"
agent: "Explore"
---

Review the docstrings in the specified files to ensure they follow the project's documentation standards and provide meaningful information.

### Standards

- **Backend (Python)**: Use **Google style** docstrings.
  - Include `Args:`, `Returns:`, and `Raises:` sections when applicable.
  - Use triple double-quotes (`"""`).
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

- **Frontend (TypeScript/Vue)**: Use **TSDoc style** docstrings.
  - Use `/** ... */` comments.
  - Include tags like `@param`, `@returns`, and `@example` where appropriate.
  - For Vue components, document props, emits, and slots.

### Quality Checks

- **Completeness**: Ensure all public functions, classes, methods, and complex components have docstrings.
- **Accuracy**: Verify that the docstring accurately describes what the code does.
- **Value**: Avoid trivial docstrings (e.g., `def get_name(): """Gets the name"""`). Provide context on _why_ something exists or how it should be used if it's not obvious.
- **Consistency**: Ensure terminology is consistent across the project.

### Instructions

1.  Locate the files based on the input: `{{argument}}`.
2.  Identify missing or poorly formatted docstrings.
3.  Propose specific improvements for each identified issue.
4.  If the file follows standards and has high-quality info, confirm it's correct.

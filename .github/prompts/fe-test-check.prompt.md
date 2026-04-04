---
description: "Verify that frontend unit tests are up-to-date with the source code and run them using yarn or make fe_test."
---

Perform a thorough check of the frontend unit tests:

1.  **Read and Analyze**: Examine the frontend unit tests in `frontend/src/**/__tests__/*.ts` and compare them with the corresponding source files in `frontend/src/`.
2.  **Verify Actuality**: Ensure the tests accurately reflect the current logic and UI components. Identify any outdated tests or missing coverage for recent changes. Don't change the app to fit tests, change tests.
3.  **Run Tests**: Execute the tests using `make fe_test` from the root directory or `yarn test:run` in the `frontend/` directory.
4.  **Report**: Summarize the test results, highlighting any failures or discrepancies found during the analysis.

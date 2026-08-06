# Testing Guidelines

## Overview
This document defines the testing approach for the project so new features are validated consistently and maintainably.

## General Testing Principles
- All new features should include appropriate tests.
- Tests should be maintainable, readable, and aligned with project best practices.
- Tests should be isolated and independent so they can run reliably across multiple executions.
- Each test should set up its own data and avoid relying on other tests.
- Setup and teardown hooks should be used where needed to ensure repeatable test runs.
- Testing should reflect the core product behaviors described in the project requirements, including task creation, editing, due dates, sorting, and clear success or error feedback.
- Prefer testing real behavior over overly mocked implementations where practical.

## Testing Focus Areas
- Cover task management flows such as adding a task, editing an existing task, assigning a due date, and displaying tasks in the expected order.
- Verify that the UI shows relevant information clearly and that success and error states are communicated to users.
- Validate backend endpoints that support the task workflow and ensure they return the expected data and status codes.
- Exercise the most important user journeys end to end, rather than trying to test every possible combination.

## Unit Tests
- Use Jest to test individual functions and React components in isolation.
- Unit tests should use the naming convention `*.test.js` or `*.test.ts`.
- Backend unit tests should be placed in `packages/backend/__tests__/`.
- Frontend unit tests should be placed in `packages/frontend/src/__tests__/`.
- Name unit test files to match what they are testing, for example `app.test.js` for testing `app.js`.

## Integration Tests
- Use Jest and Supertest to test backend API endpoints with real HTTP requests.
- Integration tests should be placed in `packages/backend/__tests__/integration/`.
- Integration tests should also use the naming convention `*.test.js` or `*.test.ts`.
- Name integration test files based on the feature or endpoint they cover, for example `todos-api.test.js` for TODO API endpoints.

## End-to-End (E2E) Tests
- Use Playwright to test complete UI workflows through browser automation.
- E2E tests should be placed in `tests/e2e/`.
- E2E tests should use the naming convention `*.spec.js` or `*.spec.ts`.
- Name E2E test files based on the user journey they test, for example `todo-workflow.spec.js`.
- Playwright tests must use one browser only.
- Playwright tests must use the Page Object Model (POM) pattern for maintainability.
- Limit E2E tests to 5-8 critical user journeys that cover happy paths and key edge cases.
- Keep E2E tests focused on the most important user flows, such as creating, editing, and viewing tasks through the UI.

## Configuration and Environment
- Always use environment variables with sensible defaults for port configuration.
- Backend example: `const PORT = process.env.PORT || 3030;`.
- Frontend can use the default React port of `3000`, but it should also allow overrides with `PORT`.
- This approach helps CI/CD workflows detect ports dynamically.

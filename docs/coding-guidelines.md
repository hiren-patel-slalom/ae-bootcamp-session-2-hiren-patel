# Coding Guidelines

## Overview
This project is a small full-stack JavaScript application built with React on the frontend and Express on the backend. The coding style should stay simple, readable, and consistent so the code is easy to understand and extend.

## General Style
- Write clear, readable code with meaningful names for variables, functions, and components.
- Keep functions focused on a single responsibility and avoid unnecessary complexity.
- Favor straightforward logic over clever shortcuts.
- Follow consistent indentation and spacing, and keep code formatted in a predictable way.
- Prefer small, composable pieces of logic that are easy to test and reuse.

## Formatting and Structure
- Use consistent semicolons and quote style across the codebase.
- Keep related code grouped together and separate concerns clearly.
- Use clear sectioning for setup, middleware, routes, and helper logic in backend files.
- In frontend components, keep state, event handlers, and render logic organized in a way that is easy to scan.
- Avoid deeply nested conditionals when a simpler structure will be easier to follow.

## Imports and Dependencies
- Organize imports so the most important dependencies appear first, followed by local modules and styles.
- Keep imports minimal and avoid unused dependencies.
- Use existing project dependencies where possible rather than introducing new libraries for simple tasks.

## Linting and Quality
- Follow the repository linter and formatting rules consistently when they are available.
- Keep code free of obvious issues such as unused variables, unreachable logic, or inconsistent naming.
- Write code that is easy to maintain and easy for other contributors to understand.
- Apply the DRY principle by avoiding repeated logic and extracting shared behavior when it improves clarity.
- Prefer reusable helpers and simple abstractions over duplication.

## Frontend Guidance
- Build UI logic in a way that remains easy to reason about and test.
- Keep React components focused on rendering and user interaction rather than mixing in unrelated responsibilities.
- Handle loading, error, and empty states clearly so the experience feels polished and predictable.

## Backend Guidance
- Keep API handlers focused on request validation, business logic, and response handling.
- Return clear and consistent responses for success and error cases.
- Keep shared database access or repeated logic organized so the code remains maintainable.

## Collaboration and Maintainability
- Make changes that are easy for others to review and understand.
- Add or update tests when introducing new behavior or changing existing behavior.
- Keep changes scoped and avoid unnecessary refactoring unless it improves clarity or maintainability.

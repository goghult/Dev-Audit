# Agent Instructions

## Working Preference

- Operate autonomously for routine repository work: inspect files, edit code, run focused checks, and iterate without asking for confirmation each time.
- Ask before requesting or exposing secrets, running destructive commands, changing infrastructure outside this workspace, or making an ambiguous product decision.
- Keep changes focused on the requested behavior. Preserve unrelated user changes and avoid broad refactors.

## Project Shape

- `backend/` is a Spring Boot/Maven Java service in `com.codeauditor`. Controllers expose REST and SSE audit endpoints; services contain AI orchestration and business logic; repositories/entities cover persistence; `config/` and `security/` own authentication and web security.
- `frontend/` is a Vite React + TypeScript application. Pages own route-level workflows, components own UI pieces, hooks own streaming behavior, and `services/` owns HTTP calls.
- The backend and frontend communicate through `/api`. The Vite development proxy is configured in `frontend/vite.config.ts`; verify its target against the backend port before debugging browser API failures.
- `README.md` documents the product, environment variables, API routes, and local startup flow. Link to it for user-facing setup details instead of duplicating them here.

## Commands

### Backend

Run from `backend/`:

- Compile and run tests: `mvn clean test`
- Compile test sources only: `mvn clean test-compile`
- Start locally: `mvn spring-boot:run`

Use the Maven version and Java version declared or required by `backend/pom.xml` as the source of truth. Do not commit generated `target/` output or temporary dependency reports.

### Frontend

Run from `frontend/`:

- Install dependencies: `npm install`
- Development server: `npm run dev`
- Typecheck and production build: `npm run build`
- Lint: `npm run lint`

Keep API types and request paths aligned between `frontend/src/services/` and the backend controllers. Validate both `npm run build` and the narrowest relevant backend test when a change crosses the API boundary.

## Conventions

- Follow existing Spring Security, DTO, service, and repository patterns before introducing new abstractions.
- Preserve authentication and authorization behavior. Audit records must remain scoped to the authenticated user.
- Keep AI provider selection compatible across backend provider metadata, request DTOs, and frontend controls.
- Prefer typed TypeScript interfaces over new `any` values when touching frontend code.
- Match the existing UI language and Tailwind conventions; use the installed icon library rather than hand-drawn SVG icons.
- Add or update focused tests for behavior changes. Do not weaken tests to make a build pass.

## Validation

- For backend changes, run the relevant test class first when available, then `mvn clean test` for shared or API-facing changes.
- For frontend changes, run `npm run build`; run `npm run lint` when lintable code changes.
- Review the final diff for accidental generated files, secrets, unrelated formatting, and API contract drift.

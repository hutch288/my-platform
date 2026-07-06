# Engineering Notebook

This notebook documents the engineering decisions, production practices, and operational capabilities used to build and maintain this project.

It is intended to show how the system evolved beyond a working application into software that can be built, deployed, observed, secured, updated, and recovered safely.

Entries include:
- the decision or capability
- why it matters
- how it was implemented
- tradeoffs or limitations
- evidence or verification where meaningful

### WSL/Linux Development Environment

The project is developed inside WSL/Linux to reduce differences between local development, CI/CD, container tooling, and cloud runtime environments.

Implementation:

* The active repository is maintained inside the WSL/Linux filesystem.
* Git, Gradle, npm, Docker, and deployment-related commands run from Linux.
* IDEs open the source files directly from the WSL filesystem.
* This environment provides a consistent foundation for GitHub Actions, containerized builds, and scripted deployment.

Why it matters:

Using a Linux-based development environment reduces platform-specific surprises and makes local behavior more closely resemble automated builds and cloud deployment environments. This improves reproducibility and lowers the risk of failures caused by differences in paths, permissions, line endings, file watching, or container mounts.

Tradeoffs / limitations:

WSL adds another environment layer that must be configured and maintained. Files stored inside the Linux filesystem are less directly visible from some Windows tools, and Windows/WSL path boundaries can cause confusion if commands or IDEs operate on different copies of the project. The consistency benefits depend on keeping development work inside the intended WSL environment.

Evidence / verification:

* Local setup documented in `README.md`
* Project location verified with `pwd`: `/home/________/capstone/________`
* Backend build from WSL: `cd backend && ./gradlew build`
* Frontend build from WSL: `cd frontend && npm run build`
* Docker Compose verification: ________

### Command-Line Git Workflow

Command-line Git is used to keep repository state, branch history, and change tracking directly visible and explainable.

Implementation:

* Git operations are performed from within the repository.
* One `.git/` directory tracks the complete full-stack project.
* Branch state, commit history, remote configuration, and working-tree changes are inspected with standard Git commands.
* Feature branches and pull requests provide the normal path for changes to reach `main`.
* This workflow supports CI/CD triggers, rollback, and tracing deployed behavior to a specific commit.

Why it matters:

Direct use of Git makes the repository model and change history explicit rather than hiding them behind an IDE. This strengthens the ability to diagnose branch problems, understand release state, recover from mistakes, and explain how a production version maps back to source history.

Tradeoffs / limitations:

Command-line Git exposes repository behavior clearly, but it also requires engineers to understand branch state and the effects of commands before running them. IDE integrations may improve convenience later, but they do not remove the need to understand the underlying Git operations during recovery, conflict resolution, or release investigation.

Evidence / verification:

* Repository state verified with `git status`
* Current branch verified with `git branch --show-current`
* Commit history inspected with `git log --oneline --decorate --graph --all`
* Remote configuration verified with `git remote -v`
* Engineering Evidence page: ________

### Protected Main Branch

The default branch is protected so that changes reach `main` through an intentional pull-request workflow rather than direct pushes.

Implementation:

* The ruleset targets the repository’s default branch.
* Pull requests are required before merge.
* Force pushes and branch deletion are blocked.
* Direct pushes that violate the ruleset are rejected by GitHub.
* Additional gates, such as required CI status checks, will be added as the delivery pipeline matures.

Why it matters:

Protecting `main` creates a reviewable and auditable change path. It reduces the risk of accidental production-bound changes and establishes the trusted branch that later CI/CD, release, and deployment controls will use.

Tradeoffs / limitations:

Branch protection controls changes to the shared GitHub branch but does not prevent accidental commits to a developer’s local `main`. Engineers must still inspect local branch state and recover misplaced work by preserving it on the correct feature branch. The current rules also do not yet verify build or test success before merge; required status checks will be added after CI is established.

Evidence:

* GitHub ruleset: `Protect main`
* Initial project-structure PR: #1
* Direct push to protected `main` rejected by the repository ruleset

### Intentional Repository Structure

The full-stack application is organized as a single repository with clear boundaries for backend, frontend, documentation, and future automation.

Implementation:

* One Git repository tracks the complete application.
* Top-level directories separate the major responsibilities of the project:

  * `backend/`
  * `frontend/`
  * `docs/`
* Additional directories, such as `scripts/`, will be added when they serve a real project need.
* Placeholder files were used temporarily so Git could track directories before application code was added.
* The structure was introduced on a dedicated branch and merged through the protected pull-request workflow.

Why it matters:

A predictable repository structure makes the system easier to navigate, build, review, automate, and operate. Keeping related application components in one repository also allows CI/CD workflows and release history to trace a coordinated full-stack change to a single commit.

Tradeoffs / limitations:

A monorepo simplifies coordinated changes but requires CI/CD workflows to avoid rebuilding or redeploying unaffected components unnecessarily as the project grows. Repository permissions and release processes also apply to the combined codebase rather than being isolated by service.

Evidence:

* Initial project structure PR: #1
* Branch: `setup/project-structure`
* Repository directories verified before merge

### Engineering Style Guide

The project uses a repository-based engineering style guide to establish consistent conventions for source code, documentation, version control, configuration, and production-oriented development.

Implementation:

* Added `docs/engineering-style-guide.md` as the source of truth for project conventions.
* Defined naming standards for general files, React components, Java classes and packages, and PostgreSQL identifiers.
* Documented expectations for branches, commits, pull requests, environment variables, API paths, logging, secrets, and production documentation.
* Established that framework- or platform-specific requirements may override general conventions when the exception is intentional and documented.

Why it matters:

Consistent conventions reduce avoidable friction as the project moves from local development into code review, CI/CD, containers, cloud deployment, debugging, and ongoing maintenance. The guide makes engineering expectations visible and reviewable instead of relying on undocumented personal habits or scattered instructions.

Tradeoffs / limitations:

A style guide cannot anticipate every framework or production decision. Excessive or rigid conventions can create unnecessary work without improving the system. The guide therefore provides a stable baseline while allowing justified exceptions and future updates as the architecture evolves.

Evidence:

* Engineering style guide: `docs/engineering-style-guide.md`
* Pull request: #4

### React and TypeScript Frontend Foundation

The frontend uses React and TypeScript with Vite to provide a maintainable, statically checked foundation for the public production platform.

**Implementation:**

* Created the frontend in `frontend/` using React, TypeScript, and Vite.
* Used npm for dependency management and committed `package-lock.json` so dependency versions can be reproduced from a clean checkout.
* Added documented commands for local development, linting, and production builds.
* Configured the project so Vite transforms the React source into prebuilt, browser-ready static files in `frontend/dist/`.
* Replaced the generated starter page with the initial public-facing production-platform content.

**Why it matters:**

React provides a component model suitable for the interactive portfolio interface, while TypeScript catches many interface and data-shape errors before they reach the browser. The npm and Vite toolchain also creates a repeatable path from source code to deployable static files that can later be verified through continuous integration and hosted through Cloudflare Pages.

**Tradeoffs / limitations:**

React and TypeScript introduce build tooling and dependency-management overhead compared with a small hand-written HTML page. The current frontend is intentionally minimal and does not yet justify additional frameworks for routing, state management, or server-side rendering. Those capabilities will be introduced only when the application requirements make them useful.

**Evidence / verification:**

* Frontend source: `frontend/`
* Local development: `npm run dev`
* Lint verification: `npm run lint`
* Production build: `npm run build`
* Production output: `frontend/dist/`
* Frontend foundation pull request: `#___`

### Cloudflare Pages Frontend Deployment

The React frontend is deployed through Cloudflare Pages as a public HTTPS site connected to the GitHub repository.

Implementation:

* The existing Vite React TypeScript frontend in `frontend/` is connected to a Cloudflare Pages project.
* Cloudflare Pages builds the frontend from the GitHub repository.
* The production branch is `main`.
* The Cloudflare Pages project uses `frontend` as the root directory.
* The build command is `npm run build`.
* The build output directory is `dist`.
* Cloudflare serves the production build through a generated `pages.dev` URL.
* A custom domain is connected to the Pages deployment.

Why it matters:

This creates the project’s first real production deployment path. The frontend is no longer only a local development artifact; it can be built by a cloud platform, served publicly over HTTPS, connected to a real domain, and verified outside the developer’s machine. This supports a repeatable release path and gives reviewers a live version of the project to inspect.

Tradeoffs / limitations:

This deployment uses Cloudflare Pages as a managed frontend hosting platform. That is an appropriate production abstraction for a static React frontend, but it does not mean every production concern is solved. The backend is not deployed yet, production observability is not configured yet, and formal rollback practice will be introduced later. Cloudflare Pages also rebuilds the frontend from GitHub rather than serving as the course’s strongest example of build-once, promote-same-artifact deployment; that pattern will be emphasized later with backend container deployment.

Evidence:

* Production branch: `main`
* Frontend root directory: `frontend`
* Build command: `npm run build`
* Build output directory: `dist`
* Cloudflare Pages URL: `https://my-platform-9ev.pages.dev/`
* Custom domain: `https://portfolio.yourdomain.dev`
* Pull request: #___
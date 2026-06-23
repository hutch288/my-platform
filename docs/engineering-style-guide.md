# Capstone Engineering Style Guide

## Purpose

This guide defines basic engineering conventions for capstone projects.

The goal is not arbitrary formatting. The goal is to make projects easier to build, review, deploy, debug, operate, and maintain.

These conventions apply to both individual production portfolio projects and team capstone projects unless a framework, language, database, or tool requires a different convention.

---

## Core Principle

Prefer conventions that work well in terminals, Git repositories, GitHub Actions, Dockerfiles, scripts, URLs, cloud deployments, logs, documentation, and code review.

Small organizational choices become more important once software is deployed, automated, shared, and maintained by a team.

Consistency should reduce friction, not create unnecessary rules.

---

## Naming Conventions

Use clear, descriptive names that explain purpose.

### General Files and Directories

For general files, scripts, documentation, and generic directories, use:

```text
lowercase-kebab-case
```

Examples:

```text
deployment-runbook.md
incident-log.md
api-contract.md
security-notes.md
production-deploy-checklist.md
user-profile-service/
project-gallery/
admin-dashboard/
```

Avoid spaces, vague names, and temporary-status names such as:

```text
Deployment Runbook.md
final version 2.md
NewFolder/
stuff.md
updated notes.md
final-final.md
```

Spaces are supported by modern operating systems, but they create avoidable friction in terminals, scripts, Dockerfiles, CI/CD workflows, URLs, Markdown links, and cloud configuration.

For example:

```bash
cat deployment-runbook.md
```

is simpler than:

```bash
cat "Deployment Runbook.md"
```

If a snapshot is genuinely needed, include an ISO-style date:

```text
incident-log-2026-09-15.md
```

Do not use confusing version names such as:

```text
architecture-final.md
architecture-final2.md
architecture-real-final.md
```

Use Git history, pull requests, commits, changelogs, or dated snapshots to track changes over time.

### React Frontend

Follow standard React and TypeScript conventions.

Use `PascalCase` for React component files:

```text
UserProfile.tsx
ProjectCard.tsx
AdminDashboard.tsx
```

Use `camelCase` for hooks, utility files, state helpers, and API clients:

```text
useAuth.ts
useProjects.ts
apiClient.ts
formatDate.ts
```

Component folders may use `PascalCase` when they directly represent a component. Follow the established project convention consistently.

### Java / Javalin Backend

Use `PascalCase` for Java classes, interfaces, records, and enums:

```text
ProjectController.java
AuthMiddleware.java
UserRepository.java
ProjectResponse.java
```

Use lowercase dot-separated package names:

```text
com.capstone.project.controller
com.capstone.project.repository
com.capstone.project.service
```

Do not use kebab-case, underscores, or uppercase letters in Java package names.

### PostgreSQL

When using PostgreSQL, use lowercase `snake_case` for unquoted database identifiers.

Examples:

```text
users
project_cards
user_roles
created_at
password_hash
```

Use plural nouns for tables when that convention fits the domain:

```text
users
projects
deployments
```

Use descriptive nouns for columns:

```text
id
created_at
display_name
deployment_status
```

Avoid quoted mixed-case identifiers because they require repeated quoting and create unnecessary friction.

---

## Documentation Format

Use Markdown for living project documentation unless another format is specifically required.

Recommended documentation files include:

```text
README.md
docs/architecture.md
docs/api-contract.md
docs/deployment-runbook.md
docs/engineering-notebook.md
docs/incident-log.md
docs/security-notes.md
docs/accessibility-notes.md
docs/production-deploy-checklist.md
```

Do not create every document immediately just to fill the repository.

Create a document when it has a clear purpose and enough real project information to remain accurate and useful.

Markdown is preferred because it works well in GitHub, code review, diffs, pull requests, and project repositories.

---

## Source-of-Truth Rule

Important project information must have a clear source of truth.

If a document is used for deployment, operations, security, architecture, team coordination, incident response, or production recovery, it should live in the project repository or another clearly identified shared location.

Do not rely on random local files, screenshots, private notes, Discord messages, text messages, or verbal agreements as the only copy of important project information.

If a teammate asks, “Where is the current version?” there should be one obvious answer.

---

## Repository Organization

Project repositories should be organized so that a new developer can quickly find the major parts of the system.

A typical full-stack project might eventually use a structure such as:

```text
project-name/
  README.md
  backend/
  frontend/
  docs/
    architecture.md
    api-contract.md
    deployment-runbook.md
    engineering-notebook.md
    incident-log.md
    security-notes.md
  scripts/
  docker-compose.yml
```

The exact structure may vary by project.

The structure should be intentional, documented, and easy to navigate.

Do not add empty folders or placeholder files unless they serve a real purpose.

---

## README Expectations

Every project repository must have a `README.md`.

At minimum, the README should explain:

* what the project does
* who the intended users are
* how to run it locally
* how to run tests
* where the production site is deployed
* where the backend or API is deployed
* what major technologies are used
* where to find architecture and deployment documentation
* the current project status when major capabilities are not yet complete

A README is not a marketing page only. It is also an engineering entry point.

For a portfolio project, it should communicate clearly to both technical reviewers and other visitors.

---

## Environment Variables

Environment variables should use `UPPER_SNAKE_CASE`.

Examples:

```text
DATABASE_URL
JWT_SECRET
OPENAI_API_KEY
SUPABASE_URL
APP_ENV
LOG_LEVEL
```

### Frontend and Backend Variables

Backend variables may contain secrets because they remain on the server:

```text
DATABASE_URL
JWT_SECRET
OPENAI_API_KEY
```

Frontend variables are compiled into browser-accessible assets.

With Vite, only intentionally public configuration should use the `VITE_` prefix:

```text
VITE_API_URL
VITE_APP_ENV
```

The `VITE_` prefix does not make a value secret or secure. It makes the value available to frontend code.

Never expose backend secrets through frontend environment variables.

### Secret Management

Never commit real secrets to Git.

It is acceptable to commit a template file such as:

```text
.env.example
```

The file should show the required variable names but must not include real credentials.

Example:

```text
DATABASE_URL=replace-me
JWT_SECRET=replace-me
VITE_API_URL=http://localhost:8080
APP_ENV=local
LOG_LEVEL=debug
```

Local `.env` files containing real values must be excluded through `.gitignore`.

Production secrets should be stored using the deployment platform, CI/CD secret store, or another approved secret-management system.

---

## Branch Names

Use descriptive branch names with this pattern:

```text
type/short-description
```

Recommended prefixes:

```text
setup/
feature/
fix/
docs/
test/
refactor/
```

Examples:

```text
setup/backend-project
feature/admin-login
feature/project-gallery
fix/login-error-handling
docs/deployment-runbook
test/api-auth-tests
refactor/database-access
```

Keep each branch focused on one coherent change.

Separate unrelated capabilities into different branches and pull requests, even when they are part of the same assignment or development session.

A branch name should give reviewers a useful summary of what the branch contains.

---

## Commit Messages

Commit history is part of the professional engineering record.

Commit messages should help someone understand what changed.

They do not need to be overly formal, but they should be specific, professional, and useful when scanning project history.

Good commit messages:

```text
Add admin login endpoint
Fix project card layout on mobile
Document production rollback steps
Add health check endpoint
Handle empty project list on dashboard
Update README with local setup instructions
```

Avoid vague, repeated, or unprofessional messages:

```text
update
fix
stuff
changes
work
asdf
oops
please work
```

A commit message should usually answer one of these questions:

* What feature was added?
* What bug was fixed?
* What documentation changed?
* What test was added?
* What refactoring occurred?

Poor:

```text
fix
fix
fix
fix
```

Better:

```text
Fix login redirect after logout
Fix null project description error
Fix mobile spacing on project cards
Fix missing authorization check on admin route
```

Write specific messages as work progresses.

Small corrective commits may be squashed before merging when appropriate, but do not rewrite shared history without understanding the consequences.

---

## Pull Requests

Pull requests should be small enough to review carefully.

Each PR should represent one coherent change.

PRs are also part of the project’s documentation. A useful PR helps future engineers understand what changed, why it changed, how it was verified, and what operational risks were introduced.

Use the repository PR template.

Mark a section as `Not applicable` when it does not apply rather than inventing evidence.

Suggested structure:

```markdown
## Summary

Briefly describe what changed and why.

## Testing

Explain how the change was tested or verified.

## Screenshots

Include screenshots or recordings for visible UI changes.

## Deployment Notes

Mention environment variables, schema changes, migrations, rollout requirements, or operational effects.

## Risks / Rollback

Explain what could go wrong and how the change could be undone.
```

A documentation-only PR may not require screenshots.

A configuration or deployment PR may require especially careful deployment and rollback notes.

---

## API Paths

Use consistent, resource-oriented API paths.

Examples:

```text
GET /api/projects
GET /api/projects/{projectId}
POST /api/projects
PUT /api/projects/{projectId}
DELETE /api/projects/{projectId}
```

Use nouns for resources and HTTP methods to describe actions when possible.

Avoid inconsistent action-style paths such as:

```text
GET /api/getProjects
POST /api/projectMaker
GET /api/project_stuff
```

Use consistent parameter names:

```text
/api/projects/{projectId}
/api/users/{userId}
```

---

## Database Schema Changes

When using a relational database, schema changes should be reproducible and version-controlled.

Do not rely on undocumented manual production changes as the normal schema-management process.

Schema changes should eventually be managed through migration files stored in the repository.

The exact migration tool, naming convention, and file location should be established when the database architecture is selected.

Migration history should make it possible to:

* create a new environment consistently
* reproduce schema changes
* review database changes through PRs
* understand which application version expects which schema
* recover from or correct failed changes

Avoid introducing migration-tool-specific conventions before the tool has been selected.

---

## Dates and Times

Choose database types according to the meaning of the data.

Use `TIMESTAMPTZ` for recorded instants such as:

```text
created_at
updated_at
last_login_at
deployed_at
incident_started_at
```

Use `DATE` when the concept is a calendar date without a specific instant:

```text
birth_date
due_date
graduation_date
```

Use `TIME` or another appropriate representation when the concept is a local time rather than a global instant.

Store and display time zones intentionally.

Do not treat every date or time value as the same kind of data.

---

## Docker Conventions

Docker configuration should support reproducible builds, clear runtime behavior, and safe deployment.

Prefer multi-stage builds for production images so the final image contains only the runtime and files required to operate the service.

Additional tools or packages in the runtime image should be intentional and justified.

Structure Dockerfiles to make useful use of build caching.

For example, copy dependency and build configuration files before copying frequently changing source files when that meaningfully improves build reuse.

For Gradle projects, relevant files may include:

```text
gradlew
gradle/
build.gradle
settings.gradle
```

For frontend projects, relevant files may include:

```text
package.json
package-lock.json
```

Do not optimize layers blindly. Correctness and maintainability are more important than minor build-time improvements.

Run containers with the minimum permissions needed.

Do not place secrets inside Dockerfiles or committed image layers.

---

## Security and Authentication

Security decisions should be based on the project’s actual architecture and threat model.

Do not assume that a token-storage method is secure simply because it is common.

When choosing between cookies, browser storage, runtime memory, or another approach, consider:

* cross-site scripting
* cross-site request forgery
* token refresh
* session expiration
* frontend and backend domains
* CORS
* logout behavior
* deployment architecture

Authorization must always be enforced by the backend.

Frontend route hiding or disabled buttons are not security controls.

Prefer a deny-by-default authorization design where protected operations require explicit authentication and authorization, and public access is intentionally declared.

Document which routes are public, authenticated, or restricted by role.

Do not claim that authentication or authorization is secure until the behavior has been tested and verified.

---

## Logging

Logs should help someone debug and operate production.

Prefer structured, meaningful logs.

Useful fields may include:

```text
timestamp
level
request_id
user_id
route
status_code
duration_ms
error_type
error_message
environment
version
```

Avoid vague or noisy logs such as:

```text
here
made it
test
oops
thing failed
```

Logs should provide enough context to diagnose failures without exposing sensitive information.

Never log:

```text
passwords
API keys
access tokens
refresh tokens
private credentials
full authentication headers
sensitive personal data
```

Be deliberate about logging user identifiers and request content.

Production logging should support debugging while respecting security and privacy.

---

## Production Documentation

A production system should include a deployment runbook.

Recommended file:

```text
docs/deployment-runbook.md
```

The runbook should eventually explain:

* where the application is deployed
* how to deploy a new version
* how artifacts move between environments
* how to verify production health
* how to roll back
* where logs are found
* where metrics and alerts are found
* what environment variables are required
* what to do during common failures

Do not invent procedures before the deployment system exists.

A runbook should describe tested operational reality.

If the system is live, someone other than the original developer should be able to follow it.

---

## Incident Documentation

If production breaks, document what happened.

Recommended file:

```text
docs/incident-log.md
```

An incident note should include:

* date and time
* what users experienced
* how the issue was detected
* root cause or suspected cause
* how the issue was mitigated
* how service was restored
* what follow-up work is needed

The goal is not blame.

The goal is learning, recovery, and reducing the chance of recurrence.

Do not hide incidents that reveal useful engineering lessons.

---

## Engineering Notebook

The engineering notebook records important production decisions and capabilities.

Recommended file:

```text
docs/engineering-notebook.md
```

The notebook is a professional portfolio artifact intended for recruiters, hiring managers, technical interviewers, teammates, and future maintainers.

Entries should describe:

* the decision or capability
* how it was implemented
* why it matters
* meaningful tradeoffs or limitations
* evidence or verification where appropriate

Do not use the notebook as a list of completed assignments.

Do not overstate small conventions as major architectural achievements.

The notebook should accurately show how the project became deployable, observable, reversible, secure enough, and explainable.

---

## Style Guide Updates

This guide may evolve during the course.

If a convention changes, update this file in the source-of-truth location.

Do not rely on announcements scattered across chats, slides, private notes, or verbal instructions as the only record of a new convention.

Changes to the guide should be reviewed through a pull request when appropriate.

The guide should remain useful, accurate, and proportional to the project’s actual needs.

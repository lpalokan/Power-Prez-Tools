# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## GitHub Workflow

- **Never merge pull requests.** Only create PRs. The user will review, merge, and close them.
- **Never add commits to a branch after its PR has been merged.** Once merged, create a new branch from `main` for any remaining work.
- Create a separate feature branch per task from the task breakdown in GitHub Issues.
- Branch naming: `feature/N-short-description`
- Push the branch and create a PR targeting `main`.
- Reference the issue number in the PR body (e.g., "Closes #2").

## Shell command conventions

- When giving the user shell commands to run, **do not put inline `#`
  comments in the command blocks** (neither trailing nor standalone).
  The user pastes blocks into zsh and the comments cause confusion.
  Put any explanation in prose before or after the block instead.

## Versioning

- `package.json` `version` is the source of truth for the published npm
  package. **Keep track of it** and bump it (semver) before every
  `npm publish` whenever anything in the published package changes.
- Stable releases go to the npm `latest` tag. In-progress / not-yet-validated
  work (e.g. Windows) uses a prerelease version (`x.y.z-beta.n`) and the
  `beta` dist-tag so `latest` is never disturbed.
- Never reuse or regress a published version number; npm rejects it and it
  confuses users.

## Project

Power Pres Tools application suite to help working with PowerPoint on Mac.

## BDD-first development (mandatory)

Every new feature or behaviour change MUST start with Gherkin scenarios,
before any implementation code:

1. **Write/extend the `.feature` file first.** Add scenarios in plain
   English under `integration_test/features/`. This is the source of truth
   for what the feature does.
2. **Wire steps to the harness.** Reuse existing steps where possible; only
   add a new step file in `integration_test/features/step/`  when no existing phrase fits.
3. **Generate and run the failing test**  — confirm it
   fails for the right reason (red).
4. **Only then implement** the feature until the scenario passes (green),
   then refactor.

Do not write feature/implementation code before its Gherkin scenario
exists and fails. Bug fixes follow the same loop: add a scenario that
reproduces the bug first. See `docs/testing.md` for the full workflow,
step catalogue, and maintenance guide.

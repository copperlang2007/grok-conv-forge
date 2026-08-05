# ADR-001: pnpm Monorepo + Neon Flywheel for grok-conv-forge

**Status**: Accepted  
**Date**: 2026-08-05

## Context
We need a single source of truth that turns proprietary Grok conversation history into production applications while continuously feeding theBRIDGE master data flywheel.

## Decision
- pnpm workspaces + Turborepo for velocity and shared types.
- Drizzle + Neon for both chat_archive reads and new patterns/outcomes tables.
- Temporal (client stub now, full workers next) for durable forge workflows.
- Mandatory outcome emission on every successful forge.

## Consequences
+ Type safety across API ↔ web ↔ core.
+ Audit trail and self-improvement loop.
- Requires NEON_DATABASE_URL secret in CI and local.
- Temporal adds operational surface; start with optional autoDeploy flag.

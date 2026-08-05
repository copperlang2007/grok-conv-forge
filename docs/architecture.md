# Architecture — grok-conv-forge v1.1 Elite

## System Context

```
Grok Chat Archives (Neon chat_archive)
        │
        ▼
┌───────────────────────┐
│  Extractor (Zod + SQL)│  ← packages/core
└───────────┬───────────┘
            │ Patterns
            ▼
┌───────────────────────┐
│  Temporal Forge WF    │  ← durable Plan→Build→Ship
└───────────┬───────────┘
            │
     ┌──────┴──────┐
     ▼             ▼
 Scaffold       Deploy
 (TS monorepo)  (CDK / Vercel)
     │             │
     └──────┬──────┘
            ▼
   Outcome → Bridge Brain
```

## Packages
- `packages/core` — extractor, schemas, flywheel emitter
- `packages/db` — Drizzle schemas (conversations, patterns, generated_apps, outcomes)
- `packages/cdk` — AWS infrastructure
- `apps/api` — Fastify/Express + Temporal client
- `apps/web` — React 18 + Vite + Tailwind + shadcn dashboard

## Quality Gates
- TypeScript strict
- Zod at every boundary
- CI: typecheck + lint + audit
- Outcome emission mandatory for every forge

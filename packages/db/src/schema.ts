import { pgTable, uuid, text, timestamp, jsonb, integer, boolean, real } from 'drizzle-orm/pg-core';

export const patterns = pgTable('patterns', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowType: text('workflow_type').notNull(),
  confidence: real('confidence').notNull(),
  sourceConvIds: jsonb('source_conv_ids').$type<string[]>().notNull(),
  codeSnippets: jsonb('code_snippets').$type<string[]>().default([]),
  version: text('version').default('v1.0.0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const generatedApps = pgTable('generated_apps', {
  id: uuid('id').primaryKey().defaultRandom(),
  appId: text('app_id').notNull().unique(),
  status: text('status').notNull(), // scaffolded | deploying | live | failed
  repoUrl: text('repo_url'),
  patterns: jsonb('patterns'),
  stack: text('stack'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const forgeOutcomes = pgTable('forge_outcomes', {
  id: uuid('id').primaryKey().defaultRandom(),
  appId: text('app_id').notNull(),
  patternsCount: integer('patterns_count').notNull(),
  success: boolean('success').notNull(),
  error: text('error'),
  emittedAt: timestamp('emitted_at').defaultNow().notNull(),
  metadata: jsonb('metadata'),
});

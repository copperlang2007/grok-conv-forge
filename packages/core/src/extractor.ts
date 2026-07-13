import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

const NEON_URL = process.env.NEON_DATABASE_URL;
if (!NEON_URL) throw new Error('NEON_DATABASE_URL required');

const sqlClient = neon(NEON_URL);
const db = drizzle(sqlClient);

// Zod schemas for type-safe extraction
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  timestamp: z.string().optional(),
  model: z.string().optional(),
  tokens: z.number().optional(),
});

export const ConversationSchema = z.object({
  external_id: z.string(),
  title: z.string().nullable(),
  created_at: z.string().nullable(),
  last_message_at: z.string().nullable(),
  messages: z.array(ChatMessageSchema),
  metadata: z.record(z.any()).nullable(),
});

export type ExtractedPattern = z.infer<typeof PatternSchema>;

export const PatternSchema = z.object({
  id: z.string().uuid().optional(),
  workflowType: z.enum(['thebridge-orchestrator', 'agent-swarm', 'data-flywheel', 'grant-engine', 'voice-pipeline', 'custom']),
  confidence: z.number().min(0).max(1),
  sourceConvIds: z.array(z.string()),
  codeSnippets: z.array(z.string()),
  extractedAt: z.date(),
  version: z.string().default('v1.0.0'),
});

export async function extractPatternsFromNeon(limit = 100): Promise<ExtractedPattern[]> {
  // Deep query on nerd DB chat_archive
  const rows = await db.execute(sql`
    SELECT external_id, title, messages, metadata, last_message_at
    FROM chat_archive.conversations
    WHERE last_message_at > NOW() - INTERVAL '90 days'
    ORDER BY last_message_at DESC
    LIMIT ${limit}
  `);

  const patterns: ExtractedPattern[] = [];

  for (const row of rows.rows) {
    const parsed = ConversationSchema.safeParse({
      external_id: row.external_id,
      title: row.title,
      created_at: null,
      last_message_at: row.last_message_at,
      messages: row.messages,
      metadata: row.metadata,
    });

    if (!parsed.success) continue;

    const conv = parsed.data;
    const content = conv.messages.map(m => m.content).join(' ').toLowerCase();

    // Elite pattern detection (expand with embeddings/pgvector in v2)
    let workflowType: ExtractedPattern['workflowType'] = 'custom';
    let confidence = 0.6;

    if (content.includes('plan→build→ship') || content.includes('thebridge')) {
      workflowType = 'thebridge-orchestrator';
      confidence = 0.92;
    } else if (content.includes('agent') && content.includes('swarm')) {
      workflowType = 'agent-swarm';
      confidence = 0.85;
    } else if (content.includes('neon') || content.includes('flywheel') || content.includes('memory')) {
      workflowType = 'data-flywheel';
      confidence = 0.88;
    }

    if (confidence > 0.7) {
      const codeSnippets = conv.messages
        .filter(m => m.content.includes('```ts') || m.content.includes('```'))
        .map(m => m.content.substring(0, 2000)); // Truncate for safety

      patterns.push({
        workflowType,
        confidence,
        sourceConvIds: [conv.external_id],
        codeSnippets,
        extractedAt: new Date(),
        version: 'v1.0.0-elite',
      });
    }
  }

  return patterns;
}

// Emit to Bridge Brain / flywheel (stub - integrate with neon-chat-pusher)
export async function emitForgeOutcome(patterns: ExtractedPattern[], appId: string) {
  // TODO: INSERT into bridge_brain.workflow_decisions or retention_outcomes
  console.log(`[FLYWHEEL] Emitted ${patterns.length} patterns for app ${appId}`);
  return { success: true, count: patterns.length };
}

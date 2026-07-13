import express from 'express';
import { z } from 'zod';
import { extractPatternsFromNeon, emitForgeOutcome, PatternSchema } from '@grok-conv-forge/core/src/extractor';
import { Connection, Client } from '@temporalio/client';

const app = express();
app.use(express.json());

const ForgeRequestSchema = z.object({
  convLimit: z.number().min(10).max(500).default(100),
  workflowTypes: z.array(z.enum(['thebridge-orchestrator', 'agent-swarm', 'data-flywheel'])).optional(),
  autoDeploy: z.boolean().default(false),
});

app.post('/api/forge', async (req, res) => {
  try {
    const input = ForgeRequestSchema.parse(req.body);
    
    // Elite extraction from nerd Neon DB
    const patterns = await extractPatternsFromNeon(input.convLimit);
    const filtered = input.workflowTypes 
      ? patterns.filter(p => input.workflowTypes!.includes(p.workflowType))
      : patterns;

    // Generate app scaffold stub (elite: use templates from engineering-firm-standards)
    const appId = `forge-${Date.now()}`;
    const generatedApp = {
      id: appId,
      patterns: filtered,
      stack: 'pnpm + TS + Express + Drizzle + React/Vite + CDK',
      status: 'scaffolded',
      repoUrl: `https://github.com/copperlang2007/grok-conv-forge-generated-${appId}`,
    };

    // Emit to flywheel
    await emitForgeOutcome(filtered, appId);

    // Optional: Trigger Temporal workflow for durable deploy
    if (input.autoDeploy) {
      // const client = new Client({ connection: await Connection.connect() });
      // await client.workflow.start(...);
      console.log('[TEMPORAL] Would start durable forge workflow');
    }

    res.json({ success: true, generatedApp, patternsCount: filtered.length });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown' });
  }
});

app.get('/api/patterns', async (req, res) => {
  const patterns = await extractPatternsFromNeon(50);
  res.json({ patterns });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[ELITE API] grok-conv-forge running on :${PORT}`);
});

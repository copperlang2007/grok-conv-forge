import { useState } from 'react';
import { z } from 'zod';

const ForgeResponseSchema = z.object({
  success: z.boolean(),
  generatedApp: z.object({
    id: z.string(),
    patterns: z.array(z.any()),
    stack: z.string(),
    status: z.string(),
    repoUrl: z.string().optional(),
  }).optional(),
  patternsCount: z.number().optional(),
  error: z.string().optional(),
});

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [convLimit, setConvLimit] = useState(100);

  const handleForge = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convLimit, autoDeploy: false }),
      });
      const data = await res.json();
      const parsed = ForgeResponseSchema.safeParse(data);
      setResult(parsed.success ? parsed.data : data);
    } catch (e) {
      setResult({ success: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-bold tracking-tighter">grok-conv-forge</h1>
          <p className="text-xl text-zinc-400 mt-2">Elite theBRIDGE • Neon Flywheel • Production Apps from Grok Chats</p>
          <div className="text-xs text-emerald-400 mt-1">v1.0.0-elite • copperlang2007</div>
        </header>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl mb-4">Forge from Nerd Database</h2>
          <div className="flex gap-4 items-end mb-6">
            <div>
              <label className="block text-sm mb-1 text-zinc-400">Conv Limit (Neon query)</label>
              <input 
                type="number" 
                value={convLimit} 
                onChange={e => setConvLimit(parseInt(e.target.value))} 
                className="bg-zinc-950 border border-zinc-700 px-4 py-2 rounded w-32" 
              />
            </div>
            <button 
              onClick={handleForge} 
              disabled={loading}
              className="bg-white text-black px-8 py-2 rounded font-medium hover:bg-zinc-200 disabled:opacity-50"
            >
              {loading ? 'FORGING...' : 'FORGE ELITE APP'}
            </button>
          </div>

          {result && (
            <div className="mt-6 p-6 bg-zinc-950 border border-zinc-800 rounded">
              <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="text-xs text-zinc-500">
          Moat: Proprietary chat_archive patterns. Flywheel active. Pushed to GitHub. 
          Risks: PII gate, LLM quality (red-team recommended). 
          Stack: TS/Express/Drizzle/React/Vite/CDK/Temporal.
        </div>
      </div>
    </div>
  );
}

export default App;

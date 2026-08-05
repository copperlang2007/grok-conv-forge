import { useState } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function ForgeDashboard() {
  const [limit, setLimit] = useState(50);
  const [autoDeploy, setAutoDeploy] = useState(false);

  const patternsQuery = useQuery({
    queryKey: ['patterns'],
    queryFn: async () => {
      const res = await fetch('/api/patterns');
      if (!res.ok) throw new Error('Failed to load patterns');
      return res.json();
    },
  });

  const forgeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convLimit: limit, autoDeploy }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patterns'] }),
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">grok-conv-forge</h1>
        <p className="text-slate-400 mt-1">theBRIDGE Conversation → Production App Factory</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold mb-4">Forge Controls</h2>
            <label className="block text-sm text-slate-400 mb-1">Conversation Limit</label>
            <input
              type="number"
              min={10}
              max={500}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 mb-4"
            />
            <label className="flex items-center gap-2 text-sm mb-6">
              <input
                type="checkbox"
                checked={autoDeploy}
                onChange={(e) => setAutoDeploy(e.target.checked)}
              />
              Auto-deploy via Temporal
            </label>
            <button
              onClick={() => forgeMutation.mutate()}
              disabled={forgeMutation.isPending}
              className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-2.5 font-medium transition"
            >
              {forgeMutation.isPending ? 'Forging…' : 'Run Elite Forge'}
            </button>
            {forgeMutation.isSuccess && (
              <pre className="mt-4 text-xs bg-slate-950 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(forgeMutation.data, null, 2)}
              </pre>
            )}
            {forgeMutation.isError && (
              <p className="mt-3 text-red-400 text-sm">{String(forgeMutation.error)}</p>
            )}
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold mb-4">Extracted Patterns</h2>
            {patternsQuery.isLoading && <p className="text-slate-500">Loading from Neon…</p>}
            {patternsQuery.isError && <p className="text-red-400">Failed to load patterns</p>}
            {patternsQuery.data?.patterns?.length === 0 && (
              <p className="text-slate-500">No high-confidence patterns yet. Run a forge.</p>
            )}
            <ul className="space-y-3">
              {patternsQuery.data?.patterns?.map((p: any, i: number) => (
                <li key={i} className="rounded-lg bg-slate-950/80 border border-slate-800 p-4">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-emerald-400">{p.workflowType}</span>
                    <span className="text-xs text-slate-500">{(p.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Sources: {p.sourceConvIds?.join(', ') || '—'}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ForgeDashboard />
    </QueryClientProvider>
  );
}

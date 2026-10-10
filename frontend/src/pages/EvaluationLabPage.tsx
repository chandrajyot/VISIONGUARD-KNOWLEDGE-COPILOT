import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import type { EvaluationRunItem } from "../services/api";
import { Play } from "lucide-react";

export const EvaluationLabPage: React.FC = () => {
  const [runs, setRuns] = useState<EvaluationRunItem[]>([]);
  const [runningVariant, setRunningVariant] = useState<string | null>(null);

  const fetchRuns = async () => {
    try {
      const data = await api.getEvaluationRuns();
      setRuns(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleLaunchRun = async (variant: string) => {
    setRunningVariant(variant);
    try {
      await api.triggerEvaluationRun(`Benchmark Run: ${variant.toUpperCase()}`, variant);
      await fetchRuns();
    } catch (err) {
      alert("Error triggering evaluation experiment.");
    } finally {
      setRunningVariant(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-textPrimary tracking-tight">Reproducible RAG Research & Evaluation Lab</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Compare dense vector search, hybrid retrieval, reranking, and full copilot system across quantitative metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleLaunchRun("full_copilot")}
            disabled={runningVariant !== null}
            className="px-4 py-2 bg-primaryBlue text-white text-xs font-medium rounded-lg hover:bg-primaryBlue/90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primaryBlue/20"
          >
            <Play className="w-4 h-4" />
            <span>{runningVariant ? "Executing Benchmark..." : "Run Full System Benchmark"}</span>
          </button>
        </div>
      </div>

      {/* Experiment Launcher Bar */}
      <div className="bg-bgCard border border-borderDark rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Trigger Ablation Experiment</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleLaunchRun("dense_rag")}
            disabled={runningVariant !== null}
            className="px-3.5 py-2 bg-bgSidebar border border-borderDark hover:border-primaryBlue rounded-lg text-xs font-mono text-textSecondary hover:text-textPrimary transition-colors"
          >
            1. Dense Vector RAG
          </button>
          <button
            onClick={() => handleLaunchRun("hybrid_rag")}
            disabled={runningVariant !== null}
            className="px-3.5 py-2 bg-bgSidebar border border-borderDark hover:border-primaryBlue rounded-lg text-xs font-mono text-textSecondary hover:text-textPrimary transition-colors"
          >
            2. Dense + BM25 Hybrid RAG
          </button>
          <button
            onClick={() => handleLaunchRun("hybrid_rerank")}
            disabled={runningVariant !== null}
            className="px-3.5 py-2 bg-bgSidebar border border-borderDark hover:border-primaryBlue rounded-lg text-xs font-mono text-textSecondary hover:text-textPrimary transition-colors"
          >
            3. Hybrid + Cross-Encoder Rerank
          </button>
          <button
            onClick={() => handleLaunchRun("full_copilot")}
            disabled={runningVariant !== null}
            className="px-3.5 py-2 bg-primaryBlue/20 border border-primaryBlue/40 text-primaryBlue rounded-lg text-xs font-mono font-bold hover:bg-primaryBlue/30 transition-colors"
          >
            4. Full VisionGuard Copilot
          </button>
        </div>
      </div>

      {/* Historical Runs Table */}
      <div className="bg-bgCard border border-borderDark rounded-xl overflow-hidden">
        <div className="p-4 border-b border-borderDark flex items-center justify-between text-xs text-textSecondary">
          <span>{runs.length} Evaluated Research Runs</span>
          <span className="font-mono text-successGreen">Dataset: industrial_troubleshooting_v1</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-bgSidebar border-b border-borderDark text-textSecondary uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Run Name</th>
                <th className="p-4">Variant</th>
                <th className="p-4">Recall@5</th>
                <th className="p-4">MRR</th>
                <th className="p-4">nDCG@5</th>
                <th className="p-4">Citation Prec</th>
                <th className="p-4">Groundedness</th>
                <th className="p-4">Unsupported Rate</th>
                <th className="p-4">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderDark/60 text-textPrimary">
              {runs.map((r) => (
                <tr key={r.id} className="hover:bg-bgSidebar/40 transition-colors">
                  <td className="p-4 font-bold font-sans">{r.name}</td>
                  <td className="p-4 text-primaryBlue font-bold uppercase">{r.system_variant}</td>
                  <td className="p-4 font-bold text-successGreen">{(r.recall_at_k * 100).toFixed(1)}%</td>
                  <td className="p-4">{r.mrr.toFixed(3)}</td>
                  <td className="p-4">{r.ndcg_at_k.toFixed(3)}</td>
                  <td className="p-4 text-successGreen">{(r.citation_precision * 100).toFixed(1)}%</td>
                  <td className="p-4 text-successGreen">{(r.groundedness_score * 100).toFixed(1)}%</td>
                  <td className="p-4 text-defectRed">{(r.unsupported_claim_rate * 100).toFixed(1)}%</td>
                  <td className="p-4 text-textSecondary">{r.avg_latency_ms.toFixed(1)} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React from "react";

export const ModelRegistryPage: React.FC = () => {
  const models = [
    { name: "YOLOv8-Industrial-Crack-Detector", type: "Vision QA", version: "v8.2", status: "Active (Production Line A)" },
    { name: "all-MiniLM-L6-v2", type: "Dense Embedding", version: "v1.0", status: "Active (Vector Engine)" },
    { name: "ms-marco-MiniLM-L-6-v2", type: "Cross-Encoder Reranker", version: "v2.0", status: "Active (Stage D Reranker)" },
    { name: "VisionGuard-Grounded-Synthesis-v1", type: "LLM Generator", version: "v1.2", status: "Active (Offline / Provider)" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-textPrimary tracking-tight">AI Model Registry & Infrastructure</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          Active computer vision detection models, sentence embeddings, cross-encoders, and LLM providers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((m) => (
          <div key={m.name} className="bg-bgCard border border-borderDark rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primaryBlue font-mono">{m.type}</span>
              <span className="text-[10px] font-mono text-successGreen px-2 py-0.5 rounded bg-successGreen/10 border border-successGreen/30">
                {m.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-textPrimary">{m.name}</h3>
            <p className="text-xs text-textSecondary font-mono">Version: {m.version}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

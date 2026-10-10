import React, { useState } from "react";
import { Save, Key, Sliders } from "lucide-react";

export const SettingsPage: React.FC = () => {
  const [provider, setProvider] = useState("offline");
  const [apiKey, setApiKey] = useState("");
  const [topKRetrieve, setTopKRetrieve] = useState(10);
  const [topKRerank, setTopKRerank] = useState(5);
  const [simThreshold, setSimThreshold] = useState(0.35);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-textPrimary tracking-tight">System Configuration & Provider Settings</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          LLM provider API keys, vector database endpoints, retrieval thresholds, and reranker settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-bgCard border border-borderDark rounded-xl p-6 space-y-6 text-xs">
        {/* LLM Provider */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2">
            <Key className="w-4 h-4 text-primaryBlue" />
            LLM Provider & API Keys
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-textSecondary mb-1 font-medium">Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-bgSidebar border border-borderDark rounded-lg p-2.5 text-textPrimary focus:outline-none"
              >
                <option value="offline">Built-in Offline Grounded Engine (No Key Needed)</option>
                <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                <option value="gemini">Google Gemini (Gemini 1.5 Pro/Flash)</option>
                <option value="anthropic">Anthropic Claude (Claude 3.5 Sonnet)</option>
              </select>
            </div>
            <div>
              <label className="block text-textSecondary mb-1 font-medium">API Key (Stored in .env)</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-bgSidebar border border-borderDark rounded-lg p-2.5 text-textPrimary font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Retrieval Thresholds */}
        <div className="space-y-3 pt-4 border-t border-borderDark">
          <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primaryBlue" />
            RAG Retrieval & Reranker Hyperparameters
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-textSecondary mb-1">
                <span>Initial Hybrid Retrieval Top-K Passages:</span>
                <span className="font-mono text-textPrimary font-bold">{topKRetrieve}</span>
              </div>
              <input
                type="range"
                min={3}
                max={30}
                value={topKRetrieve}
                onChange={(e) => setTopKRetrieve(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-textSecondary mb-1">
                <span>Final Reranker Context Top-K:</span>
                <span className="font-mono text-textPrimary font-bold">{topKRerank}</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                value={topKRerank}
                onChange={(e) => setTopKRerank(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-textSecondary mb-1">
                <span>Similarity Confidence Threshold:</span>
                <span className="font-mono text-textPrimary font-bold">{simThreshold}</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={0.9}
                step={0.05}
                value={simThreshold}
                onChange={(e) => setSimThreshold(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-borderDark flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-primaryBlue text-white font-medium rounded-lg hover:bg-primaryBlue/90 flex items-center gap-2 shadow-lg shadow-primaryBlue/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const latencyData = [
  { time: "09:00", dense: 32, bm25: 12, rerank: 45 },
  { time: "10:00", dense: 35, bm25: 14, rerank: 48 },
  { time: "11:00", dense: 30, bm25: 11, rerank: 42 },
  { time: "12:00", dense: 40, bm25: 16, rerank: 52 },
  { time: "13:00", dense: 33, bm25: 13, rerank: 46 },
  { time: "14:00", dense: 31, bm25: 12, rerank: 44 },
];

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-textPrimary tracking-tight">System Performance & Retrieval Analytics</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          Observability, dense vs BM25 latency metrics, and citation accuracy monitoring.
        </p>
      </div>

      <div className="bg-bgCard border border-borderDark rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-textPrimary">Hybrid Retrieval Latency Breakdown (ms)</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={latencyData}>
              <XAxis dataKey="time" stroke="#91A5C4" fontSize={11} />
              <YAxis stroke="#91A5C4" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: "#0D1728", borderColor: "#22314A" }} />
              <Area type="monotone" dataKey="dense" stackId="1" stroke="#316BFA" fill="#316BFA" fillOpacity={0.4} name="Dense Vector" />
              <Area type="monotone" dataKey="bm25" stackId="1" stroke="#20C968" fill="#20C968" fillOpacity={0.4} name="BM25 Lexical" />
              <Area type="monotone" dataKey="rerank" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.4} name="Cross-Encoder Rerank" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

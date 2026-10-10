import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import type { AnalyticsOverview, DocumentItem, DefectEventItem } from "../services/api";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingUp,
  Activity,
  Database,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const defectChartData = [
  { name: "Surface Crack", count: 24, fill: "#F04444" },
  { name: "Porosity Void", count: 14, fill: "#F59E0B" },
  { name: "Dimension Skew", count: 9, fill: "#316BFA" },
  { name: "Weld Seam Gap", count: 6, fill: "#20C968" },
];

export const DashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [incidents, setIncidents] = useState<DefectEventItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ov, docs, incs] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getDocuments(),
          api.getIncidents(),
        ]);
        setOverview(ov);
        setDocuments(docs);
        setIncidents(incs);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-textPrimary tracking-tight">Executive Quality & RAG Dashboard</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Real-time telemetry, knowledge indexing metrics, and evidence-grounded defect investigations.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-bgCard border border-borderDark px-3 py-1.5 rounded-lg text-xs font-mono text-textSecondary">
          <Database className="w-4 h-4 text-primaryBlue" />
          <span>Vector Index: Qdrant / Hybrid BM25</span>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bgCard border border-borderDark p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-textSecondary">
            <span className="text-xs font-medium">Total Indexed Docs</span>
            <FileText className="w-4 h-4 text-primaryBlue" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-textPrimary">{overview?.total_indexed_documents ?? 0}</span>
            <span className="text-[11px] text-successGreen flex items-center font-mono">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 100% Ready
            </span>
          </div>
          <p className="text-[10px] text-textSecondary">{overview?.documents_awaiting_processing ?? 0} jobs in queue</p>
        </div>

        <div className="bg-bgCard border border-borderDark p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-textSecondary">
            <span className="text-xs font-medium">Open Incidents</span>
            <AlertTriangle className="w-4 h-4 text-defectRed" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-defectRed">{overview?.open_incidents ?? 0}</span>
            <span className="text-[11px] text-warningOrange font-mono">Line A Warning</span>
          </div>
          <p className="text-[10px] text-textSecondary">{overview?.defect_events_investigated ?? 0} total investigated</p>
        </div>

        <div className="bg-bgCard border border-borderDark p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-textSecondary">
            <span className="text-xs font-medium">Grounded RAG Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-successGreen" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-successGreen">{overview?.groundedness_rate ?? "91.8%"}</span>
            <span className="text-[11px] text-textSecondary font-mono">{overview?.citation_accuracy ?? "94%"} Citation</span>
          </div>
          <p className="text-[10px] text-textSecondary">{overview?.questions_answered_sufficient ?? 0} verified answers</p>
        </div>

        <div className="bg-bgCard border border-borderDark p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-textSecondary">
            <span className="text-xs font-medium">Retrieval Latency</span>
            <Zap className="w-4 h-4 text-warningOrange" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-textPrimary font-mono">{overview?.retrieval_latency_ms ?? 45} ms</span>
            <span className="text-[11px] text-textSecondary font-mono">{overview?.answer_latency_ms ?? 340} ms LLM</span>
          </div>
          <p className="text-[10px] text-textSecondary">Dense vector + BM25 fusion</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Defect Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-bgCard border border-borderDark p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-textPrimary">Defect Event Distribution by Class</h3>
              <p className="text-xs text-textSecondary">YOLOv8 visual quality inspection triggers</p>
            </div>
            <Activity className="w-4 h-4 text-textSecondary" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={defectChartData}>
                <XAxis dataKey="name" stroke="#91A5C4" fontSize={11} tickLine={false} />
                <YAxis stroke="#91A5C4" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0D1728", borderColor: "#22314A", borderRadius: "8px" }}
                  itemStyle={{ color: "#F5F7FB", fontSize: "12px" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {defectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Line Status Panel */}
        <div className="bg-bgCard border border-borderDark p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-semibold text-textPrimary">Production Line Telemetry</h3>
          <div className="space-y-3">
            <div className="p-3 bg-bgSidebar rounded-lg border border-borderDark space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textPrimary">Line A - Heavy Stamping</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-warningOrange/20 text-warningOrange border border-warningOrange/30">
                  WARNING
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-textSecondary">Hyd Pressure:</span>
                  <p className="text-defectRed font-bold">188.5 bar</p>
                </div>
                <div>
                  <span className="text-textSecondary">Fluid Temp:</span>
                  <p className="text-warningOrange font-bold">68.4 °C</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-bgSidebar rounded-lg border border-borderDark space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textPrimary">Line B - CNC & Weld</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-successGreen/20 text-successGreen border border-successGreen/30">
                  NORMAL
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-textSecondary">Laser Power:</span>
                  <p className="text-successGreen font-bold">4.1 kW</p>
                </div>
                <div>
                  <span className="text-textSecondary">Shield Gas:</span>
                  <p className="text-successGreen font-bold">18.2 L/min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Documents & Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Ingestion Status */}
        <div className="bg-bgCard border border-borderDark p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-textPrimary">Indexed Technical Documentation</h3>
            <span className="text-xs text-primaryBlue font-mono">{documents.length} Files</span>
          </div>
          <div className="divide-y divide-borderDark/60 max-h-56 overflow-y-auto">
            {documents.map((doc) => (
              <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-primaryBlue shrink-0" />
                  <div>
                    <p className="font-medium text-textPrimary">{doc.title}</p>
                    <p className="text-[10px] text-textSecondary">{doc.doc_type.toUpperCase()} • Rev {doc.revision} • {doc.chunk_count} Chunks</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-successGreen/10 text-successGreen border border-successGreen/30 uppercase">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Defect Events */}
        <div className="bg-bgCard border border-borderDark p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-textPrimary">Recent Defect Events</h3>
            <span className="text-xs text-textSecondary font-mono">{incidents.length} Logged</span>
          </div>
          <div className="divide-y divide-borderDark/60 max-h-56 overflow-y-auto">
            {incidents.map((evt) => (
              <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-defectRed shrink-0" />
                  <div>
                    <p className="font-medium text-textPrimary">{evt.defect_class} ({Math.round(evt.confidence * 100)}% Conf)</p>
                    <p className="text-[10px] text-textSecondary">{evt.production_line_id} • {evt.camera_id}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-defectRed/20 text-defectRed border border-defectRed/30 uppercase">
                  {evt.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

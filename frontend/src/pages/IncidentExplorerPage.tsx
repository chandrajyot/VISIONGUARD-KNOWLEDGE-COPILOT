import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import type { DefectEventItem } from "../services/api";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const IncidentExplorerPage: React.FC = () => {
  const [incidents, setIncidents] = useState<DefectEventItem[]>([]);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    api.getIncidents().then(setIncidents).catch(console.error);
  }, []);

  const filtered = incidents.filter(
    (inc) => filterSeverity === "all" || inc.severity.toLowerCase() === filterSeverity
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-textPrimary tracking-tight">Defect Incident Explorer</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Audit visual defect events, bounding boxes, severity rankings, and machine telemetry alignment.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-textSecondary">Filter Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-bgCard border border-borderDark px-3 py-1.5 rounded-lg text-textPrimary focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="high">High & Critical</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((evt) => (
          <div
            key={evt.id}
            className="bg-bgCard border border-borderDark rounded-xl p-5 space-y-4 hover:border-primaryBlue/50 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-primaryBlue font-bold">{evt.id}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    evt.severity === "high" || evt.severity === "critical"
                      ? "bg-defectRed/20 text-defectRed border-defectRed/40"
                      : "bg-warningOrange/20 text-warningOrange border-warningOrange/40"
                  }`}
                >
                  {evt.severity}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-textPrimary flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-defectRed" />
                  {evt.defect_class}
                </h3>
                <p className="text-xs text-textSecondary mt-1 font-mono">
                  Confidence: <span className="text-textPrimary font-bold">{Math.round(evt.confidence * 100)}%</span>
                </p>
              </div>

              <div className="p-3 bg-bgSidebar border border-borderDark/60 rounded-lg text-xs space-y-1 font-mono text-textSecondary">
                <p>Line: <span className="text-textPrimary">{evt.production_line_id}</span></p>
                <p>Machine: <span className="text-textPrimary">{evt.machine_id || "MCH-STAMP-01"}</span></p>
                <p>Camera: <span className="text-textPrimary">{evt.camera_id}</span></p>
                <p>Model: <span className="text-textPrimary text-[10px]">{evt.yolo_model_version}</span></p>
              </div>
            </div>

            <button
              onClick={() => navigate("/rca")}
              className="w-full py-2 bg-primaryBlue/10 border border-primaryBlue/30 text-primaryBlue hover:bg-primaryBlue text-xs font-semibold rounded-lg hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>Trigger RCA Investigation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

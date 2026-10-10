import React from "react";
import { FileCheck } from "lucide-react";

export const MaintenanceKnowledgePage: React.FC = () => {
  const sops = [
    { code: "SOP-402", title: "Stamping Press Micro-Cracking & Roller Calibration", machine: "MCH-STAMP-01", rev: "v3.2" },
    { code: "SOP-308", title: "Proportional Valve Cavitation & Seal Replacement", machine: "MCH-STAMP-01", rev: "v2.1" },
    { code: "SOP-601", title: "Robotic Laser Welder Optics Cleaning & Gas Calibration", machine: "MCH-WELD-01", rev: "v4.0" },
    { code: "SOP-104", title: "Heat Treatment Furnace Zonal Temperature Audit", machine: "MCH-HEAT-02", rev: "v1.5" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-textPrimary tracking-tight">Industrial Maintenance Knowledge Base</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          Curated repository of Standard Operating Procedures (SOPs), machine service manuals, and component failure mode matrices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sops.map((item) => (
          <div key={item.code} className="bg-bgCard border border-borderDark rounded-xl p-5 space-y-3 hover:border-primaryBlue/50 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-primaryBlue font-bold px-2 py-0.5 rounded bg-primaryBlue/10 border border-primaryBlue/30">
                {item.code}
              </span>
              <span className="font-mono text-[11px] text-textSecondary">{item.rev}</span>
            </div>
            <h3 className="text-sm font-bold text-textPrimary">{item.title}</h3>
            <p className="text-xs text-textSecondary font-mono">Applicable Equipment: {item.machine}</p>
            <div className="pt-2 border-t border-borderDark flex items-center justify-between text-xs text-textSecondary">
              <span className="flex items-center gap-1 text-successGreen"><FileCheck className="w-3.5 h-3.5" /> Indexed & Permission Validated</span>
              <a href="/copilot" className="text-primaryBlue hover:underline">Query in Copilot →</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

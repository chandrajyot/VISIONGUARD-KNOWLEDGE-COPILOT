import React from "react";

export const ProductionLinesPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-textPrimary tracking-tight">Production Lines & Plant Topology</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          Manufacturing line status, machine health scores, active batches, and sensor channels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bgCard border border-borderDark rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-textPrimary">Production Line A</h3>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-warningOrange/20 text-warningOrange border border-warningOrange/40">
              WARNING (Hydraulic Pressure)
            </span>
          </div>
          <p className="text-xs text-textSecondary">Product: Automotive Chassis Beam • Batch: BATCH-2026-089</p>

          <div className="space-y-2 pt-2 text-xs font-mono">
            <div className="p-3 bg-bgSidebar border border-borderDark rounded-lg flex items-center justify-between">
              <span>HydroPress 500T (MCH-STAMP-01)</span>
              <span className="text-warningOrange font-bold">Health: 84.2%</span>
            </div>
            <div className="p-3 bg-bgSidebar border border-borderDark rounded-lg flex items-center justify-between">
              <span>ThermoInduct Furnace (MCH-HEAT-02)</span>
              <span className="text-successGreen font-bold">Health: 92.0%</span>
            </div>
          </div>
        </div>

        <div className="bg-bgCard border border-borderDark rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-textPrimary">Production Line B</h3>
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-successGreen/20 text-successGreen border border-successGreen/40">
              OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-textSecondary">Product: Engine Mount Bracket • Batch: BATCH-2026-104</p>

          <div className="space-y-2 pt-2 text-xs font-mono">
            <div className="p-3 bg-bgSidebar border border-borderDark rounded-lg flex items-center justify-between">
              <span>RoboWeld Laser Welder (MCH-WELD-01)</span>
              <span className="text-successGreen font-bold">Health: 97.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

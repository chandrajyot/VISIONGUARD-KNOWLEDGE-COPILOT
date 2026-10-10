import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import type { InvestigationResult } from "../services/api";
import { CheckCircle2, AlertOctagon, HelpCircle, ShieldCheck, ArrowRight } from "lucide-react";

export const RootCauseAnalysisPage: React.FC = () => {
  const [investigation, setInvestigation] = useState<InvestigationResult | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  
  // Verification form state
  const [rootCauseInput, setRootCauseInput] = useState("");
  const [actionInput, setActionInput] = useState("");
  const [engineerInput, setEngineerInput] = useState("Sarah Chen");

  const runInvestigation = async () => {
    try {
      const res = await api.investigateIncident("DEF-2026-0941");
      setInvestigation(res);
      setRootCauseInput(res.candidate_hypotheses[0]?.hypothesis_text || "");
      setActionInput(res.recommended_actions[0] || "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    runInvestigation();
  }, []);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigation || !rootCauseInput || !actionInput) return;

    try {
      await api.verifyRootCause("INV-2026-042", rootCauseInput, actionInput, engineerInput);
      alert("Verified Root Cause & Corrective Action saved successfully!");
      setVerifyModalOpen(false);
    } catch (err) {
      alert("Error verifying root cause.");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-textPrimary tracking-tight">Evidence-Grounded Root Cause Analysis</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Event-conditioned hypothesis generation, contradiction audits, missing info controller, and technician verification.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runInvestigation}
            className="px-3 py-1.5 bg-bgCard border border-borderDark text-xs font-mono text-textSecondary hover:text-textPrimary rounded-lg"
          >
            Re-run Evidence Gap Controller
          </button>
          <button
            onClick={() => setVerifyModalOpen(true)}
            className="px-4 py-2 bg-successGreen text-white text-xs font-medium rounded-lg hover:bg-successGreen/90 transition-all flex items-center gap-2 shadow-lg shadow-successGreen/20"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Record Verified Root Cause</span>
          </button>
        </div>
      </div>

      {investigation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Candidate Hypotheses Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-bgCard border border-borderDark rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textPrimary">Defect Event Ref: DEF-2026-0941</span>
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-primaryBlue/20 text-primaryBlue border border-primaryBlue/30">
                  Sufficiency Score: {investigation.evidence_sufficiency_score} / 1.0
                </span>
              </div>
              <h3 className="text-base font-bold text-textPrimary">
                Target: {investigation.defect_class} on {investigation.production_line_id} ({investigation.machine_id})
              </h3>
            </div>

            {/* Hypotheses Cards */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider">Candidate Hypotheses (Ranked)</h4>
              {investigation.candidate_hypotheses.map((hyp) => (
                <div key={hyp.rank} className="bg-bgCard border border-borderDark rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-primaryBlue">
                      Rank #{hyp.rank} Candidate
                    </span>
                    <span className="text-xs font-mono font-bold text-successGreen">
                      Confidence: {Math.round(hyp.confidence_score * 100)}%
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-textPrimary leading-relaxed">{hyp.hypothesis_text}</p>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 bg-bgSidebar border border-borderDark/60 rounded-lg space-y-1">
                      <span className="font-bold text-successGreen flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Supporting Evidence ({hyp.supporting_evidence_ids.length})
                      </span>
                      <p className="text-[11px] text-textSecondary font-mono">
                        Matched: {hyp.supporting_evidence_ids.join(", ") || "SOP-402 Sec 1"}
                      </p>
                    </div>

                    <div className="p-3 bg-bgSidebar border border-borderDark/60 rounded-lg space-y-1">
                      <span className="font-bold text-defectRed flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5" /> Contradiction Audit ({hyp.contradicting_evidence_ids.length})
                      </span>
                      <p className="text-[11px] text-textSecondary font-mono">
                        {hyp.contradicting_evidence_ids.length > 0 ? "Heat treatment rule exclusion" : "No direct contradictions"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Information & Next Steps Column */}
          <div className="space-y-4">
            {/* Missing Measurements */}
            <div className="bg-bgCard border border-borderDark rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-warningOrange uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Missing Diagnostic Measurements
              </h3>
              <ul className="space-y-2 text-xs">
                {investigation.unresolved_questions.map((q, idx) => (
                  <li key={idx} className="p-2.5 bg-bgSidebar border border-borderDark rounded-lg text-textPrimary leading-relaxed">
                    • {q}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Next Diagnostic Steps */}
            <div className="bg-bgCard border border-borderDark rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-primaryBlue uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4" /> Documented Diagnostic Checks
              </h3>
              <ol className="space-y-2 text-xs">
                {investigation.recommended_actions.map((act, idx) => (
                  <li key={idx} className="p-2.5 bg-bgSidebar border border-borderDark rounded-lg text-textPrimary leading-relaxed">
                    <span className="font-bold font-mono text-primaryBlue">{idx + 1}.</span> {act}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Verify Root Cause Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bgCard border border-borderDark rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-borderDark pb-3">
              <h3 className="text-sm font-bold text-textPrimary">Record Verified Root Cause</h3>
              <button onClick={() => setVerifyModalOpen(false)} className="text-xs text-textSecondary">✕</button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-textSecondary mb-1 font-medium">Verified Root Cause Statement</label>
                <textarea
                  rows={3}
                  value={rootCauseInput}
                  onChange={(e) => setRootCauseInput(e.target.value)}
                  className="w-full bg-bgSidebar border border-borderDark rounded-lg p-2.5 text-textPrimary focus:outline-none focus:border-primaryBlue"
                  required
                />
              </div>

              <div>
                <label className="block text-textSecondary mb-1 font-medium">Corrective Action Implemented</label>
                <textarea
                  rows={3}
                  value={actionInput}
                  onChange={(e) => setActionInput(e.target.value)}
                  className="w-full bg-bgSidebar border border-borderDark rounded-lg p-2.5 text-textPrimary focus:outline-none focus:border-primaryBlue"
                  required
                />
              </div>

              <div>
                <label className="block text-textSecondary mb-1">Verifying Engineer</label>
                <input
                  type="text"
                  value={engineerInput}
                  onChange={(e) => setEngineerInput(e.target.value)}
                  className="w-full bg-bgSidebar border border-borderDark rounded-lg p-2.5 text-textPrimary"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-borderDark">
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-4 py-2 bg-bgSidebar border border-borderDark rounded-lg text-textSecondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-successGreen text-white font-medium rounded-lg hover:bg-successGreen/90"
                >
                  Save Verified Cause
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import type { DocumentItem } from "../services/api";
import { Upload, FileText, Trash2, RefreshCw } from "lucide-react";

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("sop");
  const [revision, setRevision] = useState("v1.0");
  const [machineId, setMachineId] = useState("MCH-STAMP-01");
  const [lineId] = useState("LINE-A");
  const [permission, setPermission] = useState("standard");
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocs = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("doc_type", docType);
    formData.append("revision", revision);
    formData.append("machine_id", machineId);
    formData.append("production_line_id", lineId);
    formData.append("permission_required", permission);

    try {
      await api.uploadDocument(formData);
      setUploadModalOpen(false);
      setFile(null);
      setTitle("");
      await fetchDocs();
    } catch (err) {
      alert("Upload failed. Ensure backend server is running.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (confirm("Are you sure you want to delete this document and purge vector chunks?")) {
      await api.deleteDocument(docId);
      await fetchDocs();
    }
  };

  const handleReindex = async (docId: string) => {
    await api.reindexDocument(docId);
    await fetchDocs();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-textPrimary tracking-tight">Enterprise Knowledge Management</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            Ingest, chunk, index, and manage standard operating procedures (SOPs), manuals, and specs.
          </p>
        </div>
        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2 bg-primaryBlue text-white text-xs font-medium rounded-lg hover:bg-primaryBlue/90 transition-all flex items-center gap-2 shadow-lg shadow-primaryBlue/20"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Document</span>
        </button>
      </div>

      {/* Document Table */}
      <div className="bg-bgCard border border-borderDark rounded-xl overflow-hidden">
        <div className="p-4 border-b border-borderDark flex items-center justify-between text-xs text-textSecondary">
          <span>{documents.length} Technical Documents Indexed</span>
          <button onClick={fetchDocs} className="hover:text-textPrimary flex items-center gap-1 font-mono">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-bgSidebar border-b border-borderDark text-textSecondary uppercase tracking-wider text-[10px] font-mono">
            <tr>
              <th className="p-4">Document Title</th>
              <th className="p-4">Type</th>
              <th className="p-4">Revision</th>
              <th className="p-4">Machine / Line</th>
              <th className="p-4">Permission</th>
              <th className="p-4">Status</th>
              <th className="p-4">Chunks</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borderDark/60 text-textPrimary">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-bgSidebar/40 transition-colors">
                <td className="p-4 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primaryBlue shrink-0" />
                  <div>
                    <p className="font-bold">{doc.title}</p>
                    <p className="text-[10px] text-textSecondary font-mono">{doc.file_name} ({(doc.file_size_bytes / 1024).toFixed(1)} KB)</p>
                  </div>
                </td>
                <td className="p-4 font-mono uppercase text-textSecondary">{doc.doc_type}</td>
                <td className="p-4 font-mono">{doc.revision}</td>
                <td className="p-4 text-textSecondary">{doc.machine_id || "All Lines"}</td>
                <td className="p-4 font-mono">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    doc.permission_required === "confidential"
                      ? "bg-defectRed/20 text-defectRed border border-defectRed/30"
                      : "bg-bgSidebar border border-borderDark text-textSecondary"
                  }`}>
                    {doc.permission_required}
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-successGreen/10 text-successGreen border border-successGreen/30 uppercase">
                    {doc.status}
                  </span>
                </td>
                <td className="p-4 font-mono text-center">{doc.chunk_count}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleReindex(doc.id)}
                    className="p-1.5 rounded hover:bg-bgSidebar text-textSecondary hover:text-primaryBlue transition-colors"
                    title="Re-index document"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 rounded hover:bg-bgSidebar text-textSecondary hover:text-defectRed transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bgCard border border-borderDark rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-borderDark pb-3">
              <h3 className="text-sm font-bold text-textPrimary">Ingest New Technical Document</h3>
              <button onClick={() => setUploadModalOpen(false)} className="text-xs text-textSecondary hover:text-textPrimary">✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-textSecondary mb-1 font-medium">Select File (PDF, DOCX, TXT, CSV, MD)</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full bg-bgSidebar border border-borderDark rounded-lg p-2 text-textPrimary cursor-pointer"
                  required
                />
              </div>

              <div>
                <label className="block text-textSecondary mb-1 font-medium">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., SOP-501 Roller Assembly & Bearing Specs"
                  className="w-full bg-bgSidebar border border-borderDark rounded-lg p-2.5 text-textPrimary focus:outline-none focus:border-primaryBlue"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-textSecondary mb-1">Doc Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full bg-bgSidebar border border-borderDark rounded-lg p-2.5 text-textPrimary"
                  >
                    <option value="sop">SOP Standard</option>
                    <option value="manual">Service Manual</option>
                    <option value="spec">Specification</option>
                    <option value="incident_report">Incident Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-textSecondary mb-1">Revision</label>
                  <input
                    type="text"
                    value={revision}
                    onChange={(e) => setRevision(e.target.value)}
                    className="w-full bg-bgSidebar border border-borderDark rounded-lg p-2.5 text-textPrimary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-textSecondary mb-1">Target Machine</label>
                  <input
                    type="text"
                    value={machineId}
                    onChange={(e) => setMachineId(e.target.value)}
                    className="w-full bg-bgSidebar border border-borderDark rounded-lg p-2.5 text-textPrimary"
                  />
                </div>
                <div>
                  <label className="block text-textSecondary mb-1">Permission Required</label>
                  <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value)}
                    className="w-full bg-bgSidebar border border-borderDark rounded-lg p-2.5 text-textPrimary"
                  >
                    <option value="standard">Standard</option>
                    <option value="restricted">Restricted</option>
                    <option value="confidential">Confidential</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-borderDark">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-bgSidebar border border-borderDark rounded-lg text-textSecondary hover:text-textPrimary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-primaryBlue text-white font-medium rounded-lg hover:bg-primaryBlue/90 disabled:opacity-50"
                >
                  {isUploading ? "Uploading & Indexing..." : "Start Ingestion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

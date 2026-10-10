import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";

// Import 13 pages
import { DashboardPage } from "./pages/DashboardPage";
import { LiveInspectionPage } from "./pages/LiveInspectionPage";
import { KnowledgeCopilotPage } from "./pages/KnowledgeCopilotPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { IncidentExplorerPage } from "./pages/IncidentExplorerPage";
import { RootCauseAnalysisPage } from "./pages/RootCauseAnalysisPage";
import { MaintenanceKnowledgePage } from "./pages/MaintenanceKnowledgePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { EvaluationLabPage } from "./pages/EvaluationLabPage";
import { ModelRegistryPage } from "./pages/ModelRegistryPage";
import { ProductionLinesPage } from "./pages/ProductionLinesPage";
import { UsersAccessPage } from "./pages/UsersAccessPage";
import { SettingsPage } from "./pages/SettingsPage";

export const App: React.FC = () => {
  const [userRole, setUserRole] = useState("quality_engineer");
  const [permissionLevel, setPermissionLevel] = useState("standard");

  return (
    <Router>
      <div className="flex h-screen bg-bgMain text-textPrimary overflow-hidden font-sans">
        {/* Left 13-Item Sidebar */}
        <Sidebar />

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header */}
          <Header
            userRole={userRole}
            setUserRole={setUserRole}
            permissionLevel={permissionLevel}
            setPermissionLevel={setPermissionLevel}
          />

          {/* Page Router Viewport */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/inspection" element={<LiveInspectionPage />} />
              <Route path="/copilot" element={<KnowledgeCopilotPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/incidents" element={<IncidentExplorerPage />} />
              <Route path="/rca" element={<RootCauseAnalysisPage />} />
              <Route path="/maintenance" element={<MaintenanceKnowledgePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/evaluation" element={<EvaluationLabPage />} />
              <Route path="/models" element={<ModelRegistryPage />} />
              <Route path="/lines" element={<ProductionLinesPage />} />
              <Route path="/users" element={<UsersAccessPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;

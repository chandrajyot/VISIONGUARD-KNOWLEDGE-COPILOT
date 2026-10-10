import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  Bot,
  FileText,
  AlertTriangle,
  GitPullRequest,
  Wrench,
  BarChart3,
  FlaskConical,
  Cpu,
  Factory,
  Users,
  Settings,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/inspection", label: "Live Inspection", icon: Camera },
  { path: "/copilot", label: "Knowledge Copilot", icon: Bot },
  { path: "/documents", label: "Documents", icon: FileText },
  { path: "/incidents", label: "Incident Explorer", icon: AlertTriangle },
  { path: "/rca", label: "Root Cause Analysis", icon: GitPullRequest },
  { path: "/maintenance", label: "Maintenance Knowledge", icon: Wrench },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/evaluation", label: "Evaluation Lab", icon: FlaskConical },
  { path: "/models", label: "Model Registry", icon: Cpu },
  { path: "/lines", label: "Production Lines", icon: Factory },
  { path: "/users", label: "Users & Access", icon: Users },
  { path: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-bgSidebar border-r border-borderDark flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-borderDark flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primaryBlue/20 border border-primaryBlue/40 flex items-center justify-center text-primaryBlue shadow-lg shadow-primaryBlue/10">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-textPrimary tracking-tight">VISIONGUARD</h1>
          <p className="text-[10px] text-textSecondary uppercase tracking-widest font-mono">Knowledge Copilot v1.0</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-primaryBlue text-white shadow-md shadow-primaryBlue/20"
                    : "text-textSecondary hover:text-textPrimary hover:bg-bgCard/60"
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-borderDark bg-bgCard/40 text-xs">
        <div className="flex items-center justify-between text-textSecondary text-[11px] mb-1">
          <span>Engine Status</span>
          <span className="flex items-center gap-1.5 text-successGreen font-mono">
            <span className="w-2 h-2 rounded-full bg-successGreen animate-pulse"></span>
            ACTIVE
          </span>
        </div>
        <div className="text-[10px] font-mono text-textSecondary/70 truncate">
          RAG Pipeline • Dense+BM25+Rerank
        </div>
      </div>
    </aside>
  );
};

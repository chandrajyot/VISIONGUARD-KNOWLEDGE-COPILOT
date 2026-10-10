import React from "react";
import { Search, Bell, Activity, Shield } from "lucide-react";

interface HeaderProps {
  userRole: string;
  setUserRole: (role: string) => void;
  permissionLevel: string;
  setPermissionLevel: (perm: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  setUserRole,
  permissionLevel,
  setPermissionLevel,
}) => {
  return (
    <header className="h-16 bg-bgSidebar/80 backdrop-blur border-b border-borderDark px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
        <input
          type="text"
          placeholder="Search SOPs, manuals, incidents..."
          className="w-full bg-bgCard border border-borderDark rounded-lg pl-9 pr-4 py-1.5 text-xs text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:border-primaryBlue transition-colors"
        />
      </div>

      {/* Control Tools */}
      <div className="flex items-center gap-4">
        {/* Permission Level Dropdown */}
        <div className="flex items-center gap-2 bg-bgCard border border-borderDark px-3 py-1 rounded-lg text-xs">
          <Shield className="w-3.5 h-3.5 text-primaryBlue" />
          <span className="text-textSecondary text-[11px]">Permission:</span>
          <select
            value={permissionLevel}
            onChange={(e) => setPermissionLevel(e.target.value)}
            className="bg-transparent text-textPrimary text-xs focus:outline-none cursor-pointer font-medium"
          >
            <option value="standard" className="bg-bgCard">Standard</option>
            <option value="restricted" className="bg-bgCard">Restricted</option>
            <option value="confidential" className="bg-bgCard">Confidential</option>
          </select>
        </div>

        {/* User Role Switcher */}
        <div className="flex items-center gap-2 bg-bgCard border border-borderDark px-3 py-1 rounded-lg text-xs">
          <span className="text-textSecondary text-[11px]">Role:</span>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="bg-transparent text-textPrimary text-xs focus:outline-none cursor-pointer font-medium"
          >
            <option value="quality_engineer" className="bg-bgCard">Sarah Chen (Quality Eng)</option>
            <option value="maintenance_engineer" className="bg-bgCard">Marcus Brody (Maint Sup)</option>
            <option value="admin" className="bg-bgCard">Alex Vance (Lead Eng)</option>
          </select>
        </div>

        {/* System Health Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-successGreen/10 border border-successGreen/30 text-successGreen text-xs font-mono">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Line A • OK</span>
        </div>

        {/* Notifications */}
        <button className="w-8 h-8 rounded-lg bg-bgCard border border-borderDark flex items-center justify-center text-textSecondary hover:text-textPrimary transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-defectRed absolute top-1.5 right-1.5"></span>
        </button>
      </div>
    </header>
  );
};

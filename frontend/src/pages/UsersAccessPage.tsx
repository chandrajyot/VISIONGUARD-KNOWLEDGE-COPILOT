import React from "react";

export const UsersAccessPage: React.FC = () => {
  const users = [
    { name: "Alex Vance", email: "admin@visionguard.ai", role: "Lead Engineer", perm: "confidential" },
    { name: "Sarah Chen", email: "quality@visionguard.ai", role: "Quality Engineer", perm: "standard" },
    { name: "Marcus Brody", email: "maintenance@visionguard.ai", role: "Maintenance Supervisor", perm: "standard" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-textPrimary tracking-tight">Role-Based Access Control (RBAC) & Audit Logs</h2>
        <p className="text-xs text-textSecondary mt-0.5">
          Document security permissions matrix and user tenant authorization.
        </p>
      </div>

      <div className="bg-bgCard border border-borderDark rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-bgSidebar border-b border-borderDark text-textSecondary uppercase tracking-wider text-[10px] font-mono">
            <tr>
              <th className="p-4">User Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Permission Clearance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borderDark/60 text-textPrimary font-mono">
            {users.map((u) => (
              <tr key={u.email} className="hover:bg-bgSidebar/40">
                <td className="p-4 font-bold font-sans">{u.name}</td>
                <td className="p-4 text-textSecondary">{u.email}</td>
                <td className="p-4">{u.role}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-primaryBlue/20 text-primaryBlue border border-primaryBlue/30">
                    {u.perm}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

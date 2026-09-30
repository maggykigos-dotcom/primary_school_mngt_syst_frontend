import { useState } from "react";

import Navbar
  from "../../components/Navbar/Navbar";

import Sidebar
  from "../../components/Sidebar/Sidebar";

import "./DashboardLayout.css";

const DashboardLayout = ({
  children,
}) => {

  // Mobile sidebar
  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  // Desktop sidebar
  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  return (
    <div
      className={`dashboard-layout ${
        sidebarCollapsed
          ? "sidebar-is-collapsed"
          : ""
      }`}
    >

      <Sidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
        collapsed={sidebarCollapsed}
        onToggleCollapse={() =>
          setSidebarCollapsed(
            !sidebarCollapsed
          )
        }
      />

      <div className="dashboard-main">

        <Navbar
          onMenuClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
        />

        <main className="dashboard-content">
          {children}
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;
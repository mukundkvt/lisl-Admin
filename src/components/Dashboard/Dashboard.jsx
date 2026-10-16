"use client";

import React, { useState, useEffect } from "react";
import SupervisorDashboard from "./SupervisorDashboard";
import RMDashboard from "./RMDashboard";
import APDashboard from "./APDashboard";
import AdminDashboard from "./AdminDashboard";
import BranchDashboard from "./BranchDashboard";
import ScrutinyDashboard from "./ScrutinyDashboard";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser(parsed);
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
      }
    }
  }, []);

  if (!isClient) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const role = currentUser?.role;

  return (
    <div>
      {role === "Admin" && <AdminDashboard previewRole="Admin" />}
      {role === "Supervisor" && <SupervisorDashboard previewRole="Supervisor" />}
      {role === "Relationship Manager" && <RMDashboard previewRole="Relationship Manager" />}
      {role === "Authorised Person" && <APDashboard previewRole="Authorised Person" />}
      {role === "Branch" && <BranchDashboard previewRole="Branch" />}
      {role === "Scrutiny Officer" && <ScrutinyDashboard previewRole="Scrutiny Officer" />}
      {!["Admin", "Supervisor", "Relationship Manager", "Authorised Person", "Branch", "Scrutiny Officer"].includes(role) && (
        <div className="p-4 text-center text-muted">
          <p>No dashboard view available for your role ({role || "Unknown"}).</p>
        </div>
      )}
    </div>
  );
}

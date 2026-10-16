"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export default function ScrutinyDashboard({ previewRole = "Scrutiny Officer" }) {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/role-summary?previewRole=${previewRole}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data?.status === "success") {
        setSummaryData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching Scrutiny summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [previewRole]);

  const kpis = summaryData?.kpis || {
    onboardingThisMonth: 0,
    onboardingThisWeek: 0,
    onboardingToday: 0,
    verifiedOnboarding: 0,
    accountsOpenToday: 0,
  };

  const pendingReviewQueue = summaryData?.pendingReviewQueue || [];
  const completedToday = summaryData?.allocatedCompletedToday || 0;

  return (
    <div className="p-2 p-md-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="mb-0 fw-bold" style={{ color: "#0f172a", letterSpacing: "-0.5px" }}>
              Scrutiny Officer Verification Desk
            </h3>
            <span
              className="badge px-2.5 py-1"
              style={{
                backgroundColor: "#ecfdf5",
                color: "#059669",
                border: "1px solid #a7f3d0",
                borderRadius: "20px",
                fontSize: "12px",
              }}
            >
              Verification Queue
            </span>
          </div>
          <p className="text-muted small mb-0 mt-1">
            Review applicant documents, verify PAN/bank/IPV identity, and approve eKYC accounts.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={fetchSummary}
            className="btn btn-sm btn-white d-flex align-items-center gap-1.5 shadow-sm"
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Scrutiny KPI Banners */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div
            className="card border-0 shadow-sm p-4 h-100"
            style={{
              borderRadius: "18px",
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              color: "#fff",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-uppercase small fw-semibold text-white-50">Pending Scrutiny Queue</span>
                <h1 className="fw-bold mt-2 mb-0 display-5">{pendingReviewQueue.length}</h1>
                <p className="small mb-0 mt-2 text-white-50">Applications assigned & ready for verification</p>
              </div>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ClipboardCheck size={28} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div
            className="card border-0 shadow-sm p-4 h-100"
            style={{
              borderRadius: "18px",
              background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
              color: "#fff",
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-uppercase small fw-semibold text-white-50">Allocated Completed Today</span>
                <h1 className="fw-bold mt-2 mb-0 display-5">{completedToday}</h1>
                <p className="small mb-0 mt-2 text-white-50">Applications successfully verified today</p>
              </div>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={28} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Verification Cases Table */}
      <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: "18px" }}>
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
          <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <ClipboardCheck size={20} className="text-primary" />
            Leads Assigned To Your Desk
          </h5>
          <Link href="/pending" className="small text-primary text-decoration-none fw-semibold">
            Open Full Verification Desk
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
            <thead className="table-light">
              <tr>
                <th>Applicant Name</th>
                <th>PAN</th>
                <th>Mobile</th>
                <th>Intake Date</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingReviewQueue.length > 0 ? (
                pendingReviewQueue.map((u, idx) => (
                  <tr key={idx}>
                    <td className="fw-bold text-dark">{u.name?.fullName || "Applicant"}</td>
                    <td className="font-monospace text-muted">{u.PAN}</td>
                    <td className="text-muted">{u.mobile}</td>
                    <td className="text-muted small">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="text-end">
                      <Link
                        href="/pending"
                        className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm px-3"
                      >
                        Review Application
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-5">
                    No pending cases in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

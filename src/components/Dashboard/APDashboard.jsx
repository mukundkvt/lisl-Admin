"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Sun,
  CheckCircle2,
  Users,
  Copy,
  Check,
  Share2,
  QrCode,
  RefreshCw,
  Layers,
  Activity,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export default function APDashboard({ previewRole = "Authorised Person" }) {
  const [summaryData, setSummaryData] = useState(null);
  const [copied, setCopied] = useState(false);
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
      console.error("Error fetching AP summary:", err);
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
    accountsOpenThisMonth: 0,
    accountsOpenThisWeek: 0,
    accountsOpenToday: 0,
    overallRejections: 0,
  };

  const stages = summaryData?.stages || [];
  const recentLeads = summaryData?.recentLeads || [];
  const referralCode = summaryData?.referralCode || "LISL-AP";
  const referralUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-2 p-md-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="mb-0 fw-bold" style={{ color: "#0f172a", letterSpacing: "-0.5px" }}>
              Authorised Person (AP) Partner Dashboard
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
              Partner Portal
            </span>
          </div>
          <p className="text-muted small mb-0 mt-1">
            Generate client leads, track referred onboarding progress, and monitor conversion success.
          </p>
        </div>

        <button
          onClick={fetchSummary}
          className="btn btn-sm btn-white d-flex align-items-center gap-1.5 shadow-sm"
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontWeight: 500,
          }}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Referral Link Quick Tool */}
      <div
        className="card border-0 shadow-sm p-4 mb-4"
        style={{
          borderRadius: "18px",
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          color: "#fff",
        }}
      >
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <Share2 size={20} className="text-info" />
              <h5 className="mb-0 fw-bold">Your Client Referral Link</h5>
            </div>
            <p className="small mb-0 text-white-50">
              Share this dedicated link with prospective clients. Leads are automatically tagged to your partner account.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-grow-1 flex-md-grow-0" style={{ maxWidth: "500px" }}>
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="form-control form-control-sm text-dark bg-white font-monospace"
              style={{ borderRadius: "8px", fontSize: "12px" }}
            />
            <button
              onClick={copyToClipboard}
              className="btn btn-light btn-sm d-flex align-items-center gap-1.5 fw-semibold"
              style={{ borderRadius: "8px", whiteSpace: "nowrap" }}
            >
              {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Header KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm h-100 p-3"
            style={{
              borderRadius: "16px",
              background: "#ffffff",
              borderLeft: "4px solid #2563eb",
            }}
          >
            <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b" }}>
              Leads (Month)
            </span>
            <h2 className="mb-0 mt-2 fw-bold text-dark">{kpis.onboardingThisMonth}</h2>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm h-100 p-3"
            style={{
              borderRadius: "16px",
              background: "#ffffff",
              borderLeft: "4px solid #7c3aed",
            }}
          >
            <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b" }}>
              Leads (Week)
            </span>
            <h2 className="mb-0 mt-2 fw-bold text-dark">{kpis.onboardingThisWeek}</h2>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm h-100 p-3"
            style={{
              borderRadius: "16px",
              background: "#ffffff",
              borderLeft: "4px solid #ea580c",
            }}
          >
            <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b" }}>
              Leads (Today)
            </span>
            <h2 className="mb-0 mt-2 fw-bold text-dark">{kpis.onboardingToday}</h2>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm h-100 p-3"
            style={{
              borderRadius: "16px",
              background: "#ffffff",
              borderLeft: "4px solid #059669",
            }}
          >
            <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b" }}>
              Completed Accounts
            </span>
            <h2 className="mb-0 mt-2 fw-bold text-success">{kpis.accountsOpenThisMonth}</h2>
          </div>
        </div>
      </div>

      {/* Pipeline Stages & Recent Referred Clients */}
      <div className="row g-3 mb-4">
        {/* Pipeline Stages */}
        <div className="col-12 col-xl-5">
          <div
            className="card border-0 shadow-sm h-100 p-3 p-md-4"
            style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Layers size={18} className="text-primary" />
                Client Onboarding Pipeline
              </h6>
              <span className="badge bg-light text-muted border">Funnel</span>
            </div>

            <div className="d-flex flex-column gap-3">
              {stages.map((st) => {
                const stageUrlMap = {
                  pending: "/pending",
                  esigned: "/esigned",
                  approved: "/approved",
                  rejected: "/rejected",
                  completed: "/completed",
                };
                return (
                  <Link key={st.key} href={stageUrlMap[st.key] || "/all"} className="text-decoration-none">
                    <div
                      className="p-1 rounded"
                      style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1 small">
                        <span className="fw-semibold text-dark">{st.label}</span>
                        <span className="fw-bold" style={{ color: st.color }}>
                          {st.count} ({st.percentage}%)
                        </span>
                      </div>
                      <div
                        style={{
                          height: "8px",
                          backgroundColor: "#e2e8f0",
                          borderRadius: "999px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${st.percentage}%`,
                            height: "100%",
                            background: st.color,
                            borderRadius: "999px",
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Referred Clients Table */}
        <div className="col-12 col-xl-7">
          <div
            className="card border-0 shadow-sm h-100 p-3 p-md-4"
            style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Users size={18} className="text-primary" />
                Recent Referred Clients
              </h6>
              <Link href="/all" className="small text-primary text-decoration-none fw-semibold">
                View All
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: "12px" }}>
                <thead className="table-light">
                  <tr>
                    <th>Client Name</th>
                    <th>PAN</th>
                    <th>Mobile</th>
                    <th className="text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.length > 0 ? (
                    recentLeads.map((u, idx) => (
                      <tr key={idx}>
                        <td className="fw-semibold text-dark">{u.name?.fullName || "Applicant"}</td>
                        <td className="text-muted">{u.PAN}</td>
                        <td className="text-muted">{u.mobile}</td>
                        <td className="text-end">
                          <span
                            className={`badge ${
                              u.userStatus === "completed"
                                ? "bg-success-subtle text-success"
                                : u.userStatus === "rejected"
                                ? "bg-danger-subtle text-danger"
                                : "bg-warning-subtle text-warning"
                            }`}
                          >
                            {u.userStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        No clients referred yet. Share your referral link to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

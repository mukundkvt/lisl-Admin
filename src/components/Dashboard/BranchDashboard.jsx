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
  Building2,
  TrendingUp,
  Calendar,
  Sun,
  CheckCircle2,
  Users,
  RefreshCw,
  Layers,
  Activity,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export default function BranchDashboard({ previewRole = "Branch" }) {
  const [summaryData, setSummaryData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [trendFilter, setTrendFilter] = useState("ftm");
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
      console.error("Error fetching branch summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrend = async (filter) => {
    try {
      const token = getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/onboarding-trend?filter=${filter}&previewRole=${previewRole}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data?.status === "success") {
        setTrendData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching branch trend:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [previewRole]);

  useEffect(() => {
    fetchTrend(trendFilter);
  }, [trendFilter, previewRole]);

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
  const branchStaff = summaryData?.branchStaff || [];
  const recentLeads = summaryData?.recentLeads || [];

  return (
    <div className="p-2 p-md-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="mb-0 fw-bold" style={{ color: "#0f172a", letterSpacing: "-0.5px" }}>
              Branch Office Dashboard
            </h3>
            <span
              className="badge px-2.5 py-1"
              style={{
                backgroundColor: "#e0f2fe",
                color: "#0369a1",
                border: "1px solid #bae6fd",
                borderRadius: "20px",
                fontSize: "12px",
              }}
            >
              Location Analytics
            </span>
          </div>
          <p className="text-muted small mb-0 mt-1">
            Local branch client volume, staff/RM allocations, and localized onboarding throughput.
          </p>
        </div>

        <button
          onClick={() => {
            fetchSummary();
            fetchTrend(trendFilter);
          }}
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

      {/* 4 Header KPIs */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 p-3 bg-white" style={{ borderRadius: "16px", borderLeft: "4px solid #0284c7" }}>
            <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b" }}>Branch Intake (Month)</span>
            <h2 className="mb-0 mt-2 fw-bold text-dark">{kpis.onboardingThisMonth}</h2>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 p-3 bg-white" style={{ borderRadius: "16px", borderLeft: "4px solid #7c3aed" }}>
            <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b" }}>Branch Intake (Week)</span>
            <h2 className="mb-0 mt-2 fw-bold text-dark">{kpis.onboardingThisWeek}</h2>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 p-3 bg-white" style={{ borderRadius: "16px", borderLeft: "4px solid #ea580c" }}>
            <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b" }}>Branch Intake (Today)</span>
            <h2 className="mb-0 mt-2 fw-bold text-dark">{kpis.onboardingToday}</h2>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 p-3 bg-white" style={{ borderRadius: "16px", borderLeft: "4px solid #059669" }}>
            <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b" }}>Accounts Opened</span>
            <h2 className="mb-0 mt-2 fw-bold text-success">{kpis.accountsOpenThisMonth}</h2>
          </div>
        </div>
      </div>

      {/* Trend & Staff Breakdown */}
      <div className="row g-3 mb-4">
        {/* Trend Chart */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm h-100 p-3 p-md-4 bg-white" style={{ borderRadius: "18px" }}>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Activity size={18} className="text-primary" />
                Branch Intake Trend
              </h5>
              <div className="btn-group btn-group-sm p-0.5 bg-light rounded">
                {[
                  { key: "ftd", label: "Daily" },
                  { key: "ftw", label: "Weekly" },
                  { key: "ftm", label: "Monthly" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTrendFilter(item.key)}
                    className={`btn btn-sm ${trendFilter === item.key ? "btn-white text-primary shadow-sm" : "text-muted"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#0284c7" fill="#e0f2fe" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Branch Pipeline */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm h-100 p-3 p-md-4 bg-white" style={{ borderRadius: "18px" }}>
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Layers size={16} className="text-primary" />
              Branch Pipeline Stages
            </h6>
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
                  <Link
                    key={st.key}
                    href={stageUrlMap[st.key] || "/all"}
                    className="text-decoration-none d-block text-dark p-2 rounded"
                    style={{ transition: "all 0.2s ease" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1 small">
                      <span className="fw-semibold">{st.label}</span>
                      <strong style={{ color: st.color }}>{st.count} ({st.percentage}%)</strong>
                    </div>
                    <div style={{ height: "8px", backgroundColor: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ width: `${st.percentage}%`, height: "100%", background: st.color }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

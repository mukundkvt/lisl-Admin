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
  Clock,
  UserCheck,
  AlertOctagon,
  Building2,
  RefreshCw,
  ExternalLink,
  Layers,
  Activity,
  UserPlus,
  Award,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#1e293b",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: "4px" }}>{label}</div>
        <div style={{ color: "#38bdf8" }}>
          Count: <strong>{payload[0].value}</strong>
        </div>
      </div>
    );
  }
  return null;
};

export default function RMDashboard({ previewRole = "Relationship Manager" }) {
  const [trendFilter, setTrendFilter] = useState("ftm");
  const [summaryData, setSummaryData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);

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
      console.error("Error fetching RM summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrend = async (filter) => {
    try {
      setTrendLoading(true);
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
      console.error("Error fetching RM trend:", err);
    } finally {
      setTrendLoading(false);
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
  const teamPerformance = summaryData?.teamPerformance || [];
  const recentLeads = summaryData?.recentLeads || [];

  return (
    <div className="p-2 p-md-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="mb-0 fw-bold" style={{ color: "#0f172a", letterSpacing: "-0.5px" }}>
              Relationship Manager (RM) Dashboard
            </h3>
            <span
              className="badge px-2.5 py-1"
              style={{
                backgroundColor: "#e0e7ff",
                color: "#4338ca",
                border: "1px solid #c7d2fe",
                borderRadius: "20px",
                fontSize: "12px",
              }}
            >
              Assigned Pipeline
            </span>
          </div>
          <p className="text-muted small mb-0 mt-1">
            Tracking sales throughput, Authorised Person (AP) performance, and client onboarding pipeline.
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
          <div
            className="card border-0 shadow-sm h-100 p-3"
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)",
              borderLeft: "4px solid #2563eb",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b" }}>
                  RM Onboarding (Month)
                </span>
                <h2 className="mb-0 mt-2 fw-bold" style={{ color: "#1e3a8a" }}>
                  {kpis.onboardingThisMonth}
                </h2>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#dbeafe",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm h-100 p-3"
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)",
              borderLeft: "4px solid #7c3aed",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b" }}>
                  RM Onboarding (Week)
                </span>
                <h2 className="mb-0 mt-2 fw-bold" style={{ color: "#4c1d95" }}>
                  {kpis.onboardingThisWeek}
                </h2>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#ede9fe",
                  color: "#7c3aed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Calendar size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm h-100 p-3"
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)",
              borderLeft: "4px solid #ea580c",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b" }}>
                  RM Onboarding (Today)
                </span>
                <h2 className="mb-0 mt-2 fw-bold" style={{ color: "#7c2d12" }}>
                  {kpis.onboardingToday}
                </h2>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#ffedd5",
                  color: "#ea580c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sun size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm h-100 p-3"
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)",
              borderLeft: "4px solid #059669",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b" }}>
                  Verified Onboarding
                </span>
                <h2 className="mb-0 mt-2 fw-bold" style={{ color: "#064e3b" }}>
                  {kpis.verifiedOnboarding}
                </h2>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "#d1fae5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart + Side Stats */}
      <div className="row g-3 mb-4">
        {/* Trend Chart */}
        <div className="col-12 col-xl-8">
          <div
            className="card border-0 shadow-sm h-100 p-3 p-md-4"
            style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: "#1e293b" }}>
                <Activity size={18} className="text-primary" />
                RM Onboarding Trend
              </h5>

              <div
                className="btn-group btn-group-sm p-0.5"
                style={{ background: "#f1f5f9", borderRadius: "8px" }}
              >
                {[
                  { key: "ftd", label: "Daily" },
                  { key: "ftw", label: "Weekly" },
                  { key: "ftm", label: "Monthly" },
                  { key: "fty", label: "Yearly" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTrendFilter(item.key)}
                    className={`btn btn-sm px-2.5 py-1 fw-semibold ${
                      trendFilter === item.key ? "btn-white shadow-sm text-primary" : "text-muted"
                    }`}
                    style={{
                      borderRadius: "6px",
                      fontSize: "12px",
                      backgroundColor: trendFilter === item.key ? "#fff" : "transparent",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: "280px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fill="url(#rmGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Side Stats */}
        <div className="col-12 col-xl-4">
          <div className="d-flex flex-column gap-3 h-100 justify-content-between">
            <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: "16px" }}>
              <div className="small text-muted">Accounts opened this month</div>
              <div className="h4 fw-bold text-dark mb-0 mt-1">{kpis.accountsOpenThisMonth}</div>
            </div>
            <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: "16px" }}>
              <div className="small text-muted">Accounts opened this week</div>
              <div className="h4 fw-bold text-dark mb-0 mt-1">{kpis.accountsOpenThisWeek}</div>
            </div>
            <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: "16px" }}>
              <div className="small text-muted">Accounts opened today</div>
              <div className="h4 fw-bold text-dark mb-0 mt-1">{kpis.accountsOpenToday}</div>
            </div>
            <Link href="/rejected" className="text-decoration-none">
              <div className="card border-0 shadow-sm p-3 bg-danger-subtle border-danger" style={{ borderRadius: "16px", cursor: "pointer" }}>
                <div className="small text-danger fw-semibold">Overall RM Rejections</div>
                <div className="h4 fw-bold text-danger mb-0 mt-1">{kpis.overallRejections}</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* AP Team Performance & Stages */}
      <div className="row g-3 mb-4">
        {/* AP Performance Table */}
        <div className="col-12 col-xl-7">
          <div
            className="card border-0 shadow-sm h-100 p-3 p-md-4"
            style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Award size={18} className="text-primary" />
                Tagged AP (Sub-Broker) Performance
              </h6>
              <span className="badge bg-light text-muted border">Team Overview</span>
            </div>

            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: "12px" }}>
                <thead className="table-light">
                  <tr>
                    <th>AP Name</th>
                    <th>ID / Code</th>
                    <th className="text-center">Total Leads</th>
                    <th className="text-center">Opened</th>
                    <th className="text-end">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.length > 0 ? (
                    teamPerformance.map((ap, idx) => (
                      <tr key={idx}>
                        <td className="fw-semibold text-dark">{ap.name}</td>
                        <td className="text-muted">{ap.employeeId}</td>
                        <td className="text-center fw-bold">{ap.count}</td>
                        <td className="text-center text-success fw-bold">{ap.completed}</td>
                        <td className="text-end">
                          <span className="badge bg-success-subtle text-success">
                            {ap.conversionRate}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No Authorised Persons tagged under this RM yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RM Stages Overview */}
        <div className="col-12 col-xl-5">
          <div
            className="card border-0 shadow-sm h-100 p-3 p-md-4"
            style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                <Layers size={18} className="text-primary" />
                RM Pipeline Stage Health
              </h6>
              <span className="badge bg-light text-muted border">Active Leads</span>
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
      </div>
    </div>
  );
}

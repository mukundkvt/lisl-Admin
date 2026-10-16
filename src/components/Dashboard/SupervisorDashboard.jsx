"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Radio,
  FileText,
  Activity,
  Briefcase,
  PieChart as PieChartIcon,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Custom Tooltip for Recharts
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

export default function SupervisorDashboard({ previewRole = "Supervisor" }) {
  const [trendFilter, setTrendFilter] = useState("ftm"); // ftd | ftw | ftm | fty
  const [onboardingType, setOnboardingType] = useState("all"); // all | completed
  const [summaryData, setSummaryData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);

  // Fetch Summary Data
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
      console.error("Error fetching supervisor summary:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Trend Graph Data
  const fetchTrend = async (filter, type) => {
    try {
      setTrendLoading(true);
      const token = getToken();
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/onboarding-trend?filter=${filter}&type=${type}&previewRole=${previewRole}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data?.status === "success") {
        setTrendData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching onboarding trend:", err);
    } finally {
      setTrendLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [previewRole]);

  useEffect(() => {
    fetchTrend(trendFilter, onboardingType);
  }, [trendFilter, onboardingType, previewRole]);

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

  const stageUrlMap = {
    pending: "/pending",
    esigned: "/esigned",
    approved: "/approved",
    rejected: "/rejected",
    completed: "/completed",
  };

  const occupationLabels = {
    privatesector: "Private Sector",
    privateSector: "Private Sector",
    "private sector": "Private Sector",
    publicsector: "Public Sector",
    publicSector: "Public Sector",
    "public sector": "Public Sector",
    governmentservice: "Government Service",
    governmentService: "Government Service",
    "government service": "Government Service",
    business: "Business",
    professional: "Professional",
    agriculturist: "Agriculturist",
    retired: "Retired",
    housewife: "House Wife",
    houseWife: "House Wife",
    "house wife": "House Wife",
    student: "Student",
    others: "Others",
    other: "Others",
    service: "Service",
    selfemployed: "Self Employed",
    selfEmployed: "Self Employed",
  };

  const getHumanOccupation = (val) => {
    if (!val || val === "Not Specified" || val === "null" || val === "undefined" || val === "not specified") {
      return "Not Specified";
    }
    const clean = String(val).trim();
    if (occupationLabels[clean]) return occupationLabels[clean];
    if (occupationLabels[clean.toLowerCase()]) return occupationLabels[clean.toLowerCase()];
    return clean
      .replace(/[-_]/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/\s+/g, " ")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const stages = summaryData?.stages || [];
  const gender = summaryData?.gender || [];
  const utmSources = summaryData?.utmSources || [];
  
  const rawOccupations = summaryData?.occupations || [];
  const occGroupMap = new Map();
  rawOccupations.forEach((o) => {
    const rawVal = o.name || o._id || o.label || "Not Specified";
    const humanName = getHumanOccupation(rawVal);
    const countVal = Number(o.value ?? o.count ?? 0);
    occGroupMap.set(humanName, (occGroupMap.get(humanName) || 0) + countVal);
  });
  const defaultColors = ["#1e3a8a", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#f43f5e", "#64748b"];
  const occupations = Array.from(occGroupMap.entries()).map(([name, value], idx) => ({
    name,
    value,
    color: defaultColors[idx % defaultColors.length],
  }));

  const topBranches = summaryData?.topBranches || [];
  const rejectionReasons = summaryData?.rejectionReasons || [];

  return (
    <div className="p-2 p-md-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* ===== COMMAND CENTER HEADER ===== */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="mb-0 fw-bold" style={{ color: "#0f172a", letterSpacing: "-0.5px" }}>
              Supervisor Command Center
            </h3>
            <span
              className="badge d-inline-flex align-items-center gap-1 px-2.5 py-1"
              style={{
                backgroundColor: "#ecfdf5",
                color: "#059669",
                border: "1px solid #a7f3d0",
                fontSize: "12px",
                borderRadius: "20px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                  display: "inline-block",
                }}
              />
              Live Sync
            </span>
          </div>
          <p className="text-muted small mb-0 mt-1">
            Real-time analytics, stage-wise conversion velocity, branch performance & back-office push health.
          </p>
        </div>

        {/* Action Controls */}
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => {
              fetchSummary();
              fetchTrend(trendFilter, onboardingType);
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
      </div>

      {/* ===== HEADER KPI CARDS (4 Main Indicators) ===== */}
      <div className="row g-3 mb-4">
        {/* Card 1: Month */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm h-100 p-3"
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
              borderLeft: "4px solid #0284c7",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b", letterSpacing: "0.5px" }}>
                  Onboarding This Month
                </span>
                <h2 className="mb-0 mt-2 fw-bold" style={{ color: "#0c4a6e" }}>
                  {kpis.onboardingThisMonth.toLocaleString()}
                </h2>
              </div>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#0284c7",
                }}
              >
                <TrendingUp size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Week */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm h-100 p-3"
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)",
              borderLeft: "4px solid #7c3aed",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b", letterSpacing: "0.5px" }}>
                  Onboarding This Week
                </span>
                <h2 className="mb-0 mt-2 fw-bold" style={{ color: "#4c1d95" }}>
                  {kpis.onboardingThisWeek.toLocaleString()}
                </h2>
              </div>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#ede9fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#7c3aed",
                }}
              >
                <Calendar size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Today */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm h-100 p-3"
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)",
              borderLeft: "4px solid #ea580c",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b", letterSpacing: "0.5px" }}>
                  Onboarding Today
                </span>
                <h2 className="mb-0 mt-2 fw-bold" style={{ color: "#7c2d12" }}>
                  {kpis.onboardingToday.toLocaleString()}
                </h2>
              </div>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#ffedd5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ea580c",
                }}
              >
                <Sun size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Verified */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div
            className="card border-0 shadow-sm h-100 p-3"
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)",
              borderLeft: "4px solid #059669",
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-uppercase fw-semibold" style={{ fontSize: "11px", color: "#64748b", letterSpacing: "0.5px" }}>
                  Verified Onboarding
                </span>
                <h2 className="mb-0 mt-2 fw-bold" style={{ color: "#064e3b" }}>
                  {kpis.verifiedOnboarding.toLocaleString()}
                </h2>
              </div>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#d1fae5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#059669",
                }}
              >
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ONBOARDING COMMAND (MAIN) ===== */}
      <div className="row g-3 mb-4">
            {/* Left: Onboarding Trend Chart */}
            <div className="col-12 col-xl-8">
              <div
                className="card border-0 shadow-sm h-100 p-3 p-md-4"
                style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
              >
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                  <div>
                    <h5 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: "#1e293b" }}>
                      <Activity size={18} className="text-primary" />
                      Onboarding Velocity Report
                    </h5>
                    <span className="text-muted small">Daily & historical application intake volume</span>
                  </div>

                  {/* Filters */}
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    {/* Mode selector */}
                    <select
                      value={onboardingType}
                      onChange={(e) => setOnboardingType(e.target.value)}
                      className="form-select form-select-sm"
                      style={{
                        width: "auto",
                        borderRadius: "8px",
                        fontSize: "12px",
                        borderColor: "#cbd5e1",
                      }}
                    >
                      <option value="all">All Intake</option>
                      <option value="completed">Completed Accounts</option>
                    </select>

                    {/* Period Pills */}
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
                </div>

                {/* Graph Container */}
                <div style={{ height: "300px", width: "100%" }}>
                  {trendLoading ? (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                      <div className="spinner-border spinner-border-sm me-2" />
                      Loading report data...
                    </div>
                  ) : trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="onboardingGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          fill="url(#onboardingGradient)"
                          dot={{ r: 3, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
                          activeDot={{ r: 5, fill: "#059669", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                      No onboarding data recorded for this timeframe.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Side Stats (Accounts Opened & Rejections) */}
            <div className="col-12 col-xl-4">
              <div className="d-flex flex-column gap-3 h-100 justify-content-between">
                {/* Side 1: Month Opened */}
                <div
                  className="card border-0 shadow-sm p-3"
                  style={{
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "rgba(37,99,235,0.08)",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Users size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="small fw-semibold text-muted">Accounts opened this month</div>
                      <div className="h4 fw-bold mb-0" style={{ color: "#0f172a" }}>
                        {kpis.accountsOpenThisMonth.toLocaleString()}
                      </div>
                    </div>
                    <span className="badge bg-light text-dark small border">MTD</span>
                  </div>
                </div>

                {/* Side 2: Week Opened */}
                <div
                  className="card border-0 shadow-sm p-3"
                  style={{
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "rgba(16,185,129,0.1)",
                        color: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Clock size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="small fw-semibold text-muted">Accounts opened this week</div>
                      <div className="h4 fw-bold mb-0" style={{ color: "#0f172a" }}>
                        {kpis.accountsOpenThisWeek.toLocaleString()}
                      </div>
                    </div>
                    <span className="badge bg-light text-dark small border">WTD</span>
                  </div>
                </div>

                {/* Side 3: Today Opened */}
                <div
                  className="card border-0 shadow-sm p-3"
                  style={{
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "rgba(14,165,233,0.1)",
                        color: "#0ea5e9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <UserCheck size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="small fw-semibold text-muted">Accounts opened today</div>
                      <div className="h4 fw-bold mb-0" style={{ color: "#0f172a" }}>
                        {kpis.accountsOpenToday.toLocaleString()}
                      </div>
                    </div>
                    <span className="badge bg-light text-dark small border">FTD</span>
                  </div>
                </div>

                {/* Side 4: Overall Rejections */}
                <div
                  className="card border-0 shadow-sm p-3"
                  style={{
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
                    border: "1px solid #fecdd3",
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "#fda4af",
                        color: "#9f1239",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AlertOctagon size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="small fw-semibold text-danger">Overall rejections</div>
                      <div className="h4 fw-bold mb-0 text-danger">
                        {kpis.overallRejections.toLocaleString()}
                      </div>
                    </div>
                    <Link
                      href="/rejected"
                      className="btn btn-sm btn-outline-danger px-2.5 py-1"
                      style={{ borderRadius: "6px", fontSize: "11px" }}
                    >
                      Review
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Demographics Row (Gender, UTMs, Occupations) */}
          <div className="row g-3 mb-4">
            {/* 1. Gender Onboarding */}
            <div className="col-12 col-md-4">
              <div
                className="card border-0 shadow-sm h-100 p-3 p-md-4"
                style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: "#1e293b" }}>
                    <Users size={16} className="text-primary" />
                    Gender Distribution
                  </h6>
                  <span className="badge bg-light text-muted border small">All Time</span>
                </div>

                <div style={{ height: "200px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gender}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {gender.map((entry, idx) => (
                          <Cell key={`gender-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="d-flex justify-content-center gap-3 mt-2 small">
                  {gender.map((g, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-1.5">
                      <span
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          backgroundColor: g.color,
                        }}
                      />
                      <span className="text-muted">{g.name}:</span>
                      <strong className="text-dark">{g.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Performing UTMs */}
            <div className="col-12 col-md-4">
              <div
                className="card border-0 shadow-sm h-100 p-3 p-md-4"
                style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: "#1e293b" }}>
                    <Radio size={16} className="text-primary" />
                    Performing Campaigns / UTMs
                  </h6>
                  <span className="badge bg-light text-muted border small">Top Sources</span>
                </div>

                <div style={{ height: "200px" }}>
                  {utmSources.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={utmSources} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="source" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                      No UTM sources tracked yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Occupations */}
            <div className="col-12 col-md-4">
              <div
                className="card border-0 shadow-sm h-100 p-3 p-md-4"
                style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: "#1e293b" }}>
                    <Briefcase size={16} className="text-primary" />
                    Occupations Breakdown
                  </h6>
                  <span className="badge bg-light text-muted border small">Demographics</span>
                </div>

                <div style={{ height: "200px" }}>
                  {occupations.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={occupations}
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          dataKey="value"
                        >
                          {occupations.map((entry, idx) => (
                            <Cell key={`occ-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val, name) => [val, getHumanOccupation(name)]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                      No occupation details submitted yet.
                    </div>
                  )}
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-2 mt-2 small">
                  {occupations.slice(0, 4).map((o, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-1">
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: o.color,
                        }}
                      />
                      <span className="text-muted small">{o.name}:</span>
                      <strong className="text-dark small">{o.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Operational Insights Row (Stages Overview, Top Branches, Rejection Reasons) */}
          <div className="row g-3 mb-4">
            {/* 1. Application Stages Overview (Interactive Progress Bars) */}
            <div className="col-12 col-xl-4">
              <div
                className="card border-0 shadow-sm h-100 p-3 p-md-4"
                style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: "#1e293b" }}>
                    <Layers size={16} className="text-primary" />
                    Application Stages Overview
                  </h6>
                  <span className="badge bg-light text-muted border small">Pipeline</span>
                </div>

                <div className="d-flex flex-column gap-3 mt-2">
                  {stages.map((st) => (
                    <Link
                      key={st.key}
                      href={stageUrlMap[st.key] || "/all"}
                      className="text-decoration-none"
                    >
                      <div
                        className="p-2 rounded"
                        style={{
                          transition: "all 0.2s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1 small">
                          <span className="fw-semibold" style={{ color: "#334155" }}>
                            {st.label}
                          </span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-light text-dark border small">
                              {st.count} leads
                            </span>
                            <strong style={{ color: st.color, minWidth: "42px", textAlign: "right" }}>
                              {st.percentage}%
                            </strong>
                          </div>
                        </div>
                        <div
                          style={{
                            height: "10px",
                            backgroundColor: "#e2e8f0",
                            borderRadius: "999px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${st.percentage}%`,
                              height: "100%",
                              background: st.gradient || st.color,
                              borderRadius: "999px",
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Top Performing Branches Table */}
            <div className="col-12 col-xl-4">
              <div
                className="card border-0 shadow-sm h-100 p-3 p-md-4"
                style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: "#1e293b" }}>
                    <Building2 size={16} className="text-primary" />
                    Top Performing Branches
                  </h6>
                  <span className="badge bg-light text-muted border small">Rankings</span>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: "12px" }}>
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Branch</th>
                        <th className="text-center">Leads</th>
                        <th className="text-end">Conversion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topBranches.length > 0 ? (
                        topBranches.map((br, idx) => (
                          <tr key={idx}>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor:
                                    idx === 0
                                      ? "#fef3c7"
                                      : idx === 1
                                      ? "#e2e8f0"
                                      : idx === 2
                                      ? "#fed7aa"
                                      : "#f1f5f9",
                                  color:
                                    idx === 0
                                      ? "#92400e"
                                      : idx === 1
                                      ? "#475569"
                                      : idx === 2
                                      ? "#9a3412"
                                      : "#64748b",
                                }}
                              >
                                {idx + 1}
                              </span>
                            </td>
                            <td>
                              <div className="fw-semibold text-dark">{br.name}</div>
                              <div className="text-muted" style={{ fontSize: "10px" }}>
                                {br.code}
                              </div>
                            </td>
                            <td className="text-center fw-bold">{br.count}</td>
                            <td className="text-end">
                              <span className="badge bg-success-subtle text-success border border-success-subtle">
                                {br.conversionRate}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center text-muted py-3">
                            No branch onboarding recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 3. Recent Rejection Reasons */}
            <div className="col-12 col-xl-4">
              <div
                className="card border-0 shadow-sm h-100 p-3 p-md-4"
                style={{ borderRadius: "18px", backgroundColor: "#ffffff" }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="mb-0 fw-bold d-flex align-items-center gap-2" style={{ color: "#1e293b" }}>
                    <AlertTriangle size={16} className="text-danger" />
                    Top Rejection Categories
                  </h6>
                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">
                    Quality Filter
                  </span>
                </div>

                <div style={{ height: "250px" }}>
                  {rejectionReasons.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={rejectionReasons}
                        margin={{ top: 10, right: 10, left: -15, bottom: 65 }}
                      >
                        <XAxis
                          dataKey="reason"
                          interval={0}
                          height={70}
                          tick={({ x, y, payload }) => (
                            <g transform={`translate(${x},${y})`}>
                              <text
                                x={0}
                                y={0}
                                dy={12}
                                textAnchor="end"
                                fill="#475569"
                                fontSize={10}
                                transform="rotate(-45)"
                              >
                                {payload.value}
                              </text>
                            </g>
                          )}
                        />
                        <YAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fontSize: 10, fill: "#64748b" }}
                        />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted small">
                      No rejections recorded.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

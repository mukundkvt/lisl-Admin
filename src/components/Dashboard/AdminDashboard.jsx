"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Mail,
  Smartphone,
  ShieldAlert,
  Users,
  Building,
  Settings,
  FileCheck,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Layers,
  Database,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export default function AdminDashboard({ previewRole = "Admin" }) {
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
      console.error("Error fetching Admin summary:", err);
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

  return (
    <div className="p-2 p-md-4" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h3 className="mb-0 fw-bold" style={{ color: "#0f172a", letterSpacing: "-0.5px" }}>
              Administrator System Console
            </h3>
            <span
              className="badge px-2.5 py-1"
              style={{
                backgroundColor: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a",
                borderRadius: "20px",
                fontSize: "12px",
              }}
            >
              System Superuser
            </span>
          </div>
          <p className="text-muted small mb-0 mt-1">
            Global operational health, communication delivery diagnostics, and system configuration shortcuts.
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

      {/* Legacy Admin Quick Access Cards: SMS Log, Email Log, Mobile OTP, Email OTP */}
      <h6 className="fw-bold text-dark text-uppercase small mb-3" style={{ letterSpacing: "0.5px" }}>
        Communication Logs & OTP Reports
      </h6>
      <div className="row g-3 mb-4">
        {/* SMS Log */}
        <div className="col-12 col-sm-6 col-xl-3">
          <Link href="/reports/sms-logs" className="text-decoration-none">
            <div
              className="card border-0 shadow-sm h-100 p-3"
              style={{
                borderRadius: "16px",
                background: "#ffffff",
                borderTop: "3px solid #3b82f6",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="small fw-semibold text-muted text-uppercase">System Activity</div>
                  <h5 className="fw-bold text-dark mb-0 mt-1">SMS Logs</h5>
                </div>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    color: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MessageSquare size={20} />
                </div>
              </div>
              <div className="mt-2 text-muted small d-flex align-items-center gap-1">
                <span>View dispatched SMS</span>
                <ExternalLink size={12} />
              </div>
            </div>
          </Link>
        </div>

        {/* Email Log */}
        <div className="col-12 col-sm-6 col-xl-3">
          <Link href="/reports/email-logs" className="text-decoration-none">
            <div
              className="card border-0 shadow-sm h-100 p-3"
              style={{
                borderRadius: "16px",
                background: "#ffffff",
                borderTop: "3px solid #10b981",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="small fw-semibold text-muted text-uppercase">System Activity</div>
                  <h5 className="fw-bold text-dark mb-0 mt-1">Email Logs</h5>
                </div>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#ecfdf5",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Mail size={20} />
                </div>
              </div>
              <div className="mt-2 text-muted small d-flex align-items-center gap-1">
                <span>View dispatched emails</span>
                <ExternalLink size={12} />
              </div>
            </div>
          </Link>
        </div>

        {/* Mobile OTP Report */}
        <div className="col-12 col-sm-6 col-xl-3">
          <Link href="/reports/sms-logs" className="text-decoration-none">
            <div
              className="card border-0 shadow-sm h-100 p-3"
              style={{
                borderRadius: "16px",
                background: "#ffffff",
                borderTop: "3px solid #f59e0b",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="small fw-semibold text-muted text-uppercase">Verification</div>
                  <h5 className="fw-bold text-dark mb-0 mt-1">Mobile OTP Report</h5>
                </div>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#fffbeb",
                    color: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Smartphone size={20} />
                </div>
              </div>
              <div className="mt-2 text-muted small d-flex align-items-center gap-1">
                <span>OTP verification health</span>
                <ExternalLink size={12} />
              </div>
            </div>
          </Link>
        </div>

        {/* Email OTP Report */}
        <div className="col-12 col-sm-6 col-xl-3">
          <Link href="/reports/email-logs" className="text-decoration-none">
            <div
              className="card border-0 shadow-sm h-100 p-3"
              style={{
                borderRadius: "16px",
                background: "#ffffff",
                borderTop: "3px solid #8b5cf6",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="small fw-semibold text-muted text-uppercase">Verification</div>
                  <h5 className="fw-bold text-dark mb-0 mt-1">Email OTP Report</h5>
                </div>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#f5f3ff",
                    color: "#8b5cf6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShieldAlert size={20} />
                </div>
              </div>
              <div className="mt-2 text-muted small d-flex align-items-center gap-1">
                <span>Email deliverability</span>
                <ExternalLink size={12} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Global Throughput Overview */}
      <h6 className="fw-bold text-dark text-uppercase small mb-3" style={{ letterSpacing: "0.5px" }}>
        Platform Throughput & Global Stats
      </h6>
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: "16px" }}>
            <span className="small text-muted">Total Onboarded (Month)</span>
            <h3 className="fw-bold text-dark mt-1 mb-0">{kpis.onboardingThisMonth}</h3>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: "16px" }}>
            <span className="small text-muted">Accounts Opened (Month)</span>
            <h3 className="fw-bold text-success mt-1 mb-0">{kpis.accountsOpenThisMonth}</h3>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: "16px" }}>
            <span className="small text-muted">Verified Accounts</span>
            <h3 className="fw-bold text-primary mt-1 mb-0">{kpis.verifiedOnboarding}</h3>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm p-3 bg-white" style={{ borderRadius: "16px" }}>
            <span className="small text-muted">Total Rejections</span>
            <h3 className="fw-bold text-danger mt-1 mb-0">{kpis.overallRejections}</h3>
          </div>
        </div>
      </div>

      {/* Configuration Quick Links */}
      <h6 className="fw-bold text-dark text-uppercase small mb-3" style={{ letterSpacing: "0.5px" }}>
        System Administration & Configurations
      </h6>
      <div className="row g-3">
        {[
          { title: "User Management", desc: "Staff roles, permissions & access control", href: "/user-management", icon: Users, color: "#3b82f6" },
          { title: "eSign Provider Settings", desc: "Manage Digio / eSign gateway credentials", href: "/esign-setting", icon: FileCheck, color: "#10b981" },
          { title: "Brokerage Schemes Admin", desc: "Tariff baskets & scheme assignment", href: "/schemes-admin", icon: Settings, color: "#f59e0b" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="col-12 col-md-4">
              <Link href={item.href} className="text-decoration-none">
                <div
                  className="card border-0 shadow-sm h-100 p-3 bg-white"
                  style={{ borderRadius: "16px", transition: "all 0.2s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f1f5f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                >
                  <div className="d-flex align-items-center gap-2.5 mb-2">
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <h6 className="fw-bold text-dark mb-0">{item.title}</h6>
                  </div>
                  <p className="small text-muted mb-0">{item.desc}</p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

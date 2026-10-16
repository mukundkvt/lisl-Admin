"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/Breadcrumb";

export default function EsignSettingPage() {
  const [annexureJEnabled, setAnnexureJEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserRole(parsed?.role);
      } catch {}
    }
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/setting/annexure-j`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnnexureJEnabled(res.data.annexureJEnabled);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (newValue) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/setting/annexure-j`,
        { enabled: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnnexureJEnabled(newValue);
      toast.success(
        `Annexure J (Part 2) has been ${newValue ? "enabled" : "disabled"}`
      );
    } catch {
      toast.error("Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  if (userRole && userRole !== "Supervisor") {
    return (
      <>
        <Breadcrumb
          title="E-Sign Settings"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "E-Sign Settings" },
          ]}
        />
        <div className="p-4">
          <div className="alert alert-danger" role="alert">
            <strong>Access Denied.</strong> This page is only accessible to Supervisors.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        title="E-Sign Settings"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "E-Sign Settings" },
        ]}
      />

      <div className="p-4">
        <p className="text-muted mb-4" style={{ fontSize: "13px" }}>
          Manage system-wide e-sign flow configuration. Changes take effect immediately for all users.
        </p>

        {loading ? (
          <div className="d-flex align-items-center gap-2 text-muted">
            <div className="spinner-border spinner-border-sm" role="status" />
            <span>Loading settings...</span>
          </div>
        ) : (
          <div className="card border-0 shadow-sm" style={{ maxWidth: "640px" }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-start justify-content-between gap-3">
                <div>
                  <h6 className="fw-semibold mb-1" style={{ fontSize: "15px" }}>
                    Annexure J (Part 2 E-Sign)
                  </h6>
                  <p className="text-muted mb-2" style={{ fontSize: "13px" }}>
                    When <strong>enabled</strong>, users must sign both Part 1 (KYC Document) and Part 2 (Annexure J) to complete the e-sign process.
                    <br />
                    When <strong>disabled</strong>, only Part 1 is required and users complete the process immediately after signing it.
                  </p>
                  <span
                    className={`badge ${annexureJEnabled ? "text-bg-success" : "text-bg-secondary"}`}
                  >
                    {annexureJEnabled ? "ENABLED" : "DISABLED"}
                  </span>
                </div>

                {/* Bootstrap form-switch */}
                <div className="form-check form-switch pt-1" style={{ minWidth: "52px" }}>
                  <input
                    className="form-check-input custom-switch"
                    type="checkbox"
                    role="switch"
                    id="annexureJToggle"
                    checked={annexureJEnabled}
                    disabled={saving}
                    onChange={(e) => handleToggle(e.target.checked)}
                    style={{ width: "2.5em", height: "1.4em", cursor: saving ? "not-allowed" : "pointer" }}
                  />
                </div>
              </div>

              {saving && (
                <div className="mt-3 d-flex align-items-center gap-2 text-muted" style={{ fontSize: "13px" }}>
                  <div className="spinner-border spinner-border-sm" role="status" />
                  <span>Saving...</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 rounded" style={{ background: "#fff8f5", border: "1px solid #ffe0d0", maxWidth: "640px" }}>
          <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>
            <strong style={{ color: "#FF4800" }}>Note:</strong> Disabling Annexure J means users who have completed Part 1 will be
            automatically treated as fully done on the client app. No database records are bulk-updated — the
            change is applied in real-time based on this setting.
          </p>
        </div>
      </div>
    </>
  );
}

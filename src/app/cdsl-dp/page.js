"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShieldCheck, RefreshCw, Key, Globe, Database, Server, Edit3, X, CheckCircle, AlertCircle } from "lucide-react";
import styles from "./cdsl-dp.module.css";
import ClientCardSkeleton from "@/components/ClientSkeletonCard/ClientSkeletonCard";

const CdslDpPage = ({ title = "CDSL DP Configuration" }) => {
  const [token, setToken] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [formData, setFormData] = useState({
    dpId: "",
    userId: "",
    password: "",
    aesKey: "",
    referer: "",
    authUrl: "",
    uploadUrl: "",
    statusUrl: "",
    downloadUrl: "",
    modifyUrl: "",
  });

  /* 🔹 Get auth token from localStorage */
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  /* 🔹 Fetch CDSL DP Config */
  const fetchCDSL = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/cdsl`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const responseData = res.data?.data ? [res.data.data] : [];
      setData(responseData);

      if (responseData[0]) {
        const item = responseData[0];
        setFormData({
          dpId: item.dpId || "",
          userId: item.userId || "",
          password: item.password || "",
          aesKey: item.aesKey || "",
          referer: item.referer || "",
          authUrl: item.authUrl || "",
          uploadUrl: item.uploadUrl || "",
          statusUrl: item.statusUrl || "",
          downloadUrl: item.downloadUrl || "",
          modifyUrl: item.modifyUrl || "",
        });
      }
    } catch (err) {
      console.error("CDSL Config API error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCDSL();
    }
  }, [token]);

  /* 🔹 Save or Update CDSL Configuration */
  const handleUpdateCDSL = async () => {
    if (
      !formData.dpId.trim() ||
      !formData.userId.trim() ||
      !formData.password.trim() ||
      !formData.aesKey.trim() ||
      !formData.referer.trim() ||
      !formData.authUrl.trim() ||
      !formData.uploadUrl.trim() ||
      !formData.statusUrl.trim() ||
      !formData.downloadUrl.trim() ||
      !formData.modifyUrl.trim()
    ) {
      setError("All fields are required!");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/cdsl`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchCDSL();
      setShowForm(false);
      toast.success("CDSL DP configuration updated successfully in database");
      setError("");
    } catch (err) {
      console.error("Update CDSL error:", err);
      setError(err.response?.data?.message || "Failed to update CDSL DP credentials");
    } finally {
      setSaving(false);
    }
  };

  /* 🔹 Test Authentication directly */
  const handleTestAuth = async () => {
    try {
      setTesting(true);
      setTestResult(null);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/push_to_cdsl/test_auth`,
        {
          dpId: formData.dpId,
          userId: formData.userId,
          password: formData.password,
          aesKey: formData.aesKey,
          referer: formData.referer,
          authUrl: formData.authUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTestResult({
        success: res.data?.success || false,
        message: res.data?.message || "Authentication tested",
        authToken: res.data?.authToken || null,
        durationMs: res.data?.durationMs || null,
      });

      if (res.data?.success) {
        toast.success("CDSL Authentication Successful! Active Token Generated.");
      } else {
        toast.error("CDSL Authentication failed. Please verify credentials.");
      }
    } catch (err) {
      console.error("Test Auth error:", err);
      setTestResult({
        success: false,
        message: err.response?.data?.message || err.message,
        details: err.response?.data || null,
      });
      toast.error("Authentication test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white mx-3 p-0 mt-2 rounded-3 shadow-sm border">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row px-3 mt-3 justify-content-between align-items-center mb-3 gap-2">
        <div className="d-flex align-items-center gap-2">
          <ShieldCheck size={22} className="text-danger" />
          <h5 className="mb-0 fw-semibold">{title}</h5>
        </div>

        {/* Action Buttons */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-1"
            onClick={fetchCDSL}
            disabled={loading}
            style={{ height: "38px", padding: "0 12px", fontSize: "0.88rem" }}
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            Refresh
          </button>

          <button
            className="btn btn-danger add-button d-flex align-items-center gap-1"
            onClick={() => {
              const existing = data?.[0];
              if (existing) {
                setFormData({
                  dpId: existing.dpId || "",
                  userId: existing.userId || "",
                  password: existing.password || "",
                  aesKey: existing.aesKey || "",
                  referer: existing.referer || "",
                  authUrl: existing.authUrl || "",
                  uploadUrl: existing.uploadUrl || "",
                  statusUrl: existing.statusUrl || "",
                  downloadUrl: existing.downloadUrl || "",
                  modifyUrl: existing.modifyUrl || "",
                });
              } else {
                setFormData({
                  dpId: "",
                  userId: "",
                  password: "",
                  aesKey: "",
                  referer: "",
                  authUrl: "",
                  uploadUrl: "",
                  statusUrl: "",
                  downloadUrl: "",
                  modifyUrl: "",
                });
              }
              setError("");
              setTestResult(null);
              setShowForm(true);
            }}
            style={{ height: "38px", padding: "0 14px", fontSize: "0.88rem" }}
          >
            <Edit3 size={15} />
            Update CDSL DP
          </button>
        </div>
      </div>

      {/* Main Content View */}
      <div className={styles.clientWrapper}>
        <div
          className={styles.headerRow}
          style={{ gridTemplateColumns: "1fr 1.2fr 1.5fr 1.5fr 1.2fr" }}
        >
          <div>DP ID</div>
          <div>User ID</div>
          <div>AES Key & Referer</div>
          <div>Last Updated By</div>
          <div>Updated At</div>
        </div>

        {/* Body */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <ClientCardSkeleton key={i} />
          ))
        ) : data.length === 0 ? (
          <div className="text-center py-4 text-muted" style={{ background: "#F8F9FB" }}>
            No CDSL DP configuration records found in database
          </div>
        ) : (
          data.map((item) => (
            <div
              className={styles.clientBlock}
              key={item._id}
              style={{ gridTemplateColumns: "1fr 1.2fr 1.5fr 1.5fr 1.2fr" }}
            >
              {/* DP ID */}
              <div className={styles.clientName}>
                <div className={styles.clientInfo}>
                  <strong style={{ color: "#F25C05", fontSize: "1.05rem" }}>
                    {item.dpId || "-"}
                  </strong>
                </div>
              </div>

              {/* User ID */}
              <div>
                <strong style={{ color: "#1E2129" }}>{item.userId || "-"}</strong>
                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                  Password: {item.password ? "••••••••" : "-"}
                </div>
              </div>

              {/* AES Key & Referer */}
              <div>
                <div style={{ fontSize: "0.85rem", color: "#1E2129", wordBreak: "break-all" }}>
                  <Key size={13} className="me-1 text-muted" />
                  <code>{item.aesKey ? `${item.aesKey.substring(0, 10)}...${item.aesKey.slice(-6)}` : "-"}</code>
                </div>
                <div className="text-muted mt-1" style={{ fontSize: "0.8rem" }}>
                  <Globe size={13} className="me-1 text-muted" />
                  {item.referer || "-"}
                </div>
              </div>

              {/* Updated By */}
              <div style={{ color: "#1E2129", fontSize: "0.85rem" }}>
                <div><strong>{item.updatedBy?.name || "System Admin"}</strong></div>
                <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                  {item.updatedBy?.role || "Admin"} {item.updatedBy?.email ? `(${item.updatedBy.email})` : ""}
                </div>
              </div>

              {/* Dates */}
              <div style={{ color: "#1E2129", fontSize: "0.85rem" }}>
                <div>
                  {item.updatedAt
                    ? new Date(item.updatedAt).toLocaleString()
                    : item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "-"}
                </div>
                <span className={styles.badgeSuccess + " mt-1 d-inline-block"}>
                  Active Configuration
                </span>
              </div>

              {/* Endpoints Detailed Block */}
              <div className={styles.infoBlock}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong className="text-dark d-flex align-items-center gap-1">
                    <Server size={15} className="text-primary" />
                    CDSL Active API Endpoints
                  </strong>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleTestAuth}
                    disabled={testing}
                    style={{ fontSize: "0.78rem", padding: "2px 8px" }}
                  >
                    {testing ? "Testing Auth..." : "Test Authentication"}
                  </button>
                </div>

                <div className={styles.endpointGrid}>
                  <div className={styles.endpointItem}>
                    <span className={styles.endpointLabel}>Auth API URL:</span>
                    <span className={styles.endpointValue}>{item.authUrl || "-"}</span>
                  </div>
                  <div className={styles.endpointItem}>
                    <span className={styles.endpointLabel}>BO Setup Upload (HrmSetUpload):</span>
                    <span className={styles.endpointValue}>{item.uploadUrl || "-"}</span>
                  </div>
                  <div className={styles.endpointItem}>
                    <span className={styles.endpointLabel}>Status Inquiry API:</span>
                    <span className={styles.endpointValue}>{item.statusUrl || "-"}</span>
                  </div>
                  <div className={styles.endpointItem}>
                    <span className={styles.endpointLabel}>Download Response API:</span>
                    <span className={styles.endpointValue}>{item.downloadUrl || "-"}</span>
                  </div>
                  <div className={styles.endpointItem}>
                    <span className={styles.endpointLabel}>BO Modify Upload (HrmModUpload):</span>
                    <span className={styles.endpointValue}>{item.modifyUrl || "-"}</span>
                  </div>
                </div>

                {/* Test Result Live Banner */}
                {testResult && (
                  <div className={`mt-2 p-2 rounded ${testResult.success ? "bg-success-subtle text-success border border-success" : "bg-danger-subtle text-danger border border-danger"}`} style={{ fontSize: "0.82rem" }}>
                    <div className="d-flex align-items-center gap-1">
                      {testResult.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                      <strong>{testResult.message}</strong>
                    </div>
                    {testResult.authToken && (
                      <div className="mt-1 font-monospace" style={{ wordBreak: "break-all" }}>
                        Token: {testResult.authToken} {testResult.durationMs ? `(${testResult.durationMs}ms)` : ""}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal / Dialog for Updating CDSL DP Credentials */}
      {showForm && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-light border-bottom px-4 py-3">
                <div className="d-flex align-items-center gap-2">
                  <ShieldCheck size={20} className="text-danger" />
                  <h6 className="modal-title fw-bold mb-0">Update CDSL DP Configuration</h6>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>

              <div className="modal-body px-4 py-3" style={{ maxHeight: "75vh", overflowY: "auto" }}>
                {error && (
                  <div className="alert alert-danger py-2 mb-3" style={{ fontSize: "0.88rem" }}>
                    {error}
                  </div>
                )}

                <div className="row g-3">
                  {/* DP ID */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                      DP ID <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.dpId}
                      onChange={(e) => setFormData({ ...formData, dpId: e.target.value })}
                      placeholder="Enter DP ID"
                    />
                  </div>

                  {/* User ID */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                      User ID <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      placeholder="Enter CDSL User ID"
                    />
                  </div>

                  {/* Password */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                      Password <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter CDSL Password"
                    />
                  </div>

                  {/* AES Key */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                      AES Secret Key (32 chars) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.aesKey}
                      onChange={(e) => setFormData({ ...formData, aesKey: e.target.value })}
                      placeholder="Enter 32-character AES Secret Key"
                    />
                  </div>

                  {/* Referer Header */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                      Referer Header <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.referer}
                      onChange={(e) => setFormData({ ...formData, referer: e.target.value })}
                      placeholder="Enter Referer domain (e.g. your-ekyc-domain.com)"
                    />
                  </div>

                  {/* Divider */}
                  <div className="col-12"><hr className="my-1 text-muted" /></div>

                  {/* Auth API URL */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                      Auth API URL <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      style={{ fontSize: "0.85rem" }}
                      value={formData.authUrl}
                      onChange={(e) => setFormData({ ...formData, authUrl: e.target.value })}
                      placeholder="https://<cdsl-host>/AuthWeb/api/CDASAuthorization/APIAuth"
                    />
                  </div>

                  {/* BO Setup Upload API URL */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                      BO Setup Upload API URL (HrmSetUpload) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      style={{ fontSize: "0.85rem" }}
                      value={formData.uploadUrl}
                      onChange={(e) => setFormData({ ...formData, uploadUrl: e.target.value })}
                      placeholder="https://<cdsl-host>/Commonweb/api/BOAPI/HrmSetUpload"
                    />
                  </div>

                  {/* Status Inquiry API URL */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                      Status Inquiry API URL <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      style={{ fontSize: "0.85rem" }}
                      value={formData.statusUrl}
                      onChange={(e) => setFormData({ ...formData, statusUrl: e.target.value })}
                      placeholder="https://<cdsl-host>/Commonweb/api/CDASAPI/Status"
                    />
                  </div>

                  {/* Download Response API URL */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                      Download Response API URL <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      style={{ fontSize: "0.85rem" }}
                      value={formData.downloadUrl}
                      onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                      placeholder="https://<cdsl-host>/Commonweb/api/CDASAPI/Download"
                    />
                  </div>

                  {/* Modify API URL */}
                  <div className="col-md-12">
                    <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>
                      BO Modify API URL (HrmModUpload) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      style={{ fontSize: "0.85rem" }}
                      value={formData.modifyUrl}
                      onChange={(e) => setFormData({ ...formData, modifyUrl: e.target.value })}
                      placeholder="https://<cdsl-host>/Commonweb/api/BOAPI/HrmModUpload"
                    />
                  </div>
                </div>

                {/* Live Test Feedback inside modal */}
                {testResult && (
                  <div className={`mt-3 p-2 rounded ${testResult.success ? "bg-success-subtle text-success border border-success" : "bg-danger-subtle text-danger border border-danger"}`} style={{ fontSize: "0.82rem" }}>
                    <div className="d-flex align-items-center gap-1">
                      {testResult.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                      <strong>{testResult.message}</strong>
                    </div>
                    {testResult.authToken && (
                      <div className="mt-1 font-monospace" style={{ wordBreak: "break-all" }}>
                        Token: {testResult.authToken}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light border-top px-4 py-2 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center gap-1"
                  onClick={handleTestAuth}
                  disabled={testing || saving}
                  style={{ fontSize: "0.88rem" }}
                >
                  <ShieldCheck size={15} />
                  {testing ? "Testing..." : "Test Credentials"}
                </button>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                    disabled={saving}
                    style={{ fontSize: "0.88rem" }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleUpdateCDSL}
                    disabled={saving}
                    style={{ fontSize: "0.88rem" }}
                  >
                    {saving ? "Saving..." : "Save CDSL Config"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CdslDpPage;

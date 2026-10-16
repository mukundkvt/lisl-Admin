"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./bse-exchange.module.css";
import ClientCardSkeleton from "@/components/ClientSkeletonCard/ClientSkeletonCard";
import { toast } from "react-toastify";

const BseExchange = ({ title = "BSE Exchange Configuration" }) => {
  const [token, setToken] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    memberId: "",
    userId: "",
    password: "",
    uccVersion: "CLIENTDETAILS_V5",
    uploadApiUrl: "",
    resetPasswordUrl: "",
    resetPanStatusUrl: "",
  });

  const handleUpdateBSE = async () => {
    if (
      !formData.memberId.trim() ||
      !formData.userId.trim() ||
      !formData.password.trim() ||
      !formData.uploadApiUrl.trim()
    ) {
      setError("Member ID, User ID, Password, and Upload API URL are required!");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bse-exchange-config`,
        {
          memberId: formData.memberId,
          userId: formData.userId,
          password: formData.password,
          uccVersion: formData.uccVersion || "CLIENTDETAILS_V5",
          uploadApiUrl: formData.uploadApiUrl,
          resetPasswordUrl: formData.resetPasswordUrl,
          resetPanStatusUrl: formData.resetPanStatusUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchBSEExchange();
      setShowForm(false);
      toast.success("BSE Exchange configuration updated successfully");
    } catch (err) {
      console.error("Update BSE Exchange error:", err);
      setError(err.response?.data?.message || "Failed to save BSE Exchange configuration");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  const fetchBSEExchange = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bse-exchange-config`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const responseData = res.data?.data ? [res.data.data] : [];
      setData(responseData);
    } catch (err) {
      console.error("BSE Exchange API error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBSEExchange();
    }
  }, [token]);

  return (
    <div className="bg-white mx-3 p-0 mt-2 rounded-3 shadow-sm border">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row px-3 mt-3 justify-content-between align-items-center mb-3 gap-2">
        <h5 className="mb-0 fw-semibold">{title}</h5>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-danger add-button d-flex align-items-center"
            onClick={() => {
              const existing = data?.[0];
              if (existing) {
                setFormData({
                  memberId: existing.memberId || "",
                  userId: existing.userId || "",
                  password: existing.password || "",
                  uccVersion: existing.uccVersion || "CLIENTDETAILS_V5",
                  uploadApiUrl: existing.uploadApiUrl || "",
                  resetPasswordUrl: existing.resetPasswordUrl || "",
                  resetPanStatusUrl: existing.resetPanStatusUrl || "",
                });
              } else {
                setFormData({
                  memberId: "3281",
                  userId: "3281",
                  password: "Test@456",
                  uccVersion: "CLIENTDETAILS_V5",
                  uploadApiUrl: "https://ucc.bseindia.com/UCC_REST_API_SERVICE/UCCService.svc/AddUCCData_V5",
                  resetPasswordUrl: "https://ucc.bseindia.com/UCC_REST_API_SERVICE/UCCService.svc/ResetPassword",
                  resetPanStatusUrl: "https://ucc.bseindia.com/UCC_REST_API_SERVICE/UCCService.svc/PANStatus",
                });
              }
              setError("");
              setShowForm(true);
            }}
            style={{ height: "38px", padding: "0 12px" }}
          >
            + Update BSE Exchange
          </button>
        </div>
      </div>

      <div className={styles.clientWrapper}>
        <div className={styles.headerRow}>
          <div>Member ID / User ID</div>
          <div>UCC Version</div>
          <div>Password</div>
          <div>API URLs</div>
          <div>Created / Updated</div>
        </div>

        {/* Body */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <ClientCardSkeleton key={i} />
          ))
        ) : data.length === 0 ? (
          <div
            className="text-center py-4 text-muted"
            style={{ background: "#F8F9FB" }}
          >
            No records found
          </div>
        ) : (
          data.map((item) => (
            <div className={styles.clientBlock} key={item._id}>
              {/* Member ID & User ID */}
              <div className={styles.clientName}>
                <div className={styles.clientInfo}>
                  <strong style={{ color: "#F25C05" }}>
                    Member: {item.memberId || "-"}
                  </strong>
                  <br />
                  <span className="text-muted" style={{ fontSize: "12px" }}>
                    User: {item.userId || "-"}
                  </span>
                </div>
              </div>

              {/* UCC Version */}
              <div style={{ color: "#1E2129", fontWeight: 500 }}>
                {item.uccVersion || "CLIENTDETAILS_V5"}
              </div>

              {/* Password */}
              <div style={{ color: "#1E2129" }}>
                {item.password ? "••••••••" : "-"}
              </div>

              {/* API URLs */}
              <div style={{ color: "#1E2129", fontSize: "11px", wordBreak: "break-all" }}>
                <div>
                  <strong>Upload:</strong> {item.uploadApiUrl || "-"}
                </div>
                {item.resetPasswordUrl && (
                  <div>
                    <strong>Reset Pwd:</strong> {item.resetPasswordUrl}
                  </div>
                )}
                {item.resetPanStatusUrl && (
                  <div>
                    <strong>PAN Status:</strong> {item.resetPanStatusUrl}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div style={{ color: "#1E2129", fontSize: "12px" }}>
                <div>
                  Created:{" "}
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "-"}
                </div>
                <div>
                  Updated:{" "}
                  {item.updatedAt
                    ? new Date(item.updatedAt).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>
          ))
        )}

        {showForm && (
          <div
            className="modal d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)", zIndex: 10050 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content" style={{ background: "#F8F9FB" }}>
                {/* Header */}
                <div
                  className="modal-header"
                  style={{
                    background: "linear-gradient(180deg, #FF2200, #FF7700)",
                    color: "#fff",
                    padding: "10px",
                  }}
                >
                  <h5 className="modal-title" style={{ fontSize: "15px" }}>
                    Update BSE Exchange Configuration
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    style={{ filter: "invert(1)" }}
                    onClick={() => setShowForm(false)}
                  ></button>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Member ID <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.memberId}
                        onChange={(e) =>
                          setFormData({ ...formData, memberId: e.target.value })
                        }
                        placeholder="e.g. 3281"
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        User ID <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.userId}
                        onChange={(e) =>
                          setFormData({ ...formData, userId: e.target.value })
                        }
                        placeholder="e.g. 3281"
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="e.g. Test@456"
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        UCC Version <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.uccVersion}
                        onChange={(e) =>
                          setFormData({ ...formData, uccVersion: e.target.value })
                        }
                        placeholder="CLIENTDETAILS_V5"
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Upload API URL <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.uploadApiUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, uploadApiUrl: e.target.value })
                        }
                        placeholder="https://ucc.bseindia.com/UCC_REST_API_SERVICE/UCCService.svc/AddUCCData_V5"
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Reset Password URL</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.resetPasswordUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, resetPasswordUrl: e.target.value })
                        }
                        placeholder="https://ucc.bseindia.com/UCC_REST_API_SERVICE/UCCService.svc/ResetPassword"
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Reset Pan Status URL</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.resetPanStatusUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, resetPanStatusUrl: e.target.value })
                        }
                        placeholder="https://ucc.bseindia.com/UCC_REST_API_SERVICE/UCCService.svc/PANStatus"
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div
                    className="mx-3 mb-2 text-danger"
                    style={{ fontSize: "13px" }}
                  >
                    {error}
                  </div>
                )}

                {/* Footer */}
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{
                      background: "linear-gradient(180deg, #FF2200, #FF7700)",
                    }}
                    disabled={saving}
                    onClick={handleUpdateBSE}
                  >
                    {saving ? "Saving..." : "Save BSE Exchange"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BseExchange;

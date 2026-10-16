"use client";

import { Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./nse-exchange.module.css";
import ClientCardSkeleton from "@/components/ClientSkeletonCard/ClientSkeletonCard";
import CustomPagination from "@/components/CustomPagination/CustomPagination";
import { toast } from "react-toastify";

const NseExchange = ({ title = "NSE Exchange" }) => {
  const [token, setToken] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    authUrl: "",
    clientUploadUrl: "",
    username: "",
    password: "",
  });

  const handleUpdateNSE = async () => {
    if (!formData.authUrl.trim() || !formData.clientUploadUrl.trim() || !formData.username.trim() || !formData.password.trim()) {
      setError("Auth URL, Client Upload URL, Username and Password are required!");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/nse`,
        {
          authUrl: formData.authUrl,
          clientUploadUrl: formData.clientUploadUrl,
          username: formData.username,
          password: formData.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      await fetchNSE();

      // success
      setShowForm(false);
      setFormData({ authUrl: "", clientUploadUrl: "", username: "", password: "" });
      toast.success("NSE credentials updated successfully");
      setError("");

      // refresh list
      setPage(1);
    } catch (err) {
      console.error("Update NSE error:", err);
      setError("Failed to update NSE credentials");
    } finally {
      setSaving(false);
    }
  };

  /* 🔹 Get token */
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  /* 🔹 Debounce search */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchNSE = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/nse`,
        {
          params: {
            search: debouncedSearch,
            page,
            limit,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const responseData = Array.isArray(res.data.data)
        ? res.data.data
        : res.data.data
          ? [res.data.data]
          : [];

      setData(responseData);
      setTotalPages(res.data.totalPages || 1);
      setTotalUsers(res.data.totalUsers || responseData.length);
    } catch (error) {
      console.error("NSE API error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNSE();
    }
  }, [token, page, limit, debouncedSearch]);

  return (
    <div className="bg-white mx-3 p-0 mt-2 rounded-3 shadow-sm border">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row px-3 mt-3 justify-content-between align-items-center mb-3 gap-2">
        <h5 className="mb-0 fw-semibold">{title}</h5>

        {/* RIGHT SIDE */}
        <div className="d-flex flex-column flex-md-row align-items-center gap-2">
          {/* Search */}
          {/* <div className="position-relative">
            <Search
              size={16}
              className="text-muted position-absolute"
              style={{ left: 12, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by API Name / Username"
              className="form-control ps-5"
              style={{ minWidth: 260, background: "#f8f9fa", height: "38px" }}
            />
            {search && (
              <X
                size={16}
                className="position-absolute text-muted"
                style={{
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
                onClick={() => setSearch("")}
              />
            )}
          </div> */}

          {/* Button */}
          <button
            className="btn btn-danger add-button d-flex align-items-center"
            // onClick={() => setShowForm(true)}
            onClick={() => {
              const existing = data?.[0]; // NSE usually single record
              if (existing) {
                setFormData({
                  authUrl: existing.authUrl || "",
                  clientUploadUrl: existing.clientUploadUrl || "",
                  username: existing.username || "",
                  password: existing.password || "", // security reason se password blank hi rakho
                });
              }
              setShowForm(true);
            }}
            style={{
              height: "38px",
              padding: "0 12px",
              whiteSpace: "nowrap",
            }}
          >
            + Update NSE
          </button>
        </div>
      </div>

      <div className={styles.clientWrapper}>
        {/* Header Row */}
        <div className={styles.headerRow}>
          <div>API Name / URLs</div>
          <div>Username</div>
          <div>Created / Updated</div>
          <div>Updated By</div>
        </div>

        {/* Body */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
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
              {/* API Name */}
              <div className={styles.clientName}>
                <div className={styles.clientInfo}>
                  <strong style={{ color: "#F25C05" }}>
                    {item.apiName || "N/A"}
                  </strong>
                  <br />
                  <span className="text-muted" style={{ fontSize: "11px" }}>
                    <strong>Auth:</strong> {item.authUrl || "N/A"}
                  </span>
                  <br />
                  <span className="text-muted" style={{ fontSize: "11px" }}>
                    <strong>Upload:</strong> {item.clientUploadUrl || "N/A"}
                  </span>
                </div>
              </div>

              {/* Username */}
              <div style={{ color: "#1E2129" }}>{item.username || "-"}</div>

              {/* Dates */}
              <div style={{ color: "#1E2129" }}>
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

              {/* Updated By */}
              <div style={{ color: "#1E2129" }}>
                <strong>{item.updatedBy?.name || "-"}</strong>
                <br />
                <span className="text-muted">{item.updatedBy?.role || ""}</span>
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
            <div className="modal-dialog modal-dialog-centered">
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
                    Update NSE Credentials
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
                    <div className="col-12">
                      <label className="form-label">
                        Auth URL <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.authUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, authUrl: e.target.value })
                        }
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">
                        Client Upload URL <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.clientUploadUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, clientUploadUrl: e.target.value })
                        }
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Username <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>

                    <div className="col-12">
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
                    onClick={handleUpdateNSE}
                  >
                    {saving ? "Updating..." : "Update NSE"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {/* <CustomPagination
          page={page}
          pages={totalPages}
          limit={limit}
          total={totalUsers}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        /> */}
      </div>
    </div>
  );
};

export default NseExchange;

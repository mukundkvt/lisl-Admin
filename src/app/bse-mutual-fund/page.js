"use client";

import { Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./bse-mutual-fund.module.css";
import CustomPagination from "@/components/CustomPagination/CustomPagination";
import ClientCardSkeleton from "@/components/ClientSkeletonCard/ClientSkeletonCard";
import { toast } from "react-toastify";

const BseExchange = ({ title = "BSE Configuration" }) => {
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
    userId: "",
    memberCode: "",
    password: "",
    apiUrl: "",
  });

  const handleAddBSE = async () => {
    if (
      !formData.userId.trim() ||
      !formData.memberCode.trim() ||
      !formData.password.trim() ||
      !formData.apiUrl.trim()
    ) {
      setError("All fields are required!");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bse-config`,
        {
          userId: formData.userId,
          memberCode: formData.memberCode,
          password: formData.password,
          apiUrl: formData.apiUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchBSE();
      // close modal & reset
      setShowForm(false);
      setFormData({ userId: "", memberCode: "", password: "", apiUrl: "" });
      toast.success("BSE configuration update successfully");

      // refresh list
      setPage(1);
    } catch (err) {
      console.error("Add BSE error:", err);
      setError("Failed to save BSE configuration");
    } finally {
      setSaving(false);
    }
  };

  /* 🔹 token */
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  /* 🔹 debounce search */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchBSE = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/bse-config`,
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

      const responseData = res.data?.data ? [res.data.data] : [];

      setData(responseData);
      setTotalPages(res.data.totalPages || 1);
      setTotalUsers(res.data.totalUsers || responseData.length);
    } catch (err) {
      console.error("BSE API error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBSE();
    }
  }, [token, page, limit, debouncedSearch]);

  return (
    <div className="bg-white mx-3 p-0 mt-2 rounded-3 shadow-sm border">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row px-3 mt-3 justify-content-between align-items-center mb-3 gap-2">
        <h5 className="mb-0 fw-semibold">{title}</h5>

        <div className="d-flex align-items-center gap-2">
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
              placeholder="Search by User ID / Member Code"
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
            onClick={() => {
              const existing = data?.[0];

              if (existing) {
                setFormData({
                  userId: existing.userId || "",
                  memberCode: existing.memberCode || "",
                  password: existing.password || "",
                  apiUrl: existing.apiUrl || "",
                });
              } else {
                // rare case: first time setup
                setFormData({ userId: "", memberCode: "", password: "", apiUrl: "" });
              }

              setError("");
              setShowForm(true);
            }}
            style={{ height: "38px", padding: "0 12px" }}
          >
            Update BSE
          </button>
        </div>
      </div>

      <div className={styles.clientWrapper}>
        <div className={styles.headerRow} style={{ gridTemplateColumns: "1fr 1fr 1fr 1.5fr 1.5fr" }}>
          <div>User ID</div>
          <div>Member Code</div>
          <div>Password</div>
          <div>API URL</div>
          <div>Created / Updated</div>
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
            <div className={styles.clientBlock} key={item._id} style={{ gridTemplateColumns: "1fr 1fr 1fr 1.5fr 1.5fr" }}>
              {/* User ID */}
              <div className={styles.clientName}>
                <div className={styles.clientInfo}>
                  <strong style={{ color: "#F25C05" }}>
                    {item.userId || "-"}
                  </strong>
                </div>
              </div>

              {/* Member Code */}
              <div style={{ color: "#1E2129" }}>{item.memberCode || "-"}</div>

              {/* Password */}
              <div style={{ color: "#1E2129" }}>{item.password || "-"}</div>

              {/* API URL */}
              <div style={{ color: "#1E2129", wordBreak: "break-all" }}>{item.apiUrl || "-"}</div>

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
                    Add BSE Configuration
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
                        User ID <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.userId}
                        onChange={(e) =>
                          setFormData({ ...formData, userId: e.target.value })
                        }
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Member Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.memberCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            memberCode: e.target.value,
                          })
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

                    <div className="col-12">
                      <label className="form-label">
                        API URL <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.apiUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, apiUrl: e.target.value })
                        }
                        placeholder="e.g. https://bsestarmfdemo.bseindia.com"
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
                    onClick={handleAddBSE}
                  >
                    {saving ? "Saving..." : "Save BSE"}
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

export default BseExchange;

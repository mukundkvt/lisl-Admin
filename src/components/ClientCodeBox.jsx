"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ALLOWED_ROLES = [
  "Relationship Manager",
  "Authorised Person",
  "Supervisor",
  "Admin",
];

export default function ClientCodeBox({
  clientCode,
  userId,
  loading = false,
  onAssigned,
}) {
  const [userRole, setUserRole] = useState(null);
  const [inputCode, setInputCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUserRole(parsed?.role || null);
        }
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
      }
    }
  }, []);

  const hasCode = Boolean(clientCode && String(clientCode).trim() !== "");
  const canAssign = Boolean(userRole && ALLOWED_ROLES.includes(userRole));

  const handleAssign = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = inputCode.trim().toUpperCase();

    if (!cleanCode) {
      setInlineError("Please enter client code");
      toast.error("Please enter a client code");
      return;
    }

    if (!/^[A-Z0-9]+$/.test(cleanCode)) {
      setInlineError("Must contain only letters & numbers");
      toast.error("Client code must contain only letters and numbers");
      return;
    }

    setSubmitting(true);
    setInlineError("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/manageuser/${userId}/assign-client-code`,
        { clientCode: cleanCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        toast.success(res.data.message || "Client code assigned successfully");
        if (onAssigned) {
          onAssigned(res.data.clientCode || cleanCode);
        }
      } else {
        const msg = res.data?.message || "Failed to assign client code";
        setInlineError(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("Assign client code error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to assign client code";
      setInlineError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Shimmer loading state
  if (loading) {
    return (
      <div className="col-12 col-md d-flex flex-column">
        <div className="border p-3 rounded d-md-none mb-2">
          Application Number:{" "}
          <strong>
            <span
              className="shimmer rounded d-inline-block"
              style={{ height: 16, width: 120 }}
            />
          </strong>
        </div>
        <div className="border border-start-0 border-end-0 p-3 mb-2 mb-md-0 d-none d-md-flex align-items-center h-100 bg-white">
          Application Number:{" "}
          <strong className="ms-1">
            <span
              className="shimmer rounded d-inline-block"
              style={{ height: 16, width: 120 }}
            />
          </strong>
        </div>
      </div>
    );
  }

  // 2. Already assigned state -> static read-only text, NO input box, permanent
  if (hasCode) {
    return (
      <div className="col-12 col-md d-flex flex-column">
        <div className="border p-3 rounded d-md-none mb-2">
          Application Number: <strong>{clientCode}</strong>
        </div>
        <div className="border border-start-0 border-end-0 p-3 mb-2 mb-md-0 d-none d-md-flex align-items-center h-100 bg-white">
          Application Number: <strong className="ms-1">{clientCode}</strong>
        </div>
      </div>
    );
  }

  // 3. Not assigned & current user role is NOT permitted -> read-only dash
  if (!canAssign) {
    return (
      <div className="col-12 col-md d-flex flex-column">
        <div className="border p-3 rounded d-md-none mb-2">
          Application Number: <strong>-</strong>
        </div>
        <div className="border border-start-0 border-end-0 p-3 mb-2 mb-md-0 d-none d-md-flex align-items-center h-100 bg-white">
          Application Number: <strong className="ms-1">-</strong>
        </div>
      </div>
    );
  }

  // 4. Not assigned & permitted user (RM, AP, Supervisor, Admin) -> clean single-line inline form
  return (
    <div className="col-12 col-md d-flex flex-column">
      {/* Mobile view */}
      <div className="border p-3 rounded d-md-none mb-2 bg-white">
        <div className="d-flex align-items-center gap-2">
          <span className="small text-nowrap fw-semibold text-secondary">
            Application Number:
          </span>
          <form
            onSubmit={handleAssign}
            className="d-flex align-items-center gap-2 flex-grow-1 mb-0"
          >
            <input
              type="text"
              className={`form-control form-control-sm text-uppercase ${
                inlineError ? "is-invalid" : ""
              }`}
              placeholder="Enter Client Code"
              value={inputCode}
              onChange={(e) => {
                setInlineError("");
                setInputCode(
                  e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                );
              }}
              disabled={submitting}
              maxLength={15}
              style={{ fontWeight: 600, letterSpacing: "0.5px" }}
            />
            <button
              type="submit"
              className="btn btn-sm btn-primary text-nowrap d-inline-flex align-items-center justify-content-center"
              disabled={submitting || !inputCode.trim()}
              style={{ minWidth: 68 }}
            >
              {submitting ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Assign"
              )}
            </button>
          </form>
        </div>
        {inlineError && (
          <div
            className="text-danger small mt-1"
            style={{ fontSize: "11px", lineHeight: "1.2" }}
          >
            {inlineError}
          </div>
        )}
      </div>

      {/* Desktop view - exactly matching height, border, and styling of left and right columns */}
      <div className="border border-start-0 border-end-0 px-3 py-2 mb-2 mb-md-0 d-none d-md-flex align-items-center h-100 bg-white">
        <div className="d-flex align-items-center gap-2 w-100">
          <span
            className="text-nowrap"
            style={{ fontSize: "14px", color: "#212529" }}
          >
            Application Number:
          </span>
          <form
            onSubmit={handleAssign}
            className="d-flex align-items-center gap-2 flex-grow-1 mb-0"
          >
            <input
              type="text"
              className={`form-control form-control-sm text-uppercase ${
                inlineError ? "is-invalid" : ""
              }`}
              placeholder="Enter Client Code"
              title={inlineError || "Enter Client Code"}
              value={inputCode}
              onChange={(e) => {
                setInlineError("");
                setInputCode(
                  e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                );
              }}
              disabled={submitting}
              maxLength={15}
              style={{
                fontWeight: 600,
                letterSpacing: "0.5px",
                height: "34px",
                fontSize: "12px",
              }}
            />
            <button
              type="submit"
              className="btn btn-sm btn-primary text-nowrap d-inline-flex align-items-center justify-content-center"
              disabled={submitting || !inputCode.trim()}
              style={{
                minWidth: 68,
                height: "34px",
                fontSize: "12px",
                padding: "0 14px",
                fontWeight: 500,
              }}
            >
              {submitting ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : (
                "Assign"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

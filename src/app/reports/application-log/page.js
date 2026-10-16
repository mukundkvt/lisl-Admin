"use client";
import React, { useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Loader2 } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import axios from "axios";
import { toast } from "react-toastify";

const ApplicationLogsPage = () => {
  const [logType, setLogType] = useState("Auditlog");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ logType: false });
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  // DATE FORMAT CONVERTER (YYYY-MM-DD → DD-MM-YYYY)
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleExport = async () => {
    const newErrors = { logType: false };

    // Validation
    if (!logType || logType === "Select Type") {
      newErrors.logType = true;
    }

    setErrors(newErrors);

    // If validation fails, don't proceed
    if (newErrors.logType) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/audit-logs`,
        {
          params: {
            startDate: formatDate(fromDate),
            endDate: formatDate(toDate),
            search: search,
          },
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // check if backend returned error json
      if (response.data.type === "application/json") {
        const text = await response.data.text();
        const err = JSON.parse(text);
        toast.error(err.message || "Server error");
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "audit_log.xlsx");

      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);

      toast.success("Excel downloaded successfully");
    } catch (error) {
      console.log(error);
      toast.error("Download failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb
        title="Application Logs"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Application Logs" },
        ]}
      />
      <div className="mx-3">
        <div className="bg-white mt-2 rounded-3 shadow-sm border">
          <div className="p-3">
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label" style={{ color: "#656D9A" }}>
                  Log Type <span style={{ color: "red" }}>*</span>
                </label>

                <select
                  className="form-select"
                  value={logType}
                  onChange={(e) => {
                    setLogType(e.target.value);
                    setErrors({ ...errors, logType: false });
                  }}
                  style={{
                    background: "#F8F9FB",
                    borderColor: errors.logType ? "red" : undefined,
                  }}
                >
                  <option>Select Type</option>
                  <option>SMS</option>
                  <option>Email</option>
                  <option>Penny Drop</option>
                  <option>Esign</option>
                  <option>Payment Log</option>
                  <option>Pan Log</option>
                  <option>Digilockerlog</option>
                  <option>Auditlog</option>
                  <option>DeletionLog</option>
                </select>
              </div>

              <div className="col-md-12">
                <label className="form-label" style={{ color: "#656D9A" }}>
                  From Date
                </label>

                <input
                  type="date"
                  ref={fromDateRef}
                  className="form-control"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  onClick={() => fromDateRef.current?.showPicker?.()}
                  style={{ background: "#F8F9FB" }}
                />
              </div>

              <div className="col-md-12">
                <label className="form-label" style={{ color: "#656D9A" }}>
                  To Date
                </label>

                <input
                  type="date"
                  ref={toDateRef}
                  className="form-control"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  onClick={() => toDateRef.current?.showPicker?.()}
                  style={{ background: "#F8F9FB" }}
                />
              </div>

              <div className="col-md-12">
                <label className="form-label" style={{ color: "#656D9A" }}>
                  Search Value
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter value"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ background: "#F8F9FB" }}
                />
              </div>

              <div className="col-md-3">
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="btn d-flex align-items-center gap-2"
                  style={{
                    background: "linear-gradient(180deg, #FF2200, #FF7700)",
                    color: "#fff",
                    padding: "8px 18px",
                    fontSize: "14px",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="spin me-2" size={16} />
                      Exporting...
                    </>
                  ) : (
                    "Export To Excel"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationLogsPage;

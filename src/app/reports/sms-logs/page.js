"use client";
import Link from "next/link";
import React, { useState } from "react";
import { NotebookText, ArrowUp, Search, Loader2 } from "lucide-react";
import styles from "../reports.module.css";
import CustomPagination from "@/components/CustomPagination/CustomPagination";
import { useRef } from "react";
import axios from "axios";
import moment from "moment";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/Breadcrumb";

// DD/MM/YYYY HH:MM:SS
const convertDate = (date) => {
  return moment(date).format("DD/MM/YYYY HH:mm:ss");
};

function ReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const inputRef = useRef();
  const [isDisable, setIsDisable] = useState(false);

  const handleGetLog = async () => {
    const token = localStorage.getItem("token");
    const mobileNumber = inputRef.current?.value?.trim();
    if (!mobileNumber) {
      toast.warn("Mobile number is required");
      console.warn("Mobile number is required");
      return;
    }

    try {
      setIsLoading(true);
      setIsDisable(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/mobile-otp-logs/${mobileNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setLogs(response.data?.data || []);
      console.log(response);
      toast.success("Logs Fetched successfully");
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      toast.error("Could not fetch logs. Please try again." || error.message);
    } finally {
      setIsLoading(false);
      setIsDisable(false);
    }
  };
  return (
    <>
      <Breadcrumb
        title="Reports"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Reports" },
        ]}
      />

      {/* Content */}
      <div className="mx-3">
        <div className="bg-white p-0 mt-2 rounded-3 shadow-sm border">
          {/* Title + Search */}
          <div className="d-flex px-3 mt-3 justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="mb-0 fw-semibold" style={{ color: "#1e2129" }}>
              SMS Logs
            </h5>
            <div className="d-flex flex-column flex-md-row align-items-center gap-0">
              <div className="d-flex align-items-center gap-3">
                <div className="position-relative">
                  <Search
                    size={16}
                    className="text-muted position-absolute"
                    style={{
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="text"
                    // value={"search"}
                    ref={inputRef}
                    // value={inputRef.current}
                    placeholder="Search by MobileNumber"
                    className="form-control ps-5"
                    style={{
                      minWidth: 250,
                      background: "#f8f9fa",
                      height: "38px",
                    }}
                  />
                </div>
                <button
                  className="btn btn-danger add-button d-flex align-items-center"
                  onClick={handleGetLog}
                  style={{
                    height: "38px",
                    padding: "0 12px",
                  }}
                  disabled={isDisable}
                >
                  Get Log
                </button>
              </div>
             
            </div>
          </div>
          <p>{true}</p>
          {/* Table */}
          <div className="table-responsive">
            <table className="table align-middle w-100 custom-table">
              <thead
                className={`${styles["custom-table-header"]} align-middle`}
                style={{ height: "50px" }}
              >
                <tr>
                  <th
                    className={`${styles["table-cell"]} ${styles["table-cell-first"]}`}
                    style={{ minWidth: 120 }}
                  >
                    Mobile
                  </th>
                  <th
                    className={styles["table-cell"]}
                    style={{ minWidth: 120 }}
                  >
                    OTP
                  </th>
                  <th
                    className={styles["table-cell"]}
                    style={{ minWidth: 140 }}
                  >
                    Verified
                  </th>
                  <th
                    className={styles["table-cell"]}
                    style={{ minWidth: 180 }}
                  >
                    CreationDate
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: "center", padding: "48px" }}
                    >
                      <Loader2
                        size={48}
                        className="spin"
                        style={{ color: "#ff5c00" }}
                      />
                      <div>Loading users...</div>
                    </td>
                  </tr>
                ) : logs?.length > 0 ? (
                  logs.map((log, i) => (
                    <tr key={i} className="border-bottom custom-table-height">
                      <td className={styles["table-cell"]}>{log.mobile}</td>
                      <td className={styles["table-cell"]}>{log.otp}</td>

                      <td className={styles["table-cell"]}>
                        {log.isVerify ? "Yes" : "No"}
                      </td>
                      <td className={styles["table-cell"]}>
                        {convertDate(log.timestamp)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-3">
                      No Reports found.
                    </td>
                  </tr>
                )}
                {/* {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-muted py-3">
                No users found.
              </td>
            </tr>
          )} */}
              </tbody>
            </table>
            <CustomPagination
              page={2}
              // pages={pagination?.pages || 1}
              // limit={limit}
              // total={pagination?.total || 0}
              // onPageChange={onPageChange}
              // onLimitChange={onLimitChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ReportPage;

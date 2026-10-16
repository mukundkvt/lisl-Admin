"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import styles from "./backoffice.module.css";
import {
  Check,
  CheckCircle,
  Clock,
  Copy,
  Download,
  LucideUpload,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { useParams } from "next/navigation";
import formatIndianDateTime from "@/utils/convertISODateTime";
import axios from "axios";
import getRoleDisplay from "@/components/WordShort";
import { toast } from "react-toastify";

const CATEGORY_LABELS = {
  bseMfStar: "BSE MF Star",
  bseStar: "BSE Star",
  bseStaraOf: "BSE Star AOF",
  camsKraUpload: "CAMS KRA Upload",
  ekycToCkyc: "eKYC to CKYC Conversion",
  photoUploadForCkyc: "Photo Upload for CKYC",
  poaUploadForCkyc: "POA Upload for CKYC",
  signatureUploadForCkyc: "Signature Upload for CKYC",
  updateCkycStatus: "Update CKYC Status",
  pushToClientMaster: "Push to Client Master (SharePro)",
  uploadToBSE: "Upload to BSE",
  uploadToNSE: "Upload to NSE",
  uploadToDP: "Upload to Depository (CDSL)",
};

const CKYC_SECTIONS = [
  "ekycToCkyc",
  "photoUploadForCkyc",
  "poaUploadForCkyc",
  "signatureUploadForCkyc",
  "updateCkycStatus",
];

const BackOffice = () => {
  const [pushStatus, setPushStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  const [showLogModal, setShowLogModal] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [logData, setLogData] = useState(null);

  const [approvalInfo, setApprovalInfo] = useState(null);
  const [pushingAll, setPushingAll] = useState(false);
  const [repushingSection, setRepushingSection] = useState(null);
  const [refreshingCdsl, setRefreshingCdsl] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (data, key, label = "Log") => {
    if (!data) return;
    const textToCopy = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          setCopiedKey(key);
          toast.success(`${label} copied to clipboard!`);
          setTimeout(() => setCopiedKey(null), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
          toast.error("Failed to copy to clipboard");
        });
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopiedKey(key);
        toast.success(`${label} copied to clipboard!`);
        setTimeout(() => setCopiedKey(null), 2000);
      } catch (e) {
        toast.error("Failed to copy to clipboard");
      }
    }
  };

  const params = useParams();
  const userId = params?.id;

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  const fetchPushStatus = useCallback(async () => {
    if (!token || !userId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/push-manage/status/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      if (json.success && json.data) {
        const formatted = Object.entries(json.data)
          .filter(([key]) => Boolean(CATEGORY_LABELS[key]))
          .map(([key, value]) => ({
            section: key,
            status: value.status,
            liveStatus: value.liveStatus || "",
            message: value.message || "",
            lastTimestamp: value.lastTimestamp,
          }));
        setPushStatus(formatted);
      }
    } catch (err) {
      console.error("Push status error:", err);
    } finally {
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    if (!token || !userId) return;

    const fetchApprovalStatus = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-approval-status/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();
        if (json.success) {
          setApprovalInfo(json);
        }
      } catch (err) {
        console.error("Approval status API error:", err);
      }
    };

    fetchApprovalStatus();
    fetchPushStatus();
  }, [token, userId, fetchPushStatus]);

  const handleViewLog = async (item) => {
    try {
      setLogLoading(true);
      setShowLogModal(true);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/push-manage/logs/${userId}/${item.section}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLogData(res.data);
    } catch (err) {
      console.error("View log error:", err);
      toast.error("Failed to fetch push log");
    } finally {
      setLogLoading(false);
    }
  };

  const handleStartPush = async () => {
    if (!token || !userId) return;
    try {
      setPushingAll(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/push-manage/push_all/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        toast.success("Start Push executed for all downstream services!");
        if (res.data.data) {
          const formatted = Object.entries(res.data.data)
            .filter(([key]) => Boolean(CATEGORY_LABELS[key]))
            .map(([key, value]) => ({
              section: key,
              status: value.status,
              liveStatus: value.liveStatus || "",
              message: value.message || "",
              lastTimestamp: value.lastTimestamp,
            }));
          setPushStatus(formatted);
        }
      } else {
        toast.error(res.data?.message || "Failed to execute push all");
      }
    } catch (err) {
      console.error("Start Push Error:", err);
      toast.error(err.response?.data?.message || "Error executing push all");
    } finally {
      setPushingAll(false);
      fetchPushStatus();
    }
  };

  const handleRepushSection = async (item) => {
    if (!token || !userId || !item?.section) return;

    let endpoint = `/api/admin/push_to_sharepro/${userId}`;
    const section = item.section;

    if (section === "uploadToBSE") {
      endpoint = `/api/admin/upload_bse/${userId}`;
    } else if (section === "uploadToNSE") {
      endpoint = `/api/admin/push_to_nse/${userId}`;
    } else if (section === "uploadToDP") {
      endpoint = `/api/admin/push_to_cdsl/setup/${userId}`;
    } else if (section === "bseMfStar" || section === "bseStar") {
      endpoint = `/api/admin/push_to_bse_mfi/${userId}`;
    } else if (section === "bseStaraOf") {
      toast.info("BSE Star AOF upload integration is coming soon.");
      return;
    } else if (section === "camsKraUpload") {
      endpoint = `/api/admin/push_to_kra/${userId}`;
    } else if (section === "pushToClientMaster") {
      endpoint = `/api/admin/push_to_sharepro/${userId}`;
    }

    try {
      setRepushingSection(section);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        toast.success(`Push for ${CATEGORY_LABELS[section] || section} completed successfully!`);
      } else {
        toast.error(res.data?.message || `Push failed for ${CATEGORY_LABELS[section] || section}`);
      }
    } catch (err) {
      console.error("Repush error:", err);
      toast.error(err.response?.data?.message || `Error pushing ${CATEGORY_LABELS[section] || section}`);
    } finally {
      setRepushingSection(null);
      fetchPushStatus();
    }
  };

  const handleRefreshCDSLStatus = async () => {
    if (!token || !userId) return;

    try {
      setRefreshingCdsl(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/push_to_cdsl/status/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success) {
        const dbStatus = res.data?.status;
        const liveStatus = res.data?.liveStatus || "";
        if (dbStatus === "success") {
          toast.success(`CDSL Status updated: Success (${liveStatus || "Closed"})!`);
        } else if (dbStatus === "failed") {
          toast.error(res.data?.message || `CDSL Status updated: Failed (${liveStatus})`);
        } else {
          toast.info(res.data?.message || `CDSL Status: Still Pending (${liveStatus || "Initiated For processing"})`);
        }
      } else {
        toast.error(res.data?.message || "Failed to check CDSL status");
      }
    } catch (err) {
      console.error("Refresh CDSL Status Error:", err);
      toast.error(err.response?.data?.message || "Error checking CDSL status");
    } finally {
      setRefreshingCdsl(false);
      await fetchPushStatus();
    }
  };

  const renderStatusCapsule = (status, message = "", liveStatus = "") => {
    const baseStyle = {
      padding: "2px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      textTransform: "capitalize",
      display: "inline-block",
      minWidth: "80px",
      textAlign: "center",
    };

    if (status === "success") {
      return (
        <span
          style={{
            ...baseStyle,
            backgroundColor: "#E9F7EF",
            color: "#1E8449",
            border: "1px solid #1E8449",
          }}
        >
          Success
        </span>
      );
    }

    if (status === "failed") {
      return (
        <span
          style={{
            ...baseStyle,
            backgroundColor: "#FDEDEC",
            color: "#C0392B",
            border: "1px solid #C0392B",
            maxWidth: "280px",
            whiteSpace: "normal",
            wordWrap: "break-word",
          }}
        >
          {message ? `Failed - ${message}` : "Failed"}
          {message && (
            <button
              type="button"
              className="btn btn-link p-0 ms-1 text-danger border-0"
              style={{ verticalAlign: "middle", lineHeight: 1 }}
              title="Copy error message"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(message, `err-${message}`, "Error message");
              }}
            >
              {copiedKey === `err-${message}` ? (
                <Check size={12} className="text-success" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          )}
        </span>
      );
    }

    return (
      <span
        style={{
          ...baseStyle,
          backgroundColor: "#FEF9E7",
          color: "#B7950B",
          border: "1px solid #B7950B",
          maxWidth: "280px",
          whiteSpace: "normal",
          wordWrap: "break-word",
        }}
        title={liveStatus || message || "Pending"}
      >
        {liveStatus ? `Pending (${liveStatus})` : "Pending"}
      </span>
    );
  };

  return (
    <>
      <Breadcrumb
        title="Push to BackOffice"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile", href: "#" },
          {
            label: `${approvalInfo?.nameAsPerAddressProof?.fullName || approvalInfo?.name?.fullName || "User"} - Pushed to BO`,
          },
        ]}
      />

      {approvalInfo && (
        <div className="d-flex flex-row justify-content-end mt-3 align-items-center gap-3 p-3">
          {approvalInfo.lastApprovedAt && approvalInfo.allApproved && (
            <button
              className="btn btn-sm"
              style={{
                backgroundColor: "#F3FFEB",
                color: "#4EB800",
                border: "1px solid #4EB800",
                fontWeight: 600,
                padding: "10px 12px",
                fontSize: "14px",
              }}
            >
              Approved on {formatIndianDateTime(approvalInfo.lastApprovedAt)}
            </button>
          )}

          {approvalInfo.createdAt && (
            <button
              className="btn btn-sm"
              style={{
                backgroundColor: "#F3FFEB",
                color: "#4EB800",
                border: "1px solid #4EB800",
                fontWeight: 600,
                padding: "10px 12px",
                fontSize: "14px",
              }}
            >
              Created on {formatIndianDateTime(approvalInfo.createdAt)}
            </button>
          )}
          <span 
            title={!approvalInfo?.allApproved ? "All steps are not approved" : ""}
            style={{ 
              display: "inline-block", 
              cursor: pushingAll || !approvalInfo?.allApproved ? "not-allowed" : "default" 
            }}
          >
            <button
              className="btn btn-sm d-flex align-items-center"
              style={{
                backgroundColor: pushingAll || !approvalInfo?.allApproved ? "#D1D5DB" : "#FF5722",
                color: "#FFFFFF",
                border: "none",
                fontWeight: 600,
                padding: "10px 16px",
                fontSize: "14px",
                borderRadius: "6px",
                pointerEvents: pushingAll || !approvalInfo?.allApproved ? "none" : "auto",
              }}
              onClick={handleStartPush}
              disabled={pushingAll || !approvalInfo?.allApproved}
            >
              <LucideUpload
                style={{ width: "18px", height: "18px", marginRight: "6px" }}
              />
              {pushingAll ? "Pushing All..." : "Start Push"}
            </button>
          </span>
        </div>
      )}

      {/* Header Info */}
      <div className="mt-3 mx-4">
        <div className="row g-0">
          <div className="col-12 col-md">
            <div className="border p-3 rounded d-md-none mb-2">
              {approvalInfo?.kycType || "Digilocker"} based account opening
            </div>
            <div className="border p-3 rounded-start d-none d-md-block">
              {loading ? (
                <div
                  className="shimmer rounded"
                  style={{ height: 18, width: "70%" }}
                />
              ) : (
                `${approvalInfo?.kycType || "Digilocker"} based account opening`
              )}
            </div>
          </div>
          <div className="col-12 col-md">
            <div className="border p-3 rounded d-md-none mb-2">
              Application Number:{" "}
              <strong>{approvalInfo?.clientCode || "N/A"}</strong>
            </div>

            <div className="border p-3 mb-2 mb-md-0 d-none d-md-block">
              Application Number:{" "}
              {loading ? (
                <strong>
                  <span
                    className="shimmer rounded d-inline-block"
                    style={{ height: 16, width: 140 }}
                  />
                </strong>
              ) : approvalInfo?.clientCode ? (
                <strong>{approvalInfo.clientCode}</strong>
              ) : (
                <strong>N/A</strong>
              )}
            </div>
          </div>

          <div className="col-12 col-md">
            <div className="border p-3 rounded d-md-none">
              UTM Source:{" "}
              {approvalInfo?.referredBy &&
              Object.keys(approvalInfo.referredBy).length > 0 ? (
                <strong>
                  {getRoleDisplay(approvalInfo.referredBy.role)}:{" "}
                  {approvalInfo.referredBy.name},{" "}
                  {approvalInfo.referredBy.mobile || "N/A"} <br />
                  (Emp Code: {approvalInfo.referredBy.employeeId || "N/A"})
                </strong>
              ) : (
                <strong>Web</strong>
              )}
            </div>
            <div className="border p-3 rounded-end d-none d-md-block">
              UTM Source:{" "}
              {approvalInfo?.referredBy &&
              Object.keys(approvalInfo.referredBy).length > 0 ? (
                <strong>
                  {getRoleDisplay(approvalInfo.referredBy.role)}:{" "}
                  {approvalInfo.referredBy.name},{" "}
                  {approvalInfo.referredBy.mobile || "N/A"} | Emp Code:{" "}
                  {approvalInfo.referredBy.employeeId || "N/A"}
                </strong>
              ) : (
                <strong>Web</strong>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Matching Table */}
      <div className="table-responsive border rounded mb-3 mt-4 mx-4">
        <table className="table align-middle w-100 table-fixed">
          <thead
            className={`${styles["custom-table-header"]} align-middle`}
            style={{ height: "50px" }}
          >
            <tr>
              <th className="text-nowrap" style={{ minWidth: "200px" }}>
                Name as per NSDL PAN
              </th>
              <th className="text-nowrap" style={{ minWidth: "200px" }}>
                Customer Entered Name
              </th>
              <th className="text-nowrap" style={{ minWidth: "200px" }}>
                Name as per AADHAAR
              </th>
              <th className="text-nowrap" style={{ minWidth: "280px" }}>
                Matching Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              className={`${styles["no-bottom-border"]}`}
              style={{ paddingTop: "16px" }}
            >
              <td style={{ paddingTop: "16px" }}>
                {approvalInfo ? (
                  approvalInfo?.name?.fullName
                ) : (
                  <div
                    className="shimmer"
                    style={{ height: "14px", width: "70%" }}
                  />
                )}
              </td>

              <td style={{ paddingTop: "16px" }}>
                {approvalInfo ? (
                  approvalInfo?.name?.fullName
                ) : (
                  <div
                    className="shimmer"
                    style={{ height: "14px", width: "70%" }}
                  />
                )}
              </td>

              <td style={{ paddingTop: "16px" }}>
                {approvalInfo ? (
                  approvalInfo?.nameAsPerAddressProof?.fullName
                ) : (
                  <div
                    className="shimmer"
                    style={{ height: "14px", width: "75%" }}
                  />
                )}
              </td>

              <td style={{ paddingTop: "16px" }}>
                {approvalInfo ? (
                  approvalInfo?.isNameMatchPAN !== undefined && (
                    <div className="p-3 rounded-end d-flex align-items-center">
                      {approvalInfo.isNameMatchPAN ? (
                        <>
                          <Check
                            size={18}
                            style={{
                              backgroundColor: "#56CA00",
                              color: "white",
                              borderRadius: "50%",
                              padding: "3px",
                              marginRight: "8px",
                              minWidth: "20px",
                            }}
                          />
                          <span>Matched with NSDL PAN Name</span>
                        </>
                      ) : (
                        <>
                          <X
                            size={18}
                            style={{
                              backgroundColor: "#FF3B30",
                              color: "white",
                              borderRadius: "50%",
                              padding: "3px",
                              marginRight: "8px",
                              minWidth: "20px",
                            }}
                          />
                          <span>Name Mismatch with NSDL PAN</span>
                        </>
                      )}
                    </div>
                  )
                ) : (
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="shimmer"
                      style={{
                        height: "18px",
                        width: "18px",
                        borderRadius: "50%",
                      }}
                    />
                    <div
                      className="shimmer"
                      style={{
                        height: "14px",
                        width: "180px",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Main Push Actions table */}
      <div className="bg-white p-0 mt-4 mx-4 mb-3 rounded shadow-sm border">
        <div className="table-responsive rounded">
          <table className="table align-middle w-100">
            <thead
              className={`${styles["custom-table-header"]} align-middle`}
              style={{ height: "50px" }}
            >
              <tr>
                <th
                  className={`${styles["table-cell"]} ${styles["table-cell-first"]}`}
                  style={{ minWidth: 220 }}
                >
                  Category
                </th>
                <th className={styles["table-cell"]} style={{ minWidth: 120 }}>
                  Status
                </th>
                <th className={styles["table-cell"]} style={{ minWidth: 180 }}>
                  Last Update
                </th>
                <th className={styles["table-cell"]} style={{ minWidth: 220 }}>
                  Action / State
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-4">
                    <div className="d-flex flex-column gap-3 px-3">
                      {[1, 2, 3, 4, 5].map((_, rowIndex) => (
                        <div key={rowIndex} className="d-flex gap-3">
                          {[1, 2, 3, 4].map((_, colIndex) => (
                            <div
                              key={colIndex}
                              className="shimmer"
                              style={{
                                height: "14px",
                                width:
                                  colIndex === 0
                                    ? "35%"
                                    : colIndex === 1
                                      ? "18%"
                                      : colIndex === 2
                                        ? "25%"
                                        : "30%",
                                borderRadius: "8px",
                              }}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : (
                pushStatus.map((item, i) => {
                  const isCkyc = CKYC_SECTIONS.includes(item.section);
                  return (
                    <tr
                      key={i}
                      className="border-bottom"
                      style={{ height: "56px" }}
                    >
                      <td
                        className={`${styles["table-cell"]} ${styles["table-cell-first"]}`}
                      >
                        {CATEGORY_LABELS[item.section] || item.section}
                      </td>

                      <td className={styles["table-cell"]}>
                        {renderStatusCapsule(item.status, item.message, item.liveStatus)}
                      </td>

                      <td className={styles["table-cell"]}>
                        {item.lastTimestamp
                          ? new Date(item.lastTimestamp).toLocaleString("en-IN")
                          : "-"}
                      </td>

                      <td className={styles["table-cell"]}>
                        <div className="d-flex align-items-center gap-2">
                          {item.status === "success" && (
                            <>
                              <CheckCircle size={16} className="text-success" />
                              <span className="text-success fw-medium">Successfully Pushed</span>
                              {!isCkyc && (
                                <button
                                  className="btn btn-sm btn-outline-success ms-2"
                                  onClick={() => handleViewLog(item)}
                                >
                                  View Log
                                </button>
                              )}
                            </>
                          )}

                          {item.status === "failed" && (
                            <>
                              <XCircle size={16} className="text-danger" />
                              {!isCkyc && (
                                <span 
                                  title={!approvalInfo?.allApproved ? "All steps are not approved" : ""}
                                  style={{ 
                                    display: "inline-block", 
                                    cursor: !approvalInfo?.allApproved ? "not-allowed" : "default" 
                                  }}
                                >
                                  <button
                                    className="btn btn-sm btn-danger px-3 rounded-pill"
                                    onClick={() => handleRepushSection(item)}
                                    disabled={repushingSection === item.section || !approvalInfo?.allApproved}
                                    style={{ 
                                      pointerEvents: !approvalInfo?.allApproved ? "none" : "auto" 
                                    }}
                                  >
                                    {repushingSection === item.section ? "Repushing..." : "Repush"}
                                  </button>
                                </span>
                              )}
                              {!isCkyc && (
                                <button
                                  className="btn btn-sm btn-outline-secondary ms-1"
                                  onClick={() => handleViewLog(item)}
                                >
                                  View Log
                                </button>
                              )}
                            </>
                          )}

                          {item.status === "pending" && (
                            <>
                              <Clock size={16} className="text-warning" />
                              {!isCkyc && (
                                <span 
                                  title={!approvalInfo?.allApproved ? "All steps are not approved" : ""}
                                  style={{ 
                                    display: "inline-block", 
                                    cursor: !approvalInfo?.allApproved ? "not-allowed" : "default" 
                                  }}
                                >
                                  <button
                                    className="btn btn-sm btn-primary px-3 rounded-pill"
                                    onClick={() => handleRepushSection(item)}
                                    disabled={repushingSection === item.section || !approvalInfo?.allApproved}
                                    style={{ 
                                      pointerEvents: !approvalInfo?.allApproved ? "none" : "auto" 
                                    }}
                                  >
                                    {repushingSection === item.section ? "Pushing..." : "Push Now"}
                                  </button>
                                </span>
                              )}
                              {item.section === "uploadToDP" && (
                                <button
                                  className="btn btn-sm btn-outline-info ms-1 px-3 rounded-pill d-inline-flex align-items-center gap-1"
                                  onClick={handleRefreshCDSLStatus}
                                  disabled={refreshingCdsl}
                                  title="Check latest status from CDSL"
                                  style={{
                                    borderColor: "#0288D1",
                                    color: "#0288D1",
                                    fontWeight: 500,
                                  }}
                                >
                                  <RefreshCw
                                    size={14}
                                    className={refreshingCdsl ? styles.spin : ""}
                                  />
                                  {refreshingCdsl ? "Checking..." : "Refresh"}
                                </button>
                              )}
                              {!isCkyc && (
                                <button
                                  className="btn btn-sm btn-outline-secondary ms-1"
                                  onClick={() => handleViewLog(item)}
                                >
                                  View Log
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showLogModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 10060 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content" style={{ background: "#F8F9FB" }}>
              <div
                className="modal-header d-flex justify-content-between align-items-center"
                style={{
                  background: "linear-gradient(180deg, #FF2200, #FF7700)",
                  color: "#fff",
                  padding: "10px 16px",
                }}
              >
                <h5 className="modal-title m-0" style={{ fontSize: "15px" }}>
                  Push Logs – {CATEGORY_LABELS[logData?.section] || logData?.section || ""}
                </h5>
                <div className="d-flex align-items-center gap-2">
                  {logData?.logs?.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-light py-1 px-2 d-inline-flex align-items-center gap-1 shadow-sm"
                      onClick={() => handleCopy(logData.logs, "all-logs", "All logs")}
                      title="Copy all logs"
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                      {copiedKey === "all-logs" ? (
                        <>
                          <Check size={13} className="text-success" />
                          <span className="text-success">Copied All!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy All</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-close"
                    style={{ filter: "invert(1)" }}
                    onClick={() => {
                      setShowLogModal(false);
                      setLogData(null);
                    }}
                  ></button>
                </div>
              </div>

              <div className="modal-body">
                {logLoading ? (
                  <p className="text-muted">Loading logs...</p>
                ) : logData?.logs?.length > 0 ? (
                  logData.logs.map((log, index) => (
                    <div
                      key={index}
                      className="border rounded p-3 mb-4 bg-white shadow-sm"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
                        <div className="text-muted small d-flex align-items-center flex-wrap gap-2">
                          <span className="badge bg-light text-dark border">
                            Log #{logData.logs.length - index}
                          </span>
                          <span>
                            <strong>Timestamp:</strong>{" "}
                            {new Date(log.timestamp).toLocaleString("en-IN")}
                          </span>
                          {log.action && (
                            <span className="badge bg-secondary-subtle text-secondary border">
                              {log.action}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => handleCopy(log, `full-${index}`, `Log #${logData.logs.length - index}`)}
                          title="Copy this full log (timestamp, payload & response)"
                          style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "6px" }}
                        >
                          {copiedKey === `full-${index}` ? (
                            <>
                              <Check size={13} className="text-success" />
                              <span className="text-success fw-medium">Copied Log!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy Log</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold small">Payload</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-decoration-none p-0 d-inline-flex align-items-center gap-1 text-muted"
                              onClick={() => handleCopy(log.payload, `payload-${index}`, "Payload")}
                              title="Copy payload"
                              style={{ fontSize: "11px" }}
                            >
                              {copiedKey === `payload-${index}` ? (
                                <>
                                  <Check size={12} className="text-success" />
                                  <span className="text-success">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre
                            className="bg-light p-2 rounded small border"
                            style={{
                              maxHeight: "300px",
                              overflow: "auto",
                              fontSize: "12px",
                            }}
                          >
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </div>

                        <div className="col-12 col-md-6">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold small">Response</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-decoration-none p-0 d-inline-flex align-items-center gap-1 text-muted"
                              onClick={() => handleCopy(log.response, `response-${index}`, "Response")}
                              title="Copy response"
                              style={{ fontSize: "11px" }}
                            >
                              {copiedKey === `response-${index}` ? (
                                <>
                                  <Check size={12} className="text-success" />
                                  <span className="text-success">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre
                            className="bg-light p-2 rounded small border"
                            style={{
                              maxHeight: "300px",
                              overflow: "auto",
                              fontSize: "12px",
                            }}
                          >
                            {JSON.stringify(log.response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No logs available</p>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowLogModal(false);
                    setLogData(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BackOffice;

"use client";

import {
  Check,
  LucideUpload,
  X,
  Eye,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./exchange.module.css";
import RejectModal from "@/components/RejectModal/RejectModal";
import { toast } from "react-toastify";
import axios from "axios";
import ApproveRejectButtons from "@/components/ApproveRejectButtons";
import Breadcrumb from "@/components/Breadcrumb";
import formatFunDate from "@/utils/convertISODate";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import getRoleDisplay from "@/components/WordShort";
import { getNextPendingTab } from "@/utils/getNextPendingTab";
import { useApprovalMutation } from "@/hooks/useApprovalStatus";
import PdfImageViewer from "@/components/PdfImageViewer";

const Exchange = () => {
  const [token, setToken] = useState(null);
  const { id } = useParams();
  const [usersById, setUsersById] = useState([]);
  const [user, setUser] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");
  const [exchangeApprovalDetails, setExchangeApprovalDetails] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [actionTaken, setActionTaken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [status, setStatus] = useState({});
  const approvalMutation = useApprovalMutation(id);
  const router = useRouter();

  // New State Variables
  const [schemeDetails, setSchemeDetails] = useState(null);
  const [ddpiDetails, setDdpiDetails] = useState(null);
  const [dpid, setDpid] = useState(null);
  const [financialProofs, setFinancialProofs] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);
  const [ddpiOpted, setDdpiOpted] = useState(false);
  const [isTariffExpanded, setIsTariffExpanded] = useState(false);

  //    const [exchangeData, setExchangeData] = useState(null);

  const reasons = [
    "Income proof not valid or expired",
    "Financial document name mismatch with PAN",
    "Provide latest 6 months bank statement with salary / income credits",
    "Income proof required for derivative (F&O / Commodity) segments",
    "ITR acknowledgment or Form 16 invalid or incomplete",
    "Gross annual income or net worth details missing",
  ];

  const tradingSegments = ["NSE", "BSE", "MCX"];

  // Rows = Market Segments, Columns = Exchanges
  // applicable: which exchange columns are "white" (valid cells)
  // selectedFor: which schema field controls the tick for each exchange cell (null = never ticked)
  const marketSegmentRows = [
    {
      label: "Cash",
      applicable: { NSE: true, BSE: true, MCX: false },
      selectedFor: { NSE: "Cash", BSE: "Cash", MCX: null },
      // Cash=true → NSE Cash ✅ + BSE Cash ✅
    },
    {
      label: "F&O",
      applicable: { NSE: true, BSE: true, MCX: false },
      selectedFor: { NSE: "FO", BSE: "FO", MCX: null },
      // FO=true → NSE F&O ✅ + BSE F&O ✅
    },
    {
      label: "Currency",
      applicable: { NSE: true, BSE: false, MCX: false },
      selectedFor: { NSE: null, BSE: null, MCX: null },
      // Not tracked in schema → always unchecked (white cell shown)
    },
    {
      label: "Commodity",
      applicable: { NSE: true, BSE: false, MCX: true },
      selectedFor: { NSE: null, BSE: null, MCX: "Commodities" },
      // Commodities=true → MCX Commodity ✅ only (NSE Commodity not tracked)
    },
    {
      label: "SLBM",
      applicable: { NSE: true, BSE: false, MCX: false },
      selectedFor: { NSE: null, BSE: null, MCX: null },
      // Not tracked separately in schema → always unchecked
    },
    {
      label: "BSE Star MF",
      applicable: { NSE: false, BSE: true, MCX: false },
      selectedFor: { NSE: null, BSE: "MF", MCX: null },
      // MF=true → BSE Star MF ✅ only
    },
  ];

  if (!usersById) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  const EsignUserById = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/details/exchange/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setStatus(res.data);
      setPendingApproval(res.data?.exchangeApproval?.status);
      setExchangeApprovalDetails(res.data?.exchangeApproval);
      setUsersById(res.data.userExchange.enchange?.segments || {});
      setSchemeDetails(res.data.userExchange.appliedScheme);
      setDdpiDetails(res.data.userExchange.ddpiConcent);
      setDpid(res.data.userExchange.dpId);
      setFinancialProofs(res.data.userExchange.enchange?.financialProofs || []);
      setDdpiOpted(res.data.userExchange.ddpiOpted);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleApprove = async () => {
    try {
      await approvalMutation.mutateAsync({
        status: "approved",
        section: "exchange",
      });

      toast.success("Approved successfully");
      setActionTaken(true);

      // Get latest approval status
      const statusRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-approval-status/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Decide next tab
      const nextTab = getNextPendingTab(statusRes.data);
      if (nextTab) {
        router.push(`?tab=${nextTab}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (reasonFromModal) => {
    const reasonToSend =
      (typeof reasonFromModal === "string" && reasonFromModal.trim()) ||
      selectedReason ||
      customReason.trim();

    if (!reasonToSend) {
      setError("Please select or enter a reason for rejection");
      return;
    }

    setError("");

    try {
      await approvalMutation.mutateAsync({
        status: "rejected",
        section: "exchange",
        reason: reasonToSend,
      });

      toast.success("Rejected successfully");
      setActionTaken(true);
      setShowModal(false);
      setSelectedReason("");
      setCustomReason("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to reject");
    }
  };

  useEffect(() => {
    if (token) {
      EsignUserById();
    }
  }, [token]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
      else setUser({});
    }
  }, []);
  console.log(exchangeApprovalDetails);
  return (
    <>
      <Breadcrumb
        title="Exchange Stage"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile", href: "#" },
          {
            label: "Exchange Stage",
          },
        ]}
      />

      <div
        className="d-flex flex-row justify-content-end mt-3 align-items-center gap-2 p-3"
        style={{ backgroundColor: "" }}
      >
        {pendingApproval !== "pending" &&
          (loading ? (
            <Skeleton
              width={400} // button width
              height={45} // button height
              borderRadius={6} // rounded like a button
            />
          ) : (
            <button
              className="btn btn-sm"
              style={{
                backgroundColor:
                  exchangeApprovalDetails?.status === "rejected"
                    ? "#FFEDED"
                    : "#F3FFEB",
                color:
                  exchangeApprovalDetails?.status === "rejected"
                    ? "#FF4800"
                    : "#4EB800",
                border:
                  exchangeApprovalDetails?.status === "rejected"
                    ? "1px solid #FF0000"
                    : "1px solid #4EB800",
                fontWeight: 600,
                padding:
                  exchangeApprovalDetails?.status === "rejected"
                    ? ""
                    : "10px 12px",
                fontSize: "14px",
              }}
            >
              {exchangeApprovalDetails?.autoApproved
                ? `Auto approved on ${formatFunDate(
                    exchangeApprovalDetails?.approveAt,
                  )}`
                : exchangeApprovalDetails.status === "rejected"
                  ? `RejectedBy ${
                      exchangeApprovalDetails?.rejectedBy?.name
                    } on ${formatFunDate(exchangeApprovalDetails?.rejectedAt)}`
                  : `ApprovedBy ${
                      exchangeApprovalDetails?.approveBy?.name
                    } on ${formatFunDate(exchangeApprovalDetails?.approveAt)}`}
              {exchangeApprovalDetails?.status === "rejected" && (
                <span
                  className="d-block"
                  style={{
                    fontSize: "11px",
                    color: "#FF4800",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                    lineHeight: "12px",
                    display: "block",
                    textAlign: "left",
                  }}
                  title={exchangeApprovalDetails.rejectionReason} // full reason on hover
                >
                  Reason: {exchangeApprovalDetails.rejectionReason}
                </span>
              )}
            </button>
          ))}

        {/* <button
          className="btn btn-sm"
          style={{
            backgroundColor: "#F7F7F7",
            color: "#979797",
            border: "1px solid #979797",
            fontWeight: 600,
            padding: "10px 12px",
            fontSize: "14px",
          }}
        >
          <span>
            <LucideUpload
              style={{ width: "20px", height: "20px", marginRight: "6px" }}
            />
          </span>
          Start Push
        </button> */}
      </div>

      {/* Header Info */}
      <div className="mt-3 mx-4">
        <div className="row g-0">
          <div className="col-12 col-md">
            <div className="border p-3 rounded d-md-none mb-2">
              {status?.kycType || "N/A"} based account opening
            </div>
            <div className="border p-3 rounded-start d-none d-md-block">
              {loading ? (
                <div
                  className="shimmer rounded"
                  style={{ height: 18, width: "70%" }}
                />
              ) : status?.kycType ? (
                `${status.kycType} based account opening`
              ) : (
                "N/A"
              )}
            </div>
          </div>
          <div className="col-12 col-md">
            {/* Mobile view - rounded */}
            <div className="border p-3 rounded d-md-none mb-2">
              Application Number: <strong>{status?.clientCode || "N/A"}</strong>
            </div>

            {/* Desktop view - no rounded */}
            <div className="border p-3 mb-2 mb-md-0 d-none d-md-block">
              Application Number:{" "}
              {loading ? (
                <strong>
                  <span
                    className="shimmer rounded d-inline-block"
                    style={{ height: 16, width: 140 }}
                  />
                </strong>
              ) : status?.clientCode ? (
                <strong>{status.clientCode}</strong>
              ) : (
                <strong>N/A</strong>
              )}
            </div>
          </div>

          <div className="col-12 col-md">
            <div className="border p-3 rounded d-md-none">
              UTM Source:{" "}
              {status?.referredBy &&
              Object.keys(status.referredBy).length > 0 ? (
                <strong>
                  {getRoleDisplay(status.referredBy.role)}:{" "}
                  {status.referredBy.name}, {status.referredBy.mobile || "N/A"}{" "}
                  <br />
                  (Emp Code: {status.referredBy.employeeId || "N/A"})
                </strong>
              ) : (
                <strong>Web</strong>
              )}
            </div>
            <div className="border p-3 rounded-end d-none d-md-block">
              UTM Source:{" "}
              {status?.referredBy &&
              Object.keys(status.referredBy).length > 0 ? (
                <strong>
                  {getRoleDisplay(status.referredBy.role)}:{" "}
                  {status.referredBy.name}, {status.referredBy.mobile || "N/A"}{" "}
                  | Emp Code: {status?.referredBy?.employeeId || "N/A"}
                </strong>
              ) : (
                <strong>Web</strong>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-3 mt-4">
        {/* Table Box */}
        <div className="bg-white p-0 mt-2 rounded-3 shadow-sm border">
          {/* Title */}
          <div className="d-flex px-3 mt-3 justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="mb-0 fw-semibold" style={{ color: "#1e2129" }}>
              Exchange Segment
            </h5>
          </div>

          {/* Table */}
          <div className="mt-2">
            <div className="bg-white p-0 mt-2 rounded-3">
              <div className="table-responsive">
              <table className="table align-middle w-100 custom-table">
                  <thead
                    className={`${styles["custom-table-header"]} align-middle`}
                    style={{ height: "50px" }}
                  >
                    <tr>
                      <th
                        className={`${styles["table-cell"]} ${styles["table-cell-first"]}`}
                        style={{ minWidth: 140 }}
                      >
                        MARKET SEGMENT
                      </th>
                      {tradingSegments.map((exchange) => (
                        <th
                          key={exchange}
                          className={`${styles["table-cell"]} text-center`}
                          style={{ minWidth: 100 }}
                        >
                          {exchange}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {marketSegmentRows.map((row, i) => (
                      <tr key={i} className="border-bottom custom-table-height">
                        <td
                          className={`${styles["table-cell"]} ${styles["table-cell-first"]}`}
                        >
                          {row.label}
                        </td>

                        {tradingSegments.map((exchange) => {
                          const isApplicable = row.applicable[exchange];
                          const cellSchemaKey = row.selectedFor[exchange];
                          const isSelected =
                            isApplicable &&
                            cellSchemaKey &&
                            usersById[cellSchemaKey] === true;

                          return (
                            <td
                              key={exchange}
                              className={`${styles["table-cell"]} text-center`}
                              style={
                                !isApplicable
                                  ? { backgroundColor: "#e9ecef" }
                                  : {}
                              }
                            >
                              {isApplicable ? (
                                <input
                                  type="checkbox"
                                  checked={!!isSelected}
                                  readOnly
                                />
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-3 mt-4">
        {/* Financial Proofs */}
        <div className="bg-white p-4 rounded-3 shadow-sm border mb-4">
          <h5 className="mb-3 fw-semibold" style={{ color: "#1e2129" }}>
            Financial Proofs
          </h5>
          {financialProofs && financialProofs.length > 0 ? (
            <div className="d-flex flex-wrap gap-3">
              {financialProofs.map((proof, idx) => {
                const isString = typeof proof === "string";
                const filePath = isString ? proof : proof?.filePath;
                const fileType = isString
                  ? `Document ${idx + 1}`
                  : proof?.type || `Document ${idx + 1}`;

                return (
                  <div
                    key={idx}
                    className="border p-3 rounded d-flex align-items-center gap-3 bg-light"
                    style={{ minWidth: "250px" }}
                  >
                    <div className="bg-white p-2 rounded border">
                      <FileText size={24} className="text-primary" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="small text-muted mb-1">Type</div>
                      <div
                        className="fw-medium text-truncate"
                        style={{ maxWidth: "150px" }}
                        title={fileType}
                      >
                        {fileType}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        // Handle URL construction safely
                        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
                        const cleanPath = filePath.startsWith("/")
                          ? filePath.slice(1)
                          : filePath;
                        const url = `${baseUrl}/${cleanPath}`;
                        setViewerFile({ url, type: "pdf" });
                        setViewerOpen(true);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-4 bg-light rounded border border-dashed text-muted">
              No financial proofs uploaded
            </div>
          )}
        </div>

        {/* Brokerage Scheme */}
        <div className="bg-white p-4 rounded-3 shadow-sm border mb-4">
          <div className="mb-3">
            <h5 className="mb-0 fw-semibold" style={{ color: "#1e2129" }}>
              Brokerage Scheme
            </h5>
          </div>
          <div className="p-3 bg-light rounded border mb-4">
            <p className="mb-0 text-muted">Selected Scheme:</p>
            <h6 className="fw-bold mb-0">
              {schemeDetails?.schemeName || "N/A"}
            </h6>
          </div>

          {/* Brokerage Tariff Details Table - Collapsible */}
          <div className="mt-4 border rounded overflow-hidden">
            <div
              className="d-flex justify-content-between align-items-center p-3 bg-light"
              onClick={() => setIsTariffExpanded(!isTariffExpanded)}
              style={{ cursor: "pointer" }}
            >
              <h6 className="fw-bold mb-0">Brokerage tariff details</h6>
              {isTariffExpanded ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>

            <div
              style={{
                maxHeight: isTariffExpanded ? "1000px" : "0",
                overflow: "hidden",
                transition: "all 0.4s ease-in-out",
                opacity: isTariffExpanded ? 1 : 0,
              }}
            >
              <div className="p-3 border-top">
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead
                      style={{ backgroundColor: "#FF5E5E", color: "white" }}
                    >
                      <tr>
                        <th className="px-4 py-3 fw-medium border-0 rounded-start">
                          Segment/Exchange
                        </th>
                        <th className="px-4 py-3 fw-medium border-0 text-center">
                          Trading Brokerage (%)
                        </th>
                        <th className="px-4 py-3 fw-medium border-0 text-center">
                          Delivery Brokerage (%)
                        </th>
                        <th className="px-4 py-3 fw-medium border-0 text-center">
                          Minimum Brokerage (paisa)
                        </th>
                        <th className="px-4 py-3 fw-medium border-0 text-center rounded-end">
                          Option Brokerage (Rs)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-light">
                        <td className="px-4 py-3 border-0 fw-medium">
                          CM Segment
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.cMSegmentTradingBrokerage}%
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.cMSegmentDeliveryBrokerage}%
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.cMSegmentMinimumBrokerageInPaisa}
                        </td>
                        <td className="px-4 py-3 border-0 text-center">-</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 border-0 fw-medium">
                          F&O Segment
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.fOSegmentTradingBrokerage}%
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.fOSegmentDeliveryBrokerage}%
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.fOSegmentMinimumBrokerageInPaisa}
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.fOSegmentOptionBrokerageInRs}
                        </td>
                      </tr>
                      <tr className="bg-light">
                        <td className="px-4 py-3 border-0 fw-medium">
                          Currency
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.currencyTradingBrokerage}%
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.currencyDeliveryBrokerage}%
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.currencyMinimumBrokerageInPaisa}
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.currencyOptionBrokerageInRs}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 border-0 fw-medium">
                          MCX/NCDEX
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.mCXNCDEXTradingBrokerage}%
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.mCXNCDEXDeliveryBrokerage}%
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.mCXNCDEXMinimumBrokerageInPaisa}
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          {schemeDetails?._id?.mCXNCDEXOptionBrokerageInRs}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demat Details */}
        <div className="bg-white p-4 rounded-3 shadow-sm border mb-4">
          <h5 className="mb-3 fw-semibold" style={{ color: "#1e2129" }}>
            Demat Details
          </h5>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="p-3 bg-light rounded border h-100">
                <small className="text-muted d-block mb-1">Account</small>
                <span className="fw-medium">New</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-light rounded border h-100">
                <small className="text-muted d-block mb-1">Account Type</small>
                <span className="fw-medium">CDSL</span>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-light rounded border h-100">
                <small className="text-muted d-block mb-1">
                  DP Account Number
                </small>
                <span className="fw-medium">{dpid || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DDPI POA */}
        <div className="bg-white p-4 rounded-3 shadow-sm border mb-4">
          <h5 className="mb-3 fw-semibold" style={{ color: "#1e2129" }}>
            DDPI POA
          </h5>
          <div className="d-flex gap-4 align-items-center mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="ddpiOpted"
                id="ddpiYes"
                checked={ddpiOpted}
                readOnly
              />
              <label className="form-check-label fw-medium" htmlFor="ddpiYes">
                Yes
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="ddpiOpted"
                id="ddpiNo"
                checked={!ddpiOpted}
                readOnly
              />
              <label className="form-check-label fw-medium" htmlFor="ddpiNo">
                No
              </label>
            </div>
          </div>

          {ddpiOpted && ddpiDetails && (
            <div className="mt-3">
              <div className="row g-3">
                <div className="col-md-6 col-lg-3">
                  <div
                    className={`p-2 rounded border d-flex align-items-center gap-2 ${ddpiDetails.transfer_of_security ? "bg-success-subtle border-success" : "bg-danger-subtle border-danger"}`}
                  >
                    {ddpiDetails.transfer_of_security ? (
                      <Check size={18} className="text-success" />
                    ) : (
                      <X size={18} className="text-danger" />
                    )}
                    <span className="small fw-medium">
                      Settlement
                    </span>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div
                    className={`p-2 rounded border d-flex align-items-center gap-2 ${ddpiDetails.pledging ? "bg-success-subtle border-success" : "bg-danger-subtle border-danger"}`}
                  >
                    {ddpiDetails.pledging ? (
                      <Check size={18} className="text-success" />
                    ) : (
                      <X size={18} className="text-danger" />
                    )}
                    <span className="small fw-medium">Margin Pledge</span>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div
                    className={`p-2 rounded border d-flex align-items-center gap-2 ${ddpiDetails.mutual_fund_transaction ? "bg-success-subtle border-success" : "bg-danger-subtle border-danger"}`}
                  >
                    {ddpiDetails.mutual_fund_transaction ? (
                      <Check size={18} className="text-success" />
                    ) : (
                      <X size={18} className="text-danger" />
                    )}
                    <span className="small fw-medium">
                      Mutual Fund
                    </span>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div
                    className={`p-2 rounded border d-flex align-items-center gap-2 ${ddpiDetails.tendering_shares ? "bg-success-subtle border-success" : "bg-danger-subtle border-danger"}`}
                  >
                    {ddpiDetails.tendering_shares ? (
                      <Check size={18} className="text-success" />
                    ) : (
                      <X size={18} className="text-danger" />
                    )}
                    <span className="small fw-medium">Tender Offer</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {(user?.role === "Supervisor" || user?.role === "Scrutiny Officer") &&
        !actionTaken &&
        exchangeApprovalDetails?.status !== "rejected" &&
        (exchangeApprovalDetails?.status !== "approved" ||
          exchangeApprovalDetails?.autoApproved) && (
          <ApproveRejectButtons
            onApprove={handleApprove}
            onReject={handleReject}
            reasons={reasons}
            selectedReason={selectedReason}
            setSelectedReason={setSelectedReason}
            customReason={customReason}
            setCustomReason={setCustomReason}
            error={error}
          />
        )}

      {viewerOpen && (
        <PdfImageViewer
          show={viewerOpen}
          onClose={() => setViewerOpen(false)}
          fileUrl={viewerFile?.url}
          fileType={viewerFile?.type}
        />
      )}
    </>
  );
};

export default Exchange;

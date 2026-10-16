"use client";

import axios from "axios";
import { Check, Edit, LucideUpload, Save, X, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import styles from "./bank.module.css";
import RejectModal from "@/components/RejectModal/RejectModal";
import { toast } from "react-toastify";
import ApproveRejectButtons from "@/components/ApproveRejectButtons";
import Breadcrumb from "@/components/Breadcrumb";
import PdfImageViewer from "@/components/PdfImageViewer";
import formatFunDate from "@/utils/convertISODate";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Tooltip } from "react-tooltip";
import getRoleDisplay from "@/components/WordShort";
import { getNextPendingTab } from "@/utils/getNextPendingTab";
import { useApprovalMutation } from "@/hooks/useApprovalStatus";

const BankPage = () => {
  const [token, setToken] = useState(null);
  const { id } = useParams();
  const [usersById, setUsersById] = useState({});
  const [user, setUser] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [actionTaken, setActionTaken] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(null);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [originalAddress, setOriginalAddress] = useState(null);

  const [bankDetails, setBankDetails] = useState({
    bank_name: "",
    micr_code: "",
    address: "",
  });
  const [originalBankDetails, setOriginalBankDetails] = useState(null);

  const getFullName = (nameObj) => {
    if (!nameObj) return "";
    if (typeof nameObj === "string") return nameObj;
    return (
      nameObj.fullName ||
      `${nameObj.firstName || ""} ${nameObj.middleName || ""} ${nameObj.lastName || ""}`.trim()
    );
  };

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);
  const approvalMutation = useApprovalMutation(id);

  const openViewer = (url, type) => {
    setViewerFile({ url, type });
    setViewerOpen(true);
  };

  const router = useRouter();

  const reasons = [
    "Bank proof name mismatch with PAN card",
    "Provide clear bank proof with account number, IFSC and name clearly visible",
    "Bank statement must be of last 6 months with transaction entries",
    "Cheque does not have client name printed or is unsigned",
    "Bank account number or IFSC code mismatch",
    "Passbook copy is blurred, cropped, or unreadable",
  ];

  const EsignUserById = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/details/bank/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setPendingApproval(res.data?.bankApproval?.status);
      setUsersById(res.data);

      // Prefill bank details for editing
      const fetchedBankDetails = {
        bank_name: res.data?.bankDetails?.bank_account_details?.bank_name || "",
        micr_code: res.data?.bankDetails?.bank_account_details?.micr_code || "",
        address: res.data?.bankDetails?.bank_account_details?.address || "",
      };
      setBankDetails(fetchedBankDetails);
      setOriginalBankDetails(fetchedBankDetails);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approvalMutation.mutateAsync({
        status: "approved",
        section: "bank",
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
        section: "bank",
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

  // Bank Details Edit Functions
  const BankDetailsEdit = async () => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/manageuser/${id}/bank-details`,
        bankDetails,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success("Bank details updated successfully");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to update bank details");
      return false;
    }
  };

  const handleStartEdit = () => {
    setOriginalBankDetails({ ...bankDetails }); // snapshot
    setIsEditingAddress(true);
  };

  const handleCancelEdit = () => {
    if (originalBankDetails) {
      setBankDetails(originalBankDetails);
    } else {
      // fallback to server data
      setBankDetails({
        bank_name:
          usersById?.bankDetails?.bank_account_details?.bank_name || "",
        micr_code:
          usersById?.bankDetails?.bank_account_details?.micr_code || "",
        address: usersById?.bankDetails?.bank_account_details?.address || "",
      });
    }
    setIsEditingAddress(false);
  };

  const handleSaveEdit = async () => {
    if (!bankDetails.bank_name.trim()) {
      toast.error("Bank name is required");
      return;
    }
    if (!bankDetails.micr_code.trim()) {
      toast.error("MICR code is required");
      return;
    }

    const ok = await BankDetailsEdit();
    if (ok) {
      setOriginalBankDetails({ ...bankDetails });
      setIsEditingAddress(false);
      // refresh server data to keep in sync
      EsignUserById();
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
  console.log(usersById);
  return (
    <>
      <Breadcrumb
        title="Bank Stage"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile", href: "#" },
          {
            label: `${usersById?.bankDetails?.name?.fullName || "N/A"} - Bank Stage`,
          },
        ]}
      />

      <div
        className="d-flex flex-row justify-content-end mt-3 align-items-center gap-2 p-3"
        style={{ backgroundColor: "" }}
      >
        {" "}
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
                  usersById.bankApproval?.status === "rejected"
                    ? "#FFEDED"
                    : "#F3FFEB",
                color:
                  usersById.bankApproval?.status === "rejected"
                    ? "#FF4800"
                    : "#4EB800",
                border:
                  usersById.bankApproval?.status === "rejected"
                    ? "1px solid #FF0000"
                    : "1px solid #4EB800",
                fontWeight: 600,
                padding:
                  usersById.bankApproval?.status === "rejected"
                    ? ""
                    : "10px 12px",
                fontSize: "14px",
              }}
            >
              {usersById?.bankApproval?.autoApproved
                ? `Auto approved on ${formatFunDate(
                    usersById?.bankApproval?.approveAt,
                  )}`
                : usersById.bankApproval?.status === "rejected"
                  ? `RejectedBy ${
                      usersById?.bankApproval?.rejectedBy?.name?.fullName ||
                      usersById?.bankApproval?.rejectedBy?.name ||
                      ""
                    } on ${formatFunDate(usersById?.bankApproval?.rejectedAt)}`
                  : `ApprovedBy ${
                      usersById?.bankApproval?.approveBy?.name?.fullName ||
                      usersById?.bankApproval?.approveBy?.name ||
                      ""
                    } on ${formatFunDate(usersById?.bankApproval?.approveAt)}`}
              {usersById?.bankApproval?.status === "rejected" && (
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
                  title={usersById.bankApproval.rejectionReason} // full reason on hover
                >
                  Reason: {usersById.bankApproval.rejectionReason}
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
              {usersById?.kycType || "N/A"} based account opening
            </div>
            <div className="border p-3 rounded-start d-none d-md-block">
              {loading ? (
                <div
                  className="shimmer rounded"
                  style={{ height: 18, width: "70%" }}
                />
              ) : usersById?.kycType ? (
                `${usersById.kycType} based account opening`
              ) : (
                "N/A"
              )}
            </div>
          </div>
          <div className="col-12 col-md">
            {/* Mobile view - rounded */}
            <div className="border p-3 rounded d-md-none mb-2">
              Application Number:{" "}
              <strong>{usersById?.clientCode || "N/A"}</strong>
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
              ) : usersById?.clientCode ? (
                <strong>{usersById.clientCode}</strong>
              ) : (
                <strong>N/A</strong>
              )}
            </div>
          </div>

          <div className="col-12 col-md">
            <div className="border p-3 rounded d-md-none">
              UTM Source:{" "}
              {usersById?.referredBy &&
              Object.keys(usersById.referredBy).length > 0 ? (
                <strong>
                  {getRoleDisplay(usersById.referredBy.role)}:{" "}
                  {getFullName(usersById.referredBy.name)},{" "}
                  {usersById.referredBy.mobile || "N/A"} <br />
                  (Emp Code: {usersById.referredBy.employeeId || "N/A"})
                </strong>
              ) : (
                <strong>Web</strong>
              )}
            </div>
            <div className="border p-3 rounded-end d-none d-md-block">
              UTM Source:{" "}
              {usersById?.referredBy &&
              Object.keys(usersById.referredBy).length > 0 ? (
                <strong>
                  {getRoleDisplay(usersById.referredBy.role)}:{" "}
                  {getFullName(usersById.referredBy.name)},{" "}
                  {usersById.referredBy.mobile || "N/A"} | Emp Code:{" "}
                  {usersById.referredBy.employeeId || "N/A"}
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
                Name as per Bank
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
                {getFullName(usersById?.bankDetails?.name) || (
                  <Skeleton height={20} />
                )}
              </td>
              <td style={{ paddingTop: "16px" }}>
                {usersById?.bankDetails?.bank_account_details
                  ?.account_holder_name || <Skeleton height={20} />}
              </td>
              <td style={{ paddingTop: "16px" }}>
                <div className="p-3 rounded-end d-flex align-items-center">
                  {usersById?.isBankNameMatched ? (
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
                      Matched with NSDL PAN Name
                    </>
                  ) : (
                    <>
                      <XCircle
                        size={18}
                        style={{
                          backgroundColor: "#FF4800",
                          color: "white",
                          borderRadius: "50%",
                          padding: "3px",
                          marginRight: "8px",
                          minWidth: "20px",
                        }}
                      />
                      Name Mismatch with NSDL PAN
                    </>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Correspondence Address */}
      <div className="mt-4 mx-4">
        <div className="d-flex justify-content-start align-items-center gap-3">
          <h4 className="fw-semibold mb-0">Bank Details</h4>
          {((user?.loginName === "Supervisor" && user?.role === "Supervisor") ||
            (user?.loginName === "SO" &&
              user?.role === "Scrutiny Officer")) && (
            <div className="d-flex align-items-center gap-2">
              {!isEditingAddress ? (
                // ✏️ Edit Icon
                <>
                  {" "}
                  <Edit
                    size={20}
                    color="#e74c3c" // blue color
                    title="Edit address"
                    data-tooltip-id="edit-tooltip"
                    data-tooltip-content="Edit"
                    style={{ cursor: "pointer" }}
                    onClick={handleStartEdit}
                  />
                  <Tooltip id="edit-tooltip" />
                </>
              ) : (
                <>
                  {/* 💾 Save Icon */}
                  <Save
                    size={20}
                    color="#198754" // green color
                    title="Save"
                    data-tooltip-id="save-tooltip"
                    data-tooltip-content="Save"
                    style={{ cursor: "pointer", marginRight: "10px" }}
                    onClick={handleSaveEdit}
                  />
                  <Tooltip id="save-tooltip" />
                  {/* ❌ Cancel Icon */}
                  <X
                    size={20}
                    color="#dc3545" // red color
                    title="Cancel"
                    data-tooltip-id="cancel-tooltip"
                    data-tooltip-content="Cancel"
                    style={{ cursor: "pointer" }}
                    onClick={handleCancelEdit}
                  />
                  <Tooltip id="cancel-tooltip" />
                </>
              )}
            </div>
          )}
        </div>
        <form>
          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <label className="form-label">
                Bank Account Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter account number"
                value={
                  usersById?.bankDetails?.bank_account_details
                    ?.account_number || ""
                }
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Bank Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter bank name"
                value={bankDetails.bank_name}
                onChange={(e) =>
                  setBankDetails((prev) => ({
                    ...prev,
                    bank_name: e.target.value,
                  }))
                }
                style={{
                  backgroundColor: isEditingAddress ? "" : "#f5f5f5",
                  cursor: isEditingAddress ? "text" : "not-allowed",
                }}
                readOnly={!isEditingAddress}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Bank Account Type <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter account type"
                value={
                  usersById?.bankDetails?.bank_account_details?.account_type ||
                  ""
                }
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>

          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <label className="form-label">
                IFSC <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter IFSC code"
                value={
                  usersById?.bankDetails?.bank_account_details?.ifsc_code || ""
                }
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                MICR <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter MICR code"
                value={bankDetails.micr_code}
                onChange={(e) =>
                  setBankDetails((prev) => ({
                    ...prev,
                    micr_code: e.target.value,
                  }))
                }
                style={{
                  backgroundColor: isEditingAddress ? "" : "#f5f5f5",
                  cursor: isEditingAddress ? "text" : "not-allowed",
                }}
                readOnly={!isEditingAddress}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Branch Details <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter branch name"
                value={
                  usersById?.bankDetails?.bank_account_details?.branch || ""
                }
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>

          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter bank address"
                value={bankDetails.address}
                onChange={(e) =>
                  setBankDetails((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                style={{
                  backgroundColor: isEditingAddress ? "" : "#f5f5f5",
                  cursor: isEditingAddress ? "text" : "not-allowed",
                }}
                readOnly={!isEditingAddress}
              />
            </div>
          </div>
        </form>

        {usersById?.bank_proof_file && (
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Bank Proof</h5>
              {usersById?.bank_proof_date && (
                <span className="text-muted small">
                  Uploaded on: {usersById.bank_proof_date}
                </span>
              )}
            </div>
            <div
              className="rounded border border-dark w-100 w-md-auto mb-2"
              style={{
                height: "250px",
                maxWidth: "400px",
                backgroundColor: "#f8f9fa",
              }}
            >
              <div
                className="rounded border border-dark w-100 w-md-auto"
                style={{
                  height: "250px",
                  maxWidth: "400px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                {(() => {
                  const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/${usersById.bank_proof_file}`;
                  const ext = fileUrl.split(".").pop().toLowerCase();

                  if (ext === "pdf") {
                    const pdfUrlWithParams = `${fileUrl}#view=FitH&toolbar=0`;
                    return (
                      <div
                        onClick={() => openViewer(pdfUrlWithParams, "pdf")}
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          cursor: "zoom-in",
                          background: "#111",
                        }}
                      >
                        <div
                          style={{
                            width: "45%",
                            aspectRatio: "1 / 1.414",
                            background: "#fff",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                          }}
                        >
                          <iframe
                            src={pdfUrlWithParams}
                            title="PDF Preview"
                            width="100%"
                            height="100%"
                            style={{
                              border: "none",
                              pointerEvents: "none",
                            }}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (["jpg", "jpeg", "png"].includes(ext)) {
                    return (
                      <img
                        src={fileUrl}
                        alt="Bank Proof"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          cursor: "zoom-in",
                        }}
                        onClick={() => openViewer(fileUrl, "image")}
                      />
                    );
                  }

                  return (
                    <p className="text-center mt-5">Unsupported file format</p>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Viewer modal */}
      {viewerOpen && viewerFile && (
        <PdfImageViewer
          show={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setViewerFile(null);
          }}
          fileUrl={viewerFile.url}
          fileType={viewerFile.type}
        />
      )}

      {/* Action Buttons */}
      {(user?.role === "Supervisor" || user?.role === "Scrutiny Officer") &&
        !actionTaken &&
        usersById.bankApproval?.status !== "rejected" &&
        (usersById.bankApproval?.status !== "approved" ||
          usersById?.bankApproval?.autoApproved) && (
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
    </>
  );
};

export default BankPage;

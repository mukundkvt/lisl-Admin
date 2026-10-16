"use client";

import { Check, LucideUpload, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import styles from "./signature.module.css";
import RejectModal from "@/components/RejectModal/RejectModal";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import ApproveRejectButtons from "@/components/ApproveRejectButtons";
import Breadcrumb from "@/components/Breadcrumb";
import formatFunDate from "@/utils/convertISODate";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import getRoleDisplay from "@/components/WordShort";
import { getNextPendingTab } from "@/utils/getNextPendingTab";
import { useApprovalMutation } from "@/hooks/useApprovalStatus";

const Signature = () => {
  const [token, setToken] = useState(null);
  const { id } = useParams();
  const [usersById, setUsersById] = useState([]);
  const [user, setUser] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [actionTaken, setActionTaken] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(null);
  const approvalMutation = useApprovalMutation(id);
  const router = useRouter();

  const reasons = [
    "Signature mismatch with PAN card",
    "Provide clear signature on white paper with blue or black ink",
    "Signature image is blurred, faint, cropped, or cut off",
    "Initials signed instead of full signature matching PAN card",
    "Digital signature mismatch or incomplete",
  ];

  const getFullName = (nameObj) => {
    if (!nameObj) return "";
    if (typeof nameObj === "string") return nameObj;
    return nameObj.fullName || "";
  };

  if (!usersById) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  const EsignUserById = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/details/digital-signature/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setPendingApproval(res.data?.digitalSignApproval?.status);
      setUsersById(res.data);
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
        section: "digitalSign",
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
        section: "digitalSign",
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

  const handleDownload = async (url, filename) => {
    try {
      console.log(url);
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // agar auth chaiye
        },
      });

      const blob = await response.blob(); // file ko blob me convert karo
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
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
        title="Digital Signature"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile", href: "#" },
          {
            label: `${getFullName(usersById?.nameAsPerAddressProof) || getFullName(usersById?.digitalSignature?.name) || "User"} - Digital Signature`,
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
                  usersById.digitalSignApproval?.status === "rejected"
                    ? "#FFEDED"
                    : "#F3FFEB",
                color:
                  usersById.digitalSignApproval?.status === "rejected"
                    ? "#FF4800"
                    : "#4EB800",
                border:
                  usersById.digitalSignApproval?.status === "rejected"
                    ? "1px solid #FF0000"
                    : "1px solid #4EB800",
                fontWeight: 600,
                padding:
                  usersById.digitalSignApproval?.status === "rejected"
                    ? ""
                    : "10px 12px",
                fontSize: "14px",
              }}
            >
              {usersById?.digitalSignApproval?.autoApproved
                ? `Auto approved on ${formatFunDate(
                    usersById?.digitalSignApproval?.approveAt,
                  )}`
                : usersById.digitalSignApproval?.status === "rejected"
                  ? `RejectedBy ${
                      usersById?.digitalSignApproval?.rejectedBy?.name
                    } on ${formatFunDate(
                      usersById?.digitalSignApproval?.rejectedAt,
                    )}`
                  : `ApprovedBy ${
                      usersById?.digitalSignApproval?.approveBy?.name
                    } on ${formatFunDate(
                      usersById?.digitalSignApproval?.approveAt,
                    )}`}
              {usersById.digitalSignApproval?.status === "rejected" && (
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
                  title={usersById.digitalSignApproval?.rejectionReason} // full reason on hover
                >
                  Reason: {usersById.digitalSignApproval?.rejectionReason}
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
                  {usersById.referredBy.name},{" "}
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
                  {usersById.referredBy.name},{" "}
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
        <table className="table align-middle w-100 table-fixed custom-table">
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
                {usersById?.digitalSignature?.panDetails?.name ||
                  getFullName(usersById?.digitalSignature?.name) || (
                    <Skeleton height={20} />
                  )}
              </td>
              <td style={{ paddingTop: "16px" }}>
                {getFullName(usersById?.digitalSignature?.name) || (
                  <Skeleton height={20} />
                )}
              </td>
              <td style={{ paddingTop: "16px" }}>
                {getFullName(usersById?.nameAsPerAddressProof) ||
                  getFullName(usersById?.digitalSignature?.name) || (
                    <Skeleton height={20} />
                  )}
              </td>
              <td style={{ paddingTop: "16px" }}>
                <div className="p-3 rounded-end d-flex align-items-center">
                  {usersById?.isNameMatchPAN ? (
                    <>
                      <Check
                        size={18}
                        style={{
                          backgroundColor: "#56CA00",
                          color: "white",
                          borderRadius: "50%",
                          padding: "3px",
                          marginRight: "8px", // space between icon and text
                          minWidth: "20px",
                        }}
                      />
                      Matched with NSDL PAN Name
                    </>
                  ) : (
                    <>
                      <X
                        size={18}
                        style={{
                          backgroundColor: "#FF0000",
                          color: "white",
                          borderRadius: "50%",
                          padding: "3px",
                          marginRight: "8px", // space between icon and text
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

      <div className="mx-4 mt-5">
        {/* Row 1 */}
        <div className="row mb-4">
          <div className="col-md-4 text-center">
            <h6 className={`fw-semibold ${styles.sectionTitle}`}>
              Digital Sign by Client
            </h6>
            <p className="mb-0">
              {usersById?.digitalSignature?.digitalSignatureContract
                ?.signedByClient
                ? "Yes"
                : "No"}
            </p>
          </div>

          <div className="col-md-4 text-center">
            <h6 className={`fw-semibold ${styles.sectionTitle}`}>
              Final Mail Sent to client with attachments
            </h6>
            <p className="mb-0">
              {usersById?.digitalSignature?.digitalSignatureContract?.mailSent
                ? "Yes"
                : "No"}
            </p>
          </div>

          <div className="col-md-4 text-center">
            <h6 className={`fw-semibold ${styles.sectionTitle}`}>
              Download AOF PDF
            </h6>
            {usersById?.digitalSignature?.digitalSignatureContract
              ?.signedByClient ? (
              <button
                className="btn btn-outline-secondary fw-semibold px-3 py-2 rounded"
                onClick={() =>
                  handleDownload(
                    `${process.env.NEXT_PUBLIC_API_URL}/${usersById?.digitalSignature?.digitalSignatureContract?.signedPdf}`,
                    "AOF.pdf",
                  )
                }
              >
                Download Application Form
              </button>
            ) : (
              <button
                className="btn btn-outline-secondary fw-semibold px-3 py-2 rounded"
                disabled
              >
                Not Signed
              </button>
            )}
          </div>
        </div>

        {/* Row 2 */}
        <div className="row">
          <div className="col-md-4 text-center">
            <h6 className={`fw-semibold ${styles.sectionTitle}`}>
              Download Annexure J
            </h6>
            {usersById?.digitalSignature?.digitalSignatureContract
              ?.AnnexureJ ? (
              <button
                className="btn btn-outline-secondary fw-semibold px-3 py-2 rounded"
                onClick={() =>
                  handleDownload(
                    `${process.env.NEXT_PUBLIC_API_URL}/${usersById?.digitalSignature?.digitalSignatureContract?.AnnexureJ}`,
                    "Annexure.pdf",
                  )
                }
              >
                Annexure J
              </button>
            ) : (
              <button
                className="btn btn-outline-secondary fw-semibold px-3 py-2 rounded"
                disabled
              >
                Not Signed
              </button>
            )}
          </div>

          <div className="col-md-4 text-center">
            <h6 className={`fw-semibold ${styles.sectionTitle}`}>
              DigiLocker XML
            </h6>
            <button
              className="btn btn-dark fw-semibold px-3 py-2 rounded"
              onClick={() =>
                handleDownload(
                  `${process.env.NEXT_PUBLIC_API_URL}/${usersById?.digitalSignature?.aadhaarXML}`,
                  "aadhaar.xml",
                )
              }
            >
              XML
            </button>
          </div>

          <div className="col-md-4 text-center"></div>
        </div>
      </div>

      {/* Action Buttons */}
      {usersById?.digitalSignature?.digitalSignatureContract?.signedByClient &&
        (user?.role === "Supervisor" || user?.role === "Scrutiny Officer") &&
        !actionTaken &&
        usersById.digitalSignApproval?.status !== "rejected" &&
        (usersById.digitalSignApproval?.status !== "approved" ||
          usersById?.digitalSignApproval?.autoApproved) && (
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

export default Signature;

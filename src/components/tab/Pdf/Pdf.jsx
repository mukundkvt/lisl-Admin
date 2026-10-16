"use client";

import { Check, LucideUpload, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import styles from "./pdf.module.css";
import RejectModal from "@/components/RejectModal/RejectModal";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Breadcrumb from "@/components/Breadcrumb";
import getRoleDisplay from "@/components/WordShort";
import { getNextPendingTab } from "@/utils/getNextPendingTab";
import { useApprovalMutation } from "@/hooks/useApprovalStatus";

const Pdf = () => {
  const [token, setToken] = useState(null);
  const { id } = useParams();
  const [usersById, setUsersById] = useState([]);
  const [user, setUser] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [actionTaken, setActionTaken] = useState(false);
  const approvalMutation = useApprovalMutation(id);
  const router = useRouter();
  const reasons = [
    "Client name mismatch with Aadhar and Pan card, we can not process through EKYC",
    "Provide clear self attested aadhar card-front & back on same page",
    "Name as per PAN records and Aadhaar records is differing completely. Hence, cannot process the application.",
  ];
  if (!usersById) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  const EsignUserById = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/details/pdf-generation/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setUsersById(res.data);
      console.log("oye", res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleApprove = async () => {
    try {
      await approvalMutation.mutateAsync({
        status: "approved",
        section: "pdf",
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
        section: "pdf",
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
    console.log("h", url);
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
  return (
    <>
      <Breadcrumb
        title="PDF Generation"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile", href: "#" },
          {
            label: "PDF Generation",
          },
        ]}
      />

      <div
        className="d-flex flex-row justify-content-end mt-3 align-items-center gap-2 p-3"
        style={{ backgroundColor: "" }}
      >
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
          Auto approved on 11 Jul 2025 at 3:08 PM
        </button>

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
              {usersById?.kycType || "N/A"} based account opening
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
              <strong>{usersById?.clientCode || "N/A"}</strong>
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

      <div className="mx-4 mt-5">
        {/* Row 1 */}
        <div className="row mb-4">
          <div className="col-md-3">
            <h6 className={`fw-semibold ${styles.sectionTitle}`}>
              Client Entered Name
            </h6>
            <p className="mb-0">
              {usersById?.pdfGeneration_details?.name?.fullName || "N/A"}
            </p>
          </div>

          <div className="col-md-3">
            <h6 className={`fw-semibold ${styles.sectionTitle}`}>
              PDF's Generated
            </h6>
            <p className="mb-0">
              {usersById?.pdfGeneration_details?.digitalSignatureContract
                ?.generatedPdf
                ? "Yes"
                : "No"}
            </p>
          </div>

          <div className="col-md-3">
            <h6 className={`fw-semibold ${styles.sectionTitle}`}>
              Digital Sign by Client
            </h6>
            <p className="mb-0">
              {usersById?.pdfGeneration_details?.digitalSignatureContract
                ?.signedByClient
                ? "Yes"
                : "No"}
            </p>
          </div>

          <div className="col-md-3">
            <h6 className={`fw-semibold ${styles.sectionTitle}`}>
              Final Mail Sent to client with attachments
            </h6>
            <p className="mb-0">
              {usersById?.pdfGeneration_details?.digitalSignatureContract
                ?.mailSent
                ? "Yes"
                : "No"}
            </p>
          </div>
        </div>

        {/* Row 2 */}
        <div className="row">
          <div className="col-md-3">
            <h6 className={`fw-semibold ${styles.sectionTitle}`}>Pan No.</h6>
            <p className="mb-0">
              {usersById?.pdfGeneration_details?.PAN || "N/A"}
            </p>
          </div>

          <div className="col-md-3">
            <h6 className={`fw-semibold ${styles.sectionTitle}`}>
              Download PDF's
            </h6>

            {usersById?.pdfGeneration_details?.digitalSignatureContract
              ?.signedByClient ? (
              <button
                className="btn btn-outline-secondary fw-semibold px-3 py-2 rounded"
                onClick={() =>
                  handleDownload(
                    `${process.env.NEXT_PUBLIC_API_URL}/${usersById?.pdfGeneration_details?.digitalSignatureContract?.signedPdf}`,
                    "signed.pdf",
                  )
                }
              >
                Download Signed PDF
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
      </div>
    </>
  );
};

export default Pdf;

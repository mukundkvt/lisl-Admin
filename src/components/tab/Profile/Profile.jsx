"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import styles from "./profile.module.css";
import { Check, Edit, LucideUpload, Save, X, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import RejectModal from "@/components/RejectModal/RejectModal";
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
import { Eye } from "lucide-react";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const ProfilePage = () => {
  const [isChecked, setIsChecked] = useState(false);
  const { id } = useParams();
  const [token, setToken] = useState(null);
  const [usersById, setUsersById] = useState({});
  const [user, setUser] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [actionTaken, setActionTaken] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(null);
  const [address, setAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    city: "",
  });
  const [hover, setHover] = useState(false);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [originalAddress, setOriginalAddress] = useState(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState(null);
  const approvalMutation = useApprovalMutation(id);

  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const openViewer = (url, type) => {
    setViewerFile({ url, type });
    setViewerOpen(true);
  };

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
      else setUser({});
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const reasons = [
    "Client name mismatch with Aadhaar and PAN card",
    "Father's / Mother's name mismatch or missing",
    "Date of birth mismatch between documents",
    "PAN details invalid or name mismatch as per Income Tax records",
    "Provide clear self attested Aadhaar card - front & back on same page",
    "Name as per PAN records and Aadhaar records is differing completely. Hence, cannot process the application.",
  ];

  const handleApprove = async () => {
    try {
      await approvalMutation.mutateAsync({
        status: "approved",
        section: "profile",
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
        section: "profile",
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

  const profileEdit = async () => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/manageuser/${id}/address`,
        address,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success("Address updated successfully");
      EsignUserById();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to update address");
      return false;
    }
  };

  const EsignUserById = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/details/profile/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setPendingApproval(res.data?.profileApproval?.status);
      setUsersById(res.data);
      // Debug: Log father/spouse related data
      console.log(
        "Father/Spouse Type:",
        res.data?.userProfile?.fatherSpouseType,
      );
      console.log("Father Name:", res.data?.userProfile?.fatherName);
      console.log("Father Prefix:", res.data?.userProfile?.fatherName?.prefix);
      console.log("Full usersById:", res.data);
      setLoading(false);
      const fetchedAddress = {
        addressLine1: res.data?.userProfile?.address?.addressLine1 || "",
        addressLine2: res.data?.userProfile?.address?.addressLine2 || "",
        addressLine3: res.data?.userProfile?.address?.addressLine3 || "",
        city: res.data?.userProfile?.address?.city || "",
      };
      setAddress(fetchedAddress);
      setOriginalAddress(fetchedAddress); // keep snapshot for cancel
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleStartEdit = () => {
    setOriginalAddress({ ...address }); // snapshot
    setIsEditingAddress(true);
  };

  const handleCancelEdit = () => {
    if (originalAddress) {
      setAddress(originalAddress);
    } else {
      // fallback to server data
      setAddress({
        addressLine1: usersById?.userAddress?.address?.addressLine1 || "",
        addressLine2: usersById?.userAddress?.address?.addressLine2 || "",
        addressLine3: usersById?.userAddress?.address?.addressLine3 || "",
        city: usersById?.userAddress?.address?.city || "",
      });
    }
    setIsEditingAddress(false);
  };

  const handleSaveEdit = async () => {
    const ok = await profileEdit();
    if (ok) {
      setOriginalAddress({ ...address });
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
  const getFullName = (nameObj) => {
    if (!nameObj) return "";
    if (typeof nameObj === "string") return nameObj;
    return nameObj.fullName || "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getIncomeLabel = (value) => {
    if (!value) return "";
    const incomeMap = {
      below1lakh: "Below 1 lakh",
      belowOneLakh: "Below 1 lakh",
      "below-1-lakh": "Below 1 lakh",
      below1Lac: "Below 1 lakh",
      below1lac: "Below 1 lakh",

      oneToFiveLakhs: "1-5 lakhs",
      "1-5lakh": "1-5 lakhs",
      "1-5lakhs": "1-5 lakhs",
      oneToFive: "1-5 lakhs",
      "1-5Lac": "1-5 lakhs",
      "1-5lac": "1-5 lakhs",

      fiveToTenLakhs: "5-10 lakhs",
      "5-10lakh": "5-10 lakhs",
      "5-10lakhs": "5-10 lakhs",
      fiveToTen: "5-10 lakhs",
      "5-10Lac": "5-10 lakhs",
      "5-10lac": "5-10 lakhs",

      tenToTwentyFiveLakhs: "10-25 lakhs",
      "10-25lakh": "10-25 lakhs",
      "10-25lakhs": "10-25 lakhs",
      tenToTwentyFive: "10-25 lakhs",
      "10-25Lac": "10-25 lakhs",
      "10-25lac": "10-25 lakhs",

      aboveTwentyFiveLakhs: "> 25 lakhs",
      above25lakh: "> 25 lakhs",
      above25lakhs: "> 25 lakhs",
      "above-25-lakhs": "> 25 lakhs",
      greaterThan25Lakhs: "> 25 lakhs",
      above25Lac: "> 25 lakhs",
      above25lac: "> 25 lakhs",
      ">25lakhs": "> 25 lakhs",
    };
    return incomeMap[value] || value || "";
  };

  const getTradingExpLabel = (value) => {
    if (!value) return "";
    const expMap = {
      "1-5-years": "1-5 Years",
      "greater-than-5-years": "> 5 Years",
      nil: "Nil",
      noExperience: "Nil",
      none: "Nil",
    };
    return expMap[value] || value || "";
  };

  const getOccupationLabel = (value) => {
    const occupationMap = {
      privateSector: "Private Sector",
      publicSector: "Public Sector",
      governmentService: "Government Service",
      business: "Business",
      professional: "Professional",
      agriculturist: "Agriculturist",
      retired: "Retired",
      houseWife: "House Wife",
      housewife: "House Wife",
      student: "Student",
      others: "Others",
    };
    return occupationMap[value] || value || "";
  };

  console.log(usersById);
  return (
    <>
      <Breadcrumb
        title="Profile Stage"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile", href: "#" },
          {
            label: `${getFullName(usersById?.nameAsPerAddressProof) || getFullName(usersById?.userProfile?.name) || "User"} - Profile Stage`,
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
                  usersById.profileApproval?.status === "rejected"
                    ? "#FFEDED"
                    : "#F3FFEB",
                color:
                  usersById.profileApproval?.status === "rejected"
                    ? "#FF4800"
                    : "#4EB800",
                border:
                  usersById.profileApproval?.status === "rejected"
                    ? "1px solid #FF0000"
                    : "1px solid #4EB800",
                fontWeight: 600,
                padding:
                  usersById.profileApproval?.status === "rejected"
                    ? ""
                    : "10px 12px",
                fontSize: "14px",
              }}
            >
              {usersById?.profileApproval?.autoApproved
                ? `Auto approved on ${formatFunDate(
                    usersById?.profileApproval?.approveAt,
                  )}`
                : usersById.profileApproval?.status === "rejected"
                  ? `RejectedBy ${getFullName(usersById?.profileApproval?.rejectedBy?.name)} on ${formatFunDate(usersById?.profileApproval?.rejectedAt)}`
                  : `ApprovedBy ${getFullName(usersById?.profileApproval?.approveBy?.name)} on ${formatFunDate(usersById?.profileApproval?.approveAt)}`}
              {usersById?.profileApproval?.status === "rejected" && (
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
                  title={usersById.profileApproval?.rejectionReason} // full reason on hover
                >
                  Reason: {usersById.profileApproval?.rejectionReason}
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
                {getFullName(usersById?.userProfile?.name) || (
                  <Skeleton height={20} />
                )}
              </td>
              <td style={{ paddingTop: "16px" }}>
                {getFullName(usersById?.userProfile?.name) || (
                  <Skeleton height={20} />
                )}
              </td>
              <td style={{ paddingTop: "16px" }}>
                {getFullName(usersById?.nameAsPerAddressProof) || (
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
      {/* Personal Information */}
      <div className="mt-4 mx-4">
        <div className="d-flex justify-content-start align-items-center gap-3">
          <h4 className="fw-semibold mb-0">Personal Information</h4>
          {((user?.loginName === "Supervisor" && user?.role === "Supervisor") ||
            (user?.loginName === "SO" &&
              user?.role === "Scrutiny Officer")) && (
            <div className="d-flex align-items-center gap-2">
              {!isEditingAddress ? (
                // ✏️ Edit Icon
                <>
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
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter Name"
                value={getFullName(usersById?.userProfile?.name)}
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Gender <span className="text-danger">*</span>
              </label>
              <select
                className="form-select p-2"
                value={usersById?.userProfile?.gender?.toLowerCase() || ""}
                disabled
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Marital Status <span className="text-danger">*</span>
              </label>
              <select
                className="form-select p-2"
                value={
                  usersById?.userProfile?.maritalStatus?.toLowerCase() || ""
                }
                disabled
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              >
                <option value="">Select Marital Status</option>
                <option value="single">Single</option>
                <option value="unmarried">Unmarried</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
          </div>

          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <label className="form-label">
                Nationality <span className="text-danger">*</span>
              </label>
              <select
                className="form-select p-2"
                value={
                  usersById?.userProfile?.nationality?.toLowerCase() || "indian"
                }
                disabled
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              >
                <option value="">Select</option>
                <option value="indian">Indian</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Residential Status <span className="text-danger">*</span>
              </label>
              <select
                className="form-select p-2"
                value={
                  usersById?.userProfile?.residentialStatus?.toLowerCase() ||
                  "resident"
                }
                disabled
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              >
                <option value="">Select</option>
                <option value="resident">Resident Individual</option>
                <option value="nri">NRI</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control p-2"
                placeholder="Enter email"
                value={usersById?.email || ""}
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Mobile <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Mobile Number"
                value={usersById?.userProfile?.mobileNumber || ""}
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">
                DOB <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="DD/MM/YYYY"
                value={formatDate(usersById?.userProfile?.dateOfBirth)}
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">PAN</label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="PAN Number"
                value={usersById?.PAN || ""}
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">Father/Spouse name</label>
              <div className="d-flex gap-4 mt-1">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="fatherSpouse"
                    id="father"
                    checked={
                      // If fatherSpouseType is undefined but fatherName exists, assume Father
                      usersById?.userProfile?.fatherSpouseType
                        ? String(
                            usersById.userProfile.fatherSpouseType,
                          ).toLowerCase() === "father"
                        : !!usersById?.userProfile?.fatherName
                    }
                    readOnly
                  />
                  <label className="form-check-label" htmlFor="father">
                    Father
                  </label>
                </div>

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="fatherSpouse"
                    id="spouse"
                    checked={
                      // If fatherSpouseType is undefined but fatherName exists, assume Father (so Spouse is false)
                      usersById?.userProfile?.fatherSpouseType
                        ? String(
                            usersById.userProfile.fatherSpouseType,
                          ).toLowerCase() === "spouse"
                        : !usersById?.userProfile?.fatherName
                    }
                    readOnly
                  />
                  <label className="form-check-label" htmlFor="spouse">
                    Spouse
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">Father/Spouse Prefix</label>
              <select
                className="form-select p-2"
                value={String(
                  usersById?.userProfile?.fatherName?.prefix || "mr",
                ).toLowerCase()}
                disabled
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              >
                <option value="">Select</option>
                <option value="mr">Mr</option>
                <option value="mrs">Mrs</option>
                <option value="ms">Ms</option>
              </select>
            </div>

            <div className="col-md-9">
              <label className="form-label">Father/Spouse Name</label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter father/spouse name"
                value={getFullName(usersById?.userProfile?.fatherName)}
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">Mother Prefix Name</label>
              <select
                className="form-select p-2"
                value={
                  usersById?.userProfile?.motherName?.prefix?.toLowerCase() ||
                  usersById?.userProfile?.motherPrefix?.toLowerCase() ||
                  "mrs"
                }
                disabled
                style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
              >
                <option value="">Select</option>
                <option value="mr">Mr</option>
                <option value="mrs">Mrs</option>
                <option value="ms">Ms</option>
              </select>
            </div>

            <div className="col-md-9">
              <label className="form-label">Mother Name</label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Mother name"
                value={getFullName(usersById?.userProfile?.motherName)}
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>
        </form>
      </div>
      <div className="mx-4 mt-4">
        <h4 className="fw-bold mb-1">PAN</h4>
        <p className="text-muted mb-3">(Fetched from Digilocker)</p>
        <div
          className="rounded border border-gray-900 w-100 w-md-auto mb-2"
          style={{
            height: "250px",
            maxWidth: "400px",
            backgroundColor: "#f8f9fa",
          }}
        >
          {usersById?.PAN_file && (
            <div
              className="rounded border border-gray-900 w-100 w-md-auto"
              style={{
                height: "250px",
                maxWidth: "400px",
                backgroundColor: "#f8f9fa",
              }}
            >
              {(() => {
                const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/${usersById.PAN_file}`;
                const ext = fileUrl.split(".").pop().toLowerCase();

                if (ext === "pdf") {
                  const pdfUrlWithParams = `${fileUrl}#view=FitH&toolbar=0`;
                  return (
                    <div
                      onClick={() => openViewer(pdfUrlWithParams, "pdf")}
                      onMouseEnter={() => setHover(true)}
                      onMouseLeave={() => setHover(false)}
                      style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        overflow: "hidden",
                        cursor: "pointer",
                        // borderRadius: "18px",
                        background:
                          "linear-gradient(145deg, #f8fbff 0%, #eef4fb 100%)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        padding: "14px 14px 10px",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "380px",
                          borderRadius: "16px",
                          overflow: "hidden",
                          background: "#fff",
                          boxShadow: hover
                            ? "0 24px 60px rgba(15,23,42,.24)"
                            : "0 14px 32px rgba(15,23,42,.12)",
                          transition: "all .35s cubic-bezier(.22,1,.36,1)",
                          transform: hover
                            ? "translateY(-2px) scale(1.01)"
                            : "translateY(0) scale(1)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "flex-start",
                          paddingTop: "8px",
                        }}
                      >
                        <Document
                          file={fileUrl}
                          onLoadSuccess={onDocumentLoadSuccess}
                          loading={
                            <div
                              style={{
                                width: 360,
                                height: 480,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: "#64748b",
                              }}
                            >
                              Loading preview...
                            </div>
                          }
                        >
                          <Page
                            pageNumber={1}
                            width={340}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                          />
                        </Document>
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "column",
                          padding: "18px",
                          opacity: hover ? 1 : 0,
                          transition: "all .35s cubic-bezier(.22,1,.36,1)",
                          background: hover
                            ? "linear-gradient(180deg, rgba(2,6,23,.16) 0%, rgba(2,6,23,.72) 100%)"
                            : "linear-gradient(180deg, rgba(2,6,23,.03) 0%, rgba(2,6,23,.12) 100%)",
                          backdropFilter: hover ? "blur(8px)" : "blur(0px)",
                        }}
                      >
                        <div
                          style={{
                            width: 86,
                            height: 86,
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,247,250,0.96) 100%)",
                            border: "1px solid rgba(255,255,255,0.7)",
                            backdropFilter: "blur(14px)",
                            WebkitBackdropFilter: "blur(14px)",
                            boxShadow: hover
                              ? "0 24px 45px rgba(15,23,42,.24), 0 10px 20px rgba(37,99,235,.16), inset 0 1px 0 rgba(255,255,255,.95)"
                              : "0 12px 28px rgba(15,23,42,.16), inset 0 1px 0 rgba(255,255,255,.9)",
                            transform: hover
                              ? "translateY(-3px) scale(1)"
                              : "translateY(10px) scale(.9)",
                            opacity: hover ? 1 : 0,
                            transition: "all .35s cubic-bezier(.22,1,.36,1)",
                          }}
                        >
                          <Eye size={34} strokeWidth={2.2} color="#2563EB" />
                        </div>

                        <div
                          style={{
                            marginTop: 14,
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 15,
                            letterSpacing: "0.2px",
                          }}
                        >
                          Open Full Preview
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            color: "rgba(255,255,255,.88)",
                            fontSize: 12.5,
                            textAlign: "center",
                            maxWidth: "220px",
                          }}
                        >
                          View this document in a cleaner full-screen layout
                        </div>
                      </div>
                    </div>
                  );
                }

                if (["jpg", "jpeg", "png"].includes(ext)) {
                  return (
                    <img
                      src={fileUrl}
                      alt="PAN File"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  );
                }

                return (
                  <p className="text-center mt-5">Unsupported file format</p>
                );
              })()}
            </div>
          )}
        </div>
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
      <div className="mt-4 mx-4">
        <div className="d-flex justify-content-start align-items-center gap-3">
          <h4 className="fw-semibold mb-0">Other Information</h4>
          {((user?.loginName === "Supervisor" && user?.role === "Supervisor") ||
            (user?.loginName === "SO" &&
              user?.role === "Scrutiny Officer")) && (
            <div className="d-flex align-items-center gap-2">
              {!isEditingAddress ? (
                // ✏️ Edit Icon
                <>
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

        <div className="row mb-3 mt-4">
          <div className="col-md-3">
            <label className="form-label">
              Income <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control p-2"
              placeholder="Income"
              value={getIncomeLabel(usersById?.userProfile?.annualIncome)}
              readOnly
              style={{
                backgroundColor: "#f5f5f5",
                cursor: "not-allowed",
              }}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">
              Occupation <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control p-2"
              placeholder="Occupation"
              value={getOccupationLabel(usersById?.userProfile?.occupation)}
              readOnly
              style={{
                backgroundColor: "#f5f5f5",
                cursor: "not-allowed",
              }}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">
              Trading Experience <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control p-2"
              placeholder="Enter trading experience"
              value={getTradingExpLabel(usersById?.userProfile?.tradingExperience)}
              readOnly
              style={{
                backgroundColor: "#f5f5f5",
                cursor: "not-allowed",
              }}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">
              Education Qualification <span className="text-danger">*</span>
            </label>
            <select
              className="form-select p-2"
              value={usersById?.userProfile?.qualification?.toLowerCase() || ""}
              disabled
              style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
            >
              <option value="">Select</option>
              <option value="ssc">SSC</option>
              <option value="hsc">HSC</option>
              <option value="diploma">Diploma</option>
              <option value="bachelor">Bachelor</option>
              <option value="master">Master</option>
              <option value="phd">PhD</option>
              <option value="graduate">Graduate</option>
              <option value="postgraduate">Post Graduate</option>
              <option value="professional">Professional</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-12">
            <h5 className="text-primary">Indian resident</h5>
            <div className="d-flex gap-4 mt-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="indianResident"
                  checked={true}
                  readOnly
                />
                <label className="form-check-label">Yes</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="indianResident"
                  checked={false}
                  readOnly
                />
                <label className="form-check-label">No</label>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className="row mb-3">
          <div className="col-md-12">
            <h5 className="fw text-primary">Nomination</h5>
            <div className="d-flex gap-4 mt-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="nomination"
                  checked={usersById?.userProfile?.nominees?.length > 0}
                  readOnly
                />
                <label className="form-check-label">Yes</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="nomination"
                  checked={
                    !usersById?.userProfile?.nominees?.length ||
                    usersById?.userProfile?.nominees?.length === 0
                  }
                  readOnly
                />
                <label className="form-check-label">No</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      {usersById?.userProfile?.nominees?.length > 0 ? (
        usersById.userProfile.nominees.map((nominee, index) => (
          <React.Fragment key={index}>
            <div className="p-2 mb-3 mx-4" style={{ background: "#fff5ee" }}>
              <div className="d-flex justify-content-between">
                <span className="text-gray text-decoration-underline">
                  Nominee #{index + 1}
                </span>
                <span className="text-primary text-decoration-underline">
                  Share ({nominee.sharePercentage}%)
                </span>
              </div>
            </div>
            <div className="border rounded p-3 mb-4 mx-4">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Nominee name</label>
                  <input
                    className="form-control p-2"
                    readOnly
                    value={getFullName(nominee.name) || "N/A"}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Nominee PAN</label>
                  <input
                    className="form-control p-2"
                    readOnly
                    value={nominee.identityNumber || "N/A"}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Relationship</label>
                  <input
                    className="form-control p-2"
                    readOnly
                    value={nominee.relation || "N/A"}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Is nominee minor?</label>
                  <input
                    className="form-control p-2"
                    readOnly
                    value={nominee.guardian?.name ? "Yes" : "No"}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Date of Birth</label>
                  <input
                    className="form-control p-2"
                    readOnly
                    value={
                      `${nominee.dob?.day}/${nominee.dob?.month}/${nominee.dob?.year}` ||
                      "N/A"
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Nomination share</label>
                  <input
                    className="form-control p-2"
                    readOnly
                    value={`${nominee.sharePercentage}%` || "N/A"}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Nomination Proof</label>
                  <input
                    className="form-control p-2"
                    readOnly
                    value={nominee.identityNumber || "N/A"}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Nomination Proof Type</label>
                  <input
                    className="form-control p-2"
                    readOnly
                    value={nominee.identityType || "N/A"}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Nomination Email</label>
                  <input
                    className="form-control p-2"
                    readOnly
                    value={nominee.email || "N/A"}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Nomination Mobile</label>
                  <input
                    className="form-control p-2"
                    readOnly
                    value={nominee.mobile || "N/A"}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Proof Identity Type</label>
                  <input
                    className="form-control p-2"
                    readOnly
                    value={nominee.identityType || "N/A"}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control p-2"
                    rows="2"
                    readOnly
                    value={`${nominee.address?.addressLine1} ${nominee.address?.addressLine2} ${nominee.address?.city} ${nominee.address?.state} ${nominee.address?.pincode}`}
                  />
                </div>
              </div>

              {/* Guardian Details if Minor */}
              {nominee.guardian?.name && (
                <div className="mt-3 p-3 border rounded bg-light">
                  <h6 className="fw-bold text-primary">Guardian Details</h6>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Guardian Name</label>
                      <input
                        className="form-control p-2"
                        readOnly
                        value={nominee.guardian.name || "N/A"}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Guardian Relation</label>
                      <input
                        className="form-control p-2"
                        readOnly
                        value={nominee.guardian.relation || "N/A"}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Guardian Mobile</label>
                      <input
                        className="form-control p-2"
                        readOnly
                        value={nominee.guardian.mobile || "N/A"}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Guardian Email</label>
                      <input
                        className="form-control p-2"
                        readOnly
                        value={nominee.guardian.email || "N/A"}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <label className="form-label">Guardian Address</label>
                      <textarea
                        className="form-control p-2"
                        rows="2"
                        readOnly
                        value={`${nominee.guardian.address?.addressLine1 || ""} ${nominee.guardian.address?.addressLine2 || ""} ${nominee.guardian.address?.city || ""} ${nominee.guardian.address?.state || ""} ${nominee.guardian.address?.pincode || ""}`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </React.Fragment>
        ))
      ) : (
        <div className="p-3 mx-4 mb-4 border rounded bg-light text-center">
          No nominees added.
        </div>
      )}
      <div className="p-2 mb-2 mx-4">
        <h5 className="fw-bold mb-0">Signature</h5>
      </div>
      <div className="mt-2 mx-4">
        {usersById?.signature_image ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/${usersById.signature_image}`}
            alt="Signature"
            style={{
              width: "280px",
              height: "110px",
              objectFit: "contain",
              border: "1px solid #ddd",
              backgroundColor: "#f5f5f5",
            }}
          />
        ) : (
          <div
            style={{
              width: "280px",
              height: "110px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed #ccc",
              backgroundColor: "#fff",
              color: "#888",
            }}
          >
            Signature is not submitted yet
          </div>
        )}
      </div>
      <div className="p-2 mt-4 mb-2 mx-4">
        <h5 className="fw-bold mb-0">PAN</h5>
      </div>
      <div className="mt-2 mx-4 mb-4">
        {usersById?.PAN_file ? (
          usersById.PAN_file.toLowerCase().endsWith(".pdf") ? (
            <div
              style={{
                width: "640px",
                border: "1px solid #E5E7EB",
                borderRadius: "16px",
                background: "#fff",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,.08)",
              }}
            >
              {/* Header */}
              <div
                className="d-flex justify-content-between align-items-center px-3 py-2"
                style={{
                  background: "#F8FAFC",
                  borderBottom: "1px solid #E5E7EB",
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: 22 }}>📄</span>
                  <div>
                    <div className="fw-semibold">PAN Card PDF</div>
                    <small className="text-muted">
                      {numPages
                        ? `${numPages} Page${numPages > 1 ? "s" : ""}`
                        : "Loading..."}
                    </small>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    openViewer(
                      `${process.env.NEXT_PUBLIC_API_URL}/${usersById.PAN_file}#view=FitH&toolbar=0`,
                      "pdf",
                    )
                  }
                >
                  Full View
                </button>
              </div>

              {/* PDF Preview */}
              <div
                style={{
                  maxHeight: "420px",
                  overflowY: "auto",
                  background: "#EDF2F7",
                  padding: "20px",
                }}
              >
                <Document
                  file={`${process.env.NEXT_PUBLIC_API_URL}/${usersById.PAN_file}`}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" />
                    </div>
                  }
                >
                  {Array.from(new Array(numPages || 0), (_, index) => (
                    <div
                      key={index}
                      className="d-flex justify-content-center mb-4"
                    >
                      <Page
                        pageNumber={index + 1}
                        width={620}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                      />
                    </div>
                  ))}
                </Document>
              </div>
            </div>
          ) : (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}/${usersById.PAN_file}`}
              alt="PAN Card"
              onClick={() =>
                openViewer(
                  `${process.env.NEXT_PUBLIC_API_URL}/${usersById.PAN_file}`,
                  "image",
                )
              }
              style={{
                width: "420px",
                height: "260px",
                objectFit: "contain",
                borderRadius: "16px",
                border: "1px solid #ddd",
                background: "#fff",
                padding: "8px",
                cursor: "zoom-in",
                boxShadow: "0 10px 25px rgba(0,0,0,.08)",
              }}
            />
          )
        ) : (
          <div
            style={{
              width: "420px",
              height: "260px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed #D1D5DB",
              borderRadius: "16px",
              background: "#FAFAFA",
              color: "#6B7280",
            }}
          >
            PAN is not uploaded or generated yet
          </div>
        )}
      </div>
      {/* ((user?.loginName === "Supervisor" && user?.role === "Supervisor") ||
      (user?.loginName === "SO" && user?.role === "Scrutiny Officer")) */}

      {/* Action Buttons */}
      {(user?.role === "Supervisor" || user?.role === "Scrutiny Officer") &&
        !actionTaken &&
        usersById.profileApproval?.status !== "rejected" &&
        (usersById.profileApproval?.status !== "approved" ||
          usersById?.profileApproval?.autoApproved) && (
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

export default ProfilePage;

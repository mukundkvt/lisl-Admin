"use client";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import styles from "./address.module.css";
import {
  Check,
  Download,
  Edit,
  Eye,
  LucideUpload,
  Save,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import RejectModal from "@/components/RejectModal/RejectModal";
import PdfImageViewer from "@/components/PdfImageViewer";
import ApproveRejectButtons from "@/components/ApproveRejectButtons";
import Breadcrumb from "@/components/Breadcrumb";
import formatFunDate from "@/utils/convertISODate";
import { Tooltip } from "react-tooltip";
import getRoleDisplay from "@/components/WordShort";
import ClientCodeBox from "@/components/ClientCodeBox";
import { getNextPendingTab } from "@/utils/getNextPendingTab";
import { useApprovalMutation } from "@/hooks/useApprovalStatus";
import { Document, Page } from "react-pdf";

const AddressPage = () => {
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
  const router = useRouter();

  const addressProof = usersById?.userAddress?.addressProof;
  const previewFile = usersById?.userAddress?.aadhaar_file;
  const proofType =
    addressProof?.type?.charAt(0).toUpperCase() +
      addressProof?.type?.slice(1).toLowerCase() || "Address Proof";
  const proofNumber = addressProof?.number || "N/A";

  // ✅ Use mutation hook for approve/reject with auto Sidebar2 update
  const approvalMutation = useApprovalMutation(id);

  const [hover, setHover] = useState(false);
  const [numPages, setNumPages] = useState(0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const getFullName = (nameObj) => {
    if (!nameObj) return "";
    if (typeof nameObj === "string") return nameObj;
    return nameObj.fullName || "";
  };

  // const [address, setAddress] = useState({
  //   addressLine1: usersById?.userAddress?.address?.addressLine1 || "",
  //   addressLine2: usersById?.userAddress?.address?.addressLine2 || "",
  //   addressLine3: usersById?.userAddress?.address?.addressLine3 || "",
  //   city: usersById?.userAddress?.address?.city || "",
  // });

  const [address, setAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    city: "",
  });

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [originalAddress, setOriginalAddress] = useState(null);

  const [viewerOpen, setViewerOpen] = useState(false); // new
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState(null); // { url, type }

  const openViewer = (url, type) => {
    setViewerFile({ url, type });
    setViewerOpen(true);
  };

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

  const reasons = [
    "Address proof document is blurred or unreadable",
    "Address entered does not match submitted address proof",
    "Provide clear self attested Aadhaar card - front & back on same page",
    "Address proof is older than 3 months",
    "Client name mismatch on address proof document",
    "Name as per PAN records and Aadhaar records is differing completely. Hence, cannot process the application.",
  ];

  const handleApprove = async () => {
    try {
      // Use mutation hook - will automatically invalidate and update Sidebar2
      await approvalMutation.mutateAsync({
        status: "approved",
        section: "address",
      });

      toast.success("Approved successfully");
      setActionTaken(true);

      // STEP 2: get latest approval status
      const statusRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-approval-status/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // STEP 3: decide next tab
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

    setError(""); // clear error

    try {
      // ✅ Use mutation hook - will automatically invalidate and update Sidebar2
      await approvalMutation.mutateAsync({
        status: "rejected",
        section: "address",
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

  const EsignUserById = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/details/address/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setPendingApproval(res.data?.addressApproval?.status);
      setUsersById(res.data);
      setLoading(false);
      // Prefill address fields after API response
      const fetchedAddress = {
        addressLine1: res.data?.userAddress?.address?.addressLine1 || "",
        addressLine2: res.data?.userAddress?.address?.addressLine2 || "",
        addressLine3: res.data?.userAddress?.address?.addressLine3 || "",
        city: res.data?.userAddress?.address?.city || "",
      };
      setAddress(fetchedAddress);
      setOriginalAddress(fetchedAddress); // keep snapshot for cancel

      setActionTaken(
        res.data?.userAddress?.addressStatus === "approved" ||
          res.data?.userAddress?.addressStatus === "rejected",
      );
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const AddressEdit = async () => {
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
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to update address");
      return false;
    }
  };

  // new handlers for edit/save/cancel
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
    const ok = await AddressEdit();
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

  //   const handleDownload = (url, filename) => {
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = filename;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const handleDownload = async (url, filename) => {
    try {
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
  console.log(usersById);
  return (
    <>
      <Breadcrumb
        title="Address Stage/POI"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile", href: "#" },
          {
            label: `${getFullName(usersById?.nameAsPerAddressProof) || getFullName(usersById?.userAddress?.name) || "User"} - Address Stage/POI`,
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
              className="btn btn-sm text-left"
              style={{
                backgroundColor:
                  usersById.addressApproval?.status === "rejected"
                    ? "#FFEDED"
                    : "#F3FFEB",
                color:
                  usersById.addressApproval?.status === "rejected"
                    ? "#FF4800"
                    : "#4EB800",
                border:
                  usersById.addressApproval?.status === "rejected"
                    ? "1px solid #FF0000"
                    : "1px solid #4EB800",
                fontWeight: 600,
                padding:
                  usersById.addressApproval?.status === "rejected"
                    ? ""
                    : "10px 12px",
                fontSize: "14px",
              }}
            >
              {usersById?.addressApproval?.autoApproved
                ? `Auto approved on ${formatFunDate(
                    usersById?.addressApproval?.approveAt,
                  )}`
                : usersById.addressApproval?.status === "rejected"
                  ? `RejectedBy ${
                      usersById?.addressApproval?.rejectedBy?.name
                    } on ${formatFunDate(usersById?.addressApproval?.rejectedAt)}`
                  : `ApprovedBy ${
                      usersById?.addressApproval?.approveBy?.name
                    } on ${formatFunDate(usersById?.addressApproval?.approveAt)}`}
              {usersById?.addressApproval?.status === "rejected" && (
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
                  title={usersById.addressApproval.rejectionReason} // full reason on hover
                >
                  Reason: {usersById.addressApproval.rejectionReason}
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
        <div className="row g-0 align-items-stretch">
          <div className="col-12 col-md d-flex flex-column">
            <div className="border p-3 rounded d-md-none mb-2">
              {usersById?.kycType || "N/A"} based account opening
            </div>
            <div className="border p-3 rounded-start d-none d-md-flex align-items-center h-100">
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
          <ClientCodeBox
            clientCode={usersById?.clientCode}
            userId={id}
            loading={loading}
            onAssigned={(newCode) =>
              setUsersById((prev) => ({ ...prev, clientCode: newCode }))
            }
          />

          <div className="col-12 col-md d-flex flex-column">
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
            <div className="border p-3 rounded-end d-none d-md-flex align-items-center h-100">
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
                {usersById?.userAddress?.panDetails?.name ||
                  getFullName(usersById?.userAddress?.name) || (
                    <Skeleton height={20} />
                  )}
              </td>
              <td style={{ paddingTop: "16px" }}>
                {getFullName(usersById?.userAddress?.name) || (
                  <Skeleton height={20} />
                )}
              </td>
              <td style={{ paddingTop: "16px" }}>
                {getFullName(usersById?.nameAsPerAddressProof) ||
                  getFullName(usersById?.userAddress?.name) || (
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

      {/* Download KYC Data */}
      <div className="d-flex flex-column flex-md-row mt-5 mt-md-0  justify-content-between align-items-center align-items-md-center gap-3 mx-4 mb-3">
        <div className="d-flex align-items-center gap-3">
          <h3 style={{ marginBottom: "0" }}>Address</h3>
          {/* {(user?.role === "Supervisor" ||
            user?.role === "Scrutiny Officer") && (
            <button className="btn btn-danger add-button">Edit</button>
          )} */}
        </div>
        <div className="d-flex justify-content-between gap-2 align-items-center px-0 py-2">
          <button
            className="btn btn-danger add-button d-flex align-items-center"
            style={{
              height: "38px",
              padding: "0 12px",
            }}
            onClick={() =>
              handleDownload(
                `${process.env.NEXT_PUBLIC_API_URL}/${usersById?.userAddress?.aadhaar_file}`,
                "aadhaar.pdf",
              )
            }
          >
            <Download
              style={{ width: "20px", height: "20px", marginRight: "6px" }}
            />{" "}
            Download KYC Data
          </button>
          <button
            className="btn btn-outline-secondary d-flex align-items-center"
            style={{
              height: "38px",
              padding: "0 12px",
              border: "1px solid #FF5A1F",
              color: "#FF5A1F",
              background: "#fff",
              borderRadius: "6px",
              fontWeight: 500,
              minWidth: "110px",
            }}
            disabled={!previewFile}
            onClick={() => {
              if (usersById?.userAddress?.aadhaar_file) {
                openViewer(
                  `${process.env.NEXT_PUBLIC_API_URL}/${usersById.userAddress.aadhaar_file}#view=FitH&toolbar=0`,
                  "pdf",
                );
              } else if (
                usersById?.userAddress?.addressProof?.frontImage ||
                usersById?.userAddress?.addressProof?.backImage
              ) {
                setImagePreviewOpen(true);
              } else {
                toast.info("No address proof available");
              }
            }}
          >
            <Eye size={18} className="me-2" />
            Preview
          </button>
          <img
            src="/XML.png"
            className="mx-0"
            style={{ width: "40px", height: "40px", cursor: "pointer" }}
            onClick={() =>
              handleDownload(
                `${process.env.NEXT_PUBLIC_API_URL}/${usersById?.userAddress?.adharXML}`,
                "aadhaar.xml",
              )
            }
          />
        </div>
      </div>

      {/* Address */}
      <div className="mt-1 mx-4">
        <div className="row g-0">
          <div className="col">
            <div className="border p-3 rounded-start border-end-0">
              Address as per {proofType}
            </div>
          </div>
          <div className="col">
            <div className="border p-3  border-end-0">
              {proofType} Number: {proofNumber}
            </div>
          </div>
          <div className="col">
            <div className="border p-3 rounded-end d-flex align-items-center">
              <Check
                size={18}
                style={{
                  backgroundColor: "#56CA00",
                  color: "white",
                  borderRadius: "50%",
                  padding: "3px",
                  marginRight: "8px", // space between icon and text
                }}
              />
              Fetched from DigiLocker
            </div>
          </div>
        </div>
      </div>

      {/* Correspondence Address */}
      <div className="mt-4 mx-4">
        <div className="d-flex justify-content-start align-items-center gap-3">
          <h5 className="fw-semibold mb-0">Correspondence Address</h5>
          {((user?.loginName === "Supervisor" && user?.role === "Supervisor") ||
            (user?.loginName === "SO" &&
              user?.role === "Scrutiny Officer")) && (
            <div className="d-flex align-items-center gap-2">
              {!isEditingAddress ? (
                // Edit Icon
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
                  {/* Save Icon */}
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
                  {/* Cancel Icon */}
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
            <div className="col-md-2">
              <label className="form-label">
                House/Flat/Plot No. <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter house/Flat/Plot no."
                value={address.addressLine1}
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    addressLine1: e.target.value,
                  }))
                }
                style={{
                  backgroundColor: isEditingAddress ? "" : "#f5f5f5",
                  cursor: isEditingAddress ? "text" : "not-allowed",
                }}
              />
            </div>
            <div className="col-md-5">
              <label className="form-label">
                Street/Colony/Area <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter Street name"
                value={address.addressLine2}
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    addressLine2: e.target.value,
                  }))
                }
                style={{
                  backgroundColor: isEditingAddress ? "" : "#f5f5f5",
                  cursor: isEditingAddress ? "text" : "not-allowed",
                }}
              />
            </div>
            <div className="col-md-5">
              <label className="form-label">Landmark</label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter landmark"
                value={address.addressLine3}
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    addressLine3: e.target.value,
                  }))
                }
                style={{
                  backgroundColor: isEditingAddress ? "" : "#f5f5f5",
                  cursor: isEditingAddress ? "text" : "not-allowed",
                }}
              />
            </div>
          </div>

          <div className="row mb-3 mt-4">
            <div className="col-md-3">
              <label className="form-label">
                City/Town/Village <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter city/town/village name"
                value={address.city}
                onChange={(e) =>
                  setAddress((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                style={{
                  backgroundColor: isEditingAddress ? "" : "#f5f5f5",
                  cursor: isEditingAddress ? "text" : "not-allowed",
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">
                Pin Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter pin code"
                value={usersById?.userAddress?.address?.pincode || ""}
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">
                State <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter state"
                value={usersById?.userAddress?.address?.state || ""}
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter country"
                value={usersById?.userAddress?.address?.country || ""}
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
              <label className="form-label">Telephone (Off.)</label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter official telephone no."
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Telephone (Res.)</label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter residential phone no."
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Mobile <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter mobile no."
                value={usersById?.userAddress?.mobileNumber || ""}
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
                Email ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter email ID"
                value={usersById?.userAddress?.email || ""}
                readOnly
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Fax Number</label>
              <input
                type="text"
                className="form-control p-2"
                placeholder="Enter fax no."
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

      {/* <div className="mt-4 mx-4">
        <h4>Permanent Address</h4>
        <div className="form-check mt-0 d-flex gap-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="customRedCheckbox"
            onChange={() => setIsChecked(!isChecked)}
            style={{
              borderColor: isChecked ? "#ff0000" : "#000",
              backgroundColor: isChecked ? "#ff0000" : "#fff",
              cursor: "pointer",
            }}
          />
          <label
            className="form-check-label fw-semibold"
            htmlFor="customRedCheckbox"
            style={{ color: "#555" }}
          >
            Same as above
          </label>
        </div>
      </div>
       */}

      <div className="mt-4 mx-4">
        <h4>Permanent Address</h4>

        <div
          className="d-flex align-items-center gap-2"
          style={{ minHeight: "32px" }} // vertical alignment fix
        >
          <input
            className="form-check-input m-0"
            type="checkbox"
            id="customRedCheckbox"
            checked={true} // always ticked
            disabled // disable ONLY input
            style={{
              borderColor: "#ff0000",
              backgroundColor: "#ff0000",
              cursor: "not-allowed",
            }}
          />

          <label
            className="fw-semibold m-0"
            htmlFor="customRedCheckbox"
            style={{
              color: "#555", // normal text color
              cursor: "default", // NOT disabled look
            }}
          >
            Same as above
          </label>
        </div>
      </div>

      <div className="mx-4 mt-4">
        <h4 className="fw-bold mb-1">PAN</h4>
        <p className="text-muted mb-3">(Fetched from Digilocker)</p>

        {/* PAN Image */}
        {/* PAN File (PDF / Image) */}
        <div
          className="rounded border border-gray-800 w-100 w-md-auto mb-2"
          style={{
            height: "250px",
            maxWidth: "400px",
            backgroundColor: "#f8f9fa",
          }}
        >
          {usersById?.userAddress?.panFile && (
            <div
              className="rounded border border-gray-800 w-100 w-md-auto"
              style={{
                height: "250px",
                maxWidth: "400px",
                backgroundColor: "#f8f9fa",
              }}
            >
              {(() => {
                const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/${usersById.userAddress.panFile}`;
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
                        background:
                          "linear-gradient(145deg, #f8fbff 0%, #eef4fb 100%)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        padding: "14px 14px 10px",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)",
                      }}
                    >
                      {/* PDF Preview */}
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

                      {/* Hover Overlay */}
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
                            : "transparent",
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
                              "linear-gradient(180deg, rgba(255,255,255,.98) 0%, rgba(245,247,250,.96) 100%)",
                            border: "1px solid rgba(255,255,255,.7)",
                            backdropFilter: "blur(14px)",
                            WebkitBackdropFilter: "blur(14px)",
                            boxShadow: hover
                              ? "0 24px 45px rgba(15,23,42,.24), 0 10px 20px rgba(37,99,235,.16)"
                              : "0 12px 28px rgba(15,23,42,.16)",
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

      {imagePreviewOpen && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,.6)" }}
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Address Proof Preview</h5>

                <button
                  className="btn-close"
                  onClick={() => setImagePreviewOpen(false)}
                />
              </div>

              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 text-center">
                    <h6>Front Image</h6>

                    {usersById?.userAddress?.addressProof?.frontImage ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${usersById.userAddress.addressProof.frontImage}`}
                        className="img-fluid border rounded"
                      />
                    ) : (
                      <p>No Front Image</p>
                    )}
                  </div>

                  <div className="col-md-6 text-center">
                    <h6>Back Image</h6>

                    {usersById?.userAddress?.addressProof?.backImage ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${usersById.userAddress.addressProof.backImage}`}
                        className="img-fluid border rounded"
                      />
                    ) : (
                      <p>No Back Image</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(user?.role === "Supervisor" || user?.role === "Scrutiny Officer") &&
        !actionTaken &&
        usersById.addressApproval?.status !== "rejected" &&
        (usersById.addressApproval?.status !== "approved" ||
          usersById?.addressApproval?.autoApproved) && (
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

export default AddressPage;

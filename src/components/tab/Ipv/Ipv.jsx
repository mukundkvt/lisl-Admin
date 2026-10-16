"use client";

import ApproveRejectButtons from "@/components/ApproveRejectButtons";
import Breadcrumb from "@/components/Breadcrumb";
import PdfImageViewer from "@/components/PdfImageViewer";
import RejectModal from "@/components/RejectModal/RejectModal";
import formatFunDate from "@/utils/convertISODate";
import axios from "axios";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  ExternalLink,
  LucideUpload,
  MapPin,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import getRoleDisplay from "@/components/WordShort";
import { getNextPendingTab } from "@/utils/getNextPendingTab";
import { useApprovalMutation } from "@/hooks/useApprovalStatus";
import { Document, Page } from "react-pdf";
import { Eye } from "lucide-react";

const Ipv = () => {
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
  const [viewerOpen, setViewerOpen] = useState(false); // new
  const [viewerFile, setViewerFile] = useState(null); // { url, type }
  const [pendingApproval, setPendingApproval] = useState(null);
  const approvalMutation = useApprovalMutation(id);

  const [hover, setHover] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log(numPages);
  };
  let matchPercentage = usersById?.ipv_details?.ipv_details?.matchPercentage;
  let rawMatch = matchPercentage; // "99.00%"
  const cleanMatch = rawMatch ? parseFloat(rawMatch.replace("%", "")) : null;
  const progressColor =
    cleanMatch < 60
      ? "#EF4444" // Red
      : cleanMatch <= 80
        ? "#F59E0B" // Yellow
        : "#22C55E"; // Green

  const progressLabel =
    cleanMatch < 60
      ? "Poor Match"
      : cleanMatch <= 80
        ? "Needs Review"
        : "Excellent Match";
  const router = useRouter();

  const openViewer = (url, type) => {
    setViewerFile({ url, type });
    setViewerOpen(true);
  };

  const reasons = [
    "Client face not clearly visible in IPV photo/video",
    "Client face mismatch with PAN / Aadhaar photo",
    "Low face match percentage (below required threshold)",
    "GPS / Geolocation coordinates mismatch with address proof",
    "Live IPV video incomplete or verification code not audible",
    "Client name mismatch with Aadhaar and PAN card",
  ];
  if (!usersById) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  const EsignUserById = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/details/ipv/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setPendingApproval(res.data?.ipvApproval?.status);
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
        section: "ipv",
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
        section: "ipv",
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
  return (
    <>
      {" "}
      <Breadcrumb
        title="IPV Stage"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile", href: "#" },
          {
            label: "IPV Stage",
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
                  usersById.ipvApproval?.status === "rejected"
                    ? "#FFEDED"
                    : "#F3FFEB",
                color:
                  usersById.ipvApproval?.status === "rejected"
                    ? "#FF4800"
                    : "#4EB800",
                border:
                  usersById.ipvApproval?.status === "rejected"
                    ? "1px solid #FF0000"
                    : "1px solid #4EB800",
                fontWeight: 600,
                padding:
                  usersById.ipvApproval?.status === "rejected"
                    ? ""
                    : "10px 12px",
                fontSize: "14px",
              }}
            >
              {usersById?.ipvApproval?.autoApproved
                ? `Auto approved on ${formatFunDate(
                    usersById?.ipvApproval?.approveAt,
                  )}`
                : usersById.ipvApproval?.status === "rejected"
                  ? `RejectedBy ${
                      usersById?.ipvApproval?.rejectedBy?.name
                    } on ${formatFunDate(usersById?.ipvApproval?.rejectedAt)}`
                  : `ApprovedBy ${
                      usersById?.ipvApproval?.approveBy?.name
                    } on ${formatFunDate(usersById?.ipvApproval?.approveAt)}`}
              {usersById?.ipvApproval?.status === "rejected" && (
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
                  title={usersById?.ipvApproval?.rejectionReason} // full reason on hover
                >
                  Reason: {usersById?.ipvApproval?.rejectionReason}
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
      <div className="mx-4 mt-4">
        <h4 className="fw-bold mb-1">PAN</h4>
        <p className="text-muted mb-3">(Fetched from Digilocker)</p>

        {/* PAN File (PDF / Image) */}
        <div
          className="rounded border border-gray-800 w-100 w-md-auto"
          style={{
            height: "250px",
            maxWidth: "400px",
            backgroundColor: "#f8f9fa",
          }}
        >
          {usersById?.ipv_details?.panFile ? (
            (() => {
              const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}/${usersById?.ipv_details?.panFile}`;
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
              } else if (["jpg", "jpeg", "png"].includes(ext)) {
                // Image ke liye <img>
                return (
                  <div
                    onClick={() => openViewer(fileUrl, "image")}
                    style={{
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                      cursor: "zoom-in",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={fileUrl}
                      alt="PAN File"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                );
              } else {
                return (
                  <p className="text-center mt-5">Unsupported file format</p>
                );
              }
            })()
          ) : (
            <p className="text-center mt-5">No PAN File Available</p>
          )}
        </div>
      </div>
      <div className="mx-4 mt-3">
        <div className="row g-2" style={{ alignItems: "flex-start" }}>
          <div className="col-auto">
            <h4 className="fw-bold mb-1">Aadhar</h4>
            <p className="text-muted mb-3">(Fetched from Digilocker)</p>

            <div
              className="rounded border border-dark d-flex justify-content-center align-items-center p-1 mb-2"
              style={{
                width: "200px", // passport-size width
                height: "190px", // passport-size height
                backgroundColor: "#f8f9fa",
              }}
            >
              {usersById?.ipv_details?.adharPhoto ? (
                (() => {
                  const fileUrl2 = `${process.env.NEXT_PUBLIC_API_URL}/${usersById?.ipv_details?.adharPhoto}`;
                  const ext = fileUrl2.split(".").pop().toLowerCase();

                  if (ext === "pdf") {
                    // Agar galti se PDF upload ho jaye
                    return (
                      <p className="text-center small px-2">
                        PDF file uploaded — Not a photo
                      </p>
                    );
                  } else if (["jpg", "jpeg", "png"].includes(ext)) {
                    // Sirf photo passport-size dikhegi
                    return (
                      <div
                        onClick={() => openViewer(fileUrl2, "image")}
                        style={{
                          width: "100%",
                          height: "100%",
                          overflow: "hidden",
                          cursor: "zoom-in",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={fileUrl2}
                          alt="Aadhar Photo"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <p className="text-center small">
                        Unsupported file format
                      </p>
                    );
                  }
                })()
              ) : (
                <p className="text-center small">No Aadhar File Available</p>
              )}
            </div>
          </div>

          <div className="col-auto">
            <h4 className="fw-bold mb-1">Captured Image</h4>
            <p className="text-muted mb-3">(IPV Verification)</p>

            <div
              className="rounded border border-dark d-flex justify-content-center align-items-center p-1 mb-2"
              style={{
                width: "200px", // passport-size width
                height: "190px", // passport-size height
                backgroundColor: "#f8f9fa",
              }}
            >
              {usersById?.ipv_details?.ipv_details?.capturedImage ? (
                (() => {
                  const capturedImageUrl = `${process.env.NEXT_PUBLIC_API_URL}/${usersById?.ipv_details?.ipv_details?.capturedImage}`;
                  const ext = capturedImageUrl.split(".").pop().toLowerCase();

                  if (["jpg", "jpeg", "png"].includes(ext)) {
                    return (
                      <div
                        onClick={() => openViewer(capturedImageUrl, "image")}
                        style={{
                          width: "100%",
                          height: "100%",
                          overflow: "hidden",
                          cursor: "zoom-in",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={capturedImageUrl}
                          alt="Captured Image"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <p className="text-center small">
                        Unsupported file format
                      </p>
                    );
                  }
                })()
              ) : (
                <p className="text-center small">No Captured Image Available</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/*  Match Percentage Section */}
      {cleanMatch != null && !isNaN(cleanMatch) && (
        <div
          className="mx-4 mt-4 p-3"
          style={{
            border: "1px solid #E9ECEF",
            borderRadius: "12px",
            background: "#fff",
            maxWidth: "500px",
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h6 className="mb-0 fw-semibold">Face Match</h6>
              <small style={{ color: progressColor }}>{progressLabel}</small>
            </div>

            <div
              style={{
                color: progressColor,
                fontWeight: 700,
                fontSize: "18px",
              }}
            >
              {cleanMatch}%
            </div>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "10px",
              background: "#ECECEC",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${cleanMatch}%`,
                height: "100%",
                background: progressColor,
                borderRadius: "999px",
                transition: "width .4s ease-in-out",
              }}
            />
          </div>

          {/* Scale */}
          <div
            className="d-flex justify-content-between mt-2"
            style={{
              fontSize: "12px",
              color: "#6c757d",
            }}
          >
            <span>0%</span>
            <span>60%</span>
            <span>80%</span>
            <span>100%</span>
          </div>
        </div>
      )}
      {/* IPV Location & Network Details */}
      {usersById?.ipv_details?.geolocation && (
        <div
          className="mx-4 mt-4 p-3"
          style={{
            border: "1px solid #E9ECEF",
            borderRadius: "12px",
            background: "#fff",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <MapPin size={20} className="text-primary" />
              <h6 className="mb-0 fw-semibold">IPV Geolocation & Network Details</h6>
            </div>
            {usersById?.ipv_details?.geolocation?.coordinates?.latitude != null &&
              usersById?.ipv_details?.geolocation?.coordinates?.longitude != null && (
                <a
                  href={`https://www.google.com/maps?q=${usersById.ipv_details.geolocation.coordinates.latitude},${usersById.ipv_details.geolocation.coordinates.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                  style={{ fontSize: "12px", padding: "4px 10px" }}
                >
                  <ExternalLink size={14} /> Open in Google Maps
                </a>
              )}
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <div className="p-2 px-3 border rounded bg-light">
                <small className="text-muted d-block">IP Address</small>
                <span className="fw-semibold text-dark">
                  {usersById?.ipv_details?.geolocation?.ipAddress || "N/A"}
                </span>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-2 px-3 border rounded bg-light">
                <small className="text-muted d-block">Coordinates (Lat, Lng)</small>
                <span className="fw-semibold text-dark">
                  {usersById?.ipv_details?.geolocation?.coordinates?.latitude != null &&
                  usersById?.ipv_details?.geolocation?.coordinates?.longitude != null
                    ? `${usersById.ipv_details.geolocation.coordinates.latitude}, ${usersById.ipv_details.geolocation.coordinates.longitude}`
                    : "N/A"}
                </span>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-2 px-3 border rounded bg-light">
                <small className="text-muted d-block">Captured Time</small>
                <span className="fw-semibold text-dark">
                  {usersById?.ipv_details?.geolocation?.capturedAt
                    ? formatFunDate(usersById.ipv_details.geolocation.capturedAt)
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Map iframe */}
          {usersById?.ipv_details?.geolocation?.coordinates?.latitude != null &&
            usersById?.ipv_details?.geolocation?.coordinates?.longitude != null && (
              <div
                style={{
                  width: "100%",
                  height: "380px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #E9ECEF",
                }}
              >
                <iframe
                  title="IPV Location Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "380px" }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${usersById.ipv_details.geolocation.coordinates.latitude},${usersById.ipv_details.geolocation.coordinates.longitude}&hl=en&z=15&output=embed`}
                />
              </div>
            )}
        </div>
      )}
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
        usersById.ipvApproval?.status !== "rejected" &&
        (usersById.ipvApproval?.status !== "approved" ||
          usersById?.ipvApproval?.autoApproved) && (
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

export default Ipv;

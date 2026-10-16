// "use client";

// import Breadcrumb from "@/components/Breadcrumb";
// import { LucideUpload } from "lucide-react";
// import Link from "next/link";
// import React from "react";

// const RejectionReason = () => {
//   return (
//     <>
//       <Breadcrumb
//         title="Rejection Reasons"
//         breadcrumbs={[
//           { label: "Dashboard", href: "/dashboard" },
//           { label: "Esign Completed", href: "/esigned" },
//           {
//             label: "Dummy Name - Rejection Reason",
//           },
//         ]}
//       />

//       <div
//         className="d-flex flex-row justify-content-end mt-3 align-items-center gap-2 p-3"
//         style={{ backgroundColor: "" }}
//       >
//         <button
//           className="btn btn-sm"
//           style={{
//             backgroundColor: "#F3FFEB",
//             color: "#4EB800",
//             border: "1px solid #4EB800",
//             fontWeight: 600,
//             padding: "10px 12px",
//             fontSize: "14px",
//           }}
//         >
//           Auto approved on 11 Jul 2025 at 3:08 PM
//         </button>

//         <button
//           className="btn btn-sm"
//           style={{
//             backgroundColor: "#F7F7F7",
//             color: "#979797",
//             border: "1px solid #979797",
//             fontWeight: 600,
//             padding: "10px 12px",
//             fontSize: "14px",
//           }}
//         >
//           <span>
//             <LucideUpload
//               style={{ width: "20px", height: "20px", marginRight: "6px" }}
//             />
//           </span>
//           Start Push
//         </button>
//       </div>

//       {/* Header Info */}
//       <div className="mt-3 mx-4">
//         <div className="row g-0">
//           <div className="col-12 col-md">
//             <div className="border p-3 rounded d-md-none mb-2">
//               KRA with Aadhar based account opening
//             </div>
//             <div className="border p-3 rounded-start d-none d-md-block">
//               KRA with Aadhar based account opening
//             </div>
//           </div>
//           <div className="col-12 col-md">
//             {/* Mobile view - rounded */}
//             <div className="border p-3 rounded d-md-none mb-2">
//               Application Number: <strong>ANSJ1201</strong>
//             </div>

//             {/* Desktop view - no rounded */}
//             <div className="border p-3 mb-2 mb-md-0 d-none d-md-block">
//               Application Number: <strong>ANSJ1201</strong>
//             </div>
//           </div>

//           <div className="col-12 col-md">
//             <div className="border p-3 rounded d-md-none">UTM Source: Web</div>
//             <div className="border p-3 rounded-end d-none d-md-block">
//               UTM Source: Web
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="mt-4 mx-4">
//         {/* Header Box */}
//         <div className="text-black py-3 rounded">
//           <h5 className="mb-0">Address Stage</h5>
//         </div>

//         {/* Content Section */}
//         <div className="bg-light p-3 border rounded-bottom">
//           <div className="row">
//             {/* Reason */}
//             <div className="col-md-6">
//               <p className="mb-1 fw-bold">Rejected Reason:</p>
//               <p className="mb-0 text-danger">
//                 aadhar not masked kindly process through digilocker
//               </p>
//             </div>

//             {/* Rejected On & By */}
//             <div className="col-md-6 text-md-end">
//               <p className="mb-1">
//                 <span className="fw-bold">Rejected On: </span>
//                 2025-09-24T09:50:00.437
//               </p>
//               <p className="mb-0">
//                 <span className="fw-bold">Rejected By: </span>
//                 ANJALI GUPTA
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default RejectionReason;

"use client";

import Breadcrumb from "@/components/Breadcrumb";
import getRoleDisplay from "@/components/WordShort";
import { LucideUpload } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const formatRejectionDate = (dateVal) => {
  if (!dateVal) return "N/A";
  if (typeof dateVal === "string") {
    // If already formatted like "23/09/2026 17:20:46"
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateVal.trim())) {
      return dateVal;
    }
  }
  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }
  return String(dateVal);
};

const RejectionReason = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchRejectionData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/rejected-user/${id}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectionData();
  }, [id]);

  if (loading) {
    return (
      <>
        {/* Top buttons */}
        <div className="d-flex justify-content-end mt-3 gap-2 p-3">
          <div className="shimmer rounded" style={{ height: 40, width: 120 }} />
          <div className="shimmer rounded" style={{ height: 40, width: 120 }} />
        </div>

        {/* Header info */}
        <div className="mt-3 mx-4">
          <div className="row g-0">
            <div className="col-md">
              <div className="border p-3">
                <div
                  className="shimmer rounded"
                  style={{ height: 18, width: "70%" }}
                />
              </div>
            </div>

            <div className="col-md">
              <div className="border p-3">
                <div
                  className="shimmer rounded"
                  style={{ height: 18, width: "60%" }}
                />
              </div>
            </div>

            <div className="col-md">
              <div className="border p-3">
                <div
                  className="shimmer rounded"
                  style={{ height: 18, width: "80%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rejection section */}
        <div className="mt-4 mx-4">
          <div
            className="shimmer rounded mb-3"
            style={{ height: 22, width: 200 }}
          />

          <div className="bg-light p-3 border rounded">
            <div className="row">
              <div className="col-md-6">
                <div
                  className="shimmer rounded mb-2"
                  style={{ height: 14, width: 120 }}
                />
                <div
                  className="shimmer rounded"
                  style={{ height: 18, width: "90%" }}
                />
              </div>

              <div className="col-md-6 text-md-end">
                <div
                  className="shimmer rounded mb-2 ms-md-auto"
                  style={{ height: 14, width: 180 }}
                />
                <div
                  className="shimmer rounded ms-md-auto"
                  style={{ height: 14, width: 200 }}
                />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const rejections = Array.isArray(data?.data) ? data.data : [];

  return (
    <>
      <Breadcrumb
        title="Rejection Reasons"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile", href: "#" },
          {
            label: "Rejection Reason",
          },
        ]}
      />

      {/* Header Info */}
      <div className="mt-3 mx-4">
        <div className="row g-0">
          <div className="col-12 col-md">
            <div className="border p-3 rounded-start">
              {data?.kycType || "Digilocker"} based account opening
            </div>
          </div>

          <div className="col-12 col-md">
            <div className="border p-3">
              Application Number: <strong>{data?.clientCode || "N/A"}</strong>
            </div>
          </div>

          <div className="col-12 col-md">
            <div className="border p-3 rounded d-md-none">
              UTM Source:{" "}
              {data?.referredBy && Object.keys(data.referredBy).length > 0 ? (
                <strong>
                  {getRoleDisplay(data.referredBy.role)}: {data.referredBy.name}
                  , {data.referredBy.mobile || "N/A"} <br />
                  (Emp Code: {data.referredBy.employeeId || "N/A"})
                </strong>
              ) : (
                <strong>Web</strong>
              )}
            </div>
            <div className="border p-3 rounded-end d-none d-md-block">
              UTM Source:{" "}
              {data?.referredBy && Object.keys(data.referredBy).length > 0 ? (
                <strong>
                  {getRoleDisplay(data.referredBy.role)}: {data.referredBy.name}
                  , {data.referredBy.mobile || "N/A"} | Emp Code:{" "}
                  {data.referredBy.employeeId || "N/A"}
                </strong>
              ) : (
                <strong>Web</strong>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rejection History Section */}
      {rejections.length > 0 ? (
        <div className="mt-4 mx-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0 fw-bold">Rejection History ({rejections.length})</h5>
          </div>
          <div className="d-flex flex-column gap-3 mb-4">
            {rejections.map((rej, index) => (
              <div key={index} className="border rounded overflow-hidden shadow-sm">
                <div className="bg-light px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 text-capitalize fw-bold text-dark">
                    {rej.field} Stage
                  </h6>
                  <span className="badge bg-danger">Rejected</span>
                </div>
                <div className="p-3 bg-white">
                  <div className="row">
                    <div className="col-md-6 mb-2 mb-md-0">
                      <p className="mb-1 text-muted small fw-semibold">Rejection Reason:</p>
                      <p className="mb-0 text-danger fw-medium">{rej.rejectionReason || "N/A"}</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <p className="mb-1 text-muted small">
                        <span className="fw-semibold">Rejected On: </span>
                        {formatRejectionDate(rej.rejectedAt)}
                      </p>
                      <p className="mb-0 text-muted small">
                        <span className="fw-semibold">Rejected By: </span>
                        {rej.rejectedBy?.name || "Admin"} {rej.rejectedBy?.employeeId ? `(${rej.rejectedBy.employeeId})` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 mx-4 p-4 text-center border rounded bg-light">
          <p className="mb-0 text-muted">No rejection history found for this user.</p>
        </div>
      )}
    </>
  );
};

export default RejectionReason;

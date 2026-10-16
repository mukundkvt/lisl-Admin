// "use client";

// import React from "react";
// import Breadcrumb from "@/components/Breadcrumb";
// import { Upload, FileText } from "lucide-react";

// export default function InstaBOUploadPage() {
//   return (
//     <>
//       <Breadcrumb
//         title="Insta BO Account Upload"
//         breadcrumbs={[
//           { label: "Dashboard", href: "/dashboard" },
//           { label: "Insta BO Upload" },
//         ]}
//       />

//       <div className="mx-3">

//         {/* 🔹 Stats Card */}
//         <div className="bg-white mt-3 rounded-3 shadow-sm border overflow-hidden">
//           <table className="table align-middle mb-0 text-center">
//             <thead style={{ background: "#b7c7da" }}>
//               <tr>
//                 <th>Total ID's Uploaded</th>
//                 <th>Used</th>
//                 <th>Free</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td className="py-3">—</td>
//                 <td>—</td>
//                 <td className="fw-semibold">4493</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* 🔹 Upload Card */}
//         <div className="bg-white mt-3 rounded-3 shadow-sm border p-5 text-center">
//           <h5 className="fw-semibold mb-4" style={{ color: "#1e2129" }}>
//             CDSL Pre Generated Accounts Count (4493)
//           </h5>

//           <button
//             className="btn d-flex align-items-center gap-2 mx-auto"
//             style={{
//               background: "linear-gradient(180deg, #FF2200, #FF7700)",
//               color: "#fff",
//               padding: "8px 18px",
//               fontSize: "14px",
//             }}
//           >
//             <Upload size={18} />
//             Upload File
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Database,
  BarChart3,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function InstaBOUploadPage() {
  const [freeCount, setFreeCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [used, setUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [uploadSummary, setUploadSummary] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // 🔹 Fetch Free DP ID Count
  const fetchFreeCount = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${API_BASE}/api/admin/free-dp-id-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFreeCount(res.data.data.free || 0);
      setTotal(res.data.data.total || 0);
      setUsed(res.data.data.used || 0);
    } catch (err) {
      toast.error("Failed to fetch DP ID count");
    }
  };

  useEffect(() => {
    fetchFreeCount();
  }, []);

  //  Upload File
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE}/api/admin/upload-dp-ids`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Show success toast
      toast.success(res.data.message || "Uploaded successfully!");

      // Set summary data and show modal
      setUploadSummary(res.data.data || {});
      setShowModal(true);

      // Refresh count after upload
      await fetchFreeCount();

      // Reset file input
      setFile(null);
      setFileInputKey((prev) => prev + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setUploadSummary(null);
  };

  return (
    <>
      <Breadcrumb
        title="Insta BO Account Upload"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Insta BO Upload" },
        ]}
      />

      <div className="mx-3">
        {/* 🔹 Stats Card */}
        <div className="bg-white mt-3 rounded-3 shadow-sm border overflow-hidden">
          <table className="table align-middle mb-0 text-center">
            <thead style={{ background: "#b7c7da" }}>
              <tr>
                <th>Total ID's Uploaded</th>
                <th>Used</th>
                <th>Free</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3">{total}</td>
                <td>{used}</td>
                <td className="fw-semibold">{freeCount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🔹 Upload Card */}
        <div className="bg-white mt-3 rounded-3 shadow-sm border p-5 text-center">
          <h5 className="fw-semibold mb-4" style={{ color: "#1e2129" }}>
            CDSL Pre Generated Accounts Count ({freeCount})
          </h5>

          {/* File Input */}
          <input
            key={fileInputKey}
            type="file"
            className="form-control mb-3"
            accept=".txt"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            className="btn d-flex align-items-center gap-2 mx-auto"
            style={{
              background: "linear-gradient(180deg, #FF2200, #FF7700)",
              color: "#fff",
              padding: "8px 18px",
              fontSize: "14px",
            }}
            disabled={loading}
            onClick={handleUpload}
          >
            <Upload size={18} />
            {loading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>

      {/* 🔹 Summary Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050,
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ background: "#b7c7da" }}>
                <h5 className="modal-title fw-semibold d-flex align-items-center gap-2">
                  <BarChart3 size={22} />
                  Upload Summary
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {uploadSummary && (
                  <table className="table table-bordered text-center">
                    <tbody>
                      <tr>
                        <td className="fw-semibold d-flex align-items-center gap-2">
                          <BarChart3 size={18} />
                          Total Processed
                        </td>
                        <td className="fw-bold">
                          {uploadSummary.totalProcessed || 0}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold d-flex align-items-center gap-2">
                          <CheckCircle size={18} style={{ color: "green" }} />
                          Added
                        </td>
                        <td style={{ color: "green", fontWeight: "bold" }}>
                          {uploadSummary.added || 0}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold d-flex align-items-center gap-2">
                          <AlertCircle size={18} style={{ color: "orange" }} />
                          File Duplicates
                        </td>
                        <td style={{ color: "orange", fontWeight: "bold" }}>
                          {uploadSummary.fileDuplicates || 0}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold d-flex align-items-center gap-2">
                          <Database size={18} style={{ color: "#FF7700" }} />
                          DB Duplicates
                        </td>
                        <td style={{ color: "#FF7700", fontWeight: "bold" }}>
                          {uploadSummary.dbDuplicates || 0}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold d-flex align-items-center gap-2">
                          <AlertCircle size={18} style={{ color: "red" }} />
                          Total Duplicates
                        </td>
                        <td style={{ color: "red", fontWeight: "bold" }}>
                          {uploadSummary.duplicates || 0}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: "linear-gradient(180deg, #FF2200, #FF7700)",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                  onClick={handleCloseModal}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

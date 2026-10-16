"use client"
export const dynamic = "force-dynamic";

import Link from "next/link";
import React from "react";
import styles from "../supervisorEsign.module.css";
import {
  Check,
  CheckCircle,
  Clock,
  Download,
  LucideUpload,
  X,
  XCircle,
} from "lucide-react";

const BoReportPage = () => {
  const clients = {
    name: "Indrojit Saraj",
    code: "ANSJ1201",
    pan: "EFLPS4568M",
    createdOn: "2025-06-06",
    phone: "8486303207",
    email: "sarojindrajit423@gmail.com",
    gender: "female",
    kraInfo: "KRA with Aadhar based account opening",
    role: "AP",
    rmName: "Ankit Jain",
    rmPhone: "9408869315",
    empCode: "ANSJ",
    status: [
      { label: "Address", status: "pending" },
      { label: "Profile", status: "done" },
      { label: "Bank", status: "pending" },
      { label: "Demat", status: "done" },
      { label: "Exchange", status: "pending" },
      { label: "IPV", status: "pending" },
      { label: "Digital Sign", status: "pending" },
    ],
  };

  const pushedData = [
    {
      category: "CAMS KRA Upload",
      status: "Success",
      lastUpdate: "2025-06-06, 1:33 PM",
      action: "Repush",
      state: "pending",
    },
    {
      category: "eKYC to KYC Conversion",
      status: "Success",
      lastUpdate: "2025-06-06, 1:33 PM",
      action: "Successfully Pushed",
      state: "success",
    },
    {
      category: "Photo Upload for CKYC",
      status: "Success",
      lastUpdate: "2025-06-06, 1:33 PM",
      action: "Successfully Pushed",
      state: "success",
    },
    {
      category: "POA Upload for CKYC",
      status: "Success",
      lastUpdate: "2025-06-06, 1:33 PM",
      action: "Successfully Pushed",
      state: "success",
    },
    {
      category: "Push to Client Master",
      status: "Success",
      lastUpdate: "2025-06-06, 1:33 PM",
      action: "Successfully Pushed",
      state: "success",
    },
    {
      category: "Signature Upload for CKYC",
      status: "Success",
      lastUpdate: "2025-06-06, 1:33 PM",
      action: "Successfully Pushed",
      state: "success",
    },
    {
      category: "Update CKYC Status",
      status: "Success",
      lastUpdate: "2025-06-06, 1:33 PM",
      action: "Successfully Pushed",
      state: "success",
    },
    {
      category: "Upload to BSE",
      status: "Success",
      lastUpdate: "2025-06-06, 1:33 PM",
      action: "Successfully Pushed",
      state: "success",
    },
    {
      category: "Upload to Depository",
      status: "Address data Invalid",
      lastUpdate: "2025-06-06, 1:33 PM",
      action: "Rejected",
      state: "rejected",
    },
  ];

  return (
    <>
      <div
        className="d-flex flex-column flex-md-row justify-content-between border-bottom px-4 pt-3 gap-2"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 11,
          background: "#fff",
        }}
      >
        <h5 className="mb-0 fw-semibold">BO Reports</h5>
        <nav
          style={{
            "--bs-breadcrumb-divider": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%236c757d'/%3E%3C/svg%3E")`,
          }}
          aria-label="breadcrumb"
        >
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link
                className="text-secondary text-decoration-none"
                href="/dashboard"
              >
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link
                className="text-secondary text-decoration-none"
                href="/esigned"
              >
                Esign Completed
              </Link>
            </li>
            <li
              className="breadcrumb-item active"
              style={{ color: "#FF4800" }}
              aria-current="page"
            >
              {clients.name} - Pushed to BO
            </li>
          </ol>
        </nav>
      </div>

      <div
        className="d-flex flex-row justify-content-end mt-3 align-items-center gap-3 p-3"
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
          Approved on 11 Jul 2025 at 3:08 PM
        </button>
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
          Created on 11 Jul 2025 at 3:08 PM
        </button>
      </div>

      {/* Header Info */}
      <div className="mt-3 mx-4">
        <div className="row g-0">
          <div className="col-12 col-md">
            <div className="border p-3 rounded d-md-none mb-2">
              KRA with Aadhar based account opening
            </div>
            <div className="border p-3 rounded-start d-none d-md-block">
              KRA with Aadhar based account opening
            </div>
          </div>
          <div className="col-12 col-md">
            {/* Mobile view - rounded */}
            <div className="border p-3 rounded d-md-none mb-2">
              Application Number: <strong>ANSJ1201</strong>
            </div>

            {/* Desktop view - no rounded */}
            <div className="border p-3 mb-2 mb-md-0 d-none d-md-block">
              Application Number: <strong>ANSJ1201</strong>
            </div>
          </div>

          <div className="col-12 col-md">
            <div className="border p-3 rounded d-md-none">UTM Source: Web</div>
            <div className="border p-3 rounded-end d-none d-md-block">
              UTM Source: Web
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
              <td style={{ paddingTop: "16px" }}>Santosh Kumar Singh</td>
              <td style={{ paddingTop: "16px" }}>Santosh Kumar Singh</td>
              <td style={{ paddingTop: "16px" }}>Santosh Kumar Singh</td>
              <td style={{ paddingTop: "16px" }}>
                <div className="p-3 rounded-end d-flex align-items-center">
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
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* table */}
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
                <th className={styles["table-cell"]} style={{ minWidth: 200 }}>
                  Action/State
                </th>
              </tr>
            </thead>
            <tbody>
              {pushedData.map((item, i) => (
                <tr
                  key={i}
                  className="border-bottom"
                  style={{ height: "56px" }}
                >
                  <td
                    className={`${styles["table-cell"]} ${styles["table-cell-first"]}`}
                  >
                    {item.category}
                  </td>
                  <td className={styles["table-cell"]}>{item.status}</td>
                  <td className={styles["table-cell"]}>{item.lastUpdate}</td>
                  <td className={styles["table-cell"]}>
                    {item.state === "success" && (
                      <span className="d-flex align-items-center text-success fw-medium">
                        <CheckCircle size={16} className="me-2" />
                        Successfully Pushed
                      </span>
                    )}
                    {item.state === "rejected" && (
                      <span className="d-flex align-items-center text-danger fw-medium">
                        <XCircle size={16} className="me-2" />
                        Rejected
                      </span>
                    )}
                    {item.state === "pending" && (
                      <div className="d-flex flex-column text-warning fw-medium">
                        <div className="d-flex align-items-center">
                          <Clock size={16} className="me-2" />

                          <button
                            className="btn btn-danger d-flex rounded-5 add-button align-items-center"
                            style={{
                              height: "22px",
                              width: "70px",
                              padding: "",
                            }}
                          >
                            Repush
                          </button>
                        </div>

                        <span className="small text-muted ms-4 mt-2">
                          Auto-Repush at 8 PM
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default BoReportPage;

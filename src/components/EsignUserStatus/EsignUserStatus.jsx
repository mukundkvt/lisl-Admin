"use client";

import { Filter, RotateCcw, Search } from "lucide-react";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import styles from "./esignUserStatus.module.css";
import { Phone, Mail, CheckCircle, X, Clock } from "lucide-react";
import ClientCardSkeleton from "../ClientSkeletonCard/ClientSkeletonCard";
import CustomPagination from "../CustomPagination/CustomPagination";

const EsignUserStatus = ({
  title,
  search,
  setSearch,
  onDateChange,
  users = [],
  loading = false,
  page,
  totalPages,
  totalUsers,
  limit,
  setPage,
  setLimit,
  handleClick = () => {},
}) => {
  const [visible, setVisible] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleFilterClick = () => {
    setVisible(!visible);
  };
  return (
    <>
      <div className="bg-white mx-3 p-0 mt-2 rounded-3 shadow-sm border">
        {/* Title + Search */}
        <div className="d-flex flex-column flex-md-row px-3 mt-3 justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="mb-0 fw-semibold" style={{ color: "#1e2129" }}>
            {/* Esign Completed Applications */}
            {title}
          </h5>
          <div className="d-flex flex-column flex-md-row align-items-center gap-0">
            <div className="d-flex align-items-center gap-3">
              <div className="position-relative">
                <Search
                  size={16}
                  className="text-muted position-absolute"
                  style={{
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Name, PAN, City, Pincode"
                  className="form-control ps-5"
                  style={{
                    minWidth: 250,
                    background: "#f8f9fa",
                    height: "38px",
                    paddingRight: "30px",
                  }}
                />
                {/* cross icon */}
                {search && (
                  <X
                    size={16}
                    className="position-absolute text-muted"
                    style={{
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                    onClick={() => setSearch("")}
                  />
                )}
              </div>
              {/* Filter Icon */}
              <div
                className={`filter-icon-wrapper d-flex align-items-center justify-content-center position-relative ${
                  visible ? "active" : ""
                }`}
                style={{
                  width: 38,
                  height: 38,
                  border: "1px solid #ced4da",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
                onClick={handleFilterClick}
              >
                <Filter size={18} stroke={visible ? "#ff5c00" : "#585857"} />
                {/* Small red dot */}
                {(startDate || endDate) && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle border border-light"
                    style={{
                      width: "10px",
                      height: "10px",
                      padding: 0,
                      background: "linear-gradient(180deg, #ff2200, #ff7700)",
                      borderRadius: "50%",
                    }}
                  ></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {visible && (
          <div
            className="row mt-3 mb-5 p-2 justify-content-start"
            style={{ background: "#FFF7F0" }}
          >
            <div className="card-body pt-0 position-relative">
              <div className="row justify-content-start mb-3">
                <div className="col-md-6 mb-2">
                  <label
                    className="mb-2 fw-semibold"
                    style={{ color: "#656D9A" }}
                  >
                    Date
                  </label>
                  <div className="input-group" id="DateRange">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => {
                        setStartDate(date);
                        onDateChange(date, endDate);
                      }}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      dateFormat="yyyy/MM/dd"
                      placeholderText="Start (YYYY/MM/DD)"
                      className="form-control"
                      style={{ background: "#F8F9FB" }}
                    />
                    <span className="input-group-text">to</span>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => {
                        setEndDate(date);
                        onDateChange(startDate, date);
                      }}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      dateFormat="yyyy/MM/dd"
                      placeholderText="End (YYYY/MM/DD)"
                      className="form-control rounded-end"
                      style={{ background: "#F8F9FB" }}
                    />
                  </div>
                </div>
              </div>

              {/* ✅ Buttons ekdam right corner pe */}
              <div className="position-absolute top-0 end-0 d-flex gap-2 mt-1 me-2">
                {/* Reset button */}
                <button
                  type="button"
                  className="btn btn-sm d-flex align-items-center gap-1"
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                    onDateChange(null, null);
                  }}
                  style={{
                    background: "#fff",
                    border: "1px solid #ced4da",
                    color: "#ff5c00",
                    fontWeight: 500,
                    borderRadius: 6,
                  }}
                >
                  <RotateCcw size={16} /> Reset
                </button>

                {/* Close button */}
                <button
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => {
                    setVisible(false);
                    setStartDate(null);
                    setEndDate(null);
                    onDateChange(null, null);
                  }}
                ></button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.clientWrapper}>
          {/* Table Header */}
          <div className={styles.headerRow}>
            <div>Client Name / Code</div>
            <div>PAN / Created On</div>
            <div>Contact Details</div>
            <div
              className="px-2 px-md-5 text-center"
              style={{ whiteSpace: "nowrap" }}
            >
              Esign Date
            </div>
          </div>

          {/* Table Body */}
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <ClientCardSkeleton key={i} />
            ))
          ) : users.length === 0 ? (
            <div
              className="text-center py-4 text-muted"
              style={{ background: "#F8F9FB" }}
            >
              No user found
            </div>
          ) : (
            users.map((user) => (
              <div className={styles.clientBlock} key={user._id}>
                <div className={styles.clientName}>
                  <div
                    className={`${styles.clientIcon} ${
                      user.gender === "male" ? styles.blue : ""
                    }`}
                  >
                    <img
                      src={user.gender === "male" ? "/boy.png" : "/girl.png"}
                      alt="avatar"
                    />
                  </div>
                  <div className={styles.clientInfo}>
                    <div
                      onClick={() => handleClick(user)}
                      style={{ cursor: "pointer" }}
                    >
                      <strong style={{ color: "#F25C05" }}>
                        {user.name || "N/A"}
                      </strong>
                    </div>
                    <div style={{ color: "#1E2129" }}>{user.clientCode || "N/A"}</div>
                  </div>
                </div>

                <div className={styles.clientPan} style={{ color: "#1E2129" }}>
                  {user.PAN || "N/A"}
                  <br />
                  {user.createdAt}
                </div>

                <div
                  className={styles.clientContact}
                  style={{ color: "#1E2129" }}
                >
                  <div>
                    <Phone
                      size={16}
                      style={{ marginRight: "6px", color: "#ff5f00" }}
                    />
                    {user.mobileNumber}
                  </div>
                  <div>
                    <Mail
                      size={16}
                      style={{ marginRight: "6px", color: "#ff5f00" }}
                    />
                    {user.email}
                  </div>
                </div>

                <div className={styles.clientEsign}>
                  <span className={styles.pendingBtn}>Pending Action</span>
                </div>

                <div className={styles.infoBlock}>
                  {user.kycType} based account opening &nbsp;&nbsp;
                  {user.referredBy &&
                  Object.keys(user.referredBy).length > 0 ? (
                    <>
                      <strong>
                        {user.referredBy.role}: {user.referredBy.name},{" "}
                        {user.mobileNumber || "N/A"}
                      </strong>
                      &nbsp;&nbsp; IPV by (Emp Code):{" "}
                      {user.referredBy.employeeId || "N/A"}
                    </>
                  ) : (
                    <strong>Direct</strong>
                  )}
                </div>

                <div className={styles.statusIcons}>
                  {Object.entries(user.approvals || {}).map(([key, value]) => {
                    const labelMap = {
                      address: "Address",
                      profile: "Profile",
                      bank: "Bank",
                      demat: "Demat",
                      exchange: "Exchange",
                      ipv: "IPV",
                      signature: "Signature",
                      digitalSign: "Digital Sign",
                    };
                    let icon = null;
                    let colorClass = "";
                    if (value.status === "approved") {
                      icon = (
                        <CheckCircle
                          size={16}
                          color="green"
                          style={{ marginRight: "6px" }}
                        />
                      );
                      colorClass = styles.green;
                    } else if (value.status === "rejected") {
                      icon = (
                        <X
                          size={16}
                          color="red"
                          style={{ marginRight: "6px" }}
                        />
                      );
                      colorClass = styles.red;
                    } else {
                      icon = (
                        <Clock
                          size={16}
                          color="orange"
                          style={{ marginRight: "6px" }}
                        />
                      );
                      colorClass = styles.orange;
                    }
                    return (
                      <span key={key} className={colorClass}>
                        {icon}
                        {labelMap[key]}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          <CustomPagination
            page={page}
            pages={totalPages}
            limit={limit}
            total={totalUsers}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default EsignUserStatus;

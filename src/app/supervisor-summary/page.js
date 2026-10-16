"use client";
import { Calendar, FileDown, Filter, Plus, Search } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useRef, useMemo } from "react";
import styles from "./supervisorSummary.module.css";
import TableBox from "@/pages/supervisorSummaryTable";
import { Icon } from "@iconify/react";
import DateRangePicker from "@/components/DateRangePicker";

const SummaryPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [activeStage, setActiveStage] = useState("Prospects");
  const [search, setSearch] = useState("");
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [summaryData, setSummaryData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const channelMap = {
    all: "ALL",
    ap: "AP",
    rm: "RM",
    direct: "DIRECT",
  };

  const formatToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchUsers = async (tabOverride = null) => {
    try {
      setLoading(true);

      const currentTab = tabOverride || activeTab;
      const params = new URLSearchParams({
        channel: channelMap[currentTab],
        stage: activeStage,
      });

      if (dateRange.start)
        params.append("startDate", formatToDDMMYYYY(dateRange.start));

      if (dateRange.end)
        params.append("endDate", formatToDDMMYYYY(dateRange.end));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/stage-list?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await res.json();

      // Only set table data if fetching for current active tab
      if (currentTab === activeTab) {
        setUsers(result?.data || []);
      }

      // Update counts for all requested tabs
      setAllUsers((prev) => ({
        ...prev,
        [currentTab]: result?.count || result?.data?.length || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for all tabs when stage changes
  const fetchAllTabsForStage = async () => {
    try {
      setLoading(true);
      const tabIds = ["all", "ap", "rm", "direct"];

      const promises = tabIds.map((tab) => {
        const params = new URLSearchParams({
          channel: channelMap[tab],
          stage: activeStage,
        });

        if (dateRange.start)
          params.append("startDate", formatToDDMMYYYY(dateRange.start));

        if (dateRange.end)
          params.append("endDate", formatToDDMMYYYY(dateRange.end));

        return fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/stage-list?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )
          .then((res) => res.json())
          .then((result) => ({
            tab,
            count: result?.count || result?.data?.length || 0,
            data: result?.data || [],
          }));
      });

      const results = await Promise.all(promises);

      // Update all tab counts at once
      const newCounts = {};
      let currentTabData = [];

      results.forEach(({ tab, count, data }) => {
        newCounts[tab] = count;
        if (tab === activeTab) {
          currentTabData = data;
        }
      });

      setAllUsers((prev) => ({ ...prev, ...newCounts }));
      setUsers(currentTabData);
    } catch (error) {
      console.error("Failed to fetch users for all tabs", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryMatrix = async () => {
    try {
      setSummaryLoading(true);

      const params = new URLSearchParams();
      if (dateRange.start)
        params.append("startDate", formatToDDMMYYYY(dateRange.start));
      if (dateRange.end)
        params.append("endDate", formatToDDMMYYYY(dateRange.end));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/summary-matrix?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();
      setSummaryData(json?.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  };

  // When stage changes, fetch for all tabs
  useEffect(() => {
    fetchAllTabsForStage();
  }, [activeStage, dateRange]);

  // When tab changes, fetch only for that tab
  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    fetchSummaryMatrix();
  }, [dateRange]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setVisibleCount(1);
      } else if (window.innerWidth < 900) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1200) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // initial check
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* =====================================================
     6️⃣ DERIVED DATA (YAHAN COUNTS BANTE HAIN)
  ===================================================== */
  // Always show total summary for carousel (doesn't change with tab selection)
  const activeSummary = useMemo(() => {
    if (!summaryData) return {};
    return summaryData.total || {};
  }, [summaryData]);

  // Get channel-specific summary for other purposes if needed
  const channelSummary = useMemo(() => {
    if (!summaryData) return {};
    if (activeTab === "all") return summaryData.total;
    if (activeTab === "ap") return summaryData.ap;
    if (activeTab === "rm") return summaryData.rm;
    return summaryData.direct;
  }, [summaryData, activeTab]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { id: "all", label: "All" },
    { id: "ap", label: "AP" },
    { id: "rm", label: "RM" },
    { id: "direct", label: "Direct" },
  ].map((t) => {
    return {
      ...t,
      count: allUsers[t.id] || 0,
    };
  });

  const clients = [
    {
      clientName: "Mohd. Hasan Khan",
      pan: "ABCDK1234H",
      mobile: "9876543210",
      email: "hasan.khan@example.com",
    },
    {
      clientName: "Sofia Ahmed",
      pan: "PQRSX5678J",
      mobile: "8765432109",
      email: "sofia.ahmed@example.com",
    },
    {
      clientName: "Aman Verma",
      pan: "LMNOP9876T",
      mobile: "7654321098",
      email: "aman.verma@example.com",
    },
    {
      clientName: "Lina Hu",
      pan: "ZXCVB1234R",
      mobile: "9871234567",
      email: "lina.hu@example.com",
    },
    {
      clientName: "Tomás Rivera",
      pan: "QWERT5678Y",
      mobile: "8547963210",
      email: "tomas.rivera@example.com",
    },
    {
      clientName: "Yuki Tanaka",
      pan: "TYUIO3456E",
      mobile: "9123456780",
      email: "yuki.tanaka@example.com",
    },
    {
      clientName: "Priya Patel",
      pan: "ASDFG7890U",
      mobile: "9988776655",
      email: "priya.patel@example.com",
    },
    {
      clientName: "Ravi Kumar",
      pan: "GHJKL2345I",
      mobile: "9090909090",
      email: "ravi.kumar@example.com",
    },
    {
      clientName: "Sofia Ahmed",
      pan: "MNBCV5678L",
      mobile: "8123456700",
      email: "sofia.ahmed2@example.com",
    },
    {
      clientName: "Nasir Khan",
      pan: "LKJHG5432P",
      mobile: "7890654321",
      email: "nasir.khan@example.com",
    },
  ];

  // 🔹 Carousel cards
  const items = [
    "Prospects",
    "Address",
    "Bank",
    "IPV",
    "Esign",
    "Rejection",
    "Sent to B.O",
  ].map((label) => ({
    label,
    count: activeSummary?.[label] ?? 0,
  }));

  const handlePrev = () => {
    setVisibleStart((prev) => Math.max(0, prev - visibleCount));
  };

  const handleNext = () => {
    setVisibleStart((prev) =>
      Math.min(items.length - visibleCount, prev + visibleCount),
    );
  };

  const filteredClients = clients.filter(
    (u) =>
      u.clientName.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.toLowerCase().includes(search.toLowerCase()),
  );

  // Format date to "Jan 15" format
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get button display text
  const getDateRangeText = () => {
    if (!dateRange.start && !dateRange.end) return "Date Range";
    if (dateRange.start && dateRange.end) {
      return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
    }
    return dateRange.start
      ? formatDate(dateRange.start)
      : formatDate(dateRange.end);
  };

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
        <h5 className="mb-0 fw-semibold">Supervisor Summary</h5>
        <nav
          style={{
            "--bs-breadcrumb-divider": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%236c757d'/%3E%3C/svg%3E")`,
          }}
          aria-label="breadcrumb"
        >
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link
                className="text-decoration-none"
                style={{ color: "#FF4800" }}
                href="/dashboard"
              >
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Supervisor Summary
            </li>
          </ol>
        </nav>
      </div>

      {/* <div className="row mt-3 justify-content-center">
        <div className="card-body pt-0">
          <div className="row">
            <div className="col-md-3 mb-2 ms-auto">
              <label className="mb-2">Date</label>
              <div className="input-group" id="DateRange">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Start"
                  aria-label="StartDate"
                />
                <span className="input-group-text">to</span>
                <input
                  type="text"
                  className="form-control rounded-end"
                  placeholder="End"
                  aria-label="EndDate"
                />
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="mx-3">
        <div className="row justify-content-center">
          <div className={`${styles["top-carousel-wrap"]} px-3`}>
            <div className={styles["carousel-container"]}>
              {/* Left Arrow */}
              <div
                className={styles["nav-arrow"]}
                style={{
                  cursor: visibleStart === 0 ? "not-allowed" : "pointer",
                  opacity: visibleStart === 0 ? 0.5 : 1,
                }}
                onClick={handlePrev}
              >
                <Icon icon="mdi:chevron-left" />
              </div>

              {/* Carousel Items */}
              <div className={styles["carousel-inner"]}>
                <div
                  className={styles["carousel-track"]}
                  style={{
                    transform: `translateX(-${
                      visibleStart * (100 / items.length)
                    }%)`,
                    width: `${(items.length / visibleCount) * 100}%`,
                    display: "flex",
                    gap: "16px",
                  }}
                >
                  {/* {items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`${styles["card-box"]} ${
                        item.active ? styles["active"] : ""
                      }`}
                      style={{
                        width: `calc(100% / ${items.length})`,
                        flexShrink: 0,
                        boxSizing: "border-box",
                      }}
                    >
                      <div>
                        <div
                          className={`${styles["label"]} ${
                            item.active ? styles["active"] : ""
                          }`}
                        >
                          {item.label}
                        </div>
                        <div className={styles["count"]}>{item.count}</div>
                      </div>
                    </div>
                  ))}
                  
                  */}
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`${styles["card-box"]} ${
                        activeStage === item.label ? styles["active"] : ""
                      }`}
                      style={{
                        width: `calc(100% / ${items.length})`,
                        flexShrink: 0,
                        boxSizing: "border-box",
                        cursor: "pointer",
                      }}
                      onClick={() => setActiveStage(item.label)}
                    >
                      <div>
                        <div
                          className={`${styles["label"]} ${
                            activeStage === item.label ? styles["active"] : ""
                          }`}
                        >
                          {item.label}
                        </div>
                        <div className={styles["count"]}>{item.count}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Arrow */}
              <div
                className={styles["nav-arrow"]}
                style={{
                  cursor:
                    visibleStart >= items.length - visibleCount
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    visibleStart >= items.length - visibleCount ? 0.5 : 1,
                }}
                onClick={handleNext}
              >
                <Icon icon="mdi:chevron-right" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white mx-3 mb-3 p-0 mt-2 rounded-3 shadow-sm border">
        {/* Title + Search */}
        <div className="d-flex flex-column flex-md-row px-3 mt-3 justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 className="mb-0 fw-semibold" style={{ color: "#1e2129" }}>
            Supervisor Summary
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
                  // value={search}
                  // onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Client name/ ID"
                  className="form-control ps-5"
                  style={{
                    minWidth: 250,
                    background: "#f8f9fa",
                    height: "38px",
                  }}
                />
              </div>
              {/* Filter Icon */}
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 38,
                  height: 38,
                  border: "1px solid #ced4da",
                  borderRadius: 6,
                  backgroundColor: "#F8F9FA",
                  cursor: "pointer",
                }}
                // onClick={handleFilterClick}
              >
                <Filter size={18} stroke={"#585857"} />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center px-3 py-2">
              <div
                className="position-relative d-inline-block me-3"
                ref={dropdownRef}
              >
                <button
                  className="btn btn-outline-secondary d-flex align-items-center"
                  style={{
                    height: "38px",
                    padding: "0 12px",
                    minWidth: "160px",
                    justifyContent: "center",
                  }}
                  onClick={() => setOpen(!open)}
                >
                  <Calendar size={18} className="me-2" />
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    {getDateRangeText()}
                  </span>
                </button>

                {/* Date Range Picker Component */}
                <DateRangePicker
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  open={open}
                  setOpen={setOpen}
                />
              </div>
              <button
                className="btn btn-danger add-button d-flex align-items-center"
                style={{
                  height: "38px",
                  padding: "0 12px",
                }}
                // onClick={onAddUser}
              >
                <FileDown
                  style={{ width: "20px", height: "20px", marginRight: "6px" }}
                />{" "}
                Export CSV
              </button>
            </div>
          </div>
        </div>
        <div className={styles.tabWrapper}>
          <div className={styles.tabHeader}>
            <div className={styles.tabContainer}>
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`${styles.tabItem} ${
                    activeTab === tab.id ? styles.active : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className={styles.tabLabel}>{tab.label}</span>
                  <dfn className={styles.tabCount}>{tab.count}</dfn>
                  {activeTab === tab.id && (
                    <div className={styles.activeLine} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Table Box */}
        <TableBox
          search={search}
          setSearch={setSearch}
          filteredUsers={users}
          loading={loading}
        />
      </div>
    </>
  );
};

export default SummaryPage;

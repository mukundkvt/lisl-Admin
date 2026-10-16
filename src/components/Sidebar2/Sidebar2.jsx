"use client";

import {
  ChevronLeft,
  MapPin,
  UserCircle2,
  Banknote,
  RefreshCcw,
  Eye,
  PenTool,
  FileDown,
  Ban,
  BookKey,
  GitBranch,
  NotebookPen,
  Bug,
  CheckCircle,
  Clock,
  XCircle,
  User,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import styles from "./sidebar2.module.css";
import NProgress from "nprogress";
import { useApprovalStatus } from "@/hooks/useApprovalStatus";

const Sidebar2 = ({ collapsed, setCollapsed }) => {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use custom hook for real-time approval status updates
  const { data: statusData } = useApprovalStatus(id);

  //  URL se tab read karo (refresh ke baad bhi same tab rahega)
  const activePage = searchParams.get("tab") || "address";

  const sidebarItems = [
    { name: "Address Stage/POI", key: "address", icon: <MapPin size={20} /> },
    { name: "Profile Stage", key: "profile", icon: <UserCircle2 size={18} /> },
    { name: "Bank Stage", key: "bank", icon: <Banknote size={18} /> },
    { name: "Exchange Stage", key: "exchange", icon: <RefreshCcw size={18} /> },
    { name: "IPV Stage", key: "ipv", icon: <Eye size={18} /> },
    {
      name: "Digital Signature",
      key: "signature",
      icon: <PenTool size={18} />,
    },
    { name: "PDF Generation", key: "pdf", icon: <FileDown size={18} /> },
    {
      name: "Pushed to BackOffice",
      key: "pushedToBO",
      icon: <User size={18} />,
    },
    { name: "Rejection Reasons", key: "rejection", icon: <Ban size={18} /> },
    { name: "KRA Log", key: "kra", icon: <BookKey size={20} /> },
    {
      name: "Pushed to BO reports",
      key: "boReports",
      icon: <GitBranch size={20} />,
    },
    { name: "Other Logs", key: "otherLogs", icon: <NotebookPen size={20} /> },
    { name: "Error Log", key: "errorLog", icon: <Bug size={20} /> },
  ];

  /* ================= API → SIDEBAR STATUS MAP ================= */
  const statusMapFromApi = statusData
    ? {
        address: statusData.addressStatus,
        profile: statusData.profileStatus,
        bank: statusData.bankStatus,
        exchange: statusData.exchangeStatus,
        ipv: statusData.ipvStatus,
        signature: statusData.digitalSignStatus,
      }
    : {};

  const StatusIcon = ({ status }) => {
    if (status === "approved") {
      return (
        <CheckCircle size={16} className="text-success" title="Approved" />
      );
    } else if (status === "pending") {
      return <Clock size={16} className="text-warning" title="Pending" />;
    } else if (status === "rejected") {
      return <XCircle size={16} className="text-danger" title="Rejected" />;
    } else {
      return null;
    }
  };

  const handleNavClick = (key) => {
    NProgress.start();
    router.push(`?tab=${key}`, { scroll: false }); // ✅ query param update
    // if (window.innerWidth < 768) {
    //   setCollapsed(true);
    // }
  };

  const renderItems = (items) => (
    <div className="nav-section">
      {items.map((item) => {
        const status = statusMapFromApi[item.key];

        return (
          <div
            key={item.key}
            onClick={() => handleNavClick(item.key)}
            className={`nav-item d-flex align-items-center justify-content-between ${
              activePage === item.key ? "active" : ""
            }`}
            style={{ cursor: "pointer" }}
          >
            {/* Left */}
            <div className="d-flex align-items-center">
              <div className="me-3">{item.icon}</div>
              {!collapsed && <span className="label">{item.name}</span>}
            </div>

            {/* Right Status */}
            {!collapsed && status && <StatusIcon status={status} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className={`sidebar ${collapsed ? "collapsed" : ""}`}
      style={{ top: 0, height: "100vh", zIndex: 10001 }}
    >
      {/* Logo + Back Button */}
      <div
        style={{
          position: !collapsed ? "fixed" : "static",
          top: 0,
          left: 0,
          width: collapsed ? 60 : 259,
          background: "#fff",
          zIndex: 20,
          transition: "width 0.3s",
        }}
      >
        <div
          className="logo-container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70px",
          }}
        >
          {collapsed ? (
            <img
              src="/logo-icon.png"
              alt="Logo Icon"
              className="logo collapsed-logo"
            />
          ) : (
            <img
              src="/logo-lakshmishree.png"
              alt="Full Logo"
              className="logo"
              style={{ maxHeight: "80px", width: "auto" }}
            />
          )}
        </div>

        {!collapsed && (
          <div
            className={`${styles.backButtonWrapper}`}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "15px",
              marginLeft: "30px",
            }}
          >
            <button
              className={`btn btn-danger d-flex align-items-center gap-2 ${styles.backButton}`}
              onClick={() => {
                NProgress.start();
                router.push("/all");
              }}
            >
              <ChevronLeft size={20} />
              Back to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Nav */}
      <div
        className={`${styles.customScrollbar}`}
        style={{
          marginTop: !collapsed ? 150 : 50,
          overflowY: "auto",
          height: !collapsed ? "calc(100vh - 170px)" : "calc(100vh - 80px)",
        }}
      >
        <nav className="nav-links">{renderItems(sidebarItems)}</nav>
      </div>
    </div>
  );
};

export default Sidebar2;

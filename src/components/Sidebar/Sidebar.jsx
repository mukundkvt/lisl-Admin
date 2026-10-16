"use client";

// import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  User,
  Settings,
  Menu,
  ChevronLeft,
  GitBranch,
  LayoutDashboard,
  AlertCircle,
  FileText,
  KeyRound,
  LifeBuoy,
  FileCheck2,
  Ban,
  CheckCircle,
  FileClock,
  ClipboardList,
  GitBranchIcon,
  Monitor,
  Upload,
  Sliders,
} from "lucide-react";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";
import { useEffect, useState } from "react";
import SidebarShimmer from "../SidebarSkeleton/SidebarShimmer";
import axios from "axios";
import NProgress from "nprogress";

const Sidebar = ({ collapsed, setCollapsed }) => {
  const pathName = usePathname();
  const [user, setUser] = useState(null);
  const [isCountsLoading, setIsCountsLoading] = useState(true);

  // status counts from API
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    esigned: 0,
    rejected: 0,
    completed: 0,
  });

  const handleNavigate = (url) => {
    NProgress.start(); // click hote hi 25%
    // handleNavClick(); // mobile auto-collapse
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
      else setUser({});
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user) return;

    setIsCountsLoading(true);
    const token = localStorage.getItem("token"); // adjust key if different
    const fetchCounts = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/status-counts`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );

        // support both shapes: { counts: {...} }  OR  { data: {...} }
        const payload = res?.data;
        const counts =
          payload?.counts ?? // preferred shape
          payload?.data ?? // your actual response shape
          payload; // fallback

        if (counts && typeof counts === "object") {
          // ensure numeric values and keep defaults for missing keys
          setStatusCounts((prev) => ({
            // none: Number(counts.none ?? prev.none ?? 0),
            pending: Number(counts.pending ?? prev.pending ?? 0),
            approved: Number(counts.approved ?? prev.approved ?? 0),
            esigned: Number(counts.esigned ?? prev.esigned ?? 0),
            rejected: Number(counts.rejected ?? prev.rejected ?? 0),
            completed: Number(counts.completed ?? prev.completed ?? 0),
          }));
        } else {
          console.warn("Unexpected counts shape:", res?.data);
        }
      } catch (error) {
        console.error("Failed to fetch status counts:", error);
      } finally {
        +setIsCountsLoading(false);
      }
    };

    fetchCounts();
  }, [user]);

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Summary",
      href: "/supervisor-summary",
      icon: <ClipboardList size={18} />, // List icon
    },
    {
      name: "All",
      href: "/all",
      icon: <FileText size={18} />, // Document icon
      count:
        // statusCounts.none +
        statusCounts.pending +
        statusCounts.approved +
        statusCounts.esigned +
        statusCounts.rejected +
        statusCounts.completed,
    },
    {
      name: "Pending",
      href: "/pending",
      icon: <FileClock size={18} />, // Clock icon
      count: statusCounts.pending,
    },
    {
      name: "esign Completed",
      href: "/esigned",
      count: statusCounts.esigned,
      icon: <FileCheck2 size={18} />, // Check file icon
    },
    {
      name: "Approved",
      href: "/approved",
      count: statusCounts.approved,
      icon: <CheckCircle size={18} />, // Green check
    },
    {
      name: "Rejected",
      href: "/rejected",
      count: statusCounts.rejected,
      icon: <Ban size={18} />, // Cancel/ban symbol
    },
    {
      name: "Completed",
      href: "/completed",
      count: statusCounts.completed,
      icon: <FileCheck2 size={18} />, // Check file icon
    },
    {
      name: "Error Details",
      href: "/error-details",
      icon: <AlertCircle size={20} />,
    },
  ];

  const accessRules = [
    {
      condition: (user) =>
        user?.role === "Relationship Manager" ||
        user?.role === "Authorised Person",
      modules: ["A/C Opening URL"],
    },
    {
      condition: (user) => user?.role === "Supervisor",
      modules: ["Master", "E-Sign Settings", "Upload"],
    },
    {
      condition: (user) =>
        user?.role === "Admin" || user?.role === "Supervisor",
      modules: ["Error Details", "Pushed to BO reports"],
    },
    {
      condition: (user) => user?.role === "Admin",
      modules: ["User Management", "Reports", "Branches", "Application Settings"],
    },
    {
      condition: (user) => user?.role !== "Admin",
      modules: [
        "All",
        "Pending",
        "esign Completed",
        "Approved",
        "Rejected",
        "Completed",
      ],
    },
    {
      condition: (user) =>
        user?.role !== "Admin" &&
        user?.role !== "Relationship Manager" &&
        user?.role !== "Authorised Person" &&
        user?.role !== "Branch",
      modules: ["Summary"],
    },
  ];

  const supportItems = [
    // {
    //   name: "Reports",
    //   href: "/reports",
    //   icon: <FileText size={20} />,
    // },
    {
      name: "Reports",
      icon: <FileText size={20} />,
      href: "#",
      children: [
        { name: "Sms log", href: "/reports/sms-logs" },
        { name: "Email log", href: "/reports/email-logs" },
        { name: "Application Log", href: "/reports/application-log" },
      ],
    },
    {
      name: "Pushed to BO reports",
      icon: <GitBranchIcon size={20} />,
      href: "#",
      children: [
        { name: "Successfully Pushed", href: "/bo-reports/success" },
        { name: "Pending Repush", href: "/bo-reports/pending" },
        { name: "Rejected Application", href: "/bo-reports/rejected" },
      ],
    },
    {
      name: "Master",
      icon: <Monitor size={20} />,
      href: "#",
      children: [
        { name: "Schemes Admin", href: "/schemes-admin" },
        { name: "Schemes Mapping", href: "/schemes-assignment" },
        { name: "Delete Ekyc Record", href: "/delete-record" },
        { name: "Client RM Mapping", href: "/client-rm-mapping" },
      ],
    },
    {
      name: "Application Settings",
      icon: <Sliders size={20} />,
      href: "#",
      children: [
        { name: "BSE Mutual Fund", href: "/bse-mutual-fund" },
        { name: "BSE Exchange", href: "/bse-exchange" },
        { name: "NSE Exchange", href: "/nse-exchange" },
        { name: "CDSL DP", href: "/cdsl-dp" },
      ],
    },
    {
      name: "Upload",
      icon: <Upload size={20} />,
      href: "#",
      children: [{ name: "Insta BO Account Upload", href: "/bo-upload" }],
    },
    {
      name: "A/C Opening URL",
      href: "/campaign",
      icon: <User size={20} />,
    },
    {
      name: "Branches",
      href: "/branches",
      icon: <GitBranch size={20} />,
    },
    {
      name: "User Management",
      href: "/user-management",
      icon: <User size={20} />,
    },
    {
      name: "Change Password",
      href: "/change-password",
      icon: <KeyRound size={20} />,
    },
    { name: "E-Sign Settings", href: "/esign-setting", icon: <Settings size={20} /> },
  ];

  // Dropdown open/close state
  const [openDropdown, setOpenDropdown] = useState(null);

  const filterByAccess = (items) => {
    return items.filter((item) => {
      // find all rules that mention this item's name
      const matchingRules = accessRules.filter((rule) =>
        rule.modules.includes(item.name),
      );

      if (matchingRules.length > 0) {
        // show item only if at least one matching rule grants access to current user
        return matchingRules.some((rule) => rule.condition(user));
      }

      // no controlling rule -> always show
      return true;
    });
  };

  const filteredNavigationItems = filterByAccess(navigationItems);
  const filteredSupportItems = filterByAccess(supportItems);
  // Auto-collapse on mobile nav item click
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  };

  const renderSection = (title, items) => (
    <div className="nav-section">
      {!collapsed && <div className="section-title">{title}</div>}

      {items.map((item) => {
        const isLinkable = item.href && item.href !== "#";
        const isActive = pathName?.startsWith(item.href);

        return (
          <div key={item.name} className="w-100">
            {isLinkable ? (
              <Link
                href={item.href}
                // onClick={handleNavClick}
                onClick={() => handleNavigate(item.href)}
                className={`nav-item d-flex align-items-start ${
                  isActive ? "active" : ""
                }`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  flexGrow: 1,
                  minWidth: 0, // prevent extra width
                }}
              >
                {/* Icon section */}
                <div className="d-flex flex-column align-items-center me-2">
                  <span className="icon">{item.icon}</span>
                  {!isCountsLoading && typeof item.count === "number" && item.count > 0 && (
                    <span
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        marginTop: "2px",
                      }}
                      title={`${item.count} records`}
                    ></span>
                  )}
                </div>

                {/* Label + children toggle */}
                {!collapsed && (
                  <span className="label d-flex flex-column flex-grow-1 min-w-0">
                    <span className="d-flex align-items-center justify-content-between">
                      <span>{item.name}</span>

                      {item.children && (
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenDropdown(
                              openDropdown === item.name ? null : item.name,
                            );
                          }}
                          style={{ cursor: "pointer", marginLeft: "8px" }}
                        >
                          <ChevronLeft
                            size={16}
                            style={{
                              transform:
                                openDropdown === item.name
                                  ? "rotate(-90deg)"
                                  : "rotate(0deg)",
                              transition: "transform 0.2s",
                            }}
                          />
                        </span>
                      )}

                      {item.count !== undefined &&
                        // show (...) while loading; after load show actual number (even 0)
                        (isCountsLoading ? (
                          <span
                            className="fst-italic ms-1"
                            style={{ color: "#999" }}
                          >
                            (...)
                          </span>
                        ) : (
                          <span className="fst-italic ms-1">
                            ({item.count})
                          </span>
                        ))}
                    </span>
                  </span>
                )}
              </Link>
            ) : (
              // Non-linkable items
              <div
                className={`nav-item d-flex align-items-start ${
                  isActive ? "active" : ""
                }`}
                style={{ flexGrow: 1, minWidth: 0 }}
              >
                <div className="d-flex flex-column align-items-start me-2">
                  <span className="icon">{item.icon}</span>
                </div>

                {!collapsed && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(
                        openDropdown === item.name ? null : item.name,
                      );
                    }}
                    className="label d-flex flex-column flex-grow-1 min-w-0"
                    style={{ cursor: "pointer" }}
                  >
                    <span className="d-flex align-items-center justify-content-between">
                      <span>{item.name}</span>

                      {item.children && (
                        <span
                          // onClick={(e) => {
                          //   e.stopPropagation();
                          //   setOpenDropdown(
                          //     openDropdown === item.name ? null : item.name
                          //   );
                          // }}
                          style={{ cursor: "pointer", marginLeft: "8px" }}
                        >
                          <ChevronLeft
                            size={16}
                            style={{
                              transform:
                                openDropdown === item.name
                                  ? "rotate(-90deg)"
                                  : "rotate(0deg)",
                              transition: "transform 0.2s",
                            }}
                          />
                        </span>
                      )}
                    </span>
                  </span>
                )}
              </div>
            )}

            {/* Children Dropdown */}
            {!collapsed && item.children && openDropdown === item.name && (
              <div className="dropdown-wrapper drops ps-0">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    // onClick={handleNavClick}
                    onClick={() => handleNavigate(item.href)}
                    className={`nav-item sub-item d-block py-1 ${
                      pathName?.startsWith(child.href) ? "active" : ""
                    }`}
                    style={{
                      fontSize: "13px",
                      color: "#555",
                      textDecoration: "none",
                    }}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  if (user === null) {
    return <SidebarShimmer collapsed={collapsed} />;
  }

  return (
    <div
      className={`sidebar ${collapsed ? "collapsed" : ""}`}
      style={{ top: 0, height: "100vh", zIndex: 1000 }}
    >
      {/* Fixed logo and radio group when expanded */}
      <div
        style={{
          position: !collapsed ? "fixed" : "static",
          top: 0,
          left: 0,
          width: collapsed ? 60 : 240,
          background: "#fff",
          zIndex: 20,
          transition: "width 0.3s",
        }}
      >
        <div className="logo-container">
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
            className="kyctype-selector"
            style={{
              position: "fixed",
              top: 80,
              left: 0,
              width: 240,
              background: "#fff",
              zIndex: 19,
              paddingBottom: 0,
            }}
          >
            <div className="radio-group">
              <label className="radio-wrapper">
                <input
                  type="radio"
                  name="kycOption"
                  value="eKYC"
                  defaultChecked
                />
                <span className="custom-radio">eKYC</span>
              </label>

              <label className="radio-wrapper">
                <input type="radio" name="kycOption" value="ReKYC" />
                <span className="custom-radio">ReKYC</span>
              </label>
            </div>
          </div>
        )}
      </div>
      {/* Scrollable nav below fixed area */}
      <div
        className={`${styles.customScrollbar}`}
        style={{
          marginTop: !collapsed ? 150 : 50,
          overflowY: "auto",
          height: !collapsed ? "calc(100vh - 170px)" : "calc(100vh - 80px)",
        }}
      >
        <nav className="nav-links">
          {renderSection("NAVIGATION", filteredNavigationItems)}
          {renderSection("SETTINGS", filteredSupportItems)}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;

// "use client";

// // import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   Home,
//   User,
//   Settings,
//   Menu,
//   ChevronLeft,
//   GitBranch,
//   LayoutDashboard,
//   AlertCircle,
//   FileText,
//   KeyRound,
//   LifeBuoy,
//   FileCheck2,
//   Ban,
//   CheckCircle,
//   FileClock,
//   ClipboardList,
//   GitBranchIcon,
//   Monitor,
// } from "lucide-react";
// import { usePathname } from "next/navigation";
// import styles from "./sidebar.module.css";
// import { useEffect, useState } from "react";
// import SidebarShimmer from "../SidebarSkeleton/SidebarShimmer";
// import axios from "axios";

// const Sidebar = ({ collapsed, setCollapsed }) => {
//   const pathName = usePathname();
//   const [user, setUser] = useState(null);

//   // status counts from API
//   const [statusCounts, setStatusCounts] = useState({
//     pending: 0,
//     approved: 0,
//     esigned: 0,
//     rejected: 0,
//     completed: 0,
//   });

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedUser = localStorage.getItem("user");
//       if (storedUser) setUser(JSON.parse(storedUser));
//       else setUser({});
//     }
//   }, []);

//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     if (!user) return;

//     const token = localStorage.getItem("token"); // adjust key if different
//     const fetchCounts = async () => {
//       try {
//         const res = await axios.get(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/status-counts`,
//           {
//             headers: token ? { Authorization: `Bearer ${token}` } : {},
//           }
//         );

//         // support both shapes: { counts: {...} }  OR  { data: {...} }
//         const payload = res?.data;
//         const counts =
//           payload?.counts ?? // preferred shape
//           payload?.data ?? // your actual response shape
//           payload; // fallback

//         if (counts && typeof counts === "object") {
//           // ensure numeric values and keep defaults for missing keys
//           setStatusCounts((prev) => ({
//             // none: Number(counts.none ?? prev.none ?? 0),
//             pending: Number(counts.pending ?? prev.pending ?? 0),
//             approved: Number(counts.approved ?? prev.approved ?? 0),
//             esigned: Number(counts.esigned ?? prev.esigned ?? 0),
//             rejected: Number(counts.rejected ?? prev.rejected ?? 0),
//             completed: Number(counts.completed ?? prev.completed ?? 0),
//           }));
//         } else {
//           console.warn("Unexpected counts shape:", res?.data);
//         }
//       } catch (error) {
//         console.error("Failed to fetch status counts:", error);
//       }
//     };

//     fetchCounts();
//   }, [user]);

//   const navigationItems = [
//     {
//       name: "Dashboard",
//       href: "/dashboard",
//       icon: <LayoutDashboard size={20} />,
//     },
//     {
//       name: "Summary",
//       href: "/supervisor-summary",
//       icon: <ClipboardList size={18} />, // List icon
//     },
//     {
//       name: "All",
//       href: "/all",
//       icon: <FileText size={18} />, // Document icon
//       count:
//         // statusCounts.none +
//         statusCounts.pending +
//         statusCounts.approved +
//         statusCounts.esigned +
//         statusCounts.rejected +
//         statusCounts.completed,
//     },
//     {
//       name: "Pending",
//       href: "/pending",
//       icon: <FileClock size={18} />, // Clock icon
//       count: statusCounts.pending,
//     },
//     {
//       name: "esign Completed",
//       href: "/supervisor-esign",
//       count: statusCounts.esigned,
//       icon: <FileCheck2 size={18} />, // Check file icon
//     },
//     {
//       name: "Approved",
//       href: "/approved",
//       count: statusCounts.approved,
//       icon: <CheckCircle size={18} />, // Green check
//     },
//     {
//       name: "Rejected",
//       href: "/rejected",
//       count: statusCounts.rejected,
//       icon: <Ban size={18} />, // Cancel/ban symbol
//     },
//     {
//       name: "Completed",
//       href: "/completed",
//       count: statusCounts.completed,
//       icon: <FileCheck2 size={18} />, // Check file icon
//     },
//     {
//       name: "Error Details",
//       href: "/error-details",
//       icon: <AlertCircle size={20} />,
//     },
//     { name: "Branches", href: "/branches", icon: <GitBranch size={20} /> },
//   ];

//   const accessRules = [
//     {
//       condition: (user) =>
//         user?.role === "Relationship Manager" ||
//         user?.role === "Authorised Person",
//       modules: ["A/C Opening URL"],
//     },
//     {
//       condition: (user) => user?.role === "Supervisor",
//       modules: ["Master"],
//     },
//     {
//       condition: (user) => user?.role === "Admin",
//       modules: ["User Management", "Reports"],
//     },
//   ];

//   const supportItems = [
//     {
//       name: "Reports",
//       href: "/reports",
//       icon: <FileText size={20} />,
//     },
//     {
//       name: "Pushed to BO reports",
//       icon: <GitBranchIcon size={20} />,
//       href: "#",
//       children: [
//         { name: "Successfully Pushed", href: "/bo-reports/success" },
//         { name: "Pending Repush", href: "/bo-reports/pending" },
//         { name: "Rejected Application", href: "/bo-reports/rejected" },
//       ],
//     },
//     {
//       name: "Master",
//       icon: <Monitor size={20} />,
//       href: "#",
//       children: [
//         { name: "Schemes Admin", href: "/schemes-admin" },
//         { name: "Schemes Mapping", href: "/schemes-assignment" },
//         { name: "Delete Ekyc Record", href: "/delete-record" },
//       ],
//     },
//     {
//       name: "A/C Opening URL",
//       href: "/campaign",
//       icon: <User size={20} />,
//     },
//     {
//       name: "User Management",
//       href: "/user-management",
//       icon: <User size={20} />,
//     },
//     {
//       name: "Change Password",
//       href: "/change-password",
//       icon: <KeyRound size={20} />,
//     },
//     { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
//     { name: "Support", href: "/support", icon: <LifeBuoy size={20} /> },
//   ];

//   // Dropdown open/close state
//   const [openDropdown, setOpenDropdown] = useState(null);

//   // const matchedRule = accessRules.find((rule) => rule.condition(user));

//   const filteredSupportItems = supportItems.filter((item) => {
//     // If this item is controlled by a rule
//     const controllingRule = accessRules.find((rule) =>
//       rule.modules.includes(item.name)
//     );
//     if (controllingRule) {
//       // Only show if the current user matches the controlling rule
//       return controllingRule.condition(user);
//     }
//     // Otherwise, always show
//     return true;
//   });
//   // Auto-collapse on mobile nav item click
//   const handleNavClick = () => {
//     if (window.innerWidth < 768) {
//       setCollapsed(true);
//     }
//   };

//   const renderSection = (title, items) => (
//     <div className="nav-section">
//       {!collapsed && <div className="section-title">{title}</div>}

//       {items.map((item) => (
//         <div key={item.name} className="w-100">
//           {/* Main Item (with or without dropdown) */}
//           <div
//             className={`nav-item d-flex align-items-start ${
//               pathName.startsWith(item.href) ? "active" : ""
//             }`}
//           >
//             <Link
//               href={item.href}
//               onClick={handleNavClick}
//               className="d-flex flex-column align-items-start me-2"
//               style={{ textDecoration: "none", color: "inherit" }}
//             >
//               <span className="icon">{item.icon}</span>
//               {item.count !== undefined && (
//                 <span
//                   style={{
//                     width: "4px",
//                     height: "4px",
//                     borderRadius: "50%",
//                     backgroundColor: "green",
//                     marginTop: "1px",
//                   }}
//                 ></span>
//               )}
//             </Link>
//             {!collapsed && (
//               <span className="label d-flex flex-column w-100">
//                 <span className="d-flex align-items-center justify-content-between">
//                   <Link
//                     href={item.href}
//                     onClick={handleNavClick}
//                     style={{ textDecoration: "none", color: "inherit" }}
//                   >
//                     {item.name}
//                   </Link>
//                   {item.children && (
//                     <span
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setOpenDropdown(
//                           openDropdown === item.name ? null : item.name
//                         );
//                       }}
//                       style={{ cursor: "pointer", marginLeft: "8px" }}
//                     >
//                       <ChevronLeft
//                         size={16}
//                         style={{
//                           transform:
//                             openDropdown === item.name
//                               ? "rotate(-90deg)"
//                               : "rotate(0deg)",
//                           transition: "transform 0.2s",
//                         }}
//                       />
//                     </span>
//                   )}
//                   {item.count !== undefined && (
//                     <span className="fst-italic ms-1">({item.count})</span>
//                   )}
//                 </span>
//               </span>
//             )}
//           </div>
//           {/* Children Dropdown */}
//           {!collapsed && item.children && openDropdown === item.name && (
//             <div className="dropdown-wrapper drops ps-0">
//               {item.children.map((child) => (
//                 <Link
//                   key={child.name}
//                   href={child.href}
//                   onClick={handleNavClick}
//                   className={`nav-item sub-item d-block py-1 ${
//                     pathName.startsWith(child.href) ? "active" : ""
//                   }`}
//                   style={{
//                     fontSize: "13px",
//                     color: "#555",
//                     textDecoration: "none",
//                   }}
//                 >
//                   {child.name}
//                 </Link>
//               ))}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );

//   if (user === null) {
//     return <SidebarShimmer collapsed={collapsed} />;
//   }

//   return (
//     <div
//       className={`sidebar ${collapsed ? "collapsed" : ""}`}
//       style={{ top: 0, height: "100vh", zIndex: 1000 }}
//     >
//       {/* Fixed logo and radio group when expanded */}
//       <div
//         style={{
//           position: !collapsed ? "fixed" : "static",
//           top: 0,
//           left: 0,
//           width: collapsed ? 60 : 240,
//           background: "#fff",
//           zIndex: 20,
//           transition: "width 0.3s",
//         }}
//       >
//         <div className="logo-container">
//           {collapsed ? (
//             <img
//               src="/logo-icon.png"
//               alt="Logo Icon"
//               className="logo collapsed-logo"
//             />
//           ) : (
//             <img
//               src="/logo-lakshmishree.png"
//               alt="Full Logo"
//               className="logo"
//               style={{ maxHeight: "80px", width: "auto" }}
//             />
//           )}
//         </div>
//         {!collapsed && (
//           <div
//             className="kyctype-selector"
//             style={{
//               position: "fixed",
//               top: 80,
//               left: 0,
//               width: 240,
//               background: "#fff",
//               zIndex: 19,
//               paddingBottom: 0,
//             }}
//           >
//             <div className="radio-group">
//               <label className="radio-wrapper">
//                 <input
//                   type="radio"
//                   name="kycOption"
//                   value="eKYC"
//                   defaultChecked
//                 />
//                 <span className="custom-radio">eKYC</span>
//               </label>

//               <label className="radio-wrapper">
//                 <input type="radio" name="kycOption" value="ReKYC" />
//                 <span className="custom-radio">ReKYC</span>
//               </label>
//             </div>
//           </div>
//         )}
//       </div>
//       {/* Scrollable nav below fixed area */}
//       <div
//         className={`${styles.customScrollbar}`}
//         style={{
//           marginTop: !collapsed ? 150 : 50,
//           overflowY: "auto",
//           height: !collapsed ? "calc(100vh - 170px)" : "calc(100vh - 80px)",
//         }}
//       >
//         <nav className="nav-links">
//           {renderSection("NAVIGATION", navigationItems)}
//           {renderSection("SUPPORT & SETTINGS", filteredSupportItems)}
//         </nav>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

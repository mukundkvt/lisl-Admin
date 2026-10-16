"use client";

import Breadcrumb from "@/components/Breadcrumb";
import EsignUserStatus from "@/components/EsignUserStatus/EsignUserStatus";
import axios from "axios";
import { format } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const EsignedPage = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [token, setToken] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const path = usePathname();
  const userStatus = path.replace("/", "");
  console.log(userStatus);

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const esignUser = async (req, res) => {
    setLoading(true);
    const start = startDate ? format(startDate, "yyyy/MM/dd") : "";
    const end = endDate ? format(endDate, "yyyy/MM/dd") : "";
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users?&userStatus=${userStatus}&search=${debouncedSearch}&page=${page}&limit=${limit}&startDate=${start}&endDate=${end}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalUsers(res.data.totalUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      esignUser();
    }
  }, [token, page, limit, startDate, endDate, debouncedSearch]);

  // Debounce only for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(handler); // cleanup old timeout
  }, [token, page, limit, search]); // dependencies
  return (
    <>
      <Breadcrumb
        title="Esigned User"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Esigned User" },
        ]}
      />
      <EsignUserStatus
        title="Esigned User"
        onDateChange={handleDateChange}
        users={users}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalUsers={totalUsers}
        limit={limit}
        setPage={setPage}
        setLimit={setLimit}
        handleClick={(user) => {
          router.push(`/profile/${user._id}`); //redirect user detail page
        }}
        search={search}
        setSearch={setSearch}
      />
    </>
  );
};

export default EsignedPage;

// "use client";

// import {
//   Banknote,
//   Calendar,
//   CheckCircle,
//   ChevronDown,
//   Clock,
//   Cross,
//   FileText,
//   Filter,
//   Home,
//   IdCard,
//   Mail,
//   Pen,
//   Phone,
//   Plus,
//   Repeat,
//   Search,
//   User,
//   X,
// } from "lucide-react";
// import Link from "next/link";
// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import styles from "./supervisorEsign.module.css";
// import CustomPagination from "@/components/CustomPagination/CustomPagination";
// import ClientSkeletonCard from "@/components/ClientSkeletonCard/ClientSkeletonCard";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import Breadcrumb from "@/components/Breadcrumb";
// import DatePicker from "react-datepicker";
// import { format } from "date-fns";

// const EsignPage = () => {
//   const [activeTab, setActiveTab] = useState("all");
//   const [selectedStage, setSelectedStage] = useState("Address Stage");
//   const [stageOpen, setStageOpen] = useState(false);
//   const [selectedStatus, setSelectedStatus] = useState("All");
//   const [statusOpen, setStatusOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [token, setToken] = useState(null);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [users, setUsers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState(search);

//   // console.log("User", users);
//   const tabs = [
//     { id: "all", label: "All", count: 18 },
//     { id: "ap", label: "AP", count: 6 },
//     { id: "rm", label: "RM", count: 12 },
//     { id: "direct", label: "Direct", count: 8 },
//   ];

//   const [visible, setVisible] = useState(false);
//   const router = useRouter();

//   const handleFilterClick = () => {
//     setVisible(!visible);
//   };

//   const documents = [
//     { name: "Annexure Documents", status: "pending" },
//     { name: "DigiLocker XML", status: "pending" },
//     { name: "Photo for CKYC", status: "done" },
//     { name: "POA for CKYC", status: "done" },
//     { name: "Signature for CKYC", status: "done" },
//   ];

//   const documents2 = [
//     { name: "eKYC to KYC Conversion", status: "done" },
//     { name: "Update CKYC Status", status: "done" },
//     { name: "Push to Client Master", status: "done" },
//   ];

//   const documents3 = [
//     { name: "BSE Upload", status: "done" },
//     { name: "NSE Upload", status: "pending" },
//     { name: "CAMS KRA Upload", status: "done" },
//   ];

//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     if (storedToken) {
//       setToken(storedToken);
//     }
//   }, []);

//   const esignUser = async (req, res) => {
//     const start = startDate ? format(startDate, "yyyy/MM/dd") : "";
//     const end = endDate ? format(endDate, "yyyy/MM/dd") : "";
//     try {
//       const res = await axios.get(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users?&search=${debouncedSearch}&page=${page}&limit=${limit}&startDate=${start}&endDate=${end}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setUsers(res.data.data);
//       setTotalPages(res.data.totalPages);
//       setTotalUsers(res.data.totalUsers);
//       setLoading(false);
//     } catch (error) {}
//   };

//   useEffect(() => {
//     if (token) {
//       esignUser();
//     }
//   }, [token, page, limit, startDate, endDate, debouncedSearch]);

//   // Debounce only for search
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearch(search);
//     }, 500);

//     return () => clearTimeout(handler); // cleanup old timeout
//   }, [token, page, limit, search]); // dependencies

//   const handleClick = (user) => {
//     router.push(`/esigned/${user._id}`); // jaise hi click hoga, user page pe chale jaayega
//   };

//   return (
//     <>
//       <Breadcrumb
//         title="Esign Completed Applications"
//         breadcrumbs={[
//           { label: "Dashboard", href: "/dashboard" },
//           { label: "Esign Completed" },
//         ]}
//       />

//       <div className="bg-white mx-3 p-0 mt-2 rounded-3 shadow-sm border">
//         {/* Title + Search */}
//         <div className="d-flex flex-column flex-md-row px-3 mt-3 justify-content-between align-items-center mb-3 flex-wrap gap-2">
//           <h5 className="mb-0 fw-semibold" style={{ color: "#1e2129" }}>
//             Esign Completed Applications
//           </h5>
//           <div className="d-flex flex-column flex-md-row align-items-center gap-0">
//             <div className="d-flex align-items-center gap-3">
//               <div className="position-relative">
//                 <Search
//                   size={16}
//                   className="text-muted position-absolute"
//                   style={{
//                     left: 12,
//                     top: "50%",
//                     transform: "translateY(-50%)",
//                     pointerEvents: "none",
//                   }}
//                 />
//                 <input
//                   type="text"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Search by Name, PAN, City, Pincode"
//                   className="form-control ps-5"
//                   style={{
//                     minWidth: 250,
//                     background: "#f8f9fa",
//                     height: "38px",
//                   }}
//                 />
//               </div>
//               {/* Filter Icon */}
//               <div
//                 className={`filter-icon-wrapper d-flex align-items-center justify-content-center ${
//                   visible ? "active" : ""
//                 }`}
//                 style={{
//                   width: 38,
//                   height: 38,
//                   border: "1px solid #ced4da",
//                   borderRadius: 6,
//                   cursor: "pointer",
//                 }}
//                 onClick={handleFilterClick}
//               >
//                 <Filter size={18} stroke={visible ? "#ff5c00" : "#585857"} />
//               </div>
//             </div>
//             <div className="d-flex justify-content-between align-items-center px-3 py-2">
//               <button
//                 className="btn btn-danger add-button d-flex align-items-center"
//                 style={{
//                   height: "38px",
//                   padding: "0 12px",
//                 }}
//                 // onClick={onAddUser}
//               >
//                 <Plus
//                   style={{ width: "20px", height: "20px", marginRight: "6px" }}
//                 />{" "}
//                 Add New User
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* dropdown */}

//         {visible && (
//           <div
//             className="row mt-3 mb-5 p-2 justify-content-start"
//             style={{ background: "#FFF7F0", position: "relative" }}
//           >
//             <div className="card-body pt-0">
//               <div className="row justify-content-start mb-3 position-relative">
//                 <div className="col-md-6 mb-2">
//                   <label
//                     className="mb-2 fw-semibold"
//                     style={{ color: "#656D9A" }}
//                   >
//                     Date
//                   </label>
//                   <div className="input-group" id="DateRange">
//                     <DatePicker
//                       selected={startDate}
//                       onChange={(date) => setStartDate(date)}
//                       selectsStart
//                       startDate={startDate}
//                       endDate={endDate}
//                       dateFormat="yyyy/MM/dd"
//                       placeholderText="Start (YYYY/MM/DD)"
//                       className="form-control"
//                       style={{ background: "#F8F9FB" }}
//                     />
//                     <span className="input-group-text">to</span>
//                     <DatePicker
//                       selected={endDate}
//                       onChange={(date) => setEndDate(date)}
//                       selectsEnd
//                       startDate={startDate}
//                       endDate={endDate}
//                       minDate={startDate}
//                       dateFormat="yyyy/MM/dd"
//                       placeholderText="End (YYYY/MM/DD)"
//                       className="form-control rounded-end"
//                       style={{ background: "#F8F9FB" }}
//                     />
//                   </div>
//                 </div>
//                 {/* Close Button in Top-Right Corner */}
//                 <div className="ms-auto" style={{ width: "auto" }}>
//                   <button
//                     className="btn-close position-absolute top-0 end-0 m-0"
//                     aria-label="Close"
//                     onClick={() => setVisible(false)}
//                     style={{ float: "right" }}
//                   ></button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className={styles.tabWrapper}>
//           <div className={styles.tabHeader}>
//             <div className={styles.tabContainer}>
//               {tabs.map((tab) => (
//                 <div
//                   key={tab.id}
//                   className={`${styles.tabItem} ${
//                     activeTab === tab.id ? styles.active : ""
//                   }`}
//                   onClick={() => setActiveTab(tab.id)}
//                 >
//                   <span className={styles.tabLabel}>{tab.label}</span>
//                   <dfn className={styles.tabCount}>{tab.count}</dfn>
//                   {activeTab === tab.id && (
//                     <div className={styles.activeLine} />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//         <div className={styles.tabContent}>
//           {activeTab === "all" && (
//             <div className={styles.clientWrapper}>
//               <div className={styles.headerRow}>
//                 <div>Client Name / Code</div>
//                 <div>PAN / Created On</div>
//                 <div>Contact Details</div>
//                 <div
//                   className="px-2 px-md-5 text-center"
//                   style={{ whiteSpace: "nowrap" }}
//                 >
//                   Esign Date
//                 </div>
//               </div>

//               {loading ? (
//                 Array.from({ length: 5 }).map((_, i) => (
//                   <ClientSkeletonCard key={i} />
//                 ))
//               ) : users.length === 0 ? (
//                 <div
//                   className="text-center py-4 text-muted"
//                   style={{ background: "#F8F9FB" }}
//                 >
//                   No user found
//                 </div>
//               ) : (
//                 users.map((user) => (
//                   <div className={styles.clientBlock} key={user?._id}>
//                     <div className={styles.clientName}>
//                       <div
//                         className={`${styles.clientIcon} ${
//                           user.gender === "male" ? styles.blue : ""
//                         }`}
//                       >
//                         <img
//                           src={
//                             user.gender === "male" ? "/boy.png" : "/girl.png"
//                           }
//                           alt="avatar"
//                         />
//                       </div>
//                       <div className={styles.clientInfo}>
//                         <div
//                           onClick={() => handleClick(user)}
//                           style={{ cursor: "pointer" }}
//                         >
//                           <strong style={{ color: "#F25C05" }}>
//                             {user.name || "N/A"}
//                           </strong>
//                         </div>
//                         <div style={{ color: "#1E2129" }}>
//                           {user.code || "N/A"}
//                         </div>
//                       </div>
//                     </div>

//                     <div
//                       className={styles.clientPan}
//                       style={{ color: "#1E2129" }}
//                     >
//                       {user.PAN || "N/A"}
//                       <br />
//                       {user.createdAt}
//                     </div>

//                     <div
//                       className={styles.clientContact}
//                       style={{ color: "#1E2129" }}
//                     >
//                       <div>
//                         <Phone
//                           size={16}
//                           style={{ marginRight: "6px", color: "#ff5f00" }}
//                         />
//                         {user.mobileNumber}
//                       </div>
//                       <div style={{ color: "#1E2129" }}>
//                         <Mail
//                           size={16}
//                           style={{ marginRight: "6px", color: "#ff5f00" }}
//                         />
//                         {user.email}
//                       </div>
//                     </div>

//                     <div className={styles.clientEsign}>
//                       <span className={styles.pendingBtn}>Pending Action</span>
//                     </div>

//                     {/* <div className={styles.infoBlock}>
//                         KRA with Aadhar based account opening &nbsp;&nbsp;
//                         {user.referredBy ? (<strong>
//                           {user?.referredBy?.role}: {user?.referredBy?.name},{" "}
//                           {user?.rmPhone || "N/A"}
//                         </strong>{" "}
//                         &nbsp;&nbsp; IPV by (Emp Code): {user?.referredBy?.employeeId}): "Direct"}
//                       </div> */}
//                     <div className={styles.infoBlock}>
//                       KRA with Aadhar based account opening &nbsp;&nbsp;
//                       {user.referredBy &&
//                       Object.keys(user.referredBy).length > 0 ? (
//                         <>
//                           <strong>
//                             {user.referredBy.role}: {user.referredBy.name},{" "}
//                             {user.mobileNumber || "N/A"}
//                           </strong>
//                           &nbsp;&nbsp; IPV by (Emp Code):{" "}
//                           {user.referredBy.employeeId || "N/A"}
//                         </>
//                       ) : (
//                         <strong>Direct</strong>
//                       )}
//                     </div>

//                     <div className={styles.statusIcons}>
//                       {Object.entries(user.approvals || {}).map(
//                         ([key, value]) => {
//                           const labelMap = {
//                             address: "Address",
//                             profile: "Profile",
//                             bank: "Bank",
//                             demat: "Demat",
//                             exchange: "Exchange",
//                             ipv: "IPV",
//                             digitalSign: "Digital Sign",
//                           };
//                           let icon = null;
//                           let colorClass = "";
//                           if (value.status === "approved") {
//                             icon = (
//                               <CheckCircle
//                                 size={16}
//                                 color="green"
//                                 style={{ marginRight: "6px" }}
//                               />
//                             );
//                             colorClass = styles.green;
//                           } else if (value.status === "rejected") {
//                             icon = (
//                               <X
//                                 size={16}
//                                 color="red"
//                                 style={{ marginRight: "6px" }}
//                               />
//                             );
//                             colorClass = styles.red;
//                           } else {
//                             icon = (
//                               <Clock
//                                 size={16}
//                                 color="orange"
//                                 style={{ marginRight: "6px" }}
//                               />
//                             );
//                             colorClass = styles.orange;
//                           }
//                           return (
//                             <span key={key} className={colorClass}>
//                               {icon}
//                               {labelMap[key]}
//                             </span>
//                           );
//                         }
//                       )}
//                     </div>

//                     {/* Document Uploads */}
//                     {/* <div className={`my-1 bg-white ${styles.gridFullRow}`}>
//                         <h5 className="mb-2" style={{ fontSize: "15px" }}>
//                           Document Uploads
//                         </h5>
//                         <div
//                           className={`${styles.gridFullRow} p-2 bg-white rounded border`}
//                         >
//                           <div className="d-flex flex-wrap gap-5">
//                             {documents.map((doc, idx) => (
//                               <div
//                                 key={idx}
//                                 className="d-flex align-items-center me-4"
//                               >
//                                 {doc.status === "done" ? (
//                                   <CheckCircle
//                                     className="text-success me-2"
//                                     size={18}
//                                   />
//                                 ) : (
//                                   <Clock
//                                     className="text-warning me-2"
//                                     size={18}
//                                   />
//                                 )}
//                                 <span className="text-dark">{doc.name}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div> */}

//                     {/* Data Processing  */}
//                     {/* <div className={`my-1 bg-white ${styles.gridFullRow}`}>
//                         <h5 className="mb-2" style={{ fontSize: "15px" }}>
//                           Data Processing
//                         </h5>
//                         <div
//                           className={`${styles.gridFullRow} p-2 bg-white rounded border`}
//                         >
//                           <div className="d-flex flex-wrap gap-5">
//                             {documents2.map((doc, idx) => (
//                               <div
//                                 key={idx}
//                                 className="d-flex align-items-center me-4"
//                               >
//                                 {doc.status === "done" ? (
//                                   <CheckCircle
//                                     className="text-success me-2"
//                                     size={18}
//                                   />
//                                 ) : (
//                                   <Clock
//                                     className="text-warning me-2"
//                                     size={18}
//                                   />
//                                 )}
//                                 <span className="text-dark">{doc.name}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div> */}

//                     {/* Exchange/Perform Uploads */}
//                     {/* <div className={`my-1 bg-white ${styles.gridFullRow}`}>
//                         <h5 className="mb-2" style={{ fontSize: "15px" }}>
//                           Exchange/Perform Uploads
//                         </h5>
//                         <div
//                           className={`${styles.gridFullRow} p-2 bg-white rounded border`}
//                         >
//                           <div className="d-flex flex-wrap gap-5">
//                             {documents3.map((doc, idx) => (
//                               <div
//                                 key={idx}
//                                 className="d-flex align-items-center me-4"
//                               >
//                                 {doc.status === "done" ? (
//                                   <CheckCircle
//                                     className="text-success me-2"
//                                     size={18}
//                                   />
//                                 ) : (
//                                   <Clock
//                                     className="text-warning me-2"
//                                     size={18}
//                                   />
//                                 )}
//                                 <span className="text-dark">{doc.name}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div> */}
//                   </div>
//                 ))
//               )}
//               <CustomPagination
//                 page={page}
//                 pages={totalPages}
//                 limit={limit}
//                 total={totalUsers}
//                 onPageChange={setPage}
//                 onLimitChange={(newLimit) => {
//                   setLimit(newLimit);
//                   setPage(1); // limit change hote hi page reset
//                 }}
//               />
//             </div>
//           )}
//           {activeTab === "ap" && <p>AP Content</p>}
//           {activeTab === "rm" && <p>RM Content</p>}
//           {activeTab === "direct" && <p>Direct Content</p>}
//         </div>
//       </div>
//     </>
//   );
// };

// export default EsignPage;

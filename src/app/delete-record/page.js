// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// const DeleteEkycRecord = () => {
//   const [query, setQuery] = useState(""); // user input (PAN/email/mobile)
//   const [clientName, setClientName] = useState("");
//   const [clientId, setClientId] = useState("");
//   const [reason, setReason] = useState(""); // renamed from remarks
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [userSigned, setUserSigned] = useState(true); // track signed status
//   const [token, setToken] = useState(null);

//   // Get token from localStorage
//   useEffect(() => {
//     const storedToken = localStorage.getItem("token");
//     if (storedToken) setToken(storedToken);
//   }, []);

//   // Validation functions
//   const isValidPAN = (value) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value);
//   const isValidEmail = (value) =>
//     /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
//   const isValidMobile = (value) => /^[6-9][0-9]{9}$/.test(value);

//   // API call function
//   const fetchUser = async (searchValue) => {
//     if (!searchValue) {
//       setClientName("");
//       setUserSigned(true);
//       setError("");
//       return;
//     }

//     // Only call API if input is valid
//     if (
//       !isValidPAN(searchValue) &&
//       !isValidEmail(searchValue) &&
//       !isValidMobile(searchValue)
//     ) {
//       setClientName("");
//       setUserSigned(true);
//       setError("Invalid input format");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `${
//           process.env.NEXT_PUBLIC_API_URL
//         }/api/admin/user/master-search?search=${encodeURIComponent(
//           searchValue
//         )}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       // console.log(res.data)

//       if (res.data.success && res.data.user) {
//         const { fullName } = res.data.user.name;
//         setClientName(fullName);
//         setUserSigned(res.data.user.signed);
//         setClientId(res.data.user.id);
//         setError("");
//       } else if (res.data.message) {
//         setClientName("");
//         setUserSigned(true);
//         setError(res.data.message);
//       } else {
//         setClientName("");
//         setUserSigned(true);
//         setError("User not found");
//       }
//     } catch (err) {
//       setClientName("");
//       setUserSigned(true);
//       setError(err.response?.data?.message || "Error fetching user");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const value = e.target.value.trim().toUpperCase(); // PAN usually uppercase
//     setQuery(value);
//     fetchUser(value);
//   };

//   const handleDelete = async () => {
//     if (!clientId) {
//       toast.error("No user selected for deletion");
//       return;
//     }
//     if (!reason.trim()) {
//       toast.error("Reason is required!");
//       return;
//     }

//     try {
//       const res = await axios.delete(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/master-delete/${clientId}`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           data: { reason }, // 👈 yaha body me reason send karo
//         }
//       );

//       if (res.data.success) {
//         toast.success(`User ${clientName} deleted successfully!`);
//         setQuery("");
//         setClientName("");
//         setClientId("");
//         setReason("");
//       } else {
//         toast.error(res.data.message || "Failed to delete user");
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Something went wrong!");
//       console.error(error);
//     }
//   };

//   return (
//     <div className="mt-5 mx-5">
//       <div className="mb-2">
//         <input
//           type="text"
//           className="form-control"
//           value={query}
//           onChange={handleInputChange}
//           placeholder="Enter PAN / Email / Mobile"
//         />
//       </div>

//       {loading && <p>Loading...</p>}

//       {clientName && (
//         <div className="mb-3">
//           <label className="form-label">Client Name: </label>
//           <span className="p-2">{clientName}</span>
//         </div>
//       )}

//       {error && <p className="text-danger">{error}</p>}

//       <div className="mb-3">
//         <label htmlFor="reason" className="form-label">
//           Reason
//         </label>
//         <textarea
//           id="reason"
//           className="form-control"
//           value={reason}
//           onChange={(e) => setReason(e.target.value)}
//           placeholder="Enter reason here..."
//           rows={3}
//         ></textarea>
//       </div>

//       <button
//         className="btn btn-danger"
//         onClick={handleDelete}
//         disabled={userSigned} // false → disabled, true → enabled
//       >
//         Delete
//       </button>
//     </div>
//   );
// };

// export default DeleteEkycRecord;

"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";

const DeleteEkycRecord = () => {
  const [query, setQuery] = useState(""); // user input (PAN/email/mobile)
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");
  const [reason, setReason] = useState(""); // remarks
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userSigned, setUserSigned] = useState(true); // track signed status
  const [token, setToken] = useState(null);

  const typingTimeoutRef = useRef(null); // debounce ref

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  // Validation functions
  const isValidPAN = (value) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value);
  const isValidEmail = (value) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
  const isValidMobile = (value) => /^[6-9][0-9]{9}$/.test(value);

  // API call function
  const fetchUser = async (searchValue) => {
    if (!searchValue) {
      setClientName("");
      setUserSigned(true);
      setError("");
      return;
    }

    // Only call API if input is valid
    if (
      !isValidPAN(searchValue) &&
      !isValidEmail(searchValue) &&
      !isValidMobile(searchValue)
    ) {
      setClientName("");
      setUserSigned(true);
      setError("Invalid input format");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/admin/user/master-search?search=${encodeURIComponent(
          searchValue
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success && res.data.user) {
        const { fullName } = res.data.user.name;
        setClientName(fullName);
        setUserSigned(res.data.user.signed);
        setClientId(res.data.user.id);
        setError("");
      } else if (res.data.message) {
        setClientName("");
        setUserSigned(true);
        setError(res.data.message);
      } else {
        setClientName("");
        setUserSigned(true);
        setError("User not found");
      }
    } catch (err) {
      setClientName("");
      setUserSigned(true);
      setError(err.response?.data?.message || "Error fetching user");
    } finally {
      setLoading(false);
    }
  };

  // Debounced input handler
  const handleInputChange = (e) => {
    const value = e.target.value.trim().toUpperCase();
    setQuery(value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      fetchUser(value);
    }, 900); //debounce 900ms
  };

  // cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleDelete = async () => {
    if (!clientId) {
      toast.error("No user selected for deletion");
      return;
    }
    if (!reason.trim()) {
      toast.error("Reason is required!");
      return;
    }

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/user/master-delete/${clientId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          data: { reason },
        }
      );

      if (res.data.success) {
        toast.success(`User ${clientName} deleted successfully!`);
        setQuery("");
        setClientName("");
        setClientId("");
        setReason("");
      } else {
        toast.error(res.data.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
      console.error(error);
    }
  };

  return (
    <>
      <Breadcrumb
        title="Delete Ekyc Record"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Delete Ekyc Record" },
        ]}
      />

      <div className="mt-5 mx-5">
        <div className="mb-2">
          <input
            type="text"
            className="form-control"
            value={query}
            onChange={handleInputChange}
            placeholder="Enter PAN / Email / Mobile"
          />
        </div>

        {loading && <p>Loading...</p>}

        {clientName && (
          <div className="mb-3">
            <label className="form-label">Client Name: </label>
            <span className="p-2">{clientName}</span>
          </div>
        )}

        {error && <p className="text-danger">{error}</p>}

        {!userSigned && (
          <div>
            <div className="mb-3">
              <label htmlFor="reason" className="form-label">
                Reason
              </label>
              <textarea
                id="reason"
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason here..."
                rows={3}
              ></textarea>
            </div>

            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default DeleteEkycRecord;

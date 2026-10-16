// "use client";

// import Breadcrumb from "@/components/Breadcrumb";
// import { Eye, EyeOff, Lock } from "lucide-react";
// import { useState, useRef } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import { useRouter } from "next/navigation";

// export default function ChangePasswordForm() {
//   const router = useRouter();
//   const oldRef = useRef(null);
//   const newRef = useRef(null);

//   const [showOld, setShowOld] = useState(false);
//   const [showNew, setShowNew] = useState(false);

//   const [formData, setFormData] = useState({
//     employeeId: "AKSH123",
//     name: "Aakash Sharma",
//     oldPassword: "",
//     newPassword: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     // clear previous error while typing
//     if (error) setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // client-side validation
//     if (!formData.oldPassword || !formData.newPassword) {
//       setError("Both fields are required!");
//       return;
//     }
//     if (formData.newPassword.length < 8) {
//       setError("New password must be at least 8 characters long!");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const token = localStorage.getItem("token"); // adjust if token stored elsewhere

//       const res = await axios.post(
//         `${process.env.NEXT_PUBLIC_API_URL}/admin/change-password`,
//         {
//           oldPassword: formData.oldPassword,
//           newPassword: formData.newPassword,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             ...(token ? { Authorization: `Bearer ${token}` } : {}),
//           },
//         }
//       );

//       // Some APIs return 200 with { success: false, message: '...' }
//       if (res?.data && res.data.success === false) {
//         const msg = res.data.message || "Failed to change password";
//         setError(msg);
//         toast.error(msg);

//         // if it's specifically invalid old password, clear & focus the old password field
//         if (msg.toLowerCase().includes("old")) {
//           setFormData((prev) => ({ ...prev, oldPassword: "" }));
//           oldRef.current?.focus();
//         }
//       } else {
//         // success
//         toast.success(res.data?.message || "Password changed successfully ✅");
//         setFormData((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
//         setError("");
//       }
//     } catch (err) {
//       console.error("Change password error:", err);

//       // axios error handling
//     //   const status = err?.response?.status;
//       const serverMsg = err?.response?.data?.message;
//       const msg = serverMsg || err.message || "Something went wrong!";

//       setError(msg);
//       toast.error(msg);

//       // if unauthorized, redirect to login (optional)
//     //   if (status === 401) {
//     //     toast.error("Session expired. Please login again.");
//     //     router.push("/login");
//     //   }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Breadcrumb
//         title="Change Password"
//         breadcrumbs={[
//           { label: "Dashboard", href: "/dashboard" },
//           { label: "Change Password" },
//         ]}
//       />

//       <div className="container d-flex justify-content-center align-items-center mt-5">
//         <div
//           className="border shadow-sm p-4"
//           style={{
//             maxWidth: "600px",
//             width: "100%",
//             borderRadius: "8px",
//             background: "#fff",
//           }}
//         >
//           {/* Heading */}
//           <h5 className="mb-1" style={{ fontWeight: "600" }}>
//             Change Password
//           </h5>
//           <p className="text-muted" style={{ fontSize: "14px" }}>
//             Update existing user password with new credentials
//           </p>

//           {/* Employee Info */}
//           <div
//             className="d-flex mb-3"
//             style={{
//               border: "1px solid #ddd",
//               borderRadius: "6px",
//               background: "#f8f9fa",
//               fontSize: "14px",
//               overflow: "hidden",
//             }}
//           >
//             <div className="flex-fill p-2">
//               <strong>Employee ID</strong> – {formData.employeeId}
//             </div>
//             <div
//               className="flex-fill p-2"
//               style={{
//                 borderLeft: "1px solid #ddd",
//               }}
//             >
//               <strong>Name</strong> – {formData.name}
//             </div>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit}>
//             <div className="row g-3">
//               {/* Old Password */}
//               <div className="col-md-6">
//                 <label className="form-label" style={{ color: "#656D9A", fontSize: "14px" }}>
//                   Old Password <span className="text-danger">*</span>
//                 </label>
//                 <div className="input-group">
//                   <input
//                     ref={oldRef}
//                     type={showOld ? "text" : "password"}
//                     className="form-control"
//                     name="oldPassword"
//                     placeholder="Enter old password"
//                     value={formData.oldPassword}
//                     onChange={handleChange}
//                     style={{ background: "#F8F9FB" }}
//                   />
//                   <button
//                     type="button"
//                     className="btn btn-outline-secondary"
//                     onClick={() => setShowOld(!showOld)}
//                   >
//                     {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//               </div>

//               {/* New Password */}
//               <div className="col-md-6">
//                 <label className="form-label" style={{ color: "#656D9A", fontSize: "14px" }}>
//                   New Password <span className="text-danger">*</span>
//                 </label>
//                 <div className="input-group">
//                   <input
//                     ref={newRef}
//                     type={showNew ? "text" : "password"}
//                     className="form-control"
//                     name="newPassword"
//                     placeholder="Enter new password"
//                     value={formData.newPassword}
//                     onChange={handleChange}
//                     style={{ background: "#F8F9FB" }}
//                   />
//                   <button
//                     type="button"
//                     className="btn btn-outline-secondary"
//                     onClick={() => setShowNew(!showNew)}
//                   >
//                     {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
//                   </button>
//                 </div>
//                 <small style={{ color: "#96A0B5", fontSize: "12px" }}>
//                   Minimum 8 characters with uppercase, lowercase, numbers, and symbols
//                 </small>
//               </div>
//             </div>

//             {/* Error */}
//             {error && <div className="text-danger small mt-2">{error}</div>}

//             {/* Footer */}
//             <div className="d-flex justify-content-end align-items-center mt-4 gap-3">
//               <button
//                 type="button"
//                 className="btn btn-light"
//                 onClick={() => {
//                   // optional: clear fields or navigate back
//                   setFormData((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
//                   setError("");
//                 }}
//                 disabled={loading}
//               >
//                 Cancel
//               </button>

//               <button
//                 className="btn d-flex align-items-center"
//                 style={{ background: "linear-gradient(180deg, #FF2200, #FF7700)", color: "#fff" }}
//                 type="submit"
//                 disabled={loading}
//               >
//                 <Lock size={16} className="me-1" /> {loading ? "Updating..." : "Change Password"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import Breadcrumb from "@/components/Breadcrumb";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export default function ChangePasswordPage() {
  const oldRef = useRef(null);
  const newRef = useRef(null);
  const confirmRef = useRef(null);

  const [user, setUser] = useState({});

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser)); // safely parse string → object
      } catch (err) {
        console.error("Error parsing user from localStorage", err);
        setUser(null);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // client-side validation
    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("All fields are required!");
      return;
    }
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long!");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and Confirm password do not match!");
      confirmRef.current?.focus();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/change-password`,
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (res?.data && res.data.success === false) {
        const msg = res.data.message || "Failed to change password";
        setError(msg);
        toast.error(msg);

        if (msg.toLowerCase().includes("old")) {
          setFormData((prev) => ({ ...prev, oldPassword: "" }));
          oldRef.current?.focus();
        }
      } else {
        toast.success(res.data?.message || "Password changed successfully ✅");
        setFormData((prev) => ({
          ...prev,
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setError("");
      }
    } catch (err) {
      console.error("Change password error:", err);
      const serverMsg = err?.response?.data?.message;
      const msg = serverMsg || err.message || "Something went wrong!";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb
        title="Change Password"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Change Password" },
        ]}
      />

      {/* Top Image */}
      <div className="text-center mt-5">
        <img
          src="change-password.png" // public/images folder ke andar file
          alt="Change Password"
          width={100}
          // height={60}
          // style={{ borderRadius: "50%" }}
        />
      </div>

      <div
        className="container d-flex justify-content-center align-items-start mt-1"
        style={{ minHeight: "50vh" }}
      >
        <div
          className="p-4 w-100"
          style={{
            maxWidth: "400px",
            borderRadius: "12px",
            background: "#fff",
          }}
        >
          <div className="text-center">
            <h3 className="mb-2" style={{ fontWeight: "600", color: "#333" }}>
              Change Password
            </h3>
            <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
              Securely update your account password
            </p>
          </div>

          {/* Employee Info */}
          {/* <div
            className="d-flex mb-4"
            style={{
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#f8f9fa",
              fontSize: "14px",
              overflow: "hidden",
            }}
          >
            <div className="flex-fill p-2">
              <strong>Employee ID</strong> – {formData.employeeId}
            </div>
            <div
              className="flex-fill p-2"
              style={{
                borderLeft: "1px solid #ddd",
              }}
            >
              <strong>Name</strong> – {formData.name}
            </div>
          </div> */}
          {/* <div className="mb-4">
            <p className="mb-1 text-muted" style={{ fontSize: "14px" }}>
              <strong>Employee ID:</strong> {user.employeeId}
            </p>
            <p className="mb-0 text-muted" style={{ fontSize: "14px" }}>
              <strong>Name:</strong> {user.loginName}
            </p>
          </div> */}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Old Password */}
              <div className="col-md-12">
                <label
                  className="form-label"
                  style={{ color: "#656D9A", fontSize: "14px" }}
                >
                  Old Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    ref={oldRef}
                    type={showOld ? "text" : "password"}
                    className="form-control"
                    name="oldPassword"
                    placeholder="Enter old password"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    style={{ background: "#F8F9FB" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowOld(!showOld)}
                  >
                    {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="col-md-12">
                <label
                  className="form-label"
                  style={{ color: "#656D9A", fontSize: "14px" }}
                >
                  New Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    ref={newRef}
                    type={showNew ? "text" : "password"}
                    className="form-control"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    style={{ background: "#F8F9FB" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* <small style={{ color: "#96A0B5", fontSize: "12px" }}>
                  Minimum 8 characters with uppercase, lowercase, numbers, and
                  symbols
                </small> */}
              </div>

              {/* Confirm Password */}
              <div className="col-md-12">
                <label
                  className="form-label"
                  style={{ color: "#656D9A", fontSize: "14px" }}
                >
                  Confirm New Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    ref={confirmRef}
                    type={showConfirm ? "text" : "password"}
                    className="form-control"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{ background: "#F8F9FB" }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && <div className="text-danger small mt-3">{error}</div>}

            {/* Footer */}
            <div className="d-flex justify-content-end align-items-center mt-4 gap-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }));
                  setError("");
                }}
                disabled={loading}
              >
                Reset
              </button>

              <button
                className="btn d-flex align-items-center"
                style={{
                  background: "linear-gradient(180deg, #FF2200, #FF7700)",
                  color: "#fff",
                }}
                type="submit"
                disabled={loading}
              >
                <Lock size={16} className="me-1" />{" "}
                {loading ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

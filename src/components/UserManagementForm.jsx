"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

export default function UserManagementForm({ onClose, user = null, refetchCountRoles  }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loginNameError, setLoginNameError] = useState("");
  const [employeeIdError, setEmployeeIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [error, setError] = useState("");

  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    loginName: "",
    role: "",
    name: "",
    employeeId: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    branch: "",
    reportingTo: "",
  });

  console.log("Selected Branch ID:", formData.branch);

  const loginNameTimeout = useRef();
  const employeeIdTimeout = useRef();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Debounced check for loginName
  useEffect(() => {
    // Agar edit mode hai aur value same hai, to error clear rakho
    if (user && formData.loginName === user.loginName) {
      setLoginNameError("");
      return;
    }
    if (!formData.loginName) {
      setLoginNameError("");
      return;
    }
    clearTimeout(loginNameTimeout.current);
    loginNameTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/users/check-login-name/${formData.loginName}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.data.availableToRegister) {
          setLoginNameError(res.data.message || "Login name already exists");
        } else {
          setLoginNameError("");
        }
      } catch (err) {
        setLoginNameError("Error checking login name");
      }
    }, 300);
    return () => clearTimeout(loginNameTimeout.current);
  }, [formData.loginName, token]);

  // Debounced check for employeeId
  useEffect(() => {
    // Agar edit mode hai aur value same hai, to error clear rakho
    if (user && formData.employeeId === user.employeeId) {
      setEmployeeIdError("");
      return;
    }
    if (!formData.employeeId) {
      setEmployeeIdError("");
      return;
    }
    clearTimeout(employeeIdTimeout.current);
    employeeIdTimeout.current = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/users/check-employee-id/${formData.employeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.data.availableToRegister) {
          setEmployeeIdError(res.data.message || "Employee ID already exists");
        } else {
          setEmployeeIdError("");
        }
      } catch (err) {
        setEmployeeIdError("Error checking employee ID");
      }
    }, 300);
    return () => clearTimeout(employeeIdTimeout.current);
  }, [formData.employeeId, token]);

  useEffect(() => {
    if (user) {
      setFormData({
        loginName: user.loginName || "",
        role: user.role || "",
        name: user.name || "",
        employeeId: user.employeeId || "",
        mobile: user.mobile || "",
        email: user.email || "",
        // password: "",
        // confirmPassword: "",
        branch: user.branch?._id || (typeof user.branch === "string" ? user.branch : "") || "",
        reportingTo: user.reportingTo?._id || (typeof user.reportingTo === "string" ? user.reportingTo : "") || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "branch" && prev.role === "Authorised Person") {
        updated.reportingTo = "";
      }
      return updated;
    });

    // Clear error when user types
    if (name === "confirmPassword" || name === "password") {
      setPasswordError("");
    }

    setError("");
  };

  const handleSubmit = async (e) => {
    // e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }

    // Branch validation
    if (
      (formData.role === "Branch" ||
        formData.role === "Relationship Manager" ||
        formData.role === "Authorised Person") &&
      !formData.branch
    ) {
      setError("Please select a branch.");
      return;
    }

    // Relationship Manager validation
    if (formData.role === "Authorised Person" && !formData.reportingTo) {
      setError("Please select a relationship manager.");
      return;
    }

    const payload = {
      loginName: formData.loginName,
      role: formData.role,
      name: formData.name,
      employeeId: formData.employeeId,
      mobile: formData.mobile,
      email: formData.email,
      // Only send password if filled (for edit)
      ...(formData.password && { password: formData.password }),
    };

    if (
      formData.role === "Branch" ||
      formData.role === "Relationship Manager" ||
      formData.role === "Authorised Person"
    ) {
      payload.branch = formData.branch; // branch id
    }

    if (formData.role === "Authorised Person") {
      payload.reportingTo = formData.reportingTo; // RM id
    }
    try {
      if (user) {
        // Edit mode
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${user._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        queryClient.invalidateQueries({ queryKey: ["user"] });
        toast.success("User updated successfully!");
         refetchCountRoles(); 
      } else {
        // Add mode
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Refetch user list after add/edit
        queryClient.invalidateQueries({ queryKey: ["user"] });
        toast.success("User created successfully!");
         refetchCountRoles(); 
      }
      onClose();
     
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      }
    }
  };

  const fetchBranches = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/branches`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  };

  const fetchRelationshipManagers = async () => {
    if (!formData.branch) return [];
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/users/get_rm_by_branchid/${formData.branch}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data.data;
  };

  const {
    data: branches = [],
    isLoading: branchesLoading,
    isError: branchesError,
  } = useQuery({
    queryKey: ["branches"], // unique key
    queryFn: fetchBranches, // API call
    enabled:
      formData.role === "Branch" ||
      formData.role === "Relationship Manager" ||
      formData.role === "Authorised Person",
  });

  const {
    data: managers = [],
    isLoading: managersLoading,
    isError: managersError,
  } = useQuery({
    queryKey: ["relationshipManagers", formData.branch],
    queryFn: fetchRelationshipManagers,
    enabled: formData.role === "Authorised Person" && !!formData.branch,
    retry: false,
  });

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.2)", zIndex: 10050 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content" style={{ background: "#F8F9FB" }}>
          {/* Modal Header */}
          <div
            className="modal-header"
            style={{
              background: "linear-gradient(180deg, #FF2200, #FF7700)",
              color: "#fff",
              padding: "10px",
            }}
          >
            <h5
              className="modal-title"
              style={{ color: "#FFFFFF", fontSize: "15px" }}
            >
              {user ? "Edit user" : "Add new user"}
            </h5>
            <button
              type="button"
              className="btn-close"
              style={{ filter: "invert(1)", backgroundColor: "transparent" }}
              onClick={onClose}
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            <p className="" style={{ color: "#1e2129", fontSize: "14px" }}>
              {user
                ? "Edit user details and role assignments"
                : "Create a new user account with role assignments"}
            </p>

            <div className="row g-3">
              <div className="col-md-4">
                <label
                  className="form-label"
                  style={{ color: "#656D9A", fontSize: "14px" }}
                >
                  Login Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="loginName"
                  className="form-control"
                  placeholder="Enter login name"
                  style={{ background: "#F8F9FB" }}
                  value={formData.loginName}
                  onChange={handleChange}
                />
                {loginNameError && (
                  <small style={{ color: "red", fontSize: "12px" }}>
                    {loginNameError}
                  </small>
                )}
              </div>

              <div className="col-md-4">
                <label
                  className="form-label"
                  style={{ color: "#656D9A", fontSize: "14px" }}
                >
                  Role <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  name="role"
                  style={{ background: "#F8F9FB" }}
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="">Select Role</option>
                  <option>Scrutiny Officer</option>
                  <option>Supervisor</option>
                  <option>Admin</option>
                  <option>Relationship Manager</option>
                  <option>Authorised Person</option>
                  <option>Branch</option>
                </select>
              </div>

              <div className="col-md-4">
                <label
                  className="form-label"
                  style={{ color: "#656D9A", fontSize: "14px" }}
                >
                  Employee ID <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  className="form-control"
                  placeholder="Enter employee ID"
                  value={formData.employeeId}
                  onChange={handleChange}
                  style={{ background: "#F8F9FB" }}
                />
                {employeeIdError && (
                  <small style={{ color: "red", fontSize: "12px" }}>
                    {employeeIdError}
                  </small>
                )}
              </div>

              <div className="col-md-4">
                <label
                  className="form-label"
                  style={{ color: "#656D9A", fontSize: "14px" }}
                >
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ background: "#F8F9FB", fontSize: "14px" }}
                />
              </div>

              <div className="col-md-4">
                <label
                  className="form-label"
                  style={{ color: "#656D9A", fontSize: "14px" }}
                >
                  Mobile Number <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="mobile"
                  className="form-control no-spinner"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  style={{ background: "#F8F9FB" }}
                />
              </div>

              {/* Branch Dropdown */}
              {(formData.role === "Branch" ||
                formData.role === "Relationship Manager" ||
                formData.role === "Authorised Person") && (
                <div className="col-md-4">
                  <label
                    className="form-label"
                    style={{ color: "#656D9A", fontSize: "14px" }}
                  >
                    Branch <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    style={{ background: "#F8F9FB" }}
                  >
                    {/* <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName}
                    </option>
                  ))} */}
                    {branchesLoading && <option>Loading...</option>}
                    {branchesError && <option>Error loading branches</option>}
                    {!branchesLoading && !branchesError && (
                      <>
                        <option value="">Select Branch</option>
                        {branches.map((branch) => (
                          <option key={branch._id} value={branch._id}>
                            {branch.branchName}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              )}

              {/* Relationship Manager Dropdown */}
              {/* {formData.role === "Authorised Person" && (
                <div className="col-md-4">
                  <label
                    className="form-label"
                    style={{ color: "#656D9A", fontSize: "14px" }}
                  >
                    Relationship Manager <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="reportingTo"
                    value={formData.reportingTo}
                    onChange={handleChange}
                    style={{ background: "#F8F9FB" }}
                    disabled={managersLoading || managersError}
                  >
                    {managersLoading && <option>Loading...</option>}
                    {managersError && (
                      <option>
                        No RM found for this branch.
                      </option>
                    )}
                    {!managersLoading && !managersError && (
                      <>
                        <option value="">Select Manager</option>
                        {managers.map((manager) => (
                          <option key={manager._id} value={manager._id}>
                            {manager.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              )} */}
              {formData.role === "Authorised Person" && !!formData.branch && (
                <div className="col-md-4">
                  <label
                    className="form-label"
                    style={{ color: "#656D9A", fontSize: "14px" }}
                  >
                    Relationship Manager <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="reportingTo"
                    value={formData.reportingTo}
                    onChange={handleChange}
                    style={{ background: "#F8F9FB" }}
                    disabled={managersLoading}
                  >
                    <option value="">Select Manager</option>
                    {managersLoading && <option disabled>Loading...</option>}
                    {!managersLoading && managersError && (
                      <option disabled>Error loading managers</option>
                    )}
                    {!managersLoading &&
                      !managersError &&
                      managers.length === 0 && (
                        <option disabled>
                          No RM found in this branch
                        </option>
                      )}
                    {!managersLoading &&
                      !managersError &&
                      managers.length > 0 &&
                      managers.map((manager) => (
                        <option key={manager._id} value={manager._id}>
                          {manager.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="col-md-4">
                <label
                  className="form-label"
                  style={{ color: "#656D9A", fontSize: "14px" }}
                >
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ background: "#F8F9FB" }}
                />
              </div>

              {/* Password */}
              {!user && (
                <div className="col-md-4">
                  <label
                    className="form-label"
                    style={{ color: "#656D9A", fontSize: "14px" }}
                  >
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      style={{ background: "#F8F9FB" }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* <small
                  className=""
                  style={{ color: "#96A0B5", fontSize: "10px" }}
                >
                  Minimum 8 characters with uppercase, lowercase, numbers, and
                  symbols
                </small> */}
                </div>
              )}

              {/* Confirm Password */}
              {!user && (
                <div className="col-md-4">
                  <label
                    className="form-label"
                    style={{ color: "#656D9A", fontSize: "14px" }}
                  >
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="form-control"
                      name="confirmPassword"
                      placeholder="Re-enter password"
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
                  {passwordError && (
                    <small style={{ color: "red", fontSize: "12px" }}>
                      {passwordError}
                    </small>
                  )}
                  {/* <small
                  className=""
                  style={{ color: "#96A0B5", fontSize: "10px" }}
                >
                  Minimum 8 characters with uppercase, lowercase, numbers, and
                  symbols
                </small> */}
                </div>
              )}
            </div>
          </div>
          {error && <div className="text-danger small mb-2 mx-4">{error}</div>}

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              className="btn btn-secondary modal-close-button"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="btn btn-danger d-flex align-items-center"
              style={{
                background: "linear-gradient(180deg, #FF2200, #FF7700)",
                color: "#fff",
              }}
              type="submit"
              onClick={handleSubmit}
            >
              <span className="me-1">{user ? "✎" : "+"}</span>{" "}
              {user ? "Update User" : "Add User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

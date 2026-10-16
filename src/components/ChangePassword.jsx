"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ChangePassword({ loginName = "", onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [token, setToken] = useState(null);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    loginName: loginName,
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, loginName }));
  }, [loginName]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/change-password-by-admin`,
        {
          loginName: formData.loginName,
          password: formData.password,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Password changed successfully!");
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

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.2)", zIndex: 10050 }}
    >
      <div className="modal-dialog modal-sm modal-dialog-centered">
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
              Change Password
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
            <div className="d-flex flex-column gap-3">
              <div className="row-md-4">
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
                  readOnly
                />
              </div>

              {/* Password */}
              <div className="row-md-4">
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

              {/* Confirm Password */}
              <div className="row-md-4">
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
            </div>
          </div>
          {error && <div className="text-danger small mb-2 mx-4">{error}</div>}

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              className="btn btn-secondary  modal-close-button"
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
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

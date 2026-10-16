"use client";

import axios from "axios";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Power,
  Smartphone,
  Mail,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Navbar({ collapsed, setCollapsed }) {
  const [avatarOpen, setAvatarOpen] = useState(false); // for avatar
  const [user, setUser] = useState(null);
  const [searchUsers, setSearchUsers] = useState([]);

  const [searchType, setSearchType] = useState("pan");
  const [searchText, setSearchText] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const router = useRouter();

  const avatarRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const fetchSearchUser = async () => {
    if (!searchText.trim()) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/users/search?${searchType}=${searchText}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSearchUsers(res.data.data || []);
      setShowPopup(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchUsers([]);
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSearchUser();
    }
  }, [token]);

  // LocalStorage access only in client
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // click outside to close popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".search-wrapper")) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search when typing (300ms)
  useEffect(() => {
    if (!token) return; // wait for token
    if (!searchText.trim()) {
      setSearchUsers([]);
      setShowPopup(false);
      return;
    }

    const handler = setTimeout(() => {
      fetchSearchUser();
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [searchText, searchType, token]);

  return (
    <nav className="navbar navbar-expand-lg bg-white px-3 py-2 border-bottom d-flex align-items-center justify-content-between shadow-sm">
      {/* LEFT SIDE - Toggle & Search */}
      <div className="d-flex align-items-center gap-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-light d-flex align-items-center justify-content-center"
          style={{
            borderRadius: 100,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            border: "1px solid #dee2e6",
            width: 34,
            height: 34,
            backgroundColor: "#fff",
            padding: 4,
          }}
        >
          {collapsed ? (
            <ArrowRight
              size={22}
              style={{ color: "#ff5c00", transition: "all 0.2s" }}
            />
          ) : (
            <ArrowLeft
              size={22}
              style={{ color: "#ff5c00", transition: "all 0.2s" }}
            />
          )}
        </button>

        {user && user?.role !== "Admin" && (
          <div className="d-flex align-items-center position-relative search-wrapper">
            {/* Dropdown */}
            <select
              className="form-select"
              style={{ width: "150px", marginRight: "8px" }}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="pan">PAN</option>
              <option value="mobile">Mobile</option>
              <option value="email">Email ID</option>
              <option value="clientCode">Client Code</option>
              <option value="name">Name</option>
            </select>

            {/* Search box with icon */}
            <div className="position-relative flex-grow-1">
              <Search
                size={16}
                className="text-muted position-absolute"
                style={{
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Search..."
                style={{ minWidth: 180, paddingRight: "30px" }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                // onKeyDown={(e) => {
                //   if (e.key === "Enter") {
                //     fetchSearchUser();
                //   }
                // }}
              />
              {searchText && (
                <X
                  size={16}
                  className="position-absolute text-muted"
                  style={{
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                  onClick={() => setSearchText("")}
                />
              )}
            </div>
            {/* Popup under search box */}
            {showPopup && (
              <div
                className="position-absolute bg-white shadow rounded mt-1"
                style={{
                  top: "100%",
                  left: 160,
                  width: "100%",
                  zIndex: 999,
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                {loading && (
                  <div className="p-2 text-muted small">Searching...</div>
                )}
                {!loading && searchUsers.length === 0 && (
                  <div className="p-2 text-muted small">No results found</div>
                )}
                {!loading &&
                  searchUsers.map((u) => (
                    <div
                      key={u._id}
                      className="px-2 py-1 mb-0 border hover-bg d-flex gap-2 align-items-start"
                      style={{ cursor: "pointer", fontSize: "0.85rem" }}
                      onClick={() => {
                        setShowPopup(false);
                        setSearchText("");
                        router.push(`/profile/${u._id}`);
                      }}
                    >
                      {/* User Info */}
                      <div className="flex-grow-1">
                        {/* Name and PAN */}
                        <div className="d-flex justify-content-between align-items-center mb-0">
                          <strong style={{ color: "#F25C05" }}>
                            {u.fullName || "N/A"}
                          </strong>
                          <span className="text-secondary">
                            Pan: {u.PAN || "N/A"}
                          </span>
                        </div>

                        {/* Contact Info */}
                        <div className="d-flex gap-2 text-muted mb-0">
                          <div className="d-flex align-items-center gap-1">
                            <Smartphone size={14} className="text-secondary" />
                            <span>{u.mobileNumber || "N/A"}</span>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <Mail size={14} className="text-secondary" />
                            <span>{u.email || "N/A"}</span>
                          </div>
                        </div>

                        {/* Other Details */}
                        <div className="d-flex gap-2 text-muted">
                          <span>RM: {u.referredBy || "N/A"}</span>
                          <span>Lead Created: {u.createdAt || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SIDE - Avatar */}
      <div className="d-flex align-items-center mx-2 gap-3">
        <div className="position-relative d-inline-block" ref={avatarRef}>
          {/* Avatar Button */}
          <div
            className="d-flex align-items-center py-0 px-0 py-md-2 px-md-2"
            style={{
              backgroundColor: "#FFF7F0",
              color: "#ff5c00",
              borderRadius: 8,
              cursor: "pointer",
            }}
            onClick={() => setAvatarOpen(!avatarOpen)}
          >
            <div className="flex-shrink-0">
              <img
                src="/avatar-2.jpg"
                alt="User"
                width={35}
                height={35}
                className="rounded-circle"
              />
            </div>
            <div className="flex-grow-1 ms-3 text-truncate align-self-center d-none d-sm-block">
              <h6
                className="my-0 fw-medium"
                style={{ color: "#1E2129", fontSize: "13px" }}
              >
                {user?.name}
              </h6>
              <p className="text-muted mb-0" style={{ fontSize: "10px" }}>
                {user?.role}
              </p>
            </div>
          </div>

          {/* Dropdown */}
          {avatarOpen && (
            <div
              className="dropdown-menu dropdown-menu-end show mt-2 py-2"
              style={{ right: 0, minWidth: "200px" }}
            >
              {/* <small className="text-muted px-3 py-1 d-block fw-semibold">Settings</small>
              <Link className="dropdown-item px-3 py-2" href="/settings">
                <i className="las la-cog fs-18 me-2 align-text-bottom"></i>{" "}
                Account Settings
              </Link>
              <Link className="dropdown-item px-3 py-2" href="/security">
                <i className="las la-lock fs-18 me-2 align-text-bottom"></i>{" "}
                Security
              </Link>
              <Link className="dropdown-item px-3 py-2" href="/help">
                <i className="las la-question-circle fs-18 me-2 align-text-bottom"></i>{" "}
                Help Center
              </Link> */}

              {/* <div className="dropdown-divider my-1"></div> */}
              <Link
                href="/login"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                }}
                className="dropdown-item text-danger px-3 py-1"
              >
                <Power size={18} className="me-2 align-text-bottom" /> Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

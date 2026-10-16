"use client";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";
import styles from "./userManagement.module.css";
import UserManagementForm from "@/components/UserManagementForm";
import { Icon } from "@iconify/react";
import UserModal from "@/pages/Modal";
import TableBox from "@/components/userManagementTable";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import axios from "axios";
import ChangePassword from "@/components/ChangePassword";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const UserManagementPage = () => {
  const items = [
    { label: "Scrutiny Officer", count: 816, active: true },
    { label: "Supervisor", count: 121 },
    { label: "Relationship Manager", count: 33 },
    { label: "Authorised Person", count: 131 },
    { label: "Branch", count: 68 },
  ];

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState("");
  const [token, setToken] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedLoginName, setSelectedLoginName] = useState("");

  const [visibleStart, setVisibleStart] = useState(0);
  const visibleCount = 3; // ek page pr kitne cards dikhane hain

  const handlePrev = () => {
    setVisibleStart((prev) => Math.max(0, prev - visibleCount));
  };

  const handleNext = () => {
    setVisibleStart((prev) =>
      Math.min(items.length - visibleCount, prev + visibleCount)
    );
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // 🔒 Only allow Admin
      if (parsedUser.role !== "Admin") {
        router.push("/unauthorize"); // redirect unauthorized
      }
    } else {
      router.push("/login"); // not logged in
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleClose = () => setShowForm(false);

  const visibleItems = items.slice(visibleStart, visibleStart + visibleCount);

  const handleAddUser = () => {
    setSelectedUser(null); // add mode
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user); // edit mode
    setShowForm(true);
  };

  const handleOpenChangePassword = (user) => {
    setSelectedLoginName(user.loginName);
    setShowChangePassword(true);
  };

  const handleCloseChangePassword = () => {
    setShowChangePassword(false);
    setSelectedLoginName("");
  };

  const handleEditUserStatus = async (user, isActive) => {
    const newStatus = isActive ? "Active" : "Inactive";

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/status`,
        {
          loginName: user.loginName,
          status: newStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(`Status updated to ${newStatus} for ${user.loginName}`);
      console.log(`Status updated for ${user.loginName}: ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const fetchUsers = async () => {
    const res = await axios.get(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/admin/users?search=${search}&page=${page}&limit=${limit}${
        role ? `&role=${role}` : ""
      }`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Fetched users:", res.data);
    return res.data;
  };

  const fetchCountRole = async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/users/counts-by-role`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data.data;
  };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["user", search, role, page, limit], // unique key
    queryFn: fetchUsers, // API call
    enabled: !!token,
    //  refetchOnWindowFocus: false,
  });

  console.log("User data:", data);

  const { data: countRoles, refetch: refetchCountRoles } = useQuery({
    queryKey: ["countRole"], // unique key
    queryFn: fetchCountRole, // API call
    enabled: !!token,
    //  refetchOnWindowFocus: false,
  });

  // if (isLoading)
  //   return (
  //     <div
  //       className="d-flex justify-content-center mt-5"
  //       style={{ height: "80vh" }}
  //     >
  //       <Loader2 size={70} className="spin" style={{ color: "#ff5c00" }} />
  //     </div>
  //   );
  if (isError) return <p>Error: {error.message}</p>;
  if(!user) return <p>Loading...</p>

  return (
    <>
      <div
        className="d-flex justify-content-between border-bottom px-4 pt-3 gap-2"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 11,
          background: "#fff",
        }}
      >
        <h5 className="mb-0 fw-semibold">User Roles</h5>
        <nav
          style={{
            "--bs-breadcrumb-divider": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%236c757d'/%3E%3C/svg%3E")`,
          }}
          aria-label="breadcrumb"
        >
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link className="text-decoration-none" href="/dashboard">
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              User Management
            </li>
          </ol>
        </nav>
      </div>

      <div className="mx-3">
        {/* Role Cards */}
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
                  {countRoles && (
                    <div
                      className={`${styles["card-box"]} ${
                        role === "" ? styles["active"] : ""
                      }`}
                      style={{
                        width: `calc(100% / ${
                          Object.keys(countRoles).length + 1
                        })`,
                        flexShrink: 0,
                        boxSizing: "border-box",
                        cursor: "pointer",
                      }}
                      onClick={() => setRole("")}
                    >
                      <div>
                        <div
                          className={`${styles["label"]} ${
                            role === "" ? styles["active"] : ""
                          }`}
                        >
                          All Users
                        </div>
                        <div className={styles["count"]}>
                          {Object.values(countRoles).reduce((a, b) => a + b, 0)}
                        </div>
                      </div>
                    </div>
                  )}
                  {Object.keys(
                    countRoles || {
                      Scrutiny: 0,
                      Supervisor: 0,
                      "Relationship Manager": 0,
                      "Authorised Person": 0,
                      Branch: 0,
                    }
                  ).map((roleName, idx) => (
                    <div
                      key={idx}
                      className={`${styles["card-box"]} ${
                        role === roleName ? styles["active"] : ""
                      }`}
                      style={{
                        width: `calc(100% / ${
                          Object.keys(countRoles || items).length
                        })`,
                        flexShrink: 0,
                        boxSizing: "border-box",
                        cursor: "pointer",
                      }}
                      onClick={() => setRole(roleName)}
                    >
                      <div>
                        <div
                          className={`${styles["label"]} ${
                            role === roleName ? styles["active"] : ""
                          }`}
                        >
                          {roleName}
                        </div>
                        <div className={styles["count"]}>
                          {countRoles ? (
                            countRoles[roleName]
                          ) : (
                            <span className={styles["count-loader"]}>
                              <Loader2
                                size={18}
                                className="spin"
                                style={{ color: "#ff5c00" }}
                              />
                            </span>
                          )}
                        </div>
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

        {/* Table Box */}
        <TableBox
          title={role || "All Users"}
          search={search}
          setSearch={setSearch}
          isLoading={isLoading}
          isFetching={isFetching}
          data={data?.data}
          pagination={data?.pagination}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1); // limit change par page 1 ho jaye
          }}
          onAddUser={handleAddUser}
          onEditUser={handleEditUser}
          onChangePassword={handleOpenChangePassword}
          handleStatusChange={handleEditUserStatus}
        />
      </div>

      {showChangePassword && (
        <ChangePassword
          loginName={selectedLoginName}
          onClose={handleCloseChangePassword}
        />
      )}

      {/* Modal */}
      <UserModal show={showForm} onClose={handleClose}>
        <UserManagementForm
          onClose={handleClose}
          user={selectedUser}
          refetchCountRoles={refetchCountRoles}
        />
      </UserModal>
    </>
  );
};

export default UserManagementPage;

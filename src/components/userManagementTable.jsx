import React from "react";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Pencil,
  Key,
  ToggleRight,
  Loader2,
} from "lucide-react";
import CustomPagination from "@/components/CustomPagination/CustomPagination";
import styles from "@/app/user-management/userManagement.module.css";

const getRoleBadgeStyle = (role) => {
  switch (role) {
    case "Relationship Manager":
      return {
        backgroundColor: "#E0F2FE",
        color: "#0369A1",
        border: "1px solid #BAE6FD",
        fontSize: "11px",
        fontWeight: "500",
        padding: "2px 8px",
        lineHeight: "1.4",
        whiteSpace: "nowrap",
      };
    case "Authorised Person":
      return {
        backgroundColor: "#F3E8FF",
        color: "#7E22CE",
        border: "1px solid #E9D5FF",
        fontSize: "11px",
        fontWeight: "500",
        padding: "2px 8px",
        lineHeight: "1.4",
        whiteSpace: "nowrap",
      };
    case "Supervisor":
      return {
        backgroundColor: "#FEF3C7",
        color: "#B45309",
        border: "1px solid #FDE68A",
        fontSize: "11px",
        fontWeight: "500",
        padding: "2px 8px",
        lineHeight: "1.4",
        whiteSpace: "nowrap",
      };
    case "Scrutiny Officer":
      return {
        backgroundColor: "#CCFBF1",
        color: "#0F766E",
        border: "1px solid #99F6E4",
        fontSize: "11px",
        fontWeight: "500",
        padding: "2px 8px",
        lineHeight: "1.4",
        whiteSpace: "nowrap",
      };
    case "Branch":
      return {
        backgroundColor: "#DCFCE7",
        color: "#15803D",
        border: "1px solid #BBF7D0",
        fontSize: "11px",
        fontWeight: "500",
        padding: "2px 8px",
        lineHeight: "1.4",
        whiteSpace: "nowrap",
      };
    case "Admin":
      return {
        backgroundColor: "#FFE4E6",
        color: "#BE123C",
        border: "1px solid #FECDD3",
        fontSize: "11px",
        fontWeight: "500",
        padding: "2px 8px",
        lineHeight: "1.4",
        whiteSpace: "nowrap",
      };
    default:
      return {
        backgroundColor: "#F3F4F6",
        color: "#4B5563",
        border: "1px solid #E5E7EB",
        fontSize: "11px",
        fontWeight: "500",
        padding: "2px 8px",
        lineHeight: "1.4",
        whiteSpace: "nowrap",
      };
  }
};

const TableBox = ({
  search,
  isLoading,
  isFetching,
  setSearch,
  data = [],
  pagination,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onAddUser,
  onEditUser,
  onChangePassword,
  handleStatusChange,
  title,
}) => (
  <div className="bg-white p-0 mt-2 rounded-3 shadow-sm border">
    {/* Title + Search */}
    <div className="d-flex px-3 mt-3 justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <h5 className="mb-0 fw-semibold" style={{ color: "#1e2129" }}>
        {title}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Login name/Employee ID"
              className="form-control ps-5"
              style={{ minWidth: 250, background: "#f8f9fa", height: "38px" }}
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
          <button
            className="btn btn-danger add-button d-flex align-items-center"
            onClick={onAddUser}
            style={{
              height: "38px",
              padding: "0 12px",
            }}
          >
            <Plus
              style={{ width: "20px", height: "20px", marginRight: "6px" }}
            />{" "}
            Add New User
          </button>
        </div>
      </div>
    </div>

    {/* Table */}
    <div className="table-responsive">
      <table className="table align-middle w-100 custom-table">
        <thead
          className={`${styles["custom-table-header"]} align-middle`}
          style={{ height: "50px" }}
        >
          <tr>
            <th
              className={`${styles["table-cell"]} ${styles["table-cell-first"]}`}
              style={{ minWidth: 180 }}
            >
              Login Name
            </th>
            <th className={styles["table-cell"]} style={{ minWidth: 120 }}>
              Employee ID
            </th>
            <th className={styles["table-cell"]} style={{ minWidth: 180 }}>
              Name
            </th>
            <th className={styles["table-cell"]} style={{ minWidth: 140 }}>
              Creation Date
            </th>
            <th className={styles["table-cell"]} style={{ minWidth: 180 }}>
              Last Login Date
            </th>
            <th className={styles["table-cell"]} style={{ minWidth: 140 }}>
              Status
            </th>
            <th
              className={`${styles["table-cell"]} ${styles["table-cell-last"]}`}
              style={{ minWidth: 80 }}
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: "48px" }}>
                <Loader2
                  size={48}
                  className="spin"
                  style={{ color: "#ff5c00" }}
                />
                <div>Loading users...</div>
              </td>
            </tr>
          ) : data?.length > 0 ? (
            data.map((user, i) => (
              <tr key={i} className="border-bottom custom-table-height">
                <td
                  className={`${styles["table-cell"]} ${styles["table-cell-first"]}`}
                >
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span>{user.loginName}</span>
                    {user.role && (
                      <span
                        className="badge rounded-pill"
                        style={getRoleBadgeStyle(user.role)}
                      >
                        {user.role}
                      </span>
                    )}
                  </div>
                </td>
                <td className={styles["table-cell"]}>{user.employeeId}</td>
                <td className={styles["table-cell"]}>{user.name}</td>
                {/* <td className={styles["table-cell"]}>{user.createdAt}</td>
              <td
                className={`${styles["table-cell"]} ${styles["table-cell-last"]}`}
              >
                {user.lastLoginTime || "Not logged in yet"}
              </td> */}
                <td className={styles["table-cell"]}>
                  {new Date(user.createdAt).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}
                </td>

                <td
                  className={`${styles["table-cell"]} ${styles["table-cell-last"]}`}
                >
                  {user.lastLoginTime
                    ? new Date(user.lastLoginTime).toLocaleDateString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })
                    : "Not logged in yet"}
                </td>
                <td
                  className={`${styles["table-cell"]} ${styles["table-cell-last"]}`}
                >
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input custom-switch"
                      type="checkbox"
                      role="switch"
                      // id="switchCheckDefault"
                      id={`switch-${user._id}`}
                      defaultChecked={user.status === "Active"}
                      onChange={(e) =>
                        handleStatusChange(user, e.target.checked)
                      }
                    />
                  </div>
                </td>
                <td className={styles["table-cell"]}>
                  <div className="dropdown">
                    <button
                      className="btn btn-link p-0"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{ color: "#1E2129" }}
                    >
                      <MoreVertical size={20} />
                    </button>
                    <ul className="dropdown-menu shadow-sm border rounded-2 py-2">
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2"
                          onClick={() => onEditUser(user)}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2"
                          onClick={() => onChangePassword(user)}
                        >
                          <Key size={14} />
                          Change Password
                        </button>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center text-muted py-3">
                No users found.
              </td>
            </tr>
          )}
          {/* {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-muted py-3">
                No users found.
              </td>
            </tr>
          )} */}
        </tbody>
      </table>
      <CustomPagination
        page={page}
        pages={pagination?.pages || 1}
        limit={limit}
        total={pagination?.total || 0}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  </div>
);

export default TableBox;

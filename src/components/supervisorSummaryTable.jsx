import React from "react";
import { Search, Plus } from "lucide-react";
import CustomPagination from "@/components/CustomPagination/CustomPagination";
import styles from "@/app/user-management/userManagement.module.css";
import { useRouter } from "next/navigation";

const TableBox = ({
  search,
  setSearch,
  filteredUsers = [],
  loading,
  onAddUser,
  title = "Scrutiny Officer",
}) => {
  const router = useRouter();

  const handleClientClick = (user) => {
    const id = user.esignId || user.userId || user._id;
    if (!id) return;

    router.push(`/profile/${id}`);
  };
  return (
    <div className="bg-white p-0 mt-2 rounded-3 shadow-sm border">
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
                style={{ minWidth: 120 }}
              >
                CLIENT NAME
              </th>
              <th className={styles["table-cell"]} style={{ minWidth: 120 }}>
                CLIENT CODE
              </th>
              <th className={styles["table-cell"]} style={{ minWidth: 120 }}>
                PAN
              </th>
              <th className={styles["table-cell"]} style={{ minWidth: 180 }}>
                MOBILE
              </th>
              <th className={styles["table-cell"]} style={{ minWidth: 140 }}>
                EMAIL
              </th>
              <th className={styles["table-cell"]} style={{ minWidth: 120 }}>
                DATE
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Show 5 shimmer rows with 6 columns
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-bottom custom-table-height">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-3 py-2">
                      <div
                        className="placeholder-glow w-100"
                        style={{ height: "1rem", borderRadius: "0.25rem" }}
                      >
                        <span className="placeholder col-12 rounded-pill"></span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, i) => (
                <tr key={i} className="border-bottom custom-table-height">
                  {/* <td
                    className={`${styles["table-cell"]} ${styles["table-cell-first"]}`}
                  >
                    {user.name || user.clientName}
                  </td> */}
                  <td
                    className={`${styles["table-cell"]} ${styles["table-cell-first"]}`}
                  >
                    <span
                      onClick={() => handleClientClick(user)}
                      title="View eSign details"
                      style={{
                        color: "#4f46e5",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.textDecoration = "underline")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.textDecoration = "none")
                      }
                    >
                      {user.name || user.clientName}
                    </span>
                  </td>
                  <td className={styles["table-cell"]}>{user.clientCode}</td>
                  <td className={styles["table-cell"]}>
                    {user.PAN || user.pan}
                  </td>
                  <td className={styles["table-cell"]}>
                    {user.mobileNumber || user.mobile}
                  </td>
                  <td className={styles["table-cell"]}>{user.email}</td>
                  <td className={styles["table-cell"]}>{user.createdAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-muted py-3">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <CustomPagination />
      </div>
    </div>
  );
};

export default TableBox;

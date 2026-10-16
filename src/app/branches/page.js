"use client";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";
import {
  Filter,
  Info,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import styles from "./branches.module.css";
import { Icon } from "@iconify/react";
import CustomPagination from "@/components/CustomPagination/CustomPagination";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Breadcrumb from "@/components/Breadcrumb";

const BranchPage = () => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false); // Edit or Add
  const [currentId, setCurrentId] = useState(null); // Current branch id to edit
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // State for form fields
  const [formData, setFormData] = useState({
    branchName: "",
    branchCode: "",
    series: "",
    prefix: "",
  });

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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["branches"], // unique key
    queryFn: fetchBranches, // API call
    enabled: !!token,
  });

  // Mutation for POST API
  const addBranchMutation = useMutation({
    mutationFn: async (newBranch) =>
      axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/branches`,
        newBranch,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    onSuccess: () => {
      toast.success("Branch added successfully!");
      queryClient.invalidateQueries(["branches"]); // refresh list
      setShowForm(false); // close modal
      setFormData({ branchName: "", branchCode: "", series: "", prefix: "" });
    },
    onError: () => toast.error("Error adding branch!"),
  });

  // PUT Mutation (Edit)
  const editBranchMutation = useMutation({
    mutationFn: async ({ id, updatedData }) =>
      axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/branches/${id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ),
    onSuccess: () => {
      toast.success("Branch updated successfully!");
      queryClient.invalidateQueries(["branches"]);
      handleClose();
    },
    onError: () => toast.error("Error updating branch!"),
  });

  const handleClose = () => {
    setShowForm(false);
    setEditMode(false);
    setCurrentId(null);
    setFormData({ branchName: "", branchCode: "", series: "", prefix: "" });
  };

  // ✅ Submit handler
  const handleSubmit = () => {
    if (
      !formData.branchName.trim() ||
      !formData.branchCode.trim() ||
      !formData.series.trim() ||
      !formData.prefix.trim()
    ) {
      setError("All fields are required!");
      return;
    }
    setError(""); // Clear error if all fields filled
    if (editMode) {
      // PUT request
      editBranchMutation.mutate({ id: currentId, updatedData: formData });
    } else {
      // POST request
      addBranchMutation.mutate(formData);
    }
  };

  // ✅ Handle Edit button click
  const handleEditClick = (branch) => {
    setEditMode(true);
    setCurrentId(branch._id);
    setFormData({
      branchName: branch.branchName,
      branchCode: branch.branchCode,
      series: branch.series,
      prefix: branch.prefix,
    });
    setShowForm(true);
  };

  if (isLoading)
    return (
      <div
        className="d-flex justify-content-center mt-5"
        style={{ height: "80vh" }}
      >
        <Loader2 size={70} className="spin" style={{ color: "#ff5c00" }} />
      </div>
    );
  if (isError) return <p>Error: {error.message}</p>;
  // if (!showForm) return null;

  return (
    <>
      <Breadcrumb
        title="Branches"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Branches" },
        ]}
      />

      <div className="mx-3">
        {/* Table Box */}
        <div className="bg-white p-0 mt-2 rounded-3 shadow-sm border">
          {/* Title + Search */}
          <div className="d-flex px-3 mt-3 justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="mb-0 fw-semibold" style={{ color: "#1e2129" }}>
              List of Branches
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
                      pointerEvents: "none", // so user can't click on the icon
                    }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Login name/Employee ID"
                    className="form-control ps-5"
                    style={{
                      minWidth: 250,
                      background: "#f8f9fa",
                      height: "38px",
                    }}
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
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center px-3 py-2">
                <button
                  className="btn btn-danger add-button d-flex align-items-center"
                  onClick={() => setShowForm(true)}
                  style={{
                    height: "38px",
                    padding: "0 12px",
                  }}
                >
                  <Plus
                    style={{
                      width: "20px",
                      height: "20px",
                      marginRight: "6px",
                    }}
                  />{" "}
                  Add New Branch
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-2">
            <div className="bg-white p-0 mt-2 rounded-3">
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
                        Branch Name
                      </th>
                      <th
                        className={styles["table-cell"]}
                        style={{ minWidth: 120 }}
                      >
                        Branch Code
                      </th>
                      <th
                        className={styles["table-cell"]}
                        style={{ minWidth: 180 }}
                      >
                        Series
                      </th>
                      <th
                        className={styles["table-cell"]}
                        style={{ minWidth: 140 }}
                      >
                        Prefix
                      </th>
                      <th
                        className={styles["table-cell"]}
                        style={{ minWidth: 80 }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.map((branch, i) => (
                      <tr key={i} className="border-bottom custom-table-height">
                        <td
                          className={`${styles["table-cell"]} ${styles["table-cell-first"]}`}
                        >
                          {branch.branchName}
                        </td>
                        <td className={styles["table-cell"]}>
                          {branch.branchCode}
                        </td>
                        <td className={styles["table-cell"]}>
                          {branch.series}
                        </td>
                        <td className={styles["table-cell"]}>
                          {branch.prefix}
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
                                  onClick={() => handleEditClick(branch)}
                                  className="dropdown-item d-flex align-items-center gap-2"
                                >
                                  <Pencil size={14} />
                                  Edit
                                </button>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {data?.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-3">
                          No branches found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div
            className="modal d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.5)", zIndex: 10050 }}
          >
            <div className="modal-dialog modal-dialog-centered">
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
                    {editMode ? "Edit Branch" : "Add Branch"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    style={{
                      filter: "invert(1)",
                      backgroundColor: "transparent",
                    }}
                    onClick={() => setShowForm(false)}
                  ></button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                  <p
                    className=""
                    style={{ color: "#1e2129", fontSize: "14px" }}
                  >
                    Create a new branch for customer onboarding and UCC code
                    generation
                  </p>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        Branch Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.branchName}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            branchName: e.target.value,
                          });
                          setError("");
                        }}
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        Branch Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.branchCode}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            branchCode: e.target.value,
                          });
                          setError("");
                        }}
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label
                        className="form-label"
                        style={{
                          color: "#656D9A",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        Series <span className="text-danger">*</span>
                        <Info
                          size={14}
                          color="#6c757d"
                          data-tooltip-id="series-tooltip"
                          data-tooltip-content="Starting number for UCC code sequence (e.g., 001)"
                          style={{ cursor: "pointer" }}
                        />
                      </label>
                      <Tooltip id="series-tooltip" place="top" />
                      <input
                        type="text"
                        className="form-control"
                        value={formData.series}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            series: e.target.value,
                          });
                          setError("");
                        }}
                        style={{ background: "#F8F9FB" }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label
                        className="form-label"
                        style={{
                          color: "#656D9A",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        Prefix <span className="text-danger">*</span>
                        <Info
                          size={14}
                          color="#6c757d"
                          data-tooltip-id="prefix-tooltip"
                          data-tooltip-content="Used for generating customer UCC codes (e.g., MUM, DEL)"
                          style={{ cursor: "pointer" }}
                        />
                      </label>
                      {/* Tooltip Component */}
                      <Tooltip id="prefix-tooltip" place="top" />
                      <input
                        type="text"
                        className="form-control"
                        value={formData.prefix}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            prefix: e.target.value,
                          });
                          setError("");
                        }}
                        style={{ background: "#F8F9FB", fontSize: "14px" }}
                      />
                    </div>
                  </div>
                </div>
                {error && (
                  <div
                    className="mx-4"
                    style={{ color: "red", fontSize: "13px", marginBottom: 8 }}
                  >
                    {error}
                  </div>
                )}

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary modal-close-button"
                    onClick={() => setShowForm(false)}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-danger d-flex align-items-center"
                    style={{
                      background: "linear-gradient(180deg, #FF2200, #FF7700)",
                      color: "#fff",
                    }}
                    disabled={
                      addBranchMutation.isPending ||
                      editBranchMutation.isPending
                    }
                    onClick={handleSubmit}
                  >
                    {editMode
                      ? editBranchMutation.isPending
                        ? "Updating..."
                        : "Update Branch"
                      : addBranchMutation.isPending
                      ? "Adding..."
                      : "+ Add Branch"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BranchPage;

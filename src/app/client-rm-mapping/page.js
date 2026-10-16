"use client";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Loader2 } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { toast } from "react-toastify";

const AssignClientPage = () => {
  const [pan, setPan] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pan.trim() || !employeeId.trim()) {
      toast.error("Both fields are required");
      return;
    }

    try {
      setLoading(true);

      // API Call here
      // await axios.post("/assign-client",{pan,employeeId})

      toast.success("Client assigned successfully");

      setPan("");
      setEmployeeId("");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb
        title="Assign Client to Employee"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assign Client" },
        ]}
      />

      <div className="mx-3">
        <div className="bg-white mt-2 rounded-3 shadow-sm border">

          {/* Header */}
          {/* <div className="px-3 py-3 border-bottom">
            <h5 className="fw-semibold mb-0" style={{ color: "#1e2129" }}>
              Assign Client to Employee
            </h5>
          </div> */}

          {/* Form */}
          <div className="p-3">
            <div className="row align-items-end g-3">

              {/* PAN */}
              <div className="col-md-4">
                <label
                  className="form-label"
                  style={{ color: "#656D9A", fontSize: "14px" }}
                >
                  PAN <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter PAN"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  style={{ background: "#F8F9FB" }}
                />
              </div>

              {/* Employee ID */}
              <div className="col-md-4">
                <label
                  className="form-label"
                  style={{ color: "#656D9A", fontSize: "14px" }}
                >
                  Employee ID <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  style={{ background: "#F8F9FB" }}
                />
              </div>

              {/* Button */}
              <div className="col-md-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn-danger d-flex align-items-center justify-content-center"
                  style={{
                    height: "33px",
                    background:
                      "linear-gradient(180deg, #FF2200, #FF7700)",
                    color: "#fff",
                    width: "50%",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="spin me-2" size={16} />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default AssignClientPage;

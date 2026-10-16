"use client";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import styles from "./schemes-assignment.module.css";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";

const SchemesAssignment = () => {
  const [rmAp, setRmAp] = useState([]);
  const [selectedRmAp, setSelectedRmAp] = useState("");
  const [token, setToken] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState([]);
  const [selectedSchemes, setSelectedSchemes] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // 🔒 Only allow Admin
      if (parsedUser.role !== "Supervisor") {
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

  const fetchAllRmAp = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/rm-and-ap`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setRmAp(res.data.data);
        return true;
      }
    } catch (err) {
      console.error("Error fetching schemes:", err);
      return false;
    }
  };

  const fetchAssignmentStatus = async () => {
    try {
      if (selectedRmAp) {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/schemes/assignment-status/${selectedRmAp}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.success) {
          setAssignmentStatus(res.data.data);
          setSelectedSchemes(
            res.data.data.filter((s) => s.isAssigned).map((s) => s._id)
          );
        }
      }
    } catch (err) {
      console.error("Error fetching schemes:", err);
    }
  };

  const updateAssignmentStatus = async (schemesPayload) => {
    try {
      if (selectedRmAp) {
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/schemes/assignment-status/${selectedRmAp}`,
          {
            schemes: schemesPayload,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Assignment updated successfully");
        return true;
      }
    } catch (error) {
      console.error("Error fetching schemes:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAllRmAp();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchAssignmentStatus();
  }, [selectedRmAp, token]);

  // Map assignmentStatus to react-select options
  const schemeOptions = assignmentStatus.map((scheme) => ({
    value: scheme._id,
    label: scheme.schemeName,
    isAssigned: scheme.isAssigned,
    isFixed: scheme.schemeName === "LISL",
  }));

  // Custom Option with Checkbox in drodpwn list
  const CustomOption = (props) => {
    return (
      <components.Option {...props}>
        <div className="d-flex align-items-center gap-2">
          <input
            type="checkbox"
            checked={props.isSelected}
            readOnly // react-select handles selection
            className="mr-2"
            disabled={props.data.isFixed}
          />
          <label>{props.label}</label>
        </div>
      </components.Option>
    );
  };

  // Custom MultiValueRemove to prevent removing LISL via cross
  const MultiValueRemove = (props) => {
    if (props.data.isFixed) return null; // Don't show cross for LISL
    return <components.MultiValueRemove {...props} />;
  };

  if (!user) return <p>Loading...</p>;
  return (
    <>
      <Breadcrumb
        title="Scheme Mapping"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Scheme Mapping" },
        ]}
      />

      <div className="d-flex justify-content-start">
        <div style={{ minWidth: 350 }} className="m-3">
          <Select
            className="fw-semibold"
            options={rmAp.map((user) => ({
              value: user._id,
              label: user.name,
            }))}
            placeholder="Select User"
            isSearchable
            value={
              rmAp
                .map((user) => ({
                  value: user._id,
                  label: user.name,
                }))
                .find((opt) => opt.value === selectedRmAp) || null
            }
            onChange={(option) => setSelectedRmAp(option ? option.value : "")}
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "38px",
                fontWeight: "600",
              }),
            }}
          />
        </div>
        <div style={{ minWidth: 550 }} className={`${styles.rowAlign} m-3`}>
          <div style={{ flex: "1 0 auto", minWidth: 0 }}>
            <Select
              options={schemeOptions}
              isMulti //multi-select enable karega
              placeholder="Select Schemes..."
              closeMenuOnSelect={false} // menu open rahega multi-select ke liye
              hideSelectedOptions={false}
              components={{ Option: CustomOption, MultiValueRemove }}
              value={schemeOptions.filter((opt) =>
                selectedSchemes.includes(opt.value)
              )}
              onChange={(selected) => {
                // Always keep LISL selected
                const lislOption = schemeOptions.find((opt) => opt.isFixed);
                let newSelected = selected
                  ? selected.map((opt) => opt.value)
                  : [];
                if (lislOption && !newSelected.includes(lislOption.value)) {
                  newSelected = [lislOption.value, ...newSelected];
                }
                setSelectedSchemes(newSelected);
              }}
            />
          </div>
          {/* Apply button */}
          <button
            onClick={() => {
              // Prepare payload with _id, schemeName, isAssigned
              const payload = schemeOptions.map((scheme) => ({
                _id: scheme.value,
                schemeName: scheme.label,
                isAssigned: selectedSchemes.includes(scheme.value),
              }));
              const success = updateAssignmentStatus(payload); // ✅ API call sirf Apply click par
              if (success) {
                // reset dropdown after apply
                setSelectedSchemes([]);

                // User dropdown reset
                setSelectedRmAp("");

                // Assignment status clear (UI se schemes list hat jaye)
                setAssignmentStatus([]);
              }
            }}
            className={`${styles.applyBtn} ms-2`}
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
};

export default SchemesAssignment;

"use client";
import axios from "axios";
import { Filter, Plus, Search } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";

const SchemeAdmin = () => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState({});
  const [token, setToken] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState("");
  console.log("Selected Scheme:", selectedScheme);

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

  const initialFormData = {
    schemeName: "",
    cMSegmentTradingBrokerage: "",
    fOSegmentTradingBrokerage: "",
    currencyTradingBrokerage: "",
    mCXNCDEXTradingBrokerage: "",
    cMSegmentDeliveryBrokerage: "",
    fOSegmentDeliveryBrokerage: "",
    currencyDeliveryBrokerage: "",
    mCXNCDEXDeliveryBrokerage: "",
    cMSegmentMinimumBrokerageInPaisa: "",
    fOSegmentMinimumBrokerageInPaisa: "",
    currencyMinimumBrokerageInPaisa: "",
    mCXNCDEXMinimumBrokerageInPaisa: "",
    fOSegmentOptionBrokerageInRs: "",
    currencyOptionBrokerageInRs: "",
    mCXNCDEXOptionBrokerageInRs: "",
    cBrkgBasketNSE: "",
    cBrkgBasketBSE: "",
    cBrkgBasketFO: "",
    nDelCMBrkg: "",
    nDelCMBrkgMin: "",
    nSqCMBrkg: "",
    nSqCMBrkgMin: "",
    nFutBrkg: "",
    nFutBrkgMin: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const fetchSchemes = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/schemes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setSchemes(res.data.data); // "data" array ko store karna h
      }
    } catch (err) {
      console.error("Error fetching schemes:", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchSchemes();
  }, [token]);

  useEffect(() => {
    // When a scheme is selected, fetch its data and fill the form
    if (selectedScheme) {
      const fetchSchemeById = async () => {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/schemes/${selectedScheme}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (res.data.success) {
            setFormData(res.data.data);
            setEditMode(true);
            setShowForm(true);
          }
        } catch (err) {
          console.log(err);
          toast.error("Failed to fetch scheme details");
        }
      };
      fetchSchemeById();
    }
  }, [selectedScheme]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    // Validate form data
    let newError = {};
    const requiredFields = Object.keys(formData);

    for (const field of requiredFields) {
      if (
        formData[field] === "" ||
        formData[field] === null ||
        formData[field] === undefined
      ) {
        newError[field] = `${field} is required`;
      }
    }

    // agar error hai to form submit mat karo
    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }

    try {
      const payload = {
        ...formData,
        isDefault: false,
        isActive: true,
      };
      console.log("SUBMIT payload", payload);

      if (editMode && selectedScheme) {
        console.log("PUT branch firing", { selectedScheme });
        // Update API
        const res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/schemes/${selectedScheme}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Scheme updated successfully!");
      } else {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/schemes`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Scheme added successfully!");
      }

      setShowForm(false);
      setFormData(initialFormData);
      setEditMode(false);
      setSelectedScheme("");
      fetchSchemes(); // Refresh the schemes list
    } catch (error) {
      console.log(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message || "An error occurred");
      }
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <Breadcrumb
        title="Scheme Admin"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Scheme Admin" },
        ]}
      />

      <div className="mx-3">
        {/* Table Box */}
        <div className="bg-white p-0 mt-2 rounded-3 shadow-sm border">
          {/* Title + Search */}
          <div className="d-flex px-3 mt-3 justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div style={{ minWidth: 250 }}>
              <Select
                className="fw-semibold"
                options={schemes.map((scheme) => ({
                  value: scheme._id,
                  label: scheme.schemeName,
                }))}
                placeholder="Select Scheme"
                isSearchable
                value={
                  schemes
                    .map((scheme) => ({
                      value: scheme._id,
                      label: scheme.schemeName,
                    }))
                    .find((opt) => opt.value === selectedScheme) || null
                }
                onChange={(option) =>
                  setSelectedScheme(option ? option.value : "")
                }
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "38px",
                    fontWeight: "600",
                  }),
                }}
              />
            </div>
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
                    placeholder="Search by Scheme name/Scheme ID"
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
                  Add New Scheme
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Modal Form */}
        {showForm && (
          <div
            className="modal d-block"
            tabIndex="-1"
            style={{ background: "rgba(0,0,0,0.6)", zIndex: 100500 }}
          >
            <div className="modal-dialog modal-fullscreen customModal-dialog">
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
                    {editMode ? "Edit Scheme" : "Add New Scheme"}
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
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        SchemeName <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="schemeName"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.schemeName}
                        onChange={handleChange}
                      />
                      {error.schemeName && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.schemeName}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        CMSegmentTradingBrokerage{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="cMSegmentTradingBrokerage"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.cMSegmentTradingBrokerage}
                        onChange={handleChange}
                      />
                      {error.cMSegmentTradingBrokerage && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.cMSegmentTradingBrokerage}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        FOSegmentTradingBrokerage{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="fOSegmentTradingBrokerage"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.fOSegmentTradingBrokerage}
                        onChange={handleChange}
                      />
                      {error.fOSegmentTradingBrokerage && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.fOSegmentTradingBrokerage}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        CurrencyTradingBrokerage{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="currencyTradingBrokerage"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.currencyTradingBrokerage}
                        onChange={handleChange}
                      />
                      {error.currencyTradingBrokerage && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.currencyTradingBrokerage}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        MCXNCDEXTradingBrokerage{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="mCXNCDEXTradingBrokerage"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.mCXNCDEXTradingBrokerage}
                        onChange={handleChange}
                      />
                      {error.mCXNCDEXTradingBrokerage && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.mCXNCDEXTradingBrokerage}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        CMSegmentDeliveryBrokerage{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="cMSegmentDeliveryBrokerage"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.cMSegmentDeliveryBrokerage}
                        onChange={handleChange}
                      />
                      {error.cMSegmentDeliveryBrokerage && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.cMSegmentDeliveryBrokerage}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        FOSegmentDeliveryBrokerage{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="fOSegmentDeliveryBrokerage"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.fOSegmentDeliveryBrokerage}
                        onChange={handleChange}
                      />
                      {error.fOSegmentDeliveryBrokerage && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.fOSegmentDeliveryBrokerage}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        CurrencyDeliveryBrokerage{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="currencyDeliveryBrokerage"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.currencyDeliveryBrokerage}
                        onChange={handleChange}
                      />
                      {error.currencyDeliveryBrokerage && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.currencyDeliveryBrokerage}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        MCXNCDEXDeliveryBrokerage{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="mCXNCDEXDeliveryBrokerage"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.mCXNCDEXDeliveryBrokerage}
                        onChange={handleChange}
                      />
                      {error && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.mCXNCDEXDeliveryBrokerage}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        CMSegmentMinimumBrokerageInPaisa{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="cMSegmentMinimumBrokerageInPaisa"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.cMSegmentMinimumBrokerageInPaisa}
                        onChange={handleChange}
                      />
                      {error && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.cMSegmentMinimumBrokerageInPaisa}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        FOSegmentMinimumbrokerageinpaisa{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="fOSegmentMinimumBrokerageInPaisa"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.fOSegmentMinimumBrokerageInPaisa}
                        onChange={handleChange}
                      />
                      {error.fOSegmentMinimumBrokerageInPaisa && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.fOSegmentMinimumBrokerageInPaisa}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        CurrencyMinimumbrokerageinpaisa{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="currencyMinimumBrokerageInPaisa"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.currencyMinimumBrokerageInPaisa}
                        onChange={handleChange}
                      />
                      {error.currencyMinimumBrokerageInPaisa && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.currencyMinimumBrokerageInPaisa}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        MCXNCDEXMinimumbrokerageinpaisa{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="mCXNCDEXMinimumBrokerageInPaisa"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.mCXNCDEXMinimumBrokerageInPaisa}
                        onChange={handleChange}
                      />
                      {error.mCXNCDEXMinimumBrokerageInPaisa && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.mCXNCDEXMinimumBrokerageInPaisa}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        FOSegmentOptionBrokerageinRs{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="fOSegmentOptionBrokerageInRs"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.fOSegmentOptionBrokerageInRs}
                        onChange={handleChange}
                      />
                      {error.fOSegmentOptionBrokerageInRs && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.fOSegmentOptionBrokerageInRs}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        CurrencyOptionBrokerageinRs{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="currencyOptionBrokerageInRs"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.currencyOptionBrokerageInRs}
                        onChange={handleChange}
                      />
                      {error.currencyOptionBrokerageInRs && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.currencyOptionBrokerageInRs}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        MCXNCDEXOptionBrokerageinRs{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="mCXNCDEXOptionBrokerageInRs"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.mCXNCDEXOptionBrokerageInRs}
                        onChange={handleChange}
                      />
                      {error.mCXNCDEXOptionBrokerageInRs && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.mCXNCDEXOptionBrokerageInRs}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Border */}
                  {/* <div className="border-bottom mt-5 "></div> */}
                  <div
                    className="border-bottom mt-5"
                    style={{ margin: "-10px" }}
                  ></div>

                  <div className="row g-3 mt-3">
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        cBrkgBasketNSE <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="cBrkgBasketNSE"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.cBrkgBasketNSE}
                        onChange={handleChange}
                      />
                      {error.cBrkgBasketNSE && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.cBrkgBasketNSE}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        cBrkgBasketBSE <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="cBrkgBasketBSE"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.cBrkgBasketBSE}
                        onChange={handleChange}
                      />
                      {error.cBrkgBasketBSE && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.cBrkgBasketBSE}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        cBrkgBasketFO <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="cBrkgBasketFO"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.cBrkgBasketFO}
                        onChange={handleChange}
                      />
                      {error.cBrkgBasketFO && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.cBrkgBasketFO}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        nDelCMBrkg <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="nDelCMBrkg"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.nDelCMBrkg}
                        onChange={handleChange}
                      />
                      {error.nDelCMBrkg && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.nDelCMBrkg}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        nDelCMBrkgMin <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="nDelCMBrkgMin"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.nDelCMBrkgMin}
                        onChange={handleChange}
                      />
                      {error.nDelCMBrkgMin && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.nDelCMBrkgMin}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        nSqCMBrkg <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="nSqCMBrkg"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.nSqCMBrkg}
                        onChange={handleChange}
                      />
                      {error.nSqCMBrkg && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.nSqCMBrkg}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        nSqCMBrkgMin <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="nSqCMBrkgMin"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.nSqCMBrkgMin}
                        onChange={handleChange}
                      />
                      {error.nSqCMBrkgMin && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.nSqCMBrkgMin}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        nFutBrkg <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="nFutBrkg"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.nFutBrkg}
                        onChange={handleChange}
                      />
                      {error.nFutBrkg && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.nFutBrkg}
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label
                        className="form-label"
                        style={{ color: "#656D9A", fontSize: "14px" }}
                      >
                        nFutBrkgMin <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="nFutBrkgMin"
                        className="form-control"
                        // placeholder="Enter login name"
                        style={{ background: "#F8F9FB" }}
                        value={formData.nFutBrkgMin}
                        onChange={handleChange}
                      />
                      {error.nFutBrkgMin && (
                        <small style={{ color: "red", fontSize: "12px" }}>
                          {error.nFutBrkgMin}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    style={{ background: "#F8F9FB", color: "gray" }}
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
                    onClick={handleSubmit}
                  >
                    <span className="me-1">+</span>{" "}
                    {editMode ? "Update Scheme" : "Add Scheme"}
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

export default SchemeAdmin;

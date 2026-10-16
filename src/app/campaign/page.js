"use client";

import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import styles from "./campaign.module.css";
import { toast } from "react-toastify";
import { Copy, ExternalLink } from "lucide-react";
import Creatable from "react-select/creatable";
import CustomPagination from "@/components/CustomPagination/CustomPagination";
import { Tooltip } from "react-tooltip";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";

const CampaignPage = () => {
  const [token, setToken] = useState("");
  const [schemeAccessible, setSchemeAccessible] = useState([]);
  const [selectedSchemeAccessible, setSelectedSchemeAccessible] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [show, setShow] = useState(false);
  const [brokerageData, setBrokerageData] = useState([]);
  const [hasFetched, setHasFetched] = useState(false);

  // track live input typed in the Creatable input
  const [campaignInputText, setCampaignInputText] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Only allow Admin
      if (
        parsedUser.role !== "Relationship Manager" &&
        parsedUser.role !== "Authorised Person"
      ) {
        router.push("/unauthorize");
      }
    } else {
      router.push("/login");
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch Referral Data
  const fetchReferrals = async (pageNum = page, limitNum = limit) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/referral/my?page=${pageNum}&limit=${limitNum}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setReferrals(res.data.data);
        setPage(res.data.pagination.current);
        setTotalPages(res.data.pagination.pages);
        setTotalResults(res.data.pagination.total);
      }
    } catch (err) {
      console.error("Error fetching referrals:", err);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  const fetchSchemesAccessible = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/schemes/accessible`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        setSchemeAccessible(res.data.data);
        return true;
      }
    } catch (err) {
      console.error("Error fetching schemes:", err);
      return false;
    }
  };

  const referral = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/referral`,
        {
          campaignName: selectedCampaign,
          schemeId: selectedSchemeAccessible,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        toast.success("Campaign created successfully");
        fetchReferrals();

        // API se referralLink lekar proper URL banaye
        const referralLink = res.data.data.referralLink;
        const fullUrl = `${process.env.NEXT_PUBLIC_KYC_URL}/?referralid=${referralLink}`;
        setGeneratedUrl(fullUrl);
      }
    } catch (error) {
      console.error("Error creating referral:", error);
    }
  };

  const fetchSchemesById = async (schemeId) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/schemes/${schemeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data.success) {
        const scheme = res.data.data;
        setBrokerageData([
          {
            segment: "CM segment",
            trading: scheme.cMSegmentTradingBrokerage,
            delivery: scheme.cMSegmentDeliveryBrokerage,
            minimum: `Rs ${scheme.cMSegmentMinimumBrokerageInPaisa}/- Per Order`,
            option: "-",
          },
          {
            segment: "F & O segment",
            trading: scheme.fOSegmentTradingBrokerage,
            delivery: scheme.fOSegmentDeliveryBrokerage,
            minimum: `Rs ${scheme.fOSegmentMinimumBrokerageInPaisa}/- Per Order`,
            option: `Rs ${scheme.fOSegmentOptionBrokerageInRs}/- Per Order`,
          },
          {
            segment: "Currency",
            trading: scheme.currencyTradingBrokerage,
            delivery: scheme.currencyDeliveryBrokerage,
            minimum: `Rs ${scheme.currencyMinimumBrokerageInPaisa}/- Per Order`,
            option: scheme.currencyOptionBrokerageInRs,
          },
          {
            segment: "MCX",
            trading: scheme.mCXNCDEXTradingBrokerage,
            delivery: scheme.mCXNCDEXDeliveryBrokerage,
            minimum: `Rs ${scheme.mCXNCDEXMinimumBrokerageInPaisa}/- Per Order`,
            option: scheme.mCXNCDEXOptionBrokerageInRs,
          },
        ]);
        return true;
      }
    } catch (err) {
      console.error("Error fetching schemes:", err);
      return false;
    }
  };

  const CustomSchemeOption = (props) => {
    const { data } = props;
    return (
      <div className="d-flex justify-content-between align-items-center">
        <components.Option {...props} />
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm m-1"
          style={{ fontSize: "13px", padding: "8px 8px" }}
          onClick={async (e) => {
            e.stopPropagation(); // Prevent selecting the option
            await fetchSchemesById(data.value);
            setShow(true);
          }}
        >
          View
        </button>
      </div>
    );
  };

  const handlePageChange = (newPage) => {
    fetchReferrals(newPage, limit);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    fetchReferrals(1, newLimit); // Reset page to 1 when limit changes
  };

  // Copy referral link
  // const handleCopy = (link) => {
  //   const fullUrl = `${process.env.NEXT_PUBLIC_KYC_URL}/?referralid=${link}`;
  //   navigator.clipboard.writeText(fullUrl);
  //   toast.info("Referral link copied!");
  // };

  // // Redirect referral link
  // const handleRedirect = (link) => {
  //   const fullUrl = `${process.env.NEXT_PUBLIC_KYC_URL}/?referralid=${link}`;
  //   window.open(fullUrl, "_blank");
  // };
  const handleCopy = (referralId) => {
    // If referralId already contains the base URL, use it directly
    const fullUrl = referralId.startsWith("http")
      ? referralId
      : `${process.env.NEXT_PUBLIC_KYC_URL}/?referralid=${referralId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.info("Referral link copied!");
  };

  // Redirect referral link
  const handleRedirect = (referralId) => {
    const fullUrl = referralId.startsWith("http")
      ? referralId
      : `${process.env.NEXT_PUBLIC_KYC_URL}/?referralid=${referralId}`;
    window.open(fullUrl, "_blank");
  };

  // Unique Campaigns from referrals
  const campaignOptions = referrals.map((r) => ({
    value: r._id,
    label: r.campaignName,
  }));

  // when user types in input, check if campaignName already exists (case-insensitive)
  const isTypingDuplicate =
    campaignInputText &&
    campaignOptions.some(
      (opt) => opt.label.toLowerCase() === campaignInputText.toLowerCase()
    );

  useEffect(() => {
    if (!token) return;
    fetchSchemesAccessible();
    fetchReferrals(page, limit);
  }, [token]);

  if (!user) return <p>Loading...</p>;

  return (
    <>
      <Breadcrumb
        title="Generate Account Opening URL"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Generate Account Opening URL" },
        ]}
      />

      {/* Responsive Form Row */}
      <div className="mx-3 my-2 p-3 bg-white rounded-3 shadow-sm border">
        <div className="row m-3">
          {/* Campaign Dropdown */}
          <div className="col-12 col-md-4 mb-3">
            <input
              type="text"
              className="form-control fw-semibold"
              placeholder="Type Campaign Name..."
              value={campaignInputText}
              onChange={(e) => {
                const v = e.target.value;
                setCampaignInputText(v);
                setSelectedCampaign(v);
              }}
              style={{ minHeight: "38px", fontWeight: 600 }}
            />
            {isTypingDuplicate && (
              <div className="text-danger mt-2" style={{ fontSize: 13 }}>
                Campaign name already exists. Choose a different name.
              </div>
            )}
          </div>

          {/* Schema Dropdown */}
          <div className="col-12 col-md-6 mb-3">
            <Select
              className="fw-semibold"
              options={schemeAccessible.map((scheme) => ({
                value: scheme._id,
                label: scheme.schemeName,
              }))}
              placeholder="Select Scheme..."
              isSearchable
              value={
                schemeAccessible
                  .map((scheme) => ({
                    value: scheme._id,
                    label: scheme.schemeName,
                  }))
                  .find((opt) => opt.value === selectedSchemeAccessible) || null
              }
              onChange={async (option) => {
                setSelectedSchemeAccessible(option ? option.value : "");
                if (option) {
                  await fetchSchemesById(option.value);
                } else {
                  setBrokerageData([]);
                }
              }}
              components={{ Option: CustomSchemeOption }}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "38px",
                  fontWeight: "600",
                }),
              }}
            />
          </div>

          {/* Button */}
          <div className="col-12 col-md-2 mb-3">
            <button
              className={`${styles.applyBtn} w-100`}
              onClick={referral}
              style={{ minHeight: "38px" }}
              // disabled={!selectedCampaign || !selectedSchemeAccessible}
              // disable if nothing selected OR user typed a duplicate campaign name
              disabled={
                !selectedCampaign ||
                !selectedSchemeAccessible ||
                isTypingDuplicate
              }
            >
              Generate URL
            </button>
          </div>
        </div>
        {/* Referral Link Box */}

        {generatedUrl && (
          <div className="mx-2">
            <div className="p-3">
              {/* URL box with copy / go */}
              <div
                className="d-flex flex-column flex-md-column align-items-stretch gap-3"
                style={{ marginBottom: "12px" }}
              >
                <div
                  className="d-flex justify-content-between align-items-center p-3 rounded"
                  style={{
                    border: "2px dashed #bbb",
                    background: "#f8f9fa",
                    wordBreak: "break-all",
                  }}
                >
                  {/* URL text */}
                  <span className="me-3 flex-grow-1">{generatedUrl}</span>

                  {/* Action buttons inside box, right side */}
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary d-flex align-items-center gap-2"
                      onClick={() => handleCopy(generatedUrl)}
                    >
                      <Copy size={18} />
                      Copy
                    </button>

                    <button
                      className="btn btn-outline-secondary d-flex align-items-center gap-2"
                      onClick={() => handleRedirect(generatedUrl)}
                    >
                      <ExternalLink size={18} />
                      Open
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mx-3">
        <div className="bg-white p-0 mt-2 rounded-3 shadow-sm border">
          {/* Title + Search */}
          <div className="d-flex px-3 mt-3 justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="mb-0 fw-semibold" style={{ color: "#1e2129" }}>
              List of Campaigns
            </h5>
          </div>
          {/* Table for Campaigns */}
          <div className="mt-2">
            <div className="bg-white p-0 mt-2 rounded-3">
              <div className="table-responsive">
                <table className="table align-middle w-100 custom-table">
                  <thead
                    className={`${styles["custom-table-header"]} align-middle`}
                    style={{ height: "50px" }}
                  >
                    <tr>
                      <th className={styles["table-cell"]}>Campaign Name</th>
                      <th className={styles["table-cell"]}>Scheme</th>
                      <th className={styles["table-cell"]}>Clicks</th>
                      <th className={styles["table-cell"]}>Conversions</th>
                      <th className={styles["table-cell"]}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!hasFetched || isLoading ? ( // show loader until first fetch completes
                      <tr>
                        <td colSpan={5} className="text-center py-3">
                          Loading...
                        </td>
                      </tr>
                    ) : isError ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-3 text-danger"
                        >
                          Error loading data
                        </td>
                      </tr>
                    ) : referrals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-3 text-muted">
                          No campaigns found
                        </td>
                      </tr>
                    ) : (
                      referrals.map((r) => (
                        <tr
                          key={r._id}
                          className="border-bottom custom-table-height"
                        >
                          <td className={styles["table-cell"]}>
                            {r.campaignName}
                          </td>
                          <td className={styles["table-cell"]}>
                            {r.scheme.schemeName}
                          </td>
                          <td className={styles["table-cell"]}>{r.clicks}</td>
                          <td className={styles["table-cell"]}>
                            {r.conversions}
                          </td>
                          <td className={styles["table-cell"]}>
                            <div className="d-flex gap-4">
                              {/* Copy Icon */}
                              <Copy
                                className="cursor-pointer"
                                size={18}
                                data-tooltip-id="copyTip"
                                data-tooltip-content="Copy Link"
                                onClick={() => handleCopy(r.referralLink)}
                                cursor="pointer"
                              />

                              {/* External Link Icon */}
                              <ExternalLink
                                className="cursor-pointer"
                                size={18}
                                data-tooltip-id="externalTip"
                                data-tooltip-content="Open Link"
                                onClick={() => handleRedirect(r.referralLink)}
                                cursor="pointer"
                              />

                              {/* Tooltips */}
                              <Tooltip id="copyTip" place="top" />
                              <Tooltip id="externalTip" place="top" />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <CustomPagination
                  page={page}
                  pages={totalPages}
                  limit={limit}
                  total={totalResults}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}

      {show && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.6)", zIndex: 100500 }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered">
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
                  Brokerage Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  style={{
                    filter: "invert(1)",
                    backgroundColor: "transparent",
                  }}
                  onClick={() => setShow(false)}
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-0">
                <div className="table-responsive">
                  <table className="table align-middle w-100 custom-table">
                    <thead
                      className={`align-middle ${styles.customTableHeader}`}
                      style={{ height: "50px", background: "#f8f9fa" }}
                    >
                      <tr>
                        <th style={{ minWidth: 180 }}>Segment/Exchange</th>
                        <th style={{ minWidth: 180 }}>Trading brokerage (%)</th>
                        <th style={{ minWidth: 200 }}>
                          Delivery brokerage (%)
                        </th>
                        <th style={{ minWidth: 250 }}>
                          Minimum brokerage in (paisa)
                        </th>
                        <th style={{ minWidth: 220 }}>
                          Option brokerage in (Rs.)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {brokerageData.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            idx !== brokerageData.length - 1
                              ? "border-bottom"
                              : ""
                          }
                          style={{ height: "56px" }}
                        >
                          <td>{row.segment}</td>
                          <td>{row.trading}</td>
                          <td>{row.delivery}</td>
                          <td>{row.minimum}</td>
                          <td>{row.option}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShow(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CampaignPage;

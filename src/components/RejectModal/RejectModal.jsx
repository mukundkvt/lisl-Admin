"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckSquare, Square, X, RotateCcw } from "lucide-react";

const RejectModal = ({
  show,
  reasons = [],
  selectedReason = "",
  setSelectedReason,
  customReason = "",
  setCustomReason,
  error,
  onClose,
  onConfirm,
}) => {
  const [selectedList, setSelectedList] = useState([]);
  const [localCustomReason, setLocalCustomReason] = useState("");

  // Initialize or synchronize selections when modal opens
  useEffect(() => {
    if (show) {
      if (Array.isArray(selectedReason)) {
        setSelectedList(selectedReason);
      } else if (typeof selectedReason === "string" && selectedReason.trim()) {
        const parsed = selectedReason
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);
        setSelectedList(parsed);
      } else {
        setSelectedList([]);
      }
      setLocalCustomReason(customReason || "");
    }
  }, [show]);

  if (!show) return null;

  // Toggle individual reason checkbox (select/deselect)
  const handleToggle = (reason) => {
    const isAlreadySelected = selectedList.includes(reason);
    const updated = isAlreadySelected
      ? selectedList.filter((r) => r !== reason)
      : [...selectedList, reason];

    setSelectedList(updated);
    if (setSelectedReason) {
      setSelectedReason(updated.join("; "));
    }
  };

  // Deselect all selected options
  const handleDeselectAll = () => {
    setSelectedList([]);
    if (setSelectedReason) {
      setSelectedReason("");
    }
  };

  // Handle custom reason text input
  const handleCustomChange = (e) => {
    const val = e.target.value;
    setLocalCustomReason(val);
    if (setCustomReason) {
      setCustomReason(val);
    }
  };

  // Button is enabled only if at least one checkbox is selected OR custom text is typed
  const hasSelected = selectedList.length > 0;
  const hasCustom = Boolean(localCustomReason && localCustomReason.trim().length > 0);
  const hasAnyReason = hasSelected || hasCustom;
  const isConfirmDisabled = !hasAnyReason;

  // Compute final combined reason
  const getCombinedReason = () => {
    const parts = [];
    if (selectedList.length > 0) {
      parts.push(selectedList.join("; "));
    }
    if (localCustomReason.trim().length > 0) {
      parts.push(localCustomReason.trim());
    }
    return parts.join("; ");
  };

  const handleConfirm = () => {
    if (isConfirmDisabled) return;

    const finalReason = getCombinedReason();
    if (setSelectedReason) {
      setSelectedReason(finalReason);
    }
    onConfirm(finalReason);
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        background: "rgba(0, 0, 0, 0.55)",
        zIndex: 10050,
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded shadow-lg d-flex flex-column"
        style={{
          width: "560px",
          maxWidth: "92%",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="d-flex justify-content-between align-items-center p-3 px-4 border-bottom"
          style={{ backgroundColor: "#FFF5F5" }}
        >
          <div className="d-flex align-items-center gap-2">
            <AlertTriangle size={22} className="text-danger" />
            <h6 className="mb-0 fw-bold text-danger" style={{ fontSize: "16px" }}>
              Reason for Rejection
            </h6>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link text-muted p-0"
            onClick={onClose}
            style={{ textDecoration: "none" }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4" style={{ overflowY: "auto", flex: 1 }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-semibold text-dark" style={{ fontSize: "13px" }}>
              Select Rejection Reasons:
            </span>
            {hasSelected && (
              <div className="d-flex align-items-center gap-2">
                <span
                  className="badge bg-danger-subtle text-danger border border-danger-subtle"
                  style={{ fontSize: "11px" }}
                >
                  {selectedList.length} selected
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-muted p-0 d-flex align-items-center gap-1"
                  style={{ fontSize: "12px", textDecoration: "none" }}
                  onClick={handleDeselectAll}
                >
                  <RotateCcw size={12} /> Deselect All
                </button>
              </div>
            )}
          </div>

          {/* List of reasons with checkboxes */}
          <div className="d-flex flex-column gap-2 mb-3">
            {reasons && reasons.length > 0 ? (
              reasons.map((reason, i) => {
                const isChecked = selectedList.includes(reason);
                return (
                  <label
                    key={i}
                    className="d-flex align-items-start gap-2 p-2 px-3 rounded border transition"
                    style={{
                      cursor: "pointer",
                      backgroundColor: isChecked ? "#FFF5F5" : "#FAFAFA",
                      borderColor: isChecked ? "#FF8080" : "#E2E8F0",
                      transition: "all 0.15s ease-in-out",
                    }}
                    onClick={(e) => {
                      // Prevent label's native double-toggle when clicking directly on checkbox input
                      if (e.target.tagName !== "INPUT") {
                        handleToggle(reason);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input mt-1"
                      style={{ cursor: "pointer", flexShrink: 0 }}
                      checked={isChecked}
                      onChange={() => handleToggle(reason)}
                    />
                    <span
                      className="text-dark"
                      style={{
                        fontSize: "13px",
                        lineHeight: "1.4",
                        fontWeight: isChecked ? 600 : 400,
                      }}
                    >
                      {reason}
                    </span>
                  </label>
                );
              })
            ) : (
              <p className="text-muted small">No predefined reasons available.</p>
            )}
          </div>

          {/* Custom Reason Textarea */}
          <div className="mt-3">
            <label
              htmlFor="customRejectReason"
              className="form-label fw-semibold text-dark mb-1"
              style={{ fontSize: "13px" }}
            >
              Custom / Additional Reason:
            </label>
            <textarea
              id="customRejectReason"
              placeholder="Write custom reason or additional comments..."
              className="form-control"
              rows="3"
              style={{ fontSize: "13px", resize: "vertical" }}
              value={localCustomReason}
              onChange={handleCustomChange}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger p-2 mt-2 mb-0" style={{ fontSize: "12px" }}>
              {error}
            </div>
          )}

          {/* Live Preview */}
          {hasAnyReason && (
            <div
              className="p-2 px-3 rounded mt-3"
              style={{
                backgroundColor: "#FFF8F0",
                border: "1px dashed #F59E0B",
                fontSize: "12px",
                color: "#92400E",
              }}
            >
              <strong className="d-block mb-1">Reason to be recorded:</strong>
              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {getCombinedReason()}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="d-flex justify-content-between align-items-center p-3 px-4 border-top bg-light"
        >
          <small
            className="text-muted"
            style={{ fontSize: "12px" }}
          >
            {isConfirmDisabled ? (
              <span className="text-muted">Select an option or write a reason to enable reject</span>
            ) : (
              <span className="text-success fw-semibold">Reason ready</span>
            )}
          </small>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3"
              onClick={onClose}
              style={{ fontWeight: 500 }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger px-3 d-flex align-items-center gap-1"
              disabled={isConfirmDisabled}
              style={{
                opacity: isConfirmDisabled ? 0.5 : 1,
                cursor: isConfirmDisabled ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
              onClick={handleConfirm}
              title={
                isConfirmDisabled
                  ? "Please select at least one reason or enter a custom reason"
                  : "Click to confirm rejection"
              }
            >
              Confirm Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
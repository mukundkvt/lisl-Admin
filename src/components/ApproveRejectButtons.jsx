import React, { useState } from "react";
import { Check, X } from "lucide-react";
import RejectModal from "./RejectModal/RejectModal";

const ApproveRejectButtons = ({
  onApprove,
  onReject,
  reasons,
  selectedReason,
  setSelectedReason,
  customReason,
  setCustomReason,
  error,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="d-flex justify-content-center align-items-center gap-3 m-4 mb-5">
      {/* Approve Button */}
      <button
        className="d-flex align-items-center gap-2 px-4 py-2 rounded"
        style={{
          backgroundColor: "#e6f7e6", // light green background
          color: "#2e7d32", // dark green text
          border: "1.5px solid #2e7d32", // dark green border
        }}
        onClick={onApprove}
      >
        <div className="rounded-end d-flex align-items-center fw-semibold">
          <Check
            size={20}
            style={{
              backgroundColor: "#56CA00",
              color: "white",
              borderRadius: "50%",
              padding: "3px",
              marginRight: "8px",
            }}
          />
          Approve
        </div>
      </button>

      {/* Reject Button */}
      <button
        className="d-flex align-items-center gap-2 px-4 py-2 rounded"
        style={{
          backgroundColor: "#fff5ee",
          color: "#ff5c00",
          border: "1.5px solid #ff5c00",
        }}
        onClick={() => setShowModal(true)}
      >
        <div className="rounded-end d-flex align-items-center fw-semibold">
          <X
            size={20}
            style={{
              backgroundColor: "#ff0000",
              color: "white",
              borderRadius: "50%",
              padding: "3px",
              marginRight: "8px",
            }}
          />
          Reject
        </div>
      </button>

      {/* Reject Modal */}
      <RejectModal
        show={showModal}
        reasons={reasons}
        selectedReason={selectedReason}
        setSelectedReason={setSelectedReason}
        customReason={customReason}
        setCustomReason={setCustomReason}
        error={error}
        onClose={() => setShowModal(false)}
        onConfirm={(reason) => {
          onReject(reason);
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default ApproveRejectButtons;

import React from "react";

const UserModal = ({ show, onClose, children }) => {
  if (!show) return null;
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}
    >
      <div className="bg-white p-4 rounded shadow" style={{ minWidth: 400 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Add User</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default UserModal;
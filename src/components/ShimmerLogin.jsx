"use client";
import React from "react";

export default function ShimmerLogin() {
  return (
    <div className="container-fluid min-vh-100 d-flex flex-column flex-md-row p-0">
      {/* Left Section Skeleton */}
      <div
        className="d-none d-md-flex col-md-7 align-items-center justify-content-center bg-secondary-subtle"
        style={{
          backgroundColor: "#e0e0e0",
          animation: "pulse 1.5s infinite",
        }}
      >
        <div className="text-center p-4">
          <div className="placeholder-glow">
            <span className="placeholder col-6 bg-secondary"></span>
          </div>
        </div>
      </div>

      {/* Right Section Skeleton */}
      <div className="col-12 col-md-5 d-flex align-items-center justify-content-center p-4 bg-white">
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <div className="text-center mb-4">
            <div className="placeholder rounded-circle bg-secondary mb-3" style={{ width: "80px", height: "80px", margin: "0 auto" }}></div>
            <div className="placeholder-glow mb-2">
              <span className="placeholder col-8 bg-secondary"></span>
            </div>
            <div className="placeholder-glow">
              <span className="placeholder col-10 bg-secondary"></span>
            </div>
          </div>

          <div className="card shadow">
            <div className="card-body">
              <div className="placeholder-glow mb-3">
                <span className="placeholder col-12 bg-secondary" style={{ height: "38px", borderRadius: "4px" }}></span>
              </div>
              <div className="placeholder-glow mb-3">
                <span className="placeholder col-12 bg-secondary" style={{ height: "38px", borderRadius: "4px" }}></span>
              </div>
              <div className="placeholder-glow">
                <span className="placeholder col-12 bg-secondary" style={{ height: "40px", borderRadius: "5px" }}></span>
              </div>
            </div>
          </div>

          <div className="text-center mt-3 placeholder-glow">
            <span className="placeholder col-6 bg-secondary"></span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

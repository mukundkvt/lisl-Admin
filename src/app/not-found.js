"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hammer, ArrowLeft, LayoutDashboard, Sparkles, Clock, ShieldAlert } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="d-flex align-items-center justify-content-center w-100 min-vh-100"
      style={{
        background: "radial-gradient(circle at 50% 30%, rgba(255, 92, 0, 0.05) 0%, rgba(248, 249, 250, 1) 70%)",
        padding: "2rem 1rem",
      }}
    >
      <div
        className="text-center p-4 p-md-5 rounded-4 shadow-lg border"
        style={{
          maxWidth: "560px",
          width: "100%",
          backgroundColor: "#ffffff",
          borderColor: "rgba(255, 92, 0, 0.15)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* Animated Badge & Icon */}
        <div className="d-flex justify-content-center mb-4">
          <div
            className="position-relative d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: "90px",
              height: "90px",
              background: "linear-gradient(135deg, #FFF7F0 0%, #FFEAD9 100%)",
              border: "2px solid rgba(255, 92, 0, 0.2)",
              boxShadow: "0 8px 24px rgba(255, 92, 0, 0.15)",
            }}
          >
            <Hammer
              size={42}
              style={{
                color: "#ff5c00",
                transform: "rotate(-10deg)",
                filter: "drop-shadow(0 2px 4px rgba(255,92,0,0.3))",
              }}
            />
            <span
              className="position-absolute bottom-0 end-0 p-1 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
              style={{ width: "28px", height: "28px" }}
            >
              <Sparkles size={16} color="#ff5c00" />
            </span>
          </div>
        </div>

        {/* Status Pill */}
        <div className="mb-3">
          <span
            className="badge rounded-pill px-3 py-2 fw-semibold text-uppercase"
            style={{
              backgroundColor: "#FFF7F0",
              color: "#ff5c00",
              border: "1px solid rgba(255, 92, 0, 0.25)",
              letterSpacing: "0.8px",
              fontSize: "0.75rem",
            }}
          >
            <Clock size={12} className="me-1 mb-1" /> 404 • Under Construction
          </span>
        </div>

        {/* Heading */}
        <h1
          className="fw-bold mb-3"
          style={{
            fontSize: "2rem",
            color: "#1E2129",
            letterSpacing: "-0.5px",
          }}
        >
          Team is working on it
        </h1>

        {/* Description */}
        <p
          className="text-secondary mx-auto mb-4"
          style={{
            fontSize: "0.95rem",
            lineHeight: "1.6",
            maxWidth: "440px",
          }}
        >
          This feature or page is currently being crafted by our engineering team. We are building something extraordinary for you — check back soon!
        </p>

        {/* Action Buttons */}
        <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3 mt-2">
          <Link
            href="/dashboard"
            className="btn px-4 py-2 d-flex align-items-center justify-content-center text-white fw-medium shadow-sm w-100 w-sm-auto"
            style={{
              background: "linear-gradient(135deg, #ff5c00 0%, #e04b00 100%)",
              borderRadius: "10px",
              border: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
              fontSize: "0.9rem",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 92, 0, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <LayoutDashboard size={18} className="me-2" />
            Back to Dashboard
          </Link>

          <button
            onClick={() => router.back()}
            className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center justify-content-center fw-medium w-100 w-sm-auto"
            style={{
              borderRadius: "10px",
              fontSize: "0.9rem",
            }}
          >
            <ArrowLeft size={18} className="me-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

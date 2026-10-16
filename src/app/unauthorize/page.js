"use client"; // only if you are in app router

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link";

const UnauthorizedPage = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center mt-5 text-center px-3">
      {/* Image */}
      <img
        src="https://static1.makeuseofimages.com/wordpress/wp-content/uploads/2024/02/cartoon-style-computer-with-access-denied-warning-message.jpg"
        alt="Unauthorized"
        width={580}
        className="mb-4"
      />

      {/* Heading */}
      <h1 className="fw-bold text-danger mb-3">Access Denied</h1>

      {/* Message */}
      <p className="lead text-secondary mb-4">
        Sorry, you don’t have permission to access this page.
      </p>

      {/* Back Button */}
      <Link href="/" className="btn btn-danger px-4 py-2 rounded-pill shadow">
        Go Back Home
      </Link>
    </div>
  );
};

export default UnauthorizedPage;


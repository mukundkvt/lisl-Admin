"use client";

import Link from "next/link";

const Breadcrumb = ({ title, breadcrumbs }) => {
  return (
    <div
      className="d-flex flex-column flex-md-row justify-content-between border-bottom px-4 pt-3 gap-2"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 11,
        background: "#fff",
      }}
    >
      {/* Title */}
      <h5 className="mb-0 fw-semibold">{title}</h5>

      {/* Breadcrumb */}
      <nav
        style={{
          "--bs-breadcrumb-divider": `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%236c757d'/%3E%3C/svg%3E")`,
        }}
        aria-label="breadcrumb"
      >
        <ol className="breadcrumb">
          {breadcrumbs.map((item, index) => (
            <li
              key={index}
              className={`breadcrumb-item ${
                index === breadcrumbs.length - 1 ? "active" : ""
              }`}
              aria-current={
                index === breadcrumbs.length - 1 ? "page" : undefined
              }
            >
              {item.href ? (
                <Link
                  className="text-decoration-none"
                  style={{ color: "#FF4800" }}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                item.label
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;

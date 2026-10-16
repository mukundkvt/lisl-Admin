import React from "react";
import styles from "./SidebarShimmer.module.css"; // css alag rakhe hai

export default function SidebarShimmer({ collapsed }) {
  return (
    <div
      className={`sidebar ${collapsed ? "collapsed" : ""}`}
      style={{ top: 0, height: "100vh", zIndex: 1000 }}
    >
      {/* Logo shimmer */}
      <div
        style={{
          position: !collapsed ? "fixed" : "static",
          top: 0,
          left: 0,
          width: collapsed ? 60 : 240,
          background: "#fff",
          zIndex: 20,
          transition: "width 0.3s",
        }}
      >
        <div className="logo-container">
          <div
            className={`${styles.shimmer} ${
              collapsed ? styles.logoSm : styles.logoFull
            }`}
          />
        </div>
        {!collapsed && (
          <div
            className="kyctype-selector"
            style={{
              position: "fixed",
              top: 80,
              left: 0,
              width: 240,
              background: "#fff",
              zIndex: 19,
              paddingBottom: 0,
            }}
          >
            <div className="radio-group">
              <div className={`${styles.shimmer} ${styles.radioBtn}`} />
              <div className={`${styles.shimmer} ${styles.radioBtn}`} />
            </div>
          </div>
        )}
      </div>

      {/* Nav shimmer */}
      <div
        className={`${styles.customScrollbar}`}
        style={{
          marginTop: !collapsed ? 150 : 50,
          overflowY: "auto",
          height: !collapsed ? "calc(100vh - 170px)" : "calc(100vh - 80px)",
        }}
      >
        <nav className="nav-links">
          {/* Navigation Section Title */}
          {!collapsed && (
            <div className={`${styles.shimmer} ${styles.sectionTitle}`} />
          )}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`nav-${i}`}
              className={`${styles.shimmer} ${styles.navItem}`}
              style={{
                marginLeft: collapsed ? "auto" : "16px",
                marginRight: collapsed ? "auto" : "16px",
              }}
            />
          ))}

          {/* Support & Settings Section Title */}
          {!collapsed && (
            <div className={`${styles.shimmer} ${styles.sectionTitle}`} />
          )}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`support-${i}`}
              className={`${styles.shimmer} ${styles.navItem}`}
              style={{
                marginLeft: collapsed ? "auto" : "16px",
                marginRight: collapsed ? "auto" : "16px",
              }}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}

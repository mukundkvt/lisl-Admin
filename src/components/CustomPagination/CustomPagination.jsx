import React from "react";
import styles from "./customPagination.module.css";

// helper to generate smart page numbers
const getPageNumbers = (current, total, delta = 2) => {
  const range = [];
  const rangeWithDots = [];
  let last;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (last) {
      if (i - last === 2) {
        rangeWithDots.push(last + 1);
      } else if (i - last > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    last = i;
  }

  return rangeWithDots;
};

const CustomPagination = ({
  page = 1,
  pages = 1,
  limit = 10,
  total = 0,
  onPageChange,
  onLimitChange,
}) => {
  // Calculate start and end result numbers
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pageNumbers = getPageNumbers(page, pages);

  return (
    <div
      className={styles.customTablePagination}
      style={{ backgroundColor: "#F8F9FB" }}
    >
      {/* Results per page */}
      <div className={styles.resultsDropdown}>
        <span>View results</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className={`form-select form-select-sm ${styles.formSelect}`}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Info */}
      <div className={styles.paginationInfo}>
        <span>
          <strong>Page {page}</strong> of <strong>{pages}</strong>
        </span>
        <span>
          Showing <strong>{start}–{end}</strong> of {total} results
        </span>
      </div>

      {/* Pagination */}
      <nav>
        <ul className={styles.pagination}>
          {/* Prev */}
          <li
            className={`${styles.pageItem} ${
              page === 1 ? styles.pageItemDisabled : ""
            }`}
            onClick={() => page > 1 && onPageChange(page - 1)}
          >
            <span className={styles.pageLink}>&laquo;</span>
          </li>

          {/* Page numbers */}
          {pageNumbers.map((num, index) => (
            <li
              key={index}
              className={`${styles.pageItem} ${
                num === page ? styles.pageItemActive : ""
              } ${num === "..." ? styles.pageItemDisabled : ""}`}
              onClick={() =>
                typeof num === "number" && num !== page && onPageChange(num)
              }
              style={{
                cursor: num === "..." ? "default" : "pointer",
              }}
            >
              <span className={styles.pageLink}>{num}</span>
            </li>
          ))}

          {/* Next */}
          <li
            className={`${styles.pageItem} ${
              page === pages ? styles.pageItemDisabled : ""
            }`}
            onClick={() => page < pages && onPageChange(page + 1)}
          >
            <span className={styles.pageLink}>&raquo;</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default CustomPagination;

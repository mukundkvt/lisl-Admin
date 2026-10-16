import React from "react";
// import { Table } from "react-bootstrap";

const TableSkeletonRow = ({ columns = 4 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-3 py-2">
        <div
          className="placeholder-glow w-100"
          style={{ height: "1rem", borderRadius: "0.25rem" }}
        >
          <span className="placeholder col-12"></span>
        </div>
      </td>
    ))}
  </tr>
);

export default TableSkeletonRow;

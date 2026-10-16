// "use client";
// import React, { useState } from "react";

// const DateRangePicker = ({ dateRange, setDateRange, open, setOpen }) => {
//   const [calendarMonth, setCalendarMonth] = useState(new Date());

//   const getDaysInMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   };

//   const getFirstDayOfMonth = (date) => {
//     return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
//   };

//   // Fixed date handling to avoid timezone issues
//   const formatDateForStorage = (year, month, day) => {
//     const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
//     return dateStr;
//   };

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "";
//     const date = new Date(dateStr);
//     return date.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//     });
//   };

//   const handleDateClick = (day, monthOffset = 0) => {
//     const targetMonth = new Date(calendarMonth);
//     targetMonth.setMonth(targetMonth.getMonth() + monthOffset);

//     const selectedDate = formatDateForStorage(
//       targetMonth.getFullYear(),
//       targetMonth.getMonth(),
//       day,
//     );

//     if (!dateRange.start) {
//       setDateRange({ start: selectedDate, end: "" });
//     } else if (!dateRange.end) {
//       if (selectedDate < dateRange.start) {
//         setDateRange({ start: selectedDate, end: dateRange.start });
//       } else {
//         setDateRange({ start: dateRange.start, end: selectedDate });
//       }
//     } else {
//       setDateRange({ start: selectedDate, end: "" });
//     }
//   };

//   const isDateInRange = (day, monthOffset = 0) => {
//     if (!dateRange.start || !dateRange.end) return false;
//     const targetMonth = new Date(calendarMonth);
//     targetMonth.setMonth(targetMonth.getMonth() + monthOffset);

//     const date = formatDateForStorage(
//       targetMonth.getFullYear(),
//       targetMonth.getMonth(),
//       day,
//     );
//     return date >= dateRange.start && date <= dateRange.end;
//   };

//   const isDateSelected = (day, monthOffset = 0) => {
//     const targetMonth = new Date(calendarMonth);
//     targetMonth.setMonth(targetMonth.getMonth() + monthOffset);

//     const date = formatDateForStorage(
//       targetMonth.getFullYear(),
//       targetMonth.getMonth(),
//       day,
//     );
//     return date === dateRange.start || date === dateRange.end;
//   };

//   const renderCalendar = (monthOffset = 0) => {
//     const targetMonth = new Date(calendarMonth);
//     targetMonth.setMonth(targetMonth.getMonth() + monthOffset);

//     const daysInMonth = getDaysInMonth(targetMonth);
//     const firstDay = getFirstDayOfMonth(targetMonth);
//     const days = [];

//     for (let i = 0; i < firstDay; i++) {
//       days.push(null);
//     }
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }

//     return days;
//   };

//   if (!open) return null;

//   return (
//     <div
//       className="dropdown-menu show p-3 mt-2 date-dropdown"
//       style={{
//         position: "absolute",
//         right: 0,
//         minWidth: "650px",
//         boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
//         border: "1px solid #e0e0e0",
//         borderRadius: "8px",
//         backgroundColor: "#fff",
//         zIndex: 1000,
//       }}
//     >
//       <label
//         className="mb-3 d-block fw-semibold"
//         style={{ fontSize: "14px", color: "#1e2129" }}
//       >
//         Select Date Range
//       </label>

//       {/* Two Calendars Container */}
//       <div
//         className="d-flex gap-3 mb-3"
//         style={{ justifyContent: "space-between" }}
//       >
//         {/* Calendar 1 - Current Month */}
//         <div style={{ flex: 1 }}>
//           {/* Calendar Header */}
//           <div className="d-flex justify-content-between align-items-center mb-2">
//             <button
//               className="btn btn-sm"
//               onClick={() => {
//                 const newDate = new Date(calendarMonth);
//                 newDate.setMonth(newDate.getMonth() - 1);
//                 setCalendarMonth(newDate);
//               }}
//               style={{
//                 border: "none",
//                 background: "none",
//                 padding: 0,
//                 fontSize: "16px",
//                 cursor: "pointer",
//               }}
//             >
//               ←
//             </button>
//             <span style={{ fontSize: "12px", fontWeight: "600" }}>
//               {calendarMonth.toLocaleDateString("en-US", {
//                 month: "short",
//                 year: "numeric",
//               })}
//             </span>
//             <div style={{ width: "20px" }} />
//           </div>

//           {/* Weekday Headers */}
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(7, 1fr)",
//               gap: "1px",
//               marginBottom: "4px",
//             }}
//           >
//             {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
//               <div
//                 key={day}
//                 style={{
//                   textAlign: "center",
//                   fontSize: "10px",
//                   fontWeight: "600",
//                   color: "#666",
//                   padding: "4px 0",
//                 }}
//               >
//                 {day}
//               </div>
//             ))}
//           </div>

//           {/* Calendar Days */}
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(7, 1fr)",
//               gap: "1px",
//             }}
//           >
//             {renderCalendar(0).map((day, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => day && handleDateClick(day, 0)}
//                 disabled={!day}
//                 style={{
//                   padding: "4px 2px",
//                   border: isDateSelected(day, 0)
//                     ? "2px solid #FF4800"
//                     : "1px solid #e0e0e0",
//                   borderRadius: "3px",
//                   background: isDateSelected(day, 0)
//                     ? "#FF4800"
//                     : isDateInRange(day, 0)
//                       ? "#FFE5D3"
//                       : "#fff",
//                   color: isDateSelected(day, 0)
//                     ? "#fff"
//                     : isDateInRange(day, 0)
//                       ? "#FF4800"
//                       : "#1e2129",
//                   fontSize: "11px",
//                   fontWeight: day ? "500" : "400",
//                   cursor: day ? "pointer" : "default",
//                   opacity: day ? 1 : 0.3,
//                   minWidth: "28px",
//                   height: "28px",
//                 }}
//               >
//                 {day}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Calendar 2 - Next Month */}
//         <div style={{ flex: 1 }}>
//           {/* Calendar Header */}
//           <div className="d-flex justify-content-between align-items-center mb-2">
//             <div style={{ width: "20px" }} />
//             <span style={{ fontSize: "12px", fontWeight: "600" }}>
//               {(() => {
//                 const nextMonth = new Date(calendarMonth);
//                 nextMonth.setMonth(nextMonth.getMonth() + 1);
//                 return nextMonth.toLocaleDateString("en-US", {
//                   month: "short",
//                   year: "numeric",
//                 });
//               })()}
//             </span>
//             <button
//               className="btn btn-sm"
//               onClick={() => {
//                 const newDate = new Date(calendarMonth);
//                 newDate.setMonth(newDate.getMonth() + 1);
//                 setCalendarMonth(newDate);
//               }}
//               style={{
//                 border: "none",
//                 background: "none",
//                 padding: 0,
//                 fontSize: "16px",
//                 cursor: "pointer",
//               }}
//             >
//               →
//             </button>
//           </div>

//           {/* Weekday Headers */}
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(7, 1fr)",
//               gap: "1px",
//               marginBottom: "4px",
//             }}
//           >
//             {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
//               <div
//                 key={day}
//                 style={{
//                   textAlign: "center",
//                   fontSize: "10px",
//                   fontWeight: "600",
//                   color: "#666",
//                   padding: "4px 0",
//                 }}
//               >
//                 {day}
//               </div>
//             ))}
//           </div>

//           {/* Calendar Days */}
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(7, 1fr)",
//               gap: "1px",
//             }}
//           >
//             {renderCalendar(1).map((day, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => day && handleDateClick(day, 1)}
//                 disabled={!day}
//                 style={{
//                   padding: "4px 2px",
//                   border: isDateSelected(day, 1)
//                     ? "2px solid #FF4800"
//                     : "1px solid #e0e0e0",
//                   borderRadius: "3px",
//                   background: isDateSelected(day, 1)
//                     ? "#FF4800"
//                     : isDateInRange(day, 1)
//                       ? "#FFE5D3"
//                       : "#fff",
//                   color: isDateSelected(day, 1)
//                     ? "#fff"
//                     : isDateInRange(day, 1)
//                       ? "#FF4800"
//                       : "#1e2129",
//                   fontSize: "11px",
//                   fontWeight: day ? "500" : "400",
//                   cursor: day ? "pointer" : "default",
//                   opacity: day ? 1 : 0.3,
//                   minWidth: "28px",
//                   height: "28px",
//                 }}
//               >
//                 {day}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Selected Range Display */}
//       {(dateRange.start || dateRange.end) && (
//         <div
//           style={{
//             padding: "10px",
//             background: "#f8f9fa",
//             borderRadius: "6px",
//             marginBottom: "12px",
//             fontSize: "12px",
//             color: "#1e2129",
//           }}
//         >
//           <strong>Selected:</strong>{" "}
//           {dateRange.start && formatDate(dateRange.start)}
//           {dateRange.end && ` - ${formatDate(dateRange.end)}`}
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="d-flex gap-2">
//         <button
//           className="btn btn-sm flex-grow-1"
//           onClick={() => {
//             setDateRange({ start: "", end: "" });
//             setOpen(false);
//           }}
//           style={{
//             background: "#f8f9fa",
//             color: "#1e2129",
//             border: "1px solid #ced4da",
//             borderRadius: "6px",
//             fontSize: "13px",
//             fontWeight: "500",
//             padding: "6px 12px",
//           }}
//         >
//           Clear
//         </button>
//         <button
//           className="btn btn-sm flex-grow-1"
//           onClick={() => setOpen(false)}
//           style={{
//             background: "#FF4800",
//             color: "#fff",
//             border: "none",
//             borderRadius: "6px",
//             fontSize: "13px",
//             fontWeight: "500",
//             padding: "6px 12px",
//           }}
//         >
//           Apply
//         </button>
//       </div>
//     </div>
//   );
// };

// export default DateRangePicker;

// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { DateRange } from "react-date-range";
// import { addDays, format } from "date-fns";

// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";

// const DateRangePicker = ({ dateRange, setDateRange, open, setOpen }) => {
//   const ref = useRef(null);

//   const [range, setRange] = useState([
//     {
//       startDate: dateRange.start
//         ? new Date(dateRange.start)
//         : addDays(new Date(), -7),
//       endDate: dateRange.end ? new Date(dateRange.end) : new Date(),
//       key: "selection",
//     },
//   ]);

//   useEffect(() => {
//     const handleOutside = (e) => {
//       if (ref.current && !ref.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     if (open) document.addEventListener("mousedown", handleOutside);
//     return () => document.removeEventListener("mousedown", handleOutside);
//   }, [open, setOpen]);

//   if (!open) return null;

//   const handleApply = () => {
//     setDateRange({
//       start: format(range[0].startDate, "yyyy-MM-dd"),
//       end: format(range[0].endDate, "yyyy-MM-dd"),
//     });
//     setOpen(false);
//   };

//   const handleClear = () => {
//     setDateRange({ start: "", end: "" });
//     setOpen(false);
//   };

//   const isValidRange = range[0].startDate && range[0].endDate;

//   return (
//     <div
//       ref={ref}
//       className="position-absolute bg-white shadow date-range-wrapper"
//       style={{ top: "45px", right: 0, zIndex: 1000, borderRadius: "8px" }}
//     >
//       <DateRange
//         ranges={range}
//         onChange={(item) => setRange([item.selection])}
//         moveRangeOnFirstSelection={false}
//         months={2}
//         direction="horizontal"
//         maxDate={new Date()}
//         rangeColors={["#FF4800"]}
//       />

//       <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
//         <div style={{ fontSize: "12px", fontWeight: 600 }}>
//           {format(range[0].startDate, "MMM dd")} →{" "}
//           {format(range[0].endDate, "MMM dd")}
//         </div>

//         <div className="d-flex gap-2">
//           <button
//             className="btn btn-outline-secondary btn-sm"
//             onClick={handleClear}
//           >
//             Clear
//           </button>
//           <button
//             className="btn btn-primary btn-sm"
//             disabled={!isValidRange}
//             onClick={handleApply}
//           >
//             Apply
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DateRangePicker;


"use client";

import React, { useState, useEffect, useRef } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const DateRangePicker = ({ dateRange, setDateRange, open, setOpen }) => {
  const ref = useRef(null);

  const [range, setRange] = useState([
    {
      startDate: dateRange.start ? new Date(dateRange.start) : new Date(),
      endDate: dateRange.end ? new Date(dateRange.end) : new Date(),
      key: "selection",
    },
  ]);

  // outside click close
  useEffect(() => {
    const handleOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open, setOpen]);

  if (!open) return null;

  const handleApply = () => {
    setDateRange({
      start: format(range[0].startDate, "yyyy-MM-dd"),
      end: format(range[0].endDate, "yyyy-MM-dd"),
    });
    setOpen(false);
  };

  const handleClear = () => {
    const today = new Date();

    setRange([
      {
        startDate: today,
        endDate: today,
        key: "selection",
      },
    ]);

    setDateRange({ start: "", end: "" });
  };

  const isValidRange = range[0].startDate && range[0].endDate;

  return (
    <div
      ref={ref}
      className="position-absolute bg-white shadow"
      style={{ top: "45px", right: 0, zIndex: 1000, borderRadius: "8px" }}
    >
      <DateRange
        ranges={range}
        onChange={(item) => setRange([item.selection])}
        moveRangeOnFirstSelection={false}
        months={2}
        direction="horizontal"
        maxDate={new Date()}
        rangeColors={["#FF4800"]}
      />

      <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
        <div style={{ fontSize: "12px", fontWeight: 600 }}>
          {format(range[0].startDate, "MMM dd")} →{" "}
          {format(range[0].endDate, "MMM dd")}
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            className="btn btn-primary btn-sm"
            disabled={!isValidRange}
            onClick={handleApply}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;

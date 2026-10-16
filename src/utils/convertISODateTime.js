const formatIndianDateTime = (dateString) => {
  if (!dateString) return "-";

  // remove Z to avoid UTC → IST double conversion
  const safeDate = dateString.endsWith("Z")
    ? dateString.replace("Z", "")
    : dateString;

  return new Date(safeDate).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export default formatIndianDateTime;
function formatFunDate(dbDate) {
  if (!dbDate) return "";

  const date = new Date(dbDate);

  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const year = date.getUTCFullYear();

  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`;
}

export default formatFunDate

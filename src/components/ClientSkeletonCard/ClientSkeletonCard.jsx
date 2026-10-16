import style from "./clientSkeleton.module.css";

const ClientCardSkeleton = () => {
  return (
    <div className="bg-white border rounded p-3 mb-3">
      {/* Top Row: Avatar, Name, Code, PAN, Date, Contact, Pending Action */}
      <div className="d-flex flex-wrap justify-content-between align-items-center">
        {/* Avatar + Name + Code */}
        <div className="d-flex align-items-center mb-2">
          <div className={`rounded-circle ${style.shimmer} me-3`} style={{ width: "40px", height: "40px" }}></div>
          <div>
            <div className={`${style.shimmer} rounded mb-1`} style={{ width: "120px", height: "14px" }}></div>
            <div className={`${style.shimmer} rounded`} style={{ width: "80px", height: "12px" }}></div>
          </div>
        </div>

        {/* PAN + CreatedOn */}
        <div className="text-end mb-2">
          <div className={`${style.shimmer} rounded mb-1`} style={{ marginRight:"120px", width: "120px", height: "12px" }}></div>
          <div className={`${style.shimmer} rounded`} style={{marginRight:"120px", width: "100px", height: "12px" }}></div>
        </div>

        {/* Phone + Email */}
        <div className="text-end mb-2">
          <div className={`${style.shimmer} rounded mb-1`} style={{marginRight:"120px", width: "140px", height: "12px" }}></div>
          <div className={`${style.shimmer} rounded`} style={{marginRight:"120px", width: "160px", height: "12px" }}></div>
        </div>

        {/* Pending Action Button */}
        <div>
          <div className={`${style.shimmer} rounded-pill`} style={{marginRight:"60px", height: "24px", width: "130px" }}></div>
        </div>
      </div>

      {/* Info Block (KRA + AP + Emp Code) */}
      <div className="my-2">
        <div className={`${style.shimmer} rounded mb-1`} style={{ width: "100%", height: "12px" }}></div>
        <div className={`${style.shimmer} rounded`} style={{ width: "80%", height: "12px" }}></div>
      </div>

      {/* Status Icons */}
      <div className="d-flex flex-wrap gap-2 mt-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`${style.shimmer} rounded-pill px-3 py-2`}
            style={{ width: "100px", height: "28px" }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ClientCardSkeleton;

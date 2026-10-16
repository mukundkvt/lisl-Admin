// import React, { useState } from "react";

// const PdfImageViewer = ({ show, onClose, fileUrl, fileType }) => {
//   const [scale, setScale] = useState(1);
//   const [rotate, setRotate] = useState(0);

//   if (!show) return null;

//   const zoomIn = () => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)));
//   const zoomOut = () => setScale((s) => Math.max(0.25, +(s - 0.25).toFixed(2)));
//   const rotateLeft = () => setRotate((r) => (r - 90) % 360);
//   const rotateRight = () => setRotate((r) => (r + 90) % 360);

//   const transformedStyle = {
//     transform: `scale(${scale}) rotate(${rotate}deg)`,
//     transformOrigin: "center center",
//     transition: "transform 150ms ease",
//     display: "block",
//     maxWidth: "100%",
//     maxHeight: "100%",
//   };

//   return (
//     <div
//       role="dialog"
//       aria-modal="true"
//       style={{
//         position: "fixed",
//         inset: 0,
//         background: "rgba(0,0,0,0.75)",
//         zIndex: 2000,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: 20,
//       }}
//       onClick={onClose}
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           width: "90%",
//           height: "90%",
//           background: "#fff",
//           borderRadius: 8,
//           display: "flex",
//           flexDirection: "column",
//           overflow: "hidden",
//         }}
//       >
//         <div
//           style={{
//             padding: "8px 12px",
//             background: "#f7f7f7",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             gap: 8,
//           }}
//         >
//           <div style={{ display: "flex", gap: 8 }}>
//             <button onClick={zoomOut} className="btn btn-sm btn-secondary">
//               −
//             </button>
//             <button onClick={zoomIn} className="btn btn-sm btn-secondary">
//               +
//             </button>
//             <button onClick={rotateLeft} className="btn btn-sm btn-secondary">
//               ⟲
//             </button>
//             <button
//               onClick={rotateRight}
//               className="btn btn-sm btn-secondary"
//             >
//               ⟳
//             </button>
//           </div>

//           <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//             <span className="small text-muted">
//               {Math.round(scale * 100)}% &nbsp; {rotate}°
//             </span>
//             <button onClick={onClose} className="btn btn-sm btn-danger">
//               Close
//             </button>
//           </div>
//         </div>

//         <div
//           style={{
//             flex: 1,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background: "#111",
//             overflow: "auto",
//             padding: 12,
//           }}
//         >
//           {fileType === "image" ? (
//             <img
//               src={fileUrl}
//               alt="preview"
//               style={{
//                 ...transformedStyle,
//                 // ensure image doesn't exceed container
//                 maxWidth: "100%",
//                 maxHeight: "100%",
//               }}
//             />
//           ) : (
//             <div
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 overflow: "auto",
//               }}
//             >
//               {/* object/iframe transformed for scale & rotate */}
//               <div
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   overflow: "auto",
//                 }}
//               >
//                 <object
//                   data={fileUrl}
//                   type="application/pdf"
//                   aria-label="PDF Viewer"
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                     border: "none",
//                     ...transformedStyle,
//                   }}
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PdfImageViewer;
import React, { useEffect, useRef, useState } from "react";

const PdfImageViewer = ({ show, onClose, fileUrl, fileType }) => {
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=")
        setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)));
      if (e.key === "-")
        setScale((s) => Math.max(0.25, +(s - 0.25).toFixed(2)));
      if (e.key === "ArrowLeft") setRotate((r) => (r - 90) % 360);
      if (e.key === "ArrowRight") setRotate((r) => (r + 90) % 360);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, onClose]);

  useEffect(() => {
    if (!show) {
      setScale(1);
      setRotate(0);
      setTranslate({ x: 0, y: 0 });
    }
  }, [show]);

  if (!show) return null;

  const zoomIn = () => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.25, +(s - 0.25).toFixed(2)));
  const rotateLeft = () => setRotate((r) => (r - 90) % 360);
  const rotateRight = () => setRotate((r) => (r + 90) % 360);
  const reset = () => {
    setScale(1);
    setRotate(0);
    setTranslate({ x: 0, y: 0 });
  };

  const onMouseDown = (e) => {
    setIsPanning(true);
    panStart.current = {
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    };
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e) => {
    if (!isPanning) return;
    setTranslate({
      x: e.clientX - panStart.current.x,
      y: e.clientY - panStart.current.y,
    });
  };
  const onMouseUp = () => {
    setIsPanning(false);
    if (containerRef.current) containerRef.current.style.cursor = "grab";
  };

  const contentTransform = {
    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale}) rotate(${rotate}deg)`,
    transformOrigin: "center center",
    transition: isPanning ? "none" : "transform 120ms ease",
    willChange: "transform",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 10050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "70%",
          height: "92%",
          background: "#fff",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            background: "#f1f1f1",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={zoomOut} className="btn btn-sm btn-secondary">
              −
            </button>
            <button onClick={zoomIn} className="btn btn-sm btn-secondary">
              +
            </button>
            <button onClick={rotateLeft} className="btn btn-sm btn-secondary">
              ⟲
            </button>
            <button onClick={rotateRight} className="btn btn-sm btn-secondary">
              ⟳
            </button>
            <button onClick={reset} className="btn btn-sm btn-secondary">
              Reset
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="small text-muted">
              {Math.round(scale * 100)}% &nbsp; {rotate}°
            </span>
            <button onClick={onClose} className="btn btn-sm btn-danger">
              Close
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            flex: 1,
            background: "#111",
            overflow: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            position: "relative",
            padding: 12,
          }}
        >
          {fileType === "image" ? (
            <img
              src={fileUrl}
              alt="preview"
              style={{
                ...contentTransform,
                maxWidth: "100%",
                maxHeight: "100%",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                background: "#fff",
              }}
              draggable={false}
            />
          ) : (
            // PDF: iframe inside a wrapper - transform applied to wrapper for better effect
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "auto",
                background: "#111",
                padding: 12,
              }}
            >
              <div
                style={{
                  width: "60%",
                  aspectRatio: "1 / 1.414", // A4 ratio
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  ...contentTransform,
                  background: "#fff",
                }}
              >
                <iframe
                  src={fileUrl}
                  title="PDF Viewer"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfImageViewer;

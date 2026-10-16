// "use client"

// // src/components/PdfPreview.js
// import { Document, Page, pdfjs } from "react-pdf";
// import { useState } from "react";

// // PDF.js worker config
// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// const PdfPreview = ({ fileUrl, width = 380 }) => {
//   const [numPages, setNumPages] = useState(null);

//   return (
//     <div
//       style={{
//         width: "100%",
//         height: "100%",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         background: "#f8f9fa",
//       }}
//     >
//       <Document
//         file={fileUrl}
//         onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//         loading={<p>Loading PDF...</p>}
//       >
//         <Page
//           pageNumber={1} // 👈 sirf first page preview
//           width={width}  // div ke size ke hisaab se adjust
//         />
//       </Document>
//     </div>
//   );
// };

// export default PdfPreview;


"use client"
import React, { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfToImage = ({ fileUrl, width = 380, style = {}, className = "" }) => {
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);
    setImgSrc(null);

    if (!fileUrl) {
      setErr("No file URL");
      setLoading(false);
      return;
    }

    const renderPdf = async () => {
      try {
        // fetch PDF as arrayBuffer (CORS must allow this origin)
        const res = await fetch(fileUrl, { mode: "cors" });
        if (!res.ok) throw new Error(`Failed to fetch PDF (${res.status})`);
        const arrayBuffer = await res.arrayBuffer();

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        // scale to requested width
        const viewport = page.getViewport({ scale: 1 });
        const scale = width / viewport.width || 1;
        const viewportScaled = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewportScaled.width);
        canvas.height = Math.round(viewportScaled.height);
        const ctx = canvas.getContext("2d");

        await page.render({ canvasContext: ctx, viewport: viewportScaled }).promise;

        if (!cancelled) {
          const dataUrl = canvas.toDataURL("image/png");
          setImgSrc(dataUrl);
        }
      } catch (e) {
        console.error("PdfToImage error:", e);
        if (!cancelled) setErr(e.message || "Unable to render PDF. Check CORS or network.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
    };
  }, [fileUrl, width]);

  if (loading)
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading preview...
      </div>
    );
  if (err)
    return (
      <div className="text-center small px-2" style={{ color: "#d9534f" }}>
        Preview error: {err}. Check browser console for CORS/mixed-content.
      </div>
    );

  return (
    <img
      src={imgSrc}
      alt="PDF preview"
      width={width}
      style={{ height: "100%", objectFit: "contain", display: "block", ...style }}
      className={className}
      draggable={false}
    />
  );
};

export default PdfToImage;
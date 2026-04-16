import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

export const usePdfExport = ({
  isProcessing,
  generatedChalan,
  printRef,
  layoutMode,
  onProcessingChange,
}) => {
  const handleDownload = async () => {
    if (isProcessing) return;
    if (!generatedChalan || !printRef.current) {
      toast.error("Generate chalan before downloading PDF");
      return;
    }

    onProcessingChange(true, "Preparing PDF...");
    const toastId = toast.loading("Preparing PDF...");

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready.catch(() => {});
      }
      window.scrollTo(0, 0);

      // Rasterizes *screen* styles (not @media print). Layout must be html2canvas-friendly (see chalan-*-dynamic.css).
      const canvas = await html2canvas(printRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const orientation = layoutMode === "landscape" ? "p" : "l";
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width;
      const imgH = canvas.height;
      const pageRatio = pageWidth / pageHeight;
      const imgRatio = imgW / imgH;

      let drawW;
      let drawH;
      let offsetX;
      let offsetY;

      if (imgRatio > pageRatio) {
        drawW = pageWidth;
        drawH = pageWidth / imgRatio;
        offsetX = 0;
        offsetY = (pageHeight - drawH) / 2;
      } else {
        drawH = pageHeight;
        drawW = pageHeight * imgRatio;
        offsetX = (pageWidth - drawW) / 2;
        offsetY = 0;
      }

      pdf.addImage(imgData, "PNG", offsetX, offsetY, drawW, drawH);
      pdf.save(`${generatedChalan.challanMeta.chalanId}.pdf`);
      toast.success("PDF downloaded successfully", { id: toastId });
    } catch {
      toast.error("Unable to download PDF", { id: toastId });
    } finally {
      onProcessingChange(false);
    }
  };

  return { handleDownload };
};

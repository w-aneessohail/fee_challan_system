import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import ChalanCard from "../components/ChalanCard";
import Loader from "../components/Loader";
import { institute } from "../data/institute";
import { students } from "../data/students";

function Chalan() {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? "");
  const [layoutMode, setLayoutMode] = useState("portrait");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("Processing...");
  const [generatedChalan, setGeneratedChalan] = useState(null);
  const printRef = useRef(null);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [selectedStudentId],
  );

  const createChalanMeta = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const issueDay = now.getDate();
    /** Due on the 15th of the issue month, but never before the issue date. */
    const due = new Date(y, m, issueDay <= 15 ? 15 : issueDay);
    const fmt = (d) => d.toLocaleDateString();
    return {
      chalanId: `CH-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
      generatedAt: fmt(now),
      dueDate: fmt(due),
    };
  };

  const updateProcessingState = (active, label = "Processing...") => {
    setIsProcessing(active);
    setProcessingLabel(label);
  };

  const handleGenerateChalan = async () => {
    if (isProcessing) return;
    if (!selectedStudent) {
      toast.error("Please select a student first");
      return;
    }

    updateProcessingState(true, "Generating chalan...");
    const toastId = toast.loading("Generating chalan...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setGeneratedChalan({
        student: selectedStudent,
        ...createChalanMeta(),
      });
      toast.success("Chalan generated successfully", { id: toastId });
    } catch {
      toast.error("Failed to generate chalan", { id: toastId });
    } finally {
      updateProcessingState(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (isProcessing) return;
    if (!generatedChalan || !printRef.current) {
      toast.error("Generate chalan before downloading PDF");
      return;
    }

    updateProcessingState(true, "Preparing PDF...");
    const toastId = toast.loading("Preparing PDF...");

    try {
      if (document.fonts?.ready) {
        await document.fonts.ready.catch(() => {});
      }
      window.scrollTo(0, 0);

      /* Default canvas renderer only: foreignObjectRendering often yields a blank canvas
         (SVG/CORS/security), especially with images and dev-server origins. */
      const canvas = await html2canvas(printRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL("image/png");
      const orientation = "l";
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
      pdf.save(`${generatedChalan.chalanId}.pdf`);
      toast.success("PDF downloaded successfully", { id: toastId });
    } catch {
      toast.error("Unable to download PDF", { id: toastId });
    } finally {
      updateProcessingState(false);
    }
  };

  const handlePrint = () => {
    if (!generatedChalan) {
      toast.error("Generate chalan before printing");
      return;
    }

    const dynamicPrintStyle = document.createElement("style");
    dynamicPrintStyle.id = "dynamic-print-orientation";
    const printOrientation = "landscape";
    dynamicPrintStyle.innerHTML = `@page { size: A4 ${printOrientation}; margin: 0; }`;
    document.head.appendChild(dynamicPrintStyle);

    const cleanupPrintStyle = () => {
      const existingStyle = document.getElementById("dynamic-print-orientation");
      if (existingStyle) existingStyle.remove();
      window.removeEventListener("afterprint", cleanupPrintStyle);
    };
    window.addEventListener("afterprint", cleanupPrintStyle);

    toast.success("Opening print dialog...");
    window.print();
  };

  const totalAmount = selectedStudent
    ? selectedStudent.feeDetails.reduce((sum, item) => sum + item.amount, 0)
    : 0;

  return (
    <section className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-6">
      <div className="no-print bg-white rounded-lg shadow-sm border border-gray-200 p-5 md:p-6 space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Fee Chalan Generator
        </h1>
        <p className="text-gray-600">
          Select a student, review fee details, and generate a three-copy bank
          chalan.
        </p>

        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-end">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Select Student
            </span>
            <select
              value={selectedStudentId}
              onChange={(event) => {
                setSelectedStudentId(event.target.value);
                setGeneratedChalan(null);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.rollNumber})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Layout
            </span>
            <select
              value={layoutMode}
              onChange={(event) => setLayoutMode(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>

          <button
            type="button"
            onClick={handleGenerateChalan}
            disabled={isProcessing}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            Generate Chalan
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isProcessing || !generatedChalan}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            Download PDF
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={isProcessing || !generatedChalan}
            className="inline-flex items-center justify-center rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Print
          </button>
        </div>

        {selectedStudent && (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Student:</span> {selectedStudent.name}
            </p>
            <p>
              <span className="font-semibold">Degree:</span> {selectedStudent.degree}
            </p>
            <p>
              <span className="font-semibold">Period:</span> {selectedStudent.period}
            </p>
            <p>
              <span className="font-semibold">Estimated Total:</span>{" "}
              PKR {totalAmount.toLocaleString()}
            </p>
          </div>
        )}

        {isProcessing && <Loader label={processingLabel} />}
      </div>

      {generatedChalan && (
        <div
          ref={printRef}
          className={`print-area a4-sheet ${layoutMode === "portrait" ? "sheet-landscape" : "sheet-landscape-reference"} mx-auto bg-white rounded-lg shadow-sm border border-gray-300 p-4 md:p-5`}
        >
          {layoutMode === "portrait" ? (
            ["Bank Copy", "Student Copy", "Accounts Copy"].map((copyLabel) => (
              <ChalanCard
                key={copyLabel}
                student={generatedChalan.student}
                chalanId={generatedChalan.chalanId}
                generatedAt={generatedChalan.generatedAt}
                dueDate={generatedChalan.dueDate}
                copyLabel={copyLabel}
              />
            ))
          ) : (
            ["Bank Copy", "Student Copy", "Accounts Copy"].map((copyLabel) => (
              <ChalanCard
                key={copyLabel}
                student={generatedChalan.student}
                chalanId={generatedChalan.chalanId}
                generatedAt={generatedChalan.generatedAt}
                dueDate={generatedChalan.dueDate}
                copyLabel={copyLabel}
                compact
              />
            ))
          )}
          {layoutMode === "portrait" && (
            <div className="layout-note flex flex-col items-center justify-center gap-1 border border-gray-300 rounded-md p-3 text-center text-sm text-gray-700 font-medium">
              <p>
                Note: If you face difficulty while paying the fee, use this same
                chalan online or through bank deposit.
              </p>
              <p>
                Keep your paid slip/copy for record and verification. For support,
                contact Accounts Office.
              </p>
              <p>
                PTCL: {institute.supportPhonePtcl} &nbsp;|&nbsp; Jazz:{" "}
                {institute.supportPhoneJazz}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Chalan;

import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import ChalanCard from "../components/ChalanCard";
import Loader from "../components/Loader";
import { students } from "../data/students";

function Chalan() {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? "");
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
    return {
      chalanId: `CH-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`,
      generatedAt: now.toLocaleDateString(),
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
      const canvas = await html2canvas(printRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const orientation = canvas.width > canvas.height ? "l" : "p";
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");
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

        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
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
          className="print-area a4-sheet max-w-[210mm] mx-auto bg-white rounded-lg shadow-sm border border-gray-300 p-4 md:p-5 space-y-3"
        >
          {["Bank Copy", "Student Copy", "Accounts Copy"].map((copyLabel) => (
            <ChalanCard
              key={copyLabel}
              student={generatedChalan.student}
              chalanId={generatedChalan.chalanId}
              generatedAt={generatedChalan.generatedAt}
              copyLabel={copyLabel}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Chalan;

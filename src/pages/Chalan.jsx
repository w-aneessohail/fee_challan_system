import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import ChalanCardDynamic from "../components/ChalanCardDynamic";
import ChalanCardLandscapeDynamic from "../components/ChalanCardLandscapeDynamic";
import Loader from "../components/Loader";
import { institute } from "../data/institute";
import { students } from "../data/students";

const fieldOptions = [
  { key: "name", label: "Name" },
  { key: "fatherName", label: "Father Name" },
  { key: "semester", label: "Semester" },
  { key: "department", label: "Department" },
  { key: "cnic", label: "CNIC" },
  { key: "contact", label: "Contact" },
];
const hiddenStudentKeys = new Set(["id", "rollNumber", "degree", "period", "feeDetails"]);
const exemptionOptions = [
  { key: "scholarship", label: "Scholarship" },
  { key: "financialAid", label: "Financial Aid" },
  { key: "feeWaiver", label: "Fee Waiver" },
];

function Chalan() {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? "");
  const [layoutMode, setLayoutMode] = useState("portrait");
  const [selectedFields, setSelectedFields] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [customFieldLabel, setCustomFieldLabel] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");
  const [selectedExemptions, setSelectedExemptions] = useState([]);
  const [customExemptions, setCustomExemptions] = useState([]);
  const [customExemptionLabel, setCustomExemptionLabel] = useState("");
  const [customExemptionAmount, setCustomExemptionAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("Processing...");
  const [generatedChalan, setGeneratedChalan] = useState(null);
  const printRef = useRef(null);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [selectedStudentId],
  );
  const availableFields = useMemo(() => {
    if (!selectedStudent) return [];
    const studentKeys = new Set(Object.keys(selectedStudent));
    return fieldOptions.filter(({ key }) => studentKeys.has(key) && !hiddenStudentKeys.has(key));
  }, [selectedStudent]);
  const disabledExemptions = useMemo(() => {
    if (!selectedStudent) return new Set();
    const disabled = new Set();
    if (!(Number(selectedStudent.scholarship) > 0)) disabled.add("scholarship");
    if (!(Number(selectedStudent.financialAid) > 0)) disabled.add("financialAid");
    return disabled;
  }, [selectedStudent]);

  useEffect(() => {
    setSelectedFields(availableFields.map((item) => item.key));
  }, [availableFields]);

  useEffect(() => {
    if (!selectedStudent) {
      setSelectedExemptions([]);
      setCustomExemptions([]);
      setCustomExemptionLabel("");
      setCustomExemptionAmount("");
      return;
    }
    const defaults = [];
    if (Number(selectedStudent.scholarship) > 0) defaults.push("scholarship");
    if (Number(selectedStudent.financialAid) > 0) defaults.push("financialAid");
    setSelectedExemptions(defaults);
    setCustomExemptions([]);
    setCustomExemptionLabel("");
    setCustomExemptionAmount("");
  }, [selectedStudentId, selectedStudent]);

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

  const handleSelectedFieldToggle = (fieldKey) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey) ? prev.filter((key) => key !== fieldKey) : [...prev, fieldKey],
    );
  };

  const handleAddCustomField = () => {
    const label = customFieldLabel.trim();
    const value = customFieldValue.trim();
    if (!label || !value) {
      toast.error("Please provide both custom field label and value");
      return;
    }

    setCustomFields((prev) => [...prev, { label, value }]);
    setCustomFieldLabel("");
    setCustomFieldValue("");
  };

  const handleRemoveCustomField = (indexToRemove) => {
    setCustomFields((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleExemptionToggle = (key) => {
    setSelectedExemptions((prev) => {
      const next = prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key];
      if (key === "feeWaiver" && next.includes("feeWaiver")) {
        setCustomExemptionLabel("Fee Waiver");
      }
      if (key === "feeWaiver" && !next.includes("feeWaiver") && customExemptionLabel === "Fee Waiver") {
        setCustomExemptionLabel("");
      }
      return next;
    });
  };

  const handleAddCustomExemption = () => {
    const label = selectedExemptions.includes("feeWaiver") ? "Fee Waiver" : customExemptionLabel.trim();
    const amount = Number(customExemptionAmount);
    if (!label || !Number.isFinite(amount) || amount <= 0) {
      toast.error("Please provide a valid exemption label and amount");
      return;
    }

    setCustomExemptions((prev) => {
      if (label === "Fee Waiver") {
        const withoutWaiver = prev.filter((item) => item.label !== "Fee Waiver");
        return [...withoutWaiver, { label, amount }];
      }
      return [...prev, { label, amount }];
    });
    if (!selectedExemptions.includes("feeWaiver")) setCustomExemptionLabel("");
    setCustomExemptionAmount("");
  };

  const handleRemoveCustomExemption = (indexToRemove) => {
    setCustomExemptions((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const calculateFeeAdjustments = (student) => {
    if (!student) return { baseFee: 0, exemptionsBreakdown: [], totalFee: 0 };

    const baseFee = Number(student.fee) || student.feeDetails.reduce((sum, item) => sum + item.amount, 0);
    const breakdown = [];
    let discount = 0;

    if (selectedExemptions.includes("scholarship") && Number(student.scholarship) > 0) {
      const amount = (Number(student.scholarship) / 100) * baseFee;
      discount += amount;
      breakdown.push({
        key: "scholarship",
        label: `Scholarship (${student.scholarship}%)`,
        amount,
      });
    }

    if (selectedExemptions.includes("financialAid") && Number(student.financialAid) > 0) {
      const amount = (Number(student.financialAid) / 100) * baseFee;
      discount += amount;
      breakdown.push({
        key: "financialAid",
        label: `Financial Aid (${student.financialAid}%)`,
        amount,
      });
    }

    customExemptions.forEach((item, index) => {
      if (!item?.label || !Number.isFinite(Number(item.amount)) || Number(item.amount) <= 0) return;
      const amount = Number(item.amount);
      discount += amount;
      breakdown.push({
        key: `customExemption-${index}`,
        label: item.label,
        amount,
      });
    });

    return {
      baseFee,
      exemptionsBreakdown: breakdown,
      totalFee: Math.max(baseFee - discount, 0),
    };
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
      /** Stacked landscape copies are portrait-shaped; 3-up portrait uses landscape page. */
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
    const printOrientation = layoutMode === "landscape" ? "portrait" : "landscape";
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

  const feePreview = useMemo(
    () => calculateFeeAdjustments(selectedStudent),
    [selectedStudent, selectedExemptions, customExemptions],
  );
  const copyOrder = ["Bank Copy", "Accounts Copy", "Student Copy"];

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

        <div className="rounded-md border border-gray-200 bg-white p-4 space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Field Selection</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableFields.map((field) => (
                <label key={field.key} className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.key)}
                    onChange={() => handleSelectedFieldToggle(field.key)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {field.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Field Input</h3>
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                placeholder="Field Label"
                value={customFieldLabel}
                onChange={(event) => setCustomFieldLabel(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                type="text"
                placeholder="Field Value"
                value={customFieldValue}
                onChange={(event) => setCustomFieldValue(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={handleAddCustomField}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                + Add Field
              </button>
            </div>

            {customFields.length > 0 && (
              <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                {customFields.map((field, index) => (
                  <div key={`${field.label}-${index}`} className="flex items-center justify-between gap-2 py-1">
                    <span>
                      <strong>{field.label}:</strong> {field.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(index)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Exemptions Selection</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {exemptionOptions.map((item) => (
                <label key={item.key} className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedExemptions.includes(item.key)}
                    disabled={disabledExemptions.has(item.key)}
                    onChange={() => handleExemptionToggle(item.key)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {item.label}
                </label>
              ))}
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input
                type="text"
                placeholder="Custom Exemption Name"
                value={customExemptionLabel}
                onChange={(event) => setCustomExemptionLabel(event.target.value)}
                disabled={selectedExemptions.includes("feeWaiver")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                type="number"
                min="0"
                placeholder="Amount"
                value={customExemptionAmount}
                onChange={(event) => setCustomExemptionAmount(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={handleAddCustomExemption}
                className="inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
              >
                + Add Exemption
              </button>
            </div>
            {customExemptions.length > 0 && (
              <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                {customExemptions.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-2 py-1">
                    <span>
                      <strong>{item.label}:</strong> {Number(item.amount).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomExemption(index)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
              PKR {feePreview.totalFee.toLocaleString()}
            </p>
          </div>
        )}

        {isProcessing && <Loader label={processingLabel} />}
      </div>

      {generatedChalan && (
        <div
          ref={printRef}
          className={`print-area a4-sheet ${layoutMode === "portrait" ? "sheet-landscape" : "sheet-ls-stacked"} mx-auto bg-white rounded-lg shadow-sm border border-gray-300 p-4 md:p-5`}
        >
          {layoutMode === "portrait" ? (
            copyOrder.map((copyLabel) => {
              const feeDetails = calculateFeeAdjustments(generatedChalan.student);
              return (
                <ChalanCardDynamic
                  key={`dynamic-${copyLabel}`}
                  student={generatedChalan.student}
                  chalanId={generatedChalan.chalanId}
                  generatedAt={generatedChalan.generatedAt}
                  dueDate={generatedChalan.dueDate}
                  copyLabel={copyLabel}
                  selectedFields={selectedFields}
                  customFields={customFields}
                  exemptionsBreakdown={feeDetails.exemptionsBreakdown}
                  totalFee={feeDetails.totalFee}
                  baseFee={feeDetails.baseFee}
                />
              );
            })
          ) : (
            copyOrder.map((copyLabel) => {
              const feeDetails = calculateFeeAdjustments(generatedChalan.student);
              return (
                <ChalanCardLandscapeDynamic
                  key={`dynamic-ls-${copyLabel}`}
                  student={generatedChalan.student}
                  chalanId={generatedChalan.chalanId}
                  generatedAt={generatedChalan.generatedAt}
                  dueDate={generatedChalan.dueDate}
                  copyLabel={copyLabel}
                  selectedFields={selectedFields}
                  customFields={customFields}
                  exemptionsBreakdown={feeDetails.exemptionsBreakdown}
                  totalFee={feeDetails.totalFee}
                  baseFee={feeDetails.baseFee}
                />
              );
            })
          )}
          {(layoutMode === "portrait" || layoutMode === "landscape") && (
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

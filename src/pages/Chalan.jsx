import { useRef } from "react";
import ChalanCardDynamic from "../components/ChalanCardDynamic";
import ChalanCardLandscapeDynamic from "../components/ChalanCardLandscapeDynamic";
import Loader from "../components/Loader";
import { institute } from "../data/institute";
import { useChallan } from "../hooks/useChallan";
import { usePdfExport } from "../hooks/usePdfExport";
import { usePrintChallan } from "../hooks/usePrintChallan";

function Chalan() {
  const printRef = useRef(null);
  const challan = useChallan();
  const { handleDownload } = usePdfExport({
    isProcessing: challan.isProcessing,
    generatedChalan: challan.generatedChalan,
    printRef,
    layoutMode: challan.layoutMode,
    onProcessingChange: challan.updateProcessingState,
  });
  const { handlePrint } = usePrintChallan({
    generatedChalan: challan.generatedChalan,
    layoutMode: challan.layoutMode,
  });
  const copyOrder = ["Bank Copy", "Accounts Copy", "Student Copy"];
  const handleCustomFieldEnter = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    challan.handleAddCustomField();
  };
  const handleCustomExemptionEnter = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    challan.handleAddCustomExemption();
  };

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
              value={challan.selectedStudentId}
              onChange={(event) => challan.handleStudentChange(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {challan.students.map((student) => (
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
              value={challan.layoutMode}
              onChange={(event) => challan.setLayoutMode(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>

          <button
            type="button"
            onClick={challan.handleGenerateChalan}
            disabled={challan.isProcessing}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            Generate Chalan
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={challan.isProcessing || !challan.generatedChalan}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            Download PDF
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={challan.isProcessing || !challan.generatedChalan}
            className="inline-flex items-center justify-center rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            Print
          </button>
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-4 space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Field Selection</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {challan.availableFields.map((field) => (
                <label key={field.key} className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={challan.selectedFields.includes(field.key)}
                    onChange={() => challan.handleSelectedFieldToggle(field.key)}
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
                value={challan.customFieldLabel}
                onChange={(event) => challan.setCustomFieldLabel(event.target.value)}
                onKeyDown={handleCustomFieldEnter}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                type="text"
                placeholder="Field Value"
                value={challan.customFieldValue}
                onChange={(event) => challan.setCustomFieldValue(event.target.value)}
                onKeyDown={handleCustomFieldEnter}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={challan.handleAddCustomField}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                + Add Field
              </button>
            </div>

            {challan.customFields.length > 0 && (
              <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                {challan.customFields.map((field, index) => (
                  <div key={`${field.label}-${index}`} className="flex items-center justify-between gap-2 py-1">
                    <span>
                      <strong>{field.label}:</strong> {field.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => challan.handleRemoveCustomField(index)}
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
              {challan.exemptionOptions.map((item) => (
                <label key={item.key} className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={challan.selectedExemptions.includes(item.key)}
                    disabled={challan.disabledExemptions.has(item.key)}
                    onChange={() => challan.handleExemptionToggle(item.key)}
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
                value={challan.customExemptionLabel}
                onChange={(event) => challan.setCustomExemptionLabel(event.target.value)}
                disabled={challan.selectedExemptions.includes("feeWaiver")}
                onKeyDown={handleCustomExemptionEnter}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                type="number"
                min="0"
                placeholder="Amount"
                value={challan.customExemptionAmount}
                onChange={(event) => challan.setCustomExemptionAmount(event.target.value)}
                onKeyDown={handleCustomExemptionEnter}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={challan.handleAddCustomExemption}
                className="inline-flex items-center justify-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
              >
                + Add Exemption
              </button>
            </div>
            {challan.customExemptions.length > 0 && (
              <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                {challan.customExemptions.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-2 py-1">
                    <span>
                      <strong>{item.label}:</strong> {Number(item.amount).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => challan.handleRemoveCustomExemption(index)}
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

        {challan.selectedStudent && (
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Student:</span> {challan.selectedStudent.name}
            </p>
            <p>
              <span className="font-semibold">Degree:</span> {challan.selectedStudent.degree}
            </p>
            <p>
              <span className="font-semibold">Period:</span> {challan.selectedStudent.period}
            </p>
            <p>
              <span className="font-semibold">Estimated Total:</span>{" "}
              PKR {challan.feePreview.totalFee.toLocaleString()}
            </p>
          </div>
        )}

        {challan.isProcessing && <Loader label={challan.processingLabel} />}
      </div>

      {challan.generatedChalan && (
        <div
          ref={printRef}
          className={`print-area a4-sheet ${challan.layoutMode === "portrait" ? "sheet-landscape" : "sheet-ls-stacked"} mx-auto bg-white rounded-lg shadow-sm border border-gray-300 p-4 md:p-5`}
        >
          {challan.layoutMode === "portrait" ? (
            copyOrder.map((copyLabel) => {
              const feeDetails = challan.calculateFeeAdjustments(challan.generatedChalan.student);
              return (
                <ChalanCardDynamic
                  key={`dynamic-${copyLabel}`}
                  student={challan.generatedChalan.student}
                  challanMeta={challan.generatedChalan.challanMeta}
                  copyLabel={copyLabel}
                  selectedFields={challan.selectedFields}
                  customFields={challan.customFields}
                  exemptionsBreakdown={feeDetails.exemptionsBreakdown}
                  totalFee={feeDetails.totalFee}
                  baseFee={feeDetails.baseFee}
                />
              );
            })
          ) : (
            copyOrder.map((copyLabel) => {
              const feeDetails = challan.calculateFeeAdjustments(challan.generatedChalan.student);
              return (
                <ChalanCardLandscapeDynamic
                  key={`dynamic-ls-${copyLabel}`}
                  student={challan.generatedChalan.student}
                  challanMeta={challan.generatedChalan.challanMeta}
                  copyLabel={copyLabel}
                  selectedFields={challan.selectedFields}
                  customFields={challan.customFields}
                  exemptionsBreakdown={feeDetails.exemptionsBreakdown}
                  totalFee={feeDetails.totalFee}
                  baseFee={feeDetails.baseFee}
                />
              );
            })
          )}
          {(challan.layoutMode === "portrait" || challan.layoutMode === "landscape") && (
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

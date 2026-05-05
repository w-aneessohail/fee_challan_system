import { QRCodeCanvas } from "qrcode.react";
import Barcode from "react-barcode";
import { Link } from "react-router-dom";
import mainLogo from "../assets/mainLogo.png";
import { institute } from "../data/institute";
import "../styles/chalan-dynamic.css";

const fieldLabels = {
  name: "Name",
  fatherName: "Father Name",
  period: "Period",
  department: "Department",
  cnic: "CNIC",
  contact: "Contact",
};

const PORTRAIT_STUDENT_COMPACT_THRESHOLD = 18;
const STUDENT_FIELD_LONG_VALUE = 34;

function countVisiblePortraitStudentRows(selectedFields, customFieldsLength, student) {
  let n = 2;
  for (const field of selectedFields) {
    if (field === "period") {
      const v = student.period?.value;
      if (v != null && v !== "") n++;
      continue;
    }
    if (student[field]) n++;
  }
  return n + customFieldsLength;
}

function portraitFieldSpansFullColumn(value, isBankAccountRow) {
  if (isBankAccountRow) return true;
  const s = String(value ?? "").trim();
  if (s.length <= STUDENT_FIELD_LONG_VALUE) return false;
  if (/\s/.test(s)) return s.length > STUDENT_FIELD_LONG_VALUE + 8;
  return s.length > 26;
}

function fieldRowClassName(compact, fullWidth) {
  const base = "chalan-dynamic-field-row";
  if (!compact) return base;
  return `${base}${fullWidth ? " chalan-dynamic-field-row--full" : ""}`;
}

function ChalanCardDynamic({
  student,
  challanMeta,
  copyLabel,
  selectedFields = [],
  customFields = [],
  additionalFeesBreakdown = [],
  exemptionsBreakdown = [],
  totalFee,
  baseFee,
}) {
  const fallbackFee = student.feeDetails.reduce((sum, item) => sum + item.amount, 0);
  const resolvedBaseFee = Number(baseFee) || Number(student.fee) || fallbackFee;
  const finalTotal = typeof totalFee === "number" ? totalFee : resolvedBaseFee;
  const chalanId = challanMeta?.chalanId != null ? String(challanMeta.chalanId) : "";
  const qrValue = JSON.stringify({
    chalanId,
    studentId: student.id,
    rollNumber: student.rollNumber,
    totalAmount: finalTotal,
    instituteName: institute.instituteDisplayName,
  });

  const studentRowsVisible = countVisiblePortraitStudentRows(
    selectedFields,
    customFields.length,
    student
  );
  const feeBlockLines =
    student.feeDetails.length +
    additionalFeesBreakdown.length +
    exemptionsBreakdown.length +
    2;
  const portraitContentDensity = studentRowsVisible + feeBlockLines;
  const compactStudentFields = portraitContentDensity >= PORTRAIT_STUDENT_COMPACT_THRESHOLD;

  return (
    <article className="chalan-card chalan-card-dynamic flex h-full flex-col rounded-md border border-gray-400 bg-white p-3">
      <header className="border-b border-gray-300 pb-2">
        <div className="flex items-center justify-between gap-3">
          <img
            src={mainLogo}
            alt="Institute Logo"
            className="h-14 w-auto max-w-[6rem] object-contain [image-rendering:auto]"
          />
          <div className="text-right text-[10px] text-gray-700">
            <p>Chalan ID: {challanMeta?.chalanId}</p>
            <p>Issuance Date: {challanMeta?.generatedAt}</p>
            <p>Due Date: {challanMeta?.dueDate}</p>
          </div>
        </div>
        <div className="chalan-dynamic-stripe mt-2">{institute.bankDisplayName}</div>
      </header>

      <section
        className={
          compactStudentFields
            ? "chalan-dynamic-student-fields mt-3 text-[10px] text-gray-800 chalan-dynamic-student-fields--compact"
            : "mt-3 text-[10px] text-gray-800"
        }
      >
        <p className={fieldRowClassName(compactStudentFields, true)}>
          <span className="font-semibold">Bank Account:</span> {institute.bankAccountNumber}
        </p>
        <p
          className={fieldRowClassName(
            compactStudentFields,
            portraitFieldSpansFullColumn(student.rollNumber, false)
          )}
        >
          <span className="font-semibold">Roll No:</span> {student.rollNumber}
        </p>
        {selectedFields.map((field) => {
          if (field === "period") {
            const value = student.period?.value;
            if (value == null || value === "") return null;
            return (
              <p key={field} className={fieldRowClassName(compactStudentFields, portraitFieldSpansFullColumn(value, false))}>
                <span className="font-semibold">{fieldLabels[field] ?? field}:</span> {value}
              </p>
            );
          }
          if (!student[field]) return null;
          return (
            <p key={field} className={fieldRowClassName(compactStudentFields, portraitFieldSpansFullColumn(student[field], false))}>
              <span className="font-semibold">{fieldLabels[field] ?? field}:</span> {student[field]}
            </p>
          );
        })}
        {customFields.map((field, index) => (
          <p
            key={`${field.label}-${index}`}
            className={fieldRowClassName(compactStudentFields, portraitFieldSpansFullColumn(field.value, false))}
          >
            <span className="font-semibold">{field.label}:</span> {field.value}
          </p>
        ))}
      </section>

      <section className="mt-3 border border-gray-300 p-2 text-[10px] text-gray-800">
        <h3 className="mb-1 font-semibold">Fee Details</h3>
        {student.feeDetails.map((item) => (
          <div key={item.description} className="chalan-dynamic-fee-row">
            <span className="min-w-0 pr-2 text-left">{item.description}</span>
            <span className="shrink-0 text-right tabular-nums">{item.amount.toLocaleString()}</span>
          </div>
        ))}
        {additionalFeesBreakdown.map((item) => (
          <div key={item.key} className="chalan-dynamic-fee-row text-blue-700">
            <span className="min-w-0 pr-2 text-left">{item.label}</span>
            <span className="shrink-0 text-right tabular-nums">
              {Math.round(item.amount).toLocaleString()}
            </span>
          </div>
        ))}
        {exemptionsBreakdown.map((item) => (
          <div key={item.key} className="chalan-dynamic-fee-row text-green-700">
            <span className="min-w-0 pr-2 text-left">{item.label}</span>
            <span className="shrink-0 text-right tabular-nums">
              {`-${Math.round(item.amount).toLocaleString()}`}
            </span>
          </div>
        ))}
        <div className="chalan-dynamic-fee-separator" aria-hidden="true" />
        <div className="chalan-dynamic-fee-row pt-0.5 font-semibold">
          <span className="min-w-0 pr-2 text-left">Total</span>
          <span className="shrink-0 text-right tabular-nums">{Math.round(finalTotal).toLocaleString()}</span>
        </div>
      </section>

      <div className="chalan-dynamic-stripe mt-2">{copyLabel}</div>

      <footer className="mt-auto pt-2">
        <div className="flex justify-between items-end gap-4 mt-4 pb-2">
          <div className="flex flex-col justify-end gap-1 shrink-0">
            <QRCodeCanvas value={qrValue} size={78} fgColor="#111111" bgColor="#ffffff" includeMargin={false} />
            <span className="text-[7px] font-semibold text-gray-800 leading-none">Scan to Pay</span>
          </div>
          <div className="flex flex-col items-end min-w-0 gap-1">
            <span className="chalan-dynamic-barcode-label text-xs font-bold text-gray-700 text-right whitespace-nowrap">
              Bank authorized signature / stamp
            </span>
            {chalanId ? (
              <div className="chalan-dynamic-barcode-slot shrink-0">
                <Link
                  to={`/verify/${encodeURIComponent(chalanId)}`}
                  className="cursor-pointer rounded leading-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                  title="Open admin verification"
                >
                  <Barcode
                    value={chalanId}
                    format="CODE128"
                    width={1}
                    height={30}
                    fontSize={9}
                    displayValue
                    margin={3}
                    background="#ffffff"
                    lineColor="#111111"
                  />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-center text-[9px] text-gray-500 leading-snug">
          Please pay before due date. This is a system-generated chalan.
        </p>
      </footer>
    </article>
  );
}

export default ChalanCardDynamic;

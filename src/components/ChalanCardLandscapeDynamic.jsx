import { QRCodeCanvas } from "qrcode.react";
import Barcode from "react-barcode";
import { Link } from "react-router-dom";
import mainLogo from "../assets/mainLogo.png";
import { institute } from "../data/institute";
import "../styles/chalan-landscape-dynamic.css";

const fieldLabels = {
  name: "Name",
  fatherName: "Father Name",
  period: "Period",
  department: "Department",
  cnic: "CNIC",
  contact: "Contact",
};

function ChalanCardLandscapeDynamic({
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

  const chargeLines = [
    ...student.feeDetails.map((item) => ({
      kind: "base",
      key: `base-${item.description}`,
      label: item.description,
      amount: item.amount,
    })),
    ...additionalFeesBreakdown.map((item) => ({
      kind: "additional",
      key: item.key,
      label: item.label,
      amount: item.amount,
    })),
  ];
  const chargeCount = chargeLines.length;
  const exemptionLineCount =
    exemptionsBreakdown.length > 0 ? exemptionsBreakdown.length : 1;
  const rightPaneFixedRows = exemptionLineCount + 1;
  let feeSplitIdx = 0;
  if (chargeCount > 0) {
    const leftTarget = Math.round((chargeCount + rightPaneFixedRows) / 2);
    feeSplitIdx = Math.min(chargeCount, Math.max(1, leftTarget));
  }
  const feeLeftColumn = chargeLines.slice(0, feeSplitIdx);
  const feeRightColumn = chargeLines.slice(feeSplitIdx);

  const feeChargeRows = (rows) =>
    rows.map((row) => (
      <div
        key={row.key}
        className={`chalan-ls-dynamic-fee-row${row.kind === "additional" ? " text-blue-700" : ""}`}
      >
        <span className="min-w-0 pr-2 text-left">{row.label}</span>
        <span className="shrink-0 text-right tabular-nums">
          {row.kind === "additional"
            ? Math.round(row.amount).toLocaleString()
            : row.amount.toLocaleString()}
        </span>
      </div>
    ));

  return (
    <article className="chalan-card-landscape chalan-card-landscape-dynamic flex h-full flex-col rounded-md border border-gray-400 bg-white p-2.5">
      <header className="border-b border-gray-300 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <img
              src={mainLogo}
              alt="Institute Logo"
              className="h-12 w-auto max-w-[5rem] object-contain [image-rendering:auto]"
            />
            <div className="text-[8px] text-gray-700">
              <p className="font-semibold text-gray-900">{institute.instituteDisplayName}</p>
              <p>Bank Fee Chalan</p>
            </div>
          </div>
          <div className="text-right text-[8px] text-gray-700">
            <p>Chalan ID: {challanMeta?.chalanId}</p>
            <p>Date: {challanMeta?.generatedAt}</p>
            <p>Due: {challanMeta?.dueDate}</p>
          </div>
        </div>
        <div className="chalan-ls-dynamic-stripe mt-2">{institute.bankDisplayName}</div>
      </header>

      <section className="mt-2 text-[8px] text-gray-800">
        <div className="chalan-ls-dynamic-fields-grid">
          <p className="chalan-ls-dynamic-field-row">
            <span className="font-semibold">Account No:</span> {institute.bankAccountNumber}
          </p>
          <p className="chalan-ls-dynamic-field-row">
            <span className="font-semibold">Roll No:</span> {student.rollNumber}
          </p>
          {selectedFields.map((field) => {
            if (field === "period") {
              const value = student.period?.value;
              if (value == null || value === "") return null;
              return (
                <p key={field} className="chalan-ls-dynamic-field-row">
                  <span className="font-semibold">{fieldLabels[field] ?? field}:</span> {value}
                </p>
              );
            }
            if (!student[field]) return null;
            return (
              <p key={field} className="chalan-ls-dynamic-field-row">
                <span className="font-semibold">{fieldLabels[field] ?? field}:</span> {student[field]}
              </p>
            );
          })}
          {customFields.map((field, index) => (
            <p key={`${field.label}-${index}`} className="chalan-ls-dynamic-field-row">
              <span className="font-semibold">{field.label}:</span> {field.value}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-2 border border-gray-300 p-2 text-[8px] text-gray-800">
        <h3 className="mb-1 font-semibold">Fee Details</h3>
        <div className="chalan-ls-dynamic-fee-split">
          <div className="chalan-ls-dynamic-fee-pane">{feeChargeRows(feeLeftColumn)}</div>
          <div className="chalan-ls-dynamic-fee-pane">
            {feeChargeRows(feeRightColumn)}
            {exemptionsBreakdown.length > 0 ? (
              exemptionsBreakdown.map((item) => (
                <div key={item.key} className="chalan-ls-dynamic-fee-row text-green-700">
                  <span className="min-w-0 pr-2 text-left">{item.label}</span>
                  <span className="shrink-0 text-right tabular-nums">
                    {`-${Math.round(item.amount).toLocaleString()}`}
                  </span>
                </div>
              ))
            ) : (
              <div className="chalan-ls-dynamic-fee-row text-gray-500">
                <span className="min-w-0 pr-2 text-left">No exemptions applied</span>
                <span className="shrink-0 text-right tabular-nums" aria-hidden />
              </div>
            )}
            <div className="chalan-ls-dynamic-fee-separator" aria-hidden="true" />
            <div className="chalan-ls-dynamic-fee-row pt-0.5 font-semibold">
              <span className="min-w-0 pr-2 text-left">Total</span>
              <span className="shrink-0 text-right tabular-nums">{Math.round(finalTotal).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="chalan-ls-dynamic-stripe mt-2 ">{copyLabel}</div>

      <footer className="mt-auto flex min-h-0 flex-1 flex-col justify-end pt-2 pb-0.5">
        <div className="chalan-ls-footer-band grid w-full shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-x-3 gap-y-1 pt-0">
          <div className="flex shrink-0 flex-col justify-end gap-1">
            <QRCodeCanvas value={qrValue} size={72} fgColor="#111111" bgColor="#ffffff" includeMargin={false} />
            <span className="text-[7px] font-semibold leading-none text-gray-800">Scan to Pay</span>
          </div>
          <div className="flex min-h-0 min-w-0 flex-col items-center justify-center gap-1 px-2 text-center">
            <p className="text-[8px] font-bold leading-tight text-gray-700">
              Bank authorized signature / stamp
            </p>
            <p className="text-[7px] leading-snug text-gray-500">
              Please pay before due date. This is a system-generated chalan.
            </p>
          </div>
          <div className="flex min-w-0 shrink-0 flex-col items-end justify-end">
            {chalanId ? (
              <div className="chalan-ls-barcode-slot max-w-full">
                <Link
                  to={`/verify/${encodeURIComponent(chalanId)}`}
                  className="block max-w-full cursor-pointer rounded leading-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                  title="Open admin verification"
                >
                  <Barcode
                    value={chalanId}
                    format="CODE128"
                    width={1.05}
                    height={32}
                    fontSize={10}
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
      </footer>
    </article>
  );
}

export default ChalanCardLandscapeDynamic;

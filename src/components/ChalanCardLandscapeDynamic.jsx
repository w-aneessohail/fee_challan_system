import { QRCodeCanvas } from "qrcode.react";
import mainLogo from "../assets/mainLogo.png";
import { institute } from "../data/institute";
import "../styles/chalan-landscape-dynamic.css";

const fieldLabels = {
  name: "Name",
  fatherName: "Father Name",
  semester: "Semester",
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
  exemptionsBreakdown = [],
  totalFee,
  baseFee,
}) {
  const fallbackFee = student.feeDetails.reduce((sum, item) => sum + item.amount, 0);
  const resolvedBaseFee = Number(baseFee) || Number(student.fee) || fallbackFee;
  const finalTotal = typeof totalFee === "number" ? totalFee : resolvedBaseFee;
  const qrValue = JSON.stringify({
    chalanId: challanMeta?.chalanId,
    studentId: student.id,
    rollNumber: student.rollNumber,
    totalAmount: finalTotal,
  });
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
        <div className="chalan-ls-dynamic-stripe mt-2 bg-black text-white">{institute.bankDisplayName}</div>
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
          <div className="chalan-ls-dynamic-fee-pane">
            {student.feeDetails.map((item) => (
              <div key={item.description} className="chalan-ls-dynamic-fee-row">
                <span>{item.description}</span>
                <span>{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="chalan-ls-dynamic-fee-pane">
            {exemptionsBreakdown.length > 0 ? (
              exemptionsBreakdown.map((item) => (
                <div key={item.key} className="chalan-ls-dynamic-fee-row text-emerald-700">
                  <span>{item.label}</span>
                  <span>-{Math.round(item.amount).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="chalan-ls-dynamic-fee-row text-gray-500">
                <span>No exemptions applied</span>
                <span>-</span>
              </div>
            )}
            <div className="chalan-ls-dynamic-fee-row border-t border-gray-300 pt-1 font-semibold">
              <span>Total</span>
              <span>{Math.round(finalTotal).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="chalan-ls-dynamic-stripe mt-2 bg-black text-white">{copyLabel}</div>

      <footer className="mt-auto pt-2">
        <div className="flex items-end justify-between gap-2">
          <p className="text-[7px] leading-snug text-gray-600">
            Please pay before due date.
            <br />
            This is a system-generated chalan.
          </p>
          <div className="text-[6.5px] font-bold leading-tight text-gray-700 text-center whitespace-nowrap">
            <p>Bank Officer Signature</p>
            <p>Authorized Stamp</p>
          </div>
          <div className="rounded border border-gray-300 bg-white p-0.5">
            <QRCodeCanvas value={qrValue} size={56} fgColor="#111111" bgColor="#ffffff" includeMargin={false} />
          </div>
        </div>
      </footer>
    </article>
  );
}

export default ChalanCardLandscapeDynamic;

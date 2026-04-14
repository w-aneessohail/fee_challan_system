import { QRCodeCanvas } from "qrcode.react";
import mainLogo from "../assets/mainLogo.png";
import { institute } from "../data/institute";
import "../styles/chalan-dynamic.css";

const fieldLabels = {
  name: "Name",
  fatherName: "Father Name",
  semester: "Semester",
  department: "Department",
  cnic: "CNIC",
  contact: "Contact",
};

function ChalanCardDynamic({
  student,
  chalanId,
  generatedAt,
  dueDate,
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
    chalanId,
    studentId: student.id,
    rollNumber: student.rollNumber,
    totalAmount: finalTotal,
  });

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
            <p>Chalan ID: {chalanId}</p>
            <p>Issuance Date: {generatedAt}</p>
            <p>Due Date: {dueDate}</p>
          </div>
        </div>
        <div className="chalan-dynamic-stripe mt-2 bg-black text-white">{institute.bankDisplayName}</div>
      </header>

      <section className="mt-3 text-[10px] text-gray-800">
        <p className="chalan-dynamic-field-row">
          <span className="font-semibold">Bank Account:</span> {institute.bankAccountNumber}
        </p>
        <p className="chalan-dynamic-field-row">
          <span className="font-semibold">Roll No:</span> {student.rollNumber}
        </p>
        {selectedFields.map((field) => {
          if (!student[field]) return null;
          return (
            <p key={field} className="chalan-dynamic-field-row">
              <span className="font-semibold">{fieldLabels[field] ?? field}:</span> {student[field]}
            </p>
          );
        })}
        {customFields.map((field, index) => (
          <p key={`${field.label}-${index}`} className="chalan-dynamic-field-row">
            <span className="font-semibold">{field.label}:</span> {field.value}
          </p>
        ))}
      </section>

      <section className="mt-3 border border-gray-300 p-2 text-[10px] text-gray-800">
        <h3 className="mb-1 font-semibold">Fee Details</h3>
        {student.feeDetails.map((item) => (
          <div key={item.description} className="chalan-dynamic-fee-row">
            <span>{item.description}</span>
            <span>{item.amount.toLocaleString()}</span>
          </div>
        ))}
        {exemptionsBreakdown.map((item) => (
          <div key={item.key} className="chalan-dynamic-fee-row text-emerald-700">
            <span>{item.label}</span>
            <span>-{Math.round(item.amount).toLocaleString()}</span>
          </div>
        ))}
        <div className="chalan-dynamic-fee-row border-t border-gray-300 pt-1 font-semibold">
          <span>Total</span>
          <span>{Math.round(finalTotal).toLocaleString()}</span>
        </div>
      </section>

      <div className="chalan-dynamic-stripe mt-2 bg-black text-white">{copyLabel}</div>

      <footer className="mt-auto pt-2">
        <div className="flex items-end justify-between gap-2">
          <div className="rounded border border-gray-300 bg-white p-1">
            <QRCodeCanvas value={qrValue} size={72} fgColor="#111111" bgColor="#ffffff" includeMargin={false} />
          </div>
          <span className="text-right text-[7px] font-bold text-gray-700">Bank authorized signature / stamp</span>
        </div>
        <p className="mt-1 text-center text-[9px] text-gray-500">
          Please pay before due date. This is a system-generated chalan.
        </p>
      </footer>
    </article>
  );
}

export default ChalanCardDynamic;

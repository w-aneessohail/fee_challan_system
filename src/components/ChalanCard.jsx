import { QRCodeSVG } from "qrcode.react";
import mainLogo from "../assets/mainLogo.png";
import { institute } from "../data/institute";

function ChalanCard({
  student,
  chalanId,
  generatedAt,
  dueDate,
  copyLabel,
  compact = false,
}) {
  const totalAmount = student.feeDetails.reduce((sum, item) => sum + item.amount, 0);
  const qrValue = JSON.stringify({
    chalanId,
    studentId: student.id,
    rollNumber: student.rollNumber,
    totalAmount,
  });

  return (
    <article className="chalan-card border border-gray-400 rounded-md bg-white p-3 md:p-4 flex flex-col h-full">
      <header className="border-b border-gray-300 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mx-auto w-fit flex max-w-full flex-col items-center text-center">
              <img
                src={mainLogo}
                alt="Institute Logo"
                className="h-20 w-auto max-w-[11rem] object-contain [image-rendering:auto]"
              />
            </div>
            <div className="chalan-stripe mt-2 overflow-hidden rounded bg-black">
              <span className="chalan-stripe-text">{institute.bankDisplayName}</span>
            </div>
          </div>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] leading-normal text-gray-700">
          <p className="leading-normal">Issuance Date: {generatedAt}</p>
          <p className="leading-normal">Due Date: {dueDate}</p>
        </div>
      </header>

      <div
        className={`mt-4 text-gray-700 leading-normal ${
          compact
            ? "grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]"
            : "space-y-1 text-[10px] md:text-[11px]"
        }`}
      >
        <p>
          <span className="font-semibold">Account No:</span> {institute.bankAccountNumber}
        </p>
        <p>
          <span className="font-semibold">Student:</span> {student.name}
        </p>
        <p>
          <span className="font-semibold">Roll No:</span> {student.rollNumber}
        </p>
        <p>
          <span className="font-semibold">Degree:</span> {student.degree}
        </p>
        <p>
          <span className="font-semibold">Period:</span> {student.period}
        </p>
      </div>

      <div className="mt-3 overflow-hidden rounded border border-gray-300">
        <table className="chalan-fee-table w-full border-collapse text-[11px] md:text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="bg-gray-100 p-0">
                <div className="chalan-fee-th-line text-left text-gray-700">Description</div>
              </th>
              <th className="bg-gray-100 p-0">
                <div className="chalan-fee-th-line chalan-fee-td-line--amount text-right text-gray-700">
                  Amount (PKR)
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {student.feeDetails.map((item) => (
              <tr key={item.description} className="border-t border-gray-200">
                <td className="p-0">
                  <div className="chalan-fee-td-line text-left text-gray-700">{item.description}</div>
                </td>
                <td className="p-0">
                  <div className="chalan-fee-td-line chalan-fee-td-line--amount text-right text-gray-800">
                    {item.amount.toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
            <tr className="border-t border-gray-300">
              <td className="bg-gray-50 p-0">
                <div className="chalan-fee-td-line font-semibold text-gray-900">Total</div>
              </td>
              <td className="bg-gray-50 p-0">
                <div className="chalan-fee-td-line chalan-fee-td-line--amount text-right font-semibold text-gray-900">
                  {totalAmount.toLocaleString()}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="chalan-stripe mt-2 overflow-hidden rounded bg-black">
        <span className="chalan-stripe-text">{copyLabel}</span>
      </div>

      {compact ? (
        <footer className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="min-w-0 flex-1 text-[10px] leading-normal tracking-tight text-gray-500">
            Please pay before due date. This is a system-generated chalan.
          </p>
          <div className="shrink-0 rounded border border-gray-300 bg-white p-1">
            <QRCodeSVG value={qrValue} size={66} />
          </div>
        </footer>
      ) : (
        <footer className="mt-auto flex flex-col gap-2 pt-3">
          <div className="flex items-end justify-between gap-2">
            <div className="shrink-0 rounded border border-gray-300 bg-white p-1">
              <QRCodeSVG value={qrValue} size={78} />
            </div>
            <p className="mb-0 shrink-0 pl-1 text-right text-[7px] font-bold leading-none text-gray-700 sm:text-[8px] whitespace-nowrap">
              Bank authorized signature / stamp
            </p>
          </div>
          <p className="text-[9px] md:text-[10px] text-gray-500 leading-tight tracking-tight text-center">
            Please pay before due date. This is a system-generated chalan.
          </p>
        </footer>
      )}
    </article>
  );
}

export default ChalanCard;

import { QRCodeCanvas } from "qrcode.react";
import mainLogo from "../assets/mainLogo.png";
import { institute } from "../data/institute";

/** Portrait layout only — styles live under `.chalan-card` in `index.css`. */
function ChalanCard({ student, chalanId, generatedAt, dueDate, copyLabel }) {
  const totalAmount = student.feeDetails.reduce((sum, item) => sum + item.amount, 0);
  const qrValue = JSON.stringify({
    chalanId,
    studentId: student.id,
    rollNumber: student.rollNumber,
    totalAmount,
  });

  return (
    <article className="chalan-card flex h-full flex-col rounded-md border border-gray-400 bg-white p-3 md:p-4">
      <header className="border-b border-gray-300 pb-3">
        <div className="w-full">
          <div className="mx-auto block w-fit max-w-full text-center">
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
        <div className="chalan-row-table mt-1.5 text-[11px] text-gray-700">
          <div className="chalan-cell text-left">
            <span className="chalan-meta-line">Issuance Date: {generatedAt}</span>
          </div>
          <div className="chalan-cell text-right">
            <span className="chalan-meta-line">Due Date: {dueDate}</span>
          </div>
        </div>
      </header>

      <div className="chalan-student-fields mt-4 space-y-1 text-[10px] text-gray-700 md:text-[11px]">
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
                <div className="chalan-fee-line-wrap">
                  <div className="chalan-fee-th-line text-left text-gray-700">Description</div>
                </div>
              </th>
              <th className="bg-gray-100 p-0">
                <div className="chalan-fee-line-wrap">
                  <div className="chalan-fee-th-line chalan-fee-td-line--amount text-right text-gray-700">
                    Amount (PKR)
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {student.feeDetails.map((item) => (
              <tr key={item.description} className="border-t border-gray-200">
                <td className="p-0">
                  <div className="chalan-fee-line-wrap">
                    <div className="chalan-fee-td-line text-left text-gray-700">{item.description}</div>
                  </div>
                </td>
                <td className="p-0">
                  <div className="chalan-fee-line-wrap">
                    <div className="chalan-fee-td-line chalan-fee-td-line--amount text-right text-gray-800">
                      {item.amount.toLocaleString()}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            <tr className="border-t border-gray-300">
              <td className="bg-gray-50 p-0">
                <div className="chalan-fee-line-wrap">
                  <div className="chalan-fee-td-line font-semibold text-gray-900">Total</div>
                </div>
              </td>
              <td className="bg-gray-50 p-0">
                <div className="chalan-fee-line-wrap">
                  <div className="chalan-fee-td-line chalan-fee-td-line--amount text-right font-semibold text-gray-900">
                    {totalAmount.toLocaleString()}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="chalan-stripe mt-2 overflow-hidden rounded bg-black">
        <span className="chalan-stripe-text">{copyLabel}</span>
      </div>

      <footer className="mt-auto block pt-3">
        <div className="flex w-full items-end justify-between gap-2">
          <div className="inline-block rounded border border-gray-300 bg-white p-1">
            <QRCodeCanvas value={qrValue} size={78} fgColor="#111111" bgColor="#ffffff" includeMargin={false} />
          </div>
          <span className="inline-block pb-0.5 text-right text-[7px] font-bold leading-none text-gray-700 sm:text-[8px] whitespace-nowrap">
            Bank authorized signature / stamp
          </span>
        </div>
        <p className="chalan-foot-p mt-2 text-center text-[9px] text-gray-500 leading-tight tracking-tight md:text-[10px]">
          Please pay before due date. This is a system-generated chalan.
        </p>
      </footer>
    </article>
  );
}

export default ChalanCard;

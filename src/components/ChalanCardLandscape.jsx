import { QRCodeCanvas } from "qrcode.react";
import "../styles/chalan-landscape.css";
import mainLogo from "../assets/mainLogo.png";
import { institute } from "../data/institute";

/** Stacked “wide card” layout for Landscape mode — independent from portrait `ChalanCard`. */
function ChalanCardLandscape({
  student,
  chalanId,
  generatedAt,
  dueDate,
  copyLabel,
}) {
  const totalAmount = student.feeDetails.reduce((sum, item) => sum + item.amount, 0);
  const qrValue = JSON.stringify({
    chalanId,
    studentId: student.id,
    rollNumber: student.rollNumber,
    totalAmount,
  });

  return (
    <article className="chalan-card-landscape flex h-full flex-col rounded-md border border-gray-400 bg-white p-2.5 sm:p-3">
      <header className="chalan-ls-header border-b border-gray-300 pb-2">
        <div className="chalan-ls-header-row">
          <div className="chalan-ls-header-left">
            <div className="chalan-ls-logo-table">
              <div className="chalan-ls-logo-cell">
                <img
                  src={mainLogo}
                  alt=""
                  className="chalan-ls-logo h-14 w-auto max-w-[6.5rem] object-contain [image-rendering:auto]"
                />
              </div>
              <div className="chalan-ls-logo-cell chalan-ls-logo-cell--text">
                <p className="chalan-ls-institute-name">{institute.instituteDisplayName}</p>
                <p className="chalan-ls-subtitle">Bank Fee Chalan</p>
              </div>
            </div>
          </div>
          <div className="chalan-ls-header-right">
            <p className="chalan-ls-meta">Chalan ID: {chalanId}</p>
            <p className="chalan-ls-meta">Date: {generatedAt}</p>
            <p className="chalan-ls-meta">Due: {dueDate}</p>
          </div>
        </div>
        <div className="chalan-ls-stripe mt-2 overflow-hidden rounded bg-black">
          <span className="chalan-ls-stripe-text">{institute.bankDisplayName}</span>
        </div>
      </header>

      <div className="chalan-ls-student mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[8px] text-gray-800 sm:text-[9px]">
        <p className="col-span-2 m-0 leading-snug">
          <span className="font-semibold">Account No:</span> {institute.bankAccountNumber}
        </p>
        <p className="m-0 leading-snug">
          <span className="font-semibold">Student:</span> {student.name}
        </p>
        <p className="m-0 text-right leading-snug sm:text-left">
          <span className="font-semibold">Roll No:</span> {student.rollNumber}
        </p>
        <p className="m-0 leading-snug">
          <span className="font-semibold">Degree:</span> {student.degree}
        </p>
        <p className="m-0 text-right leading-snug sm:text-left">
          <span className="font-semibold">Period:</span> {student.period}
        </p>
      </div>

      <div className="chalan-ls-table-wrap mt-2 overflow-hidden rounded border border-gray-300">
        <table className="chalan-ls-fee-table w-full border-collapse text-[8px] sm:text-[9px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="chalan-ls-th bg-gray-100 p-0">
                <div className="chalan-ls-fee-line text-left font-semibold text-gray-700">Description</div>
              </th>
              <th className="chalan-ls-th bg-gray-100 p-0">
                <div className="chalan-ls-fee-line chalan-ls-fee-num text-right font-semibold text-gray-700">
                  Amount (PKR)
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {student.feeDetails.map((item) => (
              <tr key={item.description} className="border-t border-gray-200">
                <td className="chalan-ls-td p-0 text-gray-700">
                  <div className="chalan-ls-fee-line">{item.description}</div>
                </td>
                <td className="chalan-ls-td p-0 text-right text-gray-800">
                  <div className="chalan-ls-fee-line chalan-ls-fee-num">{item.amount.toLocaleString()}</div>
                </td>
              </tr>
            ))}
            <tr className="border-t border-gray-300 bg-gray-50">
              <td className="chalan-ls-td bg-gray-50 p-0 font-semibold text-gray-900">
                <div className="chalan-ls-fee-line">Total</div>
              </td>
              <td className="chalan-ls-td bg-gray-50 p-0 text-right font-semibold text-gray-900">
                <div className="chalan-ls-fee-line chalan-ls-fee-num">{totalAmount.toLocaleString()}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="chalan-ls-stripe mt-2 overflow-hidden rounded bg-black">
        <span className="chalan-ls-stripe-text">{copyLabel}</span>
      </div>

      <footer className="chalan-ls-footer mt-auto pt-2">
        <div className="chalan-ls-footer-layout mt-1">
          <div className="chalan-ls-footer-col chalan-ls-footer-col--left">
            <p className="chalan-ls-foot-p chalan-ls-foot-p--left text-[7px] leading-snug text-gray-600 sm:text-[8px]">
              Please pay before due date.
              <br />
              This is a system-generated
              <br />
              chalan.
            </p>
          </div>
          <div className="chalan-ls-footer-col chalan-ls-footer-col--center">
            <p className="chalan-ls-sign chalan-ls-sign--mid m-0 text-center text-[6.5px] font-bold leading-none text-gray-700 sm:text-[7px] whitespace-nowrap">
              Bank authorized signature / stamp
            </p>
          </div>
          <div className="chalan-ls-footer-col chalan-ls-footer-col--right">
            <div className="chalan-ls-qr-wrap inline-block rounded border border-gray-300 bg-white p-0.5">
              <QRCodeCanvas
                value={qrValue}
                size={56}
                fgColor="#111111"
                bgColor="#ffffff"
                includeMargin={false}
              />
            </div>
          </div>
        </div>
      </footer>
    </article>
  );
}

export default ChalanCardLandscape;

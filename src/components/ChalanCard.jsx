import { QRCodeSVG } from "qrcode.react";

function ChalanCard({ student, chalanId, generatedAt, copyLabel }) {
  const totalAmount = student.feeDetails.reduce((sum, item) => sum + item.amount, 0);
  const qrValue = JSON.stringify({
    chalanId,
    studentId: student.id,
    rollNumber: student.rollNumber,
    totalAmount,
  });

  return (
    <article className="chalan-card border border-gray-400 rounded-md bg-white p-3 md:p-4">
      <header className="flex items-start justify-between gap-3 border-b border-gray-300 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
              LOGO
            </div>
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900">
                Corvit Institute
              </h3>
              <p className="text-[11px] text-gray-600">Bank Fee Chalan Copy</p>
            </div>
          </div>
        </div>
        <div className="text-right text-[11px] text-gray-700">
          <p className="font-semibold">{copyLabel}</p>
          <p>Chalan ID: {chalanId}</p>
          <p>Date: {generatedAt}</p>
        </div>
      </header>

      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-gray-700">
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
        <table className="w-full text-[11px] md:text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 text-left font-semibold text-gray-700">
                Description
              </th>
              <th className="px-2 py-1 text-right font-semibold text-gray-700">
                Amount (PKR)
              </th>
            </tr>
          </thead>
          <tbody>
            {student.feeDetails.map((item) => (
              <tr key={item.description} className="border-t border-gray-200">
                <td className="px-2 py-1 text-gray-700">{item.description}</td>
                <td className="px-2 py-1 text-right text-gray-800">
                  {item.amount.toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="border-t border-gray-300 bg-gray-50">
              <td className="px-2 py-1 font-semibold text-gray-900">Total</td>
              <td className="px-2 py-1 text-right font-semibold text-gray-900">
                {totalAmount.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer className="mt-2 flex items-center justify-between gap-3">
        <p className="text-[10px] text-gray-500">
          Please pay before due date. This is a system-generated chalan.
        </p>
        <div className="rounded border border-gray-300 bg-white p-1">
          <QRCodeSVG value={qrValue} size={54} />
        </div>
      </footer>
    </article>
  );
}

export default ChalanCard;

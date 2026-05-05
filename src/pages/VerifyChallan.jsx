import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { getGeneratedChallan } from "../utils/challan/challanRegistry";

const BANK_OPTIONS =[
  { value: "", label: "Select bank..." },

  // Major Commercial Banks
  { value: "hbl", label: "HBL (Habib Bank Limited)" },
  { value: "ubl", label: "UBL (United Bank Limited)" },
  { value: "mcb", label: "MCB Bank Limited" },
  { value: "abl", label: "Allied Bank Limited" },
  { value: "nbp", label: "National Bank of Pakistan" },
  { value: "bank_alfalah", label: "Bank Alfalah" },
  { value: "faysal", label: "Faysal Bank" },
  { value: "bank_al_habib", label: "Bank Al Habib" },
  { value: "askari", label: "Askari Bank" },
  { value: "silk", label: "Silk Bank" },
  { value: "soneri", label: "Soneri Bank" },
  { value: "summit", label: "Summit Bank" },

  // Islamic Banks
  { value: "meezan", label: "Meezan Bank" },
  { value: "bank_islami", label: "Bank Islami" },
  { value: "albaraka", label: "Al Baraka Bank" },

  // Digital / Microfinance
  { value: "easypaisa", label: "Easypaisa" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "nayapay", label: "NayaPay" },
  { value: "sadapay", label: "SadaPay" },
  { value: "upaisa", label: "UPaisa" },

  // Cash
  { value: "cash", label: "Cash" }
];

function VerifyChallan() {
  const { chalanId } = useParams();
  const record = useMemo(() => getGeneratedChallan(chalanId), [chalanId]);
  const [bank, setBank] = useState("");
  const [status, setStatus] = useState("Unpaid");
  const [paymentDate, setPaymentDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const handleSubmit = (event) => {
    event.preventDefault();
  
    if (!bank) {
      toast.error("Please select a bank");
      return;
    }
  
    if (!paymentDate) {
      toast.error("Please select a payment date");
      return;
    }
  
    setStatus("Paid");
  
    toast.success(`Paid via ${bank} on ${paymentDate}`);
  };

  if (!chalanId) {
    return (
      <section className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <p className="text-gray-700">Invalid challan link.</p>
        <Link to="/" className="text-blue-600 hover:underline text-sm font-medium">
          Back to generator
        </Link>
      </section>
    );
  }

  if (!record) {
    return (
      <section className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Verify challan</h1>
        <p className="text-gray-700">
          No record found for challan ID <span className="font-mono tabular-nums">{chalanId}</span>. Generate a
          challan in this browser first, or the ID may be incorrect.
        </p>
        <Link to="/" className="text-blue-600 hover:underline text-sm font-medium">
          Back to generator
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Verify challan</h1>
        <p className="text-sm text-gray-600 mt-1">Internal admin verification</p>
      </div>

      <dl className="rounded-lg border border-gray-200 bg-white p-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Chalan ID</dt>
          <dd className="font-mono tabular-nums text-gray-900 text-right">{record.chalanId}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Student name</dt>
          <dd className="text-gray-900 text-right">{record.studentName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Roll number</dt>
          <dd className="font-mono text-gray-900 text-right">{record.rollNumber}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Total amount</dt>
          <dd className="tabular-nums text-gray-900 text-right">{Number(record.totalAmount).toLocaleString()}</dd>
        </div>
        <div className="flex justify-between gap-4 pt-2 border-t border-gray-100">
          <dt className="text-gray-500">Status</dt>
          <dd
            className={
              status === "Paid"
                ? "font-medium text-emerald-700 text-right"
                : "font-medium text-amber-700 text-right"
            }
          >
            {status}
          </dd>
        </div>
      </dl>

      {status !== "Paid" && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Payment channel</span>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {BANK_OPTIONS.map((opt) => (
                <option key={opt.value || "placeholder"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
           <span className="block text-sm font-medium text-gray-700 mb-1">
             Payment date
           </span>
           <input
             type="date"
             value={paymentDate}
             max={new Date().toISOString().split("T")[0]} // no future dates
             onChange={(e) => setPaymentDate(e.target.value)}
             className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
           />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Submit payment
          </button>
          <p className="text-xs text-gray-500">Recording is frontend-only until a backend is connected.</p>
        </form>
      )}

      <Link to="/" className="inline-block text-sm text-blue-600 hover:underline font-medium">
        ← Back to fee chalan
      </Link>
    </section>
  );
}

export default VerifyChallan;

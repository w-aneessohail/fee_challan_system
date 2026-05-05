import { toNumber } from "./amountUtils";

export const getBaseFee = (student) => {
  if (!student) return 0;
  return toNumber(student.fee) || student.feeDetails.reduce((sum, item) => sum + item.amount, 0);
};

/** Applies period metadata and scales canonical one-period fee rows by selection count */
export function applyPeriodToStudentForBilling(student, period) {
  if (!student) return null;
  const next = { ...student, period };
  const m = Array.isArray(period?.values) && period.values.length > 0 ? period.values.length : 1;
  if (m < 2) return next;

  const scaledDetails = student.feeDetails.map((item) => ({
    ...item,
    amount: Math.round(toNumber(item.amount) * m),
  }));
  const sumScaled = scaledDetails.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const feeScaled =
    student.fee != null && Number.isFinite(toNumber(student.fee))
      ? Math.round(toNumber(student.fee) * m)
      : sumScaled;

  return {
    ...next,
    fee: feeScaled,
    feeDetails: scaledDetails,
  };
}

export const calculateFeeAdjustments = ({
  student,
  selectedExemptions = [],
  customExemptions = [],
  additionalFees = [],
}) => {
  if (!student) {
    return {
      baseFee: 0,
      exemptionsBreakdown: [],
      additionalFeesBreakdown: [],
      totalFee: 0,
    };
  }

  const baseFee = getBaseFee(student);
  const additionalFeesBreakdown = [];
  let totalAdditions = 0;

  additionalFees.forEach((item, index) => {
    const label = String(item?.label ?? "").trim();
    const amount = toNumber(item?.amount);
    if (!label || !Number.isFinite(amount) || amount <= 0) return;
    totalAdditions += amount;
    additionalFeesBreakdown.push({
      key: `additionalFee-${index}`,
      label,
      amount,
    });
  });

  const breakdown = [];
  let discount = 0;

  if (selectedExemptions.includes("scholarship") && toNumber(student.scholarship) > 0) {
    const amount = (toNumber(student.scholarship) / 100) * baseFee;
    discount += amount;
    breakdown.push({
      key: "scholarship",
      label: `Scholarship (${student.scholarship}%)`,
      amount,
    });
  }

  if (selectedExemptions.includes("financialAid") && toNumber(student.financialAid) > 0) {
    const amount = (toNumber(student.financialAid) / 100) * baseFee;
    discount += amount;
    breakdown.push({
      key: "financialAid",
      label: `Financial Aid (${student.financialAid}%)`,
      amount,
    });
  }

  customExemptions.forEach((item, index) => {
    if (!item?.label || !Number.isFinite(Number(item.amount)) || Number(item.amount) <= 0) return;
    const amount = Number(item.amount);
    discount += amount;
    breakdown.push({
      key: `customExemption-${index}`,
      label: item.label,
      amount,
    });
  });

  return {
    baseFee,
    additionalFeesBreakdown,
    exemptionsBreakdown: breakdown,
    totalFee: Math.max(baseFee + totalAdditions - discount, 0),
  };
};

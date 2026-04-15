import { toNumber } from "./amountUtils";

export const getBaseFee = (student) => {
  if (!student) return 0;
  return toNumber(student.fee) || student.feeDetails.reduce((sum, item) => sum + item.amount, 0);
};

export const calculateFeeAdjustments = ({ student, selectedExemptions = [], customExemptions = [] }) => {
  if (!student) return { baseFee: 0, exemptionsBreakdown: [], totalFee: 0 };

  const baseFee = getBaseFee(student);
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
    exemptionsBreakdown: breakdown,
    totalFee: Math.max(baseFee - discount, 0),
  };
};

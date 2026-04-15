import { calculateFeeAdjustments } from "../utils/challan/calculationUtils";

export const fieldOptions = [
  { key: "name", label: "Name" },
  { key: "fatherName", label: "Father Name" },
  { key: "semester", label: "Semester" },
  { key: "department", label: "Department" },
  { key: "cnic", label: "CNIC" },
  { key: "contact", label: "Contact" },
];

const hiddenStudentKeys = new Set(["id", "rollNumber", "degree", "period", "feeDetails"]);

export const exemptionOptions = [
  { key: "scholarship", label: "Scholarship" },
  { key: "financialAid", label: "Financial Aid" },
  { key: "feeWaiver", label: "Fee Waiver" },
];

export const getAvailableFields = (student) => {
  if (!student) return [];
  const studentKeys = new Set(Object.keys(student));
  return fieldOptions.filter(({ key }) => studentKeys.has(key) && !hiddenStudentKeys.has(key));
};

export const getDisabledExemptions = (student) => {
  if (!student) return new Set();
  const disabled = new Set();
  if (!(Number(student.scholarship) > 0)) disabled.add("scholarship");
  if (!(Number(student.financialAid) > 0)) disabled.add("financialAid");
  return disabled;
};

export const getDefaultExemptions = (student) => {
  if (!student) return [];
  const defaults = [];
  if (Number(student.scholarship) > 0) defaults.push("scholarship");
  if (Number(student.financialAid) > 0) defaults.push("financialAid");
  return defaults;
};

export const getFeePreview = ({ student, selectedExemptions, customExemptions }) =>
  calculateFeeAdjustments({ student, selectedExemptions, customExemptions });

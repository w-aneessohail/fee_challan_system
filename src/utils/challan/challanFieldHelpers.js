import { fieldOptions, hiddenStudentKeys } from "../../constants/challan";
import { calculateFeeAdjustments } from "./calculationUtils";

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

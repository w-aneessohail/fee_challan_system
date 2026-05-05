import { formatDate, getDueDate } from "./dateUtils";

/**
 * Numeric challan ID: YYYYMMDD + HHMMSS + RR (00–99).
 * @returns {string}
 */
export const generateChallanId = (date = new Date()) => {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const MM = String(date.getMinutes()).padStart(2, "0");
  const SS = String(date.getSeconds()).padStart(2, "0");
  const rr = String(Math.floor(Math.random() * 100)).padStart(2, "0");
  return `${yyyy}${mm}${dd}${HH}${MM}${SS}${rr}`;
};

export const createChallanMeta = (date = new Date()) => {
  const dueDate = getDueDate(date);
  return {
    chalanId: generateChallanId(date),
    generatedAt: formatDate(date),
    dueDate: formatDate(dueDate),
  };
};

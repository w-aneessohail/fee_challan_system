import { formatDate, getDueDate } from "./dateUtils";

export const generateChallanId = (date = new Date()) =>
  `CH-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

export const createChallanMeta = (date = new Date()) => {
  const dueDate = getDueDate(date);
  return {
    chalanId: generateChallanId(date),
    generatedAt: formatDate(date),
    dueDate: formatDate(dueDate),
  };
};

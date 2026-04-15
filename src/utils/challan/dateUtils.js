export const formatDate = (date) => date.toLocaleDateString();

export const getDueDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const issueDay = date.getDate();
  return new Date(year, month, issueDay <= 15 ? 15 : issueDay);
};

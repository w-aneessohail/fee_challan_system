export const toNumber = (value) => Number(value) || 0;

export const formatCurrency = (value) => Number(value || 0).toLocaleString();

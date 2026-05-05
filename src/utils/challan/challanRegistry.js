const STORAGE_PREFIX = "fee-challan-verify:";

/**
 * Persist generated challan metadata for internal verify screen lookup (frontend only).
 * @param {{ chalanId: string, studentId: string, studentName: string, rollNumber: string, totalAmount: number }} record
 */
export function registerGeneratedChallan(record) {
  try {
    if (!record?.chalanId) return;
    localStorage.setItem(`${STORAGE_PREFIX}${record.chalanId}`, JSON.stringify(record));
  } catch {
    /* ignore quota / privacy mode */
  }
}

/**
 * @param {string} chalanId
 * @returns {{ chalanId: string, studentId: string, studentName: string, rollNumber: string, totalAmount: number } | null}
 */
export function getGeneratedChallan(chalanId) {
  if (!chalanId) return null;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${chalanId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

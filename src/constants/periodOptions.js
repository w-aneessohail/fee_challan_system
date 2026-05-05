/** Catalogue order defines range display (first–last) for multi-select */
export const SEMESTER_PERIOD_VALUES = Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`);

export const MONTHLY_PERIOD_VALUES = [
  "Jan 2026",
  "Feb 2026",
  "Mar 2026",
  "Apr 2026",
  "May 2026",
  "Jun 2026",
  "Jul 2026",
  "Aug 2026",
  "Sep 2026",
  "Oct 2026",
  "Nov 2026",
  "Dec 2026",
];

export const PERIOD_TYPE_OPTIONS = [
  { value: "semester", label: "Semester" },
  { value: "monthly", label: "Monthly" },
];

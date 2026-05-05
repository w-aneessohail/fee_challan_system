import { MONTHLY_PERIOD_VALUES, SEMESTER_PERIOD_VALUES } from "../../constants/periodOptions";

const SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseCatalogMonthYear(label) {
  const parts = String(label ?? "")
    .trim()
    .split(/\s+/);
  const monthIndex = SHORT_MONTH_NAMES.indexOf(parts[0] ?? "");
  const year = Number.parseInt(parts[1], 10);
  return {
    monthIndex: monthIndex >= 0 ? monthIndex : 0,
    year: Number.isFinite(year) ? year : NaN,
  };
}

/** Pick catalogue month closest to reference date (e.g. current month). Falls back to first label. */
export function suggestCatalogMonthValue(catalog, refDate = new Date()) {
  if (!catalog?.length) return "";
  const y = refDate.getFullYear();
  const m = refDate.getMonth();
  const candidate = `${SHORT_MONTH_NAMES[m]} ${y}`;
  if (catalog.includes(candidate)) return candidate;

  const inYear = catalog
    .map((label) => {
      const { monthIndex, year: py } = parseCatalogMonthYear(label);
      return { label, monthIndex, year: py };
    })
    .filter((row) => row.year === y);

  if (inYear.length === 0) {
    return catalog[0];
  }

  let best = inYear[0];
  let bestDist = Math.abs(best.monthIndex - m);
  for (let i = 1; i < inYear.length; i++) {
    const row = inYear[i];
    const d = Math.abs(row.monthIndex - m);
    if (d < bestDist) {
      bestDist = d;
      best = row;
    }
  }
  return best.label;
}

/** DB-backed semester/monthly/custom — ordered selection for student's stored period type only */
export function deriveStoredPeriodValues(student) {
  if (!student?.period || student.period.type === "custom") return [];
  const t = student.period.type;
  const cat = getCatalogOrdered(t);
  if (!cat.length) return [];
  if (Array.isArray(student.period.values) && student.period.values.length > 0) {
    return orderSelectedAgainstCatalog(student.period.values, cat);
  }
  const raw = String(student.period.value ?? "").trim();
  if (raw && cat.includes(raw)) return [raw];
  return [cat[0]];
}

export function getDefaultSemesterCheckboxSelection(student) {
  if (!student?.period) return SEMESTER_PERIOD_VALUES[0] ? [SEMESTER_PERIOD_VALUES[0]] : [];

  if (student.period.type === "semester") {
    const d = deriveStoredPeriodValues(student);
    return d.length ? d : SEMESTER_PERIOD_VALUES[0] ? [SEMESTER_PERIOD_VALUES[0]] : [];
  }

  const v = String(student.period.value ?? "").trim();
  if (SEMESTER_PERIOD_VALUES.includes(v)) return [v];

  return SEMESTER_PERIOD_VALUES[0] ? [SEMESTER_PERIOD_VALUES[0]] : [];
}

export function getDefaultMonthlyCheckboxSelection(student) {
  const cat = MONTHLY_PERIOD_VALUES;
  if (!cat.length) return [];

  if (student?.period?.type === "monthly") {
    const fromDb = deriveStoredPeriodValues(student);
    if (fromDb.length) return fromDb;
  }

  const sug = suggestCatalogMonthValue(cat);
  return sug ? [sug] : [cat[0]];
}

export function getCatalogOrdered(periodType) {
  if (periodType === "monthly") return MONTHLY_PERIOD_VALUES;
  if (periodType === "semester") return SEMESTER_PERIOD_VALUES;
  return [];
}

/** Keep only labels present in catalogue, ordered as in catalogue */
export function orderSelectedAgainstCatalog(selection, catalog) {
  const set = new Set(selection);
  return catalog.filter((label) => set.has(label));
}

function contiguousRuns(sortedUniqueIndices) {
  if (!sortedUniqueIndices.length) return [];
  const runs = [[sortedUniqueIndices[0]]];
  for (let i = 1; i < sortedUniqueIndices.length; i++) {
    const x = sortedUniqueIndices[i];
    const lastRun = runs[runs.length - 1];
    if (x === lastRun[lastRun.length - 1] + 1) lastRun.push(x);
    else runs.push([x]);
  }
  return runs;
}

/** Semester/monthly only: contiguous runs use first–last; gaps use commas between groups */
export function formatCatalogPeriodDisplay(selection, catalog) {
  const ordered = orderSelectedAgainstCatalog(selection, catalog);
  if (!ordered.length) return "";
  if (!catalog.length) return ordered.join(", ");
  if (ordered.length === 1) return ordered[0];

  const indices = [...new Set(ordered.map((label) => catalog.indexOf(label)).filter((i) => i >= 0))].sort(
    (a, b) => a - b,
  );
  const runs = contiguousRuns(indices);
  const parts = runs.map((run) => {
    if (run.length === 1) return catalog[run[0]];
    const a = catalog[run[0]];
    const b = catalog[run[run.length - 1]];
    return `${a} – ${b}`;
  });
  return parts.join(", ");
}

export function formatCustomPeriodSegments(text) {
  return String(text ?? "")
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
}

export function formatPeriodDisplay({ periodType, catalogValues, customText }) {
  if (periodType === "custom") {
    const vals = formatCustomPeriodSegments(customText);
    return vals.slice().sort((a, b) => a.localeCompare(b)).join(", ");
  }
  const catalog = getCatalogOrdered(periodType);
  return formatCatalogPeriodDisplay(catalogValues, catalog);
}

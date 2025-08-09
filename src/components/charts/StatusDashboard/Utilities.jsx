// ------------------------
// Utilities
// ------------------------
export function monthToDate(monthStr) {
  // monthStr: 'YYYY-MM'
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export function avg(values) {
  if (!values || values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function getLatestMonthsSorted(actuals) {
  const months = Array.from(new Set(actuals.map((a) => a.Month)));
  months.sort((a, b) => +monthToDate(b) - +monthToDate(a)); // descending
  return months;
}

export function computeAveragesForSeries(rows, factorKey) {
  // rows assumed sorted descending by Month or not; we only use Month values
  const monthsSorted = getLatestMonthsSorted(rows);
  const latestMonth = monthsSorted[0];
  const latestValueRow = rows.find((r) => r.Month === latestMonth);
  const latestValue = latestValueRow ? latestValueRow[factorKey] : null;

  // get numeric values for last 3 and last 6 months
  const valuesByMonth = monthsSorted
    .map((m) => {
      const r = rows.find((rr) => rr.Month === m);
      return r ? r[factorKey] : null;
    })
    .filter((v) => v !== null && v !== undefined);

  const last3 = valuesByMonth.slice(0, 3);
  const last6 = valuesByMonth.slice(0, 6);

  return {
    latest: latestValue,
    avg3: last3.length ? avg(last3) : null,
    avg6: last6.length ? avg(last6) : null,
  };
}

export function judgeByTarget(avg3, avg6, target) {
  // The user's rule: if both 3mo and 6mo avg are below target -> red
  // if exactly one below -> yellow, if both >= target -> green
  if (avg3 == null && avg6 == null)
    return { color: "gray", label: "데이터 부족" };

  const below3 = typeof avg3 === "number" ? avg3 < target : false;
  const below6 = typeof avg6 === "number" ? avg6 < target : false;

  if (below3 && below6) return { color: "red", label: "위험" };
  if (below3 || below6) return { color: "yellow", label: "주의" };
  return { color: "green", label: "양호" };
}

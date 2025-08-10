// ------------------------
// 유틸리티 함수
// ------------------------
export function monthToDate(monthStr) {
  // 'YYYY-MM' 문자열을 Date 객체로 변환
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export function avg(values) {
  // 숫자 배열의 평균값 구하기
  if (!values || values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function getLatestMonthsSorted(actuals) {
  // 실적 데이터에서 모든 Month를 추출하고 최신 순으로 정렬
  const months = Array.from(new Set(actuals.map((a) => a.Month)));
  months.sort((a, b) => +monthToDate(b) - +monthToDate(a));
  return months;
}

export function computeAveragesForSeries(rows, factorKey) {
  // 특정 factor(factor1,2,3)에 대해 최근 값, 3개월 평균, 6개월 평균 계산
  const monthsSorted = getLatestMonthsSorted(rows);
  const latestMonth = monthsSorted[0];
  const latestValueRow = rows.find((r) => r.Month === latestMonth);
  const latestValue = latestValueRow ? latestValueRow[factorKey] : null;
  const valuesByMonth = monthsSorted
    .map((m) => {
      const r = rows.find((rr) => rr.Month === m);
      return r ? r[factorKey] : null;
    })
    .filter((v) => v != null);
  const last3 = valuesByMonth.slice(0, 3);
  const last6 = valuesByMonth.slice(0, 6);
  return { latest: latestValue, avg3: avg(last3), avg6: avg(last6) };
}

export function judgeByTarget(avg3, avg6, target) {
  // 목표값과 평균값을 비교하여 색상 결정
  const below3 = typeof avg3 === "number" ? avg3 < target : false;
  const below6 = typeof avg6 === "number" ? avg6 < target : false;
  if (below3 && below6) return { color: "red", label: "위험" };
  if (below3 || below6) return { color: "yellow", label: "주의" };
  return { color: "green", label: "양호" };
}

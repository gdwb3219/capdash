import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function EquipmentScatterChart({ data, selectedMonth }) {
  const scatterData = useMemo(() => {
    if (!selectedMonth) return { dpData: [], sgData: [] };

    const filtered = data.filter((item) => item.month === selectedMonth);

    const dpData = filtered
      .filter((item) => item.oper === 'DP')
      .map((item) => ({
        ...item,
        operationRate: item.twh > 0 ? item.eff / item.twh : 0,
      }));

    const sgData = filtered
      .filter((item) => item.oper === 'SG')
      .map((item) => ({
        ...item,
        operationRate: item.twh > 0 ? item.eff / item.twh : 0,
      }));

    return { dpData, sgData };
  }, [data, selectedMonth]);

  const toPercent = (decimal) => `${(decimal * 100).toFixed(0)}%`;

  if (!selectedMonth) {
    return (
      <div className="chart-wrapper placeholder">
        <p>
          왼쪽 라인 차트에서 특정 월의 점을 클릭하면
          <br />
          이곳에 장비별 상세 데이터가 표시됩니다.
        </p>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      <h2>{selectedMonth}월 장비별 가동률</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis type="category" dataKey="oper" name="Operator" />
          <YAxis
            type="number"
            dataKey="operationRate"
            name="가동률"
            unit="%"
            tickFormatter={toPercent}
            domain={[0, 'dataMax + 0.1']}
          />
          <ZAxis dataKey="eqpId" name="장비 ID" />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value, name) =>
              name === '가동률' ? toPercent(value) : value
            }
          />
          <Legend />
          <Scatter name="DP" data={scatterData.dpData} fill="#8884d8" />
          <Scatter name="SG" data={scatterData.sgData} fill="#82ca9d" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
export default EquipmentScatterChart;

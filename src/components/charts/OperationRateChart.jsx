import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import '../../styles/components/charts/OperationRateChart.css'; // 별도의 CSS 파일 import

const CHART_COLORS = [
  '#1F77B4', // 모던 블루
  '#FF7F0E', // 비비드 오렌지
  '#2CA02C', // 포레스트 그린
  '#D62728', // 클래식 레드
  '#9467BD', // 소프트 퍼플
  '#8C564B', // 어스 브라운
  '#E377C2', // 페일 핑크
  '#7F7F7F', // 미디움 그레이
  '#BCBD22', // 올리브 그린
  '#17BECF', // 사이언 블루
];

// ## 2. 차트 컴포넌트 ##
// 파일 경로: src/components/OperationRateChart.jsx
function OperationRateChart({ data, onDataPointClick }) {
  console.log('props Data', data);
  const chartData = useMemo(() => {
    const aggregatedData = {};
    data.forEach(({ MONTH, EQP_MODEL, TWH_MONTH, OPER_MONTH }) => {
      if (!aggregatedData[MONTH]) aggregatedData[MONTH] = {};
      if (!aggregatedData[MONTH][EQP_MODEL])
        aggregatedData[MONTH][EQP_MODEL] = { twh: 0, eff: 0 };
      aggregatedData[MONTH][EQP_MODEL].twh += TWH_MONTH;
      aggregatedData[MONTH][EQP_MODEL].eff += OPER_MONTH;
    });

    const formattedData = Object.keys(aggregatedData).map((month) => {
      const monthData = { month: month.toString() };
      const operators = aggregatedData[month];
      Object.keys(operators).forEach((oper) => {
        const { twh, eff } = operators[oper];
        monthData[oper] = twh > 0 ? eff / twh : 0;
      });
      return monthData;
    });
    return formattedData.sort((a, b) => a.month.localeCompare(b.month));
  }, []);

  const modelList = Object.keys(chartData[0]).slice(1);

  console.log('chartDatachartData', Object.keys(chartData[0]).slice(1));

  function handleChartClick(e) {
    if (e && e.activeLabel) {
      onDataPointClick(parseInt(e.activeLabel, 10));
    }
  }

  const toPercent = (decimal) => `${(decimal * 100).toFixed(0)}%`;

  return (
    <div className="chart-wrapper">
      <h2>월별 가동률 (oper 그룹)</h2>
      <p className="chart-instruction">
        라인의 점을 클릭하여 월별 장비 데이터를 확인하세요.
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          onClick={handleChartClick}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={toPercent} domain={[0, 'dataMax + 0.1']} />
          <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
          <Legend />
          {modelList.map((model, index) => (
            <Line
              type="monotone"
              dataKey={model}
              stroke={CHART_COLORS[index]}
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default OperationRateChart;

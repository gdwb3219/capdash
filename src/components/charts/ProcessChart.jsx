import React, { useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import _ from "lodash";

// 1. 차트 컴포넌트 (Props로 전체 rawData를 받습니다)
function ProcessChart({ rawData }) {
  // 2. 데이터 가공 (수만 행의 데이터를 월별로 합산)
  // useMemo를 써서 렌더링 될 때마다 불필요한 연산을 방지합니다.
  const chartData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    // (1) 월(MONTH) 별로 그룹화
    const grouped = _.groupBy(rawData, "MONTH");

    // (2) 그룹별 합계 및 평균 계산
    const processed = Object.keys(grouped).map((monthKey) => {
      const groupList = grouped[monthKey];

      // 해당 월의 데이터 합산
      const totalOper = _.sumBy(groupList, "OPER_MONTH"); // 가동 시간 합계
      const totalLoss = _.sumBy(groupList, "LOSS_MONTH"); // 손실 시간 합계

      // 수율(SUB_YIELD)은 평균을 내야 함 (퍼센트니까)
      const avgYield = _.meanBy(groupList, "SUB_YIELD") * 100; // 0.99 -> 99% 변환

      return {
        name: monthKey, // X축 라벨 (202501)
        oper: Math.round(totalOper),
        loss: Math.round(totalLoss),
        yield: parseFloat(avgYield.toFixed(2)), // 소수점 2자리
      };
    });

    // (3) 월 순서대로 정렬
    return _.sortBy(processed, "name");
  }, [rawData]);

  // 3. 렌더링
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        height: "400px",
        width: "100%",
      }}
    >
      <h3 style={{ margin: "0 0 20px 0", color: "#333", fontSize: "18px" }}>
        📊 월별 가동(Oper) vs 손실(Loss) 및 수율 추이
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid stroke="#f5f5f5" vertical={false} />

          {/* X축: 월 */}
          <XAxis
            dataKey="name"
            scale="band"
            tick={{ fill: "#888", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />

          {/* Y축 (왼쪽): 시간(Time) */}
          <YAxis
            yAxisId="left"
            label={{
              value: "시간 (Hrs)",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#888" },
            }}
            tick={{ fill: "#888", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />

          {/* Y축 (오른쪽): 수율(%) */}
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[90, 100]} // 수율은 보통 90~100% 사이에서 움직이므로 범위를 지정
            unit="%"
            tick={{ fill: "#82ca9d", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "10px" }} />

          {/* 막대 그래프 1: 가동 시간 (보라색 계열) */}
          <Bar
            yAxisId="left"
            dataKey="oper"
            name="가동 시간"
            barSize={30}
            fill="#6f42c1"
            radius={[5, 5, 0, 0]}
          />

          {/* 막대 그래프 2: 손실 시간 (붉은색 계열) */}
          <Bar
            yAxisId="left"
            dataKey="loss"
            name="손실 시간"
            barSize={30}
            fill="#ff7f7f"
            radius={[5, 5, 0, 0]}
          />

          {/* 선 그래프: 수율 (초록색 계열) */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="yield"
            name="수율(Yield)"
            stroke="#82ca9d"
            strokeWidth={3}
            dot={{ r: 4, fill: "#82ca9d", stroke: "white", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProcessChart;

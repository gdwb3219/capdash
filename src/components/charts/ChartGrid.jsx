import React, { useMemo } from "react";
import _ from "lodash";
import ChartCard from "./ChardCard";

// 보여줄 Factor 목록 정의 (원하는 순서대로)
const FACTOR_LIST = [
  { key: "OPER_MONTH", color: "#4CAF50" }, // 초록색 (효율)
  { key: "NOWIP_MONTH", color: "#2196F3" }, // 파란색 (재공)
  { key: "LOSS_MONTH", color: "#F44336" }, // 빨간색 (손실)
  { key: "LINR", color: "#9C27B0" }, // 보라색 (가동)
];

const ChartGrid = ({ rawData }) => {
  // 1. 데이터 가공 (OPER 별로 그룹화 + MONTH 오름차순 정렬)
  const groupedData = useMemo(() => {
    if (!rawData || rawData.length === 0) return {};

    // (1) OPER 기준으로 그룹핑
    const grouped = _.groupBy(rawData, "OPER");

    // (2) 각 그룹 내부 데이터를 MONTH 순서로 정렬 (차트 X축 순서 보장)
    Object.keys(grouped).forEach((oper) => {
      grouped[oper] = _.sortBy(grouped[oper], "MONTH");
    });

    return grouped;
  }, [rawData]);

  // 데이터에 존재하는 공정(OPER) 목록 추출 (정렬)
  const operList = Object.keys(groupedData).sort();

  if (operList.length === 0) {
    return <div style={{ padding: "20px" }}>데이터가 없습니다.</div>;
  }

  return (
    <div style={{ padding: "20px", backgroundColor: "#f9f9f9" }}>
      <h2 style={{ marginBottom: "30px" }}>🏭 공정별 주요 지표 현황</h2>

      {/* --- [행] OPER 반복 --- */}
      {operList.map((oper) => (
        <div key={oper} style={{ marginBottom: "40px" }}>
          {/* 공정 이름 (Section Title) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
              borderBottom: "2px solid #ddd",
              paddingBottom: "5px",
            }}
          >
            <h3 style={{ margin: 0, marginRight: "10px" }}>{oper}</h3>
            <span style={{ fontSize: "12px", color: "#888" }}>
              Process Area
            </span>
          </div>

          {/* --- [열] FACTOR 반복 (Grid Layout) --- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", // 반응형 그리드
              gap: "20px",
            }}
          >
            {FACTOR_LIST.map((factor) => (
              <ChartCard
                key={`${oper}-${factor.key}`}
                operName={oper}
                factorKey={factor.key}
                data={groupedData[oper]} // 해당 공정의 전체 시계열 데이터 전달
                color={factor.color}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChartGrid;

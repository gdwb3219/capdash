import React from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, Tooltip, ResponsiveContainer, YAxis } from "recharts";

/**
 * @param {string} operName - 공정 이름 (예: FCB)
 * @param {string} factorKey - 데이터 키 (예: EFCY)
 * @param {Array} data - 월별 데이터 배열
 * @param {string} color - 차트 선 색상
 */
const ChartCard = ({ operName, factorKey, data, color = "#8884d8" }) => {
  const navigate = useNavigate();

  // 1. 상세 페이지 이동 핸들러
  const handleClick = () => {
    // 예: /detail/FCB/EFCY 로 이동
    navigate(`/detail/${operName}/${factorKey}`);
  };

  // 2. 최신 값(마지막 달) 추출 (헤더에 보여주기 위함)
  const lastValue = data.length > 0 ? data[data.length - 1][factorKey] : "-";
  // 소수점 정리 (데이터가 숫자인 경우)
  const displayValue =
    typeof lastValue === "number" ? lastValue.toFixed(1) : lastValue;

  return (
    <div
      onClick={handleClick}
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "16px",
        backgroundColor: "#fff",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "transform 0.2s, box-shadow 0.2s",
        minWidth: "200px",
        height: "160px",
        display: "flex",
        flexDirection: "column",
      }}
      // 마우스 올렸을 때 살짝 떠오르는 효과
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
      }}
    >
      {/* 카드 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#555" }}>
          {factorKey}
        </span>
        <span style={{ fontSize: "18px", fontWeight: "bold", color: color }}>
          {displayValue}
        </span>
      </div>

      {/* 미니 차트 영역 */}
      <div style={{ flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            {/* 데이터의 변동폭을 잘 보여주기 위해 Y축 범위를 'auto'로 설정 */}
            <YAxis domain={["auto", "auto"]} hide />
            <Tooltip
              labelStyle={{ fontSize: "12px" }}
              itemStyle={{ fontSize: "12px" }}
              contentStyle={{
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey={factorKey}
              stroke={color}
              strokeWidth={2}
              dot={false} // 깔끔하게 보이기 위해 점 제거 (hover시에만 보임)
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartCard;

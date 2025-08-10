import React, { useMemo, useState } from "react";
import { computeAveragesForSeries, judgeByTarget } from "./Utilities";
import TrafficLight from "./TrafficLight";
import AreaCard from "./AreaCard";
import AreaDetail from "./AreaDetail";
import "../../../styles/components/charts/StatusDashboard/FactoryDashboard.css";
import dummy_data from "../../../data/dummy_data.json";
import target_data from "../../../data/target_data.json";

function FactoryDashboard() {
  const [selectedArea, setSelectedArea] = useState(null);

  // 실제 데이터
  const actuals = dummy_data; // 배열
  const targets = target_data; // 중첩 객체

  const areaSummaries = useMemo(() => {
    if (!actuals.length || !targets) return {};

    const areas = Array.from(new Set(actuals.map((a) => a.AREA)));
    const summary = {};

    areas.forEach((area) => {
      const rows = actuals.filter((r) => r.AREA === area);
      const keys = Array.from(new Set(rows.map((r) => `${r.SITE}||${r.OPER}`)));

      let green = 0,
        yellow = 0,
        red = 0;

      keys.forEach((k) => {
        const [SITE, OPER] = k.split("||");
        const groupRows = rows.filter(
          (rr) => rr.SITE === SITE && rr.OPER === OPER
        );

        // target_data에서 목표값 찾기
        const targetRow = targets?.[area]?.[SITE]?.[OPER] || null;

        if (!targetRow) return; // 목표값 없으면 스킵

        // factor 이름과 매칭 (실제 데이터 컬럼명과 타겟 키를 매핑)
        const factorMapping = {
          OPER: "OPER_MONTH",
          NOWIP: "NOWIP_MONTH",
          LOSS: "LOSS_MONTH",
        };

        Object.entries(factorMapping).forEach(([factorKey, monthKey]) => {
          // 여기서 computeAveragesForSeries를 사용하지 않고,
          // 단순 평균 계산 (기간 평균이 아니라면)
          const avg =
            groupRows.reduce((sum, row) => sum + row[monthKey], 0) /
            groupRows.length;

          // 목표값 가져오기
          const targetValue = targetRow[`${factorKey}_TARGET`];

          const judgement = judgeByTarget(avg, avg, targetValue);

          if (judgement.color === "green") green++;
          else if (judgement.color === "yellow") yellow++;
          else if (judgement.color === "red") red++;
        });
      });

      summary[area] = { green, yellow, red };
    });

    return summary;
  }, [actuals, targets]);

  if (selectedArea) {
    return (
      <div className="page">
        <AreaDetail
          area={selectedArea}
          targets={targets}
          actuals={actuals}
          onBack={() => setSelectedArea(null)}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <h1>공장 가동률 대시보드</h1>
      <div className="summary-grid">
        {Object.keys(areaSummaries).map((area) => (
          <AreaCard
            key={area}
            area={area}
            counts={areaSummaries[area]}
            onClick={setSelectedArea}
          />
        ))}
      </div>

      <section className="legend">
        <h3>신호등 설명</h3>
        <div className="legend-row">
          <TrafficLight color="green" /> 양호 (평균이 목표 이상)
        </div>
        <div className="legend-row">
          <TrafficLight color="yellow" /> 주의 (일부만 미달)
        </div>
        <div className="legend-row">
          <TrafficLight color="red" /> 위험 (모두 미달)
        </div>
      </section>
    </div>
  );
}

export default FactoryDashboard;

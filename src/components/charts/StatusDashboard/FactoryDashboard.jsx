import React, { useEffect, useMemo, useState } from "react";
import fetchTargets from "./fetchTargets";
import fetchActuals from "./fetchActuals";
import { computeAveragesForSeries, judgeByTarget } from "./Utilities";
import TrafficLight from "./TrafficLight";
import AreaCard from "./AreaCard";
import AreaDetail from "./AreaDetail";
import "../../../styles/components/charts/StatusDashboard/FactoryDashboard.css";

function FactoryDashboard() {
  const [targets, setTargets] = useState([]);
  const [actuals, setActuals] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [t, a] = await Promise.all([fetchTargets(), fetchActuals()]);
      setTargets(t);
      setActuals(a);
      setLoading(false);
    }
    load();
  }, []);

  const areaSummaries = useMemo(() => {
    if (!actuals.length || !targets.length) return {};

    const areas = Array.from(new Set(actuals.map((a) => a.Area)));
    const summary = {};

    areas.forEach((area) => {
      // For each Site/Oper under this area, evaluate the 3 factors and count lights
      const rows = actuals.filter((r) => r.Area === area);
      const keys = Array.from(new Set(rows.map((r) => `${r.Site}||${r.Oper}`)));
      let green = 0,
        yellow = 0,
        red = 0;

      keys.forEach((k) => {
        const [Site, Oper] = k.split("||");
        const groupRows = rows.filter(
          (rr) => rr.Site === Site && rr.Oper === Oper
        );
        const targetRow = targets.find(
          (t) => t.Area === area && t.Site === Site && t.Oper === Oper
        );
        ["factor1", "factor2", "factor3"].forEach((fk) => {
          const { avg3, avg6 } = computeAveragesForSeries(groupRows, fk);
          if (!targetRow) return; // skip if no target
          const judgement = judgeByTarget(avg3, avg6, targetRow[fk]);
          if (judgement.color === "green") green++;
          else if (judgement.color === "yellow") yellow++;
          else if (judgement.color === "red") red++;
        });
      });

      summary[area] = { green, yellow, red };
    });

    return summary;
  }, [actuals, targets]);

  if (loading) return <div className="loading">로딩 중...</div>;

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
          <TrafficLight color="green" /> 양호 (3,6개월 평균 모두 목표 이상)
        </div>
        <div className="legend-row">
          <TrafficLight color="yellow" /> 주의 (하나만 미달)
        </div>
        <div className="legend-row">
          <TrafficLight color="red" /> 위험 (3,6개월 모두 미달)
        </div>
      </section>
    </div>
  );
}

export default FactoryDashboard;

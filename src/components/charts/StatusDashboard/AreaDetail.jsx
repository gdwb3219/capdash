import { useMemo } from "react";
import { computeAveragesForSeries, judgeByTarget } from "./Utilities";
import GridTable from "./GridTable";

function AreaDetail({ area, targets, actuals, onBack }) {
  // Build grid grouped by Site and Oper
  const siteOperGroups = useMemo(() => {
    const rows = actuals.filter((a) => a.Area === area);
    const keys = Array.from(new Set(rows.map((r) => `${r.Site}||${r.Oper}`)));
    return keys.map((k) => {
      const [Site, Oper] = k.split("||");
      const groupRows = rows.filter((r) => r.Site === Site && r.Oper === Oper);
      const targetRow = targets.find(
        (t) => t.Area === area && t.Site === Site && t.Oper === Oper
      );
      return { Site, Oper, groupRows, targetRow };
    });
  }, [area, targets, actuals]);

  return (
    <div className="detail">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>
      <h2>Area {area} 상세</h2>

      {siteOperGroups.map((g, i) => {
        const factors = ["factor1", "factor2", "factor3"];
        const rows = factors.map((fk) => {
          const label = fk;
          const target = g.targetRow ? g.targetRow[fk] : null;
          const { latest, avg3, avg6 } = computeAveragesForSeries(
            g.groupRows,
            fk
          );
          const judgement =
            target != null
              ? judgeByTarget(avg3, avg6, target)
              : { color: "gray", label: "목표값 없음" };
          return {
            factorKey: fk,
            factorLabel: label,
            target,
            latest,
            avg3,
            avg6,
            judgement,
          };
        });

        return (
          <div className="site-oper-card" key={i}>
            <h3>
              {g.Site} / {g.Oper}
            </h3>
            <GridTable rows={rows} />
          </div>
        );
      })}
    </div>
  );
}

export default AreaDetail;

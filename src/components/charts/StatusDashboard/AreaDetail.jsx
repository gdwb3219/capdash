import React, { useMemo } from "react";
import TrafficLight from "./TrafficLight";
import { judgeByTarget } from "./Utilities";
import "../../../styles/components/charts/StatusDashboard/FactoryDashboard.css";

// AreaDetail.jsx
// - 실제 'dummy_data' (actuals)와 'target_data' 구조에 맞춰 동작하도록 수정한 컴포넌트입니다.
// - 주요 변경점:
//   1) actuals는 장비(EQP_ID) 단위 월별 집계(TWH_MONTH, OPER_MONTH 등)를 포함하므로,
//      같은 MONTH 내에서는 장비별 합계를 먼저 구한 뒤 비율(OPER/TWH 등)을 계산합니다.
//   2) MONTH 포맷이 'YYYYMM' 또는 숫자(예: 202501)인 경우에도 정렬/처리 가능합니다.
//   3) target_data는 중첩 객체(targets[AREA][SITE][OPER]) 형식이므로 그에 맞춰 접근합니다.
//   4) legacy(예전) 형태인 targets 배열도 지원하도록 유연하게 처리합니다.

function GridTable({ rows }) {
  // rows: [{ factorLabel, target, latest, avg3, avg6, judgement }]
  const fmt = (v) => (v == null ? "-" : (v * 100).toFixed(2) + "%");

  return (
    <table className='grid-table'>
      <thead>
        <tr>
          <th>Factor</th>
          <th>Target</th>
          <th>Latest</th>
          <th>3M Avg</th>
          <th>6M Avg</th>
          <th>판단</th>
          <th>신호등</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.factorLabel}</td>
            <td>
              {r.target != null ? (r.target * 100).toFixed(2) + "%" : "-"}
            </td>
            <td>{fmt(r.latest)}</td>
            <td>{fmt(r.avg3)}</td>
            <td>{fmt(r.avg6)}</td>
            <td>
              {r.judgement?.label ??
                (r.target == null ? "목표값 없음" : "데이터 부족")}
            </td>
            <td>
              <TrafficLight color={r.judgement?.color ?? "gray"} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AreaDetail({ area, targets, actuals, onBack }) {
  // 안전한 필드 접근 헬퍼 - 다양한 케이스(대문자/소문자)를 모두 지원
  const field = (row, key) =>
    row?.[key] ?? row?.[key.toUpperCase()] ?? row?.[key.toLowerCase()];

  // siteOperGroups: [{ Site, Oper, groupRows, monthlyAggregates, targetRow, latest, avg3, avg6 }]
  const siteOperGroups = useMemo(() => {
    if (!actuals || !actuals.length) return [];

    // 1) area에 해당하는 행 필터링
    const rows = actuals.filter(
      (a) => field(a, "AREA") === area || field(a, "Area") === area
    );

    // 2) SITE||OPER 키 생성
    const keys = Array.from(
      new Set(rows.map((r) => `${field(r, "SITE")}||${field(r, "OPER")}`))
    );

    return keys.map((k) => {
      const [Site, Oper] = k.split("||");
      const groupRows = rows.filter(
        (r) => field(r, "SITE") === Site && field(r, "OPER") === Oper
      );

      // 3) 같은 MONTH 내 장비 합계(집계)
      const monthMap = {}; // { MONTH: { twh, oper, nowip, loss } }
      groupRows.forEach((r) => {
        const m = String(field(r, "MONTH") ?? field(r, "Month") ?? "");
        if (!m) return; // MONTH 정보 없으면 skip

        const twh =
          Number(field(r, "TWH_MONTH") ?? field(r, "twh_month") ?? 0) || 0;
        const oper =
          Number(field(r, "OPER_MONTH") ?? field(r, "oper_month") ?? 0) || 0;
        const nowip =
          Number(field(r, "NOWIP_MONTH") ?? field(r, "nowip_month") ?? 0) || 0;
        const loss =
          Number(field(r, "LOSS_MONTH") ?? field(r, "loss_month") ?? 0) || 0;

        if (!monthMap[m]) monthMap[m] = { twh: 0, oper: 0, nowip: 0, loss: 0 };
        monthMap[m].twh += twh;
        monthMap[m].oper += oper;
        monthMap[m].nowip += nowip;
        monthMap[m].loss += loss;
      });

      // 4) 월별 비율 계산 및 최신-3m-6m 통계
      const months = Object.keys(monthMap).sort((a, b) => b.localeCompare(a)); // 문자열 'YYYYMM' 형식이면 정렬 가능
      const ratios = months.map((m) => {
        const mm = monthMap[m];
        return {
          month: m,
          oper: mm.twh > 0 ? mm.oper / mm.twh : null,
          nowip: mm.twh > 0 ? mm.nowip / mm.twh : null,
          loss: mm.twh > 0 ? mm.loss / mm.twh : null,
        };
      });

      const latest = ratios[0] ?? { oper: null, nowip: null, loss: null };

      const avgN = (arr, key, n) => {
        const vals = arr
          .slice(0, n)
          .map((x) => x[key])
          .filter((v) => v != null);
        if (!vals.length) return null;
        return vals.reduce((s, v) => s + v, 0) / vals.length;
      };

      const avg3 = {
        oper: avgN(ratios, "oper", 3),
        nowip: avgN(ratios, "nowip", 3),
        loss: avgN(ratios, "loss", 3),
      };
      const avg6 = {
        oper: avgN(ratios, "oper", 6),
        nowip: avgN(ratios, "nowip", 6),
        loss: avgN(ratios, "loss", 6),
      };

      // 5) 목표값 조회 - nested object (targets[AREA][SITE][OPER]) 혹은 legacy array 처리
      let targetRow = null;
      if (Array.isArray(targets)) {
        targetRow = targets.find(
          (t) =>
            (t.Area ?? t.AREA ?? t.area) === area &&
            (t.Site ?? t.SITE ?? t.site) === Site &&
            (t.Oper ?? t.OPER ?? t.oper) === Oper
        );
      } else if (typeof targets === "object" && targets != null) {
        // targets may be structured as targets[AREA][SITE][OPER]
        targetRow = targets?.[area]?.[Site]?.[Oper] ?? null;
      }

      return { Site, Oper, groupRows, monthMap, latest, avg3, avg6, targetRow };
    });
  }, [area, actuals, targets]);

  // 렌더
  return (
    <div className='detail'>
      <button className='back-btn' onClick={onBack}>
        ← Back
      </button>
      <h2>Area {area} 상세</h2>

      {siteOperGroups.map((g, idx) => {
        const factors = [
          { key: "oper", label: "OPER", targetKey: "OPER_TARGET" },
          { key: "nowip", label: "NOWIP", targetKey: "NOWIP_TARGET" },
          { key: "loss", label: "LOSS", targetKey: "LOSS_TARGET" },
        ];

        const rows = factors.map((f) => {
          const target = g.targetRow ? g.targetRow[f.targetKey] : null;
          const latest = g.latest ? g.latest[f.key] : null;
          const avg3 = g.avg3 ? g.avg3[f.key] : null;
          const avg6 = g.avg6 ? g.avg6[f.key] : null;
          const judgement =
            target != null
              ? judgeByTarget(avg3, avg6, target)
              : { color: "gray", label: "목표값 없음" };
          return {
            factorKey: f.key,
            factorLabel: f.label,
            target,
            latest,
            avg3,
            avg6,
            judgement,
          };
        });

        return (
          <div className='site-oper-card' key={idx}>
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

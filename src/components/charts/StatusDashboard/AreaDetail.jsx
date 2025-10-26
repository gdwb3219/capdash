import React, { useMemo, useState } from "react";
import TrafficLight from "./TrafficLight";
import {
  avgN,
  getAverage,
  getLatestValue,
  judgeByTarget,
  sortDataByMonthDesc,
} from "./Utilities";
import GridTable from "./GridTable"; // GridTable을 별도 컴포넌트로 import
import "../../../styles/components/charts/StatusDashboard/FactoryDashboard.css";
import operdata from "../../../data/OPER_DATA.json";
import OPER_FACTOR_MAP from "../../../data/operConfig";

export default function AreaDetail({ area, targets, actuals, onBack }) {
  // 필터 상태 관리
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'red', 'yellow', 'green'
  // 안전한 필드 접근 헬퍼 - 다양한 케이스(대문자/소문자)를 모두 지원
  const field = (row, key) =>
    row?.[key] ?? row?.[key.toUpperCase()] ?? row?.[key.toLowerCase()];

  // ######################################################################
  // ######################################################################
  // ## DATA 가공 TEST ####################################################
  // ######################################################################
  // ######################################################################
  const selectedSite = "IC";
  const rawData = operdata;
  console.log(rawData, selectedSite, "rawData");

  const transformDataForSite = (rawData, selectedSite) => {
    // 1. 선택된 SITE의 데이터만 필터링
    const siteData = rawData.filter(
      (row) => row.AREA === area && row.SITE === selectedSite
    );

    // 2. SITE 데이터를 OPER별로 그룹화
    // 결과 예: { 'EPM': [ {MONTH: '202501', ...}, {MONTH: '202502', ...} ], 'TEST': [...] }
    const groupedByOper = siteData.reduce((acc, row) => {
      const oper = row.OPER;
      if (!acc[oper]) acc[oper] = [];
      acc[oper].push(row);
      return acc;
    }, {});

    console.log("siteData", siteData, "groupedByOper", groupedByOper);

    // 3. 그룹화된 데이터를 순회하며 통계 계산
    const finalStructuredData = [];

    for (const operName in groupedByOper) {
      // operName = 'EPM', 'B/G' 등등
      // config 자체가 factor name
      const factorList = OPER_FACTOR_MAP[area][selectedSite][operName];
      const config = OPER_FACTOR_MAP[operName] || OPER_FACTOR_MAP["DEFAULT"];
      const monthlyData = groupedByOper[operName]; // 이 OPER의 월별 데이터 배열
      console.log(
        "factorList",
        factorList,
        "config",
        config,
        "monthlyData",
        monthlyData
      );
      // 4. 통계 계산 전, 데이터를 최신순으로 정렬 (가장 중요)
      const sortedMonthlyData = sortDataByMonthDesc(monthlyData);
      console.log("sortedMonthlyData", sortedMonthlyData);

      // 5. 설정된 Factor들에 대해 통계 계산
      const stats = {};
      for (const factor of factorList) {
        stats[factor] = {
          latest: getLatestValue(sortedMonthlyData, factor),
          avg3m: getAverage(sortedMonthlyData, factor, 3),
          avg6m: getAverage(sortedMonthlyData, factor, 6),
        };
      }

      // 6. 최종 렌더링용 객체 생성
      finalStructuredData.push({
        operName: operName,
        factors: factorList, // 테이블의 행(row)을 그릴 때 사용
        stats: stats, // 계산된 통계 데이터
      });
    }

    return finalStructuredData;
  };
  const structuredData = transformDataForSite(rawData, selectedSite);
  console.log("structuredData", structuredData);

  // ######################################################################
  // ######################################################################
  // ######################################################################
  // ######################################################################
  // ######################################################################
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

  // 필터링된 그룹 계산
  const filteredGroups = useMemo(() => {
    if (statusFilter === "all") {
      return siteOperGroups;
    }

    return siteOperGroups.filter((group) => {
      const factors = [
        { key: "oper", label: "OPER", targetKey: "OPER_TARGET" },
        { key: "nowip", label: "NOWIP", targetKey: "NOWIP_TARGET" },
        { key: "loss", label: "LOSS", targetKey: "LOSS_TARGET" },
      ];

      // 그룹 내의 factor들 중 하나라도 해당 색상이 있으면 표시
      return factors.some((f) => {
        const target = group.targetRow ? group.targetRow[f.targetKey] : null;
        const avg3 = group.avg3 ? group.avg3[f.key] : null;
        const avg6 = group.avg6 ? group.avg6[f.key] : null;
        const judgement =
          target != null
            ? judgeByTarget(avg3, avg6, target)
            : { color: "gray", label: "목표값 없음" };

        return judgement.color === statusFilter;
      });
    });
  }, [siteOperGroups, statusFilter]);

  // 통계 계산
  const stats = useMemo(() => {
    let totalFactors = 0;
    let redCount = 0;
    let yellowCount = 0;
    let greenCount = 0;
    let grayCount = 0;

    siteOperGroups.forEach((group) => {
      const factors = [
        { key: "oper", label: "OPER", targetKey: "OPER_TARGET" },
        { key: "nowip", label: "NOWIP", targetKey: "NOWIP_TARGET" },
        { key: "loss", label: "LOSS", targetKey: "LOSS_TARGET" },
      ];

      factors.forEach((f) => {
        totalFactors++;
        const target = group.targetRow ? group.targetRow[f.targetKey] : null;
        const avg3 = group.avg3 ? group.avg3[f.key] : null;
        const avg6 = group.avg6 ? group.avg6[f.key] : null;
        const judgement =
          target != null
            ? judgeByTarget(avg3, avg6, target)
            : { color: "gray", label: "목표값 없음" };

        switch (judgement.color) {
          case "red":
            redCount++;
            break;
          case "yellow":
            yellowCount++;
            break;
          case "green":
            greenCount++;
            break;
          default:
            grayCount++;
            break;
        }
      });
    });

    return { totalFactors, redCount, yellowCount, greenCount, grayCount };
  }, [siteOperGroups]);

  // 렌더
  return (
    <div className='detail'>
      <div className='detail-header'>
        <button className='back-btn' onClick={onBack}>
          ← Back
        </button>
        <h2>Area {area} 상세</h2>

        {/* 통계 및 필터 영역 */}
        <div className='filter-section'>
          <div className='status-stats'>
            <div className='stat-item'>
              <span className='stat-label'>전체:</span>
              <span className='stat-count'>{stats.totalFactors}</span>
            </div>
            <div className='stat-item red'>
              <TrafficLight color='red' size='small' />
              <span className='stat-count'>{stats.redCount}</span>
            </div>
            <div className='stat-item yellow'>
              <TrafficLight color='yellow' size='small' />
              <span className='stat-count'>{stats.yellowCount}</span>
            </div>
            <div className='stat-item green'>
              <TrafficLight color='green' size='small' />
              <span className='stat-count'>{stats.greenCount}</span>
            </div>
            {stats.grayCount > 0 && (
              <div className='stat-item gray'>
                <TrafficLight color='gray' size='small' />
                <span className='stat-count'>{stats.grayCount}</span>
              </div>
            )}
          </div>

          {/* 필터 버튼 */}
          <div className='filter-buttons'>
            <button
              className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              전체 ({filteredGroups.length})
            </button>
            <button
              className={`filter-btn red ${
                statusFilter === "red" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("red")}
              disabled={stats.redCount === 0}
            >
              🔴 문제 ({stats.redCount})
            </button>
            <button
              className={`filter-btn yellow ${
                statusFilter === "yellow" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("yellow")}
              disabled={stats.yellowCount === 0}
            >
              🟡 경고 ({stats.yellowCount})
            </button>
            <button
              className={`filter-btn green ${
                statusFilter === "green" ? "active" : ""
              }`}
              onClick={() => setStatusFilter("green")}
              disabled={stats.greenCount === 0}
            >
              🟢 정상 ({stats.greenCount})
            </button>
          </div>
        </div>
      </div>

      {/* 필터링 결과 표시 */}
      <div className='results-info'>
        <span className='results-text'>
          {statusFilter === "all"
            ? `전체 ${siteOperGroups.length}개 그룹 표시 중`
            : `${filteredGroups.length}개 그룹 필터링 됨 (${
                statusFilter === "red"
                  ? "문제"
                  : statusFilter === "yellow"
                  ? "경고"
                  : "정상"
              } 상태)`}
        </span>
      </div>

      {/* 그룹 목록 */}
      <div className='site-oper-groups'>
        {filteredGroups.length === 0 ? (
          <div className='no-results'>
            <p>해당 조건에 맞는 항목이 없습니다.</p>
          </div>
        ) : (
          filteredGroups.map((g, idx) => {
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
              <div
                className='site-oper-card'
                key={`${g.Site}-${g.Oper}-${idx}`}
              >
                <h3>
                  {g.Site} / {g.Oper}
                </h3>
                {/* GridTable에 site, oper 정보 전달 */}
                <GridTable rows={rows} site={g.Site} oper={g.Oper} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import IssueFormModal from "./IssueForm/IssueFormModal";
import TrafficLight from "./TrafficLight";

function GridTable({ rows, site, oper }) {
  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // 신호등 클릭 핸들러
  const handleTrafficLightClick = (row) => {
    // 문제가 있는 경우에만 모달을 열도록 (빨강, 노랑)
    if (row.judgement.color === "red" || row.judgement.color === "yellow") {
      setSelectedIssue({
        equipmentId: `${site}_${oper}_${row.factorKey}`, // 고유 식별자 생성
        status: row.judgement.color,
        factorLabel: row.factorLabel,
        site: site,
        oper: oper,
        target: row.target,
        latest: row.latest,
        avg3: row.avg3,
        avg6: row.avg6,
      });
      setIsModalOpen(true);
    }
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIssue(null);
  };

  const fmt = (v) => (v == null ? "-" : (v * 100).toFixed(2) + "%");

  return (
    <>
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
          {rows.map((r, idx) => (
            <tr
              key={idx}
              className={`table-row ${
                r.judgement.color !== "green" ? "clickable-row" : ""
              }`}
            >
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
                <div
                  className={`traffic-light-container ${
                    r.judgement.color === "red" ||
                    r.judgement.color === "yellow"
                      ? "clickable"
                      : ""
                  }`}
                  onClick={() => handleTrafficLightClick(r)}
                  title={
                    r.judgement.color === "red" ||
                    r.judgement.color === "yellow"
                      ? "클릭하여 이슈 사유 입력"
                      : ""
                  }
                >
                  <TrafficLight color={r.judgement?.color ?? "gray"} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 이슈 입력 모달 */}
      {isModalOpen && selectedIssue && (
        <IssueFormModal
          equipmentId={selectedIssue.equipmentId}
          status={selectedIssue.status}
          onClose={handleCloseModal}
          additionalInfo={{
            site: selectedIssue.site,
            oper: selectedIssue.oper,
            factor: selectedIssue.factorLabel,
            target: selectedIssue.target,
            latest: selectedIssue.latest,
            avg3: selectedIssue.avg3,
            avg6: selectedIssue.avg6,
          }}
        />
      )}
    </>
  );
}

export default GridTable;

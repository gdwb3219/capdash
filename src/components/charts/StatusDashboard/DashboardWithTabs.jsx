import React, { useState, useMemo } from "react";
import GridTable from "./GridTable"; // 기존 GridTable 컴포넌트

function DashboardWithTabs({ groupedData }) {
  // Site별로 데이터 그룹화
  const siteGroups = useMemo(() => {
    const groups = {};
    groupedData.forEach((g) => {
      if (!groups[g.Site]) {
        groups[g.Site] = [];
      }
      groups[g.Site].push(g);
    });
    return groups;
  }, [groupedData]);

  const siteNames = Object.keys(siteGroups);
  const [activeTab, setActiveTab] = useState(siteNames[0] || "");

  if (siteNames.length === 0) {
    return <div>데이터가 없습니다.</div>;
  }

  return (
    <div className="dashboard-container">
      {/* 탭 헤더 */}
      <div className="tab-header">
        {siteNames.map((siteName) => (
          <button
            key={siteName}
            className={`tab-button ${activeTab === siteName ? "active" : ""}`}
            onClick={() => setActiveTab(siteName)}
          >
            {siteName}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="tab-content">
        {activeTab && siteGroups[activeTab] && (
          <div className="site-operations">
            {siteGroups[activeTab].map((g, idx) => {
              // rows는 기존 로직에 따라 g에서 추출된다고 가정
              const rows = g.data || []; // 실제 데이터 구조에 맞게 조정 필요

              return (
                <div className="oper-card" key={idx}>
                  <h3>{g.Oper}</h3>
                  <GridTable rows={rows} site={g.Site} oper={g.Oper} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .dashboard-container {
          width: 100%;
        }

        .tab-header {
          display: flex;
          border-bottom: 2px solid #e0e0e0;
          margin-bottom: 20px;
          overflow-x: auto;
        }

        .tab-button {
          padding: 12px 24px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          color: #666;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .tab-button:hover {
          color: #333;
          background-color: #f5f5f5;
        }

        .tab-button.active {
          color: #2563eb;
          border-bottom-color: #2563eb;
          background-color: #eff6ff;
        }

        .tab-content {
          min-height: 400px;
        }

        .site-operations {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .oper-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .oper-card h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 18px;
          font-weight: 600;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
        }
      `}</style>
    </div>
  );
}

export default DashboardWithTabs;

import { useEffect, useState } from "react";
import MongoDataView from "../components/charts/MongoDataView";
import ChartGrid from "../components/charts/ChartGrid";

function DashboardPage2() {
  // 1. 상태 관리 (데이터, 로딩상태, 에러)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. 컴포넌트 마운트 시 데이터 Fetch (useEffect)
  useEffect(() => {
    // 비동기 함수 정의
    const fetchData = async () => {
      try {
        // Django API 주소 (작성해주신 포트 8080 기준)
        const response = await fetch("http://127.0.0.1:8080/api/mongo-data/");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result); // 상태 업데이트
      } catch (e) {
        setError(e.message);
        console.error("Fetching error:", e);
      } finally {
        setLoading(false); // 로딩 완료
      }
    };

    fetchData();
  }, []); // [] 의존성 배열: 컴포넌트가 처음 뜰 때 1번만 실행됨

  // 3. 조건부 렌더링
  if (loading) return <div>⏳ 데이터를 불러오는 중입니다...</div>;
  if (error) return <div style={{ color: "red" }}>⚠️ 에러 발생: {error}</div>;
  return (
    <div className="dashboard-container">
      <div className="mongo-container">{/* <MongoDataView /> */}</div>
      <div>
        <ChartGrid rawData={data} />
      </div>
    </div>
  );
}

export default DashboardPage2;

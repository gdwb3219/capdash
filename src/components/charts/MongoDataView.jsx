import React, { useState, useEffect } from "react";
import ProcessChart from "./ProcessChart";

const MongoDataView = () => {
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

  // 4. 데이터 렌더링 (화면 출력)
  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 MongoDB 데이터 목록 (PKG_dummy_data)</h2>
      <ProcessChart rawData={data} />
      <p>총 {data.length}개의 데이터가 조회되었습니다.</p>

      {/* 간단한 리스트 스타일 */}
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {data.map((item) => (
          <li
            key={item._id}
            style={{
              border: "1px solid #ddd",
              margin: "10px 0",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {/* item._id는 위에서 String으로 변환했으므로 안전하게 key로 사용 가능 */}
            <strong>ID:</strong> {item._id} <br />
            {/* 실제 데이터 필드에 맞춰서 아래 내용을 수정하세요 */}
            {/* 예: <span>Model: {item.model_name}</span> */}
            <details>
              <summary>전체 데이터 보기 (JSON)</summary>
              <pre style={{ backgroundColor: "#f4f4f4", padding: "10px" }}>
                {JSON.stringify(item, null, 2)}
              </pre>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MongoDataView;

import { useEffect, useState } from "react";
import FactoryDashboard from "../components/charts/StatusDashboard/FactoryDashboard";
import LINR_cal from "../components/commons/LINR_cal";

function AboutPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://127.0.0.1:8080/api/mongo-data/')
    .then(response =>{
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(fetchedData => {
      setData(fetchedData);
      setLoading(false)
    })
    .catch(error => {
      console.error("Fetching error: ", error);
      setLoading(false);
    });
  }, [])
  
  console.log("Data", data)
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>소개 페이지</h1>
      <p>이곳은 저희 서비스를 소개하는 페이지입니다.</p>
      <div className="factory-dashboard-container">
        <LINR_cal />
      </div>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
}

export default AboutPage;

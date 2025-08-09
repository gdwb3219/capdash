import FactoryDashboard from "../components/charts/StatusDashboard/FactoryDashboard";

function AboutPage() {
  return (
    <div>
      <h1>소개 페이지</h1>
      <p>이곳은 저희 서비스를 소개하는 페이지입니다.</p>
      <div className="factory-dashboard-container">
        <FactoryDashboard />
      </div>
    </div>
  );
}

export default AboutPage;

import { useState } from 'react';
import OperationRateChart from '../components/charts/OperationRateChart';
import data1 from '../data/dummyData.json';
import EquipmentScatterChart from '../components/charts/EquipmentScatterChart.jsx';

function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(null);

  const handleDataPointClick = (month) => {
    setSelectedMonth(month);
  };
  return (
    <div className="dashboard-container">
      <OperationRateChart
        data={data1}
        onDataPointClick={handleDataPointClick}
      />
      <EquipmentScatterChart data={data1} selectedMonth={selectedMonth} />
    </div>
  );
}

export default DashboardPage;

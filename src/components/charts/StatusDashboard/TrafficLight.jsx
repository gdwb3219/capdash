import "../../../styles/components/charts/StatusDashboard/TrafficLight.css";

function TrafficLight({ color }) {
  // color: 'green' | 'yellow' | 'red' | 'gray'
  return <span className={`tl-circle ${color}`} aria-hidden="true"></span>;
}

export default TrafficLight;

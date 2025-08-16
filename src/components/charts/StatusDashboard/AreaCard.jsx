import TrafficLight from "./TrafficLight";
import "../../../styles/components/charts/StatusDashboard/AreaCard.css";

function AreaCard({ area, counts, onClick }) {
  // counts = { green: n, yellow: n, red: n }
  return (
    <div
      className='area-card'
      onClick={() => onClick(area)}
      role='button'
      tabIndex={0}
    >
      <div className='area-card-header'>Area {area}</div>
      <div className='area-card-body'>
        <div className='tl-row'>
          <TrafficLight color='green' />
          <span>{counts.green}</span>
        </div>
        <div className='tl-row'>
          <TrafficLight color='yellow' />
          <span>{counts.yellow}</span>
        </div>
        <div className='tl-row'>
          <TrafficLight color='red' />
          <span>{counts.red}</span>
        </div>
      </div>
    </div>
  );
}

export default AreaCard;

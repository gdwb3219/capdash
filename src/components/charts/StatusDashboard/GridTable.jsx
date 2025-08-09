import TrafficLight from "./TrafficLight";

function GridTable({ rows }) {
  // rows: array of { factorKey, factorLabel, target, latest, avg3, avg6, judgement }
  return (
    <table className="grid-table">
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
          <tr key={idx}>
            <td>{r.factorLabel}</td>
            <td>{r.target != null ? r.target : "-"}</td>
            <td>{r.latest != null ? r.latest.toFixed(2) : "-"}</td>
            <td>{r.avg3 != null ? r.avg3.toFixed(2) : "-"}</td>
            <td>{r.avg6 != null ? r.avg6.toFixed(2) : "-"}</td>
            <td>{r.judgement.label}</td>
            <td>
              <TrafficLight color={r.judgement.color} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default GridTable;

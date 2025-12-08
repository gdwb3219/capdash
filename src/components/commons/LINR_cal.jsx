import { monthTarget, daily_move } from "./memo";

function LINR_cal() {
  const processes = [
    {
      name: "공정A",
      monthlyTarget: 3000,
      dailyActuals: [100, 120, 95, 110, 100, 105, 90],
    },
    {
      name: "공정B",
      monthlyTarget: 6000,
      dailyActuals: [200, 190, 210, 180, 200, 195, 205],
    },
  ];
  function calculateLinearity(processes, method = "total") {
    // -------------------------
    // 공정별 Linearity 계산 함수
    function calculateMonthlyLinearity(dailyActuals, monthlyTarget) {
      const daysInMonth = dailyActuals.length;
      const dailyTarget = monthlyTarget / daysInMonth;

      let cumulativeActual = 0;
      let linearitySum = 0;

      for (let day = 0; day < daysInMonth; day++) {
        cumulativeActual += dailyActuals[day];
        const cumulativeTarget = dailyTarget * (day + 1);

        let dailyLinearity =
          cumulativeActual < cumulativeTarget
            ? cumulativeActual / cumulativeTarget
            : 1;

        linearitySum += dailyLinearity;
      }

      return linearitySum / daysInMonth;
    }

    // -------------------------
    if (method === "average") {
      // (① 공정별 Linearity → 평균)
      const linearities = processes.map((p) =>
        calculateMonthlyLinearity(p.dailyActuals, p.monthlyTarget)
      );
      return linearities.reduce((a, b) => a + b, 0) / linearities.length;
    } else {
      // (② 전체 실적/목표 합산 후 Linearity)
      const daysInMonth = processes[0].dailyActuals.length;

      const totalDailyActuals = Array(daysInMonth).fill(0);
      let totalMonthlyTarget = 0;

      processes.forEach((p) => {
        totalMonthlyTarget += p.monthlyTarget;
        for (let i = 0; i < daysInMonth; i++) {
          totalDailyActuals[i] += p.dailyActuals[i];
        }
      });

      return calculateMonthlyLinearity(totalDailyActuals, totalMonthlyTarget);
    }
  }

  const linr_total = calculateLinearity(processes, "total");
  const linr_avg = calculateLinearity(processes, "average");

  console.log("Linr", linr_total, linr_avg);

  return (
    <>
      <h1>Linearity 계산기</h1>
    </>
  );
}

export default LINR_cal;

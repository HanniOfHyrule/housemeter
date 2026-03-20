import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Measurement, MeasurementType } from "../MeasurementInterface";
import classes from "./UsageChart.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UsageChartProps {
  measurements: Measurement[];
}

interface MonthlyUsage {
  month: string;
  electricity: number;
  water: number;
  gas: number;
}

const UsageChart: React.FC<UsageChartProps> = ({ measurements }) => {
  const chartData = useMemo(() => {
    if (measurements.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Group measurements by type and sort by date
    const measurementsByType = new Map<MeasurementType, Measurement[]>();

    measurements.forEach((measurement) => {
      const type = measurement.type as MeasurementType;
      if (!measurementsByType.has(type)) {
        measurementsByType.set(type, []);
      }
      measurementsByType.get(type)!.push(measurement);
    });

    // Sort measurements by date for each type
    measurementsByType.forEach((measurements) => {
      measurements.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    });

    // Calculate usage differences between consecutive measurements
    const usageByMonth = new Map<
      string,
      { electricity: number; water: number; gas: number }
    >();

    measurementsByType.forEach((typeMeasurements, type) => {
      for (let i = 1; i < typeMeasurements.length; i++) {
        const current = typeMeasurements[i];
        const previous = typeMeasurements[i - 1];

        const currentDate = new Date(current.date);
        // Move one month back since the measurement represents usage from the previous month
        const usageDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        const monthKey = `${usageDate.getFullYear()}-${String(
          usageDate.getMonth() + 1
        ).padStart(2, "0")}`;
        let usage = current.value - previous.value;

        // If usage is negative (counter reset), use the current value as usage
        if (usage < 0) {
          usage = current.value;
        }

        if (!usageByMonth.has(monthKey)) {
          usageByMonth.set(monthKey, { electricity: 0, water: 0, gas: 0 });
        }

        const monthData = usageByMonth.get(monthKey)!;
        if (type === "Electricity") {
          monthData.electricity += usage;
        } else if (type === "Water") {
          monthData.water += usage;
        } else if (type === "Gas") {
          monthData.gas += usage;
        }
      }
    });

    // Convert to array and sort by month
    const monthlyUsage: MonthlyUsage[] = Array.from(usageByMonth.entries())
      .map(([monthKey, data]) => ({
        month: new Date(monthKey + "-01").toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
        electricity: data.electricity,
        water: data.water,
        gas: data.gas,
      }))
      .sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
      );

    return {
      labels: monthlyUsage.map((item) => item.month),
      datasets: [
        {
          label: "⚡ Electricity",
          data: monthlyUsage.map((item) => item.electricity),
          borderColor: "#ff6b35",
          backgroundColor: "rgba(255, 107, 53, 0.1)",
          borderWidth: 3,
          pointBackgroundColor: "#ff6b35",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
        },
        {
          label: "💧 Water",
          data: monthlyUsage.map((item) => item.water),
          borderColor: "#4ecdc4",
          backgroundColor: "rgba(78, 205, 196, 0.1)",
          borderWidth: 3,
          pointBackgroundColor: "#4ecdc4",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
        },
        {
          label: "🔥 Gas",
          data: monthlyUsage.map((item) => item.gas),
          borderColor: "#e6b800",
          backgroundColor: "rgba(230, 184, 0, 0.1)",
          borderWidth: 3,
          pointBackgroundColor: "#e6b800",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.4,
        },
      ],
    };
  }, [measurements]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: "#ffffff",
          font: {
            size: 14,
            weight: 600,
          },
        },
      },
      title: {
        display: true,
        text: "Monthly Resource Usage",
        font: {
          size: 18,
          weight: "bold",
        },
        color: "#ffffff",
      },
      tooltip: {
        backgroundColor: "rgba(91, 93, 121, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#5b5d79",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;
            const unit = label.includes("Electricity") ? " kWh" : " m³";
            return `${label}: ${value?.toFixed(2)}${unit}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#ffffff",
          font: {
            weight: 600,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#ffffff",
          font: {
            weight: 600,
          },
          callback: function (value) {
            return value + " units";
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  if (measurements.length === 0) {
    return (
      <div className={classes.chartContainer}>
        <div className={classes.noData}>
          <p>No measurements available to display chart</p>
          <p>Add some measurements to see your usage trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.chartContainer}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default UsageChart;

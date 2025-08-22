"use client";

import { FC } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
  TooltipItem,
} from "chart.js";

// Register necessary chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const AreaChart: FC = () => {
  const data: ChartData<"line"> = {
    labels: ["Express", "Django", "Next.js", "Flask"],
    datasets: [
      {
        label: "Frameworks",
        data: [95, 80, 95, 75],
        borderColor: "#0bfc11",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        pointBackgroundColor: "#e34120",
        pointBorderColor: "#fff",
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(54, 162, 235, 1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem<"line">) {
            return `${tooltipItem.raw}% proficiency`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#ffffff",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
        ticks: {
          color: "#ffffff",
          callback: function (value: string | number) {
            return `${value}%`;
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default AreaChart;

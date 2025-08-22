"use client";

import { FC } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  ArcElement,
  Legend,
  ChartData,
  ChartOptions,
  TooltipItem,
} from "chart.js";

// Register necessary chart components
ChartJS.register(Title, Tooltip, ArcElement, Legend);

const DonutChart: FC = () => {
  const data: ChartData<"doughnut"> = {
    labels: ["JavaScript", "Python", "Java", "TypeScript"],
    datasets: [
      {
        label: "Skill Proficiency",
        data: [90, 90, 70, 60],
        backgroundColor: ["#f3b81a", "#007fff", "#2fda46", "#dc143c"],
        hoverOffset: 4,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 10,
          font: {
            size: 14,
            weight: "bold",
          },
          color: "#fff",
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem: TooltipItem<"doughnut">) {
            return `${tooltipItem.label}: ${tooltipItem.raw}%`;
          },
        },
      },
    },
    cutout: "75%",
  };

  return <Doughnut data={data} options={options} />;
};

export default DonutChart;

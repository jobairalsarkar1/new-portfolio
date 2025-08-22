"use client";

import { FC } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";

// Register required chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart: FC = () => {
  const data: ChartData<"bar"> = {
    labels: [
      "Node.js",
      "React",
      "HTML",
      "CSS",
      "MongoDB",
      "SQL",
      "Tailwind",
      "Three.js",
      "Git",
      "PostgreSQL",
      "Prisma",
      "Vite",
      "Cloudflare",
      "Cloudinary",
      "Azure",
    ],
    datasets: [
      {
        label: "Skill Proficiency",
        data: [80, 95, 100, 90, 80, 75, 70, 65, 95, 95, 90, 90, 85, 95, 80],
        backgroundColor: "#4169e1",
        borderColor: "#36a2eb",
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      title: {
        display: false,
        text: "Skill Proficiency",
        color: "#ffffff",
        font: {
          size: 20,
          weight: "bold",
        },
      },
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
      },
      y: {
        ticks: {
          color: "#ffffff",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default BarChart;

import { useEffect, useState } from "react";
import API from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

function Dashboard() {
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    overdue: 0,
    total: 0,
  });

  // 🔄 Fetch stats
  useEffect(() => {
    API.get("/stats")
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => console.error("Stats error:", err));
  }, []);

  // 📊 Chart data
  const chartData = [
    { name: "Upcoming", value: stats.upcoming },
    { name: "Completed", value: stats.completed },
    { name: "Overdue", value: stats.overdue },
    { name: "Total", value: stats.total },
  ];

  return (
    <div className="p-5">

      <h2 className="text-xl font-bold mb-4">Dashboard</h2>

      {/* 🔹 KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-200 p-4 rounded">
          Upcoming: {stats.upcoming}
        </div>

        <div className="bg-green-200 p-4 rounded">
          Completed: {stats.completed}
        </div>

        <div className="bg-red-200 p-4 rounded">
          Overdue: {stats.overdue}
        </div>

        <div className="bg-gray-200 p-4 rounded">
          Total: {stats.total}
        </div>
      </div>

      {/* 🔹 CHART */}
      <div className="w-full h-80">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default Dashboard;
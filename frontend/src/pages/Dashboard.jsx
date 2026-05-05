import { useEffect, useState } from "react";
import API from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell
} from "recharts";

function Dashboard() {
  const [stats, setStats] = useState({
    upcoming: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🎨 SAME COLOR THEME AS ANALYTICS
  const STATUS_COLORS = {
    Upcoming: "#2563eb",     // blue
    "In Progress": "#f59e0b", // yellow
    Completed: "#16a34a",     // green
    Overdue: "#dc2626",       // red
  };

  useEffect(() => {
    API.get("/deadlines/all")
      .then((res) => {
        const data = res.data.content || res.data;

        const today = new Date();

        const upcoming = data.filter(
          d => d.status === "UPCOMING" && new Date(d.deadlineDate) >= today
        ).length;

        const inProgress = data.filter(
          d => d.status === "IN_PROGRESS"
        ).length;

        const completed = data.filter(
          d => d.status === "COMPLETED"
        ).length;

        const overdue = data.filter(
          d => new Date(d.deadlineDate) < today && d.status !== "COMPLETED"
        ).length;

        setStats({
          upcoming,
          inProgress,
          completed,
          overdue,
          total: data.length,
        });
      })
      .catch(() => {
        setError("Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = [
    { name: "Upcoming", value: stats.upcoming },
    { name: "In Progress", value: stats.inProgress },
    { name: "Completed", value: stats.completed },
    { name: "Overdue", value: stats.overdue },
  ];

  if (loading) {
    return <p className="text-center mt-10 text-white">Loading...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-200">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="text-xl md:text-2xl font-bold">
            Dashboard Overview
          </h2>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

          {[
            { label: "Upcoming", value: stats.upcoming },
            { label: "In Progress", value: stats.inProgress },
            { label: "Completed", value: stats.completed },
            { label: "Overdue", value: stats.overdue },
            { label: "Total", value: stats.total },
          ].map((item) => (
            <div key={item.label} className="bg-white p-4 rounded-xl shadow text-center">
              <p className="text-gray-500">{item.label}</p>
              <h2 className="text-xl font-bold">{item.value}</h2>
            </div>
          ))}

        </div>

        {/* CHART */}
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="h-64 sm:h-80">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />

                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Bar>

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
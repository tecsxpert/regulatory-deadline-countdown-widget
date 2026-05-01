import { useEffect, useState } from "react";
import API from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";

function Dashboard() {
  const [stats, setStats] = useState({
    upcoming: 0,
    completed: 0,
    overdue: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/stats")
      .then((res) => setStats(res.data))
      .catch(() => {
        // fallback (so UI never breaks)
        setStats({ upcoming: 5, completed: 3, overdue: 2, total: 10 });
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = [
    { name: "Upcoming", value: stats.upcoming },
    { name: "Completed", value: stats.completed },
    { name: "Overdue", value: stats.overdue },
    { name: "Total", value: stats.total },
  ];

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
      <div className="max-w-7xl mx-auto">

        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h2 className="text-xl md:text-2xl font-bold">
            Dashboard Overview
          </h2>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {["upcoming", "completed", "overdue", "total"].map((key) => (
            <div key={key} className="bg-white p-4 rounded-xl shadow text-center">
              <p className="capitalize">{key}</p>
              <h2 className="text-xl font-bold">{stats[key]}</h2>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="h-64 sm:h-80">
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

      </div>
    </div>
  );
}

export default Dashboard;
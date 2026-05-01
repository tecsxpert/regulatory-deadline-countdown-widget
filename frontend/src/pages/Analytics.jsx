import { useEffect, useState } from "react";
import API from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid
} from "recharts";

function Analytics() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("ALL");

  useEffect(() => {
    API.get("/all")
      .then((res) => setData(res.data.content || res.data))
      .catch(() => console.error("Error loading analytics"));
  }, []);

  // 🔎 FILTER BY PERIOD
  const filtered =
    period === "ALL"
      ? data
      : data.filter((item) => {
          const days = period === "7" ? 7 : 30;
          const diff =
            (new Date(item.deadlineDate) - new Date()) /
            (1000 * 60 * 60 * 24);
          return diff <= days;
        });

  // 📊 STATUS DATA
  const statusData = [
    { name: "Upcoming", value: filtered.filter(d => d.status === "UPCOMING").length },
    { name: "Completed", value: filtered.filter(d => d.status === "COMPLETED").length },
    { name: "Overdue", value: filtered.filter(d => d.status === "OVERDUE").length },
  ];

  // 📊 PRIORITY DATA
  const priorityData = [
    { name: "High", value: filtered.filter(d => d.priority === "HIGH").length },
    { name: "Medium", value: filtered.filter(d => d.priority === "MEDIUM").length },
    { name: "Low", value: filtered.filter(d => d.priority === "LOW").length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-6">

      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 mb-6">

        <button
          onClick={() => setPeriod("7")}
          className={`px-4 py-2 rounded text-white ${period === "7" ? "bg-blue-700" : "bg-blue-500"}`}
        >
          Last 7 Days
        </button>

        <button
          onClick={() => setPeriod("30")}
          className={`px-4 py-2 rounded text-white ${period === "30" ? "bg-green-700" : "bg-green-500"}`}
        >
          Last 30 Days
        </button>

        <button
          onClick={() => setPeriod("ALL")}
          className={`px-4 py-2 rounded text-white ${period === "ALL" ? "bg-gray-700" : "bg-gray-500"}`}
        >
          All
        </button>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* BAR CHART */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="mb-3 font-semibold">Status Overview</h3>

          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="mb-3 font-semibold">Priority Distribution</h3>

          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={priorityData} dataKey="value" label>
                  {priorityData.map((_, i) => (
                    <Cell key={i} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Analytics;
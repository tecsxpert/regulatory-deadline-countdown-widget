import { useEffect, useState } from "react";
import API from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid
} from "recharts";

function Analytics() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // 🎨 COLORS (ADDED)
  const STATUS_COLORS = {
    Upcoming: "#2563eb",     // blue
    "In Progress": "#f59e0b", // yellow
    Completed: "#16a34a",     // green
    Overdue: "#dc2626",       // red
  };

  const PRIORITY_COLORS = ["#dc2626", "#f59e0b", "#16a34a"]; // High, Medium, Low

  useEffect(() => {
    API.get("/deadlines/all")
      .then((res) => {
        setData(res.data.content || res.data);
      })
      .catch(() => console.error("Error loading analytics"))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    period === "ALL"
      ? data
      : data.filter((item) => {
          const days = period === "7" ? 7 : 30;

          const today = new Date();
          const deadline = new Date(item.deadlineDate);

          const diff = (deadline - today) / (1000 * 60 * 60 * 24);

          return diff >= 0 && diff <= days;
        });

  const statusData = [
    { name: "Upcoming", value: filtered.filter(d => d.status === "UPCOMING").length },
    { name: "In Progress", value: filtered.filter(d => d.status === "IN_PROGRESS").length },
    { name: "Completed", value: filtered.filter(d => d.status === "COMPLETED").length },
    { name: "Overdue", value: filtered.filter(d => d.status === "OVERDUE").length },
  ];

  const priorityData = [
    { name: "High", value: filtered.filter(d => d.priority === "HIGH").length },
    { name: "Medium", value: filtered.filter(d => d.priority === "MEDIUM").length },
    { name: "Low", value: filtered.filter(d => d.priority === "LOW").length },
  ];

  if (loading) {
    return <div className="text-center text-white mt-10">Loading analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-6">

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* BAR CHART */}
        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="mb-3 font-semibold">Status Overview</h3>

          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />

                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Bar>

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
                    <Cell key={i} fill={PRIORITY_COLORS[i]} />
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
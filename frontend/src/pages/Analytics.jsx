import { useEffect, useState } from "react";
import API from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

function Analytics() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState("ALL");

  // 🔄 Fetch data
  useEffect(() => {
    API.get("/all")
      .then((res) => {
        setData(res.data.content || res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // 🔎 Filter by period
  const filterData = () => {
    if (period === "ALL") return data;

    const days = period === "7" ? 7 : 30;
    const now = new Date();

    return data.filter((item) => {
      const date = new Date(item.deadlineDate);
      const diff = (now - date) / (1000 * 60 * 60 * 24);
      return diff <= days;
    });
  };

  const filtered = filterData();

  // 📊 Status chart
  const statusData = [
    {
      name: "UPCOMING",
      value: filtered.filter((d) => d.status === "UPCOMING").length,
    },
    {
      name: "COMPLETED",
      value: filtered.filter((d) => d.status === "COMPLETED").length,
    },
  ];

  // 📊 Priority chart
  const priorityData = [
    {
      name: "HIGH",
      value: filtered.filter((d) => d.priority === "HIGH").length,
    },
    {
      name: "MEDIUM",
      value: filtered.filter((d) => d.priority === "MEDIUM").length,
    },
    {
      name: "LOW",
      value: filtered.filter((d) => d.priority === "LOW").length,
    },
  ];

  return (
    <div className="p-5">

      <h2 className="text-xl font-bold mb-4">Analytics Dashboard</h2>

      {/* 🔘 Period Selector */}
      <div className="mb-4 space-x-2">
        <button onClick={() => setPeriod("7")} className="bg-blue-500 text-white px-3 py-1">7 Days</button>
        <button onClick={() => setPeriod("30")} className="bg-green-500 text-white px-3 py-1">30 Days</button>
        <button onClick={() => setPeriod("ALL")} className="bg-gray-500 text-white px-3 py-1">All</button>
      </div>

      {/* 📊 BAR CHART */}
      <div className="h-80 mb-6">
        <ResponsiveContainer>
          <BarChart data={statusData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📊 PIE CHART */}
      <div className="h-80">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={priorityData} dataKey="value" label>
              {priorityData.map((_, index) => (
                <Cell key={index} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default Analytics;
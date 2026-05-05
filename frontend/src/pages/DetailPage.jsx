import { useEffect, useState } from "react";
import API from "../services/api";

function DetailPage({ id, setPage, setEditData }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  // ✅ LOAD DATA
  useEffect(() => {
    API.get(`/deadlines/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load deadline"));
  }, [id]);

  if (error) {
    return <p className="text-center text-red-200 mt-10">{error}</p>;
  }

  if (!data) {
    return <p className="text-center mt-10 text-white">Loading...</p>;
  }

  // 🎯 PRIORITY BADGE
  const getPriorityBadge = (priority) => {
    if (priority === "CRITICAL") return "bg-red-700 text-white";
    if (priority === "HIGH") return "bg-red-500 text-white";
    if (priority === "MEDIUM") return "bg-yellow-500 text-white";
    return "bg-green-500 text-white";
  };

  // 🎯 STATUS BADGE
  const getStatusBadge = (status) => {
    if (status === "COMPLETED") return "bg-green-600 text-white";
    if (status === "OVERDUE") return "bg-red-600 text-white";
    if (status === "IN_PROGRESS") return "bg-blue-600 text-white";
    return "bg-gray-500 text-white";
  };

  // 🗑️ DELETE (SAFE)
  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this deadline?")) {
      return;
    }

    API.delete(`/deadlines/${data.id}`)
      .then(() => {
        alert("Deleted successfully");
        setPage("list");
      })
      .catch(() => alert("Delete failed"));
  };

  // 🤖 AI CALL (OPTIONAL FEATURE)
  const handleAI = () => {
    setAiLoading(true);
    setAiResponse(null);

    API.post("/ai/recommend", data)
      .then((res) => setAiResponse(res.data))
      .catch(() => alert("AI service not available"))
      .finally(() => setAiLoading(false));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-6">

      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-2xl font-bold text-gray-700">
          Deadline Details
        </h2>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white p-6 rounded-xl shadow max-w-2xl mx-auto">

        <h3 className="text-xl font-bold mb-3">{data.title}</h3>

        <p className="text-gray-600 mb-4">{data.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">

          <p><b>Regulatory Body:</b> {data.regulatoryBody}</p>
          <p><b>Deadline:</b> {data.deadlineDate}</p>

          <div>
            <b>Status:</b>{" "}
            <span className={`${getStatusBadge(data.status)} px-2 py-1 rounded`}>
              {data.status}
            </span>
          </div>

          <div>
            <b>Priority:</b>{" "}
            <span className={`${getPriorityBadge(data.priority)} px-2 py-1 rounded`}>
              {data.priority}
            </span>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3">

          <button
            onClick={() => {
              setEditData(data);
              setPage("form");
            }}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Delete
          </button>

          <button
            onClick={handleAI}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            AI Recommend
          </button>

        </div>

      </div>

      {/* 🤖 AI LOADING */}
      {aiLoading && (
        <div className="bg-white p-4 rounded shadow mt-4 text-center">
          🔄 Generating AI recommendations...
        </div>
      )}

      {/* 🤖 AI RESPONSE */}
      {aiResponse && (
        <div className="bg-white p-5 rounded-xl shadow mt-4 max-w-2xl mx-auto">

          <h3 className="font-semibold mb-3">
            AI Recommendations
          </h3>

          {aiResponse.map((rec, i) => (
            <div key={i} className="border-b pb-2 mb-2">
              <p><b>Action:</b> {rec.action_type}</p>
              <p><b>Description:</b> {rec.description}</p>
              <p><b>Priority:</b> {rec.priority}</p>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default DetailPage;
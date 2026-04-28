import { useEffect, useState } from "react";
import API from "../services/api";

function DetailPage({ id, setPage, setEditData }) {
  const [data, setData] = useState(null);

  // 🤖 AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  // 🔄 Fetch record
  useEffect(() => {
    API.get(`/get/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!data) return <p className="p-5">Loading...</p>;

  // 🎯 Badge color logic
  const badgeColor =
    data.priority === "HIGH"
      ? "bg-red-400"
      : data.priority === "MEDIUM"
      ? "bg-yellow-400"
      : "bg-green-400";

  // 🤖 AI CALL
  const handleAI = () => {
    setAiLoading(true);
    setAiResponse(null);

    API.post("/ai/recommend", data)
      .then((res) => {
        setAiResponse(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setAiLoading(false));
  };

  return (
    <div className="p-5">

      <h2 className="text-xl font-bold mb-4">Detail Page</h2>

      <p><b>Title:</b> {data.title}</p>
      <p><b>Description:</b> {data.description}</p>
      <p><b>Type:</b> {data.regulationType}</p>
      <p><b>Deadline:</b> {data.deadlineDate}</p>
      <p><b>Status:</b> {data.status}</p>

      {/* 🎯 SCORE BADGE */}
      <div className="mt-3">
        <span className={`${badgeColor} px-3 py-1 rounded text-white`}>
          Priority: {data.priority}
        </span>
      </div>

      {/* 🔧 ACTION BUTTONS */}
      <div className="mt-4 space-x-2">

        {/* Edit */}
        <button
          onClick={() => {
            setEditData(data);
            setPage("form");
          }}
          className="bg-yellow-500 text-white px-3 py-1"
        >
          Edit
        </button>

        {/* Delete */}
        <button
          onClick={() => {
            API.delete(`/delete/${data.id}`)
              .then(() => {
                alert("Deleted successfully");
                setPage("list");
              })
              .catch((err) => console.error(err));
          }}
          className="bg-red-500 text-white px-3 py-1"
        >
          Delete
        </button>

        {/* 🤖 AI Button */}
        <button
          onClick={handleAI}
          className="bg-purple-500 text-white px-3 py-1"
        >
          AI Recommend
        </button>

      </div>

      {/* 🤖 LOADING */}
      {aiLoading && (
        <p className="mt-4 text-center">Loading AI response...</p>
      )}

      {/* 🤖 RESPONSE CARD */}
      {aiResponse && (
        <div className="mt-4 border p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">AI Recommendations</h3>

          {aiResponse.map((rec, index) => (
            <div key={index} className="mb-3">
              <p><b>Action:</b> {rec.action_type}</p>
              <p><b>Description:</b> {rec.description}</p>
              <p><b>Priority:</b> {rec.priority}</p>
              <hr className="mt-2" />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default DetailPage;
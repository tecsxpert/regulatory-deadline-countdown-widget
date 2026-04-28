import { useEffect, useState } from "react";
import API from "../services/api";

function ListPage({ setEditData, setPage, setSelectedId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔎 Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 🤖 AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  // ⏱ Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // 🔄 Fetch data
  const fetchData = () => {
    setLoading(true);

    API.get("/all")
      .then((res) => {
        setData(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch]);

  // ❌ Delete
  const handleDelete = (id) => {
    API.delete(`/delete/${id}`)
      .then(() => {
        alert("Deleted successfully");
        fetchData();
      });
  };

  // 🤖 AI CALL
  const handleAI = (item) => {
    setAiLoading(true);
    setAiResponse(null);

    API.post("/ai/recommend", item)
      .then((res) => {
        setAiResponse(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setAiLoading(false));
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-5">

      <h2 className="text-xl font-bold mb-4">Regulatory Deadlines</h2>

      {/* 🔎 Search */}
      <input
        placeholder="Search..."
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 mb-4"
      />

      {/* 📊 Table */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id}>

              <td>{item.title}</td>
              <td>{item.regulationType}</td>
              <td>{item.deadlineDate}</td>
              <td>{item.status}</td>
              <td>{item.priority}</td>

              <td>

                <button onClick={() => {
                  setSelectedId(item.id);
                  setPage("detail");
                }}>
                  View
                </button>

                <button onClick={() => {
                  setEditData(item);
                  setPage("form");
                }}>
                  Edit
                </button>

                <button onClick={() => handleDelete(item.id)}>
                  Delete
                </button>

                {/* 🤖 AI BUTTON */}
                <button onClick={() => handleAI(item)}>
                  AI Recommend
                </button>

              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* 🤖 AI LOADING */}
      {aiLoading && (
        <p className="mt-4 text-center">Loading AI response...</p>
      )}

      {/* 🤖 AI RESPONSE */}
      {aiResponse && (
        <div className="mt-4 border p-3 bg-gray-100">
          <h3 className="font-bold">AI Recommendations</h3>

          {aiResponse.map((rec, i) => (
            <div key={i}>
              <p><b>Action:</b> {rec.action_type}</p>
              <p><b>Description:</b> {rec.description}</p>
              <p><b>Priority:</b> {rec.priority}</p>
              <hr />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ListPage;
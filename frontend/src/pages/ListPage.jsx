import { useEffect, useState } from "react";
import API from "../services/api";

function ListPage({ setEditData, setPage, setSelectedId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔎 Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // 📄 Pagination
  const [pageNum, setPageNum] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 🤖 AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  // 📤 Upload
  const [file, setFile] = useState(null);

  // ⏱ Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // 🔄 Fetch data
  const fetchData = () => {
    setLoading(true);

    API.get("/search", {
      params: {
        q: debouncedSearch,
        status,
        fromDate,
        toDate,
        page: pageNum,
        size: 5,
      },
    })
      .then((res) => {
        const content = res.data.content || res.data;
        setData(content);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, status, fromDate, toDate, pageNum]);

  // ❌ Delete
  const handleDelete = (id) => {
    API.delete(`/delete/${id}`)
      .then(() => {
        alert("Deleted successfully");
        fetchData();
      })
      .catch((err) => console.error(err));
  };

  // 🤖 AI
  const handleAI = (item) => {
    setAiLoading(true);
    setAiResponse(null);

    API.post("/ai/recommend", item)
      .then((res) => setAiResponse(res.data))
      .catch((err) => console.error(err))
      .finally(() => setAiLoading(false));
  };

  // 📤 Upload
  const handleUpload = () => {
    if (!file) return alert("Select file first");

    if (file.type !== "text/csv") {
      return alert("Only CSV allowed");
    }

    if (file.size > 2 * 1024 * 1024) {
      return alert("File too large (max 2MB)");
    }

    const formData = new FormData();
    formData.append("file", file);

    API.post("/upload", formData)
      .then(() => alert("Uploaded successfully"))
      .catch(() => alert("Upload failed"));
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-5">

      <h2 className="text-xl font-bold mb-4">Regulatory Deadlines</h2>

      {/* 🔎 FILTER BAR */}
      <div className="flex flex-wrap gap-3 mb-4">

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2"
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2">
          <option value="">All Status</option>
          <option value="UPCOMING">UPCOMING</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>

        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-2" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-2" />

        {/* 📥 Export */}
        <button
          onClick={() => window.open("http://localhost:8080/export")}
          className="bg-green-500 text-white px-3 py-1"
        >
          Export CSV
        </button>
      </div>

      {/* 📤 Upload */}
      <div className="mb-4">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-3 py-1 ml-2"
        >
          Upload CSV
        </button>
      </div>

      {/* 📊 TABLE */}
      {data.length === 0 ? (
        <p className="text-center">No records found</p>
      ) : (
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

                  <button onClick={() => handleAI(item)}>
                    AI Recommend
                  </button>

                </td>

              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🤖 LOADING */}
      {aiLoading && <p className="mt-4">Loading AI response...</p>}

      {/* 🤖 RESPONSE */}
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

      {/* 📄 Pagination */}
      <div className="mt-4 flex justify-center space-x-3">
        <button onClick={() => setPageNum(pageNum - 1)} disabled={pageNum === 0}>
          Prev
        </button>

        <span>Page {pageNum + 1} of {totalPages}</span>

        <button onClick={() => setPageNum(pageNum + 1)} disabled={pageNum + 1 >= totalPages}>
          Next
        </button>
      </div>

    </div>
  );
}

export default ListPage;
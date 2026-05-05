import { useState, useEffect } from "react";
import API from "../services/api";

function ListPage({ setEditData, setPage, setSelectedId }) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pageNum, setPageNum] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // 🔍 Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageNum(0); // ✅ reset page
      setSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // 🔄 Fetch data (FIXED)
  useEffect(() => {
    setLoading(true);

    const url = search
      ? "/deadlines/search"
      : "/deadlines/all";

    const params = search
      ? { q: search, page: pageNum, size: 10 }
      : { page: pageNum, size: 10, sortBy: "deadlineDate" };

    API.get(url, { params })
      .then((res) => {
        setData(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => console.error("Error fetching:", err))
      .finally(() => setLoading(false));

  }, [pageNum, search]);

  // 🎯 STATUS BADGE
  const getStatusBadge = (status) => {
    if (status === "COMPLETED") return "bg-green-600 text-white";
    if (status === "OVERDUE") return "bg-red-600 text-white";
    if (status === "IN_PROGRESS") return "bg-blue-600 text-white";
    return "bg-gray-500 text-white";
  };

  // 🎯 PRIORITY BADGE
  const getPriorityBadge = (priority) => {
    if (priority === "CRITICAL") return "bg-red-700 text-white";
    if (priority === "HIGH") return "bg-red-500 text-white";
    if (priority === "MEDIUM") return "bg-yellow-500 text-white";
    return "bg-green-500 text-white";
  };

  // ❌ DELETE
  const handleDelete = (id) => {
    if (!window.confirm("Delete this record?")) return;

    API.delete(`/deadlines/${id}`)
      .then(() => {
        setData((prev) => prev.filter((item) => item.id !== id));
      })
      .catch((err) => console.error("Delete error:", err));
  };

  // 📥 EXPORT CSV
const handleExport = async () => {
  try {
    const response = await API.get("/deadlines/export", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "deadlines.csv");

    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (error) {
    console.error("Export failed:", error);
    alert("Failed to export CSV");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow mb-6 gap-3">
          <h2 className="text-xl font-bold">Deadlines</h2>

          <button
  onClick={handleExport}
  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
>
  Export CSV
</button>

          <button
            onClick={() => {
              setEditData(null);
              setPage("form");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Create Deadline
          </button>
        </div>

        {/* SEARCH */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <input
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border p-2 rounded-lg w-full"
          />
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="bg-white p-4 rounded text-center">Loading...</div>
        ) : data.length === 0 ? (
          <div className="bg-white p-4 rounded text-center">No records found</div>
        ) : (
          <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">

            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Title</th>
                  <th className="p-2">Regulatory Body</th>
                  <th className="p-2">Deadline</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Priority</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{item.title}</td>
                    <td className="p-2">{item.regulatoryBody || "-"}</td>
                    <td className="p-2">{item.deadlineDate}</td>

                    <td className="p-2">
                      <span className={`${getStatusBadge(item.status)} px-2 py-1 rounded`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="p-2">
                      <span className={`${getPriorityBadge(item.priority)} px-2 py-1 rounded`}>
                        {item.priority}
                      </span>
                    </td>

                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => {
                          setSelectedId(item.id);
                          setPage("detail");
                        }}
                        className="text-blue-600"
                      >
                        View
                      </button>

                      <button
                        onClick={() => {
                          setEditData(item);
                          setPage("form");
                        }}
                        className="text-yellow-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-center gap-4 mt-6 text-white">
          <button
            onClick={() => setPageNum(pageNum - 1)}
            disabled={pageNum === 0}
          >
            Prev
          </button>

          <span>
            Page {pageNum + 1} of {totalPages}
          </span>

          <button
            onClick={() => setPageNum(pageNum + 1)}
            disabled={pageNum + 1 >= totalPages}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}

export default ListPage;
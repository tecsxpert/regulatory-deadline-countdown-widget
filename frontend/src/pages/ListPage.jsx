import { useState, useEffect } from "react";
import API from "../services/api";

function ListPage({ setEditData, setPage, setSelectedId }) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pageNum, setPageNum] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // 🔥 Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // 🔄 Fetch data
  useEffect(() => {
    setLoading(true);

    API.get("/all", {
      params: {
        page: pageNum,
        search,
        status,
        fromDate,
        toDate,
      },
    })
      .then((res) => {
        setData(res.data.content || res.data);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => console.error("Error fetching:", err))
      .finally(() => setLoading(false));
  }, [pageNum, search, status, fromDate, toDate]);

  // ❌ Delete (soft)
  const handleDelete = (id) => {
    if (!window.confirm("Delete this record?")) return;

    API.delete(`/delete/${id}`)
      .then(() => {
        setData((prev) => prev.filter((item) => item.id !== id));
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow mb-6 gap-3">
          <h2 className="text-xl font-bold">Deadlines</h2>

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

        {/* FILTERS */}
        <div className="bg-white p-4 rounded-xl shadow mb-6 flex flex-wrap gap-3">

          <input
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border p-2 rounded-lg"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="UPCOMING">UPCOMING</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded-lg"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-2 rounded-lg"
          />

          <button
            onClick={() => window.open("http://localhost:8080/export")}
            className="bg-green-500 text-white px-3 py-2 rounded-lg"
          >
            Export CSV
          </button>

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
                  <th className="p-2">Type</th>
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
                    <td className="p-2">{item.regulationType}</td>
                    <td className="p-2">{item.deadlineDate}</td>
                    <td className="p-2">{item.status}</td>
                    <td className="p-2">{item.priority}</td>

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
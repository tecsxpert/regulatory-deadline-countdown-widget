import { useState, useEffect } from "react";
import API from "../services/api";

function FormPage({ editData, setPage }) {

  const [form, setForm] = useState({
    title: "",
    description: "",
    regulationType: "",
    deadlineDate: "",
    status: "UPCOMING",
    priority: "MEDIUM",
  });

  const [error, setError] = useState("");

  // 🔁 Prefill for edit
  useEffect(() => {
    if (editData) {
      setForm(editData);
    }
  }, [editData]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ VALIDATION
  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.deadlineDate) return "Deadline date required";
    if (new Date(form.deadlineDate) < new Date())
      return "Deadline cannot be past date";

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    if (editData) {
      API.put(`/${editData.id}`, form)
        .then(() => {
          alert("Updated successfully");
          setPage("list");
        })
        .catch(() => setError("Update failed"));
    } else {
      API.post("/create", form)
        .then(() => {
          alert("Created successfully");
          setPage("list");
        })
        .catch(() => setError("Create failed"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center p-6">

      <div className="bg-white p-8 rounded-xl shadow w-full max-w-xl">

        <h2 className="text-xl font-bold mb-4 text-center">
          {editData ? "Edit Deadline" : "Create Deadline"}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 mb-4 rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            name="regulationType"
            placeholder="Regulation Type"
            value={form.regulationType}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            type="date"
            name="deadlineDate"
            value={form.deadlineDate}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <div className="grid grid-cols-2 gap-3">
            <select name="status" value={form.status} onChange={handleChange} className="border p-3 rounded">
              <option>UPCOMING</option>
              <option>COMPLETED</option>
            </select>

            <select name="priority" value={form.priority} onChange={handleChange} className="border p-3 rounded">
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
            </select>
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded">
            {editData ? "Update" : "Create"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default FormPage;
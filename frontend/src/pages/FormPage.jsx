import { useState, useEffect } from "react";
import API from "../services/api";

function FormPage({ editData, setPage }) {

  const [form, setForm] = useState({
    title: "",
    description: "",
    regulatoryBody: "",
    jurisdiction: "",
    category: "",
    responsibleTeam: "",
    ownerName: "",
    ownerEmail: "",
    deadlineDate: "",
    status: "",       // ✅ empty for placeholder
    priority: "",     // ✅ empty for placeholder
  });

  const [error, setError] = useState("");

  // 🔁 Prefill (EDIT MODE)
  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || "",
        description: editData.description || "",
        regulatoryBody: editData.regulatoryBody || "",
        jurisdiction: editData.jurisdiction || "",
        category: editData.category || "",
        responsibleTeam: editData.responsibleTeam || "",
        ownerName: editData.ownerName || "",
        ownerEmail: editData.ownerEmail || "",
        deadlineDate: editData.deadlineDate || "",
        status: editData.status || "UPCOMING",
        priority: editData.priority || "MEDIUM",
      });
    }
  }, [editData]);

  // 🔄 Handle input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Validation
  const validate = () => {
    if (!form.title.trim()) return "Title is required";
    if (!form.deadlineDate) return "Deadline date required";
    if (!form.ownerEmail.includes("@")) return "Valid email required";
    if (!form.status) return "Please select status";       // ✅ added
    if (!form.priority) return "Please select priority";   // ✅ added
    return "";
  };

  // 🚀 Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    const payload = {
      title: form.title,
      description: form.description,
      regulatoryBody: form.regulatoryBody,
      jurisdiction: form.jurisdiction,
      category: form.category,
      responsibleTeam: form.responsibleTeam,
      ownerName: form.ownerName,
      ownerEmail: form.ownerEmail,
      deadlineDate: form.deadlineDate,
      status: form.status,
      priority: form.priority,
    };

    if (editData) {
      API.put(`/deadlines/${editData.id}`, payload)
        .then(() => {
          alert("Updated successfully");
          setPage("list");
        })
        .catch(() => setError("Update failed"));
    } else {
      API.post("/deadlines/create", payload)
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
            name="regulatoryBody"
            placeholder="Regulatory Body"
            value={form.regulatoryBody}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            name="jurisdiction"
            placeholder="Jurisdiction"
            value={form.jurisdiction}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            name="responsibleTeam"
            placeholder="Responsible Team"
            value={form.responsibleTeam}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            name="ownerName"
            placeholder="Owner Name"
            value={form.ownerName}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            name="ownerEmail"
            placeholder="Owner Email"
            value={form.ownerEmail}
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

          {/* STATUS + PRIORITY */}
          <div className="grid grid-cols-2 gap-3">

            {/* STATUS */}
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border p-3 rounded"
            >
              <option value="" disabled>Select Status</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            {/* PRIORITY */}
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="border p-3 rounded"
            >
              <option value="" disabled>Select Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">
            {editData ? "Update" : "Create"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default FormPage;
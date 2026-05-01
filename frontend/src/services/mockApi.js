// Simple in-browser DB
const KEY = "deadlines_db";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const read = () => JSON.parse(localStorage.getItem(KEY) || "[]");
const write = (data) => localStorage.setItem(KEY, JSON.stringify(data));

const seedIfEmpty = () => {
  const data = read();
  if (data.length) return;

  const today = new Date();
  const addDays = (d) => {
    const x = new Date();
    x.setDate(today.getDate() + d);
    return x.toISOString().slice(0, 10);
  };

  const seed = [
    { id: 1, title: "GST Filing", regulationType: "Tax", deadlineDate: addDays(5), status: "UPCOMING", priority: "HIGH", isDeleted: false },
    { id: 2, title: "Audit Report", regulationType: "Finance", deadlineDate: addDays(-2), status: "OVERDUE", priority: "MEDIUM", isDeleted: false },
    { id: 3, title: "PF Submission", regulationType: "Compliance", deadlineDate: addDays(10), status: "UPCOMING", priority: "LOW", isDeleted: false },
  ];
  write(seed);
};

seedIfEmpty();

const paginate = (arr, page = 0, size = 5) => {
  const start = page * size;
  const slice = arr.slice(start, start + size);
  return {
    content: slice,
    totalPages: Math.max(1, Math.ceil(arr.length / size)),
  };
};

const mockApi = {
  async get(url, config = {}) {
    await sleep(300);

    const data = read().filter((d) => !d.isDeleted);

    // 🔹 ALL (with pagination + filters)
    if (url.startsWith("/all")) {
      const { page = 0, search = "", status = "", fromDate = "", toDate = "" } =
        config.params || {};

      let filtered = data;

      if (search) {
        filtered = filtered.filter((d) =>
          d.title.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (status) {
        filtered = filtered.filter((d) => d.status === status);
      }

      if (fromDate) {
        filtered = filtered.filter((d) => d.deadlineDate >= fromDate);
      }

      if (toDate) {
        filtered = filtered.filter((d) => d.deadlineDate <= toDate);
      }

      return { data: paginate(filtered, page) };
    }

    // 🔹 GET ONE
    if (url.match(/^\/\d+$/)) {
      const id = Number(url.slice(1));
      return { data: data.find((d) => d.id === id) };
    }

    // 🔹 STATS
    if (url === "/stats") {
      return {
        data: {
          upcoming: data.filter((d) => d.status === "UPCOMING").length,
          completed: data.filter((d) => d.status === "COMPLETED").length,
          overdue: data.filter((d) => d.status === "OVERDUE").length,
          total: data.length,
        },
      };
    }

    return { data: [] };
  },

  async post(url, body) {
    await sleep(300);

    // 🔹 CREATE
    if (url === "/create") {
      const db = read();
      const id = Date.now();
      const item = { ...body, id, isDeleted: false };
      write([item, ...db]);
      return { data: item };
    }

    // 🔹 AI MOCK
    if (url === "/ai/recommend") {
      return {
        data: [
          {
            action_type: "Review",
            description: "Check compliance before deadline",
            priority: "HIGH",
          },
          {
            action_type: "Notify",
            description: "Send reminder email",
            priority: "MEDIUM",
          },
        ],
      };
    }

    return { data: {} };
  },

  async put(url, body) {
    await sleep(300);
    const id = Number(url.slice(1));

    const db = read().map((d) =>
      d.id === id ? { ...d, ...body } : d
    );
    write(db);

    return { data: body };
  },

  async delete(url) {
    await sleep(300);
    const id = Number(url.slice(1));

    const db = read().map((d) =>
      d.id === id ? { ...d, isDeleted: true } : d
    );
    write(db);

    return { data: true };
  },
};

export default mockApi;
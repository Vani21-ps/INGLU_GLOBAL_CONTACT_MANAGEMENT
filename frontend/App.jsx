import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
export default function App() {
  const [contacts, setContacts] = useState([]);
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Influencer",
    status: "New",
    notes: ""
  });

  const [editingId, setEditingId] = useState(null);

  const API = "http://localhost:4000/contacts";

  const fetchContacts = async () => {
    const res = await fetch(API);
    const data = await res.json();
    setContacts(data);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveContact = async () => {
    if (!form.name) return alert("Name required");

    if (editingId) {
      await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      setEditingId(null);
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
    }

    setForm({
      name: "",
      email: "",
      phone: "",
      category: "Influencer",
      status: "New",
      notes: ""
    });

    fetchContacts();
  };

  const editContact = (c) => {
    setForm(c);
    setEditingId(c._id);
    setPage("add");
  };

  const deleteContact = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    fetchContacts();
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const categoryColor = (cat) => {
    if (cat === "Influencer") return "#8b5cf6";
    if (cat === "Intern") return "#3b82f6";
    return "#10b981";
  };

  const statusColor = (status) => {
    if (status === "New") return "#f59e0b";
    return "#22c55e";
  };
  const chartData = {
  labels: ["Influencers", "Interns", "Contacted", "New"],
  datasets: [
    {
      label: "Contacts Overview",
      data: [
        contacts.filter(c => c.category === "Influencer").length,
        contacts.filter(c => c.category === "Intern").length,
        contacts.filter(c => c.status === "Contacted").length,
        contacts.filter(c => c.status === "New").length
      ]
    }
  ]
};

  return (
    <div style={{ display: "flex", fontFamily: "sans-serif" }}>

      {/* SIDEBAR */}
      <div style={{
        width: "220px",
        background: "#111827",
        color: "white",
        padding: "20px",
        height: "100vh"
      }}>
        <h2>🚀 INGLU GLOBAL</h2>

        <p style={navStyle} onClick={() => setPage("dashboard")}>📊 Dashboard</p>
        <p style={navStyle} onClick={() => setPage("contacts")}>👥 Contacts</p>
        <p style={navStyle} onClick={() => {
          setPage("add");
          setEditingId(null);
          setForm({
            name: "",
            email: "",
            phone: "",
            category: "Influencer",
            status: "New",
            notes: ""
          });
        }}>
          ➕ Add Contact
        </p>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "30px", background: "#f3f4f6" }}>

        {/* DASHBOARD */}
       {page === "dashboard" && (
  <div>
    <h1>📊 Dashboard</h1>

    {/* STATS */}
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
      <StatCard title="Total Contacts" value={contacts.length} />
      <StatCard title="Influencers" value={contacts.filter(c => c.category === "Influencer").length} />
      <StatCard title="Interns" value={contacts.filter(c => c.category === "Intern").length} />
      <StatCard title="Contacted" value={contacts.filter(c => c.status === "Contacted").length} />
    </div>

    {/* CHART */}
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "12px",
      marginTop: "30px"
    }}>
      <h2>📈 Overview</h2>
      <Bar data={chartData} />
    </div>

    {/* RECENT ACTIVITY */}
    <div style={{ marginTop: "30px" }}>
      <h2>🕒 Recent Activity</h2>

      {contacts.slice(-3).reverse().map((c) => (
        <div key={c._id} style={cardStyle}>
          <b>{c.name}</b> added as {c.category} ({c.status})
        </div>
      ))}
    </div>
  </div>
)}

        {/* ADD PAGE */}
        {page === "add" && (
          <div>
            <h1>{editingId ? "✏️ Edit Contact" : "➕ Add Contact"}</h1>

            <div style={formStyle}>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />

              <select name="category" value={form.category} onChange={handleChange}>
                <option>Influencer</option>
                <option>Intern</option>
                <option>Brand Partner</option>
              </select>

              <select name="status" value={form.status} onChange={handleChange}>
                <option>New</option>
                <option>Contacted</option>
              </select>

              <input name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" />

              <button onClick={saveContact} style={btnStyle}>
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        )}

        {/* CONTACTS */}
        {page === "contacts" && (
          <div>
            <h1>👥 Contacts</h1>

            <input
              placeholder="🔍 Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchStyle}
            />

            {filtered.map((c) => (
              <div key={c._id} style={cardStyle}>
                <h3>{c.name}</h3>
                <p>{c.email}</p>
                <p>{c.phone}</p>

                <div style={{ marginTop: "5px" }}>
                  <span style={{ ...badgeStyle, background: categoryColor(c.category) }}>
                    {c.category}
                  </span>
                  <span style={{ ...badgeStyle, background: statusColor(c.status) }}>
                    {c.status}
                  </span>
                </div>

                <p style={{ marginTop: "10px" }}>{c.notes}</p>

                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => editContact(c)} style={btnStyle}>✏️ Edit</button>
                  <button onClick={() => deleteContact(c._id)} style={deleteStyle}>🗑 Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// COMPONENT
const StatCard = ({ title, value }) => (
  <div style={{
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  }}>
    <h3>{title}</h3>
    <h2>{value}</h2>
  </div>
);

// STYLES
const navStyle = {
  cursor: "pointer",
  marginTop: "15px",
  padding: "8px",
  borderRadius: "6px"
};

const formStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  display: "flex",
  flexWrap: "wrap",
  gap: "10px"
};

const cardStyle = {
  background: "white",
  padding: "15px",
  borderRadius: "12px",
  marginBottom: "15px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
};

const badgeStyle = {
  color: "white",
  padding: "4px 10px",
  borderRadius: "20px",
  fontSize: "12px",
  marginRight: "5px"
};

const btnStyle = {
  padding: "6px 10px",
  border: "none",
  background: "#2563eb",
  color: "white",
  borderRadius: "6px",
  cursor: "pointer"
};

const deleteStyle = {
  ...btnStyle,
  background: "#dc2626",
  marginLeft: "5px"
};

const searchStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};
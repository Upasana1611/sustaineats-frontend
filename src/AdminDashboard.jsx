import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sustaineats-backend.onrender.com";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [waste, setWaste] = useState([]);
  const [loading, setLoading] = useState(true);

  const email = localStorage.getItem("email");

  // 🔐 Admin check
  if (!email || !email.includes("@admin")) {
    return <h1 style={{ color: "white", padding: "20px" }}>Access Denied</h1>;
  }

  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, 2000); // ⏳ wait for Render backend
  }, []);

  const fetchData = async () => {
    try {
      const usersRes = await axios.get(`${BASE_URL}/admin/users`);
      const wasteRes = await axios.get(`${BASE_URL}/admin/waste-reports`);

      setUsers(usersRes.data || []);
      setWaste(wasteRes.data || []);
    } catch (err) {
      console.log("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Loading screen (IMPORTANT)
  if (loading) {
    return (
      <h1 style={{ color: "white", padding: "20px" }}>
        Loading Admin Dashboard... (wait 10 sec)
      </h1>
    );
  }

  return (
    <div className="admin-container">

      <div className="sidebar">
        <h2>SustainEats</h2>
      </div>

      <div className="main">
        <h1>Admin Dashboard</h1>

        <div className="card">
          <h3>Total Users: {users.length}</h3>
          <h3>Total Waste Logs: {waste.length}</h3>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
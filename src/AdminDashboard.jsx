import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "https://sustaineats-backend.onrender.com";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [waste, setWaste] = useState([]);
  const [loading, setLoading] = useState(true);

  const email = localStorage.getItem("email");

  // 🔐 Admin protection
  if (!email || !email.includes("@admin")) {
    return (
      <h1 style={{ color: "white", padding: "20px" }}>
        Access Denied
      </h1>
    );
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const usersRes = await axios.get(`${BASE_URL}/admin/users`);
      const wasteRes = await axios.get(`${BASE_URL}/admin/waste-reports`);

      setUsers(usersRes.data || []);
      setWaste(wasteRes.data || []);

    } catch (err) {
      console.log("Error:", err);
      setUsers([]);
      setWaste([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userEmail) => {
    try {
      await axios.delete(`${BASE_URL}/admin/delete-user/${userEmail}`);
      fetchData();
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  // 🔄 Loading state (IMPORTANT for Render delay)
  if (loading) {
    return (
      <h1 style={{ color: "white", padding: "20px" }}>
        Loading Admin Dashboard...
      </h1>
    );
  }

  return (
    <div className="admin-container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>SustainEats</h2>
        <ul>
          <li>Dashboard</li>
          <li>Users</li>
          <li>Waste Reports</li>
        </ul>
      </div>

      {/* MAIN */}
      <div className="main">

        <h1>Admin Dashboard</h1>

        {/* CARDS */}
        <div className="cards">
          <div className="card">
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>

          <div className="card">
            <h3>Total Waste Logs</h3>
            <p>{waste.length}</p>
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="card">
          <h3>User Management</h3>

          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u, i) => (
                  <tr key={i}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => deleteUser(u.email)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* WASTE REPORT */}
        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Waste Reports</h3>

          {waste.length === 0 ? (
            <p>No waste data</p>
          ) : (
            <ul>
              {waste.map((w, i) => (
                <li key={i}>
                  {w.email} wasted {w.item_name} on {w.waste_date}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
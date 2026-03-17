import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";
import "./AdminDashboard.css"; // Ensure this CSS file exists in the correct folder

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ totalUsers: 0, totalWasteItems: 0, totalRecipes: 0 });
  const [users, setUsers] = useState([]);
  const [wasteReports, setWasteReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication Check
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email || !email.includes("@admin")) {
      navigate("/"); // Redirect to login if not admin
    } else {
      fetchAllData();
    }
  }, [navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, wasteRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`),
        fetch(`${API_BASE_URL}/admin/users`),
        fetch(`${API_BASE_URL}/admin/waste-reports`)
      ]);

      if (!statsRes.ok || !usersRes.ok || !wasteRes.ok) {
        throw new Error("Failed to fetch dashboard data.");
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const wasteData = await wasteRes.json();

      setStats(statsData);
      setUsers(usersData);
      setWasteReports(wasteData);
    } catch (err) {
      setError("An error occurred while loading data from the server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/delete-user/${email}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter(u => u.email !== email));
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      } else {
        alert("Failed to delete user.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user. Ensure backend is running.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Safe Render Helpers
  const renderDashboardContent = () => (
    <>
      <div className="summary-cards">
        <div className="card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers || 0}</p>
        </div>
        <div className="card">
          <h3>Total Waste Items</h3>
          <p>{stats.totalWasteItems || 0}</p>
        </div>
        <div className="card">
          <h3>Total Recipes</h3>
          <p>{stats.totalRecipes || 0}</p>
        </div>
      </div>
      
      {/* Mini previews on main dashboard */}
      <div className="admin-section">
        <h2>Recent Users</h2>
        {renderUsersTable(users.slice(0, 5))}
      </div>
      
      <div className="admin-section">
        <h2>Recent Waste Reports</h2>
        {renderWasteTable(wasteReports.slice(0, 5))}
      </div>
    </>
  );

  const renderUsersTable = (userList) => {
    if (!userList || userList.length === 0) {
      return <div className="empty-state">No users found.</div>;
    }

    return (
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((u, i) => (
              <tr key={u.email || i}>
                <td>{u.name || "Unknown"}</td>
                <td>{u.email}</td>
                <td>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteUser(u.email)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderWasteTable = (wasteList) => {
     if (!wasteList || wasteList.length === 0) {
      return <div className="empty-state">No waste records found.</div>;
    }

    return (
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Item Name</th>
              <th>Waste Date</th>
            </tr>
          </thead>
          <tbody>
            {wasteList.map((w, i) => (
              <tr key={w._id?.$oid || i}>
                <td>{w.email || "Unknown"}</td>
                <td>{w.item_name || "Unknown Item"}</td>
                <td>{w.waste_date || "Unknown Date"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return <div className="loading-fallback">Loading dashboard data...</div>;
    if (error) return <div className="error-fallback">{error}</div>;

    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent();
      case "users":
        return (
          <div className="admin-section">
            <h2>User Management</h2>
            {renderUsersTable(users)}
          </div>
        );
      case "waste":
        return (
           <div className="admin-section">
            <h2>Waste Reports Log</h2>
            {renderWasteTable(wasteReports)}
          </div>
        );
      case "recipes":
        return (
          <div className="admin-section">
             <h2>Recipes Log</h2>
             <div className="empty-state">Currently managing {stats.totalRecipes || 0} recipes. Recipe module coming soon!</div>
          </div>
        )
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <h2>SustainEats</h2>
        <nav>
          <span 
            className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </span>
          <span 
            className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </span>
          <span 
            className={`sidebar-link ${activeTab === 'waste' ? 'active' : ''}`}
            onClick={() => setActiveTab('waste')}
          >
            Waste Reports
          </span>
           <span 
            className={`sidebar-link ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            Recipes
          </span>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
        </header>
        
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./config";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({ totalUsers: 0, totalWasteItems: 0, totalRecipes: 0 });
  const [users, setUsers] = useState([]);
  const [wasteReports, setWasteReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  
  // Report Generation State
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Authentication Check
  useEffect(() => {
    if (!token || userRole !== "admin") {
      navigate("/");
    } else {
      fetchAllData();
    }
  }, [navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, wasteRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/waste-reports`, { headers: { 'Authorization': `Bearer ${token}` } })
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
        headers: { 'Authorization': `Bearer ${token}` }
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

  const generateReport = () => {
    // Analytics calculations based on user requirements
    // 1. Total Waste
    const totalWasteLogs = wasteReports.length;
    
    // 2. Financial & Environmental Impact Estimations
    // Assume average $3.50 lost per wasted item and 2.5kg CO2
    const totalCostLost = (totalWasteLogs * 3.50).toFixed(2);
    const co2Emissions = (totalWasteLogs * 2.5).toFixed(1);

    // 3. Most wasted items
    const itemCounts = {};
    wasteReports.forEach(w => {
      const name = w.item_name || "Unknown";
      itemCounts[name] = (itemCounts[name] || 0) + (parseInt(w.quantity) || 1);
    });

    let mostWasted = "N/A";
    let max = 0;
    for (let item in itemCounts) {
      if (itemCounts[item] > max) {
        max = itemCounts[item];
        mostWasted = item;
      }
    }

    // 4. Worst Offenders (Users who waste the most)
    const userWastes = {};
    wasteReports.forEach(w => {
      userWastes[w.email] = (userWastes[w.email] || 0) + 1;
    });
    let topOffender = "N/A";
    let offMax = 0;
    for (let u in userWastes) {
      if (userWastes[u] > offMax) {
        offMax = userWastes[u];
        topOffender = u;
      }
    }

    setReportData({
      totalLogs: totalWasteLogs,
      costLost: `$${totalCostLost}`,
      emissions: `${co2Emissions} kg`,
      mostWasted: mostWasted,
      topOffender: topOffender
    });
    
    setShowReport(true);
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
          <h3>Total Wasted Items</h3>
          <p>{stats.totalWasteItems || 0}</p>
        </div>
        <div className="card">
          <h3>Total Recipes</h3>
          <p>{stats.totalRecipes || 0}</p>
        </div>
      </div>
      
      <div className="admin-section">
        <h2>Recent Users</h2>
        {renderUsersTable(users.slice(0, 5))}
      </div>
      
      <div className="admin-section">
        <h2>Recent Expirations (Waste Logs)</h2>
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
                    Remove
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
      return <div className="empty-state">No waste records found in fridges.</div>;
    }

    return (
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Spoiled Item</th>
              <th>Qty</th>
              <th>Date Marked Waste</th>
            </tr>
          </thead>
          <tbody>
            {wasteList.map((w, i) => (
              <tr key={w._id?.$oid || i}>
                <td>{w.email || "Unknown"}</td>
                <td>{w.item_name || "Unknown Item"}</td>
                <td>{w.quantity || 1}</td>
                <td>{w.waste_date || "Unknown Date"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderWasteReportView = () => {
    return (
      <div className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Waste Tracking & Sustainability Report</h2>
          <button className="generate-report-btn" onClick={generateReport}>
            ⚡ Generate Deep Report
          </button>
        </div>

        {showReport && reportData && (
          <div className="report-insights">
             <div className="insight-card danger">
                <h4>Est. Financial Loss</h4>
                <div className="value">{reportData.costLost}</div>
             </div>
             <div className="insight-card danger">
                <h4>Est. CO₂ Footprint</h4>
                <div className="value">{reportData.emissions}</div>
             </div>
             <div className="insight-card">
                <h4>Most Wasted Food</h4>
                <div className="value" style={{textTransform: 'capitalize'}}>{reportData.mostWasted}</div>
             </div>
             <div className="insight-card">
                <h4>Top Waster (Email)</h4>
                <div className="value" style={{fontSize: '1.2rem', marginTop: '10px'}}>{reportData.topOffender}</div>
             </div>
          </div>
        )}

        {renderWasteTable(wasteReports)}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return <div className="loading-fallback">⚡ Syncing live matrix data...</div>;
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
        return renderWasteReportView();
      case "recipes":
        return (
          <div className="admin-section">
             <h2>Global Recipes</h2>
             <div className="empty-state">Currently managing {stats.totalRecipes || 0} recipes. Global directory syncing...</div>
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
          <button 
            className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`sidebar-link ${activeTab === 'waste' ? 'active' : ''}`}
            onClick={() => setActiveTab('waste')}
          >
            Waste Reports
          </button>
           <button 
            className={`sidebar-link ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            Recipes
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Disconnect</button>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <header className="admin-header">
          <h1>Control Center</h1>
        </header>
        
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
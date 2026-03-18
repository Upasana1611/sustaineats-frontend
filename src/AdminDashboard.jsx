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
  const [userReports, setUserReports] = useState([]);

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
    const totalWasteLogs = wasteReports.length;
    let totalCostLost = 0;
    let totalCo2 = 0;

    const globalItems = {};
    const userStats = {};

    // Initialize all registered users in the stats
    users.forEach(u => {
      const email = u.email ? u.email.toLowerCase().trim() : "Unknown";
      userStats[email] = { 
        email: email, 
        totalWasted: 0, 
        costLost: 0, 
        co2: 0, 
        items: {} 
      };
    });

    // Aggregate Data
    wasteReports.forEach(w => {
      const email = w.email ? w.email.toLowerCase().trim() : "Unknown";
      const name = w.item_name || "Unknown";
      const qty = parseInt(w.quantity) || 1;

      // Global Totals
      totalCostLost += qty * 3.50;
      totalCo2 += qty * 2.5;
      globalItems[name] = (globalItems[name] || 0) + qty;

      // Per-User Totals (Update if user already in stats, or add if legacy/unknown)
      if (!userStats[email]) {
        userStats[email] = { email, totalWasted: 0, costLost: 0, co2: 0, items: {} };
      }
      userStats[email].totalWasted += qty;
      userStats[email].costLost += qty * 3.50;
      userStats[email].co2 += qty * 2.5;
      userStats[email].items[name] = (userStats[email].items[name] || 0) + qty;
    });

    // Global Insights Calculation
    let mostWastedGlobal = "N/A";
    let maxGlobal = 0;
    for (let item in globalItems) {
      if (globalItems[item] > maxGlobal) {
        maxGlobal = globalItems[item];
        mostWastedGlobal = item;
      }
    }

    let topOffender = "N/A";
    let offMax = 0;
    const userReportArray = Object.values(userStats).map(user => {
       if (user.totalWasted > offMax) {
         offMax = user.totalWasted;
         topOffender = user.email;
       }
       
       let mostWastedUser = "N/A";
       let maxU = 0;
       for (let item in user.items) {
          if (user.items[item] > maxU) {
             maxU = user.items[item];
             mostWastedUser = item;
          }
       }
       return {
          email: user.email,
          totalWasted: user.totalWasted,
          costLost: `$${user.costLost.toFixed(2)}`,
          co2: `${user.co2.toFixed(1)} kg`,
          mostWasted: mostWastedUser
       };
    });

    setUserReports(userReportArray.sort((a,b) => b.totalWasted - a.totalWasted));

    setReportData({
      totalLogs: totalWasteLogs,
      costLost: `$${totalCostLost.toFixed(2)}`,
      emissions: `${totalCo2.toFixed(1)} kg`,
      mostWasted: mostWastedGlobal,
      topOffender: topOffender || "N/A"
    });
    
    setShowReport(true);
  };

  const downloadCSV = () => {
    if (!userReports || userReports.length === 0) {
      alert("Please generate the report first!");
      return;
    }
    
    // Headers mapped to friendly names
    const headers = ["User Email", "Total Items Wasted", "Financial Loss ($)", "CO2 Footprint (kg)", "Most Wasted Food"];
    
    // Map rows replacing symbols to keep CSV clean
    const rows = userReports.map(u => [
       u.email, 
       u.totalWasted, 
       u.costLost.replace('$', ''), 
       u.co2.replace(' kg', ''), 
       u.mostWasted
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Sustainability_User_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <th>User</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((u, i) => (
              <tr key={u.email || i}>
                <td className="user-name-cell">
                  <div className="user-avatar">
                   {(u.name && u.name.length > 0) ? u.name[0].toUpperCase() : "U"}
                  </div>
                  <span>{u.name || "Unknown"}</span>
                </td>
                <td className="user-email-cell">{u.email}</td>
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
              <th>User</th>
              <th>Spoiled Item</th>
              <th>Qty</th>
              <th>Date Marked Waste</th>
            </tr>
          </thead>
          <tbody>
            {wasteList.map((w, i) => (
              <tr key={w._id?.$oid || i}>
                <td className="user-name-cell">
                  <div className="user-avatar waste-avatar">
                   {(w.email && w.email.length > 0) ? w.email[0].toUpperCase() : "?"}
                  </div>
                  <span className="user-email-cell">{w.email || "Unknown"}</span>
                </td>
                <td className="waste-item-cell">{w.item_name || "Unknown Item"}</td>
                <td>
                  <span className="qty-badge">{w.quantity || 1}</span>
                </td>
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

        {showReport && userReports.length > 0 && (
          <div className="admin-section" style={{ borderLeft: '4px solid #0088ff' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#e2f5ea' }}>Per-User Sustainability Breakdown</h3>
                <button className="generate-report-btn" onClick={downloadCSV} style={{background: 'linear-gradient(135deg, #0088ff, #0055ff)', fontSize: '0.9rem', padding: '10px 18px'}}>
                  ⬇️ Download CSV
                </button>
             </div>
             <div className="admin-table-container">
               <table className="admin-table">
                 <thead>
                   <tr>
                     <th>User Email</th>
                     <th>Total Wasted</th>
                     <th>Loss Est.</th>
                     <th>CO₂ Est.</th>
                     <th>Biggest Waste Habit</th>
                   </tr>
                 </thead>
                 <tbody>
                   {userReports.map((u, i) => (
                     <tr key={i}>
                       <td className="user-email-cell">{u.email}</td>
                       <td><span className="qty-badge" style={{background: 'transparent', border: '1px solid #00ff88', color: '#00ff88'}}>{u.totalWasted}</span></td>
                       <td style={{color: '#ff6b6b', fontWeight: 'bold'}}>{u.costLost}</td>
                       <td style={{color: '#ff6b6b', fontWeight: 'bold'}}>{u.co2}</td>
                       <td className="waste-item-cell" style={{color: '#a8d5ba'}}>{u.mostWasted}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#a8d5ba' }}>Raw Waste Logs Database</h3>
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
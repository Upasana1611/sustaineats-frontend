import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx'; // Import Excel library
import API_BASE_URL from './config';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [wasteData, setWasteData] = useState([]);
  const [newRecipe, setNewRecipe] = useState({ name: '', calories: '', ecoScore: 5 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const uRes = await fetch(`${API_BASE_URL}/admin/users`);
      const uData = await uRes.json();
      setUsers(uData);

      const wRes = await fetch(`${API_BASE_URL}/admin/waste-reports`);
      const wData = await wRes.json();
      setWasteData(wData);
    } catch (err) {
      console.error("Admin fetch error:", err);
    }
  };

  const deleteUser = async (email) => {
    if (window.confirm(`Are you sure you want to delete ${email}?`)) {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/delete-user/${email}`, { method: 'DELETE' });
        if (res.ok) {
          alert("User deleted successfully");
          fetchData();
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const downloadReport = async (email) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/generate-report/${email}`);
    
    if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
    }

    const rawData = await res.json();
    console.log("Verified Raw Data:", rawData);

    const dataArray = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);

    if (dataArray.length === 0) {
      alert(`The database has no records for ${email}. Record some waste in the app first!`);
      return;
    }

    const rows = dataArray.map(item => {
      return {
        "User Email": email,
        "Waste Item": item.item_name || item.name || "Not Specified",
        "Date": item.waste_date || item.date || "N/A",
        "Eco Score": item.eco_score || item.score || 0,
        "Status": "Verified"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    
    worksheet['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Waste Report");

    XLSX.writeFile(workbook, `Report_${email.split('@')[0]}.xlsx`);

  } catch (err) {
    console.error("Critical Excel Error:", err);
    alert("Failed to generate report. Check if the backend server is running.");
  }
};

  const postRecipe = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/admin/post-recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecipe)
    });
    if (res.ok) alert("Global Recipe Posted Successfully!");
  };

  return (
    <div style={adminContainer}>
      <aside style={sidebarStyle}>
        <h2 style={{ color: '#99ff66', fontSize: '24px' }}>🌱 Admin Panel</h2>
        <div style={menuStyle}>
          <button onClick={() => setActiveTab('users')} style={activeTab === 'users' ? activeBtn : tabBtn}>Users</button>
          <button onClick={() => setActiveTab('waste')} style={activeTab === 'waste' ? activeBtn : tabBtn}>Waste Reports</button>
          <button onClick={() => setActiveTab('recipes')} style={activeTab === 'recipes' ? activeBtn : tabBtn}>Global Recipes</button>
        </div>
        <button onClick={() => navigate('/home')} style={backBtn}>Back to App</button>
      </aside>

      <main style={mainContentStyle}>
        {activeTab === 'users' && (
          <div className="premium-card" style={contentCard}>
            <h1 style={titleStyle}>User Management</h1>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                  <th style={{ paddingBottom: '15px' }}>Email</th>
                  <th style={{ paddingBottom: '15px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.email} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '20px 0' }}>{u.email}</td>
                    <td>
                      <button onClick={() => downloadReport(u.email)} style={reportBtn}>📊 Excel Report</button>
                      <button onClick={() => deleteUser(u.email)} style={deleteBtn}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'waste' && (
          <div className="premium-card" style={contentCard}>
            <h1 style={titleStyle}>System Waste Analytics</h1>
            <p style={{ fontSize: '20px', marginBottom: '30px' }}>Tracking environmental impact across all users.</p>
            {wasteData.length > 0 ? wasteData.map((report, index) => (
              <div key={index} style={reportRow}>
                <span>{report.email}</span>
                <span style={{ color: '#ff6666', fontWeight: 'bold' }}>{report.item_name} (Wasted)</span>
                <span style={{ color: '#aaa' }}>{report.waste_date}</span>
              </div>
            )) : <p>No waste data recorded yet.</p>}
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="premium-card" style={contentCard}>
            <h1 style={titleStyle}>Post Global Recipe</h1>
            <form onSubmit={postRecipe} style={formStyle}>
              <input style={inputS} placeholder="Recipe Name" onChange={e => setNewRecipe({...newRecipe, name: e.target.value})} />
              <input style={inputS} placeholder="Calories" onChange={e => setNewRecipe({...newRecipe, calories: e.target.value})} />
              <input style={inputS} type="number" placeholder="Eco-Score (1-10)" onChange={e => setNewRecipe({...newRecipe, ecoScore: e.target.value})} />
              <button type="submit" style={submitBtn}>PUBLISH TO ALL USERS</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;

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
      const uRes = await fetch('http://127.0.0.1:5000/admin/users');
      const uData = await uRes.json();
      setUsers(uData);

      const wRes = await fetch('http://127.0.0.1:5000/admin/waste-reports');
      const wData = await wRes.json();
      setWasteData(wData);
    } catch (err) {
      console.error("Admin fetch error:", err);
    }
  };

  const deleteUser = async (email) => {
    if (window.confirm(`Are you sure you want to delete ${email}?`)) {
      try {
        const res = await fetch(`http://127.0.0.1:5000/admin/delete-user/${email}`, { method: 'DELETE' });
        if (res.ok) {
          alert("User deleted successfully");
          fetchData();
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  // --- UPDATED: Generate Excel Report instead of JSON ---
  const downloadReport = async (email) => {
  try {
    const res = await fetch(`http://127.0.0.1:5000/admin/generate-report/${email}`);
    
    if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
    }

    const rawData = await res.json();
    console.log("Verified Raw Data:", rawData); // Check your F12 console for this!

    // Ensure we are working with an array. If backend sends a single object, wrap it.
    const dataArray = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);

    if (dataArray.length === 0) {
      alert(`The database has no records for ${email}. Record some waste in the app first!`);
      return;
    }

    // MANUALLY mapping to ensure headers ARE created
    const rows = dataArray.map(item => {
      return {
        "User Email": email,
        "Waste Item": item.item_name || item.name || "Not Specified",
        "Date": item.waste_date || item.date || "N/A",
        "Eco Score": item.eco_score || item.score || 0,
        "Status": "Verified"
      };
    });

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    
    // Force set column widths so it's not "empty-looking"
    worksheet['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Waste Report");

    // File Download
    XLSX.writeFile(workbook, `Report_${email.split('@')[0]}.xlsx`);

  } catch (err) {
    console.error("Critical Excel Error:", err);
    alert("Failed to generate report. Check if the backend server is running.");
  }
};

  const postRecipe = async (e) => {
    e.preventDefault();
    const res = await fetch('http://127.0.0.1:5000/admin/post-recipe', {
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

// ... (Your styles remain exactly the same as you provided) ...
const adminContainer = { display: 'flex', minHeight: '100vh', backgroundColor: '#031a10', color: 'white', fontFamily: 'Poppins' };
const sidebarStyle = { width: '300px', backgroundColor: '#052a1a', padding: '40px', borderRight: '1px solid rgba(255,255,255,0.1)' };
const menuStyle = { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '50px' };
const tabBtn = { background: 'none', border: 'none', color: '#aaa', textAlign: 'left', fontSize: '18px', cursor: 'pointer', padding: '10px' };
const activeBtn = { ...tabBtn, color: '#ffcc33', fontWeight: 'bold', borderLeft: '4px solid #ffcc33', paddingLeft: '15px' };
const mainContentStyle = { flex: 1, padding: '60px' };
const contentCard = { padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px' };
const titleStyle = { fontSize: '40px', color: '#99ff66', marginBottom: '30px' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: '18px', textAlign: 'left' };
const reportBtn = { backgroundColor: '#2d7a2d', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', marginRight: '10px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' };
const deleteBtn = { backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' };
const inputS = { padding: '15px', borderRadius: '10px', border: '1px solid #333', background: '#083320', color: 'white', marginBottom: '15px', fontSize: '16px' };
const submitBtn = { padding: '18px', backgroundColor: '#99ff66', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '18px' };
const backBtn = { marginTop: '100px', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '16px' };
const reportRow = { display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #222', fontSize: '18px' };
const formStyle = { display: 'flex', flexDirection: 'column' };

export default AdminDashboard;
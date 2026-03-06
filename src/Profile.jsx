import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'settings'
  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName") || "User";

  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    healthCondition: 'None',
    dietPreference: 'Veg',
    bmi: ''
  });

  const [bmiCategory, setBmiCategory] = useState('');

  // Mock data for the "Journey" display - in a real app, you'd fetch this from MongoDB
  const [journeyData] = useState({
    totalRecipes: 12,
    carbonSaved: "8.4 kg",
    avgEcoScore: "7.5",
    memberSince: "Feb 2026"
  });

  const calculateBMI = (h, w) => {
    if (h && w) {
      const heightInMeters = h / 100;
      const bmiVal = (w / (heightInMeters * heightInMeters)).toFixed(1);
      setFormData(prev => ({ ...prev, bmi: bmiVal }));
      if (bmiVal < 18.5) setBmiCategory('Underweight');
      else if (bmiVal < 25) setBmiCategory('Normal');
      else if (bmiVal < 30) setBmiCategory('Overweight');
      else setBmiCategory('Obese');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'height' || name === 'weight') calculateBMI(updated.height, updated.weight);
      return updated;
    });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, ...formData }),
      });
      if (response.ok) {
        alert("Success! Health profile updated.");
        setActiveTab('dashboard'); // Switch back to see changes
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <Link to="/home" style={backLink}>← Back to Dashboard</Link>

        <header style={headerStyle}>
          <h1 style={{ color: '#ffcc33', margin: '0', fontSize: '32px' }}>My Journey</h1>
          <p style={{ color: '#aaa' }}>{userName} • {userEmail}</p>
        </header>

        {/* --- TABS --- */}
        <div style={tabBar}>
          <button 
            style={activeTab === 'dashboard' ? activeTabBtn : tabBtn} 
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            style={activeTab === 'settings' ? activeTabBtn : tabBtn} 
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Health Settings
          </button>
        </div>

        {/* --- CONTENT AREA --- */}
        <div style={contentCard}>
          {activeTab === 'dashboard' ? (
            /* --- TAB 1: USER INFO & JOURNEY --- */
            <div style={fadeAnim}>
              <div style={statGrid}>
                <div style={statBox}>
                  <span style={statIcon}>🌱</span>
                  <span style={statVal}>{journeyData.carbonSaved}</span>
                  <p style={statLab}>CO2 Saved</p>
                </div>
                <div style={statBox}>
                  <span style={statIcon}>🍳</span>
                  <span style={statVal}>{journeyData.totalRecipes}</span>
                  <p style={statLab}>Meals Cooked</p>
                </div>
                <div style={statBox}>
                  <span style={statIcon}>⚖️</span>
                  <span style={statVal}>{formData.bmi || '--'}</span>
                  <p style={statLab}>Current BMI</p>
                </div>
              </div>

              <div style={infoDetails}>
                <h3 style={sectionTitle}>Personal Snapshot</h3>
                <div style={detailRow}>
                  <span>Dietary Choice:</span>
                  <span style={detailValHighlight}>{formData.dietPreference}</span>
                </div>
                <div style={detailRow}>
                  <span>Condition Focus:</span>
                  <span style={detailValHighlight}>{formData.healthCondition}</span>
                </div>
                <div style={detailRow}>
                  <span>Member Since:</span>
                  <span>{journeyData.memberSince}</span>
                </div>
              </div>
            </div>
          ) : (
            /* --- TAB 2: EDIT PREFERENCES (Your Original Form) --- */
            <form onSubmit={saveProfile} style={fadeAnim}>
              <div style={inputGrid}>
                <div style={inputWrapper}>
                  <label style={labelStyle}>Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} style={inputS} required />
                </div>
                <div style={inputWrapper}>
                  <label style={labelStyle}>Height (cm)</label>
                  <input type="number" name="height" value={formData.height} onChange={handleChange} style={inputS} required />
                </div>
                <div style={inputWrapper}>
                  <label style={labelStyle}>Weight (kg)</label>
                  <input type="number" name="weight" value={formData.weight} onChange={handleChange} style={inputS} required />
                </div>
                <div style={inputWrapper}>
                  <label style={labelStyle}>Health Condition</label>
                  <select name="healthCondition" value={formData.healthCondition} onChange={handleChange} style={selectS}>
                    <option value="None">Healthy</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Hypertension">Hypertension</option>
                    <option value="PCOS">PCOS</option>
                  </select>
                </div>
              </div>
              
              <div style={inputWrapper}>
                <label style={labelStyle}>Dietary Preference</label>
                <div style={radioGroup}>
                   <label style={radioLabel}>
                    <input type="radio" name="dietPreference" value="Veg" checked={formData.dietPreference === 'Veg'} onChange={handleChange} /> 🥦 Veg
                  </label>
                  <label style={radioLabel}>
                    <input type="radio" name="dietPreference" value="Non-Veg" checked={formData.dietPreference === 'Non-Veg'} onChange={handleChange} /> 🍗 Non-Veg
                  </label>
                </div>
              </div>

              <button type="submit" style={saveBtn}>SAVE CHANGES</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const pageStyle = { backgroundColor: '#052a1a', minHeight: '100vh', padding: '40px 20px', color: 'white', fontFamily: 'Poppins, sans-serif' };
const containerStyle = { maxWidth: '800px', margin: '0 auto' };
const headerStyle = { marginBottom: '30px', textAlign: 'left' };
const backLink = { color: '#ffcc33', textDecoration: 'none', fontSize: '14px', marginBottom: '20px', display: 'block' };

const tabBar = { display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' };
const tabBtn = { background: 'none', border: 'none', color: '#888', padding: '10px 20px', cursor: 'pointer', fontSize: '16px' };
const activeTabBtn = { ...tabBtn, color: '#ffcc33', borderBottom: '3px solid #ffcc33', fontWeight: 'bold' };

const contentCard = { background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' };
const fadeAnim = { animation: 'fadeIn 0.5s ease-in' };

// Dashboard Specific Styles
const statGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' };
const statBox = { background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '20px', textAlign: 'center' };
const statIcon = { fontSize: '24px', display: 'block', marginBottom: '10px' };
const statVal = { fontSize: '24px', fontWeight: 'bold', color: '#ffcc33' };
const statLab = { fontSize: '12px', color: '#aaa', margin: '5px 0 0' };

const infoDetails = { background: 'rgba(0,0,0,0.2)', padding: '25px', borderRadius: '20px' };
const detailRow = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const sectionTitle = { margin: '0 0 20px 0', fontSize: '18px', color: '#7ec335' };
const detailValHighlight = { color: '#ffcc33', fontWeight: 'bold' };

// Form Styles (From your original)
const inputGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' };
const inputWrapper = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '13px', fontWeight: 'bold', color: '#ffcc33' };
const inputS = { padding: '12px', borderRadius: '10px', border: 'none', outline: 'none' };
const selectS = { ...inputS, cursor: 'pointer' };
const radioGroup = { display: 'flex', gap: '20px', marginTop: '5px' };
const radioLabel = { fontSize: '14px', cursor: 'pointer' };
const saveBtn = { width: '100%', backgroundColor: '#ffcc33', color: '#000', padding: '15px', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' };

export default Profile;
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bgTable from './assets/background-table.png'; // Background asset
import salmonImg from './assets/salmon.png';
import olivesImg from './assets/olives.png';
import tomatoesImg from './assets/tomatoes.png';
import API_BASE_URL from './config';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', expiry: '', storage: 'Fridge' });
  const [suggestions, setSuggestions] = useState([]); 
  const [activeStorageTab, setActiveStorageTab] = useState('Fridge');
  
  const userEmail = localStorage.getItem("email") || localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchInventory = async () => {
    if (!userEmail || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/${userEmail}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch error:", err); }
  };

  const getRecipeSuggestions = async () => {
    if (!userEmail || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/suggest-recipes/${userEmail}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Recipe fetch error:", err);
      alert("Could not load recipes. Is the backend updated?");
    }
  };

  useEffect(() => { fetchInventory(); }, [userEmail]);

  const addToShoppingList = async (missingItems) => {
      try {
          const res = await fetch(`${API_BASE_URL}/shopping-list`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ email: userEmail, action: 'add', items: missingItems })
          });
          if (res.ok) alert("Added to Shopping List! Check it out in the Navbar.");
      } catch (err) {
          console.error(err);
      }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...newItem, email: userEmail })
      });
      if (res.ok) { fetchInventory(); setNewItem({ name: '', quantity: '', expiry: '', storage: 'Fridge' }); }
    } catch (err) { console.error("Add error:", err); }
  };

  const handleDelete = async (itemName) => {
    try {
        const res = await fetch(`${API_BASE_URL}/inventory/delete`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: itemName, email: userEmail })
        });
        if (res.ok) fetchInventory();
    } catch (err) { console.error("Delete error:", err); }
  };

  return (
    <div style={pageWrapper}>
      {/* Decorative Assets from sidebar */}
      <img src={salmonImg} alt="" style={decoSalmon} />
      <img src={olivesImg} alt="" style={decoOlives} />
      <img src={tomatoesImg} alt="" style={decoTomato} />

      <div style={contentOverlay}>
        <div style={navHeader}>
             <Link to="/home" style={backLink}>← Back to Home</Link>
             <span>User: <b style={{color: '#ffcc33'}}>{userEmail}</b></span>
        </div>

        {items.filter(item => {
           const days = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));
           return days <= 2 && days > 0;
        }).length > 0 && (
           <div style={alertBanner}>
              ⚠️ You have items expiring in the next 2 days! Let's cook something with them!
           </div>
        )}

        <h1 style={mainTitle}>My Supply 🧊</h1>

        <div style={mainGrid}>
          {/* Add Form with Blur effect */}
          <form onSubmit={handleAdd} style={formContainer}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffcc33' }}>Add Ingredient</h3>
            <input type="text" placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} style={inputStyle} required />
            <input type="text" placeholder="Quantity" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} style={inputStyle} required />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8rem', color: '#ccc' }}>Expiry Date:</label>
                <input type="date" value={newItem.expiry} onChange={e => setNewItem({...newItem, expiry: e.target.value})} style={inputStyle} required />
            </div>
            <select value={newItem.storage} onChange={e => setNewItem({...newItem, storage: e.target.value})} style={inputStyle}>
                <option value="Fridge">Fridge</option>
                <option value="Pantry">Pantry</option>
                <option value="Freezer">Freezer</option>
            </select>
            <button type="submit" style={addBtnStyle}>ADD TO INVENTORY</button>
          </form>

          {/* Stock List */}
          <div style={stockListContainer}>
            <h3 style={{ margin: '0 0 15px 0', color: '#ffcc33' }}>Current Stock</h3>
            
            <div style={storageTabs}>
                <button style={activeStorageTab === 'Fridge' ? activeTabBtn : tabBtn} onClick={() => setActiveStorageTab('Fridge')}>Fridge</button>
                <button style={activeStorageTab === 'Pantry' ? activeTabBtn : tabBtn} onClick={() => setActiveStorageTab('Pantry')}>Pantry</button>
                <button style={activeStorageTab === 'Freezer' ? activeTabBtn : tabBtn} onClick={() => setActiveStorageTab('Freezer')}>Freezer</button>
            </div>

            {items.filter(item => (item.storage || 'Fridge') === activeStorageTab).length === 0 ? <p>Your {activeStorageTab.toLowerCase()} is empty!</p> : 
              items.filter(item => (item.storage || 'Fridge') === activeStorageTab).map((item, index) => {
                const today = new Date();
                const expiryDate = new Date(item.expiry);
                const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

                let statusColor = '#7ec335'; 
                let statusText = 'Fresh';
                if (diffDays <= 0) { statusColor = '#d9534f'; statusText = 'EXPIRED'; }
                else if (diffDays <= 2) { statusColor = '#ff4d4d'; statusText = 'Expires Soon!'; }
                else if (diffDays <= 5) { statusColor = '#f0ad4e'; statusText = 'Use Soon'; }

                return (
                  <div key={index} style={stockCard}>
                    <div style={{ borderLeft: `6px solid ${statusColor}`, paddingLeft: '15px' }}>
                      <strong style={{ fontSize: '1.1rem', color: '#333' }}>{item.name}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>Qty: {item.quantity} | <b style={{color: statusColor}}>{statusText}</b></div>
                    </div>
                    <div>
                        {/* Gamification feature placeholder: We can consume or waste */}
                        <button onClick={() => handleDelete(item.name)} style={deleteBtn} title="Consume / Delete">✔️</button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Recipe Suggestions Section */}
        <div style={suggestionSection}>
          <button onClick={getRecipeSuggestions} style={suggestBtn}>
            Suggest Recipes from my Fridge ✨
          </button>

          <div style={suggestionGrid}>
            {suggestions.map((rec, i) => (
              <div key={i} style={recipeCard}>
                <h4 style={{ color: '#2d7a2d', margin: '0 0 10px 0' }}>{rec.recipe_name}</h4>
                <p style={{ fontSize: '0.85rem', color: '#444' }}>🌍 Eco-Score: <b>{rec.sustainability_score || 8}/10</b></p>
                <p style={{ fontSize: '0.85rem', color: '#2d7a2d' }}>✅ Have: {rec.matched && rec.matched.length > 0 ? rec.matched.join(', ') : 'None'}</p>
                {rec.missing && rec.missing.length > 0 && (
                  <>
                    <p style={{ fontSize: '0.85rem', color: '#d9534f', margin: '5px 0' }}>🛒 Need: {rec.missing.join(', ')}</p>
                    <button onClick={() => addToShoppingList(rec.missing)} style={addToCartBtn}>+ Add Missing to List</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES: FOODIE THEME ---
const pageWrapper = { backgroundImage: `url(${bgTable})`, backgroundSize: 'cover', backgroundAttachment: 'fixed', minHeight: '100vh', position: 'relative', overflow: 'hidden' };
const contentOverlay = { backgroundColor: 'rgba(5, 42, 26, 0.9)', minHeight: '100vh', padding: '40px 8%', color: 'white' };
const navHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.9rem' };
const backLink = { color: '#ffcc33', textDecoration: 'none', fontWeight: 'bold' };
const mainTitle = { textAlign: 'center', fontSize: '3rem', color: '#ffcc33', fontWeight: '800', marginBottom: '40px' };
const mainGrid = { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' };

const formContainer = { display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' };
const inputStyle = { padding: '12px', borderRadius: '12px', border: 'none', outline: 'none', background: 'white' };
const addBtnStyle = { padding: '15px', borderRadius: '50px', border: 'none', backgroundColor: '#ffcc33', color: '#000', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };

const stockListContainer = { maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' };
const stockCard = { backgroundColor: 'white', color: '#333', padding: '15px', borderRadius: '20px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' };
const deleteBtn = { background: 'none', border: 'none', color: '#ccc', fontSize: '1.2rem', cursor: 'pointer' };

const suggestionSection = { marginTop: '50px', textAlign: 'center' };
const suggestBtn = { padding: '15px 40px', borderRadius: '50px', border: 'none', backgroundColor: '#ffcc33', color: '#000', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' };
const suggestionGrid = { marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' };
const recipeCard = { backgroundColor: 'white', color: '#333', padding: '20px', borderRadius: '25px', textAlign: 'left', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' };
const addToCartBtn = { marginTop: '10px', padding: '8px 15px', borderRadius: '10px', border: 'none', backgroundColor: '#7ec335', color: 'white', fontWeight: 'bold', cursor: 'pointer', width: '100%' };

const decoSalmon = { position: 'absolute', top: '-40px', left: '-40px', width: '220px', opacity: 0.8 };
const decoOlives = { position: 'absolute', top: '20px', right: '10px', width: '130px', opacity: 0.8 };
const decoTomato = { position: 'absolute', bottom: '-20px', left: '20px', width: '160px', opacity: 0.8 };

const alertBanner = { backgroundColor: '#ff4d4d', color: 'white', padding: '15px', borderRadius: '15px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 4px 15px rgba(255, 77, 77, 0.4)' };
const storageTabs = { display: 'flex', gap: '10px', marginBottom: '20px' };
const tabBtn = { background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1rem', padding: '5px 10px' };
const activeTabBtn = { ...tabBtn, color: '#ffcc33', borderBottom: '2px solid #ffcc33', fontWeight: 'bold' };

export default Inventory;
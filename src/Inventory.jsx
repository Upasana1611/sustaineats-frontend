import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bgTable from './assets/background-table.png'; // Background asset
import salmonImg from './assets/salmon.png';
import olivesImg from './assets/olives.png';
import tomatoesImg from './assets/tomatoes.png';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', expiry: '' });
  const [suggestions, setSuggestions] = useState([]); 
  
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  const fetchInventory = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/inventory/${userEmail}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch error:", err); }
  };

  const getRecipeSuggestions = async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/suggest-recipes/${userEmail}`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Recipe fetch error:", err);
      alert("Could not load recipes. Is the backend updated?");
    }
  };

  useEffect(() => { fetchInventory(); }, [userEmail]);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, email: userEmail })
      });
      if (res.ok) { fetchInventory(); setNewItem({ name: '', quantity: '', expiry: '' }); }
    } catch (err) { console.error("Add error:", err); }
  };

  const handleDelete = async (itemName) => {
    try {
        const res = await fetch('http://127.0.0.1:5000/inventory/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

        <h1 style={mainTitle}>My Digital Fridge 🧊</h1>

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
            <button type="submit" style={addBtnStyle}>ADD TO FRIDGE</button>
          </form>

          {/* Stock List */}
          <div style={stockListContainer}>
            <h3 style={{ margin: '0 0 15px 0', color: '#ffcc33' }}>Current Stock</h3>
            {items.length === 0 ? <p>Your fridge is empty!</p> : 
              items.map((item, index) => {
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
                    <button onClick={() => handleDelete(item.name)} style={deleteBtn}>✕</button>
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
                <p style={{ fontSize: '0.85rem', color: '#444' }}>🌍 Eco-Score: <b>{rec.sustainability_score}/10</b></p>
                <p style={{ fontSize: '0.85rem', color: '#2d7a2d' }}>✅ Have: {rec.matched_ingredients.join(', ')}</p>
                {rec.missing_ingredients.length > 0 && (
                  <p style={{ fontSize: '0.85rem', color: '#d9534f' }}>🛒 Need: {rec.missing_ingredients.join(', ')}</p>
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

const decoSalmon = { position: 'absolute', top: '-40px', left: '-40px', width: '220px', opacity: 0.8 };
const decoOlives = { position: 'absolute', top: '20px', right: '10px', width: '130px', opacity: 0.8 };
const decoTomato = { position: 'absolute', bottom: '-20px', left: '20px', width: '160px', opacity: 0.8 };

export default Inventory;
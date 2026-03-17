import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from './config';

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const userEmail = localStorage.getItem("email") || localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchShoppingList = async () => {
    if (!userEmail || !token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/shopping-list/${userEmail}`, {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { 
      if (!userEmail) navigate("/");
      else fetchShoppingList(); 
  }, [userEmail, navigate]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/shopping-list`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: "add", items: [newItem.trim()], email: userEmail })
      });
      if (res.ok) { fetchShoppingList(); setNewItem(''); }
    } catch (err) { console.error("Add error:", err); }
  };

  const handleDelete = async (itemName) => {
    try {
        const res = await fetch(`${API_BASE_URL}/shopping-list`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: "remove", items: [itemName], email: userEmail })
        });
        if (res.ok) fetchShoppingList();
    } catch (err) { console.error("Delete error:", err); }
  };

  return (
    <div style={pageWrapper}>
      <div style={contentOverlay}>
        <div style={navHeader}>
             <Link to="/home" style={backLink}>← Back to Home</Link>
             <span>User: <b style={{color: '#ffcc33'}}>{userEmail}</b></span>
        </div>

        <h1 style={mainTitle}>Smart Shopping List 🛒</h1>

        <div style={mainContainer}>
          <form onSubmit={handleAdd} style={formContainer}>
            <input 
                type="text" 
                placeholder="Add an item to buy..." 
                value={newItem} 
                onChange={e => setNewItem(e.target.value)} 
                style={inputStyle} 
                required 
            />
            <button type="submit" style={addBtnStyle}>Add Item</button>
          </form>

          <div style={listContainer}>
            {items.length === 0 ? <p style={{textAlign: 'center', color: '#ccc'}}>Your shopping list is empty!</p> : 
              items.map((item, index) => (
                <div key={index} style={listItemCard}>
                  <strong style={{ fontSize: '1.1rem', color: '#333' }}>{item}</strong>
                  <button onClick={() => handleDelete(item)} style={deleteBtn} title="Mark as Bought">✔️ Got it</button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const pageWrapper = { backgroundColor: '#042215', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" };
const contentOverlay = { maxWidth: '800px', margin: '0 auto', padding: '40px 20px', color: 'white' };
const navHeader = { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '0.9rem' };
const backLink = { color: '#ffcc33', textDecoration: 'none', fontWeight: 'bold' };
const mainTitle = { textAlign: 'center', fontSize: '2.5rem', color: '#99ff66', fontWeight: '800', marginBottom: '40px' };

const mainContainer = { backgroundColor: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' };
const formContainer = { display: 'flex', gap: '15px', marginBottom: '30px' };
const inputStyle = { flex: 1, padding: '15px', borderRadius: '12px', border: 'none', outline: 'none', fontSize: '1rem' };
const addBtnStyle = { padding: '15px 30px', borderRadius: '12px', border: 'none', backgroundColor: '#ffcc33', color: '#000', fontWeight: 'bold', cursor: 'pointer' };

const listContainer = { display: 'flex', flexDirection: 'column', gap: '15px' };
const listItemCard = { backgroundColor: 'white', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' };
const deleteBtn = { background: '#7ec335', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };

export default ShoppingList;

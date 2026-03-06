import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from './config';
// CRUCIAL: Import the background image to resolve the path correctly
import backgroundTable from './assets/background-table.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // --- STYLES ---
  const containerStyle = {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    // Using the imported asset ensures Vite/React finds the image
    backgroundImage: `url(${backgroundTable})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: "'Inter', sans-serif",
  };

  const cardStyle = {
    // Semi-transparent white to show the wooden table behind it
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    backdropFilter: 'blur(12px)', // High-end frosted glass effect
    padding: '50px',
    borderRadius: '40px',
    width: '400px',
    zIndex: 10,
    color: '#1a4d1a', 
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.4)',
  };

  const inputStyle = {
    padding: '15px',
    borderRadius: '15px',
    border: '1px solid #ddd',
    outline: 'none',
    fontSize: '1rem',
    backgroundColor: 'white',
    width: '100%',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    padding: '15px',
    backgroundColor: '#1a4d1a', // Forest Green brand color
    color: 'white',
    border: 'none',
    borderRadius: '15px',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: 'pointer',
    width: '100%',
    transition: 'transform 0.2s ease, background 0.2s ease',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", data.name || "User");

        if (data.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/home');
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Ensure app.py is running!");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '8px', color: '#1a4d1a' }}>Login</h2>
        <p style={{ marginBottom: '35px', color: '#666', fontSize: '0.95rem' }}>
            Enter your credentials to manage your sustainable kitchen.
        </p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle} 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle} 
            required
          />
          <button 
            type="submit" 
            style={buttonStyle}
          >
            LOGIN
          </button>
        </form>

        <p style={{ marginTop: '25px', color: '#444' }}>
          New here? <Link to="/register" style={{ color: '#7ec335', fontWeight: 'bold', textDecoration: 'none' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
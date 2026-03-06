import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Import the background image to match Login/Home
import backgroundTable from './assets/background-table.png';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // --- STYLES ---
  const containerStyle = {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    backdropFilter: 'blur(12px)', 
    padding: '40px 50px',
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
    backgroundColor: '#1a4d1a',
    color: 'white',
    border: 'none',
    borderRadius: '15px',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    cursor: 'pointer',
    width: '100%',
    marginTop: '10px'
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://sustaineats-backend.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Registration Successful!");
        navigate('/');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Registration failed. Ensure your backend is running!");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '8px', color: '#1a4d1a' }}>Join Us</h2>
        <p style={{ marginBottom: '30px', color: '#666', fontSize: '0.95rem' }}>
            Start your journey toward zero food waste today.
        </p>
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            style={inputStyle} 
            required
          />
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
            placeholder="Create Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle} 
            required
          />
          <button type="submit" style={buttonStyle}>
            SIGN UP
          </button>
        </form>

        <p style={{ marginTop: '25px', color: '#444' }}>
          Already have an account? <Link to="/" style={{ color: '#7ec335', fontWeight: 'bold', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
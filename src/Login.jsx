import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from './config';
import backgroundTable from './assets/background-table.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

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
    padding: '50px',
    borderRadius: '40px',
    width: '400px',
    zIndex: 10,
    color: '#1a4d1a',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    textAlign: 'center',
  };

  const inputStyle = {
    padding: '15px',
    borderRadius: '15px',
    border: '1px solid #ddd',
    outline: 'none',
    fontSize: '1rem',
    width: '100%',
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
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ FIXED STORAGE
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);

        // ✅ ROLE BASED REDIRECT
        // ✅ CHECK EMAIL INSTEAD OF ROLE
      if (email.includes("@admin")) {
        localStorage.setItem("role", "admin");
      navigate("/admin");
        } else {
       localStorage.setItem("role", "user");
     navigate("/home");
        }

      } else {
        alert(data.message || "Invalid credentials");
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Try again.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2>Login</h2>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            type="email"
            placeholder="Email"
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

          <button type="submit" style={buttonStyle}>
            LOGIN
          </button>
        </form>

        <p style={{ marginTop: '20px' }}>
          New user? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from './config';
import sustainableBg from './assets/sustainable-bg.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

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
        localStorage.clear();
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        localStorage.setItem("token", data.token);

        if (data.role === "admin") {
          navigate("/admin");
        } else {
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

  const css = `
    @keyframes bgShimmer {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes floatOrb1 {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes floatOrb2 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-50px, -30px) scale(1.2); }
      100% { transform: translate(0, 0) scale(1); }
    }
    .custom-input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
    .custom-input {
      background: rgba(255, 255, 255, 0.03) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      color: white !important;
      transition: all 0.3s ease !important;
    }
    .custom-input:focus {
      border-color: #55aa55 !important;
      background: rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 0 15px rgba(85, 170, 85, 0.3) !important;
    }
    .login-btn-hover {
      box-shadow: 0 0 25px rgba(85, 170, 85, 0.6) !important;
      transform: translateY(-2px) !important;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        background: `linear-gradient(rgba(9, 19, 13, 0.85), rgba(15, 36, 22, 0.85)), url(${sustainableBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Inter', sans-serif",
        overflow: 'hidden'
      }}>
        
        {/* Decorative Floating Background Orbs for Premium feel */}
        <div style={{
          position: 'absolute', top: '15%', left: '20%', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(85,170,85,0.15) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%', filter: 'blur(40px)', animation: 'floatOrb1 10s ease-in-out infinite'
        }}/>
        <div style={{
          position: 'absolute', bottom: '10%', right: '15%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(255,204,51,0.1) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%', filter: 'blur(50px)', animation: 'floatOrb2 12s ease-in-out infinite'
        }}/>

        {/* Premium Dark Glass Card */}
        <div style={{
          position: 'relative',
          padding: '50px 40px',
          borderRadius: '24px',
          width: '90%',
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          textAlign: 'center',
          color: '#ffffff',
          zIndex: 10
        }}>
          
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '8px', 
            fontWeight: '800', 
            background: 'linear-gradient(to right, #99ff66, #ffcc33)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px'
          }}>SustainEats</h2>
          
          <p style={{ 
            color: 'rgba(255,255,255,0.6)', 
            marginBottom: '35px', 
            fontSize: '0.95rem',
            letterSpacing: '0.5px'
          }}>Welcome back. Let's save the planet.</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="custom-input"
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '1rem',
                width: '100%',
                boxSizing: 'border-box'
              }}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="custom-input"
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                outline: 'none',
                fontSize: '1rem',
                width: '100%',
                boxSizing: 'border-box'
              }}
              required
            />

            <button 
              type="submit" 
              className={isHovered ? "login-btn-hover" : ""}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                marginTop: '10px',
                padding: '16px',
                background: 'linear-gradient(135deg, #1f6b36, #164f26)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
              SIGN IN
            </button>
          </form>

          <p style={{ marginTop: '30px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
            New to SustainEats?{' '}
            <Link to="/register" style={{ 
              color: '#99ff66', 
              textDecoration: 'none', 
              fontWeight: '600',
              transition: 'color 0.2s ease'
             }}
             onMouseEnter={(e) => e.target.style.color = '#fff'}
             onMouseLeave={(e) => e.target.style.color = '#99ff66'}
             >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
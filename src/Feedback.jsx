import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from './config';

const Feedback = () => {
  const navigate = useNavigate();
  const [recipeName, setRecipeName] = useState("");
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const userEmail = localStorage.getItem("userEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const feedbackData = {
      email: userEmail,
      recipe_name: recipeName,
      rating: parseInt(rating),
      comments: comments
    };

    try {
      const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });

      if (response.ok) {
        alert("Success! Your preferences have been saved to the AI Model.");
        navigate('/home');
      }
    } catch (err) {
      console.error("Feedback error:", err);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <Link to="/home" style={backLink}>← Back to Dashboard</Link>
        
        <header style={headerStyle}>
          <h2 style={{ color: '#ffcc33', margin: '0' }}>🤖 AI Training Hub</h2>
          <p style={{ color: '#aaa', fontSize: '14px', marginTop: '10px' }}>
            Your feedback directly trains the SustainEats Recommendation Engine.
          </p>
        </header>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputWrapper}>
            <label style={labelStyle}>Recipe Name</label>
            <input 
              type="text" 
              placeholder="e.g. Grilled Chicken Salad" 
              onChange={(e) => setRecipeName(e.target.value)} 
              required 
              style={inputS} 
            />
          </div>

          <div style={inputWrapper}>
            <label style={labelStyle}>How was the taste & health balance?</label>
            <select onChange={(e) => setRating(e.target.value)} style={selectS}>
              <option value="5">⭐⭐⭐⭐⭐ - Perfect Balance</option>
              <option value="4">⭐⭐⭐⭐ - Very Good</option>
              <option value="3">⭐⭐⭐ - Satisfactory</option>
              <option value="2">⭐⭐ - Needs Improvement</option>
              <option value="1">⭐ - Not for me</option>
            </select>
          </div>

          <div style={inputWrapper}>
            <label style={labelStyle}>AI Training Notes</label>
            <textarea 
              placeholder="Help our AI: Was it too spicy? Should we suggest more fiber next time?" 
              onChange={(e) => setComments(e.target.value)}
              style={textareaS}
            />
          </div>

          <button type="submit" style={submitBtn}>SUBMIT TO AI ENGINE</button>
        </form>
      </div>
    </div>
  );
};

// styles unchanged
const pageStyle = { 
  backgroundColor: '#052a1a', 
  minHeight: '100vh', 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  color: 'white', 
  fontFamily: "'Poppins', sans-serif" 
};

const cardStyle = { 
  background: 'rgba(255,255,255,0.08)', 
  padding: '40px', 
  borderRadius: '40px', 
  width: '450px', 
  backdropFilter: 'blur(15px)', 
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
};

const headerStyle = { textAlign: 'center', marginBottom: '30px' };

const backLink = { 
  color: '#ffcc33', 
  textDecoration: 'none', 
  fontSize: '12px', 
  display: 'block', 
  marginBottom: '10px', 
  opacity: 0.8 
};

const formStyle = { display: 'flex', flexDirection: 'column', gap: '25px' };

const inputWrapper = { display: 'flex', flexDirection: 'column', gap: '8px' };

const labelStyle = { 
  fontSize: '13px', 
  fontWeight: 'bold', 
  color: '#ffcc33', 
  letterSpacing: '0.5px' 
};

const inputS = { 
  padding: '14px', 
  borderRadius: '12px', 
  border: '1px solid rgba(255,255,255,0.2)', 
  background: 'rgba(255,255,255,0.9)', 
  color: '#000', 
  outline: 'none' 
};

const selectS = { ...inputS, cursor: 'pointer' };

const textareaS = { 
  ...inputS, 
  height: '120px', 
  resize: 'none', 
  fontFamily: 'inherit' 
};

const submitBtn = { 
  backgroundColor: '#ffcc33', 
  color: '#000', 
  padding: '18px', 
  border: 'none', 
  borderRadius: '50px', 
  fontWeight: '900', 
  cursor: 'pointer', 
  marginTop: '10px', 
  transition: 'transform 0.2s',
  boxShadow: '0 10px 20px rgba(255,204,51,0.2)'
};

export default Feedback;
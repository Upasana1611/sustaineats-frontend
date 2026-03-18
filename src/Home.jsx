import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from './config';

// --- Local Image Imports ---
import saladImg from './assets/saladImg.png';
import juiceImg from './assets/juiceImg.png';
import pizzaImg from './assets/pizzaImg.png';
import biryaniImg from './assets/biryaniImg.png';

const Home = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const userEmail = localStorage.getItem("email") || localStorage.getItem("userEmail");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (userEmail && token) {
      fetch(`${API_BASE_URL}/suggest-recipes/${userEmail}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((data) => setRecipes(data.slice(0, 3)))
        .catch((err) => console.error("Error fetching recipes:", err));
    }
  }, [userEmail]);
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const aboutAnimations = `
    @keyframes revealUp {
      0% { opacity: 0; transform: translateY(50px) scale(0.9); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .about-reveal {
      animation: revealUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .mission-card-3d {
      transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      background: rgba(255, 255, 255, 0.03) !important;
      backdrop-filter: blur(20px) !important;
    }
    .mission-card-3d:hover {
      transform: translateY(-15px) scale(1.03) rotateX(2deg) rotateY(2deg);
      background: rgba(153, 255, 102, 0.08) !important;
      border-color: rgba(153, 255, 102, 0.4) !important;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(153, 255, 102, 0.2);
    }
    .mission-card-3d:hover .mission-icon-animate {
      transform: scale(1.2) rotate(10deg);
      filter: drop-shadow(0 0 10px rgba(153, 255, 102, 0.8));
    }
    .mission-icon-animate {
      transition: all 0.5s ease;
      display: inline-block;
    }
  `;

  return (
    <div style={mainContainer}>
      <style>{aboutAnimations}</style>
      {/* --- ATTRACTIVE NAVBAR WITH LOGOUT --- */}
      <nav style={navbarStyle}>
        <div style={logoStyle}>
          <span style={leafIconStyle} className="sustainability-leaf">🌱</span>
          <span style={brandTextStyle} className="brand-logo-text">SUSTAINEATS</span>
        </div>

        <div style={navLinks}>
          <Link to="/home" style={activeNavLink}>Home</Link>
          <a href="#about-us" style={navLink}>About</a>
          <Link to="/recipes" style={navLink}>Recipes</Link>
          <Link to="/shopping-list" style={navLink}>Shopping List</Link>
          <Link to="/profile" style={navLink}>Profile</Link>
          <Link to="/feedback" style={navLink}>Feedback</Link>
          <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={heroSection}>
        <div style={heroTextContainer}>
          <p style={heroSubHeader}>We are obsessed with</p>
          <h1 style={heroMainHeader}>Healthy<br />Eating<br />Made Easy</h1>
          <p style={heroDescription}>Explore our healthy meal delivery options and reduce your carbon footprint with every bite.</p>

          <div style={heroActionRow}>
            <button onClick={() => navigate('/inventory')} style={exploreBtn}>
              Manage Fridge →
            </button>
            <div style={featuredMealBox} className="featured-meal-description">
              <span style={bulletStyle} className="highlight-bullet">&bull;</span>
              <p style={featuredText}>Quick, easy, and delicious
                <span style={mealName} className="meal-name">Grilled chicken rice chickpeas!</span>
              </p>
            </div>
          </div>
        </div>

        <div style={heroImageWrapper}>
          <div style={circlePattern}></div>
          <img src={saladImg} alt="Main Salad" style={mainSaladImg} />
          <img src={pizzaImg} style={floatingPizza} alt="pizza" />
          <img src={biryaniImg} style={floatingBiryani} alt="biryani" />
          <img src={juiceImg} style={floatingJuice} alt="juice" />
        </div>
      </div>

      {/* --- ABOUT US SECTION --- */}
      <section id="about-us" style={aboutSection}>
        <div style={aboutContainer} className="about-reveal">
          <h2 style={aboutHeading}>About SustainEats</h2>
          <p style={aboutSubText}>
            SustainEats is an AI-powered platform designed to bridge the gap between
            <strong> healthy eating</strong> and <strong>environmental sustainability</strong>.
          </p>

          <div style={missionGrid}>
            <div style={missionCard} className="mission-card-3d">
              <div style={missionIcon} className="mission-icon-animate">🌱</div>
              <h3 style={missionTitle}>Eco-Conscious</h3>
              <p style={missionDesc}>We provide a 1-10 Eco-Score based on carbon footprint and water usage for every meal.</p>
            </div>
            <div style={missionCard} className="mission-card-3d">
              <div style={missionIcon} className="mission-icon-animate">📉</div>
              <h3 style={missionTitle}>Waste Tracker</h3>
              <p style={missionDesc}>Our "Manage Fridge" system suggests recipes based on your existing ingredients to reduce food waste.</p>
            </div>
            <div style={missionCard} className="mission-card-3d">
              <div style={missionIcon} className="mission-icon-animate">🤖</div>
              <h3 style={missionTitle}>AI Powered</h3>
              <p style={missionDesc}>Using MongoDB and AI, we personalize meal plans to fit your health goals and eco-values.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER SECTION --- */}
      <footer style={footerSection}>
        <div style={footerContainer}>
          <div style={footerColumn}>
            <div style={footerLogo}>🌱 SUSTAINEATS</div>
            <p style={footerAboutText}>
              Making sustainable eating effortless through AI-driven meal planning and
              real-time food waste tracking.
            </p>
          </div>

          <div style={footerColumn}>
            <h4 style={footerHeading}>Quick Links</h4>
            <ul style={footerList}>
              <li><Link to="/home" style={footerLink}>Home</Link></li>
              <li><a href="#about-us" style={footerLink}>About Us</a></li>
              <li><Link to="/recipes" style={footerLink}>Recipes</Link></li>
              <li><Link to="/feedback" style={footerLink}>Feedback</Link></li>
            </ul>
          </div>

          <div style={footerColumn}>
            <h4 style={footerHeading}>Contact Us</h4>
            <ul style={footerList}>
              <li style={footerInfoItem}>
                <span style={footerIcon}>📍</span>
                <span>Airoli, Navi Mumbai</span>
              </li>
              <li style={footerInfoItem}>
                <span style={footerIcon}>📧</span>
                <a href="mailto:support@sustaineats.com" style={footerInfoLink}>support@sustaineats.com</a>
              </li>
              <li style={footerInfoItem}>
                <span style={footerIcon}>📞</span>
                <a href="tel:+919004567321" style={footerInfoLink}>+91 90045 67321</a>
              </li>
            </ul>
          </div>
        </div>

        <div style={footerBottom}>
          <p>© 2026 SustainEats Project | Developed by Upasana Solanki</p>
        </div>
      </footer>
    </div>
  );
};

// --- STYLES ---
const mainContainer = { backgroundColor: '#052a1a', minHeight: '100vh', width: '100%', color: 'white', fontFamily: "'Poppins', sans-serif", overflowX: 'hidden', position: 'relative', scrollBehavior: 'smooth' };

const navbarStyle = { display: 'flex', justifyContent: 'space-between', padding: '30px 8%', alignItems: 'center' };
const logoStyle = { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' };
const leafIconStyle = { fontSize: '32px' };
const brandTextStyle = { fontSize: '28px', fontWeight: '800', letterSpacing: '2px', color: '#99ff66', textTransform: 'uppercase' };

const navLinks = { display: 'flex', gap: '30px', alignItems: 'center' };
const navLink = { color: '#a0a0a0', textDecoration: 'none', fontSize: '18px', transition: 'color 0.3s' };
const activeNavLink = { color: '#ffcc33', textDecoration: 'none', fontWeight: 'bold', borderBottom: '2px solid #ffcc33', fontSize: '18px' };

const logoutBtnStyle = { backgroundColor: 'transparent', color: '#ff6666', border: '2px solid #ff6666', padding: '8px 20px', borderRadius: '50px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', marginLeft: '10px' };

const heroSection = { display: 'flex', padding: '0 8%', alignItems: 'center', justifyContent: 'space-between', marginTop: '40px', minHeight: '85vh' };
const heroTextContainer = { flex: 1, zIndex: 2 };
const heroSubHeader = { fontSize: '32px', margin: 0, fontWeight: '300', color: '#99ff66' };
const heroMainHeader = { fontSize: '100px', fontWeight: '900', lineHeight: '0.9', margin: '15px 0' };
const heroDescription = { fontSize: '22px', color: '#ccc', marginBottom: '50px', maxWidth: '600px' };
const heroActionRow = { display: 'flex', alignItems: 'center', gap: '40px' };
const exploreBtn = { backgroundColor: '#ffcc33', color: '#000', border: 'none', padding: '22px 45px', borderRadius: '60px', fontWeight: 'bold', fontSize: '22px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(255,204,51,0.3)' };

const featuredMealBox = { display: 'flex', alignItems: 'flex-start', gap: '15px', maxWidth: '350px' };
const bulletStyle = { color: '#ffcc33', fontSize: '35px', lineHeight: '1' };
const featuredText = { fontSize: '18px', color: '#eee', margin: 0, lineHeight: '1.4' };
const mealName = { display: 'block', color: '#99ff66', fontWeight: 'bold', fontSize: '20px', marginTop: '5px' };

const heroImageWrapper = { flex: 1, position: 'relative', display: 'flex', justifyContent: 'center' };
const mainSaladImg = { width: '115%', zIndex: 5, filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.6))' };
const circlePattern = { position: 'absolute', width: '650px', height: '650px', border: '50px solid rgba(255,255,255,0.02)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 };
const floatingPizza = { position: 'absolute', width: '160px', top: '-30px', right: '10px', zIndex: 6 };
const floatingBiryani = { position: 'absolute', width: '200px', bottom: '-10px', right: '-30px', zIndex: 6 };
const floatingJuice = { position: 'absolute', width: '130px', bottom: '30px', left: '-50px', zIndex: 6 };

const aboutSection = {
  padding: '150px 8%',
  backgroundColor: '#052a1a',
  background: 'radial-gradient(circle at 70% 30%, rgba(153, 255, 102, 0.05) 0%, rgba(5, 42, 26, 1) 70%)',
  position: 'relative',
  overflow: 'hidden'
};
const aboutContainer = { width: '100%', maxWidth: '1300px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 };
const aboutHeading = { fontSize: '72px', fontWeight: '900', color: '#99ff66', marginBottom: '40px', letterSpacing: '-2px' };
const aboutSubText = { fontSize: '26px', color: '#eee', maxWidth: '950px', margin: '0 auto 100px auto', lineHeight: '1.8', fontWeight: '300' };
const missionGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '50px' };
const missionCard = { padding: '60px 45px', borderRadius: '50px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' };
const missionIcon = { fontSize: '60px', marginBottom: '20px' };
const missionTitle = { fontSize: '32px', color: '#ffcc33', marginBottom: '10px', fontWeight: '800', letterSpacing: '-1px' };
const missionDesc = { color: '#bbb', lineHeight: '1.7', fontSize: '19px', fontWeight: '400' };

const footerSection = { backgroundColor: '#031a10', padding: '100px 8% 40px 8%', borderTop: '1px solid rgba(153, 255, 102, 0.1)' };
const footerContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '50px', maxWidth: '1300px', margin: '0 auto' };
const footerColumn = { display: 'flex', flexDirection: 'column', gap: '20px' };
const footerLogo = { fontSize: '24px', fontWeight: 'bold', color: '#ffcc33', display: 'flex', alignItems: 'center', gap: '10px' };
const footerAboutText = { color: '#aaa', fontSize: '16px', lineHeight: '1.8', maxWidth: '300px' };
const footerHeading = { fontSize: '22px', fontWeight: 'bold', color: 'white', marginBottom: '15px' };
const footerList = { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' };
const footerLink = { color: '#aaa', textDecoration: 'none', fontSize: '18px', transition: 'all 0.3s ease' };

const footerInfoItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  color: '#aaa',
  fontSize: '18px',
  lineHeight: '1.8',
  transition: 'transform 0.3s ease'
};

const footerIcon = {
  fontSize: '22px',
  filter: 'drop-shadow(0 0 5px rgba(255,204,51,0.2))'
};

const footerInfoLink = {
  color: 'inherit',
  textDecoration: 'none',
  transition: 'color 0.3s ease'
};

const footerBottom = { marginTop: '80px', paddingTop: '30px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center', color: '#555', fontSize: '14px' };

export default Home;
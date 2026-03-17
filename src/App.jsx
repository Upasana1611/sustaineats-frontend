import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Home from './Home';
import Inventory from './Inventory';
import Profile from './Profile'; 
import Feedback from './Feedback';
import Recipes from './Recipes'; 
import AdminDashboard from "./AdminDashboard";
import ShoppingList from './ShoppingList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        {/* 2. This is your "Fridge" page. Ensure your Navbar uses <Link to="/inventory"> */}
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feedback" element={<Feedback />} />
        {/* 3. Added the Recipes Route */}
        <Route path="/recipes" element={<Recipes />} /> 
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/shopping-list" element={<ShoppingList />} />
      </Routes>
    </Router>
  );
}

export default App;
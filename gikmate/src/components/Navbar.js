import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PiSignIn, PiSignOut } from 'react-icons/pi';
import '../styles/Navbar.css';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useContext(AuthContext);

  // Move useEffect to top level
  useEffect(() => {
    // Add any necessary side effects here, or leave empty if not needed
  }, [isLoggedIn]);

  return (
    <nav className="navbar">
      <Link to="/main" className="gik-logo">
        Gikmate
      </Link>
      <div className="nav-right">
        {isLoggedIn && user && (
          <div className="nav-button logout-link" onClick={logout}>
            <PiSignOut className="login-icon" />
            Logout
          </div>
        )}
        {!isLoggedIn && (
          <Link to="/" className="nav-button login-link">
            <PiSignIn className="login-icon" />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
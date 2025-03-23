import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DormSearchPage from './pages/DormSearchPage';
import MainPage from './pages/MainPage';
import Navbar from './components/Navbar';
import AuthProvider from './context/AuthContext';
import AdminPage from './pages/AdminPage';

function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/signup', '/dorm-search'];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);

  return (
    <div className={`App ${shouldHideNavbar ? '' : 'with-navbar'}`}>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/dorm-search" element={<DormSearchPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import MockMindLogo from '../Logo/index.jsx';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <nav className="navbar">
      <div className="navbar-glow" />
      <Link to="/" className="navbar-brand">
        <MockMindLogo size={30} showText={true} />
      </Link>

      <div className="navbar-links">
        {[['/', 'Dashboard'], ['/setup', 'New Interview'], ['/history', 'History']].map(([path, label]) => (
          <Link key={path} to={path} className={`nav-link ${isActive(path) ? 'active' : ''}`}>
            {label}
            {isActive(path) && <span className="nav-active-dot" />}
          </Link>
        ))}
      </div>

      <div className="navbar-right">
        <button className="theme-toggle" onClick={toggle} title="Toggle theme">
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
        <div className="nav-profile" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="avatar-sm">{initials}</div>
          <span className="nav-username">{user?.name?.split(' ')[0]}</span>
          <span className="nav-chevron">▾</span>
          {menuOpen && (
            <div className="nav-dropdown" onClick={e => e.stopPropagation()}>
              <div className="dropdown-header">
                <div className="avatar-md">{initials}</div>
                <div>
                  <div className="dropdown-name">{user?.name}</div>
                  <div className="dropdown-email">{user?.email}</div>
                </div>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => { navigate('/profile'); setMenuOpen(false); }}>👤 My Profile</button>
              <button className="dropdown-item" onClick={() => { navigate('/setup'); setMenuOpen(false); }}>🎙️ New Interview</button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={handleLogout}>🚪 Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

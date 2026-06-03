import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../styles/tasty.css';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);





  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="main-header">
      <div className="container header-inner">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Tasty Uleam
        </div>
        <nav className="navbar">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            INICIO
          </Link>

        </nav>
      </div>
    </header>
  );
}

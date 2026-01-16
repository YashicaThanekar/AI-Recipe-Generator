import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          SAVORA AI
        </Link>

        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="nav-overlay" 
            onClick={closeMobileMenu}
          ></div>
        )}
        
        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          
          {user && (
            <>
              <Link 
                to="/history" 
                className={`nav-link ${isActive('/history') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                History
              </Link>
              <Link 
                to="/favorites" 
                className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Favorites
              </Link>
            </>
          )}
          
          {user ? (
            <div className="nav-user">
              <span className="user-email">
                {user.email?.split('@')[0]}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login" onClick={closeMobileMenu}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

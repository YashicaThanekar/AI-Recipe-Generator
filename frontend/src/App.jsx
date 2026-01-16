import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import History from './pages/History';
import Favorites from './pages/Favorites';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import styles
import './styles.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h2 style={{ marginTop: '1rem' }}>Loading SAVORA AI...</h2>
        <p style={{ opacity: 0.7, fontSize: '1rem' }}>Preparing your kitchen...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/history" element={<History user={user} />} />
          <Route path="/favorites" element={<Favorites user={user} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
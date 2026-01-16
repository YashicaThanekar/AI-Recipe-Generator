import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-section">
          <h3 className="footer-brand">SavoraAI</h3>
          <p className="footer-tagline">
            Your AI-powered cooking companion. Transform ingredients into culinary masterpieces with the power of artificial intelligence.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" className="social-link" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/history">History</Link></li>
            <li><Link to="/favorites">Favorites</Link></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#features">Features</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div className="footer-section">
          <h4 className="footer-heading">Resources</h4>
          <ul className="footer-links">
            <li><a href="#how-to-use">How to Use</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">FAQs</a></li>
            <li><a href="#">Support</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="footer-section">
          <h4 className="footer-heading">Legal</h4>
          <ul className="footer-links">
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Cookie Policy</a></li>
            <li><a href="#">Disclaimer</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-section">
          <h4 className="footer-heading">Stay Updated</h4>
          <p className="footer-newsletter-text">Get recipe tips and updates delivered to your inbox.</p>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Your email" 
              className="newsletter-input"
            />
            <button className="newsletter-btn">Subscribe</button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} SavoraAI. All rights reserved.</p>
        <p>Made with passion by food lovers, for food lovers</p>
      </div>
    </footer>
  );
}

export default Footer;

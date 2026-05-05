import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const { theme, language, toggleTheme, toggleLanguage, t } = useSettings();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="S.A.M.A Group" />
        </Link>

        <div className="nav-settings">
          <button
            className="nav-toggle-btn"
            onClick={toggleLanguage}
            title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
          >
            {language === 'ar' ? 'EN' : 'ع'}
          </button>
          <button
            className="nav-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              {t('home')}
            </Link>
          </li>
          <li>
            <Link to="/projects" className={isActive('/projects') ? 'active' : ''}>
              {t('projects')}
            </Link>
          </li>
          <li>
            <Link to="/gallery" className={isActive('/gallery') ? 'active' : ''}>
              {t('ourWorks')}
            </Link>
          </li>
          <li>
            <a href="#about">{t('about')}</a>
          </li>
          <li>
            <a href="#contact">{t('contact')}</a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

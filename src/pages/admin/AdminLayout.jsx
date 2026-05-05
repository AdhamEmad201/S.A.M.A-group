import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminLayout = ({ children, title }) => {
  const { admin, logout }   = useAuth();
  const { theme, language, toggleTheme, toggleLanguage, t } = useSettings();
  const navigate            = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success(t('logout'));
    navigate('/admin/login');
  };

  const navItems = [
    {
      to: '/admin', end: true, label: t('adminDashboard'),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    },
    {
      to: '/admin/create', label: t('addProjectNav'),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
    },
    {
      to: '/admin/gallery', label: t('companyWorksNav'),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    },
  ];

  return (
    <div className="admin-layout">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Link to="/" target="_blank">
            <img src="/logo.png" alt="S.A.M.A Group" />
          </Link>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">{language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          <p className="sidebar-section-label" style={{ marginTop: '12px' }}>{language === 'ar' ? 'الموقع' : 'Website'}</p>
          <a href="/" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            {t('viewSite')}
          </a>

          {/* Settings toggles */}
          <p className="sidebar-section-label" style={{ marginTop: '12px' }}>{language === 'ar' ? 'الإعدادات' : 'Settings'}</p>
          <button className="sidebar-nav-btn" onClick={toggleLanguage} style={{ color: 'var(--gold)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            {language === 'ar' ? 'English' : 'العربية'}
          </button>
          <button className="sidebar-nav-btn" onClick={toggleTheme} style={{ color: 'var(--gold)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{theme === 'dark' ? <circle cx="12" cy="12" r="5" /> : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />}</svg>
            {theme === 'dark' ? (language === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (language === 'ar' ? 'الوضع الداكن' : 'Dark Mode')}
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{admin?.email?.charAt(0).toUpperCase()}</div>
            <span className="user-email">{admin?.email}</span>
          </div>
          <button className="sidebar-nav-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            {t('logout')}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <div className="topbar-title">
            <span>S.A.M.A</span> — {title || t('adminDashboard')}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="nav-toggle-btn" onClick={toggleLanguage} title="Toggle language">
              {language === 'ar' ? 'EN' : 'ع'}
            </button>
            <button className="nav-toggle-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;

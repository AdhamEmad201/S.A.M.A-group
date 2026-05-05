import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import { useSettings } from '../context/SettingsContext';
import './Home.css';

const serviceIcons = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
];

const Home = () => {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects]   = useState(true);
  const { t } = useSettings();

  const stats = [
    { num: '150+', label: t('completedProjects') },
    { num: '12+',  label: t('yearsExperience') },
    { num: '500+', label: t('happyClients') },
    { num: '10+',  label: t('cities') },
  ];

  const services = [
    { icon: serviceIcons[0], title: t('svc1Title'), desc: t('svc1Desc') },
    { icon: serviceIcons[1], title: t('svc2Title'), desc: t('svc2Desc') },
    { icon: serviceIcons[2], title: t('svc3Title'), desc: t('svc3Desc') },
    { icon: serviceIcons[3], title: t('svc4Title'), desc: t('svc4Desc') },
  ];

  const aboutFeatures = [
    t('aboutFeature1'), t('aboutFeature2'), t('aboutFeature3'), t('aboutFeature4'),
  ];

  useEffect(() => {
    projectsAPI.getAll({ featured: true })
      .then(({ data }) => setFeaturedProjects(data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingProjects(false));
  }, []);

  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">S.A.M.A Group</div>
          <h1 className="hero-title">
            <span>{t('heroTitle1')}</span>
            <span className="hero-title-gold">{t('heroTitle2')}</span>
          </h1>
          <p className="hero-subtitle">{t('heroSubtitle')}</p>
          <div className="hero-actions">
            <Link to="/projects" className="btn btn-gold">
              {t('viewProjects')}
            </Link>
            <a href="#about" className="btn btn-outline">
              {t('learnMore')}
            </a>
          </div>
        </div>
        <a href="#about" className="scroll-down" aria-label="Scroll down">
          <span />
        </a>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="section about-section" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-image-wrap">
              <div className="about-image-frame">
                <img src="/logo.png" alt="S.A.M.A Group" className="about-logo-img" />
              </div>
              <div className="about-badge-float">
                <span className="about-badge-num">12+</span>
                <span className="about-badge-txt">{t('yearsExperience')}</span>
              </div>
            </div>
            <div className="about-content">
              <div className="gold-line" />
              <h2 className="section-title">{t('aboutTitle')}</h2>
              <p className="about-text">{t('aboutP1')}</p>
              <p className="about-text">{t('aboutP2')}</p>
              <div className="about-features">
                {aboutFeatures.map((f, i) => (
                  <div key={i} className="about-feature">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/projects" className="btn btn-gold" style={{ marginTop: '20px' }}>
                {t('projects')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="section services-section" id="services">
        <div className="container">
          <div className="section-header">
            <div className="gold-line center" />
            <h2 className="section-title" style={{ textAlign: 'center' }}>{t('servicesTitle')}</h2>
            <p className="section-subtitle" style={{ textAlign: 'center' }}>{t('servicesSubtitle')}</p>
          </div>
          <div className="services-grid">
            {services.map((s, i) => (
              <div key={i} className="service-card">
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="gold-line" />
              <h2 className="section-title">{t('featuredTitle')}</h2>
              <p className="section-subtitle">{t('featuredSubtitle')}</p>
            </div>
            <Link to="/projects" className="btn btn-outline">
              {t('viewAll')}
            </Link>
          </div>

          {loadingProjects ? (
            <div className="page-loader" style={{ minHeight: '300px' }}>
              <div className="spinner" />
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="projects-grid">
              {featuredProjects.map((p) => (
                <ProjectCard key={p._id} project={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>{t('noProjectsYet')}</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="cta-overlay" />
        <div className="container cta-content">
          <h2>{t('ctaTitle')}</h2>
          <p>{t('ctaSubtitle')}</p>
          <a href="#contact" className="btn btn-gold">
            {t('contactNow')}
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;

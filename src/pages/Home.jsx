import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import './Home.css';

const stats = [
  { num: '15+', label: 'مشروع منجز' },
  { num: '14+', label: 'سنة خبرة' },
  { num: '200+', label: 'عميل' },
  { num: '10+', label: 'مدن' },
];

const services = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
    title: 'بيع وشراء العقارات',
    desc: 'نقدم أفضل الفرص العقارية بأسعار تنافسية مع ضمان الجودة والموقع المتميز.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    ),
    title: 'الاستثمار العقاري',
    desc: 'استثمر أموالك بذكاء مع خبرتنا في تحليل السوق وتحديد الفرص الاستثمارية المناسبة.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
    ),
    title: 'الاستشارات العقارية',
    desc: 'فريق من الخبراء لتقديم استشارات متخصصة تساعدك على اتخاذ القرار الصحيح.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
    ),
    title: 'إدارة العقارات',
    desc: 'ندير عقاراتك باحترافية لضمان أعلى عائد استثماري مع راحة بال تامة.',
  },
];

const Home = () => {
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

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
            <span>استثمر بثقة</span>
            <span className="hero-title-gold">في أفضل العقارات</span>
          </h1>
          <p className="hero-subtitle">
            Mamdouh Shaykoon Investment — شريكك الموثوق في عالم الاستثمار العقاري منذ أكثر من 12 عاماً
          </p>
          <div className="hero-actions">
            <Link to="/projects" className="btn btn-gold">
              استعرض مشاريعنا
            </Link>
            <a href="#about" className="btn btn-outline">
              تعرف علينا
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
                <span className="about-badge-txt">سنة خبرة</span>
              </div>
            </div>
            <div className="about-content">
              <div className="gold-line" />
              <h2 className="section-title">عن S.A.M.A Group</h2>
              <p className="about-text">
                    مجموعة سما هي شركة رائدة في مجال الاستثمار العقاري، تأسست على يد المهندس{" "}
                    <strong>ممدوح شيخون</strong>{" "}
                    برؤية واضحة وهدف محدد: تقديم أفضل الفرص الاستثمارية العقارية بجودة عالية وخدمة متميزة.
                  </p>

              <p className="about-text">
                على مدار أكثر من 12 عاماً، نجحنا في تطوير وتسويق مئات المشاريع العقارية المتنوعة،
                من الوحدات السكنية الفاخرة إلى المجمعات التجارية المتكاملة.
              </p>
              <div className="about-features">
                {['خبرة واسعة في السوق', 'فريق متخصص ومحترف', 'شفافية تامة في التعاملات', 'دعم ما بعد البيع'].map((f, i) => (
                  <div key={i} className="about-feature">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Link to="/projects" className="btn btn-gold" style={{ marginTop: '20px' }}>
                مشاريعنا
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
            <h2 className="section-title" style={{ textAlign: 'center' }}>خدماتنا</h2>
            <p className="section-subtitle" style={{ textAlign: 'center' }}>
              نقدم مجموعة متكاملة من الخدمات العقارية لتلبية جميع احتياجاتك
            </p>
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
              <h2 className="section-title">المشاريع المميزة</h2>
              <p className="section-subtitle">اختيارات حصرية من أفضل مشاريعنا</p>
            </div>
            <Link to="/projects" className="btn btn-outline">
              عرض الكل
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
              <p>سيتم إضافة المشاريع قريباً</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="cta-overlay" />
        <div className="container cta-content">
          <h2>هل أنت مستعد للاستثمار؟</h2>
          <p>تواصل معنا اليوم واكتشف أفضل الفرص العقارية المتاحة</p>
          <a href="#contact" className="btn btn-gold">
            تواصل معنا الآن
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;

import { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import './Projects.css';

const categories = ['الكل', 'عقارات', 'سكني', 'تجاري', 'صناعي'];
const statuses = ['الكل', 'متاح', 'قيد الإنشاء', 'مباع'];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [activeStatus, setActiveStatus] = useState('الكل');
  const [search, setSearch] = useState('');

  useEffect(() => {
    projectsAPI.getAll()
      .then(({ data }) => { setProjects(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...projects];
    if (activeCategory !== 'الكل') result = result.filter((p) => p.category === activeCategory);
    if (activeStatus !== 'الكل') result = result.filter((p) => p.status === activeStatus);
    if (search.trim()) result = result.filter((p) => p.title.includes(search) || p.description.includes(search) || (p.location && p.location.includes(search)));
    setFiltered(result);
  }, [activeCategory, activeStatus, search, projects]);

  return (
    <div className="projects-page">
      <div className="projects-hero">
        <div className="projects-hero-overlay" />
        <div className="container">
          <h1>مشاريعنا</h1>
          <p>اكتشف مجموعة متنوعة من المشاريع العقارية المتميزة</p>
        </div>
      </div>

      <div className="projects-body section">
        <div className="container">
          <div className="filters-bar">
            <div className="search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="ابحث عن مشروع..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`filter-btn ${activeCategory === c ? 'active' : ''}`}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="filter-group">
              {statuses.map((s) => (
                <button
                  key={s}
                  className={`filter-btn ${activeStatus === s ? 'active' : ''}`}
                  onClick={() => setActiveStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="page-loader" style={{ minHeight: '400px' }}>
              <div className="spinner" />
              <p style={{ color: '#666' }}>جاري التحميل...</p>
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="results-count">{filtered.length} مشروع</p>
              <div className="projects-grid-full">
                {filtered.map((p) => (
                  <ProjectCard key={p._id} project={p} />
                ))}
              </div>
            </>
          ) : (
            <div className="no-results">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <h3>لا توجد نتائج</h3>
              <p>حاول تغيير معايير البحث أو الفلترة</p>
              <button className="btn btn-outline" onClick={() => { setActiveCategory('الكل'); setActiveStatus('الكل'); setSearch(''); }}>
                إعادة التعيين
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;

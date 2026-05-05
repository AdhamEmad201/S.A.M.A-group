import { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import ProjectCard from '../components/ProjectCard';
import { useSettings } from '../context/SettingsContext';
import './Projects.css';

// Arabic values used in Firestore
const CATEGORY_VALUES = ['الكل', 'عقارات', 'سكني', 'تجاري', 'صناعي'];
const STATUS_VALUES   = ['الكل', 'متاح', 'قيد الإنشاء', 'مباع'];

const Projects = () => {
  const [projects, setProjects]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [activeStatus, setActiveStatus]     = useState('الكل');
  const [search, setSearch]             = useState('');
  const { t } = useSettings();

  // Labels shown in UI for each value
  const categoryLabels = {
    'الكل': t('catAll'), 'عقارات': t('catRealEstate'), 'سكني': t('catResidential'),
    'تجاري': t('catCommercial'), 'صناعي': t('catIndustrial'),
  };
  const statusLabels = {
    'الكل': t('statusAll'), 'متاح': t('statusAvailable'),
    'قيد الإنشاء': t('statusBuilding'), 'مباع': t('statusSold'),
  };

  useEffect(() => {
    projectsAPI.getAll()
      .then(({ data }) => { setProjects(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...projects];
    if (activeCategory !== 'الكل') result = result.filter((p) => p.category === activeCategory);
    if (activeStatus !== 'الكل')   result = result.filter((p) => p.status === activeStatus);
    if (search.trim())
      result = result.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        (p.location && p.location.toLowerCase().includes(search.toLowerCase()))
      );
    setFiltered(result);
  }, [activeCategory, activeStatus, search, projects]);

  return (
    <div className="projects-page">
      <div className="projects-hero">
        <div className="projects-hero-overlay" />
        <div className="container">
          <h1>{t('ourProjects')}</h1>
          <p>{t('projectsSubtitle')}</p>
        </div>
      </div>

      <div className="projects-body section">
        <div className="container">
          <div className="filters-bar">
            <div className="search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              {CATEGORY_VALUES.map((c) => (
                <button
                  key={c}
                  className={`filter-btn ${activeCategory === c ? 'active' : ''}`}
                  onClick={() => setActiveCategory(c)}
                >
                  {categoryLabels[c]}
                </button>
              ))}
            </div>

            <div className="filter-group">
              {STATUS_VALUES.map((s) => (
                <button
                  key={s}
                  className={`filter-btn ${activeStatus === s ? 'active' : ''}`}
                  onClick={() => setActiveStatus(s)}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="page-loader" style={{ minHeight: '400px' }}>
              <div className="spinner" />
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="results-count">{filtered.length} {t('results')}</p>
              <div className="projects-grid-full">
                {filtered.map((p) => (
                  <ProjectCard key={p._id} project={p} />
                ))}
              </div>
            </>
          ) : (
            <div className="no-results">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <h3>{t('noResults')}</h3>
              <p>{t('noResultsHint')}</p>
              <button className="btn btn-outline" onClick={() => { setActiveCategory('الكل'); setActiveStatus('الكل'); setSearch(''); }}>
                {t('resetFilters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;

import { Link } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  const [visible, setVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const statusMap = {
    'متاح': { cls: 'badge-available', label: 'متاح' },
    'مباع': { cls: 'badge-sold', label: 'مباع' },
    'قيد الإنشاء': { cls: 'badge-building', label: 'قيد الإنشاء' },
  };

  const statusInfo = statusMap[project.status] || statusMap['متاح'];
  const coverImage = project.coverImage || project.images?.[0]?.url;

  return (
    <div ref={cardRef} className={`project-card ${visible ? 'visible' : ''}`}>
      <Link to={`/projects/${project.slug}`} className="card-image-wrap">
        {coverImage ? (
          <img
            src={coverImage}
            alt={project.title}
            loading="lazy"
            className="card-image"
          />
        ) : (
          <div className="card-image-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
        )}
        <div className="card-overlay">
          <span className="view-btn">عرض المشروع ←</span>
        </div>
        {project.featured && <span className="card-featured badge badge-featured">مميز ★</span>}
      </Link>

      <div className="card-body">
        <div className="card-meta">
          <span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span>
          {project.category && <span className="card-category">{project.category}</span>}
        </div>

        <h3 className="card-title">
          <Link to={`/projects/${project.slug}`}>{project.title}</Link>
        </h3>

        {project.location && (
          <p className="card-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {project.location}
          </p>
        )}

        <p className="card-desc">{project.description.slice(0, 120)}{project.description.length > 120 ? '...' : ''}</p>

        <div className="card-footer">
          <div className="card-stats">
            {project.images?.length > 0 && (
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                {project.images.length} صورة
              </span>
            )}
            {project.videos?.length > 0 && (
              <span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                {project.videos.length} فيديو
              </span>
            )}
          </div>
          <Link to={`/projects/${project.slug}`} className="card-btn">
            التفاصيل
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import toast from 'react-hot-toast';
import './ProjectDetail.css';

const getYoutubeEmbed = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&?#]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const ProjectDetail = () => {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    projectsAPI.getBySlug(slug)
      .then(({ data }) => setProject(data))
      .catch(() => toast.error('المشروع غير موجود'))
      .finally(() => setLoading(false));
  }, [slug]);

  const openLightbox = (img, idx) => { setLightboxImg(img); setLightboxIdx(idx); };
  const closeLightbox = () => setLightboxImg(null);

  const prevImage = () => {
    if (!project) return;
    const idx = (lightboxIdx - 1 + project.images.length) % project.images.length;
    setLightboxIdx(idx);
    setLightboxImg(project.images[idx]);
  };

  const nextImage = () => {
    if (!project) return;
    const idx = (lightboxIdx + 1) % project.images.length;
    setLightboxIdx(idx);
    setLightboxImg(project.images[idx]);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (!lightboxImg) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') nextImage();
      if (e.key === 'ArrowRight') prevImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxImg, lightboxIdx]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('تم نسخ الرابط!');
    setTimeout(() => setCopied(false), 2500);
  };

  const statusMap = {
    'متاح': 'badge-available',
    'مباع': 'badge-sold',
    'قيد الإنشاء': 'badge-building',
  };

  if (loading) {
    return (
      <div className="page-loader" style={{ minHeight: '100vh', paddingTop: '80px' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="not-found-wrap">
        <h2>المشروع غير موجود</h2>
        <Link to="/projects" className="btn btn-gold">العودة للمشاريع</Link>
      </div>
    );
  }

  return (
    <div className="project-detail">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-overlay" />
        {project.images?.[0] && (
          <img src={project.images[0].url} alt={project.title} className="detail-header-bg" />
        )}
        <div className="container detail-header-content">
          <div className="breadcrumb">
            <Link to="/">الرئيسية</Link>
            <span>›</span>
            <Link to="/projects">المشاريع</Link>
            <span>›</span>
            <span>{project.title}</span>
          </div>
          <div className="detail-meta">
            <span className={`badge ${statusMap[project.status] || 'badge-available'}`}>{project.status}</span>
            {project.featured && <span className="badge badge-featured">مميز ★</span>}
            <span className="detail-category">{project.category}</span>
          </div>
          <h1 className="detail-title">{project.title}</h1>
          {project.location && (
            <p className="detail-location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              {project.location}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="section">
        <div className="container detail-body">
          <div className="detail-main">
            {/* Description */}
            <div className="detail-section-block">
              <h2 className="detail-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>
                وصف المشروع
              </h2>
              <p className="detail-desc">{project.description}</p>
            </div>

            {/* Gallery */}
            {project.images?.length > 0 && (
              <div className="detail-section-block">
                <h2 className="detail-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  معرض الصور ({project.images.length})
                </h2>
                <div className="gallery-grid">
                  {project.images.map((img, i) => (
                    <div
                      key={i}
                      className="gallery-item"
                      onClick={() => openLightbox(img, i)}
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <img src={img.url} alt={`${project.title} - ${i + 1}`} loading="lazy" />
                      <div className="gallery-item-overlay">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {project.videos?.length > 0 && (
              <div className="detail-section-block">
                <h2 className="detail-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                  الفيديوهات ({project.videos.length})
                </h2>
                <div className="videos-grid">
                  {project.videos.map((video, i) => {
                    const embedUrl = video.type === 'link' ? getYoutubeEmbed(video.url) : null;
                    return (
                      <div key={i} className="video-item">
                        {video.type === 'upload' ? (
                          <video controls className="video-player" preload="metadata">
                            <source src={video.url} />
                            متصفحك لا يدعم الفيديو
                          </video>
                        ) : embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={video.title || `فيديو ${i + 1}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="video-iframe"
                          />
                        ) : (
                          <a href={video.url} target="_blank" rel="noopener noreferrer" className="video-link-card">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                            <span>{video.title || 'مشاهدة الفيديو'}</span>
                          </a>
                        )}
                        {video.title && <p className="video-title">{video.title}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="detail-sidebar">
            <div className="sidebar-card">
              <h3>تفاصيل المشروع</h3>
              <div className="detail-info-list">
                <div className="detail-info-item">
                  <span className="info-label">التصنيف</span>
                  <span className="info-value">{project.category}</span>
                </div>
                <div className="detail-info-item">
                  <span className="info-label">الحالة</span>
                  <span className={`badge ${statusMap[project.status]}`}>{project.status}</span>
                </div>
                {project.location && (
                  <div className="detail-info-item">
                    <span className="info-label">الموقع</span>
                    <span className="info-value">{project.location}</span>
                  </div>
                )}
                <div className="detail-info-item">
                  <span className="info-label">الصور</span>
                  <span className="info-value">{project.images?.length || 0} صورة</span>
                </div>
                <div className="detail-info-item">
                  <span className="info-label">الفيديوهات</span>
                  <span className="info-value">{project.videos?.length || 0} فيديو</span>
                </div>
              </div>

              <button className="btn btn-gold w-full" onClick={copyLink}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                {copied ? 'تم النسخ ✓' : 'نسخ رابط المشروع'}
              </button>

              <Link to="/projects" className="btn btn-outline w-full" style={{ marginTop: '10px' }}>
                ← جميع المشاريع
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>✕</button>
          <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>‹</button>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImg.url} alt="Preview" />
            <p className="lightbox-counter">{lightboxIdx + 1} / {project.images.length}</p>
          </div>
          <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>›</button>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;

import { useEffect, useState } from 'react';
import { galleryAPI } from '../services/api';
import './Gallery.css';

const getYoutubeEmbed = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&?#]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null); // { url }

  useEffect(() => {
    galleryAPI.getAll()
      .then(({ data }) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allMedia = items.flatMap((item) => item.mediaUrls || []);

  return (
    <div className="gallery-page">
      {/* Hero */}
      <div className="gallery-hero">
        <div className="gallery-hero-overlay" />
        <div className="container">
          <h1>اوراق الشركة</h1>
          <p>صور المستندات الخاصة بشركة S.A.M.A</p>
        </div>
      </div>

      <div className="gallery-body section">
        <div className="container">
          {loading ? (
            <div className="page-loader" style={{ minHeight: '400px' }}>
              <div className="spinner" />
              <p style={{ color: '#666' }}>جاري التحميل...</p>
            </div>
          ) : allMedia.length === 0 ? (
            <div className="gallery-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
              <p>سيتم إضافة المحتوى قريباً</p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="gallery-group">
                  {(item.title || item.description) && (
                    <div className="gallery-group-header">
                      {item.title && <h2>{item.title}</h2>}
                      {item.description && <p>{item.description}</p>}
                    </div>
                  )}
                  <div className="gallery-media-grid">
                    {(item.mediaUrls || []).map((media, i) => (
                      <div key={i} className="gallery-media-item">
                        {media.type === 'image' ? (
                          <div className="gallery-img-wrap" onClick={() => setLightbox(media.url)}>
                            <img src={media.url} alt="" loading="lazy" />
                            <div className="gallery-img-overlay">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <div className="gallery-video-wrap">
                            {getYoutubeEmbed(media.url) ? (
                              <iframe
                                src={getYoutubeEmbed(media.url)}
                                title={`فيديو ${i + 1}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video controls preload="metadata">
                                <source src={media.url} />
                              </video>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox} alt="Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

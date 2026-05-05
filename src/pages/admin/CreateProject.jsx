import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import { uploadImage, uploadVideo } from '../../services/cloudinaryService';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    category: 'عقارات',
    status: 'متاح',
    featured: false,
    isPublic: true,
  });

  // coverImage: { url, preview, uploading }
  const [coverImage, setCoverImage] = useState(null);
  // { id, url, filename, preview, uploading }
  const [images, setImages] = useState([]);
  // { id, url, filename, title, uploading }
  const [videos, setVideos] = useState([]);
  const [videoLinks, setVideoLinks] = useState([{ url: '', title: '' }]);

  const isUploading =
    (coverImage?.uploading) ||
    images.some((img) => img.uploading) ||
    videos.some((v) => v.uploading);

  const handleCoverSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    setCoverImage({ url: '', preview: URL.createObjectURL(file), uploading: true });
    try {
      const url = await uploadImage(file);
      setCoverImage({ url, preview: URL.createObjectURL(file), uploading: false });
    } catch {
      toast.error('فشل رفع صورة الواجهة');
      setCoverImage(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';

    const entries = files.map((f, i) => ({
      id: `img-${Date.now()}-${i}`,
      url: '',
      filename: f.name,
      preview: URL.createObjectURL(f),
      uploading: true,
    }));

    setImages((prev) => [...prev, ...entries]);

    await Promise.all(
      entries.map(async (entry, i) => {
        try {
          const url = await uploadImage(files[i]);
          setImages((prev) =>
            prev.map((img) => (img.id === entry.id ? { ...img, url, uploading: false } : img))
          );
        } catch {
          toast.error(`فشل رفع: ${files[i].name}`);
          setImages((prev) => prev.filter((img) => img.id !== entry.id));
        }
      })
    );
  };

  const removeImage = (id) => setImages((prev) => prev.filter((img) => img.id !== id));

  const handleVideoSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';

    const entries = files.map((f, i) => ({
      id: `vid-${Date.now()}-${i}`,
      url: '',
      filename: f.name,
      title: f.name,
      uploading: true,
    }));

    setVideos((prev) => [...prev, ...entries]);

    await Promise.all(
      entries.map(async (entry, i) => {
        try {
          const url = await uploadVideo(files[i]);
          setVideos((prev) =>
            prev.map((v) => (v.id === entry.id ? { ...v, url, uploading: false } : v))
          );
        } catch {
          toast.error(`فشل رفع: ${files[i].name}`);
          setVideos((prev) => prev.filter((v) => v.id !== entry.id));
        }
      })
    );
  };

  const removeVideo = (id) => setVideos((prev) => prev.filter((v) => v.id !== id));
  const updateLink = (idx, field, val) =>
    setVideoLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: val } : l)));
  const addLink = () => setVideoLinks((prev) => [...prev, { url: '', title: '' }]);
  const removeLink = (idx) => setVideoLinks((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim())
      return toast.error('العنوان والوصف مطلوبان');
    if (isUploading) return toast.error('انتظر حتى تنتهي عملية رفع الملفات');

    const finalImages = images
      .filter((img) => img.url)
      .map((img) => ({ url: img.url, filename: img.filename }));

    const finalVideos = [
      ...videos
        .filter((v) => v.url)
        .map((v) => ({ type: 'upload', url: v.url, filename: v.filename, title: v.title || v.filename })),
      ...videoLinks
        .filter((l) => l.url.trim())
        .map((l) => ({ type: 'link', url: l.url.trim(), title: l.title || 'فيديو' })),
    ];

    setLoading(true);
    try {
      await projectsAPI.create({ form, images: finalImages, videos: finalVideos, coverImage: coverImage?.url || '' });
      toast.success('تم إنشاء المشروع بنجاح!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل إنشاء المشروع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="إضافة مشروع">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          إضافة <span>مشروع جديد</span>
        </h1>
        <button className="btn btn-outline" onClick={() => navigate('/admin')}>
          ← العودة
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-wrap">

        {/* ── المعلومات الأساسية ── */}
        <div className="admin-form-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            </svg>
            المعلومات الأساسية
          </h3>
          <div className="form-grid">
            <div className="form-field full-width">
              <label>العنوان <span>*</span></label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="اسم المشروع" required />
            </div>
            <div className="form-field full-width">
              <label>الوصف <span>*</span></label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="وصف تفصيلي للمشروع..." required />
            </div>
            <div className="form-field">
              <label>الموقع</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="المدينة / الحي / العنوان" />
            </div>
            <div className="form-field">
              <label>التصنيف</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {['عقارات', 'سكني', 'تجاري', 'صناعي', 'أراضي'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>الحالة</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>متاح</option>
                <option>قيد الإنشاء</option>
                <option>مباع</option>
              </select>
            </div>
            <div className="form-field" style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'flex-end' }}>
              <div className="checkbox-field">
                <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange} />
                <label htmlFor="featured">مشروع مميز ★</label>
              </div>
              <div className="checkbox-field">
                <input type="checkbox" id="isPublic" name="isPublic" checked={form.isPublic} onChange={handleChange} />
                <label htmlFor="isPublic">ظاهر للعموم</label>
              </div>
            </div>
          </div>
        </div>

        {/* ── صورة الواجهة (اختياري) ── */}
        <div className="admin-form-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" />
            </svg>
            صورة الواجهة
            <span style={{ color: '#666', fontSize: '0.8rem', fontWeight: 400, marginRight: '8px' }}>(اختياري — تظهر في كروت المشاريع)</span>
            {coverImage?.uploading && (
              <span className="upload-badge">
                <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                جاري الرفع...
              </span>
            )}
          </h3>

          {!coverImage ? (
            <div className="upload-zone">
              <input type="file" accept="image/*" onChange={handleCoverSelect} />
              <svg className="upload-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" />
              </svg>
              <p>اختر صورة واجهة للمشروع</p>
              <small>صورة واحدة — JPG, PNG, WebP</small>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={coverImage.preview}
                alt="صورة الواجهة"
                style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', border: '1px solid #2a2a2a', opacity: coverImage.uploading ? 0.4 : 1 }}
              />
              {coverImage.uploading ? (
                <div className="upload-overlay">
                  <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                </div>
              ) : (
                <button
                  type="button"
                  className="preview-remove"
                  style={{ top: 8, left: 8, right: 'auto' }}
                  onClick={() => setCoverImage(null)}
                >✕</button>
              )}
              {!coverImage.uploading && (
                <div style={{ marginTop: '8px' }}>
                  <label style={{ cursor: 'pointer', color: '#F39C12', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    تغيير الصورة
                    <input type="file" accept="image/*" onChange={handleCoverSelect} style={{ display: 'none' }} />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── الصور ── */}
        <div className="admin-form-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            الصور ({images.filter((img) => img.url).length} مرفوعة / {images.length} محددة)
            {images.some((img) => img.uploading) && (
              <span className="upload-badge">
                <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                جاري الرفع...
              </span>
            )}
          </h3>

          <div className="upload-zone">
            <input type="file" accept="image/*" multiple onChange={handleImageSelect} />
            <svg className="upload-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p>اضغط أو اسحب الصور هنا</p>
            <small>يُرفع فوراً إلى Cloudinary — JPG, PNG, WebP</small>
          </div>

          {images.length > 0 && (
            <div className="preview-grid" style={{ marginTop: '16px' }}>
              {images.map((img, i) => (
                <div key={img.id} className="preview-item">
                  <img src={img.preview} alt="" style={{ opacity: img.uploading ? 0.35 : 1, transition: 'opacity .3s' }} />
                  {i === 0 && !img.uploading && <div className="preview-label">غلاف</div>}
                  {img.uploading ? (
                    <div className="upload-overlay">
                      <span className="spinner" style={{ width: 26, height: 26, borderWidth: 3 }} />
                    </div>
                  ) : (
                    <button type="button" className="preview-remove" onClick={() => removeImage(img.id)}>✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── الفيديوهات ── */}
        <div className="admin-form-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            الفيديوهات ({videos.filter((v) => v.url).length} مرفوعة)
            {videos.some((v) => v.uploading) && (
              <span className="upload-badge">
                <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                جاري الرفع...
              </span>
            )}
          </h3>

          <div className="upload-zone" style={{ marginBottom: '20px' }}>
            <input type="file" accept="video/*" multiple onChange={handleVideoSelect} />
            <svg className="upload-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <p>رفع ملفات فيديو — يُرفع فوراً إلى Cloudinary</p>
            <small>MP4, WebM — حتى 200MB لكل ملف</small>
          </div>

          {videos.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {videos.map((v) => (
                <div key={v.id} className={`video-row-item ${v.uploading ? 'uploading' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
                    {v.uploading ? (
                      <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, flexShrink: 0 }} />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="#F39C12" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}>
                        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                      </svg>
                    )}
                    <span style={{ color: v.uploading ? '#666' : '#ccc', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.filename}
                    </span>
                    {v.uploading
                      ? <span style={{ color: '#F39C12', fontSize: '0.78rem', flexShrink: 0 }}>جاري الرفع...</span>
                      : <span style={{ color: '#27ae60', fontSize: '0.78rem', flexShrink: 0 }}>✓ تم الرفع</span>
                    }
                  </div>
                  {!v.uploading && (
                    <button type="button" className="remove-link-btn" onClick={() => removeVideo(v.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: '12px' }}>أو أضف روابط YouTube:</p>
          <div className="video-links-list">
            {videoLinks.map((link, i) => (
              <div key={i} className="video-link-row">
                <input placeholder="رابط YouTube أو أي رابط فيديو..." value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} dir="ltr" />
                <input placeholder="عنوان الفيديو (اختياري)" value={link.title} onChange={(e) => updateLink(i, 'title', e.target.value)} />
                <button type="button" className="remove-link-btn" onClick={() => removeLink(i)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="add-link-btn" onClick={addLink}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            إضافة رابط فيديو
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin')}>
            إلغاء
          </button>
          <button type="submit" className="btn btn-gold" disabled={loading || isUploading}>
            {isUploading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> جاري رفع الملفات...</>
            ) : loading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> جاري الحفظ...</>
            ) : (
              '✓ حفظ المشروع'
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default CreateProject;

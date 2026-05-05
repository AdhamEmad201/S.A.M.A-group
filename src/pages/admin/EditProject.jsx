import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import { uploadImage, uploadVideo } from '../../services/cloudinaryService';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    title: '', description: '', location: '',
    category: 'عقارات', status: 'متاح', featured: false, isPublic: true,
  });

  // Existing media from Firestore
  const [existingImages, setExistingImages] = useState([]); // { url, filename }
  const [existingVideos, setExistingVideos] = useState([]); // { type, url, filename?, title }
  const [removedImageUrls, setRemovedImageUrls] = useState([]);
  const [removedVideoUrls, setRemovedVideoUrls] = useState([]);

  // New files being uploaded
  const [newImages, setNewImages] = useState([]);   // { id, url, filename, preview, uploading }
  const [newVideos, setNewVideos] = useState([]);   // { id, url, filename, title, uploading }
  const [newVideoLinks, setNewVideoLinks] = useState([]);

  const isUploading = newImages.some((img) => img.uploading) || newVideos.some((v) => v.uploading);

  useEffect(() => {
    projectsAPI.adminGetAll()
      .then(({ data }) => {
        const p = data.find((x) => x._id === id);
        if (!p) { toast.error('المشروع غير موجود'); navigate('/admin'); return; }
        setForm({
          title: p.title, description: p.description, location: p.location || '',
          category: p.category, status: p.status, featured: p.featured, isPublic: p.isPublic,
        });
        setExistingImages(p.images || []);
        setExistingVideos(p.videos || []);
      })
      .catch(() => toast.error('فشل تحميل المشروع'))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ── Existing media toggles ───────────────────────────────────────────────────

  const toggleRemoveImage = (url) =>
    setRemovedImageUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );

  const toggleRemoveVideo = (url) =>
    setRemovedVideoUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );

  // ── New image upload ─────────────────────────────────────────────────────────

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';

    const entries = files.map((f, i) => ({
      id: `img-${Date.now()}-${i}`,
      url: '', filename: f.name,
      preview: URL.createObjectURL(f),
      uploading: true,
    }));

    setNewImages((prev) => [...prev, ...entries]);

    await Promise.all(
      entries.map(async (entry, i) => {
        try {
          const url = await uploadImage(files[i]);
          setNewImages((prev) =>
            prev.map((img) => (img.id === entry.id ? { ...img, url, uploading: false } : img))
          );
        } catch {
          toast.error(`فشل رفع: ${files[i].name}`);
          setNewImages((prev) => prev.filter((img) => img.id !== entry.id));
        }
      })
    );
  };

  const removeNewImage = (id) => setNewImages((prev) => prev.filter((img) => img.id !== id));

  // ── New video upload ─────────────────────────────────────────────────────────

  const handleVideoSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';

    const entries = files.map((f, i) => ({
      id: `vid-${Date.now()}-${i}`,
      url: '', filename: f.name, title: f.name, uploading: true,
    }));

    setNewVideos((prev) => [...prev, ...entries]);

    await Promise.all(
      entries.map(async (entry, i) => {
        try {
          const url = await uploadVideo(files[i]);
          setNewVideos((prev) =>
            prev.map((v) => (v.id === entry.id ? { ...v, url, uploading: false } : v))
          );
        } catch {
          toast.error(`فشل رفع: ${files[i].name}`);
          setNewVideos((prev) => prev.filter((v) => v.id !== entry.id));
        }
      })
    );
  };

  const removeNewVideo = (id) => setNewVideos((prev) => prev.filter((v) => v.id !== id));
  const addLink = () => setNewVideoLinks((prev) => [...prev, { url: '', title: '' }]);
  const updateLink = (idx, field, val) =>
    setNewVideoLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: val } : l)));
  const removeLink = (idx) => setNewVideoLinks((prev) => prev.filter((_, i) => i !== idx));

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return toast.error('العنوان والوصف مطلوبان');
    if (isUploading) return toast.error('انتظر حتى تنتهي عملية رفع الملفات');

    const finalImages = [
      ...existingImages
        .filter((img) => !removedImageUrls.includes(img.url))
        .map((img) => ({ url: img.url, filename: img.filename || '' })),
      ...newImages
        .filter((img) => img.url)
        .map((img) => ({ url: img.url, filename: img.filename })),
    ];

    const finalVideos = [
      ...existingVideos
        .filter((v) => !removedVideoUrls.includes(v.url))
        .map((v) => ({ type: v.type, url: v.url, filename: v.filename || '', title: v.title || '' })),
      ...newVideos
        .filter((v) => v.url)
        .map((v) => ({ type: 'upload', url: v.url, filename: v.filename, title: v.title || v.filename })),
      ...newVideoLinks
        .filter((l) => l.url.trim())
        .map((l) => ({ type: 'link', url: l.url.trim(), title: l.title || 'فيديو' })),
    ];

    setLoading(true);
    try {
      await projectsAPI.update(id, { form, images: finalImages, videos: finalVideos });
      toast.success('تم تحديث المشروع بنجاح!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'فشل تحديث المشروع');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (fetching) {
    return (
      <AdminLayout title="تعديل مشروع">
        <div className="page-loader" style={{ minHeight: '400px' }}>
          <div className="spinner" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="تعديل مشروع">
      <div className="admin-page-header">
        <h1 className="admin-page-title">تعديل <span>المشروع</span></h1>
        <button className="btn btn-outline" onClick={() => navigate('/admin')}>← العودة</button>
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
              <input name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-field full-width">
              <label>الوصف <span>*</span></label>
              <textarea name="description" value={form.description} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>الموقع</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>التصنيف</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {['عقارات', 'سكني', 'تجاري', 'صناعي', 'أراضي'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>الحالة</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option>متاح</option><option>قيد الإنشاء</option><option>مباع</option>
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

        {/* ── الصور الحالية ── */}
        {existingImages.length > 0 && (
          <div className="admin-form-card">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
              </svg>
              الصور الحالية ({existingImages.length - removedImageUrls.length} محفوظة)
            </h3>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '14px' }}>
              اضغط على الصورة لحذفها (تظهر بالأحمر)
            </p>
            <div className="preview-grid">
              {existingImages.map((img, i) => {
                const isRemoved = removedImageUrls.includes(img.url);
                return (
                  <div
                    key={i}
                    className="preview-item"
                    style={{
                      opacity: isRemoved ? 0.3 : 1,
                      cursor: 'pointer',
                      outline: isRemoved ? '2px solid #e74c3c' : 'none',
                    }}
                    onClick={() => toggleRemoveImage(img.url)}
                  >
                    <img src={img.url} alt="" />
                    {isRemoved && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(192,57,43,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, borderRadius: '8px' }}>
                        حذف
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── إضافة صور جديدة ── */}
        <div className="admin-form-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            إضافة صور جديدة
            {newImages.some((img) => img.uploading) && (
              <span className="upload-badge">
                <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                جاري الرفع...
              </span>
            )}
          </h3>
          <div className="upload-zone">
            <input type="file" accept="image/*" multiple onChange={handleImageSelect} />
            <svg className="upload-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            <p>اضغط أو اسحب الصور هنا</p>
            <small>يُرفع فوراً إلى Cloudinary</small>
          </div>
          {newImages.length > 0 && (
            <div className="preview-grid" style={{ marginTop: '14px' }}>
              {newImages.map((img) => (
                <div key={img.id} className="preview-item">
                  <img src={img.preview} alt="" style={{ opacity: img.uploading ? 0.35 : 1 }} />
                  {img.uploading ? (
                    <div className="upload-overlay">
                      <span className="spinner" style={{ width: 26, height: 26, borderWidth: 3 }} />
                    </div>
                  ) : (
                    <button type="button" className="preview-remove" onClick={() => removeNewImage(img.id)}>✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── الفيديوهات الحالية ── */}
        {existingVideos.length > 0 && (
          <div className="admin-form-card">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              الفيديوهات الحالية ({existingVideos.length - removedVideoUrls.length} محفوظة)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {existingVideos.map((v, i) => {
                const isRemoved = removedVideoUrls.includes(v.url);
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#0a0a0a', padding: '10px 14px', borderRadius: '8px',
                    border: `1px solid ${isRemoved ? 'rgba(192,57,43,0.5)' : '#2a2a2a'}`,
                    opacity: isRemoved ? 0.45 : 1,
                  }}>
                    <span style={{ color: '#aaa', fontSize: '0.88rem' }}>
                      {v.type === 'upload' ? '🎬' : '🔗'} {v.title || v.url.slice(0, 55)}
                    </span>
                    <button type="button" className="remove-link-btn" onClick={() => toggleRemoveVideo(v.url)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        {isRemoved
                          ? <polyline points="20 6 9 17 4 12" />
                          : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── إضافة فيديوهات جديدة ── */}
        <div className="admin-form-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            إضافة فيديوهات جديدة
            {newVideos.some((v) => v.uploading) && (
              <span className="upload-badge">
                <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                جاري الرفع...
              </span>
            )}
          </h3>

          <div className="upload-zone" style={{ marginBottom: '16px' }}>
            <input type="file" accept="video/*" multiple onChange={handleVideoSelect} />
            <svg className="upload-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <p>رفع ملفات فيديو جديدة</p>
          </div>

          {newVideos.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {newVideos.map((v) => (
                <div key={v.id} className={`video-row-item ${v.uploading ? 'uploading' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
                    {v.uploading
                      ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, flexShrink: 0 }} />
                      : <svg viewBox="0 0 24 24" fill="none" stroke="#F39C12" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                    }
                    <span style={{ color: v.uploading ? '#666' : '#ccc', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.filename}
                    </span>
                    {v.uploading
                      ? <span style={{ color: '#F39C12', fontSize: '0.78rem', flexShrink: 0 }}>جاري الرفع...</span>
                      : <span style={{ color: '#27ae60', fontSize: '0.78rem', flexShrink: 0 }}>✓ تم</span>
                    }
                  </div>
                  {!v.uploading && (
                    <button type="button" className="remove-link-btn" onClick={() => removeNewVideo(v.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="video-links-list">
            {newVideoLinks.map((link, i) => (
              <div key={i} className="video-link-row">
                <input placeholder="رابط YouTube..." value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} dir="ltr" />
                <input placeholder="عنوان الفيديو..." value={link.title} onChange={(e) => updateLink(i, 'title', e.target.value)} />
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
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin')}>إلغاء</button>
          <button type="submit" className="btn btn-gold" disabled={loading || isUploading}>
            {isUploading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> جاري رفع الملفات...</>
            ) : loading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> جاري الحفظ...</>
            ) : (
              '✓ حفظ التعديلات'
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default EditProject;

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { galleryAPI } from '../../services/api';
import { uploadImage, uploadVideo } from '../../services/cloudinaryService';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const EditGalleryItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Existing: [{ type, url }]
  const [existingMedia, setExistingMedia] = useState([]);
  const [removedUrls, setRemovedUrls] = useState([]);

  // New uploads: [{ id, type, url, preview?, filename?, uploading }]
  const [newMedia, setNewMedia] = useState([]);

  const isUploading = newMedia.some((m) => m.uploading);

  useEffect(() => {
    galleryAPI.getAll()
      .then(({ data }) => {
        const item = data.find((x) => x.id === id);
        if (!item) { toast.error('العنصر غير موجود'); navigate('/admin/gallery'); return; }
        setTitle(item.title || '');
        setDescription(item.description || '');
        setExistingMedia(item.mediaUrls || []);
      })
      .catch(() => toast.error('فشل تحميل البيانات'))
      .finally(() => setFetching(false));
  }, [id]);

  const toggleRemove = (url) =>
    setRemovedUrls((prev) => prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]);

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';
    const entries = files.map((f, i) => ({ id: `img-${Date.now()}-${i}`, type: 'image', url: '', preview: URL.createObjectURL(f), uploading: true }));
    setNewMedia((prev) => [...prev, ...entries]);
    await Promise.all(entries.map(async (entry, i) => {
      try {
        const url = await uploadImage(files[i]);
        setNewMedia((prev) => prev.map((m) => m.id === entry.id ? { ...m, url, uploading: false } : m));
      } catch {
        toast.error(`فشل رفع: ${files[i].name}`);
        setNewMedia((prev) => prev.filter((m) => m.id !== entry.id));
      }
    }));
  };

  const handleVideoSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';
    const entries = files.map((f, i) => ({ id: `vid-${Date.now()}-${i}`, type: 'video', url: '', filename: f.name, uploading: true }));
    setNewMedia((prev) => [...prev, ...entries]);
    await Promise.all(entries.map(async (entry, i) => {
      try {
        const url = await uploadVideo(files[i]);
        setNewMedia((prev) => prev.map((m) => m.id === entry.id ? { ...m, url, uploading: false } : m));
      } catch {
        toast.error(`فشل رفع: ${files[i].name}`);
        setNewMedia((prev) => prev.filter((m) => m.id !== entry.id));
      }
    }));
  };

  const removeNew = (nid) => setNewMedia((prev) => prev.filter((m) => m.id !== nid));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return toast.error('انتظر حتى تنتهي عملية الرفع');

    const finalMedia = [
      ...existingMedia.filter((m) => !removedUrls.includes(m.url)),
      ...newMedia.filter((m) => m.url).map((m) => ({ type: m.type, url: m.url })),
    ];

    setLoading(true);
    try {
      await galleryAPI.update(id, { title, description, mediaUrls: finalMedia });
      toast.success('تم التحديث بنجاح!');
      navigate('/admin/gallery');
    } catch {
      toast.error('فشل الحفظ');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <AdminLayout title="تعديل أعمال">
        <div className="page-loader" style={{ minHeight: '400px' }}><div className="spinner" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="تعديل أعمال">
      <div className="admin-page-header">
        <h1 className="admin-page-title">تعديل <span>أعمال الشركة</span></h1>
        <button className="btn btn-outline" onClick={() => navigate('/admin/gallery')}>← العودة</button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-wrap">

        {/* Info */}
        <div className="admin-form-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            </svg>
            المعلومات
          </h3>
          <div className="form-grid">
            <div className="form-field full-width">
              <label>العنوان</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان اختياري" />
            </div>
            <div className="form-field full-width">
              <label>الوصف</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف مختصر..." />
            </div>
          </div>
        </div>

        {/* Existing media */}
        {existingMedia.length > 0 && (
          <div className="admin-form-card">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
              </svg>
              المحتوى الحالي ({existingMedia.length - removedUrls.length} محفوظ)
            </h3>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '14px' }}>اضغط لحذف</p>
            <div className="preview-grid">
              {existingMedia.map((m, i) => {
                const isRemoved = removedUrls.includes(m.url);
                return (
                  <div
                    key={i}
                    className="preview-item"
                    style={{ opacity: isRemoved ? 0.3 : 1, cursor: 'pointer', outline: isRemoved ? '2px solid #e74c3c' : 'none' }}
                    onClick={() => toggleRemove(m.url)}
                  >
                    {m.type === 'image' ? (
                      <img src={m.url} alt="" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                        <span style={{ fontSize: '2rem' }}>🎬</span>
                      </div>
                    )}
                    {isRemoved && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(192,57,43,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, borderRadius: '8px' }}>حذف</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add images */}
        <div className="admin-form-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            إضافة صور جديدة
            {newMedia.some((m) => m.type === 'image' && m.uploading) && (
              <span className="upload-badge"><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> جاري الرفع...</span>
            )}
          </h3>
          <div className="upload-zone">
            <input type="file" accept="image/*" multiple onChange={handleImageSelect} />
            <svg className="upload-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
            <p>اسحب الصور هنا</p>
          </div>
          {newMedia.filter((m) => m.type === 'image').length > 0 && (
            <div className="preview-grid" style={{ marginTop: '14px' }}>
              {newMedia.filter((m) => m.type === 'image').map((m) => (
                <div key={m.id} className="preview-item">
                  <img src={m.preview} alt="" style={{ opacity: m.uploading ? 0.35 : 1 }} />
                  {m.uploading
                    ? <div className="upload-overlay"><span className="spinner" style={{ width: 26, height: 26, borderWidth: 3 }} /></div>
                    : <button type="button" className="preview-remove" onClick={() => removeNew(m.id)}>✕</button>
                  }
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add videos */}
        <div className="admin-form-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            إضافة فيديوهات جديدة
            {newMedia.some((m) => m.type === 'video' && m.uploading) && (
              <span className="upload-badge"><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> جاري الرفع...</span>
            )}
          </h3>
          <div className="upload-zone">
            <input type="file" accept="video/*" multiple onChange={handleVideoSelect} />
            <svg className="upload-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
            <p>رفع فيديوهات جديدة</p>
          </div>
          {newMedia.filter((m) => m.type === 'video').length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {newMedia.filter((m) => m.type === 'video').map((m) => (
                <div key={m.id} className={`video-row-item ${m.uploading ? 'uploading' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
                    {m.uploading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, flexShrink: 0 }} /> : <span style={{ color: '#F39C12' }}>🎬</span>}
                    <span style={{ color: m.uploading ? '#666' : '#ccc', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.filename}</span>
                    {!m.uploading && <span style={{ color: '#27ae60', fontSize: '0.78rem', flexShrink: 0 }}>✓ تم</span>}
                  </div>
                  {!m.uploading && (
                    <button type="button" className="remove-link-btn" onClick={() => removeNew(m.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/gallery')}>إلغاء</button>
          <button type="submit" className="btn btn-gold" disabled={loading || isUploading}>
            {isUploading
              ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> جاري رفع الملفات...</>
              : loading
              ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> جاري الحفظ...</>
              : '✓ حفظ التعديلات'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default EditGalleryItem;

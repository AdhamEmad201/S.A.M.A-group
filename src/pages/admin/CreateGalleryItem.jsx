import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { galleryAPI } from '../../services/api';
import { uploadImage, uploadVideo } from '../../services/cloudinaryService';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const CreateGalleryItem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // { id, type:'image'|'video', url, preview?, uploading }
  const [media, setMedia] = useState([]);

  const isUploading = media.some((m) => m.uploading);

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';

    const entries = files.map((f, i) => ({
      id: `img-${Date.now()}-${i}`,
      type: 'image',
      url: '',
      preview: URL.createObjectURL(f),
      uploading: true,
    }));

    setMedia((prev) => [...prev, ...entries]);

    await Promise.all(
      entries.map(async (entry, i) => {
        try {
          const url = await uploadImage(files[i]);
          setMedia((prev) => prev.map((m) => m.id === entry.id ? { ...m, url, uploading: false } : m));
        } catch {
          toast.error(`فشل رفع: ${files[i].name}`);
          setMedia((prev) => prev.filter((m) => m.id !== entry.id));
        }
      })
    );
  };

  const handleVideoSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = '';

    const entries = files.map((f, i) => ({
      id: `vid-${Date.now()}-${i}`,
      type: 'video',
      url: '',
      filename: f.name,
      uploading: true,
    }));

    setMedia((prev) => [...prev, ...entries]);

    await Promise.all(
      entries.map(async (entry, i) => {
        try {
          const url = await uploadVideo(files[i]);
          setMedia((prev) => prev.map((m) => m.id === entry.id ? { ...m, url, uploading: false } : m));
        } catch {
          toast.error(`فشل رفع: ${files[i].name}`);
          setMedia((prev) => prev.filter((m) => m.id !== entry.id));
        }
      })
    );
  };

  const removeMedia = (id) => setMedia((prev) => prev.filter((m) => m.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return toast.error('انتظر حتى تنتهي عملية الرفع');
    if (media.filter((m) => m.url).length === 0) return toast.error('أضف صورة أو فيديو واحد على الأقل');

    const mediaUrls = media.filter((m) => m.url).map((m) => ({ type: m.type, url: m.url }));

    setLoading(true);
    try {
      await galleryAPI.create({ title, description, mediaUrls });
      toast.success('تم الإضافة بنجاح!');
      navigate('/admin/gallery');
    } catch {
      toast.error('فشل الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="إضافة أعمال">
      <div className="admin-page-header">
        <h1 className="admin-page-title">إضافة <span>أعمال الشركة</span></h1>
        <button className="btn btn-outline" onClick={() => navigate('/admin/gallery')}>← العودة</button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-wrap">

        {/* Info */}
        <div className="admin-form-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            </svg>
            المعلومات (اختياري)
          </h3>
          <div className="form-grid">
            <div className="form-field full-width">
              <label>العنوان</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: مشروع القاهرة الجديدة" />
            </div>
            <div className="form-field full-width">
              <label>الوصف</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف مختصر..." />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="admin-form-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
            الصور ({media.filter((m) => m.type === 'image' && m.url).length} مرفوعة)
            {media.some((m) => m.type === 'image' && m.uploading) && (
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

          {media.filter((m) => m.type === 'image').length > 0 && (
            <div className="preview-grid" style={{ marginTop: '16px' }}>
              {media.filter((m) => m.type === 'image').map((m) => (
                <div key={m.id} className="preview-item">
                  <img src={m.preview} alt="" style={{ opacity: m.uploading ? 0.35 : 1 }} />
                  {m.uploading ? (
                    <div className="upload-overlay">
                      <span className="spinner" style={{ width: 26, height: 26, borderWidth: 3 }} />
                    </div>
                  ) : (
                    <button type="button" className="preview-remove" onClick={() => removeMedia(m.id)}>✕</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Videos */}
        <div className="admin-form-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            الفيديوهات ({media.filter((m) => m.type === 'video' && m.url).length} مرفوعة)
            {media.some((m) => m.type === 'video' && m.uploading) && (
              <span className="upload-badge">
                <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                جاري الرفع...
              </span>
            )}
          </h3>

          <div className="upload-zone">
            <input type="file" accept="video/*" multiple onChange={handleVideoSelect} />
            <svg className="upload-zone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <p>رفع ملفات فيديو — يُرفع فوراً</p>
            <small>MP4, WebM</small>
          </div>

          {media.filter((m) => m.type === 'video').length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              {media.filter((m) => m.type === 'video').map((m) => (
                <div key={m.id} className={`video-row-item ${m.uploading ? 'uploading' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
                    {m.uploading
                      ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, flexShrink: 0 }} />
                      : <span style={{ color: '#F39C12' }}>🎬</span>
                    }
                    <span style={{ color: m.uploading ? '#666' : '#ccc', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.filename}
                    </span>
                    {!m.uploading && <span style={{ color: '#27ae60', fontSize: '0.78rem', flexShrink: 0 }}>✓ تم</span>}
                  </div>
                  {!m.uploading && (
                    <button type="button" className="remove-link-btn" onClick={() => removeMedia(m.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
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
              : '✓ حفظ'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default CreateGalleryItem;

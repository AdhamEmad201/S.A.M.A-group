import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { galleryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const ConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
        </svg>
      </div>
      <h3>تأكيد الحذف</h3>
      <p>هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع.</p>
      <div className="modal-actions">
        <button className="btn btn-danger" onClick={onConfirm}>حذف نهائياً</button>
        <button className="btn btn-outline" onClick={onCancel}>إلغاء</button>
      </div>
    </div>
  </div>
);

const GalleryDashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const fetch = () => {
    setLoading(true);
    galleryAPI.getAll()
      .then(({ data }) => setItems(data))
      .catch(() => toast.error('فشل تحميل المعرض'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await galleryAPI.delete(deleteTarget.id);
      toast.success('تم الحذف');
      setDeleteTarget(null);
      fetch();
    } catch {
      toast.error('فشل الحذف');
    }
  };

  return (
    <AdminLayout title="أعمال الشركة">
      {deleteTarget && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="admin-page-header">
        <h1 className="admin-page-title">أعمال <span>الشركة</span></h1>
        <Link to="/admin/gallery/create" className="btn btn-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إضافة عنصر
        </Link>
      </div>

      {loading ? (
        <div className="page-loader" style={{ padding: '50px' }}>
          <div className="spinner" />
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: '50px', textAlign: 'center', color: '#555' }}>
          <p>لا يوجد محتوى بعد.</p>
          <Link to="/admin/gallery/create" className="btn btn-gold" style={{ marginTop: '20px', display: 'inline-flex' }}>
            إضافة أول عنصر
          </Link>
        </div>
      ) : (
        <div className="gallery-admin-grid">
          {items.map((item) => {
            const cover = (item.mediaUrls || []).find((m) => m.type === 'image');
            const imgCount = (item.mediaUrls || []).filter((m) => m.type === 'image').length;
            const vidCount = (item.mediaUrls || []).filter((m) => m.type === 'video').length;
            return (
              <div key={item.id} className="gallery-admin-card">
                <div className="gallery-admin-thumb">
                  {cover ? (
                    <img src={cover.url} alt={item.title || ''} />
                  ) : (
                    <div className="gallery-admin-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                  )}
                  <div className="gallery-admin-counts">
                    {imgCount > 0 && <span>🖼 {imgCount}</span>}
                    {vidCount > 0 && <span>🎬 {vidCount}</span>}
                  </div>
                </div>
                <div className="gallery-admin-body">
                  <p className="gallery-admin-title">{item.title || '(بدون عنوان)'}</p>
                  {item.description && <p className="gallery-admin-desc">{item.description.slice(0, 80)}</p>}
                  <div className="table-actions" style={{ marginTop: '10px' }}>
                    <button className="action-btn action-btn-edit" onClick={() => navigate(`/admin/gallery/edit/${item.id}`)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      تعديل
                    </button>
                    <button className="action-btn action-btn-delete" onClick={() => setDeleteTarget(item)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /></svg>
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default GalleryDashboard;

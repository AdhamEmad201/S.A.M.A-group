import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const ConfirmModal = ({ projectName, onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="modal-card">
      <div className="modal-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </div>
      <h3>تأكيد الحذف</h3>
      <p>هل أنت متأكد من حذف مشروع "<strong style={{ color: '#fff' }}>{projectName}</strong>"؟ لا يمكن التراجع عن هذا الإجراء.</p>
      <div className="modal-actions">
        <button className="btn btn-danger" onClick={onConfirm}>حذف نهائياً</button>
        <button className="btn btn-outline" onClick={onCancel}>إلغاء</button>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  const fetchProjects = () => {
    setLoading(true);
    projectsAPI.adminGetAll()
      .then(({ data }) => setProjects(data))
      .catch(() => toast.error('فشل تحميل المشاريع'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await projectsAPI.delete(deleteTarget._id);
      toast.success('تم حذف المشروع بنجاح');
      setDeleteTarget(null);
      fetchProjects();
    } catch {
      toast.error('فشل حذف المشروع');
    }
  };

  const statusMap = {
    'متاح': 'badge-available',
    'مباع': 'badge-sold',
    'قيد الإنشاء': 'badge-building',
  };

  const stats = [
    { num: projects.length, label: 'إجمالي المشاريع', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg> },
    { num: projects.filter(p => p.status === 'متاح').length, label: 'متاح', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg> },
    { num: projects.filter(p => p.featured).length, label: 'مميز', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
    { num: projects.filter(p => !p.isPublic).length, label: 'مخفي', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><line x1="1" y1="1" x2="23" y2="23" /></svg> },
  ];

  return (
    <AdminLayout title="لوحة التحكم">
      {deleteTarget && (
        <ConfirmModal
          projectName={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="admin-page-header">
        <h1 className="admin-page-title">
          لوحة <span>التحكم</span>
        </h1>
        <Link to="/admin/create" className="btn btn-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          إضافة مشروع جديد
        </Link>
      </div>

      <div className="admin-stats">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-icon">{s.icon}</div>
            <div>
              <span className="stat-card-num">{s.num}</span>
              <span className="stat-card-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-table-wrap">
        <div className="table-header">
          <h3>جميع المشاريع ({projects.length})</h3>
        </div>

        {loading ? (
          <div className="page-loader" style={{ padding: '50px' }}>
            <div className="spinner" />
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '50px', textAlign: 'center', color: '#555' }}>
            <p>لا توجد مشاريع بعد.</p>
            <Link to="/admin/create" className="btn btn-gold" style={{ marginTop: '20px', display: 'inline-flex' }}>
              إضافة أول مشروع
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>المشروع</th>
                  <th>الحالة</th>
                  <th>التصنيف</th>
                  <th>الصور</th>
                  <th>الفيديوهات</th>
                  <th>الظهور</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p._id}>
                    <td>
                      {p.images?.[0] ? (
                        <img src={p.images[0].url} alt={p.title} className="row-thumb" />
                      ) : (
                        <div className="row-thumb-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="project-row-title">
                        {p.featured && <span className="featured-star">★ </span>}
                        {p.title}
                      </div>
                      {p.location && <div className="project-row-location">📍 {p.location}</div>}
                    </td>
                    <td><span className={`badge ${statusMap[p.status]}`}>{p.status}</span></td>
                    <td style={{ color: '#888', fontSize: '0.85rem' }}>{p.category}</td>
                    <td style={{ color: '#888', fontSize: '0.85rem' }}>{p.images?.length || 0}</td>
                    <td style={{ color: '#888', fontSize: '0.85rem' }}>{p.videos?.length || 0}</td>
                    <td>
                      <span className={`badge ${p.isPublic ? 'badge-available' : 'badge-sold'}`}>
                        {p.isPublic ? 'ظاهر' : 'مخفي'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn action-btn-view" onClick={() => window.open(`/projects/${p.slug}`, '_blank')}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          عرض
                        </button>
                        <button className="action-btn action-btn-edit" onClick={() => navigate(`/admin/edit/${p._id}`)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                          تعديل
                        </button>
                        <button className="action-btn action-btn-delete" onClick={() => setDeleteTarget(p)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /></svg>
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;

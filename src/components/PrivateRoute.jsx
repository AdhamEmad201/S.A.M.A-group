import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return admin ? children : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;

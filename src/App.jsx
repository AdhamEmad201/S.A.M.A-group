import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Gallery from './pages/Gallery';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import CreateProject from './pages/admin/CreateProject';
import EditProject from './pages/admin/EditProject';
import GalleryDashboard from './pages/admin/GalleryDashboard';
import CreateGalleryItem from './pages/admin/CreateGalleryItem';
import EditGalleryItem from './pages/admin/EditGalleryItem';

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

function App() {
  return (
    <SettingsProvider>
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#111',
              color: '#F39C12',
              border: '1px solid #B7860B',
              fontFamily: 'Cairo, sans-serif',
              fontSize: '0.95rem',
            },
            success: { iconTheme: { primary: '#F39C12', secondary: '#000' } },
            error: { style: { color: '#e74c3c', border: '1px solid #c0392b' } },
          }}
        />
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
          <Route path="/projects/:slug" element={<PublicLayout><ProjectDetail /></PublicLayout>} />
          <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/create" element={<PrivateRoute><CreateProject /></PrivateRoute>} />
          <Route path="/admin/edit/:id" element={<PrivateRoute><EditProject /></PrivateRoute>} />
          <Route path="/admin/gallery" element={<PrivateRoute><GalleryDashboard /></PrivateRoute>} />
          <Route path="/admin/gallery/create" element={<PrivateRoute><CreateGalleryItem /></PrivateRoute>} />
          <Route path="/admin/gallery/edit/:id" element={<PrivateRoute><EditGalleryItem /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </SettingsProvider>
  );
}

export default App;

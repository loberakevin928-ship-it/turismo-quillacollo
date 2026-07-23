import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Home from './pages/Home';
import PlaceDetail from './pages/PlaceDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Calendar from './components/Calendar';
import AdminLayout from './components/AdminLayout';
import DashboardStats from './pages/admin/DashboardStats';
import AdminSites from './pages/admin/AdminSites';
import AdminEvents from './pages/admin/AdminEvents';
import AdminGallery from './pages/admin/AdminGallery';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';
import AdminServices from './pages/admin/AdminServices';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <main className="flex-1">
            <Routes>
              {/* Página principal con Hero y mapa */}
              <Route path="/" element={
                <>
                  <Hero />
                  <Home />
                </>
              } />
              <Route path="/place/:id" element={<PlaceDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/services" element={<Services />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/register" element={
                <ProtectedRoute roles={['admin']}>
                  <Register />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute roles={['admin', 'editor']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardStats />} />
                <Route path="sites" element={<AdminSites />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
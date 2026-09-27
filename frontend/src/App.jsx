import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import PlacesBanner from './components/PlacesBanner';
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
import AdminCulturalActivities from './pages/admin/AdminCulturalActivities';
import AdminServiceRequests from './pages/admin/AdminServiceRequests';
import ServiceRequest from './pages/ServiceRequest';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import VisitorTracker from './components/VisitorTracker';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <VisitorTracker />
          <Navbar />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <main className="flex-1">
            <Routes>
              {/* Página principal con Hero y mapa */}
              <Route path="/" element={
                <ErrorBoundary>
                  <Hero />
                  <PlacesBanner />
                  <Home />
                </ErrorBoundary>
              } />
              <Route path="/place/:id" element={<ErrorBoundary><PlaceDetail /></ErrorBoundary>} />
              <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
              <Route path="/services" element={<ErrorBoundary><Services /></ErrorBoundary>} />
              <Route path="/service-request" element={<ErrorBoundary><ServiceRequest /></ErrorBoundary>} />
              <Route path="/calendar" element={<ErrorBoundary><Calendar /></ErrorBoundary>} />
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
                <Route path="cultural" element={<AdminCulturalActivities />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />
                <Route path="services" element={<AdminServices />} />
                <Route path="service-requests" element={<AdminServiceRequests />} />
                <Route path="reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />
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
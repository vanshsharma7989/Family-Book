import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import FileBrowser from './pages/FileBrowser';
import UploadPage from './pages/UploadPage';
import Trash from './pages/Trash';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>

              {/* Public pages */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected pages */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/photos" element={<FileBrowser mode="photo" />} />
                <Route path="/documents" element={<FileBrowser mode="document" />} />
                <Route path="/pdfs" element={<FileBrowser mode="pdf" />} />
                <Route path="/favorites" element={<FileBrowser mode="favorites" />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/trash" element={<Trash />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Unknown routes */}
              <Route path="*" element={<Landing />} />

            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
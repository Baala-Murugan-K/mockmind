import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute/index.jsx';
import Navbar from './components/Navbar/index.jsx';
import LoginPage from './pages/LoginPage/index.jsx';
import HomePage from './pages/HomePage/index.jsx';
import InterviewSetupPage from './pages/InterviewSetupPage/index.jsx';
import InterviewPage from './pages/InterviewPage/index.jsx';
import FeedbackPage from './pages/FeedbackPage/index.jsx';
import HistoryPage from './pages/HistoryPage/index.jsx';
import ProfilePage from './pages/ProfilePage/index.jsx';

const ProtectedLayout = ({ children }) => (
  <ProtectedRoute>
    <Navbar />
    {children}
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedLayout><HomePage /></ProtectedLayout>} />
          <Route path="/setup" element={<ProtectedLayout><InterviewSetupPage /></ProtectedLayout>} />
          <Route path="/interview/:id" element={<ProtectedLayout><InterviewPage /></ProtectedLayout>} />
          <Route path="/feedback/:id" element={<ProtectedLayout><FeedbackPage /></ProtectedLayout>} />
          <Route path="/history" element={<ProtectedLayout><HistoryPage /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import Home from './pages/Home';
    import OwnerDashboard from './pages/OwnerDashboard';
    import GymOwnerDashboard from './pages/GymOwnerDashboard';
    import Login from './components/Login';
    import './index.css';

    function ProtectedRoute({ children, allowedRole }) {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      return token && role === allowedRole ? children : <Navigate to="/login" />;
    }

    function App() {
      return (
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/owner-dashboard"
                element={<ProtectedRoute allowedRole="Owner"><OwnerDashboard /></ProtectedRoute>}
              />
              <Route
                path="/gym-owner-dashboard"
                element={<ProtectedRoute allowedRole="Gym"><GymOwnerDashboard /></ProtectedRoute>}
              />
            </Routes>
          </div>
        </Router>
      );
    }

    export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import Home from './pages/Home';
    import OwnerDashboard from './pages/OwnerDashboard';
    import GymOwnerDashboard from './pages/GymOwnerDashboard';
    import GymProfile from './pages/GymProfile';
    import TrainerDashboard from './pages/TrainerDashboard';
    import Login from './components/Login';
    import './index.css';

    function ProtectedRoute({ children, allowedRole }) {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      if (!token) return <Navigate to="/login" />;
      if (allowedRole && role !== allowedRole) return <Navigate to="/" />;
      return children;
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
              <Route
                path="/trainer-dashboard"
                element={<ProtectedRoute allowedRole="Trainer"><TrainerDashboard /></ProtectedRoute>}
              />
              <Route path="/gym/:gymId" element={<GymProfile />} />
              <Route
                path="/my-gym"
                element={<ProtectedRoute><GymProfile /></ProtectedRoute>}
              />
            </Routes>
          </div>
        </Router>
      );
    }

    export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
    import Home from './pages/Home';
    import OwnerDashboard from './pages/OwnerDashboard';
    import Login from './components/Login';
    import './index.css';

    function ProtectedRoute({ children }) {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      return token && role === 'Owner' ? children : <Navigate to="/login" />;
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
                element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>}
              />
            </Routes>
          </div>
        </Router>
      );
    }

    export default App;
import { useState } from 'react';
    import axios from 'axios';
    import { useNavigate } from 'react-router-dom';

    function Login() {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState('');
      const navigate = useNavigate();

      const handleLogin = async (e) => {
        e.preventDefault();
        try {
          const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('role', res.data.user.role);
          if (res.data.user.role === 'Owner') {
            navigate('/owner-dashboard');
          } else if (res.data.user.role === 'Gym') {
            navigate('/gym-owner-dashboard');
          } else if (res.data.user.role === 'Member') {
            navigate('/my-gym');
          } else if (res.data.user.role === 'Trainer') {
            navigate('/trainer-dashboard');
          } else {
            setError('Access denied: Valid role required');
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Login failed');
        }
      };

      return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Login
              </button>
            </form>
          </div>
        </div>
      );
    }

    export default Login;
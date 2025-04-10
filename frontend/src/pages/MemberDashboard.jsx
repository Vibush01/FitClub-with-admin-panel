import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MemberDashboard() {
  const [gyms, setGyms] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError('Please log in to view gyms');
      setLoading(false);
      return;
    }
    fetchGyms();
  }, [token]);

  const fetchGyms = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/gym-members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched gyms:', res.data);
      res.data.forEach(gym => {
        console.log(`Gym ${gym.name} hasPendingRequest: ${gym.hasPendingRequest}`);
      });
      setGyms(res.data);
    } catch (err) {
      console.error('Error fetching gyms:', err);
      setError(err.response?.data?.message || 'Failed to fetch gyms');
      setGyms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (gymId) => {
    try {
      await axios.post('http://localhost:5000/api/gym-members/join', { gymId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Join request sent successfully');
      await fetchGyms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send join request');
      await fetchGyms();
    }
  };

  const handleViewDetails = (gymId) => {
    navigate(`/gym/${gymId}`);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Member Dashboard</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Available Gyms</h2>
          {gyms.length === 0 ? (
            <p className="text-gray-500">No gyms available</p>
          ) : (
            <ul className="space-y-4">
              {gyms.map((gym) => (
                <li key={gym._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-200">
                  <span className="text-gray-700">{gym.name} - {gym.address}</span>
                  <div>
                    <button
                      onClick={() => handleViewDetails(gym._id)}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300 mr-2"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleJoinRequest(gym._id)}
                      disabled={gym.hasPendingRequest}
                      className={`p-2 rounded-lg transition duration-300 ${
                        gym.hasPendingRequest
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {gym.hasPendingRequest ? 'Request Pending' : 'Request to Join'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;
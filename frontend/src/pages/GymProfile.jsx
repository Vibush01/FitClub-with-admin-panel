import { useState, useEffect } from 'react';
import axios from 'axios';

function GymProfile() {
  const [gym, setGym] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('Please log in to view gym details');
      setLoading(false);
      return;
    }
    fetchGym();
  }, [token]);

  const fetchGym = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/gyms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGym(res.data[0]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch gym details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!gym) {
    return <div className="p-6">No gym found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Gym Dashboard</h1>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">{gym.name}</h2>
          <p className="text-gray-600"><strong>Address:</strong> {gym.address}</p>
          <p className="text-gray-600"><strong>Owner:</strong> {gym.owner?.name} ({gym.owner?.email})</p>
          <p className="text-gray-600"><strong>Owner Contact:</strong> {gym.ownerDetails?.phone}</p>
          {gym.photos && gym.photos.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Photos</h3>
              <div className="flex space-x-4">
                {gym.photos.map((photo, index) => (
                  <img key={index} src={photo} alt={`Gym Photo ${index + 1}`} className="w-32 h-32 object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Membership Plans</h3>
            <ul className="list-disc list-inside">
              {gym.membershipDetails.map((plan, index) => (
                <li key={index} className="text-gray-600">
                  {plan.planName}: ${plan.price} for {plan.duration} days
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Trainers</h3>
            {gym.trainers.length === 0 ? (
              <p className="text-gray-500">No trainers assigned</p>
            ) : (
              <ul className="list-disc list-inside">
                {gym.trainers.map((trainer, index) => (
                  <li key={index} className="text-gray-600">
                    {trainer.name} ({trainer.email})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Members</h3>
            {gym.members.length === 0 ? (
              <p className="text-gray-500">No members yet</p>
            ) : (
              <ul className="list-disc list-inside">
                {gym.members.map((member, index) => (
                  <li key={index} className="text-gray-600">
                    {member.name} ({member.email})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GymProfile;
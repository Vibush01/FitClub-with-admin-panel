import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function GymProfile() {
  const [gym, setGym] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const { gymId } = useParams();

  useEffect(() => {
    fetchGym();
  }, [gymId]);

  const fetchGym = async () => {
    try {
      let url = 'http://localhost:5000/api/gym-members';
      let headers = {};

      if (token && (role === 'Gym' || role === 'Member')) {
        if (role === 'Gym') {
          url = 'http://localhost:5000/api/gyms/my-gym';
        } else if (role === 'Member') {
          url = 'http://localhost:5000/api/member/gym-profile';
        }
        headers = { Authorization: `Bearer ${token}` };
      } else if (gymId) {
        url = `http://localhost:5000/api/gym-members`;
        const res = await axios.get(url);
        const selectedGym = res.data.find(g => g._id === gymId);
        if (!selectedGym) throw new Error('Gym not found');
        setGym(selectedGym);
        return;
      } else {
        throw new Error('Please log in to view your gym or provide a gym ID');
      }

      const res = await axios.get(url, { headers });
      setGym(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch gym profile');
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!gym) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">{gym.name}</h1>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Gym Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600"><strong>Address:</strong> {gym.address}</p>
              <p className="text-gray-600"><strong>Owner:</strong> {gym.owner?.name} ({gym.owner?.email})</p>
              <p className="text-gray-600"><strong>Owner Contact:</strong> {gym.ownerDetails?.fullName} - {gym.ownerDetails?.phone}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Photos</h3>
              {gym.photos && gym.photos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gym.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Gym Photo ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No photos available</p>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">Membership Plans</h3>
          {gym.membershipDetails && gym.membershipDetails.length > 0 ? (
            <ul className="space-y-2">
              {gym.membershipDetails.map((plan, index) => (
                <li key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-700">{plan.planName}: ${plan.price} for {plan.duration} days</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No membership plans available</p>
          )}

          <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">Trainers</h3>
          {gym.trainers && gym.trainers.length > 0 ? (
            <ul className="space-y-2">
              {gym.trainers.map((trainer) => (
                <li key={trainer._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-700">{trainer.name} ({trainer.email})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No trainers available</p>
          )}

          {(role === 'Gym' || role === 'Trainer') && (
            <>
              <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-2">Members</h3>
              {gym.members && gym.members.length > 0 ? (
                <ul className="space-y-2">
                  {gym.members.map((member) => (
                    <li key={member._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-700">{member.name} ({member.email})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No members available</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GymProfile;
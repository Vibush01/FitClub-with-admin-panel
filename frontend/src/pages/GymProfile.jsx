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
          url = 'http://localhost:5000/api/gyms/my-gym'; // Gym Owner's gym
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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{gym.name}</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Gym Details</h2>
        <p><strong>Address:</strong> {gym.address}</p>
        <p><strong>Owner:</strong> {gym.owner?.name} ({gym.owner?.email})</p>
        <p><strong>Owner Contact:</strong> {gym.ownerDetails?.fullName} - {gym.ownerDetails?.phone}</p>

        <h3 className="text-lg font-semibold mt-4 mb-2">Photos</h3>
        {gym.photos && gym.photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gym.photos.map((photo, index) => (
              <img key={index} src={photo} alt={`Gym Photo ${index + 1}`} className="w-full h-40 object-cover rounded" />
            ))}
          </div>
        ) : (
          <p>No photos available</p>
        )}

        <h3 className="text-lg font-semibold mt-4 mb-2">Membership Plans</h3>
        {gym.membershipDetails && gym.membershipDetails.length > 0 ? (
          <ul>
            {gym.membershipDetails.map((plan, index) => (
              <li key={index} className="p-2 border-b">
                {plan.planName}: ${plan.price} for {plan.duration} days
              </li>
            ))}
          </ul>
        ) : (
          <p>No membership plans available</p>
        )}

        <h3 className="text-lg font-semibold mt-4 mb-2">Trainers</h3>
        {gym.trainers && gym.trainers.length > 0 ? (
          <ul>
            {gym.trainers.map((trainer) => (
              <li key={trainer._id} className="p-2 border-b">
                {trainer.name} ({trainer.email})
              </li>
            ))}
          </ul>
        ) : (
          <p>No trainers available</p>
        )}

        {(role === 'Gym' || role === 'Trainer') && (
          <>
            <h3 className="text-lg font-semibold mt-4 mb-2">Members</h3>
            {gym.members && gym.members.length > 0 ? (
              <ul>
                {gym.members.map((member) => (
                  <li key={member._id} className="p-2 border-b">
                    {member.name} ({member.email})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No members available</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GymProfile;
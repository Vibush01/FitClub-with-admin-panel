import { useState, useEffect } from 'react';
import axios from 'axios';

function TrainerDashboard() {
  const [gym, setGym] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [plans, setPlans] = useState([]);
  const [planData, setPlanData] = useState({ type: 'Workout', content: '', memberId: '', week: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchGym();
    fetchMembers();
    fetchMemberships();
    fetchPlans();
  }, []);

  const fetchGym = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/member/trainer-gym', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGym(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch gym');
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch members');
    }
  };

  const fetchMemberships = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/memberships', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemberships(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch memberships');
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/plans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlans(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch plans');
    }
  };

  const handleAssignPlan = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/plans', planData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Plan assigned successfully');
      fetchPlans();
      setPlanData({ type: 'Workout', content: '', memberId: '', week: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign plan');
    }
  };

  const handleDeletePlan = async (id) => {
    setError('');
    setSuccess('');
    try {
      await axios.delete(`http://localhost:5000/api/plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Plan deleted successfully');
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete plan');
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
      <h1 className="text-3xl font-bold mb-6">Trainer Dashboard</h1>
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Gym Details */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Gym: {gym.name}</h2>
        <p><strong>Address:</strong> {gym.address}</p>
        <p><strong>Owner:</strong> {gym.owner?.name} ({gym.owner?.email})</p>
      </div>

      {/* Members and Memberships */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        {members.length === 0 ? (
          <p>No members found</p>
        ) : (
          <ul>
            {members.map((member) => {
              const membership = memberships.find(m => m.member._id === member._id);
              return (
                <li key={member._id} className="p-2 border-b">
                  <span>
                    {member.user.name} ({member.user.email}) - {member.contactNumber}
                    <br />
                    <strong>Membership:</strong> {membership
                      ? `Join: ${new Date(membership.joinDate).toLocaleDateString()}, Expiry: ${new Date(membership.expiryDate).toLocaleDateString()}`
                      : 'No active membership'}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Assign Plan */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Assign Workout/Diet Plan</h2>
        <form onSubmit={handleAssignPlan}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Plan Type</label>
              <select
                value={planData.type}
                onChange={(e) => setPlanData({ ...planData, type: e.target.value })}
                className="p-2 border rounded w-full"
              >
                <option value="Workout">Workout</option>
                <option value="Diet">Diet</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Member</label>
              <select
                value={planData.memberId}
                onChange={(e) => setPlanData({ ...planData, memberId: e.target.value })}
                className="p-2 border rounded w-full"
                required
              >
                <option value="">Select Member</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.user.name} ({member.user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Week Number</label>
              <input
                type="number"
                value={planData.week}
                onChange={(e) => setPlanData({ ...planData, week: e.target.value })}
                placeholder="Week Number"
                className="p-2 border rounded w-full"
                required
                min="1"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-gray-700">Plan Details</label>
              <textarea
                value={planData.content}
                onChange={(e) => setPlanData({ ...planData, content: e.target.value })}
                placeholder="e.g., Monday: 3x10 Squats, Tuesday: 3x12 Bench Press"
                className="p-2 border rounded w-full"
                rows="4"
                required
              />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Assign Plan
          </button>
        </form>
      </div>

      {/* Existing Plans */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Assigned Plans</h2>
        {plans.length === 0 ? (
          <p>No plans assigned yet</p>
        ) : (
          <ul>
            {plans.map((plan) => (
              <li key={plan._id} className="flex justify-between items-center p-2 border-b">
                <span>
                  <strong>{plan.type} Plan</strong> for {plan.member.user.name} (Week {plan.week})
                  <br />
                  {plan.content}
                </span>
                <button
                  onClick={() => handleDeletePlan(plan._id)}
                  className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TrainerDashboard;
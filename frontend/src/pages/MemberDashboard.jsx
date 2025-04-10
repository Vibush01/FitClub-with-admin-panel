import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MemberDashboard() {
  const [gyms, setGyms] = useState([]);
  const [memberGym, setMemberGym] = useState(null);
  const [membership, setMembership] = useState(null);
  const [plans, setPlans] = useState([]);
  const [planRequest, setPlanRequest] = useState({ type: 'Workout', week: '' });
  const [hasPendingRenewalRequest, setHasPendingRenewalRequest] = useState(false);
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
    fetchMemberGym();
    fetchMembership();
    fetchPlans();
    fetchPendingRenewalRequest();
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

  const fetchMemberGym = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/member/gym-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemberGym(res.data);
    } catch (err) {
      if (err.response?.data?.message !== 'You are not a member of any gym') {
        setError(err.response?.data?.message || 'Failed to fetch gym profile');
      }
    }
  };

  const fetchMembership = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/memberships', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembership(res.data[0] || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch membership details');
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

  const fetchPendingRenewalRequest = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/memberships/pending-renewal', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasPendingRenewalRequest(res.data.hasPendingRequest);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check pending renewal request');
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

  const handleRequestPlan = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/member/request-plan', planRequest, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Plan request sent successfully');
      setPlanRequest({ type: 'Workout', week: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send plan request');
    }
  };

  const handleRequestMembershipRenewal = async () => {
    try {
      await axios.post('http://localhost:5000/api/memberships/renew', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Membership renewal request sent successfully');
      setHasPendingRenewalRequest(true); // Update state immediately
      await fetchPendingRenewalRequest(); // Refresh status
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send renewal request');
    }
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

        {/* Member's Gym Details */}
        {memberGym ? (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Gym: {memberGym.name}</h2>
            <p className="text-gray-600"><strong>Address:</strong> {memberGym.address}</p>
            <p className="text-gray-600"><strong>Owner:</strong> {memberGym.owner?.name} ({memberGym.owner?.email})</p>
            <button
              onClick={() => navigate('/my-gym')}
              className="mt-4 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              View Full Details
            </button>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Available Gyms</h2>
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
        )}

        {/* Membership Details */}
        {memberGym && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Membership Details</h2>
            {membership ? (
              <>
                <p className="text-gray-600"><strong>Join Date:</strong> {new Date(membership.joinDate).toLocaleDateString()}</p>
                <p className="text-gray-600"><strong>Expiry Date:</strong> {new Date(membership.expiryDate).toLocaleDateString()}</p>
                {(() => {
                  const expiryDate = new Date(membership.expiryDate);
                  const currentDate = new Date();
                  const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
                  if (daysUntilExpiry <= 7) {
                    return (
                      <div className="mt-4">
                        <p className="text-yellow-600">Your membership is expiring soon ({daysUntilExpiry} days left)!</p>
                        {hasPendingRenewalRequest ? (
                          <p className="text-gray-600 mt-2">Your renewal request is in progress</p>
                        ) : (
                          <button
                            onClick={handleRequestMembershipRenewal}
                            className="mt-2 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition duration-300"
                          >
                            Request Membership Renewal
                          </button>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            ) : (
              <p className="text-gray-500">No active membership found</p>
            )}
          </div>
        )}

        {/* Plans Section */}
        {memberGym && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Plans</h2>
              {plans.length === 0 ? (
                <p className="text-gray-500">No plans assigned yet</p>
              ) : (
                <ul className="space-y-4">
                  {plans.map((plan) => (
                    <li key={plan._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-700">
                        <strong>{plan.type} Plan</strong> (Week {plan.week})
                        <br />
                        {plan.content}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Request Plan Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Request a New Plan</h2>
              <form onSubmit={handleRequestPlan}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-600 font-medium mb-2">Plan Type</label>
                    <select
                      value={planRequest.type}
                      onChange={(e) => setPlanRequest({ ...planRequest, type: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Workout">Workout</option>
                      <option value="Diet">Diet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium mb-2">Week Number</label>
                    <input
                      type="number"
                      value={planRequest.week}
                      onChange={(e) => setPlanRequest({ ...planRequest, week: e.target.value })}
                      placeholder="Week Number"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                    />
                  </div>
                </div>
                <button type="submit" className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300">
                  Request Plan
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MemberDashboard;
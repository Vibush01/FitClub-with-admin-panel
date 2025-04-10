import { useState, useEffect } from 'react';
import axios from 'axios';

function GymOwnerDashboard() {
  const [gym, setGym] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [renewalRequests, setRenewalRequests] = useState([]);
  const [newMember, setNewMember] = useState({ memberEmail: '', contactNumber: '' });
  const [newMembership, setNewMembership] = useState({ memberId: '', joinDate: '', expiryDate: '' });
  const [editMembership, setEditMembership] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [updateContact, setUpdateContact] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setError('Please log in to view the dashboard');
      setLoading(false);
      return;
    }
    fetchGym();
    fetchMembers();
    fetchMemberships();
    fetchJoinRequests();
    fetchRenewalRequests();
  }, [token]);

  const fetchGym = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/gyms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGym(res.data[0]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch gym');
    } finally {
      setLoading(false);
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

  const fetchJoinRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/gym-members/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJoinRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch join requests');
    }
  };

  const fetchRenewalRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/memberships/renewal-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRenewalRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch renewal requests');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/members', newMember, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Member added successfully');
      fetchMembers();
      setNewMember({ memberEmail: '', contactNumber: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleAddMembership = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/memberships', newMembership, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Membership added successfully');
      fetchMemberships();
      setNewMembership({ memberId: '', joinDate: '', expiryDate: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add membership');
    }
  };

  const handleEditMembership = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.put(`http://localhost:5000/api/memberships/${editMembership._id}`, {
        joinDate: editMembership.joinDate,
        expiryDate: editMembership.expiryDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Membership updated successfully');
      fetchMemberships();
      setEditMembership(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update membership');
    }
  };

  const handleViewMember = (member) => {
    setSelectedMember(member);
    setUpdateContact(member.contactNumber);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.put(`http://localhost:5000/api/members/${selectedMember._id}`, { contactNumber: updateContact }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Member updated successfully');
      fetchMembers();
      setSelectedMember(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update member');
    }
  };

  const handleDeleteMember = async (id) => {
    setError('');
    setSuccess('');
    try {
      await axios.delete(`http://localhost:5000/api/members/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Member removed successfully');
      fetchMembers();
      fetchMemberships();
      setSelectedMember(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete member');
    }
  };

  const handleRespondToJoinRequest = async (requestId, action) => {
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/gym-members/respond', { requestId, action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Join request ${action}ed successfully`);
      fetchJoinRequests();
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} join request`);
    }
  };

  const handleRespondToRenewalRequest = async (requestId, action) => {
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/memberships/renewal-respond', { requestId, action }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(`Renewal request ${action}ed successfully`);
      fetchRenewalRequests();
      fetchMemberships();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} renewal request`);
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
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Gym Owner Dashboard</h1>
        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

        {/* Gym Details */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Gym: {gym.name}</h2>
          <p className="text-gray-600"><strong>Address:</strong> {gym.address}</p>
        </div>

        {/* Join Requests */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Join Requests</h2>
          {joinRequests.length === 0 ? (
            <p className="text-gray-500">No pending join requests</p>
          ) : (
            <ul className="space-y-4">
              {joinRequests.map((request) => (
                <li key={request._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-200">
                  <span className="text-gray-700">
                    {request.member.user.name} ({request.member.user.email}) - {request.member.contactNumber}
                  </span>
                  <div>
                    <button
                      onClick={() => handleRespondToJoinRequest(request._id, 'accept')}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition duration-300 mr-2"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToJoinRequest(request._id, 'reject')}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition duration-300"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Membership Renewal Requests */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Membership Renewal Requests</h2>
          {renewalRequests.length === 0 ? (
            <p className="text-gray-500">No pending renewal requests</p>
          ) : (
            <ul className="space-y-4">
              {renewalRequests.map((request) => (
                <li key={request._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-200">
                  <span className="text-gray-700">
                    {request.member.user.name} ({request.member.user.email})
                  </span>
                  <div>
                    <button
                      onClick={() => handleRespondToRenewalRequest(request._id, 'accept')}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition duration-300 mr-2"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToRenewalRequest(request._id, 'reject')}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition duration-300"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add Member */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Member</h2>
          <form onSubmit={handleAddMember}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Member Email</label>
                <input
                  type="email"
                  value={newMember.memberEmail}
                  onChange={(e) => setNewMember({ ...newMember, memberEmail: e.target.value })}
                  placeholder="Member Email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-2">Contact Number</label>
                <input
                  type="text"
                  value={newMember.contactNumber}
                  onChange={(e) => setNewMember({ ...newMember, contactNumber: e.target.value })}
                  placeholder="Contact Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <button type="submit" className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300">
              Add Member
            </button>
          </form>
        </div>

        {/* Add Membership */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Membership</h2>
          <form onSubmit={handleAddMembership}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Member</label>
                <select
                  value={newMembership.memberId}
                  onChange={(e) => setNewMembership({ ...newMembership, memberId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-gray-600 font-medium mb-2">Join Date</label>
                <input
                  type="date"
                  value={newMembership.joinDate}
                  onChange={(e) => setNewMembership({ ...newMembership, joinDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={newMembership.expiryDate}
                  onChange={(e) => setNewMembership({ ...newMembership, expiryDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <button type="submit" className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300">
              Add Membership
            </button>
          </form>
        </div>

        {/* Members and Memberships */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Members</h2>
          {members.length === 0 ? (
            <p className="text-gray-500">No members found</p>
          ) : (
            <ul className="space-y-4">
              {members.map((member) => {
                const membership = memberships.find(m => m.member._id === member._id);
                return (
                  <li key={member._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-200">
                    <span className="text-gray-700">
                      {member.user.name} ({member.user.email}) - {member.contactNumber}
                      <br />
                      <strong className="text-gray-600">Membership:</strong> {membership
                        ? `Join: ${new Date(membership.joinDate).toLocaleDateString()}, Expiry: ${new Date(membership.expiryDate).toLocaleDateString()}`
                        : 'No active membership'}
                    </span>
                    <div>
                      <button
                        onClick={() => handleViewMember(member)}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300 mr-2"
                      >
                        View/Edit
                      </button>
                      {membership ? (
                        <button
                          onClick={() => setEditMembership(membership)}
                          className="bg-yellow-600 text-white p-2 rounded-lg hover:bg-yellow-700 transition duration-300 mr-2"
                        >
                          Edit Membership
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleDeleteMember(member._id)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition duration-300"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Member Modal */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Member Details: {selectedMember.user.name}</h2>
              <p className="text-gray-600"><strong>Email:</strong> {selectedMember.user.email}</p>
              <form onSubmit={handleUpdateMember}>
                <div className="mb-4">
                  <label className="block text-gray-600 font-medium mb-2">Contact Number</label>
                  <input
                    type="text"
                    value={updateContact}
                    onChange={(e) => setUpdateContact(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300 mr-2"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Membership Modal */}
        {editMembership && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Edit Membership</h2>
              <form onSubmit={handleEditMembership}>
                <div className="mb-4">
                  <label className="block text-gray-600 font-medium mb-2">Join Date</label>
                  <input
                    type="date"
                    value={editMembership.joinDate.split('T')[0]}
                    onChange={(e) => setEditMembership({ ...editMembership, joinDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-600 font-medium mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={editMembership.expiryDate.split('T')[0]}
                    onChange={(e) => setEditMembership({ ...editMembership, expiryDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setEditMembership(null)}
                    className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition duration-300 mr-2"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GymOwnerDashboard;
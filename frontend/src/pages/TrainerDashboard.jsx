import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Correct: Use named export

function TrainerDashboard() {
  const [gym, setGym] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [plans, setPlans] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [planRequests, setPlanRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMember, setNewMember] = useState({ memberEmail: '', contactNumber: '' });
  const [planData, setPlanData] = useState({ type: 'Workout', content: '', memberId: '', week: '' });
  const [newMessage, setNewMessage] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberForMessaging, setSelectedMemberForMessaging] = useState(null);
  const [updateContact, setUpdateContact] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  // Decode the token to get the user ID
  const user = token ? jwtDecode(token) : null;
  const userId = user ? user.id : null;

  useEffect(() => {
    if (!token) {
      setError('Please log in to view the dashboard');
      setLoading(false);
      return;
    }
    fetchGym();
    fetchMembers();
    fetchMemberships();
    fetchPlans();
    fetchJoinRequests();
    fetchPlanRequests();
    fetchMessages();
  }, [token]);

  const fetchGym = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/member/trainer-gym', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGym(res.data);
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

  const fetchPlanRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/plans/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlanRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch plan requests');
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/messages/trainer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data.members);
      setMessages(res.data.messages);
      if (res.data.members.length > 0 && !selectedMemberForMessaging) {
        setSelectedMemberForMessaging(res.data.members[0].user._id.toString());
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
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
      fetchPlans();
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

  const handleFulfillPlanRequest = async (requestId, memberId, type, week) => {
    setError('');
    setSuccess('');
    try {
      setPlanData({ type, memberId, week, content: '' });
      await axios.post('http://localhost:5000/api/plans/fulfill', { requestId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Plan request marked as fulfilled');
      fetchPlanRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fulfill plan request');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedMemberForMessaging || !newMessage.trim()) return;

    try {
      await axios.post('http://localhost:5000/api/messages', {
        recipientId: selectedMemberForMessaging,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Message sent successfully');
      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
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
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Trainer Dashboard</h1>
        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

        {/* Gym Details */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Gym: {gym.name}</h2>
          <p className="text-gray-600"><strong>Address:</strong> {gym.address}</p>
          <p className="text-gray-600"><strong>Owner:</strong> {gym.owner?.name} ({gym.owner?.email})</p>
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

        {/* Plan Requests */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Plan Requests</h2>
          {planRequests.length === 0 ? (
            <p className="text-gray-500">No pending plan requests</p>
          ) : (
            <ul className="space-y-4">
              {planRequests.map((request) => (
                <li key={request._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-200">
                  <span className="text-gray-700">
                    {request.member.user.name} ({request.member.user.email}) - {request.type} Plan (Week {request.week})
                  </span>
                  <button
                    onClick={() => handleFulfillPlanRequest(request._id, request.member._id, request.type, request.week)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    Fulfill Request
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Messages from Members */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Messages from Members</h2>
          {members.length === 0 ? (
            <p className="text-gray-500">No members to message</p>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-gray-600 font-medium mb-2">Select Member</label>
                <select
                  value={selectedMemberForMessaging || ''}
                  onChange={(e) => setSelectedMemberForMessaging(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {members.map((member) => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name} ({member.user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 max-h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
                {messages
                  .filter(msg =>
                    (msg.sender._id.toString() === selectedMemberForMessaging && msg.recipient._id.toString() === userId) ||
                    (msg.sender._id.toString() === userId && msg.recipient._id.toString() === selectedMemberForMessaging)
                  )
                  .map((msg) => (
                    <div
                      key={msg._id}
                      className={`mb-2 p-2 rounded-lg ${
                        msg.sender._id.toString() === userId ? 'bg-blue-100 ml-auto' : 'bg-gray-200 mr-auto'
                      } max-w-xs`}
                    >
                      <p className="text-sm text-gray-600">
                        {msg.sender.name} ({new Date(msg.timestamp).toLocaleString()}):
                      </p>
                      <p>{msg.content}</p>
                    </div>
                  ))}
              </div>

              <form onSubmit={handleSendMessage}>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
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

        {/* Assign Plan */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Assign Workout/Diet Plan</h2>
          <form onSubmit={handleAssignPlan}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Plan Type</label>
                <select
                  value={planData.type}
                  onChange={(e) => setPlanData({ ...planData, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Workout">Workout</option>
                  <option value="Diet">Diet</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-2">Member</label>
                <select
                  value={planData.memberId}
                  onChange={(e) => setPlanData({ ...planData, memberId: e.target.value })}
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
                <label className="block text-gray-600 font-medium mb-2">Week Number</label>
                <input
                  type="number"
                  value={planData.week}
                  onChange={(e) => setPlanData({ ...planData, week: e.target.value })}
                  placeholder="Week Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-gray-600 font-medium mb-2">Plan Details</label>
                <textarea
                  value={planData.content}
                  onChange={(e) => setPlanData({ ...planData, content: e.target.value })}
                  placeholder="e.g., Monday: 3x10 Squats, Tuesday: 3x12 Bench Press"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  required
                />
              </div>
            </div>
            <button type="submit" className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300">
              Assign Plan
            </button>
          </form>
        </div>

        {/* Existing Plans */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Assigned Plans</h2>
          {plans.length === 0 ? (
            <p className="text-gray-500">No plans assigned yet</p>
          ) : (
            <ul className="space-y-4">
              {plans.map((plan) => (
                <li key={plan._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-200">
                  <span className="text-gray-700">
                    <strong>{plan.type} Plan</strong> for {plan.member ? `${plan.member.user.name}` : 'Deleted Member'} (Week {plan.week})
                    <br />
                    {plan.content}
                  </span>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition duration-300"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrainerDashboard;
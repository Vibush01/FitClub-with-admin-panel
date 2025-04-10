import { useState, useEffect } from 'react';
import axios from 'axios';

function GymOwnerDashboard() {
  const [trainers, setTrainers] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [trainerEmail, setTrainerEmail] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [membershipData, setMembershipData] = useState({ memberId: '', joinDate: '', expiryDate: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTrainers();
    fetchMembers();
    fetchMemberships();
  }, []);

  const fetchTrainers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/trainers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrainers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trainers');
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

  const handleAddTrainer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/trainers', { trainerEmail }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTrainers();
      setTrainerEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add trainer');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/members', { memberEmail, contactNumber }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMembers();
      setMemberEmail('');
      setContactNumber('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleAddMembership = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/memberships', membershipData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Membership added successfully');
      fetchMemberships();
      setMembershipData({ memberId: '', joinDate: '', expiryDate: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add membership');
    }
  };

  const handleDeleteTrainer = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/trainers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTrainers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete trainer');
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete member');
    }
  };

  const handleDeleteMembership = async (id) => {
    setError('');
    setSuccess('');
    try {
      await axios.delete(`http://localhost:5000/api/memberships/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Membership deleted successfully');
      fetchMemberships();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete membership');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Gym Owner Dashboard</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

        {/* Add Trainer */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Add Trainer</h2>
          <form onSubmit={handleAddTrainer}>
            <div className="mb-4">
              <label className="block text-gray-600 font-medium mb-2">Trainer Email</label>
              <input
                type="email"
                value={trainerEmail}
                onChange={(e) => setTrainerEmail(e.target.value)}
                placeholder="Trainer Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300">
              Add Trainer
            </button>
          </form>
        </div>

        {/* Trainer List */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Trainers</h2>
          {trainers.length === 0 ? (
            <p className="text-gray-500">No trainers found</p>
          ) : (
            <ul className="space-y-4">
              {trainers.map((trainer) => (
                <li key={trainer._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-200">
                  <span className="text-gray-700">{trainer.user.name} ({trainer.user.email})</span>
                  <button
                    onClick={() => handleDeleteTrainer(trainer._id)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition duration-300"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add Member */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Add Member</h2>
          <form onSubmit={handleAddMember}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Member Email</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="Member Email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-2">Contact Number</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
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

        {/* Member List */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Members</h2>
          {members.length === 0 ? (
            <p className="text-gray-500">No members found</p>
          ) : (
            <ul className="space-y-4">
              {members.map((member) => (
                <li key={member._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-200">
                  <span className="text-gray-700">
                    {member.user.name} ({member.user.email}) - {member.contactNumber}
                  </span>
                  <button
                    onClick={() => handleDeleteMember(member._id)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition duration-300"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add Membership */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Add Membership</h2>
          <form onSubmit={handleAddMembership}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Member</label>
                <select
                  value={membershipData.memberId}
                  onChange={(e) => setMembershipData({ ...membershipData, memberId: e.target.value })}
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
                  value={membershipData.joinDate}
                  onChange={(e) => setMembershipData({ ...membershipData, joinDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={membershipData.expiryDate}
                  onChange={(e) => setMembershipData({ ...membershipData, expiryDate: e.target.value })}
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

        {/* Membership List */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Memberships</h2>
          {memberships.length === 0 ? (
            <p className="text-gray-500">No memberships found</p>
          ) : (
            <ul className="space-y-4">
              {memberships.map((membership) => (
                <li key={membership._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-200">
                  <span className="text-gray-700">
                    {membership.member.user.name} - Join: {new Date(membership.joinDate).toLocaleDateString()} - 
                    Expiry: {new Date(membership.expiryDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteMembership(membership._id)}
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

export default GymOwnerDashboard;
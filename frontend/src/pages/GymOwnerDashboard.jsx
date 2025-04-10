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
        try {
          await axios.post('http://localhost:5000/api/memberships', membershipData, {
            headers: { Authorization: `Bearer ${token}` }
          });
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
        try {
          await axios.delete(`http://localhost:5000/api/members/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchMembers();
          fetchMemberships();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to delete member');
        }
      };

      const handleDeleteMembership = async (id) => {
        try {
          await axios.delete(`http://localhost:5000/api/memberships/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchMemberships();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to delete membership');
        }
      };

      return (
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Gym Owner Dashboard</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Add Trainer */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Trainer</h2>
            <form onSubmit={handleAddTrainer}>
              <div className="mb-4">
                <input
                  type="email"
                  value={trainerEmail}
                  onChange={(e) => setTrainerEmail(e.target.value)}
                  placeholder="Trainer Email"
                  className="p-2 border rounded w-full"
                  required
                />
              </div>
              <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Add Trainer
              </button>
            </form>
          </div>

          {/* Trainer List */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Trainers</h2>
            {trainers.length === 0 ? (
              <p>No trainers found</p>
            ) : (
              <ul>
                {trainers.map((trainer) => (
                  <li key={trainer._id} className="flex justify-between items-center p-2 border-b">
                    <span>{trainer.user.name} ({trainer.user.email})</span>
                    <button
                      onClick={() => handleDeleteTrainer(trainer._id)}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Member */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="Member Email"
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Contact Number"
                  className="p-2 border rounded"
                  required
                />
              </div>
              <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Add Member
              </button>
            </form>
          </div>

          {/* Member List */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Members</h2>
            {members.length === 0 ? (
              <p>No members found</p>
            ) : (
              <ul>
                {members.map((member) => (
                  <li key={member._id} className="flex justify-between items-center p-2 border-b">
                    <span>{member.user.name} ({member.user.email}) - {member.contactNumber}</span>
                    <button
                      onClick={() => handleDeleteMember(member._id)}
                      className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add Membership */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Membership</h2>
            <form onSubmit={handleAddMembership}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={membershipData.memberId}
                  onChange={(e) => setMembershipData({ ...membershipData, memberId: e.target.value })}
                  className="p-2 border rounded"
                  required
                >
                  <option value="">Select Member</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.user.name} ({member.user.email})
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={membershipData.joinDate}
                  onChange={(e) => setMembershipData({ ...membershipData, joinDate: e.target.value })}
                  placeholder="Join Date"
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="date"
                  value={membershipData.expiryDate}
                  onChange={(e) => setMembershipData({ ...membershipData, expiryDate: e.target.value })}
                  placeholder="Expiry Date"
                  className="p-2 border rounded"
                  required
                />
              </div>
              <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Add Membership
              </button>
            </form>
          </div>

          {/* Membership List */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Memberships</h2>
            {memberships.length === 0 ? (
              <p>No memberships found</p>
            ) : (
              <ul>
                {memberships.map((membership) => (
                  <li key={membership._id} className="flex justify-between items-center p-2 border-b">
                    <span>
                      {membership.member.user.name} - Join: {new Date(membership.joinDate).toLocaleDateString()} - 
                      Expiry: {new Date(membership.expiryDate).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteMembership(membership._id)}
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

    export default GymOwnerDashboard;
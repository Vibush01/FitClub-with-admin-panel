import { useState, useEffect } from 'react';
import axios from 'axios';

function OwnerDashboard() {
  const [gyms, setGyms] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    ownerEmail: '',
    membershipDetails: [{ planName: '', price: '', duration: '' }],
    ownerDetails: { fullName: '', phone: '' }
  });
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/gyms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGyms(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch gyms');
    }
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name.startsWith('membershipDetails')) {
      const [_, field] = name.split('.');
      const updatedMembership = [...formData.membershipDetails];
      updatedMembership[index][field] = value;
      setFormData({ ...formData, membershipDetails: updatedMembership });
    } else if (name.startsWith('ownerDetails')) {
      const [_, field] = name.split('.');
      setFormData({ ...formData, ownerDetails: { ...formData.ownerDetails, [field]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/gyms', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGyms();
      setFormData({
        name: '',
        address: '',
        ownerEmail: '',
        membershipDetails: [{ planName: '', price: '', duration: '' }],
        ownerDetails: { fullName: '', phone: '' }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create gym');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/gyms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGyms();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete gym');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">Owner Dashboard</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {/* Create Gym Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Add New Gym</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 font-medium mb-2">Gym Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Gym Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-2">Address</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-2">Gym Owner Email</label>
                <input
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  placeholder="Gym Owner Email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-2">Owner Full Name</label>
                <input
                  name="ownerDetails.fullName"
                  value={formData.ownerDetails.fullName}
                  onChange={handleInputChange}
                  placeholder="Owner Full Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-2">Owner Phone</label>
                <input
                  name="ownerDetails.phone"
                  value={formData.ownerDetails.phone}
                  onChange={handleInputChange}
                  placeholder="Owner Phone"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <h3 className="mt-6 mb-3 text-lg font-semibold text-gray-700">Membership Plans</h3>
            {formData.membershipDetails.map((plan, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-600 font-medium mb-2">Plan Name</label>
                  <input
                    name={`membershipDetails.planName`}
                    value={plan.planName}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Plan Name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-2">Price</label>
                  <input
                    name={`membershipDetails.price`}
                    type="number"
                    value={plan.price}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Price"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-2">Duration (days)</label>
                  <input
                    name={`membershipDetails.duration`}
                    type="number"
                    value={plan.duration}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Duration (days)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            ))}
            <button type="submit" className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300">
              Create Gym
            </button>
          </form>
        </div>

        {/* Gym List */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Gym List</h2>
          {gyms.length === 0 ? (
            <p className="text-gray-500">No gyms found</p>
          ) : (
            <ul className="space-y-4">
              {gyms.map((gym) => (
                <li key={gym._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition duration-200">
                  <span className="text-gray-700">{gym.name} - {gym.address}</span>
                  <button
                    onClick={() => handleDelete(gym._id)}
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

export default OwnerDashboard;
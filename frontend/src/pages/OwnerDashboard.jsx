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
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Owner Dashboard</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Create Gym Form */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Gym</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Gym Name"
                  className="p-2 border rounded"
                  required
                />
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="p-2 border rounded"
                  required
                />
                <input
                  name="ownerEmail"
                  value={formData.ownerEmail}
                  onChange={handleInputChange}
                  placeholder="Gym Owner Email"
                  className="p-2 border rounded"
                  required
                />
                <input
                  name="ownerDetails.fullName"
                  value={formData.ownerDetails.fullName}
                  onChange={handleInputChange}
                  placeholder="Owner Full Name"
                  className="p-2 border rounded"
                  required
                />
                <input
                  name="ownerDetails.phone"
                  value={formData.ownerDetails.phone}
                  onChange={handleInputChange}
                  placeholder="Owner Phone"
                  className="p-2 border rounded"
                  required
                />
              </div>
              <h3 className="mt-4 mb-2 font-semibold">Membership Plans</h3>
              {formData.membershipDetails.map((plan, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    name={`membershipDetails.planName`}
                    value={plan.planName}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Plan Name"
                    className="p-2 border rounded"
                    required
                  />
                  <input
                    name={`membershipDetails.price`}
                    type="number"
                    value={plan.price}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Price"
                    className="p-2 border rounded"
                    required
                  />
                  <input
                    name={`membershipDetails.duration`}
                    type="number"
                    value={plan.duration}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Duration (days)"
                    className="p-2 border rounded"
                    required
                  />
                </div>
              ))}
              <button type="submit" className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Create Gym
              </button>
            </form>
          </div>

          {/* Gym List */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Gym List</h2>
            {gyms.length === 0 ? (
              <p>No gyms found</p>
            ) : (
              <ul>
                {gyms.map((gym) => (
                  <li key={gym._id} className="flex justify-between items-center p-2 border-b">
                    <span>{gym.name} - {gym.address}</span>
                    <button
                      onClick={() => handleDelete(gym._id)}
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

    export default OwnerDashboard;
const Member = require('../models/Member');
    const Gym = require('../models/Gym');
    const User = require('../models/User');
    const Trainer = require('../models/Trainer');

    const addMember = async (req, res) => {
      const { memberEmail, contactNumber } = req.body;

      if (!memberEmail || !contactNumber) {
        return res.status(400).json({ message: 'Member email and contact number are required' });
      }

      try {
        let gym;
        if (req.user.role === 'Gym') {
          gym = await Gym.findOne({ owner: req.user.id });
        } else if (req.user.role === 'Trainer') {
          const trainer = await Trainer.findOne({ user: req.user.id });
          if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });
          gym = await Gym.findById(trainer.gym);
        }
        if (!gym) {
          return res.status(403).json({ message: 'You are not associated with a gym' });
        }

        const memberUser = await User.findOne({ email: memberEmail, role: 'Member' });
        if (!memberUser) {
          return res.status(400).json({ message: 'Member email must correspond to an existing Member user' });
        }

        const existingMember = await Member.findOne({ user: memberUser._id, gym: gym._id });
        if (existingMember) {
          return res.status(400).json({ message: 'Member already in this gym' });
        }

        const member = new Member({
          user: memberUser._id,
          gym: gym._id,
          contactNumber
        });
        await member.save();

        gym.members.push(memberUser._id);
        await gym.save();

        res.status(201).json({ message: 'Member added successfully', member });
      } catch (err) {
        res.status(500).json({ message: 'Failed to add member', error: err.message });
      }
    };

    const getMembers = async (req, res) => {
      try {
        let gym;
        if (req.user.role === 'Gym') {
          gym = await Gym.findOne({ owner: req.user.id });
        } else if (req.user.role === 'Trainer') {
          const trainer = await Trainer.findOne({ user: req.user.id });
          console.log('Trainer:', trainer);
          if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });
          gym = await Gym.findById(trainer.gym);
          console.log('Gym:', gym);
        }
        if (!gym) {
          return res.status(403).json({ message: 'You are not associated with a gym' });
        }

        // Fetch members and validate user references
        const members = await Member.find({ gym: gym._id });
        const memberIds = members.map(member => member.user);
        const validUsers = await User.find({ _id: { $in: memberIds } }).select('email name');
        const validUserIds = validUsers.map(user => user._id.toString());

        const filteredMembers = members
          .filter(member => validUserIds.includes(member.user.toString()))
          .map(member => {
            const user = validUsers.find(u => u._id.toString() === member.user.toString());
            return {
              ...member.toObject(),
              user: user ? { email: user.email, name: user.name } : null
            };
          });

        console.log('Filtered Members:', filteredMembers);
        res.json(filteredMembers);
      } catch (err) {
        console.error('Error in getMembers:', err);
        res.status(500).json({ message: 'Failed to fetch members', error: err.message });
      }
    };

    const updateMember = async (req, res) => {
      const { contactNumber } = req.body;

      try {
        let gym;
        if (req.user.role === 'Gym') {
          gym = await Gym.findOne({ owner: req.user.id });
        } else if (req.user.role === 'Trainer') {
          const trainer = await Trainer.findOne({ user: req.user.id });
          if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });
          gym = await Gym.findById(trainer.gym);
        }
        if (!gym) {
          return res.status(403).json({ message: 'You are not associated with a gym' });
        }

        const member = await Member.findById(req.params.id);
        if (!member || member.gym.toString() !== gym._id.toString()) {
          return res.status(404).json({ message: 'Member not found in your gym' });
        }

        member.contactNumber = contactNumber || member.contactNumber;
        await member.save();

        res.json({ message: 'Member updated successfully', member });
      } catch (err) {
        res.status(500).json({ message: 'Failed to update member', error: err.message });
      }
    };

    const deleteMember = async (req, res) => {
      try {
        let gym;
        if (req.user.role === 'Gym') {
          gym = await Gym.findOne({ owner: req.user.id });
        } else if (req.user.role === 'Trainer') {
          const trainer = await Trainer.findOne({ user: req.user.id });
          if (!trainer) return res.status(403).json({ message: 'Trainer not assigned to any gym' });
          gym = await Gym.findById(trainer.gym);
        }
        if (!gym) {
          return res.status(403).json({ message: 'You are not associated with a gym' });
        }

        const member = await Member.findById(req.params.id);
        if (!member || member.gym.toString() !== gym._id.toString()) {
          return res.status(404).json({ message: 'Member not found in your gym' });
        }

        await Member.deleteOne({ _id: member._id });
        gym.members = gym.members.filter(m => m.toString() !== member.user.toString());
        await gym.save();

        res.json({ message: 'Member removed successfully' });
      } catch (err) {
        res.status(500).json({ message: 'Failed to delete member', error: err.message });
      }
    };

    module.exports = { addMember, getMembers, updateMember, deleteMember };
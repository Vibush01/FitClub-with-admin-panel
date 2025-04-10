console.log('Starting memberActionController.js');

    const viewGymProfile = async (req, res) => {
      console.log('viewGymProfile called');
      res.json({ message: 'viewGymProfile called' });
    };

    const getTrainerGym = async (req, res) => {
      const Gym = require('../models/Gym');
      const Trainer = require('../models/Trainer');
      console.log('getTrainerGym called');
      try {
        const trainer = await Trainer.findOne({ user: req.user.id });
        console.log('Trainer:', trainer);
        if (!trainer) {
          return res.status(403).json({ message: 'Trainer not assigned to any gym' });
        }

        const gym = await Gym.findById(trainer.gym)
          .populate('owner', 'name email')
          .populate('trainers', 'name email');
        console.log('Gym:', gym);
        if (!gym) {
          return res.status(404).json({ message: 'Gym not found' });
        }

        res.json({
          name: gym.name,
          address: gym.address,
          photos: gym.photos,
          membershipDetails: gym.membershipDetails,
          owner: gym.owner,
          trainers: gym.trainers
        });
      } catch (err) {
        console.error('Error in getTrainerGym:', err);
        res.status(500).json({ message: 'Failed to fetch gym profile', error: err.message });
      }
    };

    const requestPlan = async (req, res) => {
      console.log('requestPlan called');
      res.json({ message: 'requestPlan called' });
    };

    console.log('Exporting memberActionController functions:', { viewGymProfile, getTrainerGym, requestPlan });

    module.exports = { viewGymProfile, getTrainerGym, requestPlan };

    console.log('Finished memberActionController.js');
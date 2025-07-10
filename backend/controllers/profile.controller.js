import ProfileModel from '../models/profile.model.js';

class ProfileController {

  async register(req, res) {
    try {
      const { user_id, profile_fullName, profile_phone, profile_email, profile_photo, profile_address } = req.body;
      // Validación básica
      if (!user_id || !profile_fullName || !profile_phone || !profile_email) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      const profileId = await ProfileModel.create({
        user_id, profile_fullName, profile_phone, profile_email, profile_photo, profile_address
      });
      res.status(201).json({
        message: 'Profile created successfully',
        id: profileId
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      const profileModel = await ProfileModel.show();
      if (!profileModel) {
        return res.status(409).json({ error: 'No profiles found' });
      }
      res.status(200).json({
        message: 'Profiles fetched successfully',
        data: profileModel
      });
    } catch (error) {
      console.error('Error in show:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
      const { profile_fullName, profile_phone, profile_email, profile_photo, profile_address } = req.body;
      const user_id = req.params.id;
      if (!user_id || !profile_fullName || !profile_phone || !profile_email) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      const updateProfileModel = await ProfileModel.update(user_id, { profile_fullName, profile_phone, profile_email, profile_photo, profile_address });
      res.status(200).json({
        message: 'Profile updated successfully',
        data: updateProfileModel
      });
    } catch (error) {
      console.error('Error in update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req, res) {
    try {
      const user_id = req.params.id;
      if (!user_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      const deleteProfileModel = await ProfileModel.delete(user_id);
      res.status(200).json({
        message: 'Profile deleted successfully',
        data: deleteProfileModel
      });
    } catch (error) {
      console.error('Error in delete:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findById(req, res) {
    try {
      const user_id = req.params.id;
      if (!user_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      const existingProfileModel = await ProfileModel.findById(user_id);
      if (!existingProfileModel) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.status(200).json({
        message: 'Profile fetched successfully',
        data: existingProfileModel
      });
    } catch (error) {
      console.error('Error in findById:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new ProfileController();

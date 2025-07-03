import ProfileModel from '../models/profile.model.js';

class ProfileController {

  async register(req, res) {
    try {
      const { user_id, profile_fullName, profile_phone, profile_email, profile_photo, profile_address } = req.body;
      
      // Basic validation
      if (!user_id || !profile_fullName || !profile_phone || !profile_email) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      
      // Check if profile for this user already exists
      const existingProfile = await ProfileModel.findById(user_id);
      if (existingProfile) {
        return res.status(409).json({ error: 'Profile for this user already exists' });
      }
      
      // Check if email is already in use
      const existingEmail = await ProfileModel.findByEmail(profile_email);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      
      const profileId = await ProfileModel.create({
        user_id,
        profile_fullName,
        profile_phone,
        profile_email,
        profile_photo,
        profile_address
      });
      
      if (!profileId) {
        return res.status(500).json({ error: 'Failed to create profile' });
      }
      
      res.status(201).json({
        message: 'Profile created successfully',
        id: profileId
      });
    } catch (error) {
      console.error('Error in profile registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      const profileModel = await ProfileModel.showActive();
      res.status(201).json({
        message: 'Profiles retrieved successfully',
        data: profileModel
      });
    } catch (error) {
      console.error('Error retrieving profiles:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
      const { profile_fullName, profile_phone, profile_email, profile_photo, profile_address } = req.body;
      const user_id = req.params.id;
      
      // Basic validation
      if (!profile_fullName || !profile_phone || !profile_email || !user_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      
      // Verify if the Profile already exists  
      const existingProfile = await ProfileModel.findByIdActive(user_id);
      if (!existingProfile) {
        return res.status(409).json({ data: '', error: 'The Profile does not exist' });
      }   

      const updateProfileModel = await ProfileModel.update(user_id, { 
        profile_fullName,
        profile_phone,
        profile_email,
        profile_photo,
        profile_address
      });
      
      if (!updateProfileModel) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }
      
      res.status(201).json({
        message: 'Profile updated successfully',
        data: updateProfileModel
      });
    } catch (error) {
      console.error('Error in profile update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req, res) {
    try {
      const user_id = req.params.id;
      // Basic validate
      if (!user_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Verify if the Profile already exists
      const deleteProfileModel = await ProfileModel.delete(user_id);
      res.status(201).json({
        message: 'Profile deleted successfully',
        data: deleteProfileModel
      });
    } catch (error) {
      console.error('Error in profile delete:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findById(req, res) {
    try {
      const user_id = req.params.id;
      // Basic validate
      if (!user_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Verify if the Profile already exists
      const profileModel = await ProfileModel.findById(user_id);
      if (!profileModel) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.status(201).json({
        message: 'Profile found successfully',
        data: profileModel
      });
    } catch (error) {
      console.error('Error finding profile:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new ProfileController();

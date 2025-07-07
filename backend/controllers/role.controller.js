import RoleModel from '../models/role.model.js';

class RoleController {

  async register(req, res) {
    try {
      const { role_name, role_description, status_id } = req.body;
      // Basic validation
      if (!role_name || !role_description || !status_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const roleId = await RoleModel.create({
        role_name,
        role_description,
        status_id
      });
      res.status(201).json({
        message: 'Role created successfully',
        id: roleId
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      // Get all active roles
      const roleModel = await RoleModel.showActive();
      res.status(200).json({
        message: 'Roles retrieved successfully',
        data: roleModel || []
      });
    } catch (error) {
      console.error('Error retrieving roles:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
      const { role_name, role_description, status_id } = req.body;
      const id = req.params.id;
      // Basic validation
      if (!role_name || !role_description || !status_id || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Verify if the Role exists  
      const existingRole = await RoleModel.findByIdActive(id);
      if (!existingRole) {
        return res.status(404).json({ error: 'Role not found' });
      }

      const updateRoleModel = await RoleModel.update(id, {
        role_name, role_description, status_id
      });
      res.status(200).json({
        message: 'Role updated successfully',
        data: updateRoleModel
      });
    } catch (error) {
      console.error('Error in role update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Delete role
      const deleteRoleModel = await RoleModel.delete(id);
      res.status(200).json({
        message: 'Role deleted successfully',
        data: deleteRoleModel
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Get role by ID
      const existingRoleModel = await RoleModel.findByIdActive(id);
      if (!existingRoleModel) {
        return res.status(404).json({ error: 'Role not found' });
      }
      res.status(200).json({
        message: 'Role found successfully',
        data: existingRoleModel
      });
    } catch (error) {
      console.error('Error finding role:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
export default new RoleController();
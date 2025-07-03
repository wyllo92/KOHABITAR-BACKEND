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
      // Verify if the Role already exists
      const roleModel = await RoleModel.showActive();
      if (!roleModel) {
        return res.status(409).json({ error: 'The Role no already exists' });
      }
      res.status(201).json({
        message: 'Role successfully',
        data: roleModel
      });
    } catch (error) {
      console.error('Error in registration:', error);
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
      // Verify if the Role already exists  
      const existingRole = await RoleModel.findByIdActive(id);
      if (!existingRole) {
        return res.status(409).json({ data: '', error: 'The Role no already exists' });
      }   

      const updateRoleModel = await RoleModel.update(id, { 
        role_name, role_description, status_id 
      });
      res.status(201).json({
        message: 'Role update successfully',
        data: updateRoleModel
      });
    } catch (error) {
      console.error('Error in registration:', error);
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
      // Verify if the Role already exists
      const deleteRoleModel = await RoleModel.delete(id);
      res.status(201).json({
        message: 'Role delete successfully',
        data: deleteRoleModel
      });
    } catch (error) {
      console.error('Error in registration:', error);
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
      // Verify if the Role already exists
      const existingRoleModel = await RoleModel.findByIdActive(id);
      if (!existingRoleModel) {
        return res.status(409).json({ error: 'The Role No already exists' });
      }
      res.status(201).json({
        message: 'Role successfully',
        data: existingRoleModel
      });
    } catch (error) {
      console.error('Error in registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
export default new RoleController();
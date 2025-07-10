import ModuleModel from '../models/module.model.js';

class ModuleController {

  async register(req, res) {
    try {
      const { module_route, module_description, is_active } = req.body;
      // Basic validation
      if (!module_route || !is_active) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const moduleId = await ModuleModel.create({
        module_route,
        module_description,
        is_active
      });
      res.status(201).json({
        message: 'Module created successfully',
        module_id: moduleId
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      const moduleModel = await ModuleModel.show();
      if (!moduleModel) {
        return res.status(409).json({ error: 'No modules found' });
      }
      res.status(200).json({
        message: 'Modules fetched successfully',
        data: moduleModel
      });
    } catch (error) {
      console.error('Error in show:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
      const { module_route, module_description, is_active } = req.body;
      const module_id = req.params.id;
      if (!module_route || !is_active || !module_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      const existingModule = await ModuleModel.findById(module_id);
      if (!existingModule || existingModule.length === 0) {
        return res.status(404).json({ error: 'Module not found' });
      }
      const updateModule = await ModuleModel.update(module_id, { module_route, module_description, is_active });
      res.status(200).json({
        message: 'Module updated successfully',
        data: updateModule
      });
    } catch (error) {
      console.error('Error in update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req, res) {
    try {
      const module_id = req.params.id;
      if (!module_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      const deleteModule = await ModuleModel.delete(module_id);
      res.status(200).json({
        message: 'Module deleted successfully',
        data: deleteModule
      });
    } catch (error) {
      console.error('Error in delete:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findById(req, res) {
    try {
      const module_id = req.params.id;
      if (!module_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      const module = await ModuleModel.findById(module_id);
      if (!module || module.length === 0) {
        return res.status(404).json({ error: 'Module not found' });
      }
      res.status(200).json({
        message: 'Module fetched successfully',
        data: module
      });
    } catch (error) {
      console.error('Error in findById:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async modulesByUserRole(req, res) {
    try {
      const { user_id, route_id } = req.body;

      // Basic validation
      if (!user_id || !route_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      const getModules = await ModuleModel.findModulesByUserRole(user_id, route_id);
      if (!getModules) {
        return res.status(409).json({ error: 'The module no already exists' });
      }

      res.status(201).json({
        message: 'Get Module User Role successfully',
        data: getModules
      });
    } catch (error) {
      console.error('Error in registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new ModuleController();
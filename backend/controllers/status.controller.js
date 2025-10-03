import StatusModel from '../models/status.model.js';

class StatusController {

  // Crear un nuevo status
  async register(req, res) {
    try {
      const { status_name, status_description, status_entity, status_is_active } = req.body;

      // Validación básica
      if (!status_name || !status_entity) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Verificar si ya existe un status con ese nombre para la misma entidad
      const existingStatus = await StatusModel.findByName(status_name);
      if (existingStatus) {
        return res.status(409).json({ error: 'Status with this name already exists' });
      }

      const statusId = await StatusModel.create({
        status_name,
        status_description,
        status_entity,
        status_is_active: status_is_active !== undefined ? status_is_active : 1
      });

      res.status(201).json({
        message: 'Status created successfully',
        id: statusId
      });
    } catch (error) {
      console.error('Error in status registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Mostrar todos los status activos
  async show(req, res) {
    try {
      const statusModel = await StatusModel.showActive();
      res.status(200).json({
        message: 'Status retrieved successfully',
        data: statusModel || []
      });
    } catch (error) {
      console.error('Error retrieving status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Mostrar status filtrados por entidad (ejemplo: usuarios, pedidos, etc.)
  async findByEntity(req, res) {
    try {
      const { entity } = req.params;
      if (!entity) {
        return res.status(400).json({ error: 'Entity is required' });
      }

      const statusList = await StatusModel.findByEntity(entity);
      res.status(200).json({
        message: 'Status retrieved successfully',
        data: statusList || []
      });
    } catch (error) {
      console.error('Error retrieving status by entity:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Actualizar un status
  async update(req, res) {
    try {
      const { status_name, status_description, status_entity, status_is_active } = req.body;
      const id = req.params.id;

      if (!status_name || !status_entity || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const existingStatus = await StatusModel.findByIdActive(id);
      if (!existingStatus) {
        return res.status(404).json({ error: 'The Status does not exist' });
      }

      const updateStatusModel = await StatusModel.update(id, {
        status_name,
        status_description,
        status_entity,
        status_is_active: status_is_active !== undefined ? status_is_active : existingStatus.status_is_active
      });

      res.status(200).json({
        message: 'Status updated successfully',
        data: updateStatusModel
      });
    } catch (error) {
      console.error('Error in status update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Eliminar un status
  async delete(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const deleteStatusModel = await StatusModel.delete(id);
      res.status(200).json({
        message: 'Status deleted successfully',
        data: deleteStatusModel
      });
    } catch (error) {
      console.error('Error in status delete:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Buscar status por ID
  async findById(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const statusModel = await StatusModel.findById(id);
      if (!statusModel) {
        return res.status(404).json({ error: 'Status not found' });
      }

      res.status(200).json({
        message: 'Status found successfully',
        data: statusModel
      });
    } catch (error) {
      console.error('Error finding status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new StatusController();

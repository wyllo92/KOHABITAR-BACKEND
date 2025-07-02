import StatusModel from '../models/status.model.js';

class StatusController {
  
  // Obtener todos los estados
  static async getAllStatus(req, res) {
    try {
      const status = await StatusModel.show();
      res.json({
        success: true,
        data: status,
        message: 'Estados obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los estados',
        error: error.message
      });
    }
  }

  // Obtener un estado por ID
  static async getStatusById(req, res) {
    try {
      const { id } = req.params;
      const status = await StatusModel.findById(id);
      
      if (!status) {
        return res.status(404).json({
          success: false,
          message: 'Estado no encontrado'
        });
      }

      res.json({
        success: true,
        data: status,
        message: 'Estado obtenido exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el estado',
        error: error.message
      });
    }
  }

  // Crear un nuevo estado
  static async createStatus(req, res) {
    try {
      const {
        status_name,
        status_description,
        status_entity,
        status_is_active
      } = req.body;

      // Validaciones básicas
      if (!status_name || !status_entity) {
        return res.status(400).json({
          success: false,
          message: 'El nombre y entidad del estado son requeridos'
        });
      }

      const statusData = {
        status_name,
        status_description: status_description || '',
        status_entity,
        status_is_active: status_is_active !== undefined ? status_is_active : 1
      };

      const statusId = await StatusModel.create(statusData);
      
      if (statusId) {
        const newStatus = await StatusModel.findById(statusId);
        res.status(201).json({
          success: true,
          data: newStatus,
          message: 'Estado creado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al crear el estado'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el estado',
        error: error.message
      });
    }
  }

  // Actualizar un estado
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const {
        status_name,
        status_description,
        status_entity,
        status_is_active
      } = req.body;

      // Verificar si el estado existe
      const existingStatus = await StatusModel.findById(id);
      if (!existingStatus) {
        return res.status(404).json({
          success: false,
          message: 'Estado no encontrado'
        });
      }

      const updateData = {
        status_name: status_name || existingStatus.status_name,
        status_description: status_description || existingStatus.status_description,
        status_entity: status_entity || existingStatus.status_entity,
        status_is_active: status_is_active !== undefined ? status_is_active : existingStatus.status_is_active
      };

      const updatedStatus = await StatusModel.update(id, updateData);
      
      if (updatedStatus) {
        res.json({
          success: true,
          data: updatedStatus,
          message: 'Estado actualizado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar el estado'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el estado',
        error: error.message
      });
    }
  }

  // Eliminar un estado
  static async deleteStatus(req, res) {
    try {
      const { id } = req.params;

      // Verificar si el estado existe
      const existingStatus = await StatusModel.findById(id);
      if (!existingStatus) {
        return res.status(404).json({
          success: false,
          message: 'Estado no encontrado'
        });
      }

      const deleted = await StatusModel.delete(id);
      
      if (deleted) {
        res.json({
          success: true,
          message: 'Estado eliminado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al eliminar el estado'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el estado',
        error: error.message
      });
    }
  }

  // Obtener estados por entidad
  static async getStatusByEntity(req, res) {
    try {
      const { entity } = req.params;
      const status = await StatusModel.findByEntity(entity);
      
      res.json({
        success: true,
        data: status,
        message: `Estados de entidad ${entity} obtenidos exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los estados por entidad',
        error: error.message
      });
    }
  }
}

export default StatusController; 
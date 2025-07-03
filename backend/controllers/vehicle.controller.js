import VehicleModel from '../models/vehicle.model.js';

class VehicleController {
  
  // Obtener todos los vehículos
  async getAllVehicles(req, res) {
    try {
      const vehicles = await VehicleModel.show();
      res.json({
        success: true,
        data: vehicles,
        message: 'Vehículos obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los vehículos',
        error: error.message
      });
    }
  }

  // Obtener un vehículo por ID
  async getVehicleById(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await VehicleModel.findById(id);
      
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado'
        });
      }

      res.json({
        success: true,
        data: vehicle,
        message: 'Vehículo obtenido exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el vehículo',
        error: error.message
      });
    }
  }

  // Crear un nuevo vehículo
  async createVehicle(req, res) {
    try {
      const {
        model,
        type,
        color,
        user_id,
        property_id,
        parkingZone_id,
        status_id,
        vehicle_createAt,
        vehicle_updateAt
      } = req.body;

      // Validaciones básicas
      if (!model || !type || !color || !user_id || !property_id || !status_id) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos obligatorios son requeridos'
        });
      }

      const vehicleData = {
        model,
        type,
        color,
        user_id,
        property_id,
        parkingZone_id: parkingZone_id || null,
        status_id,
        vehicle_createAt: vehicle_createAt || new Date().toISOString().split('T')[0],
        vehicle_updateAt: vehicle_updateAt || new Date().toISOString().split('T')[0]
      };

      const vehicleId = await VehicleModel.create(vehicleData);
      
      if (vehicleId) {
        const newVehicle = await VehicleModel.findById(vehicleId);
        res.status(201).json({
          success: true,
          data: newVehicle,
          message: 'Vehículo creado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al crear el vehículo'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el vehículo',
        error: error.message
      });
    }
  }

  // Actualizar un vehículo
  async updateVehicle(req, res) {
    try {
      const { id } = req.params;
      const {
        model,
        type,
        color,
        user_id,
        property_id,
        parkingZone_id,
        status_id,
        vehicle_updateAt
      } = req.body;

      // Verificar si el vehículo existe
      const existingVehicle = await VehicleModel.findById(id);
      if (!existingVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado'
        });
      }

      const updateData = {
        model: model || existingVehicle.model,
        type: type || existingVehicle.type,
        color: color || existingVehicle.color,
        user_id: user_id || existingVehicle.user_id,
        property_id: property_id || existingVehicle.property_id,
        parkingZone_id: parkingZone_id || existingVehicle.parkingZone_id,
        status_id: status_id || existingVehicle.status_id,
        vehicle_updateAt: vehicle_updateAt || new Date().toISOString().split('T')[0]
      };

      const updatedVehicle = await VehicleModel.update(id, updateData);
      
      if (updatedVehicle) {
        res.json({
          success: true,
          data: updatedVehicle,
          message: 'Vehículo actualizado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar el vehículo'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el vehículo',
        error: error.message
      });
    }
  }

  // Eliminar un vehículo
  async deleteVehicle(req, res) {
    try {
      const { id } = req.params;

      // Verificar si el vehículo existe
      const existingVehicle = await VehicleModel.findById(id);
      if (!existingVehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado'
        });
      }

      const deleted = await VehicleModel.delete(id);
      
      if (deleted) {
        res.json({
          success: true,
          message: 'Vehículo eliminado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al eliminar el vehículo'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el vehículo',
        error: error.message
      });
    }
  }

  // Obtener vehículos por usuario
  async getVehiclesByUserId(req, res) {
    try {
      const { user_id } = req.params;
      const vehicles = await VehicleModel.findByUserId(user_id);
      
      res.json({
        success: true,
        data: vehicles,
        message: `Vehículos del usuario ${user_id} obtenidos exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los vehículos del usuario',
        error: error.message
      });
    }
  }

  // Obtener vehículos por propiedad
  async getVehiclesByPropertyId(req, res) {
    try {
      const { property_id } = req.params;
      const vehicles = await VehicleModel.findByPropertyId(property_id);
      
      res.json({
        success: true,
        data: vehicles,
        message: `Vehículos de la propiedad ${property_id} obtenidos exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los vehículos de la propiedad',
        error: error.message
      });
    }
  }

  // Obtener vehículos por tipo
  async getVehiclesByType(req, res) {
    try {
      const { type } = req.params;
      const vehicles = await VehicleModel.findByType(type);
      
      res.json({
        success: true,
        data: vehicles,
        message: `Vehículos de tipo ${type} obtenidos exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los vehículos por tipo',
        error: error.message
      });
    }
  }
}

export default new VehicleController(); 
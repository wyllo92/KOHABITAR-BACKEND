import VehicleModel from '../models/vehicle.model.js';

class VehicleController {

  async register(req, res) {
    try {
      const { license_plate, model, type, color, user_id, property_id, parkingZone_id, status_id } = req.body;
      // Basic validation
      if (!license_plate || !model || !type || !color || !user_id || !property_id || !status_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const currentDate = new Date().toISOString().split('T')[0];
      const vehicleId = await VehicleModel.create({
        license_plate,
        model,
        type,
        color,
        user_id,
        property_id,
        parkingZone_id,
        status_id,
        vehicle_createAt: currentDate,
        vehicle_updateAt: currentDate
      });

      if (!vehicleId) {
        return res.status(500).json({ error: 'Failed to create vehicle' });
      }

      res.status(201).json({
        message: 'Vehicle created successfully',
        id: vehicleId
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      // Verify if the Vehicle already exists
      const vehicleModel = await VehicleModel.showActive();
      if (!vehicleModel) {
        return res.status(409).json({ error: 'The Vehicle no already exists' });
      }
      res.status(201).json({
        message: 'Vehicle successfully',
        data: vehicleModel
      });
    } catch (error) {
      console.error('Error in registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
      const { license_plate, model, type, color, user_id, property_id, parkingZone_id, status_id } = req.body;
      const id = req.params.id;
      // Basic validation
      if (!license_plate || !model || !type || !color || !user_id || !property_id || !status_id || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Verify if the Vehicle already exists  
      const existingVehicle = await VehicleModel.findByIdActive(id);
      if (!existingVehicle) {
        return res.status(409).json({ data: '', error: 'The Vehicle does not exist' });
      }

      const currentDate = new Date().toISOString().split('T')[0];
      const updateData = {
        license_plate,
        model,
        type,
        color,
        user_id,
        property_id,
        parkingZone_id,
        status_id,
        vehicle_updateAt: currentDate
      };
      const updateVehicleModel = await VehicleModel.update(id, updateData);

      if (!updateVehicleModel) {
        return res.status(500).json({ error: 'Failed to update vehicle' });
      }

      res.status(201).json({
        message: 'Vehicle update successfully',
        data: updateVehicleModel
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
      // Verify if the Vehicle already exists
      const deleteVehicleModel = await VehicleModel.delete(id);
      res.status(201).json({
        message: 'Vehicle delete successfully',
        data: deleteVehicleModel
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
      // Verify if the Vehicle already exists
      const existingVehicleModel = await VehicleModel.findByIdActive(id);
      if (!existingVehicleModel) {
        return res.status(409).json({ error: 'The Vehicle No already exists' });
      }
      res.status(201).json({
        message: 'Vehicle successfully',
        data: existingVehicleModel
      });
    } catch (error) {
      console.error('Error in registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
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
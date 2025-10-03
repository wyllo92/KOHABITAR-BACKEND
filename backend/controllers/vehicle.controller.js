import VehicleModel from '../models/vehicle.model.js';

class VehicleController {

  async register(req, res) {
    try {
      const { license_plate, model, type, color, user_id, property_id, parkingZone_id, status_id } = req.body;
      
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

  // MODIFICADO: Obtener TODOS los vehículos (sin filtro de estado)
  async show(req, res) {
    try {
      console.log('DEBUG: show handler called - fetching ALL vehicles');
      
      // Cambiado de showActive() a show() para obtener todos
      const vehicleModel = await VehicleModel.show();
      
      if (!vehicleModel || vehicleModel.length === 0) {
        return res.status(404).json({ 
          error: 'No vehicles found',
          data: []
        });
      }

      console.log(`DEBUG: Found ${vehicleModel.length} vehicles in database`);
      
      res.status(200).json({
        message: 'Vehicles retrieved successfully',
        total: vehicleModel.length,
        data: vehicleModel
      });
    } catch (error) {
      console.error('Error in show:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  // NUEVO: Obtener solo vehículos activos
  async showActive(req, res) {
    try {
      console.log('DEBUG: showActive handler called');
      
      const vehicleModel = await VehicleModel.showActive();
      
      if (!vehicleModel || vehicleModel.length === 0) {
        return res.status(404).json({ 
          error: 'No active vehicles found',
          data: []
        });
      }

      console.log(`DEBUG: Found ${vehicleModel.length} active vehicles`);
      
      res.status(200).json({
        message: 'Active vehicles retrieved successfully',
        total: vehicleModel.length,
        data: vehicleModel
      });
    } catch (error) {
      console.error('Error in showActive:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }

  // ELIMINADO: showAll duplicado (ahora show() hace lo mismo)

  async update(req, res) {
    try {
      const { license_plate, model, type, color, user_id, property_id, parkingZone_id, status_id } = req.body;
      const id = req.params.id;
      
      if (!license_plate || !model || !type || !color || !user_id || !property_id || !status_id || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // MODIFICADO: Buscar sin filtro de estado para permitir actualizar inactivos
      const existingVehicle = await VehicleModel.findById(id);
      if (!existingVehicle) {
        return res.status(404).json({ error: 'The Vehicle does not exist' });
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

      res.status(200).json({
        message: 'Vehicle updated successfully',
        data: updateVehicleModel
      });
    } catch (error) {
      console.error('Error in update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      
      const deleteVehicleModel = await VehicleModel.delete(id);
      
      res.status(200).json({
        message: 'Vehicle deleted successfully',
        data: deleteVehicleModel
      });
    } catch (error) {
      console.error('Error in delete:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      
      // MODIFICADO: Buscar sin filtro de estado
      const existingVehicleModel = await VehicleModel.findById(id);
      
      if (!existingVehicleModel) {
        return res.status(404).json({ error: 'The Vehicle does not exist' });
      }
      
      res.status(200).json({
        message: 'Vehicle found successfully',
        data: existingVehicleModel
      });
    } catch (error) {
      console.error('Error in findById:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // ELIMINADOS: métodos duplicados createVehicle, updateVehicle, deleteVehicle
  // (ya existen register, update, delete con la misma funcionalidad)

  async getVehiclesByUserId(req, res) {
    try {
      const { user_id } = req.params;
      const vehicles = await VehicleModel.findByUserId(user_id);

      res.json({
        success: true,
        total: vehicles.length,
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

  async getVehiclesByPropertyId(req, res) {
    try {
      const { property_id } = req.params;
      const vehicles = await VehicleModel.findByPropertyId(property_id);

      res.json({
        success: true,
        total: vehicles.length,
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

  async getVehiclesByType(req, res) {
    try {
      const { type } = req.params;
      const vehicles = await VehicleModel.findByType(type);

      res.json({
        success: true,
        total: vehicles.length,
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
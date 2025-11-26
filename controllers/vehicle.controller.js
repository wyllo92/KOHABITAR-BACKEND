import VehicleModel from '../models/vehicle.model.js';
import UserModel from '../models/user.model.js';
import PropertyModel from '../models/property.model.js';
import ParkingZoneModel from '../models/parkingzone.model.js';
import StatusModel from '../models/status.model.js';

/**
 * @class VehicleController
 * @description Controlador que gestiona las solicitudes HTTP relacionadas con vehículos
 * Manejar la creación, consulta, actualización y eliminación de registros de vehículos,
 * así como consultas específicas por usuario, propiedad, tipo y placa.
 */
class VehicleController {

  /**
   * @method register
   * @description Registrar un nuevo vehículo en el sistema
   * Valida que todos los campos requeridos estén presentes y que la placa no esté duplicada
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} req.body - Datos del vehículo a registrar
   * @param {string} req.body.license_plate - Placa del vehículo
   * @param {string} req.body.model - Modelo del vehículo
   * @param {string} req.body.type - Tipo de vehículo (carro, moto, etc.)
   * @param {string} req.body.color - Color del vehículo
   * @param {number} req.body.user_id - ID del propietario
   * @param {number} req.body.property_id - ID de la propiedad asociada
   * @param {number} req.body.parking_zone_id - ID de la zona de parqueo (opcional)
   * @param {number} req.body.status_id - ID del estado del vehículo
   * @param {string} req.body.vehicle_photo - URL o ruta de la foto (opcional)
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async register(req, res) {
    try {
      const { license_plate, model, type, color, user_id, property_id, parking_zone_id, status_id, vehicle_photo } = req.body;
      
      // Basic validation
      if (!license_plate || !model || !type || !color || !user_id || !property_id || !status_id) {
        return res.status(400).json({
          success: false,
          error: 'Required fields are missing'
        });
      }
      
      // Check if vehicle with this license plate already exists
      const existingVehicle = await VehicleModel.findByLicensePlate(license_plate);
      if (existingVehicle) {
        return res.status(409).json({
          success: false,
          error: 'A vehicle with this license plate already exists'
        });
      }
      
      // Check if user exists
      const user = await UserModel.findById(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      // Check if property exists
      const property = await PropertyModel.findById(property_id);
      if (!property) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }
      
      // Check if parking zone exists (if provided)
      if (parking_zone_id) {
        const parkingZone = await ParkingZoneModel.findById(parking_zone_id);
        if (!parkingZone) {
          return res.status(404).json({
            success: false,
            error: 'Parking zone not found'
          });
        }
      }
      
      // Check if status exists
      const status = await StatusModel.findById(status_id);
      if (!status) {
        return res.status(404).json({
          success: false,
          error: 'Status not found'
        });
      }

      const vehicleId = await VehicleModel.create({
        license_plate,
        model,
        type,
        color,
        vehicle_photo,
        user_id,
        property_id,
        parking_zone_id,
        status_id
      });

      if (!vehicleId) {
        return res.status(500).json({
          success: false,
          error: 'Failed to create vehicle'
        });
      }

      // Responder con los datos básicos creados sin necesidad de una segunda consulta
      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: {
          vehicle_id: vehicleId,
          license_plate,
          model,
          type,
          color,
          vehicle_photo,
          user_id,
          property_id,
          parking_zone_id,
          status_id
        }
      });
    } catch (error) {
      console.error('Vehicle registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  /**
   * @method show
   * @description Obtener todos los vehículos activos registrados en el sistema
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con la lista de vehículos activos
   */
  async show(req, res) {
    try {
      const vehicles = await VehicleModel.showActive();
      
      res.status(200).json({
        success: true,
        message: 'Vehicles retrieved successfully',
        data: vehicles
      });
    } catch (error) {
      console.error('Error retrieving vehicles:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  /**
   * @method update
   * @description Actualiza la información de un vehículo existente
   * Valida que el vehículo exista y que los nuevos datos sean válidos
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} req.params - Parámetros de la URL
   * @param {number} req.params.id - ID del vehículo a actualizar
   * @param {Object} req.body - Nuevos datos del vehículo
   * @param {string} req.body.license_plate - Placa del vehículo
   * @param {string} req.body.model - Modelo del vehículo
   * @param {string} req.body.type - Tipo de vehículo
   * @param {string} req.body.color - Color del vehículo
   * @param {number} req.body.user_id - ID del propietario
   * @param {number} req.body.property_id - ID de la propiedad asociada
   * @param {number} req.body.parking_zone_id - ID de la zona de parqueo
   * @param {number} req.body.status_id - ID del estado del vehículo
   * @param {string} req.body.vehicle_photo - URL o ruta de la foto
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async update(req, res) {
    try {
      const { license_plate, model, type, color, user_id, property_id, parking_zone_id, status_id, vehicle_photo } = req.body;
      const id = req.params.id;
      
      // Basic validation
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle ID is required'
        });
      }

      // Check if vehicle exists
      const existingVehicle = await VehicleModel.findById(id);
      if (!existingVehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }
      
      // Check if license plate is already in use by another vehicle
      if (license_plate && license_plate !== existingVehicle.license_plate) {
        const vehicleWithLicensePlate = await VehicleModel.findByLicensePlate(license_plate);
        if (vehicleWithLicensePlate && vehicleWithLicensePlate.vehicle_id !== parseInt(id)) {
          return res.status(409).json({
            success: false,
            error: 'A vehicle with this license plate already exists'
          });
        }
      }
      
      // Check if user exists
      if (user_id && user_id !== existingVehicle.user_id) {
        const user = await UserModel.findById(user_id);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }
      }
      
      // Check if property exists
      if (property_id && property_id !== existingVehicle.property_id) {
        const property = await PropertyModel.findById(property_id);
        if (!property) {
          return res.status(404).json({
            success: false,
            error: 'Property not found'
          });
        }
      }
      
      // Check if parking zone exists
      if (parking_zone_id && parking_zone_id !== existingVehicle.parking_zone_id) {
        const parkingZone = await ParkingZoneModel.findById(parking_zone_id);
        if (!parkingZone) {
          return res.status(404).json({
            success: false,
            error: 'Parking zone not found'
          });
        }
      }
      
      // Check if status exists
      if (status_id && status_id !== existingVehicle.status_id) {
        const status = await StatusModel.findById(status_id);
        if (!status) {
          return res.status(404).json({
            success: false,
            error: 'Status not found'
          });
        }
      }

      const updateData = {
        license_plate: license_plate || existingVehicle.license_plate,
        model: model || existingVehicle.model,
        type: type || existingVehicle.type,
        color: color || existingVehicle.color,
        vehicle_photo: vehicle_photo || existingVehicle.vehicle_photo,
        user_id: user_id || existingVehicle.user_id,
        property_id: property_id || existingVehicle.property_id,
        parking_zone_id: parking_zone_id || existingVehicle.parking_zone_id,
        status_id: status_id || existingVehicle.status_id
      };

      const updatedVehicle = await VehicleModel.update(id, updateData);

      if (!updatedVehicle) {
        return res.status(500).json({
          success: false,
          error: 'Failed to update vehicle'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Vehicle updated successfully',
        data: updatedVehicle
      });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  /**
   * @method delete
   * @description Elimina un vehículo del sistema
   * Verificar que el vehículo exista antes de eliminarlo
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} req.params - Parámetros de la URL
   * @param {number} req.params.id - ID del vehículo a eliminar
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async delete(req, res) {
    try {
      const id = req.params.id;
      
      // Basic validation
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle ID is required'
        });
      }
      
      // Check if vehicle exists
      const existingVehicle = await VehicleModel.findById(id);
      if (!existingVehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }
      
      const deleted = await VehicleModel.delete(id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete vehicle'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  /**
   * @method findById
   * @description Buscar un vehículo por su ID y devuelve su información detallada
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} req.params - Parámetros de la URL
   * @param {number} req.params.id - ID del vehículo a buscar
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con la información del vehículo
   */
  async findById(req, res) {
    try {
      const id = req.params.id;
      
      // Basic validation
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle ID is required'
        });
      }
      
      const vehicle = await VehicleModel.findById(id);
      
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Vehicle retrieved successfully',
        data: vehicle
      });
    } catch (error) {
      console.error('Error retrieving vehicle:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
  /**
   * Los siguientes métodos son redundantes con register, update y delete
   * Se mantienen como alias para compatibilidad con código existente
   */
  
  /**
   * @method createVehicle
   * @description Alias para el método register, mantiene compatibilidad
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el resultado de la operación
   * @deprecated Usar register en su lugar
   */
  async createVehicle(req, res) {
    return this.register(req, res);
  }

  /**
   * @method updateVehicle
   * @description Alias para el método update, mantiene compatibilidad
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el resultado de la operación
   * @deprecated Usar update en su lugar
   */
  async updateVehicle(req, res) {
    return this.update(req, res);
  }

  /**
   * @method deleteVehicle
   * @description Alias para el método delete, mantiene compatibilidad
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con el resultado de la operación
   * @deprecated Usar delete en su lugar
   */
  async deleteVehicle(req, res) {
    return this.delete(req, res);
  }

  /**
   * @method getVehiclesByUserId
   * @description Obtener todos los vehículos asociados a un usuario específico
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} req.params - Parámetros de la URL
   * @param {number} req.params.user_id - ID del usuario propietario
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con la lista de vehículos del usuario
   */
  async getVehiclesByUserId(req, res) {
    try {
      const { user_id } = req.params;
      
      // Basic validation
      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }
      
      // Check if user exists
      const user = await UserModel.findById(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      const vehicles = await VehicleModel.findByUserId(user_id);
      
      res.status(200).json({
        success: true,
        message: `Vehicles for user ${user_id} retrieved successfully`,
        data: vehicles
      });
    } catch (error) {
      console.error('Error retrieving vehicles by user ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  /**
   * @method getVehiclesByPropertyId
   * @description Obtener todos los vehículos asociados a una propiedad específica
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} req.params - Parámetros de la URL
   * @param {number} req.params.property_id - ID de la propiedad
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con la lista de vehículos de la propiedad
   */
  async getVehiclesByPropertyId(req, res) {
    try {
      const { property_id } = req.params;
      
      // Basic validation
      if (!property_id) {
        return res.status(400).json({
          success: false,
          error: 'Property ID is required'
        });
      }
      
      // Check if property exists
      const property = await PropertyModel.findById(property_id);
      if (!property) {
        return res.status(404).json({
          success: false,
          error: 'Property not found'
        });
      }
      
      const vehicles = await VehicleModel.findByPropertyId(property_id);
      
      res.status(200).json({
        success: true,
        message: `Vehicles for property ${property_id} retrieved successfully`,
        data: vehicles
      });
    } catch (error) {
      console.error('Error retrieving vehicles by property ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  /**
   * @method getVehiclesByType
   * @description Obtener todos los vehículos de un tipo específico (carro, moto, etc.)
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} req.params - Parámetros de la URL
   * @param {string} req.params.type - Tipo de vehículo a buscar
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con la lista de vehículos del tipo especificado
   */
  async getVehiclesByType(req, res) {
    try {
      const { type } = req.params;
      
      // Basic validation
      if (!type) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle type is required'
        });
      }
      
      const vehicles = await VehicleModel.findByType(type);
      
      res.status(200).json({
        success: true,
        message: `Vehicles of type ${type} retrieved successfully`,
        data: vehicles
      });
    } catch (error) {
      console.error('Error retrieving vehicles by type:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
  
  /**
   * @method getVehicleByLicensePlate
   * @description Buscar un vehículo por su número de placa
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} req.params - Parámetros de la URL
   * @param {string} req.params.license_plate - Número de placa a buscar
   * @param {Object} res - Objeto de respuesta Express
   * @returns {Object} Respuesta JSON con la información del vehículo encontrado
   */
  async getVehicleByLicensePlate(req, res) {
    try {
      const { license_plate } = req.params;
      
      // Basic validation
      if (!license_plate) {
        return res.status(400).json({
          success: false,
          error: 'License plate is required'
        });
      }
      
      const vehicle = await VehicleModel.findByLicensePlate(license_plate);
      
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: `Vehicle with license plate ${license_plate} retrieved successfully`,
        data: vehicle
      });
    } catch (error) {
      console.error('Error retrieving vehicle by license plate:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
}

export default new VehicleController(); 
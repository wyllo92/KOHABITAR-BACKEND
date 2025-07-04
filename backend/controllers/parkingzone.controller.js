import ParkingZoneModel from '../models/parkingzone.model.js';

class ParkingZoneController {

  static async getAllParkingZones(req, res) {
    try {
      const parkingZones = await ParkingZoneModel.show();
      res.json({
        success: true,
        data: parkingZones,
        message: 'Zonas de parqueo obtenidas exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las zonas de parqueo',
        error: error.message
      });
    }
  }

  static async getParkingZoneById(req, res) {
    try {
      const { id } = req.params;
      const parkingZone = await ParkingZoneModel.findById(id);

      if (!parkingZone) {
        return res.status(404).json({
          success: false,
          message: 'Zona de parqueo no encontrada'
        });
      }

      res.json({
        success: true,
        data: parkingZone,
        message: 'Zona de parqueo obtenida exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la zona de parqueo',
        error: error.message
      });
    }
  }

  static async createParkingZone(req, res) {
    try {
      const parkingZoneData = req.body;
      const parkingZoneId = await ParkingZoneModel.create(parkingZoneData);

      if (parkingZoneId) {
        const newParkingZone = await ParkingZoneModel.findById(parkingZoneId);
        res.status(201).json({
          success: true,
          data: newParkingZone,
          message: 'Zona de parqueo creada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al crear la zona de parqueo'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear la zona de parqueo',
        error: error.message
      });
    }
  }

  static async updateParkingZone(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingZone = await ParkingZoneModel.findById(id);
      if (!existingZone) {
        return res.status(404).json({
          success: false,
          message: 'Zona de parqueo no encontrada'
        });
      }

      const updatedZone = await ParkingZoneModel.update(id, updateData);

      if (updatedZone) {
        res.json({
          success: true,
          data: updatedZone,
          message: 'Zona de parqueo actualizada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar la zona de parqueo'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la zona de parqueo',
        error: error.message
      });
    }
  }

  static async deleteParkingZone(req, res) {
    try {
      const { id } = req.params;

      const existingZone = await ParkingZoneModel.findById(id);
      if (!existingZone) {
        return res.status(404).json({
          success: false,
          message: 'Zona de parqueo no encontrada'
        });
      }

      const deleted = await ParkingZoneModel.delete(id);

      if (deleted) {
        res.json({
          success: true,
          message: 'Zona de parqueo eliminada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al eliminar la zona de parqueo'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la zona de parqueo',
        error: error.message
      });
    }
  }
}

export default ParkingZoneController; 
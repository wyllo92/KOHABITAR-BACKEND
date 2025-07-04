import ParkingSlotModel from '../models/parkingslot.model.js';

class ParkingSlotController {

  static async getAllParkingSlots(req, res) {
    try {
      const parkingSlots = await ParkingSlotModel.show();
      res.json({
        success: true,
        data: parkingSlots,
        message: 'Espacios de parqueo obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los espacios de parqueo',
        error: error.message
      });
    }
  }

  // Obtener espacios disponibles
  static async getAvailableSlots(req, res) {
    try {
      const parkingSlots = await ParkingSlotModel.findAvailable();
      res.json({
        success: true,
        data: parkingSlots,
        message: 'Espacios disponibles obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los espacios disponibles',
        error: error.message
      });
    }
  }

  // Obtener espacios reservados
  static async getReservedSlots(req, res) {
    try {
      const parkingSlots = await ParkingSlotModel.findReserved();
      res.json({
        success: true,
        data: parkingSlots,
        message: 'Espacios reservados obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los espacios reservados',
        error: error.message
      });
    }
  }

  // Obtener espacios por zona
  static async getSlotsByZone(req, res) {
    try {
      const { parkingZone_id } = req.params;
      const parkingSlots = await ParkingSlotModel.findByParkingZone(parkingZone_id);
      res.json({
        success: true,
        data: parkingSlots,
        message: `Espacios de la zona ${parkingZone_id} obtenidos exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los espacios por zona',
        error: error.message
      });
    }
  }

  // Obtener espacio por ID
  static async getParkingSlotById(req, res) {
    try {
      const { id } = req.params;
      const parkingSlot = await ParkingSlotModel.findById(id);

      if (!parkingSlot) {
        return res.status(404).json({
          success: false,
          message: 'Espacio de parqueo no encontrado'
        });
      }

      res.json({
        success: true,
        data: parkingSlot,
        message: 'Espacio de parqueo obtenido exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el espacio de parqueo',
        error: error.message
      });
    }
  }

  // Crear nuevo espacio de parqueo
  static async createParkingSlot(req, res) {
    try {
      const parkingSlotData = req.body;
      const parkingSlotId = await ParkingSlotModel.create(parkingSlotData);

      if (parkingSlotId) {
        const newParkingSlot = await ParkingSlotModel.findById(parkingSlotId);
        res.status(201).json({
          success: true,
          data: newParkingSlot,
          message: 'Espacio de parqueo creado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al crear el espacio de parqueo'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el espacio de parqueo',
        error: error.message
      });
    }
  }

  // Actualizar espacio de parqueo
  static async updateParkingSlot(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingSlot = await ParkingSlotModel.findById(id);
      if (!existingSlot) {
        return res.status(404).json({
          success: false,
          message: 'Espacio de parqueo no encontrado'
        });
      }

      const updatedSlot = await ParkingSlotModel.update(id, updateData);

      if (updatedSlot) {
        res.json({
          success: true,
          data: updatedSlot,
          message: 'Espacio de parqueo actualizado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar el espacio de parqueo'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el espacio de parqueo',
        error: error.message
      });
    }
  }

  // Eliminar espacio de parqueo
  static async deleteParkingSlot(req, res) {
    try {
      const { id } = req.params;

      const existingSlot = await ParkingSlotModel.findById(id);
      if (!existingSlot) {
        return res.status(404).json({
          success: false,
          message: 'Espacio de parqueo no encontrado'
        });
      }

      const deleted = await ParkingSlotModel.delete(id);

      if (deleted) {
        res.json({
          success: true,
          message: 'Espacio de parqueo eliminado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al eliminar el espacio de parqueo'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el espacio de parqueo',
        error: error.message
      });
    }
  }
}

export default ParkingSlotController; 
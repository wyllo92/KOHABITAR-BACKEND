import AmenityTypeModel from '../models/amenityType.model.js';

class AmenityTypeController {
  static async getAll(req, res) {
    try {
      const types = await AmenityTypeModel.findAll();
      res.json({ success: true, data: types });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener los tipos de amenidad', error: error.message });
    }
  }

  static async getActive(req, res) {
    try {
      const types = await AmenityTypeModel.findActive();
      res.json({ success: true, data: types });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener los tipos de amenidad activos', error: error.message });
    }
  }
}

export default AmenityTypeController; 
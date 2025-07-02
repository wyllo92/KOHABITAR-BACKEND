import AmenityModel from '../models/amenity.model.js';

class AmenityController {
  
  static async getAllAmenities(req, res) {
    try {
      const amenities = await AmenityModel.show();
      res.json({
        success: true,
        data: amenities,
        message: 'Amenidades obtenidas exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las amenidades',
        error: error.message
      });
    }
  }

  static async getAmenityById(req, res) {
    try {
      const { id } = req.params;
      const amenity = await AmenityModel.findById(id);
      
      if (!amenity) {
        return res.status(404).json({
          success: false,
          message: 'Amenidad no encontrada'
        });
      }

      res.json({
        success: true,
        data: amenity,
        message: 'Amenidad obtenida exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la amenidad',
        error: error.message
      });
    }
  }

  static async createAmenity(req, res) {
    try {
      const amenityData = req.body;
      const amenityId = await AmenityModel.create(amenityData);
      
      if (amenityId) {
        const newAmenity = await AmenityModel.findById(amenityId);
        res.status(201).json({
          success: true,
          data: newAmenity,
          message: 'Amenidad creada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al crear la amenidad'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear la amenidad',
        error: error.message
      });
    }
  }

  static async updateAmenity(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingAmenity = await AmenityModel.findById(id);
      if (!existingAmenity) {
        return res.status(404).json({
          success: false,
          message: 'Amenidad no encontrada'
        });
      }

      const updatedAmenity = await AmenityModel.update(id, updateData);
      
      if (updatedAmenity) {
        res.json({
          success: true,
          data: updatedAmenity,
          message: 'Amenidad actualizada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar la amenidad'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la amenidad',
        error: error.message
      });
    }
  }

  static async deleteAmenity(req, res) {
    try {
      const { id } = req.params;

      const existingAmenity = await AmenityModel.findById(id);
      if (!existingAmenity) {
        return res.status(404).json({
          success: false,
          message: 'Amenidad no encontrada'
        });
      }

      const deleted = await AmenityModel.delete(id);
      
      if (deleted) {
        res.json({
          success: true,
          message: 'Amenidad eliminada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al eliminar la amenidad'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la amenidad',
        error: error.message
      });
    }
  }
}

export default AmenityController; 
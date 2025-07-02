import PropertyModel from '../models/property.model.js';

class PropertyController {
  
  // Obtener todas las propiedades
  static async getAllProperties(req, res) {
    try {
      const properties = await PropertyModel.show();
      res.json({
        success: true,
        data: properties,
        message: 'Propiedades obtenidas exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las propiedades',
        error: error.message
      });
    }
  }

  // Obtener una propiedad por ID
  static async getPropertyById(req, res) {
    try {
      const { id } = req.params;
      const property = await PropertyModel.findById(id);
      
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada'
        });
      }

      res.json({
        success: true,
        data: property,
        message: 'Propiedad obtenida exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la propiedad',
        error: error.message
      });
    }
  }

  // Crear una nueva propiedad
  static async createProperty(req, res) {
    try {
      const {
        property_name,
        property_description,
        property_type,
        property_createAt,
        property_updateAt
      } = req.body;

      // Validaciones básicas
      if (!property_name || !property_type) {
        return res.status(400).json({
          success: false,
          message: 'El nombre y tipo de propiedad son requeridos'
        });
      }

      const propertyData = {
        property_name,
        property_description: property_description || '',
        property_type,
        property_createAt: property_createAt || new Date().toISOString().split('T')[0],
        property_updateAt: property_updateAt || new Date().toISOString().split('T')[0]
      };

      const propertyId = await PropertyModel.create(propertyData);
      
      if (propertyId) {
        const newProperty = await PropertyModel.findById(propertyId);
        res.status(201).json({
          success: true,
          data: newProperty,
          message: 'Propiedad creada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al crear la propiedad'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear la propiedad',
        error: error.message
      });
    }
  }

  // Actualizar una propiedad
  static async updateProperty(req, res) {
    try {
      const { id } = req.params;
      const {
        property_name,
        property_description,
        property_type,
        property_updateAt
      } = req.body;

      // Verificar si la propiedad existe
      const existingProperty = await PropertyModel.findById(id);
      if (!existingProperty) {
        return res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada'
        });
      }

      const updateData = {
        property_name: property_name || existingProperty.property_name,
        property_description: property_description || existingProperty.property_description,
        property_type: property_type || existingProperty.property_type,
        property_updateAt: property_updateAt || new Date().toISOString().split('T')[0]
      };

      const updatedProperty = await PropertyModel.update(id, updateData);
      
      if (updatedProperty) {
        res.json({
          success: true,
          data: updatedProperty,
          message: 'Propiedad actualizada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar la propiedad'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la propiedad',
        error: error.message
      });
    }
  }

  // Eliminar una propiedad
  static async deleteProperty(req, res) {
    try {
      const { id } = req.params;

      // Verificar si la propiedad existe
      const existingProperty = await PropertyModel.findById(id);
      if (!existingProperty) {
        return res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada'
        });
      }

      const deleted = await PropertyModel.delete(id);
      
      if (deleted) {
        res.json({
          success: true,
          message: 'Propiedad eliminada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al eliminar la propiedad'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la propiedad',
        error: error.message
      });
    }
  }

  // Obtener propiedades por tipo
  static async getPropertiesByType(req, res) {
    try {
      const { type } = req.params;
      const properties = await PropertyModel.findByType(type);
      
      res.json({
        success: true,
        data: properties,
        message: `Propiedades de tipo ${type} obtenidas exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las propiedades por tipo',
        error: error.message
      });
    }
  }

  // Buscar propiedades por nombre
  static async searchPropertiesByName(req, res) {
    try {
      const { name } = req.query;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro de búsqueda es requerido'
        });
      }

      const property = await PropertyModel.findByName(name);
      
      if (property) {
        res.json({
          success: true,
          data: property,
          message: 'Propiedad encontrada exitosamente'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al buscar la propiedad',
        error: error.message
      });
    }
  }
}

export default PropertyController; 
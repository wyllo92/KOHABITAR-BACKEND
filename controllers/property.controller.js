import PropertyModel from '../models/property.model.js';

/**
 * Controlador para gestionar las operaciones relacionadas con propiedades.
 * Implementar métodos para crear, consultar, actualizar y eliminar propiedades,
 * así como para realizar búsquedas por diferentes criterios y obtener tipos de propiedades.
 */
class PropertyController {

  /**
   * Registrar una nueva propiedad en el sistema.
   *
   * @param {Object} req - Objeto de solicitud HTTP con los datos de la propiedad en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async register(req, res) {
    try {
      const { name, description, property_type_id, status_id } = req.body;

      // Basic validation
      if (!name || !property_type_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Check if property with same name already exists
      const existingProperty = await PropertyModel.findByName(name);
      if (existingProperty) {
        return res.status(409).json({ error: 'Property with this name already exists' });
      }

      const propertyId = await PropertyModel.create({
        name,
        description,
        property_type_id,
        status_id
      });

      if (!propertyId) {
        return res.status(500).json({ error: 'Failed to create property' });
      }

      res.status(201).json({
        message: 'Property created successfully',
        id: propertyId
      });
    } catch (error) {
      console.error('Error in property registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Obtener todas las propiedades registradas en el sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la lista de propiedades
   */
  async show(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // Extraer filtros de la query
      const filters = {
        searchTerm: req.query.search,
        propertyTypeId: req.query.type ? parseInt(req.query.type) : null,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
      };

      const result = await PropertyModel.show(page, limit, filters);
      
      res.status(200).json({
        success: true,
        message: 'Propiedades obtenidas correctamente',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error en show propiedades:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error interno al cargar propiedades', 
        details: error.message 
      });
    }
  }

  /**
   * Actualiza la información de una propiedad existente.
   *
   * @param {Object} req - Objeto de solicitud HTTP con los datos actualizados en el cuerpo y el ID en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación y los datos actualizados
   */
  async update(req, res) {
    try {
      const { name, description, property_type_id, status_id } = req.body;
      const id = req.params.id;

      // Basic validation
      if (!name || !property_type_id || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Verify if the Property already exists
      const existingProperty = await PropertyModel.findById(id);
      if (!existingProperty) {
        return res.status(409).json({ data: '', error: 'The Property does not exist' });
      }

      const updatePropertyModel = await PropertyModel.update(id, {
        name,
        description,
        property_type_id,
        status_id
      });

      if (!updatePropertyModel) {
        return res.status(500).json({ error: 'Failed to update property' });
      }

      res.status(201).json({
        message: 'Property updated successfully',
        data: updatePropertyModel
      });
    } catch (error) {
      console.error('Error in property update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Elimina una propiedad del sistema (marcándola como inactiva).
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID de la propiedad en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async delete(req, res) {
    try {
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Verify if the Property already exists
      const deletePropertyModel = await PropertyModel.delete(id);
      res.status(201).json({
        message: 'Property deleted successfully',
        data: deletePropertyModel
      });
    } catch (error) {
      console.error('Error in property delete:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Buscar una propiedad por su ID.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID de la propiedad en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los datos de la propiedad encontrada
   */
  async findById(req, res) {
    try {
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Verify if the Property already exists
      const propertyModel = await PropertyModel.findById(id);
      if (!propertyModel) {
        return res.status(404).json({ error: 'Property not found' });
      }
      res.status(201).json({
        message: 'Property found successfully',
        data: propertyModel
      });
    } catch (error) {
      console.error('Error finding property:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Buscar propiedades por nombre.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el nombre de la propiedad en los parámetros de consulta
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los datos de la propiedad encontrada
   */
  async searchPropertiesByName(req, res) {
    try {
      const { name } = req.query;
      if (!name) {
        return res.status(400).json({ error: 'Name parameter is required' });
      }
      
      const property = await PropertyModel.findByName(name);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      res.status(200).json({
        message: 'Property found successfully',
        data: property
      });
    } catch (error) {
      console.error('Error searching properties by name:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Obtener las propiedades filtradas por tipo.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID del tipo de propiedad en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la lista de propiedades del tipo especificado
   */
  async getPropertiesByType(req, res) {
    try {
      const { typeId } = req.params;
      if (!typeId) {
        return res.status(400).json({ error: 'Type ID parameter is required' });
      }
      
      const properties = await PropertyModel.findByType(typeId);
      res.status(200).json({
        message: 'Properties retrieved successfully',
        data: properties
      });
    } catch (error) {
      console.error('Error getting properties by type:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  /**
   * Obtener todos los tipos de propiedades disponibles en el sistema.
   *
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la lista de tipos de propiedades
   */
  async getPropertyTypes(req, res) {
    try {
      const types = await PropertyModel.getPropertyTypes();
      res.status(200).json({
        message: 'Property types retrieved successfully',
        data: types
      });
    } catch (error) {
      console.error('Error getting property types:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Actualizar solo el estado de una propiedad.
   *
   * @param {Object} req - Objeto de solicitud HTTP con el ID en los parámetros y status_id en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async updateStatus(req, res) {
    try {
      const { status_id } = req.body;
      const id = req.params.id;

      // Validación básica
      if (!id || !status_id) {
        return res.status(400).json({ error: 'Property ID and status_id are required' });
      }

      // Verify if the Property exists
      const existingProperty = await PropertyModel.findById(id);
      if (!existingProperty) {
        return res.status(404).json({ error: 'Property not found' });
      }

      const updatedProperty = await PropertyModel.updateStatus(id, status_id);

      if (!updatedProperty) {
        return res.status(500).json({ error: 'Failed to update property status' });
      }

      res.status(200).json({
        message: 'Property status updated successfully',
        data: updatedProperty
      });
    } catch (error) {
      console.error('Error updating property status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new PropertyController();

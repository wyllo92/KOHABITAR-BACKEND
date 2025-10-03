import PropertyModel from '../models/property.model.js';

class PropertyController {

  async register(req, res) {
    try {
      const { property_name, property_description, property_type, status_id } = req.body;

      // Validación básica
      if (!property_name || !property_type || !status_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Verificar si ya existe propiedad con ese nombre
      const existingProperty = await PropertyModel.findByName(property_name);
      if (existingProperty) {
        return res.status(409).json({ error: 'Property with this name already exists' });
      }

      const currentDate = new Date().toISOString().split('T')[0];
      const propertyId = await PropertyModel.create({
        property_name,
        property_description,
        property_type,
        property_createAt: currentDate,
        property_updateAt: currentDate,
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

  async show(req, res) {
    try {
      const propertyModel = await PropertyModel.show();
      res.status(200).json({
        message: 'Properties retrieved successfully',
        data: propertyModel
      });
    } catch (error) {
      console.error('Error retrieving properties:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
      const { property_name, property_description, property_type, status_id } = req.body;
      const id = req.params.id;

      // Validación básica
      if (!property_name || !property_type || !status_id || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Verificar si existe la propiedad
      const existingProperty = await PropertyModel.findByIdActive(id);
      if (!existingProperty) {
        return res.status(404).json({ error: 'The Property does not exist' });
      }

      const currentDate = new Date().toISOString().split('T')[0];
      const updatePropertyModel = await PropertyModel.update(id, {
        property_name,
        property_description,
        property_type,
        property_updateAt: currentDate,
        status_id
      });

      if (!updatePropertyModel) {
        return res.status(500).json({ error: 'Failed to update property' });
      }

      res.status(200).json({
        message: 'Property updated successfully',
        data: updatePropertyModel
      });
    } catch (error) {
      console.error('Error in property update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const deletePropertyModel = await PropertyModel.delete(id);
      res.status(200).json({
        message: 'Property deleted successfully',
        data: deletePropertyModel
      });
    } catch (error) {
      console.error('Error in property delete:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      const propertyModel = await PropertyModel.findById(id);
      if (!propertyModel) {
        return res.status(404).json({ error: 'Property not found' });
      }

      res.status(200).json({
        message: 'Property found successfully',
        data: propertyModel
      });
    } catch (error) {
      console.error('Error finding property:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new PropertyController();

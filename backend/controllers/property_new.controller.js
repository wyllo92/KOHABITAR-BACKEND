import PropertyModel from '../models/property.model.js';

class PropertyController {

  async register(req, res) {
    try {
      const { property_name, property_description, property_type } = req.body;
      
      // Basic validation
      if (!property_name || !property_type) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      
      // Check if property with same name already exists
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
        property_updateAt: currentDate
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
      const propertyModel = await PropertyModel.showActive();
      res.status(201).json({
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
      const { property_name, property_description, property_type } = req.body;
      const id = req.params.id;
      
      // Basic validation
      if (!property_name || !property_type || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      
      // Verify if the Property already exists  
      const existingProperty = await PropertyModel.findByIdActive(id);
      if (!existingProperty) {
        return res.status(409).json({ data: '', error: 'The Property does not exist' });
      }   

      const currentDate = new Date().toISOString().split('T')[0];
      const updatePropertyModel = await PropertyModel.update(id, { 
        property_name,
        property_description,
        property_type,
        property_updateAt: currentDate
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
}

export default new PropertyController();

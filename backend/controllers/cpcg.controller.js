import PqrsModel from '../models/cpcg.model.js';
import dotenv from 'dotenv';
dotenv.config();

class PqrsController {

  async create(req, res) {
    try {
      const { User_id, Property_id, CPCG_type_id, CPCG_description, Status_id } = req.body;
      
      // Validación básica
      if (!User_id || !Property_id || !CPCG_type_id || !CPCG_description || !Status_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Validación adicional
      if (CPCG_description.length < 10) {
        return res.status(400).json({
          error: 'The description must be at least 10 characters long.'
        });
      }

      const pqrsId = await PqrsModel.create({
        User_id,
        Property_id,
        CPCG_type_id,
        CPCG_description,
        Status_id
      });

      res.status(201).json({
        message: 'PQRS created successfully',
        id: pqrsId
      });
    } catch (error) {
      console.error('PQRS creation error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      // Get all active PQRS
      const pqrsModel = await PqrsModel.showActive();
      res.status(200).json({
        message: 'PQRS retrieved successfully',
        data: pqrsModel || []
      });
    } catch (error) {
      console.error('Error retrieving PQRS:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
      const { User_id, Property_id, CPCG_type_id, CPCG_description, Status_id } = req.body;
      const id = req.params.id;

      // Basic validation
      if (!User_id || !Property_id || !CPCG_type_id || !CPCG_description || !Status_id || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Verify if the PQRS exists  
      const existingPqrs = await PqrsModel.findByIdActive(id);
      if (!existingPqrs) {
        return res.status(404).json({ error: 'PQRS not found' });
      }

      const updatePqrsModel = await PqrsModel.update(id, {
        User_id,
        Property_id,
        CPCG_type_id,
        CPCG_description,
        Status_id
      });

      res.status(200).json({
        message: 'PQRS updated successfully',
        data: updatePqrsModel
      });
    } catch (error) {
      console.error('Error in PQRS update:', error);
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

      // Verify if the PQRS exists before deleting
      const existingPqrs = await PqrsModel.findByIdActive(id);
      if (!existingPqrs) {
        return res.status(404).json({ error: 'PQRS not found' });
      }

      // Delete PQRS (soft delete)
      const deletePqrsModel = await PqrsModel.delete(id);
      
      res.status(200).json({
        message: 'PQRS deleted successfully',
        data: deletePqrsModel
      });
    } catch (error) {
      console.error('Error deleting PQRS:', error);
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

      // Get PQRS by ID
      const existingPqrsModel = await PqrsModel.findByIdActive(id);
      if (!existingPqrsModel) {
        return res.status(404).json({ error: 'PQRS not found' });
      }

      res.status(200).json({
        message: 'PQRS found successfully',
        data: existingPqrsModel
      });
    } catch (error) {
      console.error('Error finding PQRS:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findByUserId(req, res) {
    try {
      const userId = req.params.userId;
      
      // Basic validate
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Get PQRS by User ID
      const userPqrs = await PqrsModel.findByUserId(userId);
      
      res.status(200).json({
        message: 'User PQRS retrieved successfully',
        data: userPqrs || []
      });
    } catch (error) {
      console.error('Error finding PQRS by user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findByPropertyId(req, res) {
    try {
      const propertyId = req.params.propertyId;
      
      // Basic validate
      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' });
      }

      // Get PQRS by Property ID
      const propertyPqrs = await PqrsModel.findByPropertyId(propertyId);
      
      res.status(200).json({
        message: 'Property PQRS retrieved successfully',
        data: propertyPqrs || []
      });
    } catch (error) {
      console.error('Error finding PQRS by property:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findByType(req, res) {
    try {
      const typeId = req.params.typeId;
      
      // Basic validate
      if (!typeId) {
        return res.status(400).json({ error: 'Type ID is required' });
      }

      // Get PQRS by Type ID
      const typePqrs = await PqrsModel.findByType(typeId);
      
      res.status(200).json({
        message: 'PQRS by type retrieved successfully',
        data: typePqrs || []
      });
    } catch (error) {
      console.error('Error finding PQRS by type:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findByStatus(req, res) {
    try {
      const statusId = req.params.statusId;
      
      // Basic validate
      if (!statusId) {
        return res.status(400).json({ error: 'Status ID is required' });
      }

      // Get PQRS by Status ID
      const statusPqrs = await PqrsModel.findByStatus(statusId);
      
      res.status(200).json({
        message: 'PQRS by status retrieved successfully',
        data: statusPqrs || []
      });
    } catch (error) {
      console.error('Error finding PQRS by status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async updateStatus(req, res) {
    try {
      const { Status_id } = req.body;
      const id = req.params.id;

      // Basic validation
      if (!Status_id || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Verify if the PQRS exists  
      const existingPqrs = await PqrsModel.findByIdActive(id);
      if (!existingPqrs) {
        return res.status(404).json({ error: 'PQRS not found' });
      }

      const updateStatusModel = await PqrsModel.updateStatus(id, Status_id);

      res.status(200).json({
        message: 'PQRS status updated successfully',
        data: updateStatusModel
      });
    } catch (error) {
      console.error('Error updating PQRS status:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new PqrsController();
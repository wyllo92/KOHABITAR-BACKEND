import VisitorModel from '../models/visitor.model.js';

class VisitorController {

  async register(req, res) {
    try {
      const { 
        Visitor_full_name, 
        Visitor_id_document, 
        Visitor_visit_reason, 
        Visitor_entry_time, 
        Visitor_exit_time, 
        Visitor_authorized_by, 
        Property_id, 
        Status_id, 
        Vehicle_id, 
        parkingSlot_id 
      } = req.body;
      
      // Basic validation
      if (!Visitor_full_name || !Visitor_id_document || !Visitor_visit_reason || !Visitor_entry_time || !Visitor_authorized_by || !Property_id || !Status_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      
      // Check if visitor with same document already exists and is active
      const existingVisitor = await VisitorModel.findByDocument(Visitor_id_document);
      if (existingVisitor && existingVisitor.Status_id === 1) {
        return res.status(409).json({ error: 'Visitor with this document is already registered and active' });
      }
      
      const visitorId = await VisitorModel.create({
        Visitor_full_name,
        Visitor_id_document,
        Visitor_visit_reason,
        Visitor_entry_time,
        Visitor_exit_time,
        Visitor_authorized_by,
        Property_id,
        Status_id,
        Vehicle_id,
        parkingSlot_id
      });
      
      if (!visitorId) {
        return res.status(500).json({ error: 'Failed to create visitor' });
      }
      
      res.status(201).json({
        message: 'Visitor created successfully',
        id: visitorId
      });
    } catch (error) {
      console.error('Error in visitor registration:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      const visitorModel = await VisitorModel.showActive();
      res.status(201).json({
        message: 'Visitors retrieved successfully',
        data: visitorModel
      });
    } catch (error) {
      console.error('Error retrieving visitors:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res) {
    try {
      const { 
        Visitor_full_name, 
        Visitor_id_document, 
        Visitor_visit_reason, 
        Visitor_entry_time, 
        Visitor_exit_time, 
        Visitor_authorized_by, 
        Property_id, 
        Status_id, 
        Vehicle_id, 
        parkingSlot_id 
      } = req.body;
      const id = req.params.id;
      
      // Basic validation
      if (!Visitor_full_name || !Visitor_id_document || !Visitor_visit_reason || !Visitor_entry_time || !Visitor_authorized_by || !Property_id || !Status_id || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      
      // Verify if the Visitor already exists  
      const existingVisitor = await VisitorModel.findByIdActive(id);
      if (!existingVisitor) {
        return res.status(409).json({ data: '', error: 'The Visitor does not exist' });
      }   

      const updateVisitorModel = await VisitorModel.update(id, { 
        Visitor_full_name,
        Visitor_id_document,
        Visitor_visit_reason,
        Visitor_entry_time,
        Visitor_exit_time,
        Visitor_authorized_by,
        Property_id,
        Status_id,
        Vehicle_id,
        parkingSlot_id
      });
      
      if (!updateVisitorModel) {
        return res.status(500).json({ error: 'Failed to update visitor' });
      }
      
      res.status(201).json({
        message: 'Visitor updated successfully',
        data: updateVisitorModel
      });
    } catch (error) {
      console.error('Error in visitor update:', error);
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
      // Verify if the Visitor already exists
      const deleteVisitorModel = await VisitorModel.delete(id);
      res.status(201).json({
        message: 'Visitor deleted successfully',
        data: deleteVisitorModel
      });
    } catch (error) {
      console.error('Error in visitor delete:', error);
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
      // Verify if the Visitor already exists
      const visitorModel = await VisitorModel.findById(id);
      if (!visitorModel) {
        return res.status(404).json({ error: 'Visitor not found' });
      }
      res.status(201).json({
        message: 'Visitor found successfully',
        data: visitorModel
      });
    } catch (error) {
      console.error('Error finding visitor:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new VisitorController(); 
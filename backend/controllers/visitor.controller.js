import VisitorModel from '../models/visitor.model.js';

class VisitorController {

  async register(req, res) {
    try {
      const {
        Visitor_full_name,
        visitor_name,
        Visitor_id_document,
        visitor_document,
        Visitor_visit_reason,
        visitor_purpose,
        Visitor_entry_time,
        visitor_entry_date,
        visitor_entry_time,
        Visitor_exit_time,
        visitor_exit_date,
        visitor_exit_time,
        Visitor_authorized_by,
        host_user_id,
        Property_id,
        property_id,
        Status_id,
        status_id,
        Vehicle_id,
        parkingSlot_id,
        // Additional fields from JSON
        visitor_phone,
        visitor_document_type,
        visitor_email
      } = req.body;

      const fullName = Visitor_full_name || visitor_name;
      const document = Visitor_id_document || visitor_document;
      const reason = Visitor_visit_reason || visitor_purpose;
      const authorizedBy = Visitor_authorized_by || host_user_id;
      const propertyId = Property_id || property_id;
      const statusId = Status_id || status_id;

      // Handling datetime formats
      let entryTime = Visitor_entry_time;
      if (!entryTime && visitor_entry_date && visitor_entry_time) {
        entryTime = `${visitor_entry_date}T${visitor_entry_time}`;
      }

      let exitTime = Visitor_exit_time;
      if (!exitTime && visitor_exit_date && visitor_exit_time) {
        exitTime = `${visitor_exit_date}T${visitor_exit_time}`;
      }

      // Basic validation
      if (!fullName || !document || !reason || !entryTime || !authorizedBy || !propertyId || !statusId) {
        return res.status(400).json({ 
          error: 'Required fields are missing',
          required: ['visitor_name/Visitor_full_name', 'visitor_document/Visitor_id_document', 'visitor_purpose/Visitor_visit_reason', 'visitor_entry_time/Visitor_entry_time', 'host_user_id/Visitor_authorized_by', 'property_id/Property_id', 'status_id/Status_id'],
          received: Object.keys(req.body)
        });
      }

      // Check if visitor with same document already exists and is active
      const existingVisitor = await VisitorModel.findByDocument(document);
      if (existingVisitor && existingVisitor.Status_id === 1) {
        return res.status(409).json({ error: 'Visitor with this document is already registered and active' });
      }

      const visitorId = await VisitorModel.create({
        Visitor_full_name: fullName,
        Visitor_id_document: document,
        Visitor_visit_reason: reason,
        Visitor_entry_time: entryTime,
        Visitor_exit_time: exitTime,
        Visitor_authorized_by: authorizedBy,
        Property_id: propertyId,
        Status_id: statusId,
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
        visitor_name,
        Visitor_id_document,
        visitor_document,
        Visitor_visit_reason,
        visitor_purpose,
        Visitor_entry_time,
        visitor_entry_date,
        visitor_entry_time: visitor_entry_time_alt,
        Visitor_exit_time,
        visitor_exit_date,
        visitor_exit_time,
        Visitor_authorized_by,
        host_user_id,
        Property_id,
        property_id,
        Status_id,
        status_id,
        Vehicle_id,
        parkingSlot_id,
        // Additional fields from JSON
        visitor_phone,
        visitor_document_type,
        visitor_email
      } = req.body;
      const id = req.params.id;

      const fullName = Visitor_full_name || visitor_name;
      const document = Visitor_id_document || visitor_document;
      const reason = Visitor_visit_reason || visitor_purpose;
      const authorizedBy = Visitor_authorized_by || host_user_id;
      const propertyId = Property_id || property_id;
      const statusId = Status_id || status_id;

      // Handle datetime formats
      let entryTime = Visitor_entry_time;
      if (!entryTime && visitor_entry_date && (visitor_entry_time_alt || visitor_entry_time)) {
        const timeStr = visitor_entry_time_alt || visitor_entry_time;
        entryTime = `${visitor_entry_date}T${timeStr}`;
      }

      let exitTime = Visitor_exit_time;
      if (!exitTime && visitor_exit_date && visitor_exit_time) {
        exitTime = `${visitor_exit_date}T${visitor_exit_time}`;
      }

      // Basic validation
      if (!fullName || !document || !reason || !entryTime || !authorizedBy || !propertyId || !statusId || !id) {
        console.log('Validation failed - missing required fields');
        return res.status(400).json({ 
          error: 'Required fields are missing',
          required: ['visitor_name/Visitor_full_name', 'visitor_document/Visitor_id_document', 'visitor_purpose/Visitor_visit_reason', 'visitor_entry_time/Visitor_entry_time', 'host_user_id/Visitor_authorized_by', 'property_id/Property_id', 'status_id/Status_id'],
          received: Object.keys(req.body)
        });
      }

      // Verify if the Visitor already exists  
      const existingVisitor = await VisitorModel.findByIdActive(id);
      if (!existingVisitor) {
        return res.status(409).json({ data: '', error: 'The Visitor does not exist' });
      }

      const updateData = {
        Visitor_full_name: fullName,
        Visitor_id_document: document,
        Visitor_visit_reason: reason,
        Visitor_entry_time: entryTime,
        Visitor_exit_time: exitTime,
        Visitor_authorized_by: authorizedBy,
        Property_id: propertyId,
        Status_id: statusId,
        Vehicle_id,
        parkingSlot_id
      };

      const updateVisitorModel = await VisitorModel.update(id, updateData);

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

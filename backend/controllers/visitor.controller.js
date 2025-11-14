import VisitorModel from '../models/visitor.model.js';

class VisitorController {

  async register(req, res) {
    try {
      const {
        Visitor_full_name,
        visitor_name,
        Visitor_id_document,
        visitor_document,
        Visitor_entry_time,
        visitor_entry_date,
        visitor_entry_time,
        Visitor_exit_time,
        visitor_exit_date,
        visitor_exit_time,
        Property_id,
        property_id,
        Visitor_vehicle,
        visitor_vehicle,
        vehicle_plate,
        parkingSlot_id,
        parking_slot_id,
        // Additional fields from JSON
        visitor_phone,
        visitor_document_type,
        visitor_email
      } = req.body;

      const fullName = Visitor_full_name || visitor_name;
      const document = Visitor_id_document || visitor_document;
      const propertyId = Property_id || property_id;
      const visitorVehicle = Visitor_vehicle || visitor_vehicle || vehicle_plate || null;
      const parkingSlotId = parkingSlot_id || parking_slot_id;

      // Handling datetime formats
      let entryTime = Visitor_entry_time;
      if (!entryTime && visitor_entry_date && visitor_entry_time) {
        entryTime = `${visitor_entry_date}T${visitor_entry_time}`;
      }
      // If no entry time provided, use current time
      if (!entryTime) {
        entryTime = new Date();
      }

      let exitTime = Visitor_exit_time;
      if (!exitTime && visitor_exit_date && visitor_exit_time) {
        exitTime = `${visitor_exit_date}T${visitor_exit_time}`;
      }

      // Basic validation
      if (!fullName || !document || !propertyId) {
        return res.status(400).json({ 
          error: 'Required fields are missing',
          required: ['visitor_name/Visitor_full_name', 'visitor_document/Visitor_id_document', 'property_id/Property_id'],
          received: Object.keys(req.body)
        });
      }

      // Check if visitor with same document is currently in the property (no exit time)
      const existingVisitor = await VisitorModel.findByDocument(document);
      if (existingVisitor && !existingVisitor.Visitor_exit_time) {
        return res.status(409).json({ 
          error: 'Visitor with this document is already registered and has not checked out',
          data: existingVisitor
        });
      }

      const visitorId = await VisitorModel.create({
        Visitor_full_name: fullName,
        Visitor_id_document: document,
        Visitor_entry_time: entryTime,
        Visitor_exit_time: exitTime,
        Property_id: propertyId,
        Visitor_vehicle: visitorVehicle,
        parkingSlot_id: parkingSlotId
      });

      if (!visitorId) {
        return res.status(500).json({ error: 'Failed to create visitor' });
      }

      const newVisitor = await VisitorModel.findById(visitorId);

      res.status(201).json({
        message: 'Visitor created successfully',
        id: visitorId,
        data: newVisitor
      });
    } catch (error) {
      console.error('Error in visitor register:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async show(req, res) {
    try {
      const visitorModel = await VisitorModel.show();
      res.status(200).json({
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
        Visitor_entry_time,
        visitor_entry_date,
        visitor_entry_time: visitor_entry_time_alt,
        Visitor_exit_time,
        visitor_exit_date,
        visitor_exit_time,
        Property_id,
        property_id,
        Visitor_vehicle,
        visitor_vehicle,
        vehicle_plate,
        parkingSlot_id,
        parking_slot_id,
        // Additional fields from JSON
        visitor_phone,
        visitor_document_type,
        visitor_email
      } = req.body;
      const id = req.params.id;

      const fullName = Visitor_full_name || visitor_name;
      const document = Visitor_id_document || visitor_document;
      const propertyId = Property_id || property_id;
      const visitorVehicle = Visitor_vehicle || visitor_vehicle || vehicle_plate || null;
      const parkingSlotId = parkingSlot_id || parking_slot_id;

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
      if (!fullName || !document || !entryTime || !propertyId || !id) {
        console.log('Validation failed - missing required fields');
        return res.status(400).json({ 
          error: 'Required fields are missing',
          required: ['visitor_name/Visitor_full_name', 'visitor_document/Visitor_id_document', 'visitor_entry_time/Visitor_entry_time', 'property_id/Property_id'],
          received: Object.keys(req.body)
        });
      }

      // Verify if the Visitor already exists  
      const existingVisitor = await VisitorModel.findById(id);
      if (!existingVisitor) {
        return res.status(404).json({ error: 'The Visitor does not exist' });
      }

      const updateData = {
        Visitor_full_name: fullName,
        Visitor_id_document: document,
        Visitor_entry_time: entryTime,
        Visitor_exit_time: exitTime,
        Property_id: propertyId,
        Visitor_vehicle: visitorVehicle,
        parkingSlot_id: parkingSlotId
      };

      const updateVisitorModel = await VisitorModel.update(id, updateData);

      if (!updateVisitorModel) {
        return res.status(500).json({ error: 'Failed to update visitor' });
      }

      res.status(200).json({
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
      
      // Verify if the Visitor exists
      const existingVisitor = await VisitorModel.findById(id);
      if (!existingVisitor) {
        return res.status(404).json({ error: 'Visitor not found' });
      }

      const deleteVisitorModel = await VisitorModel.delete(id);
      
      if (!deleteVisitorModel) {
        return res.status(500).json({ error: 'Failed to delete visitor' });
      }

      res.status(200).json({
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
      res.status(200).json({
        message: 'Visitor found successfully',
        data: visitorModel
      });
    } catch (error) {
      console.error('Error finding visitor:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getCurrentVisitors(req, res) {
    try {
      const visitors = await VisitorModel.findCurrentVisitors();
      res.status(200).json({
        message: 'Current visitors retrieved successfully',
        data: visitors
      });
    } catch (error) {
      console.error('Error getting current visitors:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async checkOut(req, res) {
    try {
      const id = req.params.id;
      const { exit_time } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Visitor ID is required' });
      }

      // Verify if the Visitor exists
      const existingVisitor = await VisitorModel.findById(id);
      if (!existingVisitor) {
        return res.status(404).json({ error: 'Visitor not found' });
      }

      // Check if visitor already checked out
      if (existingVisitor.Visitor_exit_time) {
        return res.status(409).json({ 
          error: 'Visitor has already checked out',
          exit_time: existingVisitor.Visitor_exit_time
        });
      }

      const checkOutSuccess = await VisitorModel.checkOut(id, exit_time);

      if (!checkOutSuccess) {
        return res.status(500).json({ error: 'Failed to check out visitor' });
      }

      const updatedVisitor = await VisitorModel.findById(id);

      res.status(200).json({
        message: 'Visitor checked out successfully',
        data: updatedVisitor
      });
    } catch (error) {
      console.error('Error checking out visitor:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getTodayVisitors(req, res) {
    try {
      const visitors = await VisitorModel.getTodayVisitors();
      res.status(200).json({
        message: 'Today\'s visitors retrieved successfully',
        data: visitors
      });
    } catch (error) {
      console.error('Error getting today visitors:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getStatistics(req, res) {
    try {
      const statistics = await VisitorModel.getVisitorStatistics();
      res.status(200).json({
        message: 'Visitor statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Error getting visitor statistics:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getFrequentVisitors(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const frequentVisitors = await VisitorModel.getFrequentVisitors(limit);
      res.status(200).json({
        message: 'Frequent visitors retrieved successfully',
        data: frequentVisitors
      });
    } catch (error) {
      console.error('Error getting frequent visitors:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getVisitorHistory(req, res) {
    try {
      const { document } = req.params;
      
      if (!document) {
        return res.status(400).json({ error: 'Visitor document is required' });
      }

      const history = await VisitorModel.getVisitorHistory(document);
      res.status(200).json({
        message: 'Visitor history retrieved successfully',
        data: history
      });
    } catch (error) {
      console.error('Error getting visitor history:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findByPropertyId(req, res) {
    try {
      const { propertyId } = req.params;
      
      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID is required' });
      }

      const visitors = await VisitorModel.findByPropertyId(propertyId);
      res.status(200).json({
        message: 'Visitors by property retrieved successfully',
        data: visitors
      });
    } catch (error) {
      console.error('Error getting visitors by property:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async findByDateRange(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({ 
          error: 'Start date and end date are required',
          format: 'YYYY-MM-DD HH:mm:ss'
        });
      }

      const visitors = await VisitorModel.findByDateRange(start_date, end_date);
      res.status(200).json({
        message: 'Visitors by date range retrieved successfully',
        data: visitors
      });
    } catch (error) {
      console.error('Error getting visitors by date range:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new VisitorController();
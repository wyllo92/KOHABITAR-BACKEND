import VisitorModel from '../models/visitor.model.js';

class VisitorController {
  
  static async getAllVisitors(req, res) {
    try {
      const visitors = await VisitorModel.show();
      res.json({
        success: true,
        data: visitors,
        message: 'Visitantes obtenidos exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los visitantes',
        error: error.message
      });
    }
  }

  static async getVisitorsByUser(req, res) {
    try {
      const { user_id } = req.params;
      const visitors = await VisitorModel.findByUser(user_id);
      res.json({
        success: true,
        data: visitors,
        message: `Visitantes del usuario ${user_id} obtenidos exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los visitantes del usuario',
        error: error.message
      });
    }
  }

  static async getVisitorById(req, res) {
    try {
      const { id } = req.params;
      const visitor = await VisitorModel.findById(id);
      
      if (!visitor) {
        return res.status(404).json({
          success: false,
          message: 'Visitante no encontrado'
        });
      }

      res.json({
        success: true,
        data: visitor,
        message: 'Visitante obtenido exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener el visitante',
        error: error.message
      });
    }
  }

  static async createVisitor(req, res) {
    try {
      const visitorData = req.body;
      const visitorId = await VisitorModel.create(visitorData);
      
      if (visitorId) {
        const newVisitor = await VisitorModel.findById(visitorId);
        res.status(201).json({
          success: true,
          data: newVisitor,
          message: 'Visitante creado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al crear el visitante'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el visitante',
        error: error.message
      });
    }
  }

  static async updateVisitor(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingVisitor = await VisitorModel.findById(id);
      if (!existingVisitor) {
        return res.status(404).json({
          success: false,
          message: 'Visitante no encontrado'
        });
      }

      const updatedVisitor = await VisitorModel.update(id, updateData);
      
      if (updatedVisitor) {
        res.json({
          success: true,
          data: updatedVisitor,
          message: 'Visitante actualizado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar el visitante'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el visitante',
        error: error.message
      });
    }
  }

  static async deleteVisitor(req, res) {
    try {
      const { id } = req.params;

      const existingVisitor = await VisitorModel.findById(id);
      if (!existingVisitor) {
        return res.status(404).json({
          success: false,
          message: 'Visitante no encontrado'
        });
      }

      const deleted = await VisitorModel.delete(id);
      
      if (deleted) {
        res.json({
          success: true,
          message: 'Visitante eliminado exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al eliminar el visitante'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el visitante',
        error: error.message
      });
    }
  }
}

export default VisitorController; 
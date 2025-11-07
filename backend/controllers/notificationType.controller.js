import NotificationTypeModel from '../models/notificationType.model.js';

class NotificationTypeController {
  async show(req, res) {
    try {
      const types = await NotificationTypeModel.findActive();
      return res.status(200).json({ message: 'Notification types retrieved', data: types });
    } catch (error) {
      console.error('Error fetching notification types:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new NotificationTypeController();

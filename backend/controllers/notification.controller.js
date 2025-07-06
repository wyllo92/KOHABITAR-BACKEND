import NotificationModel from '../models/notification.model.js';

class NotificationController {

    async register(req, res) {
        try {
            const { user_id, notification_title, notification_message, notification_type, notification_status } = req.body;

            // Basic validation
            if (!user_id || !notification_title || !notification_message) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const notificationId = await NotificationModel.create({
                User_id: user_id,
                Property_id: 1, // Default property_id
                Notification_type_id: 1, // Default notification type
                Notification_title: notification_title,
                Notification_message: notification_message,
                Status_id: 1, // Default status
                Notification_priority: 2, // Use integer: 1=low, 2=medium, 3=high
                Notification_createAt: currentDate,
                Notification_updateAt: currentDate
            });

            if (!notificationId) {
                return res.status(500).json({ error: 'Failed to create notification' });
            }

            res.status(201).json({
                message: 'Notification created successfully',
                id: notificationId
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async show(req, res) {
        try {
            const notifications = await NotificationModel.show();
            res.status(200).json({
                success: true,
                message: 'Notifications retrieved successfully',
                data: notifications
            });
        } catch (error) {
            console.error('Error in show method:', error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const { user_id, notification_title, notification_message, notification_type, notification_status } = req.body;
            const id = req.params.id;

            if (!user_id || !notification_title || !notification_message || !id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const existingNotification = await NotificationModel.findById(id);
            if (!existingNotification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const updatedNotification = await NotificationModel.update(id, {
                User_id: user_id,
                Property_id: 1,
                Notification_type_id: 1,
                Notification_title: notification_title,
                Notification_message: notification_message,
                Status_id: notification_status === 'read' ? 2 : 1,
                Notification_priority: 2,
                Notification_updateAt: currentDate
            });

            if (!updatedNotification) {
                return res.status(500).json({ error: 'Failed to update notification' });
            }

            res.status(200).json({
                message: 'Notification updated successfully',
                data: updatedNotification
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const deleteResult = await NotificationModel.delete(id);
            if (!deleteResult) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            res.status(200).json({
                message: 'Notification deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async findById(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const notification = await NotificationModel.findById(id);
            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            res.status(200).json({
                message: 'Notification found successfully',
                data: notification
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export default new NotificationController();

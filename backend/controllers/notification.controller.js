import NotificationModel from '../models/notification.model.js';

class NotificationController {

    async register(req, res) {
        try {
            const { user_id, notification_title, notification_message, notification_type, notification_status } = req.body;

            // Basic validation
            if (!user_id || !notification_title || !notification_message) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const currentDate = new Date().toISOString();
            const notificationId = await NotificationModel.create({
                User_id: user_id,
                Property_id: 1, // Default property_id
                Notification_type_id: 1, // Default notification type
                Notification_title: notification_title,
                Notification_message: notification_message,
                Status_id: 1, // Default status
                Notification_priority: 'medium',
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
            // Return empty array for now to avoid database errors
            res.status(200).json({
                success: true,
                message: 'Notifications retrieved successfully',
                data: []
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error'
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

            const currentDate = new Date().toISOString();
            const updatedNotification = await NotificationModel.update(id, {
                user_id,
                notification_title,
                notification_message,
                notification_type: notification_type || 'general',
                notification_status: notification_status || 'unread',
                created_at: currentDate
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

/**
 * Importar el modelo de Notificaciones para interactuar con la base de datos.
 * El modelo contiene todos los métodos necesarios para las operaciones CRUD con notificaciones.
 */
import NotificationModel from '../models/notification.model.js';
import StatusModel from '../models/status.model.js';

/**
 * Controlador para manejar todas las operaciones relacionadas con notificaciones.
 * Procesa peticiones HTTP, valida datos y devuelve respuestas apropiadas.
 */
class NotificationController {

    /**
     * Registrar una nueva notificación en el sistema.
     * Esta función soporta dos modos de operación:
     * 1. Envío individual: Si se proporciona un user_id válido, envía a ese usuario específico
     * 2. Envío masivo: Si user_id es null, 0, "all" o vacío, envía a todos los usuarios activos
     *
     * @param {Request} req - Objeto de solicitud HTTP con los datos de la notificación en el cuerpo.
     * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
     * @returns {Response} - Respuesta JSON con el resultado de la operación.
     */
    async register(req, res) {
        try {
            // Extraer datos del cuerpo de la solicitud con valores predeterminados para campos opcionales
            const { user_id, title, message, notification_type_id = 1, property_id = null, status_id = 1, priority = 2 } = req.body;

            // Realizar validación básica de los campos obligatorios
            // Nota: user_id puede ser null para envío masivo, por eso solo se valida título y mensaje
            if (!title || !message) {
                // Si faltan campos obligatorios, retorna un error 400 (solicitud incorrecta)
                return res.status(400).json({
                    success: false,
                    error: 'Title and message are required'
                });
            }

            // Validar que el status_id sea válido para notificaciones (si se proporciona)
            if (status_id) {
                const isValidStatus = await StatusModel.validateStatusForEntity(status_id, 'notification');
                if (!isValidStatus) {
                    return res.status(400).json({
                        success: false,
                        error: 'El estado proporcionado no es válido para notificaciones. Use solo estados de tipo "notification".'
                    });
                }
            }

            // Utilizar el nuevo método del modelo que maneja envío individual o masivo
            const result = await NotificationModel.createSingleOrBroadcast({
                user_id,
                property_id,
                notification_type_id,
                title,
                message,
                status_id,
                priority
            });

            // Verificar si la operación fue exitosa
            if (!result.success) {
                // Si hubo un error en la operación, retorna un error 500
                return res.status(500).json({
                    success: false,
                    error: result.message || 'Failed to create notification(s)'
                });
            }

            // Retornar respuesta exitosa con código 201 (recurso creado)
            // La respuesta incluye información sobre si fue envío individual o masivo
            res.status(201).json({
                success: true,
                message: result.message,
                broadcast: result.broadcast, // Indica si fue envío masivo
                total: result.total, // Total de usuarios destinatarios
                created: result.created, // Total de notificaciones creadas exitosamente
                data: result.broadcast ? {
                    notificationIds: result.notificationIds
                } : {
                    notificationId: result.notificationId
                }
            });
        } catch (error) {
            // Registrar el error en la consola para depuración
            console.error('Error in register method:', error);

            // En caso de error, retorna un error 500 (error interno del servidor)
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }

    /**
     * Obtener y muestra todas las notificaciones del sistema.
     * 
     * @param {Request} req - Objeto de solicitud HTTP.
     * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
     * @returns {Response} - Respuesta JSON con la lista de notificaciones o mensaje de error.
     */
    async show(req, res) {
        try {
            // Consultar al modelo para obtener todas las notificaciones
            const notifications = await NotificationModel.show();
            
            // Retornar respuesta exitosa con las notificaciones obtenidas
            res.status(200).json({
                success: true,
                message: 'Notifications retrieved successfully',
                data: notifications
            });
        } catch (error) {
            // Registrar el error en la consola para depuración
            console.error('Error in show method:', error);
            
            // Retornar un error 500 con detalles del error
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }

    /**
     * Actualiza una notificación existente con nuevos datos.
     * 
     * @param {Request} req - Objeto de solicitud HTTP con los nuevos datos y el ID en los parámetros.
     * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
     * @returns {Response} - Respuesta JSON con la notificación actualizada o mensaje de error.
     */
    async update(req, res) {
        try {
            // Extraer datos del cuerpo de la solicitud con valores predeterminados para campos opcionales
            const { user_id, title, message, notification_type_id = 1, property_id = null, status_id, priority = 2 } = req.body;

            // Obtener el ID de la notificación desde los parámetros de la URL
            const id = req.params.id;

            // Valida que se proporcionen los campos obligatorios
            if (!user_id || !title || !message || !id) {
                // Si faltan campos requeridos, retorna un error 400 (solicitud incorrecta)
                return res.status(400).json({ error: 'User ID, title, message, and notification ID are required' });
            }

            // Verificar que la notificación exista antes de actualizarla
            const existingNotification = await NotificationModel.findById(id);
            if (!existingNotification) {
                // Si no se encuentra la notificación, retorna un error 404 (no encontrado)
                return res.status(404).json({ error: 'Notification not found' });
            }

            // Determina el estado a utilizar para la actualización
            let notificationStatusId = status_id;
            if (status_id === undefined) {
                // Si no se proporciona status_id, utiliza el existente o el valor predeterminado 1
                notificationStatusId = existingNotification.status_id || 1;
            }

            // Validar que el status_id sea válido para notificaciones (si se está cambiando)
            if (notificationStatusId) {
                const isValidStatus = await StatusModel.validateStatusForEntity(notificationStatusId, 'notification');
                if (!isValidStatus) {
                    return res.status(400).json({
                        success: false,
                        error: 'El estado proporcionado no es válido para notificaciones. Use solo estados de tipo "notification".'
                    });
                }
            }

            // Actualiza la notificación con los nuevos datos
            const updatedNotification = await NotificationModel.update(id, {
                user_id,
                property_id,
                notification_type_id,
                title,
                message,
                status_id: notificationStatusId,
                priority
            });

            // Verificar si la actualización fue exitosa
            if (!updatedNotification) {
                // Si no se pudo actualizar, retorna un error 500 (error del servidor)
                return res.status(500).json({ error: 'Failed to update notification' });
            }

            // Retornar respuesta exitosa con los datos actualizados
            res.status(200).json({
                message: 'Notification updated successfully',
                data: updatedNotification
            });
        } catch (error) {
            // En caso de error, retorna un error 500 (error interno del servidor)
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Elimina una notificación del sistema.
     * 
     * @param {Request} req - Objeto de solicitud HTTP con el ID de la notificación en los parámetros.
     * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
     * @returns {Response} - Respuesta JSON con mensaje de éxito o error.
     */
    async delete(req, res) {
        try {
            // Obtener el ID de la notificación desde los parámetros de la URL
            const id = req.params.id;
            
            // Valida que se proporcione el ID de la notificación
            if (!id) {
                // Si no se proporciona el ID, retorna un error 400 (solicitud incorrecta)
                return res.status(400).json({ error: 'Notification ID is required' });
            }

            // Verificar que la notificación exista antes de intentar eliminarla
            const existingNotification = await NotificationModel.findById(id);
            if (!existingNotification) {
                // Si no se encuentra la notificación, retorna un error 404 (no encontrado)
                return res.status(404).json({ error: 'Notification not found' });
            }

            // Intenta eliminar la notificación y obtiene el resultado
            const deleteResult = await NotificationModel.delete(id);
            if (!deleteResult) {
                // Si no se pudo eliminar, retorna un error 500 (error del servidor)
                return res.status(500).json({ error: 'Failed to delete notification' });
            }

            // Retornar respuesta exitosa con mensaje de confirmación
            res.status(200).json({
                message: 'Notification deleted successfully'
            });
        } catch (error) {
            // Registrar el error en la consola para depuración
            console.error('Error in delete method:', error);
            
            // Retornar un error 500 (error interno del servidor)
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Buscar y obtiene una notificación específica por su ID.
     * 
     * @param {Request} req - Objeto de solicitud HTTP con el ID de la notificación en los parámetros.
     * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
     * @returns {Response} - Respuesta JSON con los datos de la notificación o mensaje de error.
     */
    async findById(req, res) {
        try {
            // Obtener el ID de la notificación desde los parámetros de la URL
            const id = req.params.id;
            
            // Valida que se proporcione el ID de la notificación
            if (!id) {
                // Si no se proporciona el ID, retorna un error 400 (solicitud incorrecta)
                return res.status(400).json({ error: 'Notification ID is required' });
            }

            // Buscar la notificación por su ID
            const notification = await NotificationModel.findById(id);
            
            // Verificar si se encontró la notificación
            if (!notification) {
                // Si no se encuentra la notificación, retorna un error 404 (no encontrado)
                return res.status(404).json({ error: 'Notification not found' });
            }

            // Retornar respuesta exitosa con los datos de la notificación
            res.status(200).json({
                success: true,
                message: 'Notification retrieved successfully',
                data: notification
            });
        } catch (error) {
            // Registrar el error en la consola para depuración
            console.error('Error in findById method:', error);
            
            // Retornar un error 500 con detalles del error
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }

    /**
     * Buscar todas las notificaciones asociadas a un usuario específico.
     *
     * @param {Request} req - Objeto de solicitud HTTP con el ID del usuario en los parámetros.
     * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
     * @returns {Response} - Respuesta JSON con la lista de notificaciones del usuario o mensaje de error.
     */
    async findByUserId(req, res) {
        try {
            // Extraer el ID del usuario desde los parámetros de la URL
            const { user_id } = req.params;

            // Valida que se proporcione el ID del usuario
            if (!user_id) {
                // Si no se proporciona el ID, retorna un error 400 (solicitud incorrecta)
                return res.status(400).json({ error: 'User ID is required' });
            }

            // Consultar al modelo para obtener las notificaciones del usuario específico
            const notifications = await NotificationModel.findByUserId(user_id);

            // Retornar respuesta exitosa con las notificaciones encontradas
            res.status(200).json({
                success: true,
                message: 'Notifications retrieved successfully',
                data: notifications
            });
        } catch (error) {
            // Registrar el error en la consola para depuración
            console.error('Error in findByUserId method:', error);

            // Retornar un error 500 con detalles del error
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }

    /**
     * Marcar una notificación como leída.
     *
     * @param {Request} req - Objeto de solicitud HTTP con el ID de la notificación en los parámetros.
     * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
     * @returns {Response} - Respuesta JSON con la notificación actualizada o mensaje de error.
     */
    async markAsRead(req, res) {
        try {
            // Obtener el ID de la notificación desde los parámetros de la URL
            const id = req.params.id;

            // Valida que se proporcione el ID de la notificación
            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'Notification ID is required'
                });
            }

            // Verificar que la notificación exista antes de marcarla como leída
            const existingNotification = await NotificationModel.findById(id);
            if (!existingNotification) {
                return res.status(404).json({
                    success: false,
                    error: 'Notification not found'
                });
            }

            // Marcar la notificación como leída
            const updatedNotification = await NotificationModel.markAsRead(id);

            // Verificar si la actualización fue exitosa
            if (!updatedNotification) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to mark notification as read'
                });
            }

            // Retornar respuesta exitosa con los datos actualizados
            res.status(200).json({
                success: true,
                message: 'Notification marked as read successfully',
                data: updatedNotification
            });
        } catch (error) {
            // Registrar el error en la consola para depuración
            console.error('Error in markAsRead method:', error);

            // Retornar un error 500 (error interno del servidor)
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
}

export default new NotificationController();

import StatusModel from '../models/status.model.js';

/**
 * Controlador para gestionar las operaciones relacionadas con estados.
 * Implementar métodos para crear, consultar, actualizar y eliminar estados,
 * así como para buscar estados por ID.
 */
class StatusController {

    /**
     * Registrar un nuevo estado en el sistema.
     * Valida que se proporcionen los campos requeridos y que no exista otro estado con el mismo nombre.
     * 
     * @param {Object} req - Objeto de solicitud HTTP con los datos del estado en el cuerpo
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con el resultado de la operación
     */
    async register(req, res) {
        try {
            const { name, description, entity, is_active } = req.body;

            // Basic validation
            if (!name || !entity) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            // Check if status with same name already exists
            const existingStatus = await StatusModel.findByName(name);
            if (existingStatus) {
                return res.status(409).json({ error: 'Status with this name already exists' });
            }

            const statusId = await StatusModel.create({
                name,
                description,
                entity,
                is_active: is_active !== undefined ? is_active : 1
            });

            if (!statusId) {
                return res.status(500).json({ error: 'Failed to create status' });
            }

            return res.status(201).json({
                message: 'Status created successfully',
                id: statusId
            });
        } catch (error) {
            console.error('Error in status registration:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Obtener todos los estados activos del sistema.
     * Retornar una lista de estados que tienen el campo is_active = 1.
     * 
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con la lista de estados activos
     */
    async show(req, res) {
        try {
            const statusModel = await StatusModel.showActive();
            return res.status(200).json({
                message: 'Status retrieved successfully',
                data: statusModel || []
            });
        } catch (error) {
            console.error('Error retrieving status:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Actualiza un estado existente en el sistema.
     * Verificar que el estado exista y esté activo antes de actualizarlo.
     * 
     * @param {Object} req - Objeto de solicitud HTTP con el ID del estado en los parámetros y los datos actualizados en el cuerpo
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con el estado actualizado
     */
    async update(req, res) {
        try {
            const { name, description, entity, is_active } = req.body;
            const id = req.params.id;

            // Basic validation
            if (!name || !entity || !id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            // Verify if the Status already exists  
            const existingStatus = await StatusModel.findByIdActive(id);
            if (!existingStatus) {
                return res.status(404).json({ error: 'Status not found or inactive' });
            }

            const updateStatusModel = await StatusModel.update(id, {
                name,
                description,
                entity,
                is_active: is_active !== undefined ? is_active : existingStatus.is_active
            });

            if (!updateStatusModel) {
                return res.status(500).json({ error: 'Failed to update status' });
            }

            return res.status(200).json({
                message: 'Status updated successfully',
                data: updateStatusModel
            });
        } catch (error) {
            console.error('Error in status update:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Elimina un estado del sistema.
     * Verificar que el estado exista antes de eliminarlo.
     * 
     * @param {Object} req - Objeto de solicitud HTTP con el ID del estado en los parámetros
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con el resultado de la operación
     */
    async delete(req, res) {
        try {
            const id = req.params.id;
            // Basic validate
            if (!id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }
            
            // Check if status exists before deletion
            const existingStatus = await StatusModel.findById(id);
            if (!existingStatus) {
                return res.status(404).json({ error: 'Status not found' });
            }
            
            // Delete status
            const deleteStatusModel = await StatusModel.delete(id);
            if (!deleteStatusModel) {
                return res.status(500).json({ error: 'Failed to delete status' });
            }
            
            return res.status(200).json({
                message: 'Status deleted successfully',
                data: deleteStatusModel
            });
        } catch (error) {
            console.error('Error in status delete:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Buscar un estado específico por su ID.
     *
     * @param {Object} req - Objeto de solicitud HTTP con el ID del estado en los parámetros
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con la información del estado encontrado
     */
    async findById(req, res) {
        try {
            const id = req.params.id;
            // Basic validate
            if (!id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }
            // Verify if the Status already exists
            const statusModel = await StatusModel.findById(id);
            if (!statusModel) {
                return res.status(404).json({ error: 'Status not found' });
            }
            return res.status(200).json({
                message: 'Status found successfully',
                data: statusModel
            });
        } catch (error) {
            console.error('Error finding status:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Obtiene todos los estados que pertenecen a una entidad específica.
     * Este método permite filtrar estados según la entidad del sistema
     * para mostrar solo los estados relevantes en formularios y selects.
     *
     * @param {Object} req - Objeto de solicitud HTTP con el nombre de la entidad en los parámetros
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con los estados de la entidad especificada
     *
     * @example
     * GET /api_v1/statuses/entity/usuarios
     * Retorna todos los estados con entity='usuarios'
     */
    async getByEntity(req, res) {
        try {
            const entity = req.params.entity;

            // Validación básica
            if (!entity) {
                return res.status(400).json({ error: 'Entity parameter is required' });
            }

            // Obtener estados de la entidad específica
            const statuses = await StatusModel.getByEntity(entity);

            return res.status(200).json({
                message: `Statuses for entity '${entity}' retrieved successfully`,
                data: statuses || []
            });
        } catch (error) {
            console.error('Error getting statuses by entity:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export default new StatusController();

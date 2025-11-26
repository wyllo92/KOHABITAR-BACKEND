import CpcgModel from '../models/cpcg.model.js';
import UserPropertyModel from '../models/userProperty.model.js';
import StatusModel from '../models/status.model.js';

/**
 * Controlador para gestionar los PQRS (Complaints, Petitions, Claims, and Suggestions)
 * @class CpcgController
 */
class CpcgController {
    /**
     * Construye una respuesta estandarizada para la API
     * @param {boolean} success - Indica si la operación fue exitosa
     * @param {string} message - Mensaje descriptivo de la operación
     * @param {Object} [data=null] - Datos de la respuesta
     * @param {Object} [metadata=null] - Metadata adicional (errores)
     * @returns {Object} Respuesta estandarizada
     */
    static buildResponse(success, message, data = null, metadata = null) {
        const response = {
            success,
            message
        };

        if (data !== null) {
            response.data = data;
        }

        if (metadata !== null) {
            response.metadata = metadata;
        }

        return response;
    }

    /**
     * Obtener todos los PQRS
     * @param {Object} req - Objeto de solicitud
     * @param {Object} req.query.page - Número de página 
     * @param {Object} req.query.limit - Cantidad de registros por página 
     * @param {Object} res - Objeto de respuesta
     *
     * @example
     * // Sin paginación (retorna todos los registros):
     * GET /api_v1/cpcg
     *
     * // Con paginación (retorna 10 registros de la página 1):
     * GET /api_v1/cpcg?page=1&limit=10
     */
    static getAll = async (req, res) => {
        try {
            // Se extraen los parámetros de query para paginación
            const { page, limit } = req.query;

            // Se pasan las opciones al modelo
            const result = await CpcgModel.show({ page, limit });

            // Si el resultado tiene metadata, significa que se usó paginación
            if (result.metadata) {
                res.json(CpcgController.buildResponse(
                    true,
                    'PQRS obtenidos exitosamente',
                    result.data,
                    result.metadata
                ));
            } else {
                // Si no tiene metadata, se retorna como antes (sin paginación)
                res.json(CpcgController.buildResponse(
                    true,
                    'PQRS obtenidos exitosamente',
                    result
                ));
            }
        } catch (error) {
            res.status(500).json(CpcgController.buildResponse(
                false,
                'Error al obtener los PQRS',
                null,
                { error: error.message }
            ));
        }
    }

    /**
     * Obtener un PQRS por su ID
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static getById = async (req, res) => {
        try {
            const cpcg = await CpcgModel.findById(req.params.id);
            if (cpcg) {
                res.json(CpcgController.buildResponse(
                    true,
                    'PQRS encontrado',
                    cpcg
                ));
            } else {
                res.status(404).json(CpcgController.buildResponse(
                    false,
                    'PQRS no encontrado'
                ));
            }
        } catch (error) {
            res.status(500).json(CpcgController.buildResponse(
                false,
                'Error al obtener el PQRS',
                null,
                { error: error.message }
            ));
        }
    }

    /**
     * Obtener todos los PQRS de un usuario específico
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static getByUser = async (req, res) => {
        try {
            const cpcgs = await CpcgModel.findByUser(req.params.userId);
            res.json(CpcgController.buildResponse(
                true,
                'PQRS del usuario obtenidos exitosamente',
                cpcgs
            ));
        } catch (error) {
            res.status(500).json(CpcgController.buildResponse(
                false,
                'Error al obtener los PQRS del usuario',
                null,
                { error: error.message }
            ));
        }
    }

    /**
     * Crear un nuevo PQRS
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static create = async (req, res) => {
        try {
            // PASO 1: Validar que property_id esté presente
            // Si no viene en el body, rechazamos la petición
            if (!req.body.property_id) {
                return res.status(400).json(CpcgController.buildResponse(
                    false,
                    'El campo property_id es obligatorio'
                ));
            }

            // PASO 2: Validar que el usuario tenga relación con la propiedad
            // Obtenemos todas las propiedades del usuario que viene en el token (req.user.id)
            const userProperties = await UserPropertyModel.findByUserId(req.user.id);

            // Buscamos si entre las propiedades del usuario está la que quiere usar
            const hasPropertyRelation = userProperties.some(
                property => property.property_id === parseInt(req.body.property_id)
            );

            // Si no tiene relación con la propiedad, rechazamos
            if (!hasPropertyRelation) {
                return res.status(403).json(CpcgController.buildResponse(
                    false,
                    'No tienes permiso para crear un PQRS en esta propiedad. Solo puede crear PQRS en propiedades donde sea propietario o residente.'
                ));
            }

            // PASO 3: Validar que el status_id sea válido para PQRS (si se proporciona)
            if (req.body.status_id) {
                const isValidStatus = await StatusModel.validateStatusForEntity(req.body.status_id, 'cpcg');
                if (!isValidStatus) {
                    return res.status(400).json(CpcgController.buildResponse(
                        false,
                        'El estado proporcionado no es válido para PQRS. Use solo estados de tipo "cpcg".'
                    ));
                }
            }

            // PASO 4: Si pasó las validaciones, procedemos a crear el PQRS
            const id = await CpcgModel.create(req.body);
            if (id) {
                const cpcg = await CpcgModel.findById(id);
                if (cpcg) {
                    res.status(201).json(CpcgController.buildResponse(
                        true,
                        'PQRS creado exitosamente',
                        cpcg
                    ));
                } else {
                    res.status(500).json(CpcgController.buildResponse(
                        false,
                        'PQRS creado pero no se pudo recuperar la información completa. Verifique que existan los registros relacionados (usuario, tipo, estado)',
                        { cpcg_id: id }
                    ));
                }
            } else {
                res.status(400).json(CpcgController.buildResponse(
                    false,
                    'Error al crear el PQRS. Verifique que los datos sean correctos'
                ));
            }
        } catch (error) {
            res.status(400).json(CpcgController.buildResponse(
                false,
                'Error al crear el PQRS',
                null,
                { error: error.message }
            ));
        }
    }

    /**
     * Actualiza un PQRS existente
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static update = async (req, res) => {
        try {
            const userRole = req.user.role; // Rol del usuario autenticado
            const isAdmin = userRole === 'Administrador';

            // VALIDACIÓN 1: Si un usuario normal intenta cambiar property_id
            if (req.body.property_id && !isAdmin) {
                // Obtenemos todas las propiedades del usuario autenticado
                const userProperties = await UserPropertyModel.findByUserId(req.user.id);

                // Verificamos si el usuario tiene relación con la propiedad nueva
                const hasPropertyRelation = userProperties.some(
                    property => property.property_id === parseInt(req.body.property_id)
                );

                // Si no tiene relación con la propiedad, rechazamos la actualización
                if (!hasPropertyRelation) {
                    return res.status(403).json(CpcgController.buildResponse(
                        false,
                        'No tienes permiso para asignar este PQRS a esta propiedad.'
                    ));
                }
            }

            // VALIDACIÓN 2: Solo administradores pueden cambiar el estado o agregar respuestas
            if ((req.body.status_id || req.body.admin_response) && !isAdmin) {
                return res.status(403).json(CpcgController.buildResponse(
                    false,
                    'Solo los administradores pueden cambiar el estado o agregar respuestas a los PQRS.'
                ));
            }

            // VALIDACIÓN 3: Validar que el status_id sea válido para PQRS (si se está cambiando)
            if (req.body.status_id) {
                const isValidStatus = await StatusModel.validateStatusForEntity(req.body.status_id, 'cpcg');
                if (!isValidStatus) {
                    return res.status(400).json(CpcgController.buildResponse(
                        false,
                        'El estado proporcionado no es válido para PQRS. Use solo estados de tipo "cpcg".'
                    ));
                }
            }

            // VALIDACIÓN 4: Si el admin está agregando una respuesta, registrar quién respondió
            if (req.body.admin_response && isAdmin) {
                req.body.responded_by = req.user.id;
            }

            // Si pasaron las validaciones, procedemos a actualizar
            const cpcg = await CpcgModel.update(req.params.id, req.body);
            if (cpcg) {
                res.json(CpcgController.buildResponse(
                    true,
                    'PQRS actualizado exitosamente',
                    cpcg
                ));
            } else {
                res.status(404).json(CpcgController.buildResponse(
                    false,
                    'PQRS no encontrado'
                ));
            }
        } catch (error) {
            res.status(400).json(CpcgController.buildResponse(
                false,
                'Error al actualizar el PQRS',
                null,
                { error: error.message }
            ));
        }
    }

    /**
     * Elimina un PQRS
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static delete = async (req, res) => {
        try {
            const result = await CpcgModel.delete(req.params.id);
            if (result) {
                res.json(CpcgController.buildResponse(
                    true,
                    'PQRS eliminado exitosamente'
                ));
            } else {
                res.status(404).json(CpcgController.buildResponse(
                    false,
                    'PQRS no encontrado'
                ));
            }
        } catch (error) {
            res.status(500).json(CpcgController.buildResponse(
                false,
                'Error al eliminar el PQRS',
                null,
                { error: error.message }
            ));
        }
    }

    /**
     * Obtener los PQRS por propiedad
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static getByProperty = async (req, res) => {
        try {
            const cpcgs = await CpcgModel.findByProperty(req.params.propertyId);
            res.json(CpcgController.buildResponse(
                true,
                'PQRS de la propiedad obtenidos exitosamente',
                cpcgs
            ));
        } catch (error) {
            res.status(500).json(CpcgController.buildResponse(
                false,
                'Error al obtener los PQRS de la propiedad',
                null,
                { error: error.message }
            ));
        }
    }

    /**
     * Obtener los PQRS por tipo
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static getByType = async (req, res) => {
        try {
            const cpcgs = await CpcgModel.findByType(req.params.typeId);
            res.json(CpcgController.buildResponse(
                true,
                'PQRS del tipo obtenidos exitosamente',
                cpcgs
            ));
        } catch (error) {
            res.status(500).json(CpcgController.buildResponse(
                false,
                'Error al obtener los PQRS del tipo',
                null,
                { error: error.message }
            ));
        }
    }

    /**
     * Obtener los PQRS por estado
     * Este método es útil para filtrar PQRS según su estado actual
     * ("Creado", "En Proceso", "Resuelto", "Cerrado", "Escalado")
     *
     * @param {Object} req - Objeto de solicitud
     * @param {Object} req.params.statusId - ID del estado
     * @param {Object} res - Objeto de respuesta
     *
     * @example
     * // Para obtener todos los PQRS con estado "Creado" (status_id = 8):
     * GET /api_v1/cpcg/status/8
     */
    static getByStatus = async (req, res) => {
        try {
            const cpcgs = await CpcgModel.findByStatus(req.params.statusId);
            res.json(CpcgController.buildResponse(
                true,
                'PQRS del estado obtenidos exitosamente',
                cpcgs
            ));
        } catch (error) {
            res.status(500).json(CpcgController.buildResponse(
                false,
                'Error al obtener los PQRS del estado',
                null,
                { error: error.message }
            ));
        }
    }
}

export default CpcgController;
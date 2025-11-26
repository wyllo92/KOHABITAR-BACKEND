import CpcgTypeModel from '../models/cpcgType.model.js';

/**
 * Controlador para gestionar los tipos de PQRS (Peticiones, Quejas, Reclamos y Sugerencias).
 * Implementar operaciones CRUD con validaciones, paginación y búsqueda.
 * @class CpcgTypeController
 */
class CpcgTypeController {
    /**
     * Construye una respuesta estandarizada para la API
     * @param {boolean} success - Indica si la operación fue exitosa
     * @param {string} message - Mensaje descriptivo de la operación
     * @param {Object} [data=null] - Datos de la respuesta
     * @param {Object} [metadata=null] - Metadata adicional (paginación)
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
     * Obtener todos los tipos de PQRS con paginación y filtros
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static getAll = async (req, res) => {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                sortBy = 'cpcg_type_id',
                sortOrder = 'ASC'
            } = req.query;

            const result = await CpcgTypeModel.show({
                page: parseInt(page),
                limit: parseInt(limit),
                search,
                sortBy,
                sortOrder
            });

            res.json(CpcgTypeController.buildResponse(
                true,
                'Tipos de PQRS obtenidos exitosamente',
                result.data,
                { pagination: result.pagination }
            ));
        } catch (error) {
            res.status(500).json(CpcgTypeController.buildResponse(
                false,
                'Error al obtener los tipos de PQRS',
                null,
                { error: error.message }
            ));
        }
    }

    /**
     * Obtener un tipo de PQRS por su ID
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static getById = async (req, res) => {
        try {
            const type = await CpcgTypeModel.findById(req.params.id);
            if (type) {
                res.json(CpcgTypeController.buildResponse(
                    true,
                    'Tipo de PQRS encontrado',
                    type
                ));
            } else {
                res.status(404).json(CpcgTypeController.buildResponse(
                    false,
                    'Tipo de PQRS no encontrado'
                ));
            }
        } catch (error) {
            res.status(500).json(CpcgTypeController.buildResponse(
                false,
                'Error al obtener el tipo de PQRS',
                null,
                { error: error.message }
            ));
        }
    }

    /**
     * Crear un nuevo tipo de PQRS
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static create = async (req, res) => {
        try {
            // Valida los campos requeridos
            const validation = CpcgTypeModel.validateFields(req.body);
            if (!validation.isValid) {
                return res.status(400).json(CpcgTypeController.buildResponse(
                    false,
                    'Error de validación',
                    null,
                    { errors: validation.errors }
                ));
            }

            const id = await CpcgTypeModel.create(req.body);
            if (id) {
                const type = await CpcgTypeModel.findById(id);
                res.status(201).json(CpcgTypeController.buildResponse(
                    true,
                    'Tipo de PQRS creado exitosamente',
                    type
                ));
            } else {
                res.status(400).json(CpcgTypeController.buildResponse(
                    false,
                    'Error al crear el tipo de PQRS'
                ));
            }
        } catch (error) {
            res.status(400).json(CpcgTypeController.buildResponse(
                false,
                'Error al crear el tipo de PQRS',
                null,
                { error: error.message }
            ));
        }
    }

    /**
     * Actualiza un tipo de PQRS existente
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static update = async (req, res) => {
        try {
            // Valida los campos requeridos
            const validation = CpcgTypeModel.validateFields(req.body);
            if (!validation.isValid) {
                return res.status(400).json(CpcgTypeController.buildResponse(
                    false,
                    'Error de validación',
                    null,
                    { errors: validation.errors }
                ));
            }

            const type = await CpcgTypeModel.update(req.params.id, req.body);
            if (type) {
                res.json(CpcgTypeController.buildResponse(
                    true,
                    'Tipo de PQRS actualizado exitosamente',
                    type
                ));
            } else {
                res.status(404).json(CpcgTypeController.buildResponse(
                    false,
                    'Tipo de PQRS no encontrado'
                ));
            }
        } catch (error) {
            res.status(400).json(CpcgTypeController.buildResponse(
                false,
                'Error al actualizar el tipo de PQRS',
                null,
                { error: error.message }
            ));
        }
    }

    /**
     * Elimina un tipo de PQRS
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static delete = async (req, res) => {
        try {
            const result = await CpcgTypeModel.delete(req.params.id);
            if (result) {
                res.json(CpcgTypeController.buildResponse(
                    true,
                    'Tipo de PQRS eliminado exitosamente'
                ));
            } else {
                res.status(404).json(CpcgTypeController.buildResponse(
                    false,
                    'Tipo de PQRS no encontrado'
                ));
            }
        } catch (error) {
            res.status(500).json(CpcgTypeController.buildResponse(
                false,
                'Error al eliminar el tipo de PQRS',
                null,
                { error: error.message }
            ));
        }
    }
}

export default CpcgTypeController;
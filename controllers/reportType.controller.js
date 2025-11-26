import ReportTypeModel from '../models/reportType.model.js';

/**
 * Controlador para gestionar los tipos de reportes
 * @class ReportTypeController
 */
class ReportTypeController {
    /**
     * Obtener todos los tipos de reportes
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static async getAll(req, res) {
        try {
            const types = await ReportTypeModel.show();
            res.json(types);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Obtener un tipo de reporte por su ID
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static async getById(req, res) {
        try {
            const type = await ReportTypeModel.findById(req.params.id);
            if (type) {
                res.json(type);
            } else {
                res.status(404).json({ message: 'Tipo de reporte no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Crear un nuevo tipo de reporte
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static async create(req, res) {
        try {
            const id = await ReportTypeModel.create(req.body);
            if (id) {
                const type = await ReportTypeModel.findById(id);
                res.status(201).json(type);
            } else {
                res.status(400).json({ message: 'Error al crear el tipo de reporte' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Actualiza un tipo de reporte existente
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static async update(req, res) {
        try {
            const type = await ReportTypeModel.update(req.params.id, req.body);
            if (type) {
                res.json(type);
            } else {
                res.status(404).json({ message: 'Tipo de reporte no encontrado' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Elimina un tipo de reporte
     * @param {Object} req - Objeto de solicitud
     * @param {Object} res - Objeto de respuesta
     */
    static async delete(req, res) {
        try {
            const result = await ReportTypeModel.delete(req.params.id);
            if (result) {
                res.json({ message: 'Tipo de reporte eliminado exitosamente' });
            } else {
                res.status(404).json({ message: 'Tipo de reporte no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default ReportTypeController;
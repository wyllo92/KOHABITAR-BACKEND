import TariffModel from '../models/tariff.model.js';

/**
 * Controlador para gestionar las tarifas del sistema.
 * Manejar las solicitudes HTTP relacionadas con la creación, consulta, actualización y eliminación de tarifas.
 */
class TariffController {

    /**
     * Registrar una nueva tarifa en el sistema.
     * 
     * @param {Object} req - Objeto de solicitud HTTP con los datos de la tarifa a crear
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta con mensaje de éxito o error
     */
    async register(req, res) {
        try {
            const { name, amount, description, effective_date, status_id } = req.body;

            // Basic validation
            if (!name || !amount) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            // Check if tariff with same name already exists
            const existingTariff = await TariffModel.findByName(name);
            if (existingTariff && existingTariff.length > 0) {
                return res.status(409).json({ error: 'Tariff with this name already exists' });
            }

            const tariffId = await TariffModel.create({
                name,
                description: description || '',
                amount,
                surcharge_amount: 0,
                surcharge_status: 'inactive',
                due_date: effective_date || new Date().toISOString(),
                status_id: status_id || 1
            });

            if (!tariffId) {
                return res.status(500).json({ error: 'Failed to create tariff' });
            }

            return res.status(201).json({
                message: 'Tariff created successfully',
                id: tariffId
            });
        } catch (error) {
            console.error('Error creating tariff:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Obtener todas las tarifas registradas en el sistema.
     * 
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta con la lista de tarifas
     */
    async show(req, res) {
        try {
            const tariffs = await TariffModel.show();
            return res.status(200).json({
                message: 'Tariffs retrieved successfully',
                data: tariffs || []
            });
        } catch (error) {
            console.error('Error retrieving tariffs:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Actualiza una tarifa existente en el sistema.
     * 
     * @param {Object} req - Objeto de solicitud HTTP con los datos a actualizar y el ID en los parámetros
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta con la tarifa actualizada o mensaje de error
     */
    async update(req, res) {
        try {
            const { name, amount, description, due_date, surcharge_amount, surcharge_status, status_id } = req.body;
            const id = req.params.id;

            if (!name || !amount || !id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const existingTariff = await TariffModel.findById(id);
            if (!existingTariff) {
                return res.status(404).json({ error: 'Tariff not found' });
            }

            const updatedTariff = await TariffModel.update(id, {
                name,
                description: description || existingTariff.description,
                amount,
                surcharge_amount: surcharge_amount !== undefined ? surcharge_amount : existingTariff.surcharge_amount,
                surcharge_status: surcharge_status || existingTariff.surcharge_status,
                due_date: due_date || existingTariff.due_date,
                status_id: status_id || existingTariff.status_id
            });

            if (!updatedTariff) {
                return res.status(500).json({ error: 'Failed to update tariff' });
            }

            return res.status(200).json({
                message: 'Tariff updated successfully',
                data: updatedTariff
            });
        } catch (error) {
            console.error('Error updating tariff:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Elimina una tarifa existente del sistema.
     * 
     * @param {Object} req - Objeto de solicitud HTTP con el ID de la tarifa a eliminar
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta con mensaje de éxito o error
     */
    async delete(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            // Check if tariff exists before deletion
            const existingTariff = await TariffModel.findById(id);
            if (!existingTariff) {
                return res.status(404).json({ error: 'Tariff not found' });
            }

            const deleteResult = await TariffModel.delete(id);
            if (!deleteResult) {
                return res.status(500).json({ error: 'Failed to delete tariff' });
            }

            return res.status(200).json({
                message: 'Tariff deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting tariff:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Buscar una tarifa específica por su ID.
     * 
     * @param {Object} req - Objeto de solicitud HTTP con el ID de la tarifa en los parámetros
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta con la tarifa encontrada o mensaje de error
     */
    async findById(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const tariff = await TariffModel.findById(id);
            if (!tariff) {
                return res.status(404).json({ error: 'Tariff not found' });
            }

            return res.status(200).json({
                message: 'Tariff found successfully',
                data: tariff
            });
        } catch (error) {
            console.error('Error finding tariff by ID:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    
    /**
     * Obtener todas las tarifas con estado activo.
     * Método adicional que facilita filtrar solo las tarifas que están actualmente en uso.
     * 
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta con la lista de tarifas activas
     */
    async findActive(req, res) {
        try {
            const activeTariffs = await TariffModel.findActive();
            return res.status(200).json({
                message: 'Active tariffs retrieved successfully',
                data: activeTariffs || []
            });
        } catch (error) {
            console.error('Error retrieving active tariffs:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export default new TariffController();

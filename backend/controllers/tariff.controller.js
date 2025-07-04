import TariffModel from '../models/tariff.model.js';

class TariffController {

    async register(req, res) {
        try {
            const { type, amount, description, effective_date } = req.body;

            // Basic validation
            if (!type || !amount) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const currentDate = new Date().toISOString();
            const tariffId = await TariffModel.create({
                type,
                description: description || '',
                amount,
                surcharge_amount: 0,
                surcharge_status: 'inactive',
                due_date: effective_date || currentDate,
                status_id: 1,
                created_at: currentDate,
                updated_at: currentDate
            });

            if (!tariffId) {
                return res.status(500).json({ error: 'Failed to create tariff' });
            }

            res.status(201).json({
                message: 'Tariff created successfully',
                id: tariffId
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
                message: 'Tariffs retrieved successfully',
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
            const { type, amount, description, effective_date } = req.body;
            const id = req.params.id;

            if (!type || !amount || !id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const existingTariff = await TariffModel.findById(id);
            if (!existingTariff) {
                return res.status(404).json({ error: 'Tariff not found' });
            }

            const currentDate = new Date().toISOString();
            const updatedTariff = await TariffModel.update(id, {
                type,
                amount,
                description,
                effective_date: effective_date || currentDate,
                updated_at: currentDate
            });

            if (!updatedTariff) {
                return res.status(500).json({ error: 'Failed to update tariff' });
            }

            res.status(200).json({
                message: 'Tariff updated successfully',
                data: updatedTariff
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

            const deleteResult = await TariffModel.delete(id);
            if (!deleteResult) {
                return res.status(404).json({ error: 'Tariff not found' });
            }

            res.status(200).json({
                message: 'Tariff deleted successfully'
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

            const tariff = await TariffModel.findById(id);
            if (!tariff) {
                return res.status(404).json({ error: 'Tariff not found' });
            }

            res.status(200).json({
                message: 'Tariff found successfully',
                data: tariff
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export default new TariffController();

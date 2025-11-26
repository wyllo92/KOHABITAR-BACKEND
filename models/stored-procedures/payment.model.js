import BaseStoredProcedure from './base.model.js';

/**
 * Clase para manejar los procedimientos almacenados relacionados con pagos
 * @extends BaseStoredProcedure
 */
class PaymentProcedures extends BaseStoredProcedure {
    /**
     * Obtener los pagos pendientes de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Array>} - Lista de pagos pendientes
     */
    static async getPendingPayments(userId) {
        // Valida que el userId esté presente
        this.validateParameters({ userId }, ['userId']);

        // Ejecuta el procedimiento almacenado
        return await this.executeProcedure('sp_get_pending_payments', { in_user_id: userId });
    }

    /**
     * Calcula el monto total pendiente de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<number>} - Monto total pendiente
     */
    static async getTotalPendingAmount(userId) {
        const pendingPayments = await this.getPendingPayments(userId);
        return pendingPayments.reduce((total, payment) => total + Number(payment.amount), 0);
    }

    /**
     * Obtener los pagos pendientes próximos a vencer
     * @param {number} userId - ID del usuario
     * @param {number} daysThreshold - Días hasta vencimiento
     * @returns {Promise<Array>} - Lista de pagos próximos a vencer
     */
    static async getUpcomingDuePayments(userId, daysThreshold = 7) {
        const pendingPayments = await this.getPendingPayments(userId);
        const now = new Date();
        const thresholdDate = new Date(now.setDate(now.getDate() + daysThreshold));

        return pendingPayments.filter(payment => {
            const dueDate = new Date(payment.due_date);
            return dueDate <= thresholdDate;
        });
    }

    /**
     * Agrupa los pagos pendientes por tipo de tarifa
     * @param {number} userId - ID del usuario
     * @returns {Promise<Object>} - Pagos agrupados por tipo de tarifa
     */
    static async getPendingPaymentsByTariffType(userId) {
        const pendingPayments = await this.getPendingPayments(userId);
        const grouped = {};

        pendingPayments.forEach(payment => {
            if (!grouped[payment.tariff_name]) {
                grouped[payment.tariff_name] = {
                    total: 0,
                    payments: []
                };
            }
            grouped[payment.tariff_name].payments.push(payment);
            grouped[payment.tariff_name].total += Number(payment.amount);
        });

        return grouped;
    }
}

export default PaymentProcedures;
import BaseStoredProcedure from './base.model.js';

/**
 * Clase que maneja los procedimientos almacenados relacionados con pagos
 */
class PaymentProcedures extends BaseStoredProcedure {
    /**
     * Obtener todos los pagos pendientes de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Array>} - Lista de pagos pendientes
     */
    static async getPendingPayments(userId) {
        this.validateParameters({ userId }, ['userId']);
        return await this.executeProcedure('sp_get_pending_payments', { userId });
    }

    /**
     * Obtener el monto total pendiente de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<number>} - Monto total pendiente
     */
    static async getTotalPendingAmount(userId) {
        this.validateParameters({ userId }, ['userId']);
        return await this.executeProcedure('sp_get_total_pending_amount', { userId });
    }

    /**
     * Registrar un nuevo pago
     * @param {Object} paymentData - Datos del pago
     * @param {number} paymentData.userId - ID del usuario que realiza el pago
     * @param {number} paymentData.amount - Monto del pago
     * @param {string} paymentData.paymentMethod - Método de pago
     * @param {string} paymentData.reference - Referencia del pago
     * @returns {Promise<Object>} - Detalles del pago registrado
     */
    static async registerPayment(paymentData) {
        const requiredFields = ['userId', 'amount', 'paymentMethod', 'reference'];
        this.validateParameters(paymentData, requiredFields);
        return await this.executeProcedure('sp_register_payment', paymentData);
    }

    /**
     * Obtener el historial de pagos de un usuario
     * @param {number} userId - ID del usuario
     * @param {Date} startDate - Fecha inicial del rango
     * @param {Date} endDate - Fecha final del rango
     * @returns {Promise<Array>} - Historial de pagos
     */
    static async getPaymentHistory(userId, startDate = null, endDate = null) {
        this.validateParameters({ userId }, ['userId']);
        return await this.executeProcedure('sp_get_payment_history', { 
            userId, 
            startDate, 
            endDate 
        });
    }

    /**
     * Anula un pago específico
     * @param {number} paymentId - ID del pago a anular
     * @param {string} reason - Razón de la anulación
     * @param {number} userId - ID del usuario que realiza la anulación
     * @returns {Promise<Object>} - Resultado de la anulación
     */
    static async voidPayment(paymentId, reason, userId) {
        const params = { paymentId, reason, userId };
        this.validateParameters(params, ['paymentId', 'reason', 'userId']);
        return await this.executeProcedure('sp_void_payment', params);
    }

    /**
     * Verificar si un pago específico ya fue procesado
     * @param {string} reference - Referencia única del pago
     * @returns {Promise<boolean>} - true si el pago ya existe, false si no
     */
    static async isPaymentProcessed(reference) {
        this.validateParameters({ reference }, ['reference']);
        return await this.executeProcedure('sp_check_payment_processed', { reference });
    }

    /**
     * Genera un reporte de pagos por período
     * @param {Date} startDate - Fecha inicial del período
     * @param {Date} endDate - Fecha final del período
     * @param {string} [groupBy='day'] - Agrupación ('day', 'week', 'month')
     * @returns {Promise<Array>} - Reporte de pagos
     */
    static async generatePaymentReport(startDate, endDate, groupBy = 'day') {
        const params = { startDate, endDate, groupBy };
        this.validateParameters(params, ['startDate', 'endDate']);
        return await this.executeProcedure('sp_generate_payment_report', params);
    }

    /**
     * Actualiza el estado de un pago
     * @param {number} paymentId - ID del pago
     * @param {string} status - Nuevo estado del pago
     * @param {string} [notes] - Notas adicionales sobre el cambio
     * @returns {Promise<Object>} - Pago actualizado
     */
    static async updatePaymentStatus(paymentId, status, notes = null) {
        const params = { paymentId, status, notes };
        this.validateParameters(params, ['paymentId', 'status']);
        return await this.executeProcedure('sp_update_payment_status', params);
    }
}

export default PaymentProcedures;

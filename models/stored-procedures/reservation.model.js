import BaseStoredProcedure from './base.model.js';

/**
 * Clase para manejar los procedimientos almacenados relacionados con reservaciones
 * @extends BaseStoredProcedure
 */
class ReservationProcedures extends BaseStoredProcedure {
    /**
     * Obtener las reservaciones de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Array>} - Lista de reservaciones del usuario
     */
    static async getUserReservations(userId) {
        // Valida que el userId esté presente
        this.validateParameters({ userId }, ['userId']);

        // Ejecuta el procedimiento almacenado
        return await this.executeProcedure('sp_get_user_reservations', { in_user_id: userId });
    }

    /**
     * Obtener las reservaciones activas de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Array>} - Lista de reservaciones activas
     */
    static async getActiveReservations(userId) {
        const reservations = await this.getUserReservations(userId);
        return reservations.filter(r => r.status_name === 'Activo');
    }

    /**
     * Obtener las reservaciones futuras de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Array>} - Lista de reservaciones futuras
     */
    static async getFutureReservations(userId) {
        const reservations = await this.getUserReservations(userId);
        const now = new Date();
        return reservations.filter(r => new Date(r.start_time) > now);
    }

    /**
     * Verificar si un usuario tiene reservaciones activas para una zona común
     * @param {number} userId - ID del usuario
     * @param {string} amenityName - Nombre de la zona común
     * @returns {Promise<boolean>} - true si tiene reservaciones activas, false si no
     */
    static async hasActiveReservationForAmenity(userId, amenityName) {
        const activeReservations = await this.getActiveReservations(userId);
        return activeReservations.some(r => r.amenity_name === amenityName);
    }
}

export default ReservationProcedures;
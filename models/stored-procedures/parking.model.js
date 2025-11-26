import BaseStoredProcedure from './base.model.js';

/**
 * Clase para manejar los procedimientos almacenados relacionados con estacionamiento
 * @extends BaseStoredProcedure
 */
class ParkingProcedures extends BaseStoredProcedure {
    /**
     * Obtener la disponibilidad de espacios de estacionamiento en una zona
     * @param {number} zoneId - ID de la zona de estacionamiento
     * @returns {Promise<Array>} - Lista de espacios disponibles
     */
    static async getParkingAvailability(zoneId) {
        // Valida que el zoneId esté presente
        this.validateParameters({ zoneId }, ['zoneId']);

        // Ejecuta el procedimiento almacenado
        return await this.executeProcedure('sp_get_parking_availability', { in_zone_id: zoneId });
    }

    /**
     * Verificar si un espacio específico está disponible
     * @param {number} zoneId - ID de la zona de estacionamiento
     * @param {string} slotCode - Código del espacio
     * @returns {Promise<boolean>} - true si está disponible, false si no
     */
    static async isSlotAvailable(zoneId, slotCode) {
        const availableSlots = await this.getParkingAvailability(zoneId);
        return availableSlots.some(slot => slot.code === slotCode && slot.status_name === 'Disponible');
    }

    /**
     * Cuenta los espacios disponibles en una zona
     * @param {number} zoneId - ID de la zona de estacionamiento
     * @returns {Promise<number>} - Número de espacios disponibles
     */
    static async countAvailableSlots(zoneId) {
        const availableSlots = await this.getParkingAvailability(zoneId);
        return availableSlots.length;
    }
}

export default ParkingProcedures;
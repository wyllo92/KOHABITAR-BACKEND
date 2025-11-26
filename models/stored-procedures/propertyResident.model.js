import BaseStoredProcedure from './base.model.js';

/**
 * Clase para manejar los procedimientos almacenados relacionados con residentes de propiedades
 * @extends BaseStoredProcedure
 */
class PropertyResidentProcedures extends BaseStoredProcedure {
    /**
     * Obtener los residentes de una propiedad
     * @param {number} propertyId - ID de la propiedad
     * @returns {Promise<Array>} - Lista de residentes
     */
    static async getPropertyResidents(propertyId) {
        // Valida que el propertyId esté presente
        this.validateParameters({ propertyId }, ['propertyId']);

        // Ejecuta el procedimiento almacenado
        return await this.executeProcedure('sp_get_property_residents', { in_property_id: propertyId });
    }

    /**
     * Obtener los residentes con un rol específico en una propiedad
     * @param {number} propertyId - ID de la propiedad
     * @param {string} roleName - Nombre del rol a filtrar
     * @returns {Promise<Array>} - Lista de residentes con el rol especificado
     */
    static async getResidentsByRole(propertyId, roleName) {
        const residents = await this.getPropertyResidents(propertyId);
        return residents.filter(r => r.role_name === roleName);
    }

    /**
     * Buscar residentes por nombre en una propiedad
     * @param {number} propertyId - ID de la propiedad
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<Array>} - Lista de residentes que coinciden con la búsqueda
     */
    static async searchResidentsByName(propertyId, searchTerm) {
        const residents = await this.getPropertyResidents(propertyId);
        const searchLower = searchTerm.toLowerCase();
        return residents.filter(r => 
            r.full_name.toLowerCase().includes(searchLower)
        );
    }

    /**
     * Obtener la información de contacto de los residentes
     * @param {number} propertyId - ID de la propiedad
     * @returns {Promise<Array>} - Lista de contactos de residentes
     */
    static async getResidentsContactInfo(propertyId) {
        const residents = await this.getPropertyResidents(propertyId);
        return residents.map(r => ({
            userId: r.user_id,
            fullName: r.full_name,
            phone: r.phone,
            email: r.email
        }));
    }
}

export default PropertyResidentProcedures;
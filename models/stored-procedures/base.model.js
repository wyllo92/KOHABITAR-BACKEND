import { connect } from '../../config/db/connectMysql.js';

/**
 * Clase base para procedimientos almacenados.
 * Proporciona funcionalidad común para la ejecución de procedimientos almacenados
 * en la base de datos de manera segura y consistente.
 */
class BaseStoredProcedure {
    /**
     * Ejecuta un procedimiento almacenado con los parámetros proporcionados.
     * 
     * @param {string} procedureName - Nombre del procedimiento almacenado
     * @param {Object} parameters - Parámetros para el procedimiento
     * @returns {Promise<Array>} Resultado del procedimiento o array vacío si hay un error
     */
    static async executeProcedure(procedureName, parameters = {}) {
        try {
            // Construye la cadena de parámetros y el array de valores
            const paramPlaceholders = Object.keys(parameters)
                .map(() => '?')
                .join(',');
            const paramValues = Object.values(parameters);

            // Ejecuta el procedimiento
            const [results] = await connect.query(
                `CALL ${procedureName}(${paramPlaceholders})`,
                paramValues
            );

            return results[0] || [];
        } catch (error) {
            console.error(`Error ejecutando procedimiento ${procedureName}:`, error);
            return [];
        }
    }

    /**
     * Valida que los parámetros requeridos estén presentes
     * @param {Object} parameters - Parámetros proporcionados
     * @param {Array<string>} required - Lista de parámetros requeridos
     */
    static validateParameters(parameters, required) {
        for (const param of required) {
            if (parameters[param] === undefined) {
                throw new Error(`Parámetro requerido faltante: ${param}`);
            }
        }
    }
}

export default BaseStoredProcedure;

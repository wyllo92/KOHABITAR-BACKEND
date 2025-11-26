import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar los tipos de reportes en la base de datos.
 * Proporciona métodos para crear, consultar, actualizar y eliminar tipos de reportes,
 * facilitando la categorización de los reportes en el sistema.
 */
class ReportTypeModel {
    /**
     * Crear un nuevo tipo de reporte en la base de datos.
     * 
     * @param {Object} typeData - Datos del tipo de reporte a crear
     * @param {string} typeData.name - Nombre del tipo de reporte
     * @param {string} typeData.description - Descripción detallada del tipo de reporte
     * @returns {number|null} ID del tipo de reporte creado o null si hay un error
     */
    static async create({ name, description }) {
        try {
            const sqlQuery = `
                INSERT INTO report_types (name, description)
                VALUES (?, ?)
            `;
            const [result] = await connect.query(sqlQuery, [name, description]);
            return result.insertId;
        } catch (error) {
            console.error('Error creando tipo de reporte:', error);
            return null;
        }
    }

    /**
     * Obtener todos los tipos de reportes registrados en el sistema.
     * 
     * @returns {Array} Lista de tipos de reportes o array vacío si hay un error
     */
    static async show() {
        try {
            const sqlQuery = `
                SELECT * FROM report_types 
                ORDER BY report_type_id
            `;
            const [result] = await connect.query(sqlQuery);
            return result;
        } catch (error) {
            console.error('Error mostrando tipos de reportes:', error);
            return [];
        }
    }

    /**
     * Actualiza un tipo de reporte existente.
     * 
     * @param {number} id - ID del tipo de reporte a actualizar
     * @param {Object} typeData - Datos actualizados del tipo de reporte
     * @returns {Object|null} Tipo de reporte actualizado o null si hay un error
     */
    static async update(id, { name, description }) {
        try {
            const sqlQuery = `
                UPDATE report_types 
                SET name = ?, 
                    description = ?
                WHERE report_type_id = ?
            `;
            const [result] = await connect.query(sqlQuery, [name, description, id]);
            return result.affectedRows > 0 ? this.findById(id) : null;
        } catch (error) {
            console.error('Error actualizando tipo de reporte:', error);
            return null;
        }
    }

    /**
     * Elimina un tipo de reporte de la base de datos.
     * 
     * @param {number} id - ID del tipo de reporte a eliminar
     * @returns {boolean} true si se eliminó correctamente, false si hubo un error
     */
    static async delete(id) {
        try {
            const sqlQuery = `
                DELETE FROM report_types 
                WHERE report_type_id = ?
            `;
            const [result] = await connect.query(sqlQuery, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error eliminando tipo de reporte:', error);
            return false;
        }
    }

    /**
     * Buscar un tipo de reporte por su ID.
     * 
     * @param {number} id - ID del tipo de reporte a buscar
     * @returns {Object|null} Tipo de reporte encontrado o null si no existe
     */
    static async findById(id) {
        try {
            const sqlQuery = `
                SELECT * FROM report_types 
                WHERE report_type_id = ?
            `;
            const [result] = await connect.query(sqlQuery, [id]);
            return result[0] || null;
        } catch (error) {
            console.error('Error buscando tipo de reporte por ID:', error);
            return null;
        }
    }

    /**
     * Buscar un tipo de reporte por su nombre.
     * 
     * @param {string} name - Nombre del tipo de reporte a buscar
     * @returns {Object|null} Tipo de reporte encontrado o null si no existe
     */
    static async findByName(name) {
        try {
            const sqlQuery = `
                SELECT * FROM report_types 
                WHERE name = ?
            `;
            const [result] = await connect.query(sqlQuery, [name]);
            return result[0] || null;
        } catch (error) {
            console.error('Error buscando tipo de reporte por nombre:', error);
            return null;
        }
    }
}

export default ReportTypeModel;
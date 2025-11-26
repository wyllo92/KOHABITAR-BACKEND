import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar las operaciones de reportes en la base de datos.
 * Proporciona métodos para crear, consultar, actualizar y eliminar reportes,
 * así como para realizar búsquedas por diferentes criterios como usuario, tipo, estado y rango de fechas.
 */
class ReportModel {

  /**
   * Crear un nuevo reporte en la base de datos.
   * 
   * @param {Object} reportData - Datos del reporte a crear
   * @param {number} reportData.user_id - ID del usuario que crea el reporte
   * @param {string} reportData.title - Título del reporte
   * @param {string} reportData.description - Descripción detallada del reporte
   * @param {number} reportData.report_type_id - ID del tipo de reporte
   * @param {number} reportData.status_id - ID del estado inicial del reporte
   * @param {string} reportData.file_url - URL del archivo adjunto (si existe)
   * @param {string} reportData.created_at - Fecha de creación del reporte
   * @returns {number|null} ID del reporte creado o null si hay un error
   */
  static async create({ user_id, title, description, report_type_id, status_id, file_url, created_at }) {
    try {
      let sqlQuery = `
        INSERT INTO reports (
          user_id, 
          title, 
          description, 
          report_type_id, 
          status_id, 
          file_url, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?);
      `;
      const [result] = await connect.query(sqlQuery, [user_id, title, description, report_type_id, status_id, file_url, created_at]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating report:', error);
      return null;
    }
  }

  /**
   * Obtener todos los reportes existentes en el sistema con información relacionada.
   * Incluye datos del usuario que reportó, tipo de reporte y estado actual.
   * 
   * @returns {Array} Lista de reportes con información detallada o array vacío si hay un error
   */
  static async show() {
    try {
      let sqlQuery = `
        SELECT r.*, 
               u.username, 
               p.full_name, 
               rt.name as report_type_name, 
               s.name as status_name 
        FROM reports r 
        LEFT JOIN users u ON r.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN report_types rt ON r.report_type_id = rt.report_type_id 
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        ORDER BY r.report_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error retrieving reports:', error);
      return [];
    }
  }

  /**
   * Actualiza los datos de un reporte existente.
   * 
   * @param {number} id - ID del reporte a actualizar
   * @param {Object} reportData - Nuevos datos del reporte
   * @param {number} reportData.user_id - ID del usuario
   * @param {string} reportData.title - Nuevo título del reporte
   * @param {string} reportData.description - Nueva descripción del reporte
   * @param {number} reportData.report_type_id - Nuevo ID del tipo de reporte
   * @param {number} reportData.status_id - Nuevo ID del estado del reporte
   * @param {string} reportData.file_url - Nueva URL del archivo adjunto
   * @returns {Object|null} Reporte actualizado o null si hay un error
   */
  static async update(id, { user_id, title, description, report_type_id, status_id, file_url }) {
    try {
      let sqlQuery = `
        UPDATE reports 
        SET user_id = ?, 
            title = ?, 
            description = ?, 
            report_type_id = ?, 
            status_id = ?, 
            file_url = ?,
            updated_at = CURRENT_TIMESTAMP 
        WHERE report_id = ?;
      `;
      const [result] = await connect.query(sqlQuery, [user_id, title, description, report_type_id, status_id, file_url, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating report:', error);
      return null;
    }
  }

  /**
   * Elimina un reporte de la base de datos.
   * 
   * @param {number} id - ID del reporte a eliminar
   * @returns {boolean} true si se eliminó correctamente, false si hubo un error
   */
  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM reports WHERE report_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting report:', error);
      return false;
    }
  }

  /**
   * Buscar un reporte por su ID y retorna información detallada.
   * 
   * @param {number} id - ID del reporte a buscar
   * @returns {Object|null} Datos del reporte con información relacionada o null si no se encuentra
   */
  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT r.*, 
               u.username, 
               p.full_name, 
               rt.name as report_type_name, 
               s.name as status_name 
        FROM reports r 
        LEFT JOIN users u ON r.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN report_types rt ON r.report_type_id = rt.report_type_id 
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        WHERE r.report_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding report by ID:', error);
      return null;
    }
  }

  /**
   * Buscar todos los reportes creados por un usuario específico.
   * 
   * @param {number} user_id - ID del usuario cuyos reportes se desean encontrar
   * @returns {Array} Lista de reportes del usuario con información detallada o array vacío si no hay reportes
   */
  static async findByUserId(user_id) {
    try {
      let sqlQuery = `
        SELECT r.*, 
               u.username, 
               p.full_name, 
               rt.name as report_type_name, 
               s.name as status_name 
        FROM reports r 
        LEFT JOIN users u ON r.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN report_types rt ON r.report_type_id = rt.report_type_id 
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        WHERE r.user_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [user_id]);
      return result;
    } catch (error) {
      console.error('Error finding reports by user ID:', error);
      return [];
    }
  }

  /**
   * Buscar reportes según su tipo.
   * 
   * @param {number} report_type_id - ID del tipo de reporte a buscar
   * @returns {Array} Lista de reportes del tipo especificado o array vacío si no hay reportes
   */
  static async findByType(report_type_id) {
    try {
      let sqlQuery = `
        SELECT r.*, 
               u.username, 
               p.full_name, 
               rt.name as report_type_name, 
               s.name as status_name 
        FROM reports r 
        LEFT JOIN users u ON r.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN report_types rt ON r.report_type_id = rt.report_type_id 
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        WHERE r.report_type_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [report_type_id]);
      return result;
    } catch (error) {
      console.error('Error finding reports by type:', error);
      return [];
    }
  }

  /**
   * Buscar reportes según su estado actual.
   * 
   * @param {number} status_id - ID del estado a filtrar
   * @returns {Array} Lista de reportes con el estado especificado o array vacío si no hay reportes
   */
  static async findByStatus(status_id) {
    try {
      let sqlQuery = `
        SELECT r.*, 
               u.username, 
               p.full_name, 
               rt.name as report_type_name, 
               s.name as status_name 
        FROM reports r 
        LEFT JOIN users u ON r.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN report_types rt ON r.report_type_id = rt.report_type_id 
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        WHERE r.status_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [status_id]);
      return result;
    } catch (error) {
      console.error('Error finding reports by status:', error);
      return [];
    }
  }

  /**
   * Buscar reportes creados dentro de un rango de fechas específico.
   * 
   * @param {string} start_date - Fecha de inicio del rango (formato YYYY-MM-DD)
   * @param {string} end_date - Fecha de fin del rango (formato YYYY-MM-DD)
   * @returns {Array} Lista de reportes dentro del rango de fechas o array vacío si no hay reportes
   */
  static async findByDateRange(start_date, end_date) {
    try {
      let sqlQuery = `
        SELECT r.*, 
               u.username, 
               p.full_name, 
               rt.name as report_type_name, 
               s.name as status_name 
        FROM reports r 
        LEFT JOIN users u ON r.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN report_types rt ON r.report_type_id = rt.report_type_id 
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        WHERE r.created_at BETWEEN ? AND ?
      `;
      const [result] = await connect.query(sqlQuery, [start_date, end_date]);
      return result;
    } catch (error) {
      console.error('Error finding reports by date range:', error);
      return [];
    }
  }

  /**
   * Buscar reportes que contengan cierto texto en el título.
   * Realiza una búsqueda parcial (LIKE) para encontrar coincidencias.
   * 
   * @param {string} title - Texto a buscar en el título de los reportes
   * @returns {Array} Lista de reportes con coincidencias en el título o array vacío si no hay coincidencias
   */
  static async findByTitle(title) {
    try {
      let sqlQuery = `
        SELECT r.*, 
               u.username, 
               p.full_name, 
               rt.name as report_type_name, 
               s.name as status_name 
        FROM reports r 
        LEFT JOIN users u ON r.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN report_types rt ON r.report_type_id = rt.report_type_id 
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        WHERE r.title LIKE ?
      `;
      const [result] = await connect.query(sqlQuery, [`%${title}%`]);
      return result;
    } catch (error) {
      console.error('Error finding reports by title:', error);
      return [];
    }
  }

  /**
   * Obtener todos los reportes con estado pendiente (status_id = 3).
   * Este método es útil para mostrar los reportes que requieren atención.
   * 
   * @returns {Array} Lista de reportes pendientes o array vacío si no hay reportes pendientes
   */
  static async findPending() {
    try {
      let sqlQuery = `
        SELECT r.*, 
               u.username, 
               p.full_name, 
               rt.name as report_type_name, 
               s.name as status_name 
        FROM reports r 
        LEFT JOIN users u ON r.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN report_types rt ON r.report_type_id = rt.report_type_id 
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        WHERE r.status_id = 3
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error finding pending reports:', error);
      return [];
    }
  }
}

export default ReportModel; 
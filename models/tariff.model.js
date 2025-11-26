import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para la gestión de tarifas en el sistema.
 * Proporciona métodos para crear, consultar, actualizar y eliminar registros de tarifas,
 * así como búsquedas específicas por diferentes criterios.
 */
class TariffModel {

  /**
   * Crear un nuevo registro de tarifa en la base de datos.
   * 
   * @param {Object} params - Parámetros de la tarifa
   * @param {string} params.name - Nombre de la tarifa
   * @param {string} params.description - Descripción detallada de la tarifa
   * @param {number} params.amount - Monto principal de la tarifa
   * @param {number} params.surcharge_amount - Monto del recargo (si aplica)
   * @param {string} params.surcharge_status - Estado del recargo ('Activo' o 'Inactivo')
   * @param {Date} params.due_date - Fecha de vencimiento de la tarifa
   * @param {number} params.status_id - ID del estado (referencia a la tabla statuses)
   * @returns {number|null} El ID del registro creado o null si ocurre un error
   */
  static async create({ name, description, amount, surcharge_amount, surcharge_status, due_date, status_id }) {
    try {
      let sqlQuery = `
        INSERT INTO tariffs (
          name, 
          description, 
          amount, 
          surcharge_amount, 
          surcharge_status, 
          due_date, 
          status_id, 
          created_at, 
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const [result] = await connect.query(sqlQuery, [
        name, 
        description, 
        amount, 
        surcharge_amount, 
        surcharge_status, 
        due_date, 
        status_id
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating tariff:', error);
      return null;
    }
  }

  /**
   * Obtener todas las tarifas almacenadas en el sistema.
   * Realiza un JOIN con la tabla de estados para incluir el nombre del estado.
   * 
   * @returns {Array} Lista de tarifas ordenadas por ID o un array vacío en caso de error
   */
  static async show() {
    try {
      let sqlQuery = `
        SELECT t.*, 
               s.name AS status_name 
        FROM tariffs t 
        LEFT JOIN statuses s ON t.status_id = s.status_id 
        ORDER BY t.tariff_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing tariffs:', error);
      return [];
    }
  }

  /**
   * Actualiza un registro de tarifa existente en la base de datos.
   * 
   * @param {number} id - ID de la tarifa a actualizar
   * @param {Object} params - Parámetros a actualizar
   * @param {string} params.name - Nuevo nombre de la tarifa
   * @param {string} params.description - Nueva descripción de la tarifa
   * @param {number} params.amount - Nuevo monto de la tarifa
   * @param {number} params.surcharge_amount - Nuevo monto de recargo
   * @param {string} params.surcharge_status - Nuevo estado del recargo
   * @param {Date} params.due_date - Nueva fecha de vencimiento
   * @param {number} params.status_id - Nuevo ID de estado
   * @returns {Object|null} El registro actualizado o null si ocurre un error o no se encuentra
   */
  static async update(id, { name, description, amount, surcharge_amount, surcharge_status, due_date, status_id }) {
    try {
      let sqlQuery = `
        UPDATE tariffs 
        SET name = ?, 
            description = ?, 
            amount = ?, 
            surcharge_amount = ?, 
            surcharge_status = ?, 
            due_date = ?, 
            status_id = ?, 
            updated_at = NOW() 
        WHERE tariff_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [
        name, 
        description, 
        amount, 
        surcharge_amount, 
        surcharge_status, 
        due_date, 
        status_id, 
        id
      ]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating tariff:', error);
      return null;
    }
  }

  /**
   * Elimina un registro de tarifa de la base de datos.
   * 
   * @param {number} id - ID de la tarifa a eliminar
   * @returns {boolean} true si la eliminación fue exitosa, false en caso contrario
   */
  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM tariffs WHERE tariff_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting tariff:', error);
      return false;
    }
  }

  /**
   * Buscar una tarifa específica por su ID.
   * 
   * @param {number} id - ID de la tarifa a buscar
   * @returns {Object|null} El registro de la tarifa o null si no se encuentra
   */
  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT t.*, 
               s.name AS status_name 
        FROM tariffs t 
        LEFT JOIN statuses s ON t.status_id = s.status_id 
        WHERE t.tariff_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding tariff by ID:', error);
      return null;
    }
  }

  /**
   * Buscar tarifas por nombre exacto.
   * 
   * @param {string} name - Nombre de la tarifa a buscar
   * @returns {Array} Lista de tarifas que coinciden con el nombre o array vacío si no hay coincidencias
   */
  static async findByName(name) {
    try {
      let sqlQuery = `
        SELECT t.*, 
               s.name AS status_name 
        FROM tariffs t 
        LEFT JOIN statuses s ON t.status_id = s.status_id 
        WHERE t.name = ?
      `;
      const [result] = await connect.query(sqlQuery, [name]);
      return result;
    } catch (error) {
      console.error('Error finding tariff by name:', error);
      return [];
    }
  }

  /**
   * Buscar tarifas por ID de estado.
   * 
   * @param {number} status_id - ID del estado por el cual filtrar
   * @returns {Array} Lista de tarifas que tienen el estado especificado
   */
  static async findByStatus(status_id) {
    try {
      let sqlQuery = `
        SELECT t.*, 
               s.name AS status_name 
        FROM tariffs t 
        LEFT JOIN statuses s ON t.status_id = s.status_id 
        WHERE t.status_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [status_id]);
      return result;
    } catch (error) {
      console.error('Error finding tariffs by status:', error);
      return [];
    }
  }

  /**
   * Obtener todas las tarifas con estado activo.
   * 
   * @returns {Array} Lista de tarifas activas o array vacío si no hay coincidencias o ocurre un error
   */
  static async findActive() {
    try {
      let sqlQuery = `
        SELECT t.*, 
               s.name AS status_name 
        FROM tariffs t 
        LEFT JOIN statuses s ON t.status_id = s.status_id 
        WHERE s.name = 'Activo'
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error finding active tariffs:', error);
      return [];
    }
  }

  /**
   * Buscar tarifas dentro de un rango de montos específico.
   * 
   * @param {number} min_amount - Monto mínimo del rango de búsqueda
   * @param {number} max_amount - Monto máximo del rango de búsqueda
   * @returns {Array} Lista de tarifas dentro del rango especificado
   */
  static async findByAmountRange(min_amount, max_amount) {
    try {
      let sqlQuery = `
        SELECT t.*, 
               s.name AS status_name 
        FROM tariffs t 
        LEFT JOIN statuses s ON t.status_id = s.status_id 
        WHERE t.amount BETWEEN ? AND ?
      `;
      const [result] = await connect.query(sqlQuery, [min_amount, max_amount]);
      return result;
    } catch (error) {
      console.error('Error finding tariffs by amount range:', error);
      return [];
    }
  }
}

export default TariffModel; 
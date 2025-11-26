import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar las operaciones de reservas en la base de datos.
 * Proporciona métodos para crear, consultar, actualizar y eliminar reservas,
 * así como para realizar búsquedas por diferentes criterios como usuario, zona común o estado.
 */
class ReservationModel {
  /**
   * Crear una nueva reserva en la base de datos.
   * 
   * @param {Object} reservationData - Datos de la reserva a crear
   * @param {number} reservationData.amenity_id - ID de la zona común a reservar
   * @param {number} reservationData.user_id - ID del usuario que realiza la reserva
   * @param {number} reservationData.status_id - ID del estado inicial de la reserva
   * @param {number} reservationData.tariff_id - ID de la tarifa aplicable
   * @param {string} reservationData.start_time - Fecha y hora de inicio (formato YYYY-MM-DD HH:MM:SS)
   * @param {string} reservationData.end_time - Fecha y hora de fin (formato YYYY-MM-DD HH:MM:SS)
   * @param {number} reservationData.capacity - Cantidad de personas para la reserva
   * @param {string} reservationData.notes - Notas adicionales sobre la reserva
   * @param {string} reservationData.cancellation_reason - Motivo de cancelación (si aplica)
   * @returns {number|null} ID de la reserva creada o null si hay un error
   */
  static async create({ amenity_id, user_id, status_id, tariff_id, start_time, end_time, capacity }) {
    try {

      const sqlQuery = `INSERT INTO reservations (amenity_id, user_id, status_id, tariff_id, start_time, end_time, capacity)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`;

      const [result] = await connect.query(sqlQuery, [
        amenity_id,
        user_id,
        status_id,
        tariff_id,
        start_time,
        end_time,
        capacity
      ]);

      return result.insertId;
    } catch (error) {
      console.error('Error al crear reserva:', error);
      return null;
    }
  }

  /**
   * Obtener todas las reservas existentes en el sistema con información relacionada.
   * Incluye datos de la zona común, tipo de zona común, usuario, perfil, estado y tarifa.
   * Los resultados se ordenan por fecha de inicio en orden descendente.
   * 
   * @returns {Array} Lista de reservas con información detallada o array vacío si hay un error
   */
  static async show() {
    try {
      const sqlQuery = `
        SELECT r.*, 
               a.name as amenity_name, 
               at.name as amenity_type_name,
               u.username, 
               p.full_name,
               s.name as status_name,
               t.name as tariff_name,
               t.amount as tariff_amount
        FROM reservations r 
        LEFT JOIN amenities a ON r.amenity_id = a.amenity_id 
        LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id
        LEFT JOIN users u ON r.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        LEFT JOIN tariffs t ON r.tariff_id = t.tariff_id
        ORDER BY r.start_time DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing reservations:', error);
      return [];
    }
  }

  /**
   * Buscar una reserva específica por su ID.
   * Incluye información detallada relacionada con la reserva como datos de la zona común,
   * tipo de zona común, usuario, perfil, estado y tarifa.
   * 
   * @param {number} id - ID de la reserva a buscar
   * @returns {Object|null} Información detallada de la reserva o null si no se encuentra
   */
  static async findById(id) {
    try {
      const sqlQuery = `
        SELECT r.*, 
               a.name as amenity_name, 
               at.name as amenity_type_name,
               u.username, 
               p.full_name,
               s.name as status_name,
               t.name as tariff_name,
               t.amount as tariff_amount
        FROM reservations r 
        LEFT JOIN amenities a ON r.amenity_id = a.amenity_id 
        LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id
        LEFT JOIN users u ON r.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        LEFT JOIN tariffs t ON r.tariff_id = t.tariff_id
        WHERE r.reservation_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      console.error('Error finding reservation by ID:', error);
      return null;
    }
  }

  /**
   * Actualiza los datos de una reserva existente.
   *
   * @param {number} id - ID de la reserva a actualizar
   * @param {Object} reservationData - Nuevos datos de la reserva
   * @param {number} reservationData.amenity_id - ID de la zona común
   * @param {number} reservationData.user_id - ID del usuario
   * @param {number} reservationData.status_id - ID del estado
   * @param {number} reservationData.tariff_id - ID de la tarifa
   * @param {string} reservationData.start_time - Nueva fecha y hora de inicio
   * @param {string} reservationData.end_time - Nueva fecha y hora de fin
   * @param {number} reservationData.capacity - Nueva cantidad de personas
   * @returns {Object|null} Reserva actualizada o null si hay un error
   */
  static async update(id, { amenity_id, user_id, status_id, tariff_id, start_time, end_time, capacity }) {
    try {
      const sqlQuery = `UPDATE reservations SET
                        amenity_id = ?,
                        user_id = ?,
                        status_id = ?,
                        tariff_id = ?,
                        start_time = ?,
                        end_time = ?,
                        capacity = ?
                        WHERE reservation_id = ?`;
      const [result] = await connect.query(sqlQuery, [
        amenity_id, user_id, status_id, tariff_id, start_time, end_time,
        capacity, id
      ]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating reservation:', error);
      return null;
    }
  }

  /**
   * Elimina una reserva de la base de datos.
   * 
   * @param {number} id - ID de la reserva a eliminar
   * @returns {boolean} true si se eliminó correctamente, false si hubo un error
   */
  static async delete(id) {
    try {
      const sqlQuery = `DELETE FROM reservations WHERE reservation_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      return false;
    }
  }
  
  /**
   * Buscar todas las reservas realizadas por un usuario específico.
   * 
   * @param {number} user_id - ID del usuario cuyos reservas se desean encontrar
   * @returns {Array} Lista de reservas del usuario con información detallada
   */
  static async findByUserId(user_id) {
    try {
      const sqlQuery = `
        SELECT r.*, 
               a.name as amenity_name, 
               at.name as amenity_type_name,
               s.name as status_name,
               t.name as tariff_name,
               t.amount as tariff_amount
        FROM reservations r 
        LEFT JOIN amenities a ON r.amenity_id = a.amenity_id 
        LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        LEFT JOIN tariffs t ON r.tariff_id = t.tariff_id
        WHERE r.user_id = ?
        ORDER BY r.start_time DESC
      `;
      const [result] = await connect.query(sqlQuery, [user_id]);
      return result;
    } catch (error) {
      console.error('Error finding reservations by user ID:', error);
      return [];
    }
  }
  
  /**
   * Buscar todas las reservas asociadas a una zona común específica.
   * Incluye información del usuario que realizó cada reserva.
   * 
   * @param {number} amenity_id - ID de la zona común a consultar
   * @returns {Array} Lista de reservas para la zona común con información detallada
   */
  static async findByAmenityId(amenity_id) {
    try {
      const sqlQuery = `
        SELECT r.*, 
               u.username, 
               p.full_name,
               s.name as status_name,
               t.name as tariff_name,
               t.amount as tariff_amount
        FROM reservations r 
        LEFT JOIN users u ON r.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id
        LEFT JOIN statuses s ON r.status_id = s.status_id 
        LEFT JOIN tariffs t ON r.tariff_id = t.tariff_id
        WHERE r.amenity_id = ?
        ORDER BY r.start_time DESC
      `;
      const [result] = await connect.query(sqlQuery, [amenity_id]);
      return result;
    } catch (error) {
      console.error('Error finding reservations by amenity ID:', error);
      return [];
    }
  }
  
  /**
   * Obtener todas las reservas próximas (futuras y activas).
   * Este método filtra las reservas cuya fecha de inicio es posterior a la fecha actual.
   * El sistema busca reservas que NO estén canceladas, mostrando las que están pendientes,
   * aprobadas o activas. Las reservas se ordenan por fecha de inicio más cercana primero.
   *
   * @returns {Array} Lista de reservas próximas ordenadas por fecha de inicio ascendente
   */
  static async findUpcoming() {
    try {
      // El sistema obtiene la fecha y hora actual en formato MySQL (YYYY-MM-DD HH:MM:SS)
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // La consulta busca todas las reservas futuras que NO estén canceladas
      const sqlQuery = `
        SELECT r.*,
               a.name as amenity_name,
               at.name as amenity_type_name,
               u.username,
               p.full_name,
               s.name as status_name,
               t.name as tariff_name,
               t.amount as tariff_amount
        FROM reservations r
        LEFT JOIN amenities a ON r.amenity_id = a.amenity_id
        LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id
        LEFT JOIN users u ON r.user_id = u.user_id
        LEFT JOIN profiles p ON u.user_id = p.user_id
        LEFT JOIN statuses s ON r.status_id = s.status_id
        LEFT JOIN tariffs t ON r.tariff_id = t.tariff_id
        WHERE r.start_time > ?
        AND s.name IN ('Pendiente', 'Aprobado', 'Activo')
        ORDER BY r.start_time ASC
      `;

      // El sistema ejecuta la consulta pasando la fecha actual como parámetro
      const [result] = await connect.query(sqlQuery, [now]);
      return result;
    } catch (error) {
      // Si ocurre algún error, el sistema lo registra en la consola
      console.error('Error al obtener reservas próximas:', error);
      // El sistema devuelve un array vacío en caso de error
      return [];
    }
  }
  
  /**
   * Cancela una reserva existente cambiando su estado a cancelado.
   * Busca automáticamente el ID del estado "cancelado" en la base de datos
   * y actualiza la reserva con ese estado.
   *
   * @param {number} id - ID de la reserva a cancelar
   * @returns {Object|null} Reserva actualizada o null si hay un error
   */
  static async cancel(id) {
    try {
      // Obtener el ID del estado cancelado
      const [statusResult] = await connect.query("SELECT status_id FROM statuses WHERE name LIKE '%cancel%' OR name LIKE '%cancelad%' LIMIT 1");
      const cancelledStatusId = statusResult.length > 0 ? statusResult[0].status_id : null;

      if (!cancelledStatusId) {
        throw new Error('Cancelled status not found');
      }
      const sqlQuery = `UPDATE reservations SET status_id = ? WHERE reservation_id = ?`;
      const [result] = await connect.query(sqlQuery, [cancelledStatusId, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      return null;
    }
  }

  /**
   * Verificar si hay reservas que se solapan con el horario solicitado
   * @param {number} amenity_id - ID de la zona común
   * @param {Date} start_time - Hora de inicio
   * @param {Date} end_time - Hora de fin
   * @param {number} [exclude_id] - ID de reserva a excluir (útil para actualizaciones)
   * @returns {Promise<boolean>} true si hay solapamiento, false si no
   */
  static async hasOverlap(amenity_id, start_time, end_time, exclude_id = null) {
    try {
      const sqlQuery = `
        SELECT COUNT(*) as count 
        FROM reservations r
        JOIN statuses s ON r.status_id = s.status_id
        WHERE r.amenity_id = ?
        AND s.name IN ('Pendiente', 'Aprobado', 'Activo')
        ${exclude_id ? 'AND r.reservation_id != ?' : ''}
        AND (
          (r.start_time BETWEEN ? AND ?) OR
          (r.end_time BETWEEN ? AND ?) OR
          (r.start_time <= ? AND r.end_time >= ?)
        )
      `;

      const params = [
        amenity_id,
        ...(exclude_id ? [exclude_id] : []),
        start_time,
        end_time,
        start_time,
        end_time,
        start_time,
        end_time
      ];

      const [result] = await connect.query(sqlQuery, params);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error checking reservation overlap:', error);
      return true; // Por seguridad, si hay error asumimos que hay solapamiento
    }
  }

  /**
   * Verificar si una zona común está disponible para reservas
   * @param {number} amenity_id - ID de la zona común
   * @returns {Promise<Object|null>} Datos de la zona común si está disponible, null si no
   */
  static async verifyAmenityAvailable(amenity_id) {
    try {
      const sqlQuery = `
        SELECT a.*, s.name as status_name, at.name as type_name
        FROM amenities a
        JOIN statuses s ON a.status_id = s.status_id
        LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id
        WHERE a.amenity_id = ? AND s.name = 'Activo'
      `;
      
      const [results] = await connect.query(sqlQuery, [amenity_id]);
      return results[0] || null;
    } catch (error) {
      console.error('Error verifying amenity availability:', error);
      return null;
    }
  }

  /**
   * Verificar si un usuario tiene permisos para hacer reservas
   * @param {number} user_id - ID del usuario
   * @returns {Promise<boolean>} true si tiene permisos, false si no
   */
  static async verifyUserCanReserve(user_id) {
    try {

      const sqlQuery = `
        SELECT COUNT(*) as count
        FROM users u
        INNER JOIN statuses s ON u.status_id = s.status_id
        WHERE u.user_id = ?
        AND s.name = 'Activo'
      `;

      const [result] = await connect.query(sqlQuery, [user_id]);

      // Si el usuario existe y está activo, puede reservar
      return result[0].count > 0;
    } catch (error) {
      console.error('Error al verificar usuario:', error);
      // En caso de error, se permite el acceso si el usuario pasó verifyToken
      // Esto hace el sistema más tolerante a fallos
      return true;
    }
  }
}

export default ReservationModel;
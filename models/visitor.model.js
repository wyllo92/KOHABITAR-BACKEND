import { connect } from '../config/db/connectMysql.js';

/**
 * @fileoverview Modelo para gestionar las operaciones de base de datos relacionadas con visitantes
 * Esta clase proporciona métodos para crear, consultar, actualizar y eliminar registros de visitantes,
 * así como funcionalidades específicas como registro de entrada/salida, estadísticas y consultas de historial.
 */

/**
 * Clase que encapsula todas las operaciones de base de datos relacionadas con visitantes
 * Proporciona métodos para CRUD básico y consultas especializadas
 */
class VisitorModel {

  /**
   * Crear un nuevo registro de visitante en la base de datos
   * @param {Object} params - Objeto con los datos del visitante
   * @param {string} params.full_name - Nombre completo del visitante
   * @param {string} params.id_document - Número de documento de identidad
   * @param {string} params.visit_reason - Motivo de la visita
   * @param {Date} params.entry_time - Hora de entrada
   * @param {Date} params.exit_time - Hora de salida (opcional)
   * @param {number} params.authorized_user_id - ID del usuario que autoriza la visita
   * @param {number} params.property_id - ID de la propiedad a visitar
   * @param {number} params.status_id - ID del estado del visitante
   * @param {number|null} params.vehicle_id - ID del vehículo (opcional)
   * @param {number|null} params.parking_slot_id - ID del espacio de estacionamiento (opcional)
   * @returns {number|null} ID del visitante creado o null si hay error
   */
  static async create({ full_name, id_document, visit_reason, entry_time, exit_time, authorized_user_id, property_id, status_id, vehicle_id = null, parking_slot_id = null }) {
    try {
      // Validación de entrada de datos
      if (!full_name || !id_document || !visit_reason || !entry_time || !authorized_user_id || !property_id || !status_id) {
        throw new Error('Required visitor fields missing');
      }
      
      let sqlQuery = "INSERT INTO visitors (full_name, id_document, visit_reason, entry_time, exit_time, authorized_user_id, property_id, status_id, vehicle_id, parking_slot_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [full_name, id_document, visit_reason, entry_time, exit_time, authorized_user_id, property_id, status_id, vehicle_id, parking_slot_id]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating visitor:', error);
      return null;
    }
  }

  /**
   * Obtener todos los visitantes registrados en el sistema
   * @returns {Array} Lista de visitantes con información relacionada de propiedades, estados, vehículos y estacionamientos
   */
  static async show() {
    try {
      let sqlQuery = `
        SELECT v.*, 
               p.name as property_name, 
               s.name as status_name,
               veh.model as vehicle_model, 
               veh.type as vehicle_type, 
               ps.code as parking_slot_code 
        FROM visitors v 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id 
        LEFT JOIN parking_slots ps ON v.parking_slot_id = ps.parking_slot_id 
        ORDER BY v.visitor_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing visitors:', error);
      return [];
    }
  }

  /**
   * Actualiza los datos de un visitante existente
   * @param {number} id - ID del visitante a actualizar
   * @param {Object} params - Objeto con los datos actualizados
   * @param {string} params.full_name - Nombre completo del visitante
   * @param {string} params.id_document - Número de documento de identidad
   * @param {string} params.visit_reason - Motivo de la visita
   * @param {Date} params.entry_time - Hora de entrada
   * @param {Date} params.exit_time - Hora de salida
   * @param {number} params.authorized_user_id - ID del usuario que autoriza la visita
   * @param {number} params.property_id - ID de la propiedad a visitar
   * @param {number} params.status_id - ID del estado del visitante
   * @param {number|null} params.vehicle_id - ID del vehículo (opcional)
   * @param {number|null} params.parking_slot_id - ID del espacio de estacionamiento (opcional)
   * @returns {Object|null} Objeto con los datos actualizados o null si hay error
   */
  static async update(id, { full_name, id_document, visit_reason, entry_time, exit_time, authorized_user_id, property_id, status_id, vehicle_id = null, parking_slot_id = null }) {
    try {
      // Validación de entrada de datos
      if (!id) {
        throw new Error('Visitor ID is required');
      }
      
      if (!full_name || !id_document || !visit_reason || !entry_time || !authorized_user_id || !property_id || !status_id) {
        throw new Error('Required visitor fields missing');
      }
      
      let sqlQuery = `
        UPDATE visitors 
        SET full_name = ?, 
            id_document = ?, 
            visit_reason = ?, 
            entry_time = ?, 
            exit_time = ?, 
            authorized_user_id = ?, 
            property_id = ?, 
            status_id = ?, 
            vehicle_id = ?, 
            parking_slot_id = ? 
        WHERE visitor_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [full_name, id_document, visit_reason, entry_time, exit_time, authorized_user_id, property_id, status_id, vehicle_id, parking_slot_id, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating visitor:', error);
      return null;
    }
  }

  /**
   * Elimina un visitante de la base de datos
   * @param {number} id - ID del visitante a eliminar
   * @returns {boolean} true si la eliminación fue exitosa, false en caso contrario
   */
  static async delete(id) {
    try {
      if (!id) {
        throw new Error('Visitor ID is required');
      }
      
      // Verificar si el visitante existe antes de intentar eliminarlo
      const visitor = await this.findById(id);
      if (!visitor) {
        return false;
      }
      
      let sqlQuery = "DELETE FROM visitors WHERE visitor_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting visitor:', error);
      return false;
    }
  }

  /**
   * Obtener todos los visitantes registrados en el sistema
   * El sistema devuelve todos los visitantes sin filtrar por estado específico
   * debido a que los estados de visitantes son: Dentro, Fuera, Autorizado, No Autorizado
   * @returns {Array} Lista de visitantes con información relacionada
   */
  static async showActive() {
    try {
      let sqlQuery = `
        SELECT v.*,
               p.name as property_name,
               s.name as status_name,
               veh.model as vehicle_model,
               veh.type as vehicle_type,
               ps.code as parking_slot_code
        FROM visitors v
        LEFT JOIN properties p ON v.property_id = p.property_id
        LEFT JOIN statuses s ON v.status_id = s.status_id
        LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id
        LEFT JOIN parking_slots ps ON v.parking_slot_id = ps.parking_slot_id
        WHERE s.entity = 'visitor' AND s.is_active = 1
        ORDER BY v.visitor_id DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing active visitors:', error);
      return [];
    }
  }

  /**
   * Buscar un visitante por su ID
   * @param {number} id - ID del visitante a buscar
   * @returns {Object|null} Objeto con los datos del visitante o null si no se encuentra
   */
  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT v.*, 
               p.name as property_name, 
               s.name as status_name, 
               veh.model as vehicle_model, 
               veh.type as vehicle_type, 
               ps.code as parking_slot_code 
        FROM visitors v 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id 
        LEFT JOIN parking_slots ps ON v.parking_slot_id = ps.parking_slot_id 
        WHERE v.visitor_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding visitor by ID:', error);
      return null;
    }
  }

  /**
   * Buscar un visitante activo por su ID
   * @param {number} id - ID del visitante activo a buscar
   * @returns {Object|null} Objeto con los datos del visitante activo o null si no se encuentra
   */
  static async findByIdActive(id) {
    try {
      let sqlQuery = `
        SELECT v.*, 
               p.name as property_name, 
               s.name as status_name, 
               veh.model as vehicle_model, 
               veh.type as vehicle_type, 
               ps.code as parking_slot_code 
        FROM visitors v 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id 
        LEFT JOIN parking_slots ps ON v.parking_slot_id = ps.parking_slot_id 
        WHERE v.visitor_id = ? AND s.name = 'Activo'
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding active visitor by ID:', error);
      return null;
    }
  }

  /**
   * Buscar un visitante por su número de documento de identidad
   * @param {string} id_document - Número de documento a buscar
   * @returns {Object|null} Objeto con los datos del visitante o null si no se encuentra
   */
  static async findByDocument(id_document) {
    try {
      let sqlQuery = `
        SELECT v.*, 
               p.name as property_name, 
               s.name as status_name, 
               veh.model as vehicle_model, 
               veh.type as vehicle_type, 
               ps.code as parking_slot_code 
        FROM visitors v 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id 
        LEFT JOIN parking_slots ps ON v.parking_slot_id = ps.parking_slot_id 
        WHERE v.id_document = ?
      `;
      const [result] = await connect.query(sqlQuery, [id_document]);
      return result[0];
    } catch (error) {
      console.error('Error finding visitor by document:', error);
      return null;
    }
  }

  /**
   * Obtener todos los visitantes asociados a una propiedad específica
   * @param {number} property_id - ID de la propiedad a consultar
   * @returns {Array} Lista de visitantes de la propiedad específica
   */
  /**
   * Buscar visitantes por ID de propiedad
   * @param {number} property_id - ID de la propiedad a buscar
   * @returns {Array} Lista de visitantes asociados a la propiedad especificada
   */
  static async findByPropertyId(property_id) {
    try {
      let sqlQuery = `
        SELECT v.*, 
               p.name as property_name, 
               s.name as status_name, 
               veh.model as vehicle_model, 
               veh.type as vehicle_type, 
               ps.code as parking_slot_code 
        FROM visitors v 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id 
        LEFT JOIN parking_slots ps ON v.parking_slot_id = ps.parking_slot_id 
        WHERE v.property_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [property_id]);
      return result;
    } catch (error) {
      console.error('Error finding visitors by property ID:', error);
      return [];
    }
  }

  /**
   * Buscar visitantes por ID de estado
   * @param {number} status_id - ID del estado a buscar
   * @returns {Array} Lista de visitantes con el estado especificado
   */
  static async findByStatus(status_id) {
    try {
      let sqlQuery = `
        SELECT v.*, 
               p.name as property_name, 
               s.name as status_name, 
               veh.model as vehicle_model, 
               veh.type as vehicle_type, 
               ps.code as parking_slot_code 
        FROM visitors v 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id 
        LEFT JOIN parking_slots ps ON v.parking_slot_id = ps.parking_slot_id 
        WHERE v.status_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [status_id]);
      return result;
    } catch (error) {
      console.error('Error finding visitors by status ID:', error);
      return [];
    }
  }

  /**
   * Buscar visitantes por rango de fechas
   * @param {Date|string} start_date - Fecha de inicio del rango
   * @param {Date|string} end_date - Fecha de fin del rango
   * @returns {Array} Lista de visitantes que entraron en el rango de fechas especificado
   */
  static async findByDateRange(start_date, end_date) {
    try {
      let sqlQuery = `
        SELECT v.*, 
               p.name as property_name, 
               s.name as status_name, 
               veh.model as vehicle_model, 
               veh.type as vehicle_type, 
               ps.code as parking_slot_code 
        FROM visitors v 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id 
        LEFT JOIN parking_slots ps ON v.parking_slot_id = ps.parking_slot_id 
        WHERE v.entry_time BETWEEN ? AND ?
      `;
      const [result] = await connect.query(sqlQuery, [start_date, end_date]);
      return result;
    } catch (error) {
      console.error('Error finding visitors by date range:', error);
      return [];
    }
  }

  /**
   * Encuentra todos los visitantes con estado activo
   * @returns {Array} Lista de visitantes activos en el sistema
   */
  static async findActive() {
    try {
      let sqlQuery = `
        SELECT v.*, 
               p.name as property_name, 
               s.name as status_name, 
               veh.model as vehicle_model, 
               veh.type as vehicle_type, 
               ps.code as parking_slot_code 
        FROM visitors v 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id 
        LEFT JOIN parking_slots ps ON v.parking_slot_id = ps.parking_slot_id 
        WHERE s.name = 'Activo'
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error finding active visitors:', error);
      return [];
    }
  }

  /**
   * Encuentra todos los visitantes que actualmente están dentro del establecimiento (sin hora de salida registrada)
   * @returns {Array} Lista de visitantes actualmente en el establecimiento
   */
  static async findCurrentVisitors() {
    try {
      let sqlQuery = `
        SELECT v.*, 
               p.name as property_name, 
               s.name as status_name, 
               veh.model as vehicle_model, 
               veh.type as vehicle_type, 
               ps.code as parking_slot_code 
        FROM visitors v 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id 
        LEFT JOIN parking_slots ps ON v.parking_slot_id = ps.parking_slot_id 
        WHERE v.exit_time IS NULL
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error finding current visitors:', error);
      return [];
    }
  }

  /**
   * Registrar la salida de un visitante, actualizando su hora de salida y cambiando su estado a inactivo
   * @param {number} id - ID del visitante que está saliendo
   * @param {Date|null} exit_time - Hora de salida (si es null, se usa la hora actual)
   * @returns {boolean} true si la actualización fue exitosa, false en caso contrario
   */
  static async checkOut(id, exit_time = null) {
    try {
      const exitTime = exit_time || new Date();
      let sqlQuery = `
        UPDATE visitors 
        SET exit_time = ?, 
            status_id = (SELECT status_id FROM statuses WHERE name = 'Inactivo')
        WHERE visitor_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [exitTime, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error checking out visitor:', error);
      return false;
    }
  }

  /**
   * Obtener todos los visitantes que han ingresado el día de hoy.
   * Este método consulta la base de datos para encontrar todos los registros de visitantes
   * cuya fecha de entrada (entry_time) coincida con la fecha actual del sistema.
   * El sistema incluye información completa del visitante junto con datos relacionados
   * de la propiedad visitada, estado actual, vehículo y espacio de estacionamiento (si aplican).
   *
   * @returns {Array} Lista de visitantes del día actual ordenados por hora de entrada (más recientes primero)
   */
  static async getTodayVisitors() {
    try {
      // El sistema obtiene la fecha actual en formato ISO (YYYY-MM-DD)
      // Ejemplo: si hoy es 3 de noviembre de 2024, today será "2024-11-03"
      const today = new Date().toISOString().split('T')[0];

      // La consulta SQL busca todos los visitantes cuya fecha de entrada sea igual a hoy
      // El sistema usa la función DATE() para extraer solo la parte de fecha de entry_time
      // y compararla con la fecha actual (ignorando la hora)
      let sqlQuery = `
        SELECT v.*,
               p.name as property_name,
               s.name as status_name,
               veh.model as vehicle_model,
               veh.type as vehicle_type,
               ps.code as parking_slot_code
        FROM visitors v
        LEFT JOIN properties p ON v.property_id = p.property_id
        LEFT JOIN statuses s ON v.status_id = s.status_id
        LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id
        LEFT JOIN parking_slots ps ON v.parking_slot_id = ps.parking_slot_id
        WHERE DATE(v.entry_time) = ?
        ORDER BY v.entry_time DESC
      `;

      // El sistema ejecuta la consulta pasando la fecha de hoy como parámetro
      const [result] = await connect.query(sqlQuery, [today]);

      // Si encuentra visitantes, el sistema los devuelve ordenados por hora de entrada
      // Si no encuentra ninguno, devuelve un array vacío []
      return result;
    } catch (error) {
      // Si ocurre algún error al consultar la base de datos, el sistema lo registra
      console.error('Error al obtener visitantes del día de hoy:', error);
      // El sistema devuelve un array vacío para evitar errores en la aplicación
      return [];
    }
  }

  /**
   * Obtener estadísticas generales sobre los visitantes
   * @returns {Object|null} Objeto con estadísticas como total de visitantes, visitantes actuales,
   *                       visitantes del día, visitantes con vehículos, con estacionamiento y duración promedio
   */
  static async getVisitorStatistics() {
    try {
      let sqlQuery = `
        SELECT 
          COUNT(*) as total_visitors,
          COUNT(CASE WHEN exit_time IS NULL THEN 1 END) as current_visitors,
          COUNT(CASE WHEN DATE(entry_time) = CURDATE() THEN 1 END) as today_visitors,
          COUNT(CASE WHEN vehicle_id IS NOT NULL THEN 1 END) as visitors_with_vehicles,
          COUNT(CASE WHEN parking_slot_id IS NOT NULL THEN 1 END) as visitors_with_parking,
          AVG(TIMESTAMPDIFF(HOUR, entry_time, COALESCE(exit_time, NOW()))) as avg_visit_duration_hours
        FROM visitors
      `;
      const [result] = await connect.query(sqlQuery);
      return result[0];
    } catch (error) {
      console.error('Error getting visitor statistics:', error);
      return null;
    }
  }

  /**
   * Obtener una lista de los visitantes más frecuentes
   * @param {number} limit - Número máximo de visitantes frecuentes a retornar
   * @returns {Array} Lista de visitantes frecuentes con información de visitas
   */
  static async getFrequentVisitors(limit = 10) {
    try {
      let sqlQuery = `
        SELECT 
          id_document,
          full_name,
          COUNT(*) as visit_count,
          MAX(entry_time) as last_visit,
          GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') as visited_properties
        FROM visitors v
        INNER JOIN properties p ON v.property_id = p.property_id
        GROUP BY id_document, full_name
        HAVING visit_count > 1
        ORDER BY visit_count DESC, last_visit DESC
        LIMIT ?
      `;
      const [result] = await connect.query(sqlQuery, [limit]);
      return result;
    } catch (error) {
      console.error('Error getting frequent visitors:', error);
      return [];
    }
  }

  /**
   * Obtener el historial completo de visitas de una persona específica por su documento
   * @param {string} visitorDocument - Número de documento del visitante
   * @returns {Array} Historial de visitas ordenado por fecha de entrada descendente
   */
  static async getVisitorHistory(visitorDocument) {
    try {
      let sqlQuery = `
        SELECT v.*, 
               p.name as property_name, 
               s.name as status_name,
               veh.model as vehicle_model,
               veh.type as vehicle_type,
               ps.code as parking_slot_code,
               TIMESTAMPDIFF(HOUR, v.entry_time, COALESCE(v.exit_time, NOW())) as visit_duration_hours
        FROM visitors v
        LEFT JOIN properties p ON v.property_id = p.property_id
        LEFT JOIN statuses s ON v.status_id = s.status_id
        LEFT JOIN vehicles veh ON v.vehicle_id = veh.vehicle_id
        LEFT JOIN parking_slots ps ON v.parking_slot_id = ps.parking_slot_id
        WHERE v.id_document = ?
        ORDER BY v.entry_time DESC
      `;
      const [result] = await connect.query(sqlQuery, [visitorDocument]);
      return result;
    } catch (error) {
      console.error('Error getting visitor history:', error);
      return [];
    }
  }
}

export default VisitorModel;
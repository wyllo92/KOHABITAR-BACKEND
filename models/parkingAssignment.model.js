import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar las asignaciones de espacios de parqueo.
 */
class ParkingAssignmentModel {
  /**
   * Formatea una fecha ISO a formato MySQL
   * @param {string|Date} dateStr - Fecha en formato ISO o objeto Date
   * @returns {string} Fecha en formato MySQL
   */
  static formatDateForMySQL(dateStr) {
    if (!dateStr) return null;
    
    // Si es un objeto Date, convertirlo a string ISO
    if (dateStr instanceof Date) {
        return dateStr.toISOString().slice(0, 19).replace('T', ' ');
    }
    
    // Si es un string, asegurarse de que tenga el formato correcto
    if (typeof dateStr === 'string') {
        return dateStr.replace('T', ' ').replace('Z', '');
    }
    
    // Si no es ninguno de los anteriores, intentar crear un objeto Date
    try {
        const date = new Date(dateStr);
        return date.toISOString().slice(0, 19).replace('T', ' ');
    } catch (error) {
        console.error('Error formatting date:', error);
        return null;
    }
  }

  /**
   * Crear una nueva asignación de espacio de parqueo.
   * 
   * @param {Object} assignmentData - Datos de la asignación
   * @param {number} assignmentData.parking_slot_id - ID del espacio de parqueo
   * @param {number} assignmentData.user_id - ID del usuario
   * @param {number} [assignmentData.vehicle_id] - ID del vehículo (opcional)
   * @param {string} assignmentData.start_time - Fecha y hora de inicio
   * @param {string} assignmentData.end_time - Fecha y hora de fin
   * @param {number} [assignmentData.total_amount] - Monto total (opcional)
   * @param {number} assignmentData.status_id - ID del estado
   * @returns {number|null} ID de la asignación creada o null si hubo un error
   */
  static async create({ parking_slot_id, user_id, vehicle_id = null, start_time, end_time, total_amount = null, status_id }) {
    try {
      const sqlQuery = `
        INSERT INTO parking_assignments 
        (parking_slot_id, user_id, vehicle_id, start_time, end_time, total_amount, status_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const formattedStartTime = this.formatDateForMySQL(start_time);
      const formattedEndTime = this.formatDateForMySQL(end_time);
      
      const [result] = await connect.query(sqlQuery, [
        parking_slot_id, user_id, vehicle_id, formattedStartTime, formattedEndTime, total_amount, status_id
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating parking assignment:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las asignaciones de espacios de parqueo con información detallada.
   * 
   * @returns {Array} Lista de asignaciones con información completa
   */
  static async getAll() {
    try {
      const sqlQuery = `
        SELECT pa.*, 
               ps.code as slot_code,
               pz.name as zone_name,
               u.username,
               v.license_plate,
               s.name as status_name
        FROM parking_assignments pa
        LEFT JOIN parking_slots ps ON pa.parking_slot_id = ps.parking_slot_id
        LEFT JOIN parking_zones pz ON ps.parking_zone_id = pz.parking_zone_id
        LEFT JOIN users u ON pa.user_id = u.user_id
        LEFT JOIN vehicles v ON pa.vehicle_id = v.vehicle_id
        LEFT JOIN statuses s ON pa.status_id = s.status_id
        ORDER BY pa.start_time DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error getting parking assignments:', error);
      throw error;
    }
  }

  /**
   * Obtener las asignaciones de espacios de parqueo de un usuario específico.
   * 
   * @param {number} userId - ID del usuario
   * @returns {Array} Lista de asignaciones del usuario
   */
  static async getByUserId(userId) {
    try {
      const sqlQuery = `
        SELECT pa.*, 
               ps.code as slot_code,
               pz.name as zone_name,
               v.license_plate,
               s.name as status_name
        FROM parking_assignments pa
        LEFT JOIN parking_slots ps ON pa.parking_slot_id = ps.parking_slot_id
        LEFT JOIN parking_zones pz ON ps.parking_zone_id = pz.parking_zone_id
        LEFT JOIN vehicles v ON pa.vehicle_id = v.vehicle_id
        LEFT JOIN statuses s ON pa.status_id = s.status_id
        WHERE pa.user_id = ?
        ORDER BY pa.start_time DESC
      `;
      const [result] = await connect.query(sqlQuery, [userId]);
      return result;
    } catch (error) {
      console.error('Error getting user parking assignments:', error);
      throw error;
    }
  }

  /**
   * Verificar si un espacio de parqueo está disponible en un rango de fechas.
   * 
   * @param {number} slotId - ID del espacio de parqueo
   * @param {string} startTime - Fecha y hora de inicio
   * @param {string} endTime - Fecha y hora de fin
   * @returns {boolean} true si está disponible, false si no
   */
  static async isSlotAvailable(slotId, startTime, endTime) {
    try {
      const sqlQuery = `
        SELECT COUNT(*) as count
        FROM parking_assignments
        WHERE parking_slot_id = ?
        AND status_id IN (SELECT status_id FROM statuses WHERE name IN ('activo', 'ocupado'))
        AND (
          (start_time BETWEEN ? AND ?) OR
          (end_time BETWEEN ? AND ?) OR
          (start_time <= ? AND end_time >= ?)
        )
      `;
      const formattedStartTime = this.formatDateForMySQL(startTime);
      const formattedEndTime = this.formatDateForMySQL(endTime);
      
      const [result] = await connect.query(sqlQuery, [
        slotId, formattedStartTime, formattedEndTime, formattedStartTime, formattedEndTime, formattedStartTime, formattedEndTime
      ]);
      return result[0].count === 0;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      throw error;
    }
  }

  /**
   * Actualiza una asignación de espacio de parqueo.
   * 
   * @param {number} id - ID de la asignación
   * @param {Object} updateData - Datos a actualizar
   * @returns {boolean} true si se actualizó correctamente, false si no
   */
  static async update(id, updateData) {
    try {
      const updates = [];
      const values = [];

      if (updateData.vehicle_id !== undefined) {
        updates.push('vehicle_id = ?');
        values.push(updateData.vehicle_id);
      }
      if (updateData.end_time !== undefined) {
        updates.push('end_time = ?');
        values.push(this.formatDateForMySQL(updateData.end_time));
      }
      if (updateData.total_amount !== undefined) {
        updates.push('total_amount = ?');
        values.push(updateData.total_amount);
      }
      if (updateData.status_id !== undefined) {
        updates.push('status_id = ?');
        values.push(updateData.status_id);
      }

      if (updates.length === 0) return true;

      const sqlQuery = `
        UPDATE parking_assignments 
        SET ${updates.join(', ')} 
        WHERE parking_assignment_id = ?
      `;
      values.push(id);

      const [result] = await connect.query(sqlQuery, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating parking assignment:', error);
      throw error;
    }
  }

  /**
   * Obtener una asignación específica por ID
   * 
   * @param {number} id - ID de la asignación
   * @returns {Promise<Object>} La asignación encontrada
   */
  static async getById(id) {
    try {
      const sqlQuery = `
        SELECT pa.*, 
               ps.code as slot_code,
               pz.name as zone_name,
               u.username,
               v.license_plate,
               s.name as status_name
        FROM parking_assignments pa
        LEFT JOIN parking_slots ps ON pa.parking_slot_id = ps.parking_slot_id
        LEFT JOIN parking_zones pz ON ps.parking_zone_id = pz.parking_zone_id
        LEFT JOIN users u ON pa.user_id = u.user_id
        LEFT JOIN vehicles v ON pa.vehicle_id = v.vehicle_id
        LEFT JOIN statuses s ON pa.status_id = s.status_id
        WHERE pa.parking_assignment_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result;
    } catch (error) {
      console.error('Error getting parking assignment:', error);
      throw error;
    }
  }

  /**
   * Finaliza una asignación de espacio de parqueo.
   * 
   * @param {number} id - ID de la asignación
   * @returns {boolean} true si se finalizó correctamente, false si no
   */
  static async end(id) {
    try {
      const sqlQuery = `
        UPDATE parking_assignments 
        SET end_time = NOW(), 
            status_id = (SELECT status_id FROM statuses WHERE name = 'finalizado' LIMIT 1)
        WHERE parking_assignment_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error ending parking assignment:', error);
      throw error;
    }
  }
}

export default ParkingAssignmentModel;
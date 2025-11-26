import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar las operaciones de base de datos relacionadas con las zonas de parqueo.
 * Proporciona métodos para realizar operaciones CRUD y consultas especializadas sobre la tabla
 * parking_zones y sus relaciones con otras tablas del sistema.
 */
class ParkingZoneModel {

  /**
   * Crear una nueva zona de parqueo en la base de datos.
   * 
   * @param {Object} zoneData - Datos de la zona de parqueo
   * @param {string} zoneData.name - Nombre descriptivo de la zona
   * @param {string} zoneData.type - Tipo de zona (ejemplo: 'visitantes', 'residentes')
   * @param {number} zoneData.capacity - Capacidad total de vehículos de la zona
   * @param {number} zoneData.status_id - ID del estado de la zona
   * @returns {number|null} ID de la zona creada o null si hubo un error
   */
  static async create({ name, type, capacity, status_id }) {
    try {
      let sqlQuery = "INSERT INTO parking_zones (name, type, capacity, status_id) VALUES (?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [name, type, capacity, status_id]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating parking zone:', error);
      return null;
    }
  }

  /**
   * Obtener todas las zonas de parqueo con información detallada de sus relaciones.
   * Realizar joins con las tablas de propiedades y estados para obtener
   * información completa de cada zona de parqueo.
   * 
   * @returns {Array} Lista de zonas de parqueo con información completa
   */
  static async show() {
    try {
      // Consulta SQL que obtiene todas las zonas de parqueo con datos relacionados
      let sqlQuery = `
        SELECT pz.*, 
               s.name as status_name 
        FROM parking_zones pz 
        LEFT JOIN statuses s ON pz.status_id = s.status_id 
        ORDER BY pz.parking_zone_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing parking zones:', error);
      return [];
    }
  }

  /**
   * Actualiza la información de una zona de parqueo existente.
   * 
   * @param {number} id - ID de la zona de parqueo a actualizar
   * @param {Object} updateData - Datos actualizados de la zona
   * @param {string} [updateData.name] - Nombre actualizado de la zona
   * @param {string} [updateData.type] - Tipo actualizado de la zona
   * @param {number} [updateData.capacity] - Capacidad actualizada de la zona
   * @param {string} [updateData.description] - Descripción actualizada de la zona
   * @param {number} [updateData.status_id] - ID actualizado del estado
   * @returns {Object|null} Datos de la zona actualizada o null si hubo un error
   */
  static async update(id, updateData) {
    try {
      const updates = [];
      const values = [];

      // Construir la consulta dinámicamente solo con los campos proporcionados
      if (updateData.name !== undefined) {
        updates.push('name = ?');
        values.push(updateData.name);
      }
      if (updateData.type !== undefined) {
        updates.push('type = ?');
        values.push(updateData.type);
      }
      if (updateData.capacity !== undefined) {
        updates.push('capacity = ?');
        values.push(updateData.capacity);
      }
      if (updateData.status_id !== undefined) {
        updates.push('status_id = ?');
        values.push(updateData.status_id);
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      const sqlQuery = `UPDATE parking_zones SET ${updates.join(', ')} WHERE parking_zone_id = ?`;
      values.push(id);

      const [result] = await connect.query(sqlQuery, values);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating parking zone:', error);
      throw error;
    }
  }

  /**
   * Elimina una zona de parqueo de la base de datos.
   * Antes de eliminar la zona, elimina todos los espacios de parqueo asociados
   * y verifica que no haya vehículos o reservaciones activas.
   * 
   * @param {number} id - ID de la zona de parqueo a eliminar
   * @returns {boolean} true si la eliminación fue exitosa, false si no
   * @throws {Error} Si hay vehículos o reservaciones activas en la zona
   */
  static async delete(id) {
    try {
      // Inicia una transacción
      await connect.query('START TRANSACTION');

      // Verificar si hay vehículos asignados a esta zona
      const [vehicles] = await connect.query(
        "SELECT COUNT(*) as count FROM vehicles WHERE parking_zone_id = ?",
        [id]
      );

      if (vehicles[0].count > 0) {
        await connect.query('ROLLBACK');
        throw new Error('No se puede eliminar la zona porque hay vehículos asignados');
      }

      // Verificar si hay asignaciones de parqueo activas
      const [assignments] = await connect.query(
        "SELECT COUNT(*) as count FROM parking_assignments pa " +
        "INNER JOIN parking_slots ps ON pa.parking_slot_id = ps.parking_slot_id " +
        "WHERE ps.parking_zone_id = ? AND (pa.end_time IS NULL OR pa.end_time > NOW())",
        [id]
      );

      if (assignments[0].count > 0) {
        await connect.query('ROLLBACK');
        throw new Error('No se puede eliminar la zona porque hay asignaciones de parqueo activas');
      }

      // Primero elimina todos los espacios de parqueo asociados
      await connect.query(
        "DELETE FROM parking_slots WHERE parking_zone_id = ?",
        [id]
      );

      // Luego elimina la zona de parqueo
      const [result] = await connect.query(
        "DELETE FROM parking_zones WHERE parking_zone_id = ?",
        [id]
      );

      // Confirma la transacción
      await connect.query('COMMIT');

      return result.affectedRows > 0;
    } catch (error) {
      // Si hay algún error, revierte la transacción
      await connect.query('ROLLBACK');
      console.error('Error deleting parking zone:', error);
      throw error; // Propaga el error para manejarlo en el controlador
    }
  }

  /**
   * Buscar una zona de parqueo por su ID y obtiene información completa
   * incluyendo datos relacionados de otras tablas.
   * 
   * @param {number} id - ID de la zona de parqueo a buscar
   * @returns {Object|null} Datos de la zona o null si no se encuentra
   */
  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT pz.*, 
               s.name as status_name 
        FROM parking_zones pz 
        LEFT JOIN statuses s ON pz.status_id = s.status_id 
        WHERE pz.parking_zone_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding parking zone by ID:', error);
      return null;
    }
  }

  /**
   * Buscar zonas de parqueo por su tipo.
   * 
   * @param {string} type - Tipo de zona a buscar (ejemplo: 'visitantes', 'residentes')
   * @returns {Array} Lista de zonas de parqueo del tipo especificado
   */
  static async findByType(type) {
    try {
      let sqlQuery = `
        SELECT pz.*, 
               s.name as status_name 
        FROM parking_zones pz 
        LEFT JOIN statuses s ON pz.status_id = s.status_id 
        WHERE pz.type = ?
      `;
      const [result] = await connect.query(sqlQuery, [type]);
      return result;
    } catch (error) {
      console.error('Error finding parking zones by type:', error);
      return [];
    }
  }

  /**
   * Obtener todas las zonas de parqueo con estado activo.
   * 
   * @returns {Array} Lista de zonas de parqueo activas
   */
  static async findActive() {
    try {
      // Consulta SQL que filtra zonas con estado 'Activo'
      let sqlQuery = `
        SELECT pz.*, 
               s.name as status_name 
        FROM parking_zones pz 
        LEFT JOIN statuses s ON pz.status_id = s.status_id 
        WHERE s.name = 'Activo'
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error finding active parking zones:', error);
      return [];
    }
  }
  
  /**
   * Obtener la información de disponibilidad de una zona de parqueo específica
   * mediante un procedimiento almacenado.
   * 
   * @param {number} zoneId - ID de la zona de parqueo
   * @returns {Object} Información sobre la disponibilidad de espacios en la zona
   */
  static async getAvailability(zoneId) {
    try {
      // Llama al procedimiento almacenado que calcula la disponibilidad
      const [rows] = await connect.query('CALL sp_get_parking_availability(?)', [zoneId]);
      return rows[0]; // Primer conjunto de resultados
    } catch (error) {
      console.error('Error getting parking availability:', error);
      return [];
    }
  }
}

export default ParkingZoneModel; 
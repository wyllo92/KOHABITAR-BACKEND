import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar las operaciones de base de datos relacionadas con los espacios de parqueo.
 * Proporciona métodos para realizar operaciones CRUD y consultas especializadas sobre la tabla
 * parking_slots y sus relaciones con otras tablas del sistema.
 */
class ParkingSlotModel {

  /**
   * Crear un nuevo espacio de parqueo en la base de datos.
   * 
   * @param {Object} parkingSlotData - Datos del espacio de parqueo
   * @param {string} parkingSlotData.code - Código identificativo del espacio de parqueo
   * @param {number} parkingSlotData.parking_zone_id - ID de la zona de parqueo a la que pertenece
   * @param {number} parkingSlotData.status_id - ID del estado del espacio de parqueo
   * @param {boolean} parkingSlotData.is_reserved - Indica si el espacio está reservado (1) o no (0)
   * @param {number} parkingSlotData.tariff_id - ID de la tarifa aplicable a este espacio
   * @returns {number|null} ID del espacio de parqueo creado o null si hubo un error
   */
  static async create({ code, parking_zone_id, status_id, is_reserved, tariff_id }) {
    try {
      let sqlQuery = "INSERT INTO parking_slots (code, parking_zone_id, status_id, is_reserved, tariff_id) VALUES (?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [code, parking_zone_id, status_id, is_reserved, tariff_id]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating parking slot:', error);
      return null;
    }
  }

  /**
   * Obtener todos los espacios de parqueo con información detallada de sus relaciones.
   * Realiza joins con las tablas de zonas, propiedades, estados y tarifas para obtener
   * información completa de cada espacio de parqueo.
   * 
   * @returns {Array} Lista de espacios de parqueo con información completa
   */
  static async show() {
    try {
      // Consulta SQL que obtiene todos los espacios de parqueo con datos relacionados
      let sqlQuery = `
        SELECT ps.*, 
               pz.type as zone_type, 
               pz.name as zone_name,
               pz.capacity as zone_capacity, 
               GROUP_CONCAT(DISTINCT p.name) as property_names,
               s.name as status_name, 
               t.name as tariff_name, 
               t.amount as tariff_amount 
        FROM parking_slots ps 
        LEFT JOIN parking_zones pz ON ps.parking_zone_id = pz.parking_zone_id 
        LEFT JOIN vehicles v ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON ps.status_id = s.status_id 
        LEFT JOIN tariffs t ON ps.tariff_id = t.tariff_id 
        GROUP BY ps.parking_slot_id
        ORDER BY ps.parking_slot_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing parking slots:', error);
      return [];
    }
  }

  /**
   * Actualizar la información de un espacio de parqueo existente.
   * 
   * @param {number} id - ID del espacio de parqueo a actualizar
   * @param {Object} updateData - Datos actualizados del espacio de parqueo
   * @param {string} updateData.code - Código identificativo actualizado
   * @param {number} updateData.parking_zone_id - ID de la zona de parqueo actualizada
   * @param {number} updateData.status_id - ID del nuevo estado
   * @param {boolean} updateData.is_reserved - Nuevo estado de reserva
   * @param {number} updateData.tariff_id - ID de la nueva tarifa
   * @returns {Object|null} Datos del espacio actualizado o null si hubo un error
   */
  static async update(id, { code, parking_zone_id, status_id, is_reserved, tariff_id }) {
    try {
      let sqlQuery = "UPDATE parking_slots SET code = ?, parking_zone_id = ?, status_id = ?, is_reserved = ?, tariff_id = ? WHERE parking_slot_id = ?;";
      const [result] = await connect.query(sqlQuery, [code, parking_zone_id, status_id, is_reserved, tariff_id, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating parking slot:', error);
      return null;
    }
  }

  /**
   * Eliminar un espacio de parqueo de la base de datos.
   * 
   * @param {number} id - ID del espacio de parqueo a eliminar
   * @returns {boolean} true si la eliminación fue exitosa, false si no
   */
  static async delete(id) {
    try {
      // Ejecutar la consulta SQL para eliminar el registro
      let sqlQuery = "DELETE FROM parking_slots WHERE parking_slot_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      // Verificar si se eliminó algún registro
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting parking slot:', error);
      return false;
    }
  }

  /**
   * Buscar un espacio de parqueo por su ID y obtiene información completa
   * incluyendo datos relacionados de otras tablas.
   * 
   * @param {number} id - ID del espacio de parqueo a buscar
   * @returns {Object|null} Datos del espacio de parqueo o null si no se encuentra
   */
  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT ps.*, 
               pz.type as zone_type, 
               pz.name as zone_name,
               pz.capacity as zone_capacity, 
               GROUP_CONCAT(DISTINCT p.name) as property_names,
               s.name as status_name, 
               t.name as tariff_name,
               t.amount as tariff_amount
        FROM parking_slots ps 
        LEFT JOIN parking_zones pz ON ps.parking_zone_id = pz.parking_zone_id 
        LEFT JOIN vehicles v ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON ps.status_id = s.status_id 
        LEFT JOIN tariffs t ON ps.tariff_id = t.tariff_id 
        WHERE ps.parking_slot_id = ?
        GROUP BY ps.parking_slot_id
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding parking slot by ID:', error);
      return null;
    }
  }

  /**
   * Buscar un espacio de parqueo por su código identificativo.
   * 
   * @param {string} code - Código del espacio de parqueo a buscar
   * @returns {Object|null} Datos del espacio de parqueo o null si no se encuentra
   */
  static async findByCode(code) {
    try {
      // Consulta SQL que busca un espacio específico por su código
      let sqlQuery = `
        SELECT ps.*, 
               pz.type as zone_type, 
               pz.name as zone_name,
               pz.capacity as zone_capacity, 
               GROUP_CONCAT(DISTINCT p.name) as property_names,
               s.name as status_name, 
               t.name as tariff_name,
               t.amount as tariff_amount
        FROM parking_slots ps 
        LEFT JOIN parking_zones pz ON ps.parking_zone_id = pz.parking_zone_id 
        LEFT JOIN vehicles v ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON ps.status_id = s.status_id 
        LEFT JOIN tariffs t ON ps.tariff_id = t.tariff_id 
        WHERE ps.code = ?
        GROUP BY ps.parking_slot_id
      `;
      const [result] = await connect.query(sqlQuery, [code]);
      return result[0];
    } catch (error) {
      console.error('Error finding parking slot by code:', error);
      return null;
    }
  }

  /**
   * Obtener todos los espacios de parqueo que pertenecen a una zona específica.
   * 
   * @param {number} parking_zone_id - ID de la zona de parqueo
   * @returns {Array} Lista de espacios de parqueo en la zona especificada
   */
  static async findByParkingZone(parking_zone_id) {
    try {
      let sqlQuery = `
        SELECT ps.*, 
               pz.type as zone_type, 
               pz.name as zone_name,
               pz.capacity as zone_capacity, 
               GROUP_CONCAT(DISTINCT p.name) as property_names,
               s.name as status_name, 
               t.name as tariff_name,
               t.amount as tariff_amount
        FROM parking_slots ps 
        LEFT JOIN parking_zones pz ON ps.parking_zone_id = pz.parking_zone_id 
        LEFT JOIN vehicles v ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN statuses s ON ps.status_id = s.status_id 
        LEFT JOIN tariffs t ON ps.tariff_id = t.tariff_id 
        WHERE ps.parking_zone_id = ?
        GROUP BY ps.parking_slot_id
      `;
      const [result] = await connect.query(sqlQuery, [parking_zone_id]);
      return result;
    } catch (error) {
      console.error('Error finding parking slots by zone:', error);
      return [];
    }
  }

  /**
   * Obtener todos los espacios de parqueo disponibles (no reservados y con estado disponible).
   * Filtra por el estado "Disponible" específico de la entidad parking_slot.
   *
   * @returns {Array} Lista de espacios de parqueo disponibles
   */
  static async findAvailable() {
    try {
      // Consulta SQL que filtra espacios no reservados y con estado "Disponible"
      // Busca el estado específico para la entidad parking_slot
      let sqlQuery = `
        SELECT ps.*,
               pz.type as zone_type,
               pz.name as zone_name,
               pz.capacity as zone_capacity,
               GROUP_CONCAT(DISTINCT p.name) as property_names,
               s.name as status_name,
               t.name as tariff_name,
               t.amount as tariff_amount
        FROM parking_slots ps
        LEFT JOIN parking_zones pz ON ps.parking_zone_id = pz.parking_zone_id
        LEFT JOIN vehicles v ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN properties p ON v.property_id = p.property_id
        LEFT JOIN statuses s ON ps.status_id = s.status_id
        LEFT JOIN tariffs t ON ps.tariff_id = t.tariff_id
        WHERE ps.is_reserved = 0
          AND s.entity = 'parking_slot'
          AND s.name = 'Disponible'
        GROUP BY ps.parking_slot_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error finding available parking slots:', error);
      return [];
    }
  }

  /**
   * Obtener todos los espacios de parqueo que están marcados como reservados.
   * 
   * @returns {Array} Lista de espacios de parqueo reservados
   */
  static async findReserved() {
    try {
      let sqlQuery = `
        SELECT ps.*,
               pz.type as zone_type,
               pz.name as zone_name,
               pz.capacity as zone_capacity,
               GROUP_CONCAT(DISTINCT p.name) as property_names,
               s.name as status_name,
               t.name as tariff_name,
               t.amount as tariff_amount
        FROM parking_slots ps
        LEFT JOIN parking_zones pz ON ps.parking_zone_id = pz.parking_zone_id
        LEFT JOIN vehicles v ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN properties p ON v.property_id = p.property_id
        LEFT JOIN statuses s ON ps.status_id = s.status_id
        LEFT JOIN tariffs t ON ps.tariff_id = t.tariff_id
        WHERE ps.is_reserved = 1
        GROUP BY ps.parking_slot_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error finding reserved parking slots:', error);
      return [];
    }
  }
  
  /**
   * Obtener todos los espacios de parqueo asociados a una propiedad específica.
   * Relaciona los espacios con sus zonas de parqueo que pertenecen a la propiedad.
   * 
   * @param {number} property_id - ID de la propiedad
   * @returns {Array} Lista de espacios de parqueo de la propiedad
   */
  static async findByProperty(property_id) {
    try {
      // Consulta SQL que busca espacios de parqueo por ID de propiedad
      // (a través de la relación con la tabla parking_zones)
      let sqlQuery = `
        SELECT ps.*, 
               pz.type as zone_type, 
               pz.name as zone_name,
               pz.capacity as zone_capacity, 
               s.name as status_name, 
               t.name as tariff_name,
               t.amount as tariff_amount
        FROM parking_slots ps 
        LEFT JOIN parking_zones pz ON ps.parking_zone_id = pz.parking_zone_id 
        LEFT JOIN statuses s ON ps.status_id = s.status_id 
        LEFT JOIN tariffs t ON ps.tariff_id = t.tariff_id 
        WHERE pz.property_id = ?
        ORDER BY ps.code
      `;
      const [result] = await connect.query(sqlQuery, [property_id]);
      return result;
    } catch (error) {
      console.error('Error finding parking slots by property:', error);
      return [];
    }
  }
}

export default ParkingSlotModel; 
import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar las operaciones de base de datos relacionadas con propiedades.
 * Proporciona métodos para realizar operaciones CRUD y consultas especializadas
 * sobre la tabla properties y sus relaciones con otras tablas del sistema.
 * 
 * @typedef {Object} PropertyFilters
 * @property {string} [searchTerm] - Término de búsqueda para name o description
 * @property {number} [propertyTypeId] - ID del tipo de propiedad
 * @property {string} [startDate] - Fecha inicial para filtrar (YYYY-MM-DD)
 * @property {string} [endDate] - Fecha final para filtrar (YYYY-MM-DD)
 * @property {string} [sortBy] - Campo por el cual ordenar
 * @property {string} [sortOrder] - Dirección del ordenamiento (ASC o DESC)
 */

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 255;
class PropertyModel {

  /**
   * Crear una nueva propiedad en la base de datos.
   *
   * @param {Object} propertyData - Datos de la propiedad a crear
   * @param {string} propertyData.name - Nombre de la propiedad
   * @param {string} propertyData.description - Descripción de la propiedad
   * @param {number} propertyData.property_type_id - ID del tipo de propiedad
   * @param {number} [propertyData.status_id] - ID del estado de la propiedad (opcional)
   * @returns {number|null} ID de la propiedad creada o null si hubo un error
   */
  static async create({ name, description, property_type_id, status_id = null }) {
    try {
      // Validación de longitud
      if (name.length > MAX_NAME_LENGTH) {
        throw new Error(`Name exceeds maximum length of ${MAX_NAME_LENGTH} characters`);
      }
      if (description && description.length > MAX_DESCRIPTION_LENGTH) {
        throw new Error(`Description exceeds maximum length of ${MAX_DESCRIPTION_LENGTH} characters`);
      }

      let sqlQuery = "INSERT INTO properties (name, description, property_type_id, status_id, is_deleted, created_at, updated_at) VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);";
      const [result] = await connect.query(sqlQuery, [name, description, property_type_id, status_id]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating property:', error);
      return null;
    }
  }

  /**
   * Obtener todas las propiedades con información de su tipo.
   * Realiza un join con la tabla property_types para obtener el nombre del tipo de propiedad.
   * 
   * @returns {Array} Lista de propiedades con información completa
   */
  static async show(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const params = [];
      let whereConditions = ['p.is_deleted = 0'];
      
      // Aplicar filtros
      if (filters.searchTerm) {
        whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
        const searchTerm = `%${filters.searchTerm}%`;
        params.push(searchTerm, searchTerm);
      }
      
      if (filters.propertyTypeId) {
        whereConditions.push('p.property_type_id = ?');
        params.push(filters.propertyTypeId);
      }
      
      if (filters.startDate) {
        whereConditions.push('p.created_at >= ?');
        params.push(filters.startDate);
      }
      
      if (filters.endDate) {
        whereConditions.push('p.created_at <= ?');
        params.push(filters.endDate);
      }
      
      // Construir ordenamiento
      const sortBy = filters.sortBy || 'p.created_at';
      const sortOrder = filters.sortOrder || 'DESC';
      
      // Obtener total de registros
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM properties p
        WHERE ${whereConditions.join(' AND ')}
      `;
      const [countResult] = await connect.query(countQuery, params);
      const total = countResult[0].total;
      
      // Consulta principal con paginación
      const query = `
        SELECT p.*, pt.name as property_type_name, s.name as status_name
        FROM properties p
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN statuses s ON p.status_id = s.status_id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;
      
      params.push(limit, offset);
      const [result] = await connect.query(query, params);
      
      return {
        data: result,
        pagination: {
          total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          hasMore: offset + result.length < total
        }
      };
    } catch (error) {
      console.error('Error retrieving properties:', error);
      return [];
    }
  }

  /**
   * Actualiza la información de una propiedad existente.
   *
   * @param {number} id - ID de la propiedad a actualizar
   * @param {Object} propertyData - Datos actualizados de la propiedad
   * @param {string} propertyData.name - Nombre actualizado
   * @param {string} propertyData.description - Descripción actualizada
   * @param {number} propertyData.property_type_id - ID actualizado del tipo de propiedad
   * @param {number} [propertyData.status_id] - ID del estado de la propiedad (opcional)
   * @returns {Object|null} Datos de la propiedad actualizada o null si hubo un error
   */
  static async update(id, { name, description, property_type_id, status_id }) {
    try {
      // Validación de longitud
      if (name.length > MAX_NAME_LENGTH) {
        throw new Error(`Name exceeds maximum length of ${MAX_NAME_LENGTH} characters`);
      }
      if (description && description.length > MAX_DESCRIPTION_LENGTH) {
        throw new Error(`Description exceeds maximum length of ${MAX_DESCRIPTION_LENGTH} characters`);
      }

      // Construir la consulta dinámicamente según los campos proporcionados
      let sqlQuery = "UPDATE properties SET name = ?, description = ?, property_type_id = ?";
      let params = [name, description, property_type_id];

      if (status_id !== undefined) {
        sqlQuery += ", status_id = ?";
        params.push(status_id);
      }

      sqlQuery += ", updated_at = CURRENT_TIMESTAMP WHERE property_id = ? AND is_deleted = 0;";
      params.push(id);

      const [result] = await connect.query(sqlQuery, params);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating property:', error);
      return null;
    }
  }

  /**
   * Elimina una propiedad de la base de datos.
   *
   * @param {number} id - ID de la propiedad a eliminar
   * @returns {boolean} true si la eliminación fue exitosa, false si no
   */
  static async delete(id) {
    try {
      // Implementación de soft delete
      let sqlQuery = "UPDATE properties SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE property_id = ? AND is_deleted = 0";
      const [result] = await connect.query(sqlQuery, [id]);
      // Verificar si se marcó como eliminado
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  }

  /**
   * Actualiza solo el estado de una propiedad (activar/desactivar).
   *
   * @param {number} id - ID de la propiedad
   * @param {number} statusId - ID del nuevo estado
   * @returns {Object|null} Datos de la propiedad actualizada o null si hubo un error
   */
  static async updateStatus(id, statusId) {
    try {
      let sqlQuery = "UPDATE properties SET status_id = ?, updated_at = CURRENT_TIMESTAMP WHERE property_id = ? AND is_deleted = 0;";
      const [result] = await connect.query(sqlQuery, [statusId, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating property status:', error);
      return null;
    }
  }

  /**
   * Buscar una propiedad por su ID y obtiene información completa
   * incluyendo datos del tipo de propiedad.
   *
   * @param {number} id - ID de la propiedad a buscar
   * @returns {Object|null} Datos de la propiedad o null si no se encuentra
   */
  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT p.*, pt.name as property_type_name, s.name as status_name
        FROM properties p
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN statuses s ON p.status_id = s.status_id
        WHERE p.property_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding property by ID:', error);
      return null;
    }
  }

  /**
   * Buscar una propiedad por su nombre.
   * 
   * @param {string} name - Nombre de la propiedad a buscar
   * @returns {Object|null} Datos de la propiedad o null si no se encuentra
   */
  static async findByName(name) {
    try {
      // Ejecuta la consulta SQL para buscar una propiedad por su nombre
      let sqlQuery = 'SELECT * FROM properties WHERE name = ?';
      const [result] = await connect.query(sqlQuery, [name]);
      return result[0];
    } catch (error) {
      console.error('Error finding property by name:', error);
      return null;
    }
  }

  /**
   * Buscar propiedades por su tipo.
   * 
   * @param {number} property_type_id - ID del tipo de propiedad
   * @returns {Array} Lista de propiedades del tipo especificado
   */
  static async findByType(property_type_id) {
    try {
      let sqlQuery = 'SELECT * FROM properties WHERE property_type_id = ?';
      const [result] = await connect.query(sqlQuery, [property_type_id]);
      return result;
    } catch (error) {
      console.error('Error finding properties by type:', error);
      return [];
    }
  }

  /**
   * Obtener los residentes de una propiedad específica.
   * Utiliza un procedimiento almacenado para obtener la información detallada.
   * 
   * @param {number} propertyId - ID de la propiedad
   * @returns {Array} Lista de residentes de la propiedad
   */
  static async getResidents(propertyId) {
    try {
      // Llama al procedimiento almacenado que obtiene los residentes de una propiedad
      let sqlQuery = 'CALL sp_get_property_residents(?)';
      const [result] = await connect.query(sqlQuery, [propertyId]);
      return result[0]; // Retorna el primer conjunto de resultados
    } catch (error) {
      console.error('Error getting property residents:', error);
      return [];
    }
  }

  /**
   * Obtener las propiedades con información de sus zonas de parqueo.
   * 
   * @returns {Array} Lista de propiedades con datos de zonas de parqueo
   */
  static async getWithParkingZones() {
    try {
      let sqlQuery = `
        SELECT p.*, 
               COUNT(pz.parking_zone_id) as parking_zones_count,
               GROUP_CONCAT(DISTINCT CONCAT(pz.type, ':', pz.capacity) SEPARATOR ', ') as parking_info
        FROM properties p
        LEFT JOIN parking_zones pz ON p.property_id = pz.property_id 
        LEFT JOIN statuses s ON pz.status_id = s.status_id AND s.name = 'Activo'
        GROUP BY p.property_id
        ORDER BY p.name
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error getting properties with parking zones:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas generales sobre las propiedades en el sistema.
   * Calcula totales por tipo de propiedad y número de residentes.
   * 
   * @returns {Object|null} Objeto con estadísticas de propiedades o null si hubo un error
   */
  static async getStatistics() {
    try {
      // Consulta SQL que calcula estadísticas de propiedades y residentes
      let sqlQuery = `
        SELECT 
          COUNT(*) as total_properties,
          COUNT(CASE WHEN pt.name = 'Apartamento' THEN 1 END) as apartments,
          COUNT(CASE WHEN pt.name = 'Casa' THEN 1 END) as houses,
          (SELECT COUNT(DISTINCT user_id) FROM user_properties up 
           JOIN statuses s ON up.status_id = s.status_id 
           WHERE s.name = 'Activo') as total_residents
        FROM properties p
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result[0];
    } catch (error) {
      console.error('Error getting property statistics:', error);
      return null;
    }
  }

  /**
   * Obtener todas las propiedades activas con información de su tipo.
   *
   * @returns {Array} Lista de propiedades activas con información completa
   */
  static async showActive() {
    try {
      let sqlQuery = `
        SELECT p.*, pt.name as property_type_name, s.name as status_name
        FROM properties p
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN statuses s ON p.status_id = s.status_id
        ORDER BY p.property_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing active properties:', error);
      return [];
    }
  }

  /**
   * Buscar una propiedad activa por su ID y obtiene información completa
   * incluyendo datos del tipo de propiedad.
   *
   * @param {number} id - ID de la propiedad a buscar
   * @returns {Object|null} Datos de la propiedad activa o null si no se encuentra
   */
  static async findByIdActive(id) {
    try {
      // Consulta SQL que obtiene una propiedad activa por su ID
      let sqlQuery = `
        SELECT p.*, pt.name as property_type_name, s.name as status_name
        FROM properties p
        LEFT JOIN property_types pt ON p.property_type_id = pt.property_type_id
        LEFT JOIN statuses s ON p.status_id = s.status_id
        WHERE p.property_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding active property by ID:', error);
      return null;
    }
  }

  /**
   * Obtener todos los tipos de propiedad activos en el sistema.
   * 
   * @returns {Array} Lista de tipos de propiedad activos
   */
  static async getPropertyTypes() {
    try {
      let sqlQuery = "SELECT * FROM property_types WHERE is_active = 1";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error getting property types:', error);
      return [];
    }
  }
}

export default PropertyModel;
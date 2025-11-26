import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar las operaciones relacionadas con estados en la base de datos.
 * Proporciona métodos para crear, consultar, actualizar y eliminar estados,
 * así como para realizar búsquedas por diferentes criterios como ID, nombre o entidad.
 */
class StatusModel {

  /**
   * Convierte la primera letra en mayúscula y el resto en minúsculas.
   *
   * Ejemplo:
   * - "activo" → "Activo"
   * - "PENDIENTE" → "Pendiente"
   * - "en revisión" → "En revisión"
   *
   * @param {string} name - Nombre del estado
   * @returns {string} Nombre en mayúscula
   */
  static capitalizeName(name) {
    if (!name || typeof name !== 'string') {
      return name;
    }
    // Trim para quitar espacios al inicio y final
    const trimmedName = name.trim();
    // Primera letra en mayúscula + resto en minúscula
    return trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();
  }

  /**
   * Validar los datos antes de crear o actualizar un estado.
   *
   * Validaciones:
   * - entity es obligatorio (no puede ser null, undefined o vacío)
   * - name es obligatorio
   *
   * @param {Object} statusData - Datos del estado a validar
   * @param {string} statusData.name - Nombre del estado
   * @param {string} statusData.entity - Entidad a la que pertenece
   * @returns {Object} Objeto con { isValid: boolean, errors: Array, data: Object }
   */
  static validateStatusData(statusData) {
    const errors = [];

    // Validar que entity sea obligatorio
    if (!statusData.entity || statusData.entity.trim() === '') {
      errors.push('El campo "entity" es obligatorio y no puede estar vacío.');
    }

    // Validar que name sea obligatorio
    if (!statusData.name || statusData.name.trim() === '') {
      errors.push('El campo "name" es obligatorio y no puede estar vacío.');
    }

    // Si hay errores, retornar sin procesar
    if (errors.length > 0) {
      return {
        isValid: false,
        errors: errors,
        data: null
      };
    }

    // Capitalizar el nombre automáticamente
    const processedData = {
      ...statusData,
      name: this.capitalizeName(statusData.name),
      entity: statusData.entity.trim()
    };

    return {
      isValid: true,
      errors: [],
      data: processedData
    };
  }

  /**
   * Crear un nuevo estado en la base de datos.
   *
   * Validaciones:
   * - El campo entity es obligatorio
   *
   * @param {Object} statusData - Datos del estado a crear
   * @param {string} statusData.name - Nombre del estado
   * @param {string} statusData.description - Descripción detallada del estado
   * @param {string} statusData.entity - Entidad a la que pertenece el estado (OBLIGATORIO)
   * @param {number} statusData.is_active - Indica si el estado está activo (1) o inactivo (0)
   * @returns {number|null} ID del estado creado o null si hay un error
   */
  static async create({ name, description, entity, is_active }) {
    try {
      // Validar los datos antes de crear
      const validation = this.validateStatusData({ name, entity });

      if (!validation.isValid) {
        // Si hay errores de validación, mostrarlos en consola y retornar null
        console.error('Validation errors:', validation.errors);
        throw new Error(validation.errors.join(', '));
      }

      // Usar los datos procesados
      const { name: capitalizedName, entity: trimmedEntity } = validation.data;

      let sqlQuery = `
        INSERT INTO statuses
        (name, description, entity, is_active, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      const [result] = await connect.query(sqlQuery, [
        capitalizedName,
        description,
        trimmedEntity,
        is_active
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating status:', error);
      return null;
    }
  }

  /**
   * Obtener todos los estados registrados en el sistema.
   * Los resultados se ordenan por ID de estado.
   * 
   * @returns {Array} Lista de estados o array vacío si hay un error
   */
  static async show() {
    try {
      let sqlQuery = `SELECT * FROM statuses ORDER BY status_id`;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing statuses:', error);
      return [];
    }
  }

  /**
   * Actualiza los datos de un estado existente.
   *
   * Validaciones:
   * - El campo entity es obligatorio
   *
   * @param {number} id - ID del estado a actualizar
   * @param {Object} statusData - Nuevos datos del estado
   * @param {string} statusData.name - Nuevo nombre del estado
   * @param {string} statusData.description - Nueva descripción del estado
   * @param {string} statusData.entity - Nueva entidad del estado (OBLIGATORIO)
   * @param {number} statusData.is_active - Nuevo valor de activación (1 para activo, 0 para inactivo)
   * @returns {Object|null} Estado actualizado o null si hay un error
   */
  static async update(id, { name, description, entity, is_active }) {
    try {
      // Validar los datos antes de actualizar
      const validation = this.validateStatusData({ name, entity });

      if (!validation.isValid) {
        // Si hay errores de validación, mostrarlos en consola y retornar null
        console.error('Validation errors:', validation.errors);
        throw new Error(validation.errors.join(', '));
      }

      // Usar los datos procesados
      const { name: capitalizedName, entity: trimmedEntity } = validation.data;

      let sqlQuery = `
        UPDATE statuses
        SET name = ?,
            description = ?,
            entity = ?,
            is_active = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE status_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [
        capitalizedName,
        description,
        trimmedEntity,
        is_active,
        id
      ]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('Error updating status:', error);
      return null;
    }
  }

  /**
   * Elimina un estado de la base de datos.
   * 
   * @param {number} id - ID del estado a eliminar
   * @returns {boolean} true si se eliminó correctamente, false si hubo un error
   */
  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM statuses WHERE status_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting status:', error);
      return false;
    }
  }

  /**
   * Buscar un estado específico por su ID.
   * 
   * @param {number} id - ID del estado a buscar
   * @returns {Object|null} Información del estado o null si no se encuentra
   */
  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM statuses WHERE status_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding status by ID:', error);
      return null;
    }
  }

  /**
   * Obtener todos los estados activos del sistema.
   * Filtra solo los estados que tienen el campo is_active = 1.
   * 
   * @returns {Array} Lista de estados activos o array vacío si hay un error
   */
  static async showActive() {
    try {
      let sqlQuery = `
        SELECT * 
        FROM statuses 
        WHERE is_active = 1 
        ORDER BY status_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing active statuses:', error);
      return [];
    }
  }

  /**
   * Buscar un estado activo específico por su ID.
   * Solo retorna resultados si el estado está activo (is_active = 1).
   * 
   * @param {number} id - ID del estado activo a buscar
   * @returns {Object|null} Información del estado activo o null si no se encuentra
   */
  static async findByIdActive(id) {
    try {
      let sqlQuery = `
        SELECT * 
        FROM statuses 
        WHERE status_id = ? 
        AND is_active = 1
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding active status by ID:', error);
      return null;
    }
  }

  /**
   * Buscar un estado específico por su nombre.
   * 
   * @param {string} name - Nombre del estado a buscar
   * @returns {Object|null} Información del estado o null si no se encuentra
   */
  static async findByName(name) {
    try {
      let sqlQuery = `SELECT * FROM statuses WHERE name = ?`;
      const [result] = await connect.query(sqlQuery, [name]);
      return result[0];
    } catch (error) {
      console.error('Error finding status by name:', error);
      return null;
    }
  }

  /**
   * Buscar estados activos asociados a una entidad específica.
   * Filtra por el tipo de entidad y que estén activos (is_active = 1).
   *
   * @param {string} entity - Nombre de la entidad a buscar
   * @returns {Array} Lista de estados activos para la entidad o array vacío si no hay coincidencias
   */
  static async findByEntity(entity) {
    try {
      let sqlQuery = `
        SELECT *
        FROM statuses
        WHERE entity = ?
        AND is_active = 1
      `;
      const [result] = await connect.query(sqlQuery, [entity]);
      return result;
    } catch (error) {
      console.error('Error finding statuses by entity:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los estados que pertenecen a una entidad específica.
   * Este método filtra los estados por el campo 'entity' para obtener solo
   * los estados aplicables a una entidad particular del sistema.
   *
   * @param {string} entity - Nombre de la entidad ('usuarios', 'cpcg', 'notification', 'package')
   * @returns {Array} Array de objetos con los estados de la entidad especificada
   */
  static async getByEntity(entity) {
    try {
      let sqlQuery = `
        SELECT status_id, name, description, entity, is_active, created_at
        FROM statuses
        WHERE entity = ?
        AND is_active = 1
        ORDER BY name ASC
      `;
      const [result] = await connect.query(sqlQuery, [entity]);
      return result;
    } catch (error) {
      console.error('Error getting statuses by entity:', error);
      return [];
    }
  }

  /**
   * Validar si un estado pertenece a una entidad específica.
   * Útil para verificar que se use el estado correcto según la entidad.
   *
   * @param {number} statusId - ID del estado a validar
   * @param {string} entity - Nombre de la entidad esperada ('cpcg', 'user', 'notification')
   * @returns {boolean} true si el estado pertenece a la entidad, false en caso contrario
   */
  static async validateStatusForEntity(statusId, entity) {
    try {
      let sqlQuery = `
        SELECT status_id
        FROM statuses
        WHERE status_id = ?
        AND entity = ?
        AND is_active = 1
      `;
      const [result] = await connect.query(sqlQuery, [statusId, entity]);
      return result.length > 0; // Retorna true si encuentra el estado para esa entidad
    } catch (error) {
      console.error('Error validating status for entity:', error);
      return false;
    }
  }
}

export default StatusModel;
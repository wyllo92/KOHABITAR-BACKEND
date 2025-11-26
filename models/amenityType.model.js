/**
 * Importar la conexión a la base de datos MySQL.
 * Esta conexión permite ejecutar consultas SQL en la base de datos.
 */
import { connect } from '../config/db/connectMysql.js';

/**
 * Clase que maneja todas las operaciones relacionadas con los tipos de zonas comunes (amenity types).
 * Contiene métodos estáticos para crear, leer, actualizar y eliminar tipos de zonas comunes.
 */
class AmenityTypeModel {
  /**
   * Crear un nuevo tipo de zona común en la base de datos.
   * 
   * @param {string} name - Nombre del tipo de zona común.
   * @param {string} description - Descripción del tipo de zona común.
   * @returns {number|null} - ID del tipo de zona común creado o null si hay error.
   */
  static async create({ name, description }) {
    try {
      // Preparar y ejecuta la consulta SQL para insertar un nuevo tipo de zona común
      // Por defecto, el nuevo tipo se crea como activo (is_active = 1)
      const sqlQuery = 'INSERT INTO amenity_types (name, description, is_active) VALUES (?, ?, 1)';
      const [result] = await connect.query(sqlQuery, [name, description]);
      // Retornar el ID generado para el nuevo tipo de zona común
      return result.insertId;
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error creating amenity type:', error);
      return null;
    }
  }
  
  /**
   * Obtener todos los tipos de zonas comunes de la base de datos con paginación.
   * 
   * @param {Object} options - Opciones de paginación
   * @param {number} options.page - Número de página actual (empieza en 1)
   * @param {number} options.limit - Cantidad de elementos por página
   * @returns {Object} - Objeto con la lista de tipos de zonas comunes y metadata de paginación
   */
  static async findAll({ page = 1, limit = 10 } = {}) {
    try {
      // Calcula el offset basado en la página y el límite
      const offset = (page - 1) * limit;
      
      // Obtener el total de registros para calcular el total de páginas
      const [countResult] = await connect.query('SELECT COUNT(*) as total FROM amenity_types');
      const total = countResult[0].total;
      
      // Preparar y ejecuta la consulta SQL con paginación
      const sqlQuery = 'SELECT * FROM amenity_types LIMIT ? OFFSET ?';
      const [result] = await connect.query(sqlQuery, [limit, offset]);
      
      // Calcular el total de páginas
      const totalPages = Math.ceil(total / limit);
      
      // Retornar el objeto con los resultados y metadata de paginación
      return {
        data: result,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      // Registrar el error y retorna un objeto con arrays vacíos en caso de fallo
      console.error('Error finding all amenity types:', error);
      return {
        data: [],
        pagination: {
          total: 0,
          totalPages: 0,
          currentPage: page,
          limit,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
  }

  /**
   * Obtener solo los tipos de zonas comunes activos de la base de datos.
   * 
   * @returns {Array} - Lista de tipos de zonas comunes activos.
   */
  static async findActive() {
    try {
      // Preparar y ejecuta la consulta SQL para obtener solo los tipos activos
      // Filtrar por is_active = 1 que representa a los tipos activos
      const sqlQuery = 'SELECT * FROM amenity_types WHERE is_active = 1';
      const [result] = await connect.query(sqlQuery);
      // Retornar el array con los tipos de zonas comunes activos
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding active amenity types:', error);
      return [];
    }
  }
  
  /**
   * Buscar un tipo de zona común por su ID.
   * 
   * @param {number} id - ID del tipo de zona común a buscar.
   * @returns {Object|null} - Objeto con los datos del tipo de zona común o null si no se encuentra.
   */
  static async findById(id) {
    try {
      // Preparar y ejecutar la consulta SQL para buscar por ID específico
      const sqlQuery = 'SELECT * FROM amenity_types WHERE amenity_type_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      // Retornar el primer resultado (debe ser único por ser búsqueda por ID primaria)
      // Si no hay resultados, result[0] será undefined y se interpretará como null
      return result[0];
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error finding amenity type by ID:', error);
      return null;
    }
  }
  
  /**
   * Actualizar un tipo de zona común existente en la base de datos.
   * 
   * @param {number} id - ID del tipo de zona común a actualizar.
   * @param {Object} datos - Objeto con los datos a actualizar.
   * @param {string} datos.name - Nuevo nombre para el tipo de zona común.
   * @param {string} datos.description - Nueva descripción para el tipo de zona común.
   * @param {number} datos.is_active - Estado de activación (1 = activo, 0 = inactivo).
   * @returns {Object|null} - Objeto con los datos actualizados o null si hay error.
   */
  static async update(id, { name, description, is_active }) {
    try {
      // Preparar y ejecutar la consulta SQL para actualizar el tipo de zona común
      const sqlQuery = 'UPDATE amenity_types SET name = ?, description = ?, is_active = ? WHERE amenity_type_id = ?';
      const [result] = await connect.query(sqlQuery, [name, description, is_active, id]);
      
      // Si se actualizó correctamente (al menos una fila afectada), retorna los datos actualizados
      // Si no, retorna null
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error updating amenity type:', error);
      return null;
    }
  }
  
  /**
   * Eliminar un tipo de zona común de la base de datos.
   * 
   * @param {number} id - ID del tipo de zona común a eliminar.
   * @returns {boolean} - true si se eliminó correctamente, false si no.
   */
  static async delete(id) {
    try {
      // Preparar y ejecutar la consulta SQL para eliminar el tipo de zona común
      const sqlQuery = 'DELETE FROM amenity_types WHERE amenity_type_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      
      // Retornar true si se eliminó al menos una fila, false en caso contrario
      // result.affectedRows contiene el número de filas afectadas por la operación
      return result.affectedRows > 0;
    } catch (error) {
      // Registrar el error y retorna false en caso de fallo
      // Los errores pueden ocurrir por restricciones de clave foránea si el tipo está en uso
      console.error('Error deleting amenity type:', error);
      return false;
    }
  }
  
  /**
   * Buscar un tipo de zona común por su nombre.
   * Útil para verificar si ya existe un tipo con el mismo nombre antes de crear uno nuevo.
   * 
   * @param {string} name - Nombre del tipo de zona común a buscar.
   * @returns {Object|null} - Objeto con los datos del tipo de zona común o null si no se encuentra.
   */
  static async findByName(name) {
    try {
      // Preparar y ejecutar la consulta SQL para buscar por nombre exacto
      const sqlQuery = 'SELECT * FROM amenity_types WHERE name = ?';
      const [result] = await connect.query(sqlQuery, [name]);
      // Retorna el primer resultado que coincida con el nombre
      // Si no hay coincidencias, result[0] será undefined y se interpretará como null
      return result[0];
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error finding amenity type by name:', error);
      return null;
    }
  }
  
  /**
   * Cambiar el estado de activación de un tipo de zona común.
   * Este método es más específico que update y se usa solo para cambiar el estado activo/inactivo.
   * 
   * @param {number} id - ID del tipo de zona común a modificar.
   * @param {boolean} isActive - true para activar, false para desactivar.
   * @returns {Object|null} - Objeto con los datos actualizados o null si hay error.
   */
  static async toggleActive(id, isActive) {
    try {
      // Preparar y ejecuta la consulta SQL para actualizar solo el estado de activación
      // Convertir el valor booleano isActive a 1 (true) o 0 (false) para la base de datos
      const sqlQuery = 'UPDATE amenity_types SET is_active = ? WHERE amenity_type_id = ?';
      const [result] = await connect.query(sqlQuery, [isActive ? 1 : 0, id]);
      
      // Si se actualizó correctamente, retorna los datos actualizados
      // Si no, retorna null
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error toggling amenity type active status:', error);
      return null;
    }
  }
}

/**
 * Exportar la clase para ser utilizada en otros archivos.
 */
export default AmenityTypeModel; 
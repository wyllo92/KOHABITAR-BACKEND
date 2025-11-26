/**
 * Importar la conexión a la base de datos MySQL.
 * Esta conexión permite ejecutar consultas SQL en la base de datos.
 */
import { connect } from '../config/db/connectMysql.js';

/**
 * Clase que maneja todas las operaciones relacionadas con las zonas comunes (amenities).
 * Contiene métodos estáticos para crear, leer, actualizar y eliminar zonas comunes.
 */
class AmenityModel {

  /**
   * Crear una nueva zona común en la base de datos.
   * @param {string} name - Nombre de la zona común.
   * @param {number} capacity - Capacidad máxima de personas.
   * @param {string} description - Descripción detallada de la zona común.
   * @param {string} amenity_photo - Ruta o URL de la imagen de la zona común.
   * @param {number} status_id - ID del estado (activo, inactivo, etc.).
   * @param {number} tariff_id - ID de la tarifa asociada.
   * @param {number} property_id - ID de la propiedad a la que pertenece.
   * @param {number} amenity_type_id - ID del tipo de zona común (piscina, salón, etc.).
   * @returns {number|null} - ID de la zona común creada o null si hay error.
   */
  static async create({ name, capacity, description, amenity_photo, status_id, tariff_id, amenity_type_id }) {
    try {
      // Preparar y ejecutar la consulta SQL para insertar la nueva zona común
      let sqlQuery = "INSERT INTO amenities (name, capacity, description, amenity_photo, status_id, tariff_id, amenity_type_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);";
      const [result] = await connect.query(sqlQuery, [name, capacity, description, amenity_photo, status_id, tariff_id, amenity_type_id]);
      // Retornar el ID generado para la nueva zona común
      return result.insertId;
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error creando la zona común:', error);
      return null;
    }
  }

  /**
   * Obtener todas las zonas comunes de la base de datos sin filtros.
   * Este método devuelve TODAS las zonas comunes independientemente de su estado.
   * Incluye zonas comunes en todos los estados: Disponible, En Mantenimiento, Cerrada, Reservada, Fuera de Servicio.
   *
   * Útil para paneles administrativos donde se necesita ver todas las zonas comunes.
   *
   * @returns {Array} - Lista de todas las zonas comunes con sus datos relacionados.
   */
  static async show() {
    try {
      // Preparar una consulta SQL que combina datos de múltiples tablas usando JOIN
      // Obtener información del tipo de zona común, estado y tarifa
      // SIN FILTROS de estado - devuelve todas las zonas comunes
      let sqlQuery = `
   SELECT a.*,
     at.name AS amenity_type_name,
     s.name AS status_name,
     t.name AS tariff_name,
     t.amount AS tariff_amount
   FROM amenities a
   LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id
   LEFT JOIN statuses s ON a.status_id = s.status_id
   LEFT JOIN tariffs t ON a.tariff_id = t.tariff_id
   ORDER BY a.amenity_id
      `;
      // Ejecutar la consulta y obtiene los resultados
      const [result] = await connect.query(sqlQuery);
      // Retornar el array de zonas comunes
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error mostrando zonas comunes: ', error);
      return [];
    }
  }

  /**
   * Obtener sólo las zonas comunes activas de la base de datos.
   * @returns {Array} - Lista de zonas comunes activas con sus datos relacionados.
   */
  static async showActive() {
    try {
      // Filtra las zonas comunes con estados disponibles para uso (Disponible, Reservada, etc.)
      // Excluye estados como "En Mantenimiento", "Cerrada" y "Fuera de Servicio"
      let sqlQuery = `
   SELECT a.*,
     at.name AS amenity_type_name,
     s.name AS status_name,
     t.name AS tariff_name,
     t.amount AS tariff_amount
   FROM amenities a
   LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id
   LEFT JOIN statuses s ON a.status_id = s.status_id
   LEFT JOIN tariffs t ON a.tariff_id = t.tariff_id
   WHERE s.entity = 'amenity'
     AND s.name NOT IN ('En Mantenimiento', 'Cerrada', 'Fuera de Servicio')
     AND s.is_active = 1
   ORDER BY a.amenity_id
      `;
      // Ejecutar la consulta y obtiene los resultados
      const [result] = await connect.query(sqlQuery);
      // Retornar el array de zonas comunes activas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error mostrando zonas comunes activas: ', error);
      return [];
    }
  }

  /**
   * Actualizar los datos de una zona común existente.
   * @param {number} id - ID de la zona común a actualizar.
   * @param {Object} datos - Objeto con los nuevos datos de la zona común.
   * @returns {Object|null} - Objeto con los datos actualizados o null si hay error.
   */
  static async update(id, { name, capacity, description, amenity_photo, status_id, tariff_id, property_id, amenity_type_id }) {
    try {
      // Preparar y ejecuta la consulta SQL para actualizar la zona común
  let sqlQuery = "UPDATE amenities SET name = ?, capacity = ?, description = ?, amenity_photo = ?, status_id = ?, tariff_id = ?, amenity_type_id = ?, updated_at = CURRENT_TIMESTAMP WHERE amenity_id = ?;";
  const [result] = await connect.query(sqlQuery, [name, capacity, description, amenity_photo, status_id, tariff_id, amenity_type_id, id]);
      
      // Si se actualizó correctamente (al menos una fila afectada), retorna los datos actualizados
      // Si no, retorna null
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error actualizando la zona común: ', error);
      return null;
    }
  }

  /**
   * Eliminar una zona común de la base de datos.
   * @param {number} id - ID de la zona común a eliminar.
   * @returns {boolean} - true si se eliminó correctamente, false si no.
   */
  static async delete(id) {
    try {
      // Preparar y ejecuta la consulta SQL para eliminar la zona común
      let sqlQuery = "DELETE FROM amenities WHERE amenity_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      
      // Retornar true si se eliminó al menos una fila, false en caso contrario
      return result.affectedRows > 0;
    } catch (error) {
      // Registrar el error y retorna false en caso de fallo
      console.error('Error borrando la zona común: ', error);
      return false;
    }
  }

  /**
   * Buscar una zona común por su ID, independientemente de su estado.
   * @param {number} id - ID de la zona común a buscar.
   * @returns {Object|null} - Objeto con los datos de la zona común o null si no se encuentra.
   */
  static async findById(id) {
    try {
      // Preparar una consulta SQL que combina la tabla de zonas comunes con sus tablas relacionadas
      let sqlQuery = `
   SELECT a.*, 
     at.name AS amenity_type_name, 
     s.name AS status_name, 
     t.name AS tariff_name, 
     t.amount AS tariff_amount 
   FROM amenities a 
   LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id 
   LEFT JOIN statuses s ON a.status_id = s.status_id 
   LEFT JOIN tariffs t ON a.tariff_id = t.tariff_id 
   WHERE a.amenity_id = ?
      `;
      // Ejecutar la consulta pasando el ID como parámetro
      const [result] = await connect.query(sqlQuery, [id]);
      // Retornar el primer resultado (debe ser único por ser búsqueda por ID)
      return result[0];
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error buscando zona común por su id:', error);
      return null;
    }
  }

  /**
   * Buscar una zona común por su ID que además esté activa.
   * @param {number} id - ID de la zona común a buscar.
   * @returns {Object|null} - Objeto con los datos de la zona común o null si no se encuentra.
   */
  static async findByIdActive(id) {
    try {
      // Busca una zona común por ID que esté disponible para uso
      // Excluye estados como "En Mantenimiento", "Cerrada" y "Fuera de Servicio"
      let sqlQuery = `
   SELECT a.*,
     at.name AS amenity_type_name,
     s.name AS status_name,
     t.name AS tariff_name,
     t.amount AS tariff_amount
   FROM amenities a
   LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id
   LEFT JOIN statuses s ON a.status_id = s.status_id
   LEFT JOIN tariffs t ON a.tariff_id = t.tariff_id
   WHERE a.amenity_id = ?
     AND s.entity = 'amenity'
     AND s.name NOT IN ('En Mantenimiento', 'Cerrada', 'Fuera de Servicio')
     AND s.is_active = 1
      `;
      // Ejecutar la consulta pasando el ID como parámetro
      const [result] = await connect.query(sqlQuery, [id]);
      // Retornar el primer resultado o null si no encuentra nada
      return result[0];
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error buscando zona común por estado: ', error);
      return null;
    }
  }

  /**
   * Buscar una zona común por su nombre.
   * @param {string} name - Nombre de la zona común a buscar.
   * @returns {Object|null} - Objeto con los datos de la zona común o null si no se encuentra.
   */
  static async findByName(name) {
    try {
      // Preparar una consulta SQL para buscar por nombre exacto
      let sqlQuery = `
   SELECT a.*, 
     at.name AS amenity_type_name, 
     s.name AS status_name, 
     t.name AS tariff_name, 
     t.amount AS tariff_amount 
   FROM amenities a 
   LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id 
   LEFT JOIN statuses s ON a.status_id = s.status_id 
   LEFT JOIN tariffs t ON a.tariff_id = t.tariff_id 
   WHERE a.name = ?
      `;
      // Ejecutar la consulta pasando el nombre como parámetro
      const [result] = await connect.query(sqlQuery, [name]);
      // Retornar el primer resultado (asumiendo que los nombres son únicos)
      return result[0];
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error buscando zona común por nombre:', error);
      return null;
    }
  }

  /**
   * Buscar todas las zonas comunes asociadas a una propiedad específica.
   * @param {number} property_id - ID de la propiedad.
   * @returns {Array} - Lista de zonas comunes que pertenecen a la propiedad.
   */
  static async findByPropertyId(property_id) {
    try {
      // Preparar una consulta SQL para filtrar por ID de propiedad
      let sqlQuery = `
        SELECT a.*, 
               at.name AS amenity_type_name, 
               p.name AS property_name, 
               s.name AS status_name, 
               t.name AS tariff_name, 
               t.amount AS tariff_amount 
        FROM amenities a 
        LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id 
        LEFT JOIN properties p ON a.property_id = p.property_id 
        LEFT JOIN statuses s ON a.status_id = s.status_id 
        LEFT JOIN tariffs t ON a.tariff_id = t.tariff_id 
        WHERE a.property_id = ?
      `;
      // Ejecutar la consulta pasando el ID de propiedad como parámetro
      const [result] = await connect.query(sqlQuery, [property_id]);
      // Retornar el array de resultados (puede ser vacío si no hay coincidencias)
      return result;
    } catch (error) {
      // Registrar el error y retorna array vacío en caso de fallo
      console.error('Error buscando zona común por id propiedad: ', error);
      return [];
    }
  }

  /**
   * Buscar todas las zonas comunes de un tipo específico.
   * @param {number} amenity_type_id - ID del tipo de zona común.
   * @returns {Array} - Lista de zonas comunes del tipo especificado.
   */
  static async findByType(amenity_type_id) {
    try {
      // Preparar una consulta SQL para filtrar por tipo de zona común
      let sqlQuery = `
   SELECT a.*, 
     at.name AS amenity_type_name, 
     s.name AS status_name, 
     t.name AS tariff_name, 
     t.amount AS tariff_amount 
   FROM amenities a 
   LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id 
   LEFT JOIN statuses s ON a.status_id = s.status_id 
   LEFT JOIN tariffs t ON a.tariff_id = t.tariff_id 
   WHERE a.amenity_type_id = ?
      `;
      // Ejecutar la consulta pasando el ID del tipo como parámetro
      const [result] = await connect.query(sqlQuery, [amenity_type_id]);
      // Retornar el array de resultados
      return result;
    } catch (error) {
      // Registrar el error y retorna array vacío en caso de fallo
      console.error('Error buscando zona común por tipo:', error);
      return [];
    }
  }

  /**
   * Obtener todas las zonas comunes con estado activo.
   * Este método es similar a showActive(), pero es utilizado en contextos diferentes.
   * @returns {Array} - Lista de zonas comunes activas.
   */
  static async findActive() {
    try {
      // Obtiene zonas comunes disponibles para uso
      // Excluye estados como "En Mantenimiento", "Cerrada" y "Fuera de Servicio"
      let sqlQuery = `
   SELECT a.*,
     at.name AS amenity_type_name,
     s.name AS status_name,
     t.name AS tariff_name,
     t.amount AS tariff_amount
   FROM amenities a
   LEFT JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id
   LEFT JOIN statuses s ON a.status_id = s.status_id
   LEFT JOIN tariffs t ON a.tariff_id = t.tariff_id
   WHERE s.entity = 'amenity'
     AND s.name NOT IN ('En Mantenimiento', 'Cerrada', 'Fuera de Servicio')
     AND s.is_active = 1
      `;
      // Ejecutar la consulta
      const [result] = await connect.query(sqlQuery);
      // Retornar el array de resultados
      return result;
    } catch (error) {
      // Registrar el error y retorna array vacío en caso de fallo
      console.error('Error buscando zonas comunes por estado:', error);
      return [];
    }
  }
  
  /**
   * Actualizar la foto de una zona común existente.
   * @param {number} id - ID de la zona común.
   * @param {string} photoPath - Ruta o URL de la nueva foto.
   * @returns {boolean} - true si se actualizó correctamente, false si no.
   */
  static async uploadPhoto(id, photoPath) {
    try {
      // Preparar y ejecuta la consulta SQL para actualizar solo el campo de la foto
      let sqlQuery = "UPDATE amenities SET amenity_photo = ?, updated_at = CURRENT_TIMESTAMP WHERE amenity_id = ?;";
      const [result] = await connect.query(sqlQuery, [photoPath, id]);
      // Retornar true si se actualizó al menos una fila
      return result.affectedRows > 0;
    } catch (error) {
      // Registrar el error y retorna false en caso de fallo
      console.error('Error al cargar la foto de la zona común:', error);
      return false;
    }
  }
}

// Exportar la clase para ser utilizada en otros archivos
export default AmenityModel;
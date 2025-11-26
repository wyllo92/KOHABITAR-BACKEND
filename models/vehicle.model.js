import { connect } from '../config/db/connectMysql.js';

/**
 * @class VehicleModel
 * @description Clase que gestiona las operaciones relacionadas con vehículos en la base de datos
 * Proporciona métodos para crear, consultar, actualizar y eliminar información de vehículos
 * registrados en el sistema, así como obtener estadísticas y relaciones con otros módulos.
 */
class VehicleModel {

  /**
   * @method create
   * @description Crear un nuevo registro de vehículo en la base de datos
   * @param {Object} params - Objeto con los datos del vehículo
   * @param {string} params.model - Modelo del vehículo
   * @param {string} params.type - Tipo de vehículo (carro, moto, etc.)
   * @param {string} params.color - Color del vehículo
   * @param {string} params.license_plate - Placa del vehículo
   * @param {string} params.vehicle_photo - URL o ruta de la foto del vehículo (opcional)
   * @param {number} params.user_id - ID del propietario del vehículo
   * @param {number} params.property_id - ID de la propiedad a la que está asociado el vehículo
   * @param {number} params.parking_zone_id - ID de la zona de parqueo (opcional)
   * @param {number} params.status_id - ID del estado del vehículo
   * @returns {number|null} ID del vehículo creado o null si ocurre un error
   */
  static async create({ model, type, color, license_plate, vehicle_photo, user_id, property_id, parking_zone_id, status_id }) {
    try {
      if (!model || !type || !color || !license_plate || !user_id || !property_id || !status_id) {
        throw new Error('Required fields are missing');
      }

      // Construir la consulta SQL solo con los campos que tienen valores
      let columns = ['model', 'type', 'color', 'license_plate', 'user_id', 'property_id', 'status_id', 'created_at'];
      let values = [model, type, color, license_plate, user_id, property_id, status_id];
      let placeholders = ['?', '?', '?', '?', '?', '?', '?', 'NOW()'];

      // Agregar campos opcionales solo si tienen valor
      if (vehicle_photo) {
        columns.splice(columns.length - 1, 0, 'vehicle_photo');
        values.push(vehicle_photo);
        placeholders.splice(placeholders.length - 1, 0, '?');
      }

      if (parking_zone_id) {
        columns.splice(columns.length - 1, 0, 'parking_zone_id');
        values.push(parking_zone_id);
        placeholders.splice(placeholders.length - 1, 0, '?');
      }

      let sqlQuery = `INSERT INTO vehicles (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

      const [result] = await connect.query(sqlQuery, values);

      return result.insertId;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      return null;
    }
  }

  /**
   * @method show
   * @description Obtener todos los vehículos registrados en el sistema
   * Incluye información relacionada como usuario propietario, propiedad, zona de parqueo y estado
   * @returns {Array} Lista de vehículos con sus datos relacionados o array vacío en caso de error
   */
  static async show() {
    try {
      let sqlQuery = `
        SELECT v.*, 
               u.username, 
               p.name AS property_name, 
               pz.name AS parking_zone_name,
               s.name AS status_name 
        FROM vehicles v 
        LEFT JOIN users u ON v.user_id = u.user_id 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN parking_zones pz ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        ORDER BY v.vehicle_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing vehicles:', error);
      return [];
    }
  }

  /**
   * @method showActive
   * @description Obtener todos los vehículos activos registrados en el sistema
   * Filtra vehículos excluyendo los que están inactivos o suspendidos
   * @returns {Array} Lista de vehículos activos con sus datos relacionados o array vacío en caso de error
   */
  static async showActive() {
    try {
      let sqlQuery = `
        SELECT v.*,
               u.username,
               p.name AS property_name,
               pz.name AS parking_zone_name,
               s.name AS status_name
        FROM vehicles v
        LEFT JOIN users u ON v.user_id = u.user_id
        LEFT JOIN properties p ON v.property_id = p.property_id
        LEFT JOIN parking_zones pz ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN statuses s ON v.status_id = s.status_id
        WHERE s.name NOT IN ('Inactivo', 'Suspendido')
        ORDER BY v.vehicle_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error showing active vehicles:', error);
      return [];
    }
  }

  /**
   * @method update
   * @description Actualiza la información de un vehículo existente en la base de datos
   * @param {number} id - ID del vehículo a actualizar
   * @param {Object} params - Nuevos datos del vehículo
   * @param {string} params.model - Modelo del vehículo
   * @param {string} params.type - Tipo de vehículo (carro, moto, etc.)
   * @param {string} params.color - Color del vehículo
   * @param {string} params.license_plate - Placa del vehículo
   * @param {string} params.vehicle_photo - URL o ruta de la foto del vehículo
   * @param {number} params.user_id - ID del propietario del vehículo
   * @param {number} params.property_id - ID de la propiedad asociada
   * @param {number} params.parking_zone_id - ID de la zona de parqueo
   * @param {number} params.status_id - ID del estado del vehículo
   * @returns {Object|null} Objeto con los datos actualizados del vehículo o null si ocurre un error
   */
  static async update(id, { model, type, color, license_plate, vehicle_photo, user_id, property_id, parking_zone_id, status_id }) {
    try {
      if (!id) {
        throw new Error('Vehicle ID is required for update');
      }
      
      let sqlQuery = `UPDATE vehicles 
        SET model = ?, 
            type = ?, 
            color = ?, 
            license_plate = ?, 
            vehicle_photo = ?, 
            user_id = ?, 
            property_id = ?, 
            parking_zone_id = ?, 
            status_id = ?,
            updated_at = NOW() 
        WHERE vehicle_id = ?;`;
      
      const [result] = await connect.query(sqlQuery, [
        model, 
        type, 
        color, 
        license_plate, 
        vehicle_photo, 
        user_id, 
        property_id, 
        parking_zone_id, 
        status_id, 
        id
      ]);
      
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error(`Error updating vehicle with id ${id}:`, error);
      return null;
    }
  }

  /**
   * @method delete
   * @description Elimina un vehículo de la base de datos
   * @param {number} id - ID del vehículo a eliminar
   * @returns {boolean} true si la eliminación fue exitosa, false en caso contrario
   */
  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM vehicles WHERE vehicle_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return false;
    }
  }

  /**
   * @method findById
   * @description Buscar un vehículo por su ID y obtiene información detallada
   * @param {number} id - ID del vehículo a buscar
   * @returns {Object|null} Objeto con la información detallada del vehículo o null si no se encuentra
   */
  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT v.*, 
               u.username, 
               p.name AS property_name, 
               pz.name AS parking_zone_name,
               s.name AS status_name 
        FROM vehicles v 
        LEFT JOIN users u ON v.user_id = u.user_id 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN parking_zones pz ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        WHERE v.vehicle_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding vehicle by ID:', error);
      return null;
    }
  }

  /**
   * @method findByIdActive
   * @description Buscar un vehículo activo por su ID
   * Solo devuelve información si el vehículo no está inactivo o suspendido
   * @param {number} id - ID del vehículo a buscar
   * @returns {Object|null} Objeto con la información del vehículo activo o null si no se encuentra
   */
  static async findByIdActive(id) {
    try {
      let sqlQuery = `
        SELECT v.*,
               u.username,
               p.name AS property_name,
               pz.name AS parking_zone_name,
               s.name AS status_name
        FROM vehicles v
        LEFT JOIN users u ON v.user_id = u.user_id
        LEFT JOIN properties p ON v.property_id = p.property_id
        LEFT JOIN parking_zones pz ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN statuses s ON v.status_id = s.status_id
        WHERE v.vehicle_id = ? AND s.name NOT IN ('Inactivo', 'Suspendido')
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error('Error finding active vehicle by ID:', error);
      return null;
    }
  }

  /**
   * @method findByUserId
   * @description Obtener todos los vehículos asociados a un usuario específico
   * @param {number} user_id - ID del usuario propietario
   * @returns {Array} Lista de vehículos pertenecientes al usuario o array vacío en caso de error
   */
  static async findByUserId(user_id) {
    try {
      let sqlQuery = `
        SELECT v.*, 
               u.username, 
               p.name AS property_name, 
               pz.name AS parking_zone_name,
               s.name AS status_name 
        FROM vehicles v 
        LEFT JOIN users u ON v.user_id = u.user_id 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN parking_zones pz ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        WHERE v.user_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [user_id]);
      return result;
    } catch (error) {
      console.error('Error finding vehicles by user ID:', error);
      return [];
    }
  }

  /**
   * @method findByPropertyId
   * @description Obtener todos los vehículos asociados a una propiedad específica
   * @param {number} property_id - ID de la propiedad
   * @returns {Array} Lista de vehículos asociados a la propiedad o array vacío en caso de error
   */
  static async findByPropertyId(property_id) {
    try {
      let sqlQuery = `
        SELECT v.*, 
               u.username, 
               p.name AS property_name, 
               pz.name AS parking_zone_name,
               s.name AS status_name 
        FROM vehicles v 
        LEFT JOIN users u ON v.user_id = u.user_id 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN parking_zones pz ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        WHERE v.property_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [property_id]);
      return result;
    } catch (error) {
      console.error('Error finding vehicles by property ID:', error);
      return [];
    }
  }

  /**
   * @method findByType
   * @description Obtener todos los vehículos de un tipo específico (carro, moto, etc.)
   * @param {string} type - Tipo de vehículo a buscar
   * @returns {Array} Lista de vehículos del tipo especificado o array vacío en caso de error
   */
  static async findByType(type) {
    try {
      let sqlQuery = `
        SELECT v.*, 
               u.username, 
               p.name AS property_name, 
               pz.name AS parking_zone_name,
               s.name AS status_name 
        FROM vehicles v 
        LEFT JOIN users u ON v.user_id = u.user_id 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN parking_zones pz ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        WHERE v.type = ?
      `;
      const [result] = await connect.query(sqlQuery, [type]);
      return result;
    } catch (error) {
      console.error('Error finding vehicles by type:', error);
      return [];
    }
  }

  /**
   * @method createWithLicensePlate
   * @description Método de compatibilidad que delega al método create
   * Se mantiene para evitar romper código existente que lo utiliza
   * @param {Object} vehicleData - Datos del vehículo a crear
   * @returns {number|null} ID del vehículo creado o null si ocurre un error
   * @deprecated Usar el método create en su lugar
   */
  static async createWithLicensePlate(vehicleData) {
    return this.create(vehicleData);
  }

  /**
   * @method findByLicensePlate
   * @description Buscar un vehículo por su placa
   * Incluye información adicional como el nombre completo del propietario
   * @param {string} license_plate - Número de placa a buscar
   * @returns {Object|null} Información detallada del vehículo o null si no se encuentra
   */
  static async findByLicensePlate(license_plate) {
    try {
      let sqlQuery = `
        SELECT v.*, 
               u.username, 
               pr.full_name,
               p.name AS property_name, 
               pz.name AS parking_zone_name,
               s.name AS status_name 
        FROM vehicles v 
        LEFT JOIN users u ON v.user_id = u.user_id 
        LEFT JOIN profiles pr ON u.user_id = pr.user_id 
        LEFT JOIN properties p ON v.property_id = p.property_id 
        LEFT JOIN parking_zones pz ON v.parking_zone_id = pz.parking_zone_id
        LEFT JOIN statuses s ON v.status_id = s.status_id 
        WHERE v.license_plate = ?
      `;
      const [result] = await connect.query(sqlQuery, [license_plate]);
      return result[0];
    } catch (error) {
      console.error('Error finding vehicle by license plate:', error);
      return null;
    }
  }

  /**
   * @method getByUser
   * @description Obtener todos los vehículos de un usuario (método de compatibilidad)
   * @param {number} user_id - ID del usuario
   * @returns {Array} Lista de vehículos del usuario
   * @deprecated Usar findByUserId en su lugar
   */
  static async getByUser(user_id) {
    return this.findByUserId(user_id);
  }

  /**
   * @method getByProperty
   * @description Obtener todos los vehículos de una propiedad (método de compatibilidad)
   * @param {number} property_id - ID de la propiedad
   * @returns {Array} Lista de vehículos asociados a la propiedad
   * @deprecated Usar findByPropertyId en su lugar
   */
  static async getByProperty(property_id) {
    return this.findByPropertyId(property_id);
  }

  /**
   * @method getByType
   * @description Obtener todos los vehículos de un tipo específico (método de compatibilidad)
   * @param {string} type - Tipo de vehículo
   * @returns {Array} Lista de vehículos del tipo especificado
   * @deprecated Usar findByType en su lugar
   */
  static async getByType(type) {
    return this.findByType(type);
  }

  /**
   * @method getActiveVehicles
   * @description Obtener todos los vehículos activos (método de compatibilidad)
   * @returns {Array} Lista de vehículos con estado activo
   * @deprecated Usar showActive en su lugar
   */
  static async getActiveVehicles() {
    return this.showActive();
  }

  /**
   * @method getVehicleStatistics
   * @description Obtener estadísticas generales sobre los vehículos registrados en el sistema
   * Incluye conteos de vehículos por tipo, estado y cantidad de propietarios únicos
   * @returns {Object|null} Objeto con las estadísticas o null en caso de error
   */
  static async getVehicleStatistics() {
    try {
      let sqlQuery = `
        SELECT 
          COUNT(*) as total_vehicles,
          COUNT(CASE WHEN type = 'Carro' THEN 1 END) as cars,
          COUNT(CASE WHEN type = 'Moto' THEN 1 END) as motorcycles,
          COUNT(CASE WHEN s.name = 'Activo' THEN 1 END) as active_vehicles,
          COUNT(CASE WHEN s.name = 'Inactivo' THEN 1 END) as inactive_vehicles,
          COUNT(DISTINCT user_id) as unique_owners
        FROM vehicles v
        LEFT JOIN statuses s ON v.status_id = s.status_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result[0];
    } catch (error) {
      console.error('Error getting vehicle statistics:', error);
      return null;
    }
  }

  /**
   * @method getVehiclesWithParkingAssignments
   * @description Obtener los vehículos junto con sus asignaciones de estacionamiento
   * Proporciona información detallada sobre las asignaciones de parqueo para cada vehículo
   * @returns {Array} Lista de vehículos con sus asignaciones de parqueo o array vacío en caso de error
   */
  static async getVehiclesWithParkingAssignments() {
    try {
      let sqlQuery = `
        SELECT v.*,
               u.username,
               pr.full_name,
               p.name AS property_name,
               vs.name AS vehicle_status_name,
               pa.parking_assignment_id,
               ps.code AS parking_slot_code,
               pa.start_time,
               pa.end_time,
               pas.name AS assignment_status_name
        FROM vehicles v
        LEFT JOIN users u ON v.user_id = u.user_id
        LEFT JOIN profiles pr ON u.user_id = pr.user_id
        LEFT JOIN properties p ON v.property_id = p.property_id
        LEFT JOIN statuses vs ON v.status_id = vs.status_id
        LEFT JOIN parking_assignments pa ON v.vehicle_id = pa.vehicle_id
        LEFT JOIN statuses pas ON pa.status_id = pas.status_id
        LEFT JOIN parking_slots ps ON pa.parking_slot_id = ps.parking_slot_id
        WHERE vs.name NOT IN ('Inactivo', 'Suspendido')
        ORDER BY v.vehicle_id DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error getting vehicles with parking assignments:', error);
      return [];
    }
  }
  
  /**
   * @method uploadPhoto
   * @description Actualiza la foto de un vehículo existente
   * @param {number} id - ID del vehículo
   * @param {string} photoPath - Ruta o URL de la nueva foto
   * @returns {boolean} true si la actualización fue exitosa, false en caso contrario
   */
  static async uploadPhoto(id, photoPath) {
    try {
      let sqlQuery = "UPDATE vehicles SET vehicle_photo = ? WHERE vehicle_id = ?;";
      const [result] = await connect.query(sqlQuery, [photoPath, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error uploading vehicle photo:', error);
      return false;
    }
  }
}

export default VehicleModel;
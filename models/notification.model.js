/**
 * Importar la conexión a la base de datos MySQL.
 * Esta conexión es necesaria para realizar todas las operaciones CRUD.
 */
import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para la gestión de notificaciones en el sistema.
 * Proporciona métodos para crear, leer, actualizar y eliminar notificaciones,
 * así como para realizar búsquedas específicas según diferentes criterios.
 */
class NotificationModel {

  /**
   * Crear una nueva notificación en la base de datos.
   * 
   * @param {Object} datos - Objeto con los datos de la notificación a crear.
   * @param {number} datos.user_id - ID del usuario destinatario de la notificación.
   * @param {number|null} datos.property_id - ID de la propiedad relacionada (opcional).
   * @param {number} datos.notification_type_id - ID del tipo de notificación.
   * @param {string} datos.title - Título de la notificación.
   * @param {string} datos.message - Contenido del mensaje de la notificación.
   * @param {number} datos.status_id - ID del estado de la notificación (1=no leído, 2=leído, etc.).
   * @param {number} datos.priority - Nivel de prioridad de la notificación (1=baja, 2=normal, 3=alta).
   * @returns {number} - ID de la notificación creada.
   * @throws {Error} - Lanza un error si la creación falla.
   */
  static async create({ user_id, property_id, notification_type_id, title, message, status_id, priority }) {
    try {
      // Construye la consulta SQL para insertar una nueva notificación
      let sqlQuery = "INSERT INTO notifications (user_id, property_id, notification_type_id, title, message, status_id, priority) VALUES (?, ?, ?, ?, ?, ?, ?);";
      
      // Ejecutar la consulta con los parámetros proporcionados
      const [result] = await connect.query(sqlQuery, [user_id, property_id, notification_type_id, title, message, status_id, priority]);
      
      // Retornar el ID de la notificación creada
      return result.insertId;
    } catch (error) {
      // Registrar el error en la consola y lo propaga para su manejo en el controlador
      console.error('Database error in NotificationModel.create:', error);
      throw error; // Propaga el error en lugar de retornar null
    }
  }

  /**
   * Obtener todas las notificaciones almacenadas en la base de datos con información relacionada.
   * Incluye datos del usuario, propiedad, tipo de notificación y estado.
   * 
   * @returns {Array} - Lista de notificaciones con datos relacionados.
   */
  static async show() {
    try {
      // Construye una consulta SQL compleja para obtener notificaciones con datos relacionados
      // Se realizan varios JOIN para obtener información adicional de otras tablas
      let sqlQuery = `
        SELECT n.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               nt.name as notification_type_name, 
               s.name as status_name 
        FROM notifications n 
        LEFT JOIN users u ON n.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON n.property_id = prop.property_id 
        LEFT JOIN notification_types nt ON n.notification_type_id = nt.notification_type_id 
        LEFT JOIN statuses s ON n.status_id = s.status_id 
        ORDER BY n.notification_id
      `;
      
      // Ejecutar la consulta y obtiene los resultados
      const [result] = await connect.query(sqlQuery);
      
      // Retornar el array de notificaciones
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error in show method:', error);
      return [];
    }
  }

  /**
   * Actualizar una notificación existente con nuevos datos.
   * 
   * @param {number} id - ID de la notificación a actualizar.
   * @param {Object} datos - Objeto con los nuevos datos de la notificación.
   * @param {number} datos.user_id - ID del usuario destinatario de la notificación.
   * @param {number|null} datos.property_id - ID de la propiedad relacionada.
   * @param {number} datos.notification_type_id - ID del tipo de notificación.
   * @param {string} datos.title - Nuevo título de la notificación.
   * @param {string} datos.message - Nuevo contenido del mensaje.
   * @param {number} datos.status_id - Nuevo ID del estado de la notificación.
   * @param {number} datos.priority - Nuevo nivel de prioridad.
   * @returns {Object|null} - Datos completos de la notificación actualizada o null en caso de error.
   */
  static async update(id, { user_id, property_id, notification_type_id, title, message, status_id, priority }) {
    try {
      // Construye la consulta SQL para actualizar una notificación existente
      let sqlQuery = "UPDATE notifications SET user_id = ?, property_id = ?, notification_type_id = ?, title = ?, message = ?, status_id = ?, priority = ? WHERE notification_id = ?;";
      
      // Ejecutar la consulta con los parámetros proporcionados
      const [result] = await connect.query(sqlQuery, [user_id, property_id, notification_type_id, title, message, status_id, priority, id]);
      
      // Si se actualizó alguna fila, obtiene y retorna los datos completos de la notificación actualizada
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error updating notification:', error);
      return null;
    }
  }

  /**
   * Eliminar una notificación de la base de datos.
   * 
   * @param {number} id - ID de la notificación a eliminar.
   * @returns {boolean} - true si la eliminación fue exitosa, false en caso contrario.
   */
  static async delete(id) {
    try {
      // Construye la consulta SQL para eliminar una notificación
      let sqlQuery = "DELETE FROM notifications WHERE notification_id = ?";
      
      // Ejecutar la consulta con el ID proporcionado
      const [result] = await connect.query(sqlQuery, [id]);
      
      // Retornar true si se eliminó alguna fila, false en caso contrario
      return result.affectedRows > 0;
    } catch (error) {
      // Registrar el error y retorna false en caso de fallo
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Busca una notificación específica por su ID y obtiene información relacionada.
   * 
   * @param {number} id - ID de la notificación a buscar.
   * @returns {Object|null} - Datos completos de la notificación o null si no se encuentra.
   */
  static async findById(id) {
    try {
      // Construye una consulta SQL para obtener una notificación específica con datos relacionados
      let sqlQuery = `
        SELECT n.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               nt.name as notification_type_name, 
               s.name as status_name 
        FROM notifications n 
        LEFT JOIN users u ON n.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON n.property_id = prop.property_id 
        LEFT JOIN notification_types nt ON n.notification_type_id = nt.notification_type_id 
        LEFT JOIN statuses s ON n.status_id = s.status_id 
        WHERE n.notification_id = ?
      `;
      
      // Ejecutar la consulta con el ID proporcionado
      const [result] = await connect.query(sqlQuery, [id]);
      
      // Retornar la primera (y única) notificación encontrada o null si no hay resultados
      return result[0];
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error finding notification by ID:', error);
      return null;
    }
  }

  /**
   * Buscar todas las notificaciones asociadas a un usuario específico.
   * 
   * @param {number} user_id - ID del usuario cuyas notificaciones se buscan.
   * @returns {Array} - Lista de notificaciones asociadas al usuario especificado.
   */
  static async findByUserId(user_id) {
    try {
      // Construye una consulta SQL para obtener notificaciones de un usuario específico con datos relacionados
      let sqlQuery = `
        SELECT n.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               nt.name as notification_type_name, 
               s.name as status_name 
        FROM notifications n 
        LEFT JOIN users u ON n.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON n.property_id = prop.property_id 
        LEFT JOIN notification_types nt ON n.notification_type_id = nt.notification_type_id 
        LEFT JOIN statuses s ON n.status_id = s.status_id 
        WHERE n.user_id = ?
      `;
      
      // Ejecutar la consulta con el ID de usuario proporcionado
      const [result] = await connect.query(sqlQuery, [user_id]);
      
      // Retornar el array de notificaciones encontradas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding notifications by user ID:', error);
      return [];
    }
  }

  /**
   * Buscar todas las notificaciones asociadas a una propiedad específica.
   * 
   * @param {number} property_id - ID de la propiedad cuyas notificaciones se buscan.
   * @returns {Array} - Lista de notificaciones asociadas a la propiedad especificada.
   */
  static async findByPropertyId(property_id) {
    try {
      // Construye una consulta SQL para obtener notificaciones de una propiedad específica con datos relacionados
      let sqlQuery = `
        SELECT n.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               nt.name as notification_type_name, 
               s.name as status_name 
        FROM notifications n 
        LEFT JOIN users u ON n.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON n.property_id = prop.property_id 
        LEFT JOIN notification_types nt ON n.notification_type_id = nt.notification_type_id 
        LEFT JOIN statuses s ON n.status_id = s.status_id 
        WHERE n.property_id = ?
      `;
      
      // Ejecutar la consulta con el ID de propiedad proporcionado
      const [result] = await connect.query(sqlQuery, [property_id]);
      
      // Retornar el array de notificaciones encontradas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding notifications by property ID:', error);
      return [];
    }
  }

  /**
   * Buscar todas las notificaciones de un tipo específico.
   * 
   * @param {number} notification_type_id - ID del tipo de notificación a buscar.
   * @returns {Array} - Lista de notificaciones del tipo especificado.
   */
  static async findByType(notification_type_id) {
    try {
      // Construye una consulta SQL para obtener notificaciones de un tipo específico con datos relacionados
      let sqlQuery = `
        SELECT n.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               nt.name as notification_type_name, 
               s.name as status_name 
        FROM notifications n 
        LEFT JOIN users u ON n.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON n.property_id = prop.property_id 
        LEFT JOIN notification_types nt ON n.notification_type_id = nt.notification_type_id 
        LEFT JOIN statuses s ON n.status_id = s.status_id 
        WHERE n.notification_type_id = ?
      `;
      
      // Ejecutar la consulta con el ID de tipo de notificación proporcionado
      const [result] = await connect.query(sqlQuery, [notification_type_id]);
      
      // Retornar el array de notificaciones encontradas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding notifications by type:', error);
      return [];
    }
  }

  /**
   * Buscar todas las notificaciones con un estado específico.
   * 
   * @param {number} status_id - ID del estado de notificación a buscar.
   * @returns {Array} - Lista de notificaciones con el estado especificado.
   */
  static async findByStatus(status_id) {
    try {
      // Construye una consulta SQL para obtener notificaciones con un estado específico con datos relacionados
      let sqlQuery = `
        SELECT n.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               nt.name as notification_type_name, 
               s.name as status_name 
        FROM notifications n 
        LEFT JOIN users u ON n.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON n.property_id = prop.property_id 
        LEFT JOIN notification_types nt ON n.notification_type_id = nt.notification_type_id 
        LEFT JOIN statuses s ON n.status_id = s.status_id 
        WHERE n.status_id = ?
      `;
      
      // Ejecutar la consulta con el ID de estado proporcionado
      const [result] = await connect.query(sqlQuery, [status_id]);
      
      // Retornar el array de notificaciones encontradas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding notifications by status:', error);
      return [];
    }
  }

  /**
   * Buscar todas las notificaciones con un nivel de prioridad específico.
   * 
   * @param {number} priority - Nivel de prioridad a buscar.
   * @returns {Array} - Lista de notificaciones con la prioridad especificada.
   */
  static async findByPriority(priority) {
    try {
      // Construye una consulta SQL para obtener notificaciones con una prioridad específica
      let sqlQuery = `
        SELECT n.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               nt.name as notification_type_name, 
               s.name as status_name 
        FROM notifications n 
        LEFT JOIN users u ON n.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON n.property_id = prop.property_id 
        LEFT JOIN notification_types nt ON n.notification_type_id = nt.notification_type_id 
        LEFT JOIN statuses s ON n.status_id = s.status_id 
        WHERE n.priority = ?
      `;
      
      // Ejecutar la consulta con el nivel de prioridad proporcionado
      const [result] = await connect.query(sqlQuery, [priority]);
      
      // Retornar el array de notificaciones encontradas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding notifications by priority:', error);
      return [];
    }
  }

  /**
   * Buscar todas las notificaciones no leídas.
   * Primero determina el ID del estado 'no leído' y luego buscar notificaciones con ese estado.
   * 
   * @returns {Array} - Lista de notificaciones no leídas.
   */
  static async findUnread() {
    try {
      // Primero busca el ID del estado 'no leído' en la tabla de estados
      let statusQuery = "SELECT status_id FROM statuses WHERE name = 'unread' OR name = 'no leído' LIMIT 1";
      const [statusResult] = await connect.query(statusQuery);
      
      // Si encuentra el estado, usa ese ID, de lo contrario usa 1 como predeterminado
      const unreadStatusId = statusResult.length > 0 ? statusResult[0].status_id : 1;
      
      // Construye una consulta SQL para obtener notificaciones no leídas
      let sqlQuery = `
        SELECT n.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               nt.name as notification_type_name, 
               s.name as status_name 
        FROM notifications n 
        LEFT JOIN users u ON n.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON n.property_id = prop.property_id 
        LEFT JOIN notification_types nt ON n.notification_type_id = nt.notification_type_id 
        LEFT JOIN statuses s ON n.status_id = s.status_id 
        WHERE n.status_id = ?
      `;
      
      // Ejecutar la consulta con el ID de estado 'no leído'
      const [result] = await connect.query(sqlQuery, [unreadStatusId]);
      
      // Retornar el array de notificaciones no leídas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding unread notifications:', error);
      return [];
    }
  }

  /**
   * Buscar todas las notificaciones con alta prioridad (nivel 3 o superior).
   *
   * @returns {Array} - Lista de notificaciones de alta prioridad.
   */
  static async findHighPriority() {
    try {
      // Construye una consulta SQL para obtener notificaciones de alta prioridad (3 o superior)
      let sqlQuery = `
        SELECT n.*,
               u.username,
               p.full_name,
               prop.name as property_name,
               nt.name as notification_type_name,
               s.name as status_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.user_id
        LEFT JOIN profiles p ON u.user_id = p.user_id
        LEFT JOIN properties prop ON n.property_id = prop.property_id
        LEFT JOIN notification_types nt ON n.notification_type_id = nt.notification_type_id
        LEFT JOIN statuses s ON n.status_id = s.status_id
        WHERE n.priority >= 3
      `;

      // Ejecutar la consulta
      const [result] = await connect.query(sqlQuery);

      // Retornar el array de notificaciones de alta prioridad
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding high priority notifications:', error);
      return [];
    }
  }

  /**
   * Marcar una notificación como leída.
   * Actualiza el campo read_at con la fecha y hora actual.
   *
   * @param {number} id - ID de la notificación a marcar como leída.
   * @returns {Object|null} - Datos completos de la notificación actualizada o null en caso de error.
   */
  static async markAsRead(id) {
    try {
      // Construir la consulta SQL para actualizar el campo read_at
      let sqlQuery = "UPDATE notifications SET read_at = NOW() WHERE notification_id = ?;";

      // Ejecutar la consulta con el ID proporcionado
      const [result] = await connect.query(sqlQuery, [id]);

      // Si se actualizó alguna fila, obtiene y retorna los datos completos de la notificación
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error marking notification as read:', error);
      return null;
    }
  }

  /**
   * Crear notificaciones para todos los usuarios del sistema.
   * Este método obtiene la lista de todos los usuarios activos y crea una notificación
   * individual para cada uno de ellos con el mismo contenido.
   *
   * @param {Object} datos - Objeto con los datos de la notificación a enviar.
   * @param {number|null} datos.property_id - ID de la propiedad relacionada (opcional).
   * @param {number} datos.notification_type_id - ID del tipo de notificación.
   * @param {string} datos.title - Título de la notificación.
   * @param {string} datos.message - Contenido del mensaje de la notificación.
   * @param {number} datos.status_id - ID del estado de la notificación.
   * @param {number} datos.priority - Nivel de prioridad de la notificación.
   * @returns {Object} - Objeto con información sobre el proceso de envío masivo.
   */
  static async createForAllUsers({ property_id, notification_type_id, title, message, status_id, priority }) {
    try {
      // Obtener todos los usuarios activos del sistema
      // Se filtran solo usuarios con status_id que corresponda a "activo"
      let getUsersQuery = `
        SELECT u.user_id
        FROM users u
        INNER JOIN statuses s ON u.status_id = s.status_id
        WHERE s.name = 'Activo' OR s.is_active = 1
      `;

      const [users] = await connect.query(getUsersQuery);

      // Validar que existan usuarios en el sistema
      if (users.length === 0) {
        return {
          success: false,
          message: 'No se encontraron usuarios activos en el sistema',
          total: 0,
          created: 0
        };
      }

      // Contador de notificaciones creadas exitosamente
      let createdCount = 0;
      // Array para almacenar los IDs de las notificaciones creadas
      let notificationIds = [];

      // Iterar sobre cada usuario y crear una notificación individual
      for (const user of users) {
        try {
          // Crear notificación para el usuario actual
          const notificationId = await this.create({
            user_id: user.user_id,
            property_id,
            notification_type_id,
            title,
            message,
            status_id,
            priority
          });

          // Si la creación fue exitosa, incrementar el contador y guardar el ID
          if (notificationId) {
            createdCount++;
            notificationIds.push(notificationId);
          }
        } catch (error) {
          // Registrar error individual pero continuar con los demás usuarios
          console.error(`Error creando notificación para usuario ${user.user_id}:`, error);
        }
      }

      // Retornar resultado del envío masivo
      return {
        success: true,
        message: `Notificaciones enviadas exitosamente`,
        total: users.length,
        created: createdCount,
        notificationIds: notificationIds
      };

    } catch (error) {
      // Registrar el error y retornar información del fallo
      console.error('Error in createForAllUsers:', error);
      return {
        success: false,
        message: 'Error al enviar notificaciones masivas',
        error: error.message,
        total: 0,
        created: 0
      };
    }
  }

  /**
   * Crear notificación para uno o todos los usuarios según el parámetro user_id.
   * Si user_id es null, undefined, 0 o "all", envía la notificación a todos los usuarios.
   * Si user_id tiene un valor numérico válido, envía solo a ese usuario específico.
   *
   * @param {Object} datos - Objeto con los datos de la notificación.
   * @param {number|null|string} datos.user_id - ID del usuario o "all" para todos.
   * @param {number|null} datos.property_id - ID de la propiedad relacionada (opcional).
   * @param {number} datos.notification_type_id - ID del tipo de notificación.
   * @param {string} datos.title - Título de la notificación.
   * @param {string} datos.message - Contenido del mensaje.
   * @param {number} datos.status_id - ID del estado de la notificación.
   * @param {number} datos.priority - Nivel de prioridad.
   * @returns {Object} - Resultado de la operación con detalles del envío.
   */
  static async createSingleOrBroadcast({ user_id, property_id, notification_type_id, title, message, status_id, priority }) {
    try {
      // Determinar si se debe enviar a todos o a un usuario específico
      // Se considera "enviar a todos" si user_id es null, undefined, 0, "0", "all" o cadena vacía
      const sendToAll = !user_id || user_id === 0 || user_id === '0' || user_id === 'all' || user_id === '';

      if (sendToAll) {
        // Enviar notificación a todos los usuarios
        const result = await this.createForAllUsers({
          property_id,
          notification_type_id,
          title,
          message,
          status_id,
          priority
        });

        return {
          success: result.success,
          broadcast: true,
          message: result.message,
          total: result.total,
          created: result.created,
          notificationIds: result.notificationIds
        };
      } else {
        // Enviar notificación a un usuario específico
        const notificationId = await this.create({
          user_id,
          property_id,
          notification_type_id,
          title,
          message,
          status_id,
          priority
        });

        return {
          success: !!notificationId,
          broadcast: false,
          message: notificationId ? 'Notificación enviada exitosamente' : 'Error al crear la notificación',
          total: 1,
          created: notificationId ? 1 : 0,
          notificationId: notificationId
        };
      }
    } catch (error) {
      // Registrar el error y retornar información del fallo
      console.error('Error in createSingleOrBroadcast:', error);
      return {
        success: false,
        message: 'Error al procesar la notificación',
        error: error.message
      };
    }
  }
}

export default NotificationModel;
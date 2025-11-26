/**
 * Importar la conexión a la base de datos MySQL.
 * Esta conexión es necesaria para realizar todas las operaciones CRUD.
 */
import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para la gestión de facturas en el sistema.
 * Proporciona métodos para crear, leer, actualizar y eliminar facturas,
 * así como para realizar búsquedas específicas según diferentes criterios.
 */
class InvoiceModel {

  /**
   * Crear una nueva factura en la base de datos.
   * 
   * @param {Object} datos - Objeto con los datos de la factura a crear.
   * @param {number} datos.user_id - ID del usuario asociado a la factura.
   * @param {number} datos.property_id - ID de la propiedad asociada a la factura.
   * @param {number} datos.tariff_id - ID de la tarifa aplicada.
   * @param {Date} datos.due_date - Fecha de vencimiento de la factura.
   * @param {number} datos.amount - Monto de la factura.
   * @param {number} datos.status_id - ID del estado de la factura.
   * @returns {number|null} - ID de la factura creada o null en caso de error.
   */
  static async create({ user_id, property_id, tariff_id, due_date, amount, status_id }) {
    try {
      // Construye la consulta SQL para insertar una nueva factura
      let sqlQuery = "INSERT INTO invoices (user_id, property_id, tariff_id, amount, due_date, status_id) VALUES (?, ?, ?, ?, ?, ?);";
      
      // Ejecutar la consulta con los parámetros proporcionados
      const [result] = await connect.query(sqlQuery, [user_id, property_id, tariff_id, amount, due_date, status_id]);
      
      // Retornar el ID de la factura creada
      return result.insertId;
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error creating invoice:', error);
      return null;
    }
  }

  /**
   * Obtener todas las facturas almacenadas en la base de datos con información relacionada.
   * 
   * @returns {Array} - Lista de facturas con datos de usuarios, propiedades, tarifas y estados.
   */
  static async show() {
    try {
      // Consulta SQL para obtener facturas con información relacionada de otras tablas
      let sqlQuery = `
        SELECT i.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               t.name as tariff_name, 
               t.amount as tariff_amount, 
               s.name as status_name 
        FROM invoices i 
        LEFT JOIN users u ON i.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON i.property_id = prop.property_id 
        LEFT JOIN tariffs t ON i.tariff_id = t.tariff_id 
        LEFT JOIN statuses s ON i.status_id = s.status_id 
        ORDER BY i.invoice_id
      `;
      
      // Ejecutar la consulta y obtiene los resultados
      const [result] = await connect.query(sqlQuery);
      
      // Retornar el array de facturas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error showing invoices:', error);
      return [];
    }
  }

  /**
   * Actualizar los datos de una factura existente.
   * 
   * @param {number} id - ID de la factura a actualizar.
   * @param {Object} datos - Objeto con los nuevos datos de la factura.
   * @param {number} datos.user_id - ID del usuario asociado a la factura.
   * @param {number} datos.property_id - ID de la propiedad asociada a la factura.
   * @param {number} datos.tariff_id - ID de la tarifa aplicada.
   * @param {Date} datos.due_date - Fecha de vencimiento de la factura.
   * @param {number} datos.amount - Monto de la factura.
   * @param {number} datos.status_id - ID del estado de la factura.
   * @returns {Object|null} - Datos completos de la factura actualizada o null en caso de error.
   */
  static async update(id, { user_id, property_id, tariff_id, due_date, amount, status_id }) {
    try {
      // Construye la consulta SQL para actualizar una factura existente
      let sqlQuery = "UPDATE invoices SET user_id = ?, property_id = ?, tariff_id = ?, due_date = ?, amount = ?, status_id = ? WHERE invoice_id = ?;";
      
      // Ejecutar la consulta con los parámetros proporcionados
      const [result] = await connect.query(sqlQuery, [user_id, property_id, tariff_id, due_date, amount, status_id, id]);
      
      // Si se actualizó alguna fila, obtiene y retorna los datos completos de la factura actualizada
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error updating invoice:', error);
      return null;
    }
  }

  /**
   * Eliminar una factura de la base de datos.
   * 
   * @param {number} id - ID de la factura a eliminar.
   * @returns {boolean} - true si la eliminación fue exitosa, false en caso contrario.
   */
  static async delete(id) {
    try {
      // Construye la consulta SQL para eliminar una factura
      let sqlQuery = "DELETE FROM invoices WHERE invoice_id = ?";
      
      // Ejecutar la consulta con el ID proporcionado
      const [result] = await connect.query(sqlQuery, [id]);
      
      // Retornar true si se eliminó alguna fila, false en caso contrario
      return result.affectedRows > 0;
    } catch (error) {
      // Registrar el error y retorna false en caso de fallo
      console.error('Error deleting invoice:', error);
      return false;
    }
  }

  /**
   * Buscar una factura específica por su ID.
   * 
   * @param {number} id - ID de la factura a buscar.
   * @returns {Object|null} - Datos completos de la factura o null si no se encuentra.
   */
  static async findById(id) {
    try {
      // Consulta SQL para obtener una factura específica con información relacionada
      let sqlQuery = `
        SELECT i.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               t.name as tariff_name, 
               t.amount as tariff_amount, 
               s.name as status_name 
        FROM invoices i 
        LEFT JOIN users u ON i.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON i.property_id = prop.property_id 
        LEFT JOIN tariffs t ON i.tariff_id = t.tariff_id 
        LEFT JOIN statuses s ON i.status_id = s.status_id 
        WHERE i.invoice_id = ?
      `;
      
      // Ejecutar la consulta y obtiene los resultados
      const [result] = await connect.query(sqlQuery, [id]);
      
      // Retornar la primera (y única) factura encontrada o null si no hay resultados
      return result[0];
    } catch (error) {
      // Registrar el error y retorna null en caso de fallo
      console.error('Error finding invoice by ID:', error);
      return null;
    }
  }

  /**
   * Buscar todas las facturas asociadas a un usuario específico.
   * 
   * @param {number} user_id - ID del usuario cuyas facturas se buscan.
   * @returns {Array} - Lista de facturas asociadas al usuario especificado.
   */
  static async findByUser(user_id) {
    try {
      // Consulta SQL para obtener todas las facturas de un usuario específico
      let sqlQuery = `
        SELECT i.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               t.name as tariff_name, 
               t.amount as tariff_amount, 
               s.name as status_name 
        FROM invoices i 
        LEFT JOIN users u ON i.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON i.property_id = prop.property_id 
        LEFT JOIN tariffs t ON i.tariff_id = t.tariff_id 
        LEFT JOIN statuses s ON i.status_id = s.status_id 
        WHERE i.user_id = ?
      `;
      
      // Ejecutar la consulta con el ID de usuario proporcionado
      const [result] = await connect.query(sqlQuery, [user_id]);
      
      // Retornar el array de facturas encontradas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding invoices by user ID:', error);
      return [];
    }
  }

  /**
   * Buscar todas las facturas asociadas a una propiedad específica.
   * 
   * @param {number} property_id - ID de la propiedad cuyas facturas se buscan.
   * @returns {Array} - Lista de facturas asociadas a la propiedad especificada.
   */
  static async findByProperty(property_id) {
    try {
      // Consulta SQL para obtener todas las facturas de una propiedad específica
      let sqlQuery = `
        SELECT i.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               t.name as tariff_name, 
               t.amount as tariff_amount, 
               s.name as status_name 
        FROM invoices i 
        LEFT JOIN users u ON i.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON i.property_id = prop.property_id 
        LEFT JOIN tariffs t ON i.tariff_id = t.tariff_id 
        LEFT JOIN statuses s ON i.status_id = s.status_id 
        WHERE i.property_id = ?
      `;
      
      // Ejecutar la consulta con el ID de propiedad proporcionado
      const [result] = await connect.query(sqlQuery, [property_id]);
      
      // Retornar el array de facturas encontradas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding invoices by property ID:', error);
      return [];
    }
  }

  /**
   * Buscar todas las facturas con un estado específico.
   * 
   * @param {number} status_id - ID del estado de factura a buscar.
   * @returns {Array} - Lista de facturas con el estado especificado.
   */
  static async findByStatus(status_id) {
    try {
      // Consulta SQL para obtener todas las facturas con un estado específico
      let sqlQuery = `
        SELECT i.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               t.name as tariff_name, 
               t.amount as tariff_amount, 
               s.name as status_name 
        FROM invoices i 
        LEFT JOIN users u ON i.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON i.property_id = prop.property_id 
        LEFT JOIN tariffs t ON i.tariff_id = t.tariff_id 
        LEFT JOIN statuses s ON i.status_id = s.status_id 
        WHERE i.status_id = ?
      `;
      
      // Ejecutar la consulta con el ID de estado proporcionado
      const [result] = await connect.query(sqlQuery, [status_id]);
      
      // Retornar el array de facturas encontradas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding invoices by status ID:', error);
      return [];
    }
  }

  /**
   * Buscar todas las facturas con fecha de vencimiento en un rango específico.
   * 
   * @param {string|Date} start_date - Fecha de inicio del rango.
   * @param {string|Date} end_date - Fecha de fin del rango.
   * @returns {Array} - Lista de facturas con vencimiento dentro del rango especificado.
   */
  static async findByDateRange(start_date, end_date) {
    try {
      // Consulta SQL para obtener todas las facturas dentro de un rango de fechas
      let sqlQuery = `
        SELECT i.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               t.name as tariff_name, 
               t.amount as tariff_amount, 
               s.name as status_name 
        FROM invoices i 
        LEFT JOIN users u ON i.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON i.property_id = prop.property_id 
        LEFT JOIN tariffs t ON i.tariff_id = t.tariff_id 
        LEFT JOIN statuses s ON i.status_id = s.status_id 
        WHERE i.due_date BETWEEN ? AND ?
      `;
      
      // Ejecutar la consulta con las fechas de inicio y fin proporcionadas
      const [result] = await connect.query(sqlQuery, [start_date, end_date]);
      
      // Retornar el array de facturas encontradas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding invoices by date range:', error);
      return [];
    }
  }

  /**
   * Buscar todas las facturas vencidas que no han sido pagadas.
   * Una factura se considera vencida si la fecha de vencimiento es anterior a la fecha actual
   * y su estado es diferente de 'pagada'.
   * 
   * @returns {Array} - Lista de facturas vencidas no pagadas.
   */
  static async findOverdue() {
    try {
      // Consulta SQL para obtener facturas vencidas no pagadas
      let sqlQuery = `
        SELECT i.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               t.name as tariff_name, 
               t.amount as tariff_amount, 
               s.name as status_name 
        FROM invoices i 
        LEFT JOIN users u ON i.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON i.property_id = prop.property_id 
        LEFT JOIN tariffs t ON i.tariff_id = t.tariff_id 
        LEFT JOIN statuses s ON i.status_id = s.status_id 
        WHERE i.due_date < NOW() AND s.name != 'Pagado'
      `;
      
      // Ejecutar la consulta
      const [result] = await connect.query(sqlQuery);
      
      // Retornar el array de facturas vencidas
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding overdue invoices:', error);
      return [];
    }
  }

  /**
   * Buscar todas las facturas con estado 'pendiente'.
   * 
   * @returns {Array} - Lista de facturas pendientes de pago.
   */
  static async findPending() {
    try {
      // Consulta SQL para obtener facturas con estado pendiente
      let sqlQuery = `
        SELECT i.*, 
               u.username, 
               p.full_name, 
               prop.name as property_name, 
               t.name as tariff_name, 
               t.amount as tariff_amount, 
               s.name as status_name 
        FROM invoices i 
        LEFT JOIN users u ON i.user_id = u.user_id 
        LEFT JOIN profiles p ON u.user_id = p.user_id 
        LEFT JOIN properties prop ON i.property_id = prop.property_id 
        LEFT JOIN tariffs t ON i.tariff_id = t.tariff_id 
        LEFT JOIN statuses s ON i.status_id = s.status_id 
        WHERE s.name = 'Pendiente'
      `;
      
      // Ejecutar la consulta
      const [result] = await connect.query(sqlQuery);
      
      // Retornar el array de facturas pendientes
      return result;
    } catch (error) {
      // Registrar el error y retorna un array vacío en caso de fallo
      console.error('Error finding pending invoices:', error);
      return [];
    }
  }
}

export default InvoiceModel; 
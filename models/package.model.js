import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar los paquetes en la base de datos.
 * Proporciona métodos para crear, consultar, actualizar y eliminar paquetes,
 * así como para realizar el seguimiento de entrada y salida de los mismos.
 */
class PackageModel {
    /**
     * Crear un nuevo registro de paquete en la base de datos.
     * 
     * @param {Object} packageData - Datos del paquete a crear
     * @param {string} packageData.description - Descripción del paquete
     * @param {number} packageData.recipient_user_id - ID del usuario destinatario
     * @param {number} packageData.property_id - ID de la propiedad asociada
     * @param {number} packageData.status_id - ID del estado inicial del paquete
     * @returns {number|null} ID del paquete creado o null si hay un error
     */
    static async create({ description, recipient_user_id, property_id, status_id }) {
        try {
            const sqlQuery = `
                INSERT INTO packages (
                    description, recipient_user_id, property_id, 
                    entry_at, status_id
                ) VALUES (?, ?, ?, NOW(), ?)
            `;
            const [result] = await connect.query(sqlQuery, [
                description, recipient_user_id, property_id, status_id
            ]);
            return result.insertId;
        } catch (error) {
            console.error('Error creando paquete:', error);
            return null;
        }
    }

    /**
     * Obtener todos los paquetes con información relacionada.
     * Este método consulta la base de datos y obtiene información completa de cada paquete,
     * incluyendo el nombre del destinatario, la propiedad y el estado actual.
     * El sistema utiliza JOINs para combinar datos de múltiples tablas relacionadas.
     *
     * @returns {Array} Lista de paquetes con detalles o array vacío si hay un error
     */
    static async show() {
        try {
            // La consulta SQL une la tabla packages con users, profiles, properties y statuses
            // El sistema usa LEFT JOIN para incluir paquetes aunque no tengan toda la información relacionada
            const sqlQuery = `
                SELECT p.*,
                       prof.full_name AS recipient_name,
                       pr.name AS property_name,
                       s.name AS status_name
                FROM packages p
                LEFT JOIN users u ON p.recipient_user_id = u.user_id
                LEFT JOIN profiles prof ON u.user_id = prof.user_id
                LEFT JOIN properties pr ON p.property_id = pr.property_id
                LEFT JOIN statuses s ON p.status_id = s.status_id
                ORDER BY p.entry_at DESC
            `;

            // El sistema ejecuta la consulta y devuelve todos los resultados
            const [result] = await connect.query(sqlQuery);
            return result;
        } catch (error) {
            // Si ocurre un error, el sistema lo registra en la consola
            console.error('Error mostrando paquetes:', error);
            // El sistema devuelve un array vacío para evitar errores en la aplicación
            return [];
        }
    }

    /**
     * Actualiza un paquete existente.
     * 
     * @param {number} id - ID del paquete a actualizar
     * @param {Object} packageData - Datos actualizados del paquete
     * @returns {Object|null} Paquete actualizado o null si hay un error
     */
    static async update(id, { description, recipient_user_id, property_id, status_id }) {
        try {
            const sqlQuery = `
                UPDATE packages 
                SET description = ?,
                    recipient_user_id = ?,
                    property_id = ?,
                    status_id = ?
                WHERE package_id = ?
            `;
            const [result] = await connect.query(sqlQuery, [
                description, recipient_user_id, property_id, status_id, id
            ]);
            return result.affectedRows > 0 ? this.findById(id) : null;
        } catch (error) {
            console.error('Error actualizando paquete:', error);
            return null;
        }
    }

    /**
     * Registrar la salida de un paquete.
     * 
     * @param {number} id - ID del paquete
     * @returns {boolean} true si se registró la salida correctamente, false si hubo un error
     */
    static async registerExit(id) {
        try {
            const sqlQuery = `
                UPDATE packages 
                SET exit_at = NOW(),
                    status_id = (SELECT status_id FROM statuses WHERE name = 'Entregado')
                WHERE package_id = ?
            `;
            const [result] = await connect.query(sqlQuery, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error registrando salida del paquete:', error);
            return false;
        }
    }

    /**
     * Elimina un paquete de la base de datos.
     * 
     * @param {number} id - ID del paquete a eliminar
     * @returns {boolean} true si se eliminó correctamente, false si hubo un error
     */
    static async delete(id) {
        try {
            const sqlQuery = `DELETE FROM packages WHERE package_id = ?`;
            const [result] = await connect.query(sqlQuery, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error eliminando paquete:', error);
            return false;
        }
    }

    /**
     * Buscar un paquete por su ID incluyendo información relacionada.
     * Este método busca un paquete específico en la base de datos usando su ID único.
     * El sistema obtiene información completa del paquete junto con datos del destinatario,
     * la propiedad y el estado actual.
     *
     * @param {number} id - ID del paquete a buscar
     * @returns {Object|null} Paquete encontrado con detalles o null si no existe
     */
    static async findById(id) {
        try {
            // La consulta SQL busca el paquete con el ID especificado
            // El sistema une la tabla users con profiles para obtener el nombre completo del destinatario
            const sqlQuery = `
                SELECT p.*,
                       prof.full_name AS recipient_name,
                       pr.name AS property_name,
                       s.name AS status_name
                FROM packages p
                LEFT JOIN users u ON p.recipient_user_id = u.user_id
                LEFT JOIN profiles prof ON u.user_id = prof.user_id
                LEFT JOIN properties pr ON p.property_id = pr.property_id
                LEFT JOIN statuses s ON p.status_id = s.status_id
                WHERE p.package_id = ?
            `;

            // El sistema ejecuta la consulta con el ID como parámetro para prevenir inyección SQL
            const [result] = await connect.query(sqlQuery, [id]);

            // El sistema devuelve el primer resultado (debería ser único) o null si no existe
            return result[0] || null;
        } catch (error) {
            // Si ocurre un error, el sistema lo registra en la consola
            console.error('Error buscando paquete por ID:', error);
            // El sistema devuelve null para indicar que no se encontró el paquete
            return null;
        }
    }

    /**
     * Obtener todos los paquetes de un usuario específico.
     * Este método consulta la base de datos para encontrar todos los paquetes
     * asociados a un usuario destinatario particular.
     * El sistema devuelve los paquetes ordenados por fecha de entrada (más recientes primero).
     *
     * @param {number} userId - ID del usuario destinatario
     * @returns {Array} Lista de paquetes del usuario o array vacío si hay un error
     */
    static async findByUser(userId) {
        try {
            // La consulta SQL busca todos los paquetes del usuario especificado
            // El sistema incluye información del destinatario desde la tabla profiles
            const sqlQuery = `
                SELECT p.*,
                       prof.full_name AS recipient_name,
                       pr.name AS property_name,
                       s.name AS status_name
                FROM packages p
                LEFT JOIN users u ON p.recipient_user_id = u.user_id
                LEFT JOIN profiles prof ON u.user_id = prof.user_id
                LEFT JOIN properties pr ON p.property_id = pr.property_id
                LEFT JOIN statuses s ON p.status_id = s.status_id
                WHERE p.recipient_user_id = ?
                ORDER BY p.entry_at DESC
            `;

            // El sistema ejecuta la consulta con el ID del usuario como parámetro
            const [result] = await connect.query(sqlQuery, [userId]);
            return result;
        } catch (error) {
            // Si ocurre un error, el sistema lo registra en la consola
            console.error('Error buscando paquetes por usuario:', error);
            // El sistema devuelve un array vacío para evitar errores en la aplicación
            return [];
        }
    }

    /**
     * Obtener todos los paquetes pendientes (no entregados).
     * Este método consulta la base de datos para encontrar paquetes que aún no han sido entregados.
     * El sistema identifica paquetes pendientes por tener el campo exit_at en NULL (sin fecha de salida).
     * Los resultados se ordenan por fecha de entrada (más antiguos primero) para priorizar entregas.
     *
     * @returns {Array} Lista de paquetes pendientes o array vacío si hay un error
     */
    static async findPending() {
        try {
            // La consulta SQL busca paquetes sin fecha de salida (exit_at IS NULL)
            // El sistema une con la tabla profiles para obtener el nombre completo del destinatario
            const sqlQuery = `
                SELECT p.*,
                       prof.full_name AS recipient_name,
                       pr.name AS property_name,
                       s.name AS status_name
                FROM packages p
                LEFT JOIN users u ON p.recipient_user_id = u.user_id
                LEFT JOIN profiles prof ON u.user_id = prof.user_id
                LEFT JOIN properties pr ON p.property_id = pr.property_id
                LEFT JOIN statuses s ON p.status_id = s.status_id
                WHERE p.exit_at IS NULL
                ORDER BY p.entry_at ASC
            `;

            // El sistema ejecuta la consulta y devuelve todos los paquetes pendientes
            const [result] = await connect.query(sqlQuery);
            return result;
        } catch (error) {
            // Si ocurre un error, el sistema lo registra en la consola
            console.error('Error buscando paquetes pendientes:', error);
            // El sistema devuelve un array vacío para evitar errores en la aplicación
            return [];
        }
    }
}

export default PackageModel;
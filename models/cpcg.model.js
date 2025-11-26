import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar las PQRS (Peticiones, Quejas, Reclamos y Sugerencias) en la base de datos.
 * Proporciona métodos para crear, consultar, actualizar y eliminar PQRS,
 * así como para realizar búsquedas por diferentes criterios.
 */
class CpcgModel {
    /**
     * Crear un nuevo PQRS en la base de datos.
     *
     * @param {Object} pqrsData - Datos del PQRS a crear
     * @param {number} pqrsData.user_id - ID del usuario que crea el PQRS
     * @param {number} pqrsData.property_id - ID de la propiedad relacionada (opcional)
     * @param {number} pqrsData.cpcg_type_id - ID del tipo de PQRS
     * @param {string} pqrsData.description - Descripción detallada del PQRS
     * @param {number} pqrsData.status_id - ID del estado inicial del PQRS
     * @returns {number|null} ID del PQRS creado o null si hay un error
     */
    static async create({ user_id, property_id, cpcg_type_id, description, status_id }) {
        try {
            const sqlQuery = `
                INSERT INTO cpcgs (
                    user_id, property_id, cpcg_type_id, description, status_id, created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())
            `;
            const [result] = await connect.query(sqlQuery, [
                user_id, property_id, cpcg_type_id, description, status_id
            ]);
            return result.insertId;
        } catch (error) {
            console.error('Error creando PQRS:', error);
            return null;
        }
    }

    /**
     * Obtener todos los PQRS con información relacionada.
     * Soporta paginación opcional para mejorar el rendimiento con grandes volúmenes de datos.
     *
     * @param {Object} options - Opciones de paginación (opcional)
     * @param {number} options.page - Número de página (por defecto: 1)
     * @param {number} options.limit - Cantidad de registros por página (por defecto: 10)
     * @returns {Object} Objeto con data (PQRS) y metadata (información de paginación)
     */
    static async show(options = {}) {
        try {
            // Se extraen los parámetros de paginación o se usan valores por defecto
            const page = parseInt(options.page) || 1;
            const limit = parseInt(options.limit) || 10;
            const offset = (page - 1) * limit;

            // Query base para obtener los PQRS con sus relaciones
            const baseQuery = `
                SELECT c.*,
                       u.username AS user_name,
                       p.name AS property_name,
                       ct.name AS type_name,
                       s.name AS status_name,
                       admin.username AS responded_by_name
                FROM cpcgs c
                LEFT JOIN users u ON c.user_id = u.user_id
                LEFT JOIN properties p ON c.property_id = p.property_id
                LEFT JOIN cpcg_types ct ON c.cpcg_type_id = ct.cpcg_type_id
                LEFT JOIN statuses s ON c.status_id = s.status_id
                LEFT JOIN users admin ON c.responded_by = admin.user_id
                ORDER BY c.cpcg_id DESC
            `;

            // Si se solicita paginación, se agrega LIMIT y OFFSET
            if (options.page || options.limit) {
                const paginatedQuery = baseQuery + ` LIMIT ? OFFSET ?`;
                const [result] = await connect.query(paginatedQuery, [limit, offset]);

                // Se obtiene el total de registros para calcular la metadata
                const [countResult] = await connect.query(`SELECT COUNT(*) as total FROM cpcgs`);
                const total = countResult[0].total;
                const totalPages = Math.ceil(total / limit);

                return {
                    data: result,
                    metadata: {
                        currentPage: page,
                        totalPages,
                        totalRecords: total,
                        recordsPerPage: limit,
                        hasNextPage: page < totalPages,
                        hasPreviousPage: page > 1
                    }
                };
            }

            // Si no se solicita paginación, se retorna todo
            const [result] = await connect.query(baseQuery);
            return result;
        } catch (error) {
            console.error('Error mostrando PQRS:', error);
            return [];
        }
    }

    /**
     * Actualiza un PQRS existente.
     *
     * @param {number} id - ID del PQRS a actualizar
     * @param {Object} pqrsData - Datos actualizados del PQRS
     * @param {number} [pqrsData.property_id] - ID de la propiedad
     * @param {number} [pqrsData.cpcg_type_id] - ID del tipo de PQRS
     * @param {string} [pqrsData.description] - Descripción
     * @param {number} [pqrsData.status_id] - ID del estado
     * @param {string} [pqrsData.admin_response] - Respuesta del administrador
     * @param {number} [pqrsData.responded_by] - ID del admin que responde
     * @returns {Object|null} PQRS actualizado o null si hay un error
     */
    static async update(id, updateData) {
        try {
            // Construir dinámicamente el query solo con los campos que se envían
            const fields = [];
            const values = [];

            if (updateData.property_id !== undefined) {
                fields.push('property_id = ?');
                values.push(updateData.property_id);
            }
            if (updateData.cpcg_type_id !== undefined) {
                fields.push('cpcg_type_id = ?');
                values.push(updateData.cpcg_type_id);
            }
            if (updateData.description !== undefined) {
                fields.push('description = ?');
                values.push(updateData.description);
            }
            if (updateData.status_id !== undefined) {
                fields.push('status_id = ?');
                values.push(updateData.status_id);
            }
            if (updateData.admin_response !== undefined) {
                fields.push('admin_response = ?');
                values.push(updateData.admin_response);
            }
            if (updateData.responded_by !== undefined) {
                fields.push('responded_by = ?');
                values.push(updateData.responded_by);
                fields.push('responded_at = NOW()');
            }

            // Si no hay campos para actualizar, retornar null
            if (fields.length === 0) {
                return null;
            }

            // Agregar el ID al final
            values.push(id);

            const sqlQuery = `
                UPDATE cpcgs
                SET ${fields.join(', ')}
                WHERE cpcg_id = ?
            `;

            const [result] = await connect.query(sqlQuery, values);
            return result.affectedRows > 0 ? this.findById(id) : null;
        } catch (error) {
            console.error('Error actualizando PQRS:', error);
            return null;
        }
    }

    /**
     * Elimina un PQRS de la base de datos.
     * 
     * @param {number} id - ID del PQRS a eliminar
     * @returns {boolean} true si se eliminó correctamente, false si hubo un error
     */
    static async delete(id) {
        try {
            const sqlQuery = `DELETE FROM cpcgs WHERE cpcg_id = ?`;
            const [result] = await connect.query(sqlQuery, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error eliminando PQRS:', error);
            return false;
        }
    }

    /**
     * Buscar un PQRS por su ID incluyendo información relacionada.
     *
     * @param {number} id - ID del PQRS a buscar
     * @returns {Object|null} PQRS encontrado con detalles o null si no existe
     */
    static async findById(id) {
        try {
            const sqlQuery = `
                SELECT c.*,
                       u.username AS user_name,
                       p.name AS property_name,
                       ct.name AS type_name,
                       s.name AS status_name,
                       admin.username AS responded_by_name
                FROM cpcgs c
                LEFT JOIN users u ON c.user_id = u.user_id
                LEFT JOIN properties p ON c.property_id = p.property_id
                LEFT JOIN cpcg_types ct ON c.cpcg_type_id = ct.cpcg_type_id
                LEFT JOIN statuses s ON c.status_id = s.status_id
                LEFT JOIN users admin ON c.responded_by = admin.user_id
                WHERE c.cpcg_id = ?
            `;
            const [result] = await connect.query(sqlQuery, [id]);
            return result[0] || null;
        } catch (error) {
            console.error('Error buscando PQRS por ID:', error);
            console.error('Detalles del error:', error.message);
            return null;
        }
    }

    /**
     * Obtener todos los PQRS de un usuario específico.
     *
     * @param {number} userId - ID del usuario
     * @returns {Array} Lista de PQRS del usuario o array vacío si hay un error
     */
    static async findByUser(userId) {
        try {
            const sqlQuery = `
                SELECT c.*,
                       u.username AS user_name,
                       p.name AS property_name,
                       ct.name AS type_name,
                       s.name AS status_name
                FROM cpcgs c
                LEFT JOIN users u ON c.user_id = u.user_id
                LEFT JOIN properties p ON c.property_id = p.property_id
                LEFT JOIN cpcg_types ct ON c.cpcg_type_id = ct.cpcg_type_id
                LEFT JOIN statuses s ON c.status_id = s.status_id
                WHERE c.user_id = ?
                ORDER BY c.cpcg_id DESC
            `;
            const [result] = await connect.query(sqlQuery, [userId]);
            return result;
        } catch (error) {
            console.error('Error buscando PQRS por usuario:', error);
            return [];
        }
    }

    /**
     * Obtener todos los PQRS relacionados a una propiedad específica.
     *
     * @param {number} propertyId - ID de la propiedad
     * @returns {Array} Lista de PQRS de la propiedad o array vacío si hay un error
     */
    static async findByProperty(propertyId) {
        try {
            const sqlQuery = `
                SELECT c.*,
                       u.username AS user_name,
                       p.name AS property_name,
                       ct.name AS type_name,
                       s.name AS status_name
                FROM cpcgs c
                LEFT JOIN users u ON c.user_id = u.user_id
                LEFT JOIN properties p ON c.property_id = p.property_id
                LEFT JOIN cpcg_types ct ON c.cpcg_type_id = ct.cpcg_type_id
                LEFT JOIN statuses s ON c.status_id = s.status_id
                WHERE c.property_id = ?
                ORDER BY c.cpcg_id DESC
            `;
            const [result] = await connect.query(sqlQuery, [propertyId]);
            return result;
        } catch (error) {
            console.error('Error buscando PQRS por propiedad:', error);
            return [];
        }
    }

    /**
     * Obtener todos los PQRS de un tipo específico.
     *
     * @param {number} typeId - ID del tipo de PQRS
     * @returns {Array} Lista de PQRS del tipo especificado o array vacío si hay un error
     */
    static async findByType(typeId) {
        try {
            const sqlQuery = `
                SELECT c.*,
                       u.username AS user_name,
                       p.name AS property_name,
                       ct.name AS type_name,
                       s.name AS status_name
                FROM cpcgs c
                LEFT JOIN users u ON c.user_id = u.user_id
                LEFT JOIN properties p ON c.property_id = p.property_id
                LEFT JOIN cpcg_types ct ON c.cpcg_type_id = ct.cpcg_type_id
                LEFT JOIN statuses s ON c.status_id = s.status_id
                WHERE c.cpcg_type_id = ?
                ORDER BY c.cpcg_id DESC
            `;
            const [result] = await connect.query(sqlQuery, [typeId]);
            return result;
        } catch (error) {
            console.error('Error buscando PQRS por tipo:', error);
            return [];
        }
    }

    /**
     * Obtener todos los PQRS de un estado específico.
     * Este método es útil para filtrar PQRS según su estado actual ("Creado", "En Proceso", "Resuelto").
     *
     * @param {number} statusId - ID del estado de PQRS
     * @returns {Array} Lista de PQRS del estado especificado o array vacío si hay un error
     *
     * @example
     * // Para obtener todos los PQRS con estado "Creado" (status_id = 8):
     * const cpcgsCreados = await CpcgModel.findByStatus(8);
     */
    static async findByStatus(statusId) {
        try {
            const sqlQuery = `
                SELECT c.*,
                       u.username AS user_name,
                       p.name AS property_name,
                       ct.name AS type_name,
                       s.name AS status_name,
                       admin.username AS responded_by_name
                FROM cpcgs c
                LEFT JOIN users u ON c.user_id = u.user_id
                LEFT JOIN properties p ON c.property_id = p.property_id
                LEFT JOIN cpcg_types ct ON c.cpcg_type_id = ct.cpcg_type_id
                LEFT JOIN statuses s ON c.status_id = s.status_id
                LEFT JOIN users admin ON c.responded_by = admin.user_id
                WHERE c.status_id = ?
                ORDER BY c.cpcg_id DESC
            `;
            const [result] = await connect.query(sqlQuery, [statusId]);
            return result;
        } catch (error) {
            console.error('Error buscando PQRS por estado:', error);
            return [];
        }
    }
}

export default CpcgModel;
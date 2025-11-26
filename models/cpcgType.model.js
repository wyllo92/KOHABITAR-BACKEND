import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar los tipos de PQRS (Peticiones, Quejas, Reclamos y Sugerencias) en la base de datos.
 * Proporcionar métodos para crear, consultar, actualizar y eliminar tipos de PQRS,
 * así como para realizar búsquedas por diferentes criterios.
 */
class CpcgTypeModel {
    /**
     * Validar los campos requeridos para un tipo de PQRS
     * @param {Object} data - Datos a validar
     * @returns {Object} Objeto con el resultado de la validación
     */
    static validateFields(data) {
        const errors = [];
        
        if (!data.name) {
            errors.push('El nombre es requerido');
        } else if (data.name.length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }

        if (data.description && data.description.length > 255) {
            errors.push('La descripción no debe exceder los 255 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Crear un nuevo tipo de PQRS en la base de datos.
     * 
     * @param {Object} typeData - Datos del tipo de PQRS a crear
     * @param {string} typeData.name - Nombre del tipo de PQRS
     * @param {string} typeData.description - Descripción detallada del tipo de PQRS
     * @returns {number|null} ID del tipo de PQRS creado o null si hay un error
     */
    static async create({ name, description }) {
        try {
            const sqlQuery = `
                INSERT INTO cpcg_types (name, description) 
                VALUES (?, ?)
            `;
            const [result] = await connect.query(sqlQuery, [name, description]);
            return result.insertId;
        } catch (error) {
            console.error('Error creando tipo de PQRS:', error);
            return null;
        }
    }

    /**
     * Obtener los tipos de PQRS registrados en el sistema con paginación y filtros.
     * 
     * @param {Object} options - Opciones de consulta
     * @param {number} options.page - Número de página (por defecto: 1)
     * @param {number} options.limit - Cantidad de elementos por página (por defecto: 10)
     * @param {string} options.search - Término de búsqueda para filtrar por nombre o descripción
     * @param {string} options.sortBy - Campo por el cual ordenar (por defecto: 'cpcg_type_id')
     * @param {string} options.sortOrder - Dirección del ordenamiento ('ASC' o 'DESC')
     * @returns {Object} Objeto con la lista de tipos de PQRS y metadata de paginación
     */
    static async show({ page = 1, limit = 10, search = '', sortBy = 'cpcg_type_id', sortOrder = 'ASC' } = {}) {
        try {
            // Validación de parámetros
            const validLimit = Math.min(Math.max(1, limit), 100);
            const validPage = Math.max(1, page);
            const offset = (validPage - 1) * validLimit;
            const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder : 'ASC';
            const validSortBy = ['cpcg_type_id', 'name', 'description'].includes(sortBy) ? sortBy : 'cpcg_type_id';

            // Construye la consulta base
            let sqlQuery = 'SELECT * FROM cpcg_types';
            let countQuery = 'SELECT COUNT(*) as total FROM cpcg_types';
            const queryParams = [];

            // Agregar filtros de búsqueda si se proporciona un término
            if (search) {
                const searchFilter = ' WHERE name LIKE ? OR description LIKE ?';
                sqlQuery += searchFilter;
                countQuery += searchFilter;
                queryParams.push(`%${search}%`, `%${search}%`);
            }

            // Agregar ordenamiento y paginación
            sqlQuery += ` ORDER BY ${validSortBy} ${validSortOrder} LIMIT ? OFFSET ?`;
            queryParams.push(validLimit, offset);

            // Ejecutar ambas consultas en paralelo
            const [[rows], [countResult]] = await Promise.all([
                connect.query(sqlQuery, queryParams),
                connect.query(countQuery, search ? [`%${search}%`, `%${search}%`] : [])
            ]);

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / validLimit);

            return {
                data: rows,
                pagination: {
                    total,
                    totalPages,
                    currentPage: validPage,
                    limit: validLimit,
                    hasNextPage: validPage < totalPages,
                    hasPrevPage: validPage > 1
                }
            };
        } catch (error) {
            console.error('Error mostrando tipos de PQRS:', error);
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
     * Actualizar un tipo de PQRS existente.
     * 
     * @param {number} id - ID del tipo de PQRS a actualizar
     * @param {Object} typeData - Datos actualizados del tipo de PQRS
     * @returns {Object|null} Tipo de PQRS actualizado o null si hay un error
     */
    static async update(id, { name, description }) {
        try {
            const sqlQuery = `
                UPDATE cpcg_types 
                SET name = ?, 
                    description = ? 
                WHERE cpcg_type_id = ?
            `;
            const [result] = await connect.query(sqlQuery, [name, description, id]);
            return result.affectedRows > 0 ? this.findById(id) : null;
        } catch (error) {
            console.error('Error actualizando tipo de PQRS:', error);
            return null;
        }
    }

    /**
     * Eliminar un tipo de PQRS de la base de datos.
     * 
     * @param {number} id - ID del tipo de PQRS a eliminar
     * @returns {boolean} true si se eliminó correctamente, false si hubo un error
     */
    static async delete(id) {
        try {
            const sqlQuery = `
                DELETE FROM cpcg_types 
                WHERE cpcg_type_id = ?
            `;
            const [result] = await connect.query(sqlQuery, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error eliminando tipo de PQRS:', error);
            return false;
        }
    }

    /**
     * Buscar un tipo de PQRS por su ID.
     * 
     * @param {number} id - ID del tipo de PQRS a buscar
     * @returns {Object|null} Tipo de PQRS encontrado o null si no existe
     */
    static async findById(id) {
        try {
            const sqlQuery = `
                SELECT * 
                FROM cpcg_types 
                WHERE cpcg_type_id = ?
            `;
            const [result] = await connect.query(sqlQuery, [id]);
            return result[0] || null;
        } catch (error) {
            console.error('Error buscando tipo de PQRS por ID:', error);
            return null;
        }
    }

    /**
     * Buscar un tipo de PQRS por su nombre.
     * 
     * @param {string} name - Nombre del tipo de PQRS a buscar
     * @returns {Object|null} Tipo de PQRS encontrado o null si no existe
     */
    static async findByName(name) {
        try {
            const sqlQuery = `
                SELECT * 
                FROM cpcg_types 
                WHERE name = ?
            `;
            const [result] = await connect.query(sqlQuery, [name]);
            return result[0] || null;
        } catch (error) {
            console.error('Error buscando tipo de PQRS por nombre:', error);
            return null;
        }
    }
}

export default CpcgTypeModel;
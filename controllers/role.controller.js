import RoleModel from '../models/role.model.js';

/**
 * Controlador para gestionar las operaciones relacionadas con roles.
 * Implementar métodos para crear, consultar, actualizar y eliminar roles,
 * así como para buscar roles por ID.
 */
class RoleController {

  /**
   * Registrar un nuevo rol en el sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con los datos del rol en el cuerpo
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async register(req, res) {
    try {
      const { name, description, status_id } = req.body;
      // Realiza la validación básica de los campos requeridos
      if (!name || !description || !status_id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Crear el nuevo rol en la base de datos
      const roleId = await RoleModel.create({
        name,
        description,
        status_id
      });
      
      // Verificar si la creación del rol fue exitosa
      if (!roleId) {
        return res.status(500).json({ error: 'Failed to create role' });
      }
      
      // Retornar una respuesta exitosa con el ID del rol creado
      return res.status(201).json({
        message: 'Role created successfully',
        id: roleId
      });
    } catch (error) {
      // Manejar y registra cualquier error durante el proceso
      console.error('Registrartion error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Obtener todos los roles activos del sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con la lista de roles activos
   */
  async show(req, res) {
    try {
      // Obtener todos los roles activos
      const roleModel = await RoleModel.showActive();
      return res.status(200).json({
        message: 'Roles retrieved successfully',
        data: roleModel || []
      });
    } catch (error) {
      // Manejar y registra cualquier error durante la consulta
      console.error('Error retrieving roles:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Actualiza la información de un rol existente.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con los datos actualizados en el cuerpo y el ID en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación y los datos actualizados
   */
  async update(req, res) {
    try {
      const { name, description, status_id } = req.body;
      const id = req.params.id;
      // Realizar la validación básica de los campos requeridos
      if (!name || !description || !status_id || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Verificar si el rol existe antes de actualizarlo
      const existingRole = await RoleModel.findByIdActive(id);
      if (!existingRole) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Actualiza el rol con los nuevos datos
      const updateRoleModel = await RoleModel.update(id, {
        name, description, status_id
      });
      
      // Verificar si la actualización fue exitosa
      if (!updateRoleModel) {
        return res.status(500).json({ error: 'Failed to update role' });
      }
      
      // Retornar una respuesta exitosa con los datos actualizados
      return res.status(200).json({
        message: 'Role updated successfully',
        data: updateRoleModel
      });
    } catch (error) {
      // Manejar y registrar cualquier error durante la actualización
      console.error('Error in role update:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Elimina un rol del sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID del rol en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con el resultado de la operación
   */
  async delete(req, res) {
    try {
      const id = req.params.id;
      // Valida que se proporcione el ID
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      
      // Verificar que el rol exista antes de eliminarlo
      const existingRole = await RoleModel.findById(id);
      if (!existingRole) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      // Elimina el rol
      const deleteRoleModel = await RoleModel.delete(id);
      // Verificar si la eliminación fue exitosa
      if (!deleteRoleModel) {
        return res.status(500).json({ error: 'Failed to delete role' });
      }
      
      // Retornar una respuesta exitosa
      return res.status(200).json({
        message: 'Role deleted successfully',
        data: deleteRoleModel
      });
    } catch (error) {
      // Manejar y registra cualquier error durante la eliminación
      console.error('Error deleting role:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Buscar un rol por su ID.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID del rol en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta JSON con los datos del rol encontrado
   */
  async findById(req, res) {
    try {
      const id = req.params.id;
      // Valida que se proporcione el ID
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Obtener el rol por su ID (solo activos)
      const existingRoleModel = await RoleModel.findByIdActive(id);
      if (!existingRoleModel) {
        return res.status(404).json({ error: 'Role not found' });
      }
      // Retornar una respuesta exitosa con los datos del rol
      return res.status(200).json({
        message: 'Role found successfully',
        data: existingRoleModel
      });
    } catch (error) {
      // Manejar y registrar cualquier error durante la búsqueda
      console.error('Error finding role:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
export default new RoleController();
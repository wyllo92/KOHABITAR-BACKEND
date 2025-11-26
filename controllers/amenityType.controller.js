/**
 * Importar el modelo de Tipo de zona común para interactuar con la base de datos.
 * El modelo contiene todos los métodos necesarios para las operaciones CRUD.
 */
import AmenityTypeModel from '../models/amenityType.model.js';

/**
 * Controlador para manejar las operaciones relacionadas con tipos de zonas comunes.
 * Procesa las peticiones HTTP, valida los datos y devuelve las respuestas adecuadas.
 */
class AmenityTypeController {
  /**
   * Crear un nuevo tipo de zona común en el sistema.
   * 
   * @param {Request} req - Objeto de solicitud HTTP con los datos del tipo de zona común.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con el resultado de la operación.
   */
  async create(req, res) {
    try {
      // Extraer los datos del cuerpo de la petición
      const { name, description } = req.body;
      
      // Verificar que el nombre esté presente, ya que es un campo obligatorio
      if (!name) {
        // Si no se proporciona nombre, retorna un error de validación (400 Bad Request)
        return res.status(400).json({ error: 'El nombre es requerido' });
      }
      
      // Verificar si ya existe un tipo de zona común con el mismo nombre para evitar duplicados
      const existingType = await AmenityTypeModel.findByName(name);
      if (existingType) {
        // Si ya existe, retorna un error de conflicto (409 Conflict)
        return res.status(409).json({ error: 'Ya existe un tipo de zona común con ese nombre' });
      }
      
      // Llama al modelo para crear el nuevo tipo de zona común en la base de datos
      const typeId = await AmenityTypeModel.create({ name, description });
      
      // Verificar si la creación fue exitosa
      if (!typeId) {
        // Si falló la creación, retorna un error del servidor (500 Internal Server Error)
        return res.status(500).json({ error: 'Fallo al crear el tipo de zona común' });
      }
      
      // Obtener los datos completos del tipo de zona común recién creado
      const createdType = await AmenityTypeModel.findById(typeId);
      
      // Retornar una respuesta exitosa con los datos del nuevo tipo de zona común
      res.status(201).json({
        message: 'Tipo de zona común creado exitosamente',
        data: createdType
      });
    } catch (error) {
      // En caso de error inesperado, registra el error y retorna un mensaje de error
      console.error('Error al crear un tipo de zona común:', error);
      res.status(500).json({ error: 'Error creando el tipo de zona común', details: error.message });
    }
  }
  
  /**
   * Obtener y retornar todos los tipos de zonas comunes disponibles en el sistema.
   * 
   * @param {Request} req - Objeto de solicitud HTTP.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con la lista de tipos de zonas comunes.
   */
  async getAll(req, res) {
    try {
      // Extraer y valida los parámetros de paginación de la query
      const page = Math.max(1, parseInt(req.query.page) || 1); // página por defecto: 1
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10)); // límite por defecto: 10, máximo: 100
      
      // Llamar al modelo para obtener los tipos de zonas comunes con paginación
      const { data, pagination } = await AmenityTypeModel.findAll({ page, limit });
      
      // Retornar una respuesta exitosa con los datos obtenidos y la metadata de paginación
      res.status(200).json({
        message: 'Tipos de zonas comunes obtenidos correctamente',
        data,
        pagination
      });
    } catch (error) {
      // En caso de error, registra el error y retorna un mensaje de error
      console.error('Error al obtener tipos de zona común: ', error);
      res.status(500).json({ error: 'Error al recuperar datos de zonas comunes', details: error.message });
    }
  }

  /**
   * Obtener y retornar solo los tipos de zonas comunes que están activos.
   * 
   * @param {Request} req - Objeto de solicitud HTTP.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con la lista de tipos de zonas comunes activos.
   */
  async getActive(req, res) {
    try {
      // Llama al modelo para obtener solo los tipos de zonas comunes activos
      const types = await AmenityTypeModel.findActive();
      
      // Retornar una respuesta exitosa con los datos obtenidos
      res.status(200).json({
        message: 'Tipos de zonas comunes activos obtenidos correctamente',
        data: types
      });
    } catch (error) {
      // En caso de error, registra el error y retorna un mensaje de error
      console.error('Error al obtener tipos de zona común activos:', error);
      res.status(500).json({ error: 'Error al recuperar tipos de zona común activos', details: error.message });
    }
  }
  
  /**
   * Obtener y retornar un tipo de zona común específico por su ID.
   * 
   * @param {Request} req - Objeto de solicitud HTTP con el ID en los parámetros de ruta.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con los datos del tipo de zona común.
   */
  async getById(req, res) {
    try {
      // Extraer el ID desde los parámetros de la ruta
      const { id } = req.params;
      
      // Llama al modelo para buscar el tipo de zona común por su ID
      const type = await AmenityTypeModel.findById(id);
      
      // Verificar si se encontró el tipo de zona común
      if (!type) {
        // Si no se encuentra, retorna un error 404 (Not Found)
        return res.status(404).json({ error: 'Tipo de zona común no encontrado' });
      }
      
      // Retornar una respuesta exitosa con los datos del tipo de zona común
      res.status(200).json({
        message: 'Tipo de zona común encontrado',
        data: type
      });
    } catch (error) {
      // En caso de error, registra el error y retorna un mensaje de error
      console.error('Error al obtener tipo de zona común por ID:', error);
      res.status(500).json({ error: 'Error al recuperar tipo de zona común', details: error.message });
    }
  }
  
  /**
   * Actualiza un tipo de zona común existente.
   * 
   * @param {Request} req - Objeto de solicitud HTTP con el ID y los datos a actualizar.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con el resultado de la operación.
   */
  async update(req, res) {
    try {
      // Extraer el ID desde los parámetros de la ruta
      const { id } = req.params;
      
      // Extraer los datos a actualizar desde el cuerpo de la petición
      const { name, description, is_active } = req.body;
      
      // Verificar que el nombre esté presente, ya que es un campo obligatorio
      if (!name) {
        // Si no se proporciona nombre, retorna un error de validación (400 Bad Request)
        return res.status(400).json({ error: 'Nombre es requerido' });
      }
      
      // Verificar si el tipo de zona común existe antes de intentar actualizarlo
      const type = await AmenityTypeModel.findById(id);
      
      if (!type) {
        // Si no existe, retorna un error 404 (Not Found)
        return res.status(404).json({ error: 'Tipo de zona común no encontrado' });
      }
      
      // Llama al modelo para actualizar el tipo de zona común
      // Si is_active no se proporcionó en la petición, mantiene el valor actual
      const updatedType = await AmenityTypeModel.update(id, { 
        name, 
        description, 
        is_active: is_active !== undefined ? is_active : type.is_active 
      });
      
      // Verificar si la actualización fue exitosa
      if (!updatedType) {
        // Si falló la actualización, retorna un error del servidor
        return res.status(500).json({ error: 'Falló al actualizar el tipo de zona común' });
      }
      
      // Retornar una respuesta exitosa con los datos actualizados
      res.status(200).json({
        message: 'Tipo de zona común actualizado exitosamente',
        data: updatedType
      });
    } catch (error) {
      // En caso de error, registra el error y retorna un mensaje de error
      console.error('Error al actualizar el tipo de zona común: ', error);
      res.status(500).json({ error: 'Error al actualizar el tipo de zona común', details: error.message });
    }
  }
  
  /**
   * Elimina un tipo de zona común del sistema.
   * 
   * @param {Request} req - Objeto de solicitud HTTP con el ID del tipo a eliminar.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con el resultado de la operación.
   */
  async delete(req, res) {
    try {
      // Extraer el ID desde los parámetros de la ruta
      const { id } = req.params;
      
      // Verificar si el tipo de zona común existe antes de intentar eliminarlo
      const type = await AmenityTypeModel.findById(id);
      
      if (!type) {
        // Si no existe, retorna un error 404 (Not Found)
        return res.status(404).json({ error: 'Tipo de zona común no se encuentra' });
      }
      
      // Llama al modelo para eliminar el tipo de zona común
      const deleted = await AmenityTypeModel.delete(id);
      
      // Verificar si la eliminación fue exitosa
      if (!deleted) {
        // Si falló la eliminación, puede ser por restricciones de clave foránea
        // si hay zonas comunes que usan este tipo
        return res.status(500).json({ error: 'Fallo al borrar el tipo de zona común' });
      }
      
      // Retornar una respuesta exitosa sin datos adicionales
      res.status(200).json({
        message: 'Tipo de zona común eliminado con éxito'
      });
    } catch (error) {
      // En caso de error, registra el error y retorna un mensaje de error
      // El error podría ocurrir si hay zonas comunes que dependen de este tipo
      console.error('Error deleting amenity type:', error);
      res.status(500).json({ error: 'Error eliminando el tipo de zona común', details: error.message });
    }
  }

  /**
   * Cambia el estado de activación de un tipo de zona común (activo/inactivo).
   * Este método es más específico que update y solo cambia el estado de activación.
   * 
   * @param {Request} req - Objeto de solicitud HTTP con el ID y el nuevo estado.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con el resultado de la operación.
   */
  async toggleActive(req, res) {
    try {
      // Extraer el ID desde los parámetros de la ruta
      const { id } = req.params;
      
      // Extraer el valor de isActive desde el cuerpo de la petición
      const { isActive } = req.body;
      
      // Verificar que se haya proporcionado el parámetro isActive
      if (isActive === undefined) {
        // Si no se proporciona, retorna un error de validación (400 Bad Request)
        return res.status(400).json({ error: 'Se requiere el parámetro isActive (true/false)' });
      }
      
      // Verificar si el tipo de zona común existe antes de intentar modificarlo
      const type = await AmenityTypeModel.findById(id);
      
      if (!type) {
        // Si no existe, retorna un error 404 (Not Found)
        return res.status(404).json({ error: 'Tipo de zona común no encontrado' });
      }
      
      // Llama al modelo para cambiar el estado de activación
      const updatedType = await AmenityTypeModel.toggleActive(id, isActive);
      
      // Verificar si la actualización fue exitosa
      if (!updatedType) {
        // Si falló la actualización, retorna un error del servidor
        return res.status(500).json({ error: 'Falló al cambiar el estado del tipo de zona común' });
      }
      
      // Retornar una respuesta exitosa con un mensaje personalizado según el nuevo estado
      // y los datos actualizados
      res.status(200).json({
        message: `Tipo de zona común ${isActive ? 'activado' : 'desactivado'} exitosamente`,
        data: updatedType
      });
    } catch (error) {
      // En caso de error, registra el error y retorna un mensaje de error
      console.error('Error toggling amenity type active status:', error);
      res.status(500).json({ error: 'Error al cambiar estado del tipo de zona común', details: error.message });
    }
  }
}

/**
 * Exporta una instancia del controlador para ser utilizada en las rutas.
 */
export default new AmenityTypeController(); 
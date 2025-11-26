/**
 * Importar el modelo de Amenity para interactuar con la base de datos.
 * El modelo contiene todos los métodos necesarios para las operaciones CRUD.
 */
import AmenityModel from "../models/amenity.model.js";
import StatusModel from '../models/status.model.js';

/**
 * Controlador para manejar las operaciones relacionadas con zonas comunes.
 * Procesar las peticiones HTTP, valida los datos y devuelve las respuestas adecuadas.
 */
class AmenityController {
  /**
   * Registrar una nueva zona común en el sistema.
   *
   * Estados válidos para zonas comunes:
   * - Disponible (ID: 3) - Zona común lista para uso
   * - En Mantenimiento (ID: 4) - Zona común en reparación o mantenimiento
   * - Cerrada (ID: 5) - Zona común cerrada temporalmente
   * - Reservada (ID: 6) - Zona común reservada
   * - Fuera de Servicio (ID: 7) - Zona común no disponible
   *
   * @param {Request} req - Objeto de solicitud HTTP con los datos de la zona común.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con el resultado de la operación.
   */
  async register(req, res) {
    try {
      // Extraer los datos del cuerpo de la petición
      const { name,
        capacity,
        description,
        amenity_photo,
        status_id,
        tariff_id,
        amenity_type_id,
      } = req.body;

      // Realizar una validación básica de los campos requeridos
      if (!name || !status_id) {
        // Si faltan campos obligatorios, devuelve un error 400 (Bad Request)
        return res.status(400).json({
          error: "Faltan campos requeridos: 'name' y 'status_id' son obligatorios"
        });
      }

      // Validar que el status_id sea válido para zonas comunes
      const isValidStatus = await StatusModel.validateStatusForEntity(status_id, 'amenity');
      if (!isValidStatus) {
        return res.status(400).json({
          error: 'El estado proporcionado no es válido para zonas comunes. Use solo estados de tipo "amenity" (Disponible, En Mantenimiento, Cerrada, Reservada, Fuera de Servicio).'
        });
      }

      // Llamar al modelo para crear la zona común en la base de datos
      const amenityId = await AmenityModel.create({
        name,
        capacity,
        description,
        amenity_photo,
        status_id,
        tariff_id,
        amenity_type_id,
      });

      // Devolver una respuesta exitosa con el ID de la zona común creada
      res.status(201).json({
        message: "Zona común creada con éxito",
        id: amenityId,
      });
    } catch (error) {
      // En caso de error, registra el error y devuelve una respuesta de error del servidor
      console.error('Error al crear zona común:', error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * Obtener y muestra todas las zonas comunes disponibles para uso.
   *
   * Estados incluidos: Disponible, Reservada
   * Estados excluidos: En Mantenimiento, Cerrada, Fuera de Servicio
   *
   * @param {Request} req - Objeto de solicitud HTTP.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con la lista de zonas comunes disponibles.
   */
  async show(req, res) {
    try {
      // Llamar al modelo para obtener todas las zonas comunes disponibles para uso
      // Excluye zonas en mantenimiento, cerradas o fuera de servicio
      const amenityModel = await AmenityModel.showActive();

      // Devolver una respuesta exitosa con los datos obtenidos
      res.status(200).json({
        success: true,
        message: "Zonas comunes traídas con éxito",
        data: amenityModel,
      });
    } catch (error) {
      // En caso de error, registra el error y devuelve una respuesta de error del servidor
      console.error('Error al mostrar zonas comunes:', error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  }

/**
   * Actualizar una zona común existente.
   *
   * Permite cambiar el estado de la zona común entre:
   * - Disponible (ID: 3) - Zona común lista para uso
   * - En Mantenimiento (ID: 4) - Zona común en reparación o mantenimiento
   * - Cerrada (ID: 5) - Zona común cerrada temporalmente
   * - Reservada (ID: 6) - Zona común reservada
   * - Fuera de Servicio (ID: 7) - Zona común no disponible
   *
   * @param {Request} req - Objeto de solicitud HTTP con los nuevos datos.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con el resultado de la operación.
   */
  async update(req, res) {
    try {
      // Extraer los datos del cuerpo de la petición
      const {
        name,
        capacity,
        description,
        amenity_photo,
        status_id,
        tariff_id,
        amenity_type_id,
      } = req.body;

      // Obtener el ID de la zona común desde los parámetros de la ruta
      const id = req.params.id;

      // Realizar una validación básica de los campos requeridos
      if (!name || !status_id || !id) {
        return res.status(400).json({
          error: "Faltan campos requeridos: 'name', 'status_id' e 'id' son obligatorios"
        });
      }

      // Verificar si la zona común existe antes de intentar actualizarla
      const existingAmenity = await AmenityModel.findById(id);
      if (!existingAmenity) {
        // Si no existe, devuelve un error 404 (Not Found)
        return res.status(404).json({ error: "Zona común no existe" });
      }

      // Validar que el status_id sea válido para zonas comunes
      const isValidStatus = await StatusModel.validateStatusForEntity(status_id, 'amenity');
      if (!isValidStatus) {
        return res.status(400).json({
          error: 'El estado proporcionado no es válido para zonas comunes. Use solo estados de tipo "amenity" (Disponible, En Mantenimiento, Cerrada, Reservada, Fuera de Servicio).'
        });
      }

      // Llamar al modelo para actualizar la zona común en la base de datos
      const updatedAmenity = await AmenityModel.update(id, {
        name,
        capacity,
        description,
        amenity_photo,
        status_id,
        tariff_id,
        amenity_type_id,
      });

      // Verificar si la actualización fue exitosa
      if (!updatedAmenity) {
        return res.status(400).json({ error: "Falló la actualización o no fue hecho ningún cambio" });
      }

      // Devolver una respuesta exitosa con los datos actualizados
      return res.status(200).json({
        message: "Zona común actualizada con éxito",
        data: updatedAmenity,
      });

    } catch (error) {
      // En caso de error, registrar el error y devuelve una respuesta de error del servidor
      console.error("Error actualizando la zona común: ", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * Eliminar una zona común existente.
   * 
   * @param {Request} req - Objeto de solicitud HTTP con el ID a eliminar.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con el resultado de la operación.
   */
  async delete(req, res) {
    try {
      // Obtener el ID de la zona común desde los parámetros de la ruta
      const id = req.params.id;
      
      // Realiza una validación básica del ID
      if (!id) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }
      
      // Verificar primero si la zona común existe
      const existingAmenity = await AmenityModel.findById(id);
      if (!existingAmenity) {
        return res.status(404).json({ error: "Zona común no existe" });
      }
      
      // Llama al modelo para eliminar la zona común de la base de datos
      const deleteAmenityModel = await AmenityModel.delete(id);
      
      // Devolver una respuesta exitosa
      res.status(200).json({
        message: "Zona común eliminada con éxito",
        data: deleteAmenityModel,
      });
    } catch (error) {
      // En caso de error, registra el error y devuelve una respuesta de error del servidor
      console.error("Error al eliminar zona común: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  /**
   * Buscar y devuelve una zona común disponible por su ID.
   *
   * Solo retorna zonas comunes que estén en estado disponible para uso.
   * Estados incluidos: Disponible, Reservada
   * Estados excluidos: En Mantenimiento, Cerrada, Fuera de Servicio
   *
   * @param {Request} req - Objeto de solicitud HTTP con el ID a buscar.
   * @param {Response} res - Objeto de respuesta HTTP para devolver el resultado.
   * @returns {Response} - Respuesta JSON con el resultado de la búsqueda.
   */
  async findById(req, res) {
    try {
      // Obtener el ID de la zona común desde los parámetros de la ruta
      const id = req.params.id;

      // Realiza una validación básica del ID
      if (!id) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }

      // Buscar la zona común disponible por su ID
      // Excluye zonas en mantenimiento, cerradas o fuera de servicio
      const existingAmenityModel = await AmenityModel.findByIdActive(id);

      // Verificar si se encontró la zona común
      if (!existingAmenityModel) {
        // Si no se encuentra, devuelve un error 404 (Not Found)
        return res.status(404).json({
          error: "La zona común no existe o no está disponible para uso. Puede estar en mantenimiento, cerrada o fuera de servicio."
        });
      }

      // Devolver una respuesta exitosa con los datos de la zona común
      res.status(200).json({
        message: "Zona común encontrada",
        data: existingAmenityModel,
      });
    } catch (error) {
      // En caso de error, registra el error y devuelve una respuesta de error del servidor
      console.error("Error al buscar zona común: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default new AmenityController();

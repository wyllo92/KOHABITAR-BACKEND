import PackageModel from '../models/package.model.js';
import StatusModel from '../models/status.model.js';

/**
 * El controlador gestiona las operaciones relacionadas con los paquetes en el sistema.
 * El controlador proporciona métodos para crear, consultar, actualizar y eliminar paquetes,
 * así como registrar su entrega y salida del conjunto residencial.
 * @class PackageController
 */
class PackageController {
    /**
     * El sistema obtiene todos los paquetes registrados.
     * El método consulta la base de datos y devuelve una lista completa de paquetes
     * con información relacionada como destinatario, propiedad y estado.
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    static async getAll(req, res) {
        try {
            const packages = await PackageModel.show();
            res.json(packages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * El sistema obtiene un paquete específico mediante su identificador único.
     * El método consulta la base de datos y devuelve los detalles completos del paquete
     * incluyendo información del destinatario, propiedad y estado.
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     */
    static async getById(req, res) {
        try {
            const package_ = await PackageModel.findById(req.params.id);
            if (package_) {
                res.json(package_);
            } else {
                res.status(404).json({ message: 'Paquete no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Crear un nuevo paquete en el sistema.
     * Este método recibe los datos del paquete, valida que los campos requeridos estén presentes,
     * y registra el paquete en la base de datos con la fecha de entrada actual.
     * El sistema devuelve la información completa del paquete creado incluyendo datos relacionados.
     *
     * @param {Object} req - Objeto de solicitud HTTP con los datos del paquete en el cuerpo
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con el paquete creado o mensajes de error
     */
    static async create(req, res) {
        try {
            // El sistema extrae los datos del paquete desde el cuerpo de la petición
            const { description, recipient_user_id, property_id, status_id } = req.body;

            // Validación 1: El sistema verifica que todos los campos requeridos estén presentes
            if (!description || !recipient_user_id || !property_id || !status_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Validación fallida',
                    errors: [
                        'Los campos description, recipient_user_id, property_id y status_id son requeridos'
                    ]
                });
            }

            // Validación 2: El sistema verifica que la descripción no esté vacía
            if (description.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validación fallida',
                    errors: ['La descripción del paquete no puede estar vacía']
                });
            }

            // Validación 3: El sistema verifica que los IDs sean números válidos
            if (isNaN(recipient_user_id) || isNaN(property_id) || isNaN(status_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Validación fallida',
                    errors: ['Los IDs deben ser números válidos']
                });
            }

            // Validación 4: El sistema verifica que el status_id sea válido para paquetes
            const isValidStatus = await StatusModel.validateStatusForEntity(status_id, 'package');
            if (!isValidStatus) {
                return res.status(400).json({
                    success: false,
                    message: 'El estado proporcionado no es válido para paquetes. Use solo estados de tipo "package".'
                });
            }

            // El sistema intenta crear el paquete en la base de datos
            // La fecha de entrada (entry_at) se registra automáticamente con NOW()
            const packageId = await PackageModel.create(req.body);

            // El sistema verifica si la creación fue exitosa
            if (packageId) {
                // El sistema obtiene la información completa del paquete recién creado
                // Esto incluye datos relacionados como el nombre del destinatario y la propiedad
                const newPackage = await PackageModel.findById(packageId);

                // El sistema responde con código 201 (Created) y los datos del paquete
                res.status(201).json({
                    success: true,
                    data: newPackage,
                    message: 'Paquete registrado exitosamente'
                });
            } else {
                // Si el modelo devuelve null, significa que hubo un error en la base de datos
                res.status(400).json({
                    success: false,
                    message: 'Error al crear el paquete',
                    errors: ['No se pudo registrar el paquete en la base de datos']
                });
            }
        } catch (error) {
            // Si ocurre algún error inesperado, el sistema lo registra en la consola
            console.error('Error al crear paquete:', error);

            // El sistema devuelve un mensaje de error al cliente
            res.status(400).json({
                success: false,
                message: 'Error al crear el paquete',
                errors: [error.message]
            });
        }
    }

    /**
     * El sistema actualiza la información de un paquete existente.
     * El método valida los datos recibidos y actualiza el registro en la base de datos,
     * incluyendo la validación del estado del paquete.
     * @param {Object} req - Objeto de solicitud HTTP con los datos actualizados
     * @param {Object} res - Objeto de respuesta HTTP
     */
    static async update(req, res) {
        try {
            // Validar que el status_id sea válido para paquetes (si se está cambiando)
            if (req.body.status_id) {
                const isValidStatus = await StatusModel.validateStatusForEntity(req.body.status_id, 'package');
                if (!isValidStatus) {
                    return res.status(400).json({
                        success: false,
                        message: 'El estado proporcionado no es válido para paquetes. Use solo estados de tipo "package".'
                    });
                }
            }

            const updated = await PackageModel.update(req.params.id, req.body);
            if (updated) {
                res.json(updated);
            } else {
                res.status(404).json({ message: 'Paquete no encontrado' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * El sistema elimina un paquete del registro.
     * El método localiza el paquete por su ID y lo elimina permanentemente
     * de la base de datos del conjunto residencial.
     * @param {Object} req - Objeto de solicitud HTTP con el ID del paquete
     * @param {Object} res - Objeto de respuesta HTTP
     */
    static async delete(req, res) {
        try {
            const deleted = await PackageModel.delete(req.params.id);
            if (deleted) {
                res.json({ message: 'Paquete eliminado exitosamente' });
            } else {
                res.status(404).json({ message: 'Paquete no encontrado' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * El sistema obtiene todos los paquetes asociados a un usuario específico.
     * El método filtra los paquetes por el ID del usuario destinatario
     * y devuelve la lista con información completa de cada paquete.
     * @param {Object} req - Objeto de solicitud HTTP con el ID del usuario
     * @param {Object} res - Objeto de respuesta HTTP
     */
    static async getByUser(req, res) {
        try {
            const packages = await PackageModel.findByUser(req.params.userId);
            res.json(packages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * El sistema registra la entrega y salida de un paquete del conjunto residencial.
     * El método actualiza automáticamente la fecha de salida y cambia el estado
     * del paquete a "Entregado" en la base de datos.
     * @param {Object} req - Objeto de solicitud HTTP con el ID del paquete
     * @param {Object} res - Objeto de respuesta HTTP
     */
    static async registerExit(req, res) {
        try {
            const updated = await PackageModel.registerExit(req.params.id);
            if (updated) {
                const package_ = await PackageModel.findById(req.params.id);
                res.json(package_);
            } else {
                res.status(404).json({ message: 'Paquete no encontrado' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default PackageController;
import ParkingAssignment from '../models/parkingAssignment.model.js';

class ParkingAssignmentController {
    /**
     * El sistema crea una nueva asignación de espacio de parqueo
     */
    static async create(req, res) {
        try {
            const {
                parking_slot_id,
                user_id,
                vehicle_id,
                start_time,
                end_time,
                total_amount,
                status_id
            } = req.body;

            // Validar datos requeridos
            if (!parking_slot_id || !user_id || !start_time || !end_time || !total_amount) {
                return res.status(400).json({
                    message: "Faltan campos requeridos: parking_slot_id, user_id, start_time, end_time, total_amount"
                });
            }

            // Verificar disponibilidad del espacio
            const isAvailable = await ParkingAssignment.isSlotAvailable(
                parking_slot_id,
                start_time,
                end_time
            );

            if (!isAvailable) {
                return res.status(409).json({
                    message: "El espacio de parqueo no está disponible para el período seleccionado"
                });
            }

            // Crear la asignación
            const newAssignment = await ParkingAssignment.create({
                parking_slot_id,
                user_id,
                vehicle_id,
                start_time,
                end_time,
                total_amount,
                status_id: status_id || 1 // 1 = activo por defecto
            });

            res.status(201).json(newAssignment);
        } catch (error) {
            console.error('Error al crear asignación:', error);
            res.status(500).json({
                message: "Error al crear la asignación de parqueo",
                error: error.message
            });
        }
    }

    /**
     * Obtener todas las asignaciones activas
     */
    static async getAll(req, res) {
        try {
            const assignments = await ParkingAssignment.getAll();
            res.json(assignments);
        } catch (error) {
            console.error('Error al obtener asignaciones:', error);
            res.status(500).json({
                message: "Error al obtener las asignaciones",
                error: error.message
            });
        }
    }

    /**
     * Obtener una asignación específica por ID
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const [assignment] = await ParkingAssignment.getById(id);

            if (!assignment) {
                return res.status(404).json({
                    message: "Asignación no encontrada"
                });
            }

            res.json(assignment);
        } catch (error) {
            console.error('Error al obtener asignación:', error);
            res.status(500).json({
                message: "Error al obtener la asignación",
                error: error.message
            });
        }
    }

    /**
     * Actualiza una asignación existente
     */
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Si se están actualizando las fechas, verificar disponibilidad
            if (updateData.start_time || updateData.end_time) {
                const [assignment] = await ParkingAssignment.getById(id);  // Cambiado de findById a getById
                if (!assignment) {
                    return res.status(404).json({
                        message: "Asignación no encontrada"
                    });
                }

                const isAvailable = await ParkingAssignment.isSlotAvailable(
                    assignment.parking_slot_id,
                    updateData.start_time || assignment.start_time,
                    updateData.end_time || assignment.end_time
                );

                if (!isAvailable) {
                    return res.status(409).json({
                        message: "El espacio no está disponible para el nuevo período"
                    });
                }
            }

            const updated = await ParkingAssignment.update(id, updateData);

            if (!updated) {
                return res.status(404).json({
                    message: "Asignación no encontrada"
                });
            }

            res.json({ message: "Asignación actualizada correctamente" });
        } catch (error) {
            console.error('Error al actualizar asignación:', error);
            res.status(500).json({
                message: "Error al actualizar la asignación",
                error: error.message
            });
        }
    }

    /**
     * Finaliza una asignación (cambia su estado a finalizado)
     */
    static async end(req, res) {
        try {
            const { id } = req.params;
            const ended = await ParkingAssignment.update(id, {
                status_id: 2, // 2 = finalizado
                end_time: new Date()
            });

            if (!ended) {
                return res.status(404).json({
                    message: "Asignación no encontrada"
                });
            }

            res.json(ended);
        } catch (error) {
            console.error('Error al finalizar asignación:', error);
            res.status(500).json({
                message: "Error al finalizar la asignación",
                error: error.message
            });
        }
    }

    /**
     * Obtener las asignaciones de un usuario específico
     */
    static async getByUser(req, res) {
        try {
            const { userId } = req.params;
            const assignments = await ParkingAssignment.getByUserId(userId);
            res.json(assignments);
        } catch (error) {
            console.error('Error al obtener asignaciones del usuario:', error);
            res.status(500).json({
                message: "Error al obtener las asignaciones del usuario",
                error: error.message
            });
        }
    }

    /**
     * Verificar la disponibilidad de un espacio de parqueo
     */
    static async checkAvailability(req, res) {
        try {
            const { slotId } = req.params;
            const { start_time, end_time } = req.query;

            if (!start_time || !end_time) {
                return res.status(400).json({
                    message: "Se requieren los parámetros start_time y end_time"
                });
            }

            const isAvailable = await ParkingAssignment.isSlotAvailable(
                slotId,
                start_time,
                end_time
            );

            res.json({ available: isAvailable });
        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
            res.status(500).json({
                message: "Error al verificar la disponibilidad",
                error: error.message
            });
        }
    }
}

export default ParkingAssignmentController;
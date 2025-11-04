import ReservationModel from "../models/reservation.model.js";

class ReservationController {
  // Obtener todas las reservas
  async getAll(req, res) {
    try {
      const reservations = await ReservationModel.show();
      res.status(200).json(reservations);
    } catch (error) {
      res.status(500).json({
        error: "Error interno del servidor al obtener las reservas",
        details: error.message,
      });
    }
  }

  // Obtener una reserva por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "El ID de la reserva es obligatorio" });
      }

      const reservation = await ReservationModel.findById(id);
      if (!reservation) {
        return res.status(404).json({ error: "Reserva no encontrada" });
      }

      res.status(200).json(reservation);
    } catch (error) {
      res.status(500).json({
        error: "Error interno del servidor al obtener la reserva",
        details: error.message,
      });
    }
  }

  // Crear una nueva reserva
  async create(req, res) {
    try {
      const {
        amenity_id,
        user_id,
        status_id,
        reservation_start_time,
        reservation_end_time,
        reservation_capacity
      } = req.body;

      // Validación de campos requeridos
      if (!amenity_id || !user_id || !reservation_start_time || !reservation_end_time) {
        return res.status(400).json({
          error: "Los campos amenity_id, user_id, reservation_start_time y reservation_end_time son obligatorios"
        });
      }

      // Insertar nueva reserva
      const reservationId = await ReservationModel.create({
        amenity_id,
        user_id,
        status_id: status_id || null,
        reservation_start_time,
        reservation_end_time,
        reservation_capacity: reservation_capacity || null,
      });

      if (!reservationId) {
        return res.status(500).json({
          error: "No se pudo crear la reserva. Verifica los datos y las claves foráneas."
        });
      }

      res.status(201).json({
        message: "Reserva creada exitosamente",
        reservation_id: reservationId,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error interno del servidor al crear la reserva",
        details: error.message,
      });
    }
  }

  // Actualizar una reserva
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        amenity_id,
        user_id,
        status_id,
        reservation_start_time,
        reservation_end_time,
        reservation_capacity
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "El ID de la reserva es obligatorio" });
      }

      // Validación mínima
      if (!amenity_id || !user_id) {
        return res.status(400).json({
          error: "Los campos amenity_id y user_id son obligatorios para actualizar"
        });
      }

      const updated = await ReservationModel.update(id, {
        amenity_id,
        user_id,
        status_id: status_id || null,
        reservation_start_time,
        reservation_end_time,
        reservation_capacity,
      });

      if (!updated) {
        return res.status(404).json({ error: "Reserva no encontrada o no actualizada" });
      }

      res.status(200).json({
        message: "Reserva actualizada exitosamente",
        data: updated,
      });
    } catch (error) {
      res.status(500).json({
        error: "Error interno del servidor al actualizar la reserva",
        details: error.message,
      });
    }
  }

  // Eliminar una reserva
  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "El ID de la reserva es obligatorio" });
      }

      const deleted = await ReservationModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: "Reserva no encontrada o no eliminada" });
      }

      res.status(200).json({ message: "Reserva eliminada exitosamente" });
    } catch (error) {
      res.status(500).json({
        error: "Error interno del servidor al eliminar la reserva",
        details: error.message,
      });
    }
  }
}

export default new ReservationController();

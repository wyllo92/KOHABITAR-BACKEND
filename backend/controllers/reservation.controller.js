import ReservationModel from "../models/reservation.model.js";



class ReservationController {
  // Obtener todas las reservas
  async getAll(req, res) {
    try {
      const reservations = await ReservationModel.show();
      res.status(200).json(reservations);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // Obtener una reserva por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const reservation = await ReservationModel.findById(id);
      if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
      }
      res.status(200).json(reservation);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // Crear una reserva
  async create(req, res) {
    try {
      const { amenity_id, user_id, status_id, tariff_id, reservation_createAt, reservation_start_time, reservation_end_time, reservation_time_unit, reservation_capacity } = req.body;
      if (!amenity_id || !user_id) {
        return res.status(400).json({ error: "Required fields are missing" });
      }
      const reservationId = await ReservationModel.create({
        amenity_id,
        user_id,
        status_id,
        tariff_id,
        reservation_createAt,
        reservation_start_time,
        reservation_end_time,
        reservation_time_unit,
        reservation_capacity
      });
      if (!reservationId) {
        return res.status(500).json({ error: "No se pudo crear la reserva. Verifica los datos y las claves foráneas." });
      }
      res.status(201).json({ message: "Reservation created", id: reservationId });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
        stack: error.stack
      });
    }
  }

  // Actualizar una reserva
  async update(req, res) {
    try {
      const { id } = req.params;
      const { amenity_id, user_id, status_id, tariff_id, reservation_start_time, reservation_end_time, reservation_time_unit, reservation_capacity } = req.body;
      if (!id || !amenity_id || !user_id) {
        return res.status(400).json({ error: "Required fields are missing" });
      }
      const updated = await ReservationModel.update(id, {
        amenity_id,
        user_id,
        status_id,
        tariff_id,
        reservation_start_time,
        reservation_end_time,
        reservation_time_unit,
        reservation_capacity
      });
      if (!updated) {
        return res.status(404).json({ error: "Reservation not found or not updated" });
      }
      res.status(200).json({ message: "Reservation updated", data: updated });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // Eliminar una reserva
  async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "Reservation id is required" });
      }
      const deleted = await ReservationModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Reservation not found or not deleted" });
      }
      res.status(200).json({ message: "Reservation deleted" });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default new ReservationController();

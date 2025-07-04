import ReservationModel from '../models/reservation.model.js';

class ReservationController {

  static async getAllReservations(req, res) {
    try {
      const reservations = await ReservationModel.show();
      res.json({
        success: true,
        data: reservations,
        message: 'Reservas obtenidas exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las reservas',
        error: error.message
      });
    }
  }

  static async getReservationsByUser(req, res) {
    try {
      const { user_id } = req.params;
      const reservations = await ReservationModel.findByUser(user_id);
      res.json({
        success: true,
        data: reservations,
        message: `Reservas del usuario ${user_id} obtenidas exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las reservas del usuario',
        error: error.message
      });
    }
  }

  static async getReservationsByAmenity(req, res) {
    try {
      const { amenity_id } = req.params;
      const reservations = await ReservationModel.findByAmenity(amenity_id);
      res.json({
        success: true,
        data: reservations,
        message: `Reservas de la amenidad ${amenity_id} obtenidas exitosamente`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener las reservas de la amenidad',
        error: error.message
      });
    }
  }

  static async getReservationById(req, res) {
    try {
      const { id } = req.params;
      const reservation = await ReservationModel.findById(id);

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      res.json({
        success: true,
        data: reservation,
        message: 'Reserva obtenida exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener la reserva',
        error: error.message
      });
    }
  }

  static async createReservation(req, res) {
    try {
      const reservationData = req.body;
      const reservationId = await ReservationModel.create(reservationData);

      if (reservationId) {
        const newReservation = await ReservationModel.findById(reservationId);
        res.status(201).json({
          success: true,
          data: newReservation,
          message: 'Reserva creada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al crear la reserva'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear la reserva',
        error: error.message
      });
    }
  }

  static async updateReservation(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const existingReservation = await ReservationModel.findById(id);
      if (!existingReservation) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      const updatedReservation = await ReservationModel.update(id, updateData);

      if (updatedReservation) {
        res.json({
          success: true,
          data: updatedReservation,
          message: 'Reserva actualizada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al actualizar la reserva'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la reserva',
        error: error.message
      });
    }
  }

  static async deleteReservation(req, res) {
    try {
      const { id } = req.params;

      const existingReservation = await ReservationModel.findById(id);
      if (!existingReservation) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }

      const deleted = await ReservationModel.delete(id);

      if (deleted) {
        res.json({
          success: true,
          message: 'Reserva eliminada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al eliminar la reserva'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la reserva',
        error: error.message
      });
    }
  }
}

export default ReservationController; 
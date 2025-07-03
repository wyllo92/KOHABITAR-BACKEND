import express from 'express';
// Aquí deberías importar el controlador correspondiente cuando lo tengas
// import { getNotifications, getNotificationById, createNotification, updateNotification, deleteNotification } from '../controllers/notification.controller.js';

const router = express.Router();

// Obtener todas las notificaciones
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Obtener todas las notificaciones (no implementado)' });
});

// Obtener una notificación por ID
router.get('/:id', (req, res) => {
  res.status(200).json({ message: `Obtener notificación con ID ${req.params.id} (no implementado)` });
});

// Crear una nueva notificación
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Crear nueva notificación (no implementado)' });
});

// Actualizar una notificación existente
router.put('/:id', (req, res) => {
  res.status(200).json({ message: `Actualizar notificación con ID ${req.params.id} (no implementado)` });
});

// Eliminar una notificación
router.delete('/:id', (req, res) => {
  res.status(200).json({ message: `Eliminar notificación con ID ${req.params.id} (no implementado)` });
});

export default router; 
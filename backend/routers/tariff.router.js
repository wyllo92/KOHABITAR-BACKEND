import express from 'express';
// Aquí deberías importar el controlador correspondiente cuando lo tengas
// import { getTariffs, getTariffById, createTariff, updateTariff, deleteTariff } from '../controllers/tariff.controller.js';

const router = express.Router();

// Obtener todas las tarifas
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Obtener todas las tarifas (no implementado)' });
});

// Obtener una tarifa por ID
router.get('/:id', (req, res) => {
  res.status(200).json({ message: `Obtener tarifa con ID ${req.params.id} (no implementado)` });
});

// Crear una nueva tarifa
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Crear nueva tarifa (no implementado)' });
});

// Actualizar una tarifa existente
router.put('/:id', (req, res) => {
  res.status(200).json({ message: `Actualizar tarifa con ID ${req.params.id} (no implementado)` });
});

// Eliminar una tarifa
router.delete('/:id', (req, res) => {
  res.status(200).json({ message: `Eliminar tarifa con ID ${req.params.id} (no implementado)` });
});

export default router; 
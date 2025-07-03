import express from 'express';
// Aquí deberías importar el controlador correspondiente cuando lo tengas
// import { getReports, getReportById, createReport, updateReport, deleteReport } from '../controllers/report.controller.js';

const router = express.Router();

// Obtener todos los reportes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Obtener todos los reportes (no implementado)' });
});

// Obtener un reporte por ID
router.get('/:id', (req, res) => {
  res.status(200).json({ message: `Obtener reporte con ID ${req.params.id} (no implementado)` });
});

// Crear un nuevo reporte
router.post('/', (req, res) => {
  res.status(201).json({ message: 'Crear nuevo reporte (no implementado)' });
});

// Actualizar un reporte existente
router.put('/:id', (req, res) => {
  res.status(200).json({ message: `Actualizar reporte con ID ${req.params.id} (no implementado)` });
});

// Eliminar un reporte
router.delete('/:id', (req, res) => {
  res.status(200).json({ message: `Eliminar reporte con ID ${req.params.id} (no implementado)` });
});

export default router; 
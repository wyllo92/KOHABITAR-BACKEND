import { Router } from "express";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import PaymentController from '../controllers/payment.controller.js';

const router = Router();
const name = '/payment';

// Crear directorio de uploads si no existe
const uploadDir = 'uploads/payments/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'payment-' + uniqueSuffix + ext);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, GIF) o PDF'));
};

// Configurar multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'El archivo es demasiado grande. Máximo 5MB permitido' 
      });
    }
    return res.status(400).json({ 
      error: 'Error al subir el archivo: ' + err.message 
    });
  } else if (err) {
    return res.status(400).json({ 
      error: err.message 
    });
  }
  next();
};

// =============== RUTAS ===============

// Rutas con subida de archivo
router.route(name)
  .post(upload.single('payment_photo'), handleMulterError, PaymentController.create)    
  .get(PaymentController.show);

// Estadísticas globales
router.route(`${name}/stats`)
  .get(PaymentController.getPaymentStats); 

// Búsqueda por rango de fechas
router.route(`${name}/daterange`)
  .get(PaymentController.findByDateRange); 

// Búsqueda por referencia
router.route(`${name}/reference/:reference`)
  .get(PaymentController.findByReference); 

// Pagos por usuario
router.route(`${name}/user/:userId`)
  .get(PaymentController.findByUserId); 

// Total pagado por usuario
router.route(`${name}/user/:userId/total`)
  .get(PaymentController.getTotalAmountByUser);

// Rutas por ID (con soporte para actualización de foto)
router.route(`${name}/:id`)
  .get(PaymentController.findById)  
  .put(upload.single('payment_photo'), handleMulterError, PaymentController.update)     
  .delete(PaymentController.delete);

// Ruta específica para actualizar solo la foto
router.route(`${name}/:id/photo`)
  .patch(upload.single('payment_photo'), handleMulterError, PaymentController.updatePhoto);

export default router;
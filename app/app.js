/**
 * Author: Diego Casallas
 * Date: 2025-05-27
 * Description: Archivo principal de configuración de la aplicación Express.
 * Este archivo configura la aplicación web, incluyendo middleware,
 * rutas y configuraciones básicas para el funcionamiento del backend.
 */
import express from 'express';
import cors from 'cors';
import { verifyToken } from '../middleware/authMiddleware.js';

/**
 * Se importan todos los enrutadores para manejar las diferentes rutas de la aplicación.
 * Cada enrutador se encarga de gestionar un conjunto específico de endpoints
 * relacionados con un recurso o funcionalidad particular del sistema.
 */

import roleRouter from '../routers/role.router.js';
import userRouter from '../routers/user.router.js';
import profileRouter from '../routers/profile.router.js';
import tokenRouter from '../routers/token.router.js'
// Nuevos routers para conjunto residencial
import propertyRouter from '../routers/property.router.js';
import userPropertyRouter from '../routers/userProperty.router.js';
import vehicleRouter from '../routers/vehicle.router.js';
import statusRouter from '../routers/status.router.js';
import parkingslotRouter from '../routers/parkingslot.router.js';
import parkingzoneRouter from '../routers/parkingzone.router.js';
import amenityRouter from '../routers/amenity.router.js';
import reservationRouter from '../routers/reservation.router.js';
import visitorRouter from '../routers/visitor.router.js';
import invoiceRouter from '../routers/invoice.router.js';
import paymentRouter from '../routers/payment.router.js';
import tariffRouter from '../routers/tariff.router.js';
import notificationRouter from '../routers/notification.router.js';
import notificationTypeRouter from '../routers/notificationType.router.js';
import reportRouter from '../routers/report.router.js';
import amenityTypeRouter from '../routers/amenityType.router.js';
import packageRouter from '../routers/package.router.js';
import cpcgRouter from '../routers/cpcg.router.js';
import cpcgTypeRouter from '../routers/cpcgType.router.js';
import reportTypeRouter from '../routers/reportType.router.js';
import parkingAssignmentRouter from '../routers/parkingAssignment.router.js';
import parkingLotteryRouter from '../routers/parkingLottery.router.js';
import passwordResetRouter from '../routers/passwordReset.router.js';
import exportRouter from '../routers/export.router.js';

/**
 * Se crea una instancia de la aplicación Express.
 * Esta instancia es el núcleo de la aplicación que manejará todas las rutas y solicitudes.
 */
const app = express();

/**
 * Se configuran los middleware básicos:
 * - cors: Permite solicitudes de origen cruzado (CORS)
 * - express.json: Analiza las solicitudes entrantes con formato JSON
 * - express.urlencoded: Analiza las solicitudes con datos codificados en URL
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware mejorado para registrar solicitudes y respuestas
app.use((req, res, next) => {
  // Registrar la solicitud entrante
  console.log(`Hora: ${new Date().toISOString()}`);
  console.log(`Método: ${req.method}`);
  console.log(`Ruta: ${req.path}`);
  console.log(`Body:`, JSON.stringify(req.body, null, 2));

  // Guardar el método write original
  const originalSend = res.send;

  // Interceptar la respuesta
  res.send = function (data) {
    console.log(` Status: ${res.statusCode}`);
    console.log(`Ruta: ${req.path}`);

    // Intentar parsear y mostrar la respuesta de forma legible
    try {
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      console.log(`Respuesta:`, JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log(`Respuesta:`, data);
    }
    // Llamar al método original
    originalSend.call(this, data);
  };

  next();
});

/**
 * Middleware para registro de solicitudes.
 * Esta función se ejecuta en cada solicitud y podría utilizarse
 * para registrar información sobre las solicitudes entrantes.
 * Actualmente está configurado para verificar si hay contenido en el cuerpo
 * de la solicitud, pero no realiza ninguna acción con esa información.
 */
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    // Espacio para implementar registro de solicitudes si se requiere
  }
  next();
});

/**
 * Configuración de rutas de la API.
 * Todas las rutas utilizan el prefijo '/api_v1' para facilitar el versionado y la escalabilidad.
 * Cada router se monta en la aplicación para manejar sus rutas específicas:
 * 
 * - userRouter: Manejar usuarios (registro, autenticación, etc.)
 * - passwordResetRouter: Gestiona restablecimiento de contraseñas olvidadas
 * - roleRouter: Gestiona roles y permisos del sistema
 * - profileRouter: Administra perfiles de usuario
 * - tokenRouter: Gestiona la validación de tokens
 * - propertyRouter: Administra propiedades inmobiliarias
 * - userPropertyRouter: Manejar la relación entre usuarios y propiedades
 * - vehicleRouter: Gestiona vehículos registrados
 * - statusRouter: Administra los estados para diversos elementos
 * - parkingslotRouter: Controla espacios individuales de estacionamiento
 * - parkingzoneRouter: Gestiona zonas de estacionamiento
 * - amenityRouter: Administra zona comúnúnes del conjunto residencial
 * - reservationRouter: Manejar reservas de zona comúnes
 * - visitorRouter: Controla el registro de visitantes
 * - invoiceRouter: Gestiona facturas y cobros
 * - paymentRouter: Administra pagos realizados
 * - tariffRouter: Controla tarifas aplicables
 * - notificationRouter: Manejar notificaciones del sistema
 * - reportRouter: Gestiona generación de informes
 * - amenityTypeRouter: Administra tipos de zona comúnes disponibles
 * - packageRouter: Gestiona paquetes y entregas en el conjunto residencial
 * - cpcgRouter: Administra peticiones, quejas, reclamos y sugerencias (PQRS)
 * - cpcgTypeRouter: Gestiona los tipos de PQRS disponibles
 * - reportTypeRouter: Administra los tipos de reportes del sistema
 * - parkingLotteryRouter: Gestiona sorteos de espacios de parqueo
 */

app.use('/api_v1', userRouter);
app.use('/api_v1', passwordResetRouter);
app.use('/api_v1', verifyToken, roleRouter);
app.use('/api_v1', verifyToken, profileRouter);
app.use('/api_v1', verifyToken, tokenRouter);
app.use('/api_v1', verifyToken, propertyRouter);
app.use('/api_v1', verifyToken, userPropertyRouter);
app.use('/api_v1', verifyToken, vehicleRouter);
app.use('/api_v1', verifyToken, statusRouter);
app.use('/api_v1', verifyToken, parkingslotRouter);
app.use('/api_v1', verifyToken, parkingAssignmentRouter);
app.use('/api_v1', verifyToken, parkingzoneRouter);
app.use('/api_v1', verifyToken, amenityRouter);
app.use('/api_v1', verifyToken, reservationRouter);
app.use('/api_v1', verifyToken, visitorRouter);
app.use('/api_v1', verifyToken, invoiceRouter);
app.use('/api_v1', verifyToken, paymentRouter);
app.use('/api_v1', verifyToken, tariffRouter);
app.use('/api_v1', verifyToken, notificationRouter);
app.use('/api_v1', verifyToken, notificationTypeRouter);
app.use('/api_v1', verifyToken, reportRouter);
app.use('/api_v1', verifyToken, amenityTypeRouter);
app.use('/api_v1', verifyToken, packageRouter);
app.use('/api_v1', verifyToken, cpcgRouter);
app.use('/api_v1', verifyToken, cpcgTypeRouter);
app.use('/api_v1', verifyToken, reportTypeRouter);
app.use('/api_v1', verifyToken, parkingLotteryRouter);
app.use('/api_v1', exportRouter);


/**
 * Ruta de verificación de salud del servidor.
 * Esta ruta (/health) permite comprobar si el servidor está funcionando correctamente.
 * Devolver un estado 200 junto con información sobre el estado del servidor
 * y una marca de tiempo de cuándo se realizó la consulta.
 * Es útil para monitoreo, balanceo de carga y verificaciones de disponibilidad.
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Middleware para manejar rutas no encontradas (404).
 * Si ninguna de las rutas anteriores maneja la solicitud,
 * este middleware captura todas las rutas restantes y devuelve
 * un estado 404 junto con un mensaje indicando que el endpoint no existe.
 */
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Endpoint losses'
  });
});

/**
 * Se exporta la aplicación configurada para ser utilizada en server.js
 * donde se iniciará el servidor HTTP.
 */
export default app;
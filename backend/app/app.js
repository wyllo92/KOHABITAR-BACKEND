import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import roleRouter from '../routers/role.router.js';
import userStatusRouter from '../routers/status.router.js';
import userRouter from '../routers/user.router.js';
import profileRouter from '../routers/profile.router.js';
import userRoleRouter from '../routers/userRole.router.js';
import moduleRouter from '../routers/module.router.js';
import tokenRouter from '../routers/token.router.js'
// Nuevos routers para conjunto residencial
import propertyRouter from '../routers/property.router.js';
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
import reportRouter from '../routers/report.router.js';
import amenityTypeRouter from '../routers/amenityType.router.js';
import cpcgRouter from '../routers/cpcg.router.js';
import cpcgTypeRouter from '../routers/cpcgType.router.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos subidos (ej. /uploads/profiles/...)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Add request logging middleware
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
  }
  next();
});

// Prefix for all profile routes, facilitating scalability
app.use('/api_v1', roleRouter);
app.use('/api_v1', userStatusRouter);
app.use('/api_v1', userRouter);
app.use('/api_v1', profileRouter);
app.use('/api_v1', userRoleRouter);
app.use('/api_v1', moduleRouter);
app.use('/api_v1', tokenRouter);
app.use('/api_v1', propertyRouter);
app.use('/api_v1', vehicleRouter);
app.use('/api_v1', statusRouter);
app.use('/api_v1', parkingslotRouter);
app.use('/api_v1', parkingzoneRouter);
app.use('/api_v1', amenityRouter);
app.use('/api_v1', reservationRouter);
app.use('/api_v1', visitorRouter);
app.use('/api_v1', invoiceRouter);
app.use('/api_v1', paymentRouter);
app.use('/api_v1', tariffRouter);
app.use('/api_v1', notificationRouter);
app.use('/api_v1', reportRouter);
app.use('/api_v1', amenityTypeRouter);
app.use('/api_v1', cpcgRouter);
app.use('/api_v1', cpcgTypeRouter);


// Add a test route to verify the server is working
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res, next) => {
  res.status(404).json({
    message: 'Endpoint losses'
  });
});

export default app;
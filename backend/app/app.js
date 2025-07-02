/**
 * Author:Diego Casallas
 * Date: 2025-05-27
 * Description: 
*/
import express from 'express';
import cors from 'cors';
/* The routers are imported to handle specific routes in the application.*/
import uploadFile from '../routers/uploadFile.router.js';
import salaryRouter from '../routers/salary.router.js';
import documentTypeRouter from '../routers/documentType.router.js';
import roleRouter from '../routers/role.router.js';
import userStatusRouter from '../routers/userStatus.router.js';
import userRouter from '../routers/user.router.js';
import profileRouter from '../routers/profile.router.js';
import userRoleRouter from '../routers/userRole.router.js';
import moduleRouter from '../routers/module.router.js';
import tokenRouter from '../routers/token.router.js';

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


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prefix for all profile routes, facilitating scalability
app.use('/api_v1',salaryRouter);
app.use('/api_v1',uploadFile);
app.use('/api_v1',documentTypeRouter);
app.use('/api_v1',roleRouter);
app.use('/api_v1',userStatusRouter);	
app.use('/api_v1',userRouter);	
app.use('/api_v1',profileRouter);	
app.use('/api_v1',userRoleRouter);	
app.use('/api_v1',moduleRouter);
app.use('/api_v1',tokenRouter);

// Nuevas rutas para conjunto residencial
app.use('/api_v1/properties', propertyRouter);
app.use('/api_v1/vehicles', vehicleRouter);
app.use('/api_v1/status', statusRouter);
app.use('/api_v1/parkingslots', parkingslotRouter);
app.use('/api_v1/parkingzones', parkingzoneRouter);
app.use('/api_v1/amenities', amenityRouter);
app.use('/api_v1/reservations', reservationRouter);
app.use('/api_v1/visitors', visitorRouter);
app.use('/api_v1/invoices', invoiceRouter);
app.use('/api_v1/payments', paymentRouter);
app.use('/api_v1/tariffs', tariffRouter);
app.use('/api_v1/notifications', notificationRouter);
app.use('/api_v1/reports', reportRouter);	



app.use((rep, res, nex) => {
  res.status(404).json({
    message: 'Endpoint losses'
  });
});

export default app;
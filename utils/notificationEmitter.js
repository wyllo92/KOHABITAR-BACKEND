/**
 * Sistema de Notificaciones con EventEmitter
 *
 * Este archivo implementa un sistema de eventos para enviar notificaciones por email
 * de forma desacoplada y flexible usando el patrón EventEmitter de Node.js.
 * Date: 2025-11-03
 */

// Se importa EventEmitter desde el módulo 'events' de Node.js (incluido por defecto)
import { EventEmitter } from 'events';

// Se importan todas las funciones del servicio de email
// El asterisco (*) significa "todo" y 'as emailService' lo agrupa bajo ese nombre
import * as emailService from './emailService.js';

/**
 * Clase NotificationEmitter
 *
 * Esta clase hereda (extiende) todas las capacidades de EventEmitter y agrega
 * funcionalidad personalizada para manejar notificaciones por email.
 *
 * EventEmitter permite:
 * - Emitir eventos: emit('nombre-evento', datos)
 * - Escuchar eventos: on('nombre-evento', función)
 * - Ejecutar funciones cuando ocurren eventos específicos
 */
class NotificationEmitter extends EventEmitter {
  /**
   * Constructor de la clase
   *
   * Se ejecuta UNA SOLA VEZ cuando se crea la instancia del NotificationEmitter.
   * Es como el "nacimiento" del objeto.
   */
  constructor() {
    // Se llama al constructor de la clase padre (EventEmitter)
    // Esto es obligatorio cuando se usa 'extends'
    super();

    // Se configuran todos los escuchadores de eventos
    // Esto prepara al sistema para estar "alerta" y reaccionar a eventos
    this.setupListeners();

    // Mensaje de confirmación en la consola
    console.log('NotificationEmitter inicializado correctamente');
  }

  /**
   * setupListeners - Configura todos los escuchadores de eventos
   *
   * Aquí se define QUÉ función se ejecutará cuando se detecte cada evento.
   * Es como configurar alarmas: "Cuando suene esta alarma, haz esto"
   *
   * Sintaxis: this.on('nombre-del-evento', this.funcionAEjecutar)
   */
  setupListeners() {
    // EVENTOS DE USUARIOS

    // El sistema escucha el evento 'usuario-registrado'
    // Cuando lo detecta, ejecuta la función onUsuarioRegistrado
    this.on('usuario-registrado', this.onUsuarioRegistrado);

    // El sistema escucha el evento 'restablecimiento-contraseña'
    // Ya existe en tu código, aquí se agrega al sistema de eventos
    this.on('restablecimiento-contraseña', this.onRestablecimientoContraseña);

    // EVENTOS DE RESERVAS

    // Cuando se crea una reserva de zona común
    this.on('reserva-creada', this.onReservaCreada);

    // Cuando se cancela una reserva
    this.on('reserva-cancelada', this.onReservaCancelada);

    // EVENTOS DE FACTURAS

    // Cuando se genera una nueva factura
    this.on('factura-generada', this.onFacturaGenerada);

    // Cuando se recibe un pago
    this.on('pago-recibido', this.onPagoRecibido);

    // EVENTOS DE VISITANTES

    // Cuando se registra un visitante
    this.on('visitante-registrado', this.onVisitanteRegistrado);

    // EVENTOS DE PAQUETES

    // Cuando llega un paquete
    this.on('paquete-recibido', this.onPaqueteRecibido);

    console.log('Events listeners configurados');
  }

  // 
  // FUNCIONES MANEJADORAS DE EVENTOS
  // 
  // Cada función se ejecuta cuando ocurre su evento correspondiente
  // Se usan arrow functions (=>) para mantener el contexto de 'this'
  // 

  /**
   * onUsuarioRegistrado - Se ejecuta cuando un nuevo usuario se registra
   *
   * @param {Object} data - Los datos del evento
   * @param {string} data.email - Email del nuevo usuario
   * @param {string} data.fullName - Nombre completo del usuario
   *
   * Esta función recibe los datos que se pasaron al hacer emit() y los usa
   * para enviar un email de bienvenida al nuevo usuario.
   */
  onUsuarioRegistrado = async (data) => {
    try {
      // Se registra en consola que se detectó el evento
      console.log('[EVENTO] Usuario registrado detectado');
      console.log('Enviando email de bienvenida a:', data.email);

      // Se llama a la función del emailService que envía el email
      // El 'await' espera a que el email se envíe antes de continuar
      await emailService.sendWelcomeEmail({
        email: data.email,
        fullName: data.fullName
      });

      // Si todo salió bien, se registra el éxito
      console.log('Email de bienvenida enviado exitosamente');
    } catch (error) {
      // Si hay un error, se registra pero NO se detiene la aplicación
      // Esto es importante: un error al enviar email no debe romper el sistema
      console.error('Error al enviar email de bienvenida:', error.message);
    }
  };

  /**
   * onRestablecimientoContraseña - Maneja el evento de restablecimiento de contraseña
   *
   * @param {Object} data
   * @param {string} data.email - Email del usuario
   * @param {string} data.fullName - Nombre del usuario
   * @param {string} data.token - Token de restablecimiento
   */
  onRestablecimientoContraseña = async (data) => {
    try {
      console.log('[EVENTO] Restablecimiento de contraseña detectado');
      console.log('Enviando email de restablecimiento a:', data.email);

      // Se llama a la función existente de restablecimiento de contraseña
      await emailService.sendPasswordResetEmail({
        email: data.email,
        fullName: data.fullName,
        token: data.token
      });

      console.log('Email de restablecimiento enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar email de restablecimiento:', error.message);
    }
  };

  /**
   * onReservaCreada - Se ejecuta cuando se crea una reserva de zona común
   *
   * @param {Object} data
   * @param {string} data.email - Email del usuario que reservó
   * @param {string} data.fullName - Nombre del usuario
   * @param {string} data.amenityName - Nombre de la zona común reservada
   * @param {string} data.date - Fecha de la reserva
   * @param {string} data.time - Hora de la reserva
   */
  onReservaCreada = async (data) => {
    try {
      console.log('[EVENTO] Reserva creada detectada');
      console.log('Zona común:', data.amenityName);

      // Se envía el email de confirmación de reserva
      await emailService.sendReservationConfirmationEmail({
        email: data.email,
        fullName: data.fullName,
        amenityName: data.amenityName,
        date: data.date,
        time: data.time
      });

      console.log('Email de confirmación de reserva enviado');
    } catch (error) {
      console.error('Error al enviar email de reserva:', error.message);
    }
  };

  /**
   * onReservaCancelada - Se ejecuta cuando se cancela una reserva
   *
   * @param {Object} data
   * @param {string} data.email
   * @param {string} data.fullName
   * @param {string} data.amenityName
   * @param {string} data.date
   */
  onReservaCancelada = async (data) => {
    try {
      console.log('[EVENTO] Reserva cancelada detectada');

      await emailService.sendReservationCancellationEmail({
        email: data.email,
        fullName: data.fullName,
        amenityName: data.amenityName,
        date: data.date
      });

      console.log('Email de cancelación enviado');
    } catch (error) {
      console.error('Error al enviar email de cancelación:', error.message);
    }
  };

  /**
   * onFacturaGenerada - Se ejecuta cuando se genera una nueva factura
   *
   * @param {Object} data
   * @param {string} data.email - Email del usuario facturado
   * @param {string} data.fullName - Nombre del usuario
   * @param {string} data.invoiceNumber - Número de factura
   * @param {number} data.amount - Monto de la factura
   * @param {string} data.dueDate - Fecha de vencimiento
   */
  onFacturaGenerada = async (data) => {
    try {
      console.log('[EVENTO] Factura generada detectada');
      console.log('Número de factura:', data.invoiceNumber);

      await emailService.sendInvoiceEmail({
        email: data.email,
        fullName: data.fullName,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        dueDate: data.dueDate
      });

      console.log('Email de factura enviado');
    } catch (error) {
      console.error('Error al enviar email de factura:', error.message);
    }
  };

  /**
   * onPagoRecibido - Se ejecuta cuando se recibe un pago
   *
   * @param {Object} data
   * @param {string} data.email
   * @param {string} data.fullName
   * @param {string} data.invoiceNumber - Número de factura pagada
   * @param {number} data.amount - Monto pagado
   * @param {string} data.paymentDate - Fecha del pago
   */
  onPagoRecibido = async (data) => {
    try {
      console.log('[EVENTO] Registro de pago detectado');
      console.log('Monto:', data.amount);

      await emailService.sendPaymentConfirmationEmail({
        email: data.email,
        fullName: data.fullName,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        paymentDate: data.paymentDate
      });

      console.log('Email de confirmación de pago enviado');
    } catch (error) {
      console.error('Error al enviar email de pago:', error.message);
    }
  };

  /**
   * onVisitanteRegistrado - Se ejecuta cuando se registra un visitante
   *
   * @param {Object} data
   * @param {string} data.email - Email del residente
   * @param {string} data.fullName - Nombre del residente
   * @param {string} data.visitorName - Nombre del visitante
   * @param {string} data.arrivalDate - Fecha de llegada
   * @param {string} data.arrivalTime - Hora de llegada
   */
  onVisitanteRegistrado = async (data) => {
    try {
      console.log('[EVENTO] Visitante registrado detectado');
      console.log('Visitante:', data.visitorName);

      await emailService.sendVisitorNotificationEmail({
        email: data.email,
        fullName: data.fullName,
        visitorName: data.visitorName,
        arrivalDate: data.arrivalDate,
        arrivalTime: data.arrivalTime
      });

      console.log('Email de notificación de visitante enviado');
    } catch (error) {
      console.error('Error al enviar email de visitante:', error.message);
    }
  };

  /**
   * onPaqueteRecibido - Se ejecuta cuando llega un paquete
   *
   * @param {Object} data
   * @param {string} data.email - Email del residente
   * @param {string} data.fullName - Nombre del residente
   * @param {string} data.trackingNumber - Número de seguimiento
   * @param {string} data.arrivalDate - Fecha de llegada del paquete
   */
  onPaqueteRecibido = async (data) => {
    try {
      console.log('[EVENTO] Paquete recibido detectado');
      console.log('Tracking:', data.trackingNumber);

      await emailService.sendPackageNotificationEmail({
        email: data.email,
        fullName: data.fullName,
        trackingNumber: data.trackingNumber,
        arrivalDate: data.arrivalDate
      });

      console.log('Email de notificación de paquete recibido');
    } catch (error) {
      console.error('Error al enviar email de paquete:', error.message);
    }
  };
}

// 
// PATRÓN SINGLETON - Una sola instancia para toda la aplicación
// 
//
// Se crea UNA ÚNICA instancia del NotificationEmitter
// Esto garantiza que todos los módulos de la aplicación usen el mismo emisor
// Es importante porque los eventos se registran en esta instancia única
//
const notificationEmitter = new NotificationEmitter();

// Se exporta la instancia (no la clase) para que otros archivos la usen
export default notificationEmitter;

/**
 * CÓMO USAR ESTE MÓDULO EN LOS CONTROLADORES:
 *
 * 1. Importar el emisor:
 *    import notificationEmitter from '../utils/notificationEmitter.js';
 *
 * 2. Emitir un evento cuando algo importante suceda:
 *    notificationEmitter.emit('usuario-registrado', {
 *      email: user.email,
 *      fullName: user.fullName
 *    });
 *
 * 3. El sistema automáticamente detectará el evento y enviará el email
 *
 * EJEMPLO:
 *
 * export async function registerUser(req, res) {
 *   try {
 *     const newUser = await User.create(req.body);
 *
 *     // Emitir evento de usuario registrado
 *     notificationEmitter.emit('usuario-registrado', {
 *       email: newUser.email,
 *       fullName: newUser.fullName
 *     });
 *
 *     res.status(201).json({ success: true, user: newUser });
 *   } catch (error) {
 *     res.status(500).json({ error: error.message });
 *   }
 * }
 */

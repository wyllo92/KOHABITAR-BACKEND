/**
 * Servicio de envío de emails
 *
 * Este archivo contiene funciones para enviar diferentes tipos de emails.
 * Por ahora solo tiene el de restablecimiento de contraseña, pero puedes
 * agregar más funciones aquí (bienvenida, notificaciones, etc.)
 */

import transporter from '../config/emailConfig.js';

/**
 * Envíar un email de restablecimiento de contraseña
 *
 * @param {Object} options - Opciones para el email
 * @param {string} options.email - Email del destinatario
 * @param {string} options.fullName - Nombre completo del usuario
 * @param {string} options.token - Token de restablecimiento
 * @returns {Promise<boolean>} true si se envió correctamente
 *
 * Esta función crea un email bonito en HTML y lo envía al usuario.
 * El email incluye un enlace con el token para restablecer la contraseña.
 */
export async function sendPasswordResetEmail({ email, fullName, token }) {
  try {
    // PASO 1: Crear el enlace de restablecimiento
    // IMPORTANTE: Cambia esta URL por la URL de tu frontend en producción
    const resetLink = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/reset-password?token=${token}`
      : `http://localhost:3001/reset-password?token=${token}`;

    // PASO 2: Crear el contenido del email en HTML
    // Esto hace que el email se vea bonito y profesional
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          h1 {
            color: #4CAF50;
            text-align: center;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            margin: 20px 0;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
          .button:hover {
            background-color: #45a049;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Restablecimiento de Contraseña</h1>

          <p>Hola <strong>${fullName}</strong>,</p>

          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>

          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>

          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Restablecer Contraseña</a>
          </div>

          <div class="warning">
            <strong>Importante:</strong> Este enlace es válido por <strong>1 hora</strong>.
            Después de ese tiempo, deberás solicitar un nuevo enlace.
          </div>

          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #4CAF50;">
            ${resetLink}
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

          <p><strong>¿No solicitaste este cambio?</strong></p>
          <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura.
             Tu contraseña actual seguirá siendo válida.</p>

          <div class="footer">
            <p>Este es un email automático, por favor no respondas a este mensaje.</p>
            <p>&copy; ${new Date().getFullYear()} Sistema de Gestión Residencial</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // PASO 3: Crear versión de texto plano
    // Algunos clientes de email no soportan HTML, así que se debe enviar también texto plano
    const textContent = `
Hola ${fullName},

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Para crear una nueva contraseña, copia y pega este enlace en tu navegador:
${resetLink}

IMPORTANTE: Este enlace es válido por 1 hora.

Si no solicitaste este cambio, puedes ignorar este email de forma segura.

---
Este es un email automático, por favor no respondas a este mensaje.
© ${new Date().getFullYear()} Sistema de Gestión Residencial
    `;

    // PASO 4: Configurar el email
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Sistema de Gestión'}" <${process.env.EMAIL_USER}>`,
      to: email,                          // Email del destinatario
      subject: 'Restablece tu contraseña', // Asunto del email
      text: textContent,                  // Versión texto plano
      html: htmlContent                   // Versión HTML (bonita)
    };

    // PASO 5: Enviar el email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email de restablecimiento enviado exitosamente');
    console.log('Message ID:', info.messageId);
    console.log('Email enviado a:', email);

    return true;
  } catch (error) {
    console.error('Error al enviar email de restablecimiento:', error);

    // Si hay un error, lo lanzamos para que el controlador lo maneje
    throw new Error('No se pudo enviar el email. Por favor, intenta nuevamente más tarde.');
  }
}

/**
 * 
 * FUNCIONES ADICIONALES DE EMAIL
 * 
 * A continuación se encuentran funciones para enviar diferentes tipos de emails.
 * Cada función sigue el mismo patrón: recibe datos, crea el HTML, y envía.
 */

/**
 * Envíar un email de bienvenida cuando un usuario se registra
 *
 * Esta función se ejecuta automáticamente cuando el NotificationEmitter
 * detecta el evento 'usuario-registrado'
 *
 * @param {Object} options - Opciones para el email
 * @param {string} options.email - Email del nuevo usuario
 * @param {string} options.fullName - Nombre completo del usuario
 * @returns {Promise<boolean>} true si se envió correctamente
 */
export async function sendWelcomeEmail({ email, fullName }) {
  try {
    // Se construye el contenido HTML del email de bienvenida
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .welcome-box {
            background: white;
            padding: 20px;
            border-left: 4px solid #4CAF50;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background: #45a049;
          }
          .features {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .features ul {
            list-style: none;
            padding: 0;
          }
          .features li {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .features li:last-child {
            border-bottom: none;
          }
          .features li:before {
            content: "• ";
            color: #4CAF50;
            font-weight: bold;
            margin-right: 10px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido/a!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Nos alegra tenerte con nosotros</p>
          </div>

          <div class="content">
            <div class="welcome-box">
              <p style="font-size: 18px; margin: 0;">
                Hola <strong>${fullName}</strong>,
              </p>
            </div>

            <p>¡Gracias por registrarte en nuestro Sistema de Gestión Residencial!</p>

            <p>Tu cuenta ha sido creada exitosamente y ya puedes comenzar a disfrutar de todos los servicios que tenemos para ti.</p>

            <div class="features">
              <h3 style="color: #4CAF50; margin-top: 0;">¿Qué puedes hacer ahora?</h3>
              <ul>
                <li>Reservar zonas comunes del conjunto residencial</li>
                <li>Consultar y pagar tus facturas en línea</li>
                <li>Registrar visitantes y vehículos</li>
                <li>Ver tus paquetes recibidos</li>
                <li>Enviar peticiones, quejas y reclamos</li>
                <li>Acceder a reportes e información del conjunto</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}" class="button">
                Ir al Sistema
              </a>
            </div>

            <p style="margin-top: 30px;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>

            <p>¡Bienvenido/a a nuestra comunidad!</p>

            <p style="margin-top: 20px;">
              Saludos cordiales,<br>
              <strong>El Equipo de ${process.env.EMAIL_FROM_NAME || 'Sistema de Gestión'}</strong>
            </p>

            <div class="footer">
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} Sistema de Gestión Residencial. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Se configura el email con todos sus parámetros
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Sistema de Gestión'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '¡Bienvenido/a! Tu cuenta ha sido creada exitosamente',
      html: htmlContent
    };

    // Se envía el email usando el transporter configurado
    const info = await transporter.sendMail(mailOptions);

    console.log('Email de bienvenida enviado exitosamente');
    console.log('Message ID:', info.messageId);

    return true;
  } catch (error) {
    console.error('Error al enviar email de bienvenida:', error);
    throw new Error('No se pudo enviar el email de bienvenida.');
  }
}

/**
 * Envía email de confirmación de reserva de zona común
 *
 * @param {Object} options
 * @param {string} options.email
 * @param {string} options.fullName
 * @param {string} options.amenityName - Nombre de la zona común
 * @param {string} options.date - Fecha de la reserva
 * @param {string} options.time - Hora de la reserva
 */
export async function sendReservationConfirmationEmail({
  email,
  fullName,
  amenityName,
  date,
  time
}) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header {
            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reservation-card {
            background: white;
            padding: 25px;
            margin: 20px 0;
            border-left: 5px solid #2196F3;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .detail-row {
            display: flex;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-label {
            font-weight: bold;
            color: #2196F3;
            width: 140px;
          }
          .detail-value {
            flex: 1;
          }
          .important-note {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reserva Confirmada</h1>
          </div>

          <div class="content">
            <p>Hola <strong>${fullName}</strong>,</p>

            <p>Tu reserva ha sido confirmada exitosamente. A continuación encontrarás los detalles:</p>

            <div class="reservation-card">
              <h3 style="color: #2196F3; margin-top: 0;">Detalles de la Reserva</h3>
              <div class="detail-row">
                <span class="detail-label">Zona Común:</span>
                <span class="detail-value">${amenityName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha:</span>
                <span class="detail-value">${date}</span>
              </div>
              <div class="detail-row" style="border-bottom: none;">
                <span class="detail-label">Hora:</span>
                <span class="detail-value">${time}</span>
              </div>
            </div>

            <div class="important-note">
              <strong>Importante:</strong>
              <ul style="margin: 10px 0;">
                <li>Por favor, llega puntual a tu reserva</li>
                <li>Presenta este email al momento de utilizar la zona común</li>
                <li>Respeta las normas de uso del espacio</li>
                <li>Deja el lugar limpio y ordenado al terminar</li>
              </ul>
            </div>

            <p>Si necesitas cancelar o modificar tu reserva, por favor hazlo con al menos 24 horas de anticipación.</p>

            <p style="margin-top: 20px;">
              Saludos,<br>
              <strong>${process.env.EMAIL_FROM_NAME || 'Sistema de Gestión'}</strong>
            </p>

            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Sistema de Gestión Residencial</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmación de Reserva - ${amenityName}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email de confirmación de reserva enviado:', info.messageId);

    return true;
  } catch (error) {
    console.error('Error al enviar email de reserva:', error);
    throw error;
  }
}

/**
 * Envía email cuando se cancela una reserva
 */
export async function sendReservationCancellationEmail({
  email,
  fullName,
  amenityName,
  date
}) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reserva Cancelada</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${fullName}</strong>,</p>
            <p>Tu reserva de <strong>${amenityName}</strong> para el día <strong>${date}</strong> ha sido cancelada.</p>
            <p>Puedes realizar una nueva reserva cuando lo desees.</p>
            <p>Saludos,<br><strong>${process.env.EMAIL_FROM_NAME}</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Cancelación de Reserva - ${amenityName}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar email de cancelación:', error);
    throw error;
  }
}

/**
 * Envía email cuando se genera una factura
 */
export async function sendInvoiceEmail({
  email,
  fullName,
  invoiceNumber,
  amount,
  dueDate
}) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header {
            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .invoice-box {
            background: white;
            padding: 25px;
            margin: 20px 0;
            border: 3px solid #FF9800;
            border-radius: 5px;
          }
          .amount {
            font-size: 32px;
            color: #FF9800;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background: #FF9800;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nueva Factura Generada</h1>
          </div>

          <div class="content">
            <p>Hola <strong>${fullName}</strong>,</p>

            <p>Se ha generado una nueva factura a tu nombre.</p>

            <div class="invoice-box">
              <h3 style="color: #FF9800; margin-top: 0; text-align: center;">Detalles de la Factura</h3>
              <p><strong>Número de Factura:</strong> ${invoiceNumber}</p>
              <p><strong>Fecha de Vencimiento:</strong> ${dueDate}</p>
              <div class="amount">$${parseFloat(amount).toLocaleString('es-CO')}</div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/facturas" class="button">
                Ver Factura
              </a>
            </div>

            <p>Por favor, realiza el pago antes de la fecha de vencimiento para evitar recargos.</p>

            <p style="margin-top: 20px;">
              Saludos,<br>
              <strong>${process.env.EMAIL_FROM_NAME}</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Nueva Factura #${invoiceNumber} - Vence ${dueDate}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar email de factura:', error);
    throw error;
  }
}

/**
 * Envía email de confirmación de pago recibido
 */
export async function sendPaymentConfirmationEmail({
  email,
  fullName,
  invoiceNumber,
  amount,
  paymentDate
}) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header {
            background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon {
            font-size: 60px;
            text-align: center;
            margin: 20px 0;
          }
          .payment-box {
            background: white;
            padding: 25px;
            margin: 20px 0;
            border-left: 5px solid #4CAF50;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Pago Recibido</h1>
          </div>

          <div class="content">
            <p style="text-align: center; font-size: 18px;">
              <strong>¡Gracias por tu pago!</strong>
            </p>

            <p>Hola <strong>${fullName}</strong>,</p>

            <p>Hemos recibido tu pago exitosamente.</p>

            <div class="payment-box">
              <h3 style="color: #4CAF50; margin-top: 0;">Detalles del Pago</h3>
              <p><strong>Factura Pagada:</strong> ${invoiceNumber}</p>
              <p><strong>Monto:</strong> $${parseFloat(amount).toLocaleString('es-CO')}</p>
              <p><strong>Fecha de Pago:</strong> ${paymentDate}</p>
            </div>

            <p>Tu pago ha sido procesado y aplicado a tu cuenta.</p>

            <p style="margin-top: 20px;">
              Saludos,<br>
              <strong>${process.env.EMAIL_FROM_NAME}</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Confirmación de Pago - Factura #${invoiceNumber}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar email de pago:', error);
    throw error;
  }
}

/**
 * Envía email cuando se registra un visitante
 */
export async function sendVisitorNotificationEmail({
  email,
  fullName,
  visitorName,
  arrivalDate,
  arrivalTime
}) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header {
            background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .visitor-box {
            background: white;
            padding: 25px;
            margin: 20px 0;
            border-left: 5px solid #9C27B0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Visitante Registrado</h1>
          </div>

          <div class="content">
            <p>Hola <strong>${fullName}</strong>,</p>

            <p>Se ha registrado un visitante a tu nombre.</p>

            <div class="visitor-box">
              <h3 style="color: #9C27B0; margin-top: 0;">Información del Visitante</h3>
              <p><strong>Nombre:</strong> ${visitorName}</p>
              <p><strong>Fecha de Llegada:</strong> ${arrivalDate}</p>
              <p><strong>Hora:</strong> ${arrivalTime}</p>
            </div>

            <p>El visitante podrá ingresar presentando su documento de identidad en portería.</p>

            <p style="margin-top: 20px;">
              Saludos,<br>
              <strong>${process.env.EMAIL_FROM_NAME}</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Visitante Registrado - ${visitorName}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar email de visitante:', error);
    throw error;
  }
}

/**
 * Envía email cuando llega un paquete
 */
export async function sendPackageNotificationEmail({
  email,
  fullName,
  trackingNumber,
  arrivalDate
}) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header {
            background: linear-gradient(135deg, #FF5722 0%, #E64A19 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .package-icon {
            font-size: 60px;
            text-align: center;
            margin: 20px 0;
          }
          .package-box {
            background: white;
            padding: 25px;
            margin: 20px 0;
            border-left: 5px solid #FF5722;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Paquete Recibido</h1>
          </div>

          <div class="content"></div>

            <p>Hola <strong>${fullName}</strong>,</p>

            <p>¡Tienes un paquete esperándote!</p>

            <div class="package-box">
              <h3 style="color: #FF5722; margin-top: 0;">Información del Paquete</h3>
              <p><strong>Número de Rastreo:</strong> ${trackingNumber}</p>
              <p><strong>Fecha de Llegada:</strong> ${arrivalDate}</p>
              <p><strong>Ubicación:</strong> Portería del conjunto</p>
            </div>

            <p>Por favor, recógelo en portería presentando tu documento de identidad.</p>

            <p style="margin-top: 20px;">
              Saludos,<br>
              <strong>${process.env.EMAIL_FROM_NAME}</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `¡Tienes un Paquete! - Tracking ${trackingNumber}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar email de paquete:', error);
    throw error;
  }
}

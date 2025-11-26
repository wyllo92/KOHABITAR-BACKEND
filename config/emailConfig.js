/**
 * Configuración del servicio de email con Nodemailer
 *
 * Este archivo configura nodemailer para enviar emails.
 * Gmail como servicio gratuito
 *
 * 1. Crear una "Contraseña de aplicación" en tu cuenta de Gmail
 * 2. Ir a: https://myaccount.google.com/apppasswords
 * 3. Crear una nueva contraseña de aplicación
 * 4. Copiar esa contraseña al archivo .env en EMAIL_PASSWORD
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración del transporter de nodemailer
 *
 * ¿Qué es un transporter?
 * - Es el "cartero" que enviará los emails
 * - Se configura una vez y se reutiliza para todos los emails
 */
const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail (gratis hasta 500 emails/día)
  auth: {
    user: process.env.EMAIL_USER,     // Email de Gmail (tuapp@gmail.com)
    pass: process.env.EMAIL_PASSWORD  // Contraseña de aplicación de Gmail
  }
});

/**
 * Verificar que la configuración del email sea correcta
 * Se ejecuta al iniciar el servidor para detectar errores temprano
 */
transporter.verify(function (error, success) {
  if (error) {
    console.error('Error en configuración de email:', error);
    console.log('IMPORTANTE: Verificar que las variables EMAIL_USER y EMAIL_PASSWORD estén en el archivo .env');
  } else {
    console.log('Servidor de email listo para enviar mensajes');
  }
});

export default transporter;

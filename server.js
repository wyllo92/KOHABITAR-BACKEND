/**
 * Author: Diego Casallas
 * Date: 2025-05-19
 * Description: Archivo principal del servidor para el backend de la aplicación KOHABITAR.
 * Este archivo inicia el servidor HTTP utilizando la configuración de la aplicación Express.
 */
import app from './app/app.js';
import dotenv from 'dotenv';

/**
 * Se importa el NotificationEmitter para inicializar el sistema de notificaciones por email.
 * Este import ejecuta el código del módulo, que crea la instancia del emisor de eventos
 * y configura todos los escuchadores de eventos para enviar emails automáticamente.
 *
 * El sistema de notificaciones permite enviar emails de forma automática cuando ocurren
 * eventos importantes como: registro de usuarios, creación de reservas, generación de facturas, etc.
 */
import './utils/notificationEmitter.js';

/**
 * Se carga la configuración de variables de entorno desde el archivo .env
 * para acceder a valores como el puerto del servidor y otras configuraciones.
 */
dotenv.config();

/**
 * Se define el puerto en el que se ejecutará el servidor.
 * Toma el valor de la variable de entorno SERVER_PORT si está definida,
 * de lo contrario utiliza el puerto 3000 como valor predeterminado.
 * Esto permite configurar el puerto dinámicamente según el entorno.
 */
const PORT = process.env.SERVER_PORT || 3000;

/**
 * Inicia el servidor HTTP en el puerto configurado.
 * El método listen() crea un servidor HTTP que escucha en el puerto especificado.
 * Cuando el servidor inicia correctamente, se ejecuta la función de callback
 * que muestra un mensaje en la consola indicando que el servidor está en funcionamiento
 * y la URL donde está disponible.
 */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Sistema de notificaciones por email activado`);
});

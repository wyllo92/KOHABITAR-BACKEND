import jwt from "jsonwebtoken";
import dotenv from "dotenv";

/**
 * Carga las variables de entorno desde el archivo .env
 */
dotenv.config();

/**
 * Middleware para verificar el token JWT de autenticación.
 * Valida que la solicitud contenga un token válido en la cabecera "Authorization".
 * Si el token es válido, extrae la información del usuario y la añade al objeto de solicitud.
 * 
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @param {Function} next - Función para continuar con el siguiente middleware
 * @returns {Object} Respuesta de error si el token no es válido, o continúa la ejecución
 */
export const verifyToken = (req, res, next) => {
  console.log('Auth Middleware Debug');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  // Estas son las rutas que no necesitan tener auth token para ser usuadas
  const publicRoutes = [
    { path: '/user', method: 'POST' },
    { path: '/login', method: 'POST' },
    // Rutas de restablecimiento de contraseña (no requieren autenticación)
    { path: '/password-reset/request', method: 'POST' },
    { path: '/password-reset/reset', method: 'POST' }
  ];

  // Rutas que usan parámetros dinámicos (también públicas)
  const publicRoutePatterns = [
    { pattern: /^\/password-reset\/validate\/[\w-]+$/, method: 'GET' }
  ];

  // Verificar si el request hace parte de una ruta publica
  const isPublicRoute = publicRoutes.some(route =>
    req.path.endsWith(route.path) && req.method === route.method
  );

  // Verificar si el request hace parte de una ruta pública con parámetros dinámicos
  const matchesPattern = publicRoutePatterns.some(route =>
    route.pattern.test(req.path) && req.method === route.method
  );

  if (isPublicRoute || matchesPattern) {
    console.log('Public route accessed, skipping authentication');
    return next();
  }
  
  // Extraer el token de la cabecera Authorization
  const token = req.header("Authorization");
  
  // Si no existe un token, devuelve un error 401 (No autorizado)
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ 
      error: "Access denied",
      message: "No authentication token provided",
      path: req.path,
      method: req.method
    });
  }

  try {
    // Verificar el token utilizando la clave secreta y elimina el prefijo "Bearer " si existe
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    console.log('Token verified successfully');
    // Almacena la información del usuario decodificada en el objeto de solicitud
    req.user = verified;
    console.log('User data:', verified);
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    // Si el token no es válido o está expirado, devuelve un error 400
    res.status(400).json({ 
      error: "Invalid Token",
      message: err.message
    });
  }
};

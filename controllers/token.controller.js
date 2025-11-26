import jwt from "jsonwebtoken";
import dotenv from "dotenv";

/**
 * Carga las variables de entorno desde el archivo .env
 */
dotenv.config();

/**
 * Controlador para verificar la validez de un token JWT.
 * Recibe un token de la cabecera Authorization y verifica su validez.
 * A diferencia del middleware verifyToken, este controlador devuelve una respuesta
 * indicando si el token es válido o no, en lugar de continuar con la ejecución.
 * 
 * @param {Object} req - Objeto de solicitud HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @returns {Object} Respuesta JSON con estado del token
 */
export const verifyToken = (req, res) => {
  // Extraer el token de la cabecera Authorization
  const token = req.header("Authorization");
  // Si no existe un token, devuelve un error 401 (No autorizado)
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    // Verificar el token utilizando la clave secreta y elimina el prefijo "Bearer " si existe
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    // Si el token es válido, devuelve un status 200 con los datos decodificados
    res.status(200).json({ message: "Verified", valid: true, data: verified });
  } catch (err) {
    // Si el token no es válido o está expirado, devuelve un error 400
    res.status(400).json({ error: "Invalid Token", valid: false });
  }
};
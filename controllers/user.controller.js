import UserModel from '../models/user.model.js';
import ProfileModel from '../models/profile.model.js';
import { encryptPassword, comparePassword } from '../library/appBcrypt.js';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import StatusModel from '../models/status.model.js';
import { connect } from '../config/db/connectMysql.js';

/**
 * Carga las variables de entorno desde el archivo .env
 */
dotenv.config();

/**
 * Controlador para gestionar las operaciones relacionadas con usuarios.
 * Manejar las solicitudes HTTP para el registro, autenticación, actualización
 * y eliminación de usuarios, así como la gestión de permisos.
 */
class UserController {

  /**
   * Registrar un nuevo usuario en el sistema.
   * Crear tanto el registro de usuario como su perfil asociado.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con los datos del usuario a crear
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta con mensaje de éxito o error
   */
  async register(req, res) {
    try {
      const { 
        username,
        password,
        role_id, 
        status_id,
        phone, profile_phone,
        email, profile_email,
        full_name
      } = req.body;
      
      const actualUsername = username;
      const actualPassword = password;
      const actualPhone = phone || profile_phone;
      const actualEmail = email || profile_email;
      
      // Validación básica
      if (!actualUsername || !actualPassword || !role_id || !status_id || !actualPhone || !actualEmail) {
        return res.status(400).json({ error: 'All fields are required, including phone and email.' });
      }

      // Validación adicional
      if (actualPassword.length < 8) {
        return res.status(400).json({
          error: 'The password must be at least 8 characters long.'
        });
      }

      // Validar que el status_id sea válido para usuarios
      const isValidStatus = await StatusModel.validateStatusForEntity(status_id, 'user');
      if (!isValidStatus) {
        return res.status(400).json({
          error: 'El estado proporcionado no es válido para usuarios. Use solo estados de tipo "user".'
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await UserModel.findByName(actualUsername);
      if (existingUser) {
        return res.status(409).json({
          error: 'The username is already in use'
        });
      }
      
      // Verificar si el email ya está en uso (si se proporciona)
      if (actualEmail) {
        const existingEmail = await ProfileModel.findByEmail(actualEmail);
        if (existingEmail) {
          return res.status(409).json({
            error: 'Email already in use'
          });
        }
      }
      
      // Crear el usuario
      const passwordHash = await encryptPassword(actualPassword);
      const userId = await UserModel.create({
        username: actualUsername,
        password: passwordHash,
        role_id,
        status_id
      });

      if (!userId) {
        throw new Error('Failed to create user');
      }

      // Log para depuración
      console.log('User created with ID:', userId);


      try {
        // Crear el perfil SIEMPRE, usando los datos obligatorios
        await ProfileModel.create({
          user_id: userId,
          full_name: full_name || actualUsername,
          phone: actualPhone,
          email: actualEmail,
          profile_photo: null,
          address: null
        });
      } catch (profileError) {
        // Si falla la creación del perfil, eliminar el usuario creado
        await UserModel.delete(userId);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }
      
      res.status(201).json({
        message: 'User created successfully',
        id: userId
      });
    } catch (error) {
      console.error('Registrartion error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Obtener todos los usuarios activos del sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta con la lista de usuarios activos
   */
  async show(req, res) {
    try {
      // El sistema obtiene todos los usuarios sin filtrar por estado
      // Esto permite mostrar usuarios Activos, Inactivos, Pendientes, etc.
      const userModel = await UserModel.show();
      res.status(200).json({
        message: 'Users retrieved successfully',
        data: userModel || []
      });
    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Actualiza la información de un usuario existente.
   * Actualiza tanto los datos básicos del usuario como su perfil asociado.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con los datos a actualizar y el ID en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta con el usuario actualizado o mensaje de error
   */
  async update(req, res) {
    try {
      const { 
        username, 
        password, 
        role_id, 
        status_id,
        phone,
        email,
        full_name
      } = req.body;
      const id = req.params.id;
      
      // Validación básica de campos requeridos
      if (!username || !password || !role_id || !status_id || !id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }

      // Verify if the User exists
      const existingUser = await UserModel.findByIdActive(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Validar que el status_id sea válido para usuarios (si se está cambiando)
      const isValidStatus = await StatusModel.validateStatusForEntity(status_id, 'user');
      if (!isValidStatus) {
        return res.status(400).json({
          error: 'El estado proporcionado no es válido para usuarios. Use solo estados de tipo "user".'
        });
      }

      // Verificar si el email ya está en uso por otro usuario (si se proporciona)
      if (email) {
        const existingEmail = await ProfileModel.findByEmail(email);
        if (existingEmail && existingEmail.user_id != id) {
          return res.status(409).json({
            error: 'Email already in use by another user'
          });
        }
      }

      // Encrypt password before updating
      const encryptedPassword = await encryptPassword(password);
      const updateUserModel = await UserModel.update(id, {
        username,
        password: encryptedPassword,
        role_id,
        status_id
      });
      
      // Actualizar o crear el profile
      const existingProfile = await ProfileModel.findById(id);
      if (existingProfile) {
        // Actualizar profile existente
        await ProfileModel.update(id, {
          full_name: full_name || username,
          phone: phone || existingProfile.phone,
          email: email || existingProfile.email,
          profile_photo: existingProfile.profile_photo,
          address: existingProfile.address
        });
      } else if (phone || email) {
        // Crear nuevo profile
        await ProfileModel.create({
          user_id: id,
          full_name: full_name || username,
          phone: phone || null,
          email: email || null,
          profile_photo: null,
          address: null
        });
      }
      
      res.status(200).json({
        message: 'User updated successfully',
        data: updateUserModel
      });
    } catch (error) {
      console.error('Error in user update:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Elimina un usuario del sistema.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID del usuario a eliminar
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta con mensaje de éxito o error
   */
  async delete(req, res) {
    try {
      const id = req.params.id;
      // Validación básica
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Elimina el usuario
      const deleteUserModel = await UserModel.delete(id);
      res.status(200).json({
        message: 'User deleted successfully',
        data: deleteUserModel
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Buscar un usuario específico por su ID.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID del usuario en los parámetros
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta con los datos del usuario encontrado o mensaje de error
   */
  async findById(req, res) {
    try {
      const id = req.params.id;
      // Validación básica
      if (!id) {
        return res.status(400).json({ error: 'Required fields are missing' });
      }
      // Obtener el usuario por ID
      const existingUserModel = await UserModel.findById(id);
      if (!existingUserModel) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json({
        message: 'User found successfully',
        data: existingUserModel
      });
    } catch (error) {
      console.error('Error finding user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Autentica a un usuario en el sistema.
   * Verificar credenciales, genera un token JWT y devuelve información del usuario y sus permisos.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con las credenciales del usuario
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta con token de acceso e información del usuario o mensaje de error
   */
  async login(req, res) {
    try {
      // Verificar que el body existe
      if (!req.body) {
        return res.status(400).json({ 
          error: 'Request body is missing',
          details: 'Please provide username and password in the request body'
        });
      }

      const { username, password } = req.body;
      // Validación básica
      if (!username || !password) {
        return res.status(400).json({ 
          error: 'Required fields are missing',
          details: 'Both username and password are required'
        });
      }
      // Verificar si el usuario existe
      const existingUser = await UserModel.findByName(username);
      if (!existingUser) {
        return res.status(404).json({ 
          error: 'User not found',
          details: 'No user found with the provided username'
        });
      }
      
      // Validar que el usuario tenga contraseña
      if (!existingUser.password) {
        return res.status(401).json({ 
          error: 'Authentication failed',
          details: 'User account is not properly configured'
        });
      }
      
      const passwordHash = await comparePassword(password, existingUser.password);
      if (!passwordHash) {
        return res.status(401).json({ error: 'Invalid password' });
      }
      
      const updateLogin = await UserModel.updateLogin(existingUser.user_id);
      if (!updateLogin) {
        return res.status(500).json({ error: 'Failed to update login time' });
      }
      
      // Obtener los permisos del usuario
      const userPermissions = await getUserPermissions(existingUser.user_id);
      
      const token = jwt.sign({
        id: existingUser.user_id,
        username: existingUser.username,
        role: existingUser.role_name,
        status: existingUser.status_name
      }, process.env.JWT_SECRET, {
        expiresIn: "1h",
        algorithm: "HS256"
      });
      
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: existingUser.user_id,
          username: existingUser.username,
          role: existingUser.role_name,
          status: existingUser.status_name,
          token: token,
          permissions: userPermissions
        }
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  /**
   * Obtener los permisos asignados a un usuario.
   * 
   * @param {Object} req - Objeto de solicitud HTTP con el ID del usuario en los parámetros o en el token
   * @param {Object} res - Objeto de respuesta HTTP
   * @returns {Object} Respuesta con la lista de permisos del usuario
   */
  async getUserPermissions(req, res) {
    try {
      // Obtener el ID de usuario de los parámetros o del token de autenticación
      const userId = req.params.id || req.user.id;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      // Consultar los permisos del usuario
      const permissions = await getUserPermissions(userId);
      
      res.status(200).json({
        message: 'Permissions retrieved successfully',
        data: permissions
      });
    } catch (error) {
      console.error('Error retrieving user permissions:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

/**
 * Función de utilidad para obtener los permisos de un usuario mediante un procedimiento almacenado.
 * 
 * @param {number} userId - ID del usuario cuyos permisos se desean consultar
 * @returns {Array} Lista de permisos asignados al usuario
 */
async function getUserPermissions(userId) {
  try {
    const [rows] = await connect.query('CALL sp_get_user_permissions(?)', [userId]);
    return rows[0] || []; // Primer conjunto de resultados
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

export default new UserController();
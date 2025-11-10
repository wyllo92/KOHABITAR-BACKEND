import ProfileModel from '../models/profile.model.js';

class ProfileController {

  /**
   * Crear un nuevo perfil
   */
  async register(req, res) {
    try {
      const { user_id, profile_fullName, profile_phone, profile_email, profile_photo, profile_address } = req.body;

      // Validación básica
      if (!user_id || !profile_fullName || !profile_phone || !profile_email) {
        return res.status(400).json({ 
          error: 'Campos requeridos faltantes: user_id, profile_fullName, profile_phone, profile_email' 
        });
      }

      // Verificar si ya existe un perfil para este usuario
      const existingProfile = await ProfileModel.exists(user_id);
      if (existingProfile) {
        return res.status(409).json({ 
          error: 'Ya existe un perfil para este usuario' 
        });
      }

      // Verificar si el email ya está en uso
      const emailAvailable = await ProfileModel.isEmailAvailable(profile_email);
      if (!emailAvailable) {
        return res.status(409).json({ 
          error: 'El email ya está en uso' 
        });
      }

      // Crear el perfil
      const newProfile = await ProfileModel.create({
        user_id,
        profile_fullName,
        profile_phone,
        profile_email,
        profile_photo,
        profile_address
      });

      if (!newProfile) {
        return res.status(500).json({ 
          error: 'Error al crear el perfil' 
        });
      }

      res.status(201).json({
        message: 'Perfil creado exitosamente',
        data: newProfile
      });
    } catch (error) {
      console.error('Error al registrar perfil:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  }

  /**
   * Obtener todos los perfiles activos con paginación
   */
  async show(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;

      const profiles = await ProfileModel.getAll(limit, offset);
      const total = await ProfileModel.count();

      res.status(200).json({
        message: 'Perfiles obtenidos exitosamente',
        data: profiles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error al obtener perfiles:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  }

  /**
   * Actualizar un perfil
   */
  async update(req, res) {
    try {
      const user_id = parseInt(req.params.id);
      // Log incoming body for debugging
      console.log('Profile update request body (type=' + typeof req.body + '):', req.body);
      // Support both JSON requests and multipart/form-data (multer)
      const body = req.body || {};
      const profile_fullName = body.profile_fullName;
      const profile_phone = body.profile_phone;
      const profile_email = body.profile_email;
      const profile_address = body.profile_address;

      // If a file was uploaded via multer, build the accessible path
      let profile_photo = null;
      if (req.file) {
        // req.file.filename is the stored filename (multer diskStorage)
        profile_photo = `/uploads/profiles/${req.file.filename}`;
      } else if (body.profile_photo) {
        // In case frontend sends a URL or base64 in the profile_photo field
        profile_photo = body.profile_photo;
      }

      // Validación básica
      if (!user_id) {
        return res.status(400).json({ 
          error: 'ID de usuario requerido' 
        });
      }

      // Verificar si el perfil existe
      const existingProfile = await ProfileModel.exists(user_id);
      if (!existingProfile) {
        // Si no existe, crear un nuevo perfil con los datos recibidos (comportamiento "upsert")
        console.log(`Perfil para user_id=${user_id} no existe. Creando nuevo perfil...`);

        // Validación mínima para creación desde update
        if (!profile_fullName || !profile_phone || !profile_email) {
          return res.status(400).json({ 
            error: 'Para crear un perfil se requieren: profile_fullName, profile_phone, profile_email' 
          });
        }

        const newProfile = await ProfileModel.create({
          user_id,
          profile_fullName,
          profile_phone,
          profile_email,
          profile_photo,
          profile_address
        });

        if (!newProfile) {
          return res.status(500).json({ error: 'Error al crear el perfil' });
        }

        return res.status(201).json({ message: 'Perfil creado exitosamente', data: newProfile });
      }

      // Si se está actualizando el email, verificar disponibilidad
      if (profile_email) {
        const emailAvailable = await ProfileModel.isEmailAvailable(profile_email, user_id);
        if (!emailAvailable) {
          return res.status(409).json({ 
            error: 'El email ya está en uso por otro usuario' 
          });
        }
      }

      // Actualizar perfil
      const updatedProfile = await ProfileModel.update(user_id, {
        profile_fullName,
        profile_phone,
        profile_email,
        profile_photo,
        profile_address
      });

      if (!updatedProfile) {
        return res.status(500).json({ 
          error: 'Error al actualizar el perfil' 
        });
      }

      res.status(200).json({
        message: 'Perfil actualizado exitosamente',
        data: updatedProfile
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  }

  /**
   * Eliminar un perfil
   */
  async delete(req, res) {
    try {
      const user_id = parseInt(req.params.id);

      // Validación básica
      if (!user_id) {
        return res.status(400).json({ 
          error: 'ID de usuario requerido' 
        });
      }

      // Verificar si el perfil existe
      const existingProfile = await ProfileModel.exists(user_id);
      if (!existingProfile) {
        return res.status(404).json({ 
          error: 'El perfil no existe' 
        });
      }

      // Eliminar perfil
      const deleted = await ProfileModel.delete(user_id);

      if (!deleted) {
        return res.status(500).json({ 
          error: 'Error al eliminar el perfil' 
        });
      }

      res.status(200).json({
        message: 'Perfil eliminado exitosamente',
        data: { user_id }
      });
    } catch (error) {
      console.error('Error al eliminar perfil:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  }

  /**
   * Buscar perfil por ID de usuario
   * Si no existe, intenta obtener datos del usuario y crear un perfil básico
   */
  async findById(req, res) {
    try {
      const user_id = parseInt(req.params.id);

      // Validación básica
      if (!user_id) {
        return res.status(400).json({ 
          error: 'ID de usuario requerido' 
        });
      }

      // Buscar perfil
      let profile = await ProfileModel.getByUserId(user_id);

      // Si no existe el perfil, intentar obtener datos del usuario y crear uno básico
      if (!profile) {
        console.log(`[INFO] Perfil no encontrado para user_id=${user_id}, intentando crear perfil básico...`);
        
        // Obtener datos del usuario usando getFullProfile que hace LEFT JOIN
        const fullProfile = await ProfileModel.getFullProfile(user_id);
        
        if (!fullProfile || !fullProfile.user_id) {
          console.error(`[ERROR] Usuario con ID ${user_id} no encontrado en la base de datos`);
          return res.status(404).json({ 
            error: 'Usuario no encontrado' 
          });
        }

        // Crear un perfil básico con los datos del usuario
        try {
          // Generar un email temporal único usando timestamp para evitar duplicados
          const timestamp = Date.now();
          let tempEmail = `user${fullProfile.user_id}_${timestamp}@temp.kohabitar.local`;
          
          // Verificar que el email no esté en uso (aunque es muy improbable)
          let emailAvailable = await ProfileModel.isEmailAvailable(tempEmail);
          let attempts = 0;
          while (!emailAvailable && attempts < 5) {
            tempEmail = `user${fullProfile.user_id}_${timestamp}_${attempts}@temp.kohabitar.local`;
            emailAvailable = await ProfileModel.isEmailAvailable(tempEmail);
            attempts++;
          }
          
          if (!emailAvailable) {
            throw new Error('No se pudo generar un email temporal único después de varios intentos');
          }
          
          const newProfile = await ProfileModel.create({
            user_id: fullProfile.user_id,
            profile_fullName: fullProfile.user_name || `Usuario ${fullProfile.user_id}`,
            profile_phone: null,
            profile_email: tempEmail, // Email temporal que el usuario deberá actualizar
            profile_photo: null,
            profile_address: null
          });

          if (!newProfile) {
            throw new Error('No se pudo crear el perfil después de la inserción');
          }

          console.log(`[INFO] Perfil básico creado exitosamente para user_id=${user_id}`);
          profile = newProfile;
        } catch (createError) {
          console.error(`[ERROR] Error al crear perfil básico para user_id=${user_id}:`, createError);
          console.error(`[ERROR] Stack trace:`, createError.stack);
          
          // Si falla la creación, retornar un objeto con datos del usuario para que el frontend pueda crear el perfil
          // Esto permite que el usuario pueda completar su perfil manualmente
          return res.status(200).json({
            message: 'Perfil no encontrado, pero usuario existe. Por favor, completa tu información.',
            data: {
              user_id: fullProfile.user_id,
              profile_fullName: fullProfile.user_name || '',
              profile_phone: '',
              profile_email: '',
              profile_photo: null,
              profile_address: null
            },
            needsCreation: true,
            error: createError.message || 'Error al crear perfil automáticamente'
          });
        }
      }

      res.status(200).json({
        message: 'Perfil encontrado exitosamente',
        data: profile
      });
    } catch (error) {
      console.error('Error al buscar perfil:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  }

  /**
   * Obtener perfil completo (con datos de usuario, rol y status)
   */
  async getFullProfile(req, res) {
    try {
      const user_id = parseInt(req.params.id);

      // Validación básica
      if (!user_id) {
        return res.status(400).json({ 
          error: 'ID de usuario requerido' 
        });
      }

      // Buscar perfil completo
      const profile = await ProfileModel.getFullProfile(user_id);

      if (!profile) {
        return res.status(404).json({ 
          error: 'Perfil no encontrado' 
        });
      }

      res.status(200).json({
        message: 'Perfil completo obtenido exitosamente',
        data: profile
      });
    } catch (error) {
      console.error('Error al obtener perfil completo:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  }

  /**
   * Buscar perfil por email
   */
  async findByEmail(req, res) {
    try {
      const { email } = req.params;

      // Validación básica
      if (!email) {
        return res.status(400).json({ 
          error: 'Email requerido' 
        });
      }

      // Buscar perfil
      const profile = await ProfileModel.getByEmail(email);

      if (!profile) {
        return res.status(404).json({ 
          error: 'Perfil no encontrado' 
        });
      }

      res.status(200).json({
        message: 'Perfil encontrado exitosamente',
        data: profile
      });
    } catch (error) {
      console.error('Error al buscar perfil por email:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  }

  /**
   * Buscar perfiles por término de búsqueda (nombre o email)
   */
  async search(req, res) {
    try {
      const { term } = req.query;
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const offset = (page - 1) * limit;

      // Validación básica
      if (!term) {
        return res.status(400).json({ 
          error: 'Término de búsqueda requerido' 
        });
      }

      // Buscar perfiles
      const profiles = await ProfileModel.search(term, limit, offset);

      res.status(200).json({
        message: 'Búsqueda completada exitosamente',
        data: profiles,
        pagination: {
          page,
          limit,
          results: profiles.length
        }
      });
    } catch (error) {
      console.error('Error al buscar perfiles:', error);
      res.status(500).json({ 
        error: error.message || 'Error interno del servidor' 
      });
    }
  }
}

export default new ProfileController();
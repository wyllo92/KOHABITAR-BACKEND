import { connect } from '../config/db/connectMysql.js';

class ProfileModel {
  /**
   * Obtener perfil por user_id
   */
  static async getByUserId(userId) {
    try {
      const [rows] = await connect.query(
        `SELECT 
          user_id,
          profile_fullName,
          profile_phone,
          profile_email,
          profile_photo,
          profile_address,
          created_at,
          updated_at
        FROM profile 
        WHERE user_id = ?`,
        [userId]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener perfil: ${error.message}`);
    }
  }

  /**
   * Obtener perfil completo con datos de usuario
   */
  static async getFullProfile(userId) {
    try {
      const [rows] = await connect.query(
        `SELECT 
          u.user_id,
          u.user_name,
          r.role_name,
          r.role_id,
          p.profile_fullName,
          p.profile_phone,
          p.profile_email,
          p.profile_photo,
          p.profile_address,
          s.status_name,
          s.status_id,
          u.last_login,
          p.created_at,
          p.updated_at
        FROM user u
        LEFT JOIN profile p ON p.user_id = u.user_id
        LEFT JOIN role r ON u.role_id = r.role_id
        LEFT JOIN status s ON u.status_id = s.status_id
        WHERE u.user_id = ?`,
        [userId]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener perfil completo: ${error.message}`);
    }
  }

  /**
   * Buscar perfil por email
   */
  static async getByEmail(email) {
    try {
      const [rows] = await connect.query(
        `SELECT 
          user_id,
          profile_fullName,
          profile_phone,
          profile_email,
          profile_photo,
          profile_address,
          created_at,
          updated_at
        FROM profile 
        WHERE profile_email = ?`,
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error al buscar perfil por email: ${error.message}`);
    }
  }

  /**
   * Crear un nuevo perfil
   */
  static async create(profileData) {
    const { 
      user_id, 
      profile_fullName, 
      profile_phone, 
      profile_email, 
      profile_photo = null, 
      profile_address = null 
    } = profileData;

    try {
      const [result] = await connect.query(
        `INSERT INTO profile 
          (user_id, profile_fullName, profile_phone, profile_email, profile_photo, profile_address) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, profile_fullName, profile_phone, profile_email, profile_photo, profile_address]
      );
      
      return await this.getByUserId(user_id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('El email ya está registrado');
      }
      throw new Error(`Error al crear perfil: ${error.message}`);
    }
  }

  /**
   * Actualizar perfil
   */
  static async update(userId, profileData) {
    const { 
      profile_fullName, 
      profile_phone, 
      profile_email, 
      profile_photo, 
      profile_address 
    } = profileData;

    // Construir query dinámicamente solo con campos proporcionados
    const fields = [];
    const values = [];

    if (profile_fullName !== undefined) {
      fields.push('profile_fullName = ?');
      values.push(profile_fullName);
    }
    if (profile_phone !== undefined) {
      fields.push('profile_phone = ?');
      values.push(profile_phone);
    }
    if (profile_email !== undefined) {
      fields.push('profile_email = ?');
      values.push(profile_email);
    }
    if (profile_photo !== undefined) {
      fields.push('profile_photo = ?');
      values.push(profile_photo);
    }
    if (profile_address !== undefined) {
      fields.push('profile_address = ?');
      values.push(profile_address);
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(userId);

    try {
      const [result] = await connect.query(
        `UPDATE profile 
        SET ${fields.join(', ')} 
        WHERE user_id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        throw new Error('Perfil no encontrado');
      }

      return await this.getByUserId(userId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('El email ya está registrado');
      }
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }
  }

  /**
   * Eliminar perfil (se eliminará automáticamente por CASCADE al eliminar usuario)
   */
  static async delete(userId) {
    try {
      const [result] = await connect.query(
        'DELETE FROM profile WHERE user_id = ?',
        [userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error al eliminar perfil: ${error.message}`);
    }
  }

  /**
   * Buscar perfiles por nombre o email (con paginación)
   */
  static async search(searchTerm, limit = 10, offset = 0) {
    try {
      const [rows] = await connect.query(
        `SELECT 
          p.user_id,
          p.profile_fullName,
          p.profile_email,
          p.profile_phone,
          p.profile_photo,
          r.role_name,
          s.status_name
        FROM profile p
        INNER JOIN user u ON p.user_id = u.user_id
        INNER JOIN role r ON u.role_id = r.role_id
        INNER JOIN status s ON u.status_id = s.status_id
        WHERE (p.profile_fullName LIKE ? OR p.profile_email LIKE ?)
          AND u.status_id = 1
        LIMIT ? OFFSET ?`,
        [`%${searchTerm}%`, `%${searchTerm}%`, limit, offset]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al buscar perfiles: ${error.message}`);
    }
  }

  /**
   * Obtener todos los perfiles con paginación
   */
  static async getAll(limit = 10, offset = 0) {
    try {
      const [rows] = await connect.query(
        `SELECT 
          p.user_id,
          p.profile_fullName,
          p.profile_email,
          p.profile_phone,
          p.profile_photo,
          p.profile_address,
          r.role_name,
          s.status_name,
          p.created_at,
          p.updated_at
        FROM profile p
        INNER JOIN user u ON p.user_id = u.user_id
        INNER JOIN role r ON u.role_id = r.role_id
        INNER JOIN status s ON u.status_id = s.status_id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener perfiles: ${error.message}`);
    }
  }

  /**
   * Contar total de perfiles
   */
  static async count() {
    try {
      const [rows] = await connect.query(
        'SELECT COUNT(*) as total FROM profile'
      );
      return rows[0].total;
    } catch (error) {
      throw new Error(`Error al contar perfiles: ${error.message}`);
    }
  }

  /**
   * Verificar si existe un perfil
   */
  static async exists(userId) {
    try {
      const [rows] = await connect.query(
        'SELECT 1 FROM profile WHERE user_id = ? LIMIT 1',
        [userId]
      );
      return rows.length > 0;
    } catch (error) {
      throw new Error(`Error al verificar perfil: ${error.message}`);
    }
  }

  /**
   * Verificar si un email está disponible
   */
  static async isEmailAvailable(email, excludeUserId = null) {
    try {
      let query = 'SELECT 1 FROM profile WHERE profile_email = ?';
      const params = [email];

      if (excludeUserId) {
        query += ' AND user_id != ?';
        params.push(excludeUserId);
      }

      const [rows] = await connect.query(query, params);
      return rows.length === 0;
    } catch (error) {
      throw new Error(`Error al verificar email: ${error.message}`);
    }
  }
}

export default ProfileModel;
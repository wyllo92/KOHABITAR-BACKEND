import { connect } from '../config/db/connectMysql.js';

class StatusModel {

  // Crear un nuevo estado
  static async create({ status_name, status_description, status_entity, status_is_active }) {
    try {
      let sqlQuery = `
        INSERT INTO status 
        (status_name, status_description, status_entity, status_is_active, status_created_at) 
        VALUES (?, ?, ?, ?, NOW());
      `;
      const [result] = await connect.query(sqlQuery, [
        status_name, 
        status_description, 
        status_entity, 
        status_is_active
      ]);
      return result.insertId;
    } catch (error) {
      console.error("Error en create:", error);
      return null;
    }
  }

  // Listar todos los estados
  static async show() {
    try {
      let sqlQuery = "SELECT * FROM status ORDER BY status_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error("Error en show:", error);
      return [];
    }
  }

  // Actualizar un estado
  static async update(id, { status_name, status_description, status_entity, status_is_active }) {
    try {
      let sqlQuery = `
        UPDATE status 
        SET status_name = ?, status_description = ?, status_entity = ?, status_is_active = ? 
        WHERE status_id = ?;
      `;
      const [result] = await connect.query(sqlQuery, [
        status_name, 
        status_description, 
        status_entity, 
        status_is_active, 
        id
      ]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error("Error en update:", error);
      return null;
    }
  }

  // Eliminar un estado
  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM status WHERE status_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error en delete:", error);
      return false;
    }
  }

  // Buscar un estado por ID
  static async findById(id) {
    try {
      let sqlQuery = 'SELECT * FROM status WHERE status_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error("Error en findById:", error);
      return null;
    }
  }

  // Mostrar todos los activos
  static async showActive() {
    try {
      let sqlQuery = "SELECT * FROM status WHERE status_is_active = 1 ORDER BY status_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error("Error en showActive:", error);
      return [];
    }
  }

  // Buscar un estado activo por ID
  static async findByIdActive(id) {
    try {
      let sqlQuery = 'SELECT * FROM status WHERE status_id = ? AND status_is_active = 1';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error("Error en findByIdActive:", error);
      return null;
    }
  }

  // Buscar un estado por nombre
  static async findByName(status_name) {
    try {
      let sqlQuery = 'SELECT * FROM status WHERE status_name = ?';
      const [result] = await connect.query(sqlQuery, [status_name]);
      return result[0];
    } catch (error) {
      console.error("Error en findByName:", error);
      return null;
    }
  }

  // 🔹 Buscar estados por entidad (ej: "usuarios", "productos", "pedidos")
  static async findByEntity(status_entity, onlyActive = true) {
    try {
      let sqlQuery = `
        SELECT status_id, status_name, status_description 
        FROM status 
        WHERE status_entity = ? ${onlyActive ? 'AND status_is_active = 1' : ''} 
        ORDER BY status_id
      `;
      const [result] = await connect.query(sqlQuery, [status_entity]);
      return result;
    } catch (error) {
      console.error("Error en findByEntity:", error);
      return [];
    }
  }
}

export default StatusModel;

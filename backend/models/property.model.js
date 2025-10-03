import { connect } from '../config/db/connectMysql.js';

class PropertyModel {

  static async create({ property_name, property_description, property_type, property_createAt, property_updateAt, status_id }) {
    try {
      let sqlQuery = `INSERT INTO property 
        (property_name, property_description, property_type, property_createAt, property_updateAt, status_id) 
        VALUES (?, ?, ?, ?, ?, ?)`;
      const [result] = await connect.query(sqlQuery, [
        property_name, 
        property_description, 
        property_type, 
        property_createAt, 
        property_updateAt,
        status_id
      ]);
      return result.insertId;
    } catch (error) {
      console.error("Error in create:", error);
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT p.property_id, p.property_name, p.property_description, p.property_type, 
               p.property_createAt, p.property_updateAt,
               s.status_id, s.status_name
        FROM property p
        LEFT JOIN status s ON p.status_id = s.status_id
        ORDER BY p.property_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error("Error in show:", error);
      return [];
    }
  }

  static async update(id, { property_name, property_description, property_type, property_updateAt, status_id }) {
    try {
      let sqlQuery = `
        UPDATE property 
        SET property_name = ?, property_description = ?, property_type = ?, 
            property_updateAt = ?, status_id = ?
        WHERE property_id = ?`;
      const [result] = await connect.query(sqlQuery, [
        property_name, 
        property_description, 
        property_type, 
        property_updateAt, 
        status_id, 
        id
      ]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error("Error in update:", error);
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM property WHERE property_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error in delete:", error);
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT p.property_id, p.property_name, p.property_description, p.property_type, 
               p.property_createAt, p.property_updateAt,
               s.status_id, s.status_name
        FROM property p
        LEFT JOIN status s ON p.status_id = s.status_id
        WHERE p.property_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error("Error in findById:", error);
      return null;
    }
  }

  static async findByName(property_name) {
    try {
      let sqlQuery = `
        SELECT p.*, s.status_name 
        FROM property p
        LEFT JOIN status s ON p.status_id = s.status_id
        WHERE p.property_name = ?`;
      const [result] = await connect.query(sqlQuery, [property_name]);
      return result[0];
    } catch (error) {
      console.error("Error in findByName:", error);
      return null;
    }
  }

  static async findByType(property_type) {
    try {
      let sqlQuery = `
        SELECT p.*, s.status_name 
        FROM property p
        LEFT JOIN status s ON p.status_id = s.status_id
        WHERE p.property_type = ?`;
      const [result] = await connect.query(sqlQuery, [property_type]);
      return result;
    } catch (error) {
      console.error("Error in findByType:", error);
      return [];
    }
  }

  static async showActive() {
    try {
      let sqlQuery = `
        SELECT p.property_id, p.property_name, p.property_description, p.property_type, 
               p.property_createAt, p.property_updateAt,
               s.status_id, s.status_name
        FROM property p
        LEFT JOIN status s ON p.status_id = s.status_id
        WHERE s.status_name = 'Activo' OR s.status_id = 1
        ORDER BY p.property_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error("Error in showActive:", error);
      return [];
    }
  }

  static async findByIdActive(id) {
    try {
      let sqlQuery = `
        SELECT p.property_id, p.property_name, p.property_description, p.property_type, 
               p.property_createAt, p.property_updateAt,
               s.status_id, s.status_name
        FROM property p
        LEFT JOIN status s ON p.status_id = s.status_id
        WHERE p.property_id = ? AND (s.status_name = 'Activo' OR s.status_id = 1)
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      console.error("Error in findByIdActive:", error);
      return null;
    }
  }
}

export default PropertyModel;

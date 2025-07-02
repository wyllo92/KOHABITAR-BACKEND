import { connect } from '../config/db/connectMysql.js';

class PropertyModel {
  
  static async create({ property_name, property_description, property_type, property_createAt, property_updateAt }) {
     try {
      let sqlQuery = "INSERT INTO property (property_name, property_description, property_type, property_createAt, property_updateAt) VALUES (?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery,[property_name, property_description, property_type, property_createAt, property_updateAt]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM property ORDER BY property_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { property_name, property_description, property_type, property_updateAt }) {
    try {
      let sqlQuery = "UPDATE property SET property_name = ?, property_description = ?, property_type = ?, property_updateAt = ? WHERE property_id = ?;";
      const [result] = await connect.query(sqlQuery, [property_name, property_description, property_type, property_updateAt, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM property WHERE property_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT * FROM property WHERE property_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByName(property_name) {
    try {
      let sqlQuery = 'SELECT * FROM property WHERE property_name = ?';
      const [result] = await connect.query(sqlQuery, [property_name]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByType(property_type) {
    try {
      let sqlQuery = 'SELECT * FROM property WHERE property_type = ?';
      const [result] = await connect.query(sqlQuery, [property_type]);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default PropertyModel; 
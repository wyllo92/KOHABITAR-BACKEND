import { connect } from '../config/db/connectMysql.js';

class AmenityModel {

  static async create({ name, capacity, description, time_unit, total, status_id, tariff_id, property_id, amenity_type_id, created_at, updated_at }) {
    try {
      let sqlQuery = "INSERT INTO amenity (name, capacity, description, time_unit, total, status_id, tariff_id, property_id, amenity_type_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [name, capacity, description, time_unit, total, status_id, tariff_id, property_id, amenity_type_id, created_at, updated_at]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT a.*, at.Amenity_Type_name, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM amenity a LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id LEFT JOIN property p ON a.property_id = p.property_id LEFT JOIN status s ON a.status_id = s.status_id LEFT JOIN tariff t ON a.tariff_id = t.tariff_id ORDER BY a.amenity_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async showActive() {
    try {
      let sqlQuery = "SELECT a.*, at.Amenity_Type_name, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM amenity a LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id LEFT JOIN property p ON a.property_id = p.property_id LEFT JOIN status s ON a.status_id = s.status_id LEFT JOIN tariff t ON a.tariff_id = t.tariff_id WHERE a.status_id = 1 ORDER BY a.amenity_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { name, capacity, description, time_unit, total, status_id, tariff_id, property_id, amenity_type_id, updated_at }) {
    try {
      let sqlQuery = "UPDATE amenity SET name = ?, capacity = ?, description = ?, time_unit = ?, total = ?, status_id = ?, tariff_id = ?, property_id = ?, amenity_type_id = ?, updated_at = ? WHERE amenity_id = ?;";
      const [result] = await connect.query(sqlQuery, [name, capacity, description, time_unit, total, status_id, tariff_id, property_id, amenity_type_id, updated_at, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM amenity WHERE amenity_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT a.*, at.Amenity_Type_name, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM amenity a LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id LEFT JOIN property p ON a.property_id = p.property_id LEFT JOIN status s ON a.status_id = s.status_id LEFT JOIN tariff t ON a.tariff_id = t.tariff_id WHERE a.amenity_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByIdActive(id) {
    try {
      let sqlQuery = 'SELECT a.*, at.Amenity_Type_name, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM amenity a LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id LEFT JOIN property p ON a.property_id = p.property_id LEFT JOIN status s ON a.status_id = s.status_id LEFT JOIN tariff t ON a.tariff_id = t.tariff_id WHERE a.amenity_id = ? AND a.status_id = 1';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByName(name) {
    try {
      let sqlQuery = 'SELECT a.*, at.Amenity_Type_name, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM amenity a LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id LEFT JOIN property p ON a.property_id = p.property_id LEFT JOIN status s ON a.status_id = s.status_id LEFT JOIN tariff t ON a.tariff_id = t.tariff_id WHERE a.name = ?';
      const [result] = await connect.query(sqlQuery, [name]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByPropertyId(property_id) {
    try {
      let sqlQuery = 'SELECT a.*, at.Amenity_Type_name, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM amenity a LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id LEFT JOIN property p ON a.property_id = p.property_id LEFT JOIN status s ON a.status_id = s.status_id LEFT JOIN tariff t ON a.tariff_id = t.tariff_id WHERE a.property_id = ?';
      const [result] = await connect.query(sqlQuery, [property_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByType(amenity_type_id) {
    try {
      let sqlQuery = 'SELECT a.*, at.Amenity_Type_name, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM amenity a LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id LEFT JOIN property p ON a.property_id = p.property_id LEFT JOIN status s ON a.status_id = s.status_id LEFT JOIN tariff t ON a.tariff_id = t.tariff_id WHERE a.amenity_type_id = ?';
      const [result] = await connect.query(sqlQuery, [amenity_type_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findActive() {
    try {
      let sqlQuery = 'SELECT a.*, at.Amenity_Type_name, p.property_name, s.status_name, t.type as tariff_type, t.amount as tariff_amount FROM amenity a LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id LEFT JOIN property p ON a.property_id = p.property_id LEFT JOIN status s ON a.status_id = s.status_id LEFT JOIN tariff t ON a.tariff_id = t.tariff_id WHERE a.status_id = 1';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default AmenityModel;
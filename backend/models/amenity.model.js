import { connect } from '../config/db/connectMysql.js';

class AmenityModel {

  static async create({ name, capacity, description, status_id, amenity_type_id }) {
    try {
      const sqlQuery = `INSERT INTO amenity (name, capacity, description, status_id, amenity_type_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, CURDATE(), CURDATE());`;
      const [result] = await connect.query(sqlQuery, [name, capacity, description, status_id, amenity_type_id]);
      return result.insertId;
    } catch (error) {
      console.error('Error in AmenityModel.create:', error);
      throw error;
    }
  }

  static async show() {
    try {
      const sqlQuery = `
        SELECT
          a.*,
          at.amenity_type_name AS amenity_type_name,
          s.status_name AS status_name
        FROM amenity a
        LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id
        LEFT JOIN status s ON a.status_id = s.status_id
        ORDER BY a.amenity_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error in AmenityModel.show:', error);
      return [];
    }
  }

  static async showActive() {
    try {
      const sqlQuery = `
        SELECT
          a.*,
          at.amenity_type_name AS amenity_type_name,
          s.status_name AS status_name
        FROM amenity a
        LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id
        LEFT JOIN status s ON a.status_id = s.status_id
        WHERE a.status_id = 1
        ORDER BY a.amenity_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error in AmenityModel.showActive:', error);
      return [];
    }
  }

  static async update(id, { name, capacity, description, status_id, amenity_type_id }) {
    try {
      const sqlQuery = `UPDATE amenity SET name = ?, capacity = ?, description = ?, status_id = ?, amenity_type_id = ?, updated_at = CURDATE() WHERE amenity_id = ?;`;
      const [result] = await connect.query(sqlQuery, [name, capacity, description, status_id, amenity_type_id, id]);
      if (result.affectedRows > 0) {
        return await this.findById(id);
      }
      return null;
    } catch (error) {
      console.error('Error in AmenityModel.update:', error);
      return null;
    }
  }

  static async delete(id) {
    try {
      const sqlQuery = `DELETE FROM amenity WHERE amenity_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error in AmenityModel.delete:', error);
      return false;
    }
  }

  static async findById(id) {
    try {
      const sqlQuery = `
        SELECT
          a.*,
          at.amenity_type_name AS amenity_type_name,
          s.status_name AS status_name
        FROM amenity a
        LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id
        LEFT JOIN status s ON a.status_id = s.status_id
        WHERE a.amenity_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      console.error('Error in AmenityModel.findById:', error);
      return null;
    }
  }

  static async findByIdActive(id) {
    try {
      const sqlQuery = `
        SELECT
          a.*,
          at.amenity_type_name AS amenity_type_name,
          s.status_name AS status_name
        FROM amenity a
        LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id
        LEFT JOIN status s ON a.status_id = s.status_id
        WHERE a.amenity_id = ? AND a.status_id = 1
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      console.error('Error in AmenityModel.findByIdActive:', error);
      return null;
    }
  }

  static async findByName(name) {
    try {
      const sqlQuery = `
        SELECT
          a.*,
          at.amenity_type_name AS amenity_type_name,
          s.status_name AS status_name
        FROM amenity a
        LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id
        LEFT JOIN status s ON a.status_id = s.status_id
        WHERE a.name = ?
      `;
      const [result] = await connect.query(sqlQuery, [name]);
      return result[0] || null;
    } catch (error) {
      console.error('Error in AmenityModel.findByName:', error);
      return null;
    }
  }

  static async findByType(amenity_type_id) {
    try {
      const sqlQuery = `
        SELECT
          a.*,
          at.amenity_type_name AS amenity_type_name,
          s.status_name AS status_name
        FROM amenity a
        LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id
        LEFT JOIN status s ON a.status_id = s.status_id
        WHERE a.amenity_type_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [amenity_type_id]);
      return result;
    } catch (error) {
      console.error('Error in AmenityModel.findByType:', error);
      return [];
    }
  }

  static async findActive() {
    try {
      const sqlQuery = `
        SELECT
          a.*,
          at.amenity_type_name AS amenity_type_name,
          s.status_name AS status_name
        FROM amenity a
        LEFT JOIN amenity_type at ON a.amenity_type_id = at.Amenity_Type_id
        LEFT JOIN status s ON a.status_id = s.status_id
        WHERE a.status_id = 1
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error in AmenityModel.findActive:', error);
      return [];
    }
  }
}

export default AmenityModel;
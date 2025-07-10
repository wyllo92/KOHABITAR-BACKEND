import { connect } from '../config/db/connectMysql.js';

class PropertyModel {

  static async create({ property_name, property_description, property_type, property_createAt, property_updateAt, status_id }) {
    try {
      let sqlQuery = "INSERT INTO property (property_name, property_description, property_type, property_createAt, property_updateAt, status_id) VALUES (?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [property_name, property_description, property_type, property_createAt, property_updateAt, status_id]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT p.*, s.status_name
        FROM property p
        LEFT JOIN status s ON p.status_id = s.status_id
        ORDER BY p.property_id
      `;
      const [result] = await connect.query(sqlQuery);
      console.log('PROPIEDADES ENCONTRADAS:', result); // <-- Log de depuración
      return result;
    } catch (error) {
      console.error('ERROR EN PROPERTY SHOW:', error); // <-- Log de error
      return [];
    }
  }

  static async update(id, { property_name, property_description, property_type, property_updateAt, status_id }) {
    try {
      let sqlQuery = "UPDATE property SET property_name = ?, property_description = ?, property_type = ?, property_updateAt = ?, status_id = ? WHERE property_id = ?;";
      const [result] = await connect.query(sqlQuery, [property_name, property_description, property_type, property_updateAt, status_id, id]);
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

  static async getResidents(propertyId) {
    try {
      let sqlQuery = 'CALL sp_get_property_residents(?)';
      const [result] = await connect.query(sqlQuery, [propertyId]);
      return result[0];
    } catch (error) {
      return [];
    }
  }

  static async getWithParkingZones() {
    try {
      let sqlQuery = `SELECT p.*, 
                             COUNT(pz.parkingZone_id) as parking_zones_count,
                             GROUP_CONCAT(DISTINCT CONCAT(pz.type, ':', pz.capacity) SEPARATOR ', ') as parking_info
                      FROM property p
                      LEFT JOIN parkingzone pz ON p.property_id = pz.property_id AND pz.status_id = 1
                      GROUP BY p.property_id
                      ORDER BY p.property_name`;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async getStatistics() {
    try {
      let sqlQuery = `SELECT 
                        COUNT(*) as total_properties,
                        COUNT(CASE WHEN property_type = 'Casa' THEN 1 END) as apartments,
                        COUNT(CASE WHEN property_type = 'Casa' THEN 1 END) as houses,
                        (SELECT COUNT(DISTINCT user_id) FROM user_property WHERE status_id = 1) as total_residents
                      FROM property`;
      const [result] = await connect.query(sqlQuery);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async showActive() {
    try {
      // Since property doesn't have status_id, we'll just return all properties
      let sqlQuery = "SELECT * FROM property ORDER BY property_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByIdActive(id) {
    try {
      // Since property doesn't have status_id, this is the same as findById
      let sqlQuery = 'SELECT * FROM property WHERE property_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async getPropertyStatusIds() {
    try {
      let sqlQuery = "SELECT status_id, status_name FROM status WHERE status_entity = 'Propiedad' OR status_entity = 'Propiedades'";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default PropertyModel;
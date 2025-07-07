import { connect } from '../config/db/connectMysql.js';

class AmenityTypeModel {
  static async findAll() {
    try {
      const sqlQuery = 'SELECT * FROM amenity_type';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findActive() {
    try {
      const sqlQuery = 'SELECT * FROM amenity_type WHERE Amenity_Type_is_active = 1';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default AmenityTypeModel; 
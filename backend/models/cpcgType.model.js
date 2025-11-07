import { connect } from '../config/db/connectMysql.js';

class CpcgTypeModel {
  static async findAllActive() {
    const [rows] = await connect.query(
      'SELECT CPCG_type_id, CPCG_type_name FROM cpcg_type WHERE CPCG_type_is_active = 1 ORDER BY CPCG_type_name'
    );
    return rows;
  }
}

export default CpcgTypeModel;

import { connect } from '../config/db/connectMysql.js';

class ModuleModel {

  static async create({ module_route, module_description, is_active }) {
    const [result] = await connect.query(
      'INSERT INTO module (module_route, module_description, is_active) VALUES (?, ?, ?)',
      [module_route, module_description, is_active]
    );
    return result.insertId;
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM `module` ORDER BY `module_id`";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [0];
    }
  }

  static async update(module_id, { module_route, module_description, is_active }) {
    const [result] = await connect.query(
      'UPDATE module SET module_route = ?, module_description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE module_id = ?',
      [module_route, module_description, is_active, module_id]
    );
    return result.affectedRows > 0 ? this.findById(module_id) : null;
  }

  static async delete(module_id) {
    const [result] = await connect.query(
      'DELETE FROM module WHERE module_id=?',
      [module_id]
    );
    return result.affectedRows > 0 ? this.findById(module_id) : null;
  }

  static async findById(module_id) {
    try {
      let sqlQuery = "SELECT * FROM `module` WHERE module_id = ? ORDER BY `module_id`";
      const [result] = await connect.query(sqlQuery, module_id);
      return result;
    } catch (error) {
      return [0];
    }
  }

  static async findModulesByUserRole(idUser, idRole) {
    try {
      let sqlQuery = "CALL sp_module_role_user(?,?); ";
      const [result] = await connect.query(sqlQuery, [idUser, idRole]);
      return result;
    } catch (error) {
      return [0];
    }
  }

}
export default ModuleModel;
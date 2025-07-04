import { connect } from '../config/db/connectMysql.js';

class ReportModel {

  static async create({ User_id, Report_title, Report_description, report_type_id, Status_id, Report_file_url, Report_created_at }) {
    try {
      let sqlQuery = "INSERT INTO report (User_id, Report_title, Report_description, report_type_id, Status_id, Report_file_url, Report_created_at) VALUES (?, ?, ?, ?, ?, ?, ?);";
      const [result] = await connect.query(sqlQuery, [User_id, Report_title, Report_description, report_type_id, Status_id, Report_file_url, Report_created_at]);
      return result.insertId;
    } catch (error) {
      return null;
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT r.*, u.user_name, p.profile_fullName, rt.report_type_name, s.status_name FROM report r LEFT JOIN user u ON r.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN report_type rt ON r.report_type_id = rt.report_type_id LEFT JOIN status s ON r.Status_id = s.status_id ORDER BY r.Report_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async update(id, { User_id, Report_title, Report_description, report_type_id, Status_id, Report_file_url }) {
    try {
      let sqlQuery = "UPDATE report SET User_id = ?, Report_title = ?, Report_description = ?, report_type_id = ?, Status_id = ?, Report_file_url = ? WHERE Report_id = ?;";
      const [result] = await connect.query(sqlQuery, [User_id, Report_title, Report_description, report_type_id, Status_id, Report_file_url, id]);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      return null;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM report WHERE Report_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = 'SELECT r.*, u.user_name, p.profile_fullName, rt.report_type_name, s.status_name FROM report r LEFT JOIN user u ON r.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN report_type rt ON r.report_type_id = rt.report_type_id LEFT JOIN status s ON r.Status_id = s.status_id WHERE r.Report_id = ?';
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return null;
    }
  }

  static async findByUserId(User_id) {
    try {
      let sqlQuery = 'SELECT r.*, u.user_name, p.profile_fullName, rt.report_type_name, s.status_name FROM report r LEFT JOIN user u ON r.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN report_type rt ON r.report_type_id = rt.report_type_id LEFT JOIN status s ON r.Status_id = s.status_id WHERE r.User_id = ?';
      const [result] = await connect.query(sqlQuery, [User_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByType(report_type_id) {
    try {
      let sqlQuery = 'SELECT r.*, u.user_name, p.profile_fullName, rt.report_type_name, s.status_name FROM report r LEFT JOIN user u ON r.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN report_type rt ON r.report_type_id = rt.report_type_id LEFT JOIN status s ON r.Status_id = s.status_id WHERE r.report_type_id = ?';
      const [result] = await connect.query(sqlQuery, [report_type_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByStatus(Status_id) {
    try {
      let sqlQuery = 'SELECT r.*, u.user_name, p.profile_fullName, rt.report_type_name, s.status_name FROM report r LEFT JOIN user u ON r.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN report_type rt ON r.report_type_id = rt.report_type_id LEFT JOIN status s ON r.Status_id = s.status_id WHERE r.Status_id = ?';
      const [result] = await connect.query(sqlQuery, [Status_id]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByDateRange(start_date, end_date) {
    try {
      let sqlQuery = 'SELECT r.*, u.user_name, p.profile_fullName, rt.report_type_name, s.status_name FROM report r LEFT JOIN user u ON r.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN report_type rt ON r.report_type_id = rt.report_type_id LEFT JOIN status s ON r.Status_id = s.status_id WHERE r.Report_created_at BETWEEN ? AND ?';
      const [result] = await connect.query(sqlQuery, [start_date, end_date]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findByTitle(Report_title) {
    try {
      let sqlQuery = 'SELECT r.*, u.user_name, p.profile_fullName, rt.report_type_name, s.status_name FROM report r LEFT JOIN user u ON r.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN report_type rt ON r.report_type_id = rt.report_type_id LEFT JOIN status s ON r.Status_id = s.status_id WHERE r.Report_title LIKE ?';
      const [result] = await connect.query(sqlQuery, [`%${Report_title}%`]);
      return result;
    } catch (error) {
      return [];
    }
  }

  static async findPending() {
    try {
      let sqlQuery = 'SELECT r.*, u.user_name, p.profile_fullName, rt.report_type_name, s.status_name FROM report r LEFT JOIN user u ON r.User_id = u.user_id LEFT JOIN profile p ON u.user_id = p.user_id LEFT JOIN report_type rt ON r.report_type_id = rt.report_type_id LEFT JOIN status s ON r.Status_id = s.status_id WHERE r.Status_id = 3';
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return [];
    }
  }
}

export default ReportModel; 
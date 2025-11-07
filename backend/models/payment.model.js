import { connect } from '../config/db/connectMysql.js';

class PaymentModel {

  // === CREAR PAGO ===
  static async create({ user_id, amount_paid, payment_date, method, reference }) {
    try {
      console.log('PaymentModel.create: Creating payment...');

      const [result] = await connect.query(
        `INSERT INTO payment (user_id, amount_paid, payment_date, method, reference)
         VALUES (?, ?, ?, ?, ?)`,
        [user_id, amount_paid, payment_date, method, reference]
      );

      console.log('✅ Payment created with ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('❌ PaymentModel.create error:', error);
      throw error;
    }
  }

  // === OBTENER TODOS LOS PAGOS ===
  static async show() {
    try {
      console.log('PaymentModel.show: Fetching all payments...');

      const query = `
        SELECT 
          payment_id,
          user_id,
          amount_paid,
          payment_date,
          method,
          reference,
          created_at
        FROM payment
        ORDER BY payment_date DESC
      `;

      const [rows] = await connect.query(query);
      console.log(`✅ Found ${rows.length} payments`);
      return rows;
    } catch (error) {
      console.error('❌ PaymentModel.show error:', error);
      throw error;
    }
  }

  // === BUSCAR PAGO POR ID ===
  static async findById(id) {
    try {
      console.log('PaymentModel.findById: Finding payment ID:', id);
      const [rows] = await connect.query(
        `SELECT * FROM payment WHERE payment_id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('❌ PaymentModel.findById error:', error);
      throw error;
    }
  }

  // === BUSCAR PAGOS POR USUARIO ===
  static async findByUserId(user_id) {
    try {
      console.log('PaymentModel.findByUserId: Finding payments for user:', user_id);
      const [rows] = await connect.query(
        `SELECT * FROM payment WHERE user_id = ? ORDER BY payment_date DESC`,
        [user_id]
      );
      console.log(`✅ Found ${rows.length} payments for user ${user_id}`);
      return rows;
    } catch (error) {
      console.error('❌ PaymentModel.findByUserId error:', error);
      throw error;
    }
  }

  // === BUSCAR PAGOS POR RANGO DE FECHAS ===
  static async findByDateRange(startDate, endDate) {
    try {
      console.log('PaymentModel.findByDateRange:', startDate, '→', endDate);
      const [rows] = await connect.query(
        `SELECT * FROM payment WHERE payment_date BETWEEN ? AND ? ORDER BY payment_date DESC`,
        [startDate, endDate]
      );
      return rows;
    } catch (error) {
      console.error('❌ PaymentModel.findByDateRange error:', error);
      throw error;
    }
  }

  // === BUSCAR POR REFERENCIA ===
  static async findByReference(reference) {
    try {
      console.log('PaymentModel.findByReference:', reference);
      const [rows] = await connect.query(
        `SELECT * FROM payment WHERE reference = ?`,
        [reference]
      );
      return rows[0];
    } catch (error) {
      console.error('❌ PaymentModel.findByReference error:', error);
      throw error;
    }
  }

  // === ACTUALIZAR PAGO ===
  static async update(id, { user_id, amount_paid, payment_date, method, reference }) {
    try {
      console.log('PaymentModel.update: Updating payment ID:', id);
      const [result] = await connect.query(
        `UPDATE payment 
         SET user_id = ?, amount_paid = ?, payment_date = ?, method = ?, reference = ? 
         WHERE payment_id = ?`,
        [user_id, amount_paid, payment_date, method, reference, id]
      );

      console.log('✅ Affected rows:', result.affectedRows);
      return result.affectedRows > 0 ? this.findById(id) : null;
    } catch (error) {
      console.error('❌ PaymentModel.update error:', error);
      throw error;
    }
  }

  // === ELIMINAR PAGO ===
  static async delete(id) {
    try {
      console.log('PaymentModel.delete: Deleting payment ID:', id);
      const [result] = await connect.query(
        `DELETE FROM payment WHERE payment_id = ?`,
        [id]
      );
      console.log('✅ Deleted:', result.affectedRows > 0);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('❌ PaymentModel.delete error:', error);
      throw error;
    }
  }

  // === SUMA TOTAL DE PAGOS POR USUARIO ===
  static async getTotalAmountByUser(user_id) {
    try {
      const [rows] = await connect.query(
        `SELECT SUM(amount_paid) AS total_amount FROM payment WHERE user_id = ?`,
        [user_id]
      );
      const total = rows[0]?.total_amount || 0;
      console.log(`✅ Total amount for user ${user_id}: ${total}`);
      return total;
    } catch (error) {
      console.error('❌ PaymentModel.getTotalAmountByUser error:', error);
      throw error;
    }
  }

  // === ESTADÍSTICAS GLOBALES DE PAGOS ===
  static async getPaymentStats() {
    try {
      const [rows] = await connect.query(`
        SELECT 
          COUNT(*) AS total_payments,
          SUM(amount_paid) AS total_amount,
          AVG(amount_paid) AS average_amount,
          MIN(amount_paid) AS min_amount,
          MAX(amount_paid) AS max_amount
        FROM payment
      `);
      return rows[0];
    } catch (error) {
      console.error('❌ PaymentModel.getPaymentStats error:', error);
      throw error;
    }
  }
}

export default PaymentModel;

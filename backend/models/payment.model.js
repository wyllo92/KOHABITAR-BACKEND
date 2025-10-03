import { connect } from '../config/db/connectMysql.js';

class PaymentModel {

  static async create({ 
    user_id, 
    amount_paid, 
    payment_date, 
    method, 
    reference, 
    invoice_id, 
    reservation_id, 
    parking_assignment_id, 
    status_id, 
    payment_type_id 
  }) {
    try {
      console.log('PaymentModel.create: Creating payment...');
      
      const [result] = await connect.query(
        'INSERT INTO payment (user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id, payment_type_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id, payment_type_id]
      );
      
      console.log('PaymentModel.create: Payment created with ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('PaymentModel.create error:', error);
      throw error;
    }
  }

  // VERSIÓN SIMPLE - SOLO TABLA PAYMENT (FUNCIONARÁ)
  static async showActive() {
    try {
      console.log('PaymentModel.showActive: Fetching active payments (simple version)...');
      
      const query = `
        SELECT 
          payment_id,
          user_id,
          amount_paid,
          payment_date,
          method,
          reference,
          invoice_id,
          reservation_id,
          parking_assignment_id,
          status_id,
          payment_type_id,
          created_at
        FROM payment 
        WHERE status_id = 1 
        ORDER BY payment_date DESC
      `;
      
      const [rows] = await connect.query(query);
      console.log('PaymentModel.showActive: Found', rows.length, 'active payments');
      return rows;
    } catch (error) {
      console.error('PaymentModel.showActive error:', error);
      throw error;
    }
  }

  // VERSIÓN SIMPLE - SOLO TABLA PAYMENT (FUNCIONARÁ)
  static async show() {
    try {
      console.log('PaymentModel.show: Fetching all payments (simple version)...');
      
      const query = `
        SELECT 
          payment_id,
          user_id,
          amount_paid,
          payment_date,
          method,
          reference,
          invoice_id,
          reservation_id,
          parking_assignment_id,
          status_id,
          payment_type_id,
          created_at
        FROM payment 
        ORDER BY payment_date DESC
      `;
      
      const [rows] = await connect.query(query);
      console.log('PaymentModel.show: Found', rows.length, 'payments');
      return rows;
    } catch (error) {
      console.error('PaymentModel.show error:', error);
      throw error;
    }
  }

  static async update(id, { 
    user_id, 
    amount_paid, 
    payment_date, 
    method, 
    reference, 
    invoice_id, 
    reservation_id, 
    parking_assignment_id, 
    status_id, 
    payment_type_id 
  }) {
    try {
      console.log('PaymentModel.update: Updating payment ID:', id);
      
      const [result] = await connect.query(
        'UPDATE payment SET user_id = ?, amount_paid = ?, payment_date = ?, method = ?, reference = ?, invoice_id = ?, reservation_id = ?, parking_assignment_id = ?, status_id = ?, payment_type_id = ? WHERE payment_id = ?',
        [user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id, payment_type_id, id]
      );
      
      console.log('PaymentModel.update: Affected rows:', result.affectedRows);
      return result.affectedRows > 0 ? this.findByIdSimple(id) : null;
    } catch (error) {
      console.error('PaymentModel.update error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      console.log('PaymentModel.delete: Deleting payment ID:', id);
      
      // Eliminación física - eliminar completamente el registro
      const [result] = await connect.query(
        'DELETE FROM payment WHERE payment_id = ?',
        [id]
      );
      
      console.log('PaymentModel.delete: Affected rows:', result.affectedRows);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('PaymentModel.delete error:', error);
      throw error;
    }
  }

  // MÉTODO SIMPLE PARA BUSCAR POR ID
  static async findByIdSimple(id) {
    try {
      const [rows] = await connect.query(`
        SELECT * FROM payment WHERE payment_id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error('PaymentModel.findByIdSimple error:', error);
      throw error;
    }
  }

  // VERSIÓN SIMPLE QUE FUNCIONARÁ
  static async findByIdActive(id) {
    try {
      console.log('PaymentModel.findByIdActive: Finding payment ID:', id);
      
      const [rows] = await connect.query(`
        SELECT * FROM payment 
        WHERE payment_id = ? AND status_id = 1
      `, [id]);
      
      console.log('PaymentModel.findByIdActive: Found:', rows[0] ? 'Yes' : 'No');
      return rows[0];
    } catch (error) {
      console.error('PaymentModel.findByIdActive error:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      console.log('PaymentModel.findById: Finding payment ID:', id);
      
      const [rows] = await connect.query(`
        SELECT * FROM payment WHERE payment_id = ?
      `, [id]);
      
      return rows[0];
    } catch (error) {
      console.error('PaymentModel.findById error:', error);
      throw error;
    }
  }

  static async findByUserId(user_id) {
    try {
      console.log('PaymentModel.findByUserId: Finding payments for user:', user_id);
      
      const [rows] = await connect.query(`
        SELECT * FROM payment 
        WHERE user_id = ? 
        ORDER BY payment_date DESC
      `, [user_id]);
      
      console.log('PaymentModel.findByUserId: Found', rows.length, 'payments');
      return rows;
    } catch (error) {
      console.error('PaymentModel.findByUserId error:', error);
      throw error;
    }
  }

  static async findByDateRange(startDate, endDate) {
    try {
      console.log('PaymentModel.findByDateRange: Finding payments between:', startDate, 'and', endDate);
      
      const [rows] = await connect.query(`
        SELECT * FROM payment 
        WHERE payment_date BETWEEN ? AND ? 
        ORDER BY payment_date DESC
      `, [startDate, endDate]);
      
      console.log('PaymentModel.findByDateRange: Found', rows.length, 'payments');
      return rows;
    } catch (error) {
      console.error('PaymentModel.findByDateRange error:', error);
      throw error;
    }
  }

  static async findByStatus(status_id) {
    try {
      console.log('PaymentModel.findByStatus: Finding payments with status:', status_id);
      
      const [rows] = await connect.query(`
        SELECT * FROM payment 
        WHERE status_id = ? 
        ORDER BY payment_date DESC
      `, [status_id]);
      
      console.log('PaymentModel.findByStatus: Found', rows.length, 'payments');
      return rows;
    } catch (error) {
      console.error('PaymentModel.findByStatus error:', error);
      throw error;
    }
  }

  static async findByReference(reference) {
    try {
      console.log('PaymentModel.findByReference: Finding payment with reference:', reference);
      
      const [rows] = await connect.query(`
        SELECT * FROM payment WHERE reference = ?
      `, [reference]);
      
      return rows[0];
    } catch (error) {
      console.error('PaymentModel.findByReference error:', error);
      throw error;
    }
  }

  static async getTotalAmountByUser(user_id) {
    try {
      console.log('PaymentModel.getTotalAmountByUser: Calculating total for user:', user_id);
      
      const [rows] = await connect.query(
        'SELECT SUM(amount_paid) as total_amount FROM payment WHERE user_id = ? AND status_id = 1',
        [user_id]
      );
      
      const total = rows[0]?.total_amount || 0;
      console.log('PaymentModel.getTotalAmountByUser: Total amount:', total);
      return total;
    } catch (error) {
      console.error('PaymentModel.getTotalAmountByUser error:', error);
      throw error;
    }
  }

  static async getTotalAmountByDateRange(startDate, endDate) {
    try {
      const [rows] = await connect.query(
        'SELECT SUM(amount_paid) as total_amount FROM payment WHERE payment_date BETWEEN ? AND ? AND status_id = 1',
        [startDate, endDate]
      );
      return rows[0]?.total_amount || 0;
    } catch (error) {
      console.error('PaymentModel.getTotalAmountByDateRange error:', error);
      throw error;
    }
  }

  static async getPaymentStats() {
    try {
      const [rows] = await connect.query(`
        SELECT 
          COUNT(*) as total_payments,
          SUM(amount_paid) as total_amount,
          AVG(amount_paid) as average_amount,
          MIN(amount_paid) as min_amount,
          MAX(amount_paid) as max_amount
        FROM payment 
        WHERE status_id = 1
      `);
      return rows[0];
    } catch (error) {
      console.error('PaymentModel.getPaymentStats error:', error);
      throw error;
    }
  }

  static async findByInvoiceId(invoice_id) {
    try {
      console.log('PaymentModel.findByInvoiceId: Finding payments for invoice:', invoice_id);
      
      const [rows] = await connect.query(`
        SELECT * FROM payment 
        WHERE invoice_id = ?
        ORDER BY payment_date DESC
      `, [invoice_id]);
      
      console.log('PaymentModel.findByInvoiceId: Found', rows.length, 'payments');
      return rows;
    } catch (error) {
      console.error('PaymentModel.findByInvoiceId error:', error);
      throw error;
    }
  }

  static async findByReservationId(reservation_id) {
    try {
      console.log('PaymentModel.findByReservationId: Finding payments for reservation:', reservation_id);
      
      const [rows] = await connect.query(`
        SELECT * FROM payment 
        WHERE reservation_id = ?
        ORDER BY payment_date DESC
      `, [reservation_id]);
      
      console.log('PaymentModel.findByReservationId: Found', rows.length, 'payments');
      return rows;
    } catch (error) {
      console.error('PaymentModel.findByReservationId error:', error);
      throw error;
    }
  }

  // MÉTODO PARA PROBAR LA ESTRUCTURA DE LAS OTRAS TABLAS
  static async testTableStructures() {
    try {
      console.log('=== TESTING TABLE STRUCTURES ===');
      
      // Test user table
      try {
        const [userRows] = await connect.query('SELECT * FROM user LIMIT 1');
        console.log('✅ USER table exists. Columns:', Object.keys(userRows[0] || {}));
      } catch (err) {
        console.log('❌ USER table error:', err.message);
      }
      
      // Test status table
      try {
        const [statusRows] = await connect.query('SELECT * FROM status LIMIT 1');
        console.log('✅ STATUS table exists. Columns:', Object.keys(statusRows[0] || {}));
      } catch (err) {
        console.log('❌ STATUS table error:', err.message);
      }
      
      // Test invoice table
      try {
        const [invoiceRows] = await connect.query('SELECT * FROM invoice LIMIT 1');
        console.log('✅ INVOICE table exists. Columns:', Object.keys(invoiceRows[0] || {}));
      } catch (err) {
        console.log('❌ INVOICE table error:', err.message);
      }
      
      // Test payment_type table
      try {
        const [ptRows] = await connect.query('SELECT * FROM payment_type LIMIT 1');
        console.log('✅ PAYMENT_TYPE table exists. Columns:', Object.keys(ptRows[0] || {}));
      } catch (err) {
        console.log('❌ PAYMENT_TYPE table error:', err.message);
      }
      
      // Test reservation table
      try {
        const [resRows] = await connect.query('SELECT * FROM reservation LIMIT 1');
        console.log('✅ RESERVATION table exists. Columns:', Object.keys(resRows[0] || {}));
      } catch (err) {
        console.log('❌ RESERVATION table error:', err.message);
      }
      
      // Test parking_assignment table
      try {
        const [paRows] = await connect.query('SELECT * FROM parking_assignment LIMIT 1');
        console.log('✅ PARKING_ASSIGNMENT table exists. Columns:', Object.keys(paRows[0] || {}));
      } catch (err) {
        console.log('❌ PARKING_ASSIGNMENT table error:', err.message);
      }
      
      console.log('=== END TABLE STRUCTURE TEST ===');
      
    } catch (error) {
      console.error('testTableStructures error:', error);
    }
  }

}

export default PaymentModel;
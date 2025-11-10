import { connect } from '../config/db/connectMysql.js';

class ReportModel {
	/**
	 * Devuelve un resumen con conteos básicos de tablas importantes
	 * @returns {Object} { users, properties, parkingsAvailable, payments: { total_payments, total_amount }, pqrs }
	 */
	static async getSummary() {
		try {
			// Consultas a ejecutar en paralelo
			const queries = {
				users: 'SELECT COUNT(*) AS total FROM `user`',
				properties: 'SELECT COUNT(*) AS total FROM `property`',
				parkingsAvailable: 'SELECT COUNT(*) AS total FROM `parkingslot` WHERE `status_id` = 1',
				pqrs: 'SELECT COUNT(*) AS total FROM `cpcg`',
				payments: 'SELECT COUNT(*) AS total_payments, IFNULL(SUM(amount_paid),0) AS total_amount FROM `payment`'
			};

			const keys = Object.keys(queries);
			const promises = keys.map(k => connect.query(queries[k]));
			const results = await Promise.all(promises);

			const out = {};
			keys.forEach((k, idx) => {
				const [rows] = results[idx];
				if (k === 'payments') {
					const row = rows[0] || { total_payments: 0, total_amount: 0 };
					out.payments = {
						total_payments: Number(row.total_payments || 0),
						total_amount: Number(row.total_amount || 0)
					};
				} else {
					const row = rows[0] || { total: 0 };
					out[k] = Number(row.total || 0);
				}
			});

			return out;
		} catch (error) {
			console.error('ReportModel.getSummary error:', error);
			throw error;
		}
	}

	/**
	 * Obtiene datos de pagos agrupados por mes para gráficos
	 * @param {number} months - Número de meses a obtener (default: 6)
	 * @returns {Array} Array de objetos { month, year, total }
	 */
	static async getPaymentsByMonth(months = 6) {
		try {
			const now = new Date();
			const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
			
			const [rows] = await connect.query(
				`SELECT 
					YEAR(payment_date) AS year,
					MONTH(payment_date) AS month,
					IFNULL(SUM(amount_paid), 0) AS total
				FROM payment
				WHERE payment_date >= ?
				GROUP BY YEAR(payment_date), MONTH(payment_date)
				ORDER BY year, month`,
				[startDate]
			);

			return rows.map(row => ({
				year: Number(row.year),
				month: Number(row.month),
				total: Number(row.total || 0)
			}));
		} catch (error) {
			console.error('ReportModel.getPaymentsByMonth error:', error);
			throw error;
		}
	}

	/**
	 * Obtiene datos de PQRS agrupados por mes para gráficos
	 * @param {number} months - Número de meses a obtener (default: 6)
	 * @returns {Array} Array de objetos { month, year, total }
	 */
	static async getPqrsByMonth(months = 6) {
		try {
			const now = new Date();
			const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
			
			const [rows] = await connect.query(
				`SELECT 
					YEAR(CPCG_createAt) AS year,
					MONTH(CPCG_createAt) AS month,
					COUNT(*) AS total
				FROM cpcg
				WHERE CPCG_createAt >= ?
				GROUP BY YEAR(CPCG_createAt), MONTH(CPCG_createAt)
				ORDER BY year, month`,
				[startDate]
			);

			return rows.map(row => ({
				year: Number(row.year),
				month: Number(row.month),
				total: Number(row.total || 0)
			}));
		} catch (error) {
			console.error('ReportModel.getPqrsByMonth error:', error);
			throw error;
		}
	}

	/**
	 * Obtiene datos completos para exportación de reportes
	 * @returns {Object} Objeto con todos los datos del reporte
	 */
	static async getFullReportData() {
		try {
			const summary = await this.getSummary();
			const paymentsByMonth = await this.getPaymentsByMonth(12);
			const pqrsByMonth = await this.getPqrsByMonth(12);

			// Obtener datos detallados
			const [users] = await connect.query(
				`SELECT u.user_id, u.user_name, u.created_at, pr.profile_email 
				FROM user u 
				LEFT JOIN profile pr ON u.user_id = pr.user_id 
				ORDER BY u.created_at DESC 
				LIMIT 100`
			);
			const [properties] = await connect.query(
				`SELECT property_id, property_name, property_type, property_createAt as created_at 
				FROM property 
				ORDER BY property_createAt DESC 
				LIMIT 100`
			);
			const [payments] = await connect.query(
				`SELECT p.*, u.user_name, pr.profile_email 
				FROM payment p 
				LEFT JOIN user u ON p.user_id = u.user_id 
				LEFT JOIN profile pr ON u.user_id = pr.user_id
				ORDER BY p.payment_date DESC 
				LIMIT 100`
			);
			const [pqrs] = await connect.query(
				`SELECT c.*, u.user_name, p.property_name, ct.CPCG_type_name, s.status_name
				FROM cpcg c
				LEFT JOIN user u ON c.User_id = u.user_id
				LEFT JOIN property p ON c.Property_id = p.property_id
				LEFT JOIN cpcg_type ct ON c.CPCG_type_id = ct.CPCG_type_id
				LEFT JOIN status s ON c.Status_id = s.status_id
				ORDER BY c.CPCG_createAt DESC
				LIMIT 100`
			);

			return {
				summary,
				charts: {
					payments: paymentsByMonth,
					pqrs: pqrsByMonth
				},
				details: {
					users: users,
					properties: properties,
					payments: payments,
					pqrs: pqrs
				},
				generatedAt: new Date().toISOString()
			};
		} catch (error) {
			console.error('ReportModel.getFullReportData error:', error);
			throw error;
		}
	}
}

export default ReportModel;

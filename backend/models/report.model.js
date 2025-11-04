import { connect } from '../config/db/connectMysql.js';

class ReportModel {
	/**
	 * Devuelve un resumen con conteos básicos de tablas importantes
	 * @returns {Object} { users, properties, reservations, vehicles, roles, payments: { total_payments, total_amount } }
	 */
	static async getSummary() {
		try {
			// Consultas a ejecutar en paralelo
			const queries = {
				users: 'SELECT COUNT(*) AS total FROM `user`',
				properties: 'SELECT COUNT(*) AS total FROM `property`',
				reservations: 'SELECT COUNT(*) AS total FROM `reservation`',
				vehicles: 'SELECT COUNT(*) AS total FROM `vehicle`',
				roles: 'SELECT COUNT(*) AS total FROM `role`',
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
}

export default ReportModel;

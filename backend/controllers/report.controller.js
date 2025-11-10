import ReportModel from '../models/report.model.js';

class ReportController {
	async summary(req, res) {
		try {
			const data = await ReportModel.getSummary();
			res.status(200).json({ message: 'Report summary retrieved', data });
		} catch (error) {
			console.error('ReportController.summary error:', error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	}

	async paymentsChart(req, res) {
		try {
			const months = parseInt(req.query.months) || 6;
			const data = await ReportModel.getPaymentsByMonth(months);
			res.status(200).json({ message: 'Payments chart data retrieved', data });
		} catch (error) {
			console.error('ReportController.paymentsChart error:', error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	}

	async pqrsChart(req, res) {
		try {
			const months = parseInt(req.query.months) || 6;
			const data = await ReportModel.getPqrsByMonth(months);
			res.status(200).json({ message: 'PQRS chart data retrieved', data });
		} catch (error) {
			console.error('ReportController.pqrsChart error:', error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	}

	async fullReport(req, res) {
		try {
			const data = await ReportModel.getFullReportData();
			res.status(200).json({ message: 'Full report data retrieved', data });
		} catch (error) {
			console.error('ReportController.fullReport error:', error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	}
}

export default new ReportController();

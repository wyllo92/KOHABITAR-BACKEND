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
}

export default new ReportController();

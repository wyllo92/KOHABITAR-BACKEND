import ReportModel from '../models/report.model.js';

class ReportController {

    async register(req, res) {
        try {
            const { report_name, report_type, report_period, generated_by, report_data, generated_at } = req.body;

            // Basic validation
            if (!report_name || !report_type || !generated_by) {
                return res.status(400).json({ error: 'Required fields are missing: report_name, report_type, generated_by' });
            }

            const currentDate = generated_at || new Date().toISOString();

            const reportData = {
                User_id: generated_by,
                Report_title: report_name,
                Report_description: report_period || 'Generated report',
                report_type_id: 1, // Default report type
                Status_id: 1, // Default status
                Report_file_url: null,
                Report_created_at: currentDate
            };

            const reportId = await ReportModel.create(reportData);

            if (!reportId) {
                return res.status(500).json({ error: 'Failed to create report' });
            }

            res.status(201).json({
                message: 'Report created successfully',
                id: reportId
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async show(req, res) {
        try {
            console.log('Fetching all reports...');
            const reports = await ReportModel.show();
            console.log('Reports fetched:', reports);

            res.status(200).json({
                success: true,
                message: 'Reports retrieved successfully',
                data: reports
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                details: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const { report_name, report_type, report_period, generated_by, report_data } = req.body;
            const id = req.params.id;

            if (!report_name || !report_type || !generated_by || !id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const existingReport = await ReportModel.findById(id);
            if (!existingReport) {
                return res.status(404).json({ error: 'Report not found' });
            }

            // Map the request fields to model fields
            const updateData = {
                User_id: generated_by,
                Report_title: report_name,
                Report_description: report_period || 'Updated report',
                report_type_id: 1, // Default report type
                Status_id: 1, // Default status
                Report_file_url: null 
            };
            
            const updatedReport = await ReportModel.update(id, updateData);

            if (!updatedReport) {
                return res.status(500).json({ error: 'Failed to update report' });
            }

            res.status(200).json({
                message: 'Report updated successfully',
                data: updatedReport
            });
        } catch (error) {
            console.error('Error in report update:', error);
            res.status(500).json({ 
                error: 'Internal Server Error',
                details: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const deleteResult = await ReportModel.delete(id);
            if (!deleteResult) {
                return res.status(404).json({ error: 'Report not found' });
            }

            res.status(200).json({
                message: 'Report deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async findById(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const report = await ReportModel.findById(id);
            if (!report) {
                return res.status(404).json({ error: 'Report not found' });
            }

            res.status(200).json({
                message: 'Report found successfully',
                data: report
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

export default new ReportController();

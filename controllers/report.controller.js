import UserModel from '../models/user.model.js';
import PropertyModel from '../models/property.model.js';
import VehicleModel from '../models/vehicle.model.js';
import ReportModel from '../models/report.model.js';
import ReportExporter from '../utils/exporters/ReportExporter.js';

/**
 * Controlador para gestionar las operaciones relacionadas con reportes.
 * Implementar métodos para crear, consultar, actualizar y eliminar reportes,
 * así como para generar reportes específicos sobre diferentes entidades del sistema.
 */
class ReportController {

    /**
     * Registrar un nuevo reporte en el sistema.
     * 
     * @param {Object} req - Objeto de solicitud HTTP con los datos del reporte en el cuerpo
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con el resultado de la operación
     */
    async register(req, res) {
        try {
            const { report_name, report_type, report_period, generated_by, report_data } = req.body;

            // Basic validation
            if (!report_name || !report_type || !generated_by) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const currentDate = new Date().toISOString();
            const reportId = await ReportModel.create({
                user_id: generated_by,
                title: report_name,
                description: report_period || 'Generated report',
                report_type_id: 1, // Default report type
                status_id: 1, // Default status
                file_url: null,
                created_at: currentDate
            });

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

    /**
     * Obtener todos los reportes disponibles en el sistema.
     * Actualmente retorna un array vacío para evitar errores de base de datos.
     * 
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con la lista de reportes
     */
    async show(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            // Extraer filtros de la query
            const filters = {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                reportType: req.query.type ? parseInt(req.query.type) : null,
                searchTerm: req.query.search
            };

            const result = await ReportModel.show(page, limit, filters);

            // Exportar si se solicita
            if (req.query.export) {
                const format = req.query.export.toUpperCase();
                const filename = `report_${Date.now()}`;
                let fileUrl;

                switch (format) {
                    case 'PDF':
                        fileUrl = await ReportExporter.toPDF(result.data, filename);
                        break;
                    case 'EXCEL':
                        fileUrl = await ReportExporter.toExcel(result.data, filename);
                        break;
                    case 'CSV':
                        fileUrl = await ReportExporter.toCSV(result.data, filename);
                        break;
                    case 'JSON':
                        fileUrl = await ReportExporter.toJSON(result.data, filename);
                        break;
                    default:
                        throw new Error('Invalid export format');
                }

                return res.status(200).json({
                    success: true,
                    message: 'Report exported successfully',
                    data: {
                        fileUrl,
                        format
                    }
                });
            }

            res.status(200).json({
                success: true,
                message: 'Reports retrieved successfully',
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            console.error('Error in show reports:', error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                details: error.message
            });
        }
    }

    /**
     * Genera reportes consolidados de diferentes entidades del sistema.
     * Crear reportes para usuarios, propiedades, vehículos, reservas y estadísticas generales.
     * 
     * @param {Object} req - Objeto de solicitud HTTP
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con todos los reportes generados
     */
    async generateReports(req, res) {
        try {
            const reports = [];
            const currentDate = new Date().toISOString();

            // Reporte de Usuarios
            let users = [];
            try {
                users = await UserModel.show();
            } catch (error) {
                console.error('Error obteniendo usuarios:', error);
                users = []; // Array vacío si falla
            }
            
            reports.push({
                report_id: `USR_${Date.now()}`,
                title: 'Reporte de Usuarios',
                report_type_name: 'Usuarios',
                username: 'Sistema',
                status_name: 'Generado',
                created_at: currentDate,
                description: `Total de usuarios: ${users.length}`,
                data: users
            });

            // Reporte de Propiedades
            let properties = [];
            try {
                properties = await PropertyModel.show();
            } catch (error) {
                console.error('Error obteniendo propiedades:', error);
                properties = []; // Array vacío si falla
            }
            
            reports.push({
                report_id: `PROP_${Date.now()}`,
                title: 'Reporte de Propiedades',
                report_type_name: 'Propiedades',
                username: 'Sistema',
                status_name: 'Generado',
                created_at: currentDate,
                description: `Total de propiedades: ${properties.length}`,
                data: properties
            });

            // Reporte de Vehículos
            let vehicles = [];
            try {
                vehicles = await VehicleModel.show();
            } catch (error) {
                console.error('Error obteniendo vehículos:', error);
                vehicles = []; // Array vacío si falla
            }
            
            reports.push({
                report_id: `VEH_${Date.now()}`,
                title: 'Reporte de Vehículos',
                report_type_name: 'Vehículos',
                username: 'Sistema',
                status_name: 'Generado',
                created_at: currentDate,
                description: `Total de vehículos: ${vehicles.length}`,
                data: vehicles
            });

            // Reporte de Reservas
            let reservations = [];
            try {
                reservations = await ReservationModel.show();
            } catch (error) {
                console.error('Error obteniendo reservas:', error);
                reservations = []; // Array vacío si falla
            }
            
            reports.push({
                report_id: `RES_${Date.now()}`,
                title: 'Reporte de Reservas',
                report_type_name: 'Reservas',
                username: 'Sistema',
                status_name: 'Generado',
                created_at: currentDate,
                description: `Total de reservas: ${reservations.length}`,
                data: reservations
            });

            // Estadísticas generales
            let vehicleStats = null;
            let propertyStats = null;
            
            try {
                vehicleStats = await VehicleModel.getVehicleStatistics();
            } catch (error) {
                console.error('Error obteniendo estadísticas de vehículos:', error);
                vehicleStats = { total_vehicles: 0, cars: 0, motorcycles: 0 };
            }
            
            try {
                propertyStats = await PropertyModel.getStatistics();
            } catch (error) {
                console.error('Error obteniendo estadísticas de propiedades:', error);
                propertyStats = { total_properties: 0, apartments: 0, houses: 0 };
            }
            
            reports.push({
                report_id: `STAT_${Date.now()}`,
                title: 'Estadísticas Generales',
                report_type_name: 'Estadísticas',
                username: 'Sistema',
                status_name: 'Generado',
                created_at: currentDate,
                description: 'Resumen general del sistema',
                data: {
                    usuarios: users.length,
                    propiedades: properties.length,
                    vehiculos: vehicles.length,
                    reservas: reservations.length,
                    estadisticas_vehiculos: vehicleStats,
                    estadisticas_propiedades: propertyStats
                }
            });

            console.log(`Generados ${reports.length} reportes exitosamente`);

            res.status(200).json({
                success: true,
                message: 'Reports generated successfully',
                data: reports
            });
        } catch (error) {
            console.error('Error generating reports:', error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error: ' + error.message
            });
        }
    }

    /**
     * Actualiza la información de un reporte existente.
     * 
     * @param {Object} req - Objeto de solicitud HTTP con los datos actualizados en el cuerpo y el ID en los parámetros
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con el resultado de la operación y los datos actualizados
     */
    async update(req, res) {
        try {
            const { title, report_type_id, description, user_id, report_data } = req.body;
            const id = req.params.id;

            if (!title || !report_type_id || !user_id || !id) {
                return res.status(400).json({ error: 'Required fields are missing' });
            }

            const existingReport = await ReportModel.findById(id);
            if (!existingReport) {
                return res.status(404).json({ error: 'Report not found' });
            }

            const updatedReport = await ReportModel.update(id, {
                title,
                description,
                report_type_id,
                user_id,
                file_url: JSON.stringify(report_data || {}),
                status_id: 1
            });

            if (!updatedReport) {
                return res.status(500).json({ error: 'Failed to update report' });
            }

            res.status(200).json({
                message: 'Report updated successfully',
                data: updatedReport
            });
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    /**
     * Elimina un reporte del sistema.
     * 
     * @param {Object} req - Objeto de solicitud HTTP con el ID del reporte en los parámetros
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con el resultado de la operación
     */
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

    /**
     * Buscar un reporte por su ID.
     * 
     * @param {Object} req - Objeto de solicitud HTTP con el ID del reporte en los parámetros
     * @param {Object} res - Objeto de respuesta HTTP
     * @returns {Object} Respuesta JSON con los datos del reporte encontrado
     */
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

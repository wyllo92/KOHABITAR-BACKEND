import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import path from 'path';
import { createWriteStream } from 'fs';
import fs from 'fs/promises';

/**
 * Clase para manejar la exportación de reportes en diferentes formatos
 */
class ReportExporter {
  /**
   * Exporta datos a un archivo Excel
   * @param {Object} data - Datos a exportar
   * @param {string} filename - Nombre del archivo
   * @returns {string} URL del archivo generado
   */
  static async toExcel(data, filename) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Configurar encabezados
    const headers = Object.keys(data[0] || {});
    worksheet.addRow(headers);

    // Agregar datos
    data.forEach(row => {
      worksheet.addRow(Object.values(row));
    });

    const filePath = path.join('data', 'exports', `${filename}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  /**
   * Exporta datos a un archivo PDF
   * @param {Object} data - Datos a exportar
   * @param {string} filename - Nombre del archivo
   * @returns {string} URL del archivo generado
   */
  static async toPDF(data, filename) {
    return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filePath = path.join('data', 'exports', `${filename}.pdf`);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Agregar título
    doc.fontSize(16).text('Reporte', { align: 'center' });
    doc.moveDown();

    // Agregar datos
    data.forEach(row => {
      Object.entries(row).forEach(([key, value]) => {
        doc.fontSize(12).text(`${key}: ${value}`);
      });
      doc.moveDown();
    });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
    });
}

  /**
   * Exporta datos a un archivo CSV
   * @param {Object} data - Datos a exportar
   * @param {string} filename - Nombre del archivo
   * @returns {string} URL del archivo generado
   */
  static async toCSV(data, filename) {
  const headers = Object.keys(data[0] || {}).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  const content = [headers, ...rows].join('\n');

  const filePath = path.join('data', 'exports', `${filename}.csv`);
  await fs.writeFile(filePath, content);
  return filePath;
}

  /**
   * Exporta datos a un archivo JSON
   * @param {Object} data - Datos a exportar
   * @param {string} filename - Nombre del archivo
   * @returns {string} URL del archivo generado
   */
  static async toJSON(data, filename) {
  const filePath = path.join('data', 'exports', `${filename}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  return filePath;
  }
}

export default ReportExporter;
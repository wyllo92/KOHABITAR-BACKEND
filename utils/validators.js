/**
 * Utilidades para validación de datos
 */

/**
 * Valida el formato de un email
 * @param {string} email - Email a validar
 * @returns {boolean} true si el formato es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

/**
 * Valida el formato de un número telefónico
 * Acepta formatos:
 * - +57 123 456 7890
 * - +57-123-456-7890
 * - +571234567890
 * - 1234567890
 * - 123 456 7890
 * @param {string} phone - Número telefónico a validar
 * @returns {boolean} true si el formato es válido
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  // Remueve espacios y guiones para validar solo los dígitos
  const cleanPhone = phone.replace(/[\s-]/g, '');
  // Acepta números con o sin código de país +57
  const phoneRegex = /^(\+?57)?[0-9]{10}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Valida el tamaño de una cadena de texto
 * @param {string} str - Cadena a validar
 * @param {number} maxLength - Longitud máxima permitida
 * @returns {boolean} true si la longitud es válida
 */
export const isValidLength = (str, maxLength) => {
  return str.length <= maxLength;
};

/**
 * Valida la extensión de un archivo de imagen
 * @param {string} filename - Nombre del archivo
 * @returns {boolean} true si la extensión es válida
 */
export const isValidImageFile = (filename) => {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return validExtensions.includes(ext);
};
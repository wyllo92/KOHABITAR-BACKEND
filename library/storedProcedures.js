import { connect } from '../config/db/connectMysql.js';

/**
 * Gets permissions for a user including roles, modules and specific permissions
 * @param {number} userId - The ID of the user to retrieve permissions for
 * @returns {Array} Array of permission objects
 */
export async function getUserPermissions(userId) {
  try {
    const [rows] = await connect.query('CALL sp_get_user_permissions(?)', [userId]);
    return rows[0] || []; // First result set
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Gets parking availability for a specific zone
 * @param {number} zoneId - The ID of the parking zone
 * @returns {Array} Array of available parking slots
 */
export async function getParkingAvailability(zoneId) {
  try {
    const [rows] = await connect.query('CALL sp_get_parking_availability(?)', [zoneId]);
    return rows[0] || []; // First result set
  } catch (error) {
    console.error('Error getting parking availability:', error);
    return [];
  }
}

/**
 * Gets reservations for a specific user
 * @param {number} userId - The ID of the user
 * @returns {Array} Array of reservation objects
 */
export async function getUserReservations(userId) {
  try {
    const [rows] = await connect.query('CALL sp_get_user_reservations(?)', [userId]);
    return rows[0] || []; // First result set
  } catch (error) {
    console.error('Error getting user reservations:', error);
    return [];
  }
}

/**
 * Gets residents for a specific property
 * @param {number} propertyId - The ID of the property
 * @returns {Array} Array of resident objects
 */
export async function getPropertyResidents(propertyId) {
  try {
    const [rows] = await connect.query('CALL sp_get_property_residents(?)', [propertyId]);
    return rows[0] || []; // First result set
  } catch (error) {
    console.error('Error getting property residents:', error);
    return [];
  }
}

/**
 * Gets pending payments for a specific user
 * @param {number} userId - The ID of the user
 * @returns {Array} Array of payment objects
 */
export async function getPendingPayments(userId) {
  try {
    const [rows] = await connect.query('CALL sp_get_pending_payments(?)', [userId]);
    return rows[0] || []; // First result set
  } catch (error) {
    console.error('Error getting pending payments:', error);
    return [];
  }
}

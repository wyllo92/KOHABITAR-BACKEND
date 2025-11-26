import { connect } from '../config/db/connectMysql.js';

/**
 * Modelo para gestionar los sorteos de espacios de parqueo.
 * Este modelo maneja la lógica de sorteos para asignar espacios de parqueo
 * de manera justa cuando hay más propiedades que espacios disponibles.
 */
class ParkingLotteryModel {
  /**
   * Valida que una zona de parqueo exista y tenga espacios disponibles.
   * 
   * @param {number} parking_zone_id - ID de la zona de parqueo
   * @returns {Promise<boolean>} true si la zona es válida y tiene espacios
   * @throws {Error} si la zona no existe o no tiene espacios disponibles
   */
  static async validateParkingZone(parking_zone_id) {
    const [zones] = await connect.query(`
      SELECT pz.*, COUNT(ps.parking_slot_id) as available_slots
      FROM parking_zones pz
      LEFT JOIN parking_slots ps ON pz.parking_zone_id = ps.parking_zone_id
      WHERE pz.parking_zone_id = ?
      AND ps.status_id = (SELECT status_id FROM statuses WHERE name = 'Disponible' LIMIT 1)
      GROUP BY pz.parking_zone_id
    `, [parking_zone_id]);

    if (!zones.length) {
      throw new Error('La zona de parqueo no existe');
    }
    if (zones[0].available_slots === 0) {
      throw new Error('La zona de parqueo no tiene espacios disponibles');
    }
    return true;
  }

  /**
   * Crear un nuevo sorteo para asignar espacios de parqueo.
   *
   * @param {Object} lotteryData - Datos del sorteo
   * @param {Date} lotteryData.start_date - Fecha de inicio del período de asignación
   * @param {Date} lotteryData.end_date - Fecha de fin del período de asignación
   * @param {number} lotteryData.parking_zone_id - ID de la zona de parqueo
   * @param {number} lotteryData.available_slots - Cantidad de espacios a sortear (default: 10)
   * @returns {number} ID del sorteo creado
   * @throws {Error} si las fechas son inválidas o la zona no es válida
   */
  static async create({ start_date, end_date, parking_zone_id, available_slots = 10 }) {
    // Validar fechas
    const currentDate = new Date();
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (startDate <= currentDate) {
      throw new Error('La fecha de inicio debe ser posterior a la fecha actual');
    }
    if (endDate <= startDate) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    // Validar zona de parqueo
    await this.validateParkingZone(parking_zone_id);

    // Validar que available_slots sea un número válido
    const slotsToRaffle = parseInt(available_slots) || 10;
    if (slotsToRaffle <= 0) {
      throw new Error('La cantidad de espacios a sortear debe ser mayor a 0');
    }

    try {
      const sqlQuery = `
        INSERT INTO parking_lotteries
        (start_date, end_date, parking_zone_id, available_slots, status_id)
        VALUES (?, ?, ?, ?, (SELECT status_id FROM statuses WHERE name = 'Pendiente' LIMIT 1))
      `;
      const [result] = await connect.query(sqlQuery, [start_date, end_date, parking_zone_id, slotsToRaffle]);
      return result.insertId;
    } catch (error) {
      console.error('Error al crear sorteo:', error);
      throw error;
    }
  }

  /**
   * Registrar un participante en el sorteo.
   * Valida que el usuario no esté ya inscrito antes de registrarlo.
   *
   * @param {number} lotteryId - ID del sorteo
   * @param {number} userId - ID del usuario
   * @param {number} propertyId - ID de la propiedad
   * @returns {boolean} true si se registró correctamente
   * @throws {Error} si el usuario ya está inscrito o si hay otro error
   */
  static async registerParticipant(lotteryId, userId, propertyId) {
    try {
      // PASO 1: Verificar si el usuario ya está inscrito
      const [existingParticipant] = await connect.query(`
        SELECT participant_id
        FROM lottery_participants
        WHERE lottery_id = ?
        AND user_id = ?
        AND property_id = ?
      `, [lotteryId, userId, propertyId]);

      // PASO 2: Si ya existe, lanzar un error con mensaje claro
      if (existingParticipant.length > 0) {
        throw new Error('El usuario ya está inscrito en este sorteo con esta propiedad');
      }

      // PASO 3: Verificar que el sorteo existe y está abierto (Pendiente)
      const [lottery] = await connect.query(`
        SELECT pl.*, s.name as status_name
        FROM parking_lotteries pl
        JOIN statuses s ON pl.status_id = s.status_id
        WHERE pl.lottery_id = ?
      `, [lotteryId]);

      if (!lottery.length) {
        throw new Error('El sorteo no existe');
      }

      if (lottery[0].status_name !== 'Pendiente') {
        throw new Error('El sorteo ya fue ejecutado o cancelado. No puedes inscribirte');
      }

      // PASO 4: Si todo está bien, registrar al participante
      const sqlQuery = `
        INSERT INTO lottery_participants
        (lottery_id, user_id, property_id)
        VALUES (?, ?, ?)
      `;
      await connect.query(sqlQuery, [lotteryId, userId, propertyId]);
      return true;
    } catch (error) {
      console.error('Error al registrar participante:', error);
      throw error;
    }
  }

  /**
   * Ejecuta el sorteo y asigna los espacios de parqueo.
   * Utiliza un algoritmo aleatorio para seleccionar ganadores.
   * 
   * @param {number} lotteryId - ID del sorteo
   * @returns {Array} Lista de asignaciones generadas
   */
  static async executeLottery(lotteryId) {
    const connection = await connect.getConnection();
    try {
      await connection.beginTransaction();

      // PASO 1: Verificar que el sorteo existe y obtener su información
      const [lotteryInfo] = await connection.query(`
        SELECT pl.*, s.name as status_name
        FROM parking_lotteries pl
        JOIN statuses s ON pl.status_id = s.status_id
        WHERE pl.lottery_id = ?
      `, [lotteryId]);

      if (!lotteryInfo.length) {
        throw new Error('El sorteo no existe');
      }

      // PASO 2: Verificar que el sorteo está en estado "Pendiente"
      if (lotteryInfo[0].status_name === 'Completado') {
        throw new Error('Este sorteo ya fue ejecutado anteriormente. Usa el endpoint /parking-lotteries/:lottery_id/results para ver los ganadores');
      }

      if (lotteryInfo[0].status_name === 'Cancelado') {
        throw new Error('Este sorteo fue cancelado y no se puede ejecutar');
      }

      const maxSlotsToAssign = lotteryInfo[0].available_slots;

      // PASO 3: Obtener los participantes del sorteo (ordenados aleatoriamente)
      const [participants] = await connection.query(`
        SELECT lp.user_id, lp.property_id
        FROM lottery_participants lp
        WHERE lp.lottery_id = ?
        ORDER BY RAND()
      `, [lotteryId]);

      // PASO 4: Verificar que hay participantes inscritos
      if (participants.length === 0) {
        throw new Error('No hay participantes inscritos en este sorteo. Primero deben inscribirse usuarios usando el endpoint POST /parking-lotteries/:lottery_id/participants');
      }

      // PASO 5: Obtener los espacios disponibles en la zona (limitado por available_slots)
      const [spaces] = await connection.query(`
        SELECT ps.parking_slot_id, ps.code
        FROM parking_slots ps
        JOIN parking_lotteries pl ON ps.parking_zone_id = pl.parking_zone_id
        WHERE pl.lottery_id = ?
        AND ps.status_id = (SELECT status_id FROM statuses WHERE name = 'Disponible' LIMIT 1)
        AND ps.is_reserved = 0
        LIMIT ?
      `, [lotteryId, maxSlotsToAssign]);

      // PASO 6: Verificar que hay espacios disponibles
      if (spaces.length === 0) {
        // Contar cuántos espacios hay en total en la zona (ocupados + disponibles)
        const [totalSpaces] = await connection.query(`
          SELECT COUNT(*) as total,
                 SUM(CASE WHEN ps.is_reserved = 0 AND ps.status_id = (SELECT status_id FROM statuses WHERE name = 'Disponible' LIMIT 1) THEN 1 ELSE 0 END) as available,
                 pz.name as zone_name
          FROM parking_slots ps
          JOIN parking_lotteries pl ON ps.parking_zone_id = pl.parking_zone_id
          JOIN parking_zones pz ON ps.parking_zone_id = pz.parking_zone_id
          WHERE pl.lottery_id = ?
          GROUP BY pz.name
        `, [lotteryId]);

        const zoneInfo = totalSpaces[0];
        throw new Error(
          `No hay espacios de parqueo disponibles en la zona "${zoneInfo.zone_name}". ` +
          `Total de espacios: ${zoneInfo.total}, Disponibles: ${zoneInfo.available}. ` +
          `Sugerencia: Libera espacios ocupados o crea más espacios en esta zona usando POST /parking-slots`
        );
      }

      // PASO 7: Calcular cuántos ganadores habrá
      // Se toma el menor valor entre:
      // - Cantidad de espacios disponibles
      // - Cantidad de participantes inscritos
      // - Cantidad de espacios configurados para sortear (available_slots)
      const assignments = [];
      const winnersCount = Math.min(spaces.length, participants.length, maxSlotsToAssign);
      const assignedParticipants = participants.slice(0, winnersCount);

      // PASO 8: Asignar espacios de parqueo a los ganadores
      for (let i = 0; i < assignedParticipants.length; i++) {
        const participant = assignedParticipants[i];
        const space = spaces[i];

        // 8.1: Crear la asignación de parqueo para este ganador
        const [result] = await connection.query(`
          INSERT INTO parking_assignments
          (parking_slot_id, user_id, property_id, start_time, end_time, status_id, lottery_id)
          VALUES (?, ?, ?,
            (SELECT start_date FROM parking_lotteries WHERE lottery_id = ?),
            (SELECT end_date FROM parking_lotteries WHERE lottery_id = ?),
            (SELECT status_id FROM statuses WHERE name = 'Activo' LIMIT 1),
            ?
          )
        `, [space.parking_slot_id, participant.user_id, participant.property_id, lotteryId, lotteryId, lotteryId]);

        // 8.2: Marcar el espacio de parqueo como ocupado/reservado
        await connection.query(`
          UPDATE parking_slots
          SET is_reserved = 1,
              status_id = (SELECT status_id FROM statuses WHERE name = 'Ocupado' LIMIT 1)
          WHERE parking_slot_id = ?
        `, [space.parking_slot_id]);

        // 8.3: Agregar la asignación a la lista de resultados
        assignments.push({
          assignment_id: result.insertId,
          parking_slot_id: space.parking_slot_id,
          user_id: participant.user_id,
          property_id: participant.property_id
        });
      }

      // PASO 9: Marcar el sorteo como completado
      await connection.query(`
        UPDATE parking_lotteries
        SET status_id = (SELECT status_id FROM statuses WHERE name = 'Completado' LIMIT 1)
        WHERE lottery_id = ?
      `, [lotteryId]);

      await connection.commit();
      return assignments;
    } catch (error) {
      await connection.rollback();
      console.error('Error al ejecutar sorteo:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtener todos los sorteos con su información relacionada.
   * 
   * @returns {Array} Lista de sorteos
   */
  static async getAll() {
    try {
      const sqlQuery = `
        SELECT pl.*, 
               pz.name as zone_name,
               s.name as status_name,
               COUNT(lp.participant_id) as total_participants
        FROM parking_lotteries pl
        LEFT JOIN parking_zones pz ON pl.parking_zone_id = pz.parking_zone_id
        LEFT JOIN statuses s ON pl.status_id = s.status_id
        LEFT JOIN lottery_participants lp ON pl.lottery_id = lp.lottery_id
        GROUP BY pl.lottery_id
        ORDER BY pl.start_date DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      console.error('Error al obtener sorteos:', error);
      throw error;
    }
  }

  /**
   * Obtener los participantes de un sorteo específico.
   *
   * @param {number} lotteryId - ID del sorteo
   * @returns {Array} Lista de participantes
   */
  static async getParticipants(lotteryId) {
    try {
      const sqlQuery = `
        SELECT lp.*,
               u.username,
               p.name as property_name
        FROM lottery_participants lp
        JOIN users u ON lp.user_id = u.user_id
        JOIN properties p ON lp.property_id = p.property_id
        WHERE lp.lottery_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [lotteryId]);
      return result;
    } catch (error) {
      console.error('Error al obtener participantes:', error);
      throw error;
    }
  }

  /**
   * Verificar la disponibilidad de espacios antes de ejecutar el sorteo.
   * Útil para saber si el sorteo se puede ejecutar sin errores.
   *
   * @param {number} lotteryId - ID del sorteo
   * @returns {Object} Información sobre la disponibilidad del sorteo
   */
  static async checkAvailability(lotteryId) {
    try {
      // PASO 1: Obtener información básica del sorteo
      const [lotteryInfo] = await connect.query(`
        SELECT pl.*,
               pz.name as zone_name,
               s.name as status_name
        FROM parking_lotteries pl
        JOIN parking_zones pz ON pl.parking_zone_id = pz.parking_zone_id
        JOIN statuses s ON pl.status_id = s.status_id
        WHERE pl.lottery_id = ?
      `, [lotteryId]);

      if (!lotteryInfo.length) {
        throw new Error('El sorteo no existe');
      }

      const lottery = lotteryInfo[0];

      // PASO 2: Contar participantes inscritos
      const [participantCount] = await connect.query(`
        SELECT COUNT(*) as total
        FROM lottery_participants
        WHERE lottery_id = ?
      `, [lotteryId]);

      // PASO 3: Contar espacios disponibles en la zona
      const [availableSpaces] = await connect.query(`
        SELECT COUNT(*) as total
        FROM parking_slots ps
        WHERE ps.parking_zone_id = ?
        AND ps.status_id = (SELECT status_id FROM statuses WHERE name = 'Disponible' LIMIT 1)
        AND ps.is_reserved = 0
      `, [lottery.parking_zone_id]);

      // PASO 4: Contar todos los espacios en la zona (ocupados + disponibles)
      const [totalSpaces] = await connect.query(`
        SELECT COUNT(*) as total
        FROM parking_slots ps
        WHERE ps.parking_zone_id = ?
      `, [lottery.parking_zone_id]);

      // PASO 5: Calcular cuántos ganadores habrá
      const participants = participantCount[0].total;
      const available = availableSpaces[0].total;
      const total = totalSpaces[0].total;
      const maxWinners = Math.min(participants, available, lottery.available_slots);

      // PASO 6: Determinar si el sorteo se puede ejecutar
      const canExecute = (
        lottery.status_name === 'Pendiente' &&
        participants > 0 &&
        available > 0
      );

      // PASO 7: Crear mensajes informativos para el usuario
      let warnings = [];
      let errors = [];

      if (lottery.status_name === 'Completado') {
        errors.push('El sorteo ya fue ejecutado anteriormente');
      }
      if (lottery.status_name === 'Cancelado') {
        errors.push('El sorteo fue cancelado');
      }
      if (participants === 0) {
        errors.push('No hay participantes inscritos en el sorteo');
      }
      if (available === 0) {
        errors.push(`No hay espacios disponibles en la zona "${lottery.zone_name}"`);
      }
      if (participants > available && available > 0) {
        warnings.push(`Hay más participantes (${participants}) que espacios disponibles (${available}). Algunos participantes no ganarán`);
      }

      return {
        lottery_id: lottery.lottery_id,
        lottery_name: `Sorteo ${lottery.zone_name}`,
        status: lottery.status_name,
        can_execute: canExecute,
        zone: {
          name: lottery.zone_name,
          total_slots: total,
          available_slots: available,
          occupied_slots: total - available
        },
        participants: {
          total: participants,
          will_win: maxWinners,
          will_not_win: participants - maxWinners
        },
        warnings: warnings,
        errors: errors,
        message: canExecute
          ? `El sorteo está listo para ejecutarse. ${maxWinners} participante(s) ganarán`
          : `El sorteo NO se puede ejecutar. Revise los errores`
      };
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      throw error;
    }
  }

  /**
   * Obtener los resultados de un sorteo (ganadores y no ganadores).
   *
   * @param {number} lotteryId - ID del sorteo
   * @returns {Object} Resultados del sorteo con ganadores y participantes
   */
  static async getLotteryResults(lotteryId) {
    try {
      // Información del sorteo
      const [lotteryInfo] = await connect.query(`
        SELECT pl.*,
               pz.name as zone_name,
               s.name as status_name
        FROM parking_lotteries pl
        LEFT JOIN parking_zones pz ON pl.parking_zone_id = pz.parking_zone_id
        LEFT JOIN statuses s ON pl.status_id = s.status_id
        WHERE pl.lottery_id = ?
      `, [lotteryId]);

      if (!lotteryInfo.length) {
        throw new Error('El sorteo no existe');
      }

      // Ganadores (con asignaciones)
      const [winners] = await connect.query(`
        SELECT pa.parking_assignment_id,
               pa.parking_slot_id,
               pa.user_id,
               pa.property_id,
               pa.start_time,
               pa.end_time,
               u.username,
               prof.full_name,
               p.name as property_name,
               ps.code as parking_slot_code,
               s.name as assignment_status
        FROM parking_assignments pa
        JOIN users u ON pa.user_id = u.user_id
        LEFT JOIN profiles prof ON u.user_id = prof.user_id
        JOIN properties p ON pa.property_id = p.property_id
        JOIN parking_slots ps ON pa.parking_slot_id = ps.parking_slot_id
        LEFT JOIN statuses s ON pa.status_id = s.status_id
        WHERE pa.lottery_id = ?
        ORDER BY pa.created_at
      `, [lotteryId]);

      // Todos los participantes
      const [allParticipants] = await connect.query(`
        SELECT lp.participant_id,
               lp.user_id,
               lp.property_id,
               lp.registered_at,
               u.username,
               prof.full_name,
               p.name as property_name,
               CASE
                 WHEN pa.parking_assignment_id IS NOT NULL THEN 1
                 ELSE 0
               END as is_winner
        FROM lottery_participants lp
        JOIN users u ON lp.user_id = u.user_id
        LEFT JOIN profiles prof ON u.user_id = prof.user_id
        JOIN properties p ON lp.property_id = p.property_id
        LEFT JOIN parking_assignments pa ON pa.user_id = lp.user_id
          AND pa.property_id = lp.property_id
          AND pa.lottery_id = lp.lottery_id
        WHERE lp.lottery_id = ?
        ORDER BY is_winner DESC, lp.registered_at
      `, [lotteryId]);

      // Separar participantes en ganadores y no ganadores
      const participants = allParticipants.filter(p => p.is_winner === 0);

      return {
        lottery: lotteryInfo[0],
        winners: winners,
        participants: participants,
        summary: {
          total_participants: allParticipants.length,
          total_winners: winners.length,
          total_not_winners: participants.length,
          available_slots: lotteryInfo[0].available_slots
        }
      };
    } catch (error) {
      console.error('Error al obtener resultados del sorteo:', error);
      throw error;
    }
  }

  /**
   * Cancela un sorteo existente.
   * 
   * @param {number} lotteryId - ID del sorteo a cancelar
   * @returns {boolean} true si se canceló correctamente
   * @throws {Error} si el sorteo no existe o no se puede cancelar
   */
  static async cancelLottery(lotteryId) {
    const connection = await connect.getConnection();
    try {
      await connection.beginTransaction();

      // Verificar que el sorteo existe y está pendiente
      const [lottery] = await connection.query(`
        SELECT * FROM parking_lotteries
        WHERE lottery_id = ?
        AND status_id = (SELECT status_id FROM statuses WHERE name = 'Pendiente' LIMIT 1)
      `, [lotteryId]);

      if (!lottery.length) {
        throw new Error('El sorteo no existe o no está en estado pendiente');
      }

      // Actualizar estado del sorteo a cancelado
      await connection.query(`
        UPDATE parking_lotteries
        SET status_id = (SELECT status_id FROM statuses WHERE name = 'Cancelado' LIMIT 1)
        WHERE lottery_id = ?
      `, [lotteryId]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Obtener el historial de sorteos con paginación.
   * 
   * @param {Object} options - Opciones de paginación
   * @param {number} options.page - Número de página (1 en adelante)
   * @param {number} options.limit - Cantidad de registros por página
   * @returns {Object} Resultado paginado de sorteos
   */
  static async getLotteryHistory({ page = 1, limit = 10 }) {
    try {
      const offset = (page - 1) * limit;
      
      // Obtener total de registros
      const [countResult] = await connect.query(
        'SELECT COUNT(*) as total FROM parking_lotteries'
      );
      const total = countResult[0].total;

      // Obtener sorteos paginados
      const sqlQuery = `
        SELECT pl.*, 
               pz.name as zone_name,
               s.name as status_name,
               COUNT(lp.participant_id) as total_participants,
               COUNT(pa.parking_assignment_id) as total_assignments
        FROM parking_lotteries pl
        LEFT JOIN parking_zones pz ON pl.parking_zone_id = pz.parking_zone_id
        LEFT JOIN statuses s ON pl.status_id = s.status_id
        LEFT JOIN lottery_participants lp ON pl.lottery_id = lp.lottery_id
        LEFT JOIN parking_assignments pa ON pl.lottery_id = pa.lottery_id
        GROUP BY pl.lottery_id
        ORDER BY pl.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [results] = await connect.query(sqlQuery, [limit, offset]);

      return {
        data: results,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error('Error al obtener historial de sorteos:', error);
      throw error;
    }
  }

  /**
   * Notifica a los ganadores del sorteo.
   * 
   * @param {number} lotteryId - ID del sorteo
   * @returns {boolean} true si las notificaciones se enviaron correctamente
   */
  static async notifyWinners(lotteryId) {
    const connection = await connect.getConnection();
    try {
      await connection.beginTransaction();

      // Obtener ganadores del sorteo
      const [winners] = await connection.query(`
        SELECT pa.*,
               prof.email,
               prof.full_name,
               p.name as property_name,
               ps.code as slot_code
        FROM parking_assignments pa
        JOIN users u ON pa.user_id = u.user_id
        LEFT JOIN profiles prof ON u.user_id = prof.user_id
        JOIN properties p ON pa.property_id = p.property_id
        JOIN parking_slots ps ON pa.parking_slot_id = ps.parking_slot_id
        WHERE pa.lottery_id = ?
      `, [lotteryId]);

      // Crear notificaciones para cada ganador
      for (const winner of winners) {
        await connection.query(`
          INSERT INTO notifications (
            user_id,
            title,
            message,
            notification_type_id,
            priority,
            status_id
          ) VALUES (
            ?,
            'Asignación de Parqueadero',
            ?,
            (SELECT notification_type_id FROM notification_types WHERE name = 'Sorteo' LIMIT 1),
            2,
            (SELECT status_id FROM statuses WHERE name = 'No_leido' LIMIT 1)
          )
        `, [
          winner.user_id,
          `Se le ha asignado el espacio de parqueo ${winner.slot_code} 
           desde ${winner.start_time} hasta ${winner.end_time}`
        ]);
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default ParkingLotteryModel;
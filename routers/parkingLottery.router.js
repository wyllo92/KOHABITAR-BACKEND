import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import ParkingLotteryController from '../controllers/parkingLottery.controller.js';

/**
 * Router para gestionar los sorteos de espacios de parqueo.
 * Definir las rutas HTTP para crear, participar y ejecutar sorteos
 * de asignación de espacios de parqueo.
 */
const router = Router();
const baseRoute = '/parking-lotteries';

/**
 * POST /parking-lotteries
 * Crear un nuevo sorteo de espacios de parqueo
 * 
 * Ejemplo de body:
 * {
 *    "start_date": "2025-11-01T00:00:00Z",
 *    "end_date": "2026-10-31T23:59:59Z",
 *    "parking_zone_id": 1
 * }
 * 
 * GET /parking-lotteries
 * Obtener la lista de todos los sorteos con su información
 */
router.route(baseRoute)
    .post(verifyToken, ParkingLotteryController.createLottery)
    .get(verifyToken, ParkingLotteryController.getAllLotteries);

/**
 * POST /parking-lotteries/:lottery_id/participants
 * Registrar un participante en el sorteo
 * 
 * Ejemplo de body:
 * {
 *    "user_id": 1,
 *    "property_id": 1
 * }
 * 
 * GET /parking-lotteries/:lottery_id/participants
 * Obtener la lista de participantes de un sorteo específico
 */
router.route(`${baseRoute}/:lottery_id/participants`)
    .post(verifyToken, ParkingLotteryController.registerParticipant)
    .get(verifyToken, ParkingLotteryController.getLotteryParticipants);

/**
 * POST /parking-lotteries/:lottery_id/execute
 * Ejecuta el sorteo y asigna los espacios
 * No requiere body, realiza el sorteo aleatorio
 * entre los participantes registrados
 */
router.post(
    `${baseRoute}/:lottery_id/execute`,
    verifyToken,
    ParkingLotteryController.executeLottery
);

/**
 * DELETE /parking-lotteries/:lottery_id/cancel
 * Cancela un sorteo existente
 * Solo disponible para sorteos en estado pendiente
 */
router.delete(
    `${baseRoute}/:lottery_id/cancel`,
    verifyToken,
    ParkingLotteryController.cancelLottery
);

/**
 * GET /parking-lotteries/history
 * Obtener el historial de sorteos con paginación
 * Query params:
 * - page: número de página (default: 1)
 * - limit: registros por página (default: 10)
 */
router.get(
    `${baseRoute}/history`,
    verifyToken,
    ParkingLotteryController.getLotteryHistory
);

/**
 * GET /parking-lotteries/:lottery_id/results
 * Obtener los resultados de un sorteo específico
 * Muestra ganadores y participantes que no ganaron
 */
router.get(
    `${baseRoute}/:lottery_id/results`,
    verifyToken,
    ParkingLotteryController.getLotteryResults
);

/**
 * GET /parking-lotteries/:lottery_id/check-availability
 * Verificar si el sorteo se puede ejecutar
 * Muestra información sobre espacios disponibles, participantes,
 * y posibles problemas antes de ejecutar el sorteo
 */
router.get(
    `${baseRoute}/:lottery_id/check-availability`,
    verifyToken,
    ParkingLotteryController.checkAvailability
);

export default router;


/**
- Tabla para los sorteos de parqueo
CREATE TABLE IF NOT EXISTS parking_lotteries (
    lottery_id INT PRIMARY KEY AUTO_INCREMENT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    parking_zone_id INT NOT NULL,
    status_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parking_zone_id) REFERENCES parking_zones(parking_zone_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id)
);

-- Tabla para los participantes del sorteo
CREATE TABLE IF NOT EXISTS lottery_participants (
    participant_id INT PRIMARY KEY AUTO_INCREMENT,
    lottery_id INT NOT NULL,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lottery_id) REFERENCES parking_lotteries(lottery_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id),
    -- Un usuario solo puede participar una vez por sorteo con la misma propiedad
    UNIQUE KEY unique_participation (lottery_id, user_id, property_id)
);

-- Insertar estado para los sorteos
INSERT IGNORE INTO statuses (name, description, type) 
VALUES 
('pendiente', 'Sorteo pendiente de ejecución', 'parking_lottery'),
('completado', 'Sorteo ejecutado exitosamente', 'parking_lottery');
*/

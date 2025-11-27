import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Para obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbName = process.env.DB_NAME || "conjunto_residencial";

const sqlStatements = [

  // Preparación inicial

  `CREATE DATABASE IF NOT EXISTS conjunto_residencial`,

  // Eliminar todas las tablas si existen (para reiniciar la migración)
  `SET FOREIGN_KEY_CHECKS = 0;`,
  `DROP TABLE IF EXISTS visitors;`,
  `DROP TABLE IF EXISTS modules;`,
  `DROP TABLE IF EXISTS reports;`,
  `DROP TABLE IF EXISTS report_types;`,
  `DROP TABLE IF EXISTS user_properties;`,
  `DROP TABLE IF EXISTS packages;`,
  `DROP TABLE IF EXISTS notifications;`,
  `DROP TABLE IF EXISTS notification_types;`,
  `DROP TABLE IF EXISTS payments;`,
  `DROP TABLE IF EXISTS parking_assignments;`,
  `DROP TABLE IF EXISTS reservations;`,
  `DROP TABLE IF EXISTS invoices;`,
  `DROP TABLE IF EXISTS vehicles;`,
  `DROP TABLE IF EXISTS parking_slots;`,
  `DROP TABLE IF EXISTS parking_zones;`,
  `DROP TABLE IF EXISTS amenities;`,
  `DROP TABLE IF EXISTS amenity_types;`,
  `DROP TABLE IF EXISTS tariffs;`,
  `DROP TABLE IF EXISTS properties;`,
  `DROP TABLE IF EXISTS property_types;`,
  `DROP TABLE IF EXISTS cpcgs;`,
  `DROP TABLE IF EXISTS cpcg_types;`,
  `DROP TABLE IF EXISTS profiles;`,
  `DROP TABLE IF EXISTS users;`,
  `DROP TABLE IF EXISTS roles;`,
  `DROP TABLE IF EXISTS statuses;`,
  `DROP TABLE IF EXISTS parking_lotteries;`,
  `DROP TABLE IF EXISTS lottery_participants;`,
  `SET FOREIGN_KEY_CHECKS = 1;`,

  // Estados: valores de estado reutilizables en todo el sistema (activo/inactivo/pendiente/etc.)
  `CREATE TABLE IF NOT EXISTS statuses (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    entity VARCHAR(50) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_status_name_entity (name, entity)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Roles: define roles de usuario (administrador de conjunto, residente, propietario, vigilante)
  `CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    status_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_role_name (name),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Usuarios: autenticación y asignación de roles
  `CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(512) NOT NULL,
    role_id INT NOT NULL,
    status_id INT NOT NULL,
    last_login DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_username (username),
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Perfiles: información personal vinculada 1:1 a un usuario
  `CREATE TABLE IF NOT EXISTS profiles (
    user_id INT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    email VARCHAR(150) DEFAULT NULL,
    profile_photo VARCHAR(512) DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_email (email),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Tokens de recuperación de contraseña
  // Almacena tokens temporales para restablecer contraseñas
  `CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Usuario que solicita el restablecimiento',
    token VARCHAR(255) NOT NULL COMMENT 'Token único generado para validar el restablecimiento',
    expires_at DATETIME NOT NULL COMMENT 'Fecha y hora de expiración del token (válido por 1 hora)',
    used TINYINT(1) DEFAULT 0 COMMENT 'Indica si el token ya fue utilizado (0=no usado, 1=usado)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del token',
    UNIQUE KEY uq_token (token),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_token_expires (token, expires_at),
    INDEX idx_user_created (user_id, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tokens temporales para restablecimiento de contraseña';`,

  // PROPIEDADES Y ZONAS COMUNES

  // Tipos de propiedades: casa, apartamento, etc.
  `CREATE TABLE IF NOT EXISTS property_types (
    property_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Propiedades: cada unidad residencial
  `CREATE TABLE IF NOT EXISTS properties (
    property_id INT AUTO_INCREMENT PRIMARY KEY,
    property_type_id INT,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    status_id INT DEFAULT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_type_id) REFERENCES property_types(property_type_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Tipos de zonas comunes: recreativas, deportivas, sociales
  `CREATE TABLE IF NOT EXISTS amenity_types (
    amenity_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // ZONA DE PARQUEO

  // Tarifas: precios para reservas, estacionamiento, etc.
  `CREATE TABLE IF NOT EXISTS tariffs (
    tariff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    description VARCHAR(255),
    amount DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Zonas comunes: (salon comunal, Gimnasio, BBQ.) con imagenes
  `CREATE TABLE IF NOT EXISTS amenities (
    amenity_id INT AUTO_INCREMENT PRIMARY KEY,
    amenity_type_id INT,
    status_id INT,
    tariff_id INT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    capacity INT,
    amenity_photo VARCHAR(512) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (amenity_type_id) REFERENCES amenity_types(amenity_type_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id),
    FOREIGN KEY (tariff_id) REFERENCES tariffs(tariff_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Zona de parqueo: áreas (parqueaderos visitantes, parqueaderos residentes)
  `CREATE TABLE IF NOT EXISTS parking_zones (
    parking_zone_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(50),
    capacity INT,
    status_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES statuses(status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Islas de estacionamiento: espacios individuales
  `CREATE TABLE IF NOT EXISTS parking_slots (
    parking_slot_id INT AUTO_INCREMENT PRIMARY KEY,
    parking_zone_id INT NOT NULL,
    code VARCHAR(100) NOT NULL,
    is_reserved TINYINT(1) DEFAULT 0,
    status_id INT,
    tariff_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parking_zone_id) REFERENCES parking_zones(parking_zone_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id),
    FOREIGN KEY (tariff_id) REFERENCES tariffs(tariff_id),
    UNIQUE KEY uq_zone_code (parking_zone_id, code)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Sorteos de espacios de parqueo
  `CREATE TABLE IF NOT EXISTS parking_lotteries (
    lottery_id INT PRIMARY KEY AUTO_INCREMENT,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    parking_zone_id INT NOT NULL,
    available_slots INT DEFAULT 10,
    status_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(parking_zone_id) REFERENCES parking_zones(parking_zone_id),
    FOREIGN KEY(status_id) REFERENCES statuses(status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  // Participantes del sorteo
  `CREATE TABLE IF NOT EXISTS lottery_participants (
    participant_id INT PRIMARY KEY AUTO_INCREMENT,
    lottery_id INT NOT NULL,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(lottery_id) REFERENCES parking_lotteries(lottery_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(property_id) REFERENCES properties(property_id),
    UNIQUE KEY unique_participation(lottery_id, user_id, property_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // Vehículos: vehículos residenciales con fotos
    `CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT,
    parking_zone_id INT,
    model VARCHAR(150),
    type VARCHAR(100),
    color VARCHAR(50),
    license_plate VARCHAR(50) NOT NULL,
    vehicle_photo VARCHAR(512) DEFAULT NULL,
    status_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id),
    FOREIGN KEY (parking_zone_id) REFERENCES parking_zones(parking_zone_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id),
    UNIQUE KEY uq_license_plate (license_plate)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // PAGOS Y FINANZAS

    // Facturas: cargos por propiedades o servicios
    `CREATE TABLE IF NOT EXISTS invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT,
    tariff_id INT,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATETIME,
    status_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id),
    FOREIGN KEY (tariff_id) REFERENCES tariffs(tariff_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // Reservaciones: reservas para zonas comunes
    `CREATE TABLE IF NOT EXISTS reservations (
    reservation_id INT AUTO_INCREMENT PRIMARY KEY,
    amenity_id INT NOT NULL,
    user_id INT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    capacity INT,
    status_id INT,
    tariff_id INT,
    FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id),
    FOREIGN KEY (tariff_id) REFERENCES tariffs(tariff_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // Asignaciones de estacionamiento: asignar espacios a usuarios/vehículos
    `CREATE TABLE IF NOT EXISTS parking_assignments (
    parking_assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    parking_slot_id INT NOT NULL COMMENT 'Espacio de parqueo asignado',
    user_id INT NOT NULL COMMENT 'Usuario que recibe la asignación',
    property_id INT COMMENT 'Propiedad asociada (requerido para sorteos)',
    vehicle_id INT COMMENT 'Vehículo asociado (opcional)',
    start_time DATETIME COMMENT 'Inicio de la asignación',
    end_time DATETIME COMMENT 'Fin de la asignación',
    total_amount DECIMAL(12,2) COMMENT 'Monto total a pagar (si aplica)',
    status_id INT COMMENT 'Estado de la asignación: Activo, Inactivo, Vencido',
    lottery_id INT COMMENT 'ID del sorteo (NULL si es asignación manual)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parking_slot_id) REFERENCES parking_slots(parking_slot_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id),
    FOREIGN KEY (lottery_id) REFERENCES parking_lotteries(lottery_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // Pagos: pagos realizados: facturas, reservaciones, estacionamiento
    `CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(100),
    reference VARCHAR(255),
    invoice_id INT,
    reservation_id INT,
    parking_assignment_id INT,
    status_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(reservation_id),
    FOREIGN KEY (parking_assignment_id) REFERENCES parking_assignments(parking_assignment_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // COMUNICACIONES: Notificaciones, Paquetes, Visitantes, PRQS

    `CREATE TABLE IF NOT EXISTS notification_types (
    notification_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // Notificaciones: alertas para usuarios (mantenimiento, eventos, etc.)
    `CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT,
    notification_type_id INT,
    title VARCHAR(255),
    message TEXT,
    priority INT,
    status_id INT,
    read_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id),
    FOREIGN KEY (notification_type_id) REFERENCES notification_types(notification_type_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // Paquetes: entregas a residentes
    `CREATE TABLE IF NOT EXISTS packages (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(500),
    recipient_user_id INT,
    property_id INT,
    entry_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    exit_at DATETIME,
    status_id INT,
    FOREIGN KEY (recipient_user_id) REFERENCES users(user_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // Tipos PRQS: peticiones, queja, reclamo, sugerencia
    `CREATE TABLE IF NOT EXISTS cpcg_types (
    cpcg_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // PRQS: Peticiones, Quejas, Reclamos y Sugerencias
    `CREATE TABLE IF NOT EXISTS cpcgs (
    cpcg_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'Usuario que crea el PQRS',
    property_id INT,
    cpcg_type_id INT NOT NULL,
    description TEXT COMMENT 'Descripción del problema o solicitud',
    status_id INT,
    admin_response TEXT DEFAULT NULL COMMENT 'Respuesta del administrador',
    responded_by INT DEFAULT NULL COMMENT 'ID del administrador que respondió',
    responded_at DATETIME DEFAULT NULL COMMENT 'Fecha y hora de la respuesta',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id),
    FOREIGN KEY (cpcg_type_id) REFERENCES cpcg_types(cpcg_type_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id),
    FOREIGN KEY (responded_by) REFERENCES users(user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // Visitantes: registro de visitantes
    `CREATE TABLE IF NOT EXISTS visitors (
    visitor_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(200),
    id_document VARCHAR(200),
    visit_reason VARCHAR(500),
    entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    exit_time DATETIME,
    authorized_user_id INT,
    property_id INT,
    vehicle_id INT,
    parking_slot_id INT,
    status_id INT,
    FOREIGN KEY (authorized_user_id) REFERENCES users(user_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
    FOREIGN KEY (parking_slot_id) REFERENCES parking_slots(parking_slot_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // REPORTES DEL SISTEMA

    `CREATE TABLE IF NOT EXISTS report_types (
    report_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // Reportes: compila información a través de módulos (pagos, reservaciones, etc.)
    `CREATE TABLE IF NOT EXISTS reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    report_type_id INT,
    related_entity_type VARCHAR(100),
    related_entity_id INT,
    title VARCHAR(255),
    description TEXT,
    file_url VARCHAR(512),
    export_format ENUM('PDF', 'EXCEL', 'CSV', 'JSON') DEFAULT 'PDF',
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (report_type_id) REFERENCES report_types(report_type_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // PERMISOS (Roles, Modules)
    `CREATE TABLE IF NOT EXISTS modules (
    module_id INT AUTO_INCREMENT PRIMARY KEY,
    route VARCHAR(255) NOT NULL,
    description VARCHAR(255)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,


    // Relación entre usuarios y propiedades (residentes/propietarios)
    `CREATE TABLE IF NOT EXISTS user_properties (
    user_property_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    is_owner TINYINT(1) DEFAULT 0,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME DEFAULT NULL,
    status_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_property (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id),
    FOREIGN KEY (status_id) REFERENCES statuses(status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    // STORED PROCEDURES 

    // Obtener disponibilidad de estacionamiento por zona
    `DROP PROCEDURE IF EXISTS sp_get_parking_availability;`,
    `CREATE PROCEDURE sp_get_parking_availability (IN in_zone_id INT)
  BEGIN
    SELECT
      pz.parking_zone_id,
      pz.name AS zone_name,
      pz.type AS zone_type,
      pz.capacity,
      COUNT(*) as total_spaces,
      SUM(CASE WHEN s.name = 'Disponible' THEN 1 ELSE 0 END) as available_spaces,
      SUM(CASE WHEN s.name = 'Ocupado' THEN 1 ELSE 0 END) as occupied_spaces
    FROM parking_zones pz
    LEFT JOIN parking_slots ps ON pz.parking_zone_id = ps.parking_zone_id
    LEFT JOIN statuses s ON ps.status_id = s.status_id
    WHERE pz.parking_zone_id = in_zone_id
    GROUP BY pz.parking_zone_id, pz.name, pz.type, pz.capacity;
  END;`,

    // Obtener las reservaciones de un usuario
    `DROP PROCEDURE IF EXISTS sp_get_user_reservations;`,
    `CREATE PROCEDURE sp_get_user_reservations (IN in_user_id INT)
  BEGIN
    SELECT r.reservation_id,
           a.name AS amenity_name,
           r.start_time,
           r.end_time,
           r.capacity,
           s.name AS status_name
    FROM reservations r
    JOIN amenities a ON r.amenity_id = a.amenity_id
    LEFT JOIN statuses s ON r.status_id = s.status_id
    WHERE r.user_id = in_user_id
    ORDER BY r.start_time DESC;
  END;`,

    // Obtener a los residentes de una propiedad
    `DROP PROCEDURE IF EXISTS sp_get_property_residents;`,
    `CREATE PROCEDURE sp_get_property_residents (IN in_property_id INT)
  BEGIN
    SELECT u.user_id,
           p.full_name,
           p.phone,
           p.email,
           r.name AS role_name
    FROM user_properties up
    JOIN users u ON up.user_id = u.user_id
    LEFT JOIN profiles p ON u.user_id = p.user_id
    LEFT JOIN roles r ON u.role_id = r.role_id
    WHERE up.property_id = in_property_id
      AND (up.status_id IS NULL OR up.status_id = (
        SELECT status_id FROM statuses WHERE name = 'Activo' LIMIT 1
      ));
  END;`,

    // Obtener pagos pendientes de un usuario
    `DROP PROCEDURE IF EXISTS sp_get_pending_payments;`,
    `CREATE PROCEDURE sp_get_pending_payments (IN in_user_id INT)
  BEGIN
    SELECT i.invoice_id,
           i.amount,
           i.due_date,
           i.description,
           t.name AS tariff_name,
           s.name AS status_name
    FROM invoices i
    JOIN tariffs t ON i.tariff_id = t.tariff_id
    LEFT JOIN statuses s ON i.status_id = s.status_id
    WHERE i.user_id = in_user_id
      AND (s.name = 'Pendiente' OR i.status_id IS NULL)
    ORDER BY i.due_date ASC;
  END;`,
];

// Función para leer y preparar los datos de prueba desde TestDatos.sql
function getTestDataStatements() {
  try {
    // Ruta al archivo TestDatos.sql
    const testDataPath = path.join(__dirname, '..', 'db', 'TestDatos.sql');

    // Leer el archivo SQL
    const sqlContent = fs.readFileSync(testDataPath, 'utf8');

    // Dividir el contenido en líneas
    const lines = sqlContent.split('\n');

    // Filtrar comentarios, líneas vacías y comandos que no necesitamos
    const statements = [];
    let currentStatement = '';

    for (let line of lines) {
      // Ignorar comentarios y líneas vacías
      if (line.trim().startsWith('--') || line.trim() === '') {
        continue;
      }

      // Ignorar líneas que no queremos ejecutar en la migración
      if (line.trim().startsWith('USE conjunto_residencial') ||
          line.trim().startsWith('SELECT \'===') ||
          line.trim().startsWith('SELECT \'=') ||
          line.includes('AS \'\'')) {
        continue;
      }

      // Acumular líneas hasta encontrar un punto y coma
      currentStatement += line + '\n';

      // Si la línea termina con punto y coma, es el final del statement
      if (line.trim().endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }

    return statements;
  } catch (error) {
    console.log('Advertencia: No se pudo cargar TestDatos.sql:', error.message);
    console.log('Continuando sin datos de prueba...');
    return [];
  }
}

// Función principal para ejecutar la migración

async function runMigration() {
  let connection;
  try {

    //Primera conexión sin base de datos para crearla

    const tempConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true,
    }

    connection = await mysql.createConnection(tempConfig);

    // Crear base de datos
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);

    // Cambiar a la base de datos creada
    await connection.query (`USE ${dbName}`);

    // Empezar la transacción para operaciones atómicas
    await connection.query("START TRANSACTION");

    // Ejecutar las declaraciones de creación de tablas
    for (const stmt of sqlStatements) {
      if (stmt.trim()) {
        await connection.query(stmt);
      }
    }

    console.log("Tablas creadas exitosamente");

    // Cargar y ejecutar datos de prueba desde TestDatos.sql
    const testDataStatements = getTestDataStatements();

    if (testDataStatements.length > 0) {
      console.log(`Insertando datos de prueba (${testDataStatements.length} statements)...`);

      for (const stmt of testDataStatements) {
        if (stmt.trim()) {
          try {
            await connection.query(stmt);
          } catch (error) {
            // Mostrar advertencia pero continuar con otros datos
            console.warn('Advertencia al insertar datos:', error.message);
          }
        }
      }

      console.log("Datos de prueba insertados exitosamente");
    }

    //Hacer commit si todas las declaraciones tienen éxito
    await connection.query('COMMIT');

    console.log("Migración completada con éxito");
    return { success: true };
  } catch (error) {
    // Hacer rollback en caso de error
    if (connection) {
      await connection.query('ROLLBACK');
    }
    console.error("Migración fallida:", error);
    return { success: false, error: error.message };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exportar la función para uso externo
export { runMigration };

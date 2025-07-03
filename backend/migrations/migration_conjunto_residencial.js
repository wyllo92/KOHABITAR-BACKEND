import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();
// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'conjunto_residencial',
  multipleStatements: true
};

// Array de statements SQL extraídos de conjunto_residencial.sql
const sqlStatements = [
  // SETUP INICIAL
  `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";`,
  `SET time_zone = "+00:00";`,

  // 1. CREACIÓN DE TABLAS
  // --- Amenity ---
  `CREATE TABLE IF NOT EXISTS amenity (
    amenity_id int(11) NOT NULL AUTO_INCREMENT,
    name varchar(25) NOT NULL,
    capacity int(11) DEFAULT NULL,
    description varchar(500) DEFAULT NULL,
    time_unit int(10) DEFAULT NULL,
    total double DEFAULT NULL,
    status_id int(11) DEFAULT NULL,
    tariff_id int(11) DEFAULT NULL,
    property_id int(11) DEFAULT NULL,
    amenity_type_id int(11) DEFAULT NULL,
    created_at date DEFAULT NULL,
    updated_at date DEFAULT NULL,
    PRIMARY KEY (amenity_id),
    KEY status_id (status_id),
    KEY tariff_id (tariff_id),
    KEY property_id (property_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // --- Amenity Type ---
  `CREATE TABLE IF NOT EXISTS amenity_type (
    Amenity_Type_id int(11) NOT NULL AUTO_INCREMENT,
    Amenity_Type_name varchar(11) NOT NULL,
    Amenity_Type_description varchar(100) NOT NULL,
    Amenity_Type_is_active tinyint(1) NOT NULL DEFAULT 1,
    Amenity_Type_created_at datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (Amenity_Type_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // --- CPCG ---
  `CREATE TABLE IF NOT EXISTS cpcg (
    CPCG_id int(11) NOT NULL AUTO_INCREMENT,
    User_id int(11) NOT NULL,
    Property_id int(11) NOT NULL,
    CPCG_type_id int(11) NOT NULL,
    CPCG_description varchar(100) NOT NULL,
    Status_id int(11) NOT NULL,
    CPCG_createAt datetime NOT NULL DEFAULT current_timestamp(),
    CPCG_updateAt datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (CPCG_id),
    KEY User_id (User_id),
    KEY Property_id (Property_id),
    KEY CPCG_type_id (CPCG_type_id),
    KEY Status_id (Status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // --- CPCG Type ---
  `CREATE TABLE IF NOT EXISTS cpcg_type (
    CPCG_type_id int(11) NOT NULL AUTO_INCREMENT,
    CPCG_type_name varchar(11) NOT NULL,
    CPCG_type_description varchar(100) DEFAULT NULL,
    CPCG_type_is_active tinyint(1) NOT NULL DEFAULT 1,
    CPCG_type_created_at datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (CPCG_type_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // --- Invoice ---
  `CREATE TABLE IF NOT EXISTS invoice (
    invoice_id int(11) NOT NULL AUTO_INCREMENT,
    user_id int(11) NOT NULL,
    property_id int(11) NOT NULL,
    tariff_id int(11) NOT NULL,
    date datetime NOT NULL DEFAULT current_timestamp(),
    due_date datetime NOT NULL DEFAULT current_timestamp(),
    amount decimal(10,2) NOT NULL,
    status_id int(11) NOT NULL,
    description varchar(100) DEFAULT NULL,
    created_at datetime DEFAULT current_timestamp(),
    updated_at datetime DEFAULT current_timestamp(),
    PRIMARY KEY (invoice_id),
    KEY user_id (user_id),
    KEY property_id (property_id),
    KEY tariff_id (tariff_id),
    KEY status_id (status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // --- Module ---
  `CREATE TABLE IF NOT EXISTS module (
    module_id int(11) NOT NULL AUTO_INCREMENT,
    module_route varchar(30) NOT NULL,
    module_description varchar(100) DEFAULT NULL,
    PRIMARY KEY (module_id),
    UNIQUE KEY module_route (module_route)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // --- Module Role ---
  `CREATE TABLE IF NOT EXISTS module_role (
    module_role_id int(11) NOT NULL AUTO_INCREMENT,
    module_id int(11) NOT NULL,
    role_id int(11) NOT NULL,
    PRIMARY KEY (module_role_id),
    KEY module_id (module_id),
    KEY role_id (role_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // --- Notification ---
  `CREATE TABLE IF NOT EXISTS notification (
    Notification_id int(11) NOT NULL AUTO_INCREMENT,
    User_id int(11) NOT NULL,
    Property_id int(11) NOT NULL,
    Notification_type_id int(11) NOT NULL,
    Notification_title varchar(100) NOT NULL,
    Notification_message varchar(500) NOT NULL,
    Status_id int(11) NOT NULL,
    Notification_priority int(11) NOT NULL,
    Notification_createAt datetime NOT NULL DEFAULT current_timestamp(),
    Notification_updateAt datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Notification_id),
    KEY User_id (User_id),
    KEY Property_id (Property_id),
    KEY Notification_type_id (Notification_type_id),
    KEY Status_id (Status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // --- Notification Type ---
  `CREATE TABLE IF NOT EXISTS notification_type (
    Notification_type_id int(11) NOT NULL AUTO_INCREMENT,
    Notification_type_name varchar(11) NOT NULL,
    Notification_type_description varchar(100) NOT NULL,
    Notification_type_is_active tinyint(1) NOT NULL DEFAULT 1,
    Notification_type_created_at datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (Notification_type_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // --- Package ---
  `CREATE TABLE IF NOT EXISTS package (
    Package_id int(11) NOT NULL AUTO_INCREMENT,
    Package_description varchar(100) DEFAULT NULL,
    Status_id int(11) NOT NULL,
    User_id int(11) NOT NULL,
    Property_id int(11) NOT NULL,
    Package_entryAt datetime NOT NULL DEFAULT current_timestamp(),
    Package_exitAt datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (Package_id),
    KEY Status_id (Status_id),
    KEY User_id (User_id),
    KEY Property_id (Property_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // --- Parkingslot ---
  `CREATE TABLE IF NOT EXISTS parkingslot (
    parkingSlot_id int(11) NOT NULL AUTO_INCREMENT,
    code varchar(20) NOT NULL,
    parkingZone_id int(11) NOT NULL,
    status_id int(11) NOT NULL,
    is_reserved tinyint(1) DEFAULT 0,
    time_unit int(10) DEFAULT NULL,
    total double DEFAULT NULL,
    tariff_id int(11) DEFAULT NULL,
    created_at datetime DEFAULT NULL,
    updated_at datetime DEFAULT NULL,
    PRIMARY KEY (parkingSlot_id),
    KEY parkingZone_id (parkingZone_id),
    KEY status_id (status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // 2. DESACTIVAR CLAVES FORÁNEAS Y TRUNCAR TABLAS
  `SET FOREIGN_KEY_CHECKS = 0;`,
  `TRUNCATE TABLE parkingslot;`,
  `TRUNCATE TABLE parkingzone;`,
  `TRUNCATE TABLE property;`,
  `TRUNCATE TABLE role;`,
  `TRUNCATE TABLE status;`,
  `TRUNCATE TABLE tariff;`,
  `TRUNCATE TABLE user;`,
  `TRUNCATE TABLE profile;`,
  `TRUNCATE TABLE vehicle;`,
  `SET FOREIGN_KEY_CHECKS = 1;`,

  // 3. INSERTS DE DATOS INICIALES (ORDENADOS POR DEPENDENCIAS)
  // Primero las tablas referenciadas
  `INSERT INTO status (status_id, status_name, status_description, status_entity, status_is_active, status_created_at) VALUES
    (1, 'Activo', 'Estado activo', 'General', 1, '2025-05-27 16:14:45'),
    (2, 'Inactivo', 'Estado inactivo', 'General', 1, '2025-05-27 16:14:45'),
    (3, 'Pendiente', 'Estado pendiente', 'General', 1, '2025-05-27 16:14:45');`,
  `INSERT INTO tariff (tariff_id, type, description, amount, surcharge_amount, surcharge_status, due_date, status_id, created_at, updated_at) VALUES
    (1, 'Fija', 'Tarifa mensual', 50000, NULL, NULL, NULL, 1, '2025-05-27 16:17:01', '2025-05-27 16:17:01'),
    (2, 'Por hora', 'Visitantes', 2000, NULL, NULL, NULL, 1, '2025-05-27 16:17:01', '2025-05-27 16:17:01');`,
  `INSERT INTO property (property_id, property_name, property_description, property_type, property_createAt, property_updateAt) VALUES
    (1, 'Apto 101', 'Apartamento en primer piso', 'Apartamento', '2025-05-27', '2025-05-27'),
    (2, 'Casa 10', 'Casa independiente', 'Casa', '2025-05-27', '2025-05-27');`,
  `INSERT INTO parkingzone (parkingZone_id, type, capacity, property_id, status_id) VALUES
    (1, 1, '10', 1, 1),
    (2, 2, '5', 2, 1);`,
  `INSERT INTO role (role_id, role_name, role_description, status_id, role_createAt) VALUES
    (1, 'Administrador', 'Gestiona el sistema', 1, '2025-05-27 16:14:55'),
    (2, 'Residente', 'Vive en el conjunto', 1, '2025-05-27 16:14:55'),
    (3, 'Propietario', 'Dueño de una propiedad', 1, '2025-05-27 16:14:55'),
    (4, 'Vigilante', 'Controla el ingreso', 1, '2025-05-27 16:14:55');`,

  // Luego las tablas dependientes
  `INSERT INTO parkingslot (parkingSlot_id, code, parkingZone_id, status_id, is_reserved, time_unit, total, tariff_id, created_at, updated_at) VALUES
    (1, 'P-101', 1, 1, 0, NULL, NULL, NULL, NULL, NULL),
    (2, 'P-102', 1, 1, 0, NULL, NULL, NULL, NULL, NULL),
    (3, 'M-201', 2, 1, 0, NULL, NULL, NULL, NULL, NULL);`,
  `INSERT INTO user (user_id, user_name, user_password, role_id, status_id) VALUES
    (1, 'admin', 'admin123', 1, 1),
    (2, 'jresidente', 'residente123', 2, 1),
    (3, 'mpropietario', 'propietario123', 3, 1),
    (4, 'cvigilante', 'vigilante123', 4, 1);`,
  `INSERT INTO profile (user_id, profile_fullName, profile_phone, profile_email, profile_photo, profile_address) VALUES
    (1, 'Admin General', '3000000001', 'admin@example.com', NULL, 'Oficina'),
    (2, 'Juan Residente', '3000000002', 'juan@example.com', NULL, 'Apto 101'),
    (3, 'Maria Propietaria', '3000000003', 'maria@example.com', NULL, 'Casa 10'),
    (4, 'Carlos Vigilante', '3000000004', 'carlos@example.com', NULL, 'Portería');`,
  `INSERT INTO vehicle (vehicle_id, model, type, color, user_id, property_id, parkingZone_id, status_id, vehicle_createAt, vehicle_updateAt) VALUES
    (1, 'Mazda 3', 'Carro', 'Rojo', 2, 1, NULL, 1, '2025-05-27', '2025-05-27'),
    (2, 'Yamaha FZ', 'Moto', 'Negro', 3, 2, NULL, 1, '2025-05-27', '2025-05-27');`,
];

export async function runMigrationConjuntoResidencial() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Conectado a la base de datos MySQL');
    for (const sql of sqlStatements) {
      try {
        await connection.query(sql);
        console.log('Statement ejecutado correctamente');
      } catch (error) {
        console.error('Error ejecutando SQL:', error.message);
        throw error;
      }
    }
    console.log('¡Migración de conjunto_residencial completada!');
    return { success: true };
  } catch (error) {
    console.error('Migración fallida:', error);
    return { success: false, error };
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión cerrada');
    }
  }
} 
import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'conjunto_residencial2',
  multipleStatements: true
};

// SQL statements for table creation
const sqlStatements = [
  // Drop tables in reverse order of creation (to avoid foreign key constraints)
  `DROP TABLE IF EXISTS visitor;`,
  `DROP TABLE IF EXISTS vehicle;`,
  `DROP TABLE IF EXISTS user_property;`,
  `DROP TABLE IF EXISTS parking_assignment;`,
  `DROP TABLE IF EXISTS payment;`,
  `DROP TABLE IF EXISTS package;`,
  `DROP TABLE IF EXISTS notification;`,
  `DROP TABLE IF EXISTS cpcg;`,
  `DROP TABLE IF EXISTS report;`,
  `DROP TABLE IF EXISTS reservation;`,
  `DROP TABLE IF EXISTS invoice;`,
  `DROP TABLE IF EXISTS parkingslot;`,
  `DROP TABLE IF EXISTS parkingzone;`,
  `DROP TABLE IF EXISTS amenity;`,
  `DROP TABLE IF EXISTS permissions_module_role;`,
  `DROP TABLE IF EXISTS module_role;`,
  `DROP TABLE IF EXISTS role_permissions;`,
  `DROP TABLE IF EXISTS profile;`,
  `DROP TABLE IF EXISTS user;`,
  `DROP TABLE IF EXISTS property;`,
  `DROP TABLE IF EXISTS tariff;`,
  `DROP TABLE IF EXISTS status;`,
  `DROP TABLE IF EXISTS role;`,
  `DROP TABLE IF EXISTS permissions;`,
  `DROP TABLE IF EXISTS module;`,
  `DROP TABLE IF EXISTS amenity_type;`,
  `DROP TABLE IF EXISTS cpcg_type;`,
  `DROP TABLE IF EXISTS notification_type;`,
  `DROP TABLE IF EXISTS report_type;`,

  // Create status table first (referenced by many tables)
  `CREATE TABLE IF NOT EXISTS status (
    status_id int(11) NOT NULL AUTO_INCREMENT,
    status_name varchar(30) NOT NULL,
    status_description varchar(100) DEFAULT NULL,
    status_entity varchar(50) NOT NULL,
    status_is_active tinyint(1) NOT NULL DEFAULT 1,
    status_created_at datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (status_id),
    INDEX idx_status_name (status_name),
    INDEX idx_status_entity (status_entity)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create role table
  `CREATE TABLE IF NOT EXISTS role (
    role_id int(11) NOT NULL AUTO_INCREMENT,
    role_name varchar(20) NOT NULL,
    role_description varchar(100) DEFAULT NULL,
    status_id int(11) NOT NULL,
    role_createAt datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (role_id),
    UNIQUE KEY role_name (role_name),
    KEY status_id (status_id),
    FOREIGN KEY (status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_role_name (role_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create property table
  `CREATE TABLE IF NOT EXISTS property (
    property_id int(11) NOT NULL AUTO_INCREMENT,
    property_name varchar(30) NOT NULL,
    property_description varchar(100) DEFAULT NULL,
    property_type varchar(25) NOT NULL,
    property_createAt date NOT NULL,
    property_updateAt date NOT NULL,
    status_id int(11) NOT NULL,
    PRIMARY KEY (property_id),
    UNIQUE KEY property_name (property_name),
    KEY status_id (status_id),
    FOREIGN KEY (status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_property_type (property_type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create user table
  `CREATE TABLE IF NOT EXISTS user (
    user_id int(11) NOT NULL AUTO_INCREMENT,
    user_name varchar(30) NOT NULL,
    user_password varchar(256) NOT NULL,
    role_id int(11) NOT NULL,
    status_id int(11) NOT NULL,
    last_login datetime DEFAULT NULL,
    created_at datetime DEFAULT current_timestamp(),
    updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (user_id),
    UNIQUE KEY user_name (user_name),
    KEY role_id (role_id),
    KEY status_id (status_id),
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_user_name (user_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create profile table
  `CREATE TABLE IF NOT EXISTS profile (
    user_id int(11) NOT NULL,
    profile_fullName varchar(50) NOT NULL,
    profile_phone varchar(10) NOT NULL,
    profile_email varchar(30) NOT NULL,
    profile_photo varchar(256) DEFAULT NULL,
    profile_address varchar(30) DEFAULT NULL,
    created_at datetime DEFAULT current_timestamp(),
    updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (user_id),
    UNIQUE KEY profile_email (profile_email),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_profile_email (profile_email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create tariff table
  `CREATE TABLE IF NOT EXISTS tariff (
    tariff_id int(11) NOT NULL AUTO_INCREMENT,
    type varchar(30) DEFAULT NULL,
    description varchar(100) DEFAULT NULL,
    amount double DEFAULT NULL,
    surcharge_amount double DEFAULT NULL,
    surcharge_status tinyint(1) DEFAULT NULL,
    due_date datetime DEFAULT NULL,
    status_id int(11) DEFAULT NULL,
    created_at datetime DEFAULT current_timestamp(),
    updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (tariff_id),
    KEY status_id (status_id),
    FOREIGN KEY (status_id) REFERENCES status(status_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_tariff_type (type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create amenity_type table
  `CREATE TABLE IF NOT EXISTS amenity_type (
    Amenity_Type_id int(11) NOT NULL AUTO_INCREMENT,
    Amenity_Type_name varchar(50) NOT NULL,
    Amenity_Type_description varchar(100) NOT NULL,
    Amenity_Type_is_active tinyint(1) NOT NULL DEFAULT 1,
    Amenity_Type_created_at datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (Amenity_Type_id),
    INDEX idx_amenity_type_name (Amenity_Type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create amenity table (SIN property_id, tariff_id, time_unit, total)
  `CREATE TABLE IF NOT EXISTS amenity (
    amenity_id int(11) NOT NULL AUTO_INCREMENT,
    name varchar(25) NOT NULL,
    capacity int(11) DEFAULT NULL,
    description varchar(500) DEFAULT NULL,
    status_id int(11) DEFAULT NULL,
    amenity_type_id int(11) DEFAULT NULL,
    created_at date DEFAULT NULL,
    updated_at date DEFAULT NULL,
    PRIMARY KEY (amenity_id),
    KEY status_id (status_id),
    KEY amenity_type_id (amenity_type_id),
    FOREIGN KEY (status_id) REFERENCES status(status_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (amenity_type_id) REFERENCES amenity_type(Amenity_Type_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_amenity_name (name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create parkingzone table
  `CREATE TABLE IF NOT EXISTS parkingzone (
    parkingZone_id int(11) NOT NULL AUTO_INCREMENT,
    type int(10) NOT NULL,
    capacity varchar(25) NOT NULL,
    property_id int(11) NOT NULL,
    status_id int(11) NOT NULL,
    created_at datetime DEFAULT current_timestamp(),
    updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (parkingZone_id),
    KEY property_id (property_id),
    KEY status_id (status_id),
    FOREIGN KEY (property_id) REFERENCES property(property_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_parkingzone_type (type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create parkingslot table
  `CREATE TABLE IF NOT EXISTS parkingslot (
    parkingSlot_id int(11) NOT NULL AUTO_INCREMENT,
    code varchar(20) NOT NULL,
    parkingZone_id int(11) NOT NULL,
    status_id int(11) NOT NULL,
    is_reserved tinyint(1) DEFAULT 0,
    time_unit int(10) DEFAULT NULL,
    total double DEFAULT NULL,
    tariff_id int(11) DEFAULT NULL,
    created_at datetime DEFAULT current_timestamp(),
    updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (parkingSlot_id),
    KEY parkingZone_id (parkingZone_id),
    KEY status_id (status_id),
    KEY tariff_id (tariff_id),
    FOREIGN KEY (parkingZone_id) REFERENCES parkingzone(parkingZone_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (tariff_id) REFERENCES tariff(tariff_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_parkingslot_code (code)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create vehicle table
  `CREATE TABLE IF NOT EXISTS vehicle (
    vehicle_id int(11) NOT NULL AUTO_INCREMENT,
    model varchar(30) NOT NULL,
    type varchar(25) NOT NULL,
    color varchar(25) NOT NULL,
    license_plate varchar(10) NOT NULL,
    user_id int(11) NOT NULL,
    property_id int(11) NOT NULL,
    parkingZone_id int(11) DEFAULT NULL,
    status_id int(11) NOT NULL,
    vehicle_createAt date NOT NULL,
    vehicle_updateAt date NOT NULL,
    PRIMARY KEY (vehicle_id),
    UNIQUE KEY license_plate (license_plate),
    KEY user_id (user_id),
    KEY property_id (property_id),
    KEY parkingZone_id (parkingZone_id),
    KEY status_id (status_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (property_id) REFERENCES property(property_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (parkingZone_id) REFERENCES parkingzone(parkingZone_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_vehicle_license (license_plate)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create invoice table
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
    updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (invoice_id),
    KEY user_id (user_id),
    KEY property_id (property_id),
    KEY tariff_id (tariff_id),
    KEY status_id (status_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (property_id) REFERENCES property(property_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tariff_id) REFERENCES tariff(tariff_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_invoice_date (date),
    INDEX idx_invoice_due_date (due_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create reservation table (SIN tariff_id y reservation_time_unit)
  `CREATE TABLE IF NOT EXISTS reservation (
    reservation_id int(11) NOT NULL AUTO_INCREMENT,
    amenity_id int(11) NOT NULL,
    user_id int(11) NOT NULL,
    status_id int(11) DEFAULT NULL,
    reservation_createAt datetime DEFAULT current_timestamp(),
    reservation_start_time datetime DEFAULT NULL,
    reservation_end_time datetime DEFAULT NULL,
    reservation_capacity int(11) DEFAULT NULL,
    PRIMARY KEY (reservation_id),
    KEY amenity_id (amenity_id),
    KEY user_id (user_id),
    KEY status_id (status_id),
    FOREIGN KEY (amenity_id) REFERENCES amenity(amenity_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (status_id) REFERENCES status(status_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_reservation_start_time (reservation_start_time),
    INDEX idx_reservation_end_time (reservation_end_time)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create parking_assignment table
  `CREATE TABLE IF NOT EXISTS parking_assignment (
    parking_Assignment_id int(11) NOT NULL AUTO_INCREMENT,
    parkingSlot_id int(11) NOT NULL,
    User_id int(11) NOT NULL,
    Vehicle_id int(11) NOT NULL,
    tariff_id int(11) NOT NULL,
    Status_id int(11) NOT NULL,
    parking_Assignment_start_time datetime NOT NULL,
    parking_Assignment_end_time datetime DEFAULT NULL,
    parking_Assignment_total_amount decimal(10,2) NOT NULL,
    parking_Assignment_created_at datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (parking_Assignment_id),
    KEY parkingSlot_id (parkingSlot_id),
    KEY User_id (User_id),
    KEY Vehicle_id (Vehicle_id),
    KEY tariff_id (tariff_id),
    KEY Status_id (Status_id),
    FOREIGN KEY (parkingSlot_id) REFERENCES parkingslot(parkingSlot_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (User_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tariff_id) REFERENCES tariff(tariff_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_parking_assignment_start_time (parking_Assignment_start_time)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create payment table
  `CREATE TABLE IF NOT EXISTS payment (
    payment_id int(11) NOT NULL AUTO_INCREMENT,
    user_id int(11) NOT NULL,
    amount_paid double NOT NULL,
    payment_date datetime NOT NULL,
    method varchar(50) DEFAULT NULL,
    reference varchar(100) DEFAULT NULL,
    invoice_id int(11) DEFAULT NULL,
    reservation_id int(11) DEFAULT NULL,
    parking_assignment_id int(11) DEFAULT NULL,
    status_id int(11) DEFAULT NULL,
    payment_type_id int(11) DEFAULT NULL,
    created_at datetime DEFAULT current_timestamp(),
    PRIMARY KEY (payment_id),
    KEY user_id (user_id),
    KEY invoice_id (invoice_id),
    KEY reservation_id (reservation_id),
    KEY parking_assignment_id (parking_assignment_id),
    KEY status_id (status_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES invoice(invoice_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (parking_assignment_id) REFERENCES parking_assignment(parking_Assignment_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (status_id) REFERENCES status(status_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_payment_date (payment_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create notification_type table
  `CREATE TABLE IF NOT EXISTS notification_type (
    Notification_type_id int(11) NOT NULL AUTO_INCREMENT,
    Notification_type_name varchar(50) NOT NULL,
    Notification_type_description varchar(100) NOT NULL,
    Notification_type_is_active tinyint(1) NOT NULL DEFAULT 1,
    Notification_type_created_at datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (Notification_type_id),
    INDEX idx_notification_type_name (Notification_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create notification table
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
    KEY Status_id (Status_id),
    FOREIGN KEY (User_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Property_id) REFERENCES property(property_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Notification_type_id) REFERENCES notification_type(Notification_type_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_notification_priority (Notification_priority)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create package table
  `CREATE TABLE IF NOT EXISTS package (
    Package_id int(11) NOT NULL AUTO_INCREMENT,
    Package_description varchar(100) DEFAULT NULL,
    Status_id int(11) NOT NULL,
    User_id int(11) NOT NULL,
    Property_id int(11) NOT NULL,
    Package_entryAt datetime NOT NULL DEFAULT current_timestamp(),
    Package_exitAt datetime DEFAULT NULL,
    PRIMARY KEY (Package_id),
    KEY Status_id (Status_id),
    KEY User_id (User_id),
    KEY Property_id (Property_id),
    FOREIGN KEY (Status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (User_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Property_id) REFERENCES property(property_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_package_entry (Package_entryAt)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create user_property table
  `CREATE TABLE IF NOT EXISTS user_property (
    user_property_id int(10) NOT NULL AUTO_INCREMENT,
    user_id int(10) NOT NULL,
    property_id int(10) NOT NULL,
    status_id int(10) NOT NULL,
    user_property_created_at datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (user_property_id),
    KEY user_id (user_id),
    KEY property_id (property_id),
    KEY status_id (status_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (property_id) REFERENCES property(property_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY uk_user_property (user_id, property_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create report_type table
  `CREATE TABLE IF NOT EXISTS report_type (
    report_type_id int(11) NOT NULL AUTO_INCREMENT,
    report_type_name varchar(25) NOT NULL,
    report_type_description varchar(100) DEFAULT NULL,
    report_type_is_active tinyint(1) NOT NULL,
    report_type_created_at datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (report_type_id),
    INDEX idx_report_type_name (report_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create report table
  `CREATE TABLE IF NOT EXISTS report (
    Report_id int(11) NOT NULL AUTO_INCREMENT,
    User_id int(11) NOT NULL,
    Report_title varchar(100) NOT NULL,
    Report_description varchar(100) DEFAULT NULL,
    report_type_id int(11) NOT NULL,
    Status_id int(11) NOT NULL,
    Report_file_url varchar(200) DEFAULT NULL,
    Report_created_at datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (Report_id),
    KEY User_id (User_id),
    KEY report_type_id (report_type_id),
    KEY Status_id (Status_id),
    FOREIGN KEY (User_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (report_type_id) REFERENCES report_type(report_type_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_report_created (Report_created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create cpcg_type table
  `CREATE TABLE IF NOT EXISTS cpcg_type (
    CPCG_type_id int(11) NOT NULL AUTO_INCREMENT,
    CPCG_type_name varchar(50) NOT NULL,
    CPCG_type_description varchar(100) DEFAULT NULL,
    CPCG_type_is_active tinyint(1) NOT NULL DEFAULT 1,
    CPCG_type_created_at datetime NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (CPCG_type_id),
    INDEX idx_cpcg_type_name (CPCG_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create cpcg table
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
    KEY Status_id (Status_id),
    FOREIGN KEY (User_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Property_id) REFERENCES property(property_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (CPCG_type_id) REFERENCES cpcg_type(CPCG_type_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create module table
  `CREATE TABLE IF NOT EXISTS module (
    module_id int(11) NOT NULL AUTO_INCREMENT,
    module_route varchar(30) NOT NULL,
    module_description varchar(100) DEFAULT NULL,
    is_active tinyint(1) DEFAULT 1,
    created_at datetime DEFAULT current_timestamp(),
    updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (module_id),
    UNIQUE KEY module_route (module_route),
    INDEX idx_module_route (module_route)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create permissions table
  `CREATE TABLE IF NOT EXISTS permissions (
    permissions_id int(11) NOT NULL AUTO_INCREMENT,
    permissions_name varchar(30) NOT NULL,
    permissions_description varchar(100) DEFAULT NULL,
    created_at datetime DEFAULT current_timestamp(),
    PRIMARY KEY (permissions_id),
    UNIQUE KEY permissions_name (permissions_name),
    INDEX idx_permissions_name (permissions_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create module_role table
  `CREATE TABLE IF NOT EXISTS module_role (
    module_role_id int(11) NOT NULL AUTO_INCREMENT,
    module_id int(11) NOT NULL,
    role_id int(11) NOT NULL,
    can_view tinyint(1) DEFAULT 1,
    can_create tinyint(1) DEFAULT 0,
    can_edit tinyint(1) DEFAULT 0,
    can_delete tinyint(1) DEFAULT 0,
    created_at datetime DEFAULT current_timestamp(),
    updated_at datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (module_role_id),
    KEY module_id (module_id),
    KEY role_id (role_id),
    FOREIGN KEY (module_id) REFERENCES module(module_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role(role_id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uk_module_role (module_id, role_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create role_permissions table
  `CREATE TABLE IF NOT EXISTS role_permissions (
    Role_id int(11) NOT NULL,
    Permissions_id int(11) NOT NULL,
    created_at datetime DEFAULT current_timestamp(),
    PRIMARY KEY (Role_id, Permissions_id),
    KEY Permissions_id (Permissions_id),
    FOREIGN KEY (Role_id) REFERENCES role(role_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Permissions_id) REFERENCES permissions(permissions_id) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create permissions_module_role table
  `CREATE TABLE IF NOT EXISTS permissions_module_role (
    permissions_module_role_id int(11) NOT NULL AUTO_INCREMENT,
    module_role_id int(11) NOT NULL,
    permissions_id int(11) NOT NULL,
    created_at datetime DEFAULT current_timestamp(),
    PRIMARY KEY (permissions_module_role_id),
    KEY module_role_id (module_role_id),
    KEY permissions_id (permissions_id),
    FOREIGN KEY (module_role_id) REFERENCES module_role(module_role_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (permissions_id) REFERENCES permissions(permissions_id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uk_permissions_module_role (module_role_id, permissions_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Create visitor table
  `CREATE TABLE IF NOT EXISTS visitor (
    Visitor_id int(11) NOT NULL AUTO_INCREMENT,
    Visitor_full_name varchar(25) NOT NULL,
    Visitor_id_document varchar(100) NOT NULL,
    Visitor_visit_reason varchar(255) NOT NULL,
    Visitor_entry_time datetime NOT NULL,
    Visitor_exit_time datetime DEFAULT NULL,
    Visitor_authorized_by varchar(100) NOT NULL,
    Property_id int(11) NOT NULL,
    Status_id int(11) NOT NULL,
    Vehicle_id int(11) DEFAULT NULL,
    parkingSlot_id int(11) DEFAULT NULL,
    created_at datetime DEFAULT current_timestamp(),
    PRIMARY KEY (Visitor_id),
    KEY Property_id (Property_id),
    KEY Status_id (Status_id),
    KEY Vehicle_id (Vehicle_id),
    KEY parkingSlot_id (parkingSlot_id),
    FOREIGN KEY (Property_id) REFERENCES property(property_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Status_id) REFERENCES status(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (Vehicle_id) REFERENCES vehicle(vehicle_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (parkingSlot_id) REFERENCES parkingslot(parkingSlot_id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_visitor_entry_time (Visitor_entry_time),
    INDEX idx_visitor_document (Visitor_id_document)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert initial data
  `INSERT INTO status (status_id, status_name, status_description, status_entity, status_is_active, status_created_at) VALUES
(1, 'Activo', 'Estado activo', 'General', 1, '2025-05-27 16:14:45'),
(2, 'Inactivo', 'Estado inactivo', 'General', 1, '2025-05-27 16:14:45'),
(3, 'Pendiente', 'Estado pendiente', 'General', 1, '2025-05-27 16:14:45'),
(4, 'Completado', 'Estado completado', 'General', 1, '2025-05-27 16:14:45'),
(5, 'Cancelado', 'Estado cancelado', 'General', 1, '2025-05-27 16:14:45');`,

  `INSERT INTO role (role_id, role_name, role_description, status_id, role_createAt) VALUES
(1, 'Administrador', 'Gestiona el conjunto', 1, '2025-05-27 16:14:55'),
(2, 'Residente', 'Vive en el conjunto', 1, '2025-05-27 16:14:55'),
(3, 'Propietario', 'Dueño de una propiedad', 1, '2025-05-27 16:14:55'),
(4, 'Vigilante', 'Controla el ingreso', 1, '2025-05-27 16:14:55');`,

  `INSERT INTO property (property_id, property_name, property_description, property_type, property_createAt, property_updateAt, status_id) VALUES
(1, 'Casa 101', 'Casa', 'Casa', '2025-05-27', '2025-05-27', 1),
(2, 'Casa 102', 'Casa', 'Casa', '2025-05-27', '2025-05-27', 1);`,

  `INSERT INTO tariff (tariff_id, type, description, amount, surcharge_amount, surcharge_status, due_date, status_id, created_at, updated_at) VALUES
(1, 'Fija', 'Tarifa mensual', 50000, NULL, NULL, NULL, 1, '2025-05-27 16:17:01', '2025-05-27 16:17:01'),
(2, 'Por hora', 'Visitantes', 2000, NULL, NULL, NULL, 1, '2025-05-27 16:17:01', '2025-05-27 16:17:01');`,

  `INSERT INTO user (user_id, user_name, user_password, role_id, status_id) VALUES
(1, 'admin', 'admin123', 1, 1),
(2, 'jresidente', 'residente123', 2, 1),
(3, 'mpropietario', 'propietario123', 3, 1),
(4, 'cvigilante', 'vigilante123', 4, 1);`,

  `INSERT INTO profile (user_id, profile_fullName, profile_phone, profile_email, profile_photo, profile_address) VALUES
(1, 'Admin General', '3000000001', 'admin@example.com', NULL, 'Oficina'),
(2, 'Juan Residente', '3000000002', 'juan@example.com', NULL, 'Casa 101'),
(3, 'Maria Propietaria', '3000000003', 'maria@example.com', NULL, 'Casa 10'),
(4, 'Carlos Vigilante', '3000000004', 'carlos@example.com', NULL, 'Portería');`,

  `INSERT INTO parkingzone (parkingZone_id, type, capacity, property_id, status_id) VALUES
(1, 1, '10', 1, 1),
(2, 2, '5', 2, 1);`,

  `INSERT INTO parkingslot (parkingSlot_id, code, parkingZone_id, status_id, is_reserved, time_unit, total, tariff_id, created_at, updated_at) VALUES
(1, 'P-101', 1, 1, 0, NULL, NULL, NULL, NULL, NULL),
(2, 'P-102', 1, 1, 0, NULL, NULL, NULL, NULL, NULL),
(3, 'M-201', 2, 1, 0, NULL, NULL, NULL, NULL, NULL);`,

  `INSERT INTO vehicle (vehicle_id, model, type, color, license_plate, user_id, property_id, parkingZone_id, status_id, vehicle_createAt, vehicle_updateAt) VALUES
(1, 'Mazda 3', 'Carro', 'Rojo', 'ABC123', 2, 1, NULL, 1, '2025-05-27', '2025-05-27'),
(2, 'Yamaha FZ', 'Moto', 'Negro', 'XYZ789', 3, 2, NULL, 1, '2025-05-27', '2025-05-27');`,

  `INSERT INTO amenity_type (Amenity_Type_id, Amenity_Type_name, Amenity_Type_description, Amenity_Type_is_active, Amenity_Type_created_at) VALUES
(1, 'Recreativo', 'Zonas para actividades recreativas', 1, '2025-05-27 16:17:01'),
(2, 'Deportivo', 'Zonas para actividades deportivas', 1, '2025-05-27 16:17:01'),
(3, 'Social', 'Zonas para eventos sociales', 1, '2025-05-27 16:17:01');`,

  `INSERT INTO notification_type (Notification_type_id, Notification_type_name, Notification_type_description, Notification_type_is_active, Notification_type_created_at) VALUES
(1, 'Informacion', 'Notificaciones informativas', 1, '2025-05-27 16:17:01'),
(2, 'Alerta', 'Notificaciones de alerta', 1, '2025-05-27 16:17:01'),
(3, 'Urgente', 'Notificaciones urgentes', 1, '2025-05-27 16:17:01');`,

  `INSERT INTO report_type (report_type_id, report_type_name, report_type_description, report_type_is_active, report_type_created_at) VALUES
(1, 'Mantenimiento', 'Reportes de mantenimiento', 1, '2025-05-27 16:17:01'),
(2, 'Seguridad', 'Reportes de seguridad', 1, '2025-05-27 16:17:01'),
(3, 'Quejas', 'Reportes de quejas', 1, '2025-05-27 16:17:01');`,

  `INSERT INTO cpcg_type (CPCG_type_id, CPCG_type_name, CPCG_type_description, CPCG_type_is_active, CPCG_type_created_at) VALUES
(1, 'Queja', 'Queja de residente', 1, '2025-05-27 16:17:01'),
(2, 'Peticion', 'Petición de residente', 1, '2025-05-27 16:17:01'),
(3, 'Reclamo', 'Reclamo de residente', 1, '2025-05-27 16:17:01'),
(4, 'Sugerencia', 'Sugerencia de residente', 1, '2025-05-27 16:17:01');`,

  `INSERT INTO module (module_id, module_route, module_description, is_active, created_at, updated_at) VALUES
(1, '/dashboard', 'Panel principal', 1, '2025-05-27 16:17:01', '2025-05-27 16:17:01'),
(2, '/usuarios', 'Gestión de usuarios', 1, '2025-05-27 16:17:01', '2025-05-27 16:17:01'),
(3, '/propiedades', 'Gestión de propiedades', 1, '2025-05-27 16:17:01', '2025-05-27 16:17:01'),
(4, '/parqueaderos', 'Gestión de parqueaderos', 1, '2025-05-27 16:17:01', '2025-05-27 16:17:01'),
(5, '/zonas comunes', 'Gestión de zonas comunes', 1, '2025-05-27 16:17:01', '2025-05-27 16:17:01'),
(6, '/visitantes', 'Gestión de visitantes', 1, '2025-05-27 16:17:01', '2025-05-27 16:17:01'),
(7, '/reportes', 'Gestión de reportes', 1, '2025-05-27 16:17:01', '2025-05-27 16:17:01'),
(8, '/pagos', 'Gestión de pagos', 1, '2025-05-27 16:17:01', '2025-05-27 16:17:01');`,

  `INSERT INTO permissions (permissions_id, permissions_name, permissions_description, created_at) VALUES
(1, 'view', 'Ver contenido', '2025-05-27 16:17:01'),
(2, 'create', 'Crear contenido', '2025-05-27 16:17:01'),
(3, 'edit', 'Editar contenido', '2025-05-27 16:17:01'),
(4, 'delete', 'Eliminar contenido', '2025-05-27 16:17:01'),
(5, 'admin', 'Administrador total', '2025-05-27 16:17:01');`,

  // Create stored procedures
  `DROP PROCEDURE IF EXISTS sp_get_user_permissions;`,
  `CREATE PROCEDURE sp_get_user_permissions(IN userId INT, IN roleId INT)
BEGIN
    SELECT DISTINCT p.permissions_name, m.module_route, mr.can_view, mr.can_create, mr.can_edit, mr.can_delete
    FROM user u
    INNER JOIN role r ON u.role_id = r.role_id
    INNER JOIN module_role mr ON r.role_id = mr.role_id
    INNER JOIN module m ON mr.module_id = m.module_id
    INNER JOIN permissions_module_role pmr ON mr.module_role_id = pmr.module_role_id
    INNER JOIN permissions p ON pmr.permissions_id = p.permissions_id
    WHERE u.user_id = userId AND u.role_id = roleId AND u.status_id = 1;
END;`,

  `DROP PROCEDURE IF EXISTS sp_get_parking_availability;`,
  `CREATE PROCEDURE sp_get_parking_availability(IN zoneId INT)
BEGIN
    SELECT ps.parkingSlot_id, ps.code, ps.is_reserved, ps.status_id, s.status_name
    FROM parkingslot ps
    INNER JOIN status s ON ps.status_id = s.status_id
    WHERE ps.parkingZone_id = zoneId AND ps.status_id = 1
    ORDER BY ps.code;
END;`,

  `DROP PROCEDURE IF EXISTS sp_get_user_reservations;`,
  `CREATE PROCEDURE sp_get_user_reservations(IN userId INT)
BEGIN
    SELECT r.reservation_id, a.name AS amenity_name, r.reservation_start_time, 
           r.reservation_end_time, r.reservation_capacity, s.status_name
    FROM reservation r
    INNER JOIN amenity a ON r.amenity_id = a.amenity_id
    INNER JOIN status s ON r.status_id = s.status_id
    WHERE r.user_id = userId
    ORDER BY r.reservation_start_time DESC;
END;`,

  `DROP PROCEDURE IF EXISTS sp_get_property_residents;`,
  `CREATE PROCEDURE sp_get_property_residents(IN propertyId INT)
BEGIN
    SELECT u.user_id, p.profile_fullName, p.profile_phone, p.profile_email, r.role_name
    FROM user_property up
    INNER JOIN user u ON up.user_id = u.user_id
    INNER JOIN profile p ON u.user_id = p.user_id
    INNER JOIN role r ON u.role_id = r.role_id
    WHERE up.property_id = propertyId AND up.status_id = 1;
END;`,

  `DROP PROCEDURE IF EXISTS sp_get_pending_payments;`,
  `CREATE PROCEDURE sp_get_pending_payments(IN userId INT)
BEGIN
    SELECT i.invoice_id, i.amount, i.due_date, i.description, t.type AS tariff_type
    FROM invoice i
    INNER JOIN tariff t ON i.tariff_id = t.tariff_id
    WHERE i.user_id = userId AND i.status_id = 3
    ORDER BY i.due_date ASC;
END;`
];

export async function runMigration() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');

    // Execute all SQL statements
    for (const sql of sqlStatements) {
      try {
        await connection.query(sql);
        console.log('Executed SQL statement successfully');
      } catch (error) {
        console.error('Error executing SQL:', error.message);
        throw error;
      }
    }

    console.log('Conjunto Residencial database migration completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error };
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}
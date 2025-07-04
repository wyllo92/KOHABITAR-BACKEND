-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-07-2025 a las 01:56:47
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12
SET
  SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET
  time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;

/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;

/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;

/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `conjunto_residencial`
--
-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `amenity`
--
CREATE TABLE
  `amenity` (
    `amenity_id` int (11) NOT NULL,
    `name` varchar(25) NOT NULL,
    `capacity` int (11) DEFAULT NULL,
    `description` varchar(500) DEFAULT NULL,
    `time_unit` int (10) DEFAULT NULL,
    `total` double DEFAULT NULL,
    `status_id` int (11) DEFAULT NULL,
    `tariff_id` int (11) DEFAULT NULL,
    `property_id` int (11) DEFAULT NULL,
    `amenity_type_id` int (11) DEFAULT NULL,
    `created_at` date DEFAULT NULL,
    `updated_at` date DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `amenity_type`
--
CREATE TABLE
  `amenity_type` (
    `Amenity_Type_id` int (11) NOT NULL,
    `Amenity_Type_name` varchar(11) NOT NULL,
    `Amenity_Type_description` varchar(100) NOT NULL,
    `Amenity_Type_is_active` tinyint (1) NOT NULL DEFAULT 1,
    `Amenity_Type_created_at` datetime NOT NULL DEFAULT current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `cpcg`
--
CREATE TABLE
  `cpcg` (
    `CPCG_id` int (11) NOT NULL,
    `User_id` int (11) NOT NULL,
    `Property_id` int (11) NOT NULL,
    `CPCG_type_id` int (11) NOT NULL,
    `CPCG_description` varchar(100) NOT NULL,
    `Status_id` int (11) NOT NULL,
    `CPCG_createAt` datetime NOT NULL DEFAULT current_timestamp(),
    `CPCG_updateAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `cpcg_type`
--
CREATE TABLE
  `cpcg_type` (
    `CPCG_type_id` int (11) NOT NULL,
    `CPCG_type_name` varchar(11) NOT NULL,
    `CPCG_type_description` varchar(100) DEFAULT NULL,
    `CPCG_type_is_active` tinyint (1) NOT NULL DEFAULT 1,
    `CPCG_type_created_at` datetime NOT NULL DEFAULT current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `invoice`
--
CREATE TABLE
  `invoice` (
    `invoice_id` int (11) NOT NULL,
    `user_id` int (11) NOT NULL,
    `property_id` int (11) NOT NULL,
    `tariff_id` int (11) NOT NULL,
    `date` datetime NOT NULL DEFAULT current_timestamp(),
    `due_date` datetime NOT NULL DEFAULT current_timestamp(),
    `amount` decimal(10, 2) NOT NULL,
    `status_id` int (11) NOT NULL,
    `description` varchar(100) DEFAULT NULL,
    `created_at` datetime DEFAULT current_timestamp(),
    `updated_at` datetime DEFAULT current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `module`
--
CREATE TABLE
  `module` (
    `module_id` int (11) NOT NULL,
    `module_route` varchar(30) NOT NULL,
    `module_description` varchar(100) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `module_role`
--
CREATE TABLE
  `module_role` (
    `module_role_id` int (11) NOT NULL,
    `module_id` int (11) NOT NULL,
    `role_id` int (11) NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `notification`
--
CREATE TABLE
  `notification` (
    `Notification_id` int (11) NOT NULL,
    `User_id` int (11) NOT NULL,
    `Property_id` int (11) NOT NULL,
    `Notification_type_id` int (11) NOT NULL,
    `Notification_title` varchar(100) NOT NULL,
    `Notification_message` varchar(500) NOT NULL,
    `Status_id` int (11) NOT NULL,
    `Notification_priority` int (11) NOT NULL,
    `Notification_createAt` datetime NOT NULL DEFAULT current_timestamp(),
    `Notification_updateAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `notification_type`
--
CREATE TABLE
  `notification_type` (
    `Notification_type_id` int (11) NOT NULL,
    `Notification_type_name` varchar(11) NOT NULL,
    `Notification_type_description` varchar(100) NOT NULL,
    `Notification_type_is_active` tinyint (1) NOT NULL DEFAULT 1,
    `Notification_type_created_at` datetime NOT NULL DEFAULT current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `package`
--
CREATE TABLE
  `package` (
    `Package_id` int (11) NOT NULL,
    `Package_description` varchar(100) DEFAULT NULL,
    `Status_id` int (11) NOT NULL,
    `User_id` int (11) NOT NULL,
    `Property_id` int (11) NOT NULL,
    `Package_entryAt` datetime NOT NULL DEFAULT current_timestamp(),
    `Package_exitAt` datetime NOT NULL DEFAULT current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `parkingslot`
--
CREATE TABLE
  `parkingslot` (
    `parkingSlot_id` int (11) NOT NULL,
    `code` varchar(20) NOT NULL,
    `parkingZone_id` int (11) NOT NULL,
    `status_id` int (11) NOT NULL,
    `is_reserved` tinyint (1) DEFAULT 0,
    `time_unit` int (10) DEFAULT NULL,
    `total` double DEFAULT NULL,
    `tariff_id` int (11) DEFAULT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `parkingslot`
--
INSERT INTO
  `parkingslot` (
    `parkingSlot_id`,
    `code`,
    `parkingZone_id`,
    `status_id`,
    `is_reserved`,
    `time_unit`,
    `total`,
    `tariff_id`,
    `created_at`,
    `updated_at`
  )
VALUES
  (1, 'P-101', 1, 1, 0, NULL, NULL, NULL, NULL, NULL),
  (2, 'P-102', 1, 1, 0, NULL, NULL, NULL, NULL, NULL),
  (3, 'M-201', 2, 1, 0, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `parkingzone`
--
CREATE TABLE
  `parkingzone` (
    `parkingZone_id` int (11) NOT NULL,
    `type` int (10) NOT NULL,
    `capacity` varchar(25) NOT NULL,
    `property_id` int (11) NOT NULL,
    `status_id` int (11) NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `parkingzone`
--
INSERT INTO
  `parkingzone` (
    `parkingZone_id`,
    `type`,
    `capacity`,
    `property_id`,
    `status_id`
  )
VALUES
  (1, 1, '10', 1, 1),
  (2, 2, '5', 2, 1);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `parking_assignment`
--
CREATE TABLE
  `parking_assignment` (
    `parking_Assignment_id` int (11) NOT NULL,
    `parkingSlot_id` int (11) NOT NULL,
    `User_id` int (11) NOT NULL,
    `Vehicle_id` int (11) NOT NULL,
    `tariff_id` int (11) NOT NULL,
    `Status_id` int (11) NOT NULL,
    `parking_Assignment_start_time` datetime NOT NULL,
    `parking_Assignment_end_time` datetime DEFAULT NULL,
    `parking_Assignment_total_amount` decimal(10, 2) NOT NULL,
    `parking_Assignment_created_at` datetime NOT NULL DEFAULT current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `payment`
--
CREATE TABLE
  `payment` (
    `payment_id` int (11) NOT NULL,
    `user_id` int (11) NOT NULL,
    `amount_paid` double NOT NULL,
    `payment_date` datetime NOT NULL,
    `method` varchar(50) DEFAULT NULL,
    `reference` varchar(100) DEFAULT NULL,
    `invoice_id` int (11) DEFAULT NULL,
    `reservation_id` int (11) DEFAULT NULL,
    `parking_assignment_id` int (11) DEFAULT NULL,
    `status_id` int (11) DEFAULT NULL,
    `payment_type_id` int (11) DEFAULT NULL,
    `created_at` datetime DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `permissions`
--
CREATE TABLE
  `permissions` (
    `permissions_id` int (11) NOT NULL,
    `permissions_name` varchar(30) NOT NULL,
    `permissions_description` varchar(100) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `permissions_module_role`
--
CREATE TABLE
  `permissions_module_role` (
    `permissions_module_role_id` int (11) NOT NULL,
    `module_role_id` int (11) NOT NULL,
    `permissions_id` int (11) NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `profile`
--
CREATE TABLE
  `profile` (
    `user_id` int (11) NOT NULL,
    `profile_fullName` varchar(50) NOT NULL,
    `profile_phone` varchar(10) NOT NULL,
    `profile_email` varchar(30) NOT NULL,
    `profile_photo` varchar(256) DEFAULT NULL,
    `profile_address` varchar(30) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `profile`
--
INSERT INTO
  `profile` (
    `user_id`,
    `profile_fullName`,
    `profile_phone`,
    `profile_email`,
    `profile_photo`,
    `profile_address`
  )
VALUES
  (
    1,
    'Admin General',
    '3000000001',
    'admin@example.com',
    NULL,
    'Oficina'
  ),
  (
    2,
    'Juan Residente',
    '3000000002',
    'juan@example.com',
    NULL,
    'Casa 101'
  ),
  (
    3,
    'Maria Propietaria',
    '3000000003',
    'maria@example.com',
    NULL,
    'Casa 10'
  ),
  (
    4,
    'Carlos Vigilante',
    '3000000004',
    'carlos@example.com',
    NULL,
    'Portería'
  );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `property`
--
CREATE TABLE
  `property` (
    `property_id` int (11) NOT NULL,
    `property_name` varchar(30) NOT NULL,
    `property_description` varchar(100) DEFAULT NULL,
    `property_type` varchar(25) NOT NULL,
    `property_createAt` date NOT NULL,
    `property_updateAt` date NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `property`
--
INSERT INTO
  `property` (
    `property_id`,
    `property_name`,
    `property_description`,
    `property_type`,
    `property_createAt`,
    `property_updateAt`
  )
VALUES
  (
    1,
    'Casa 101',
    'Casa en primer piso',
    'Casa',
    '2025-05-27',
    '2025-05-27'
  ),
  (
    2,
    'Casa 10',
    'Casa independiente',
    'Casa',
    '2025-05-27',
    '2025-05-27'
  );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `report`
--
CREATE TABLE
  `report` (
    `Report_id` int (11) NOT NULL,
    `User_id` int (11) NOT NULL,
    `Report_title` varchar(100) NOT NULL,
    `Report_description` varchar(100) DEFAULT NULL,
    `report_type_id` int (11) NOT NULL,
    `Status_id` int (11) NOT NULL,
    `Report_file_url` varchar(200) DEFAULT NULL,
    `Report_created_at` datetime NOT NULL DEFAULT current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `report_type`
--
CREATE TABLE
  `report_type` (
    `report_type_id` int (11) NOT NULL,
    `report_type_name` varchar(25) NOT NULL,
    `report_type_description` varchar(100) DEFAULT NULL,
    `report_type_is_active` tinyint (1) NOT NULL,
    `report_type_created_at` datetime NOT NULL DEFAULT current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `reservation`
--
CREATE TABLE
  `reservation` (
    `reservation_id` int (11) NOT NULL,
    `amenity_id` int (11) NOT NULL,
    `user_id` int (11) NOT NULL,
    `status_id` int (11) DEFAULT NULL,
    `tariff_id` int (11) DEFAULT NULL,
    `reservation_createAt` datetime DEFAULT NULL,
    `reservation_start_time` datetime DEFAULT NULL,
    `reservation_end_time` datetime DEFAULT NULL,
    `reservation_time_unit` int (10) DEFAULT NULL,
    `reservation_capacity` int (11) DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `role`
--
CREATE TABLE
  `role` (
    `role_id` int (11) NOT NULL,
    `role_name` varchar(20) NOT NULL,
    `role_description` varchar(100) DEFAULT NULL,
    `status_id` int (11) NOT NULL,
    `role_createAt` datetime NOT NULL DEFAULT current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `role`
--
INSERT INTO
  `role` (
    `role_id`,
    `role_name`,
    `role_description`,
    `status_id`,
    `role_createAt`
  )
VALUES
  (
    1,
    'Administrador',
    'Gestiona el sistema',
    1,
    '2025-05-27 16:14:55'
  ),
  (
    2,
    'Residente',
    'Vive en el conjunto',
    1,
    '2025-05-27 16:14:55'
  ),
  (
    3,
    'Propietario',
    'Dueño de una propiedad',
    1,
    '2025-05-27 16:14:55'
  ),
  (
    4,
    'Vigilante',
    'Controla el ingreso',
    1,
    '2025-05-27 16:14:55'
  );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `role_permissions`
--
CREATE TABLE
  `role_permissions` (
    `Role_id` int (11) NOT NULL,
    `Permissions_id` int (11) NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `status`
--
CREATE TABLE
  `status` (
    `status_id` int (11) NOT NULL,
    `status_name` varchar(30) NOT NULL,
    `status_description` varchar(100) DEFAULT NULL,
    `status_entity` varchar(50) NOT NULL,
    `status_is_active` tinyint (1) NOT NULL DEFAULT 1,
    `status_created_at` datetime NOT NULL DEFAULT current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `status`
--
INSERT INTO
  `status` (
    `status_id`,
    `status_name`,
    `status_description`,
    `status_entity`,
    `status_is_active`,
    `status_created_at`
  )
VALUES
  (
    1,
    'Activo',
    'Estado activo',
    'General',
    1,
    '2025-05-27 16:14:45'
  ),
  (
    2,
    'Inactivo',
    'Estado inactivo',
    'General',
    1,
    '2025-05-27 16:14:45'
  ),
  (
    3,
    'Pendiente',
    'Estado pendiente',
    'General',
    1,
    '2025-05-27 16:14:45'
  );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `tariff`
--
CREATE TABLE
  `tariff` (
    `tariff_id` int (11) NOT NULL,
    `type` varchar(30) DEFAULT NULL,
    `description` varchar(100) DEFAULT NULL,
    `amount` double DEFAULT NULL,
    `surcharge_amount` double DEFAULT NULL,
    `surcharge_status` tinyint (1) DEFAULT NULL,
    `due_date` datetime DEFAULT NULL,
    `status_id` int (11) DEFAULT NULL,
    `created_at` datetime DEFAULT NULL,
    `updated_at` datetime DEFAULT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tariff`
--
INSERT INTO
  `tariff` (
    `tariff_id`,
    `type`,
    `description`,
    `amount`,
    `surcharge_amount`,
    `surcharge_status`,
    `due_date`,
    `status_id`,
    `created_at`,
    `updated_at`
  )
VALUES
  (
    1,
    'Fija',
    'Tarifa mensual',
    50000,
    NULL,
    NULL,
    NULL,
    1,
    '2025-05-27 16:17:01',
    '2025-05-27 16:17:01'
  ),
  (
    2,
    'Por hora',
    'Visitantes',
    2000,
    NULL,
    NULL,
    NULL,
    1,
    '2025-05-27 16:17:01',
    '2025-05-27 16:17:01'
  );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `user`
--
CREATE TABLE
  `user` (
    `user_id` int (11) NOT NULL,
    `user_name` varchar(30) NOT NULL,
    `user_password` varchar(256) NOT NULL,
    `role_id` int (11) NOT NULL,
    `status_id` int (11) NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `user`
--
INSERT INTO
  `user` (
    `user_id`,
    `user_name`,
    `user_password`,
    `role_id`,
    `status_id`
  )
VALUES
  (1, 'admin', 'admin123', 1, 1),
  (2, 'jresidente', 'residente123', 2, 1),
  (3, 'mpropietario', 'propietario123', 3, 1),
  (4, 'cvigilante', 'vigilante123', 4, 1);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `user_property`
--
CREATE TABLE
  `user_property` (
    `user_property_id` int (10) NOT NULL,
    `user_id` int (10) NOT NULL,
    `property_id` int (10) NOT NULL,
    `status_id` int (10) NOT NULL,
    `user_property_created_at` datetime NOT NULL DEFAULT current_timestamp()
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `vehicle`
--
CREATE TABLE
  `vehicle` (
    `vehicle_id` int (11) NOT NULL,
    `model` varchar(30) NOT NULL,
    `type` varchar(25) NOT NULL,
    `color` varchar(25) NOT NULL,
    `user_id` int (11) NOT NULL,
    `property_id` int (11) NOT NULL,
    `parkingZone_id` int (11) DEFAULT NULL,
    `status_id` int (11) NOT NULL,
    `vehicle_createAt` date NOT NULL,
    `vehicle_updateAt` date NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vehicle`
--
INSERT INTO
  `vehicle` (
    `vehicle_id`,
    `model`,
    `type`,
    `color`,
    `user_id`,
    `property_id`,
    `parkingZone_id`,
    `status_id`,
    `vehicle_createAt`,
    `vehicle_updateAt`
  )
VALUES
  (
    1,
    'Mazda 3',
    'Carro',
    'Rojo',
    2,
    1,
    NULL,
    1,
    '2025-05-27',
    '2025-05-27'
  ),
  (
    2,
    'Yamaha FZ',
    'Moto',
    'Negro',
    3,
    2,
    NULL,
    1,
    '2025-05-27',
    '2025-05-27'
  );

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `visitor`
--
CREATE TABLE
  `visitor` (
    `Visitor_id` int (11) NOT NULL,
    `Visitor_full_name` varchar(25) NOT NULL,
    `Visitor_id_document` varchar(100) NOT NULL,
    `Visitor_visit_reason` varchar(255) NOT NULL,
    `Visitor_entry_time` datetime NOT NULL,
    `Visitor_exit_time` datetime DEFAULT NULL,
    `Visitor_authorized_by` varchar(100) NOT NULL,
    `Property_id` int (11) NOT NULL,
    `Status_id` int (11) NOT NULL,
    `Vehicle_id` int (11) NOT NULL,
    `parkingSlot_id` int (11) NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--
--
-- Indices de la tabla `amenity`
--
ALTER TABLE `amenity` ADD PRIMARY KEY (`amenity_id`),
ADD KEY `status_id` (`status_id`),
ADD KEY `tariff_id` (`tariff_id`),
ADD KEY `property_id` (`property_id`);

--
-- Indices de la tabla `amenity_type`
--
ALTER TABLE `amenity_type` ADD PRIMARY KEY (`Amenity_Type_id`);

--
-- Indices de la tabla `cpcg`
--
ALTER TABLE `cpcg` ADD PRIMARY KEY (`CPCG_id`),
ADD KEY `User_id` (`User_id`),
ADD KEY `Property_id` (`Property_id`),
ADD KEY `CPCG_type_id` (`CPCG_type_id`),
ADD KEY `Status_id` (`Status_id`);

--
-- Indices de la tabla `cpcg_type`
--
ALTER TABLE `cpcg_type` ADD PRIMARY KEY (`CPCG_type_id`);

--
-- Indices de la tabla `invoice`
--
ALTER TABLE `invoice` ADD PRIMARY KEY (`invoice_id`),
ADD KEY `user_id` (`user_id`),
ADD KEY `property_id` (`property_id`),
ADD KEY `tariff_id` (`tariff_id`),
ADD KEY `status_id` (`status_id`);

--
-- Indices de la tabla `module`
--
ALTER TABLE `module` ADD PRIMARY KEY (`module_id`),
ADD UNIQUE KEY `module_route` (`module_route`);

--
-- Indices de la tabla `module_role`
--
ALTER TABLE `module_role` ADD PRIMARY KEY (`module_role_id`),
ADD KEY `module_id` (`module_id`),
ADD KEY `role_id` (`role_id`);

--
-- Indices de la tabla `notification`
--
ALTER TABLE `notification` ADD PRIMARY KEY (`Notification_id`),
ADD KEY `User_id` (`User_id`),
ADD KEY `Property_id` (`Property_id`),
ADD KEY `Notification_type_id` (`Notification_type_id`),
ADD KEY `Status_id` (`Status_id`);

--
-- Indices de la tabla `notification_type`
--
ALTER TABLE `notification_type` ADD PRIMARY KEY (`Notification_type_id`);

--
-- Indices de la tabla `package`
--
ALTER TABLE `package` ADD PRIMARY KEY (`Package_id`),
ADD KEY `Status_id` (`Status_id`),
ADD KEY `User_id` (`User_id`),
ADD KEY `Property_id` (`Property_id`);

--
-- Indices de la tabla `parkingslot`
--
ALTER TABLE `parkingslot` ADD PRIMARY KEY (`parkingSlot_id`),
ADD KEY `parkingZone_id` (`parkingZone_id`),
ADD KEY `status_id` (`status_id`);

--
-- Indices de la tabla `parkingzone`
--
ALTER TABLE `parkingzone` ADD PRIMARY KEY (`parkingZone_id`),
ADD KEY `property_id` (`property_id`),
ADD KEY `status_id` (`status_id`);

--
-- Indices de la tabla `parking_assignment`
--
ALTER TABLE `parking_assignment` ADD PRIMARY KEY (`parking_Assignment_id`),
ADD KEY `parkingSlot_id` (`parkingSlot_id`),
ADD KEY `User_id` (`User_id`),
ADD KEY `Vehicle_id` (`Vehicle_id`),
ADD KEY `tariff_id` (`tariff_id`),
ADD KEY `Status_id` (`Status_id`);

--
-- Indices de la tabla `payment`
--
ALTER TABLE `payment` ADD PRIMARY KEY (`payment_id`),
ADD KEY `user_id` (`user_id`),
ADD KEY `invoice_id` (`invoice_id`),
ADD KEY `reservation_id` (`reservation_id`),
ADD KEY `status_id` (`status_id`);

--
-- Indices de la tabla `permissions`
--
ALTER TABLE `permissions` ADD PRIMARY KEY (`permissions_id`),
ADD UNIQUE KEY `permissions_name` (`permissions_name`);

--
-- Indices de la tabla `permissions_module_role`
--
ALTER TABLE `permissions_module_role` ADD PRIMARY KEY (`permissions_module_role_id`),
ADD KEY `module_role_id` (`module_role_id`),
ADD KEY `permissions_id` (`permissions_id`);

--
-- Indices de la tabla `profile`
--
ALTER TABLE `profile` ADD PRIMARY KEY (`user_id`),
ADD UNIQUE KEY `profile_email` (`profile_email`);

--
-- Indices de la tabla `property`
--
ALTER TABLE `property` ADD PRIMARY KEY (`property_id`),
ADD UNIQUE KEY `property_name` (`property_name`);

--
-- Indices de la tabla `report`
--
ALTER TABLE `report` ADD PRIMARY KEY (`Report_id`),
ADD KEY `User_id` (`User_id`),
ADD KEY `report_type_id` (`report_type_id`),
ADD KEY `Status_id` (`Status_id`);

--
-- Indices de la tabla `report_type`
--
ALTER TABLE `report_type` ADD PRIMARY KEY (`report_type_id`);

--
-- Indices de la tabla `reservation`
--
ALTER TABLE `reservation` ADD PRIMARY KEY (`reservation_id`),
ADD KEY `amenity_id` (`amenity_id`),
ADD KEY `user_id` (`user_id`),
ADD KEY `status_id` (`status_id`),
ADD KEY `tariff_id` (`tariff_id`);

--
-- Indices de la tabla `role`
--
ALTER TABLE `role` ADD PRIMARY KEY (`role_id`),
ADD UNIQUE KEY `role_name` (`role_name`),
ADD KEY `status_id` (`status_id`);

--
-- Indices de la tabla `role_permissions`
--
ALTER TABLE `role_permissions` ADD PRIMARY KEY (`Role_id`, `Permissions_id`),
ADD KEY `Permissions_id` (`Permissions_id`);

--
-- Indices de la tabla `status`
--
ALTER TABLE `status` ADD PRIMARY KEY (`status_id`);

--
-- Indices de la tabla `tariff`
--
ALTER TABLE `tariff` ADD PRIMARY KEY (`tariff_id`),
ADD KEY `status_id` (`status_id`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user` ADD PRIMARY KEY (`user_id`),
ADD UNIQUE KEY `user_name` (`user_name`),
ADD KEY `role_id` (`role_id`),
ADD KEY `status_id` (`status_id`);

--
-- Indices de la tabla `user_property`
--
ALTER TABLE `user_property` ADD PRIMARY KEY (`user_property_id`),
ADD KEY `user_id` (`user_id`),
ADD KEY `property_id` (`property_id`),
ADD KEY `status_id` (`status_id`);

--
-- Indices de la tabla `vehicle`
--
ALTER TABLE `vehicle` ADD PRIMARY KEY (`vehicle_id`),
ADD KEY `user_id` (`user_id`),
ADD KEY `property_id` (`property_id`),
ADD KEY `status_id` (`status_id`);

--
-- Indices de la tabla `visitor`
--
ALTER TABLE `visitor` ADD PRIMARY KEY (`Visitor_id`),
ADD KEY `Property_id` (`Property_id`),
ADD KEY `Status_id` (`Status_id`),
ADD KEY `Vehicle_id` (`Vehicle_id`),
ADD KEY `parkingSlot_id` (`parkingSlot_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--
--
-- AUTO_INCREMENT de la tabla `amenity`
--
ALTER TABLE `amenity` MODIFY `amenity_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `amenity_type`
--
ALTER TABLE `amenity_type` MODIFY `Amenity_Type_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cpcg`
--
ALTER TABLE `cpcg` MODIFY `CPCG_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cpcg_type`
--
ALTER TABLE `cpcg_type` MODIFY `CPCG_type_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `invoice`
--
ALTER TABLE `invoice` MODIFY `invoice_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `module`
--
ALTER TABLE `module` MODIFY `module_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `module_role`
--
ALTER TABLE `module_role` MODIFY `module_role_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notification`
--
ALTER TABLE `notification` MODIFY `Notification_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notification_type`
--
ALTER TABLE `notification_type` MODIFY `Notification_type_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `package`
--
ALTER TABLE `package` MODIFY `Package_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `parkingslot`
--
ALTER TABLE `parkingslot` MODIFY `parkingSlot_id` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 4;

--
-- AUTO_INCREMENT de la tabla `parkingzone`
--
ALTER TABLE `parkingzone` MODIFY `parkingZone_id` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 3;

--
-- AUTO_INCREMENT de la tabla `parking_assignment`
--
ALTER TABLE `parking_assignment` MODIFY `parking_Assignment_id` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 2;

--
-- AUTO_INCREMENT de la tabla `payment`
--
ALTER TABLE `payment` MODIFY `payment_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `permissions`
--
ALTER TABLE `permissions` MODIFY `permissions_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `permissions_module_role`
--
ALTER TABLE `permissions_module_role` MODIFY `permissions_module_role_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `property`
--
ALTER TABLE `property` MODIFY `property_id` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 3;

--
-- AUTO_INCREMENT de la tabla `report`
--
ALTER TABLE `report` MODIFY `Report_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `report_type`
--
ALTER TABLE `report_type` MODIFY `report_type_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reservation`
--
ALTER TABLE `reservation` MODIFY `reservation_id` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 2;

--
-- AUTO_INCREMENT de la tabla `role`
--
ALTER TABLE `role` MODIFY `role_id` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 5;

--
-- AUTO_INCREMENT de la tabla `status`
--
ALTER TABLE `status` MODIFY `status_id` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 4;

--
-- AUTO_INCREMENT de la tabla `tariff`
--
ALTER TABLE `tariff` MODIFY `tariff_id` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 3;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user` MODIFY `user_id` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 5;

--
-- AUTO_INCREMENT de la tabla `user_property`
--
ALTER TABLE `user_property` MODIFY `user_property_id` int (10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `vehicle`
--
ALTER TABLE `vehicle` MODIFY `vehicle_id` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 3;

--
-- AUTO_INCREMENT de la tabla `visitor`
--
ALTER TABLE `visitor` MODIFY `Visitor_id` int (11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--
--
-- Filtros para la tabla `amenity`
--
ALTER TABLE `amenity` ADD CONSTRAINT `amenity_ibfk_1` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`),
ADD CONSTRAINT `amenity_ibfk_2` FOREIGN KEY (`tariff_id`) REFERENCES `tariff` (`tariff_id`),
ADD CONSTRAINT `amenity_ibfk_3` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`);

--
-- Filtros para la tabla `cpcg`
--
ALTER TABLE `cpcg` ADD CONSTRAINT `cpcg_ibfk_1` FOREIGN KEY (`User_id`) REFERENCES `user` (`user_id`),
ADD CONSTRAINT `cpcg_ibfk_2` FOREIGN KEY (`Property_id`) REFERENCES `property` (`property_id`),
ADD CONSTRAINT `cpcg_ibfk_3` FOREIGN KEY (`CPCG_type_id`) REFERENCES `cpcg_type` (`CPCG_type_id`),
ADD CONSTRAINT `cpcg_ibfk_4` FOREIGN KEY (`Status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `invoice`
--
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
ADD CONSTRAINT `invoice_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`),
ADD CONSTRAINT `invoice_ibfk_3` FOREIGN KEY (`tariff_id`) REFERENCES `tariff` (`tariff_id`),
ADD CONSTRAINT `invoice_ibfk_4` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `module_role`
--
ALTER TABLE `module_role` ADD CONSTRAINT `module_role_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `module` (`module_id`),
ADD CONSTRAINT `module_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`);

--
-- Filtros para la tabla `notification`
--
ALTER TABLE `notification` ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`User_id`) REFERENCES `user` (`user_id`),
ADD CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`Property_id`) REFERENCES `property` (`property_id`),
ADD CONSTRAINT `notification_ibfk_3` FOREIGN KEY (`Notification_type_id`) REFERENCES `notification_type` (`Notification_type_id`),
ADD CONSTRAINT `notification_ibfk_4` FOREIGN KEY (`Status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `package`
--
ALTER TABLE `package` ADD CONSTRAINT `package_ibfk_1` FOREIGN KEY (`Status_id`) REFERENCES `status` (`status_id`),
ADD CONSTRAINT `package_ibfk_2` FOREIGN KEY (`User_id`) REFERENCES `user` (`user_id`),
ADD CONSTRAINT `package_ibfk_3` FOREIGN KEY (`Property_id`) REFERENCES `property` (`property_id`);

--
-- Filtros para la tabla `parkingslot`
--
ALTER TABLE `parkingslot` ADD CONSTRAINT `parkingslot_ibfk_1` FOREIGN KEY (`parkingZone_id`) REFERENCES `parkingzone` (`parkingZone_id`),
ADD CONSTRAINT `parkingslot_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `parkingzone`
--
ALTER TABLE `parkingzone` ADD CONSTRAINT `parkingzone_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`),
ADD CONSTRAINT `parkingzone_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `parking_assignment`
--
ALTER TABLE `parking_assignment` ADD CONSTRAINT `parking_assignment_ibfk_1` FOREIGN KEY (`parkingSlot_id`) REFERENCES `parkingslot` (`parkingSlot_id`),
ADD CONSTRAINT `parking_assignment_ibfk_2` FOREIGN KEY (`User_id`) REFERENCES `user` (`user_id`),
ADD CONSTRAINT `parking_assignment_ibfk_3` FOREIGN KEY (`Vehicle_id`) REFERENCES `vehicle` (`vehicle_id`),
ADD CONSTRAINT `parking_assignment_ibfk_4` FOREIGN KEY (`tariff_id`) REFERENCES `tariff` (`tariff_id`),
ADD CONSTRAINT `parking_assignment_ibfk_5` FOREIGN KEY (`Status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `payment`
--
ALTER TABLE `payment` ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
ADD CONSTRAINT `payment_ibfk_2` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`invoice_id`),
ADD CONSTRAINT `payment_ibfk_3` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`reservation_id`),
ADD CONSTRAINT `payment_ibfk_4` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `permissions_module_role`
--
ALTER TABLE `permissions_module_role` ADD CONSTRAINT `permissions_module_role_ibfk_1` FOREIGN KEY (`module_role_id`) REFERENCES `module_role` (`module_role_id`),
ADD CONSTRAINT `permissions_module_role_ibfk_2` FOREIGN KEY (`permissions_id`) REFERENCES `permissions` (`permissions_id`);

--
-- Filtros para la tabla `profile`
--
ALTER TABLE `profile` ADD CONSTRAINT `profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Filtros para la tabla `report`
--
ALTER TABLE `report` ADD CONSTRAINT `report_ibfk_1` FOREIGN KEY (`User_id`) REFERENCES `user` (`user_id`),
ADD CONSTRAINT `report_ibfk_2` FOREIGN KEY (`report_type_id`) REFERENCES `report_type` (`report_type_id`),
ADD CONSTRAINT `report_ibfk_3` FOREIGN KEY (`Status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `reservation`
--
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`amenity_id`) REFERENCES `amenity` (`amenity_id`),
ADD CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
ADD CONSTRAINT `reservation_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`),
ADD CONSTRAINT `reservation_ibfk_4` FOREIGN KEY (`tariff_id`) REFERENCES `tariff` (`tariff_id`);

--
-- Filtros para la tabla `role`
--
ALTER TABLE `role` ADD CONSTRAINT `role_ibfk_1` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `role_permissions`
--
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`Role_id`) REFERENCES `role` (`role_id`),
ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`Permissions_id`) REFERENCES `permissions` (`permissions_id`);

--
-- Filtros para la tabla `tariff`
--
ALTER TABLE `tariff` ADD CONSTRAINT `tariff_ibfk_1` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `user`
--
ALTER TABLE `user` ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`),
ADD CONSTRAINT `user_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `user_property`
--
ALTER TABLE `user_property` ADD CONSTRAINT `user_property_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
ADD CONSTRAINT `user_property_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`),
ADD CONSTRAINT `user_property_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `vehicle`
--
ALTER TABLE `vehicle` ADD CONSTRAINT `vehicle_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
ADD CONSTRAINT `vehicle_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`),
ADD CONSTRAINT `vehicle_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`);

--
-- Filtros para la tabla `visitor`
--
ALTER TABLE `visitor` ADD CONSTRAINT `visitor_ibfk_1` FOREIGN KEY (`Property_id`) REFERENCES `property` (`property_id`),
ADD CONSTRAINT `visitor_ibfk_2` FOREIGN KEY (`Status_id`) REFERENCES `status` (`status_id`),
ADD CONSTRAINT `visitor_ibfk_3` FOREIGN KEY (`Vehicle_id`) REFERENCES `vehicle` (`vehicle_id`),
ADD CONSTRAINT `visitor_ibfk_4` FOREIGN KEY (`parkingSlot_id`) REFERENCES `parkingslot` (`parkingSlot_id`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;

/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
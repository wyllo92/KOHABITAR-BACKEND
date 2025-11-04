DROP TABLE IF EXISTS `amenity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `amenity` (
  `amenity_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `capacity` int DEFAULT NULL,
  `description` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status_id` int DEFAULT NULL,
  `amenity_type_id` int DEFAULT NULL,
  `created_at` date DEFAULT NULL,
  `updated_at` date DEFAULT NULL,
  PRIMARY KEY (`amenity_id`),
  KEY `status_id` (`status_id`),
  KEY `amenity_type_id` (`amenity_type_id`),
  KEY `idx_amenity_name` (`name`),
  CONSTRAINT `amenity_ibfk_1` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `amenity_ibfk_4` FOREIGN KEY (`amenity_type_id`) REFERENCES `amenity_type` (`Amenity_Type_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `amenity_type`
--

DROP TABLE IF EXISTS `amenity_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `amenity_type` (
  `Amenity_Type_id` int NOT NULL AUTO_INCREMENT,
  `Amenity_Type_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `Amenity_Type_description` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Amenity_Type_is_active` tinyint(1) NOT NULL DEFAULT '1',
  `Amenity_Type_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Amenity_Type_id`),
  KEY `idx_amenity_type_name` (`Amenity_Type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cpcg`
--

DROP TABLE IF EXISTS `cpcg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cpcg` (
  `CPCG_id` int NOT NULL AUTO_INCREMENT,
  `User_id` int NOT NULL,
  `Property_id` int NOT NULL,
  `CPCG_type_id` int NOT NULL,
  `CPCG_description` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Status_id` int NOT NULL,
  `CPCG_createAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CPCG_updateAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CPCG_id`),
  KEY `User_id` (`User_id`),
  KEY `Property_id` (`Property_id`),
  KEY `CPCG_type_id` (`CPCG_type_id`),
  KEY `Status_id` (`Status_id`),
  CONSTRAINT `cpcg_ibfk_1` FOREIGN KEY (`User_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cpcg_ibfk_2` FOREIGN KEY (`Property_id`) REFERENCES `property` (`property_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cpcg_ibfk_3` FOREIGN KEY (`CPCG_type_id`) REFERENCES `cpcg_type` (`CPCG_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `cpcg_ibfk_4` FOREIGN KEY (`Status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cpcg_type`
--

DROP TABLE IF EXISTS `cpcg_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cpcg_type` (
  `CPCG_type_id` int NOT NULL AUTO_INCREMENT,
  `CPCG_type_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `CPCG_type_description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CPCG_type_is_active` tinyint(1) NOT NULL DEFAULT '1',
  `CPCG_type_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CPCG_type_id`),
  KEY `idx_cpcg_type_name` (`CPCG_type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `property_id` int NOT NULL,
  `tariff_id` int NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `due_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `amount` decimal(10,2) NOT NULL,
  `status_id` int NOT NULL,
  `description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_id`),
  KEY `user_id` (`user_id`),
  KEY `property_id` (`property_id`),
  KEY `tariff_id` (`tariff_id`),
  KEY `status_id` (`status_id`),
  KEY `idx_invoice_date` (`date`),
  KEY `idx_invoice_due_date` (`due_date`),
  CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_3` FOREIGN KEY (`tariff_id`) REFERENCES `tariff` (`tariff_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_4` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `module`
--

DROP TABLE IF EXISTS `module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module` (
  `module_id` int NOT NULL AUTO_INCREMENT,
  `module_route` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `module_description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`module_id`),
  UNIQUE KEY `module_route` (`module_route`),
  KEY `idx_module_route` (`module_route`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `module_role`
--

DROP TABLE IF EXISTS `module_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `module_role` (
  `module_role_id` int NOT NULL AUTO_INCREMENT,
  `module_id` int NOT NULL,
  `role_id` int NOT NULL,
  `can_view` tinyint(1) DEFAULT '1',
  `can_create` tinyint(1) DEFAULT '0',
  `can_edit` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`module_role_id`),
  UNIQUE KEY `uk_module_role` (`module_id`,`role_id`),
  KEY `module_id` (`module_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `module_role_ibfk_1` FOREIGN KEY (`module_id`) REFERENCES `module` (`module_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `module_role_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `Notification_id` int NOT NULL AUTO_INCREMENT,
  `User_id` int NOT NULL,
  `Property_id` int NOT NULL,
  `Notification_type_id` int NOT NULL,
  `Notification_title` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Notification_message` varchar(500) COLLATE utf8mb4_general_ci NOT NULL,
  `Status_id` int NOT NULL,
  `Notification_priority` int NOT NULL,
  `Notification_createAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Notification_updateAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Notification_id`),
  KEY `User_id` (`User_id`),
  KEY `Property_id` (`Property_id`),
  KEY `Notification_type_id` (`Notification_type_id`),
  KEY `Status_id` (`Status_id`),
  KEY `idx_notification_priority` (`Notification_priority`),
  CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`User_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`Property_id`) REFERENCES `property` (`property_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `notification_ibfk_3` FOREIGN KEY (`Notification_type_id`) REFERENCES `notification_type` (`Notification_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `notification_ibfk_4` FOREIGN KEY (`Status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_type`
--

DROP TABLE IF EXISTS `notification_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_type` (
  `Notification_type_id` int NOT NULL AUTO_INCREMENT,
  `Notification_type_name` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `Notification_type_description` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Notification_type_is_active` tinyint(1) NOT NULL DEFAULT '1',
  `Notification_type_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Notification_type_id`),
  KEY `idx_notification_type_name` (`Notification_type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `package`
--

DROP TABLE IF EXISTS `package`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `package` (
  `Package_id` int NOT NULL AUTO_INCREMENT,
  `Package_description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Status_id` int NOT NULL,
  `User_id` int NOT NULL,
  `Property_id` int NOT NULL,
  `Package_entryAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Package_exitAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Package_id`),
  KEY `Status_id` (`Status_id`),
  KEY `User_id` (`User_id`),
  KEY `Property_id` (`Property_id`),
  KEY `idx_package_entry` (`Package_entryAt`),
  CONSTRAINT `package_ibfk_1` FOREIGN KEY (`Status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `package_ibfk_2` FOREIGN KEY (`User_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `package_ibfk_3` FOREIGN KEY (`Property_id`) REFERENCES `property` (`property_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parking_assignment`
--

DROP TABLE IF EXISTS `parking_assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parking_assignment` (
  `parking_Assignment_id` int NOT NULL AUTO_INCREMENT,
  `parkingSlot_id` int NOT NULL,
  `User_id` int NOT NULL,
  `Vehicle_id` int NOT NULL,
  `tariff_id` int NOT NULL,
  `Status_id` int NOT NULL,
  `parking_Assignment_start_time` datetime NOT NULL,
  `parking_Assignment_end_time` datetime DEFAULT NULL,
  `parking_Assignment_total_amount` decimal(10,2) NOT NULL,
  `parking_Assignment_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`parking_Assignment_id`),
  KEY `parkingSlot_id` (`parkingSlot_id`),
  KEY `User_id` (`User_id`),
  KEY `Vehicle_id` (`Vehicle_id`),
  KEY `tariff_id` (`tariff_id`),
  KEY `Status_id` (`Status_id`),
  KEY `idx_parking_assignment_start_time` (`parking_Assignment_start_time`),
  CONSTRAINT `parking_assignment_ibfk_1` FOREIGN KEY (`parkingSlot_id`) REFERENCES `parkingslot` (`parkingSlot_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `parking_assignment_ibfk_2` FOREIGN KEY (`User_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `parking_assignment_ibfk_3` FOREIGN KEY (`Vehicle_id`) REFERENCES `vehicle` (`vehicle_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `parking_assignment_ibfk_4` FOREIGN KEY (`tariff_id`) REFERENCES `tariff` (`tariff_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `parking_assignment_ibfk_5` FOREIGN KEY (`Status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parkingslot`
--

DROP TABLE IF EXISTS `parkingslot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parkingslot` (
  `parkingSlot_id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `parkingZone_id` int NOT NULL,
  `status_id` int NOT NULL,
  `is_reserved` tinyint(1) DEFAULT '0',
  `time_unit` int DEFAULT NULL,
  `total` double DEFAULT NULL,
  `tariff_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`parkingSlot_id`),
  KEY `parkingZone_id` (`parkingZone_id`),
  KEY `status_id` (`status_id`),
  KEY `tariff_id` (`tariff_id`),
  KEY `idx_parkingslot_code` (`code`),
  CONSTRAINT `parkingslot_ibfk_1` FOREIGN KEY (`parkingZone_id`) REFERENCES `parkingzone` (`parkingZone_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `parkingslot_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `parkingslot_ibfk_3` FOREIGN KEY (`tariff_id`) REFERENCES `tariff` (`tariff_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `parkingzone`
--

DROP TABLE IF EXISTS `parkingzone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parkingzone` (
  `parkingZone_id` int NOT NULL AUTO_INCREMENT,
  `type` int NOT NULL,
  `capacity` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `property_id` int NOT NULL,
  `status_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`parkingZone_id`),
  KEY `property_id` (`property_id`),
  KEY `status_id` (`status_id`),
  KEY `idx_parkingzone_type` (`type`),
  CONSTRAINT `parkingzone_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `parkingzone_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount_paid` double NOT NULL,
  `payment_date` datetime NOT NULL,
  `method` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reference` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `invoice_id` int DEFAULT NULL,
  `reservation_id` int DEFAULT NULL,
  `parking_assignment_id` int DEFAULT NULL,
  `status_id` int DEFAULT NULL,
  `payment_type_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `user_id` (`user_id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `reservation_id` (`reservation_id`),
  KEY `parking_assignment_id` (`parking_assignment_id`),
  KEY `status_id` (`status_id`),
  KEY `idx_payment_date` (`payment_date`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `payment_ibfk_2` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`invoice_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `payment_ibfk_3` FOREIGN KEY (`reservation_id`) REFERENCES `reservation` (`reservation_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `payment_ibfk_4` FOREIGN KEY (`parking_assignment_id`) REFERENCES `parking_assignment` (`parking_Assignment_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `payment_ibfk_5` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `permissions_id` int NOT NULL AUTO_INCREMENT,
  `permissions_name` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `permissions_description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`permissions_id`),
  UNIQUE KEY `permissions_name` (`permissions_name`),
  KEY `idx_permissions_name` (`permissions_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `permissions_module_role`
--

DROP TABLE IF EXISTS `permissions_module_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions_module_role` (
  `permissions_module_role_id` int NOT NULL AUTO_INCREMENT,
  `module_role_id` int NOT NULL,
  `permissions_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`permissions_module_role_id`),
  UNIQUE KEY `uk_permissions_module_role` (`module_role_id`,`permissions_id`),
  KEY `module_role_id` (`module_role_id`),
  KEY `permissions_id` (`permissions_id`),
  CONSTRAINT `permissions_module_role_ibfk_1` FOREIGN KEY (`module_role_id`) REFERENCES `module_role` (`module_role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `permissions_module_role_ibfk_2` FOREIGN KEY (`permissions_id`) REFERENCES `permissions` (`permissions_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profile`
--

DROP TABLE IF EXISTS `profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profile` (
  `user_id` int NOT NULL,
  `profile_fullName` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `profile_phone` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `profile_email` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `profile_photo` varchar(256) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `profile_address` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `profile_email` (`profile_email`),
  KEY `idx_profile_email` (`profile_email`),
  CONSTRAINT `profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `property`
--

DROP TABLE IF EXISTS `property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property` (
  `property_id` int NOT NULL AUTO_INCREMENT,
  `property_name` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `property_description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `property_type` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `property_createAt` date NOT NULL,
  `property_updateAt` date NOT NULL,
  `status_id` int NOT NULL,
  PRIMARY KEY (`property_id`),
  UNIQUE KEY `property_name` (`property_name`),
  KEY `status_id` (`status_id`),
  KEY `idx_property_type` (`property_type`),
  CONSTRAINT `property_ibfk_1` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `Report_id` int NOT NULL AUTO_INCREMENT,
  `User_id` int NOT NULL,
  `Report_title` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Report_description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `report_type_id` int NOT NULL,
  `Status_id` int NOT NULL,
  `Report_file_url` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Report_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Report_id`),
  KEY `User_id` (`User_id`),
  KEY `report_type_id` (`report_type_id`),
  KEY `Status_id` (`Status_id`),
  KEY `idx_report_created` (`Report_created_at`),
  CONSTRAINT `report_ibfk_1` FOREIGN KEY (`User_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `report_ibfk_2` FOREIGN KEY (`report_type_id`) REFERENCES `report_type` (`report_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `report_ibfk_3` FOREIGN KEY (`Status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_type`
--

DROP TABLE IF EXISTS `report_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_type` (
  `report_type_id` int NOT NULL AUTO_INCREMENT,
  `report_type_name` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `report_type_description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `report_type_is_active` tinyint(1) NOT NULL,
  `report_type_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_type_id`),
  KEY `idx_report_type_name` (`report_type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reservation`
--

DROP TABLE IF EXISTS `reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservation` (
  `reservation_id` int NOT NULL AUTO_INCREMENT,
  `amenity_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status_id` int DEFAULT NULL,
  `reservation_createAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `reservation_start_time` datetime DEFAULT NULL,
  `reservation_end_time` datetime DEFAULT NULL,
  `reservation_capacity` int DEFAULT NULL,
  PRIMARY KEY (`reservation_id`),
  KEY `amenity_id` (`amenity_id`),
  KEY `user_id` (`user_id`),
  KEY `status_id` (`status_id`),
  KEY `idx_reservation_start_time` (`reservation_start_time`),
  KEY `idx_reservation_end_time` (`reservation_end_time`),
  CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`amenity_id`) REFERENCES `amenity` (`amenity_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reservation_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `role_description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status_id` int NOT NULL,
  `role_createAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`),
  KEY `status_id` (`status_id`),
  KEY `idx_role_name` (`role_name`),
  CONSTRAINT `role_ibfk_1` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `Role_id` int NOT NULL,
  `Permissions_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Role_id`,`Permissions_id`),
  KEY `Permissions_id` (`Permissions_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`Role_id`) REFERENCES `role` (`role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`Permissions_id`) REFERENCES `permissions` (`permissions_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status` (
  `status_id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `status_description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status_entity` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `status_is_active` tinyint(1) NOT NULL DEFAULT '1',
  `status_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`status_id`),
  KEY `idx_status_name` (`status_name`),
  KEY `idx_status_entity` (`status_entity`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tariff`
--

DROP TABLE IF EXISTS `tariff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tariff` (
  `tariff_id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `surcharge_amount` double DEFAULT NULL,
  `surcharge_status` tinyint(1) DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `status_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tariff_id`),
  KEY `status_id` (`status_id`),
  KEY `idx_tariff_type` (`type`),
  CONSTRAINT `tariff_ibfk_1` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `user_password` varchar(256) COLLATE utf8mb4_general_ci NOT NULL,
  `role_id` int NOT NULL,
  `status_id` int NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name` (`user_name`),
  KEY `role_id` (`role_id`),
  KEY `status_id` (`status_id`),
  KEY `idx_user_name` (`user_name`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `user_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_property`
--

DROP TABLE IF EXISTS `user_property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_property` (
  `user_property_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `property_id` int NOT NULL,
  `status_id` int NOT NULL,
  `user_property_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_property_id`),
  UNIQUE KEY `uk_user_property` (`user_id`,`property_id`),
  KEY `user_id` (`user_id`),
  KEY `property_id` (`property_id`),
  KEY `status_id` (`status_id`),
  CONSTRAINT `user_property_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_property_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_property_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle`
--

DROP TABLE IF EXISTS `vehicle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle` (
  `vehicle_id` int NOT NULL AUTO_INCREMENT,
  `model` varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
  `type` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `color` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `license_plate` varchar(10) COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` int NOT NULL,
  `property_id` int NOT NULL,
  `parkingZone_id` int DEFAULT NULL,
  `status_id` int NOT NULL,
  `vehicle_createAt` date NOT NULL,
  `vehicle_updateAt` date NOT NULL,
  PRIMARY KEY (`vehicle_id`),
  UNIQUE KEY `license_plate` (`license_plate`),
  KEY `user_id` (`user_id`),
  KEY `property_id` (`property_id`),
  KEY `parkingZone_id` (`parkingZone_id`),
  KEY `status_id` (`status_id`),
  KEY `idx_vehicle_license` (`license_plate`),
  CONSTRAINT `vehicle_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_2` FOREIGN KEY (`property_id`) REFERENCES `property` (`property_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_3` FOREIGN KEY (`parkingZone_id`) REFERENCES `parkingzone` (`parkingZone_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehicle_ibfk_4` FOREIGN KEY (`status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `visitor`
--

DROP TABLE IF EXISTS `visitor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitor` (
  `Visitor_id` int NOT NULL AUTO_INCREMENT,
  `Visitor_full_name` varchar(25) COLLATE utf8mb4_general_ci NOT NULL,
  `Visitor_id_document` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Visitor_visit_reason` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Visitor_entry_time` datetime NOT NULL,
  `Visitor_exit_time` datetime DEFAULT NULL,
  `Visitor_authorized_by` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `Property_id` int NOT NULL,
  `Status_id` int NOT NULL,
  `Vehicle_id` int DEFAULT NULL,
  `parkingSlot_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Visitor_id`),
  KEY `Property_id` (`Property_id`),
  KEY `Status_id` (`Status_id`),
  KEY `Vehicle_id` (`Vehicle_id`),
  KEY `parkingSlot_id` (`parkingSlot_id`),
  KEY `idx_visitor_entry_time` (`Visitor_entry_time`),
  KEY `idx_visitor_document` (`Visitor_id_document`),
  CONSTRAINT `visitor_ibfk_1` FOREIGN KEY (`Property_id`) REFERENCES `property` (`property_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `visitor_ibfk_2` FOREIGN KEY (`Status_id`) REFERENCES `status` (`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `visitor_ibfk_3` FOREIGN KEY (`Vehicle_id`) REFERENCES `vehicle` (`vehicle_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `visitor_ibfk_4` FOREIGN KEY (`parkingSlot_id`) REFERENCES `parkingslot` (`parkingSlot_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_parking_availability`(IN zoneId INT)
BEGIN
    SELECT ps.parkingSlot_id, ps.code, ps.is_reserved, ps.status_id, s.status_name
    FROM parkingslot ps
    INNER JOIN status s ON ps.status_id = s.status_id
    WHERE ps.parkingZone_id = zoneId AND ps.status_id = 1
    ORDER BY ps.code;
END ;;
DELIMITER ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_pending_payments`(IN userId INT)
BEGIN
    SELECT i.invoice_id, i.amount, i.due_date, i.description, t.type AS tariff_type
    FROM invoice i
    INNER JOIN tariff t ON i.tariff_id = t.tariff_id
    WHERE i.user_id = userId AND i.status_id = 3
    ORDER BY i.due_date ASC;
END ;;
DELIMITER ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_property_residents`(IN propertyId INT)
BEGIN
    SELECT u.user_id, p.profile_fullName, p.profile_phone, p.profile_email, r.role_name
    FROM user_property up
    INNER JOIN user u ON up.user_id = u.user_id
    INNER JOIN profile p ON u.user_id = p.user_id
    INNER JOIN role r ON u.role_id = r.role_id
    WHERE up.property_id = propertyId AND up.status_id = 1;
END ;;
DELIMITER ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_user_permissions`(IN userId INT, IN roleId INT)
BEGIN
    SELECT DISTINCT p.permissions_name, m.module_route, mr.can_view, mr.can_create, mr.can_edit, mr.can_delete
    FROM user u
    INNER JOIN role r ON u.role_id = r.role_id
    INNER JOIN module_role mr ON r.role_id = mr.role_id
    INNER JOIN module m ON mr.module_id = m.module_id
    INNER JOIN permissions_module_role pmr ON mr.module_role_id = pmr.module_role_id
    INNER JOIN permissions p ON pmr.permissions_id = p.permissions_id
    WHERE u.user_id = userId AND u.role_id = roleId AND u.status_id = 1;
END ;;
DELIMITER ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_user_reservations`(IN userId INT)
BEGIN
    SELECT r.reservation_id, a.name AS amenity_name, r.reservation_start_time, 
           r.reservation_end_time, r.reservation_capacity, s.status_name
    FROM reservation r
    INNER JOIN amenity a ON r.amenity_id = a.amenity_id
    INNER JOIN status s ON r.status_id = s.status_id
    WHERE r.user_id = userId
    ORDER BY r.reservation_start_time DESC;
END ;;
DELIMITER ;

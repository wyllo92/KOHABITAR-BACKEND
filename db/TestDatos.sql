-- SCRIPT DE PRUEBA CONJUNTO RESIDENCIAL

USE conjunto_residencial;

-- PASO 1: LIMPIAR DATOS EXISTENTES
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE visitors;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE properties;
TRUNCATE TABLE reports;
TRUNCATE TABLE report_types;
TRUNCATE TABLE user_properties;
TRUNCATE TABLE packages;
TRUNCATE TABLE notifications;
TRUNCATE TABLE payments;
TRUNCATE TABLE parking_assignments;
TRUNCATE TABLE reservations;
TRUNCATE TABLE invoices;
TRUNCATE TABLE vehicles;
TRUNCATE TABLE parking_slots;
TRUNCATE TABLE parking_zones;
TRUNCATE TABLE amenities;
TRUNCATE TABLE cpcgs;
TRUNCATE TABLE cpcg_types;
TRUNCATE TABLE notification_types;
TRUNCATE TABLE amenity_types;
TRUNCATE TABLE property_types;
TRUNCATE TABLE tariffs;
TRUNCATE TABLE profiles;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
TRUNCATE TABLE statuses;
TRUNCATE TABLE parking_lotteries;
TRUNCATE TABLE lottery_participants;

SET FOREIGN_KEY_CHECKS = 1;

-- PASO 2: INSERTAR ESTADOS BÁSICOS ESPECÍFICOS POR ENTIDAD
INSERT INTO statuses (name, description, entity) VALUES
-- Estados para Propiedades
('Activa', 'Propiedad activa y habilitada', 'property'),
('Inactiva', 'Propiedad inactiva temporalmente', 'property'),

-- Estados para Amenities (Zonas Comunes)
('Disponible', 'Zona común disponible para uso', 'amenity'),
('En Mantenimiento', 'Zona común en mantenimiento', 'amenity'),
('Cerrada', 'Zona común cerrada temporalmente', 'amenity'),
('Reservada', 'Zona común reservada', 'amenity'),
('Fuera de Servicio', 'Zona común fuera de servicio', 'amenity'),

-- Estados para CPCG (Peticiones, Quejas, Reclamos, Sugerencias)
('Creado', 'PQRS creado y pendiente de revisión', 'cpcg'),
('En Proceso', 'PQRS en proceso de atención', 'cpcg'),
('Resuelto', 'PQRS resuelto satisfactoriamente', 'cpcg'),
('Cerrado', 'PQRS cerrado', 'cpcg'),
('Escalado', 'PQRS escalado a nivel superior', 'cpcg'),

-- Estados para Notificaciones
('Enviado', 'Notificación enviada al usuario', 'notification'),
('Leído', 'Notificación leída por el usuario', 'notification'),
('No Entregado', 'Notificación no pudo ser entregada', 'notification'),

-- Estados para Pagos
('Pagado', 'Pago completado exitosamente', 'payment'),
('Fallido', 'Pago fallido o rechazado', 'payment'),
('Pendiente de Confirmación', 'Pago pendiente de confirmación', 'payment'),
('Reembolsado', 'Pago reembolsado al usuario', 'payment'),

-- Estados para Paquetes
('Entregado', 'Paquete entregado al residente', 'package'),
('No Reclamado', 'Paquete no reclamado', 'package'),
('Devuelto', 'Paquete devuelto al remitente', 'package'),
('En Espera', 'Paquete en espera de recogida', 'package'),

-- Estados para Facturas
('Generada', 'Factura generada pendiente de pago', 'invoice'),
('Vencida', 'Factura con fecha de vencimiento pasada', 'invoice'),
('Parcialmente Pagada', 'Factura con pago parcial', 'invoice'),
('Anulada', 'Factura anulada', 'invoice'),

-- Estados para Usuarios
('Activo', 'Usuario activo en el sistema', 'user'),
('Inactivo', 'Usuario inactivo temporalmente', 'user'),
('Suspendido', 'Usuario suspendido por infracción', 'user'),
('Eliminado', 'Usuario eliminado del sistema', 'user'),

-- Estados para Zonas de Parqueo
('Operativa', 'Zona de parqueo operativa', 'parking_zone'),
('En Mantenimiento', 'Zona en mantenimiento temporal', 'parking_zone'),
('Cerrada', 'Zona cerrada permanentemente', 'parking_zone'),
('Llena', 'Zona con capacidad completa', 'parking_zone'),

-- Estados para Espacios de Parqueo
('Disponible', 'Espacio disponible para uso', 'parking_slot'),
('Ocupado', 'Espacio actualmente ocupado', 'parking_slot'),
('Reservado', 'Espacio reservado temporalmente', 'parking_slot'),
('En Reparación', 'Espacio en reparación', 'parking_slot'),
('Deshabilitado', 'Espacio deshabilitado permanentemente', 'parking_slot'),

-- Estados para Sorteos de Parqueo
('Programado', 'Sorteo programado para fecha futura', 'parking_lottery'),
('En Curso', 'Sorteo actualmente en proceso', 'parking_lottery'),
('Completado', 'Sorteo finalizado exitosamente', 'parking_lottery'),
('Cancelado', 'Sorteo cancelado', 'parking_lottery'),
('Suspendido', 'Sorteo suspendido temporalmente', 'parking_lottery'),

-- Estados para Vehículos
('Registrado', 'Vehículo registrado y autorizado', 'vehicle'),
('En Revisión', 'Vehículo en proceso de revisión documental', 'vehicle'),
('Inactivo', 'Vehículo rechazado por incumplimiento', 'vehicle'),
('Suspendido', 'Vehículo suspendido temporalmente', 'vehicle'),

-- Estados para Visitantes
('Dentro', 'Visitante actualmente dentro del conjunto', 'visitor'),
('Fuera', 'Visitante ha salido del conjunto', 'visitor'),
('Autorizado', 'Visitante autorizado para ingreso', 'visitor'),
('No Autorizado', 'Visitante no autorizado para ingreso', 'visitor'),

-- Estados para Reservas

('Pendiente', 'Reserva creada pendiente de confirmación', 'reservation'),
('Confirmada', 'Reserva confirmada y activa', 'reservation'),
('En curso', 'Reserva actualmente en uso', 'reservation'),
('Completada', 'Reserva finalizada exitosamente', 'reservation'),
('Cancelada', 'Reserva cancelada por el usuario o sistema', 'reservation'),
('Expirada', 'Reserva no confirmada y expirada', 'reservation'),
('No presentado', 'Usuario no se presentó para la reserva', 'reservation');

-- PASO 3: ROLES DEL SISTEMA
INSERT INTO roles (name, description, status_id) VALUES
('Administrador', 'Administrador principal del sistema', 1),
('Propietario', 'Dueño de propiedad', 1),
('Residente', 'Persona que habita la propiedad', 1),
('Vigilante', 'Personal de seguridad', 1);

-- PASO 4: USUARIOS PRINCIPALES
INSERT INTO users (username, password, role_id, status_id) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 26),
('propietario1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 26),
('propietario2', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 26),
('residente1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 26),
('residente2', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 26),
('vigilante1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 26);

-- PASO 5: PERFILES DE USUARIOS
INSERT INTO profiles (user_id, full_name, phone, email, address) VALUES
(1, 'Ana María Rodríguez', '+57 301 123 4567', 'admin@conjunto.com', 'Oficina Administración'),
(2, 'Carlos Andrés Gómez', '+57 302 234 5678', 'carlos.gomez@email.com', 'Casa 101 - Seccion 1'),
(3, 'María Fernanda López', '+57 303 345 6789', 'maria.lopez@email.com', 'Casa 102 - Seccion 1'),
(4, 'Juan Sebastián Martínez', '+57 304 456 7890', 'juan.martinez@email.com', 'Casa 201 - Seccion 2'),
(5, 'Diana Patricia Hernández', '+57 305 567 8901', 'diana.hernandez@email.com', 'Casa 202 - Seccion 2'),
(6, 'Luis Eduardo Ramírez', '+57 306 678 9012', 'luis.ramirez@email.com', 'Portería Principal');

-- PASO 6: TIPOS DE PROPIEDAD
INSERT INTO property_types (name, description, is_active) VALUES
('Apartamento', 'Unidad residencial en edificio', 1),
('Casa', 'Vivienda unifamiliar', 1),
('Penthouse', 'Casa de lujo en último piso', 1),
('Duplex', 'Casa de dos niveles', 1),
('Local Comercial', 'Espacio para negocio', 1);

-- PASO 7: PROPIEDADES
INSERT INTO properties (property_type_id, name, description, status_id) VALUES
(2, 'Casa 101 - Seccion 1', 'Casa de 3 habitaciones, 2 baños', 1),
(2, 'Casa 102 - Seccion 1', 'Casa de 2 habitaciones, 2 baños', 1),
(2, 'Casa 201 - Zona Norte', 'Casa de 4 habitaciones, 3 baños con jardín', 1),
(2, 'Casa 202 - Zona Sur', 'Casa de 3 habitaciones, 2 baños', 1),
(3, 'Penthouse 301 - Seccion 2', 'Penthouse de lujo con terraza', 1);

-- PASO 8: RELACIÓN USUARIOS-PROPIEDADES
INSERT INTO user_properties (user_id, property_id, is_owner, status_id, start_date) VALUES
(2, 1, 1, 1, '2023-01-15'),
(3, 2, 1, 1, '2023-02-20'),
(4, 1, 0, 1, '2023-03-10'),
(5, 3, 0, 1, '2023-04-05'),
(2, 4, 1, 1, '2023-05-12');

-- PASO 9: TARIFAS
INSERT INTO tariffs (name, description, amount) VALUES
('Administración Mensual Casa', 'Cuota administración casa', 320000.00),
('Parqueadero Visitante Hora', 'Tarifa por hora visitantes', 2000.00),
('Reserva Salón Comunal', 'Alquiler salón por 4 horas', 120000.00),
('Multa Retraso Pago', 'Cargo por mora en pago', 35000.00),
('Parqueadero Mensual', 'Cuota mensual parqueadero', 80000.00);

-- PASO 10: TIPOS DE ZONAS COMUNES
INSERT INTO amenity_types (name, description, is_active) VALUES
('Recreativa', 'Espacios recreativos y de descanso', 1),
('Deportiva', 'Instalaciones deportivas', 1),
('Social', 'Áreas para eventos sociales', 1),
('Servicios', 'Espacios de servicio común', 1),
('Infantil', 'Zonas para niños', 1);

-- PASO 11: ZONAS COMUNES
INSERT INTO amenities (amenity_type_id, status_id, tariff_id, name, description, capacity) VALUES
(3, 3, 3, 'Salón Comunal Principal', 'Salón para eventos con cocina', 50),
(2, 3, NULL, 'Gimnasio', 'Equipamiento deportivo completo', 15),
(1, 3, NULL, 'Piscina Principal', 'Piscina adultos y niños', 30),
(2, 3, NULL, 'Cancha Múltiple', 'Fútbol, baloncesto y voleibol', 20),
(4, 3, NULL, 'Zona BBQ', 'Área de parrillas y mesas', 25);

-- PASO 12: ZONAS DE PARQUEADERO
INSERT INTO parking_zones (name, type, capacity, status_id) VALUES
('Sótano 1 - Residentes', 'residente', 25, 31),
('Sótano 2 - Visitantes', 'visitante', 15, 31),
('Exterior - Motos', 'moto', 20, 31),
('Sótano 3 - Residentes', 'residente', 20, 31),
('Exterior - Visitantes', 'visitante', 10, 31);

-- PASO 13: ESPACIOS DE PARQUEADERO
INSERT INTO parking_slots (parking_zone_id, code, is_reserved, status_id, tariff_id) VALUES
(1, 'A-01', 1, 36, 5),
(1, 'A-02', 1, 36, 5),
(1, 'A-03', 0, 36, 5),
(1, 'A-04', 0, 36, 5),
(1, 'A-05', 1, 36, 5),
(2, 'V-01', 0, 36, 2),
(2, 'V-02', 0, 36, 2),
(2, 'V-03', 0, 36, 2),
(2, 'V-04', 0, 36, 2),
(2, 'V-05', 0, 36, 2);

-- PASO 14: SORTEOS DE PARQUEADERO
INSERT INTO parking_lotteries (start_date, end_date, parking_zone_id, available_slots, status_id) VALUES
('2024-02-01 00:00:00', '2024-02-15 23:59:59', 1, 5, 41),
('2024-03-01 00:00:00', '2024-03-15 23:59:59', 3, 10, 41);

-- PASO 15: PARTICIPANTES DE SORTEOS
INSERT INTO lottery_participants (lottery_id, user_id, property_id) VALUES
(1, 2, 1),
(1, 3, 2),
(1, 4, 1),
(2, 5, 3),
(2, 2, 4);

-- PASO 16: VEHÍCULOS
INSERT INTO vehicles (user_id, property_id, model, type, color, license_plate, status_id) VALUES
(2, 1, 'Toyota Corolla 2022', 'Automóvil', 'Blanco', 'ABC123', 46),
(3, 2, 'Mazda 3 2021', 'Automóvil', 'Gris', 'DEF456', 46),
(4, 1, 'Kia Rio 2020', 'Automóvil', 'Rojo', 'GHI789', 46),
(5, 3, 'Chevrolet Spark 2023', 'Automóvil', 'Azul', 'JKL012', 46),
(2, 4, 'Honda Civic 2021', 'Automóvil', 'Negro', 'MNO345', 46);

-- PASO 17: FACTURAS
INSERT INTO invoices (user_id, property_id, tariff_id, amount, due_date, status_id) VALUES
(2, 1, 1, 320000.00, '2024-02-10', 22),
(3, 2, 1, 320000.00, '2024-02-10', 23),
(4, 1, 1, 320000.00, '2024-02-10', 22),
(5, 3, 1, 320000.00, '2024-02-10', 22),
(2, 4, 1, 320000.00, '2024-02-10', 22);

-- PASO 18: RESERVACIONES
INSERT INTO reservations (amenity_id, user_id, start_time, end_time, capacity, status_id, tariff_id) VALUES
(1, 2, '2024-02-15 14:00:00', '2024-02-15 18:00:00', 25, 1, 3),
(1, 3, '2024-02-16 16:00:00', '2024-02-16 20:00:00', 30, 1, 3),
(2, 4, '2024-02-17 08:00:00', '2024-02-17 10:00:00', 5, 1, NULL),
(4, 5, '2024-02-18 15:00:00', '2024-02-18 17:00:00', 10, 1, NULL),
(5, 2, '2024-02-20 12:00:00', '2024-02-20 16:00:00', 15, 1, NULL);

-- PASO 19: ASIGNACIONES DE PARQUEADERO
INSERT INTO parking_assignments (parking_slot_id, user_id, vehicle_id, start_time, end_time, total_amount, status_id, lottery_id) VALUES
(1, 2, 1, '2024-01-01 00:00:00', NULL, 80000.00, 1, 1),
(2, 3, 2, '2024-01-01 00:00:00', NULL, 80000.00, 1, NULL),
(3, 4, 3, '2024-01-01 00:00:00', NULL, 80000.00, 1, NULL),
(5, 2, 5, '2024-01-01 00:00:00', NULL, 80000.00, 1, NULL),
(6, 2, NULL, '2024-02-01 10:00:00', '2024-02-01 14:00:00', 8000.00, 1, NULL);

-- PASO 20: PAGOS
INSERT INTO payments (user_id, amount_paid, payment_date, method, reference, invoice_id, reservation_id, parking_assignment_id, status_id) VALUES
(2, 320000.00, '2024-02-01 09:30:00', 'Transferencia', 'TRF-001', 1, NULL, NULL, 17),
(3, 320000.00, '2024-02-02 10:15:00', 'Efectivo', 'EFC-001', 2, NULL, NULL, 17),
(2, 120000.00, '2024-02-03 11:00:00', 'PSE', 'PSE-001', NULL, 1, NULL, 17),
(2, 8000.00, '2024-02-01 14:30:00', 'Efectivo', 'EFC-002', NULL, NULL, 5, 17),
(4, 320000.00, '2024-02-04 16:45:00', 'Transferencia', 'TRF-002', 3, NULL, NULL, 17);

-- PASO 21: TIPOS DE NOTIFICACIONES
INSERT INTO notification_types (name, description) VALUES
('Mantenimiento', 'Avisos de mantenimiento programado'),
('Evento', 'Eventos y actividades del conjunto'),
('Seguridad', 'Alertas de seguridad'),
('Administrativo', 'Comunicados administrativos'),
('Urgente', 'Notificaciones urgentes');

-- PASO 22: NOTIFICACIONES
INSERT INTO notifications (user_id, property_id, notification_type_id, title, message, priority, status_id) VALUES
(2, 1, 1, 'Mantenimiento Piscina', 'La piscina estará en mantenimiento el próximo viernes', 2, 12),
(3, 2, 2, 'Evento Familiar', 'Jornada recreativa este sábado en la zona BBQ', 1, 12),
(4, 1, 3, 'Cámaras de Seguridad', 'Actualización del sistema de cámaras de seguridad', 3, 12),
(5, 3, 4, 'Asamblea General', 'Convocatoria asamblea general de propietarios', 2, 12),
(2, 4, 5, 'Corte de Agua', 'Corte de agua programado para mañana 8:00-12:00', 3, 12);

-- PASO 23: PAQUETES
INSERT INTO packages (description, recipient_user_id, property_id, entry_at, exit_at, status_id) VALUES
('Paquete Amazon - Electrónica', 2, 1, '2024-02-01 09:00:00', '2024-02-01 18:30:00', 18),
('Sobre Bancolombia - Documentos', 3, 2, '2024-02-01 10:15:00', NULL, 19),
('Caja Mercado Libre - Ropa', 4, 1, '2024-02-02 11:30:00', '2024-02-02 19:00:00', 18),
('Paquete DHL - Importación', 5, 3, '2024-02-02 14:20:00', NULL, 19),
('Sobre Avianca - Boletos', 2, 4, '2024-02-03 16:45:00', '2024-02-03 17:30:00', 18);

-- PASO 24: TIPOS DE CPCG
INSERT INTO cpcg_types (name, description) VALUES
('Peticion', 'Solicitud formal de servicio'),
('Queja', 'Manifestación de inconformidad'),
('Reclamo', 'Reporte de problema o daño'),
('Sugerencia', 'Propuesta de mejora'),
('Felicitacion', 'Reconocimiento positivo');

-- PASO 25: CPCG (PETICIONES, QUEJAS, RECLAMOS, SUGERENCIAS)
INSERT INTO cpcgs (user_id, property_id, cpcg_type_id, description, status_id) VALUES
(2, 1, 1, 'Solicito reparación de la cerradura del portón principal', 8),
(3, 2, 2, 'Ruido excesivo en horas de la noche del Casa 201', 9),
(4, 1, 3, 'Fuga de agua en el parqueadero del sótano 1', 8),
(5, 3, 4, 'Sugiero instalar más iluminación en el parque infantil', 10),
(2, 4, 5, 'Felicitaciones por el excelente mantenimiento de las zonas comunes', 10);

-- PASO 26: VISITANTES
INSERT INTO visitors (full_name, id_document, visit_reason, entry_time, exit_time, authorized_user_id, property_id, status_id) VALUES
('Laura Cristina Muñoz', 'CC 52836471', 'Visita familiar', '2024-02-01 15:30:00', '2024-02-01 19:45:00', 2, 1, 50),
('Andrés Felipe Restrepo', 'CC 93485762', 'Entrega de paquete', '2024-02-01 16:15:00', '2024-02-01 16:45:00', 3, 2, 51),
('Marcela Lucía Parra', 'CC 61928374', 'Reunión de trabajo', '2024-02-02 10:00:00', '2024-02-02 13:30:00', 4, 1, 51),
('Oscar Iván Cardona', 'CC 75293846', 'Servicio técnico', '2024-02-02 14:20:00', NULL, 5, 3, 50),
('Natalia Carolina Ríos', 'CC 38572946', 'Visita social', '2024-02-03 18:00:00', '2024-02-03 22:15:00', 2, 4, 51);

-- PASO 27: MÓDULOS DEL SISTEMA
INSERT INTO modules (route, description) VALUES
('/dashboard', 'Panel principal de control'),
('/propiedades', 'Gestión de propiedades'),
('/residentes', 'Administración de residentes'),
('/finanzas', 'Control financiero'),
('/reportes', 'Generación de reportes'),
('/zonas-comunes', 'Gestión de zonas comunes'),
('/parqueaderos', 'Administración de parqueaderos'),
('/visitantes', 'Control de visitantes'),
('/notificaciones', 'Sistema de notificaciones'),
('/configuracion', 'Configuración del sistema');

-- PASO 28: TIPOS DE REPORTES
INSERT INTO report_types (name, description) VALUES
('Financiero', 'Reportes de ingresos y egresos'),
('Reservas', 'Reportes de reservas de zonas comunes'),
('Parqueaderos', 'Reportes de uso de parqueaderos'),
('Visitantes', 'Reportes de registro de visitantes'),
('Mantenimiento', 'Reportes de mantenimiento');

-- PASO 29: REPORTES DE EJEMPLO
INSERT INTO reports (user_id, report_type_id, related_entity_type, related_entity_id, title, description, export_format) VALUES
(1, 1, 'payments', NULL, 'Reporte Financiero Enero 2024', 'Resumen de pagos y facturas del mes de enero', 'PDF'),
(1, 2, 'reservations', NULL, 'Reporte Reservas Zonas Comunes', 'Uso de zonas comunes en el último mes', 'EXCEL'),
(1, 3, 'parking_assignments', NULL, 'Reporte Parqueaderos', 'Ocupación de parqueaderos por zona', 'PDF');

-- CONSULTAS DE VERIFICACIÓN
SELECT '=== VERIFICACIÓN DE DATOS ===' AS '';
SELECT 'Estados:' AS '', COUNT(*) FROM statuses;
SELECT 'Roles:' AS '', COUNT(*) FROM roles;
SELECT 'Usuarios:' AS '', COUNT(*) FROM users;
SELECT 'Perfiles:' AS '', COUNT(*) FROM profiles;
SELECT 'Propiedades:' AS '', COUNT(*) FROM properties;
SELECT 'Vehículos:' AS '', COUNT(*) FROM vehicles;
SELECT 'Facturas:' AS '', COUNT(*) FROM invoices;
SELECT 'Pagos:' AS '', COUNT(*) FROM payments;
SELECT 'Reservaciones:' AS '', COUNT(*) FROM reservations;
SELECT 'Visitantes:' AS '', COUNT(*) FROM visitors;
SELECT 'Notificaciones:' AS '', COUNT(*) FROM notifications;
SELECT 'Paquetes:' AS '', COUNT(*) FROM packages;
SELECT 'CPCG:' AS '', COUNT(*) FROM cpcgs;
SELECT 'Sorteos Parqueadero:' AS '', COUNT(*) FROM parking_lotteries;
SELECT 'Participantes Sorteo:' AS '', COUNT(*) FROM lottery_participants;
SELECT 'Tokens Reset:' AS '', COUNT(*) FROM password_reset_tokens;

-- CONSULTA EJEMPLO: PROPIEDADES CON SUS PROPIETARIOS
SELECT 
    p.name AS propiedad,
    pt.name AS tipo,
    pr.full_name AS propietario,
    pr.phone,
    pr.email
FROM properties p
JOIN property_types pt ON p.property_type_id = pt.property_type_id
JOIN user_properties up ON p.property_id = up.property_id AND up.is_owner = 1
JOIN users u ON up.user_id = u.user_id
JOIN profiles pr ON u.user_id = pr.user_id;

-- CONSULTA EJEMPLO: ESTADO DE FACTURAS
SELECT 
    p.name AS propiedad,
    pr.full_name AS residente,
    i.amount AS monto,
    i.due_date AS vencimiento,
    s.name AS estado
FROM invoices i
JOIN properties p ON i.property_id = p.property_id
JOIN users u ON i.user_id = u.user_id
JOIN profiles pr ON u.user_id = pr.user_id
JOIN statuses s ON i.status_id = s.status_id;

-- CONSULTA EJEMPLO: VEHÍCULOS Y SUS ESTADOS
SELECT 
    v.license_plate AS placa,
    v.model AS modelo,
    v.color AS color,
    pr.full_name AS propietario,
    s.name AS estado
FROM vehicles v
JOIN users u ON v.user_id = u.user_id
JOIN profiles pr ON u.user_id = pr.user_id
JOIN statuses s ON v.status_id = s.status_id;

-- CONSULTA EJEMPLO: VISITANTES Y SUS ESTADOS
SELECT 
    v.full_name AS visitante,
    v.id_document AS documento,
    v.visit_reason AS motivo,
    v.entry_time AS entrada,
    v.exit_time AS salida,
    s.name AS estado
FROM visitors v
JOIN statuses s ON v.status_id = s.status_id;

-- CONSULTA EJEMPLO: AMENITIES Y SUS ESTADOS
SELECT 
    a.name AS amenity,
    at.name AS tipo,
    a.capacity AS capacidad,
    s.name AS estado
FROM amenities a
JOIN amenity_types at ON a.amenity_type_id = at.amenity_type_id
JOIN statuses s ON a.status_id = s.status_id;

SELECT '= SCRIPT COMPLETADO =' AS '';
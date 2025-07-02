# Sistema de Gestión de Conjunto Residencial

Este proyecto ha sido modificado para ser compatible con la base de datos `conjunto_residencial` que gestiona un sistema completo de administración de conjuntos residenciales.

## Estructura de la Base de Datos

La base de datos incluye las siguientes tablas principales:

### Tablas de Usuarios y Autenticación
- **user**: Usuarios del sistema
- **profile**: Perfiles de usuarios con información personal
- **role**: Roles del sistema (Administrador, Residente, Propietario, Vigilante)
- **status**: Estados generales del sistema

### Tablas de Propiedades
- **property**: Propiedades del conjunto residencial
- **user_property**: Relación entre usuarios y propiedades

### Tablas de Vehículos y Parqueaderos
- **vehicle**: Vehículos registrados
- **parkingslot**: Espacios de parqueo individuales
- **parkingzone**: Zonas de parqueo
- **parking_assignment**: Asignaciones de parqueaderos

### Tablas de Amenidades y Reservas
- **amenity**: Amenidades/comodidades del conjunto
- **amenity_type**: Tipos de amenidades
- **reservation**: Reservas de amenidades

### Tablas de Facturación y Pagos
- **invoice**: Facturas generadas
- **payment**: Pagos realizados
- **tariff**: Tarifas del sistema

### Tablas de Visitantes y Notificaciones
- **visitor**: Registro de visitantes
- **notification**: Notificaciones del sistema
- **notification_type**: Tipos de notificaciones

### Tablas de Reportes
- **report**: Reportes del sistema
- **report_type**: Tipos de reportes

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la carpeta `backend` con la siguiente configuración:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=conjunto_residencial
DB_PORT=3306
JWT_SECRET=tu_jwt_secret
```

### 2. Instalación de Dependencias

```bash
cd backend
npm install
```

### 3. Creación de la Base de Datos

Ejecuta el script de migración para crear la base de datos y las tablas:

```bash
npm run migrate:conjunto
```

### 4. Iniciar el Servidor

```bash
npm start
```

## Modelos Disponibles

### Modelos Principales
- `UserModel`: Gestión de usuarios
- `ProfileModel`: Gestión de perfiles
- `RoleModel`: Gestión de roles
- `StatusModel`: Gestión de estados

### Modelos de Propiedades
- `PropertyModel`: Gestión de propiedades
- `VehicleModel`: Gestión de vehículos

### Modelos de Parqueaderos
- `ParkingSlotModel`: Gestión de espacios de parqueo
- `ParkingZoneModel`: Gestión de zonas de parqueo

### Modelos de Amenidades
- `AmenityModel`: Gestión de amenidades
- `ReservationModel`: Gestión de reservas

### Modelos de Facturación
- `InvoiceModel`: Gestión de facturas
- `PaymentModel`: Gestión de pagos
- `TariffModel`: Gestión de tarifas

### Modelos de Visitantes y Notificaciones
- `VisitorModel`: Gestión de visitantes
- `NotificationModel`: Gestión de notificaciones

### Modelos de Reportes
- `ReportModel`: Gestión de reportes

## Funcionalidades Principales

### Gestión de Usuarios
- Crear, leer, actualizar y eliminar usuarios
- Asignar roles y estados
- Gestión de perfiles de usuario

### Gestión de Propiedades
- Registro de propiedades del conjunto
- Asignación de usuarios a propiedades
- Gestión de vehículos por propiedad

### Gestión de Parqueaderos
- Control de espacios de parqueo
- Asignación de parqueaderos
- Gestión de zonas de parqueo

### Gestión de Amenidades
- Registro de amenidades disponibles
- Sistema de reservas
- Control de capacidad y horarios

### Gestión de Facturación
- Generación de facturas
- Control de pagos
- Gestión de tarifas

### Gestión de Visitantes
- Registro de visitantes
- Control de entrada y salida
- Asignación de parqueaderos para visitantes

### Sistema de Notificaciones
- Envío de notificaciones
- Diferentes tipos de notificaciones
- Control de prioridades

### Sistema de Reportes
- Generación de reportes
- Diferentes tipos de reportes
- Control de estados de reportes

## Estructura de Roles

### Administrador
- Acceso completo al sistema
- Gestión de usuarios y propiedades
- Configuración del sistema

### Residente
- Acceso a sus propiedades
- Reserva de amenidades
- Visualización de facturas y pagos

### Propietario
- Gestión de sus propiedades
- Control de residentes
- Visualización de reportes

### Vigilante
- Control de visitantes
- Gestión de parqueaderos
- Registro de incidentes

## API Endpoints

Los endpoints de la API están organizados por módulos:

- `/api/users` - Gestión de usuarios
- `/api/profiles` - Gestión de perfiles
- `/api/roles` - Gestión de roles
- `/api/properties` - Gestión de propiedades
- `/api/vehicles` - Gestión de vehículos
- `/api/parkingslots` - Gestión de parqueaderos
- `/api/amenities` - Gestión de amenidades
- `/api/reservations` - Gestión de reservas
- `/api/invoices` - Gestión de facturas
- `/api/payments` - Gestión de pagos
- `/api/visitors` - Gestión de visitantes
- `/api/notifications` - Gestión de notificaciones
- `/api/reports` - Gestión de reportes

## Notas Importantes

1. **Contraseñas**: Las contraseñas se almacenan hasheadas usando bcrypt
2. **Autenticación**: Se utiliza JWT para la autenticación
3. **Validaciones**: Todos los modelos incluyen validaciones básicas
4. **Relaciones**: Las tablas están relacionadas mediante claves foráneas
5. **Estados**: Se utiliza un sistema de estados para controlar el flujo de datos

## Soporte

Para soporte técnico o preguntas sobre la implementación, contacta al equipo de desarrollo. 
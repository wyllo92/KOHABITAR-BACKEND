
# KOHABITAR - Sistema Integral de Gestión de Conjuntos Residenciales

Bienvenido a **KOHABITAR**, una solución integral para la administración y gestión de conjuntos residenciales. Este proyecto está diseñado para facilitar la operación, el control y la comunicación dentro de comunidades residenciales, integrando módulos para usuarios, propiedades, parqueaderos, zonas comunes, facturación, visitantes, notificaciones y reportes.

---

## ¿Qué es KOHABITAR?

KOHABITAR es una plataforma backend desarrollada en Node.js y Express, conectada a una base de datos MySQL, que permite gestionar de manera eficiente todos los procesos administrativos de un conjunto residencial. Incluye autenticación segura, control de acceso por roles, y una API RESTful robusta y escalable.

---


## Características principales

- Gestión de usuarios, roles y perfiles
- Administración de propiedades y vehículos
- Control de parqueaderos y zonas comunes
- Sistema de reservas para amenities
- Facturación y control de pagos
- Registro y control de visitantes
- Envío y gestión de notificaciones
- Generación y seguimiento de reportes
- Seguridad con autenticación JWT y contraseñas hasheadas
- Validaciones y relaciones entre entidades

---

## Estructura de la Base de Datos


La base de datos `conjunto_residencial` está compuesta por tablas que cubren todos los aspectos de la gestión residencial:

- **Usuarios y autenticación**: user, profile, role, status
- **Propiedades**: property, user_property
- **Vehículos y parqueaderos**: vehicle, parkingslot, parkingzone, parking_assignment
- **Zonas comunes y reservas**: amenity, amenity_type, reservation
- **Facturación y pagos**: invoice, payment, tariff
- **Visitantes y notificaciones**: visitor, notification, notification_type
- **Reportes**: report, report_type

---


## Instalación y Puesta en Marcha

1. **Clona el repositorio y accede a la carpeta backend:**
   ```bash
   git clone <url-del-repo>
   cd backend
   ```
2. **Configura las variables de entorno:**
   Crea un archivo `.env` con:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=conjunto_residencial
   DB_PORT=3306
   JWT_SECRET=tu_jwt_secret
   ```
3. **Instala las dependencias:**
   ```bash
   npm install
   ```
4. **Crea la base de datos y tablas:**
   ```bash
   node migrate.js
   npm run migrate:conjunto
   ```
5. **Inicia el servidor:**
   ```bash
   node server.js
   # o
   npm start
   ```

---


## Arquitectura y Modelos

El sistema está organizado en módulos independientes, cada uno con su propio modelo, controlador y rutas. Los modelos principales incluyen:

- **UserModel, ProfileModel, RoleModel, StatusModel**: Gestión de usuarios y autenticación
- **PropertyModel, VehicleModel**: Administración de propiedades y vehículos
- **ParkingSlotModel, ParkingZoneModel**: Control de parqueaderos
- **AmenityModel, ReservationModel**: Gestión de zonas comunes y reservas
- **InvoiceModel, PaymentModel, TariffModel**: Facturación y pagos
- **VisitorModel**: Registro de visitantes
- **NotificationModel, ReportModel**: Notificaciones y reportes

---


## Funcionalidades Destacadas

- CRUD de usuarios, perfiles y roles
- Gestión de propiedades y asignación a usuarios
- Control y asignación de parqueaderos
- Registro y reservas de zonas comunes
- Facturación automática y control de pagos
- Registro y control de visitantes
- Envío y gestión de notificaciones por prioridad y tipo
- Generación y seguimiento de reportes

---


## Roles y Permisos

- **Administrador**: Acceso total, gestión de usuarios, propiedades y configuración
- **Residente**: Acceso a sus propiedades, reservas y facturación
- **Propietario**: Gestión de propiedades y residentes, visualización de reportes
- **Vigilante**: Control de visitantes, parqueaderos y registro de incidentes

---


## API RESTful

La API está organizada por módulos y sigue buenas prácticas REST. Ejemplos de endpoints:

- `/api_v1/user` - Usuarios
- `/api_v1/profile` - Perfiles
- `/api_v1/role` - Roles
- `/api_v1/property` - Propiedades
- `/api_v1/vehicle` - Vehículos
- `/api_v1/parkingslot` - Parqueaderos
- `/api_v1/amenity` - Zonas comunes
- `/api_v1/reservation` - Reservas
- `/api_v1/invoice` - Facturación
- `/api_v1/payment` - Pagos
- `/api_v1/visitor` - Visitantes
- `/api_v1/notification` - Notificaciones
- `/api_v1/report` - Reportes

---


## Seguridad y Buenas Prácticas

- Contraseñas protegidas con bcrypt
- Autenticación y autorización con JWT
- Validaciones en todos los modelos
- Relaciones entre entidades mediante claves foráneas
- Control de estados para flujos de datos

---


## Soporte y Contacto

¿Tienes dudas o necesitas soporte? Contacta al equipo de desarrollo para más información o colaboración.
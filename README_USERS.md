# Gestión de Usuarios - Formato Unificado

## 📋 Descripción

El sistema ahora permite crear y editar usuarios con sus perfiles en una sola operación, unificando los datos de las tablas `user` y `profile`.

## 🎯 Campos del Formulario

### Campos Obligatorios
- **user_name**: Nombre de usuario (requerido)
- **user_password**: Contraseña (requerido, mínimo 8 caracteres)
- **role_id**: ID del rol (requerido)
- **status_id**: ID del estado (requerido)

### Campos Opcionales del Perfil
- **profile_phone**: Teléfono del usuario
- **profile_email**: Email del usuario

## 📝 Ejemplos de Uso

### 1. Crear Usuario (POST /api/users)

```json
{
  "user_name": "juan_perez",
  "user_password": "MiContraseña123!",
  "role_id": 1,
  "status_id": 1,
  "profile_phone": "123456789",
  "profile_email": "juan.perez@email.com"
}
```

### 2. Actualizar Usuario (PUT /api/users/:id)

```json
{
  "user_name": "juan_perez_actualizado",
  "user_password": "NuevaContraseña123!",
  "role_id": 2,
  "status_id": 1,
  "profile_phone": "987654321",
  "profile_email": "juan.nuevo@email.com"
}
```

## 🔄 Flujo de Operaciones

### Al Crear un Usuario:
1. ✅ Valida campos obligatorios
2. ✅ Verifica que el nombre de usuario no exista
3. ✅ Verifica que el email no esté en uso (si se proporciona)
4. ✅ Encripta la contraseña
5. ✅ Crea el registro en la tabla `user`
6. ✅ Crea el registro en la tabla `profile` (si se proporcionan datos)

### Al Actualizar un Usuario:
1. ✅ Valida campos obligatorios
2. ✅ Verifica que el usuario existe
3. ✅ Verifica que el email no esté en uso por otro usuario
4. ✅ Encripta la nueva contraseña
5. ✅ Actualiza el registro en la tabla `user`
6. ✅ Actualiza o crea el registro en la tabla `profile`

## 📊 Respuesta de la API

### Éxito (201/200)
```json
{
  "message": "User created successfully",
  "id": 123
}
```

### Error de Validación (400)
```json
{
  "error": "Required fields are missing"
}
```

### Error de Duplicado (409)
```json
{
  "error": "The username is already in use"
}
```

## 🎨 Frontend

### Formulario HTML
El formulario incluye automáticamente:
- Campo de teléfono con validación de formato
- Campo de email con validación de formato
- Validación en tiempo real
- Manejo automático de datos

### Tabla de Usuarios
Muestra las columnas:
- Nombre
- Teléfono
- Email
- Rol
- Estado
- Acciones

## 🔧 Validaciones

### Backend
- Contraseña mínimo 8 caracteres
- Email único en el sistema
- Nombre de usuario único
- Validación de campos obligatorios

### Frontend
- Validación de formato de teléfono
- Validación de formato de email
- Validación de contraseña segura
- Validación en tiempo real

## 🚀 Ventajas del Nuevo Formato

1. **Operación Única**: Crear/editar usuario y perfil en una sola llamada
2. **Consistencia**: Los datos se mantienen sincronizados
3. **Validación Completa**: Validaciones tanto en frontend como backend
4. **Experiencia Mejorada**: Formulario unificado y tabla con todos los datos
5. **Manejo de Errores**: Validaciones específicas para cada tipo de error 
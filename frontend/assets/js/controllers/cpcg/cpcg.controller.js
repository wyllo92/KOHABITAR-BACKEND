/**
 *
 * CONTROLADOR FRONTEND: MÓDULO CPCG (PQRS)
 *
 *
 * Este controlador gestiona la interfaz de usuario para el módulo CPCG
 * (Peticiones, Quejas, Reclamos y Sugerencias) del sistema de gestión
 * del conjunto residencial.
 *
 * El evento DOMContentLoaded se dispara cuando el documento HTML ha sido
 * completamente cargado y parseado. Este es el punto de entrada principal
 * del controlador de frontend para PQRS.
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Se oculta el body inicialmente para evitar parpadeos durante la carga
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  // Se verifica la autenticación del usuario antes de mostrar el contenido
  // Esta función valida el token almacenado en localStorage
  await checkAuth();
  console.log('CPCG controller has been loaded');

  // Se aplica un efecto de transición suave para mostrar el contenido
  fadeInElement(document.querySelector('body'), 1000);
});

/**
 *
 * SECCIÓN DE INICIALIZACIÓN DE OBJETOS Y VARIABLES GLOBALES
 *
 *
 * Aquí se definen todos los objetos y variables que se utilizarán
 * a lo largo del controlador. Estos elementos permiten la interacción
 * con el DOM y la gestión del estado de la aplicación.
 */

// Se instancia el objeto Form que maneja las validaciones y datos del formulario
const objForm = new Form('cpcgForm', 'edit-input');

// Se crea una instancia del modal de Bootstrap para mostrar/ocultar el formulario
const objModal = new bootstrap.Modal(document.getElementById('appModal'));

// Se obtiene la referencia al tbody de la tabla donde se listarán los PQRS
const objTableBody = document.getElementById('app-table-body');

// Se obtienen los elementos select para usuarios, propiedades, tipos y estados
const objSelectUser = document.getElementById('User_id');
const objSelectProperty = document.getElementById('Property_id');
const objSelectType = document.getElementById('CPCG_type_id');
const objSelectStatus = document.getElementById('Status_id');

// Se obtiene la referencia al formulario HTML
const myForm = objForm.getForm();

// Mensaje de confirmación para eliminar PQRS
const textConfirm = "¿Está seguro de que desea eliminar este PQRS?";

// Selector de la tabla para inicializar DataTable
const appTable = "#app-table";

/**
 * VARIABLES DE ESTADO PARA OPERACIONES CRUD
 *
 * insertUpdate: Indica si se está insertando (true) o actualizando (false)
 * keyId: Almacena el ID del PQRS cuando se edita
 * documentData: Almacena temporalmente los datos que se enviarán al backend
 * httpMethod: Define el método HTTP (GET, POST, PUT, DELETE) para cada operación
 * endpointUrl: Contiene la URL completa del endpoint del backend a consultar
 */
let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

/**
 * @param {Response} response - Objeto de respuesta HTTP del servidor
 * @param {string} operation - Descripción de la operación que se estaba realizando
 * @returns {Promise} - Promesa que resuelve con los datos JSON o rechaza con error
 */
function handleAuthenticatedResponse(response, operation = 'realizar la operación') {
  // Verifica si la respuesta es exitosa (códigos 200-299)
  if (!response.ok) {
    // Maneja específicamente el error 401 (No autorizado)
    if (response.status === 401) {
      console.log(`Error de autenticación al ${operation}: Token inválido o expirado`);
      alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
      // Redirecciona al login
      window.location.href = '/views/login.html';
      return Promise.reject(new Error('Sesión expirada'));
    }
    // Maneja otros errores HTTP
    console.log(`Error HTTP ${response.status} al ${operation}: ${response.statusText}`);
    return Promise.reject(new Error(`Error HTTP ${response.status}: ${response.statusText}`));
  }
  // Si la respuesta es exitosa, convierte a JSON
  return response.json();
}

/**
 *
 * MANEJO DEL EVENTO SUBMIT DEL FORMULARIO
 *
 *
 * Esta función se ejecuta cuando el usuario envía el formulario (crear o actualizar PQRS).
 * Es el punto de conexión principal entre el frontend y el backend.
 *
 * Conexión con el backend:
 * - POST /api_v1/cpcg → CpcgController.create() → CpcgModel.create()
 * - PUT /api_v1/cpcg/:id → CpcgController.update() → CpcgModel.update()
 */
myForm.addEventListener('submit', (e) => {
  // Previene el comportamiento por defecto del formulario (recargar la página)
  e.preventDefault();

  // Valida los campos del formulario antes de enviar los datos
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }

  // Muestra el indicador de carga mientras se procesa la petición
  toggleLoading(true);

  /**
   * CONFIGURACIÓN DE LA PETICIÓN HTTP SEGÚN LA OPERACIÓN
   *
   * Si insertUpdate es true: Se está creando un nuevo PQRS
   *   - Método HTTP: POST
   *   - Endpoint: http://localhost:3000/api_v1/cpcg
   *   - Backend: CpcgController.create()
   *
   * Si insertUpdate es false: Se está actualizando un PQRS existente
   *   - Método HTTP: PUT
   *   - Endpoint: http://localhost:3000/api_v1/cpcg/:id
   *   - Backend: CpcgController.update()
   */
  if (insertUpdate) {
    console.log("Insertando nuevo PQRS");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_CPCG;
  } else {
    console.log("Actualizando PQRS");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_CPCG + "/" + keyId; // Añade el ID: /api_v1/cpcg/:id
  }

  /**
   * TRANSFORMACIÓN DE DATOS DEL FORMULARIO
   *
   * El formulario HTML usa nombres con mayúsculas (User_id, Property_id, etc.)
   * pero el backend espera nombres en minúsculas (user_id, property_id, etc.).
   *
   * Aquí se realiza la transformación de los datos antes de enviarlos.
   */
  const formData = objForm.getDataForm();

  // Se transforman los nombres de los campos para que coincidan con el backend
  documentData = {
    user_id: formData.User_id,
    property_id: formData.Property_id,
    cpcg_type_id: formData.CPCG_type_id,
    description: formData.CPCG_description,
    status_id: formData.Status_id
  };

  // Se incluye la respuesta del administrador si se proporcionó
  // Este campo solo debería estar presente si el usuario es administrador
  if (formData.Admin_response && formData.Admin_response.trim() !== '') {
    documentData.admin_response = formData.Admin_response;
  }

  console.log('Datos transformados para el backend:', documentData);

  /**
   * LLAMADA AL SERVICIO WEB CON AUTENTICACIÓN (BACKEND)
   *
   * getServicesAuth() es una función definida en services.js que:
   * 1. Prepara la petición HTTP con los headers necesarios
   * 2. Incluye el token de autenticación en el header Authorization
   * 3. Envía los datos en formato JSON al backend
   * 4. Retorna una promesa con la respuesta del servidor
   */
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices
    .then(response => handleAuthenticatedResponse(response, 'procesar el formulario'))
    .then(data => {
    /**
     * PROCESAMIENTO DE LA RESPUESTA DEL BACKEND
     *
     * El backend devuelve un JSON con la estructura:
     * {
     *   success: true/false,
     *   message: "Mensaje descriptivo",
     *   data: {...} // Datos del PQRS creado/actualizado
     * }
     */
    console.log('Respuesta del servidor:', data);

    if (data.success) {
      alert(data.message);
    } else {
      alert('Error: ' + (data.message || 'Operación fallida'));
    }
  }).catch(error => {
    // Captura errores de red o errores en el procesamiento de la respuesta
    console.log('Error en la operación:', error);
    alert('Error en la operación. Por favor, inténtelo de nuevo.');
  }).finally(() => {
    // Se ejecuta siempre, haya error o no
    // Recarga la vista para mostrar los datos actualizados
    loadView();
    // Cierra el modal del formulario
    showHiddenModal(false);
  });
});

/**
 *
 * FUNCIÓN PARA GESTIONAR LA VISIBILIDAD DEL CAMPO DE RESPUESTA ADMIN
 *
 *
 * Esta función muestra u oculta el campo de respuesta del administrador
 * según el rol del usuario. Solo los administradores pueden ver y usar este campo.
 */
function toggleAdminResponseField() {
  const adminResponseContainer = document.getElementById('admin-response-container');
  const userRole = getUserRole();

  if (userRole === 'Administrador') {
    // Se muestra el campo para administradores
    adminResponseContainer.style.display = 'block';
  } else {
    // Se oculta el campo para usuarios normales
    adminResponseContainer.style.display = 'none';
  }
}

/**
 *
 * FUNCIÓN PARA AGREGAR UN NUEVO PQRS
 *
 *
 * Prepara el formulario para la creación de un nuevo PQRS.
 * Esta función es llamada cuando el usuario hace clic en el botón "Agregar".
 */
function add() {
  // Muestra el modal con el formulario
  showHiddenModal(true);

  // Establece el modo en "insertar" (no actualizar)
  insertUpdate = true;

  // Limpia todos los campos del formulario
  objForm.resetForm();

  // Habilita todos los campos del formulario para permitir la entrada de datos
  objForm.enabledForm();

  // Habilita el botón de guardar
  objForm.enabledButton();

  // Muestra el botón de guardar
  objForm.showButton();

  // Se gestiona la visibilidad del campo de respuesta admin
  toggleAdminResponseField();
}

/**
 *
 * FUNCIÓN PARA VER LOS DETALLES DE UN PQRS
 *
 *
 * Muestra los datos de un PQRS específico en modo de solo lectura.
 * No permite editar los datos, solo visualizarlos.
 *
 * @param {number} id - El ID del PQRS a visualizar
 *
 * Flujo de conexión con backend:
 * 1. Llama a getDataId(id)
 * 2. getDataId hace petición GET a /api_v1/cpcg/:id
 * 3. Backend ejecuta CpcgController.getById()
 * 4. El controlador consulta CpcgModel.findById()
 * 5. Devuelve los datos del PQRS con información relacionada (usuario, propiedad, tipo, estado)
 */
function showId(id) {
  // Limpia el formulario antes de cargar los datos
  objForm.resetForm();

  // Deshabilita todos los campos para que no se puedan editar
  objForm.disabledForm();

  // Deshabilita el botón de guardar
  objForm.disabledButton();

  // Oculta el botón de guardar (modo solo lectura)
  objForm.hiddenButton();

  // Se gestiona la visibilidad del campo de respuesta admin
  toggleAdminResponseField();

  // Obtiene y carga los datos del PQRS desde el backend
  getDataId(id);
}

/**
 *
 * FUNCIÓN PARA EDITAR UN PQRS EXISTENTE
 *
 *
 * Prepara el formulario para la edición de un PQRS existente.
 * Carga los datos actuales y permite modificarlos.
 *
 * @param {number} id - El ID del PQRS a editar
 *
 * Flujo de conexión con backend:
 * 1. getDataId(id) obtiene los datos actuales (GET /api_v1/cpcg/:id)
 * 2. Al enviar el formulario, se usa PUT /api_v1/cpcg/:id
 * 3. Backend ejecuta CpcgController.update()
 * 4. Se validan permisos (solo admin puede cambiar estado o agregar respuesta)
 */
function edit(id) {
  // Establece el modo en "actualizar" (no insertar)
  insertUpdate = false;

  // Limpia el formulario
  objForm.resetForm();

  // Habilita los campos editables del formulario
  objForm.enabledEditForm();

  // Habilita el botón de guardar
  objForm.enabledButton();

  // Muestra el botón de guardar
  objForm.showButton();

  // Se gestiona la visibilidad del campo de respuesta admin
  toggleAdminResponseField();

  // Guarda el ID del PQRS que se está editando
  keyId = id;

  // Obtiene los datos actuales del PQRS desde el backend
  getDataId(id);
}

/**
 *
 * FUNCIÓN PARA ELIMINAR UN PQRS
 *
 *
 * Elimina un PQRS del sistema después de confirmar la acción con el usuario.
 *
 * @param {number} id - El ID del PQRS a eliminar
 *
 * Conexión con el backend:
 * - Método HTTP: DELETE
 * - Endpoint: http://localhost:3000/api_v1/cpcg/:id
 * - Backend: CpcgController.delete()
 * - El controlador ejecuta CpcgModel.delete() para eliminarlo de la base de datos
 * - Respuesta del backend: { success: true, message: "PQRS eliminado exitosamente" }
 */
function delete_(id) {
  // Solicita confirmación al usuario antes de eliminar
  if (confirm(textConfirm)) {
    // No se envían datos en el body para una petición DELETE
    documentData = "";

    // Configura la petición DELETE al backend
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = URL_CPCG + "/" + id; // Construye la URL con el ID

    // Obtiene el token de autenticación del almacenamiento local
    const token = getAuthToken();

    // Realiza la petición al backend con autenticación
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

    resultServices
      .then(response => handleAuthenticatedResponse(response, 'eliminar el PQRS'))
      .then(data => {
      /**
       * Procesa la respuesta del backend
       *
       * Respuestas posibles:
       * - Éxito: { success: true, message: "PQRS eliminado exitosamente" }
       * - Error 404: { success: false, message: "PQRS no encontrado" }
       * - Error 500: { success: false, message: "Error al eliminar el PQRS" }
       */
      console.log('Respuesta de eliminación:', data);

      if (data.success) {
        alert(data.message);
      } else {
        alert('Error: ' + data.message);
      }
    }).catch(error => {
      // Maneja errores de red o de procesamiento
      console.log('Error al eliminar:', error);
      alert('Error al eliminar. Por favor, inténtelo de nuevo.');
    }).finally(() => {
      // Recarga la tabla para reflejar los cambios
      loadView();
    });
  } else {
    // El usuario canceló la operación
    console.log("Operación cancelada");
  }
}

/**
 *
 * FUNCIÓN PARA OBTENER LOS DATOS DE UN PQRS ESPECÍFICO
 *
 *
 * Consulta el backend para obtener los detalles de un PQRS por su ID.
 * Esta función es utilizada tanto para visualizar como para editar un PQRS.
 *
 * @param {number} id - El ID del PQRS a consultar
 *
 * Conexión con el backend:
 * - Método HTTP: GET
 * - Endpoint: http://localhost:3000/api_v1/cpcg/:id
 * - Backend: CpcgController.getById()
 * - El controlador ejecuta CpcgModel.findById()
 * - Respuesta del backend:
 *   {
 *     success: true,
 *     message: "PQRS encontrado",
 *     data: {
 *       cpcg_id: 1,
 *       user_id: 5,
 *       user_name: "Juan Pérez",
 *       property_id: 3,
 *       property_name: "Apto 101",
 *       cpcg_type_id: 1,
 *       type_name: "Queja",
 *       description: "Descripción del PQRS",
 *       status_id: 8,
 *       status_name: "Creado",
 *       admin_response: null,
 *       responded_by: null,
 *       responded_by_name: null
 *     }
 *   }
 */
function getDataId(id) {
  // No se envían datos en el body para una petición GET
  documentData = "";

  // Configura la petición GET al backend
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_CPCG + "/" + id; // Construye la URL: /api_v1/cpcg/:id

  // Obtiene el token de autenticación del almacenamiento local
  const token = getAuthToken();

  // Realiza la petición al backend con autenticación
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices
    .then(response => handleAuthenticatedResponse(response, 'obtener los datos del PQRS'))
    .then(data => {
    /**
     * Procesa la respuesta del backend
     *
     * El backend devuelve el PQRS dentro de la propiedad 'data'
     * Si no encuentra el PQRS, devuelve un error 404
     */
    console.log('Datos del PQRS:', data);

    if (data.success && data.data) {
      // Extrae los datos del PQRS
      let getData = data.data;

      /**
       * TRANSFORMACIÓN DE DATOS DEL BACKEND AL FORMULARIO
       *
       * El backend envía datos con nombres en minúsculas (user_id, property_id, etc.)
       * pero el formulario HTML usa nombres con mayúsculas (User_id, Property_id, etc.).
       *
       * Se debe transformar los datos antes de cargarlos en el formulario.
       */
      const formData = {
        User_id: getData.user_id,
        Property_id: getData.property_id,
        CPCG_type_id: getData.cpcg_type_id,
        CPCG_description: getData.description,
        Status_id: getData.status_id
      };

      // Se incluye la respuesta del administrador si existe
      if (getData.admin_response) {
        formData.Admin_response = getData.admin_response;
      }

      // Carga los datos transformados en el formulario HTML
      objForm.setDataFormJson(formData);
    } else {
      alert('Error: No se encontraron datos del PQRS');
    }
  }).catch(error => {
    // Maneja errores de red o de procesamiento
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos del PQRS');
  }).finally(() => {
    // Muestra el modal con los datos cargados
    showHiddenModal(true);
  });
}

/**
 *
 * FUNCIÓN PARA OBTENER TODOS LOS PQRS
 *
 *
 * Consulta el backend para obtener el listado completo de PQRS.
 * Esta función se ejecuta al cargar la página y después de cada operación CRUD.
 *
 * Conexión con el backend:
 * - Método HTTP: GET
 * - Endpoint: http://localhost:3000/api_v1/cpcg
 * - Backend: CpcgController.getAll()
 * - El controlador ejecuta CpcgModel.show() para obtener todos los PQRS
 * - El modelo realiza un JOIN con las tablas:
 *   * users (para obtener el nombre del usuario)
 *   * properties (para obtener el nombre de la propiedad)
 *   * cpcg_types (para obtener el tipo de PQRS)
 *   * statuses (para obtener el estado)
 * - Respuesta del backend:
 *   {
 *     success: true,
 *     message: "PQRS obtenidos exitosamente",
 *     data: [...]  // Array de PQRS con información relacionada
 *   }
 */
function getData() {
  // No se envían datos en el body para una petición GET
  documentData = "";

  // Configura la petición GET al backend
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_CPCG; // http://localhost:3000/api_v1/cpcg

  // Obtiene el token de autenticación del almacenamiento local
  const token = getAuthToken();

  // Realiza la petición al backend con autenticación
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices
    .then(response => handleAuthenticatedResponse(response, 'obtener los PQRS'))
    .then(data => {
    /**
     * Procesa la respuesta del backend
     *
     * Los datos vienen en el formato { success: true, message: "...", data: [...] }
     * donde 'data' es un array con todos los PQRS
     */
    console.log('Datos recibidos del backend:', data);

    // Llama a createTable para renderizar los datos en la tabla HTML
    createTable(data);
  }).catch(error => {
    // Maneja errores de red o de procesamiento
    console.log('Error al obtener datos:', error);
    alert('Error al cargar los datos de PQRS');
  }).finally(() => {
    /**
     * Inicializa DataTable
     *
     * DataTable es una librería de jQuery que añade funcionalidades a la tabla:
     * - Paginación
     * - Búsqueda
     * - Ordenamiento de columnas
     */
    new DataTable(appTable);

    // Oculta el indicador de carga
    toggleLoading(false);
  });
}

/**
 *
 * FUNCIÓN PARA RENDERIZAR LA TABLA DE PQRS
 *
 *
 * Recibe los datos del backend y crea las filas HTML de la tabla.
 * Cada fila incluye botones para ver, editar y eliminar el PQRS.
 *
 * @param {Object} data - Objeto de respuesta del backend con la estructura:
 *   {
 *     success: true,
 *     message: "PQRS obtenidos exitosamente",
 *     data: [...]  // Array de PQRS
 *   }
 *
 * Estructura de cada PQRS en el array:
 * {
 *   cpcg_id: 1,
 *   user_name: "Juan Pérez",
 *   property_name: "Apto 101",
 *   type_name: "Queja",
 *   description: "Descripción del PQRS",
 *   status_name: "Creado"
 * }
 */
function createTable(data) {
  // Limpia el contenido previo de la tabla
  objTableBody.innerHTML = "";

  // Extrae el array de PQRS de la respuesta del backend
  let getData = data.data || [];
  console.log('Datos para crear tabla:', getData);

  // Verifica si hay datos para mostrar
  if (getData.length === 0) {
    console.log('No hay datos para mostrar');
    // Muestra un mensaje en la tabla si no hay datos
    objTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay PQRS disponibles</td></tr>';
    return;
  }

  // Itera sobre cada PQRS recibido del backend
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    console.log('Fila actual:', row);

    /**
     * Construye la fila HTML con los datos del PQRS
     *
     * Se usan los nombres de campos que vienen del backend (minúsculas)
     * como alternativa si no están disponibles los datos relacionados.
     */
    let dataRow = `<tr>
      <td>${row.cpcg_id}</td>
      <td>${row.user_name || row.user_id}</td>
      <td>${row.property_name || row.property_id || 'N/A'}</td>
      <td>${row.type_name || row.cpcg_type_id}</td>
      <td class="text-truncate" style="max-width: 200px;" title="${row.description}">${row.description}</td>
      <td>
        <span class="badge ${getStatusClass(row.status_name)}">
          ${row.status_name || row.status_id}
        </span>
      </td>
      <td>
        <button type="button" title="Ver PQRS" class="btn btn-success btn-sm" onclick="showId(${row.cpcg_id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar PQRS" class="btn btn-primary btn-sm" onclick="edit(${row.cpcg_id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar PQRS" class="btn btn-danger btn-sm" onclick="delete_(${row.cpcg_id})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;

    // Añade la fila HTML al cuerpo de la tabla
    objTableBody.innerHTML += dataRow;
  }
}

/**
 *
 * FUNCIÓN AUXILIAR: OBTENER CLASE CSS PARA ESTADO
 *
 *
 * Devuelve la clase CSS de Bootstrap apropiada según el estado del PQRS.
 * Esto permite visualizar de forma clara el estado con colores.
 *
 * @param {string} statusName - Nombre del estado
 * @returns {string} - Clase CSS de Bootstrap para el badge
 */
function getStatusClass(statusName) {
  switch(statusName) {
    case 'Creado':
      return 'bg-info';
    case 'En Proceso':
      return 'bg-warning text-dark';
    case 'Resuelto':
      return 'bg-success';
    case 'Cerrado':
      return 'bg-secondary';
    case 'Escalado':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}

/**
 *
 * FUNCIÓN PARA CARGAR LOS USUARIOS EN EL SELECT
 *
 *
 * Recibe los usuarios del backend y los renderiza en un elemento <select>.
 * Este select se utiliza en el formulario para seleccionar el usuario.
 *
 * @param {Object} data - Objeto de respuesta del backend con los usuarios
 */
function createSelectUser(data) {
  // Inicializa el select con una opción por defecto
  objSelectUser.innerHTML = "<option value='' selected disabled>Seleccione un usuario</option>";

  // Extrae el array de usuarios
  let getData = data.data || [];

  // Si no hay usuarios disponibles, no hace nada
  if (getData.length === 0) return;

  // Itera sobre cada usuario y crea una opción en el select
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    // Crea una opción con el ID como valor y el nombre como texto visible
    objSelectUser.innerHTML += `<option value="${row.user_id}">${row.username || row.user_name || 'Usuario ' + row.user_id}</option>`;
  }
}

/**
 *
 * FUNCIÓN PARA CARGAR LAS PROPIEDADES EN EL SELECT
 *
 *
 * Recibe las propiedades del backend y las renderiza en un elemento <select>.
 *
 * @param {Object} data - Objeto de respuesta del backend con las propiedades
 */
function createSelectProperty(data) {
  // Inicializa el select con una opción por defecto
  objSelectProperty.innerHTML = "<option value='' selected disabled>Seleccione una propiedad</option>";

  // Extrae el array de propiedades
  let getData = data.data || [];

  // Si no hay propiedades disponibles, no hace nada
  if (getData.length === 0) return;

  // Itera sobre cada propiedad y crea una opción en el select
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    objSelectProperty.innerHTML += `<option value="${row.property_id}">${row.name || row.property_name || 'Propiedad ' + row.property_id}</option>`;
  }
}

/**
 *
 * FUNCIÓN PARA CARGAR LOS TIPOS DE PQRS EN EL SELECT
 *
 *
 * Recibe los tipos de PQRS del backend y los renderiza en un elemento <select>.
 *
 * @param {Object} data - Objeto de respuesta del backend con los tipos
 * 
 * Estructura de respuesta del backend:
 * {
 *   success: true,
 *   message: "Tipos de PQRS obtenidos exitosamente",
 *   data: [
 *     { cpcg_type_id: 1, name: "Petición", description: "..." },
 *     { cpcg_type_id: 2, name: "Queja", description: "..." }
 *   ],
 *   metadata: { pagination: {...} }
 * }
 */
function createSelectType(data) {
  // Inicializa el select con una opción por defecto
  objSelectType.innerHTML = "<option value='' selected disabled>Seleccione un tipo</option>";

  // Extrae el array de tipos de la respuesta del backend
  let getData = data.data || [];
  
  // El backend puede devolver datos paginados, se extraen solo los elementos
  if (Array.isArray(getData)) {
    // Si no hay tipos disponibles, no hace nada
    if (getData.length === 0) {
      console.log('No se encontraron tipos de PQRS en el backend');
      return;
    }

    // Itera sobre cada tipo y crea una opción en el select
    for (let i = 0; i < getData.length; i++) {
      let row = getData[i];
      // El backend devuelve 'cpcg_type_id' y 'name' según el modelo CpcgTypeModel
      objSelectType.innerHTML += `<option value="${row.cpcg_type_id}">${row.name || 'Tipo ' + row.cpcg_type_id}</option>`;
    }
  } else {
    console.log('La respuesta del backend no contiene un array de tipos válido');
  }
}

/**
 *
 * FUNCIÓN PARA CARGAR LOS ESTADOS EN EL SELECT
 *
 *
 * Recibe los estados del backend y los renderiza en un elemento <select>.
 * Solo se deben mostrar estados válidos para PQRS (entity = 'cpcg').
 *
 * @param {Object} data - Objeto de respuesta del backend con los estados
 */
function createSelectStatus(data) {
  // Inicializa el select con una opción por defecto
  objSelectStatus.innerHTML = "<option value='' selected disabled>Seleccione un estado</option>";

  // Extrae el array de estados
  let getData = data.data || [];

  // Si no hay estados disponibles, no hace nada
  if (getData.length === 0) return;

  // Filtra solo los estados de tipo 'cpcg' si existe la propiedad entity
  const cpcgStatuses = getData.filter(status =>
    !status.entity || status.entity === 'cpcg'
  );

  // Itera sobre cada estado y crea una opción en el select
  for (let i = 0; i < cpcgStatuses.length; i++) {
    let row = cpcgStatuses[i];
    objSelectStatus.innerHTML += `<option value="${row.status_id}">${row.name || row.status_name || 'Estado ' + row.status_id}</option>`;
  }
}

/**
 *
 * FUNCIÓN PARA MOSTRAR U OCULTAR EL MODAL
 *
 *
 * Controla la visibilidad del modal que contiene el formulario de PQRS.
 *
 * @param {boolean} type - true para mostrar, false para ocultar
 */
function showHiddenModal(type) {
  if (type) {
    objModal.show();
  } else {
    objModal.hide();
  }
}

/**
 *
 * FUNCIÓN PARA RECARGAR LA VISTA
 *
 *
 * Recarga todos los datos de los PQRS desde el backend.
 * Se llama después de cada operación CRUD para refrescar la tabla.
 */
function loadView() {
  // Llama a getData() que hace la petición al backend
  getData();

  // Muestra el indicador de carga
  toggleLoading(true);
}

/**
 *
 * FUNCIONES PARA OBTENER DATOS DE CATÁLOGOS
 *
 *
 * Estas funciones consultan el backend para obtener los catálogos
 * necesarios para llenar los selects del formulario.
 */

/**
 * Obtiene la lista de usuarios del backend.
 *
 * Conexión con el backend:
 * - Endpoint: GET /api_v1/user/
 * - Llena el select de usuarios
 */
function getDataUsers() {
  const token = getAuthToken();
  getServicesAuth('', METHODS[0], URL_USER, token)
    .then(response => handleAuthenticatedResponse(response, 'obtener los usuarios'))
    .then(d => createSelectUser(d))
    .catch(e => console.log('Error al obtener usuarios:', e));
}

/**
 * Obtiene la lista de propiedades del backend.
 *
 * Conexión con el backend:
 * - Endpoint: GET /api_v1/property/
 * - Llena el select de propiedades
 */
function getDataProperties() {
  const token = getAuthToken();
  getServicesAuth('', METHODS[0], URL_PROPERTY, token)
    .then(response => handleAuthenticatedResponse(response, 'obtener las propiedades'))
    .then(d => createSelectProperty(d))
    .catch(e => console.log('Error al obtener propiedades:', e));
}

/**
 * Obtiene la lista de tipos de PQRS del backend.
 *
 * Conexión con el backend:
 * - Endpoint: GET /api_v1/cpcg-types
 * - Controller: CpcgTypeController.getAll() 
 * - Llena el select de tipos
 *
 * El backend define la ruta como '/cpcg-types' (con guión) según cpcgType.router.js
 */
function getDataTypes() {
  const token = getAuthToken();
  getServicesAuth('', METHODS[0], URL_CPCG_TYPE, token)
    .then(response => handleAuthenticatedResponse(response, 'obtener los tipos de PQRS'))
    .then(d => createSelectType(d))
    .catch(e => console.log('Error al obtener tipos de PQRS:', e));
}

/**
 * Obtiene la lista de estados del backend.
 *
 * Conexión con el backend:
 * - Endpoint: GET /api_v1/status/
 * - Llena el select de estados
 * - Solo se mostrarán estados de tipo 'cpcg'
 */
function getDataStatus() {
  const token = getAuthToken();
  getServicesAuth('', METHODS[0], URL_STATUS, token)
    .then(response => handleAuthenticatedResponse(response, 'obtener los estados'))
    .then(d => createSelectStatus(d))
    .catch(e => console.log('Error al obtener estados:', e));
}

/**
 *
 * INICIALIZACIÓN AL CARGAR LA PÁGINA
 *
 *
 * Este evento se dispara cuando toda la página (incluyendo imágenes y recursos)
 * ha terminado de cargar. Es diferente a DOMContentLoaded que solo espera a
 * que el DOM esté listo.
 *
 * Aquí se ejecutan las funciones iniciales:
 * 1. loadView() - Carga todos los PQRS en la tabla
 * 2. getDataUsers() - Carga los usuarios para el select del formulario
 * 3. getDataProperties() - Carga las propiedades para el select del formulario
 * 4. getDataTypes() - Carga los tipos de PQRS para el select del formulario
 * 5. getDataStatus() - Carga los estados para el select del formulario
 */
window.addEventListener('load', () => {
  // Carga el listado inicial de PQRS
  loadView();

  // Carga los catálogos para los selects del formulario
  getDataUsers();
  getDataProperties();
  getDataTypes();
  getDataStatus();
});

/**
 *
 * SECCIÓN DE PAGINACIÓN Y FILTROS
 *
 *
 * Esta sección implementa la funcionalidad de paginación del lado del servidor
 * y los filtros por estado, tipo y usuario para mejorar el rendimiento
 * cuando hay muchos registros de PQRS.
 */

/**
 * Variables globales para controlar el estado de la paginación
 * - currentPage: Página actual que se está mostrando
 * - recordsPerPage: Cantidad de registros a mostrar por página
 * - currentFilter: Almacena el filtro activo (null si no hay filtros)
 */
let currentPage = 1;
let recordsPerPage = 10;
let currentFilter = null;

/**
 * Función para obtener datos con paginación del servidor
 *
 * Esta función mejora el rendimiento porque solo solicita al servidor
 * los registros de la página actual, en lugar de todos los registros.
 *
 * @param {number} page - Número de página a solicitar (por defecto: 1)
 * @param {number} limit - Cantidad de registros por página (por defecto: 10)
 *
 * Conexión con backend:
 * - Endpoint: GET /api_v1/cpcg?page=1&limit=10
 * - Controller: CpcgController.getAll()
 * - Retorna: { success, message, data: [...], metadata: { currentPage, totalPages, ... } }
 */
function getDataPaginated(page = 1, limit = 10) {
  // Se actualiza el estado global de paginación
  currentPage = page;
  recordsPerPage = limit;

  // Se muestra el indicador de carga
  toggleLoading(true);

  // Se construye la URL con los parámetros de paginación
  let url = `${URL_CPCG}?page=${page}&limit=${limit}`;

  // Si hay un filtro activo, se modifica la URL para usar el endpoint de filtrado
  if (currentFilter) {
    if (currentFilter.type === 'status') {
      url = `${URL_CPCG}/status/${currentFilter.value}`;
    } else if (currentFilter.type === 'type') {
      url = `${URL_CPCG}/type/${currentFilter.value}`;
    } else if (currentFilter.type === 'user') {
      url = `${URL_CPCG}/user/${currentFilter.value}`;
    }
  }

  // Se realiza la petición al backend
  getDataServices('', METHODS[0], url)
    .then(response => response.json())
    .then(data => {
      console.log('Datos paginados recibidos:', data);

      // Se renderiza la tabla con los datos
      createTable(data);

      // Si hay metadata de paginación, se actualizan los controles
      if (data.metadata) {
        updatePaginationControls(data.metadata);
      } else {
        // Si no hay metadata, significa que no se usó paginación
        // (puede ser porque el filtro no soporta paginación todavía)
        hidePaginationControls();
      }
    })
    .catch(error => {
      console.error('Error al obtener datos paginados:', error);
      alert('Error al cargar los datos de PQRS');
    })
    .finally(() => {
      // Se oculta el indicador de carga
      toggleLoading(false);
    });
}

/**
 * Actualiza los controles de paginación basándose en los metadatos
 * que devuelve el backend.
 *
 * @param {Object} metadata - Metadatos de paginación del backend
 * @param {number} metadata.currentPage - Página actual
 * @param {number} metadata.totalPages - Total de páginas
 * @param {number} metadata.totalRecords - Total de registros
 * @param {number} metadata.recordsPerPage - Registros por página
 * @param {boolean} metadata.hasNextPage - Si hay página siguiente
 * @param {boolean} metadata.hasPreviousPage - Si hay página anterior
 */
function updatePaginationControls(metadata) {
  // Se actualiza el texto informativo
  const paginationInfo = document.getElementById('pagination-info');
  const startRecord = ((metadata.currentPage - 1) * metadata.recordsPerPage) + 1;
  const endRecord = Math.min(metadata.currentPage * metadata.recordsPerPage, metadata.totalRecords);
  paginationInfo.textContent = `Mostrando ${startRecord}-${endRecord} de ${metadata.totalRecords} registros`;

  // Se construyen los botones de paginación
  const paginationControls = document.getElementById('pagination-controls');
  paginationControls.innerHTML = '';

  // Botón "Anterior"
  const prevButton = document.createElement('li');
  prevButton.className = `page-item ${!metadata.hasPreviousPage ? 'disabled' : ''}`;
  prevButton.innerHTML = `
    <a class="page-link" href="#" onclick="goToPage(${metadata.currentPage - 1}); return false;">
      <i class="fas fa-chevron-left"></i> Anterior
    </a>
  `;
  paginationControls.appendChild(prevButton);

  // Se generan los botones numéricos
  // Se muestran hasta 5 páginas a la vez
  const startPage = Math.max(1, metadata.currentPage - 2);
  const endPage = Math.min(metadata.totalPages, metadata.currentPage + 2);

  // Botón "Primera página" si no está visible
  if (startPage > 1) {
    const firstButton = document.createElement('li');
    firstButton.className = 'page-item';
    firstButton.innerHTML = `
      <a class="page-link" href="#" onclick="goToPage(1); return false;">1</a>
    `;
    paginationControls.appendChild(firstButton);

    if (startPage > 2) {
      const ellipsis = document.createElement('li');
      ellipsis.className = 'page-item disabled';
      ellipsis.innerHTML = '<span class="page-link">...</span>';
      paginationControls.appendChild(ellipsis);
    }
  }

  // Botones de páginas
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('li');
    pageButton.className = `page-item ${i === metadata.currentPage ? 'active' : ''}`;
    pageButton.innerHTML = `
      <a class="page-link" href="#" onclick="goToPage(${i}); return false;">${i}</a>
    `;
    paginationControls.appendChild(pageButton);
  }

  // Botón "Última página" si no está visible
  if (endPage < metadata.totalPages) {
    if (endPage < metadata.totalPages - 1) {
      const ellipsis = document.createElement('li');
      ellipsis.className = 'page-item disabled';
      ellipsis.innerHTML = '<span class="page-link">...</span>';
      paginationControls.appendChild(ellipsis);
    }

    const lastButton = document.createElement('li');
    lastButton.className = 'page-item';
    lastButton.innerHTML = `
      <a class="page-link" href="#" onclick="goToPage(${metadata.totalPages}); return false;">${metadata.totalPages}</a>
    `;
    paginationControls.appendChild(lastButton);
  }

  // Botón "Siguiente"
  const nextButton = document.createElement('li');
  nextButton.className = `page-item ${!metadata.hasNextPage ? 'disabled' : ''}`;
  nextButton.innerHTML = `
    <a class="page-link" href="#" onclick="goToPage(${metadata.currentPage + 1}); return false;">
      Siguiente <i class="fas fa-chevron-right"></i>
    </a>
  `;
  paginationControls.appendChild(nextButton);
}

/**
 * Oculta los controles de paginación cuando no se está usando paginación
 */
function hidePaginationControls() {
  document.getElementById('pagination-info').textContent = 'Mostrando todos los registros';
  document.getElementById('pagination-controls').innerHTML = '';
}

/**
 * Navega a una página específica
 *
 * @param {number} page - Número de página a la que se quiere navegar
 */
function goToPage(page) {
  // Se valida que la página sea válida
  if (page < 1) return;

  // Se cargan los datos de la página solicitada
  getDataPaginated(page, recordsPerPage);
}

/**
 * Cambia la cantidad de registros por página
 * Esta función se llama cuando el usuario selecciona una opción
 * en el select de "Registros por página"
 *
 * @param {number} limit - Nueva cantidad de registros por página
 */
function changeRecordsPerPage(limit) {
  // Se actualiza la cantidad de registros por página
  recordsPerPage = parseInt(limit);

  // Se vuelve a la página 1 con el nuevo límite
  getDataPaginated(1, recordsPerPage);
}

/**
 *
 * FUNCIONES DE FILTRADO
 *
 *
 * Estas funciones permiten filtrar los PQRS por estado, tipo o usuario.
 * Se conectan con los endpoints especializados del backend.
 */

/**
 * Filtra los PQRS por estado
 *
 * Conexión con backend:
 * - Endpoint: GET /api_v1/cpcg/status/:statusId
 * - Controller: CpcgController.getByStatus()
 * - Model: CpcgModel.findByStatus()
 *
 * @param {string} statusId - ID del estado a filtrar (vacío para "todos")
 */
function filterByStatus(statusId) {
  console.log('Filtrando por estado:', statusId);

  if (statusId === '') {
    // Si no hay filtro, se limpia y se carga todo
    currentFilter = null;
    loadView();
    return;
  }

  // Se guarda el filtro activo
  currentFilter = { type: 'status', value: statusId };

  // Se muestra el indicador de carga
  toggleLoading(true);

  // Se obtiene el token de autenticación del almacenamiento local
  const token = getAuthToken();

  // Se realiza la petición al backend con autenticación
  const url = `${URL_CPCG}/status/${statusId}`;
  getServicesAuth('', METHODS[0], url, token)
    .then(response => handleAuthenticatedResponse(response, 'filtrar por estado'))
    .then(data => {
      console.log('PQRS filtrados por estado:', data);
      createTable(data);

      // Los endpoints de filtro no tienen paginación todavía
      hidePaginationControls();
    })
    .catch(error => {
      console.error('Error al filtrar por estado:', error);
      alert('Error al filtrar los PQRS');
    })
    .finally(() => {
      toggleLoading(false);
    });
}

/**
 * Filtra los PQRS por tipo
 *
 * Conexión con backend:
 * - Endpoint: GET /api_v1/cpcg/type/:typeId
 * - Controller: CpcgController.getByType()
 * - Model: CpcgModel.findByType()
 *
 * @param {string} typeId - ID del tipo a filtrar (vacío para "todos")
 */
function filterByType(typeId) {
  console.log('Filtrando por tipo:', typeId);

  if (typeId === '') {
    // Si no hay filtro, se limpia y se carga todo
    currentFilter = null;
    loadView();
    return;
  }

  // Se guarda el filtro activo
  currentFilter = { type: 'type', value: typeId };

  // Se muestra el indicador de carga
  toggleLoading(true);

  // Se obtiene el token de autenticación del almacenamiento local
  const token = getAuthToken();

  // Se realiza la petición al backend con autenticación
  const url = `${URL_CPCG}/type/${typeId}`;
  getServicesAuth('', METHODS[0], url, token)
    .then(response => handleAuthenticatedResponse(response, 'filtrar por tipo'))
    .then(data => {
      console.log('PQRS filtrados por tipo:', data);
      createTable(data);

      // Los endpoints de filtro no tienen paginación todavía
      hidePaginationControls();
    })
    .catch(error => {
      console.error('Error al filtrar por tipo:', error);
      alert('Error al filtrar los PQRS');
    })
    .finally(() => {
      toggleLoading(false);
    });
}

/**
 * Filtra los PQRS por usuario
 *
 * Conexión con backend:
 * - Endpoint: GET /api_v1/cpcg/user/:userId
 * - Controller: CpcgController.getByUser()
 * - Model: CpcgModel.findByUser()
 *
 * @param {string} userId - ID del usuario a filtrar (vacío para "todos")
 */
function filterByUser(userId) {
  console.log('Filtrando por usuario:', userId);

  if (userId === '') {
    // Si no hay filtro, se limpia y se carga todo
    currentFilter = null;
    loadView();
    return;
  }

  // Se guarda el filtro activo
  currentFilter = { type: 'user', value: userId };

  // Se muestra el indicador de carga
  toggleLoading(true);

  // Se obtiene el token de autenticación del almacenamiento local
  const token = getAuthToken();

  // Se realiza la petición al backend con autenticación
  const url = `${URL_CPCG}/user/${userId}`;
  getServicesAuth('', METHODS[0], url, token)
    .then(response => handleAuthenticatedResponse(response, 'filtrar por usuario'))
    .then(data => {
      console.log('PQRS filtrados por usuario:', data);
      createTable(data);

      // Los endpoints de filtro no tienen paginación todavía
      hidePaginationControls();
    })
    .catch(error => {
      console.error('Error al filtrar por usuario:', error);
      alert('Error al filtrar los PQRS');
    })
    .finally(() => {
      toggleLoading(false);
    });
}

/**
 * Limpia todos los filtros activos y recarga la vista completa
 * Esta función se llama cuando el usuario hace clic en "Limpiar Filtros"
 */
function clearFilters() {
  console.log('Limpiando filtros');

  // Se limpian los selectores
  document.getElementById('filter-status').value = '';
  document.getElementById('filter-type').value = '';
  const filterUser = document.getElementById('filter-user');
  if (filterUser) {
    filterUser.value = '';
  }

  // Se limpia el filtro activo
  currentFilter = null;

  // Se recarga la vista con todos los datos
  loadView();
}

/**
 *
 * FUNCIONES PARA CARGAR DATOS EN LOS SELECTORES DE FILTROS
 *
 *
 * Estas funciones se llaman al cargar la página para llenar
 * los selectores de filtros con las opciones disponibles
 */

/**
 * Carga los estados en el selector de filtros
 * Esta función debe llamarse al cargar la página
 */
function loadFilterStatuses() {
  const token = getAuthToken();
  getServicesAuth('', METHODS[0], URL_STATUS, token)
    .then(response => handleAuthenticatedResponse(response, 'cargar estados para filtros'))
    .then(data => {
      const filterSelect = document.getElementById('filter-status');
      const statuses = data.data || [];

      // Se filtran solo los estados de tipo 'cpcg'
      const cpcgStatuses = statuses.filter(s => s.entity === 'cpcg' && s.is_active === 1);

      // Se crean las opciones del select
      cpcgStatuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.status_id;
        option.textContent = status.name;
        filterSelect.appendChild(option);
      });
    })
    .catch(e => console.error('Error al cargar estados para filtros:', e));
}

/**
 * Carga los tipos en el selector de filtros
 * Esta función debe llamarse al cargar la página
 *
 * Conexión con el backend:
 * - Endpoint: GET /api_v1/cpcg-types
 * - Controller: CpcgTypeController.getAll()
 */
function loadFilterTypes() {
  const token = getAuthToken();
  getServicesAuth('', METHODS[0], URL_CPCG_TYPE, token)
    .then(response => handleAuthenticatedResponse(response, 'cargar tipos para filtros'))
    .then(data => {
      const filterSelect = document.getElementById('filter-type');
      
      // El backend devuelve la estructura: { success, message, data: [...] }
      const types = data.data || [];
      
      // Se verifica que tipos sea un array válido
      if (!Array.isArray(types)) {
        console.log('La respuesta del backend no contiene tipos válidos para filtros');
        return;
      }

      // Se crean las opciones del select
      types.forEach(type => {
        const option = document.createElement('option');
        // El backend devuelve 'cpcg_type_id' y 'name' según CpcgTypeModel
        option.value = type.cpcg_type_id;
        option.textContent = type.name;
        filterSelect.appendChild(option);
      });
    })
    .catch(e => console.error('Error al cargar tipos para filtros:', e));
}

/**
 * Carga los usuarios en el selector de filtros (solo para administradores)
 * Esta función debe llamarse al cargar la página si el usuario es admin
 */
function loadFilterUsers() {
  // Se verifica si el usuario es administrador
  const userRole = getUserRole(); // Esta función debe existir en tu código

  if (userRole === 'Administrador') {
    // Se muestra el contenedor del filtro de usuarios
    document.getElementById('filter-user-container').style.display = 'block';

    // Se cargan los usuarios
    const token = getAuthToken();
    getServicesAuth('', METHODS[0], URL_USER, token)
      .then(response => handleAuthenticatedResponse(response, 'cargar usuarios para filtros'))
      .then(data => {
        const filterSelect = document.getElementById('filter-user');
        const users = data.data || [];

        // Se crean las opciones del select
        users.forEach(user => {
          const option = document.createElement('option');
          option.value = user.user_id;
          option.textContent = user.username;
          filterSelect.appendChild(option);
        });
      })
      .catch(e => console.error('Error al cargar usuarios para filtros:', e));
  }
}

/**
 * Función auxiliar para obtener el rol del usuario actual
 * Esta función debe leer el rol del token JWT almacenado
 *
 * @returns {string} Rol del usuario ("Administrador", "Residente")
 */
function getUserRole() {
  // Se obtiene el token del localStorage
  const token = localStorage.getItem(KEY_TOKEN);

  if (!token) return null;

  try {
    // Se decodifica el payload del JWT (segunda parte del token)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
}

/**
 *
 * EXPOSICIÓN DE FUNCIONES AL ÁMBITO GLOBAL
 *
 *
 * Las funciones se exponen al ámbito global (window) para que puedan ser
 * llamadas desde los botones inline onclick en la tabla HTML.
 *
 * Esto es necesario porque los botones se crean dinámicamente con
 * atributos onclick="showId(...)", onclick="edit(...)", etc.
 */
window.addEventListener('load', () => {
  window.showId = showId;
  window.edit = edit;
  window.delete_ = delete_;
  window.add = add;

  // Se exponen las funciones de paginación y filtros
  window.goToPage = goToPage;
  window.changeRecordsPerPage = changeRecordsPerPage;
  window.filterByStatus = filterByStatus;
  window.filterByType = filterByType;
  window.filterByUser = filterByUser;
  window.clearFilters = clearFilters;

  // Se cargan los datos para los selectores de filtros
  loadFilterStatuses();
  loadFilterTypes();
  loadFilterUsers();
});

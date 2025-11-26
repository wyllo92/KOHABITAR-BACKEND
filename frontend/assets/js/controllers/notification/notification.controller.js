/**
 * Inicializa el controlador cuando el DOM está completamente cargado.
 * Verifica la autenticación del usuario y aplica efectos visuales de carga.
 */
document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Notification controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

/**
 * Instancia del formulario de notificaciones utilizando la clase Form.
 * Maneja la validación y serialización de datos del formulario.
 */
const objForm = new Form('notificationForm', 'edit-input');

/**
 * Instancia del modal de Bootstrap para mostrar/ocultar el formulario.
 */
const objModal = new bootstrap.Modal(document.getElementById('appModal'));

/**
 * Referencia al cuerpo de la tabla donde se renderizan las notificaciones.
 */
const objTableBody = document.getElementById('app-table-body');

/**
 * Referencia al elemento select para tipos de notificación.
 */
const objSelectNotificationType = document.getElementById('notification_type_id');

/**
 * Referencia al elemento select para usuarios destinatarios.
 */
const objSelectUser = document.getElementById('user_id');

/**
 * Referencia al elemento select para propiedades (opcional según modelo Notification).
 */
const objSelectProperty = document.getElementById('property_id');

/**
 * Referencia al elemento select para estados (obligatorio según modelo Notification).
 */
const objSelectStatus = document.getElementById('status_id');

/**
 * Referencia al elemento de prioridad de notificación.
 */
const objSelectPriority = document.getElementById('notification_priority');

/**
 * Referencia al formulario HTML.
 */
const myForm = objForm.getForm();

/**
 * Mensaje de confirmación para eliminación de notificaciones.
 */
const textConfirm = "¿Estás seguro de que deseas eliminar esta notificación?";

/**
 * Selector de la tabla principal.
 */
const appTable = "#app-table";

/**
 * Variables de control para el estado del formulario y endpoints.
 */
let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

/**
 * Mapeo de valores de prioridad del frontend al backend.
 * Frontend: Baja, Media, Alta, Urgente
 * Backend: 1, 2, 3, 4
 */
const priorityMap = {
  'Baja': 1,
  'Media': 2,
  'Alta': 3,
  'Urgente': 4
};

/**
 * Mapeo inverso para mostrar prioridades en el frontend.
 */
const priorityMapReverse = {
  1: 'Baja',
  2: 'Media',
  3: 'Alta',
  4: 'Urgente'
};

/**
 * Maneja el evento de envío del formulario.
 * Valida los datos y envía la petición al backend (POST o PUT).
 */
myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }
  toggleLoading(true);

  // Configurar método HTTP y endpoint según el modo (insertar o actualizar)
  if (insertUpdate) {
    console.log("Insertando nueva notificación");
    httpMethod = METHODS[1];
    endpointUrl = URL_NOTIFICATION;
  } else {
    console.log("Actualizando notificación");
    httpMethod = METHODS[2];
    endpointUrl = URL_NOTIFICATION + "/" + keyId;
  }

  // Obtener datos del formulario y transformarlos al formato esperado por el modelo Notification
  const formData = objForm.getDataForm();

  // Procesar el campo user_id para soportar envío individual o masivo
  // Si el usuario seleccionó "all", se envía como "all" para que el backend lo procese
  // Si seleccionó un número, se convierte a entero
  let processedUserId;
  if (formData.user_id === 'all' || formData.user_id === '0') {
    processedUserId = 'all'; // Envío masivo a todos los usuarios
  } else {
    processedUserId = parseInt(formData.user_id); // Envío a usuario específico
  }

  documentData = {
    user_id: processedUserId, // ID del usuario o "all" para envío masivo
    title: formData.notification_title, // Obligatorio: título de la notificación
    message: formData.notification_message, // Obligatorio: contenido del mensaje
    notification_type_id: parseInt(formData.notification_type_id), // Obligatorio: tipo de notificación
    priority: parseInt(formData.notification_priority) || 2, // Obligatorio: prioridad como número
    status_id: parseInt(formData.status_id) || 1, // Obligatorio: estado (1 = no leído por defecto)
    property_id: formData.property_id ? parseInt(formData.property_id) : null // Opcional: propiedad asociada
  };

  console.log('Datos del formulario adaptados al modelo Notification:', documentData);

  // Obtiene el token de autenticación requerido por el backend
  const token = getAuthToken();

  // Enviar petición al backend con autenticación JWT
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Respuesta del servidor:', data);

    // Verificar si hubo un error en la operación
    if (data.error || !data.success) {
      alert('Error: ' + (data.error || data.message || 'Error desconocido'));
      return;
    }

    // Construir mensaje de éxito basado en el tipo de envío
    let successMessage = '';
    if (data.broadcast) {
      // Mensaje para envío masivo
      successMessage = `Notificación enviada exitosamente a ${data.created} de ${data.total} usuarios activos`;
      if (data.created < data.total) {
        successMessage += `\n\nNota: ${data.total - data.created} usuarios no recibieron la notificación debido a errores`;
      }
    } else {
      // Mensaje para envío individual
      successMessage = data.message || 'Notificación enviada exitosamente';
    }

    alert(successMessage);
  }).catch(error => {
    console.log('Error en la operación:', error);
    alert('Error en la operación. Por favor, inténtalo de nuevo.');
  }).finally(() => {
    loadView();
    showHiddenModal(false);
  });
});

/**
 * Abre el modal para agregar una nueva notificación.
 * Resetea el formulario y lo habilita en modo inserción.
 */
/**
 * FUNCIÓN PARA AGREGAR UNA NUEVA NOTIFICACIÓN
 *
 * Prepara el formulario para crear una nueva notificación y carga dinámicamente
 * todos los catálogos necesarios según el modelo Notification del backend.
 *
 * El frontend carga del backend 
 * - Tipos de notificación (obligatorio)
 * - Usuarios (obligatorio)
 * - Propiedades (opcional)
 * - Estados (obligatorio)
 */
function add() {
  showHiddenModal(true);
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
  
  // Carga dinámicamente todos los catálogos necesarios para el modelo Notification
  console.log('Cargando catálogos para nueva notificación...');
  getDataNotificationType();
  getDataUser();
  getDataProperties();
  getDataStatuses();
}

/**
 * Muestra los detalles de una notificación específica en modo solo lectura.
 * Obtiene los datos del backend mediante el endpoint GET /notifications/:id
 *
 * @param {number} id - ID de la notificación a visualizar.
 */
function showId(id) {
  objForm.resetForm();
  objForm.disabledForm();
  objForm.disabledButton();
  objForm.hiddenButton();
  getDataId(id);
}

/**
 * FUNCIÓN PARA EDITAR UNA NOTIFICACIÓN EXISTENTE
 *
 * Prepara el formulario para editar una notificación existente y carga dinámicamente
 * todos los catálogos necesarios. El frontend carga del modelo Notification
 * del backend obteniendo y mostrando todos los campos disponibles.
 *
 * @param {number} id - ID de la notificación a editar según el modelo Notification
 */
function edit(id) {
  insertUpdate = false;
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
  keyId = id;
  
  // Carga dinámicamente todos los catálogos antes de obtener los datos
  console.log('Preparando edición de notificación ID:', id);
  getDataNotificationType();
  getDataUser();
  getDataProperties();
  getDataStatuses();
  
  getDataId(id);
}

/**
 * Elimina una notificación después de confirmación del usuario.
 * Utiliza el endpoint DELETE /notifications/:id del backend.
 *
 * @param {number} id - ID de la notificación a eliminar.
 */
function delete_(id) {
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  if (confirm(textConfirm)) {
    documentData = "";
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = URL_NOTIFICATION + "/" + id;
    
    // Obtiene el token de autenticación requerido por el backend
    const token = getAuthToken();
    
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Notificación eliminada exitosamente:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Notificación eliminada exitosamente');
      }
    }).catch(error => {
      console.log('Error al eliminar:', error);
      alert('Error al eliminar. Por favor, inténtalo de nuevo.');
    }).finally(() => {
      loadView();
    });
  } else {
    console.log("Operación cancelada");
  }
}

/**
 * Obtiene los datos de una notificación específica por su ID.
 * Utiliza el endpoint GET /notifications/:id del backend.
 * Transforma los datos del backend al formato esperado por el formulario.
 *
 * @param {number} id - ID de la notificación a obtener.
 */
function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_NOTIFICATION + "/" + id;
  
  // Obtiene el token de autenticación requerido por el backend
  const token = getAuthToken();
  
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de la notificación obtenidos:', data);
    if (data.data) {
      let getData = data.data;

      // Transformar datos del backend al formato del formulario
      const formData = {
        notification_title: getData.title,
        notification_message: getData.message,
        notification_type_id: getData.notification_type_id,
        user_id: getData.user_id,
        notification_priority: priorityMapReverse[getData.priority] || 'Media'
      };

      objForm.setDataFormJson(formData);
    } else {
      alert('Error: No se encontraron datos de la notificación');
    }
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos de la notificación');
  }).finally(() => {
    showHiddenModal(true);
  });
}

/**
 * Obtiene todas las notificaciones del sistema.
 * Utiliza el endpoint GET /notifications del backend.
 * Destruye y reinicializa DataTable después de cargar los datos.
 */
/**
 * FUNCIÓN PARA OBTENER TODAS LAS NOTIFICACIONES
 *
 * Obtiene la lista completa de notificaciones desde el backend usando autenticación JWT.
 * El frontend carga del backend que requiere token de autenticación.
 *
 * Flujo de conexión con backend:
 * 1. Obtiene el token JWT del almacenamiento local
 * 2. Llama a getServicesAuth() con el token
 * 3. El backend valida el token en authMiddleware
 * 4. NotificationController.getAllNotifications() procesa la petición
 * 5. Se renderizan los datos en la tabla
 */
function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_NOTIFICATION;

  // Obtiene el token de autenticación del sistema AppStorage
  const token = getAuthToken();

  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de notificaciones recibidos del backend:', data);
    createTable(data);
    // Destruir DataTable si ya existe
    if ($.fn.DataTable.isDataTable(appTable)) {
      $(appTable).DataTable().destroy();
    }
    new DataTable(appTable);
  }).catch(error => {
    console.log('Error al obtener notificaciones:', error);
    alert('Error al cargar los datos de notificaciones');
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * Crea las filas de la tabla con los datos de notificaciones recibidos del backend.
 * Mapea los campos del modelo de notificaciones a las columnas de la tabla.
 *
 * Mapeo de datos:
 * - Backend: notification_id → Frontend: ID
 * - Backend: title → Frontend: Título
 * - Backend: notification_type_name → Frontend: Tipo
 * - Backend: full_name/username → Frontend: Destinatario
 * - Backend: status_name → Frontend: Estado
 * - Backend: created_at → Frontend: Fecha
 *
 * @param {Object} data - Objeto de respuesta del backend con estructura { success, message, data: [] }
 */
function createTable(data) {
  objTableBody.innerHTML = ""; // Limpiar datos previos de la tabla
  let getData = data.data || [];
  console.log('Datos para crear tabla:', getData);

  if (getData.length === 0) {
    console.log('No hay datos para mostrar');
    objTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay notificaciones disponibles</td></tr>';
    return;
  }

  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Fila actual:', row);

    // Determinar el estado (leída o no leída)
    const statusActive = row.status_name || 'N/A';
    const isRead = row.read_at !== null && row.read_at !== undefined;
    const statusClass = isRead ? 'text-success' : 'text-warning';
    const statusText = isRead ? 'Leída' : 'No leída';

    // Formatear fecha de creación
    const notificationDate = row.created_at || 'N/A';
    const formattedDate = notificationDate !== 'N/A' ? new Date(notificationDate).toLocaleDateString('es-ES') : 'N/A';

    // Obtener nombre del destinatario (puede venir como full_name o username)
    const recipientName = row.full_name || row.username || 'N/A';

    // Botón para marcar como leída (solo si no está leída)
    const markAsReadButton = !isRead ?
      `<button type="button" title="Marcar como Leída" class="btn btn-info btn-sm" onclick="markAsRead(${row.notification_id})">
        <i class='fas fa-check'></i>
      </button>` : '';

    let dataRow = `<tr>
      <td>${row.notification_id}</td>
      <td>${row.title}</td>
      <td>${row.notification_type_name || 'General'}</td>
      <td>${recipientName}</td>
      <td>
        <span class="${statusClass}">${statusText}</span>
      </td>
      <td>${formattedDate}</td>
      <td>
        <button type="button" title="Ver Notificación" class="btn btn-success btn-sm" onclick="showId(${row.notification_id})">
          <i class='fas fa-eye'></i>
        </button>
        ${markAsReadButton}
        <button type="button" title="Editar Notificación" class="btn btn-primary btn-sm" onclick="edit(${row.notification_id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Notificación" class="btn btn-danger btn-sm" onclick="delete_(${row.notification_id})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

/**
 * Crea las opciones del select de tipos de notificación.
 * Los datos provienen del endpoint GET /notificationType/ definido en constants.js
 *
 * @param {Object} data - Objeto de respuesta del backend con estructura { success, message, data: [] }
 */
function createSelectNotificationType(data) {
  objSelectNotificationType.innerHTML = "<option value='' selected disabled>Selecciona el tipo</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;

  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.notification_type_id || row.id}">${row.notification_type_name || row.name || 'Tipo ' + (row.notification_type_id || row.id)}</option>`;
    objSelectNotificationType.innerHTML += dataRow;
  }
}

/**
 * Crea las opciones del select de usuarios destinatarios.
 * Los datos provienen del endpoint GET /user/ definido en constants.js
 * El sistema preserva la opción "Todos los usuarios" que permite envío masivo de notificaciones.
 *
 * @param {Object} data - Objeto de respuesta del backend con estructura { success, message, data: [] }
 */
function createSelectUser(data) {
  // El sistema inicializa el select con las opciones predeterminadas
  // Incluye la opción de selección inicial y la opción para envío masivo
  objSelectUser.innerHTML = `<option value='' selected disabled>Selecciona el destinatario</option>
    <option value="all" style="font-weight: bold; background-color: #e3f2fd;">
      Todos los usuarios (Envío masivo)
    </option>`;

  let getData = data.data || [];
  if (getData.length === 0) return;

  // El sistema itera sobre los usuarios obtenidos del backend
  // y crea una opción del select por cada usuario
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // El sistema mapea los campos del modelo User del backend:
    // user_id, username, email, phone, role_name, status_name
    let dataRow = `<option value="${row.user_id || row.id}">${row.username || row.user_name || 'Usuario ' + (row.user_id || row.id)}</option>`;
    objSelectUser.innerHTML += dataRow;
  }
}

/**
 * Muestra u oculta el modal del formulario de notificaciones.
 *
 * @param {boolean} type - true para mostrar, false para ocultar.
 */
function showHiddenModal(type) {
  if (type) {
    objModal.show();
  } else {
    objModal.hide();
  }
}

/**
 * Recarga la vista de notificaciones.
 * Activa el loading screen y obtiene los datos actualizados del backend.
 */
function loadView() {
  getData();
  toggleLoading(true);
}

/**
 * Obtiene los tipos de notificación disponibles desde el backend.
 * Utiliza el endpoint GET /notificationType/ definido en constants.js (URL_NOTIFICATION_TYPE)
 */
function getDataNotificationType() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_NOTIFICATION_TYPE;
  
  // Obtiene el token de autenticación del sistema AppStorage
  const token = getAuthToken();
  
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Tipos de notificación cargados exitosamente:', data);
    createSelectNotificationType(data);
  }).catch(error => {
    console.log('Error al cargar tipos de notificación:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * Obtiene la lista de usuarios desde el backend.
 * Utiliza el endpoint GET /user/ definido en constants.js (URL_USER)
 */
function getDataUser() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_USER; // Usa el endpoint correcto para usuarios
  
  // Obtiene el token de autenticación del sistema AppStorage
  const token = getAuthToken();
  
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Usuarios cargados exitosamente para notificaciones:', data);
    createSelectUser(data);
  }).catch(error => {
    console.log('Error al cargar usuarios:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * Marca una notificación como leída.
 * Utiliza el endpoint PATCH /notifications/:id/read del backend.
 *
 * @param {number} id - ID de la notificación a marcar como leída.
 */
function markAsRead(id) {
  toggleLoading(true);
  documentData = "";
  httpMethod = METHODS[4]; // PATCH method
  endpointUrl = URL_NOTIFICATION + "/" + id + '/read';

  // Obtiene el token de autenticación requerido por el backend
  const token = getAuthToken();

  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Respuesta al marcar como leída:', data);
    if (data.error) {
      alert('Error: ' + data.error);
    } else {
      alert(data.message || 'Notificación marcada como leída exitosamente');
    }
  }).catch(error => {
    console.log('Error al marcar como leída:', error);
    alert('Error al marcar la notificación como leída');
  }).finally(() => {
    loadView();
  });
}

/**
 * FUNCIÓN PARA CARGAR LAS PROPIEDADES DISPONIBLES
 *
 * Obtiene dinámicamente las propiedades disponibles desde el backend.
 * El frontend carga del modelo Notification donde property_id es opcional.
 */
function getDataProperties() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PROPERTY;
  
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Propiedades cargadas exitosamente para notificaciones:', data);
    if (data.data && data.data.length > 0 && objSelectProperty) {
      objSelectProperty.innerHTML = '<option value="" selected>Sin propiedad asociada</option>';
      data.data.forEach(property => {
        const propertyId = property.property_id || property.id;
        const propertyName = property.name || property.property_name || `Propiedad ${propertyId}`;
        objSelectProperty.innerHTML += `<option value="${propertyId}">${propertyName}</option>`;
      });
    }
  }).catch(error => {
    console.log('Error al cargar propiedades:', error);
    if (objSelectProperty) {
      objSelectProperty.innerHTML = '<option value="" disabled style="color: red;">Error al cargar propiedades</option>';
    }
  });
}

/**
 * FUNCIÓN PARA CARGAR LOS ESTADOS DISPONIBLES
 *
 * Obtiene dinámicamente los estados disponibles desde el backend.
 * El frontend carga del modelo Notification donde status_id es obligatorio.
 */
function getDataStatuses() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  // El sistema filtra los estados por la entidad notification
  endpointUrl = URL_STATUS + '?entity=notification';

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Estados de notification cargados exitosamente:', data);
    if (data.data && data.data.length > 0 && objSelectStatus) {
      objSelectStatus.innerHTML = '<option value="" selected disabled>Selecciona el estado</option>';
      data.data.forEach(status => {
        const statusId = status.status_id || status.id;
        const statusName = status.name || status.status_name || `Estado ${statusId}`;
        objSelectStatus.innerHTML += `<option value="${statusId}">${statusName}</option>`;
      });
    }
  }).catch(error => {
    console.log('Error al cargar estados de notification:', error);
    if (objSelectStatus) {
      objSelectStatus.innerHTML = '<option value="" disabled style="color: red;">Error al cargar estados</option>';
    }
  });
}

/**
 * Inicializa la vista cuando la ventana termina de cargar.
 * Carga las notificaciones, tipos de notificación y usuarios.
 */
window.addEventListener('load', () => {
  loadView();
  getDataNotificationType();
  getDataUser();
}); 
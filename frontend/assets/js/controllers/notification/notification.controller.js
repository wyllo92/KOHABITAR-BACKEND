document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Notification controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

const objForm = new Form('notificationForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectNotificationType = document.getElementById('notification_type_id');
const objSelectUser = document.getElementById('user_id');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar esta notificación?";
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

/* ============================
   CREAR / ACTUALIZAR
============================ */
myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }

  toggleLoading(true);

  if (insertUpdate) {
    console.log("Insertando nueva notificación");
    httpMethod = METHODS[1]; // POST
    endpointUrl = URL_NOTIFICATION;
  } else {
    console.log("Actualizando notificación");
    httpMethod = METHODS[2]; // PUT
    endpointUrl = `${URL_NOTIFICATION}${keyId}`;
  }

  documentData = objForm.getDataForm();
  console.log('Datos del formulario:', documentData);

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices
    .then(response => response.json())
    .then(data => {
      console.log('Respuesta del servidor:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Operación completada exitosamente');
      }
    })
    .catch(error => {
      console.error('Error en la operación:', error);
      alert('Error en la operación. Por favor, inténtalo de nuevo.');
    })
    .finally(() => {
      loadView();
      showHiddenModal(false);
    });
});

/* ============================
   FUNCIONES CRUD
============================ */
function add() {
  showHiddenModal(true);
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
}

function showId(id) {
  objForm.resetForm();
  objForm.disabledForm();
  objForm.disabledButton();
  objForm.hiddenButton();
  getDataId(id);
}

function edit(id) {
  insertUpdate = false;
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
  keyId = id;
  getDataId(id);
}

function delete_(id) {
  if (!confirm(textConfirm)) {
    console.log("Operación cancelada");
    return;
  }

  documentData = "";
  httpMethod = METHODS[3]; // DELETE
  endpointUrl = `${URL_NOTIFICATION}${id}`;

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices
    .then(response => response.json())
    .then(data => {
      console.log('Respuesta de eliminación:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Notificación eliminada exitosamente');
      }
    })
    .catch(error => {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar. Por favor, inténtalo de nuevo.');
    })
    .finally(() => loadView());
}

/* ============================
   CONSULTAS AL BACKEND
============================ */
function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = `${URL_NOTIFICATION}${id}`;

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices
    .then(response => response.json())
    .then(data => {
      console.log('Datos de la notificación:', data);
      const getData = data.data || data; // Manejo flexible de respuesta
      objForm.setDataFormJson(getData);
    })
    .catch(error => {
      console.error('Error al obtener datos:', error);
      alert('Error al obtener los datos de la notificación.');
    })
    .finally(() => showHiddenModal(true));
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_NOTIFICATION;

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices
    .then(response => response.json())
    .then(data => {
      console.log('Datos recibidos del backend:', data);
      createTable(data);
      if ($.fn.DataTable.isDataTable(appTable)) {
        $(appTable).DataTable().destroy();
      }
      new DataTable(appTable);
    })
    .catch(error => {
      console.error('Error al obtener datos:', error);
      alert('Error al cargar las notificaciones.');
    })
    .finally(() => toggleLoading(false));
}

/* ============================
   CREAR TABLA DINÁMICA
============================ */
function createTable(data) {
  objTableBody.innerHTML = "";
  const getData = Array.isArray(data) ? data : data.data || [];

  if (getData.length === 0) {
    objTableBody.innerHTML = `<tr><td colspan="7" class="text-center">No hay notificaciones disponibles</td></tr>`;
    return;
  }

  for (let row of getData) {
    const statusText = row.status_name || 'N/A';
    const statusClass = statusText.toLowerCase().includes('leída') ? 'text-success' : 'text-warning';
    const formattedDate = row.notification_created_at
      ? new Date(row.notification_created_at).toLocaleString('es-ES')
      : 'N/A';

    const htmlRow = `
      <tr>
        <td>${row.notification_id}</td>
        <td>${row.notification_title || 'N/A'}</td>
        <td>${row.notification_type_name || 'N/A'}</td>
        <td>${row.username || 'N/A'}</td>
        <td><span class="${statusClass}">${statusText}</span></td>
        <td>${formattedDate}</td>
        <td>
          <button class="btn btn-success btn-sm" title="Ver" onclick="showId(${row.notification_id})">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-primary btn-sm" title="Editar" onclick="edit(${row.notification_id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm" title="Eliminar" onclick="delete_(${row.notification_id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`;
    objTableBody.innerHTML += htmlRow;
  }
}

/* ============================
   SELECTS (Tipos y Usuarios)
============================ */
function createSelectNotificationType(data) {
  try {
    console.log('Creando select de tipos de notificación:', data);
    objSelectNotificationType.innerHTML = '<option value="" selected disabled>Selecciona el tipo</option>';

    // Normalize different response shapes: array, { data: [] }, or single object
    let list = [];
    if (!data) list = [];
    else if (Array.isArray(data)) list = data;
    else if (Array.isArray(data.data)) list = data.data;
    else if (data.success && Array.isArray(data.data)) list = data.data;
    else if (typeof data === 'object') {
      // Sometimes DB returns PascalCase column names or camelCase
      // If it's a single object, try to transform to array
      list = [data];
    }

    if (!Array.isArray(list) || list.length === 0) {
      console.warn('No hay tipos de notificación para mostrar:', data);
      objSelectNotificationType.innerHTML += '<option value="" disabled>No hay tipos disponibles</option>';
      return;
    }

    list.forEach(type => {
      const id = type.notification_type_id || type.Notification_type_id || type.Notification_Type_id || type.id || type.ID;
      const name = type.notification_type_name || type.Notification_type_name || type.Notification_type || type.name || type.Notification_Type_name;

      if (id != null && name != null) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        objSelectNotificationType.appendChild(option);
      } else {
        console.warn('Tipo de notificación con campos inesperados:', type);
      }
    });

    console.log('Select de tipos de notificación actualizado');
  } catch (error) {
    console.error('Error al crear select de tipos:', error);
    objSelectNotificationType.innerHTML = '<option value="" disabled>Error al cargar tipos</option>';
  }
}

function createSelectUser(data) {
  try {
    console.log('Creando select de usuarios con datos:', data);
    objSelectUser.innerHTML = "<option value='' selected disabled>Selecciona el destinatario</option>";
    
    // Asegurarse de que tenemos un array para trabajar
    const getData = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
    console.log('Datos de usuarios procesados:', getData);

    if (getData.length === 0) {
      console.warn('No hay datos de usuarios para mostrar');
      objSelectUser.innerHTML += "<option value='' disabled>No hay usuarios disponibles</option>";
      return;
    }

    for (let row of getData) {
      // Verificar que tengamos los campos necesarios y que no sean undefined
      const userId = row.user_id;
      const userName = row.user_name || row.username;
      
      if (userId && userName) {
        console.log(`Agregando usuario: ${userId} - ${userName}`);
        objSelectUser.innerHTML += `<option value="${userId}">${userName}</option>`;
      } else {
        console.warn('Fila de usuario con datos incompletos:', row);
      }
    }
  } catch (error) {
    console.error('Error al crear select de usuarios:', error);
    objSelectUser.innerHTML = "<option value='' disabled>Error al cargar usuarios</option>";
  }
}

/* ============================
   UTILITARIOS
============================ */
function showHiddenModal(show) {
  show ? objModal.show() : objModal.hide();
}

function loadView() {
  getData();
  toggleLoading(true);
}

function getDataNotificationType() {
  try {
    console.log('Obteniendo tipos de notificación...');
    documentData = "";
    httpMethod = METHODS[0]; // GET
    // Try the 'active' endpoint first, then fallback to the general one
    const tryActive = `${URL_NOTIFICATION_TYPE}active`;
    const tryAll = URL_NOTIFICATION_TYPE;

    const handleResponse = async (resp) => {
      try {
        const data = await resp.json();
        console.log('Tipos de notificación recibidos:', data);
        // Accept different shapes
        if (Array.isArray(data)) {
          createSelectNotificationType(data);
          return true;
        }
        if (data && Array.isArray(data.data)) {
          createSelectNotificationType(data.data);
          return true;
        }
        // If single object with fields, try to use it
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          // It might be { success: true, data: [] } handled above, or a single item
          if (data.success && Array.isArray(data.data)) {
            createSelectNotificationType(data.data);
            return true;
          }
          // Fallback: try to populate with whatever was returned
          createSelectNotificationType(data);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error parseando respuesta de tipos:', err);
        return false;
      }
    };

    // First attempt
    getDataServices(documentData, httpMethod, tryActive)
      .then(async (response) => {
        if (!response.ok) {
          console.warn('Respuesta no OK desde active, intentando endpoint general', response.status);
          // Try general endpoint
          return getDataServices(documentData, httpMethod, tryAll);
        }
        const ok = await handleResponse(response);
        if (!ok) {
          // Try general endpoint
          return getDataServices(documentData, httpMethod, tryAll);
        }
        return null;
      })
      .then(async (maybeResponse) => {
        if (!maybeResponse) return;
        if (maybeResponse instanceof Response && maybeResponse.ok) {
          await handleResponse(maybeResponse);
        } else if (maybeResponse instanceof Response) {
          console.error('Ambos endpoints devolvieron error', maybeResponse.status);
          alert('Error al cargar los tipos de notificación.');
        }
      })
      .catch(error => {
        console.error('Error al obtener tipos de notificación:', error);
        alert('Error al cargar los tipos de notificación.');
      });
  } catch (error) {
    console.error('Error en getDataNotificationType:', error);
    alert('Error al procesar los tipos de notificación.');
  }
}

function getDataUser() {
  try {
    console.log('URL de usuarios:', URL_USER);
    documentData = "";
    httpMethod = METHODS[0];
    endpointUrl = URL_USER;

    if (!endpointUrl) {
      console.error('URL_USER no está definida');
      return;
    }

    toggleLoading(true);
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices
      .then(response => {
        console.log('Respuesta del servidor:', response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Datos de usuarios recibidos:', data);
        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.warn('No se recibieron datos de usuarios');
          return;
        }
        createSelectUser(data);
      })
      .catch(error => {
        console.error('Error al obtener usuarios:', error);
        alert('Error al cargar los usuarios. Por favor, intente nuevamente.');
      })
      .finally(() => toggleLoading(false));
  } catch (error) {
    console.error('Error en getDataUser:', error);
    toggleLoading(false);
  }
}

window.addEventListener('load', () => {
  loadView();
  getDataNotificationType();
  getDataUser();
});

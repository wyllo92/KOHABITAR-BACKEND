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
const objSelectUser = document.getElementById('user_id');
const objSelectProperty = document.getElementById('property_id');
const objSelectStatus = document.getElementById('status_id');
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
      const getData = data.data || data;
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
    const statusClass = statusText.toLowerCase().includes('leída') || statusText.toLowerCase().includes('leido') 
      ? 'text-success' 
      : 'text-warning';
    const formattedDate = row.notification_created_at
      ? new Date(row.notification_created_at).toLocaleString('es-ES')
      : 'N/A';

    const htmlRow = `
      <tr>
        <td>${row.notification_id}</td>
        <td>${row.notification_title || 'N/A'}</td>
        <td>${row.property_name || 'N/A'}</td>
        <td>${row.user_name || 'N/A'}</td>
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
   SELECTS (Usuarios, Propiedades, Estados)
============================ */
function createSelectUser(data) {
  try {
    console.log('Creando select de usuarios con datos:', data);
    objSelectUser.innerHTML = "<option value='' selected disabled>Selecciona el usuario</option>";
    
    const getData = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
    console.log('Datos de usuarios procesados:', getData);

    if (getData.length === 0) {
      console.warn('No hay datos de usuarios para mostrar');
      objSelectUser.innerHTML += "<option value='' disabled>No hay usuarios disponibles</option>";
      return;
    }

    for (let row of getData) {
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

function createSelectProperty(data) {
  try {
    console.log('Creando select de propiedades con datos:', data);
    objSelectProperty.innerHTML = "<option value='' selected disabled>Selecciona la propiedad</option>";
    
    const getData = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
    console.log('Datos de propiedades procesados:', getData);

    if (getData.length === 0) {
      console.warn('No hay datos de propiedades para mostrar');
      objSelectProperty.innerHTML += "<option value='' disabled>No hay propiedades disponibles</option>";
      return;
    }

    for (let row of getData) {
      const propertyId = row.property_id;
      const propertyName = row.property_name;
      
      if (propertyId && propertyName) {
        console.log(`Agregando propiedad: ${propertyId} - ${propertyName}`);
        objSelectProperty.innerHTML += `<option value="${propertyId}">${propertyName}</option>`;
      } else {
        console.warn('Fila de propiedad con datos incompletos:', row);
      }
    }
  } catch (error) {
    console.error('Error al crear select de propiedades:', error);
    objSelectProperty.innerHTML = "<option value='' disabled>Error al cargar propiedades</option>";
  }
}

function createSelectStatus(data) {
  try {
    console.log('Creando select de estados con datos:', data);
    objSelectStatus.innerHTML = "<option value='' selected disabled>Selecciona el estado</option>";
    
    const getData = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
    console.log('Datos de estados procesados:', getData);

    if (getData.length === 0) {
      console.warn('No hay datos de estados para mostrar');
      objSelectStatus.innerHTML += "<option value='' disabled>No hay estados disponibles</option>";
      return;
    }

    for (let row of getData) {
      const statusId = row.status_id;
      const statusName = row.status_name;
      
      if (statusId && statusName) {
        console.log(`Agregando estado: ${statusId} - ${statusName}`);
        objSelectStatus.innerHTML += `<option value="${statusId}">${statusName}</option>`;
      } else {
        console.warn('Fila de estado con datos incompletos:', row);
      }
    }
  } catch (error) {
    console.error('Error al crear select de estados:', error);
    objSelectStatus.innerHTML = "<option value='' disabled>Error al cargar estados</option>";
  }
}

/* ============================
   OBTENER DATOS PARA SELECTS
============================ */
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

function getDataProperty() {
  try {
    console.log('URL de propiedades:', URL_PROPERTY);
    documentData = "";
    httpMethod = METHODS[0];
    endpointUrl = URL_PROPERTY;

    if (!endpointUrl) {
      console.error('URL_PROPERTY no está definida');
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
        console.log('Datos de propiedades recibidos:', data);
        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.warn('No se recibieron datos de propiedades');
          return;
        }
        createSelectProperty(data);
      })
      .catch(error => {
        console.error('Error al obtener propiedades:', error);
        alert('Error al cargar las propiedades. Por favor, intente nuevamente.');
      })
      .finally(() => toggleLoading(false));
  } catch (error) {
    console.error('Error en getDataProperty:', error);
    toggleLoading(false);
  }
}

function getDataStatus() {
  try {
    console.log('URL de estados:', URL_STATUS);
    documentData = "";
    httpMethod = METHODS[0];
    endpointUrl = URL_STATUS;

    if (!endpointUrl) {
      console.error('URL_STATUS no está definida');
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
        console.log('Datos de estados recibidos:', data);
        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.warn('No se recibieron datos de estados');
          return;
        }
        createSelectStatus(data);
      })
      .catch(error => {
        console.error('Error al obtener estados:', error);
        alert('Error al cargar los estados. Por favor, intente nuevamente.');
      })
      .finally(() => toggleLoading(false));
  } catch (error) {
    console.error('Error en getDataStatus:', error);
    toggleLoading(false);
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

window.addEventListener('load', () => {
  loadView();
  getDataUser();
  getDataProperty();
  getDataStatus();
});
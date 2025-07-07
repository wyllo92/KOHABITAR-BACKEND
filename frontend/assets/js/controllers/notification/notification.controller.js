document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Notification controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen

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

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }
  toggleLoading(true);
  if (insertUpdate) {
    console.log("Insertando nueva notificación");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_NOTIFICATION;
  } else {
    console.log("Actualizando notificación");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_NOTIFICATION + keyId;
  }
  documentData = objForm.getDataForm();
  console.log('Datos del formulario:', documentData);

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Respuesta del servidor:', data);
    if (data.error) {
      alert('Error: ' + data.error);
    } else {
      alert(data.message || 'Operación completada exitosamente');
    }
  }).catch(error => {
    console.log('Error en la operación:', error);
    alert('Error en la operación. Por favor, inténtalo de nuevo.');
  }).finally(() => {
    loadView();
    showHiddenModal(false);
  });
});

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
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  if (confirm(textConfirm)) {
    documentData = "";
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = URL_NOTIFICATION + id;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta de eliminación:', data);
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

function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_NOTIFICATION + id;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de la notificación:', data);
    if (data.data) {
      let getData = data.data;
      objForm.setDataFormJson(getData);
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

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_NOTIFICATION;

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos recibidos del backend:', data);
    createTable(data);
    // Destruir DataTable si ya existe
    if ($.fn.DataTable.isDataTable(appTable)) {
      $(appTable).DataTable().destroy();
    }
    new DataTable(appTable);
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al cargar los datos de notificaciones');
  }).finally(() => {
    toggleLoading(false);
  });
}

function createTable(data) {
  objTableBody.innerHTML = ""; // Clear previous table data
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
    
    // Determinar el estado activo/inactivo
    const statusActive = row.status_name || 'N/A';
    const statusClass = row.status_name === 'Activo' ? 'text-success' : 'text-danger';
    
    // Formatear fecha
    const notificationDate = row.notification_created_at || row.created_at || 'N/A';
    const formattedDate = notificationDate !== 'N/A' ? new Date(notificationDate).toLocaleDateString('es-ES') : 'N/A';
    
    let dataRow = `<tr>
      <td>${row.notification_id || row.id}</td>
      <td>${row.notification_title || row.title || 'N/A'}</td>
      <td>${row.notification_type_name || row.type_name || 'N/A'}</td>
      <td>${row.user_name || 'N/A'}</td>
      <td>
        <span class="${statusClass}">${statusActive}</span>
      </td>
      <td>${formattedDate}</td>
      <td>
        <button type="button" title="Ver Notificación" class="btn btn-success btn-sm" onclick="showId(${row.notification_id || row.id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Notificación" class="btn btn-primary btn-sm" onclick="edit(${row.notification_id || row.id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Notificación" class="btn btn-danger btn-sm" onclick="delete_(${row.notification_id || row.id})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

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

function createSelectUser(data) {
  objSelectUser.innerHTML = "<option value='' selected disabled>Selecciona el destinatario</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.user_id || row.id}">${row.user_name || row.username || 'Usuario ' + (row.user_id || row.id)}</option>`;
    objSelectUser.innerHTML += dataRow;
  }
}

function showHiddenModal(type) {
  if (type) {
    objModal.show();
  } else {
    objModal.hide();
  }
}

function loadView() {
  getData();
  toggleLoading(true);
}

function getDataNotificationType() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_NOTIFICATION_TYPE || HOST + "/notificationType/";
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de tipos de notificación:', data);
    createSelectNotificationType(data);
  }).catch(error => {
    console.log('Error al obtener tipos de notificación:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

function getDataUser() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_USER;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de usuarios:', data);
    createSelectUser(data);
  }).catch(error => {
    console.log('Error al obtener usuarios:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

window.addEventListener('load', () => {
  loadView();
  getDataNotificationType();
  getDataUser();
}); 
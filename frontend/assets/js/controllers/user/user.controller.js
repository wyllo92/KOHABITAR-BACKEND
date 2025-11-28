document.addEventListener('DOMContentLoaded', async ()=> {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
 
  await checkAuth();
  console.log('user controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

const objForm = new Form('userForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectStatus = document.getElementById('status_id');
const objSelectRole = document.getElementById('role_id');
const myForm = objForm.getForm();
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

// Función para mostrar alertas de éxito
function showSuccessAlert(title, message) {
  alert(`✓ ${title}\n${message}`);
}

// Función para mostrar alertas de error
function showErrorAlert(title, message) {
  alert(`✗ ${title}\n${message}`);
}

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    showErrorAlert('Error de validación', 'Por favor, complete todos los campos requeridos correctamente.');
    return;
  }
  toggleLoading(true);
  
  if (insertUpdate) {
    console.log("Insert");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_USER;
  } else {
    console.log("Update");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_USER + keyId;
  }
  
  documentData = objForm.getDataForm();

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    if (!response.ok) {
      throw new Error('Error en la operación');
    }
    return response.json();
  }).then(data => {
    // Mostrar alerta de éxito según la operación
    if (insertUpdate) {
      showSuccessAlert('¡Éxito!', 'El usuario ha sido creado exitosamente.');
    } else {
      showSuccessAlert('¡Éxito!', 'El usuario ha sido actualizado exitosamente.');
    }
  }).catch(error => {
    console.log(error);
    if (insertUpdate) {
      showErrorAlert('Error al crear', 'No se pudo crear el usuario. Por favor, intente nuevamente.');
    } else {
      showErrorAlert('Error al actualizar', 'No se pudo actualizar el usuario. Por favor, intente nuevamente.');
    }
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
  console.log('[DEBUG] delete_ function called with id:', id);
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  
  // Mostrar confirmación nativa del navegador
  console.log('[DEBUG] Showing browser confirmation');
  const confirmed = confirm('¿Estás seguro? Esta acción no se puede deshacer. El usuario será eliminado permanentemente.');
  
  console.log('[DEBUG] Confirmation result:', confirmed);
  
  if (confirmed) {
    console.log('[DEBUG] User confirmed deletion');
    toggleLoading(true);
    documentData = "";
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = URL_USER + id;
    
    console.log('[DEBUG] Making DELETE request to:', endpointUrl);
    console.log('[DEBUG] HTTP Method:', httpMethod);
    
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      console.log('[DEBUG] Response received:', response);
      console.log('[DEBUG] Response status:', response.status);
      console.log('[DEBUG] Response ok:', response.ok);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.json();
    }).then(data => {
      console.log('[DEBUG] Data received:', data);
      showSuccessAlert('¡Éxito!', 'El usuario ha sido eliminado exitosamente.');
      loadView();
      toggleLoading(false);
    }).catch(error => {
      console.error('[ERROR] Error in deletion:', error);
      console.error('[ERROR] Error message:', error.message);
      showErrorAlert('Error al eliminar', 'No se pudo eliminar el usuario. Por favor, intente nuevamente.');
      toggleLoading(false);
    });
  } else {
    console.log("[DEBUG] Eliminación cancelada");
  }
}

function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_USER + id;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    let getData = data["data"];
    objForm.setDataFormJson(getData);
  }).catch(error => {
    console.log(error);
    showErrorAlert('Error al cargar', 'No se pudo cargar la información del usuario.');
  }).finally(() => {
    showHiddenModal(true);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_USER;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    createTable(data);
  }).catch(error => {
    console.log(error);
    showErrorAlert('Error al cargar datos', 'No se pudo cargar la lista de usuarios.');
  }).finally(() => {
    new DataTable(appTable);
    toggleLoading(false);
  });
}

function createTable(data) {
  objTableBody.innerHTML = "";
  let getData = data['data'];
  if (getData.length === 0) return;
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<tr>
<td>${row.user_id}</td>
<td>${row.user_name}</td>
<td>${row.role_name || 'N/A'}</td>
<td>${row.status_name || 'N/A'}</td>
<td>
<button type="button" title="Button Show"class="btn btn-success" onclick="showId(${row.user_id})"><i class='fas fa-eye'></i></button>
<button type="button"title="Button Edit" class="btn btn-primary" onclick="edit(${row.user_id})"><i class='fas fa-edit' ></i></button>
<button type="button" title="Button Delete" class="btn btn-danger" onclick="delete_(${row.user_id})"><i class='fas fa-trash' ></i></button>
</td>
</tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

function createSelectStatus(data) {
  if (!objSelectStatus) {
    console.error('Status select element not found');
    return;
  }
  
  objSelectStatus.innerHTML = "<option value='' selected disabled>Seleccione un estado</option>";

  if (!data || !data.data || !Array.isArray(data.data)) {
    console.warn('Invalid or empty status data');
    return;
  }

  data.data.forEach(row => {
    if (row && row.status_id && row.status_name) {
      let dataRow = `<option value="${row.status_id}">${row.status_name}</option>`;
      objSelectStatus.innerHTML += dataRow;
    }
  });
}

function createSelectRole(data) {
  objSelectRole.innerHTML = "<option value='' selected disabled>Seleccione un rol</option>";

  let getData = data['data'];
  if (getData.length === 0) return;
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.role_id}">${row.role_name}</option>`;
    objSelectRole.innerHTML += dataRow;
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

function getDataStatus() {
  toggleLoading(true);
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_STATUS;

  console.log('Fetching statuses from:', endpointUrl);
  
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    console.log('Raw response:', response);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }).then(data => {
    console.log('Status data received:', data);
    if (!data || !data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid data format received from server');
    }
    if (data.data.length === 0) {
      console.warn('No status data available from server');
      objSelectStatus.innerHTML = "<option value='' selected disabled>No hay estados disponibles</option>";
      return;
    }
    createSelectStatus(data);
  }).catch(error => {
    console.error('Error fetching status:', error);
    console.error('Error details:', error.stack);
    objSelectStatus.innerHTML = "<option value='' selected disabled>Error al cargar estados: " + error.message + "</option>";
  }).finally(() => {
    toggleLoading(false);
  });
}

function getDataRole() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_ROLE;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    createSelectRole(data);
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    toggleLoading(false);
  });
}

window.addEventListener('load', () => {
  loadView();
  getDataStatus();
  getDataRole();
});
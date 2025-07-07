document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Vehicle controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen

});

const objForm = new Form('vehicleForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectUser = document.getElementById('user_id');
const objSelectProperty = document.getElementById('property_id');
const objSelectParkingZone = document.getElementById('parkingZone_id');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar este vehículo?";
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
    console.log("Insertando nuevo vehículo");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_VEHICLE;
  } else {
    console.log("Actualizando vehículo");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_VEHICLE + keyId;
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
    endpointUrl = URL_VEHICLE + id;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta de eliminación:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Vehículo eliminado exitosamente');
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
  endpointUrl = URL_VEHICLE + id;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos del vehículo:', data);
    if (data.data) {
      let getData = data.data;
      objForm.setDataFormJson(getData);
    } else {
      alert('Error: No se encontraron datos del vehículo');
    }
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos del vehículo');
  }).finally(() => {
    showHiddenModal(true);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_VEHICLE;

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos recibidos del backend:', data);
    createTable(data);
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al cargar los datos de vehículos');
  }).finally(() => {
    new DataTable(appTable);
    toggleLoading(false);
  });
}

function createTable(data) {
  objTableBody.innerHTML = ""; // Clear previous table data
  let getData = data.data || [];
  console.log('Datos para crear tabla:', getData);
  
  if (getData.length === 0) {
    console.log('No hay datos para mostrar');
    objTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay vehículos disponibles</td></tr>';
    return;
  }
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Fila actual:', row);
    
    // Determinar el estado activo/inactivo
    const statusActive = row.status_name || 'N/A';
    const statusClass = row.status_name === 'Activo' ? 'text-success' : 'text-danger';
    
    let dataRow = `<tr>
      <td>${row.vehicle_id || row.id}</td>
      <td>${row.model || 'N/A'}</td>
      <td>${row.type || 'N/A'}</td>
      <td>${row.color || 'N/A'}</td>
      <td>${row.user_name || 'N/A'}</td>
      <td>${row.property_name || 'N/A'}</td>
      <td>
        <span class="${statusClass}">${statusActive}</span>
      </td>
      <td>
        <button type="button" title="Ver Vehículo" class="btn btn-success btn-sm" onclick="showId(${row.vehicle_id || row.id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Vehículo" class="btn btn-primary btn-sm" onclick="edit(${row.vehicle_id || row.id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Vehículo" class="btn btn-danger btn-sm" onclick="delete_(${row.vehicle_id || row.id})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

function createSelectUser(data) {
  objSelectUser.innerHTML = "<option value='' selected disabled>Selecciona el propietario</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.user_id || row.id}">${row.user_name || row.username || 'Usuario ' + (row.user_id || row.id)}</option>`;
    objSelectUser.innerHTML += dataRow;
  }
}

function createSelectProperty(data) {
  objSelectProperty.innerHTML = "<option value='' selected disabled>Selecciona la propiedad</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.property_id || row.id}">${row.property_name || row.name || 'Propiedad ' + (row.property_id || row.id)}</option>`;
    objSelectProperty.innerHTML += dataRow;
  }
}

function createSelectParkingZone(data) {
  objSelectParkingZone.innerHTML = "<option value='' selected disabled>Selecciona la zona de parqueo</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.parkingzone_id || row.id}">${row.parkingzone_name || row.name || 'Zona ' + (row.parkingzone_id || row.id)}</option>`;
    objSelectParkingZone.innerHTML += dataRow;
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

function getDataProperty() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PROPERTY;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de propiedades:', data);
    createSelectProperty(data);
  }).catch(error => {
    console.log('Error al obtener propiedades:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

function getDataParkingZone() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PARKINGZONE;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de zonas de parqueo:', data);
    createSelectParkingZone(data);
  }).catch(error => {
    console.log('Error al obtener zonas de parqueo:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

window.addEventListener('load', () => {
  loadView();
  getDataUser();
  getDataProperty();
  getDataParkingZone();
}); 
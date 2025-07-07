document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('ParkingSlot controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen

});

const objForm = new Form('parkingslotForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectParkingZone = document.getElementById('parkingzone_id');
const objSelectUser = document.getElementById('user_id');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar este espacio de parqueo?";
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
    console.log("Insertando nuevo espacio de parqueo");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_PARKINGSLOT;
  } else {
    console.log("Actualizando espacio de parqueo");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_PARKINGSLOT + keyId;
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
    endpointUrl = URL_PARKINGSLOT + id;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta de eliminación:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Espacio de parqueo eliminado exitosamente');
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
  endpointUrl = URL_PARKINGSLOT + id;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos del espacio de parqueo:', data);
    if (data.data) {
      let getData = data.data;
      objForm.setDataFormJson(getData);
    } else {
      alert('Error: No se encontraron datos del espacio de parqueo');
    }
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos del espacio de parqueo');
  }).finally(() => {
    showHiddenModal(true);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PARKINGSLOT;

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
    alert('Error al cargar los datos de espacios de parqueo');
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
    objTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay espacios de parqueo disponibles</td></tr>';
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
      <td>${row.parkingSlot_id || row.id}</td>
      <td>${row.code || 'N/A'}</td>
      <td>${row.zone_type || 'N/A'}</td>
      <td>${row.property_name || 'N/A'}</td>
      <td>
        <span class="${statusClass}">${statusActive}</span>
      </td>
      <td>${row.is_reserved ? 'Reservado' : 'Disponible'}</td>
      <td>
        <button type="button" title="Ver Espacio" class="btn btn-success btn-sm" onclick="showId(${row.parkingSlot_id || row.id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Espacio" class="btn btn-primary btn-sm" onclick="edit(${row.parkingSlot_id || row.id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Espacio" class="btn btn-danger btn-sm" onclick="delete_(${row.parkingSlot_id || row.id})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

function createSelectParkingZone(data) {
  objSelectParkingZone.innerHTML = "<option value='' selected disabled>Selecciona la zona</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.parkingzone_id || row.id}">${row.parkingzone_name || row.name || 'Zona ' + (row.parkingzone_id || row.id)}</option>`;
    objSelectParkingZone.innerHTML += dataRow;
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
  getDataParkingZone();
  getDataUser();
}); 
document.addEventListener('DOMContentLoaded', async ()=> {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
 
  await checkAuth();
  console.log('Status controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen
    
});

const objForm = new Form('statusForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar este estado?";
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
    console.log("Insertando nuevo estado");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_STATUS;
  } else {
    console.log("Actualizando estado");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_STATUS + keyId;
  }
  documentData = objForm.getDataForm();
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
  // Establecer valores por defecto
  document.getElementById('status_entity').value = 'user';
  document.getElementById('status_is_active').value = '1';
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
    endpointUrl = URL_STATUS + id;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta de eliminación:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Estado eliminado exitosamente');
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
  endpointUrl = URL_STATUS + id;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos del estado:', data);
    if (data.data) {
      let getData = data.data;
      objForm.setDataFormJson(getData);
    } else {
      alert('Error: No se encontraron datos del estado');
    }
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos del estado');
  }).finally(() => {
    showHiddenModal(true);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_STATUS;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos recibidos del backend:', data);
    console.log('Datos en data.data:', data.data);
    createTable(data);
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al cargar los datos de estados');
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
    objTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No hay estados disponibles</td></tr>';
    return;
  }
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Fila actual:', row);
    
    // Determinar el estado activo/inactivo
    const statusActive = row.status_is_active == 1 ? 'Activo' : 'Inactivo';
    const statusClass = row.status_is_active == 1 ? 'text-success' : 'text-danger';
    
    let dataRow = `<tr>
      <td>${row.status_id || row.id}</td>
      <td>${row.status_name || row.name}</td>
      <td>${row.status_description || row.description || 'N/A'}</td>
      <td>
        <span class="${statusClass}">${statusActive}</span>
      </td>
      <td>
        <button type="button" title="Ver Estado" class="btn btn-success btn-sm" onclick="showId(${row.status_id || row.id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Estado" class="btn btn-primary btn-sm" onclick="edit(${row.status_id || row.id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Estado" class="btn btn-danger btn-sm" onclick="delete_(${row.status_id || row.id})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;
    objTableBody.innerHTML += dataRow;
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

window.addEventListener('load', () => {
  loadView();
});


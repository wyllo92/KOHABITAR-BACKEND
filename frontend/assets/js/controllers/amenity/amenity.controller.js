document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Amenity controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen

});

const objForm = new Form('amenityForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectAmenityType = document.getElementById('amenity_type_id');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar esta amenidad?";
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
    console.log("Insertando nueva amenidad");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_AMENITY;
  } else {
    console.log("Actualizando amenidad");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_AMENITY + keyId;
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
    endpointUrl = URL_AMENITY + id;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta de eliminación:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Amenidad eliminada exitosamente');
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
  endpointUrl = URL_AMENITY + id;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de la amenidad:', data);
    if (data.data) {
      let getData = data.data;
      objForm.setDataFormJson(getData);
    } else {
      alert('Error: No se encontraron datos de la amenidad');
    }
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos de la amenidad');
  }).finally(() => {
    showHiddenModal(true);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_AMENITY;

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
    alert('Error al cargar los datos de amenidades');
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
    objTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay amenidades disponibles</td></tr>';
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
      <td>${row.amenity_id || row.id}</td>
      <td>${row.name || 'N/A'}</td>
      <td>${row.Amenity_Type_name || 'N/A'}</td>
      <td>${row.property_name || 'N/A'}</td>
      <td>${row.capacity || 'N/A'}</td>
      <td><span class="${statusClass}">${statusActive}</span></td>
      <td>
        <button type="button" title="Ver Amenidad" class="btn btn-success btn-sm" onclick="showId(${row.amenity_id || row.id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Amenidad" class="btn btn-primary btn-sm" onclick="edit(${row.amenity_id || row.id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Amenidad" class="btn btn-danger btn-sm" onclick="delete_(${row.amenity_id || row.id})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

function createSelectAmenityType(data) {
  objSelectAmenityType.innerHTML = "<option value='' selected disabled>Selecciona el tipo</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.amenity_type_id || row.id}">${row.amenity_type_name || row.name || 'Tipo ' + (row.amenity_type_id || row.id)}</option>`;
    objSelectAmenityType.innerHTML += dataRow;
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

function getDataAmenityType() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_AMENITY_TYPE || HOST + "/amenityType/";
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de tipos de amenidad:', data);
    createSelectAmenityType(data);
  }).catch(error => {
    console.log('Error al obtener tipos de amenidad:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

window.addEventListener('load', () => {
  loadView();
  getDataAmenityType();
}); 
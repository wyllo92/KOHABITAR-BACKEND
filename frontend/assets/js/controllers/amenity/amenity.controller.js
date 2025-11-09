document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Amenity controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
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
      toggleLoading(false);
    } else {
      alert(data.message || 'Operación completada exitosamente');
      showHiddenModal(false);
      loadView(); // Recargar la tabla después del éxito
    }
  }).catch(error => {
    console.log('Error en la operación:', error);
    alert('Error en la operación. Por favor, inténtalo de nuevo.');
    toggleLoading(false);
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
    toggleLoading(true);
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
        toggleLoading(false);
      } else {
        alert(data.message || 'Amenidad eliminada exitosamente');
        loadView(); // Recargar la tabla después de eliminar
      }
    }).catch(error => {
      console.log('Error al eliminar:', error);
      alert('Error al eliminar. Por favor, inténtalo de nuevo.');
      toggleLoading(false);
    });
  } else {
    console.log("Operación cancelada");
  }
}

function getDataId(id) {
  toggleLoading(true);
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
    toggleLoading(false);
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
    objTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay amenidades disponibles</td></tr>';
    return;
  }
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Fila actual:', row);
    
    // Determinar el estado activo/inactivo
    const statusActive = row.status_name || 'N/A';
    const statusClass = row.status_name === 'Activo' ? 'text-success' : 'text-danger';
    
    // Obtener datos de la fila (backend retorna amenity_id, name, amenity_type_name, etc.)
    const amenityId = row.amenity_id || '';
    const amenityName = row.name || 'N/A';
    const amenityTypeLabel = row.amenity_type_name || 'N/A';
    const capacity = row.capacity || 'N/A';

    let dataRow = `<tr>
      <td>${amenityId}</td>
      <td>${amenityName}</td>
      <td>${amenityTypeLabel}</td>
      <td>${capacity}</td>
      <td><span class="${statusClass}">${statusActive}</span></td>
      <td>
        <button type="button" title="Ver Amenidad" class="btn btn-success btn-sm" onclick="showId(${amenityId})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Amenidad" class="btn btn-primary btn-sm" onclick="edit(${amenityId})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Amenidad" class="btn btn-danger btn-sm" onclick="delete_(${amenityId})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

function createSelectAmenityType(data) {
  objSelectAmenityType.innerHTML = "<option value='' selected disabled>Selecciona el tipo</option>";
  let getData = (data && data.data) || [];
  
  if (!Array.isArray(getData) || getData.length === 0) {
    console.log('No se encontraron tipos de amenidad para el select', data);
    return;
  }

  for (const row of getData) {
    // Backend retorna amenity_type_id y amenity_type_name
    const optionValue = row.amenity_type_id || row.Amenity_Type_id;
    const optionLabel = row.amenity_type_name || row.Amenity_Type_name || ('Tipo ' + (optionValue || ''));
    objSelectAmenityType.innerHTML += `<option value="${optionValue}">${optionLabel}</option>`;
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
  toggleLoading(true);
  getData();
}

function getDataAmenityType() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  // Usar el endpoint de tipos activos
  endpointUrl = URL_AMENITY_TYPE + 'active';
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
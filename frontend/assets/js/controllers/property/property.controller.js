document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Property controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen

});

const objForm = new Form('propertyForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar esta propiedad?";
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
    console.log("Insertando nueva propiedad");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_PROPERTY;
  } else {
    console.log("Actualizando propiedad");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_PROPERTY + keyId;
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
    endpointUrl = URL_PROPERTY + id;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta de eliminación:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Propiedad eliminada exitosamente');
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
  endpointUrl = URL_PROPERTY + id;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de la propiedad:', data);
    if (data.data) {
      let getData = data.data;
      objForm.setDataFormJson(getData);
    } else {
      alert('Error: No se encontraron datos de la propiedad');
    }
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos de la propiedad');
  }).finally(() => {
    showHiddenModal(true);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PROPERTY;

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    // Destruye la instancia previa de DataTable si existe
    if ($.fn.DataTable.isDataTable(appTable)) {
      $(appTable).DataTable().destroy();
    }
    const datos= data.data;
    console.log(datos)
    createTable(data);
    // Inicializa DataTable solo después de llenar la tabla
    new DataTable(appTable);
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al cargar los datos de propiedades');
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
    objTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay propiedades disponibles</td></tr>';
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
      // <td>${row.property_id || row.id}</td>
      <td>${row.property_name || row.name || 'N/A'}</td>
      <td>${row.property_type || row.type || 'N/A'}</td>
      <td>${row.property_description || row.description || 'N/A'}</td>
      <td><span class="${statusClass}">${statusActive}</span></td>
      <td>
        <button type="button" title="Ver Propiedad" class="btn btn-success btn-sm" onclick="showId(${row.property_id || row.id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Propiedad" class="btn btn-primary btn-sm" onclick="edit(${row.property_id || row.id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Propiedad" class="btn btn-danger btn-sm" onclick="delete_(${row.property_id || row.id})">
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

function fillStatusSelect() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_STATUS;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    const select = document.getElementById('status_id');
    select.innerHTML = '<option value="" selected disabled>Seleccione un estado</option>';
    let getData = data['data'] || [];
    // Filtrar solo los estados de la entidad Propiedad
    getData.filter(row => row.status_entity === 'Propiedad').forEach(row => {
      select.innerHTML += `<option value="${row.status_id}">${row.status_name}</option>`;
    });
  }).catch(error => {
    console.log('Error al cargar estados:', error);
  });
}

window.addEventListener('load', () => {
  loadView();
  fillStatusSelect();
}); 
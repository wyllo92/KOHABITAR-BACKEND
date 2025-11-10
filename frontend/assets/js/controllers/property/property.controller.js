document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Property controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

// =======================
// VARIABLES Y OBJETOS
// =======================
const objForm = new Form('propertyForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar esta propiedad?";
const appTable = "#app-table";

// Función helper para obtener el select de estado dinámicamente
function getStatusSelect() {
  return document.getElementById('status_id');
}

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";
let currentStatusId = null; // track status id when viewing/editing so select can be set after options load

// =======================
// EVENTO SUBMIT FORM
// =======================
myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }
  toggleLoading(true);

  if (insertUpdate) {
    console.log("Insertando nueva propiedad");
    httpMethod = METHODS[1]; // POST
    endpointUrl = URL_PROPERTY;
  } else {
    console.log("Actualizando propiedad");
    httpMethod = METHODS[2]; // PUT
    endpointUrl = URL_PROPERTY + keyId;
  }

  documentData = objForm.getDataForm();
  // ✅ aseguramos que el estado se envíe
  const statusSelect = getStatusSelect();
  if (statusSelect) {
    documentData.status_id = statusSelect.value;
  }

  console.log('Datos del formulario:', documentData);

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
    .then(data => {
      console.log('Respuesta del servidor:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Operación completada exitosamente');
      }
    })
    .catch(error => {
      console.log('Error en la operación:', error);
      alert('Error en la operación. Por favor, inténtalo de nuevo.');
    })
    .finally(() => {
      loadView();
      showHiddenModal(false);
    });
});

// =======================
// FUNCIONES DE CRUD
// =======================
function add() {
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
  currentStatusId = null; // Reset status ID for new property
  showHiddenModal(true);
  // Cargar estados después de que el modal se muestre
  setTimeout(() => {
    getDataStatus(); // 🔥 refrescar estados
  }, 300);
}

function showId(id) {
  objForm.resetForm();
  objForm.disabledForm();
  objForm.disabledButton();
  objForm.hiddenButton();
  // Ensure status options are loaded first so the current status can be shown
  currentStatusId = null;
  getDataStatus();
  getDataId(id);
}

function edit(id) {
  insertUpdate = false;
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
  keyId = id;
  // Load status options first so we can set the current value after
  currentStatusId = null;
  getDataStatus(); // 🔥 refrescar estados también en edición
  getDataId(id);
}

function delete_(id) {
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  if (confirm(textConfirm)) {
    documentData = "";
    httpMethod = METHODS[3]; // DELETE
    endpointUrl = URL_PROPERTY + id;

    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => response.json())
      .then(data => {
        console.log('Respuesta de eliminación:', data);
        if (data.error) {
          alert('Error: ' + data.error);
        } else {
          alert(data.message || 'Propiedad eliminada exitosamente');
        }
      })
      .catch(error => {
        console.log('Error al eliminar:', error);
        alert('Error al eliminar. Por favor, inténtalo de nuevo.');
      })
      .finally(() => {
        loadView();
      });
  } else {
    console.log("Operación cancelada");
  }
}

// =======================
// GET DATA POR ID
// =======================
function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_PROPERTY + id;

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
    .then(data => {
      console.log('Datos de la propiedad:', data);
      if (data.data) {
        let getData = data.data;
        objForm.setDataFormJson(getData);
        // ✅ setear estado actual (guardamos para que createSelectStatus lo aplique si aún no hay opciones)
        if (getData.status_id) {
          currentStatusId = getData.status_id;
          const statusSelect = getStatusSelect();
          if (statusSelect) {
            try { statusSelect.value = getData.status_id; } catch(e) {}
          }
        }
      } else {
        alert('Error: No se encontraron datos de la propiedad');
      }
    })
    .catch(error => {
      console.log('Error al obtener datos:', error);
      alert('Error al obtener los datos de la propiedad');
    })
    .finally(() => {
      showHiddenModal(true);
    });
}

// =======================
// GET LISTADO
// =======================
function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_PROPERTY;

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
    .then(data => {
      console.log('Datos recibidos del backend:', data);
      createTable(data);
    })
    .catch(error => {
      console.log('Error al obtener datos:', error);
      alert('Error al cargar los datos de propiedades');
    })
    .finally(() => {
      new DataTable(appTable);
      toggleLoading(false);
    });
}

// =======================
// CREAR TABLA
// =======================
function createTable(data) {
  objTableBody.innerHTML = ""; 
  let getData = data.data || [];
  console.log('Datos para crear tabla:', getData);

  if (getData.length === 0) {
    objTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay propiedades disponibles</td></tr>';
    return;
  }

  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];

    const statusActive = row.status_name || 'N/A';
    const statusClass = row.status_name === 'Activo' ? 'text-success' : 'text-danger';

    const createDate = row.property_createAt || row.createAt || 'N/A';
    const formattedDate = createDate !== 'N/A' ? new Date(createDate).toLocaleDateString('es-ES') : 'N/A';

    let dataRow = `<tr>
      <td>${row.property_id || row.id}</td>
      <td>${row.property_name || row.name || 'N/A'}</td>
      <td>${row.property_type || row.type || 'N/A'}</td>
      <td>${row.property_description || row.description || 'N/A'}</td>
      <td>${formattedDate}</td>
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

// =======================
// CREAR SELECT ESTADOS
// =======================
function createSelectStatus(data) {
  const objSelectStatus = getStatusSelect();
  if (!objSelectStatus) {
    console.error('Status select element not found');
    return;
  }
  
  objSelectStatus.innerHTML = "<option value='' selected disabled>Seleccione un estado</option>";

  if (!data || !data.data || !Array.isArray(data.data)) {
    console.warn('Invalid or empty status data:', data);
    objSelectStatus.innerHTML = "<option value='' selected disabled>No hay estados disponibles</option>";
    return;
  }

  if (data.data.length === 0) {
    console.warn('No status data available from server');
    objSelectStatus.innerHTML = "<option value='' selected disabled>No hay estados disponibles</option>";
    return;
  }

  data.data.forEach(row => {
    if (row && row.status_id && row.status_name) {
      let dataRow = `<option value="${row.status_id}">${row.status_name}</option>`;
      objSelectStatus.innerHTML += dataRow;
    }
  });

  // If we have a currentStatusId (from getDataId) set the select to that value
  if (currentStatusId) {
    try {
      objSelectStatus.value = currentStatusId;
    } catch (e) {
      console.log('No fue posible seleccionar el estado actual:', e);
    }
  }
}

// =======================
// UTILS
// =======================
function showHiddenModal(type) {
  if (type) objModal.show();
  else objModal.hide();
}

function loadView() {
  toggleLoading(true); // ✅ primero mostrar loading
  getData();
}

function getDataStatus() {
  const objSelectStatus = getStatusSelect();
  if (!objSelectStatus) {
    console.error('Status select element not found, retrying in 100ms...');
    setTimeout(() => getDataStatus(), 100);
    return;
  }

  documentData = "";
  httpMethod = METHODS[0]; // GET
  // Intentar primero con "property", si no hay resultados usar "General"
  endpointUrl = URL_STATUS + "entity/property";  // ✅ solo estados de propiedades

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
    // Si no hay resultados con "property", intentar con "General"
    if (data.data.length === 0) {
      console.warn('No status data for "property", trying "General"...');
      return getDataServices(documentData, httpMethod, URL_STATUS + "entity/General");
    }
    createSelectStatus(data);
  }).then(response => {
    // Este then solo se ejecuta si el anterior retornó una promesa (fallback a General)
    if (response) {
      return response.json();
    }
  }).then(data => {
    // Si llegamos aquí, es porque usamos el fallback a "General"
    if (data) {
      console.log('Status data received (General):', data);
      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid data format received from server');
      }
      if (data.data.length === 0) {
        console.warn('No status data available from server');
        const statusSelect = getStatusSelect();
        if (statusSelect) {
          statusSelect.innerHTML = "<option value='' selected disabled>No hay estados disponibles</option>";
        }
        return;
      }
      createSelectStatus(data);
    }
  }).catch(error => {
    console.error('Error fetching status:', error);
    console.error('Error details:', error.stack);
    const statusSelect = getStatusSelect();
    if (statusSelect) {
      statusSelect.innerHTML = "<option value='' selected disabled>Error al cargar estados: " + error.message + "</option>";
    }
  }).finally(() => {
    toggleLoading(false);
  });
}

// =======================
// INIT
// =======================
window.addEventListener('load', () => {
  loadView();
  getDataStatus();
});

// Listener para cuando el modal se muestra
const modalElement = document.getElementById('appModal');
if (modalElement) {
  modalElement.addEventListener('shown.bs.modal', function () {
    // Si estamos en modo agregar, cargar estados
    if (insertUpdate && !keyId) {
      getDataStatus();
    }
  });
}

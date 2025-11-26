document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Property controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});


// VARIABLES Y OBJETOS

const objForm = new Form('propertyForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectStatus = document.getElementById('status_id');
const objSelectPropertyType = document.getElementById('property_type');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar esta propiedad?";
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";
let currentStatusId = null;
let currentPropertyTypeId = null;


// EVENTO SUBMIT FORM

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
    endpointUrl = URL_PROPERTY + "/" + keyId;
  }

  documentData = objForm.getDataForm();
  //aseguramos que el estado se envíe
  documentData.status_id = objSelectStatus.value;
  //aseguramos que el tipo de propiedad se envíe como ID
  documentData.property_type_id = objSelectPropertyType.value;
  // Mapear campos del formulario a lo que espera el backend
  if (documentData.property_name) {
    documentData.name = documentData.property_name;
    delete documentData.property_name;
  }
  if (documentData.property_description) {
    documentData.description = documentData.property_description;
    delete documentData.property_description;
  }
  // Remover property_type si existe para evitar confusión
  delete documentData.property_type;

  console.log('Datos del formulario:', documentData);

  // El sistema obtiene el token de autenticacion del localStorage
  const token = getAuthToken();

  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
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


// FUNCIONES DE CRUD

function add() {
  showHiddenModal(true);
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
  getDataStatus();
  getPropertyTypes(); 
}

function showId(id) {
  objForm.resetForm();
  objForm.disabledForm();
  objForm.disabledButton();
  objForm.hiddenButton();
  // Ensure status options are loaded first so the current status can be shown
  currentStatusId = null;
  currentPropertyTypeId = null;
  getDataStatus();
  getPropertyTypes();
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
  currentPropertyTypeId = null;
  getDataStatus();
  getPropertyTypes();
  getDataId(id);
}

function delete_(id) {
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  if (confirm(textConfirm)) {
    console.log('Eliminando propiedad ID:', id);
    documentData = "";
    httpMethod = METHODS[3]; // DELETE
    endpointUrl = URL_PROPERTY + "/" + id;

    // El sistema obtiene el token de autenticacion del localStorage
    const token = getAuthToken();

    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
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


// GET DATA POR ID

function getDataId(id) {
  console.log('Obteniendo datos de propiedad ID:', id);
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_PROPERTY + "/" + id;

  // El sistema obtiene el token de autenticacion del localStorage
  const token = getAuthToken();

  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
    .then(data => {
      console.log('Datos de la propiedad recibidos:', data);
      if (data.data) {
        let getData = data.data;
        console.log('Mapeando datos al formulario:', getData);
        // Mapear campos del backend al formulario
        const formData = {
          property_name: getData.name,
          property_description: getData.description,
          property_type: getData.property_type_id,
          status_id: getData.status_id
        };
        objForm.setDataFormJson(formData);
        //setear estado actual (guardamos para que createSelectStatus lo aplique si aún no hay opciones)
        if (getData.status_id) {
          currentStatusId = getData.status_id;
          try { objSelectStatus.value = getData.status_id; } catch(e) {}
        }
        //setear tipo de propiedad actual
        if (getData.property_type_id) {
          currentPropertyTypeId = getData.property_type_id;
          try { objSelectPropertyType.value = getData.property_type_id; } catch(e) {}
        }
      } else {
        console.log('No se encontraron datos en la respuesta:', data);
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


// GET LISTADO

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_PROPERTY;

  // El sistema obtiene el token de autenticacion del localStorage
  const token = getAuthToken();

  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
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


// CREAR TABLA

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

    const createDate = row.created_at || row.property_createAt || row.createAt || 'N/A';
    const formattedDate = createDate !== 'N/A' ? new Date(createDate).toLocaleDateString('es-ES') : 'N/A';

    const propertyType = row.property_type_name || row.property_type || row.type || 'N/A';

    let dataRow = `<tr>
      <td>${row.property_id || row.id}</td>
      <td>${row.name || row.property_name || 'N/A'}</td>
      <td>${propertyType}</td>
      <td>${row.description || row.property_description || 'N/A'}</td>
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


// CREAR SELECT ESTADOS

function createSelectStatus(data) {
  console.log('Datos recibidos para estados:', data);
  objSelectStatus.innerHTML = "<option value='' selected disabled>Seleccione un estado</option>";

  let getData = data['data'];
  console.log('getData estados:', getData);
  if (!getData || getData.length === 0) {
    console.log('No hay datos de estados disponibles');
    return;
  }

  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    console.log('Procesando estado:', row);
    let dataRow = `<option value="${row.status_id}">${row.name}</option>`;
    objSelectStatus.innerHTML += dataRow;
  }

  // If we have a currentStatusId (from getDataId) set the select to that value
  if (currentStatusId) {
    try {
      objSelectStatus.value = currentStatusId;
    } catch (e) {
      console.log('No fue posible seleccionar el estado actual:', e);
    }
  }
}


// UTILS

function showHiddenModal(type) {
  if (type) objModal.show();
  else objModal.hide();
}

function loadView() {
  toggleLoading(true); //  primero mostrar loading
  getData();
}

function getDataStatus() {
  console.log('Obteniendo estados para: entity/property');
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_STATUS + "/entity/property"; 

  // El sistema obtiene el token de autenticacion del localStorage
  const token = getAuthToken();

  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
    .then(data => {
      console.log('Respuesta estados:', data);
      createSelectStatus(data);
    })
    .catch(error => {
      console.log('Error al obtener estados:', error);
    })
    .finally(() => {
      toggleLoading(false);
    });
}


// GET TIPOS DE PROPIEDAD

function getPropertyTypes() {
  console.log('Obteniendo tipos de propiedad...');
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_PROPERTY + "/types";

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
    .then(data => {
      console.log('Respuesta tipos de propiedad:', data);
      createSelectPropertyTypes(data);
    })
    .catch(error => {
      console.log('Error al obtener tipos de propiedad:', error);
    });
}

function createSelectPropertyTypes(data) {
  console.log('Datos recibidos para tipos de propiedad:', data);
  objSelectPropertyType.innerHTML = "<option value='' selected disabled>Selecciona el tipo</option>";

  let getData = data['data'];
  console.log('getData tipos de propiedad:', getData);
  if (!getData || getData.length === 0) {
    console.log('No hay datos de tipos de propiedad, usando fallback');
    // Fallback a opciones estáticas si no hay datos
    objSelectPropertyType.innerHTML += `
      <option value="1">Apartamento</option>
      <option value="2">Casa</option>
    `;
    return;
  }

  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    console.log('Procesando tipo de propiedad:', row);
    let dataRow = `<option value="${row.property_type_id}">${row.name}</option>`;
    objSelectPropertyType.innerHTML += dataRow;
  }

  // If we have a currentPropertyTypeId (from getDataId) set the select to that value
  if (currentPropertyTypeId) {
    try {
      objSelectPropertyType.value = currentPropertyTypeId;
    } catch (e) {
      console.log('No fue posible seleccionar el tipo de propiedad actual:', e);
    }
  }
}


// INIT

window.addEventListener('load', () => {
  loadView();
  getDataStatus();
  getPropertyTypes();
});

/**
 * El sistema exporta la lista de propiedades a formato PDF
 * Realiza una petición al endpoint de exportación configurado en el backend
 */
function exportPropertiesToPDF() {
  // El sistema muestra el indicador de carga mientras genera el PDF
  toggleLoading(true);

  // El sistema obtiene el token de autenticación
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema construye la URL del endpoint de exportación a PDF
  const exportUrl = URL_EXPORT_PROPERTIES;

  // El sistema realiza la petición al servidor para generar el PDF
  fetch(exportUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/pdf'
    }
  })
  .then(response => {
    // El sistema verifica que la respuesta sea exitosa
    if (!response.ok) {
      throw new Error('Error al generar el PDF');
    }
    // El sistema convierte la respuesta a blob para manejar el archivo
    return response.blob();
  })
  .then(blob => {
    // El sistema crea una URL temporal para el archivo PDF
    const url = window.URL.createObjectURL(blob);
    // El sistema crea un enlace temporal para descargar el archivo
    const a = document.createElement('a');
    a.href = url;
    // El sistema define el nombre del archivo con la fecha actual
    const fecha = new Date().toISOString().split('T')[0];
    a.download = `propiedades_${fecha}.pdf`;
    // El sistema activa la descarga del archivo
    document.body.appendChild(a);
    a.click();
    // El sistema limpia el enlace temporal y libera la URL
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('PDF descargado exitosamente');
  })
  .catch(error => {
    // El sistema maneja errores durante la exportación
    console.error('Error al exportar PDF:', error);
    alert('Error al exportar el PDF. Por favor, inténtalo de nuevo.');
  })
  .finally(() => {
    // El sistema oculta el indicador de carga
    toggleLoading(false);
  });
}

/**
 * El sistema exporta la lista de propiedades a formato Excel
 * Realiza una petición al endpoint de exportación configurado en el backend
 */
function exportPropertiesToExcel() {
  // El sistema muestra el indicador de carga mientras genera el Excel
  toggleLoading(true);

  // El sistema obtiene el token de autenticación
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema construye la URL del endpoint de exportación a Excel
  const exportUrl = URL_EXPORT_PROPERTIES_EXCEL;

  // El sistema realiza la petición al servidor para generar el Excel
  fetch(exportUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  })
  .then(response => {
    // El sistema verifica que la respuesta sea exitosa
    if (!response.ok) {
      throw new Error('Error al generar el Excel');
    }
    // El sistema convierte la respuesta a blob para manejar el archivo
    return response.blob();
  })
  .then(blob => {
    // El sistema crea una URL temporal para el archivo Excel
    const url = window.URL.createObjectURL(blob);
    // El sistema crea un enlace temporal para descargar el archivo
    const a = document.createElement('a');
    a.href = url;
    // El sistema define el nombre del archivo con la fecha actual
    const fecha = new Date().toISOString().split('T')[0];
    a.download = `propiedades_${fecha}.xlsx`;
    // El sistema activa la descarga del archivo
    document.body.appendChild(a);
    a.click();
    // El sistema limpia el enlace temporal y libera la URL
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('Excel descargado exitosamente');
  })
  .catch(error => {
    // El sistema maneja errores durante la exportación
    console.error('Error al exportar Excel:', error);
    alert('Error al exportar el Excel. Por favor, inténtalo de nuevo.');
  })
  .finally(() => {
    // El sistema oculta el indicador de carga
    toggleLoading(false);
  });
}

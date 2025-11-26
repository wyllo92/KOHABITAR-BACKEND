document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Report controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen

});

const objForm = new Form('reportForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');

// Referencias DOM para los elementos del formulario adaptados al modelo Report
const objSelectUser = document.getElementById('user_id');
const objSelectReportType = document.getElementById('report_type_id');
const objSelectStatus = document.getElementById('status_id');

const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar este reporte?";
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
    console.log("Insertando nuevo reporte");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_REPORT;
  } else {
    console.log("Actualizando reporte");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_REPORT + "/" + keyId;
  }
  
  // Obtener datos del formulario y adaptarlos al modelo Report del backend
  const formData = objForm.getDataForm();
  
  // Adapta los datos del formulario al modelo Report del backend
  documentData = {
    user_id: parseInt(formData.user_id), // Obligatorio: ID del usuario que crea el reporte
    title: formData.title, // Obligatorio: título del reporte
    description: formData.description, // Obligatorio: descripción del reporte
    report_type_id: parseInt(formData.report_type_id), // Obligatorio: tipo de reporte
    status_id: parseInt(formData.status_id) || 3, // Obligatorio: estado (3 = pendiente por defecto)
    file_url: formData.file_url || null, // Opcional: URL del archivo adjunto
    created_at: new Date().toISOString() // Se establece automáticamente la fecha actual
  };

  console.log('Datos del formulario adaptados al modelo Report:', documentData);

  // Obtiene el token de autenticación requerido por el backend
  const token = getAuthToken();

  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
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

/**
 * FUNCIÓN PARA AGREGAR UN NUEVO REPORTE
 *
 * Prepara el formulario para crear un nuevo reporte y carga dinámicamente
 * todos los catálogos necesarios según el modelo Report del backend.
 *
 * El frontend carga del backend 
 * - Usuarios (obligatorio)
 * - Tipos de reporte (obligatorio)
 * - Estados (obligatorio)
 */
function add() {
  showHiddenModal(true);
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
  
  // Carga dinámicamente todos los catálogos necesarios para el modelo Report
  console.log('Cargando catálogos para nuevo reporte...');
  getDataUsers();
  getDataReportTypes();
  getDataStatuses();
  
  // Establece valores por defecto
  const now = new Date();
  const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  
  console.log('Formulario de nuevo reporte preparado');
}

function showId(id) {
  objForm.resetForm();
  objForm.disabledForm();
  objForm.disabledButton();
  objForm.hiddenButton();
  getDataId(id);
}

/**
 * FUNCIÓN PARA EDITAR UN REPORTE EXISTENTE
 *
 * Prepara el formulario para editar un reporte existente y carga dinámicamente
 * todos los catálogos necesarios. El frontend carga del modelo Report
 * del backend obteniendo y mostrando todos los campos disponibles.
 *
 * @param {number} id - ID del reporte a editar según el modelo Report
 */
function edit(id) {
  insertUpdate = false;
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
  keyId = id;
  
  // Carga dinámicamente todos los catálogos antes de obtener los datos del reporte
  console.log('Preparando edición del reporte ID:', id);
  getDataUsers();
  getDataReportTypes();
  getDataStatuses();
  
  getDataId(id);
}

/**
 * FUNCIÓN PARA ELIMINAR UN REPORTE
 *
 * Elimina un reporte específico del backend usando autenticación JWT.
 * El frontend carga del backend que requiere token para operaciones de eliminación.
 *
 * @param {number} id - El ID del reporte a eliminar
 */
function delete_(id) {
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  if (confirm(textConfirm)) {
    documentData = "";
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = URL_REPORT + "/" + id;
    
    // Obtiene el token de autenticación requerido por el backend
    const token = getAuthToken();
    
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Reporte eliminado exitosamente:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Reporte eliminado exitosamente');
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

/**
 * FUNCIÓN PARA OBTENER UN REPORTE ESPECÍFICO POR ID
 *
 * Obtiene los datos de un reporte individual desde el backend para editar o visualizar.
 * El frontend carga del backend que requiere autenticación para acceder a los datos.
 *
 * @param {number} id - El ID del reporte a consultar
 */
function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_REPORT + "/" + id;

  // Obtiene el token de autenticación requerido por el backend
  const token = getAuthToken();

  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos del reporte obtenidos:', data);
    if (data.data) {
      let getData = data.data;
      
      // Adapta los datos del backend al formulario frontend
      const formData = {
        title: getData.title,
        description: getData.description,
        user_id: getData.user_id,
        report_type_id: getData.report_type_id,
        status_id: getData.status_id,
        file_url: getData.file_url || ''
      };
      
      objForm.setDataFormJson(formData);
    } else {
      alert('Error: No se encontraron datos del reporte');
    }
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos del reporte');
  }).finally(() => {
    showHiddenModal(true);
  });
}

/**
 * FUNCIÓN PARA OBTENER TODOS LOS REPORTES
 *
 * Obtiene la lista completa de reportes desde el backend usando autenticación JWT.
 * El frontend carga del backend que requiere token de autenticación.
 *
 * Flujo de conexión con backend:
 * 1. Obtiene el token JWT del almacenamiento local
 * 2. Llama a getServicesAuth() con el token
 * 3. El backend valida el token en authMiddleware
 * 4. ReportController.getAllReports() procesa la petición
 * 5. Se renderizan los datos en la tabla
 */
function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_REPORT;

  // Obtiene el token de autenticación del sistema AppStorage
  const token = getAuthToken();

  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de reportes recibidos del backend:', data);
    createTable(data);
    // Destruir DataTable si ya existe
    if ($.fn.DataTable.isDataTable(appTable)) {
      $(appTable).DataTable().destroy();
    }
    new DataTable(appTable);
  }).catch(error => {
    console.log('Error al obtener reportes:', error);
    alert('Error al cargar los datos de reportes');
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
    objTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay reportes disponibles</td></tr>';
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
    const reportDate = row.report_created_at || row.created_at || 'N/A';
    const formattedDate = reportDate !== 'N/A' ? new Date(reportDate).toLocaleDateString('es-ES') : 'N/A';
    
    let dataRow = `<tr>
      <td>${row.report_id || row.id}</td>
      <td>${row.report_title || row.title || 'N/A'}</td>
      <td>${row.report_type || row.type || 'N/A'}</td>
      <td>${row.user_name || 'N/A'}</td>
      <td>
        <span class="${statusClass}">${statusActive}</span>
      </td>
      <td>${formattedDate}</td>
      <td>
        <button type="button" title="Ver Reporte" class="btn btn-success btn-sm" onclick="showId(${row.report_id || row.id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Reporte" class="btn btn-primary btn-sm" onclick="edit(${row.report_id || row.id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Reporte" class="btn btn-danger btn-sm" onclick="delete_(${row.report_id || row.id})">
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

/**
 * FUNCIÓN PARA CARGAR LOS USUARIOS DISPONIBLES
 *
 * Obtiene dinámicamente los usuarios disponibles desde el backend.
 * El frontend carga del modelo Report que requiere user_id obligatorio.
 */
function getDataUsers() {
  const token = getAuthToken();
  const resultServices = getServicesAuth("", METHODS[0], URL_USER, token);
  resultServices.then(response => response.json()).then(data => {
    console.log('Usuarios cargados exitosamente para reportes:', data);
    if (data.data && data.data.length > 0 && objSelectUser) {
      objSelectUser.innerHTML = '<option value="" selected disabled>Selecciona el usuario</option>';
      data.data.forEach(user => {
        const userId = user.user_id || user.id;
        const displayName = user.full_name || user.username || `Usuario ${userId}`;
        objSelectUser.innerHTML += `<option value="${userId}">${displayName}</option>`;
      });
    }
  }).catch(error => {
    console.log('Error al cargar usuarios:', error);
    if (objSelectUser) {
      objSelectUser.innerHTML = '<option value="" disabled style="color: red;">Error al cargar usuarios</option>';
    }
  });
}

/**
 * FUNCIÓN PARA CARGAR LOS TIPOS DE REPORTE DISPONIBLES
 *
 * Obtiene dinámicamente los tipos de reporte disponibles desde el backend.
 * El frontend carga del modelo Report que requiere report_type_id obligatorio.
 */
function getDataReportTypes() {
  const token = getAuthToken();
  // Usar el endpoint correcto para tipos de reporte
  const resultServices = getServicesAuth("", METHODS[0], URL_REPORT_TYPE, token);
  resultServices.then(response => response.json()).then(data => {
    console.log('Tipos de reporte cargados exitosamente:', data);
    if (data.data && data.data.length > 0 && objSelectReportType) {
      objSelectReportType.innerHTML = '<option value="" selected disabled>Selecciona el tipo</option>';
      data.data.forEach(type => {
        const typeId = type.report_type_id || type.id;
        const typeName = type.name || type.report_type_name || `Tipo ${typeId}`;
        objSelectReportType.innerHTML += `<option value="${typeId}">${typeName}</option>`;
      });
    }
  }).catch(error => {
    console.log('Error al cargar tipos de reporte:', error);
    if (objSelectReportType) {
      objSelectReportType.innerHTML = '<option value="" disabled style="color: red;">Error al cargar tipos</option>';
    }
  });
}

/**
 * FUNCIÓN PARA CARGAR LOS ESTADOS DISPONIBLES
 *
 * Obtiene dinámicamente los estados disponibles desde el backend.
 * El frontend carga del modelo Report que requiere status_id obligatorio.
 */
function getDataStatuses() {
  const token = getAuthToken();
  const resultServices = getServicesAuth("", METHODS[0], URL_STATUS, token);
  resultServices.then(response => response.json()).then(data => {
    console.log('Estados cargados exitosamente para reportes:', data);
    if (data.data && data.data.length > 0 && objSelectStatus) {
      objSelectStatus.innerHTML = '<option value="" selected disabled>Selecciona el estado</option>';
      data.data.forEach(status => {
        const statusId = status.status_id || status.id;
        const statusName = status.name || status.status_name || `Estado ${statusId}`;
        objSelectStatus.innerHTML += `<option value="${statusId}">${statusName}</option>`;
      });
    }
  }).catch(error => {
    console.log('Error al cargar estados:', error);
    if (objSelectStatus) {
      objSelectStatus.innerHTML = '<option value="" disabled style="color: red;">Error al cargar estados</option>';
    }
  });
}

function loadView() {
  getData();
  toggleLoading(true);
}

window.addEventListener('load', () => {
  loadView();
}); 
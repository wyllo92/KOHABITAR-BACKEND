document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('ParkingZone controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen

});

const objForm = new Form('parkingzoneForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectStatus = document.getElementById('status_id');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar esta zona de parqueo?";
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

/**
 * Evento que maneja el envío del formulario de zonas de parqueo
 * El sistema procesa la creación o actualización de zonas según el modo actual
 */
myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }
  toggleLoading(true);
  
  // El sistema determina si es una operación de inserción o actualización
  if (insertUpdate) {
    console.log("Insertando nueva zona de parqueo");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_PARKINGZONE;
  } else {
    console.log("Actualizando zona de parqueo");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_PARKINGZONE + "/" + keyId; // Agregar barra diagonal
  }
  
  // El sistema obtiene los datos directamente del formulario sin transformaciones
  // Los nombres de los campos coinciden exactamente con el modelo del backend
  documentData = objForm.getDataForm();
  
  // El sistema convierte la capacidad a número y asegura que status_id sea numérico
  documentData.capacity = parseInt(documentData.capacity);
  documentData.status_id = parseInt(documentData.status_id);
  
  console.log('Datos del formulario para el backend:', documentData);

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

/**
 * Función para eliminar una zona de parqueo del sistema
 * El sistema solicita confirmación antes de proceder con la eliminación
 * @param {number} id - Identificador único de la zona de parqueo a eliminar
 */
function delete_(id) {
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  if (confirm(textConfirm)) {
    console.log('Eliminando zona de parqueo con ID:', id);
    documentData = "";
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = URL_PARKINGZONE + "/" + id; // Agregar barra diagonal
    
    const token = getAuthToken();
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta de eliminación:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Zona de parqueo eliminada exitosamente');
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
 * Función para obtener los datos de una zona de parqueo específica por su ID
 * El sistema mapea los campos del backend al formulario del frontend
 * @param {number} id - Identificador único de la zona de parqueo
 */
function getDataId(id) {
  console.log('Obteniendo datos de zona de parqueo con ID:', id);
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PARKINGZONE + "/" + id; // Agregar barra diagonal
  
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de la zona de parqueo recibidos:', data);
    if (data.data || data) {
      let getData = data.data || data;
      
      // El sistema mapea los datos del backend directamente al formulario
      // Los nombres de los campos coinciden entre backend y frontend
      const formData = {
        name: getData.name,
        type: getData.type,
        capacity: getData.capacity,
        status_id: getData.status_id
      };
      
      console.log('Datos mapeados al formulario:', formData);
      objForm.setDataFormJson(formData);
    } else {
      console.error('No se encontraron datos en la respuesta del backend');
      alert('Error: No se encontraron datos de la zona de parqueo');
    }
  }).catch(error => {
    console.error('Error al obtener datos de zona de parqueo:', error);
    alert('Error al obtener los datos de la zona de parqueo');
  }).finally(() => {
    showHiddenModal(true);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PARKINGZONE;

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
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
    alert('Error al cargar los datos de zonas de parqueo');
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * Función para crear la tabla HTML con los datos de zonas de parqueo
 * El sistema mapea los campos del backend a la estructura visual del frontend
 * @param {Object} data - Objeto con los datos recibidos del backend
 */
function createTable(data) {
  objTableBody.innerHTML = ""; // Limpiar datos previos de la tabla
  let getData = data.data || [];
  console.log('Datos para crear tabla de zonas:', getData.length + ' registros encontrados');
  
  if (getData.length === 0) {
    console.log('No hay zonas de parqueo disponibles para mostrar');
    objTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay zonas de parqueo disponibles</td></tr>';
    return;
  }
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Procesando zona de parqueo:', {
      id: row.parking_zone_id,
      nombre: row.name,
      tipo: row.type,
      capacidad: row.capacity,
      estado: row.status_name
    });
    
    // El sistema mapea los campos del backend a la visualización
    const zoneId = row.parking_zone_id || row.parkingzone_id || row.id;
    const name = row.name || 'Sin nombre';
    const type = row.type || 'Sin tipo';
    const capacity = row.capacity || 'Sin definir';
    const statusName = row.status_name || 'Sin estado';
    
    // El sistema determina el estilo del estado según su valor
    const statusClass = statusName === 'Activo' ? 'text-success' : 'text-danger';
    
    let dataRow = `<tr>
      <td>${zoneId}</td>
      <td>${name}</td>
      <td>${type}</td>
      <td>${capacity}</td>
      <td>
        <span class="${statusClass}">${statusName}</span>
      </td>
      <td>
        <button type="button" title="Ver Zona" class="btn btn-success btn-sm" onclick="showId(${zoneId})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Zona" class="btn btn-primary btn-sm" onclick="edit(${zoneId})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Zona" class="btn btn-danger btn-sm" onclick="delete_(${zoneId})">
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

/**
 * El sistema crea las opciones del select de estados.
 * Los datos provienen del endpoint GET /statuses/entity/parking_zone
 */
function createSelectStatus(data) {
  objSelectStatus.innerHTML = "<option value='' selected disabled>Selecciona el estado</option>";

  let getData = data.data || [];
  console.log('Creando opciones de estados para parking_zone:', getData.length + ' estados encontrados');
  
  if (getData.length === 0) {
    console.log('No hay estados disponibles para parking_zone');
    return;
  }

  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // El sistema mapea los campos del backend para las opciones del select
    const statusId = row.status_id || row.id;
    const statusName = row.name || row.status_name || ('Estado ' + statusId);
    
    let dataRow = `<option value="${statusId}">${statusName}</option>`;
    objSelectStatus.innerHTML += dataRow;
    
    console.log('Añadido estado:', { id: statusId, nombre: statusName });
  }
}

/**
 * Función para obtener los estados válidos para zonas de parqueo desde el backend
 * El sistema consulta los estados específicos para la entidad de zonas de parqueo
 */
function getDataStatus() {
  console.log('Obteniendo estados para parking_zone desde el backend');
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  // El sistema solicita estados específicos para la entidad parking_zone
  endpointUrl = URL_STATUS + "/entity/parking_zone";
  
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Estados de zonas de parqueo recibidos:', {
      cantidad: data.data ? data.data.length : 0,
      mensaje: data.message
    });
    createSelectStatus(data);
  }).catch(error => {
    console.error('Error al obtener estados de zonas de parqueo:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * El sistema exporta la lista de zonas de parqueo a formato PDF
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportParkingZonesToPDF() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a PDF
  const exportUrl = URL_EXPORT_PARKINGZONES;

  // El sistema realiza la petición HTTP al servidor con autenticación
  fetch(exportUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/pdf'
    }
  })
  .then(response => {
    // El sistema verifica si la respuesta del servidor fue exitosa
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    // El sistema convierte la respuesta a formato blob para descarga
    return response.blob();
  })
  .then(blob => {
    // El sistema crea una URL temporal para el archivo blob
    const url = window.URL.createObjectURL(blob);

    // El sistema crea un elemento anchor temporal para iniciar la descarga
    const a = document.createElement('a');
    a.href = url;

    // El sistema genera el nombre del archivo con la fecha actual
    const fecha = new Date().toISOString().split('T')[0];
    a.download = `zonas_parqueo_${fecha}.pdf`;

    // El sistema añade el elemento al DOM, simula el click y lo elimina
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // El sistema libera la URL temporal del objeto blob
    window.URL.revokeObjectURL(url);

    // El sistema notifica al usuario que la descarga fue exitosa
    alert('PDF descargado exitosamente');
  })
  .catch(error => {
    // El sistema maneja errores durante el proceso de exportación
    console.error('Error al exportar PDF:', error);
    alert('Error al exportar el PDF. Por favor, inténtalo de nuevo.');
  })
  .finally(() => {
    // El sistema oculta el indicador de carga al finalizar
    toggleLoading(false);
  });
}

/**
 * El sistema exporta la lista de zonas de parqueo a formato Excel
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportParkingZonesToExcel() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a Excel
  const exportUrl = URL_EXPORT_PARKINGZONES_EXCEL;

  // El sistema realiza la petición HTTP al servidor con autenticación
  fetch(exportUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  })
  .then(response => {
    // El sistema verifica si la respuesta del servidor fue exitosa
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    // El sistema convierte la respuesta a formato blob para descarga
    return response.blob();
  })
  .then(blob => {
    // El sistema crea una URL temporal para el archivo blob
    const url = window.URL.createObjectURL(blob);

    // El sistema crea un elemento anchor temporal para iniciar la descarga
    const a = document.createElement('a');
    a.href = url;

    // El sistema genera el nombre del archivo con la fecha actual
    const fecha = new Date().toISOString().split('T')[0];
    a.download = `zonas_parqueo_${fecha}.xlsx`;

    // El sistema añade el elemento al DOM, simula el click y lo elimina
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // El sistema libera la URL temporal del objeto blob
    window.URL.revokeObjectURL(url);

    // El sistema notifica al usuario que la descarga fue exitosa
    alert('Excel descargado exitosamente');
  })
  .catch(error => {
    // El sistema maneja errores durante el proceso de exportación
    console.error('Error al exportar Excel:', error);
    alert('Error al exportar el Excel. Por favor, inténtalo de nuevo.');
  })
  .finally(() => {
    // El sistema oculta el indicador de carga al finalizar
    toggleLoading(false);
  });
}

window.addEventListener('load', () => {
  loadView();
  getDataStatus();
}); 
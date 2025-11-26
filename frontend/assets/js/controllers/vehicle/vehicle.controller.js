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
const objSelectStatus = document.getElementById('status_id');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar este vehículo?";
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

/**
 * Evento que maneja el envío del formulario de vehículos
 * Se ejecuta cuando el usuario envía el formulario para crear o actualizar un vehículo
 */
myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }
  toggleLoading(true);
  
  // Determinar si es inserción o actualización
  if (insertUpdate) {
    console.log("Insertando nuevo vehículo");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_VEHICLE;
  } else {
    console.log("Actualizando vehículo");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_VEHICLE + "/" + keyId;
  }
  
  // Obtener datos del formulario
  documentData = objForm.getDataForm();
  console.log('Datos del formulario:', documentData);

  // Validación previa al envío para verificar campos requeridos
  const requiredFields = ['license_plate','model','type','color','user_id','property_id','status_id'];
  const missing = requiredFields.filter(f => {
    const v = documentData[f];
    return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
  });

  if (missing.length > 0) {
    toggleLoading(false);
    alert('Faltan campos obligatorios: ' + missing.join(', '));
    return;
  }

  // Obtener token de autenticación del almacenamiento local
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
 * Función para abrir el modal en modo de creación de nuevo vehículo
 * Configura el formulario para permitir la inserción de datos
 */
function add() {
  showHiddenModal(true); // Mostrar el modal primero
  insertUpdate = true;   // Configurar para inserción
  objForm.resetForm();   // Limpiar el formulario
  objForm.enabledForm(); // Habilitar todos los campos
  objForm.enabledButton(); // Habilitar botones
  objForm.showButton();  // Mostrar botones de acción
}

/**
 * Función para mostrar la información de un vehículo en modo de solo lectura
 * Deshabilita todos los campos y oculta los botones de acción
 * @param {number} id - Identificador único del vehículo a mostrar
 */
function showId(id) {
  objForm.resetForm();     // Limpiar el formulario
  objForm.disabledForm();  // Deshabilitar todos los campos
  objForm.disabledButton(); // Deshabilitar botones
  objForm.hiddenButton();  // Ocultar botones de acción
  getDataId(id);          // Obtener y cargar los datos
}

/**
 * Función para abrir el modal en modo de edición de vehículo existente
 * Configura el formulario para permitir la modificación de datos
 * @param {number} id - Identificador único del vehículo a editar
 */
function edit(id) {
  insertUpdate = false;      // Configurar para actualización
  objForm.resetForm();       // Limpiar el formulario
  objForm.enabledEditForm(); // Habilitar campos para edición
  objForm.enabledButton();   // Habilitar botones
  objForm.showButton();      // Mostrar botones de acción
  keyId = id;               // Guardar ID para la actualización
  getDataId(id);            // Obtener y cargar los datos
}

/**
 * Función para eliminar un vehículo del sistema
 * Solicita confirmación antes de proceder con la eliminación
 * @param {number} id - Identificador único del vehículo a eliminar
 */
function delete_(id) {
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  if (confirm(textConfirm)) {
    documentData = "";
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = URL_VEHICLE + "/" + id;
    
    // Obtener token de autenticación
    const token = getAuthToken();
    
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
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

/**
 * Función para obtener los datos de un vehículo específico por su ID
 * Se utiliza para mostrar o editar la información de un vehículo
 * @param {number} id - Identificador único del vehículo
 */
function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_VEHICLE + "/" + id;
  
  // Obtener token de autenticación
  const token = getAuthToken();
  
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos del vehículo:', data);
    if (data.data) {
      let getData = data.data;
      // Mapear campos del backend al formulario del frontend
      const formData = {
        license_plate: getData.license_plate,
        model: getData.model,
        type: getData.type,
        color: getData.color,
        vehicle_photo: getData.vehicle_photo || '',
        user_id: getData.user_id,
        property_id: getData.property_id,
        parkingZone_id: getData.parking_zone_id,
        status_id: getData.status_id
      };
      objForm.setDataFormJson(formData);
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

/**
 * Función principal para obtener la lista de vehículos desde el backend
 * Utiliza autenticación y maneja los errores de forma apropiada
 */
function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_VEHICLE;

  // Obtener token de autenticación del almacenamiento local
  const token = getAuthToken();

  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
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

/**
 * Función para crear la tabla de vehículos en el HTML
 * Mapea los campos del backend a la estructura de la tabla del frontend
 * @param {Object} data - Objeto con los datos de vehículos recibidos del backend
 */
function createTable(data) {
  objTableBody.innerHTML = ""; // Limpiar datos anteriores de la tabla
  let getData = data.data || [];
  console.log('Datos para crear tabla:', getData);
  
  if (getData.length === 0) {
    console.log('No hay datos para mostrar');
    objTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No hay vehículos disponibles</td></tr>';
    return;
  }
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Procesando fila de vehículo:', row);
    
    // Mapear campos del backend a la visualización del frontend
    const vehicleId = row.vehicle_id || row.id;
    const licensePlate = row.license_plate || 'N/A';
    const model = row.model || 'N/A';
    const type = row.type || 'N/A';
    const color = row.color || 'N/A';
    const userName = row.username || 'N/A';
    const propertyName = row.property_name || 'N/A';
    const statusName = row.status_name || 'N/A';
    
    // Determinar el estilo del estado según su valor
    const statusClass = statusName === 'Registrado' || statusName === 'Activo' ? 'text-success' : 'text-danger';
    
    let dataRow = `<tr>
      <td>${vehicleId}</td>
      <td>${licensePlate}</td>
      <td>${model}</td>
      <td>${type}</td>
      <td>${color}</td>
      <td>${userName}</td>
      <td>${propertyName}</td>
      <td>
        <span class="${statusClass}">${statusName}</span>
      </td>
      <td>
        <button type="button" title="Ver Vehículo" class="btn btn-success btn-sm" onclick="showId(${vehicleId})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Vehículo" class="btn btn-primary btn-sm" onclick="edit(${vehicleId})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Vehículo" class="btn btn-danger btn-sm" onclick="delete_(${vehicleId})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

/**
 * Función para poblar el select de usuarios con los datos obtenidos del backend
 * Mapea los campos del backend a las opciones del select
 * @param {Object} data - Datos de usuarios recibidos del backend
 */
function createSelectUser(data) {
  objSelectUser.innerHTML = "<option value='' selected disabled>Selecciona el propietario</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Mapear campos del backend: usar user_id y username
    const userId = row.user_id || row.id;
    const userName = row.username || row.user_name || `Usuario ${userId}`;
    let dataRow = `<option value="${userId}">${userName}</option>`;
    objSelectUser.innerHTML += dataRow;
  }
}

/**
 * Función para poblar el select de propiedades con los datos obtenidos del backend
 * Mapea los campos del backend a las opciones del select
 * @param {Object} data - Datos de propiedades recibidos del backend
 */
function createSelectProperty(data) {
  objSelectProperty.innerHTML = "<option value='' selected disabled>Selecciona la propiedad</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Mapear campos del backend: usar property_id y name
    const propertyId = row.property_id || row.id;
    const propertyName = row.name || row.property_name || `Propiedad ${propertyId}`;
    let dataRow = `<option value="${propertyId}">${propertyName}</option>`;
    objSelectProperty.innerHTML += dataRow;
  }
}

/**
 * Función para poblar el select de zonas de parqueo con los datos obtenidos del backend
 * Crea etiquetas descriptivas combinando información relevante
 * @param {Object} data - Datos de zonas de parqueo recibidos del backend
 */
function createSelectParkingZone(data) {
  objSelectParkingZone.innerHTML = "<option value='' selected disabled>Selecciona la zona de parqueo</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Mapear campos del backend y crear etiqueta descriptiva
    const parkingZoneId = row.parking_zone_id || row.parkingzone_id || row.id;
    const propertyName = row.property_name || '';
    const type = row.type || '';
    const capacity = row.capacity || '';
    
    // Construir etiqueta descriptiva con los datos disponibles
    let labelParts = [];
    if (propertyName) labelParts.push(propertyName);
    if (type) labelParts.push(`Tipo: ${type}`);
    if (capacity) labelParts.push(`Capacidad: ${capacity}`);
    const label = labelParts.length ? labelParts.join(' - ') : `Zona ${parkingZoneId}`;

    let dataRow = `<option value="${parkingZoneId}">${label}</option>`;
    objSelectParkingZone.innerHTML += dataRow;
  }
}

/**
 * Función para poblar el select de estados con los datos específicos para vehículos
 * Mapea los campos del backend a las opciones del select
 * @param {Object} data - Datos de estados recibidos del backend
 */
function createSelectStatus(data) {
  objSelectStatus.innerHTML = "<option value='' selected disabled>Selecciona el estado</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;

  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    // Mapear campos del backend: usar status_id y name
    let statusId = row.status_id || row.id;
    let statusName = row.name || row.status_name || `Estado ${statusId}`;
    let option = `<option value="${statusId}">${statusName}</option>`;
    objSelectStatus.innerHTML += option;
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
 * Función para cargar la lista de usuarios disponibles en el select del formulario
 * Obtiene los datos del backend usando autenticación
 */
function getDataUser() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_USER;
  
  // Obtener token de autenticación
  const token = getAuthToken();
  
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
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

/**
 * Función para cargar la lista de propiedades disponibles en el select del formulario
 * Obtiene los datos del backend usando autenticación
 */
function getDataProperty() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PROPERTY;
  
  // Obtener token de autenticación
  const token = getAuthToken();
  
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
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

/**
 * Función para cargar la lista de zonas de parqueo disponibles en el select del formulario
 * Obtiene los datos del backend usando autenticación
 */
function getDataParkingZone() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PARKINGZONE;
  
  // Obtener token de autenticación
  const token = getAuthToken();
  
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
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

/**
 * Función para cargar la lista de estados específicos para vehículos
 */
function getDataStatus() {
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_STATUS + "/entity/vehicle";
  
  // Obtener token de autenticación
  const token = getAuthToken();
  
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
    .then(data => {
      console.log('Datos de estados:', data);
      createSelectStatus(data);
    }).catch(error => {
      console.log('Error al obtener estados:', error);
    }).finally(() => {
      toggleLoading(false);
    });
}

window.addEventListener('load', () => {
  loadView();
  getDataUser();
  getDataProperty();
  getDataParkingZone();
  getDataStatus();
});

/**
 * El sistema exporta la lista de vehículos a formato PDF
 * Realiza una petición al endpoint de exportación configurado en el backend
 */
function exportVehiclesToPDF() {
  // El sistema muestra el indicador de carga mientras genera el PDF
  toggleLoading(true);

  // El sistema obtiene el token de autenticación
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema construye la URL del endpoint de exportación a PDF
  const exportUrl = URL_EXPORT_VEHICLES;

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
    a.download = `vehiculos_${fecha}.pdf`;
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
 * El sistema exporta la lista de vehículos a formato Excel
 * Realiza una petición al endpoint de exportación configurado en el backend
 */
function exportVehiclesToExcel() {
  // El sistema muestra el indicador de carga mientras genera el Excel
  toggleLoading(true);

  // El sistema obtiene el token de autenticación
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema construye la URL del endpoint de exportación a Excel
  const exportUrl = URL_EXPORT_VEHICLES_EXCEL;

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
    a.download = `vehiculos_${fecha}.xlsx`;
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

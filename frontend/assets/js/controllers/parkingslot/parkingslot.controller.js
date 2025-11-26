document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('ParkingSlot controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen

});

/**
 * Declaración de variables globales y elementos del DOM
 * Se obtienen las referencias a los elementos HTML necesarios para el funcionamiento del controlador
 */
const objForm = new Form('parkingslotForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
// El sistema obtiene referencias a los elementos HTML con nombres que coinciden con el backend
const objSelectParkingZone = document.getElementById('parking_zone_id');
const objSelectUser = document.getElementById('user_id'); // Nota: Este elemento no existe en el HTML actual
const objSelectTariff = document.getElementById('tariff_id'); // Agregar referencia al select de tarifas
const objSelectStatus = document.getElementById('status_id'); // Agregar referencia al select de estados
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar este espacio de parqueo?";
const appTable = "#app-table";

/**
 * Variables de control del estado de la aplicación
 */
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
    endpointUrl = URL_PARKINGSLOT + "/" + keyId;
  }
  // El sistema obtiene los datos del formulario directamente
  // Los nombres de los campos coinciden exactamente con el modelo del backend
  documentData = objForm.getDataForm();
  console.log('Datos del formulario:', documentData);
  
  // El sistema verifica que todos los campos requeridos por el backend esten presentes
  if (!documentData.tariff_id && !insertUpdate) {
    console.warn('Advertencia: tariff_id no esta presente en la actualizacion');
    documentData.tariff_id = null; // Asignar valor por defecto si no existe
  }

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Respuesta del servidor:', data);
    if (data.error) {
      console.error('Error del backend:', data.error);
      console.error('Mensaje completo del error:', data.message);
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
    endpointUrl = URL_PARKINGSLOT + "/" + id;
    const token = getAuthToken();
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
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

/**
 * Función para obtener los datos de un espacio de parqueo específico por su ID
 * Mapea los campos del backend al formulario del frontend correctamente
 * @param {number} id - Identificador único del espacio de parqueo
 */
function getDataId(id) {
  console.log('Obteniendo datos del espacio de parqueo con ID:', id);
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PARKINGSLOT + "/" + id;
  
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos del espacio de parqueo recibidos:', {
      exitoso: !!data.data,
      id: data.data ? data.data.parking_slot_id : 'No encontrado'
    });
    
    if (data.data) {
      let getData = data.data;
      
      // El sistema mapea campos del backend al formulario del frontend
      // Los nombres de los campos coinciden exactamente con el modelo del backend
      const formData = {
        code: getData.code,
        parking_zone_id: getData.parking_zone_id,
        is_reserved: getData.is_reserved ? 1 : 0, // Convertir boolean a numero
        status_id: getData.status_id,
        tariff_id: getData.tariff_id || null // Agregar tariff_id requerido por el backend
      };
      
      console.log('Mapeando datos al formulario:', formData);
      console.log('Campo tariff_id mapeado:', getData.tariff_id ? 'ID ' + getData.tariff_id : 'Sin tarifa asignada');
      objForm.setDataFormJson(formData);
    } else {
      console.error('No se encontraron datos del espacio de parqueo en la respuesta del backend');
      alert('Error: No se encontraron datos del espacio de parqueo');
    }
  }).catch(error => {
    console.error('Error al obtener datos del espacio de parqueo:', error);
    alert('Error al obtener los datos del espacio de parqueo');
  }).finally(() => {
    showHiddenModal(true);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PARKINGSLOT;

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
    alert('Error al cargar los datos de espacios de parqueo');
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * Función para crear la tabla HTML con los datos de espacios de parqueo
 * Mapea los campos del backend a la estructura visual del frontend
 * @param {Object} data - Objeto con los datos recibidos del backend
 */
function createTable(data) {
  objTableBody.innerHTML = ""; // Limpiar datos previos de la tabla
  let getData = data.data || [];
  console.log('Datos para crear tabla de espacios:', getData.length + ' registros encontrados');
  
  if (getData.length === 0) {
    console.log('No hay espacios de parqueo disponibles para mostrar');
    objTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay espacios de parqueo disponibles</td></tr>';
    return;
  }
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Procesando espacio de parqueo:', {
      id: row.parking_slot_id,
      codigo: row.code,
      zona: row.zone_type,
      estado: row.status_name,
      tarifa: row.tariff_name || 'Sin tarifa'
    });
    
    // Mapear campos del backend a la visualización del frontend
    const parkingSlotId = row.parking_slot_id || row.id;
    const code = row.code || 'Sin código';
    const zoneType = row.zone_type || 'Sin tipo';
    const propertyNames = row.property_names || 'Sin propiedad';
    const statusName = row.status_name || 'Sin estado';
    const isReserved = row.is_reserved;
    
    // Determinar el estilo del estado según su valor
    const statusClass = statusName === 'Activo' ? 'text-success' : 'text-danger';
    const reservedText = isReserved ? 'Reservado' : 'Disponible';
    const reservedClass = isReserved ? 'text-warning' : 'text-success';
    
    let dataRow = `<tr>
      <td>${parkingSlotId}</td>
      <td>${code}</td>
      <td>${zoneType}</td>
      <td>${propertyNames}</td>
      <td>
        <span class="${statusClass}">${statusName}</span>
      </td>
      <td>
        <span class="${reservedClass}">${reservedText}</span>
      </td>
      <td>
        <button type="button" title="Ver Espacio" class="btn btn-success btn-sm" onclick="showId(${parkingSlotId})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Espacio" class="btn btn-primary btn-sm" onclick="edit(${parkingSlotId})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Espacio" class="btn btn-danger btn-sm" onclick="delete_(${parkingSlotId})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

/**
 * Función para poblar el select de zonas de parqueo con los datos del backend
 * Verifica que el elemento HTML exista antes de intentar modificarlo
 * @param {Object} data - Datos de zonas de parqueo recibidos del backend
 */
function createSelectParkingZone(data) {
  // El sistema verifica que el elemento HTML existe antes de modificarlo
  if (!objSelectParkingZone) {
    console.error('Error: No se encontro el elemento select con ID "parking_zone_id" en el HTML');
    return;
  }
  
  objSelectParkingZone.innerHTML = "<option value='' selected disabled>Selecciona la zona</option>";

  let getData = data.data || [];
  console.log('Creando opciones de zonas de parqueo:', getData.length + ' zonas encontradas');
  
  if (getData.length === 0) {
    console.log('No hay zonas de parqueo disponibles');
    return;
  }
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Mapear campos del backend para las opciones del select
    const zoneId = row.parking_zone_id || row.parkingzone_id || row.id;
    const zoneName = row.name || row.parkingzone_name || ('Zona ' + zoneId);
    const zoneType = row.type || '';
    
    // Crear etiqueta descriptiva
    const displayText = zoneType ? `${zoneName} (${zoneType})` : zoneName;
    
    let dataRow = `<option value="${zoneId}">${displayText}</option>`;
    objSelectParkingZone.innerHTML += dataRow;
    
    console.log('Añadida zona:', { id: zoneId, nombre: displayText });
  }
}

/**
 * Función para poblar el select de usuarios con los datos del backend
 * Nota: Esta función se mantiene aunque el elemento no exista actualmente en el HTML
 * @param {Object} data - Datos de usuarios recibidos del backend
 */
function createSelectUser(data) {
  // El sistema verifica que el elemento HTML existe antes de modificarlo
  if (!objSelectUser) {
    console.log('Información: El campo de usuario no está disponible en el formulario actual');
    console.log('El formulario de espacios de parqueo no requiere selección de usuario');
    return;
  }

  objSelectUser.innerHTML = "<option value='' selected disabled>Selecciona el propietario</option>";

  let getData = data.data || [];
  console.log('Creando opciones de usuarios:', getData.length + ' usuarios encontrados');
  
  if (getData.length === 0) {
    console.log('No hay usuarios disponibles');
    return;
  }
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Mapear campos del backend para las opciones del select
    const userId = row.user_id || row.id;
    const userName = row.username || row.user_name || ('Usuario ' + userId);
    
    let dataRow = `<option value="${userId}">${userName}</option>`;
    objSelectUser.innerHTML += dataRow;
    
    console.log('Añadido usuario:', { id: userId, nombre: userName });
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
 * Función para obtener las zonas de parqueo disponibles desde el backend
 * Utiliza autenticación y manejo robusto de errores
 */
function getDataParkingZone() {
  console.log('Iniciando carga de zonas de parqueo desde el backend');
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PARKINGZONE;
  
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Zonas de parqueo recibidas exitosamente:', {
      cantidad: data.data ? data.data.length : 0,
      mensaje: data.message
    });
    createSelectParkingZone(data);
  }).catch(error => {
    console.error('Error al obtener zonas de parqueo desde el backend:', error);
    // Mostrar mensaje de error al usuario solo si es crítico
    if (!objSelectParkingZone) {
      alert('Error crítico: No se puede cargar el formulario de espacios de parqueo');
    }
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * Función para obtener los usuarios disponibles desde el backend
 * Nota: Actualmente no se utiliza en el formulario, pero se mantiene para compatibilidad
 */
function getDataUser() {
  // El sistema verifica si el elemento de usuario existe antes de intentar cargarlo
  if (!objSelectUser) {
    console.log('Información: La funcionalidad de usuarios no está habilitada en este formulario');
    return;
  }
  
  console.log('Iniciando carga de usuarios desde el backend');
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_USER;
  
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Usuarios recibidos exitosamente:', {
      cantidad: data.data ? data.data.length : 0,
      mensaje: data.message
    });
    createSelectUser(data);
  }).catch(error => {
    console.error('Error al obtener usuarios desde el backend:', error);
    // No mostrar alerta ya que este campo no es crítico actualmente
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * Función para poblar el select de tarifas con los datos del backend
 * Verifica que el elemento HTML exista antes de intentar modificarlo
 * @param {Object} data - Datos de tarifas recibidos del backend
 */
function createSelectTariff(data) {
  // Verificar que el elemento HTML existe antes de modificarlo
  if (!objSelectTariff) {
    console.error('Error: No se encontró el elemento select con ID "tariff_id" en el HTML');
    return;
  }
  
  objSelectTariff.innerHTML = "<option value=''>Sin tarifa específica</option>";

  let getData = data.data || [];
  console.log('Creando opciones de tarifas:', getData.length + ' tarifas encontradas');
  
  if (getData.length === 0) {
    console.log('No hay tarifas disponibles');
    return;
  }
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Mapear campos del backend para las opciones del select
    const tariffId = row.tariff_id || row.id;
    const tariffName = row.name || row.tariff_name || ('Tarifa ' + tariffId);
    const tariffAmount = row.amount || row.tariff_amount || 0;
    
    // Crear etiqueta descriptiva con el nombre y monto
    const displayText = `${tariffName} - $${tariffAmount}`;
    
    let dataRow = `<option value="${tariffId}">${displayText}</option>`;
    objSelectTariff.innerHTML += dataRow;
    
    console.log('Añadida tarifa:', { id: tariffId, nombre: tariffName, monto: tariffAmount });
  }
}

/**
 * Función para obtener las tarifas disponibles desde el backend
 * Utiliza autenticación y manejo robusto de errores
 */
function getDataTariff() {
  console.log('Iniciando carga de tarifas desde el backend');
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_TARIFF;
  
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Tarifas recibidas exitosamente:', {
      cantidad: data.data ? data.data.length : 0,
      mensaje: data.message
    });
    createSelectTariff(data);
  }).catch(error => {
    console.error('Error al obtener tarifas desde el backend:', error);
    // El sistema no muestra alerta ya que las tarifas son opcionales
    console.warn('Las tarifas no están disponibles, pero el formulario seguirá funcionando');
    // El sistema mantiene la opción por defecto si no puede cargar tarifas
    if (objSelectTariff) {
      objSelectTariff.innerHTML = '<option value="">Sin tarifa específica</option>';
    }
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * Función para poblar el select de estados con los datos específicos de parking_slot del backend
 * El sistema verifica que el elemento HTML exista antes de intentar modificarlo
 * @param {Object} data - Datos de estados recibidos del backend
 */
function createSelectStatus(data) {
  // El sistema verifica que el elemento HTML existe antes de modificarlo
  if (!objSelectStatus) {
    console.error('Error: No se encontró el elemento select con ID "status_id" en el HTML');
    return;
  }
  
  objSelectStatus.innerHTML = "<option value='' selected disabled>Selecciona el estado</option>";

  let getData = data.data || [];
  console.log('Creando opciones de estados para parking_slot:', getData.length + ' estados encontrados');
  
  if (getData.length === 0) {
    console.log('No hay estados disponibles para parking_slot');
    return;
  }
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // El sistema mapea campos del backend para las opciones del select
    const statusId = row.status_id || row.id;
    const statusName = row.name || row.status_name || ('Estado ' + statusId);
    const statusDescription = row.description || '';
    
    // El sistema crea etiqueta descriptiva
    const displayText = statusDescription ? `${statusName} - ${statusDescription}` : statusName;
    
    let dataRow = `<option value="${statusId}">${displayText}</option>`;
    objSelectStatus.innerHTML += dataRow;
    
    console.log('Añadido estado:', { id: statusId, nombre: statusName, descripcion: statusDescription });
  }
}

/**
 * Función para obtener los estados específicos de parking_slot desde el backend
 * El sistema utiliza autenticación y manejo robusto de errores
 */
function getDataStatus() {
  console.log('Iniciando carga de estados para parking_slot desde el backend');
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  // El sistema solicita únicamente estados para la entidad parking_slot
  endpointUrl = URL_STATUS + '/entity/parking_slot';
  
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Estados de parking_slot recibidos exitosamente:', {
      cantidad: data.data ? data.data.length : 0,
      mensaje: data.message
    });
    createSelectStatus(data);
  }).catch(error => {
    console.error('Error al obtener estados desde el backend:', error);
    // El sistema muestra un mensaje de error específico para estados
    console.warn('Los estados no están disponibles, usando valores por defecto');
    // El sistema crea opciones por defecto si no puede cargar desde el backend
    if (objSelectStatus) {
      objSelectStatus.innerHTML = `
        <option value='' selected disabled>Selecciona el estado</option>
        <option value='36'>Disponible</option>
        <option value='37'>Ocupado</option>
        <option value='38'>Reservado</option>
        <option value='39'>En Reparación</option>
        <option value='40'>Deshabilitado</option>
      `;
    }
  }).finally(() => {
    toggleLoading(false);
  });
}

/**

 * SECCIÓN: FUNCIONALIDADES DE ASIGNACIONES DE PARQUEO
 * El sistema integra la gestión de asignaciones directamente en este módulo

 */

// El sistema obtiene referencias a elementos del DOM para asignaciones
const objAssignmentForm = new Form('assignmentForm', 'edit-input');
const objAssignmentModal = new bootstrap.Modal(document.getElementById('assignmentModal'));
const objAssignmentTableBody = document.getElementById('assignments-table-body');
const assignmentsTable = "#assignments-table";

// Variables de control para asignaciones
let insertUpdateAssignment = true;
let keyIdAssignment;

/**
 * El sistema maneja el envío del formulario de asignaciones
 * Los datos se envían al endpoint del backend según la estructura esperada
 */
document.getElementById('assignmentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objAssignmentForm.validateForm()) {
    console.log("Error en validación del formulario de asignación");
    return;
  }
  toggleLoading(true);

  // El sistema configura el método y endpoint según el modo (insertar o actualizar)
  if (insertUpdateAssignment) {
    console.log("Insertando nueva asignación");
    httpMethod = METHODS[1]; // POST
    endpointUrl = URL_PARKINGASSIGNMENT;
  } else {
    console.log("Actualizando asignación");
    httpMethod = METHODS[2]; // PUT
    endpointUrl = URL_PARKINGASSIGNMENT + keyIdAssignment;
  }

  // El sistema obtiene datos del formulario y los formatea según el backend
  const formData = objAssignmentForm.getDataForm();
  documentData = {
    parking_slot_id: parseInt(formData.parking_slot_id),
    user_id: parseInt(formData.user_id),
    vehicle_id: formData.vehicle_id ? parseInt(formData.vehicle_id) : null,
    start_time: formData.start_time,
    end_time: formData.end_time,
    total_amount: parseFloat(formData.total_amount),
    status_id: parseInt(formData.status_id)
  };

  console.log('Datos de asignación a enviar:', documentData);

  // El sistema envía petición al backend
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Respuesta del servidor:', data);

    // El sistema maneja diferentes formatos de respuesta del backend
    if (data.error || data.errors) {
      const errorMsg = data.error || (data.errors ? data.errors.join(', ') : 'Error desconocido');
      alert('Error: ' + errorMsg);
    } else {
      // El backend puede devolver un objeto con message o solo el ID
      const successMsg = data.message || (insertUpdateAssignment ? 'Asignación creada exitosamente' : 'Asignación actualizada exitosamente');
      alert(successMsg);
    }
  }).catch(error => {
    console.log('Error en la operación:', error);
    alert('Error en la operación. Por favor, inténtalo de nuevo.');
  }).finally(() => {
    loadAssignmentsView();
    showHiddenAssignmentModal(false);
  });
});

/**
 * El sistema abre el modal para crear una nueva asignación
 */
function addAssignment() {
  showHiddenAssignmentModal(true);
  insertUpdateAssignment = true;
  objAssignmentForm.resetForm();
  objAssignmentForm.enabledForm();
  objAssignmentForm.enabledButton();
  objAssignmentForm.showButton();

  // El sistema carga datos para los selects del formulario
  loadAssignmentFormData();
}

/**
 * El sistema muestra los detalles de una asignación en modo solo lectura
 * @param {number} id - ID de la asignación
 */
function showAssignment(id) {
  objAssignmentForm.resetForm();
  objAssignmentForm.disabledForm();
  objAssignmentForm.disabledButton();
  objAssignmentForm.hiddenButton();
  getAssignmentDataId(id);
}

/**
 * El sistema abre el modal para editar una asignación
 * @param {number} id - ID de la asignación
 */
function editAssignment(id) {
  insertUpdateAssignment = false;
  objAssignmentForm.resetForm();
  objAssignmentForm.enabledEditForm();
  objAssignmentForm.enabledButton();
  objAssignmentForm.showButton();
  keyIdAssignment = id;
  getAssignmentDataId(id);
}

/**
 * El sistema finaliza una asignación (cambia su estado)
 * @param {number} id - ID de la asignación
 */
function endAssignment(id) {
  if (confirm("¿Estás seguro de que deseas finalizar esta asignación?")) {
    documentData = "";
    httpMethod = METHODS[3]; // DELETE
    endpointUrl = URL_PARKINGASSIGNMENT + id;
    const token = getAuthToken();
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta:', data);
      alert(data.message || 'Asignación finalizada exitosamente');
    }).catch(error => {
      console.log('Error:', error);
      alert('Error al finalizar la asignación');
    }).finally(() => {
      loadAssignmentsView();
    });
  }
}

/**
 * El sistema obtiene los datos de una asignación específica
 * @param {number} id - ID de la asignación
 */
function getAssignmentDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_PARKINGASSIGNMENT + id;

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de asignación recibidos:', data);

    // El backend puede devolver el objeto directamente o dentro de data
    let getData = data.data || data;

    // El sistema transforma fechas al formato datetime-local
    const formData = {
      parking_slot_id: getData.parking_slot_id,
      user_id: getData.user_id,
      vehicle_id: getData.vehicle_id || '',
      start_time: getData.start_time ? new Date(getData.start_time).toISOString().slice(0, 16) : '',
      end_time: getData.end_time ? new Date(getData.end_time).toISOString().slice(0, 16) : '',
      total_amount: getData.total_amount || '',
      status_id: getData.status_id
    };

    objAssignmentForm.setDataFormJson(formData);
  }).catch(error => {
    console.error('Error al obtener asignación:', error);
    alert('Error al obtener los datos de la asignación');
  }).finally(() => {
    showHiddenAssignmentModal(true);
  });
}

/**
 * El sistema obtiene todas las asignaciones del backend
 */
function getAssignmentsData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_PARKINGASSIGNMENT;

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Asignaciones recibidas:', data);
    createAssignmentsTable(data);
    // El sistema destruye DataTable si ya existe
    if ($.fn.DataTable.isDataTable(assignmentsTable)) {
      $(assignmentsTable).DataTable().destroy();
    }
    new DataTable(assignmentsTable);
  }).catch(error => {
    console.log('Error al obtener asignaciones:', error);
    alert('Error al cargar las asignaciones');
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * El sistema crea la tabla de asignaciones con los datos del backend
 * @param {Object} data - Datos recibidos del backend
 */
function createAssignmentsTable(data) {
  objAssignmentTableBody.innerHTML = "";

  let getData = Array.isArray(data) ? data : (data.data || []);
  console.log('Creando tabla de asignaciones:', getData.length + ' registros');

  if (getData.length === 0) {
    objAssignmentTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No hay asignaciones disponibles</td></tr>';
    return;
  }

  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];

    // El sistema formatea las fechas
    const startDate = row.start_time ? new Date(row.start_time).toLocaleString('es-ES') : 'N/A';
    const endDate = row.end_time ? new Date(row.end_time).toLocaleString('es-ES') : 'N/A';

    // El sistema determina el estilo del estado
    const isActive = row.status_name !== 'Finalizado' && row.status_name !== 'Cancelado';
    const statusClass = isActive ? 'text-success' : 'text-secondary';

    // El sistema mapea los campos del backend a la tabla
    const assignmentId = row.assignment_id || row.parking_assignment_id;

    let dataRow = `<tr>
      <td>${assignmentId}</td>
      <td>${row.slot_code || row.code || 'N/A'}</td>
      <td>${row.username || row.user_name || 'N/A'}</td>
      <td>${row.license_plate || row.vehicle_plate || 'Sin vehículo'}</td>
      <td>${startDate}</td>
      <td>${endDate}</td>
      <td>$${row.total_amount || '0.00'}</td>
      <td>
        <span class="${statusClass}">${row.status_name || 'N/A'}</span>
      </td>
      <td>
        <button type="button" title="Ver Asignación" class="btn btn-success btn-sm" onclick="showAssignment(${assignmentId})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Asignación" class="btn btn-primary btn-sm" onclick="editAssignment(${assignmentId})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Finalizar Asignación" class="btn btn-danger btn-sm" onclick="endAssignment(${assignmentId})">
          <i class='fas fa-stop'></i>
        </button>
      </td>
    </tr>`;
    objAssignmentTableBody.innerHTML += dataRow;
  }
}

/**
 * El sistema carga los datos necesarios para los selects del formulario de asignaciones
 */
function loadAssignmentFormData() {
  // El sistema carga espacios de parqueo disponibles
  loadAssignmentParkingSlots();
  // El sistema carga usuarios
  loadAssignmentUsers();
  // El sistema carga vehículos
  loadAssignmentVehicles();
  // El sistema carga estados específicos para asignaciones
  loadAssignmentStatuses();
}

/**
 * El sistema carga los espacios de parqueo en el select de asignaciones
 */
function loadAssignmentParkingSlots() {
  const selectElement = document.getElementById('assignment_parking_slot_id');
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_PARKINGSLOT;

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
    .then(data => {
      selectElement.innerHTML = "<option value='' selected disabled>Selecciona el espacio</option>";
      let getData = data.data || [];
      getData.forEach(slot => {
        const slotId = slot.parking_slot_id || slot.id;
        const slotCode = slot.code || ('Espacio ' + slotId);
        selectElement.innerHTML += `<option value="${slotId}">${slotCode}</option>`;
      });
    })
    .catch(error => console.error('Error al cargar espacios:', error));
}

/**
 * El sistema carga los usuarios en el select de asignaciones
 */
function loadAssignmentUsers() {
  const selectElement = document.getElementById('assignment_user_id');
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_USER;

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
    .then(data => {
      selectElement.innerHTML = "<option value='' selected disabled>Selecciona el usuario</option>";
      let getData = data.data || [];
      getData.forEach(user => {
        const userId = user.user_id || user.id;
        const userName = user.username || user.user_name || ('Usuario ' + userId);
        selectElement.innerHTML += `<option value="${userId}">${userName}</option>`;
      });
    })
    .catch(error => console.error('Error al cargar usuarios:', error));
}

/**
 * El sistema carga los vehículos en el select de asignaciones
 */
function loadAssignmentVehicles() {
  const selectElement = document.getElementById('assignment_vehicle_id');
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_VEHICLE;

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
    .then(data => {
      selectElement.innerHTML = "<option value=''>Sin vehículo</option>";
      let getData = data.data || [];
      getData.forEach(vehicle => {
        const vehicleId = vehicle.vehicle_id || vehicle.id;
        const vehiclePlate = vehicle.license_plate || vehicle.plate || ('Vehículo ' + vehicleId);
        selectElement.innerHTML += `<option value="${vehicleId}">${vehiclePlate}</option>`;
      });
    })
    .catch(error => console.error('Error al cargar vehículos:', error));
}

/**
 * El sistema carga los estados para asignaciones en el select
 */
function loadAssignmentStatuses() {
  const selectElement = document.getElementById('assignment_status_id');

  // El sistema verifica que el elemento existe antes de intentar cargarlo
  if (!selectElement) {
    console.error('Error: No se encontró el elemento select con ID "assignment_status_id"');
    return;
  }

  console.log('Cargando estados para asignaciones desde:', URL_STATUS + '/entity/parking_assignment');

  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_STATUS + '/entity/parking_assignment';

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    console.log('Respuesta de estados recibida, status:', response.status);
    return response.json();
  })
    .then(data => {
      console.log('Datos de estados recibidos:', data);

      selectElement.innerHTML = "<option value='' selected disabled>Selecciona el estado</option>";
      let getData = data.data || [];

      if (getData.length === 0) {
        console.warn('No se encontraron estados para parking_assignment');
        // El sistema agrega estados por defecto si no hay datos del backend
        selectElement.innerHTML += `
          <option value='1'>Activo</option>
          <option value='2'>Finalizado</option>
          <option value='3'>Cancelado</option>
        `;
      } else {
        getData.forEach(status => {
          const statusId = status.status_id || status.id;
          const statusName = status.name || status.status_name || ('Estado ' + statusId);
          selectElement.innerHTML += `<option value="${statusId}">${statusName}</option>`;
          console.log('Estado agregado:', statusName, 'con ID:', statusId);
        });
      }
    })
    .catch(error => {
      console.error('Error al cargar estados de asignaciones:', error);
      // El sistema agrega estados por defecto en caso de error
      if (selectElement) {
        selectElement.innerHTML = `
          <option value='' selected disabled>Selecciona el estado</option>
          <option value='1'>Activo</option>
          <option value='2'>Finalizado</option>
          <option value='3'>Cancelado</option>
        `;
      }
    });
}

/**
 * El sistema muestra u oculta el modal de asignaciones
 * @param {boolean} type - true para mostrar, false para ocultar
 */
function showHiddenAssignmentModal(type) {
  if (type) {
    objAssignmentModal.show();
  } else {
    objAssignmentModal.hide();
  }
}

/**
 * El sistema recarga la vista de asignaciones
 */
function loadAssignmentsView() {
  getAssignmentsData();
  toggleLoading(true);
}

/**

 * SECCIÓN: FUNCIONALIDADES DE SORTEOS DE PARQUEO
 * El sistema integra la gestión de sorteos directamente en este módulo

 */

// El sistema obtiene referencias a elementos del DOM para sorteos
const objLotteryForm = new Form('lotteryForm', 'edit-input');
const objLotteryModal = new bootstrap.Modal(document.getElementById('lotteryModal'));
const objLotteryTableBody = document.getElementById('lotteries-table-body');
const lotteriesTable = "#lotteries-table";

// Variables de control para sorteos
let insertUpdateLottery = true;
let keyIdLottery;

/**
 * El sistema maneja el envío del formulario de sorteos
 */
document.getElementById('lotteryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objLotteryForm.validateForm()) {
    console.log("Error en validación del formulario de sorteo");
    return;
  }
  toggleLoading(true);

  // El sistema configura método y endpoint
  if (insertUpdateLottery) {
    console.log("Creando nuevo sorteo");
    httpMethod = METHODS[1]; // POST
    endpointUrl = URL_PARKINGLOTTERY;
  } else {
    console.log("Actualizando sorteo");
    httpMethod = METHODS[2]; // PUT
    endpointUrl = URL_PARKINGLOTTERY + keyIdLottery;
  }

  // El sistema obtiene y formatea datos del formulario
  const formData = objLotteryForm.getDataForm();
  documentData = {
    start_date: formData.start_date,
    end_date: formData.end_date,
    parking_zone_id: parseInt(formData.parking_zone_id),
    status_id: parseInt(formData.status_id)
  };

  console.log('Datos de sorteo a enviar:', documentData);

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Respuesta del servidor:', data);
    if (data.error) {
      alert('Error: ' + data.error);
    } else {
      alert(data.message || 'Sorteo guardado exitosamente');
    }
  }).catch(error => {
    console.log('Error en la operación:', error);
    alert('Error en la operación. Por favor, inténtalo de nuevo.');
  }).finally(() => {
    loadLotteriesView();
    showHiddenLotteryModal(false);
  });
});

/**
 * El sistema abre el modal para crear un nuevo sorteo
 */
function addLottery() {
  showHiddenLotteryModal(true);
  insertUpdateLottery = true;
  objLotteryForm.resetForm();
  objLotteryForm.enabledForm();
  objLotteryForm.enabledButton();
  objLotteryForm.showButton();

  // El sistema carga datos para los selects
  loadLotteryFormData();
}

/**
 * El sistema ejecuta un sorteo
 * @param {number} id - ID del sorteo
 */
function executeLottery(id) {
  if (confirm("¿Estás seguro de que deseas ejecutar este sorteo? Esta acción no se puede deshacer.")) {
    documentData = "";
    httpMethod = METHODS[1]; // POST
    endpointUrl = URL_PARKINGLOTTERY + id + '/execute';

    const token = getAuthToken();
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta:', data);
      if (data.success) {
        alert(data.message || 'Sorteo ejecutado exitosamente');
        // El sistema muestra los resultados
        viewLotteryResults(id);
      } else {
        alert('Error: ' + (data.error || data.message));
      }
    }).catch(error => {
      console.log('Error:', error);
      alert('Error al ejecutar el sorteo');
    }).finally(() => {
      loadLotteriesView();
    });
  }
}

/**
 * El sistema muestra los resultados de un sorteo
 * @param {number} id - ID del sorteo
 */
function viewLotteryResults(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_PARKINGLOTTERY + id + '/results';

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Resultados del sorteo:', data);
    if (data.success && data.data) {
      // El sistema muestra resultados en un formato legible
      let resultsMessage = 'Resultados del Sorteo:\n\n';
      resultsMessage += 'Ganadores:\n';
      data.data.forEach((result, index) => {
        resultsMessage += `${index + 1}. ${result.username || 'Usuario'} - Espacio: ${result.slot_code || 'N/A'}\n`;
      });
      alert(resultsMessage);
    }
  }).catch(error => {
    console.error('Error al obtener resultados:', error);
  });
}

/**
 * El sistema obtiene todos los sorteos del backend
 */
function getLotteriesData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_PARKINGLOTTERY;

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Sorteos recibidos:', data);
    createLotteriesTable(data);
    // El sistema destruye DataTable si ya existe
    if ($.fn.DataTable.isDataTable(lotteriesTable)) {
      $(lotteriesTable).DataTable().destroy();
    }
    new DataTable(lotteriesTable);
  }).catch(error => {
    console.log('Error al obtener sorteos:', error);
    alert('Error al cargar los sorteos');
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * El sistema crea la tabla de sorteos con los datos del backend
 * @param {Object} data - Datos recibidos del backend
 */
function createLotteriesTable(data) {
  objLotteryTableBody.innerHTML = "";

  let getData = Array.isArray(data) ? data : (data.data || []);
  console.log('Creando tabla de sorteos:', getData.length + ' registros');

  if (getData.length === 0) {
    objLotteryTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay sorteos disponibles</td></tr>';
    return;
  }

  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];

    // El sistema formatea fechas
    const startDate = row.start_date ? new Date(row.start_date).toLocaleString('es-ES') : 'N/A';
    const endDate = row.end_date ? new Date(row.end_date).toLocaleString('es-ES') : 'N/A';

    // El sistema mapea campos del backend
    const lotteryId = row.lottery_id || row.parking_lottery_id;
    const participantsCount = row.participants_count || 0;

    let dataRow = `<tr>
      <td>${lotteryId}</td>
      <td>${startDate}</td>
      <td>${endDate}</td>
      <td>${row.zone_type || row.parking_zone_name || 'N/A'}</td>
      <td>${row.status_name || 'N/A'}</td>
      <td>${participantsCount}</td>
      <td>
        <button type="button" title="Ejecutar Sorteo" class="btn btn-warning btn-sm" onclick="executeLottery(${lotteryId})">
          <i class='fas fa-play'></i>
        </button>
        <button type="button" title="Ver Resultados" class="btn btn-info btn-sm" onclick="viewLotteryResults(${lotteryId})">
          <i class='fas fa-trophy'></i>
        </button>
      </td>
    </tr>`;
    objLotteryTableBody.innerHTML += dataRow;
  }
}

/**
 * El sistema carga los datos necesarios para el formulario de sorteos
 */
function loadLotteryFormData() {
  loadLotteryParkingZones();
  loadLotteryStatuses();
}

/**
 * El sistema carga las zonas de parqueo en el select de sorteos
 */
function loadLotteryParkingZones() {
  const selectElement = document.getElementById('lottery_parking_zone_id');
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_PARKINGZONE;

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
    .then(data => {
      selectElement.innerHTML = "<option value='' selected disabled>Selecciona la zona</option>";
      let getData = data.data || [];
      getData.forEach(zone => {
        const zoneId = zone.parking_zone_id || zone.id;
        const zoneName = zone.name || zone.type || ('Zona ' + zoneId);
        selectElement.innerHTML += `<option value="${zoneId}">${zoneName}</option>`;
      });
    })
    .catch(error => console.error('Error al cargar zonas:', error));
}

/**
 * El sistema carga los estados para sorteos en el select
 */
function loadLotteryStatuses() {
  const selectElement = document.getElementById('lottery_status_id');
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_STATUS + '/entity/parking_lottery';

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
    .then(data => {
      selectElement.innerHTML = "<option value='' selected disabled>Selecciona el estado</option>";
      let getData = data.data || [];
      getData.forEach(status => {
        const statusId = status.status_id || status.id;
        const statusName = status.name || status.status_name || ('Estado ' + statusId);
        selectElement.innerHTML += `<option value="${statusId}">${statusName}</option>`;
      });
    })
    .catch(error => console.error('Error al cargar estados:', error));
}

/**
 * El sistema muestra u oculta el modal de sorteos
 * @param {boolean} type - true para mostrar, false para ocultar
 */
function showHiddenLotteryModal(type) {
  if (type) {
    objLotteryModal.show();
  } else {
    objLotteryModal.hide();
  }
}

/**
 * El sistema recarga la vista de sorteos
 */
function loadLotteriesView() {
  getLotteriesData();
  toggleLoading(true);
}

// Renombrar la función add() original para espacios de parqueo
function addSlot() {
  showHiddenModal(true);
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
}

/**
 * El sistema inicializa todas las funcionalidades cuando se cambia de tab
 */
document.addEventListener('DOMContentLoaded', function() {
  // El sistema carga datos cuando se activa el tab de asignaciones
  document.getElementById('assignments-tab').addEventListener('shown.bs.tab', function() {
    loadAssignmentsView();
  });

  // El sistema carga datos cuando se activa el tab de sorteos
  document.getElementById('lotteries-tab').addEventListener('shown.bs.tab', function() {
    loadLotteriesView();
  });
});

/**
 * El sistema exporta la lista de espacios de parqueo a formato PDF
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportParkingSlotsToPDF() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a PDF
  const exportUrl = URL_EXPORT_PARKING;

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
    a.download = `espacios_parqueo_${fecha}.pdf`;

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
 * El sistema exporta la lista de espacios de parqueo a formato Excel
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportParkingSlotsToExcel() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a Excel
  const exportUrl = URL_EXPORT_PARKING_EXCEL;

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
    a.download = `espacios_parqueo_${fecha}.xlsx`;

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

/**
 * El sistema exporta la lista de asignaciones de parqueo a formato PDF
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportAssignmentsToPDF() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a PDF
  const exportUrl = URL_EXPORT_ASSIGNMENTS;

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
    a.download = `asignaciones_parqueo_${fecha}.pdf`;

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
 * El sistema exporta la lista de asignaciones de parqueo a formato Excel
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportAssignmentsToExcel() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a Excel
  const exportUrl = URL_EXPORT_ASSIGNMENTS_EXCEL;

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
    a.download = `asignaciones_parqueo_${fecha}.xlsx`;

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

/**
 * El sistema exporta la lista de sorteos de parqueo a formato PDF
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportLotteriesToPDF() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a PDF
  const exportUrl = URL_EXPORT_LOTTERIES;

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
    a.download = `sorteos_parqueo_${fecha}.pdf`;

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
 * El sistema exporta la lista de sorteos de parqueo a formato Excel
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportLotteriesToExcel() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a Excel
  const exportUrl = URL_EXPORT_LOTTERIES_EXCEL;

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
    a.download = `sorteos_parqueo_${fecha}.xlsx`;

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
  getDataParkingZone();
  getDataUser();
  getDataTariff();
  getDataStatus();
}); 
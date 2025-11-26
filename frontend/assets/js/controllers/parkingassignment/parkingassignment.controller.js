/**
 * El sistema inicializa el controlador cuando el DOM está completamente cargado.
 * El sistema verifica la autenticación del usuario y aplica efectos visuales de carga.
 */
document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('ParkingAssignment controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

/**
 * Instancia del formulario de asignaciones de parqueo utilizando la clase Form.
 * El sistema maneja la validación y serialización de datos del formulario.
 */
const objForm = new Form('parkingassignmentForm', 'edit-input');

/**
 * Instancia del modal de Bootstrap para mostrar/ocultar el formulario.
 */
const objModal = new bootstrap.Modal(document.getElementById('appModal'));

/**
 * Referencia al cuerpo de la tabla donde se renderizan las asignaciones.
 */
const objTableBody = document.getElementById('app-table-body');

/**
 * Referencias a los elementos select del formulario.
 */
const objSelectParkingSlot = document.getElementById('parking_slot_id');
const objSelectUser = document.getElementById('user_id');
const objSelectVehicle = document.getElementById('vehicle_id');
const objSelectStatus = document.getElementById('status_id');

/**
 * Referencia al formulario HTML.
 */
const myForm = objForm.getForm();

/**
 * Mensaje de confirmación para eliminación de asignaciones.
 */
const textConfirm = "¿Estás seguro de que deseas finalizar esta asignación?";

/**
 * Selector de la tabla principal.
 */
const appTable = "#app-table";

/**
 * Variables de control para el estado del formulario y endpoints.
 */
let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

/**
 * El sistema maneja el evento de envío del formulario.
 * El sistema valida los datos y envía la petición al backend (POST o PUT).
 */
myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }
  toggleLoading(true);

  // El sistema configura método HTTP y endpoint según el modo (insertar o actualizar)
  if (insertUpdate) {
    console.log("Insertando nueva asignación");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_PARKINGASSIGNMENT;
  } else {
    console.log("Actualizando asignación");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_PARKINGASSIGNMENT + keyId;
  }

  // El sistema obtiene datos del formulario y los transforma al formato esperado por el backend
  const formData = objForm.getDataForm();
  documentData = {
    parking_slot_id: parseInt(formData.parking_slot_id),
    user_id: parseInt(formData.user_id),
    vehicle_id: formData.vehicle_id ? parseInt(formData.vehicle_id) : null,
    start_time: formData.start_time,
    end_time: formData.end_time,
    total_amount: formData.total_amount ? parseFloat(formData.total_amount) : null,
    status_id: parseInt(formData.status_id)
  };

  console.log('Datos del formulario:', documentData);

  // El sistema envía petición al backend
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Respuesta del servidor:', data);
    if (data.error || data.errors) {
      const errorMsg = data.error || (data.errors ? data.errors.join(', ') : 'Error desconocido');
      alert('Error: ' + errorMsg);
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
 * El sistema abre el modal para agregar una nueva asignación.
 * El sistema resetea el formulario y lo habilita en modo inserción.
 */
function add() {
  showHiddenModal(true);
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
}

/**
 * El sistema muestra los detalles de una asignación específica en modo solo lectura.
 * El sistema obtiene los datos del backend mediante el endpoint GET /parking-assignments/:id
 *
 * @param {number} id - ID de la asignación a visualizar.
 */
function showId(id) {
  objForm.resetForm();
  objForm.disabledForm();
  objForm.disabledButton();
  objForm.hiddenButton();
  getDataId(id);
}

/**
 * El sistema abre el modal para editar una asignación existente.
 * El sistema carga los datos actuales de la asignación desde el backend.
 *
 * @param {number} id - ID de la asignación a editar.
 */
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
 * El sistema finaliza una asignación después de confirmación del usuario.
 * El sistema utiliza el endpoint DELETE /parking-assignments/:id del backend.
 *
 * @param {number} id - ID de la asignación a finalizar.
 */
function delete_(id) {
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  if (confirm(textConfirm)) {
    documentData = "";
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = URL_PARKINGASSIGNMENT + id;
    const token = getAuthToken();
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta de finalización:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Asignación finalizada exitosamente');
      }
    }).catch(error => {
      console.log('Error al finalizar:', error);
      alert('Error al finalizar. Por favor, inténtalo de nuevo.');
    }).finally(() => {
      loadView();
    });
  } else {
    console.log("Operación cancelada");
  }
}

/**
 * El sistema verifica la disponibilidad de un espacio en un rango de fechas.
 * El sistema utiliza el endpoint GET /parking-assignments/check-availability/:slotId
 *
 * @param {number} slotId - ID del espacio de parqueo.
 */
function checkAvailability(slotId) {
  const startTime = document.getElementById('start_time').value;
  const endTime = document.getElementById('end_time').value;
  
  if (!startTime || !endTime) {
    alert('Por favor, selecciona las fechas de inicio y fin primero.');
    return;
  }

  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = `${URL_PARKINGASSIGNMENT}check-availability/${slotId}?start_time=${startTime}&end_time=${endTime}`;
  
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Disponibilidad:', data);
    if (data.available) {
      alert('El espacio está disponible en el período seleccionado');
    } else {
      alert('El espacio NO está disponible en el período seleccionado');
    }
  }).catch(error => {
    console.log('Error al verificar disponibilidad:', error);
    alert('Error al verificar la disponibilidad');
  });
}

/**
 * El sistema obtiene los datos de una asignación específica por su ID.
 * El sistema utiliza el endpoint GET /parking-assignments/:id del backend.
 * El sistema transforma los datos del backend al formato esperado por el formulario.
 *
 * @param {number} id - ID de la asignación a obtener.
 */
function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PARKINGASSIGNMENT + id;
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de la asignación:', data);
    // El backend puede devolver directamente el objeto o dentro de data.data
    let getData = data.data || data;

    // El sistema transforma datos del backend al formato del formulario
    const formData = {
      parking_slot_id: getData.parking_slot_id,
      user_id: getData.user_id,
      vehicle_id: getData.vehicle_id || '',
      start_time: getData.start_time ? new Date(getData.start_time).toISOString().slice(0, 16) : '',
      end_time: getData.end_time ? new Date(getData.end_time).toISOString().slice(0, 16) : '',
      total_amount: getData.total_amount || '',
      status_id: getData.status_id
    };

    objForm.setDataFormJson(formData);
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos de la asignación');
  }).finally(() => {
    showHiddenModal(true);
  });
}

/**
 * El sistema obtiene todas las asignaciones del sistema.
 * El sistema utiliza el endpoint GET /parking-assignments del backend.
 * El sistema destruye y reinicializa DataTable después de cargar los datos.
 */
function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PARKINGASSIGNMENT;

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos recibidos del backend:', data);
    createTable(data);
    // El sistema destruye DataTable si ya existe
    if ($.fn.DataTable.isDataTable(appTable)) {
      $(appTable).DataTable().destroy();
    }
    new DataTable(appTable);
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al cargar los datos de asignaciones');
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * El sistema crea las filas de la tabla con los datos de asignaciones recibidos del backend.
 * El sistema mapea los campos del modelo de asignaciones a las columnas de la tabla.
 *
 * Mapeo de datos:
 * - Backend: assignment_id → Frontend: ID
 * - Backend: slot_code → Frontend: Espacio
 * - Backend: username → Frontend: Usuario
 * - Backend: license_plate → Frontend: Vehículo
 * - Backend: start_time → Frontend: Fecha Inicio
 * - Backend: end_time → Frontend: Fecha Fin
 * - Backend: total_amount → Frontend: Monto
 * - Backend: status_name → Frontend: Estado
 *
 * @param {Object|Array} data - Objeto de respuesta del backend con estructura { data: [] } o array directo.
 */
function createTable(data) {
  objTableBody.innerHTML = ""; // El sistema limpia datos previos de la tabla

  // El backend puede devolver array directo o dentro de data.data
  let getData = Array.isArray(data) ? data : (data.data || []);
  console.log('Datos para crear tabla:', getData);

  if (getData.length === 0) {
    console.log('No hay datos para mostrar');
    objTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No hay asignaciones disponibles</td></tr>';
    return;
  }

  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Fila actual:', row);

    // El sistema formatea fechas
    const startDate = row.start_time ? new Date(row.start_time).toLocaleString('es-ES') : 'N/A';
    const endDate = row.end_time ? new Date(row.end_time).toLocaleString('es-ES') : 'N/A';

    // El sistema determina el estado activo o finalizado
    const isActive = row.status_name !== 'Finalizado' && row.status_name !== 'Cancelado';
    const statusClass = isActive ? 'text-success' : 'text-secondary';

    let dataRow = `<tr>
      <td>${row.assignment_id || row.parking_assignment_id}</td>
      <td>${row.slot_code || 'N/A'}</td>
      <td>${row.username || 'N/A'}</td>
      <td>${row.license_plate || 'Sin vehículo'}</td>
      <td>${startDate}</td>
      <td>${endDate}</td>
      <td>$${row.total_amount || '0.00'}</td>
      <td>
        <span class="${statusClass}">${row.status_name || 'N/A'}</span>
      </td>
      <td>
        <button type="button" title="Ver Asignación" class="btn btn-success btn-sm" onclick="showId(${row.assignment_id || row.parking_assignment_id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Asignación" class="btn btn-primary btn-sm" onclick="edit(${row.assignment_id || row.parking_assignment_id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Finalizar Asignación" class="btn btn-danger btn-sm" onclick="delete_(${row.assignment_id || row.parking_assignment_id})">
          <i class='fas fa-stop'></i>
        </button>
      </td>
    </tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

/**
 * El sistema crea las opciones del select de espacios de parqueo.
 * Los datos provienen del endpoint GET /parking-slots/ definido en constants.js
 *
 * @param {Object} data - Objeto de respuesta del backend con estructura { success, message, data: [] }
 */
function createSelectParkingSlot(data) {
  objSelectParkingSlot.innerHTML = "<option value='' selected disabled>Selecciona el espacio</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;

  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.parking_slot_id || row.id}">${row.code || row.slot_code || 'Espacio ' + (row.parking_slot_id || row.id)}</option>`;
    objSelectParkingSlot.innerHTML += dataRow;
  }
}

/**
 * El sistema crea las opciones del select de usuarios.
 * Los datos provienen del endpoint GET /user/ definido en constants.js
 *
 * @param {Object} data - Objeto de respuesta del backend con estructura { success, message, data: [] }
 */
function createSelectUser(data) {
  objSelectUser.innerHTML = "<option value='' selected disabled>Selecciona el usuario</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;

  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.user_id || row.id}">${row.username || row.user_name || 'Usuario ' + (row.user_id || row.id)}</option>`;
    objSelectUser.innerHTML += dataRow;
  }
}

/**
 * El sistema crea las opciones del select de vehículos.
 * Los datos provienen del endpoint GET /vehicles/ definido en constants.js
 *
 * @param {Object} data - Objeto de respuesta del backend con estructura { success, message, data: [] }
 */
function createSelectVehicle(data) {
  objSelectVehicle.innerHTML = "<option value='' selected disabled>Selecciona el vehículo (opcional)</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;

  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.vehicle_id || row.id}">${row.license_plate || row.plate || 'Vehículo ' + (row.vehicle_id || row.id)}</option>`;
    objSelectVehicle.innerHTML += dataRow;
  }
}

/**
 * El sistema crea las opciones del select de estados.
 * Los datos provienen del endpoint GET /status/entity/parking_assignment definido en constants.js
 * Solo carga estados válidos para asignaciones de parqueo.
 *
 * @param {Object} data - Objeto de respuesta del backend con estructura { success, message, data: [] }
 */
function createSelectStatus(data) {
  objSelectStatus.innerHTML = "<option value='' selected disabled>Selecciona el estado</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;

  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.status_id}">${row.status_name || row.name || 'Estado ' + row.status_id}</option>`;
    objSelectStatus.innerHTML += dataRow;
  }
}

/**
 * El sistema muestra u oculta el modal del formulario de asignaciones.
 *
 * @param {boolean} type - true para mostrar, false para ocultar.
 */
function showHiddenModal(type) {
  if (type) {
    objModal.show();
  } else {
    objModal.hide();
  }
}

/**
 * El sistema recarga la vista de asignaciones.
 * El sistema activa el loading screen y obtiene los datos actualizados del backend.
 */
function loadView() {
  getData();
  toggleLoading(true);
}

/**
 * El sistema obtiene la lista de espacios de parqueo desde el backend.
 * El sistema utiliza el endpoint GET /parking-slots/ definido en constants.js (URL_PARKINGSLOT)
 */
function getDataParkingSlot() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PARKINGSLOT;
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de espacios:', data);
    createSelectParkingSlot(data);
  }).catch(error => {
    console.log('Error al obtener espacios:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * El sistema obtiene la lista de usuarios desde el backend.
 * El sistema utiliza el endpoint GET /user/ definido en constants.js (URL_USER)
 */
function getDataUser() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_USER;
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
 * El sistema obtiene la lista de vehículos desde el backend.
 * El sistema utiliza el endpoint GET /vehicles/ definido en constants.js (URL_VEHICLE)
 */
function getDataVehicle() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_VEHICLE;
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de vehículos:', data);
    createSelectVehicle(data);
  }).catch(error => {
    console.log('Error al obtener vehículos:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * El sistema obtiene los estados válidos para asignaciones desde el backend.
 * El sistema utiliza el endpoint GET /status/entity/parking_assignment definido en constants.js (URL_STATUS)
 */
function getDataStatus() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_STATUS + "/entity/parking_assignment";
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de estados:', data);
    createSelectStatus(data);
  }).catch(error => {
    console.log('Error al obtener estados:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * El sistema inicializa la vista cuando la ventana termina de cargar.
 * El sistema carga las asignaciones, espacios, usuarios, vehículos y estados.
 */
window.addEventListener('load', () => {
  loadView();
  getDataParkingSlot();
  getDataUser();
  getDataVehicle();
  getDataStatus();
});
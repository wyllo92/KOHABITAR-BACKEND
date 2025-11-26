document.addEventListener('DOMContentLoaded', async ()=> {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
 
  await checkAuth();
  console.log('visitor controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen
});

const objForm = new Form('visitorForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectStatus = document.getElementById('Status_id');
const objSelectProperty = document.getElementById('Property_id');
const objSelectVehicle = document.getElementById('Vehicle_id');
const objSelectParking = document.getElementById('parkingSlot_id');
const myForm = objForm.getForm();
const textConfirm = "Press a button!\nEither OK or Cancel.";
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

/**
 * El sistema maneja el envío del formulario de visitantes
 * Los datos se normalizan a la estructura que espera el backend
 */
myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario de visitante");
    return;
  }
  toggleLoading(true);

  // El sistema configura método y endpoint según operación
  if (insertUpdate) {
    httpMethod = METHODS[1]; // POST
    endpointUrl = URL_VISITOR;
  } else {
    httpMethod = METHODS[2]; // PUT
    endpointUrl = URL_VISITOR + '/' + keyId;
  }

  // El sistema obtiene datos del formulario
  const formData = objForm.getDataForm();

  // El sistema combina campos de fecha y hora si están separados
  let entryTime = formData.entry_time || formData.Visitor_entry_time;
  let exitTime = formData.exit_time || formData.Visitor_exit_time;

  if (formData.visitor_entry_date && formData.visitor_entry_time) {
    entryTime = `${formData.visitor_entry_date}T${formData.visitor_entry_time}`;
  }
  if (formData.visitor_exit_date && formData.visitor_exit_time) {
    exitTime = `${formData.visitor_exit_date}T${formData.visitor_exit_time}`;
  }

  // El sistema establece hora de entrada actual si no se proporciona
  if (insertUpdate && !entryTime) {
    entryTime = new Date().toISOString();
    console.log('El sistema establece hora de entrada actual:', entryTime);
  }

  // El sistema normaliza los datos a la estructura del backend
  // Backend espera: full_name, id_document, visit_reason, entry_time, exit_time,
  // authorized_user_id, property_id, status_id, vehicle_id, parking_slot_id
  documentData = {
    full_name: formData.full_name || formData.Visitor_full_name,
    id_document: formData.id_document || formData.Visitor_id_document,
    visit_reason: formData.visit_reason || formData.Visitor_visit_reason,
    entry_time: entryTime,
    exit_time: exitTime || null,
    authorized_user_id: parseInt(formData.authorized_user_id || formData.Visitor_authorized_by || formData.authorized_by) || null,
    property_id: parseInt(formData.property_id || formData.Property_id),
    status_id: parseInt(formData.status_id || formData.Status_id),
    vehicle_id: formData.vehicle_id || formData.Vehicle_id || null,
    parking_slot_id: formData.parking_slot_id || formData.parkingSlot_id || null
  };

  // El sistema normaliza valores vacíos a null para campos opcionales
  ['vehicle_id', 'parking_slot_id', 'exit_time', 'authorized_user_id'].forEach(k => {
    if (documentData[k] === "" || documentData[k] === undefined || documentData[k] === 'null') {
      documentData[k] = null;
    } else if (k.includes('_id') && documentData[k] && !isNaN(documentData[k])) {
      documentData[k] = Number(documentData[k]);
    }
  });

  console.log('El sistema envía datos de visitante:', documentData, 'a', endpointUrl, 'método:', httpMethod);

  // El sistema obtiene el token de autenticación para enviar la petición
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    console.log('Response status:', response.status, response.statusText);
    return response.text().then(text => {
      try {
        return { ok: response.ok, status: response.status, data: JSON.parse(text) };
      } catch (err) {
        return { ok: response.ok, status: response.status, data: text };
      }
    });
  }).then(result => {
    console.log('Response parsed:', result);
    if (!result.ok) {
      // Show server-provided message if available
      let msg = '';
      if (result.data && typeof result.data === 'object') {
        msg = result.data.error || result.data.message || JSON.stringify(result.data);
      } else {
        msg = String(result.data);
      }
      console.error('Server responded with error for visitor save:', result);
      alert('Error al guardar visitante: ' + msg + '\nCódigo: ' + result.status);
      // Keep modal open so user can correct data
      toggleLoading(false);
      return;
    }

    // Success
    let successMsg = '';
    if (result.data && typeof result.data === 'object') {
      successMsg = result.data.message || 'Visitante creado correctamente';
    } else {
      successMsg = 'Visitante creado correctamente';
    }
    console.log('Visitor saved OK:', successMsg);
    alert(successMsg);
    loadView();
    showHiddenModal(false);
  }).catch(error => {
    console.error('Network or parsing error sending visitor:', error);
    alert('Error de red al intentar guardar visitante. Revisa la consola para más detalles.');
  }).finally(() => {
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
  // Autofill authorized_by with current user if available
  try {
    const storage = window.localStorage;
    const currentUserId = storage.getItem('user_id') || storage.getItem('userId');
    const currentUserName = storage.getItem('user_name') || storage.getItem('userName');
    const authInput = document.getElementById('Visitor_authorized_by');
    if (authInput && !authInput.value) {
      authInput.value = currentUserId || currentUserName || '';
    }
  } catch (err) {
    console.warn('Could not autofill Visitor_authorized_by from storage', err);
  }
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
    documentData = null;
    httpMethod = METHODS[3]; // DELETE
    endpointUrl = URL_VISITOR + '/' + id;
    // El sistema obtiene el token de autenticación para la eliminación
    const token = getAuthToken();
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
    resultServices.then(response => response.json())
    .then(data => {
      //console.log(data);
    }).catch(error => {
      console.log(error);
    }).finally(() => {
      loadView();
    });
  } else {
    console.log("cancel");
  }
}

/**
 * El sistema obtiene los datos de un visitante específico adaptándose al backend
 * El backend devuelve campos sin prefijo "Visitor_"
 * @param {number} id - ID del visitante a consultar
 */
function getDataId(id) {
  documentData = null;
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_VISITOR + '/' + id;
  // El sistema obtiene el token de autenticación para consultar un visitante específico
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
  .then(data => {
    console.log('Datos del visitante recibidos:', data);

    // El sistema valida que la respuesta contenga datos válidos
    if (!data || !data.data) {
      console.error('El sistema no recibió datos válidos del visitante:', data);
      alert('Error: No se pudo cargar la información del visitante');
      return;
    }

    let getData = data["data"];

    // El sistema mapea los campos del backend a los nombres del formulario
    // El backend usa: visitor_id, full_name, id_document, entry_time, exit_time
    // El formulario puede usar nombres con mayúsculas o guiones bajos
    const mappedData = {
      visitor_id: getData.visitor_id,
      Visitor_id: getData.visitor_id,
      full_name: getData.full_name,
      Visitor_full_name: getData.full_name,
      id_document: getData.id_document,
      Visitor_id_document: getData.id_document,
      visit_reason: getData.visit_reason,
      Visitor_visit_reason: getData.visit_reason,
      entry_time: getData.entry_time,
      Visitor_entry_time: getData.entry_time,
      exit_time: getData.exit_time,
      Visitor_exit_time: getData.exit_time,
      authorized_by: getData.authorized_user_id,
      Visitor_authorized_by: getData.authorized_user_id,
      property_id: getData.property_id,
      Property_id: getData.property_id,
      status_id: getData.status_id,
      Status_id: getData.status_id,
      vehicle_id: getData.vehicle_id,
      Vehicle_id: getData.vehicle_id,
      parking_slot_id: getData.parking_slot_id,
      parkingSlot_id: getData.parking_slot_id
    };

    // El sistema carga los datos mapeados al formulario
    objForm.setDataFormJson(mappedData);

    // El sistema procesa campos de fecha/hora si están presentes usando el nombre del backend
    if (getData && getData.entry_time) {
      const dt = new Date(getData.entry_time);
      const dateStr = dt.toISOString().split('T')[0];
      const timeStr = dt.toTimeString().split(' ')[0].slice(0,5);
      const dateInput = document.getElementById('visitor_entry_date');
      const timeInput = document.getElementById('visitor_entry_time');
      if (dateInput) dateInput.value = dateStr;
      if (timeInput) timeInput.value = timeStr;
    }
    if (getData && getData.exit_time) {
      const dt2 = new Date(getData.exit_time);
      const dateStr2 = dt2.toISOString().split('T')[0];
      const timeStr2 = dt2.toTimeString().split(' ')[0].slice(0,5);
      const dateInput2 = document.getElementById('visitor_exit_date');
      const timeInput2 = document.getElementById('visitor_exit_time');
      if (dateInput2) dateInput2.value = dateStr2;
      if (timeInput2) timeInput2.value = timeStr2;
    }
  }).catch(error => {
    console.error('Error al obtener visitante:', error);
  }).finally(() => {
    showHiddenModal(true);
  });
}

function getData() {
  documentData = null;
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_VISITOR;
  // El sistema obtiene el token de autenticación para listar todos los visitantes
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
  .then(data => {
    createTable(data);
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    new DataTable(appTable);
    toggleLoading(false);
  });
}

/**
 * El sistema crea la tabla de visitantes adaptándose a la estructura del backend
 * El backend devuelve campos en minúsculas sin prefijo "Visitor_"
 * @param {Object} data - Datos recibidos del backend con estructura {success, message, data: []}
 */
function createTable(data) {
  objTableBody.innerHTML = "";

  // El sistema extrae el array de datos del objeto de respuesta
  let getData = data['data'];
  if (!getData || getData.length === 0) {
    objTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No hay visitantes registrados</td></tr>';
    return;
  }

  let rowLong = getData.length;
  console.log('El sistema está creando tabla con', rowLong, 'visitantes');

  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];

    // El sistema construye la información del vehículo desde los campos joinados
    const vehicleInfo = row.vehicle_model ? `${row.vehicle_model} (${row.vehicle_type || ''})` : 'Sin vehículo';

    // El sistema formatea las fechas para mejor legibilidad
    const entryTime = row.entry_time ? new Date(row.entry_time).toLocaleString('es-ES') : 'N/A';
    const exitTime = row.exit_time ? new Date(row.exit_time).toLocaleString('es-ES') : 'En visita';

    // El sistema construye la fila de la tabla usando los nombres exactos del backend
    let dataRow = `<tr>
<td>${row.visitor_id}</td>
<td>${row.full_name}</td>
<td>${row.id_document}</td>
<td>${vehicleInfo}</td>
<td>${row.property_name || 'N/A'}</td>
<td>${row.status_name || 'N/A'}</td>
<td>${entryTime}</td>
<td>${exitTime}</td>
<td>
<button type="button" title="Ver Visitante" class="btn btn-success" onclick="showId(${row.visitor_id})"><i class='fas fa-eye'></i></button>
<button type="button" title="Editar Visitante" class="btn btn-primary" onclick="edit(${row.visitor_id})"><i class='fas fa-edit'></i></button>
<button type="button" title="Eliminar Visitante" class="btn btn-danger" onclick="delete_(${row.visitor_id})"><i class='fas fa-trash'></i></button>
`;
    objTableBody.innerHTML += dataRow;
  }

  console.log('El sistema completó la creación de la tabla de visitantes');
}

function createSelectStatus(data) {
  objSelectStatus.innerHTML = "<option value='' selected disabled>Seleccione un estado</option>";
  let getData = data['data'];
  if (!getData || getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    // El sistema usa el campo 'name' del backend, no 'status_name'
    let dataRow = `<option value="${row.status_id}">${row.name}</option>`;
    objSelectStatus.innerHTML += dataRow;
  }
}

function createSelectProperty(data) {
  objSelectProperty.innerHTML = "<option value='' selected disabled>Seleccione una propiedad</option>";
  let getData = data['data'];
  if (!getData || getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    // El sistema usa el campo 'name' del backend para propiedades
    let dataRow = `<option value="${row.property_id}">${row.name}</option>`;
    objSelectProperty.innerHTML += dataRow;
  }
}

function createSelectVehicle(data) {
  objSelectVehicle.innerHTML = "<option value='' selected>Sin vehículo</option>";
  let getData = data['data'];
  if (!getData || getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.vehicle_id}">${row.model} - ${row.type || ''} - ${row.plate || ''}</option>`;
    objSelectVehicle.innerHTML += dataRow;
  }
}

/**
 * El sistema carga los espacios de parqueo adaptándose a la estructura del backend
 * El backend devuelve parking_slot_id (con guion bajo)
 */
function createSelectParking(data) {
  objSelectParking.innerHTML = "<option value='' selected>Sin Parqueadero</option>";
  let getData = data['data'];
  if (!getData || getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    // El sistema usa parking_slot_id del backend, no parkingSlot_id
    const slotId = row.parking_slot_id || row.parkingSlot_id;
    let dataRow = `<option value="${slotId}">${row.code}</option>`;
    objSelectParking.innerHTML += dataRow;
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

function getDataStatus() {
  documentData = null;
  httpMethod = METHODS[0];
  // El sistema consulta estados específicos para la entidad 'visitor'
  endpointUrl = URL_STATUS + '/entity/visitor';
  // El sistema obtiene el token de autenticación para cargar los estados
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
  .then(data => createSelectStatus(data))
  .catch(error => console.log(error))
  .finally(() => toggleLoading(false));
}

function getDataProperty() {
  documentData = null;
  httpMethod = METHODS[0];
  endpointUrl = URL_PROPERTY;
  // El sistema obtiene el token de autenticación para cargar las propiedades
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
  .then(data => createSelectProperty(data))
  .catch(error => console.log(error))
  .finally(() => toggleLoading(false));
}

function getDataVehicle() {
  documentData = null;
  httpMethod = METHODS[0];
  endpointUrl = URL_VEHICLE;
  // El sistema obtiene el token de autenticación para cargar los vehículos
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
  .then(data => createSelectVehicle(data))
  .catch(error => console.log(error))
  .finally(() => toggleLoading(false));
}

function getDataParking() {
  documentData = null;
  httpMethod = METHODS[0];
  endpointUrl = URL_PARKINGSLOT;
  // El sistema obtiene el token de autenticación para cargar los espacios de parqueo
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => response.json())
  .then(data => createSelectParking(data))
  .catch(error => console.log(error))
  .finally(() => toggleLoading(false));
}

/**
 * El sistema exporta la lista de visitantes a formato PDF
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportVisitorsToPDF() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a PDF
  const exportUrl = URL_EXPORT_VISITORS;

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
    a.download = `visitantes_${fecha}.pdf`;

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
 * El sistema exporta la lista de visitantes a formato Excel
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportVisitorsToExcel() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a Excel
  const exportUrl = URL_EXPORT_VISITORS_EXCEL;

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
    a.download = `visitantes_${fecha}.xlsx`;

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
  getDataProperty();
  getDataVehicle();
  getDataParking();
});


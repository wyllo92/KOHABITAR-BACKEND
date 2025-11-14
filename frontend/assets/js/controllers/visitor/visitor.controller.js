document.addEventListener('DOMContentLoaded', async ()=> {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
 
  await checkAuth();
  console.log('visitor controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

const objForm = new Form('visitorForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectProperty = document.getElementById('Property_id');
const objInputVehicle = document.getElementById('Visitor_vehicle'); // Changed from select to input
const objSelectParking = document.getElementById('parkingSlot_id');
const myForm = objForm.getForm();
const textConfirm = "Press a button!\nEither OK or Cancel.";
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error");
    return;
  }
  toggleLoading(true);
  if (insertUpdate) {
    httpMethod = METHODS[1]; // POST
    endpointUrl = URL_VISITOR;
  } else {
    httpMethod = METHODS[2]; // PUT
    endpointUrl = URL_VISITOR + keyId;
  }
  documentData = objForm.getDataForm();
  
  // If entry date and time provided as separate fields, combine
  if (documentData.visitor_entry_date && documentData.visitor_entry_time) {
    documentData.Visitor_entry_time = `${documentData.visitor_entry_date}T${documentData.visitor_entry_time}`;
  }
  if (documentData.visitor_exit_date && documentData.visitor_exit_time) {
    documentData.Visitor_exit_time = `${documentData.visitor_exit_date}T${documentData.visitor_exit_time}`;
  }

  // If creating and no entry time provided, set to now so backend has a timestamp
  if (insertUpdate && !documentData.Visitor_entry_time) {
    documentData.Visitor_entry_time = new Date().toISOString();
    console.log('No entry time provided, setting to now:', documentData.Visitor_entry_time);
  }

  console.log('Sending visitor payload:', documentData, 'to', endpointUrl, 'method:', httpMethod);

  // Normalize empty strings to null for numeric/optional ids
  ['parkingSlot_id', 'Property_id'].forEach(k => {
    if (k in documentData) {
      if (documentData[k] === "" || documentData[k] === undefined) {
        documentData[k] = null;
      } else if (!isNaN(documentData[k])) {
        // convert numeric strings to numbers
        documentData[k] = Number(documentData[k]);
      }
    }
  });

  // Handle Visitor_vehicle as text field (convert empty to null)
  if ('Visitor_vehicle' in documentData) {
    if (documentData.Visitor_vehicle === "" || documentData.Visitor_vehicle === undefined) {
      documentData.Visitor_vehicle = null;
    }
  }

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
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
      successMsg = result.data.message || (insertUpdate ? 'Visitante creado correctamente' : 'Visitante actualizado correctamente');
    } else {
      successMsg = insertUpdate ? 'Visitante creado correctamente' : 'Visitante actualizado correctamente';
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
  
  // Set default entry time to now
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].slice(0,5);
  const dateInput = document.getElementById('visitor_entry_date');
  const timeInput = document.getElementById('visitor_entry_time');
  if (dateInput) dateInput.value = dateStr;
  if (timeInput) timeInput.value = timeStr;
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
    httpMethod = METHODS[3]; // DELETE
    endpointUrl = URL_VISITOR + id;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => response.json())
    .then(data => {
      console.log('Delete response:', data);
      alert(data.message || 'Visitante eliminado correctamente');
    }).catch(error => {
      console.log('Delete error:', error);
      alert('Error al eliminar visitante');
    }).finally(() => {
      loadView();
    });
  } else {
    console.log("cancel");
  }
}

function checkOut(id) {
  if (confirm('¿Desea registrar la salida de este visitante?')) {
    documentData = { exit_time: new Date().toISOString() };
    httpMethod = METHODS[2]; // PUT
    endpointUrl = URL_VISITOR + id + '/checkout';
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => response.json())
    .then(data => {
      console.log('Checkout response:', data);
      alert(data.message || 'Salida registrada correctamente');
      loadView();
    }).catch(error => {
      console.log('Checkout error:', error);
      alert('Error al registrar salida');
    });
  }
}

function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_VISITOR + id;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
  .then(data => {
    let getData = data["data"];
    // Map fields to form (form helper will set by name)
    objForm.setDataFormJson(getData);
    // Also populate separate date/time inputs if Visitor_entry_time present
    if (getData && getData.Visitor_entry_time) {
      const dt = new Date(getData.Visitor_entry_time);
      const dateStr = dt.toISOString().split('T')[0];
      const timeStr = dt.toTimeString().split(' ')[0].slice(0,5);
      const dateInput = document.getElementById('visitor_entry_date');
      const timeInput = document.getElementById('visitor_entry_time');
      if (dateInput) dateInput.value = dateStr;
      if (timeInput) timeInput.value = timeStr;
    }
    if (getData && getData.Visitor_exit_time) {
      const dt2 = new Date(getData.Visitor_exit_time);
      const dateStr2 = dt2.toISOString().split('T')[0];
      const timeStr2 = dt2.toTimeString().split(' ')[0].slice(0,5);
      const dateInput2 = document.getElementById('visitor_exit_date');
      const timeInput2 = document.getElementById('visitor_exit_time');
      if (dateInput2) dateInput2.value = dateStr2;
      if (timeInput2) timeInput2.value = timeStr2;
    }
  }).catch(error => {
    console.log(error);
    alert('Error al cargar datos del visitante');
  }).finally(() => {
    showHiddenModal(true);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_VISITOR;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
  .then(data => {
    createTable(data);
  }).catch(error => {
    console.log(error);
    alert('Error al cargar visitantes');
  }).finally(() => {
    new DataTable(appTable);
    toggleLoading(false);
  });
}

function createTable(data) {
  objTableBody.innerHTML = "";
  let getData = data['data'];
  if (!getData || getData.length === 0) {
    objTableBody.innerHTML = "<tr><td colspan='8' class='text-center'>No hay visitantes registrados</td></tr>";
    return;
  }
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Visitor_vehicle is now a text field, not a relation
    const vehicleInfo = row.Visitor_vehicle || 'Sin vehículo';
    const parkingInfo = row.parking_slot_code || 'Sin parqueadero';
    const entryTime = row.Visitor_entry_time ? new Date(row.Visitor_entry_time).toLocaleString('es-CO') : '';
    const exitTime = row.Visitor_exit_time ? new Date(row.Visitor_exit_time).toLocaleString('es-CO') : '';
    const isActive = !row.Visitor_exit_time;
    const statusBadge = isActive ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-secondary">Finalizado</span>';
    
    let checkoutButton = '';
    if (isActive) {
      checkoutButton = `<button type="button" title="Registrar Salida" class="btn btn-warning btn-sm" onclick="checkOut(${row.Visitor_id})"><i class='fas fa-sign-out-alt'></i></button>`;
    }
    
    let dataRow = `<tr>
<td>${row.Visitor_id}</td>
<td>${row.Visitor_full_name}</td>
<td>${row.Visitor_id_document}</td>
<td>${vehicleInfo}</td>
<td>${parkingInfo}</td>
<td>${row.property_name || 'N/A'}</td>
<td>${statusBadge}</td>
<td>${entryTime}</td>
<td>${exitTime}</td>
<td>
<button type="button" title="Ver" class="btn btn-success btn-sm" onclick="showId(${row.Visitor_id})"><i class='fas fa-eye'></i></button>
<button type="button" title="Editar" class="btn btn-primary btn-sm" onclick="edit(${row.Visitor_id})"><i class='fas fa-edit'></i></button>
<button type="button" title="Eliminar" class="btn btn-danger btn-sm" onclick="delete_(${row.Visitor_id})"><i class='fas fa-trash'></i></button>
${checkoutButton}
</td>
</tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

function createSelectProperty(data) {
  objSelectProperty.innerHTML = "<option value='' selected disabled>Seleccione una propiedad</option>";
  let getData = data['data'];
  if (!getData || getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.property_id}">${row.property_name}</option>`;
    objSelectProperty.innerHTML += dataRow;
  }
}

function createSelectParking(data) {
  objSelectParking.innerHTML = "<option value='' selected>Sin Parqueadero</option>";
  let getData = data['data'];
  if (!getData || getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    const isAvailable = row.is_available ? '' : ' (Ocupado)';
    let dataRow = `<option value="${row.parkingSlot_id}">${row.code}${isAvailable}</option>`;
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

function getDataProperty() {
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_PROPERTY;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
  .then(data => createSelectProperty(data))
  .catch(error => console.log('Error loading properties:', error))
  .finally(() => toggleLoading(false));
}

function getDataParking() {
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_PARKINGSLOT;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
  .then(data => createSelectParking(data))
  .catch(error => console.log('Error loading parking slots:', error))
  .finally(() => toggleLoading(false));
}

// Additional utility functions for visitor management
function getCurrentVisitors() {
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_VISITOR + 'current';
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
  .then(data => {
    console.log('Current visitors:', data);
    createTable(data);
  })
  .catch(error => console.log('Error loading current visitors:', error));
}

function getTodayVisitors() {
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_VISITOR + 'today';
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
  .then(data => {
    console.log('Today visitors:', data);
    createTable(data);
  })
  .catch(error => console.log('Error loading today visitors:', error));
}

window.addEventListener('load', () => {
  loadView();
  getDataProperty();
  getDataParking(); // Removed getDataVehicle() since it's no longer needed
});
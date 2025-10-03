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
  ['Vehicle_id', 'parkingSlot_id'].forEach(k => {
    if (k in documentData) {
      if (documentData[k] === "" || documentData[k] === undefined) {
        documentData[k] = null;
      } else if (!isNaN(documentData[k])) {
        // convert numeric strings to numbers
        documentData[k] = Number(documentData[k]);
      }
    }
  });

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
    documentData = "";
    httpMethod = METHODS[3]; // DELETE
    endpointUrl = URL_VISITOR + id;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
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
  }).finally(() => {
    new DataTable(appTable);
    toggleLoading(false);
  });
}

function createTable(data) {
  objTableBody.innerHTML = "";
  let getData = data['data'];
  if (!getData || getData.length === 0) return;
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    const vehicleInfo = row.vehicle_model ? `${row.vehicle_model} (${row.vehicle_type || ''})` : '';
    let dataRow = `<tr>
<td>${row.Visitor_id}</td>
<td>${row.Visitor_full_name}</td>
<td>${row.Visitor_id_document}</td>
<td>${vehicleInfo}</td>
<td>${row.property_name || 'N/A'}</td>
<td>${row.status_name || 'N/A'}</td>
<td>${row.Visitor_entry_time || ''}</td>
<td>${row.Visitor_exit_time || ''}</td>
<td>
<button type="button" title="Button Show"class="btn btn-success" onclick="showId(${row.Visitor_id})"><i class='fas fa-eye'></i></button>
<button type="button"title="Button Edit" class="btn btn-primary" onclick="edit(${row.Visitor_id})"><i class='fas fa-edit' ></i></button>
<button type="button" title="Button Delete" class="btn btn-danger" onclick="delete_(${row.Visitor_id})"><i class='fas fa-trash' ></i></button>
`;
    objTableBody.innerHTML += dataRow;
  }
}

function createSelectStatus(data) {
  objSelectStatus.innerHTML = "<option value='' selected disabled>Seleccione un estado</option>";
  let getData = data['data'];
  if (!getData || getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.status_id}">${row.status_name}</option>`;
    objSelectStatus.innerHTML += dataRow;
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

function createSelectParking(data) {
  objSelectParking.innerHTML = "<option value='' selected>Sin Parqueadero</option>";
  let getData = data['data'];
  if (!getData || getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.parkingSlot_id}">${row.code} </option>`;
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
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_STATUS;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
  .then(data => createSelectStatus(data))
  .catch(error => console.log(error))
  .finally(() => toggleLoading(false));
}

function getDataProperty() {
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_PROPERTY;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
  .then(data => createSelectProperty(data))
  .catch(error => console.log(error))
  .finally(() => toggleLoading(false));
}

function getDataVehicle() {
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_VEHICLE;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
  .then(data => createSelectVehicle(data))
  .catch(error => console.log(error))
  .finally(() => toggleLoading(false));
}

function getDataParking() {
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_PARKINGSLOT;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
  .then(data => createSelectParking(data))
  .catch(error => console.log(error))
  .finally(() => toggleLoading(false));
}

window.addEventListener('load', () => {
  loadView();
  getDataStatus();
  getDataProperty();
  getDataVehicle();
  getDataParking();
});


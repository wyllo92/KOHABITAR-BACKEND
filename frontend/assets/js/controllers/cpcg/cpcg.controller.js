document.addEventListener('DOMContentLoaded', async ()=> {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
 
  await checkAuth();
  console.log('cpcg controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

const objForm = new Form('cpcgForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectUser = document.getElementById('User_id');
const objSelectProperty = document.getElementById('Property_id');
const objSelectType = document.getElementById('CPCG_type_id');
const objSelectStatus = document.getElementById('Status_id');
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
  if (!objForm.validateForm()) return;
  toggleLoading(true);
  if (insertUpdate) {
    httpMethod = METHODS[1]; // POST
    endpointUrl = URL_PQRS;
  } else {
    httpMethod = METHODS[2]; // PUT
    endpointUrl = URL_PQRS + keyId;
  }
  documentData = objForm.getDataForm();

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => response.json())
    .then(data => {
      if (data.error) alert('Error: ' + data.error);
    }).catch(error => {
      console.log(error);
      alert('Network error');
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
  if (confirm(textConfirm)) {
    const resultServices = getDataServices("", METHODS[3], URL_PQRS + id);
    resultServices.then(response => response.json())
    .then(data => {})
    .catch(error => console.log(error))
    .finally(() => loadView());
  }
}

function getDataId(id) {
  const resultServices = getDataServices("", METHODS[0], URL_PQRS + id);
  resultServices.then(response => response.json())
  .then(data => {
    let getData = data["data"];
    objForm.setDataFormJson(getData);
  }).catch(error => console.log(error))
  .finally(() => showHiddenModal(true));
}

function getData() {
  const resultServices = getDataServices("", METHODS[0], URL_PQRS);
  resultServices.then(response => response.json())
  .then(data => createTable(data))
  .catch(error => console.log(error))
  .finally(() => { new DataTable(appTable); toggleLoading(false); });
}

function createTable(data) {
  objTableBody.innerHTML = "";
  let getData = data['data'] || [];
  if (getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    let dataRow = `<tr>
<td>${row.CPCG_id}</td>
<td>${row.user_name || row.User_id}</td>
<td>${row.property_name || row.Property_id}</td>
<td>${row.CPCG_type_name || row.CPCG_type_id}</td>
<td>${row.CPCG_description}</td>
<td>${row.status_name || row.Status_id}</td>
<td>
<button type="button" title="Button Show" class="btn btn-success" onclick="showId(${row.CPCG_id})"><i class='fas fa-eye'></i></button>
<button type="button" title="Button Edit" class="btn btn-primary" onclick="edit(${row.CPCG_id})"><i class='fas fa-edit' ></i></button>
<button type="button" title="Button Delete" class="btn btn-danger" onclick="delete_(${row.CPCG_id})"><i class='fas fa-trash' ></i></button>
</td>
</tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

function createSelectUser(data) {
  objSelectUser.innerHTML = "<option value='' selected disabled>Seleccione un usuario</option>";
  let getData = data['data'] || [];
  if (getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    objSelectUser.innerHTML += `<option value="${row.user_id}">${row.user_name}</option>`;
  }
}

function createSelectProperty(data) {
  objSelectProperty.innerHTML = "<option value='' selected disabled>Seleccione una propiedad</option>";
  let getData = data['data'] || [];
  if (getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    objSelectProperty.innerHTML += `<option value="${row.property_id}">${row.property_name}</option>`;
  }
}

function createSelectType(data) {
  objSelectType.innerHTML = "<option value='' selected disabled>Seleccione un tipo</option>";
  let getData = data['data'] || [];
  if (getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    objSelectType.innerHTML += `<option value="${row.CPCG_type_id}">${row.CPCG_type_name}</option>`;
  }
}

function createSelectStatus(data) {
  objSelectStatus.innerHTML = "<option value='' selected disabled>Seleccione un estado</option>";
  let getData = data['data'] || [];
  if (getData.length === 0) return;
  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    objSelectStatus.innerHTML += `<option value="${row.status_id}">${row.status_name}</option>`;
  }
}

function showHiddenModal(type) {
  if (type) objModal.show(); else objModal.hide();
}

function loadView() {
  getData();
  toggleLoading(true);
}

function getDataUsers() {
  getDataServices('', METHODS[0], URL_USER).then(r=>r.json()).then(d=>createSelectUser(d)).catch(e=>console.log(e));
}

function getDataProperties() {
  getDataServices('', METHODS[0], URL_PROPERTY).then(r=>r.json()).then(d=>createSelectProperty(d)).catch(e=>console.log(e));
}

function getDataTypes() {
  // Assuming there is an endpoint for cpcg types
  getDataServices('', METHODS[0], HOST + '/cpcgType/').then(r=>r.json()).then(d=>createSelectType(d)).catch(e=>console.log(e));
}

function getDataStatus() {
  getDataServices('', METHODS[0], URL_STATUS).then(r=>r.json()).then(d=>createSelectStatus(d)).catch(e=>console.log(e));
}

window.addEventListener('load', () => {
  loadView();
  getDataUsers();
  getDataProperties();
  getDataTypes();
  getDataStatus();
});

window.addEventListener('load', () => {
  // expose functions for buttons in table
  window.showId = showId;
  window.edit = edit;
  window.delete_ = delete_;
});

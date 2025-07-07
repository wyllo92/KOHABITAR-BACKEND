document.addEventListener('DOMContentLoaded', async ()=> {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
 
  await checkAuth();
  console.log('user controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen
    
});

const objForm = new Form('userForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectStatus = document.getElementById('status_id');
const objSelectRole = document.getElementById('role_id');
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
    console.log("Insert");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_USER;
  } else {
    console.log("Update");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_USER + keyId;
  }
  documentData = objForm.getDataForm();
  //console.log(documentData);

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    //console.log(data);
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    //console.log("finally");
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
    endpointUrl = URL_USER + id;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      //console.log(data);
    }).catch(error => {
      console.log(error);
    }).finally(() => {
      //console.log("finally");
      loadView();
    });
  } else {
    console.log("cancel");
  }
}

function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_USER + id;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    let getData = data["data"];
    objForm.setDataFormJson(getData);
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    //console.log("finally");
    showHiddenModal(true);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_USER;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    //Create table 
    //console.log(data['data']);
    createTable(data);
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    //console.log("finally");
    new DataTable(appTable);
    toggleLoading(false);
  });
}

function createTable(data) {
  objTableBody.innerHTML = ""; // Clear previous table data
  let getData = data['data'];
  if (getData.length === 0) return;//Validate if the data is empty
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<tr>
<td>${row.user_id}</td>
<td>${row.user_name}</td>
<td>${row.role_name || 'N/A'}</td>
<td>${row.status_name || 'N/A'}</td>
<td>
<button type="button" title="Button Show"class="btn btn-success" onclick="showId(${row.user_id})"><i class='fas fa-eye'></i></button>
<button type="button"title="Button Edit" class="btn btn-primary" onclick="edit(${row.user_id})"><i class='fas fa-edit' ></i></button>
<button type="button" title="Button Delete" class="btn btn-danger" onclick="delete_(${row.user_id})"><i class='fas fa-trash' ></i></button> `;
    objTableBody.innerHTML += dataRow;
  }
}

function createSelectStatus(data) {
  objSelectStatus.innerHTML = "<option value='' selected disabled>Seleccione un estado</option>";

  let getData = data['data'];
  if (getData.length === 0) return;//Validate if the data is empty
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.status_id}">${row.status_name}</option>`;
    objSelectStatus.innerHTML += dataRow;
  }
}

function createSelectRole(data) {
  objSelectRole.innerHTML = "<option value='' selected disabled>Seleccione un rol</option>";

  let getData = data['data'];
  if (getData.length === 0) return;//Validate if the data is empty
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.role_id}">${row.role_name}</option>`;
    objSelectRole.innerHTML += dataRow;
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
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_STATUS;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    //Create table 
    //console.log(data['data']);
    createSelectStatus(data);
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    //console.log("finally");
    toggleLoading(false);
  });
}

function getDataRole() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_ROLE;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    //Create table 
    //console.log(data['data']);
    createSelectRole(data);
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    //console.log("finally");
    toggleLoading(false);
  });
}

window.addEventListener('load', () => {
  loadView();
  getDataStatus();
  getDataRole();
});


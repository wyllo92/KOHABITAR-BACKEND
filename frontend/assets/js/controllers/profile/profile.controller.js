document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('profile controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

const objForm = new Form('profileForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const myForm = objForm.getForm();
const textConfirm = "¿Está seguro de que desea eliminar este perfil?";
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error de validación en el formulario");
    return;
  }
  toggleLoading(true);
  if (insertUpdate) {
    console.log("Insertando nuevo perfil");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_PROFILE;
  } else {
    console.log("Actualizando perfil existente");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_PROFILE + keyId;
  }
  documentData = objForm.getDataForm();
  console.log("Datos del formulario:", documentData);

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    console.log("Respuesta del servidor:", data);
    if (data.error) {
      alert(`Error: ${data.error}`);
    } else {
      alert(insertUpdate ? "Perfil creado exitosamente" : "Perfil actualizado exitosamente");
    }
  }).catch(error => {
    console.error("Error en la operación:", error);
    alert(`Error: ${error.message}`);
  }).finally(() => {
    loadView();
    showHiddenModal(false);
    toggleLoading(false);
  });
});

function add() {
  showHiddenModal(true);
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledEditForm();
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
    endpointUrl = URL_PROFILE + id;
    toggleLoading(true);
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      return response.json();
    }).then(data => {
      console.log("Respuesta del servidor:", data);
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        alert("Perfil eliminado exitosamente");
      }
    }).catch(error => {
      console.error("Error al eliminar:", error);
      alert(`Error: ${error.message}`);
    }).finally(() => {
      loadView();
      toggleLoading(false);
    });
  } else {
    console.log("Eliminación cancelada");
  }
}

function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PROFILE + id;
  toggleLoading(true);
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    console.log("Datos del perfil:", data);
    if (data.error) {
      alert(`Error: ${data.error}`);
    } else {
      let getData = data["data"];
      objForm.setDataFormJson(getData);
    }
  }).catch(error => {
    console.error("Error al obtener datos:", error);
    alert(`Error: ${error.message}`);
  }).finally(() => {
    showHiddenModal(true);
    toggleLoading(false);
  });
}

function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PROFILE;

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    console.log("Datos de perfiles:", data);
    if (data.error) {
      alert(`Error: ${data.error}`);
    } else {
      createTable(data);
    }
  }).catch(error => {
    console.error("Error al obtener perfiles:", error);
    alert(`Error: ${error.message}`);
  }).finally(() => {
    new DataTable(appTable);
    toggleLoading(false);
  });
}

function createTable(data) {
  objTableBody.innerHTML = ""; // Clear previous table data
  let getData = data['data'];
  if (!getData || getData.length === 0) {
    objTableBody.innerHTML = "<tr><td colspan='6' class='text-center'>No hay perfiles registrados</td></tr>";
    return;
  }
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<tr>
<td>${row.user_id}</td>
<td>${row.profile_fullName || 'N/A'}</td>
<td>${row.profile_phone || 'N/A'}</td>
<td>${row.profile_email || 'N/A'}</td>
<td>${row.profile_address || 'N/A'}</td>
<td>${row.profile_photo || 'N/A'}</td>
<td>
<button type="button" title="Ver Perfil" class="btn btn-success btn-sm" onclick="showId(${row.user_id})"><i class='fas fa-eye'></i></button>
<button type="button" title="Editar Perfil" class="btn btn-primary btn-sm" onclick="edit(${row.user_id})"><i class='fas fa-edit' ></i></button>
<button type="button" title="Eliminar Perfil" class="btn btn-danger btn-sm" onclick="delete_(${row.user_id})"><i class='fas fa-trash' ></i></button> `;
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


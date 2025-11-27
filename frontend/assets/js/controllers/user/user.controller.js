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
    endpointUrl = URL_USER + "/" + keyId;
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
    endpointUrl = URL_USER + "/" + id;
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
  endpointUrl = URL_USER + "/" + id;
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
  // El sistema prepara los parametros para la peticion GET
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_USER;
  console.log('El sistema llama a la URL:', endpointUrl);

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    console.log('El sistema recibe respuesta con status:', response.status);
    return response.json();
  }).then(data => {
    console.log('El sistema recibe estos datos del backend:', data);
    console.log('El tipo de dato es:', typeof data);
    console.log('Las propiedades del objeto son:', Object.keys(data));
    if(data.data) {
      console.log('El sistema encuentra data.data con longitud:', data.data.length);
      console.log('El contenido completo de data.data es:', data.data);
    } else {
      console.log('El sistema NO encuentra la propiedad data.data');
    }
    createTable(data);
  }).catch(error => {
    console.error('El sistema encontro un error:', error);
  }).finally(() => {
    if ($.fn.DataTable.isDataTable(appTable)) {
      $(appTable).DataTable().destroy();
    }
    new DataTable(appTable);
    toggleLoading(false);
  });
}

function createTable(data) {
  // El sistema limpia el contenido anterior de la tabla
  objTableBody.innerHTML = "";
  console.log('El sistema ejecuta createTable con estos datos:', data);

  // El sistema determina la estructura de los datos recibidos
  let getData;
  if (Array.isArray(data)) {
    getData = data;
    console.log('El sistema detecta que data es un array directo con longitud:', getData.length);
  } else if (data.data && Array.isArray(data.data)) {
    getData = data.data;
    console.log('El sistema detecta que data.data es un array con longitud:', getData.length);
  } else {
    console.error('El sistema detecta estructura de datos no reconocida:', data);
    objTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error: Estructura de datos no reconocida</td></tr>';
    return;
  }

  // El sistema valida que existan datos para mostrar
  if (!getData || getData.length === 0) {
    console.warn('El sistema no encuentra usuarios para mostrar');
    objTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay usuarios disponibles</td></tr>';
    return;
  }

  console.log('El sistema procede a crear tabla con', getData.length, 'usuarios');

  // El sistema construye cada fila de la tabla en un array
  const rows = [];
  for (let i = 0; i < getData.length; i++) {
    const row = getData[i];
    console.log((i+1) + ': El sistema procesa el usuario numero', (i + 1), 'con datos:', row);

    // El sistema extrae los campos del usuario 
    const userId = row.user_id || row.id || 'N/A';
    const userName = row.username || 'Sin nombre';
    const roleName = row.role_name || 'N/A';
    const statusName = row.status_name || 'N/A';

    // El sistema genera el HTML de la fila
    const dataRow = `<tr>
      <td>${userId}</td>
      <td>${userName}</td>
      <td>${roleName}</td>
      <td>${statusName}</td>
      <td>
        <button type="button" title="Ver Usuario" class="btn btn-success btn-sm" onclick="showId(${userId})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Usuario" class="btn btn-primary btn-sm" onclick="edit(${userId})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Usuario" class="btn btn-danger btn-sm" onclick="delete_(${userId})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;

    rows.push(dataRow);
  }

  // El sistema inserta todas las filas en el tbody de la tabla
  objTableBody.innerHTML = rows.join('');
  console.log('El sistema ha insertado', rows.length, 'filas en el tbody de la tabla');
  console.log('El sistema verifica el HTML generado tiene longitud:', objTableBody.innerHTML.length, 'caracteres');
}

function createSelectStatus(data) {
  // El sistema limpia el select de estados
  objSelectStatus.innerHTML = "<option value='' selected disabled>Seleccione un estado</option>";

  console.log('createSelectStatus - Data recibida:', data);

  // El sistema extrae el array de datos
  let getData = data['data'];
  console.log('createSelectStatus - getData:', getData);

  // El sistema valida si getData existe y tiene elementos
  if (!getData || getData.length === 0) {
    console.warn('createSelectStatus - No hay datos de estados');
    return;
  }

  console.log('createSelectStatus - Procesando', getData.length, 'estados');

  // El sistema procesa cada estado
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('createSelectStatus - Estado', i + 1, ':', row);

    // El sistema extrae el ID y nombre del estado con fallbacks
    const statusId = row.status_id || row.id || '';
    const statusName = row.status_name || row.name || 'Sin nombre';

    console.log('createSelectStatus - Usando statusId:', statusId, 'statusName:', statusName);

    let dataRow = `<option value="${statusId}">${statusName}</option>`;
    objSelectStatus.innerHTML += dataRow;
  }

  console.log('createSelectStatus - Select completado');
}

function createSelectRole(data) {
  objSelectRole.innerHTML = "<option value='' selected disabled>Seleccione un rol</option>";

  let getData = data['data'];
  // Valida si getData existe y tiene elementos
  if (!getData || getData.length === 0) return;
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
  // El sistema prepara la peticion para obtener estados de usuario
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_STATUS + "/entity/user";

  console.log('getDataStatus - Llamando a URL:', endpointUrl);

  // El sistema obtiene el token de autenticacion del localStorage
  const token = localStorage.getItem(KEY_TOKEN);

  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  resultServices.then(response => {
    console.log('getDataStatus - Respuesta HTTP status:', response.status);
    return response.json();
  }).then(data => {
    console.log('getDataStatus - Datos recibidos del backend:', data);
    createSelectStatus(data);
  }).catch(error => {
    console.error('getDataStatus - Error:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}


function getDataRole() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_ROLE;

  // Obtiene el token de autenticación del localStorage
  const token = localStorage.getItem(KEY_TOKEN);

  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
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

/**
 * El sistema exporta la lista de usuarios a formato PDF
 * Realiza una petición al endpoint de exportación configurado en el backend
 */
function exportUsersToPDF() {
  // El sistema muestra el indicador de carga mientras genera el PDF
  toggleLoading(true);

  // El sistema obtiene el token de autenticación
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema construye la URL del endpoint de exportación a PDF
  const exportUrl = URL_EXPORT_USERS;

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
    a.download = `usuarios_${fecha}.pdf`;
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
 * El sistema exporta la lista de usuarios a formato Excel
 * Realiza una petición al endpoint de exportación configurado en el backend
 */
function exportUsersToExcel() {
  // El sistema muestra el indicador de carga mientras genera el Excel
  toggleLoading(true);

  // El sistema obtiene el token de autenticación
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema construye la URL del endpoint de exportación a Excel
  const exportUrl = URL_EXPORT_USERS_EXCEL;

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
    a.download = `usuarios_${fecha}.xlsx`;
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


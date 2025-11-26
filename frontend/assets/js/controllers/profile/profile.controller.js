// El sistema espera a que el DOM esté completamente cargado antes de inicializar el controlador
document.addEventListener('DOMContentLoaded', async () => {
  // El sistema oculta el body temporalmente mientras carga
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  // El sistema verifica la autenticación del usuario
  await checkAuth();
  console.log('Profile controller has been loaded');
  // El sistema muestra el body con un efecto de transición suave
  fadeInElement(document.querySelector('body'), 1000);
});

// El sistema inicializa los objetos principales del formulario de perfiles
const objForm = new Form('profileForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelect = document.getElementById('user_id');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar este perfil?";
const appTable = "#app-table";

// El sistema define las variables de control para las operaciones CRUD
let insertUpdate = true; // El sistema determina si la operación es inserción o actualización
let keyId; // El sistema almacena el ID del perfil para actualizaciones
let documentData = ""; // El sistema guarda los datos del formulario
let httpMethod = ""; // El sistema define el método HTTP a utilizar
let endpointUrl = ""; // El sistema construye la URL del endpoint

// El sistema maneja el evento de envío del formulario de perfiles
myForm.addEventListener('submit', (e) => {
  // El sistema previene el comportamiento por defecto del formulario
  e.preventDefault();

  // El sistema valida que todos los campos requeridos estén completos
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }

  // El sistema activa el indicador de carga
  toggleLoading(true);

  // El sistema determina si es una operación de creación o actualización
  if (insertUpdate) {
    console.log("Insertando nuevo perfil");
    httpMethod = METHODS[1]; // El sistema usa el método POST para crear
    endpointUrl = URL_PROFILE;
  } else {
    console.log("Actualizando perfil");
    httpMethod = METHODS[2]; // El sistema usa el método PUT para actualizar
    endpointUrl = URL_PROFILE + "/" + keyId;
  }

  // El sistema obtiene los datos del formulario
  documentData = objForm.getDataForm();
  console.log('Datos del formulario:', documentData);

  // El sistema envía los datos al servidor
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    // El sistema convierte la respuesta a JSON
    return response.json();
  }).then(data => {
    console.log('Respuesta del servidor:', data);
    // El sistema verifica si hubo errores en la respuesta
    if (data.error) {
      alert('Error: ' + data.error);
    } else {
      alert(data.message || 'Operación completada exitosamente');
    }
  }).catch(error => {
    // El sistema maneja errores de conexión o del servidor
    console.log('Error en la operación:', error);
    alert('Error en la operación. Por favor, inténtalo de nuevo.');
  }).finally(() => {
    // El sistema recarga la vista y cierra el modal
    loadView();
    showHiddenModal(false);
  });
});

/**
 * El sistema prepara el formulario para agregar un nuevo perfil
 * Muestra el modal con campos vacíos y botones habilitados
 */
function add() {
  showHiddenModal(true);
  insertUpdate = true; // El sistema marca la operación como inserción
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
}

/**
 * El sistema muestra los datos de un perfil en modo solo lectura
 * @param {number} id - El identificador del usuario cuyo perfil se mostrará
 */
function showId(id) {
  objForm.resetForm();
  objForm.disabledForm(); // El sistema deshabilita todos los campos
  objForm.disabledButton();
  objForm.hiddenButton();
  getDataId(id); // El sistema carga los datos del perfil
}

/**
 * El sistema prepara el formulario para editar un perfil existente
 * @param {number} id - El identificador del usuario cuyo perfil se editará
 */
function edit(id) {
  insertUpdate = false; // El sistema marca la operación como actualización
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
  keyId = id; // El sistema guarda el ID para la actualización
  getDataId(id); // El sistema carga los datos actuales del perfil
}

/**
 * El sistema elimina un perfil después de confirmar con el usuario
 * @param {number} id - El identificador del usuario cuyo perfil se eliminará
 */
function delete_(id) {
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();

  // El sistema solicita confirmación antes de eliminar
  if (confirm(textConfirm)) {
    documentData = "";
    httpMethod = METHODS[3]; // El sistema usa el método DELETE
    endpointUrl = URL_PROFILE + "/" + id;

    // El sistema envía la petición de eliminación al servidor
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta de eliminación:', data);
      // El sistema verifica si la eliminación fue exitosa
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Perfil eliminado exitosamente');
      }
    }).catch(error => {
      // El sistema maneja errores durante la eliminación
      console.log('Error al eliminar:', error);
      alert('Error al eliminar. Por favor, inténtalo de nuevo.');
    }).finally(() => {
      // El sistema recarga la tabla de perfiles
      loadView();
    });
  } else {
    console.log("Operación cancelada");
  }
}

/**
 * El sistema obtiene los datos de un perfil específico por su ID
 * @param {number} id - El identificador del usuario cuyo perfil se obtendrá
 */
function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // El sistema usa el método GET
  endpointUrl = URL_PROFILE + "/" + id;

  // El sistema solicita los datos del perfil al servidor
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos del perfil:', data);
    // El sistema verifica que los datos existan
    if (data.data) {
      let getData = data.data;
      // El sistema rellena el formulario con los datos obtenidos
      objForm.setDataFormJson(getData);
    } else {
      alert('Error: No se encontraron datos del perfil');
    }
  }).catch(error => {
    // El sistema maneja errores al obtener los datos
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos del perfil');
  }).finally(() => {
    // El sistema muestra el modal con los datos cargados
    showHiddenModal(true);
  });
}

/**
 * El sistema obtiene todos los perfiles desde el servidor
 * y los muestra en la tabla con DataTable
 */
function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // El sistema usa el método GET
  endpointUrl = URL_PROFILE;

  // El sistema solicita la lista completa de perfiles
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos recibidos del backend:', data);
    // El sistema construye la tabla con los datos recibidos
    createTable(data);

    // El sistema destruye la instancia anterior de DataTable si existe
    if ($.fn.DataTable.isDataTable(appTable)) {
      $(appTable).DataTable().destroy();
    }
    // El sistema inicializa DataTable con funcionalidades de búsqueda y paginación
    new DataTable(appTable);
  }).catch(error => {
    // El sistema maneja errores al cargar los datos
    console.log('Error al obtener datos:', error);
    alert('Error al cargar los datos de perfiles');
  }).finally(() => {
    // El sistema oculta el indicador de carga
    toggleLoading(false);
  });
}

/**
 * El sistema construye dinámicamente la tabla de perfiles con los datos recibidos
 * Mapea los campos del modelo del backend a las columnas de la tabla
 * @param {Object} data - Los datos de perfiles obtenidos del servidor
 */
function createTable(data) {
  // El sistema limpia el contenido anterior de la tabla
  objTableBody.innerHTML = "";
  let getData = data.data || [];
  console.log('Datos para crear tabla:', getData);

  // El sistema verifica si hay datos para mostrar
  if (getData.length === 0) {
    console.log('No hay datos para mostrar');
    objTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No hay perfiles disponibles</td></tr>';
    return;
  }

  // El sistema itera sobre cada perfil recibido
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Fila actual:', row);

    // El sistema construye cada fila con los campos del modelo Profile
    // user_id, full_name, phone, email, profile_photo, address
    let dataRow = `<tr>
      <td>${row.user_id || 'N/A'}</td>
      <td>${row.user_name || 'N/A'}</td>
      <td>${row.full_name || 'N/A'}</td>
      <td>${row.phone || 'N/A'}</td>
      <td>${row.email || 'N/A'}</td>
      <td>${row.address || 'N/A'}</td>
      <td>${row.role_name || 'N/A'}</td>
      <td>${row.status_name || 'N/A'}</td>
      <td>
        <button type="button" title="Ver Perfil" class="btn btn-success btn-sm" onclick="showId(${row.user_id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Perfil" class="btn btn-primary btn-sm" onclick="edit(${row.user_id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Perfil" class="btn btn-danger btn-sm" onclick="delete_(${row.user_id})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;
    // El sistema agrega la fila a la tabla
    objTableBody.innerHTML += dataRow;
  }
}

/**
 * El sistema llena el selector de usuarios con los datos obtenidos
 * @param {Object} data - Los datos de usuarios del servidor
 */
function createSelect(data) {
  objSelect.innerHTML = "<option value='' selected disabled>Selecciona un usuario</option>";

  let getData = data.data || [];
  // El sistema verifica si hay usuarios disponibles
  if (getData.length === 0) return;

  // El sistema crea una opción por cada usuario
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.user_id || row.id}">${row.user_name || row.username || 'Usuario ' + (row.user_id || row.id)}</option>`;
    objSelect.innerHTML += dataRow;
  }
}


/**
 * El sistema muestra u oculta el modal de perfil
 * @param {boolean} type - true para mostrar, false para ocultar
 */
function showHiddenModal(type) {
  if (type) {
    objModal.show();
  } else {
    objModal.hide();
  }
}

/**
 * El sistema recarga la vista de perfiles
 * Activa el indicador de carga y obtiene los datos actualizados
 */
function loadView() {
  getData();
  toggleLoading(true);
}

/**
 * El sistema obtiene la lista de usuarios para el selector del formulario
 */
function getDataUser() {
  documentData = "";
  httpMethod = METHODS[0]; // El sistema usa el método GET
  endpointUrl = URL_USER;

  // El sistema solicita la lista de usuarios al servidor
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de usuarios:', data);
    // El sistema llena el selector con los usuarios obtenidos
    createSelect(data);
  }).catch(error => {
    // El sistema maneja errores al obtener usuarios
    console.log('Error al obtener usuarios:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

// El sistema ejecuta las funciones de inicialización cuando la página termina de cargar
window.addEventListener('load', () => {
  loadView(); // El sistema carga la vista de perfiles
  getDataUser(); // El sistema obtiene los usuarios para el selector
});


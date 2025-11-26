// El sistema espera a que el DOM esté completamente cargado antes de inicializar el controlador
document.addEventListener('DOMContentLoaded', async () => {
  // El sistema oculta el body temporalmente mientras carga
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  // El sistema verifica la autenticación del usuario
  await checkAuth();
  console.log('Package controller has been loaded');
  // El sistema muestra el body con un efecto de transición suave
  fadeInElement(document.querySelector('body'), 1000);
});

// El sistema inicializa los objetos principales del formulario de paquetes
const objForm = new Form('packageForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectUser = document.getElementById('recipient_user_id');
const objSelectProperty = document.getElementById('property_id');
const objSelectStatus = document.getElementById('status_id');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar este paquete?";
const appTable = "#app-table";

// El sistema define las variables de control para las operaciones CRUD
let insertUpdate = true; // El sistema determina si la operación es inserción o actualización
let keyId; // El sistema almacena el ID del paquete para actualizaciones
let documentData = ""; // El sistema guarda los datos del formulario
let httpMethod = ""; // El sistema define el método HTTP a utilizar
let endpointUrl = ""; // El sistema construye la URL del endpoint

// El sistema maneja el evento de envío del formulario de paquetes
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
    console.log("Insertando nuevo paquete");
    httpMethod = METHODS[1]; // El sistema usa el método POST para crear
    endpointUrl = URL_PACKAGE;
  } else {
    console.log("Actualizando paquete");
    httpMethod = METHODS[2]; // El sistema usa el método PUT para actualizar
    endpointUrl = URL_PACKAGE + keyId;
  }

  // El sistema obtiene los datos del formulario
  const formData = objForm.getDataForm();
  // El sistema transforma los datos al formato esperado por el backend
  // Mapeo: package_description (frontend) -> description (backend)
  documentData = {
    description: formData.package_description,
    recipient_user_id: formData.recipient_user_id,
    property_id: formData.property_id,
    status_id: formData.status_id
  };

  console.log('Datos del formulario:', documentData);

  // El sistema envía los datos al servidor
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    // El sistema convierte la respuesta a JSON
    return response.json();
  }).then(data => {
    console.log('Respuesta del servidor:', data);
    // El sistema verifica si hubo errores en la respuesta
    if (data.error || data.errors) {
      const errorMsg = data.error || (data.errors ? data.errors.join(', ') : 'Error desconocido');
      alert('Error: ' + errorMsg);
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
 * El sistema prepara el formulario para agregar un nuevo paquete
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
 * El sistema muestra los datos de un paquete en modo solo lectura
 * @param {number} id - El identificador del paquete que se mostrará
 */
function showId(id) {
  objForm.resetForm();
  objForm.disabledForm(); // El sistema deshabilita todos los campos
  objForm.disabledButton();
  objForm.hiddenButton();
  getDataId(id); // El sistema carga los datos del paquete
}

/**
 * El sistema prepara el formulario para editar un paquete existente
 * @param {number} id - El identificador del paquete que se editará
 */
function edit(id) {
  insertUpdate = false; // El sistema marca la operación como actualización
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
  keyId = id; // El sistema guarda el ID para la actualización
  getDataId(id); // El sistema carga los datos actuales del paquete
}

/**
 * El sistema elimina un paquete después de confirmar con el usuario
 * @param {number} id - El identificador del paquete que se eliminará
 */
function delete_(id) {
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();

  // El sistema solicita confirmación antes de eliminar
  if (confirm(textConfirm)) {
    documentData = "";
    httpMethod = METHODS[3]; // El sistema usa el método DELETE
    endpointUrl = URL_PACKAGE + id;

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
        alert(data.message || 'Paquete eliminado exitosamente');
      }
    }).catch(error => {
      // El sistema maneja errores durante la eliminación
      console.log('Error al eliminar:', error);
      alert('Error al eliminar. Por favor, inténtalo de nuevo.');
    }).finally(() => {
      // El sistema recarga la tabla de paquetes
      loadView();
    });
  } else {
    console.log("Operación cancelada");
  }
}

/**
 * El sistema registra la salida y entrega de un paquete
 * Actualiza automáticamente el estado a "Entregado" y registra la fecha de salida
 * @param {number} id - El identificador del paquete que será marcado como entregado
 */
function registerExit(id) {
  // El sistema solicita confirmación antes de marcar como entregado
  if (confirm("¿Marcar este paquete como entregado?")) {
    toggleLoading(true);
    documentData = "";
    httpMethod = METHODS[2]; // El sistema usa el método PUT
    endpointUrl = URL_PACKAGE + id + '/exit';

    // El sistema envía la petición para registrar la salida
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta al registrar salida:', data);
      // El sistema verifica si el registro fue exitoso
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Paquete marcado como entregado exitosamente');
      }
    }).catch(error => {
      // El sistema maneja errores al registrar la salida
      console.log('Error al registrar salida:', error);
      alert('Error al registrar la salida del paquete');
    }).finally(() => {
      // El sistema recarga la tabla de paquetes
      loadView();
    });
  }
}

/**
 * El sistema obtiene los datos de un paquete específico por su ID
 * @param {number} id - El identificador del paquete que se obtendrá
 */
function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // El sistema usa el método GET
  endpointUrl = URL_PACKAGE + id;

  // El sistema solicita los datos del paquete al servidor
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos del paquete:', data);
    // El sistema verifica que los datos existan
    let getData = data.data || data;

    // El sistema transforma los datos del backend al formato del formulario
    // Mapeo: description (backend) -> package_description (frontend)
    const formData = {
      package_description: getData.description,
      recipient_user_id: getData.recipient_user_id,
      property_id: getData.property_id,
      status_id: getData.status_id
    };

    // El sistema rellena el formulario con los datos obtenidos
    objForm.setDataFormJson(formData);
  }).catch(error => {
    // El sistema maneja errores al obtener los datos
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos del paquete');
  }).finally(() => {
    // El sistema muestra el modal con los datos cargados
    showHiddenModal(true);
  });
}

/**
 * El sistema obtiene todos los paquetes desde el servidor
 * y los muestra en la tabla con DataTable
 */
function getData() {
  documentData = "";
  httpMethod = METHODS[0]; // El sistema usa el método GET
  endpointUrl = URL_PACKAGE;

  // El sistema solicita la lista completa de paquetes
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
    alert('Error al cargar los datos de paquetes');
  }).finally(() => {
    // El sistema oculta el indicador de carga
    toggleLoading(false);
  });
}

/**
 * El sistema construye dinámicamente la tabla de paquetes con los datos recibidos
 * Mapea los campos del modelo del backend a las columnas de la tabla
 * @param {Object|Array} data - Los datos de paquetes obtenidos del servidor
 */
function createTable(data) {
  // El sistema limpia el contenido anterior de la tabla
  objTableBody.innerHTML = "";

  // El sistema verifica si los datos vienen como array directo o dentro de data.data
  let getData = Array.isArray(data) ? data : (data.data || []);
  console.log('Datos para crear tabla:', getData);

  // El sistema verifica si hay datos para mostrar
  if (getData.length === 0) {
    console.log('No hay datos para mostrar');
    objTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay paquetes disponibles</td></tr>';
    return;
  }

  // El sistema itera sobre cada paquete recibido
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Fila actual:', row);

    // El sistema formatea las fechas de entrada y salida
    const entryDate = row.entry_at ? new Date(row.entry_at).toLocaleString('es-ES') : 'N/A';
    const exitDate = row.exit_at ? new Date(row.exit_at).toLocaleString('es-ES') : 'Pendiente';

    // El sistema determina si el paquete ha sido entregado
    const isDelivered = row.exit_at !== null && row.exit_at !== undefined;
    const statusClass = isDelivered ? 'text-success' : 'text-warning';

    // El sistema muestra el botón de registrar salida solo si no ha sido entregado
    const exitButton = !isDelivered ?
      `<button type="button" title="Registrar Salida" class="btn btn-info btn-sm" onclick="registerExit(${row.package_id})">
        <i class='fas fa-truck'></i>
      </button>` : '';

    // El sistema construye cada fila con los campos del modelo Package
    // package_id, description, recipient_user_id, property_id, status_id, entry_at, exit_at
    let dataRow = `<tr>
      <td>${row.package_id}</td>
      <td>${row.description || 'N/A'}</td>
      <td>${row.recipient_name || 'N/A'}</td>
      <td>${row.property_name || 'N/A'}</td>
      <td>
        <span class="${statusClass}">${row.status_name || 'N/A'}</span>
      </td>
      <td>${entryDate}</td>
      <td>${exitDate}</td>
      <td>
        <button type="button" title="Ver Paquete" class="btn btn-success btn-sm" onclick="showId(${row.package_id})">
          <i class='fas fa-eye'></i>
        </button>
        ${exitButton}
        <button type="button" title="Editar Paquete" class="btn btn-primary btn-sm" onclick="edit(${row.package_id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Paquete" class="btn btn-danger btn-sm" onclick="delete_(${row.package_id})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;
    // El sistema agrega la fila a la tabla
    objTableBody.innerHTML += dataRow;
  }
}

/**
 * El sistema llena el selector de usuarios destinatarios con los datos obtenidos
 * @param {Object} data - Los datos de usuarios del servidor
 */
function createSelectUser(data) {
  objSelectUser.innerHTML = "<option value='' selected disabled>Selecciona el destinatario</option>";

  let getData = data.data || [];
  // El sistema verifica si hay usuarios disponibles
  if (getData.length === 0) return;

  // El sistema crea una opción por cada usuario
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.user_id || row.id}">${row.user_name || row.username || 'Usuario ' + (row.user_id || row.id)}</option>`;
    objSelectUser.innerHTML += dataRow;
  }
}

/**
 * El sistema llena el selector de propiedades con los datos obtenidos
 * @param {Object} data - Los datos de propiedades del servidor
 */
function createSelectProperty(data) {
  objSelectProperty.innerHTML = "<option value='' selected disabled>Selecciona la propiedad</option>";

  let getData = data.data || [];
  // El sistema verifica si hay propiedades disponibles
  if (getData.length === 0) return;

  // El sistema crea una opción por cada propiedad
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.property_id || row.id}">${row.property_name || row.name || 'Propiedad ' + (row.property_id || row.id)}</option>`;
    objSelectProperty.innerHTML += dataRow;
  }
}

/**
 * El sistema llena el selector de estados con los datos obtenidos
 * Solo carga estados válidos para paquetes según el modelo del backend
 * @param {Object} data - Los datos de estados del servidor
 */
function createSelectStatus(data) {
  objSelectStatus.innerHTML = "<option value='' selected disabled>Selecciona el estado</option>";

  let getData = data.data || [];
  // El sistema verifica si hay estados disponibles
  if (getData.length === 0) return;

  // El sistema crea una opción por cada estado
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.status_id}">${row.status_name || row.name || 'Estado ' + row.status_id}</option>`;
    objSelectStatus.innerHTML += dataRow;
  }
}

/**
 * El sistema muestra u oculta el modal de paquete
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
 * El sistema recarga la vista de paquetes
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
    createSelectUser(data);
  }).catch(error => {
    // El sistema maneja errores al obtener usuarios
    console.log('Error al obtener usuarios:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * El sistema obtiene la lista de propiedades para el selector del formulario
 */
function getDataProperty() {
  documentData = "";
  httpMethod = METHODS[0]; // El sistema usa el método GET
  endpointUrl = URL_PROPERTY;

  // El sistema solicita la lista de propiedades al servidor
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de propiedades:', data);
    // El sistema llena el selector con las propiedades obtenidas
    createSelectProperty(data);
  }).catch(error => {
    // El sistema maneja errores al obtener propiedades
    console.log('Error al obtener propiedades:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

/**
 * El sistema obtiene los estados válidos para paquetes
 * Utiliza el endpoint que filtra estados por entidad (package)
 */
function getDataStatus() {
  documentData = "";
  httpMethod = METHODS[0]; // El sistema usa el método GET
  endpointUrl = URL_STATUS + "/entity/package";

  // El sistema solicita los estados válidos para paquetes al servidor
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de estados:', data);
    // El sistema llena el selector con los estados obtenidos
    createSelectStatus(data);
  }).catch(error => {
    // El sistema maneja errores al obtener estados
    console.log('Error al obtener estados:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

// El sistema ejecuta las funciones de inicialización cuando la página termina de cargar
window.addEventListener('load', () => {
  loadView(); // El sistema carga la vista de paquetes
  getDataUser(); // El sistema obtiene los usuarios para el selector
  getDataProperty(); // El sistema obtiene las propiedades para el selector
  getDataStatus(); // El sistema obtiene los estados para el selector
});

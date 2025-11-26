document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Reservation controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

// === Inicialización de variables y objetos ===
const objForm = new Form('reservationForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('reservationModal'));
const objTableBody = document.getElementById('reservation-table-body');
const appTable = "#reservation-table";
const textConfirm = "¿Estás seguro de que deseas eliminar esta reserva?";

const objSelectAmenity = document.getElementById('amenity_id');
const objSelectUser = document.getElementById('user_id');
const objSelectStatus = document.getElementById('status_id');

let insertUpdate = true;
let keyId;
let documentData = null;
let httpMethod = "";
let endpointUrl = "";

// === EVENTO SUBMIT DEL FORMULARIO ===
const myForm = objForm.getForm();

myForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }

  try {
    toggleLoading(true);

    if (insertUpdate) {
      console.log("Insertando nueva reserva");
      httpMethod = METHODS[1]; // POST
      endpointUrl = URL_RESERVATION;
    } else {
      console.log("Actualizando reserva");
      httpMethod = METHODS[2]; // PUT
      endpointUrl = URL_RESERVATION + '/' + keyId;
    }

    const rawData = objForm.getDataForm();
    console.log('Datos del formulario:', rawData);

    // El sistema mapea los campos del formulario a la estructura que espera el backend
    // Backend espera: amenity_id, start_time, end_time, capacity
    const payload = {};
    if (rawData && typeof rawData === 'object') {
      payload.amenity_id = rawData.amenity_id ? Number(rawData.amenity_id) : null;
      // El sistema mapea reservation_start_time a start_time que espera el backend
      payload.start_time = rawData.reservation_start_time || rawData.start_time || null;
      // El sistema mapea reservation_end_time a end_time que espera el backend
      payload.end_time = rawData.reservation_end_time || rawData.end_time || null;
      // El sistema mapea reservation_capacity a capacity que espera el backend
      payload.capacity = rawData.reservation_capacity || rawData.capacity ? Number(rawData.reservation_capacity || rawData.capacity) : null;
      // El backend obtiene user_id del token JWT, no del formulario
    }

    documentData = payload;

    // El sistema obtiene el token de autenticación
    const token = getAuthToken();
    const response = await getServicesAuth(documentData, httpMethod, endpointUrl, token);
    const data = await response.json();
    console.log('Respuesta del servidor:', data);

    if (data.error || !data.success) {
      alert('Error: ' + (data.error || data.message || 'Error desconocido'));
    } else {
      await loadView();
      alert(data.message || 'Operación completada exitosamente');
      showHiddenModal(false);
    }
  } catch (error) {
    console.log('Error en la operación:', error);
    alert('Error en la operación. Por favor, inténtalo de nuevo.');
  } finally {
    toggleLoading(false);
  }
});

// === FUNCIONES CRUD ===
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
    documentData = null;
    httpMethod = METHODS[3]; // DELETE
    endpointUrl = URL_RESERVATION + '/' + id;

    // El sistema obtiene el token de autenticación para la eliminación
    const token = getAuthToken();
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);
    resultServices.then(response => response.json())
      .then(async data => {
        console.log('Respuesta de eliminación:', data);
        if (data.error || !data.success) {
          alert('Error: ' + (data.error || data.message || 'Error desconocido'));
        } else {
          alert(data.message || 'Reserva eliminada exitosamente');
          await loadView();
        }
      })
      .catch(error => {
        console.log('Error al eliminar:', error);
        alert('Error al eliminar. Por favor, inténtalo de nuevo.');
      });
  } else {
    console.log("Operación cancelada");
  }
}

// === CONSULTA DE RESERVA POR ID ===
async function getDataId(id) {
  documentData = null;
  httpMethod = METHODS[0];
  endpointUrl = URL_RESERVATION + '/' + id;

  try {
    toggleLoading(true);

    // El sistema obtiene el token de autenticación para consultar la reserva
    const token = getAuthToken();
    const response = await getServicesAuth(documentData, httpMethod, endpointUrl, token);
    const data = await response.json();
    console.log('Datos de la reserva:', data);
    const r = data && data.data ? data.data : data;

    if (!r) {
      alert('No se encontraron datos de la reserva');
      return;
    }

    // Asegurarse de que los selects estén poblados antes de setear el valor
    try {
      await getDataAmenities();
    } catch (err) {
      console.warn('No se pudieron cargar amenities antes de setear el valor:', err);
    }
    try {
      await getDataUsers();
    } catch (err) {
      console.warn('No se pudieron cargar users antes de setear el valor:', err);
    }

    // El sistema mapea los campos del backend al formulario
    // Backend devuelve: start_time, end_time, capacity
    // Formulario usa: reservation_start_time, reservation_end_time, reservation_capacity
    const mapped = {
      reservation_id: r.reservation_id ?? r.id ?? null,
      amenity_id: r.amenity_id ?? null,
      user_id: r.user_id ?? null,
      reservation_start_time: r.start_time ?? r.reservation_start_time ?? '',
      reservation_end_time: r.end_time ?? r.reservation_end_time ?? '',
      reservation_capacity: r.capacity ?? r.reservation_capacity ?? '',
      status_id: r.status_id ?? 1
    };

    // Normalizar ligeramente datetimes para compatibilidad con datetime-local
    const normalizeDateTimeLocal = (val) => {
      if (!val) return '';
      try {
        // Eliminar Z y los segundos si están presentes: 2023-10-30T15:00:00Z -> 2023-10-30T15:00
        let v = val.toString();
        v = v.replace(/Z$/, '');
        const parts = v.split(':');
        if (parts.length >= 3) {
          return parts.slice(0,2).join(':');
        }
        return v;
      } catch (e) {
        return val;
      }
    };

    mapped.reservation_start_time = normalizeDateTimeLocal(mapped.reservation_start_time);
    mapped.reservation_end_time = normalizeDateTimeLocal(mapped.reservation_end_time);

    console.log('Mapped reservation to set in form:', mapped);
    // Log options available for selects (debug)
    try {
      console.log('Amenity options:', Array.from(objSelectAmenity.options).map(o => ({ value: o.value, text: o.text })));
      console.log('User options:', Array.from(objSelectUser.options).map(o => ({ value: o.value, text: o.text })));
    } catch (e) {
      console.warn('No se pudieron listar options de selects:', e);
    }

    objForm.setDataFormJson(mapped);

    // Verificar asignación después de setear
    try {
      console.log('After set - amenity value:', document.getElementById('amenity_id').value);
      console.log('After set - user value:', document.getElementById('user_id').value);
      console.log('After set - status value:', document.getElementById('status_id') ? document.getElementById('status_id').value : null);
    } catch (e) {
      console.warn('Error verificando valores después de setDataFormJson:', e);
    }

  } catch (error) {
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos de la reserva');
  } finally {
    showHiddenModal(true);
    toggleLoading(false);
  }
}

// === CONSULTA GENERAL DE RESERVAS ===
function getData() {
  documentData = null;
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_RESERVATION;

  // El sistema obtiene el token de autenticación para listar las reservas
  const token = getAuthToken();
  return getServicesAuth(documentData, httpMethod, endpointUrl, token)
    .then(response => response.json())
    .then(data => {
      console.log('Datos de reservas:', data);

      const list = Array.isArray(data) ? data : (data.data || []);

      if ($.fn && $.fn.DataTable && $.fn.DataTable.isDataTable && $.fn.DataTable.isDataTable(appTable)) {
        try {
          $(appTable).DataTable().clear().destroy();
        } catch (e) {
          try { $(appTable).DataTable().destroy(); } catch (ee) { console.warn('No se pudo destruir DataTable:', ee); }
        }
      }

      createTable(list);

      try {
        new DataTable(appTable);
      } catch (e) {
        console.warn('Error inicializando DataTable:', e);
      }
    })
    .catch(error => {
      console.log('Error al obtener datos:', error);
      alert('Error al cargar los datos de reservas');
    });
}

/**
 * El sistema formatea una fecha y hora en formato legible en español
 * Convierte fechas ISO (2024-11-17T14:30:00) a formato DD/MM/YYYY HH:MM
 * @param {string} dateTimeString - Cadena de fecha en formato ISO
 * @returns {string} - Fecha formateada en español o el valor original si no es válido
 */
function formatDateTime(dateTimeString) {
  // El sistema verifica que la fecha no esté vacía o sea un guion
  if (!dateTimeString || dateTimeString === '—') {
    return '—';
  }

  try {
    // El sistema crea un objeto Date a partir de la cadena recibida
    const date = new Date(dateTimeString);

    // El sistema verifica que la fecha sea válida
    if (isNaN(date.getTime())) {
      return dateTimeString;
    }

    // El sistema extrae los componentes de la fecha
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // El sistema retorna la fecha formateada en formato DD/MM/YYYY HH:MM
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    // El sistema retorna el valor original si ocurre un error
    console.error('Error al formatear fecha:', error);
    return dateTimeString;
  }
}

// === CREACIÓN DE TABLA ===
function createTable(data) {
  objTableBody.innerHTML = "";
  const getData = Array.isArray(data) ? data : (data.data || []);

  if (!getData || getData.length === 0) {
    objTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay reservas disponibles</td></tr>';
    return;
  }

  for (let i = 0; i < getData.length; i++) {
    const row = getData[i];
    const reservationId = row.reservation_id || row.id;
    const statusActive = row.status_name || row.status || 'N/A';
    const statusClass = (statusActive && statusActive.toLowerCase().includes('pendiente')) ? 'text-warning' :
                       (statusActive && (statusActive.toLowerCase().includes('confirmada') || statusActive.toLowerCase().includes('curso'))) ? 'text-success' : 'text-danger';

    const amenityDisplay = row.amenity_name || row.name || row.amenity || '—';
    const userDisplay = row.full_name || row.username || row.user_name || row.user || '—';

    // El sistema usa los nombres de campo del backend: start_time, end_time, capacity
    const startTimeRaw = row.start_time || row.reservation_start_time || '—';
    const endTimeRaw = row.end_time || row.reservation_end_time || '—';

    // El sistema formatea las fechas para mostrarlas en formato legible
    const startTime = formatDateTime(startTimeRaw);
    const endTime = formatDateTime(endTimeRaw);
    const capacityValue = row.capacity || row.reservation_capacity || '—';

    const dataRow = `
      <tr>
        <td>${reservationId}</td>
        <td>${amenityDisplay}</td>
        <td>${userDisplay}</td>
        <td><span class="${statusClass}">${statusActive}</span></td>
        <td>${startTime}</td>
        <td>${endTime}</td>
        <td>${capacityValue}</td>
        <td>
          <button type="button" title="Ver Reserva" class="btn btn-success btn-sm" onclick="showId(${reservationId})">
            <i class='fas fa-eye'></i>
          </button>
          <button type="button" title="Editar Reserva" class="btn btn-primary btn-sm" onclick="edit(${reservationId})">
            <i class='fas fa-edit'></i>
          </button>
          <button type="button" title="Eliminar Reserva" class="btn btn-danger btn-sm" onclick="delete_(${reservationId})">
            <i class='fas fa-trash'></i>
          </button>
        </td>
      </tr>`;
    objTableBody.innerHTML += dataRow;
  }
}

function createSelectAmenity(data) {
  objSelectAmenity.innerHTML = "<option value='' selected disabled>Seleccione una zona común</option>";
  const getData = Array.isArray(data) ? data : (data.data || []);
  getData.forEach(row => {
    const id = row.amenity_id || row.id;
    const name = row.amenity_name || row.name || row.amenity || 'Zona ' + id;
    objSelectAmenity.innerHTML += `<option value="${id}">${name}</option>`;
  });
}

function createSelectUser(data) {
  objSelectUser.innerHTML = "<option value='' selected disabled>Seleccione un usuario</option>";
  const getData = Array.isArray(data) ? data : (data.data || []);
  getData.forEach(row => {
    const id = row.user_id || row.id;
    const name = row.full_name || row.username || row.user_name || row.user || 'Usuario ' + id;
    objSelectUser.innerHTML += `<option value="${id}">${name}</option>`;
  });
}

function addReservation() {
  try {
    if (typeof add === 'function') return add();
    showHiddenModal(true);
  } catch (err) {
    console.error('Error calling addReservation wrapper:', err);
  }
}

// === MODAL ===
function showHiddenModal(type) {
  if (type) objModal.show();
  else objModal.hide();
}

// === CARGA DE DATOS ===
async function loadView() {
  toggleLoading(true);
  await getData();
  toggleLoading(false);
}

function getDataAmenities() {
  documentData = null;
  httpMethod = METHODS[0];
  endpointUrl = URL_AMENITY;
  // El sistema obtiene el token de autenticación para cargar zonas comunes
  const token = getAuthToken();
  // Retornamos la promesa para poder esperar a que los selects estén poblados
  return getServicesAuth(documentData, httpMethod, endpointUrl, token)
    .then(response => response.json())
    .then(data => {
      console.log('Datos de zonas comunes:', data);
      createSelectAmenity(data);
      return data;
    })
    .catch(error => {
      console.log('Error al obtener zonas comunes:', error);
      throw error;
    })
    .finally(() => toggleLoading(false));
}

function getDataUsers() {
  documentData = null;
  httpMethod = METHODS[0];
  endpointUrl = URL_USER;
  // El sistema obtiene el token de autenticación para cargar usuarios
  const token = getAuthToken();
  // Retornamos la promesa para poder esperar a que los selects estén poblados
  return getServicesAuth(documentData, httpMethod, endpointUrl, token)
    .then(response => response.json())
    .then(data => {
      console.log('Datos de usuarios:', data);
      createSelectUser(data);
      return data;
    })
    .catch(error => {
      console.log('Error al obtener usuarios:', error);
      throw error;
    })
    .finally(() => toggleLoading(false));
}

/**
 * El sistema exporta la lista de reservas a formato PDF
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportReservationsToPDF() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a PDF
  const exportUrl = URL_EXPORT_RESERVATIONS;

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
    a.download = `reservas_${fecha}.pdf`;

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
 * El sistema exporta la lista de reservas a formato Excel
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportReservationsToExcel() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a Excel
  const exportUrl = URL_EXPORT_RESERVATIONS_EXCEL;

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
    a.download = `reservas_${fecha}.xlsx`;

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

/**
 * El sistema crea las opciones del select de estados
 * Recibe los estados del backend y los renderiza en el select
 *
 * @param {Object} data - Objeto con los estados desde el backend
 */
function createSelectStatus(data) {
  // El sistema limpia el select antes de agregar nuevas opciones
  objSelectStatus.innerHTML = "<option value='' selected disabled>Seleccione un estado</option>";

  // El sistema extrae el array de estados de la respuesta
  const getData = Array.isArray(data) ? data : (data.data || []);

  // El sistema itera sobre cada estado y crea una opción
  getData.forEach(row => {
    const id = row.status_id || row.id;
    const name = row.status_name || row.name || 'Estado ' + id;
    objSelectStatus.innerHTML += `<option value="${id}">${name}</option>`;
  });

  console.log('Estados cargados para reservas:', getData.length);
}

/**
 * El sistema obtiene los estados desde el backend filtrados por entidad reservation
 * Solo carga estados que aplican a reservas de zonas comunes
 */
function getDataStatus() {
  // El sistema muestra el indicador de carga
  toggleLoading(true);

  // El sistema define el método y endpoint para obtener estados
  documentData = null;
  httpMethod = METHODS[0]; // GET
  // El sistema agrega el parámetro entity=reservation para filtrar por entidad
  endpointUrl = URL_STATUS + '?entity=reservation';

  // El sistema obtiene el token de autenticación
  const token = getAuthToken();

  // El sistema realiza la petición al backend para obtener estados filtrados
  getServicesAuth(documentData, httpMethod, endpointUrl, token)
    .then(response => response.json())
    .then(data => {
      console.log('Estados de reservation recibidos:', data);
      // El sistema crea las opciones del select con los estados recibidos
      createSelectStatus(data);
    })
    .catch(error => {
      console.error('Error al obtener estados de reservation:', error);
      // El sistema muestra un mensaje de error si falla la carga
      alert('Error al cargar los estados. Por favor, recarga la página.');
    })
    .finally(() => {
      // El sistema oculta el indicador de carga
      toggleLoading(false);
    });
}

// === EVENTO LOAD ===
window.addEventListener('load', () => {
  loadView();
  getDataAmenities();
  getDataUsers();
  getDataStatus();
});

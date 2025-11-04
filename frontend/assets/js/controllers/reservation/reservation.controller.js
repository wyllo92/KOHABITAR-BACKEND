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

let insertUpdate = true;
let keyId;
let documentData = "";
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
      endpointUrl = URL_RESERVATION + keyId;
    }

    const rawData = objForm.getDataForm();
    console.log('Datos del formulario:', rawData);

    // Mapeo del formulario al payload esperado por el backend
    const payload = {};
    if (rawData && typeof rawData === 'object') {
      payload.amenity_id = rawData.amenity_id ? Number(rawData.amenity_id) : null;
      payload.user_id = rawData.user_id ? Number(rawData.user_id) : null;
      payload.reservation_start_time = rawData.reservation_start_time ?? null;
      payload.reservation_end_time = rawData.reservation_end_time ?? null;
      payload.reservation_capacity = rawData.reservation_capacity ? Number(rawData.reservation_capacity) : null;
      payload.status_id = rawData.status_id ? Number(rawData.status_id) : 1; // Activo por defecto
    }

    documentData = payload;

    const response = await getDataServices(documentData, httpMethod, endpointUrl);
    const data = await response.json();
    console.log('Respuesta del servidor:', data);

    if (data.error) {
      alert('Error: ' + data.error);
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
    documentData = "";
    httpMethod = METHODS[3]; // DELETE
    endpointUrl = URL_RESERVATION + id;

    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => response.json())
      .then(async data => {
        console.log('Respuesta de eliminación:', data);
        if (data.error) {
          alert('Error: ' + data.error);
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
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_RESERVATION + id;

  try {
    toggleLoading(true);

    const response = await getDataServices(documentData, httpMethod, endpointUrl);
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

    const mapped = {
      reservation_id: r.reservation_id ?? r.id ?? null,
      amenity_id: r.amenity_id ?? null,
      user_id: r.user_id ?? null,
      reservation_start_time: r.reservation_start_time ?? r.reservation_start ?? '',
      reservation_end_time: r.reservation_end_time ?? r.reservation_end ?? '',
      reservation_capacity: r.reservation_capacity ?? r.capacity ?? '',
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
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_RESERVATION;

  return getDataServices(documentData, httpMethod, endpointUrl)
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
    const statusClass = (statusActive && statusActive.toLowerCase().includes('act')) ? 'text-success' : 'text-danger';

    const amenityDisplay = row.amenity_name || row.name || row.amenity || '—';
    const userDisplay = row.user_name || row.full_name || row.username || row.user || '—';

    const dataRow = `
      <tr>
        <td>${reservationId}</td>
        <td>${amenityDisplay}</td>
        <td>${userDisplay}</td>
        <td><span class="${statusClass}">${statusActive}</span></td>
        <td>${row.reservation_start_time || '—'}</td>
        <td>${row.reservation_end_time || '—'}</td>
        <td>${row.reservation_capacity || '—'}</td>
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
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_AMENITY;
  // Retornamos la promesa para poder esperar a que los selects estén poblados
  return getDataServices(documentData, httpMethod, endpointUrl)
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
  documentData = "";
  httpMethod = METHODS[0];
  endpointUrl = URL_USER;
  // Retornamos la promesa para poder esperar a que los selects estén poblados
  return getDataServices(documentData, httpMethod, endpointUrl)
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

// === EVENTO LOAD ===
window.addEventListener('load', () => {
  loadView();
  getDataAmenities();
  getDataUsers();
});

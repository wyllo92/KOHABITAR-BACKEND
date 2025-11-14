document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Amenity controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);

  await initApp(); // 🔥 Inicia todo
});

const objForm = new Form('amenityForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectAmenityType = document.getElementById('amenity_type_id');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar esta amenidad?";
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";
let dataTableInstance = null; // Guardaremos la instancia de DataTable aquí

// --- FUNCIÓN PRINCIPAL DE INICIO ---
async function initApp() {
  toggleLoading(true);
  await getDataAmenityType();
  await refreshTable();
  toggleLoading(false);
}

// --- FUNCIÓN PARA REFRESCAR TABLA SIN RECARGAR PÁGINA ---
async function refreshTable() {
  try {
    const response = await getDataServices("", METHODS[0], URL_AMENITY);
    const data = await response.json();

    // 🔹 Destruye DataTable antes de recrear
    if (dataTableInstance) {
      dataTableInstance.destroy();
      dataTableInstance = null;
    }

    // 🔹 Crea nuevamente el contenido de la tabla
    createTable(data);

    // 🔹 Reinicia DataTable limpio
    dataTableInstance = new DataTable(appTable, {
      language: {
        url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
      }
    });
  } catch (error) {
    console.error('Error al refrescar tabla:', error);
  }
}

myForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }

  toggleLoading(true);

  if (insertUpdate) {
    console.log("Insertando nueva amenidad");
    httpMethod = METHODS[1]; // POST
    endpointUrl = URL_AMENITY;
  } else {
    console.log("Actualizando amenidad");
    httpMethod = METHODS[2]; // PUT
    endpointUrl = URL_AMENITY + keyId;
  }

  documentData = objForm.getDataForm();
  console.log('Datos del formulario:', documentData);

  try {
    const response = await getDataServices(documentData, httpMethod, endpointUrl);
    const data = await response.json();

    if (data.error) {
      alert('Error: ' + data.error);
    } else {
      alert(data.message || 'Operación completada exitosamente');
      showHiddenModal(false);

      // 🔥 Refresca inmediatamente los datos
      await refreshTable();
    }
  } catch (error) {
    console.log('Error en la operación:', error);
    alert('Error en la operación. Por favor, inténtalo de nuevo.');
  } finally {
    toggleLoading(false);
  }
});

function add() {
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
  showHiddenModal(true);
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

async function delete_(id) {
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();

  if (!confirm(textConfirm)) {
    console.log("Operación cancelada");
    return;
  }

  toggleLoading(true);

  try {
    documentData = "";
    httpMethod = METHODS[3]; // DELETE
    endpointUrl = URL_AMENITY + id;

    const response = await getDataServices(documentData, httpMethod, endpointUrl);
    const data = await response.json();

    if (data.error) {
      alert('Error: ' + data.error);
    } else {
      alert(data.message || 'Amenidad eliminada exitosamente');

      // 🔥 Refresca inmediatamente los datos
      await refreshTable();
    }
  } catch (error) {
    console.log('Error al eliminar:', error);
    alert('Error al eliminar. Por favor, inténtalo de nuevo.');
  } finally {
    toggleLoading(false);
  }
}

async function getDataId(id) {
  toggleLoading(true);
  documentData = "";
  httpMethod = METHODS[0]; // GET
  endpointUrl = URL_AMENITY + id;

  try {
    const response = await getDataServices(documentData, httpMethod, endpointUrl);
    const data = await response.json();

    if (data.data) {
      objForm.setDataFormJson(data.data);
    } else {
      alert('Error: No se encontraron datos de la amenidad');
    }
  } catch (error) {
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos de la amenidad');
  } finally {
    toggleLoading(false);
    showHiddenModal(true);
  }
}

// --- CREA TABLA HTML ---
function createTable(data) {
  objTableBody.innerHTML = "";
  const getData = data.data || [];

  if (getData.length === 0) {
    objTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay amenidades disponibles</td></tr>';
    return;
  }

  getData.forEach(row => {
    const statusActive = row.status_name || 'N/A';
    const statusClass = row.status_name === 'Activo' ? 'text-success' : 'text-danger';
    const amenityId = row.amenity_id || '';
    const amenityName = row.name || 'N/A';
    const amenityTypeLabel = row.amenity_type_name || 'N/A';
    const capacity = row.capacity || 'N/A';

    objTableBody.innerHTML += `
      <tr>
        <td>${amenityId}</td>
        <td>${amenityName}</td>
        <td>${amenityTypeLabel}</td>
        <td>${capacity}</td>
        <td><span class="${statusClass}">${statusActive}</span></td>
        <td>
          <button type="button" title="Ver Amenidad" class="btn btn-success btn-sm" onclick="showId(${amenityId})">
            <i class='fas fa-eye'></i>
          </button>
          <button type="button" title="Editar Amenidad" class="btn btn-primary btn-sm" onclick="edit(${amenityId})">
            <i class='fas fa-edit'></i>
          </button>
          <button type="button" title="Eliminar Amenidad" class="btn btn-danger btn-sm" onclick="delete_(${amenityId})">
            <i class='fas fa-trash'></i>
          </button>
        </td>
      </tr>`;
  });
}

// --- CARGA SELECT DE TIPOS ---
async function getDataAmenityType() {
  try {
    const response = await getDataServices("", METHODS[0], URL_AMENITY_TYPE + 'active');
    const data = await response.json();
    createSelectAmenityType(data);
  } catch (err) {
    console.error('Error al obtener tipos de amenidad:', err);
  }
}

function createSelectAmenityType(data) {
  objSelectAmenityType.innerHTML = "<option value='' selected disabled>Selecciona el tipo</option>";
  const getData = (data && data.data) || [];
  getData.forEach(row => {
    const optionValue = row.amenity_type_id || row.Amenity_Type_id;
    const optionLabel = row.amenity_type_name || row.Amenity_Type_name || ('Tipo ' + (optionValue || ''));
    objSelectAmenityType.innerHTML += `<option value="${optionValue}">${optionLabel}</option>`;
  });
}

// --- MOSTRAR U OCULTAR MODAL ---
function showHiddenModal(type) {
  if (type) objModal.show();
  else objModal.hide();
}

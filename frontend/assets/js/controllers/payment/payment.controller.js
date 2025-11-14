document.addEventListener('DOMContentLoaded', async ()=> {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
 
  await checkAuth();
  console.log('payment controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

const objForm = new Form('paymentForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectUser = document.getElementById('user_id');
const objFileInput = document.getElementById('payment_photo');
const objFilePreview = document.getElementById('photo-preview');
const myForm = objForm.getForm();
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let httpMethod = "";
let endpointUrl = "";
let currentPhotoPath = null; // Guardar la ruta de la foto actual

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) return;
  toggleLoading(true);
  
  if (insertUpdate) {
    httpMethod = METHODS[1]; // POST
    endpointUrl = URL_PAYMENT;
  } else {
    httpMethod = METHODS[2]; // PUT
    endpointUrl = URL_PAYMENT + keyId;
  }
  
  // Crear FormData para enviar archivos
  const formData = new FormData();
  const documentData = objForm.getDataForm();
  
  // Validación adicional en el frontend
  if (!documentData.user_id || !documentData.amount_paid || !documentData.payment_date) {
    alert('Los campos user_id, amount_paid y payment_date son requeridos');
    toggleLoading(false);
    return;
  }
  
  if (documentData.amount_paid <= 0) {
    alert('El monto debe ser mayor a 0');
    toggleLoading(false);
    return;
  }

  // Agregar todos los campos al FormData
  Object.keys(documentData).forEach(key => {
    if (documentData[key] !== null && documentData[key] !== undefined) {
      formData.append(key, documentData[key]);
    }
  });

  // Agregar la foto si existe
  if (objFileInput && objFileInput.files[0]) {
    formData.append('payment_photo', objFileInput.files[0]);
  }

  const result = getDataServicesWithFile(formData, httpMethod, endpointUrl);
  result.then(r => r.json()).then(d => {
    if (d.error) {
      alert('Error: ' + d.error);
    } else {
      alert(d.message || 'Operación exitosa');
      if (d.payment_photo) {
        console.log('Foto guardada en:', d.payment_photo);
      }
    }
  }).catch(err => {
    console.error(err);
    alert('Error de conexión con el servidor');
  }).finally(() => {
    loadView();
    showHiddenModal(false);
    resetFilePreview();
  });
});

function add() {
  insertUpdate = true;
  keyId = null;
  currentPhotoPath = null;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
  resetFilePreview();
  // Asegurar que los usuarios estén cargados antes de mostrar el modal
  getDataSelects();
  showHiddenModal(true);
}

function edit(id) {
  insertUpdate = false;
  keyId = id;
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
  resetFilePreview();
  getDataId(id);
}

function delete_(id) {
  if (!confirm('¿Confirmar eliminación del pago?')) return;
  toggleLoading(true);
  
  const result = getDataServices('', METHODS[3], URL_PAYMENT + id);
  result.then(r => r.json()).then(d => {
    if (d.error) {
      alert('Error: ' + d.error);
    } else {
      alert(d.message || 'Pago eliminado exitosamente');
    }
  }).catch(err => {
    console.error(err);
    alert('Error al eliminar');
  }).finally(() => {
    loadView();
  });
}

function getDataId(id) {
  toggleLoading(true);
  getDataServices('', METHODS[0], URL_PAYMENT + id).then(r => r.json()).then(d => {
    if (d.error) {
      alert('Error: ' + d.error);
    } else if (d.data) {
      objForm.setDataFormJson(d.data);
      currentPhotoPath = d.data.payment_photo;
      // Mostrar la foto actual si existe
      if (d.data.payment_photo) {
        showCurrentPhoto(d.data.payment_photo);
      }
    }
  }).catch(err => {
    console.error(err);
    alert('Error al cargar los datos');
  }).finally(() => {
    toggleLoading(false);
    showHiddenModal(true);
  });
}

function createTable(data) {
  objTableBody.innerHTML = '';
  const rows = data.data || [];
  
  if (rows.length === 0) {
    objTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay pagos registrados</td></tr>';
    return;
  }
  
  rows.forEach(row => {
    // Formatear fecha para mejor visualización
    const formattedDate = row.payment_date ? new Date(row.payment_date).toLocaleDateString() : '';
    
    // Icono para indicar si tiene foto
    const photoIcon = row.payment_photo 
      ? '<i class="fas fa-image text-success" title="Tiene foto"></i>' 
      : '<i class="fas fa-image text-muted" title="Sin foto"></i>';
    
    const tr = `<tr>
      <td>${row.payment_id}</td>
      <td>${row.user_name || row.user_id}</td>
      <td>$${parseFloat(row.amount_paid).toFixed(2)}</td>
      <td>${formattedDate}</td>
      <td>${photoIcon}</td>
      <td>${row.method || 'N/A'}</td>
      <td>${row.reference || 'N/A'}</td>
      <td>
        <button class="btn btn-success btn-sm" onclick="showId(${row.payment_id})" title="Ver">
          <i class='fas fa-eye'></i>
        </button>
        ${row.payment_photo ? `
        <button class="btn btn-info btn-sm" onclick="viewPhoto('${row.payment_photo}')" title="Ver foto">
          <i class='fas fa-camera'></i>
        </button>` : ''}
        <button class="btn btn-primary btn-sm" onclick="edit(${row.payment_id})" title="Editar">
          <i class='fas fa-edit'></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="delete_(${row.payment_id})" title="Eliminar">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;
    objTableBody.innerHTML += tr;
  });
}

function getData() {
  toggleLoading(true);
  getDataServices('', METHODS[0], URL_PAYMENT).then(r => r.json()).then(d => {
    if (d.error) {
      console.error('Error al obtener pagos:', d.error);
      alert('Error al cargar los pagos');
    } else {
      createTable(d);
    }
  }).catch(err => {
    console.error('Error de conexión:', err);
    alert('Error de conexión al cargar los pagos');
  }).finally(() => {
    // Inicializar DataTable si existe
    if ($.fn.DataTable) {
      if ($.fn.DataTable.isDataTable(appTable)) {
        $(appTable).DataTable().destroy();
      }
      new DataTable(appTable);
    }
    toggleLoading(false);
  });
}

function showHiddenModal(type) {
  if (type) objModal.show(); 
  else objModal.hide();
}

function getDataSelects() {
  // Cargar usuarios para el select
  getDataServices('', METHODS[0], URL_USER).then(r => r.json()).then(d => {
    if (d.data && Array.isArray(d.data)) {
      objSelectUser.innerHTML = '<option value="" selected disabled>Seleccione un usuario</option>';
      d.data.forEach(u => {
        const userName = u.user_name || u.email || `Usuario ${u.user_id}`;
        objSelectUser.innerHTML += `<option value="${u.user_id}">${userName}</option>`;
      });
    } else {
      console.warn('No se encontraron usuarios o formato de respuesta incorrecto:', d);
      objSelectUser.innerHTML = '<option value="" selected disabled>No hay usuarios disponibles</option>';
    }
  }).catch(err => {
    console.error('Error al cargar usuarios:', err);
    objSelectUser.innerHTML = '<option value="" selected disabled>Error al cargar usuarios</option>';
  });
}

function loadView() {
  getData();
  getDataSelects();
}

// === FUNCIONES PARA MANEJO DE FOTOS ===

// Preview de la foto cuando se selecciona
if (objFileInput) {
  objFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      previewPhoto(file);
    }
  });
}

function previewPhoto(file) {
  if (!objFilePreview) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    objFilePreview.innerHTML = `
      <div class="text-center">
        <img src="${e.target.result}" class="img-fluid" style="max-height: 200px;" alt="Preview">
        <p class="mt-2 text-muted small">${file.name}</p>
      </div>
    `;
    objFilePreview.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

function showCurrentPhoto(photoPath) {
  if (!objFilePreview) return;
  
  objFilePreview.innerHTML = `
    <div class="text-center">
      <p class="text-muted small">Foto actual:</p>
      <img src="${photoPath}" class="img-fluid" style="max-height: 200px;" alt="Foto actual">
      <p class="mt-2 text-muted small">Selecciona una nueva foto para reemplazarla</p>
    </div>
  `;
  objFilePreview.style.display = 'block';
}

function resetFilePreview() {
  if (objFilePreview) {
    objFilePreview.innerHTML = '';
    objFilePreview.style.display = 'none';
  }
  if (objFileInput) {
    objFileInput.value = '';
  }
  currentPhotoPath = null;
}

function viewPhoto(photoPath) {
  // Crear modal para ver la foto en grande
  const photoModal = `
    <div class="modal fade" id="photoModal" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Comprobante de Pago</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center">
            <img src="${photoPath}" class="img-fluid" alt="Comprobante de pago">
          </div>
          <div class="modal-footer">
            <a href="${photoPath}" download class="btn btn-primary">
              <i class="fas fa-download"></i> Descargar
            </a>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remover modal anterior si existe
  const existingModal = document.getElementById('photoModal');
  if (existingModal) existingModal.remove();
  
  // Agregar modal al body
  document.body.insertAdjacentHTML('beforeend', photoModal);
  
  // Mostrar modal
  const modal = new bootstrap.Modal(document.getElementById('photoModal'));
  modal.show();
  
  // Limpiar cuando se cierre
  document.getElementById('photoModal').addEventListener('hidden.bs.modal', function() {
    this.remove();
  });
}

// === FUNCIÓN PARA ENVIAR ARCHIVOS ===
function getDataServicesWithFile(formData, method, url) {
  return fetch(url, {
    method: method,
    headers: {
      // NO incluir Content-Type para que el navegador lo establezca automáticamente con boundary
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    },
    body: formData
  });
}

// Cargar la vista cuando la ventana termine de cargar
window.addEventListener('load', () => { 
  loadView(); 
});

// Exponer funciones para los botones de la tabla
window.showId = function (id) {
  objForm.resetForm();
  objForm.disabledForm();
  objForm.disabledButton();
  objForm.hiddenButton();
  resetFilePreview();
  getDataId(id);
}

window.delete_ = delete_;
window.edit = edit;
window.add = add;
window.viewPhoto = viewPhoto;
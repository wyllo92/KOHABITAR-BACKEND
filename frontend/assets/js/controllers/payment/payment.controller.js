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
const myForm = objForm.getForm();
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
    endpointUrl = URL_PAYMENT;
  } else {
    httpMethod = METHODS[2]; // PUT
    endpointUrl = URL_PAYMENT + keyId;
  }
  
  documentData = objForm.getDataForm();
  
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

  const result = getDataServices(documentData, httpMethod, endpointUrl);
  result.then(r => r.json()).then(d => {
    if (d.error) {
      alert('Error: ' + d.error);
    } else {
      alert(d.message || 'Operación exitosa');
    }
  }).catch(err => {
    console.error(err);
    alert('Error de conexión con el servidor');
  }).finally(() => {
    loadView();
    showHiddenModal(false);
  });
});

function add() {
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
  showHiddenModal(true);
}

function edit(id) {
  insertUpdate = false;
  keyId = id;
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
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
    objTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay pagos registrados</td></tr>';
    return;
  }
  
  rows.forEach(row => {
    // Formatear fecha para mejor visualización
    const formattedDate = row.payment_date ? new Date(row.payment_date).toLocaleDateString() : '';
    
    const tr = `<tr>
      <td>${row.payment_id}</td>
      <td>${row.user_name || row.user_id}</td>
      <td>$${parseFloat(row.amount_paid).toFixed(2)}</td>
      <td>${formattedDate}</td>
      <td>${row.method || 'N/A'}</td>
      <td>${row.reference || 'N/A'}</td>
      <td>
        <button class="btn btn-success btn-sm" onclick="showId(${row.payment_id})" title="Ver">
          <i class='fas fa-eye'></i>
        </button>
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
  getDataServices('', METHODS[0], URL_PROFILE).then(r => r.json()).then(d => {
    if (d.data) {
      objSelectUser.innerHTML = '<option value="">Seleccione un usuario</option>';
      d.data.forEach(u => {
        objSelectUser.innerHTML += `<option value="${u.user_id}">${u.user_name || u.email || u.user_id}</option>`;
      });
    }
  }).catch(err => {
    console.error('Error al cargar usuarios:', err);
  });
}

function loadView() {
  getData();
  getDataSelects();
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
  getDataId(id);
}

window.delete_ = delete_;
window.edit = edit;
window.add = add;
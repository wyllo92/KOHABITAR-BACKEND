// Controlador de visitantes para frontend

document.addEventListener('DOMContentLoaded', () => {
  loadVisitors();
});

const visitorModal = new bootstrap.Modal(document.getElementById('visitorModal'));
const visitorTableBody = document.getElementById('visitor-table-body');
const visitorForm = document.getElementById('visitorForm');
let editingVisitorId = null;
const API_VISITOR = 'http://localhost:3000/api_v1/visitor';

function loadVisitors() {
  toggleLoading(true);
  fetch(API_VISITOR)
    .then(res => res.json())
    .then(data => {
      createVisitorTable(data.data || []);
      if ($.fn.DataTable.isDataTable('#visitor-table')) {
        $('#visitor-table').DataTable().destroy();
      }
      new DataTable('#visitor-table');
    })
    .catch(() => {
      visitorTableBody.innerHTML = '<tr><td colspan="12" class="text-center">Error al cargar visitantes</td></tr>';
    })
    .finally(() => toggleLoading(false));
}

function createVisitorTable(visitors) {
  visitorTableBody.innerHTML = '';
  if (!visitors.length) {
    visitorTableBody.innerHTML = '<tr><td colspan="12" class="text-center">No hay visitantes registrados</td></tr>';
    return;
  }
  visitors.forEach(visitor => {
    visitorTableBody.innerHTML += `
      <tr>
        <td>${visitor.Visitor_id}</td>
        <td>${visitor.Visitor_full_name}</td>
        <td>${visitor.Visitor_id_document}</td>
        <td>${visitor.Visitor_visit_reason}</td>
        <td>${formatDate(visitor.Visitor_entry_time)}</td>
        <td>${formatDate(visitor.Visitor_exit_time)}</td>
        <td>${visitor.Visitor_authorized_by}</td>
        <td>${visitor.property_name || visitor.Property_id}</td>
        <td>${visitor.status_name || visitor.Status_id}</td>
        <td>${visitor.vehicle_model || visitor.Vehicle_id || ''}</td>
        <td>${visitor.parking_slot_code || visitor.parkingSlot_id || ''}</td>
        <td>
          <button class="btn btn-success btn-sm" onclick="showVisitor(${visitor.Visitor_id})"><i class="fas fa-eye"></i></button>
          <button class="btn btn-primary btn-sm" onclick="editVisitor(${visitor.Visitor_id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteVisitor(${visitor.Visitor_id})"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
  });
}

function addVisitor() {
  editingVisitorId = null;
  visitorForm.reset();
  visitorModal.show();
}

function showVisitor(id) {
  fetch(`${API_VISITOR}/${id}`)
    .then(res => res.json())
    .then(data => {
      if (data.data) {
        fillVisitorForm(data.data, true);
        visitorModal.show();
      }
    });
}

function editVisitor(id) {
  editingVisitorId = id;
  fetch(`${API_VISITOR}/${id}`)
    .then(res => res.json())
    .then(data => {
      if (data.data) {
        fillVisitorForm(data.data, false);
        visitorModal.show();
      }
    });
}

function fillVisitorForm(visitor, disabled) {
  visitorForm.Visitor_full_name.value = visitor.Visitor_full_name || '';
  visitorForm.Visitor_id_document.value = visitor.Visitor_id_document || '';
  visitorForm.Visitor_visit_reason.value = visitor.Visitor_visit_reason || '';
  visitorForm.Visitor_entry_time.value = visitor.Visitor_entry_time ? visitor.Visitor_entry_time.slice(0,16) : '';
  visitorForm.Visitor_exit_time.value = visitor.Visitor_exit_time ? visitor.Visitor_exit_time.slice(0,16) : '';
  visitorForm.Visitor_authorized_by.value = visitor.Visitor_authorized_by || '';
  visitorForm.Property_id.value = visitor.Property_id || '';
  visitorForm.Status_id.value = visitor.Status_id || '';
  visitorForm.Vehicle_id.value = visitor.Vehicle_id || '';
  visitorForm.parkingSlot_id.value = visitor.parkingSlot_id || '';
  Array.from(visitorForm.elements).forEach(el => el.disabled = disabled);
}

visitorForm.onsubmit = function(e) {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(visitorForm));
  if (!formData.Visitor_full_name || !formData.Visitor_id_document || !formData.Visitor_visit_reason || !formData.Visitor_entry_time || !formData.Visitor_authorized_by || !formData.Property_id || !formData.Status_id) {
    alert('Por favor, completa todos los campos obligatorios.');
    return;
  }
  const method = editingVisitorId ? 'PUT' : 'POST';
  const url = editingVisitorId ? `${API_VISITOR}/${editingVisitorId}` : API_VISITOR;
  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Operación exitosa');
        visitorModal.hide();
        loadVisitors();
      }
    })
    .catch(() => alert('Error en la operación.'));
};

function deleteVisitor(id) {
  if (!confirm('¿Estás seguro de eliminar este visitante?')) return;
  fetch(`${API_VISITOR}/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Visitante eliminado');
        loadVisitors();
      }
    });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('es-CO', { hour12: false });
}

// Exponer funciones globales para los botones de la tabla
window.addVisitor = addVisitor;
window.showVisitor = showVisitor;
window.editVisitor = editVisitor;
window.deleteVisitor = deleteVisitor; 
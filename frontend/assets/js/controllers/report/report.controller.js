document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Report controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen

});

const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const appTable = "#app-table";

// --- NUEVO: Variables globales para datos y gráficos ---
let allReports = [];
let chartTipo = null;
let chartEstado = null;



function add() {
  alert('Para crear un reporte personalizado, contacte al administrador del sistema. Los reportes automáticos se generan cada vez que se carga esta página.');
}

function showId(id) {
  showReportDetails(id);
}

function edit(id) {
  alert('Los reportes generados automáticamente no se pueden editar. Para crear un nuevo reporte personalizado, use el botón "Nuevo Reporte".');
}

function delete_(id) {
  alert('Los reportes generados automáticamente no se pueden eliminar. Se regeneran cada vez que se carga la página.');
}



// Datos de ejemplo por defecto
const REPORTS_MOCK = [
  {
    report_id: "USR_1",
    report_title: "Reporte de Usuarios",
    report_type_name: "Usuarios",
    user_name: "Sistema",
    status_name: "Generado",
    report_created_at: new Date().toISOString(),
    report_description: "Total de usuarios: 2",
    data: [
      { id: 1, nombre: "Juan Pérez", email: "juan@correo.com" },
      { id: 2, nombre: "Ana Gómez", email: "ana@correo.com" }
    ]
  },
  {
    report_id: "PROP_1",
    report_title: "Reporte de Propiedades",
    report_type_name: "Propiedades",
    user_name: "Sistema",
    status_name: "Generado",
    report_created_at: new Date().toISOString(),
    report_description: "Total de propiedades: 1",
    data: [
      { id: 1, direccion: "Calle 123", tipo: "Apartamento" }
    ]
  }
];

// --- Sobrescribir getData para cargar y procesar todo ---
function getData() {
  const endpointUrl = URL_REPORT + '/generate';
  
  console.log('Intentando cargar reportes desde:', endpointUrl);

  const resultServices = getDataServices("", METHODS[0], endpointUrl);
  resultServices.then(response => {
    console.log('Respuesta del servidor:', response.status, response.statusText);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    let reports = data.data || [];
    if (!Array.isArray(reports) || reports.length === 0) {
      // Si no hay datos, usar mock
      reports = REPORTS_MOCK;
    }
    allReports = reports;
    console.log('Reportes procesados:', allReports.length);
    updateStats(allReports);
    fillFilters(allReports);
    updateCharts(allReports);
    createTable(allReports);
  }).catch(error => {
    console.error('Error al obtener datos:', error);
    // Si hay error, usar mock
    allReports = REPORTS_MOCK;
    updateStats(allReports);
    fillFilters(allReports);
    updateCharts(allReports);
    createTable(allReports);
    // Opcional: mostrar mensaje amigable
    // alert('No se pudo conectar al backend. Mostrando datos de ejemplo.');
  }).finally(() => {
    toggleLoading(false);
  });
}

// --- Función para mostrar detalles del reporte ---
function showReportDetails(reportId) {
  const report = allReports.find(r => r.report_id === reportId);
  if (!report) {
    alert('Reporte no encontrado');
    return;
  }
  
  const detailsContainer = document.getElementById('report-details');
  let detailsHTML = `
    <div class="row">
      <div class="col-12">
        <h4>${report.report_title}</h4>
        <p class="text-muted">${report.report_description}</p>
        <hr>
        <div class="row">
          <div class="col-md-6">
            <strong>Tipo:</strong> ${report.report_type_name}<br>
            <strong>Estado:</strong> ${report.status_name}<br>
            <strong>Generado por:</strong> ${report.user_name}<br>
            <strong>Fecha:</strong> ${new Date(report.report_created_at).toLocaleString('es-ES')}
          </div>
          <div class="col-md-6">
            <strong>Total de registros:</strong> ${report.data ? (Array.isArray(report.data) ? report.data.length : 'N/A') : 'N/A'}
          </div>
        </div>
        <hr>
        <h5>Datos del Reporte:</h5>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
  `;
  
  if (report.data && Array.isArray(report.data) && report.data.length > 0) {
    // Mostrar los primeros 5 registros como ejemplo
    const sampleData = report.data.slice(0, 5);
    sampleData.forEach((item, index) => {
      detailsHTML += `<tr><td colspan="2"><strong>Registro ${index + 1}:</strong></td></tr>`;
      Object.entries(item).forEach(([key, value]) => {
        detailsHTML += `<tr><td>${key}</td><td>${value || 'N/A'}</td></tr>`;
      });
    });
    if (report.data.length > 5) {
      detailsHTML += `<tr><td colspan="2" class="text-muted">... y ${report.data.length - 5} registros más</td></tr>`;
    }
  } else if (report.data && typeof report.data === 'object') {
    // Para estadísticas generales
    Object.entries(report.data).forEach(([key, value]) => {
      detailsHTML += `<tr><td>${key}</td><td>${JSON.stringify(value)}</td></tr>`;
    });
  } else {
    detailsHTML += `<tr><td colspan="2">No hay datos disponibles</td></tr>`;
  }
  
  detailsHTML += `
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  detailsContainer.innerHTML = detailsHTML;
  showHiddenModal(true);
}

// --- Estadísticas rápidas ---
function updateStats(data) {
  document.getElementById('stat-total').textContent = data.length;
  // Contar por tipo de reporte
  const usuarios = data.filter(r => r.report_type_name === 'Usuarios').length;
  const propiedades = data.filter(r => r.report_type_name === 'Propiedades').length;
  const vehiculos = data.filter(r => r.report_type_name === 'Vehículos').length;
  const reservas = data.filter(r => r.report_type_name === 'Reservas').length;
  
  document.getElementById('stat-activos').textContent = usuarios;
  document.getElementById('stat-pendientes').textContent = propiedades;
  document.getElementById('stat-cerrados').textContent = vehiculos;
  document.getElementById('stat-reservas').textContent = reservas;
  
  // Actualizar títulos de las tarjetas
  document.querySelector('#stats-row .text-bg-success .card-title').textContent = 'Usuarios';
  document.querySelector('#stats-row .text-bg-danger .card-title').textContent = 'Propiedades';
  document.querySelector('#stats-row .text-bg-secondary .card-title').textContent = 'Vehículos';
}

// --- Filtros ---
function fillFilters(data) {
  // Tipo
  const typeSet = new Set(data.map(r => r.report_type_name).filter(Boolean));
  const typeSelect = document.getElementById('filter-type');
  typeSelect.innerHTML = '<option value="">Todos</option>' + Array.from(typeSet).map(t => `<option value="${t}">${t}</option>`).join('');
  // Estado
  const statusSet = new Set(data.map(r => r.status_name).filter(Boolean));
  const statusSelect = document.getElementById('filter-status');
  statusSelect.innerHTML = '<option value="">Todos</option>' + Array.from(statusSet).map(s => `<option value="${s}">${s}</option>`).join('');
  // Usuario
  const userSet = new Set(data.map(r => r.user_name).filter(Boolean));
  const userSelect = document.getElementById('filter-user');
  userSelect.innerHTML = '<option value="">Todos</option>' + Array.from(userSet).map(u => `<option value="${u}">${u}</option>`).join('');
}

// --- Filtros: eventos ---
document.getElementById('filter-type').addEventListener('change', applyFilters);
document.getElementById('filter-status').addEventListener('change', applyFilters);
document.getElementById('filter-user').addEventListener('change', applyFilters);
document.getElementById('filter-date').addEventListener('change', applyFilters);

function applyFilters() {
  let filtered = allReports;
  const type = document.getElementById('filter-type').value;
  const status = document.getElementById('filter-status').value;
  const user = document.getElementById('filter-user').value;
  const date = document.getElementById('filter-date').value;
  if (type) filtered = filtered.filter(r => r.report_type_name === type);
  if (status) filtered = filtered.filter(r => r.status_name === status);
  if (user) filtered = filtered.filter(r => r.user_name === user);
  if (date) filtered = filtered.filter(r => (r.report_created_at||'').slice(0,10) === date);
  updateStats(filtered);
  updateCharts(filtered);
  createTable(filtered);
  if ($.fn.DataTable.isDataTable(appTable)) {
    $(appTable).DataTable().destroy();
  }
  new DataTable(appTable);
}

// --- Gráficos ---
function updateCharts(data) {
  // Por tipo
  const tipoLabels = Array.from(new Set(data.map(r => r.report_type_name).filter(Boolean)));
  const tipoCounts = tipoLabels.map(t => data.filter(r => r.report_type_name === t).length);
  if (chartTipo) chartTipo.destroy();
  chartTipo = new Chart(document.getElementById('chart-tipo'), {
    type: 'bar',
    data: {
      labels: tipoLabels,
      datasets: [{ label: 'Cantidad', data: tipoCounts, backgroundColor: '#5AAA95' }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });
  // Por estado
  const estadoLabels = Array.from(new Set(data.map(r => r.status_name).filter(Boolean)));
  const estadoCounts = estadoLabels.map(s => data.filter(r => r.status_name === s).length);
  if (chartEstado) chartEstado.destroy();
  chartEstado = new Chart(document.getElementById('chart-estado'), {
    type: 'pie',
    data: {
      labels: estadoLabels,
      datasets: [{ data: estadoCounts, backgroundColor: ['#087F8C','#BB9F06','#86A873','#5AAA95','#095256'] }]
    },
    options: { responsive: true }
  });
}

function createTable(data) {
  objTableBody.innerHTML = ""; // Clear previous table data
  let getData = data || [];
  console.log('Datos para crear tabla:', getData);
  
  if (getData.length === 0) {
    console.log('No hay datos para mostrar');
    objTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay reportes disponibles</td></tr>';
    return;
  }
  
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Fila actual:', row);
    
    // Determinar el estado activo/inactivo
    const statusActive = row.status_name || 'N/A';
    const statusClass = row.status_name === 'Generado' ? 'text-success' : 'text-warning';
    
    // Formatear fecha
    const reportDate = row.report_created_at || row.created_at || 'N/A';
    const formattedDate = reportDate !== 'N/A' ? new Date(reportDate).toLocaleDateString('es-ES') : 'N/A';
    
    let dataRow = `<tr>
      <td>${row.report_id || row.id}</td>
      <td>${row.report_title || row.title || 'N/A'}</td>
      <td>${row.report_type_name || row.type || 'N/A'}</td>
      <td>${row.user_name || 'N/A'}</td>
      <td>
        <span class="${statusClass}">${statusActive}</span>
      </td>
      <td>${formattedDate}</td>
      <td>
        <button type="button" title="Ver Reporte" class="btn btn-success btn-sm" onclick="showId('${row.report_id || row.id}')">
          <i class="fas fa-eye"></i>
        </button>
        <button type="button" title="Editar Reporte" class="btn btn-warning btn-sm" onclick="edit('${row.report_id || row.id}')">
          <i class="fas fa-edit"></i>
        </button>
        <button type="button" title="Eliminar Reporte" class="btn btn-danger btn-sm" onclick="delete_('${row.report_id || row.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>`;
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

window.addEventListener('load', () => {
  loadView();
}); 
document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Vehicle controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen

});

const objForm = new Form('vehicleForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectUser = document.getElementById('user_id');
const objSelectProperty = document.getElementById('property_id');
const objSelectParkingZone = document.getElementById('parkingZone_id');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar este vehículo?";
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }
  toggleLoading(true);
  if (insertUpdate) {
    console.log("Insertando nuevo vehículo");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_VEHICLE;
  } else {
    console.log("Actualizando vehículo");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_VEHICLE + keyId;
  }
  documentData = objForm.getDataForm();
  console.log('Datos del formulario:', documentData);

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Respuesta del servidor:', data);
    if (data.error) {
      alert('Error: ' + data.error);
    } else {
      alert(data.message || 'Operación completada exitosamente');
    }
  }).catch(error => {
    console.log('Error en la operación:', error);
    alert('Error en la operación. Por favor, inténtalo de nuevo.');
  }).finally(() => {
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

  // Si hay una propiedad seleccionada, la preselecciona y bloquea el campo
  if (propiedadSeleccionadaId) {
    objSelectProperty.value = propiedadSeleccionadaId;
    objSelectProperty.disabled = true;
  } else {
    objSelectProperty.disabled = false;
  }
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
    endpointUrl = URL_VEHICLE + id;
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices.then(response => {
      return response.json();
    }).then(data => {
      console.log('Respuesta de eliminación:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Vehículo eliminado exitosamente');
      }
    }).catch(error => {
      console.log('Error al eliminar:', error);
      alert('Error al eliminar. Por favor, inténtalo de nuevo.');
    }).finally(() => {
      loadView();
    });
  } else {
    console.log("Operación cancelada");
  }
}

function getDataId(id) {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_VEHICLE + id;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos del vehículo:', data);
    if (data.data) {
      let getData = data.data;
      objForm.setDataFormJson(getData);
    } else {
      alert('Error: No se encontraron datos del vehículo');
    }
  }).catch(error => {
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos del vehículo');
  }).finally(() => {
    showHiddenModal(true);
  });
}

function showHiddenModal(type) {
  if (type) {
    objModal.show();
  } else {
    objModal.hide();
  }
}

function loadView() {
  // Eliminar funciones y llamadas relacionadas con la tabla general de vehículos
  // function getData();
  // function createTable(data);
  // function loadView();
  // ... y cualquier referencia a ellas ...
}

function getDataUser() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_USER;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de usuarios:', data);
    createSelectUser(data);
  }).catch(error => {
    console.log('Error al obtener usuarios:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

function getDataProperty() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PROPERTY;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de propiedades:', data);
    createSelectProperty(data);
  }).catch(error => {
    console.log('Error al obtener propiedades:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

function getDataParkingZone() {
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PARKINGZONE;
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices.then(response => {
    return response.json();
  }).then(data => {
    console.log('Datos de zonas de parqueo:', data);
    // Eliminar la llamada a createSelectParkingZone(data) para evitar errores
  }).catch(error => {
    console.log('Error al obtener zonas de parqueo:', error);
  }).finally(() => {
    toggleLoading(false);
  });
}

window.addEventListener('load', () => {
  loadView();
  getDataUser();
  getDataProperty();
  getDataParkingZone();
}); 

// ===================== VEHÍCULOS POR PROPIEDAD =====================

// Renderiza los vehículos de una propiedad
function renderVehiclesByProperty(vehicles) {
  const container = document.getElementById('vehicles-by-property');
  container.innerHTML = '';
  let html = `<h4>Vehículos de la propiedad seleccionada</h4>
    <button class="btn btn-success mb-3" onclick="add()">Agregar Vehículo</button>
    <div class="row">`;
  if (!vehicles.length) {
    html += '<div class="alert alert-info">No hay vehículos registrados para esta casa.</div>';
  } else {
    vehicles.forEach(vehicle => {
      html += `
        <div class="col-md-4">
          <div class="card mb-3">
            <div class="card-body">
              <p><strong>Modelo:</strong> ${vehicle.model}</p>
              <p><strong>Tipo:</strong> ${vehicle.type}</p>
              <p><strong>Color:</strong> ${vehicle.color}</p>
              <p><strong>Placa:</strong> ${vehicle.license_plate || 'N/A'}</p>
              <div class="d-flex justify-content-between mt-2">
                <button class="btn btn-primary btn-sm" onclick="showId(${vehicle.vehicle_id || vehicle.id})"><i class="fas fa-eye"></i></button>
                <button class="btn btn-warning btn-sm" onclick="edit(${vehicle.vehicle_id || vehicle.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="delete_(${vehicle.vehicle_id || vehicle.id})"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }
  html += '</div>';
  container.innerHTML = html;
}

// Obtiene y muestra los vehículos de una propiedad
function getVehiclesByProperty(propertyId) {
  fetch(`http://localhost:3000/api_v1/vehicle/property/${propertyId}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        renderVehiclesByProperty(data.data);
      } else {
        alert('Error al cargar vehículos');
      }
    })
    .catch(() => {
      alert('Error al cargar vehículos');
    });
}

// Asocia el evento a cada tarjeta de casa (ajusta el selector según tu HTML)
function setupCasaCards() {
  document.querySelectorAll('.casa-card').forEach(card => {
    card.addEventListener('click', function() {
      const propertyId = this.dataset.propertyId;
      // Redirigir a la nueva vista de detalle
      window.location.href = `vehiculos_casa.html?id=${propertyId}`;
    });
  });
}

// Evento para volver al listado general
const btnVolver = document.getElementById('btn-volver-listado');
if (btnVolver) {
  btnVolver.addEventListener('click', function() {
    propiedadSeleccionadaId = null;
    // Ocultar el bloque de vehículos de la casa y mostrar la tabla general
    const tablaGeneral = document.getElementById('tabla-general-vehiculos');
    const vehiclesByProperty = document.getElementById('vehicles-by-property');
    if (tablaGeneral) tablaGeneral.style.display = 'block';
    if (vehiclesByProperty) vehiclesByProperty.innerHTML = '';
    btnVolver.style.display = 'none';
    // Ocultar el botón de agregar vehículo
    const btnAdd = document.getElementById('btn-add-vehiculo');
    if (btnAdd) btnAdd.style.display = 'none';
  });
}

// Llama a esta función después de renderizar las casas (si las generas dinámicamente, llama después de insertarlas)
// setupCasaCards(); 

// ===================== CASAS (PROPIEDADES) DINÁMICAS =====================

// Renderiza las tarjetas de casas
function renderCasaCards(properties) {
  const container = document.getElementById('casas-list');
  container.innerHTML = '';
  if (!properties.length) {
    container.innerHTML = '<div class="alert alert-info">No hay casas registradas.</div>';
    return;
  }
  let html = '';
  properties.forEach(property => {
    html += `
      <div class="col-md-2 mb-3">
        <div class="card casa-card" data-property-id="${property.property_id}" style="cursor:pointer;">
          <div class="card-body text-center">
            <i class="fa fa-home fa-2x text-primary"></i>
            <p>${property.property_name}</p>
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
  setupCasaCards(); // Asociar eventos
}

// Obtiene las casas desde el backend y las renderiza
function getAndRenderCasas() {
  fetch('http://localhost:3000/api_v1/property')
    .then(res => res.json())
    .then(data => {
      if (data.data) {
        renderCasaCards(data.data);
      } else {
        alert('Error al cargar casas');
      }
    })
    .catch(() => {
      alert('Error al cargar casas');
    });
}

// Llama a esta función al cargar la página o cuando lo necesites
window.addEventListener('DOMContentLoaded', () => {
  if(document.getElementById('casas-list')) {
    getAndRenderCasas();
  }
}); 

// Variable global para la propiedad seleccionada
let propiedadSeleccionadaId = null;

// Al cerrar el modal, desbloquear el campo de propiedad
const appModalElement = document.getElementById('appModal');
if (appModalElement) {
  appModalElement.addEventListener('hidden.bs.modal', function () {
    objSelectProperty.disabled = false;
    // Si no hay propiedad seleccionada, ocultar el botón
    if (!propiedadSeleccionadaId) {
      const btnAdd = document.getElementById('btn-add-vehiculo');
      if (btnAdd) btnAdd.style.display = 'none';
    }
  });
} 
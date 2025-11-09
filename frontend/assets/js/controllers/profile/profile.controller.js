document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  await checkAuth();
  console.log('Profile controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

const objForm = new Form('profileForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelect = document.getElementById('user_id');
const myForm = objForm.getForm();
const textConfirm = "¿Estás seguro de que deseas eliminar este perfil?";
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

// Paginación
let currentPage = 1;
let itemsPerPage = 10;

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }
  
  toggleLoading(true);
  documentData = objForm.getDataForm();
  console.log('Datos del formulario:', documentData);

  if (insertUpdate) {
    console.log("Insertando nuevo perfil");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_PROFILE;
  } else {
    console.log("Actualizando perfil");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = `${URL_PROFILE}${keyId}`;
  }

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices
    .then(response => response.json())
    .then(data => {
      console.log('Respuesta del servidor:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'Operación completada exitosamente');
        showHiddenModal(false);
        loadView();
      }
    })
    .catch(error => {
      console.error('Error en la operación:', error);
      alert('Error en la operación. Por favor, inténtalo de nuevo.');
    })
    .finally(() => {
      toggleLoading(false);
    });
});

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
  if (confirm(textConfirm)) {
    toggleLoading(true);
    documentData = "";
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = `${URL_PROFILE}${id}`;
    
    const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
    resultServices
      .then(response => response.json())
      .then(data => {
        console.log('Respuesta de eliminación:', data);
        if (data.error) {
          alert('Error: ' + data.error);
        } else {
          alert(data.message || 'Perfil eliminado exitosamente');
          loadView();
        }
      })
      .catch(error => {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar. Por favor, inténtalo de nuevo.');
      })
      .finally(() => {
        toggleLoading(false);
      });
  } else {
    console.log("Operación cancelada");
  }
}

function getDataId(id) {
  toggleLoading(true);
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = `${URL_PROFILE}${id}`;
  
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices
    .then(response => response.json())
    .then(data => {
      console.log('Datos del perfil:', data);
      if (data.data) {
        let profileData = data.data;
        // Mapear los datos del backend al formulario
        objForm.setDataFormJson({
          user_id: profileData.user_id,
          profile_fullName: profileData.profile_fullName,
          profile_phone: profileData.profile_phone,
          profile_email: profileData.profile_email,
          profile_address: profileData.profile_address,
          profile_photo: profileData.profile_photo
        });
        showHiddenModal(true);
      } else {
        alert('Error: No se encontraron datos del perfil');
      }
    })
    .catch(error => {
      console.error('Error al obtener datos:', error);
      alert('Error al obtener los datos del perfil');
    })
    .finally(() => {
      toggleLoading(false);
    });
}

function getData(page = 1) {
  toggleLoading(true);
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  // Agregar parámetros de paginación
  endpointUrl = `${URL_PROFILE}?page=${page}&limit=${itemsPerPage}`;

  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices
    .then(response => response.json())
    .then(data => {
      console.log('Datos recibidos del backend:', data);
      createTable(data);
      createPagination(data.pagination);
      
      // Destruir y reinicializar DataTable
      if ($.fn.DataTable.isDataTable(appTable)) {
        $(appTable).DataTable().destroy();
      }
      $(appTable).DataTable({
        paging: false, // Desactivar paginación de DataTable (usamos la del backend)
        searching: true,
        ordering: true,
        info: false,
        language: {
          search: "Buscar:",
          lengthMenu: "Mostrar _MENU_ registros",
          zeroRecords: "No se encontraron resultados",
          emptyTable: "No hay datos disponibles"
        }
      });
    })
    .catch(error => {
      console.error('Error al obtener datos:', error);
      alert('Error al cargar los datos de perfiles');
    })
    .finally(() => {
      toggleLoading(false);
    });
}

function createTable(data) {
  objTableBody.innerHTML = ""; // Limpiar tabla anterior
  let getData = data.data || [];
  console.log('Datos para crear tabla:', getData);
  
  if (getData.length === 0) {
    console.log('No hay datos para mostrar');
    objTableBody.innerHTML = '<tr><td colspan="9" class="text-center">No hay perfiles disponibles</td></tr>';
    return;
  }
  
  getData.forEach(row => {
    let dataRow = `<tr>
      <td>${row.user_id}</td>
      <td>${row.profile_fullName}</td>
      <td>${row.profile_phone}</td>
      <td>${row.profile_email}</td>
      <td>${row.profile_address || 'N/A'}</td>
      <td>${row.role_name}</td>
      <td>${row.status_name}</td>
      <td>
        ${row.profile_photo 
          ? `<img src="${row.profile_photo}" alt="Foto" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` 
          : '<span class="badge bg-secondary">Sin foto</span>'
        }
      </td>
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
    objTableBody.innerHTML += dataRow;
  });
}

function createPagination(pagination) {
  if (!pagination) return;
  
  const paginationContainer = document.getElementById('pagination-container');
  if (!paginationContainer) return;
  
  let paginationHTML = `
    <nav aria-label="Navegación de perfiles">
      <ul class="pagination justify-content-center">
        <li class="page-item ${pagination.page === 1 ? 'disabled' : ''}">
          <a class="page-link" href="#" onclick="changePage(${pagination.page - 1}); return false;">Anterior</a>
        </li>
  `;
  
  // Crear botones de páginas
  for (let i = 1; i <= pagination.totalPages; i++) {
    if (
      i === 1 || 
      i === pagination.totalPages || 
      (i >= pagination.page - 2 && i <= pagination.page + 2)
    ) {
      paginationHTML += `
        <li class="page-item ${i === pagination.page ? 'active' : ''}">
          <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
        </li>
      `;
    } else if (i === pagination.page - 3 || i === pagination.page + 3) {
      paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
  }
  
  paginationHTML += `
        <li class="page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}">
          <a class="page-link" href="#" onclick="changePage(${pagination.page + 1}); return false;">Siguiente</a>
        </li>
      </ul>
    </nav>
    <p class="text-center text-muted">
      Mostrando página ${pagination.page} de ${pagination.totalPages} 
      (Total: ${pagination.total} perfiles)
    </p>
  `;
  
  paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
  currentPage = page;
  getData(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getDataUser() {
  toggleLoading(true);
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_USER;
  
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices
    .then(response => response.json())
    .then(data => {
      console.log('Datos de usuarios:', data);
      createSelect(data);
    })
    .catch(error => {
      console.error('Error al obtener usuarios:', error);
    })
    .finally(() => {
      toggleLoading(false);
    });
}

function createSelect(data) {
  objSelect.innerHTML = "<option value='' selected disabled>Selecciona un usuario</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;
  
  getData.forEach(row => {
    let dataRow = `<option value="${row.user_id}">${row.user_name || 'Usuario ' + row.user_id}</option>`;
    objSelect.innerHTML += dataRow;
  });
}

function showHiddenModal(show) {
  if (show) {
    objModal.show();
  } else {
    objModal.hide();
  }
}

function loadView() {
  getData(currentPage);
}

// Función de búsqueda
function searchProfiles() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.trim();
  
  if (searchTerm.length < 2) {
    loadView(); // Si no hay término de búsqueda, cargar vista normal
    return;
  }
  
  toggleLoading(true);
  documentData = "";
  httpMethod = METHODS[0]; // GET method
  endpointUrl = `${URL_PROFILE}search?term=${encodeURIComponent(searchTerm)}&limit=${itemsPerPage}`;
  
  const resultServices = getDataServices(documentData, httpMethod, endpointUrl);
  resultServices
    .then(response => response.json())
    .then(data => {
      console.log('Resultados de búsqueda:', data);
      createTable(data);
      
      // Actualizar DataTable
      if ($.fn.DataTable.isDataTable(appTable)) {
        $(appTable).DataTable().destroy();
      }
      $(appTable).DataTable({
        paging: false,
        searching: false, // Desactivar búsqueda local
        ordering: true,
        info: false
      });
    })
    .catch(error => {
      console.error('Error en búsqueda:', error);
      alert('Error al buscar perfiles');
    })
    .finally(() => {
      toggleLoading(false);
    });
}

// Event listener para búsqueda en tiempo real (opcional)
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchProfiles();
      }, 500); // Esperar 500ms después de que el usuario deje de escribir
    });
  }
});

window.addEventListener('load', () => {
  loadView();
  getDataUser();
});
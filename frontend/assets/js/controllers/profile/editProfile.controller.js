// Variables globales
let isEditMode = false;
let currentUserId = null;
let originalData = {};
let currentPhotoUrl = null; // Guardar URL de foto actual

// Extraer la URL base del backend desde HOST (sin /api_v1)
const BACKEND_BASE_URL = typeof HOST !== 'undefined' 
  ? HOST.replace(/\/api_v1\/?$/, '') 
  : 'http://localhost:3000';

console.log('Backend Base URL:', BACKEND_BASE_URL);

// Función de debug
function debugLog(message, data) {
  console.log(message, data);
  const debugCard = document.getElementById('debugCard');
  const debugInfo = document.getElementById('debugInfo');
  if (debugCard && debugInfo) {
    debugCard.style.display = 'block';
    debugInfo.textContent += `\n${message}: ${JSON.stringify(data, null, 2)}`;
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('=== INICIANDO VISTA DE PERFIL ===');

    // Ocultar body inicialmente
    document.querySelector('body').style.display = 'block';
    document.querySelector('body').style.opacity = '0';

    // Verificar autenticación
    console.log('Verificando autenticación...');
    await checkAuth();

    console.log('Autenticación OK');

    // Intentar obtener el ID del usuario de varias formas
    let userData = null;

    // Método 1: Desde localStorage directamente
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        userData = JSON.parse(userDataStr);
        console.log('Usuario desde localStorage:', userData);
      }
    } catch (e) {
      console.error('Error al leer localStorage:', e);
    }

    // Método 2: Usando getDataUser() si existe
    if (!userData || !userData.user_id) {
      try {
        if (typeof getDataUser === 'function') {
          userData = getDataUser();
          console.log('Usuario desde getDataUser():', userData);
        }
      } catch (e) {
        console.error('Error al usar getDataUser():', e);
      }
    }

    // Método 3: Verificar sessionStorage
    if (!userData || !userData.user_id) {
      try {
        const sessionDataStr = sessionStorage.getItem('userData');
        if (sessionDataStr) {
          userData = JSON.parse(sessionDataStr);
          console.log('Usuario desde sessionStorage:', userData);
        }
      } catch (e) {
        console.error('Error al leer sessionStorage:', e);
      }
    }

    // Método 4: Fallback - algunos controladores guardan solo 'user_id' como clave plana
    try {
      if ((!userData || !userData.user_id) && localStorage.getItem('user_id')) {
        const storedId = localStorage.getItem('user_id');
        userData = { user_id: isNaN(parseInt(storedId)) ? storedId : parseInt(storedId) };
        console.log('Usuario desde localStorage (user_id):', userData);
      }
    } catch (e) {
      console.error('Error al leer localStorage user_id fallback:', e);
    }

    try {
      if ((!userData || !userData.user_id) && sessionStorage.getItem('user_id')) {
        const storedId = sessionStorage.getItem('user_id');
        userData = { user_id: isNaN(parseInt(storedId)) ? storedId : parseInt(storedId) };
        console.log('Usuario desde sessionStorage (user_id):', userData);
      }
    } catch (e) {
      console.error('Error al leer sessionStorage user_id fallback:', e);
    }

    debugLog('Datos de usuario obtenidos', userData);

    if (userData && userData.user_id) {
      currentUserId = userData.user_id;
      console.log('ID de usuario actual:', currentUserId);
      await loadCurrentUserProfile();
    } else {
      console.error('No se pudo obtener el ID del usuario');
      alert('No se pudo obtener la información del usuario actual. Por favor, inicia sesión nuevamente.');
    }

    // Fade in
    if (typeof fadeInElement === 'function') {
      fadeInElement(document.querySelector('body'), 1000);
    } else {
      document.querySelector('body').style.opacity = '1';
    }

  } catch (error) {
    console.error('Error en inicialización:', error);
    debugLog('Error en inicialización', error);
    alert('Error al cargar la vista de perfil: ' + error.message);
    document.querySelector('body').style.opacity = '1';
  }
});

// Función auxiliar para construir URL completa de imagen
function getImageUrl(photoPath) {
  if (!photoPath) return null;
  
  // Si ya es una URL completa, retornarla
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  
  // Si es una ruta relativa, construir URL completa usando el backend
  const cleanPath = photoPath.startsWith('/') ? photoPath : '/' + photoPath;
  const fullUrl = BACKEND_BASE_URL + cleanPath;
  
  console.log('Construyendo URL de imagen:', {
    original: photoPath,
    base: BACKEND_BASE_URL,
    final: fullUrl
  });
  
  return fullUrl;
}

// Cargar perfil del usuario actual
async function loadCurrentUserProfile() {
  try {
    console.log('Cargando perfil para usuario ID:', currentUserId);

    if (typeof toggleLoading === 'function') {
      toggleLoading(true);
    }

    const httpMethod = METHODS[0]; // GET
    const endpointUrl = `${URL_PROFILE}${currentUserId}`;

    console.log('Endpoint:', endpointUrl);
    debugLog('Endpoint URL', endpointUrl);

    const resultServices = getDataServices("", httpMethod, endpointUrl);
    const response = await resultServices;
    const data = await response.json();

    console.log('Respuesta del servidor:', data);
    debugLog('Respuesta del servidor', data);

    if (data.data) {
      originalData = data.data;
      currentPhotoUrl = data.data.profile_photo; // Guardar URL de foto
      displayProfileData(data.data);
    } else if (data.error) {
      console.error('Error del servidor:', data.error);
      alert('Error: ' + data.error);
    } else {
      console.error('Respuesta sin datos:', data);
      alert('Error: No se encontraron datos del perfil');
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    debugLog('Error al cargar perfil', error);
    alert('Error al cargar el perfil del usuario: ' + error.message);
  } finally {
    if (typeof toggleLoading === 'function') {
      toggleLoading(false);
    }
  }
}

// Mostrar datos del perfil
function displayProfileData(data) {
  console.log('Mostrando datos del perfil:', data);

  try {
    // Actualizar header
    document.getElementById('headerName').textContent = data.profile_fullName || 'Usuario';
    document.getElementById('headerEmail').textContent = data.profile_email || '';

    // Construir URL completa de la imagen
    const photoUrl = getImageUrl(data.profile_photo);
    console.log('URL de imagen procesada:', photoUrl);

    // Actualizar foto en header
    if (photoUrl) {
      document.getElementById('headerPhotoContainer').innerHTML =
        `<img src="${photoUrl}" alt="Foto" class="profile-photo" onerror="this.parentElement.innerHTML='<div class=\\'profile-photo-placeholder\\'><i class=\\'fas fa-user\\'></i></div>'">`;
    } else {
      document.getElementById('headerPhotoContainer').innerHTML =
        `<div class="profile-photo-placeholder"><i class="fas fa-user"></i></div>`;
    }

    // Actualizar campos de vista
    document.getElementById('view_fullName').textContent = data.profile_fullName || 'No especificado';
    document.getElementById('view_phone').textContent = data.profile_phone || 'No especificado';
    document.getElementById('view_email').textContent = data.profile_email || 'No especificado';
    document.getElementById('view_address').textContent = data.profile_address || 'No especificado';

    // Actualizar foto en vista de perfil
    if (photoUrl) {
      document.getElementById('view_photo').innerHTML =
        `<img src="${photoUrl}" alt="Foto" style="width: 80px; height: 80px; border-radius: 10px; object-fit: cover;" onerror="this.parentElement.innerHTML='<span class=\\'badge bg-secondary\\'>Sin foto</span>'">`;
    } else {
      document.getElementById('view_photo').innerHTML = '<span class="badge bg-secondary">Sin foto</span>';
    }

    // Llenar campos del formulario (IMPORTANTE: NO llenar el input file)
    document.getElementById('user_id').value = data.user_id || '';
    document.getElementById('profile_fullName').value = data.profile_fullName || '';
    document.getElementById('profile_phone').value = data.profile_phone || '';
    document.getElementById('profile_email').value = data.profile_email || '';
    document.getElementById('profile_address').value = data.profile_address || '';
    
    // NO hacer esto: document.getElementById('profile_photo').value = data.profile_photo || '';
    // El input file debe permanecer vacío a menos que el usuario seleccione un nuevo archivo
    
    // Limpiar preview si existe
    const photoInput = document.getElementById('profile_photo');
    if (photoInput) {
      photoInput.value = ''; // Limpiar input file
    }
    const previewContainer = document.getElementById('photo-preview');
    if (previewContainer) {
      previewContainer.classList.add('d-none');
    }

    console.log('Datos mostrados exitosamente');
  } catch (error) {
    console.error('Error al mostrar datos:', error);
    debugLog('Error al mostrar datos', error);
  }
}

// Alternar modo de edición
function toggleEditMode() {
  isEditMode = !isEditMode;

  const viewElements = document.querySelectorAll('.view-mode');
  const editElements = document.querySelectorAll('.edit-mode');
  const btnToggle = document.getElementById('btnToggleEdit');
  const cardTitle = document.getElementById('cardTitle');
  const card = document.querySelector('.card');

  if (isEditMode) {
    viewElements.forEach(el => el.classList.add('d-none'));
    editElements.forEach(el => el.classList.remove('d-none'));
    btnToggle.innerHTML = '<i class="fas fa-eye"></i> Ver Perfil';
    cardTitle.textContent = 'Editar Perfil';
    if (card) card.classList.add('edit-mode-bg');
  } else {
    viewElements.forEach(el => el.classList.remove('d-none'));
    editElements.forEach(el => el.classList.add('d-none'));
    btnToggle.innerHTML = '<i class="fas fa-edit"></i> Editar Perfil';
    cardTitle.textContent = 'Información del Perfil';
    if (card) card.classList.remove('edit-mode-bg');
  }
}

// Cancelar edición
function cancelEdit() {
  displayProfileData(originalData);
  toggleEditMode();
}

// Función para comprimir imagen
async function compressImage(file, maxSizeMB = 1) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calcular las nuevas dimensiones manteniendo el aspect ratio
        const maxDimension = 800;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Comprimir como JPEG con calidad 0.7
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        // Verificar tamaño
        const size = (compressedBase64.length * 3) / 4 / (1024 * 1024);
        if (size > maxSizeMB) {
          reject(new Error(`La imagen es demasiado grande (${size.toFixed(2)}MB). Por favor, selecciona una imagen más pequeña o de menor calidad.`));
          return;
        }
        
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

// Manejar la previsualización de la imagen
document.getElementById('profile_photo').addEventListener('change', async function(e) {
  const file = e.target.files[0];
  const previewImage = document.getElementById('preview-image');
  const photoPreview = document.getElementById('photo-preview');
  
  if (file) {
    try {
      // Verificar el tipo de archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Por favor, selecciona un archivo de imagen válido.');
      }
      
      // Verificar tamaño inicial
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > 5) {
        throw new Error(`El archivo es demasiado grande (${sizeMB.toFixed(2)}MB). Máximo permitido: 5MB`);
      }

      // Comprimir y mostrar preview
      const compressedBase64 = await compressImage(file);
      previewImage.src = compressedBase64;
      photoPreview.classList.remove('d-none');
    } catch (error) {
      alert(error.message);
      e.target.value = ''; // Limpiar input
      previewImage.src = '';
      photoPreview.classList.add('d-none');
    }
  } else {
    previewImage.src = '';
    photoPreview.classList.add('d-none');
  }
});

// Manejar envío del formulario
document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!confirm('¿Deseas guardar los cambios en tu perfil?')) {
    return;
  }

  try {
    if (typeof toggleLoading === 'function') {
      toggleLoading(true);
    }

    const formData = new FormData(e.target);
    
    // Manejar el archivo de imagen
    const photoFile = document.getElementById('profile_photo').files[0];
    if (photoFile) {
      // Si hay un nuevo archivo, agregarlo al FormData
      formData.set('profile_photo', photoFile);
      console.log('Nuevo archivo de imagen seleccionado');
    } else {
      // Si no hay nuevo archivo, mantener la foto actual
      if (currentPhotoUrl) {
        formData.set('profile_photo', currentPhotoUrl);
        console.log('Manteniendo foto actual:', currentPhotoUrl);
      }
    }
    
    console.log('FormData a enviar:', Array.from(formData.entries()));
    debugLog('FormData del formulario', Object.fromEntries(formData));

    const httpMethod = METHODS[2]; // PUT
    const endpointUrl = `${URL_PROFILE}${currentUserId}`;

    // Enviar FormData directamente
    const response = await fetch(endpointUrl, {
      method: httpMethod,
      headers: {
        'Authorization': localStorage.getItem(KEY_TOKEN)
      },
      body: formData
    });
    
    const result = await response.json();

    console.log('Respuesta:', result);
    debugLog('Respuesta de actualización', result);

    if (result.error) {
      alert('Error: ' + result.error);
    } else {
      alert(result.message || 'Perfil actualizado exitosamente');
      await loadCurrentUserProfile();
      toggleEditMode();
    }
  } catch (error) {
    console.error('Error:', error);
    debugLog('Error al actualizar', error);
    alert('Error al actualizar el perfil: ' + error.message);
  } finally {
    if (typeof toggleLoading === 'function') {
      toggleLoading(false);
    }
  }
});
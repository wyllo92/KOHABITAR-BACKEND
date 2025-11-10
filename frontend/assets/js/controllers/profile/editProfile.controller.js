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

    // Método 1: Desde localStorage directamente (user_id como string o número)
    try {
      const storedId = localStorage.getItem('user_id');
      if (storedId) {
        const parsedId = parseInt(storedId);
        if (!isNaN(parsedId)) {
          userData = { user_id: parsedId };
          console.log('Usuario desde localStorage (user_id):', userData);
        }
      }
    } catch (e) {
      console.error('Error al leer localStorage user_id:', e);
    }

    // Método 2: Desde sessionStorage (user_id como string o número)
    if (!userData || !userData.user_id) {
      try {
        const storedId = sessionStorage.getItem('user_id');
        if (storedId) {
          const parsedId = parseInt(storedId);
          if (!isNaN(parsedId)) {
            userData = { user_id: parsedId };
            console.log('Usuario desde sessionStorage (user_id):', userData);
          }
        }
      } catch (e) {
        console.error('Error al leer sessionStorage user_id:', e);
      }
    }

    // Método 3: Desde localStorage como objeto JSON
    if (!userData || !userData.user_id) {
      try {
        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
          const parsed = JSON.parse(userDataStr);
          if (parsed && parsed.user_id) {
            userData = parsed;
            console.log('Usuario desde localStorage (userData):', userData);
          }
        }
      } catch (e) {
        console.error('Error al leer localStorage userData:', e);
      }
    }

    // Método 4: Desde sessionStorage como objeto JSON
    if (!userData || !userData.user_id) {
      try {
        const sessionDataStr = sessionStorage.getItem('userData');
        if (sessionDataStr) {
          const parsed = JSON.parse(sessionDataStr);
          if (parsed && parsed.user_id) {
            userData = parsed;
            console.log('Usuario desde sessionStorage (userData):', userData);
          }
        }
      } catch (e) {
        console.error('Error al leer sessionStorage userData:', e);
      }
    }

    // Método 5: Intentar obtener desde el token si está disponible
    if (!userData || !userData.user_id) {
      try {
        const appStorage = new AppStorage();
        const token = appStorage.getItem(KEY_TOKEN);
        if (token) {
          // El token JWT contiene el ID del usuario, pero necesitaríamos decodificarlo
          // Por ahora, confiamos en los métodos anteriores
          console.log('Token encontrado, pero no se puede extraer user_id sin decodificar');
        }
      } catch (e) {
        console.error('Error al leer token:', e);
      }
    }

    debugLog('Datos de usuario obtenidos', userData);

    if (userData && userData.user_id) {
      // Asegurar que user_id es un número
      currentUserId = parseInt(userData.user_id);
      if (isNaN(currentUserId)) {
        console.error('user_id no es un número válido:', userData.user_id);
        alert('Error: El ID de usuario no es válido. Por favor, inicia sesión nuevamente.');
        return;
      }
      console.log('ID de usuario actual:', currentUserId);
      await loadCurrentUserProfile();
    } else {
      console.error('No se pudo obtener el ID del usuario de ninguna fuente');
      console.log('localStorage user_id:', localStorage.getItem('user_id'));
      console.log('sessionStorage user_id:', sessionStorage.getItem('user_id'));
      console.log('localStorage userData:', localStorage.getItem('userData'));
      console.log('sessionStorage userData:', sessionStorage.getItem('userData'));
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

    if (!currentUserId) {
      console.error('No hay user_id disponible');
      alert('Error: No se pudo obtener el ID del usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    if (typeof toggleLoading === 'function') {
      toggleLoading(true);
    }

    const httpMethod = METHODS[0]; // GET
    const endpointUrl = `${URL_PROFILE}${currentUserId}`;

    console.log('Endpoint:', endpointUrl);
    debugLog('Endpoint URL', endpointUrl);

    let response;
    let data;
    
    try {
      const resultServices = getDataServices("", httpMethod, endpointUrl);
      response = await resultServices;
      
      // Verificar el status de la respuesta
      console.log('Status de respuesta:', response.status, response.statusText);
      
      if (!response.ok) {
        // Si la respuesta no es OK, intentar parsear el error
        try {
          data = await response.json();
        } catch (parseError) {
          const text = await response.text();
          throw new Error(`Error del servidor (${response.status}): ${text || response.statusText}`);
        }
        
        // Si hay un error en la respuesta JSON
        if (data.error) {
          // Si el error es que no se encontró el perfil, el backend debería crear uno automáticamente
          // pero si no lo hace, intentar crear uno básico desde el frontend
          if (data.error.includes('no encontrado') || data.error.includes('not found') || response.status === 404) {
            console.log('Perfil no encontrado, el backend debería crear uno automáticamente. Reintentando...');
            // Esperar un poco y reintentar (el backend debería haber creado el perfil)
            await new Promise(resolve => setTimeout(resolve, 500));
            return loadCurrentUserProfile(); // Reintentar
          }
          throw new Error(data.error);
        }
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }
      
      // Parsear la respuesta JSON
      data = await response.json();
    } catch (fetchError) {
      console.error('Error en la petición:', fetchError);
      throw fetchError;
    }

    console.log('Respuesta del servidor:', data);
    debugLog('Respuesta del servidor', data);

    // Verificar si la respuesta tiene la estructura esperada
    if (data && data.data) {
      originalData = data.data;
      currentPhotoUrl = data.data.profile_photo; // Guardar URL de foto
      displayProfileData(data.data);
    } else if (data && data.needsCreation) {
      // El backend indica que necesita crear el perfil
      console.log('El perfil necesita ser creado. Datos disponibles:', data.data);
      if (data.data) {
        // Mostrar los datos disponibles aunque sean básicos
        originalData = data.data;
        displayProfileData(data.data);
        alert('Tu perfil ha sido creado automáticamente. Por favor, completa tu información.');
      } else {
        throw new Error('No se pudieron obtener los datos del usuario para crear el perfil');
      }
    } else if (data && data.error) {
      console.error('Error del servidor:', data.error);
      // Si el error es específico, mostrarlo; si no, mensaje genérico
      if (data.error.includes('Usuario no encontrado') || data.error.includes('User not found')) {
        alert('Error: Tu usuario no fue encontrado en el sistema. Por favor, contacta al administrador.');
      } else {
        alert('Error: ' + data.error);
      }
    } else {
      console.error('Respuesta sin datos válidos:', data);
      alert('Error: No se encontraron datos del perfil. El servidor puede estar creando tu perfil automáticamente. Por favor, recarga la página.');
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error);
    debugLog('Error al cargar perfil', error);
    
    // Mensaje de error más descriptivo
    let errorMessage = 'Error al cargar el perfil del usuario';
    if (error.message) {
      errorMessage += ': ' + error.message;
    } else if (error.toString) {
      errorMessage += ': ' + error.toString();
    }
    
    alert(errorMessage);
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
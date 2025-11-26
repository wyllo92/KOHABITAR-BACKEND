/**
 * Controlador para editar el perfil de usuario
 * Este archivo maneja la carga de datos del perfil, la previsualización de fotos
 * y el envío de actualizaciones al backend con autenticación JWT
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Referencias a elementos del formulario
  const form = document.getElementById('editProfileForm');
  const photoInput = document.getElementById('profile_photo');
  const photoPreview = document.getElementById('profilePhotoPreview');

  // Obtener el ID del usuario desde el almacenamiento local
  // El sistema utiliza localStorage para mantener la sesión del usuario
  const user_id = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');

  // Validar que existe un usuario autenticado
  if (!user_id) {
    alert('No se encontró el usuario. Por favor, inicia sesión nuevamente.');
    window.location.href = '../../index.html';
    return;
  }

  // Obtener el token de autenticación JWT
  // Este token es necesario para todas las peticiones al backend
  const token = getAuthToken();

  if (!token) {
    alert('No se encontró el token de autenticación. Por favor, inicia sesión nuevamente.');
    window.location.href = '../../index.html';
    return;
  }

  /**
   * PASO 1: CARGAR DATOS ACTUALES DEL PERFIL
   * Se hace una petición GET al endpoint /api_v1/profiles/:id
   * para obtener la información actual del perfil del usuario
   */
  try {
    // Construir la URL del endpoint usando la constante URL_PROFILE
    const profileUrl = `${URL_PROFILE}/${user_id}`;

    // Hacer petición autenticada al backend
    const response = await getServicesAuth("", METHODS[0], profileUrl, token);
    const data = await response.json();

    console.log('Datos del perfil recibidos:', data);

    // Verificar si se recibieron datos exitosamente
    if (data.data) {
      const profileData = data.data;

      // Llenar el formulario con los datos actuales
      form.profile_fullName.value = profileData.full_name || '';
      form.profile_phone.value = profileData.phone || '';
      form.profile_email.value = profileData.email || '';
      form.profile_address.value = profileData.address || '';

      // Mostrar la foto de perfil actual si existe
      if (profileData.profile_photo) {
        photoPreview.src = profileData.profile_photo;
        photoPreview.style.display = 'block';
      }
    } else {
      console.error('No se recibieron datos del perfil');
      alert('No se pudieron cargar los datos del perfil');
    }
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
    alert('Error al cargar el perfil. Por favor, intenta nuevamente.');
  }

  /**
   * PASO 2: PREVISUALIZACIÓN DE FOTO
   * Cuando el usuario selecciona una nueva foto, se muestra una vista previa
   * antes de guardar los cambios
   */
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona solo archivos de imagen');
        photoInput.value = '';
        return;
      }

      // Validar tamaño del archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        alert('La imagen es demasiado grande. El tamaño máximo es 5MB');
        photoInput.value = '';
        return;
      }

      // Leer el archivo y mostrar la previsualización
      const reader = new FileReader();
      reader.onload = (ev) => {
        photoPreview.src = ev.target.result;
        photoPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  /**
   * PASO 3: GUARDAR CAMBIOS
   * Cuando el usuario hace clic en "Guardar cambios", se envían los datos
   * actualizados al backend usando autenticación JWT
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      // Obtener valores del formulario
      const formData = {
        // Adaptar nombres de campos del frontend al formato esperado por el backend
        full_name: form.profile_fullName.value.trim(),
        phone: form.profile_phone.value.trim(),
        email: form.profile_email.value.trim(),
        address: form.profile_address.value.trim(),
        profile_photo: null // Se maneja la foto por separado
      };

      // Validaciones básicas en el frontend
      if (!formData.full_name || !formData.phone || !formData.email) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Por favor, ingresa un correo electrónico válido');
        return;
      }

      // Validar formato de teléfono (básico)
      const phoneRegex = /^[+]?[0-9\s-()]+$/;
      if (!phoneRegex.test(formData.phone)) {
        alert('Por favor, ingresa un número de teléfono válido');
        return;
      }

      console.log('Datos a enviar:', formData);

      // Construir la URL del endpoint para actualizar
      const updateUrl = `${URL_PROFILE}/${user_id}`;

      // Hacer petición PUT autenticada al backend
      // Se usa METHODS[2] que corresponde a PUT
      const response = await getServicesAuth(formData, METHODS[2], updateUrl, token);
      const result = await response.json();

      console.log('Respuesta del servidor:', result);

      // Verificar si hubo un error
      if (result.error) {
        alert('Error al actualizar el perfil: ' + result.error);
        return;
      }

      // Mostrar mensaje de éxito
      alert('Perfil actualizado correctamente');

      // Regresar a la página anterior
      window.history.back();

    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Error al actualizar el perfil. Por favor, verifica tu conexión e intenta nuevamente.');
    }
  });
});

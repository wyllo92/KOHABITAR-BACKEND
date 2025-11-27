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
   * El sistema hace una petición GET al endpoint /api_v1/profiles/:id
   * para obtener la información actual del perfil del usuario
   */
  try {
    // El sistema construye la URL del endpoint usando la constante URL_PROFILE
    const profileUrl = `${URL_PROFILE}/${user_id}`;

    // El sistema registra el intento de carga del perfil
    console.info(`[KOHABITAR] El sistema está cargando el perfil del usuario ID: ${user_id}`);
    console.info(`[KOHABITAR] Endpoint: ${profileUrl}`);

    // El sistema hace petición autenticada al backend
    const response = await getServicesAuth("", METHODS[0], profileUrl, token);

    // El sistema registra el código de estado de la respuesta
    console.info(`[KOHABITAR] Respuesta del servidor - Status: ${response.status}`);

    // El sistema verifica el código de estado HTTP
    if (response.status === 404) {
      console.error('[KOHABITAR] Error 404: El perfil no existe en la base de datos');
      alert(`No se encontró el perfil con ID ${user_id}. Es posible que el usuario no tenga un perfil creado aún.`);

      // El sistema redirige al usuario al dashboard
      window.parent.postMessage({ action: 'navigate', hash: '#profile' }, '*');
      return;
    }

    if (response.status === 401) {
      console.error('[KOHABITAR] Error 401: Token de autenticación inválido o expirado');
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      window.location.href = '../../index.html';
      return;
    }

    if (!response.ok) {
      console.error(`[KOHABITAR] Error ${response.status}: Error al cargar el perfil`);
      alert(`Error del servidor (${response.status}). Por favor, intenta nuevamente.`);
      return;
    }

    // El sistema intenta parsear la respuesta como JSON
    let data;
    try {
      data = await response.json();
      console.info('[KOHABITAR] Datos del perfil recibidos:', data);
    } catch (parseError) {
      console.error('[KOHABITAR] Error al parsear respuesta JSON:', parseError);
      alert('Error al procesar la respuesta del servidor. Por favor, intenta nuevamente.');
      return;
    }

    // El sistema verifica si se recibieron datos exitosamente
    if (data.data) {
      const profileData = data.data;

      // El sistema llena el formulario con los datos actuales
      form.profile_fullName.value = profileData.full_name || '';
      form.profile_phone.value = profileData.phone || '';
      form.profile_email.value = profileData.email || '';
      form.profile_address.value = profileData.address || '';

      // El sistema muestra la foto de perfil actual si existe
      if (profileData.profile_photo) {
        photoPreview.src = profileData.profile_photo;
        photoPreview.style.display = 'block';
      }

      console.info('[KOHABITAR] El sistema ha cargado el perfil exitosamente');
    } else {
      console.error('[KOHABITAR] No se recibieron datos del perfil en la respuesta');
      alert('No se pudieron cargar los datos del perfil. La respuesta del servidor no contiene información.');
    }
  } catch (error) {
    // El sistema maneja errores de red o del servidor
    console.error('[KOHABITAR] Error al cargar el perfil:', error);
    alert('Error de conexión al cargar el perfil. Por favor, verifica que el servidor esté ejecutándose e intenta nuevamente.');
  }

  /**
   * PASO 2: PREVISUALIZACIÓN DE FOTO
   * El sistema muestra una vista previa cuando el usuario selecciona una nueva foto
   * antes de guardar los cambios
   */
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
      // El sistema valida que sea una imagen
      if (!file.type.startsWith('image/')) {
        console.warn('[KOHABITAR] Archivo seleccionado no es una imagen');
        alert('Por favor, selecciona solo archivos de imagen (JPG, PNG, GIF)');
        photoInput.value = '';
        return;
      }

      // El sistema valida el tamaño del archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        console.warn(`[KOHABITAR] Imagen demasiado grande: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        alert('La imagen es demasiado grande. El tamaño máximo es 5MB');
        photoInput.value = '';
        return;
      }

      // El sistema lee el archivo y muestra la previsualización
      console.info('[KOHABITAR] El sistema está cargando previsualización de la imagen');
      const reader = new FileReader();
      reader.onload = (ev) => {
        photoPreview.src = ev.target.result;
        photoPreview.style.display = 'block';
        console.info('[KOHABITAR] Previsualización de imagen cargada correctamente');
      };
      reader.onerror = (error) => {
        console.error('[KOHABITAR] Error al leer el archivo:', error);
        alert('Error al cargar la imagen. Por favor, intenta con otra imagen.');
      };
      reader.readAsDataURL(file);
    }
  });

  /**
   * PASO 3: GUARDAR CAMBIOS
   * El sistema envía los datos actualizados al backend cuando el usuario
   * hace clic en "Guardar cambios", usando autenticación JWT
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      // El sistema obtiene valores del formulario
      const formData = {
        // El sistema adapta nombres de campos del frontend al formato esperado por el backend
        full_name: form.profile_fullName.value.trim(),
        phone: form.profile_phone.value.trim(),
        email: form.profile_email.value.trim(),
        address: form.profile_address.value.trim(),
        profile_photo: null // Se maneja la foto por separado
      };

      // El sistema realiza validaciones básicas en el frontend
      if (!formData.full_name || !formData.phone || !formData.email) {
        console.warn('[KOHABITAR] Campos obligatorios incompletos');
        alert('Por favor, completa todos los campos obligatorios (Nombre completo, Teléfono y Email)');
        return;
      }

      // El sistema valida formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        console.warn('[KOHABITAR] Formato de email inválido:', formData.email);
        alert('Por favor, ingresa un correo electrónico válido');
        return;
      }

      // El sistema valida formato de teléfono (básico)
      const phoneRegex = /^[+]?[0-9\s-()]+$/;
      if (!phoneRegex.test(formData.phone)) {
        console.warn('[KOHABITAR] Formato de teléfono inválido:', formData.phone);
        alert('Por favor, ingresa un número de teléfono válido');
        return;
      }

      // El sistema registra el intento de actualización
      console.info('[KOHABITAR] El sistema está actualizando el perfil');
      console.info('[KOHABITAR] Datos a enviar:', formData);

      // El sistema construye la URL del endpoint para actualizar
      const updateUrl = `${URL_PROFILE}/${user_id}`;
      console.info('[KOHABITAR] Endpoint:', updateUrl);

      // El sistema hace petición PUT autenticada al backend
      // Se usa METHODS[2] que corresponde a PUT
      const response = await getServicesAuth(formData, METHODS[2], updateUrl, token);

      // El sistema registra el código de estado de la respuesta
      console.info(`[KOHABITAR] Respuesta del servidor - Status: ${response.status}`);

      // El sistema verifica errores HTTP específicos
      if (response.status === 404) {
        console.error('[KOHABITAR] Error 404: El perfil no existe');
        alert('El perfil no existe. Por favor, contacta al administrador.');
        return;
      }

      if (response.status === 401) {
        console.error('[KOHABITAR] Error 401: Sesión expirada');
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        window.location.href = '../../index.html';
        return;
      }

      if (!response.ok) {
        console.error(`[KOHABITAR] Error ${response.status}: Error al actualizar el perfil`);
        alert(`Error del servidor (${response.status}). Por favor, intenta nuevamente.`);
        return;
      }

      // El sistema intenta parsear la respuesta
      let result;
      try {
        result = await response.json();
        console.info('[KOHABITAR] Respuesta del servidor:', result);
      } catch (parseError) {
        console.error('[KOHABITAR] Error al parsear respuesta JSON:', parseError);
        alert('Error al procesar la respuesta del servidor.');
        return;
      }

      // El sistema verifica si hubo un error en la respuesta
      if (result.error) {
        console.error('[KOHABITAR] Error en la respuesta:', result.error);
        alert('Error al actualizar el perfil: ' + result.error);
        return;
      }

      // El sistema muestra mensaje de éxito
      console.info('[KOHABITAR] Perfil actualizado correctamente');
      alert('Perfil actualizado correctamente');

      // El sistema redirige a la página anterior
      window.history.back();

    } catch (error) {
      // El sistema maneja errores de red o del servidor
      console.error('[KOHABITAR] Error al actualizar el perfil:', error);
      alert('Error de conexión al actualizar el perfil. Por favor, verifica que el servidor esté ejecutándose e intenta nuevamente.');
    }
  });
});

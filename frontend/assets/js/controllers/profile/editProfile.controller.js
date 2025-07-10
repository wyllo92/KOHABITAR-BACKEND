// Controlador para editar el perfil del usuario autenticado

document.addEventListener('DOMContentLoaded', () => {
  let user_id = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
  // Si no se encuentra, intentar obtenerlo del parent window (por si está en iframe)
  if (!user_id && window.parent && window.parent !== window) {
    try {
      user_id = window.parent.localStorage.getItem('user_id') || window.parent.sessionStorage.getItem('user_id');
    } catch (e) {
      // Puede fallar por políticas de CORS
    }
  }
  console.log('User ID detectado para edición de perfil:', user_id);
  if (!user_id) {
    alert('No hay usuario autenticado.');
    window.location.href = '../auth/index.html';
    return;
  }

  const form = document.getElementById('editProfileForm');
  const photoInput = document.getElementById('profile_photo');
  const photoPreview = document.getElementById('profilePhotoPreview');

  let perfilExiste = false; // Nuevo: para saber si hay perfil

  // Cambia esta constante si tu backend corre en otro puerto o dominio
  const API_BASE = 'http://localhost:3000/api_v1';

  // Cargar datos actuales del perfil
  const url = `${API_BASE}/profile/${user_id}`;
  console.log('Consultando perfil en:', url);
  fetch(url)
    .then(res => {
      if (res.status === 404) {
        // No hay perfil, dejar el formulario vacío
        perfilExiste = false;
        return { data: null };
      }
      return res.json();
    })
    .then(data => {
      if (data.data) {
        perfilExiste = true;
        const p = data.data;
        form.profile_fullName.value = p.profile_fullName || '';
        form.profile_phone.value = p.profile_phone || '';
        form.profile_email.value = p.profile_email || '';
        form.profile_address.value = p.profile_address || '';
        if (p.profile_photo) {
          photoPreview.src = p.profile_photo;
          photoPreview.style.display = 'block';
        }
      } else {
        // No hay datos, formulario vacío para crear
        perfilExiste = false;
      }
    })
    .catch(err => {
      alert('Error al cargar el perfil.');
      console.error(err);
    });

  // Vista previa de la foto
  photoInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        photoPreview.src = e.target.result;
        photoPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    let profile_photo = '';
    const file = photoInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        profile_photo = ev.target.result;
        enviarDatos(profile_photo);
      };
      reader.readAsDataURL(file);
    } else {
      profile_photo = photoPreview.src || '';
      enviarDatos(profile_photo);
    }

    function enviarDatos(photoValue) {
      const payload = {
        profile_fullName: form.profile_fullName.value,
        profile_phone: form.profile_phone.value,
        profile_email: form.profile_email.value,
        profile_address: form.profile_address.value,
        profile_photo: photoValue
      };
      let fetchUrl = `${API_BASE}/profile/${user_id}`;
      let fetchOptions = {};
      if (perfilExiste) {
        // Actualizar (PUT)
        fetchOptions = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        };
      } else {
        // Crear (POST)
        fetchUrl = `${API_BASE}/profile`;
        fetchOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, user_id })
        };
      }
      fetch(fetchUrl, fetchOptions)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            alert('Error: ' + data.error);
          } else {
            alert(perfilExiste ? 'Perfil actualizado exitosamente' : 'Perfil creado exitosamente');
            window.history.back();
          }
        })
        .catch(() => alert('Error al guardar el perfil.'));
    }
  });
}); 
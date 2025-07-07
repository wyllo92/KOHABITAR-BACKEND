// Controlador para editar perfil

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('editProfileForm');
  const photoInput = document.getElementById('profile_photo');
  const photoPreview = document.getElementById('profilePhotoPreview');

  // Suponiendo que el user_id está en localStorage/sessionStorage
  const user_id = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
  if (!user_id) {
    alert('No se encontró el usuario.');
    window.location.href = '../../index.html';
    return;
  }

  // Cargar datos actuales del perfil
  fetch(`/api_v1/profile/${user_id}`)
    .then(res => res.json())
    .then(data => {
      if (data.data) {
        const p = data.data;
        form.profile_fullName.value = p.profile_fullName || '';
        form.profile_phone.value = p.profile_phone || '';
        form.profile_email.value = p.profile_email || '';
        form.profile_address.value = p.profile_address || '';
        if (p.profile_photo) {
          photoPreview.src = p.profile_photo;
          photoPreview.style.display = 'block';
        }
      }
    });

  // Previsualizar foto
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        photoPreview.src = ev.target.result;
        photoPreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });

  // Guardar cambios
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    // Si no se selecciona nueva foto, no enviar el campo vacío
    if (!photoInput.files[0]) {
      formData.delete('profile_photo');
    }
    fetch(`/api_v1/profile/${user_id}`, {
      method: 'PUT',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert('Error: ' + data.error);
        } else {
          alert('Perfil actualizado correctamente');
          window.history.back();
        }
      })
      .catch(() => alert('Error al actualizar el perfil.'));
  });
}); 
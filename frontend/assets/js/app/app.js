

async function checkAuth() {
  // Verificar si se está procesando un login activo
  // Esto previene condiciones de carrera cuando el login está guardando el token
  if (window.isProcessingLogin === true) {
    console.log('[checkAuth] Login en proceso, esperando...');
    // Esperar un poco y verificar de nuevo
    await new Promise(resolve => setTimeout(resolve, 300));
    // Si después de esperar aún está procesando, no hacer nada
    if (window.isProcessingLogin === true) {
      console.log('[checkAuth] Login aún en proceso, omitiendo verificación');
      return false;
    }
  }
  
  toggleLoading(true);
  const storage = new AppStorage();
  const getToken = storage.getItem(KEY_TOKEN);
  const moduleLogin = "auth/";
  const moduleDashboard = "/dashboard/";
  const getUrl = window.location.href;

  if (!getToken) {
    // No token found, redirecting to login page.
    if (!getUrl.includes(moduleLogin)) {
      window.location.href = `views/auth`;
    }
    toggleLoading(false);
    return false;
  }

  try {
    // Verify the token with the server
    let endpointUrl = HOST + "/validate-token/";
    const response = await getServicesAuth("", "POST", endpointUrl, getToken);
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Error al parsear respuesta de validación de token:', jsonError);
      // Si no se puede parsear, asumir que el token es inválido
      storage.removeItem(KEY_TOKEN);
      if (!getUrl.includes(moduleLogin)) {
        window.location.href = `views/auth`;
      }
      toggleLoading(false);
      return false;
    }

    if (data && data['valid']) {
      // Token is valid
      // Si estamos en la página de login y el token es válido, redirigir al dashboard
      if (getUrl.includes(moduleLogin)) {
        // Pequeño delay para evitar condiciones de carrera con el proceso de login
        setTimeout(() => {
          window.location.href = '../../';
        }, 200);
        toggleLoading(false);
        return true;
      }
      // Si no estamos en login, continuar normalmente
      toggleLoading(false);
      return true;
    } else {
      // Token is invalid, redirect to login page
      storage.removeItem(KEY_TOKEN);
      if (!getUrl.includes(moduleLogin)) {
        window.location.href = `views/auth`;
      }
      toggleLoading(false);
      return false;
    }
  } catch (error) {
    console.error('Error al validar token:', error);
    // En caso de error de red, no redirigir si ya estamos en login
    // Solo limpiar el token si hay un error claro de autenticación
    if (error.message && error.message.includes('401')) {
      storage.removeItem(KEY_TOKEN);
      if (!getUrl.includes(moduleLogin)) {
        window.location.href = `views/auth`;
      }
    }
    toggleLoading(false);
    return false;
  }
}

const loadingScreen = document.getElementById('loading-screen');
// Function to show/hide the loader
function toggleLoading(show) {
  loadingScreen.style.display = show ? 'flex' : 'none';
}

function fadeOut(element, duration) {
  let opacity = 1;
  const interval = 10; // Adjust interval to control speed
  const steps = duration / interval;
  let currentStep = 0;

  const fadeInterval = setInterval(() => {
    if (currentStep >= steps) {
      clearInterval(fadeInterval);
      element.style.display = 'none';
    } else {
      opacity -= 1 / steps;
      element.style.opacity = opacity;
      currentStep++;
    }
  }, interval);
}

function fadeInElement(element, duration = 1000) {
  element.style.display = "block";
  var opacity = 0;
  var interval = 50; // Adjust the interval for speed
  var steps = duration / interval;
  var currentStep = 0;
  
  var fadeInterval = setInterval(function() {
    if (currentStep >= steps) {
      clearInterval(fadeInterval);
      element.style.opacity = 1;
    } else {
      opacity += 1 / steps;
      element.style.opacity = opacity;
      currentStep++;
    }
  }, interval);
}
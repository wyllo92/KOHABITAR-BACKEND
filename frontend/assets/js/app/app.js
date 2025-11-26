

async function checkAuth() {
  toggleLoading(true);
  const storage = new AppStorage();
  const getToken = storage.getItem(KEY_TOKEN);
  const moduleLogin = "auth/";
  const moduleDashboard = "/dashboard/";
  const getUrl = window.location.href;

  if (!getToken) {
    // El sistema verifica si no hay token y redirige a la página de login
    // No token found, redirecting to login page.
    if (!getUrl.includes(moduleLogin)) {
      // El sistema detecta si está en Live Server o servidor normal
      const isLiveServer = getUrl.includes('127.0.0.1:5500') || getUrl.includes('localhost:5500');
      if (isLiveServer) {
        window.location.href = `/frontend/views/auth/`;
      } else {
        window.location.href = `./views/auth/`;
      }
    }
    toggleLoading(false);
    return false;
  }

  try {
    // Verify the token with the server
    let endpointUrl = HOST + "/validate-token/";
    const response = getServicesAuth("", "POST", endpointUrl, getToken);

    response.then(response => {
      return response.json();
    }).then(data => {

      //console.log(data['valid']);
      if (data['valid']) {
        // Token is valid, redirect to dashboard if not already there

        if (getUrl.includes(moduleLogin)) {
          window.history.back();
          window.history.forward();
          return true;
        }
      } else {
        // El sistema limpia el token inválido y redirige a la página de login
        storage.removeItem(KEY_TOKEN);
        // El sistema detecta si está en Live Server o servidor normal
        const isLiveServer = getUrl.includes('127.0.0.1:5500') || getUrl.includes('localhost:5500');
        if (isLiveServer) {
          window.location.href = `/frontend/views/auth/`;
        } else {
          window.location.href = `./views/auth/`;
        }
        return false;
      }


    }).catch(error => {
      console.log(error);
    }).finally(() => {
      //console.log("finally");
      toggleLoading(false);
    });
  } catch (error) {
    console.error('Error al validate token:', error);
    storage.removeItem(KEY_TOKEN);
    // El sistema detecta si está en Live Server o servidor normal y redirige apropiadamente
    const isLiveServer = getUrl.includes('127.0.0.1:5500') || getUrl.includes('localhost:5500');
    if (isLiveServer) {
      window.location.href = `/frontend/views/auth/`;
    } else {
      window.location.href = `./views/auth/`;
    }
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

/**
 * El sistema obtiene el token de autenticación del almacenamiento local.
 * @returns {string|null} Token de autenticación o null si no existe
 */
function getAuthToken() {
  const storage = new AppStorage();
  return storage.getItem(KEY_TOKEN);
}
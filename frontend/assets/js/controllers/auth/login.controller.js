document.addEventListener('DOMContentLoaded', async ()=> {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  // El sistema verifica la autenticación del usuario antes de mostrar la página
  // Si el usuario ya está autenticado, será redirigido automáticamente
  const isAuthenticated = await checkAuth();

  console.log('login controller has been loaded');

  // El sistema muestra gradualmente el formulario de login
  // utilizando un efecto de fade-in para mejorar la experiencia del usuario
  fadeInElement(document.querySelector('body'), 1000);

  // El sistema oculta la pantalla de carga después de verificar la autenticación
  toggleLoading(false);
});


const objForm = new Form('loginForm', 'edit-input');
const appStorage = new AppStorage();
const myForm = objForm.getForm();

let documentData = "";
let httpMethod = "";
let endpointUrl = "";

// Función para mostrar errores en el formulario
function showError(message) {
  const errorDiv = document.getElementById('loginError');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
  }
}

// Función para ocultar errores
function hideError() {
  const errorDiv = document.getElementById('loginError');
  if (errorDiv) {
    errorDiv.classList.add('d-none');
  }
}

// Función para mostrar/ocultar el spinner de carga
function toggleLoginSpinner(show) {
  const spinner = document.getElementById('loginSpinner');
  const button = document.getElementById('loginBtn');
  
  if (spinner && button) {
    if (show) {
      spinner.classList.remove('d-none');
      button.disabled = true;
      button.innerHTML = '<span class="spinner-border spinner-border-sm" id="loginSpinner"></span> Cargando...';
    } else {
      spinner.classList.add('d-none');
      button.disabled = false;
      button.innerHTML = 'Ingresar';
    }
  }
}

myForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError(); // Ocultar errores previos
  
  if (!objForm.validateForm()) {
    console.log("Error");
    return;
  }
  toggleLoginSpinner(true); // Mostrar spinner en el botón
  console.log("Login Form Submitted");
  httpMethod = METHODS[1]; // POST method
  endpointUrl = URL_LOGIN;
  documentData = objForm.getDataForm();
  
  try {
    // Primero intentar con usuarios normales
    const resultServices = await getDataServices(documentData, httpMethod, endpointUrl);
    const data = await resultServices.json();
    
    console.log('Login response:', data);
    
    if (resultServices.ok) {
      // Login exitoso con usuario normal
      if (data.user && data.user.token) {
        appStorage.setItem(KEY_TOKEN, data.user.token);
        if (data.user.id) {
          localStorage.setItem('user_id', data.user.id);
        }
        console.log("Login Success");
        // El sistema redirige al dashboard después del login exitoso
        const isLiveServer = window.location.href.includes('127.0.0.1:5500') || window.location.href.includes('localhost:5500');
        if (isLiveServer) {
          window.location.href = '/frontend/dashboard.html';
        } else {
          window.location.href = '../../dashboard.html';
        }
      } else {
        showError('Error en la respuesta del servidor. Por favor, contacta al administrador del sistema.');
      }
    } else {
      // Error en el login de usuario normal
      console.log("Error in normal user login:", data.error);
      
      // Si el usuario no se encuentra
      if (data.error === 'User not found') {
        const apiUserUrl = HOST + '/apiuser/login/';
        
        try {
          const apiUserResponse = await getDataServices(documentData, httpMethod, apiUserUrl);
          const apiUserData = await apiUserResponse.json();
          
          if (apiUserResponse.ok && apiUserData.user && apiUserData.user.token) {
            // Login exitoso
            appStorage.setItem(KEY_TOKEN, apiUserData.user.token);
            if (apiUserData.user.id) {
              localStorage.setItem('user_id', apiUserData.user.id);
            }
            console.log("Login Success");
            // El sistema redirige al dashboard después del login exitoso
            const isLiveServer = window.location.href.includes('127.0.0.1:5500') || window.location.href.includes('localhost:5500');
            if (isLiveServer) {
              window.location.href = '/frontend/dashboard.html';
            } else {
              window.location.href = '../../dashboard.html';
            }
          } else {
            if (apiUserData.error === 'Invalid password') {
              showError('La contraseña ingresada no es correcta. Verifica tu contraseña e intenta nuevamente.');
            } else if (apiUserData.error === 'User not found') {
              showError('El usuario ingresado no existe en el sistema. Verifica tu nombre de usuario o contacta al administrador.');
            } else {
              showError(apiUserData.error || 'Error en el inicio de sesión. Error de usuario.');
            }
          }
        } catch (apiError) {
          showError('Error de conexión al verificar credenciales. Verifica tu conexión a internet.');
        }
      } else if (data.error === 'Invalid password') {
        // Contraseña incorrecta para usuario normal
        showError('La contraseña ingresada no es correcta. Verifica tu contraseña e intenta nuevamente.');
      } else if (data.error === 'User not found') {
        // Usuario no encontrado
        showError('El usuario ingresado no existe en el sistema. Verifica tu nombre de usuario o contacta al administrador.');
      } else {
        // Otros errores específicos
        showError(data.error || 'Error en el inicio de sesión. Por favor, intenta nuevamente.');
      }
    }
  } catch (error) {
    console.log('Network error:', error);
    showError('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
  } finally {
    toggleLoginSpinner(false); // Ocultar spinner del botón
  }
});

window.addEventListener('load', () => {

});


document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
 
  await checkAuth();
  console.log('login controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

const objForm = new Form('loginForm', 'edit-input');
const appStorage = new AppStorage();
const myForm = objForm.getForm();

let documentData = "";
let httpMethod = "";
let endpointUrl = "";
let isProcessingLogin = false; // Flag para prevenir múltiples envíos simultáneos

// Exponer el flag globalmente para que checkAuth() pueda verificar
window.isProcessingLogin = false;

// Sistema de logging mejorado
const Logger = {
  info: (message, data = null) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  },
  error: (message, error = null) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    if (error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
  },
  warn: (message, data = null) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  },
  debug: (message, data = null) => {
    console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
  }
};

// Función mejorada para mostrar errores con más detalle
function showError(message, errorDetails = null) {
  const errorDiv = document.getElementById('loginError');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
    
    // Log detallado del error
    Logger.error('Error mostrado al usuario', {
      message: message,
      details: errorDetails,
      timestamp: new Date().toISOString()
    });
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
      Logger.debug('Spinner activado');
    } else {
      spinner.classList.add('d-none');
      button.disabled = false;
      button.innerHTML = 'Ingresar';
      Logger.debug('Spinner desactivado');
    }
  }
}

// Función auxiliar para parsear respuesta JSON de forma segura
async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type');
  
  // Clonar la respuesta para poder leerla múltiples veces si es necesario
  const clonedResponse = response.clone();
  
  try {
    const text = await response.text();
    
    if (!text) {
      throw new Error('Respuesta vacía del servidor');
    }
    
    // Verificar si el content-type es JSON (pero intentar parsear de todas formas)
    if (contentType && !contentType.includes('application/json')) {
      Logger.warn('Content-Type no es JSON', { contentType, textPreview: text.substring(0, 200) });
      // Intentar parsear de todas formas, algunos servidores no envían el header correcto
    }
    
    return JSON.parse(text);
  } catch (parseError) {
    // Si falla el parseo, intentar leer el texto de la respuesta clonada para logging
    try {
      const errorText = await clonedResponse.text();
      Logger.error('Error al parsear JSON', {
        error: parseError.message,
        responseText: errorText.substring(0, 500),
        contentType: contentType
      });
    } catch (readError) {
      Logger.error('Error al parsear JSON y leer respuesta', {
        parseError: parseError.message,
        readError: readError.message
      });
    }
    
    if (parseError instanceof SyntaxError) {
      throw new Error('La respuesta del servidor no es JSON válido');
    }
    throw new Error('Error al procesar la respuesta del servidor');
  }
}

// Función para intentar login con usuario normal
async function attemptNormalUserLogin(documentData, httpMethod, endpointUrl) {
  Logger.info('Intentando login con usuario normal', { endpoint: endpointUrl });
  
  try {
    // Agregar timeout a la petición (10 segundos)
    let resultServices;
    try {
      resultServices = await Promise.race([
        getDataServices(documentData, httpMethod, endpointUrl),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La petición tardó demasiado')), 10000)
        )
      ]);
    } catch (fetchError) {
      if (fetchError.name === 'AbortError' || fetchError.message.includes('Timeout')) {
        throw new Error('Timeout: La conexión tardó demasiado. Por favor, intenta nuevamente.');
      }
      // Si es un error de red (sin conexión, servidor no disponible, etc.)
      if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
        throw new Error('Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      throw fetchError;
    }
    
    // Parsear JSON de forma segura
    const data = await parseJsonResponse(resultServices);
    
    Logger.debug('Respuesta del servidor (usuario normal)', {
      status: resultServices.status,
      statusText: resultServices.statusText,
      ok: resultServices.ok,
      data: data
    });
    
    return { resultServices, data };
  } catch (error) {
    Logger.error('Error en la petición de login normal', {
      error: error.message,
      stack: error.stack,
      endpoint: endpointUrl
    });
    throw error;
  }
}

// Función para intentar login con API user
async function attemptApiUserLogin(documentData, httpMethod) {
  const apiUserUrl = HOST + '/apiuser/login/';
  Logger.info('Intentando login con API user', { endpoint: apiUserUrl });
  
  try {
    // Agregar timeout a la petición
    let apiUserResponse;
    try {
      apiUserResponse = await Promise.race([
        getDataServices(documentData, httpMethod, apiUserUrl),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La petición tardó demasiado')), 10000)
        )
      ]);
    } catch (fetchError) {
      if (fetchError.name === 'AbortError' || fetchError.message.includes('Timeout')) {
        throw new Error('Timeout: La conexión tardó demasiado. Por favor, intenta nuevamente.');
      }
      // Si es un error de red (sin conexión, servidor no disponible, etc.)
      if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
        throw new Error('Error de conexión: No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      throw fetchError;
    }
    
    // Parsear JSON de forma segura
    const apiUserData = await parseJsonResponse(apiUserResponse);
    
    Logger.debug('Respuesta del servidor (API user)', {
      status: apiUserResponse.status,
      statusText: apiUserResponse.statusText,
      ok: apiUserResponse.ok,
      data: apiUserData
    });
    
    return { apiUserResponse, apiUserData };
  } catch (error) {
    Logger.error('Error en la petición de login API user', {
      error: error.message,
      stack: error.stack,
      endpoint: apiUserUrl
    });
    throw error;
  }
}

// Función para procesar login exitoso
function processSuccessfulLogin(userData, userType) {
  if (userData.user && userData.user.token) {
    Logger.info(`Login exitoso - ${userType}`, {
      userId: userData.user.id,
      hasToken: true,
      tokenLength: userData.user.token.length
    });
    
    // Guardar token y datos del usuario de forma síncrona
    try {
      // Guardar el token
      appStorage.setItem(KEY_TOKEN, userData.user.token);
      
      // Verificar que el token se guardó correctamente
      const savedToken = appStorage.getItem(KEY_TOKEN);
      if (!savedToken || savedToken !== userData.user.token) {
        throw new Error('El token no se guardó correctamente en el almacenamiento');
      }
      
      Logger.debug('Token verificado en almacenamiento', { 
        tokenLength: savedToken.length,
        matches: savedToken === userData.user.token
      });
      
      if (userData.user.id) {
        localStorage.setItem('user_id', userData.user.id);
        Logger.debug('User ID almacenado en localStorage', { userId: userData.user.id });
      }
      
      Logger.info('Token guardado y verificado, redirigiendo al usuario a la página principal');
      
      // Limpiar el flag de procesamiento ANTES de redirigir
      isProcessingLogin = false;
      window.isProcessingLogin = false;
      
      // Usar un pequeño delay para asegurar que todas las operaciones se completen
      // y evitar que checkAuth() interfiera
      setTimeout(() => {
        // Verificar una última vez que el token sigue ahí antes de redirigir
        const finalTokenCheck = appStorage.getItem(KEY_TOKEN);
        if (finalTokenCheck && finalTokenCheck === userData.user.token) {
          Logger.info('Redirección final confirmada, token válido');
          window.location.href = '../../';
        } else {
          Logger.error('Token perdido antes de redirigir, reintentando guardado');
          appStorage.setItem(KEY_TOKEN, userData.user.token);
          window.location.href = '../../';
        }
      }, 150);
      
      return true;
    } catch (storageError) {
      Logger.error('Error al guardar token o datos del usuario', {
        error: storageError.message,
        stack: storageError.stack
      });
      showError(
        'Error al guardar la sesión. Por favor, intenta nuevamente.',
        { reason: 'Storage error', error: storageError }
      );
      isProcessingLogin = false;
      window.isProcessingLogin = false;
      toggleLoginSpinner(false);
      return false;
    }
  } else {
    Logger.error('Respuesta del servidor sin token o estructura incorrecta', {
      hasUser: !!userData.user,
      hasToken: !!(userData.user && userData.user.token),
      responseStructure: Object.keys(userData)
    });
    showError(
      'Error en la respuesta del servidor. Por favor, contacta al administrador del sistema.',
      { reason: 'Missing token or user data', response: userData }
    );
    isProcessingLogin = false;
    window.isProcessingLogin = false;
    toggleLoginSpinner(false);
    return false;
  }
}

// Función para manejar errores de login
function handleLoginError(errorType, errorData, source) {
  // Normalizar errorType y errorData
  const normalizedErrorType = typeof errorType === 'string' ? errorType : (errorType?.error || 'unknown');
  const normalizedErrorData = typeof errorData === 'string' ? errorData : (errorData?.error || errorData?.message || errorData);
  
  Logger.error(`Error de login desde ${source}`, {
    errorType: normalizedErrorType,
    errorData: normalizedErrorData,
    source: source
  });
  
  switch (normalizedErrorType) {
    case 'Invalid password':
      showError(
        'La contraseña ingresada no es correcta. Verifica tu contraseña e intenta nuevamente.',
        { errorType: normalizedErrorType, source }
      );
      break;
      
    case 'User not found':
      if (source === 'api_user') {
        showError(
          'El usuario ingresado no existe en el sistema. Verifica tu nombre de usuario o contacta al administrador.',
          { errorType: normalizedErrorType, source, triedBothEndpoints: true }
        );
      }
      // Si viene de usuario normal, no mostramos error aquí porque se intentará con API user
      break;
      
    case 'User account is not active':
      showError(
        'Tu cuenta de usuario está inactiva. Por favor, contacta al administrador del sistema.',
        { errorType: normalizedErrorType, source }
      );
      break;
      
    case 'network_error':
      const errorMessage = (errorData && typeof errorData === 'object' && errorData.message) 
        ? errorData.message 
        : (typeof normalizedErrorData === 'string' ? normalizedErrorData : 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
      showError(
        errorMessage,
        { errorType: normalizedErrorType, source, errorDetails: errorData }
      );
      break;
      
    default:
      const defaultMessage = typeof normalizedErrorData === 'string' 
        ? normalizedErrorData 
        : 'Error en el inicio de sesión. Por favor, intenta nuevamente.';
      showError(
        defaultMessage,
        { errorType: normalizedErrorType, source, customError: true }
      );
  }
}

myForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Prevenir múltiples envíos simultáneos
  if (isProcessingLogin) {
    Logger.warn('Intento de login mientras ya hay uno en proceso, ignorando...');
    return;
  }
  
  Logger.info('=== INICIO DE PROCESO DE LOGIN ===');
  Logger.debug('Datos del formulario', { 
    formId: myForm.id,
    timestamp: new Date().toISOString()
  });
  
  hideError();
  
  if (!objForm.validateForm()) {
    Logger.warn('Validación del formulario fallida');
    showError('Por favor completa todos los campos requeridos correctamente.');
    return;
  }
  
  // Marcar que estamos procesando el login (tanto local como global)
  isProcessingLogin = true;
  window.isProcessingLogin = true;
  toggleLoginSpinner(true);
  
  httpMethod = METHODS[1]; // POST method
  endpointUrl = URL_LOGIN;
  documentData = objForm.getDataForm();
  
  Logger.debug('Datos de login preparados', {
    method: httpMethod,
    endpoint: endpointUrl,
    hasData: !!documentData
  });
  
  try {
    // Intentar login con usuario normal
    const { resultServices, data } = await attemptNormalUserLogin(documentData, httpMethod, endpointUrl);
    
    // Validar que la respuesta tenga la estructura esperada
    if (!data || typeof data !== 'object') {
      Logger.error('Respuesta del servidor inválida', { data });
      showError('Error en la respuesta del servidor. Por favor, intenta nuevamente.');
      isProcessingLogin = false;
      window.isProcessingLogin = false;
      toggleLoginSpinner(false);
      return;
    }
    
    if (resultServices.ok) {
      // Validar estructura de respuesta exitosa
      if (!data.user || !data.user.token) {
        Logger.error('Respuesta exitosa pero sin token', { data });
        showError('Error en la respuesta del servidor. Por favor, contacta al administrador.');
        isProcessingLogin = false;
        window.isProcessingLogin = false;
        toggleLoginSpinner(false);
        return;
      }
      // Login exitoso con usuario normal
      processSuccessfulLogin(data, 'Usuario Normal');
    } else {
      // Error en el login de usuario normal
      Logger.warn('Login de usuario normal falló', {
        status: resultServices.status,
        error: data.error || 'Unknown error'
      });
      
      // Si el usuario no se encuentra, intentar con API user
      if (data.error === 'User not found') {
        Logger.info('Usuario no encontrado en endpoint normal, intentando con API user...');
        
        try {
          const { apiUserResponse, apiUserData } = await attemptApiUserLogin(documentData, httpMethod);
          
          // Validar estructura de respuesta de API user
          if (!apiUserData || typeof apiUserData !== 'object') {
            Logger.error('Respuesta de API user inválida', { apiUserData });
            showError('Error en la respuesta del servidor. Por favor, intenta nuevamente.');
            isProcessingLogin = false;
            window.isProcessingLogin = false;
            toggleLoginSpinner(false);
            return;
          }
          
          if (apiUserResponse.ok) {
            // Validar estructura de respuesta exitosa de API user
            if (!apiUserData.user || !apiUserData.user.token) {
              Logger.error('Respuesta de API user exitosa pero sin token', { apiUserData });
              showError('Error en la respuesta del servidor. Por favor, contacta al administrador.');
              isProcessingLogin = false;
              window.isProcessingLogin = false;
              toggleLoginSpinner(false);
              return;
            }
            // Login exitoso con API user
            processSuccessfulLogin(apiUserData, 'API User');
          } else {
            // Error en login de API user
            Logger.error('Login de API user también falló', {
              status: apiUserResponse.status,
              error: apiUserData.error || 'Unknown error'
            });
            handleLoginError(apiUserData.error || 'unknown', apiUserData, 'api_user');
          }
        } catch (apiError) {
          Logger.error('Excepción al intentar login con API user', apiError);
          handleLoginError('network_error', apiError, 'api_user');
        }
      } else {
        // Otros errores del usuario normal
        handleLoginError(data.error || 'unknown', data, 'normal_user');
      }
    }
  } catch (error) {
    Logger.error('Excepción general en el proceso de login', {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    });
    handleLoginError('network_error', error, 'general');
    // Limpiar flags en caso de error
    isProcessingLogin = false;
    window.isProcessingLogin = false;
  } finally {
    // Solo reactivar el botón si no fue un login exitoso (que ya redirige)
    // Si processSuccessfulLogin retorna true, ya se redirigió y no llegamos aquí
    if (isProcessingLogin) {
      isProcessingLogin = false;
      window.isProcessingLogin = false;
      toggleLoginSpinner(false);
    }
    Logger.info('=== FIN DE PROCESO DE LOGIN ===');
  }
});

window.addEventListener('load', () => {
  Logger.info('Window load event fired');
});
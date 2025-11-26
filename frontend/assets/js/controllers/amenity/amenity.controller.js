/**
 * El evento DOMContentLoaded se dispara cuando el documento HTML ha sido completamente cargado.
 * Este es el punto de entrada principal del controlador de frontend para zonas comunes (amenities).
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Se oculta el body inicialmente para evitar parpadeos durante la carga
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  // Se verifica la autenticación del usuario antes de mostrar el contenido
  // Esta función valida el token almacenado en localStorage
  await checkAuth();
  console.log('Amenity controller has been loaded');

  // Inicializar la vista solo después de verificar la autenticación
  await initializeAmenityView();

  // Se aplica un efecto de transición suave para mostrar el contenido
  fadeInElement(document.querySelector('body'), 1000);
});

/**
 * FUNCIÓN DE INICIALIZACIÓN DE LA VISTA
 * 
 * Carga todos los datos iniciales necesarios para la vista de zonas comunes.
 * Solo se ejecuta después de que la autenticación haya sido verificada.
 */
async function initializeAmenityView() {
  try {
    // El sistema verifica que existe un token válido antes de hacer peticiones
    const token = getAuthToken();
    if (!token) {
      console.error('El sistema no encontró token de autenticación disponible');
      // El sistema carga datos vacíos para evitar errores en la interfaz
      createTable({ data: [] });
      createSelectAmenityType({ data: [] });
      createSelectTariff({ data: [] });
      createSelectStatus({ data: [] });
      return;
    }

    console.log('El sistema inicia la carga de datos de zonas comunes');

    // El sistema carga el listado inicial de zonas comunes
    await loadViewAsync();

    // El sistema carga los tipos de zonas comunes para el formulario
    getDataAmenityType();

    // El sistema carga las tarifas para el formulario
    getDataTariff();

    // El sistema carga los estados para el formulario
    getDataStatus();
    
    console.log('El sistema completó la inicialización de la vista de zonas comunes');
    
  } catch (error) {
    console.error('El sistema encontró error al inicializar la vista de zonas comunes:', error);
    // El sistema carga datos vacíos en caso de error
    createTable({ data: [] });
    createSelectAmenityType({ data: [] });
    createSelectTariff({ data: [] });
    createSelectStatus({ data: [] });
  }
}

/**
 * SECCIÓN DE INICIALIZACIÓN DE OBJETOS Y VARIABLES GLOBALES
 *
 * Aquí se definen todos los objetos y variables que se utilizarán a lo largo del controlador.
 * Estos elementos permiten la interacción con el DOM y la gestión del estado de la aplicación.
 */

// Se instancia el objeto Form que maneja las validaciones y datos del formulario
const objForm = new Form('amenityForm', 'edit-input');

// Se crea una instancia del modal de Bootstrap para mostrar/ocultar el formulario
const objModal = new bootstrap.Modal(document.getElementById('appModal'));

// Se obtiene la referencia al tbody de la tabla donde se listarán las zonas comunes
const objTableBody = document.getElementById('app-table-body');

// Se obtiene el elemento select para los tipos de zonas comunes
const objSelectAmenityType = document.getElementById('amenity_type_id');

// Se obtiene el elemento select para las tarifas
const objSelectTariff = document.getElementById('tariff_id');

// Se obtiene el elemento select para los estados
const objSelectStatus = document.getElementById('status_id');

// Se obtiene la referencia al formulario HTML
const myForm = objForm.getForm();

// Mensaje de confirmación para eliminar zonas comunes
const textConfirm = "¿Estás seguro de que deseas eliminar esta zona común?";

// Selector de la tabla para inicializar DataTable
const appTable = "#app-table";

/**
 * VARIABLES DE ESTADO PARA OPERACIONES CRUD
 *
 * insertUpdate: Indica si se está insertando (true) o actualizando (false)
 * keyId: Almacena el ID de la zona común cuando se edita
 * documentData: Almacena temporalmente los datos que se enviarán al backend
 * httpMethod: Define el método HTTP (GET, POST, PUT, DELETE) para cada operación
 * endpointUrl: Contiene la URL completa del endpoint del backend a consultar
 */
let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

/**
 * VARIABLE GLOBAL PARA ALMACENAR TODOS LOS DATOS
 *
 * Esta variable guarda TODAS las zonas comunes obtenidas del backend.
 * Se utiliza para aplicar filtros sin necesidad de hacer nuevas peticiones al servidor.
 *
 
 * - Mejora el rendimiento: No necesitamos llamar al backend cada vez que filtramos
 * - Respuesta instantánea: El filtrado es inmediato porque los datos ya están en memoria
 * - Reduce carga del servidor: Hacemos solo UNA petición inicial
 */
let allAmenitiesData = [];

/**
 * MANEJO DEL EVENTO SUBMIT DEL FORMULARIO
 *
 * Esta función se ejecuta cuando el usuario envía el formulario (crear o actualizar zona común).
 * Es el punto de conexión principal entre el frontend y el backend.
 */
myForm.addEventListener('submit', (e) => {
  // Previene el comportamiento por defecto del formulario (recargar la página)
  e.preventDefault();

  // Valida los campos del formulario antes de enviar los datos
  if (!objForm.validateForm()) {
    console.log("Error en validación del formulario");
    return;
  }

  // Muestra el indicador de carga mientras se procesa la petición
  toggleLoading(true);

  /**
   * CONFIGURACIÓN DE LA PETICIÓN HTTP SEGÚN LA OPERACIÓN
   *
   * Si insertUpdate es true: Se está creando una nueva zona común
   *   - Método HTTP: POST
   *   - Endpoint: http://localhost:3000/api_v1/amenities (URL_AMENITY de constants.js)
   *   - Backend: AmenityController.register() en amenity.controller.js línea 19
   *
   * Si insertUpdate es false: Se está actualizando una zona común existente
   *   - Método HTTP: PUT
   *   - Endpoint: http://localhost:3000/api_v1/amenities/:id
   *   - Backend: AmenityController.update() en amenity.controller.js línea 95
   */
  if (insertUpdate) {
    console.log("Insertando nueva zona común");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_AMENITY; // http://localhost:3000/api_v1/amenities
  } else {
    console.log("Actualizando zona común");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_AMENITY + "/" + keyId; // Añade el ID: /api_v1/amenities/:id
  }

  // El sistema obtiene todos los datos del formulario en formato JSON
  documentData = objForm.getDataForm();
  
  // El sistema limpia y valida los datos antes de enviarlos
  const cleanedData = {
    name: documentData.name ? documentData.name.trim() : '',
    capacity: documentData.capacity ? parseInt(documentData.capacity) : null,
    description: documentData.description ? documentData.description.trim() : '',
    amenity_photo: documentData.amenity_photo ? documentData.amenity_photo.trim() : '',
    status_id: documentData.status_id ? parseInt(documentData.status_id) : null,
    tariff_id: documentData.tariff_id ? parseInt(documentData.tariff_id) : null,
    amenity_type_id: documentData.amenity_type_id ? parseInt(documentData.amenity_type_id) : null
  };

  // El sistema elimina campos nulos o vacíos (excepto los obligatorios)
  const finalData = {};
  Object.keys(cleanedData).forEach(key => {
    const value = cleanedData[key];
    // El sistema incluye campos obligatorios aunque estén vacíos para que el backend valide
    if (key === 'name' || key === 'status_id') {
      finalData[key] = value;
    } else if (value !== null && value !== '') {
      finalData[key] = value;
    }
  });

  console.log('El sistema obtuvo datos originales del formulario:', documentData);
  console.log('El sistema limpió y preparó datos para envío:', finalData);

  // El sistema actualiza documentData con los datos limpios
  documentData = finalData;

  // El sistema valida que los datos obligatorios estén presentes
  if (!documentData.name || documentData.name.trim() === '') {
    alert('Error: El nombre de la zona común es obligatorio');
    toggleLoading(false);
    return;
  }

  if (!documentData.status_id) {
    alert('Error: Debe seleccionar un estado para la zona común');
    toggleLoading(false);
    return;
  }

  // El sistema valida que la capacidad sea un número válido si está presente
  if (documentData.capacity && (isNaN(documentData.capacity) || documentData.capacity <= 0)) {
    alert('Error: La capacidad debe ser un número válido mayor a 0');
    toggleLoading(false);
    return;
  }

  console.log('El sistema validó los datos correctamente. Datos finales a enviar:', {
    operacion: insertUpdate ? 'CREAR' : 'ACTUALIZAR',
    endpoint: endpointUrl,
    metodo: httpMethod,
    datos: documentData,
    camposObligatorios: {
      nombre: documentData.name,
      estado: documentData.status_id
    },
    camposOpcionales: {
      tipo: documentData.amenity_type_id || 'No seleccionado',
      capacidad: documentData.capacity || 'No especificada',
      descripcion: documentData.description || 'Sin descripción',
      tarifa: documentData.tariff_id || 'Sin tarifa',
      foto: documentData.amenity_photo || 'Sin foto'
    }
  });

  // El sistema obtiene el token de autenticación
  const token = getAuthToken();
  
  // El sistema verifica que existe un token antes de hacer la petición
  if (!token) {
    console.error('El sistema no encontró token de autenticación para envío de formulario');
    alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
    toggleLoading(false);
    return;
  }

  /**
   * LLAMADA AL SERVICIO WEB (BACKEND)
   *
   * El sistema usa getServicesAuth() que:
   * 1. Prepara la petición HTTP con los headers necesarios
   * 2. Incluye el token de autenticación en el header Authorization
   * 3. Envía los datos en formato JSON al backend
   * 4. Retorna una promesa con la respuesta del servidor
   *
   * El backend recibe la petición en:
   * - POST /api_v1/amenities → AmenityController.register() → AmenityModel.create()
   * - PUT /api_v1/amenities/:id → AmenityController.update() → AmenityModel.update()
   */
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices.then(response => {
    // El sistema verifica si la respuesta es exitosa
    if (!response.ok) {
      // El sistema maneja diferentes tipos de errores HTTP
      if (response.status === 400) {
        console.error('Datos enviados al servidor:', documentData);
        console.error('Endpoint utilizado:', endpointUrl);
        console.error('Método HTTP:', httpMethod);
        console.error('Operación:', insertUpdate ? 'CREAR' : 'ACTUALIZAR');
        if (!insertUpdate) {
          console.error('ID de zona común a actualizar:', keyId);
        }
        
        return response.json().then(errorData => {
          console.error('Respuesta de error del servidor:', errorData);
          
          // El sistema extrae el mensaje específico del error
          const errorMessage = errorData.error || errorData.message || 'Error desconocido del servidor';
          throw new Error(`Error de validación: ${errorMessage}`);
        }).catch(jsonError => {
          console.error('No se pudo parsear la respuesta de error:', jsonError);
          throw new Error('Error 400: El servidor rechazó los datos enviados. Verifique que todos los campos obligatorios estén completos.');
        });
      }
      if (response.status === 401) {
        console.error('El sistema detectó error de autenticación en submit');
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }
      if (response.status === 404) {
        console.error('El sistema no encontró el recurso solicitado');
        throw new Error('La zona común no fue encontrada en el servidor');
      }
      throw new Error(`El sistema recibió error HTTP ${response.status}`);
    }
    // El sistema convierte la respuesta del servidor de texto a objeto JSON
    return response.json();
  }).then(data => {
    /**
     * PROCESAMIENTO DE LA RESPUESTA DEL BACKEND
     *
     * El backend devuelve un JSON con la estructura:
     * - Éxito: { success: true, message: "Operación exitosa", data: {...} }
     * - Error: { success: false, error: "Mensaje de error específico" }
     */
    console.log('El sistema recibió respuesta del servidor:', data);
    
    // El sistema verifica si la operación fue exitosa
    if (data.success === false || data.error) {
      const errorMessage = data.error || data.message || 'Error desconocido del servidor';
      console.error('El servidor reportó error en la operación:', errorMessage);
      alert(`Error del servidor: ${errorMessage}`);
    } else {
      const successMessage = data.message || 
        (insertUpdate ? 'Zona común creada exitosamente' : 'Zona común actualizada exitosamente');
      console.log('El sistema completó la operación exitosamente:', successMessage);
      alert(successMessage);
    }
  }).catch(error => {
    // El sistema captura errores de red o errores en el procesamiento de la respuesta
    console.error('Tipo de error:', error.name);
    console.error('Mensaje de error:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Datos que se intentaron enviar:', documentData);
    console.error('Endpoint:', endpointUrl);
    console.error('Método:', httpMethod);
        
    // El sistema proporciona mensaje de error específico según el tipo
    if (error.message.includes('Error de validación')) {
      alert(error.message);
    } else if (error.message.includes('Failed to fetch')) {
      alert('Error de conexión con el servidor. Verifique:\n- Su conexión a internet\n- Que el servidor esté funcionando\n- Que el endpoint sea correcto');
    } else if (error.message.includes('NetworkError')) {
      alert('Error de red. Verifique su conexión a internet.');
    } else {
      alert(`Error en la operación: ${error.message}\n\nSi el problema persiste, contacte al administrador del sistema.`);
    }
  }).finally(() => {
    // Se ejecuta siempre, haya error o no
    // Recarga la vista para mostrar los datos actualizados
    loadView();
    // Cierra el modal del formulario
    showHiddenModal(false);
  });
});

/**
 * FUNCIÓN PARA AGREGAR UNA NUEVA ZONA COMÚN
 *
 * Prepara el formulario para la creación de una nueva zona común.
 * Esta función es llamada cuando el usuario hace clic en el botón "Agregar".
 */
function add() {
  // Muestra el modal con el formulario
  showHiddenModal(true);

  // Establece el modo en "insertar" (no actualizar)
  insertUpdate = true;

  // Limpia todos los campos del formulario
  objForm.resetForm();

  // Habilita todos los campos del formulario para permitir la entrada de datos
  objForm.enabledForm();

  // Habilita el botón de guardar
  objForm.enabledButton();

  // Muestra el botón de guardar
  objForm.showButton();
}

/**
 * FUNCIÓN PARA VER LOS DETALLES DE UNA ZONA COMÚN
 *
 * Muestra los datos de una zona común específica en modo de solo lectura.
 * No permite editar los datos, solo visualizarlos.
 *
 * @param {number} id - El ID de la zona común a visualizar
 *
 * Flujo de conexión con backend:
 * 1. Llama a getDataId(id)
 * 2. getDataId hace petición GET a /api_v1/amenities/:id
 * 3. Backend ejecuta AmenityController.findById()
 * 4. El controlador consulta AmenityModel.findByIdActive()
 * 5. Devuelve los datos de la zona común
 */
function showId(id) {
  // Limpia el formulario antes de cargar los datos
  objForm.resetForm();

  // Deshabilita todos los campos para que no se puedan editar
  objForm.disabledForm();

  // Deshabilita el botón de guardar
  objForm.disabledButton();

  // Oculta el botón de guardar (modo solo lectura)
  objForm.hiddenButton();

  // Obtiene y carga los datos de la zona común desde el backend
  getDataId(id);
}

/**
 * FUNCIÓN PARA EDITAR UNA ZONA COMÚN EXISTENTE
 *
 * Prepara el formulario para la edición de una zona común existente.
 * Carga los datos actuales y permite modificarlos.
 *
 * @param {number} id - El ID de la zona común a editar
 *
 * Flujo de conexión con backend:
 * 1. getDataId(id) obtiene los datos actuales (GET /api_v1/amenities/:id)
 * 2. Al enviar el formulario, se usa PUT /api_v1/amenities/:id
 * 3. Backend ejecuta AmenityController.update()
 */
function edit(id) {
  // Establece el modo en "actualizar" (no insertar)
  insertUpdate = false;

  // Limpia el formulario
  objForm.resetForm();

  // Habilita los campos editables del formulario
  objForm.enabledEditForm();

  // Habilita el botón de guardar
  objForm.enabledButton();

  // Muestra el botón de guardar
  objForm.showButton();

  // Guarda el ID de la zona común que se está editando
  keyId = id;

  // Obtiene los datos actuales de la zona común desde el backend
  getDataId(id);
}

/**
 * FUNCIÓN PARA ELIMINAR UNA ZONA COMÚN
 *
 * Elimina una zona común del sistema después de confirmar la acción con el usuario.
 *
 * @param {number} id - El ID de la zona común a eliminar
 *
 * Conexión con el backend:
 * - Método HTTP: DELETE
 * - Endpoint: http://localhost:3000/api_v1/amenities/:id (URL_AMENITY + id)
 * - Backend: AmenityController.delete() en amenity.controller.js línea 159
 * - El controlador verifica que la zona común exista usando AmenityModel.findById()
 * - Luego ejecuta AmenityModel.delete() para eliminarla de la base de datos
 * - Respuesta del backend: { message: "Zona común eliminada con éxito", data: {...} }
 */
function delete_(id) {
  // Prepara el formulario (limpia y habilita campos)
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();

  // Solicita confirmación al usuario antes de eliminar
  if (confirm(textConfirm)) {
    // El sistema no envía datos en el body para una petición DELETE
    documentData = "";

    // El sistema configura la petición DELETE al backend
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = URL_AMENITY + "/" + id; // Construye la URL con el ID: /api_v1/amenities/:id

    // El sistema obtiene el token de autenticación
    const token = getAuthToken();
    
    // El sistema verifica que existe un token antes de hacer la petición
    if (!token) {
      console.error('El sistema no encontró token de autenticación para delete');
      alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
      return;
    }

    // El sistema realiza la petición autenticada al backend
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

    resultServices.then(response => {
      // Convierte la respuesta a JSON
      return response.json();
    }).then(data => {
      /**
       * Procesa la respuesta del backend
       *
       * Respuestas posibles:
       * - Éxito: { message: "Zona común eliminada con éxito", data: {...} }
       * - Error 404: { error: "Zona común no existe" }
       * - Error 500: { error: "Internal Server Error" }
       */
      console.log('Respuesta de eliminación:', data);
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert(data.message || 'zona común eliminada exitosamente');
      }
    }).catch(error => {
      // Maneja errores de red o de procesamiento
      console.log('Error al eliminar:', error);
      alert('Error al eliminar. Por favor, inténtalo de nuevo.');
    }).finally(() => {
      // Recarga la tabla para reflejar los cambios
      loadView();
    });
  } else {
    // El usuario canceló la operación
    console.log("Operación cancelada");
  }
}

/**
 * FUNCIÓN PARA OBTENER LOS DATOS DE UNA ZONA COMÚN ESPECÍFICA
 *
 * Consulta el backend para obtener los detalles de una zona común por su ID.
 * Esta función es utilizada tanto para visualizar como para editar una zona común.
 *
 * @param {number} id - El ID de la zona común a consultar
 *
 * Conexión con el backend:
 * - Método HTTP: GET
 * - Endpoint: http://localhost:3000/api_v1/amenities/:id (URL_AMENITY + id)
 * - Backend: AmenityController.findById() en amenity.controller.js línea 197
 * - El controlador ejecuta AmenityModel.findByIdActive() para obtener solo zonas comunes activas
 * - Respuesta del backend:
 *   {
 *     message: "Zona común encontrada",
 *     data: {
 *       amenity_id: 1,
 *       name: "Piscina",
 *       capacity: 50,
 *       description: "Piscina principal",
 *       amenity_photo: "url_foto",
 *       status_id: 1,
 *       tariff_id: 2,
 *       amenity_type_id: 3
 *     }
 *   }
 */
function getDataId(id) {
  // El sistema no envía datos en el body para una petición GET
  documentData = "";

  // El sistema configura la petición GET al backend
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_AMENITY + "/" + id; // Construye la URL: /api_v1/amenities/:id

  // El sistema obtiene el token de autenticación
  const token = getAuthToken();
  
  // El sistema verifica que existe un token antes de hacer la petición
  if (!token) {
    console.error('El sistema no encontró token de autenticación para getDataId');
    alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
    return;
  }

  // El sistema realiza la petición autenticada al backend
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices.then(response => {
    // El sistema verifica si la respuesta es exitosa
    if (!response.ok) {
      if (response.status === 401) {
        console.error('El sistema detectó error de autenticación en getDataId');
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }
      if (response.status === 404) {
        console.error('El sistema no encontró la zona común solicitada');
        alert('La zona común no fue encontrada.');
        return;
      }
      throw new Error(`El sistema recibió error HTTP: ${response.status}`);
    }
    // El sistema convierte la respuesta a JSON
    return response.json();
  }).then(data => {
    /**
     * Procesa la respuesta del backend
     *
     * El backend devuelve la zona común dentro de la propiedad 'data'
     * Si no encuentra la zona común, devuelve un error 404
     */
    console.log('Datos de la zona común:', data);
    if (data.data) {
      // Extrae los datos de la zona común
      let getData = data.data;

      // Carga los datos en el formulario HTML
      // Este método llena cada campo del formulario con los valores correspondientes
      objForm.setDataFormJson(getData);
    } else {
      alert('Error: No se encontraron datos de la zona común');
    }
  }).catch(error => {
    // Maneja errores de red o de procesamiento
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos de la zona común');
  }).finally(() => {
    // Muestra el modal con los datos cargados
    showHiddenModal(true);
  });
}

/**
 * FUNCIÓN PARA OBTENER TODAS LAS ZONAS COMUNES
 *
 * Consulta el backend para obtener el listado completo de zonas comunes activas.
 * Esta función se ejecuta al cargar la página y después de cada operación CRUD.
 *
 * Conexión con el backend:
 * - Método HTTP: GET
 * - Endpoint: http://localhost:3000/api_v1/amenities (URL_AMENITY de constants.js)
 * - Backend: AmenityController.show() en amenity.controller.js línea 67
 * - El controlador ejecuta AmenityModel.showActive() para obtener todas las zonas comunes activas
 * - El modelo realiza un JOIN con las tablas:
 *   * amenity_types (para obtener el tipo de zona común)
 *   * properties (para obtener la propiedad asociada)
 *   * status (para obtener el estado activo/inactivo)
 * - Respuesta del backend:
 *   {
 *     success: true,
 *     message: "Zonas comunes traídas con éxito",
 *     data: [
 *       {
 *         amenity_id: 1,
 *         name: "Piscina",
 *         capacity: 50,
 *         Amenity_Type_name: "Recreación",
 *         property_name: "Conjunto Residencial Los Robles",
 *         status_name: "Activo"
 *       },
 *       ...
 *     ]
 *   }
 */
function getData() {
  // El sistema no envia datos en el body para una petición GET
  documentData = "";

  // El sistema configura la petición GET al backend
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_AMENITY; // http://localhost:3000/api_v1/amenities
  
  // El sistema obtiene el token de autenticación
  const token = getAuthToken();
  
  // Verificar que tenemos un token antes de hacer la petición
  if (!token) {
    console.error('No authentication token available for getData');
    // Ocultar loading y mostrar mensaje de error
    toggleLoading(false);
    return;
  }
  
  // El sistema realiza la petición autenticada al backend
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices.then(response => {
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      if (response.status === 401) {
        console.error('Authentication failed - redirecting to login');
        // Limpiar token inválido y redirigir
        const storage = new AppStorage();
        storage.removeItem(KEY_TOKEN);
        window.location.href = './views/auth/';
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Convierte la respuesta a JSON
    return response.json();
  }).then(data => {
    /**
     * Procesa la respuesta del backend
     *
     * Los datos vienen en el formato { success: true, message: "...", data: [...] }
     * donde 'data' es un array con todas las zonas comunes
     */
    console.log('Datos recibidos del backend:', data);

    /**
     * GUARDAR DATOS EN VARIABLE GLOBAL
     *
     * Guardamos TODOS los datos recibidos del backend en la variable global
     * allAmenitiesData para poder filtrarlos sin hacer nuevas peticiones al servidor.
     */
    allAmenitiesData = data.data || [];
    console.log('Datos guardados en allAmenitiesData:', allAmenitiesData);

    // Llama a createTable para renderizar los datos en la tabla HTML
    createTable(data);

    /**
     * Inicializa o reinicializa DataTable
     *
     * DataTable es una librería de jQuery que añade funcionalidades a la tabla:
     * - Paginación
     * - Búsqueda
     * - Ordenamiento de columnas
     */
    if ($.fn.DataTable.isDataTable(appTable)) {
      // Si DataTable ya existe, se destruye primero para evitar conflictos
      $(appTable).DataTable().destroy();
    }
    // Crea una nueva instancia de DataTable
    new DataTable(appTable);
  }).catch(error => {
    // Maneja errores de red o de procesamiento
    console.log('Error al obtener datos:', error);
    alert('Error al cargar los datos de zonas comunes');
  }).finally(() => {
    // Oculta el indicador de carga
    toggleLoading(false);
  });
}

/**
 * FUNCIÓN PARA RENDERIZAR LA TABLA DE ZONAS COMUNES
 *
 * Recibe los datos del backend y crea las filas HTML de la tabla.
 * Cada fila incluye botones para ver, editar y eliminar la zona común.
 *
 * @param {Object} data - Objeto de respuesta del backend con la estructura:
 *   {
 *     success: true,
 *     message: "Zonas comunes traídas con éxito",
 *     data: [...]  // Array de zonas comunes
 *   }
 *
 * Estructura de cada zona común en el array:
 * {
 *   amenity_id: 1,
 *   name: "Piscina",
 *   Amenity_Type_name: "Recreación",
 *   property_name: "Conjunto Las Margaritas",
 *   capacity: 50,
 *   status_name: "Activo"
 * }
 */
function createTable(data) {
  // Limpia el contenido previo de la tabla
  objTableBody.innerHTML = "";

  // Extrae el array de zonas comunes de la respuesta del backend
  let getData = data.data || [];
  console.log('Datos para crear tabla:', getData);

  // Verifica si hay datos para mostrar
  if (getData.length === 0) {
    console.log('No hay datos para mostrar');
    // Muestra un mensaje en la tabla si no hay datos
    objTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay zonas comunes disponibles</td></tr>';
    return;
  }

  // Itera sobre cada zona común recibida del backend
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Fila actual:', row);

    /**
     * Determina el estado visual de la zona común
     *
     * El backend envía el campo 'status_name' con diferentes valores.
     * Aplicamos una clase CSS y un icono diferente según el estado:
     * - "Disponible" → badge bg-success (verde) + icono check-circle
     * - "Reservada" → badge bg-info (azul) + icono calendar-check
     * - "En Mantenimiento" → badge bg-warning (amarillo) + icono tools
     * - "Cerrada" → badge bg-danger (rojo) + icono times-circle
     * - "Fuera de Servicio" → badge bg-dark (negro) + icono ban
     * - Otro → badge bg-secondary (gris) + icono question
     *
     * ¿QUÉ ES UN BADGE?
     * Un badge es una pequeña etiqueta con fondo de color que hace que
     * el estado sea más visible y fácil de identificar.
     */
    const statusActive = row.status_name || 'N/A';

    let statusClass = 'badge bg-secondary';  // Valor por defecto (gris)
    let statusIcon = 'fa-question';          // Icono por defecto

    // Asignamos clase e icono según el estado
    switch(statusActive) {
      case 'Disponible':
        statusClass = 'badge bg-success';
        statusIcon = 'fa-check-circle';
        break;
      case 'Reservada':
        statusClass = 'badge bg-info';
        statusIcon = 'fa-calendar-check';
        break;
      case 'En Mantenimiento':
        statusClass = 'badge bg-warning text-dark';
        statusIcon = 'fa-tools';
        break;
      case 'Cerrada':
        statusClass = 'badge bg-danger';
        statusIcon = 'fa-times-circle';
        break;
      case 'Fuera de Servicio':
        statusClass = 'badge bg-dark';
        statusIcon = 'fa-ban';
        break;
    }

    /**
     * Construye la fila HTML con los datos de la zona común
     *
     * Cada fila incluye:
     * - ID de la zona común
     * - Nombre
     * - Tipo de zona común (del JOIN con amenity_types)
     * - Capacidad
     * - Tarifa (nombre y monto)
     * - Estado (Activo/Inactivo con color)
     * - Foto (thumbnail si existe)
     * - Botones de acción (Ver, Editar, Eliminar)
     */

    // Formatear la información de tarifa
    const tariffInfo = row.tariff_name
      ? `${row.tariff_name}${row.tariff_amount ? ' - $' + row.tariff_amount.toLocaleString() : ''}`
      : 'Sin tarifa';

    // Mostrar foto como thumbnail o icono si no existe
    const photoCell = row.amenity_photo
      ? `<img src="${row.amenity_photo}" alt="Foto" class="img-thumbnail" style="max-width: 50px; max-height: 50px; cursor: pointer;" onclick="window.open('${row.amenity_photo}', '_blank')" title="Click para ampliar">`
      : '<i class="fas fa-image text-muted" title="Sin foto"></i>';

    /**
     * CONSTRUIR LA FILA HTML
     *
     * Ahora incluimos el badge con icono para el estado.
     * El badge hace que el estado sea más visible y atractivo.
     */
    let dataRow = `<tr>
      <td>${row.amenity_id || row.id}</td>
      <td>${row.name || 'N/A'}</td>
      <td>${row.amenity_type_name || 'N/A'}</td>
      <td>${row.capacity || 'N/A'}</td>
      <td>${tariffInfo}</td>
      <td>
        <span class="${statusClass}">
          <i class="fas ${statusIcon} me-1"></i>${statusActive}
        </span>
      </td>
      <td class="text-center">${photoCell}</td>
      <td>
        <button type="button" title="Ver zona común" class="btn btn-success btn-sm" onclick="showId(${row.amenity_id || row.id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar zona común" class="btn btn-primary btn-sm" onclick="edit(${row.amenity_id || row.id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar zona común" class="btn btn-danger btn-sm" onclick="delete_(${row.amenity_id || row.id})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;

    // Añade la fila HTML al cuerpo de la tabla
    objTableBody.innerHTML += dataRow;
  }
}

/**
 * FUNCIÓN PARA CARGAR LOS TIPOS DE ZONAS COMUNES EN EL SELECT
 *
 * Recibe los tipos de zonas comunes del backend y los renderiza en un elemento <select>.
 * Este select se utiliza en el formulario para que el usuario elija el tipo de zona común.
 *
 * @param {Object} data - Objeto de respuesta del backend con los tipos de zonas comunes
 *
 * Estructura de datos esperada:
 * {
 *   data: [
 *     { amenity_type_id: 1, amenity_type_name: "Recreación" },
 *     { amenity_type_id: 2, amenity_type_name: "Deportiva" },
 *     ...
 *   ]
 * }
 */
function createSelectAmenityType(data) {
  // Inicializa el select con una opción por defecto
  objSelectAmenityType.innerHTML = "<option value='' selected disabled>Selecciona el tipo</option>";

  // Extrae el array de tipos de zonas comunes
  let getData = data.data || [];

  // Si no hay tipos disponibles, no hace nada
  if (getData.length === 0) return;

  // Itera sobre cada tipo de zona común y crea una opción en el select
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Crea una opción con el ID como valor y el nombre como texto visible
    let dataRow = `<option value="${row.amenity_type_id || row.id}">${row.amenity_type_name || row.name || 'Tipo ' + (row.amenity_type_id || row.id)}</option>`;
    objSelectAmenityType.innerHTML += dataRow;
  }
}

/**
 * FUNCIÓN PARA MOSTRAR U OCULTAR EL MODAL
 *
 * Controla la visibilidad del modal que contiene el formulario de zona común.
 *
 * @param {boolean} type - true para mostrar, false para ocultar
 */
function showHiddenModal(type) {
  if (type) {
    objModal.show();
  } else {
    objModal.hide();
  }
}

/**
 * FUNCIÓN PARA RECARGAR LA VISTA
 *
 * El sistema recarga todos los datos de las zonas comunes desde el backend.
 * Se llama después de cada operación CRUD para refrescar la tabla.
 */
function loadView() {
  // El sistema llama a getData() que hace la petición al backend
  getData();

  // El sistema muestra el indicador de carga
  toggleLoading(true);
}

/**
 * FUNCIÓN ASÍNCRONA PARA CARGAR LA VISTA
 *
 * El sistema proporciona una versión asíncrona de loadView para mejor control
 * de la secuencia de carga durante la inicialización.
 */
async function loadViewAsync() {
  return new Promise((resolve, reject) => {
    // El sistema no envia datos en el body para una petición GET
    documentData = "";
    httpMethod = METHODS[0]; // GET method
    endpointUrl = URL_AMENITY;
    
    const token = getAuthToken();
    if (!token) {
      console.error('El sistema no encontró token para loadViewAsync');
      createTable({ data: [] });
      resolve({ data: [] });
      return;
    }
    
    toggleLoading(true);
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

    resultServices.then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          console.error('El sistema detectó error de autenticación en loadViewAsync');
          return { data: [] };
        }
        throw new Error(`El sistema recibió error HTTP: ${response.status}`);
      }
      return response.json();
    }).then(data => {
      allAmenitiesData = data.data || [];
      console.log('El sistema cargó', allAmenitiesData.length, 'zonas comunes en loadViewAsync');
      createTable(data);
      
      if ($.fn.DataTable.isDataTable(appTable)) {
        $(appTable).DataTable().destroy();
      }
      new DataTable(appTable);
      
      resolve(data);
    }).catch(error => {
      console.log('El sistema encontró error en loadViewAsync:', error);
      createTable({ data: [] });
      reject(error);
    }).finally(() => {
      toggleLoading(false);
    });
  });
}

/**
 * FUNCIÓN PARA OBTENER LOS TIPOS DE ZONAS COMUNES
 *
 * Consulta el backend para obtener el catálogo de tipos de zonas comunes.
 * Estos tipos se utilizan para llenar el select del formulario.
 *
 * Conexión con el backend:
 * - Método HTTP: GET
 * - Endpoint: http://localhost:3000/api_v1/amenityType/ (URL_AMENITY_TYPE)
 * - Backend: El sistema tiene un controlador similar para amenityType
 * - Respuesta esperada:
 *   {
 *     data: [
 *       { amenity_type_id: 1, amenity_type_name: "Recreación" },
 *       { amenity_type_id: 2, amenity_type_name: "Deportiva" },
 *       ...
 *     ]
 *   }
 *
 * Nota: Este endpoint debe existir en el backend y estar configurado en las rutas.
 * Ver amenityType.router.js para la configuración de rutas de tipos de zonas comunes.
 */
function getDataAmenityType() {
  // El sistema no envia datos en el body
  documentData = "";

  // El sistema configura la petición GET con el endpoint correcto para tipos activos
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_AMENITY_TYPE + "/active"; // Usa la ruta /active para obtener solo tipos activos

  // El sistema obtiene el token de autenticación
  const token = getAuthToken();
  
  // El sistema verifica que existe un token antes de hacer la petición
  if (!token) {
    console.error('El sistema no encontró token de autenticación para getDataAmenityType');
    // El sistema carga opciones por defecto si no hay token
    createSelectAmenityType({ data: [] });
    return;
  }

  // El sistema realiza la petición autenticada al backend
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices.then(response => {
    // El sistema verifica si la respuesta es exitosa
    if (!response.ok) {
      if (response.status === 401) {
        console.error('El sistema detectó fallo de autenticación en getDataAmenityType');
        return { data: [] };
      }
      if (response.status === 404) {
        console.warn('El sistema no encontró el endpoint de tipos de zonas comunes (404)');
        return { data: [] };
      }
      throw new Error(`El sistema recibió error HTTP: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    // El sistema procesa la respuesta y llena el select
    console.log('El sistema obtuvo datos de tipos de zona común:', data);
    createSelectAmenityType(data || { data: [] });
  }).catch(error => {
    // El sistema maneja errores y carga opciones vacías
    console.log('El sistema encontró error al obtener tipos de zona común:', error);
    createSelectAmenityType({ data: [] });
  });
}

/**
 * FUNCIÓN PARA OBTENER LAS TARIFAS
 *
 * Consulta el backend para obtener el catálogo de tarifas disponibles.
 * Estas tarifas se utilizan para llenar el select del formulario.
 *
 * Conexión con el backend:
 * - Método HTTP: GET
 * - Endpoint: http://localhost:3000/api_v1/tariff/ (URL_TARIFF)
 * - Respuesta esperada:
 *   {
 *     data: [
 *       { tariff_id: 1, name: "Gratuita", amount: 0 },
 *       { tariff_id: 2, name: "Tarifa General", amount: 50000 },
 *       ...
 *     ]
 *   }
 */
function getDataTariff() {
  // El sistema no envia datos en el body
  documentData = "";

  // El sistema configura la petición GET
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_TARIFF;

  // El sistema obtiene el token de autenticación
  const token = getAuthToken();
  
  // El sistema verifica que existe un token antes de hacer la petición
  if (!token) {
    console.error('El sistema no encontró token de autenticación para getDataTariff');
    createSelectTariff({ data: [] });
    return;
  }

  // El sistema realiza la petición autenticada al backend
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices.then(response => {
    // El sistema verifica si la respuesta es exitosa
    if (!response.ok) {
      if (response.status === 401) {
        console.error('El sistema detectó fallo de autenticación en getDataTariff');
        return { data: [] };
      }
      throw new Error(`El sistema recibió error HTTP: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    // El sistema procesa la respuesta y llena el select
    console.log('El sistema obtuvo datos de tarifas:', data);
    createSelectTariff(data || { data: [] });
  }).catch(error => {
    // El sistema maneja errores
    console.log('El sistema encontró error al obtener tarifas:', error);
    createSelectTariff({ data: [] });
  });
}

/**
 * FUNCIÓN PARA CARGAR LOS DATOS DE TARIFAS EN EL SELECT
 *
 * Recibe las tarifas del backend y las renderiza en el elemento <select>.
 *
 * @param {Object} data - Objeto de respuesta del backend con las tarifas
 */
function createSelectTariff(data) {
  // Inicializa el select con una opción por defecto
  objSelectTariff.innerHTML = "<option value='' selected>Sin tarifa</option>";

  // Extrae el array de tarifas
  let getData = data.data || [];

  // Si no hay tarifas disponibles, no hace nada
  if (getData.length === 0) return;

  // Itera sobre cada tarifa y crea una opción en el select
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Muestra el nombre de la tarifa y el monto si existe
    const tariffText = row.name + (row.amount ? ' - $' + row.amount.toLocaleString() : '');
    let dataRow = `<option value="${row.tariff_id || row.id}">${tariffText}</option>`;
    objSelectTariff.innerHTML += dataRow;
  }
}

/**
 * FUNCIÓN PARA OBTENER LOS ESTADOS
 *
 * Consulta el backend para obtener el catálogo de estados disponibles.
 * Estos estados se utilizan para llenar el select del formulario.
 *
 * Conexión con el backend:
 * - Método HTTP: GET
 * - Endpoint: http://localhost:3000/api_v1/status/ (URL_STATUS)
 * - Respuesta esperada:
 *   {
 *     data: [
 *       { status_id: 1, name: "Activo" },
 *       { status_id: 2, name: "Inactivo" },
 *       ...
 *     ]
 *   }
 */
function getDataStatus() {
  // El sistema no envia datos en el body
  documentData = "";

  // El sistema configura la petición GET con filtro de entidad amenity
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_STATUS + '?entity=amenity';

  // El sistema obtiene el token de autenticación
  const token = getAuthToken();
  
  // El sistema verifica que existe un token antes de hacer la petición
  if (!token) {
    console.error('El sistema no encontró token de autenticación para getDataStatus');
    createSelectStatus({ data: [] });
    return;
  }

  // El sistema realiza la petición autenticada al backend
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices.then(response => {
    // El sistema verifica si la respuesta es exitosa
    if (!response.ok) {
      if (response.status === 401) {
        console.error('El sistema detectó fallo de autenticación en getDataStatus de zona comun');
        return { data: [] };
      }
      throw new Error(`El sistema recibió error HTTP: ${response.status}`);
    }
    return response.json();
  }).then(data => {
    // El sistema procesa la respuesta y llena el select
    console.log('El sistema obtuvo datos de estados de zona comun:', data);
    createSelectStatus(data || { data: [] });
  }).catch(error => {
    // El sistema maneja errores
    console.log('El sistema encontró error al obtener estados de zona comun:', error);
    createSelectStatus({ data: [] });
  });
}

/**
 * FUNCIÓN PARA CARGAR LOS DATOS DE ESTADOS EN EL SELECT
 *
 * Recibe los estados del backend y los renderiza en el elemento <select>.
 *
 * @param {Object} data - Objeto de respuesta del backend con los estados
 */
function createSelectStatus(data) {
  // Inicializa el select con una opción por defecto
  objSelectStatus.innerHTML = "<option value='' selected disabled>Selecciona el estado</option>";

  // Extrae el array de estados
  let getData = data.data || [];

  // Si no hay estados disponibles, no hace nada
  if (getData.length === 0) return;

  // Itera sobre cada estado y crea una opción en el select
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.status_id || row.id}">${row.name}</option>`;
    objSelectStatus.innerHTML += dataRow;
  }
}

/**
 * Esta función filtra las zonas comunes según el estado seleccionado por el usuario.
 * Es llamada cuando el usuario hace clic en alguno de los botones de filtro.
 *
 * @param {string} statusName - El nombre del estado a filtrar ('Disponible', 'Cerrada', 'all')
 *
 *
 * PASO 1: Recibe el nombre del estado
 *   - Si el usuario hace clic en "Disponible" → statusName = 'Disponible'
 *   - Si hace clic en "Todos" → statusName = 'all'
 *
 * PASO 2: Filtra los datos guardados en memoria (allAmenitiesData)
 *   - Usa la función .filter() de JavaScript que revisa cada elemento del array
 *   - Si statusName es 'all', NO filtra nada (muestra todos)
 *   - Si statusName es un estado específico, solo deja pasar los que coincidan
 *
 * PASO 3: Crea un nuevo objeto con los datos filtrados
 *   - Mantiene la misma estructura que el backend: { data: [...] }
 *
 * PASO 4: Vuelve a renderizar la tabla con los datos filtrados
 *   - Llama a createTable() con los nuevos datos
 *   - La tabla se actualiza mostrando solo las zonas comunes que coinciden con el filtro
 *
 * PASO 5: Actualiza el estilo de los botones
 *   - Marca el botón seleccionado como "activo"
 *   - Desmarca los demás botones
 */
function filterByStatus(statusName) {
  console.log('Estado seleccionado:', statusName);
  console.log('Total de zonas comunes en memoria:', allAmenitiesData.length);

  // El sistema verifica si hay datos cargados
  if (!allAmenitiesData || allAmenitiesData.length === 0) {
    console.warn('El sistema no tiene datos para filtrar, recargando datos...');
    // El sistema intenta recargar los datos si están vacíos
    loadView();
    return;
  }

  /**
   * FILTRADO DE DATOS
   *
   * El sistema usa .filter() que es un método de JavaScript que:
   * 1. Revisa CADA elemento del array allAmenitiesData
   * 2. Para cada elemento, ejecuta una función (llamada "condición")
   * 3. Si la función devuelve true, el elemento se INCLUYE en el nuevo array
   * 4. Si devuelve false, el elemento se EXCLUYE
   */
  let filteredData;

  if (statusName === 'all') {
    // El sistema muestra todas las zonas comunes si se seleccionó "Todos"
    filteredData = allAmenitiesData;
    console.log('El sistema muestra TODAS las zonas comunes (sin filtro)');
  } else {
    // El sistema filtra por el estado específico seleccionado
    filteredData = allAmenitiesData.filter(amenity => {
      // El sistema verifica si el status_name de esta amenidad coincide con el filtro
      return amenity.status_name === statusName;
    });
    console.log(`El sistema encontró ${filteredData.length} zonas comunes con estado "${statusName}"`);
  }

  /**
   * El sistema crea objeto con la misma estructura del backend
   * La función createTable() espera recibir un objeto con estructura { data: [...] }
   */
  const dataToRender = {
    data: filteredData
  };

  // El sistema actualiza la tabla con los datos filtrados
  createTable(dataToRender);

  /**
   * El sistema reinicializa DataTable para mantener funcionalidades de
   * búsqueda, paginación y ordenamiento con los nuevos datos filtrados
   */
  if ($.fn.DataTable.isDataTable(appTable)) {
    $(appTable).DataTable().destroy();
  }
  new DataTable(appTable);

  // El sistema actualiza los estilos de los botones para mostrar el filtro activo
  updateFilterButtons(statusName);
}

/**
 * FUNCIÓN AUXILIAR: ACTUALIZAR ESTILOS DE LOS BOTONES DE FILTRO
 *
 * Esta función se encarga de cambiar el aspecto visual de los botones:
 * - Agrega la clase 'active' al botón seleccionado (lo hace verse presionado)
 * - Quita la clase 'active' de los demás botones
 *
 * @param {string} statusName - El nombre del estado del botón activo
 *
 * 1. Crear un "mapa" que relaciona cada estado con el ID de su botón
 * 2. Obteenr todos los botones de filtro del HTML
 * 3. Recorrer todos los botones y quitamos la clase 'active' de todos
 * 4. Agrear la clase 'active' solo al botón que fue seleccionado
 */
function updateFilterButtons(statusName) {
  /**
   * MAPA DE ESTADOS A IDs DE BOTONES
   *
   * Este objeto relaciona cada posible valor de statusName
   * con el ID del botón correspondiente en el HTML.
   *
   * - Si statusName = 'Disponible' → buscamos el botón con id='filter-disponible'
   * - Si statusName = 'all' → buscamos el botón con id='filter-all'
   */
  const buttonMap = {
    'all': 'filter-all',
    'Disponible': 'filter-disponible',
    'Reservada': 'filter-reservada',
    'En Mantenimiento': 'filter-mantenimiento',
    'Cerrada': 'filter-cerrada',
    'Fuera de Servicio': 'filter-fuera'
  };

  /**
   * OBTENER TODOS LOS BOTONES DE FILTRO
   *
   * Usamos querySelectorAll para obtener todos los elementos <button>
   * que estén dentro del div con clase 'btn-group'.
   */
  const allButtons = document.querySelectorAll('.btn-group button');

  /**
   * QUITAR LA CLASE 'active' DE TODOS LOS BOTONES
   *
   * Recorremos todos los botones y les quitamos la clase 'active'.
   * Esto hace que todos los botones se vean en su estado normal (no presionados).
   */
  allButtons.forEach(button => {
    button.classList.remove('active');
  });

  /**
   * AGREGAR LA CLASE 'active' AL BOTÓN SELECCIONADO
   *
   * 1. Buscamos el ID del botón correspondiente al estado seleccionado
   * 2. Obtenemos el elemento HTML con ese ID
   * 3. Le agregamos la clase 'active' para que se vea presionado
   */
  const activeButtonId = buttonMap[statusName];
  if (activeButtonId) {
    const activeButton = document.getElementById(activeButtonId);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }
}

/**
 * INICIALIZACIÓN AL CARGAR LA PÁGINA
 *
 * Este evento se ha movido a la función initializeAmenityView() para ejecutarse
 * solo después de verificar la autenticación. Esto previene los errores 401 Unauthorized.
 */
window.addEventListener('load', () => {
  // La inicialización ahora se maneja en DOMContentLoaded después de checkAuth()
  console.log('Page fully loaded - initialization already completed in DOMContentLoaded');
});

/**
 * El sistema exporta la lista de zonas comunes a formato PDF
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportAmenitiesToPDF() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a PDF
  const exportUrl = URL_EXPORT_AMENITIES;

  // El sistema realiza la petición HTTP al servidor con autenticación
  fetch(exportUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/pdf'
    }
  })
  .then(response => {
    // El sistema verifica si la respuesta del servidor fue exitosa
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    // El sistema convierte la respuesta a formato blob para descarga
    return response.blob();
  })
  .then(blob => {
    // El sistema crea una URL temporal para el archivo blob
    const url = window.URL.createObjectURL(blob);

    // El sistema crea un elemento anchor temporal para iniciar la descarga
    const a = document.createElement('a');
    a.href = url;

    // El sistema genera el nombre del archivo con la fecha actual
    const fecha = new Date().toISOString().split('T')[0];
    a.download = `zonas_comunes_${fecha}.pdf`;

    // El sistema añade el elemento al DOM, simula el click y lo elimina
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // El sistema libera la URL temporal del objeto blob
    window.URL.revokeObjectURL(url);

    // El sistema notifica al usuario que la descarga fue exitosa
    alert('PDF descargado exitosamente');
  })
  .catch(error => {
    // El sistema maneja errores durante el proceso de exportación
    console.error('Error al exportar PDF:', error);
    alert('Error al exportar el PDF. Por favor, inténtalo de nuevo.');
  })
  .finally(() => {
    // El sistema oculta el indicador de carga al finalizar
    toggleLoading(false);
  });
}

/**
 * El sistema exporta la lista de zonas comunes a formato Excel
 * Realiza una petición al endpoint de exportación y descarga el archivo generado
 */
function exportAmenitiesToExcel() {
  // El sistema muestra el indicador de carga durante la exportación
  toggleLoading(true);

  // El sistema obtiene el token de autenticación almacenado
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  // El sistema define la URL del endpoint de exportación a Excel
  const exportUrl = URL_EXPORT_AMENITIES_EXCEL;

  // El sistema realiza la petición HTTP al servidor con autenticación
  fetch(exportUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  })
  .then(response => {
    // El sistema verifica si la respuesta del servidor fue exitosa
    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }
    // El sistema convierte la respuesta a formato blob para descarga
    return response.blob();
  })
  .then(blob => {
    // El sistema crea una URL temporal para el archivo blob
    const url = window.URL.createObjectURL(blob);

    // El sistema crea un elemento anchor temporal para iniciar la descarga
    const a = document.createElement('a');
    a.href = url;

    // El sistema genera el nombre del archivo con la fecha actual
    const fecha = new Date().toISOString().split('T')[0];
    a.download = `zonas_comunes_${fecha}.xlsx`;

    // El sistema añade el elemento al DOM, simula el click y lo elimina
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // El sistema libera la URL temporal del objeto blob
    window.URL.revokeObjectURL(url);

    // El sistema notifica al usuario que la descarga fue exitosa
    alert('Excel descargado exitosamente');
  })
  .catch(error => {
    // El sistema maneja errores durante el proceso de exportación
    console.error('Error al exportar Excel:', error);
    alert('Error al exportar el Excel. Por favor, inténtalo de nuevo.');
  })
  .finally(() => {
    // El sistema oculta el indicador de carga al finalizar
    toggleLoading(false);
  });
}

/**
 * EXPOSICIÓN DE FUNCIONES AL SCOPE GLOBAL
 *
 * El sistema expone las funciones necesarias al objeto window para que estén
 * disponibles desde los eventos onclick en el HTML.
 */
window.filterByStatus = filterByStatus;
window.add = add;
window.showId = showId;
window.edit = edit;
window.delete_ = delete_;
window.exportAmenitiesToPDF = exportAmenitiesToPDF;
window.exportAmenitiesToExcel = exportAmenitiesToExcel; 
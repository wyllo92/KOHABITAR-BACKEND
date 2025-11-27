/**
 * El evento DOMContentLoaded se dispara cuando el documento HTML ha sido completamente cargado.
 * Este es el punto de entrada principal del controlador de frontend para facturas (invoices).
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Se oculta el body inicialmente para evitar parpadeos durante la carga
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;

  // Se verifica la autenticación del usuario antes de mostrar el contenido
  // Esta función valida el token almacenado en localStorage
  await checkAuth();
  console.log('Invoice controller has been loaded');

  // Se aplica un efecto de transición suave para mostrar el contenido
  fadeInElement(document.querySelector('body'), 1000);
});

/**
 * SECCIÓN DE INICIALIZACIÓN DE OBJETOS Y VARIABLES GLOBALES
 *
 * Aquí se definen todos los objetos y variables que se utilizarán a lo largo del controlador.
 * Estos elementos permiten la interacción con el DOM y la gestión del estado de la aplicación.
 */

// Se instancia el objeto Form que maneja las validaciones y datos del formulario
const objForm = new Form('invoiceForm', 'edit-input');

// Se crea una instancia del modal de Bootstrap para mostrar/ocultar el formulario
const objModal = new bootstrap.Modal(document.getElementById('appModal'));

// Se obtiene la referencia al tbody de la tabla donde se listarán las facturas
const objTableBody = document.getElementById('app-table-body');

// Se obtiene el elemento select para los usuarios
const objSelectUser = document.getElementById('user_id');

// Se obtiene el elemento select para las propiedades
const objSelectProperty = document.getElementById('property_id');

// Se obtiene el elemento select para las tarifas
const objSelectTariff = document.getElementById('tariff_id');

// Se obtiene el elemento select para los estados
const objSelectStatus = document.getElementById('status_id');

// Se obtiene la referencia al formulario HTML
const myForm = objForm.getForm();

// Mensaje de confirmación para eliminar facturas
const textConfirm = "¿Estás seguro de que deseas eliminar esta factura?";

// Selector de la tabla para inicializar DataTable
const appTable = "#app-table";

/**
 * VARIABLES DE ESTADO PARA OPERACIONES CRUD
 *
 * insertUpdate: Indica si se está insertando (true) o actualizando (false)
 * keyId: Almacena el ID de la factura cuando se edita
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
 * Esta variable guarda TODAS las facturas obtenidas del backend.
 * Se utiliza para aplicar filtros sin necesidad de hacer nuevas peticiones al servidor.
 *
 * - Mejora el rendimiento: No necesitamos llamar al backend cada vez que filtramos
 * - Respuesta instantánea: El filtrado es inmediato porque los datos ya están en memoria
 * - Reduce carga del servidor: Hacemos solo UNA petición inicial
 */
let allInvoicesData = [];

/**
 *
 * @param {Response} response - Objeto de respuesta HTTP del servidor
 * @param {string} operation - Descripción de la operación que se estaba realizando
 * @returns {Promise} - Promesa que resuelve con los datos JSON o rechaza con error
 */
function handleAuthenticatedResponse(response, operation = 'realizar la operación') {
  // Verifica si la respuesta es exitosa (códigos 200-299)
  if (!response.ok) {
    // Maneja específicamente el error 401 (No autorizado)
    if (response.status === 401) {
      console.log(`Error de autenticación al ${operation}: Token inválido o expirado`);
      alert('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
      // Redirecciona al login
      window.location.href = '/views/login.html';
      return Promise.reject(new Error('Sesión expirada'));
    }
    // Maneja otros errores HTTP
    console.log(`Error HTTP ${response.status} al ${operation}: ${response.statusText}`);
    return Promise.reject(new Error(`Error HTTP ${response.status}: ${response.statusText}`));
  }
  // Si la respuesta es exitosa, convierte a JSON
  return response.json();
}

/**
 * MANEJO DEL EVENTO SUBMIT DEL FORMULARIO
 *
 * Esta función se ejecuta cuando el usuario envía el formulario (crear o actualizar factura).
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
   * Si insertUpdate es true: Se está creando una nueva factura
   *   - Método HTTP: POST
   *   - Endpoint: http://localhost:3000/api_v1/invoice (URL_INVOICE de constants.js)
   *   - Backend: InvoiceController.createInvoice() en invoice.controller.js línea 150
   *
   * Si insertUpdate es false: Se está actualizando una factura existente
   *   - Método HTTP: PUT
   *   - Endpoint: http://localhost:3000/api_v1/invoice/:id
   *   - Backend: InvoiceController.updateInvoice() en invoice.controller.js línea 204
   */
  if (insertUpdate) {
    console.log("Insertando nueva factura");
    httpMethod = METHODS[1]; // POST method
    endpointUrl = URL_INVOICE; // http://localhost:3000/api_v1/invoice 
  } else {
    console.log("Actualizando factura");
    httpMethod = METHODS[2]; // PUT method
    endpointUrl = URL_INVOICE + "/" + keyId; // Añade el ID: /api_v1/invoice/:id
  }

  // Obtiene todos los datos del formulario en formato JSON
  documentData = objForm.getDataForm();
  console.log('Datos del formulario:', documentData);

  /**
   * LLAMADA AL SERVICIO WEB CON AUTENTICACIÓN (BACKEND)
   *
   * getServicesAuth() es una función definida en services.js que:
   * 1. Prepara la petición HTTP con los headers necesarios
   * 2. Incluye el token de autenticación en el header Authorization
   * 3. Envía los datos en formato JSON al backend
   * 4. Retorna una promesa con la respuesta del servidor
   *
   * El backend recibe la petición en:
   * - POST /api_v1/invoice → InvoiceController.createInvoice() → InvoiceModel.create()
   * - PUT /api_v1/invoice/:id → InvoiceController.updateInvoice() → InvoiceModel.update()
   */
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices
    .then(response => handleAuthenticatedResponse(response, 'enviar el formulario'))
    .then(data => {
    /**
     * PROCESAMIENTO DE LA RESPUESTA DEL BACKEND
     *
     * El backend devuelve un JSON con la estructura:
     * - Éxito: { success: true, message: "Factura creada exitosamente", data: {...} }
     * - Error: { success: false, message: "Error al crear la factura", error: "..." }
     */
    console.log('Respuesta del servidor:', data);
    if (data.error || !data.success) {
      alert('Error: ' + (data.error || data.message));
    } else {
      alert(data.message || 'Operación completada exitosamente');
    }
  }).catch(error => {
    // Captura errores de red o errores en el procesamiento de la respuesta
    console.log('Error en la operación:', error);
    alert('Error en la operación. Por favor, inténtalo de nuevo.');
  }).finally(() => {
    // Se ejecuta siempre, haya error o no
    // Recarga la vista para mostrar los datos actualizados
    loadView();
    // Cierra el modal del formulario
    showHiddenModal(false);
  });
});

/**
 * FUNCIÓN PARA AGREGAR UNA NUEVA FACTURA
 *
 * Prepara el formulario para la creación de una nueva factura.
 * Esta función es llamada cuando el usuario hace clic en el botón "Agregar".
 */
/**
 * FUNCIÓN PARA AGREGAR UNA NUEVA FACTURA
 *
 * Prepara el formulario para la creación de una nueva factura.
 * Esta función es llamada cuando el usuario hace clic en el botón "Agregar".
 *
 * IMPORTANTE: Se cargan dinámicamente todos los catálogos (usuarios, propiedades, 
 * tarifas, estados) para asegurar que la información esté actualizada cada vez
 * que se abre el modal. Esto es necesario porque:
 * 
 * 1. Los datos pueden haber cambiado desde la carga inicial de la página
 * 2. Otros usuarios pueden haber agregado/modificado registros
 * 3. El token de autenticación podría haber expirado
 * 4. Garantiza que los selects siempre tengan datos actualizados
 */
function add() {
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

  /**
   * CARGA DINÁMICA DE CATÁLOGOS
   *
   * Se recargan todos los catálogos necesarios para el formulario.
   * Esto asegura que los selects tengan datos actualizados del backend.
   * 
   * El sistema carga los catálogos en paralelo para mejorar el rendimiento,
   * pero muestra el modal inmediatamente para no afectar la experiencia del usuario.
   */
  
  // Se cargan los usuarios disponibles para el select
  loadUsersForForm();
  
  // Se cargan las propiedades disponibles para el select
  loadPropertiesForForm();
  
  // Se cargan las tarifas disponibles para el select
  loadTariffsForForm();
  
  // Se cargan los estados disponibles para el select
  loadStatusesForForm();

  // Se muestra el modal con el formulario después de iniciar la carga de datos
  showHiddenModal(true);
}

/**
 * FUNCIÓN PARA VER LOS DETALLES DE UNA FACTURA
 *
 * Muestra los datos de una factura específica en modo de solo lectura.
 * No permite editar los datos, solo visualizarlos.
 *
 * @param {number} id - El ID de la factura a visualizar
 *
 * Flujo de conexión con backend:
 * 1. Llama a getDataId(id)
 * 2. getDataId hace petición GET a /api_v1/invoice/:id
 * 3. Backend ejecuta InvoiceController.getInvoiceById()
 * 4. El controlador consulta InvoiceModel.findById()
 * 5. Devuelve los datos de la factura
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

  // Obtiene y carga los datos de la factura desde el backend
  getDataId(id);
}

/**
 * FUNCIÓN PARA EDITAR UNA FACTURA EXISTENTE
 *
 * Prepara el formulario para la edición de una factura existente.
 * Carga los datos actuales y permite modificarlos.
 *
 * @param {number} id - El ID de la factura a editar
 *
 * Flujo de conexión con backend:
 * 1. getDataId(id) obtiene los datos actuales (GET /api_v1/invoice/:id)
 * 2. Al enviar el formulario, se usa PUT /api_v1/invoice/:id
 * 3. Backend ejecuta InvoiceController.updateInvoice()
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

  // Guarda el ID de la factura que se está editando
  keyId = id;

  // Obtiene los datos actuales de la factura desde el backend
  getDataId(id);
}

/**
 * FUNCIÓN PARA ELIMINAR UNA FACTURA
 *
 * Elimina una factura del sistema después de confirmar la acción con el usuario.
 *
 * @param {number} id - El ID de la factura a eliminar
 *
 * Conexión con el backend:
 * - Método HTTP: DELETE
 * - Endpoint: http://localhost:3000/api_v1/invoice/:id (URL_INVOICE + id)
 * - Backend: InvoiceController.deleteInvoice() en invoice.controller.js línea 268
 * - El controlador verifica que la factura exista usando InvoiceModel.findById()
 * - Luego ejecuta InvoiceModel.delete() para eliminarla de la base de datos
 * - Respuesta del backend: { success: true, message: "Factura eliminada exitosamente" }
 */
function delete_(id) {
  // Prepara el formulario (limpia y habilita campos)
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();

  // Solicita confirmación al usuario antes de eliminar
  if (confirm(textConfirm)) {
    // No se envían datos en el body para una petición DELETE
    documentData = "";

    // Configura la petición DELETE al backend
    httpMethod = METHODS[3]; // DELETE method
    endpointUrl = URL_INVOICE + "/" + id; // Construye la URL con el ID: /api_v1/invoice/:id

    // Obtiene el token de autenticación del almacenamiento local
    const token = getAuthToken();

    // Realiza la petición al backend con autenticación
    const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

    resultServices
      .then(response => handleAuthenticatedResponse(response, 'eliminar la factura'))
      .then(data => {
      /**
       * Procesa la respuesta del backend
       *
       * Respuestas posibles:
       * - Éxito: { success: true, message: "Factura eliminada exitosamente" }
       * - Error 404: { success: false, message: "Factura no encontrada" }
       * - Error 500: { success: false, message: "Error al eliminar la factura", error: "..." }
       */
      console.log('Respuesta de eliminación:', data);
      if (data.error || !data.success) {
        alert('Error: ' + (data.error || data.message));
      } else {
        alert(data.message || 'Factura eliminada exitosamente');
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
 * FUNCIÓN PARA OBTENER LOS DATOS DE UNA FACTURA ESPECÍFICA
 *
 * Consulta el backend para obtener los detalles de una factura por su ID.
 * Esta función es utilizada tanto para visualizar como para editar una factura.
 *
 * @param {number} id - El ID de la factura a consultar
 *
 * Conexión con el backend:
 * - Método HTTP: GET
 * - Endpoint: http://localhost:3000/api_v1/invoice/:id (URL_INVOICE + id)
 * - Backend: InvoiceController.getInvoiceById() en invoice.controller.js línea 111
 * - El controlador ejecuta InvoiceModel.findById() para obtener la factura
 * - Respuesta del backend:
 *   {
 *     success: true,
 *     message: "Factura obtenida exitosamente",
 *     data: {
 *       invoice_id: 1,
 *       user_id: 5,
 *       property_id: 3,
 *       tariff_id: 2,
 *       amount: 150000,
 *       due_date: "2025-12-31",
 *       status_id: 1,
 *       username: "john_doe",
 *       full_name: "John Doe",
 *       property_name: "Apartamento 101",
 *       tariff_name: "Mantenimiento Mensual",
 *       status_name: "Pendiente"
 *     }
 *   }
 */
function getDataId(id) {
  // No se envían datos en el body para una petición GET
  documentData = "";

  // Configura la petición GET al backend
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_INVOICE + "/" + id; // Construye la URL: /api_v1/invoice/:id

  // Obtiene el token de autenticación del almacenamiento local
  const token = getAuthToken();

  // Realiza la petición al backend con autenticación
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices
    .then(response => handleAuthenticatedResponse(response, 'obtener los datos de la factura'))
    .then(data => {
    /**
     * Procesa la respuesta del backend
     *
     * El backend devuelve la factura dentro de la propiedad 'data'
     * Si no encuentra la factura, devuelve un error 404
     */
    console.log('Datos de la factura:', data);
    if (data.data) {
      // Extrae los datos de la factura
      let getData = data.data;

      // Carga los datos en el formulario HTML
      // Este método llena cada campo del formulario con los valores correspondientes
      objForm.setDataFormJson(getData);
    } else {
      alert('Error: No se encontraron datos de la factura');
    }
  }).catch(error => {
    // Maneja errores de red o de procesamiento
    console.log('Error al obtener datos:', error);
    alert('Error al obtener los datos de la factura');
  }).finally(() => {
    // Muestra el modal con los datos cargados
    showHiddenModal(true);
  });
}

/**
 * FUNCIÓN PARA OBTENER TODAS LAS FACTURAS
 *
 * Consulta el backend para obtener el listado completo de facturas.
 * Esta función se ejecuta al cargar la página y después de cada operación CRUD.
 *
 * Conexión con el backend:
 * - Método HTTP: GET
 * - Endpoint: http://localhost:3000/api_v1/invoice (URL_INVOICE de constants.js)
 * - Backend: InvoiceController.getAllInvoices() en invoice.controller.js línea 21
 * - El controlador ejecuta InvoiceModel.show() para obtener todas las facturas
 * - El modelo realiza un JOIN con las tablas:
 *   * users (para obtener el nombre de usuario)
 *   * profiles (para obtener el nombre completo)
 *   * properties (para obtener el nombre de la propiedad)
 *   * tariffs (para obtener el nombre y monto de la tarifa)
 *   * statuses (para obtener el estado)
 * - Respuesta del backend:
 *   {
 *     success: true,
 *     message: "Facturas obtenidas exitosamente",
 *     data: [
 *       {
 *         invoice_id: 1,
 *         user_id: 5,
 *         username: "john_doe",
 *         full_name: "John Doe",
 *         property_id: 3,
 *         property_name: "Apartamento 101",
 *         tariff_id: 2,
 *         tariff_name: "Mantenimiento Mensual",
 *         tariff_amount: 150000,
 *         amount: 150000,
 *         due_date: "2025-12-31",
 *         status_id: 1,
 *         status_name: "Pendiente"
 *       },
 *       ...
 *     ]
 *   }
 */
function getData() {
  // No se envían datos en el body para una petición GET
  documentData = "";

  // Configura la petición GET al backend
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_INVOICE; // http://localhost:3000/api_v1/invoice

  // Obtiene el token de autenticación del almacenamiento local
  const token = getAuthToken();

  // Realiza la petición al backend con autenticación
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices
    .then(response => handleAuthenticatedResponse(response, 'obtener las facturas'))
    .then(data => {
    /**
     * Procesa la respuesta del backend
     *
     * Los datos vienen en el formato { success: true, message: "...", data: [...] }
     * donde 'data' es un array con todas las facturas
     */
    console.log('Datos recibidos del backend:', data);

    /**
     * GUARDAR DATOS EN VARIABLE GLOBAL
     *
     * Guardamos TODOS los datos recibidos del backend en la variable global
     * allInvoicesData para poder filtrarlos sin hacer nuevas peticiones al servidor.
     */
    allInvoicesData = data.data || [];
    console.log('Datos guardados en allInvoicesData:', allInvoicesData);

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
    alert('Error al cargar los datos de facturas');
  }).finally(() => {
    // Oculta el indicador de carga
    toggleLoading(false);
  });
}

/**
 * FUNCIÓN PARA RENDERIZAR LA TABLA DE FACTURAS
 *
 * Recibe los datos del backend y crea las filas HTML de la tabla.
 * Cada fila incluye botones para ver, editar y eliminar la factura.
 *
 * @param {Object} data - Objeto de respuesta del backend con la estructura:
 *   {
 *     success: true,
 *     message: "Facturas obtenidas exitosamente",
 *     data: [...]  // Array de facturas
 *   }
 *
 * Estructura de cada factura en el array:
 * {
 *   invoice_id: 1,
 *   username: "john_doe",
 *   full_name: "John Doe",
 *   property_name: "Apartamento 101",
 *   amount: 150000,
 *   due_date: "2025-12-31",
 *   tariff_name: "Mantenimiento Mensual",
 *   tariff_amount: 150000,
 *   status_name: "Pendiente"
 * }
 */
/**
 * El sistema formatea una fecha en formato legible en español
 * Convierte fechas ISO (2024-11-17) o datetime (2024-11-17T14:30:00) a formato DD/MM/YYYY
 * @param {string} dateString - Cadena de fecha en formato ISO
 * @returns {string} - Fecha formateada en español o el valor original si no es válido
 */
function formatDate(dateString) {
  // El sistema verifica que la fecha no esté vacía
  if (!dateString || dateString === '' || dateString === 'null') {
    return 'N/A';
  }

  try {
    // El sistema crea un objeto Date a partir de la cadena recibida
    const date = new Date(dateString);

    // El sistema verifica que la fecha sea válida
    if (isNaN(date.getTime())) {
      return dateString;
    }

    // El sistema extrae los componentes de la fecha
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    // El sistema retorna la fecha formateada en formato DD/MM/YYYY
    return `${day}/${month}/${year}`;
  } catch (error) {
    // El sistema retorna el valor original si ocurre un error
    console.error('Error al formatear fecha:', error);
    return dateString;
  }
}

function createTable(data) {
  // Limpia el contenido previo de la tabla
  objTableBody.innerHTML = "";

  // Extrae el array de facturas de la respuesta del backend
  let getData = data.data || [];
  console.log('Datos para crear tabla:', getData);

  // Verifica si hay datos para mostrar
  if (getData.length === 0) {
    console.log('No hay datos para mostrar');
    // Muestra un mensaje en la tabla si no hay datos
    objTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No hay facturas disponibles</td></tr>';
    return;
  }

  // Itera sobre cada factura recibida del backend
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    console.log('Fila actual:', row);

    /**
     * Determina el estado visual de la factura
     *
     * El backend envía el campo 'status_name' con diferentes valores.
     * Aplicamos una clase CSS y un icono diferente según el estado:
     * - "Pendiente" → badge bg-warning (amarillo) + icono clock
     * - "Pagado" → badge bg-success (verde) + icono check-circle
     * - "Vencido" → badge bg-danger (rojo) + icono exclamation-triangle
     * - "Cancelado" → badge bg-dark (negro) + icono ban
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
      case 'Pendiente':
        statusClass = 'badge bg-warning text-dark';
        statusIcon = 'fa-clock';
        break;
      case 'Pagado':
        statusClass = 'badge bg-success';
        statusIcon = 'fa-check-circle';
        break;
      case 'Vencido':
        statusClass = 'badge bg-danger';
        statusIcon = 'fa-exclamation-triangle';
        break;
      case 'Cancelado':
        statusClass = 'badge bg-dark';
        statusIcon = 'fa-ban';
        break;
    }

    /**
     * Construye la fila HTML con los datos de la factura
     *
     * Cada fila incluye:
     * - ID de la factura
     * - Usuario (nombre completo)
     * - Propiedad
     * - Monto (formateado con separadores de miles)
     * - Fecha de vencimiento
     * - Tarifa (nombre y monto)
     * - Estado (con badge de color)
     * - Botones de acción (Ver, Editar, Eliminar)
     */

    // Formatear la información de tarifa
    const tariffInfo = row.tariff_name
      ? `${row.tariff_name}${row.tariff_amount ? ' - $' + row.tariff_amount.toLocaleString() : ''}`
      : 'Sin tarifa';

    // Formatear el monto con separadores de miles
    const formattedAmount = row.amount ? '$' + row.amount.toLocaleString() : '$0';

    // El sistema formatea la fecha de vencimiento en formato DD/MM/YYYY
    const formattedDate = formatDate(row.due_date);

    // Nombre del usuario (prioriza full_name, luego username)
    const userName = row.full_name || row.username || 'N/A';

    /**
     * CONSTRUIR LA FILA HTML
     *
     * Ahora incluimos el badge con icono para el estado.
     * El badge hace que el estado sea más visible y atractivo.
     */
    let dataRow = `<tr>
      <td>${row.invoice_id || row.id}</td>
      <td>${userName}</td>
      <td>${row.property_name || 'N/A'}</td>
      <td>${formattedAmount}</td>
      <td>${formattedDate}</td>
      <td>${tariffInfo}</td>
      <td>
        <span class="${statusClass}">
          <i class="fas ${statusIcon} me-1"></i>${statusActive}
        </span>
      </td>
      <td>
        <button type="button" title="Ver factura" class="btn btn-success btn-sm" onclick="showId(${row.invoice_id || row.id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar factura" class="btn btn-primary btn-sm" onclick="edit(${row.invoice_id || row.id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar factura" class="btn btn-danger btn-sm" onclick="delete_(${row.invoice_id || row.id})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;

    // Añade la fila HTML al cuerpo de la tabla
    objTableBody.innerHTML += dataRow;
  }
}

/**
 * FUNCIÓN PARA CARGAR LOS USUARIOS EN EL SELECT
 *
 * Recibe los usuarios del backend y los renderiza en un elemento <select>.
 * Este select se utiliza en el formulario para que el usuario elija el usuario asociado a la factura.
 *
 * @param {Object} data - Objeto de respuesta del backend con los usuarios
 *
 * Estructura de datos esperada:
 * {
 *   data: [
 *     { user_id: 1, username: "john_doe", full_name: "John Doe" },
 *     { user_id: 2, username: "jane_doe", full_name: "Jane Doe" },
 *     ...
 *   ]
 * }
 */
function createSelectUsers(data) {
  // Inicializa el select con una opción por defecto
  objSelectUser.innerHTML = "<option value='' selected disabled>Selecciona el usuario</option>";

  // Extrae el array de usuarios
  let getData = data.data || [];

  // Si no hay usuarios disponibles, no hace nada
  if (getData.length === 0) return;

  // Itera sobre cada usuario y crea una opción en el select
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    // Muestra el nombre completo si existe, de lo contrario el username
    const displayName = row.full_name || row.username || 'Usuario ' + (row.user_id || row.id);
    let dataRow = `<option value="${row.user_id || row.id}">${displayName}</option>`;
    objSelectUser.innerHTML += dataRow;
  }
}

/**
 * FUNCIÓN PARA CARGAR LAS PROPIEDADES EN EL SELECT
 *
 * Recibe las propiedades del backend y las renderiza en un elemento <select>.
 *
 * @param {Object} data - Objeto de respuesta del backend con las propiedades
 */
function createSelectProperties(data) {
  // Inicializa el select con una opción por defecto
  objSelectProperty.innerHTML = "<option value='' selected disabled>Selecciona la propiedad</option>";

  // Extrae el array de propiedades
  let getData = data.data || [];

  // Si no hay propiedades disponibles, no hace nada
  if (getData.length === 0) return;

  // Itera sobre cada propiedad y crea una opción en el select
  let rowLong = getData.length;
  for (let i = 0; i < rowLong; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.property_id || row.id}">${row.name || 'Propiedad ' + (row.property_id || row.id)}</option>`;
    objSelectProperty.innerHTML += dataRow;
  }
}

/**
 * FUNCIÓN PARA CARGAR LAS TARIFAS EN EL SELECT
 *
 * Recibe las tarifas del backend y las renderiza en el elemento <select>.
 *
 * @param {Object} data - Objeto de respuesta del backend con las tarifas
 */
function createSelectTariff(data) {
  // Inicializa el select con una opción por defecto
  objSelectTariff.innerHTML = "<option value='' selected disabled>Selecciona la tarifa</option>";

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
 * FUNCIÓN PARA CARGAR LOS ESTADOS EN EL SELECT
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
 * FUNCIÓN PARA MOSTRAR U OCULTAR EL MODAL
 *
 * Controla la visibilidad del modal que contiene el formulario de factura.
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
 * Recarga todos los datos de las facturas desde el backend.
 * Se llama después de cada operación CRUD para refrescar la tabla.
 */
function loadView() {
  // Llama a getData() que hace la petición al backend
  getData();

  // Muestra el indicador de carga
  toggleLoading(true);
}

/**
 * FUNCIONES ESPECIALIZADAS PARA CARGA DINÁMICA DE CATÁLOGOS
 *
 * Estas funciones se encargan de cargar los catálogos necesarios para el formulario
 * cada vez que se abre el modal. A diferencia de las funciones generales de carga,
 * estas tienen mejor manejo de errores y logging específico para el contexto
 * de creación de facturas.
 */

/**
 * Carga dinámicamente los usuarios para el select del formulario.
 * Se ejecuta cada vez que se abre el modal de agregar factura.
 */
function loadUsersForForm() {
  const token = getAuthToken();
  
  // Se muestra en consola que se están cargando los usuarios
  console.log('Cargando usuarios para formulario de factura...');
  
  getServicesAuth('', METHODS[0], URL_PROFILE, token)
    .then(response => handleAuthenticatedResponse(response, 'cargar usuarios para el formulario'))
    .then(data => {
      console.log('Usuarios cargados exitosamente:', data.data?.length || 0, 'registros');
      createSelectUsers(data);
    })
    .catch(error => {
      console.error('Error al cargar usuarios para el formulario:', error);
      // Se muestra un mensaje informativo al usuario
      showSelectError(objSelectUser, 'Error al cargar usuarios');
    });
}

/**
 * Carga dinámicamente las propiedades para el select del formulario.
 * Se ejecuta cada vez que se abre el modal de agregar factura.
 */
function loadPropertiesForForm() {
  const token = getAuthToken();
  
  console.log('Cargando propiedades para formulario de factura...');
  
  getServicesAuth('', METHODS[0], URL_PROPERTY, token)
    .then(response => handleAuthenticatedResponse(response, 'cargar propiedades para el formulario'))
    .then(data => {
      console.log('Propiedades cargadas exitosamente:', data.data?.length || 0, 'registros');
      createSelectProperties(data);
    })
    .catch(error => {
      console.error('Error al cargar propiedades para el formulario:', error);
      showSelectError(objSelectProperty, 'Error al cargar propiedades');
    });
}

/**
 * Carga dinámicamente las tarifas para el select del formulario.
 * Se ejecuta cada vez que se abre el modal de agregar factura.
 */
function loadTariffsForForm() {
  const token = getAuthToken();
  
  console.log('Cargando tarifas para formulario de factura...');
  
  getServicesAuth('', METHODS[0], URL_TARIFF, token)
    .then(response => handleAuthenticatedResponse(response, 'cargar tarifas para el formulario'))
    .then(data => {
      console.log('Tarifas cargadas exitosamente:', data.data?.length || 0, 'registros');
      createSelectTariff(data);
    })
    .catch(error => {
      console.error('Error al cargar tarifas para el formulario:', error);
      showSelectError(objSelectTariff, 'Error al cargar tarifas');
    });
}

/**
 * Carga dinámicamente los estados para el select del formulario.
 * Se ejecuta cada vez que se abre el modal de agregar factura.
 */
function loadStatusesForForm() {
  const token = getAuthToken();
  
  console.log('Cargando estados para formulario de factura...');
  
  getServicesAuth('', METHODS[0], URL_STATUS, token)
    .then(response => handleAuthenticatedResponse(response, 'cargar estados para el formulario'))
    .then(data => {
      console.log('Estados cargados exitosamente:', data.data?.length || 0, 'registros');
      createSelectStatus(data);
    })
    .catch(error => {
      console.error('Error al cargar estados para el formulario:', error);
      showSelectError(objSelectStatus, 'Error al cargar estados');
    });
}

/**
 * Función auxiliar para mostrar errores en los selects cuando no se pueden cargar datos.
 * Proporciona retroalimentación visual al usuario sobre problemas de carga.
 *
 * @param {HTMLElement} selectElement - Elemento select donde mostrar el error
 * @param {string} errorMessage - Mensaje de error a mostrar
 */
function showSelectError(selectElement, errorMessage) {
  if (selectElement) {
    selectElement.innerHTML = `<option value='' selected disabled style='color: red;'>${errorMessage}</option>`;
  }
}
function getDataUsers() {
  // No se envían datos en el body
  documentData = "";

  // Configura la petición GET
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PROFILE;

  // Obtiene el token de autenticación del almacenamiento local
  const token = getAuthToken();

  // Realiza la petición al backend con autenticación
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices
    .then(response => handleAuthenticatedResponse(response, 'obtener los usuarios'))
    .then(data => {
    // Procesa la respuesta y llena el select
    console.log('Datos de usuarios:', data);
    createSelectUsers(data);
  }).catch(error => {
    // Maneja errores
    console.log('Error al obtener usuarios:', error);
  });
}

/**
 * FUNCIÓN PARA OBTENER LAS PROPIEDADES
 *
 * Consulta el backend para obtener el catálogo de propiedades disponibles.
 *
 * Conexión con el backend:
 * - Método HTTP: GET
 * - Endpoint: http://localhost:3000/api_v1/property/ (URL_PROPERTY)
 */
function getDataProperties() {
  // No se envían datos en el body
  documentData = "";

  // Configura la petición GET
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_PROPERTY;

  // Obtiene el token de autenticación del almacenamiento local
  const token = getAuthToken();

  // Realiza la petición al backend con autenticación
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices
    .then(response => handleAuthenticatedResponse(response, 'obtener las propiedades'))
    .then(data => {
    // Procesa la respuesta y llena el select
    console.log('Datos de propiedades:', data);
    createSelectProperties(data);
  }).catch(error => {
    // Maneja errores
    console.log('Error al obtener propiedades:', error);
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
  // No se envían datos en el body
  documentData = "";

  // Configura la petición GET
  httpMethod = METHODS[0]; // GET method
  endpointUrl = URL_TARIFF;

  // Obtiene el token de autenticación del almacenamiento local
  const token = getAuthToken();

  // Realiza la petición al backend con autenticación
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices
    .then(response => handleAuthenticatedResponse(response, 'obtener las tarifas'))
    .then(data => {
    // Procesa la respuesta y llena el select
    console.log('Datos de tarifas:', data);
    createSelectTariff(data);
  }).catch(error => {
    // Maneja errores
    console.log('Error al obtener tarifas:', error);
  });
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
 *       { status_id: 1, name: "Pendiente" },
 *       { status_id: 2, name: "Pagado" },
 *       ...
 *     ]
 *   }
 */
/**
 * El sistema obtiene los estados desde el backend filtrados por entidad invoice
 * Solo carga estados que aplican a facturas
 */
function getDataStatus() {
  // No se envían datos en el body
  documentData = "";

  // Configura la petición GET
  httpMethod = METHODS[0]; // GET method
  // El sistema agrega el parámetro entity=invoice para filtrar por entidad
  endpointUrl = URL_STATUS + '?entity=invoice';

  // Obtiene el token de autenticación del almacenamiento local
  const token = getAuthToken();

  // Realiza la petición al backend con autenticación
  const resultServices = getServicesAuth(documentData, httpMethod, endpointUrl, token);

  resultServices
    .then(response => handleAuthenticatedResponse(response, 'obtener los estados'))
    .then(data => {
    // Procesa la respuesta y llena el select
    console.log('Datos de estados de invoice:', data);
    createSelectStatus(data);
  }).catch(error => {
    // Maneja errores
    console.log('Error al obtener estados de invoice:', error);
  });
}

/**
 * Esta función filtra las facturas según el estado seleccionado por el usuario.
 * Es llamada cuando el usuario hace clic en alguno de los botones de filtro.
 *
 * @param {string} statusName - El nombre del estado a filtrar ('Pendiente', 'Pagado', 'all')
 * *
 * PASO 1: Recibe el nombre del estado
 *   - Si el usuario hace clic en "Pendiente" → statusName = 'Pendiente'
 *   - Si hace clic en "Todos" → statusName = 'all'
 *
 * PASO 2: Filtra los datos guardados en memoria (allInvoicesData)
 *   - Usa la función .filter() de JavaScript que revisa cada elemento del array
 *   - Si statusName es 'all', NO filtra nada (muestra todos)
 *   - Si statusName es un estado específico, solo deja pasar los que coincidan
 *
 * PASO 3: Crea un nuevo objeto con los datos filtrados
 *   - Mantiene la misma estructura que el backend: { data: [...] }
 *
 * PASO 4: Vuelve a renderizar la tabla con los datos filtrados
 *   - Llama a createTable() con los nuevos datos
 *   - La tabla se actualiza mostrando solo las facturas que coinciden con el filtro
 *
 * PASO 5: Actualiza el estilo de los botones
 *   - Marca el botón seleccionado como "activo"
 *   - Desmarca los demás botones
 */
function filterByStatus(statusName) {
  console.log('Estado seleccionado:', statusName);
  console.log('Total de facturas en memoria:', allInvoicesData.length);

  /**
   * FILTRADO DE DATOS
   *
   * Aquí se usa .filter() que es un método de JavaScript que:
   * 1. Revisa CADA elemento del array allInvoicesData
   * 2. Para cada elemento, ejecuta una función (llamada "condición")
   * 3. Si la función devuelve true, el elemento se INCLUYE en el nuevo array
   * 4. Si devuelve false, el elemento se EXCLUYE
   *
   * - allInvoicesData = [{id: 1, status_name: "Pendiente"}, {id: 2, status_name: "Pagado"}]
   * - Si statusName = "Pendiente"
   * - Resultado: [{id: 1, status_name: "Pendiente"}] (solo la primera factura)
   */
  let filteredData;

  if (statusName === 'all') {
    // Si el usuario seleccionó "Todos", no filtramos nada
    filteredData = allInvoicesData;
    console.log('Mostrando TODAS las facturas (sin filtro)');
  } else {
    // Si el usuario seleccionó un estado específico, filtramos
    filteredData = allInvoicesData.filter(invoice => {
      // Esta es la condición: ¿El status_name de esta factura coincide con el filtro?
      return invoice.status_name === statusName;
    });
    console.log(`Facturas encontradas con estado "${statusName}":`, filteredData.length);
  }

  /**
   * CREAR OBJETO CON LA MISMA ESTRUCTURA DEL BACKEND
   *
   * La función createTable() espera recibir un objeto con esta estructura:
   * { data: [...] }
   *
   * Por eso se envuelve el array filtrado en un objeto.
   */
  const dataToRender = {
    data: filteredData
  };

  /**
   * ACTUALIZAR LA TABLA
   *
   * Llamamos a createTable() con los datos filtrados.
   * Esta función limpiará la tabla actual y la volverá a llenar
   * con solo las facturas que pasaron el filtro.
   */
  createTable(dataToRender);

  /**
   * REINICIALIZAR DATATABLE
   *
   * DataTable es la librería que nos da funcionalidades como
   * búsqueda, paginación y ordenamiento.
   *
   * Cada vez que cambiamos los datos de la tabla, tenemos que:
   * 1. Destruir la instancia anterior de DataTable
   * 2. Crear una nueva instancia con los nuevos datos
   */
  if ($.fn.DataTable.isDataTable(appTable)) {
    $(appTable).DataTable().destroy();
  }
  new DataTable(appTable);

  /*
   * Esta función marca el botón que está activo y desmarca los demás.
   * Es solo un cambio visual para que el usuario sepa qué filtro está aplicado.
   */
  updateFilterButtons(statusName);
}

/**
 * Esta función se encarga de cambiar el aspecto visual de los botones:
 * - Agrega la clase 'active' al botón seleccionado (lo hace verse presionado)
 * - Quita la clase 'active' de los demás botones
 *
 * @param {string} statusName - El nombre del estado del botón activo
 *
 * 1. Crear un "mapa" que relaciona cada estado con el ID de su botón
 * 2. Obtener todos los botones de filtro del HTML
 * 3. Recorrer todos los botones y quitamos la clase 'active' de todos
 * 4. Agregar la clase 'active' solo al botón que fue seleccionado
 */
function updateFilterButtons(statusName) {
  /**
   * MAPA DE ESTADOS A IDs DE BOTONES
   *
   * Este objeto relaciona cada posible valor de statusName
   * con el ID del botón correspondiente en el HTML.
   *
   * - Si statusName = 'Pendiente' → buscamos el botón con id='filter-pendiente'
   * - Si statusName = 'all' → buscamos el botón con id='filter-all'
   */
  const buttonMap = {
    'all': 'filter-all',
    'Pendiente': 'filter-pendiente',
    'Pagado': 'filter-pagado',
    'Vencido': 'filter-vencido',
    'Cancelado': 'filter-cancelado'
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
 * Este evento se dispara cuando toda la página (incluyendo imágenes y recursos) ha terminado de cargar.
 * Es diferente a DOMContentLoaded que solo espera a que el DOM esté listo.
 *
 * Aquí se ejecutan las funciones iniciales:
 * 1. loadView() - Carga todas las facturas en la tabla
 * 2. getDataUsers() - Carga los usuarios para el select del formulario
 * 3. getDataProperties() - Carga las propiedades para el select del formulario
 * 4. getDataTariff() - Carga las tarifas disponibles para el select del formulario
 * 5. getDataStatus() - Carga los estados disponibles para el select del formulario
 */
window.addEventListener('load', () => {
  // Carga el listado inicial de facturas
  loadView();

  // Carga los usuarios para el formulario
  getDataUsers();

  // Carga las propiedades para el formulario
  getDataProperties();

  // Carga las tarifas para el formulario
  getDataTariff();

  // Carga los estados para el formulario
  getDataStatus();

  // Carga los datos de tarifas al cambiar a la pestaña de tarifas
  const tarifasTab = document.getElementById('tarifas-tab');
  if (tarifasTab) {
    tarifasTab.addEventListener('shown.bs.tab', function () {
      loadTariffView();
    });
  }
});

/**
 * SECCIÓN DE GESTIÓN DE TARIFAS
 * El sistema proporciona funciones para el CRUD completo de tarifas
 */

/**
 * INICIALIZACIÓN DE OBJETOS PARA TARIFAS
 * El sistema crea instancias de los elementos DOM necesarios para las tarifas
 */
const objTariffForm = new Form('tariffForm', 'edit-input');
const objTariffModal = new bootstrap.Modal(document.getElementById('tariffModal'));
const objTariffTableBody = document.getElementById('tariff-table-body');
const objTariffSelectStatus = document.getElementById('tariff_status_id');
const myTariffForm = objTariffForm.getForm();
const tariffTable = "#tariff-table";

/**
 * VARIABLES DE ESTADO PARA OPERACIONES CRUD DE TARIFAS
 */
let insertUpdateTariff = true;
let keyIdTariff;
let documentDataTariff = "";
let httpMethodTariff = "";
let endpointUrlTariff = "";
let tariffDataTable;

/**
 * El sistema maneja el envío del formulario de tarifas
 * Captura el evento submit y envía los datos al backend
 */
myTariffForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // El sistema valida el formulario antes de enviar
  if (!objTariffForm.validateForm()) {
    console.log("Error en validación del formulario de tarifa");
    return;
  }

  toggleLoading(true);

  // El sistema configura el método y endpoint según la operación
  if (insertUpdateTariff) {
    httpMethodTariff = METHODS[1]; // POST
    endpointUrlTariff = URL_TARIFF;
  } else {
    httpMethodTariff = METHODS[2]; // PUT
    endpointUrlTariff = URL_TARIFF + '/' + keyIdTariff;
  }

  // El sistema obtiene los datos del formulario
  documentDataTariff = objTariffForm.getDataForm();

  console.log('El sistema envía datos de tarifa:', documentDataTariff);

  // El sistema obtiene el token de autenticación
  const token = getAuthToken();
  const resultServices = getServicesAuth(documentDataTariff, httpMethodTariff, endpointUrlTariff, token);

  resultServices.then(response => handleAuthenticatedResponse(response, 'guardar tarifa'))
    .then(data => {
      console.log('Tarifa guardada exitosamente:', data);
      alert('Tarifa guardada correctamente');
      loadTariffView();
      showHiddenTariffModal(false);
    })
    .catch(error => {
      console.error('Error al guardar tarifa:', error);
      alert('Error al guardar la tarifa');
    })
    .finally(() => {
      toggleLoading(false);
    });
});

/**
 * El sistema abre el modal para agregar una nueva tarifa
 */
function addTariff() {
  showHiddenTariffModal(true);
  insertUpdateTariff = true;
  objTariffForm.resetForm();
  objTariffForm.enabledForm();
  objTariffForm.enabledButton();
  objTariffForm.showButton();
}

/**
 * El sistema abre el modal para visualizar una tarifa en modo lectura
 * @param {number} id - ID de la tarifa a visualizar
 */
function showTariffId(id) {
  objTariffForm.resetForm();
  objTariffForm.disabledForm();
  objTariffForm.disabledButton();
  objTariffForm.hiddenButton();
  getTariffDataId(id);
}

/**
 * El sistema abre el modal para editar una tarifa existente
 * @param {number} id - ID de la tarifa a editar
 */
function editTariff(id) {
  insertUpdateTariff = false;
  objTariffForm.resetForm();
  objTariffForm.enabledEditForm();
  objTariffForm.enabledButton();
  objTariffForm.showButton();

  keyIdTariff = id;
  getTariffDataId(id);
}

/**
 * El sistema elimina una tarifa del sistema
 * @param {number} id - ID de la tarifa a eliminar
 */
function deleteTariff(id) {
  if (confirm("¿Estás seguro de que deseas eliminar esta tarifa?")) {
    documentDataTariff = null;
    httpMethodTariff = METHODS[3]; // DELETE
    endpointUrlTariff = URL_TARIFF + '/' + id;

    const token = getAuthToken();
    const resultServices = getServicesAuth(documentDataTariff, httpMethodTariff, endpointUrlTariff, token);

    resultServices.then(response => handleAuthenticatedResponse(response, 'eliminar tarifa'))
      .then(data => {
        console.log('Tarifa eliminada:', data);
        alert('Tarifa eliminada correctamente');
        loadTariffView();
      })
      .catch(error => {
        console.error('Error al eliminar tarifa:', error);
        alert('Error al eliminar la tarifa');
      })
      .finally(() => {
        toggleLoading(false);
      });
  }
}

/**
 * El sistema obtiene los datos de una tarifa específica por su ID
 * @param {number} id - ID de la tarifa a consultar
 */
function getTariffDataId(id) {
  documentDataTariff = null;
  httpMethodTariff = METHODS[0]; // GET
  endpointUrlTariff = URL_TARIFF + '/' + id;

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentDataTariff, httpMethodTariff, endpointUrlTariff, token);

  resultServices.then(response => handleAuthenticatedResponse(response, 'obtener tarifa'))
    .then(data => {
      console.log('Datos de tarifa recibidos:', data);

      if (data && data.data) {
        let getData = data.data;

        // El sistema mapea los datos del backend al formulario
        objTariffForm.setDataFormJson({
          tariff_name: getData.name,
          tariff_description: getData.description,
          tariff_amount: getData.amount,
          tariff_status_id: getData.status_id
        });
      }
    })
    .catch(error => {
      console.error('Error al obtener tarifa:', error);
    })
    .finally(() => {
      showHiddenTariffModal(true);
    });
}

/**
 * El sistema obtiene todas las tarifas del backend
 */
function getTariffData() {
  documentDataTariff = null;
  httpMethodTariff = METHODS[0]; // GET
  endpointUrlTariff = URL_TARIFF;

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentDataTariff, httpMethodTariff, endpointUrlTariff, token);

  resultServices.then(response => handleAuthenticatedResponse(response, 'obtener tarifas'))
    .then(data => {
      console.log('Tarifas recibidas:', data);
      createTariffTable(data);
    })
    .catch(error => {
      console.error('Error al obtener tarifas:', error);
    })
    .finally(() => {
      // El sistema inicializa o actualiza DataTable
      if (tariffDataTable) {
        tariffDataTable.destroy();
      }
      tariffDataTable = new DataTable(tariffTable);
      toggleLoading(false);
    });
}

/**
 * El sistema crea la tabla de tarifas con los datos recibidos
 * @param {Object} data - Datos recibidos del backend
 */
function createTariffTable(data) {
  objTariffTableBody.innerHTML = "";

  let getData = data.data || [];
  console.log('Datos para crear tabla de tarifas:', getData);

  if (getData.length === 0) {
    objTariffTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No hay tarifas disponibles</td></tr>';
    return;
  }

  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];

    // El sistema construye la fila de la tabla
    let dataRow = `<tr>
      <td>${row.tariff_id}</td>
      <td>${row.name || 'N/A'}</td>
      <td>${row.description || 'N/A'}</td>
      <td>$${parseFloat(row.amount || 0).toFixed(2)}</td>
      <td>${row.status_name || 'N/A'}</td>
      <td>
        <button type="button" title="Ver Tarifa" class="btn btn-success btn-sm" onclick="showTariffId(${row.tariff_id})">
          <i class='fas fa-eye'></i>
        </button>
        <button type="button" title="Editar Tarifa" class="btn btn-primary btn-sm" onclick="editTariff(${row.tariff_id})">
          <i class='fas fa-edit'></i>
        </button>
        <button type="button" title="Eliminar Tarifa" class="btn btn-danger btn-sm" onclick="deleteTariff(${row.tariff_id})">
          <i class='fas fa-trash'></i>
        </button>
      </td>
    </tr>`;

    objTariffTableBody.innerHTML += dataRow;
  }

  console.log('Tabla de tarifas creada correctamente');
}

/**
 * El sistema carga los estados disponibles para tarifas
 */
function getDataStatusForTariff() {
  documentDataTariff = null;
  httpMethodTariff = METHODS[0]; // GET
  endpointUrlTariff = URL_STATUS + '/entity/tariff';

  const token = getAuthToken();
  const resultServices = getServicesAuth(documentDataTariff, httpMethodTariff, endpointUrlTariff, token);

  resultServices.then(response => handleAuthenticatedResponse(response, 'obtener estados de tarifa'))
    .then(data => {
      console.log('Estados de tarifa recibidos:', data);
      createSelectStatusForTariff(data);
    })
    .catch(error => {
      console.error('Error al obtener estados de tarifa:', error);
    })
    .finally(() => {
      toggleLoading(false);
    });
}

/**
 * El sistema llena el select de estados para tarifas
 * @param {Object} data - Datos recibidos del backend
 */
function createSelectStatusForTariff(data) {
  objTariffSelectStatus.innerHTML = "<option value='' selected disabled>Seleccione un estado</option>";

  let getData = data.data || [];
  if (getData.length === 0) return;

  for (let i = 0; i < getData.length; i++) {
    let row = getData[i];
    let dataRow = `<option value="${row.status_id}">${row.name}</option>`;
    objTariffSelectStatus.innerHTML += dataRow;
  }
}

/**
 * El sistema muestra u oculta el modal de tarifas
 * @param {boolean} type - true para mostrar, false para ocultar
 */
function showHiddenTariffModal(type) {
  if (type) {
    objTariffModal.show();
  } else {
    objTariffModal.hide();
  }
}

/**
 * El sistema carga la vista de tarifas
 */
function loadTariffView() {
  getTariffData();
  getDataStatusForTariff();
  toggleLoading(true);
}

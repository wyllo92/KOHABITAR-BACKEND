document.addEventListener('DOMContentLoaded', async ()=> {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
 
  await checkAuth();
  console.log('payment controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});

const objForm = new Form('paymentForm', 'edit-input');
const objModal = new bootstrap.Modal(document.getElementById('appModal'));
const objTableBody = document.getElementById('app-table-body');
const objSelectUser = document.getElementById('user_id');
const objSelectStatus = document.getElementById('status_id');
const objSelectInvoice = document.getElementById('invoice_id');
const objSelectReservation = document.getElementById('reservation_id');
const objSelectParking = document.getElementById('parking_assignment_id');
const myForm = objForm.getForm();
const appTable = "#app-table";

let insertUpdate = true;
let keyId;
let documentData = "";
let httpMethod = "";
let endpointUrl = "";

/**
 * MANEJADOR DE ENVÍO DEL FORMULARIO DE PAGOS
 *
 * Procesa la creación y edición de pagos adaptándose completamente al modelo Payment del backend.
 * Valida y formatea los datos según los requisitos del modelo antes del envío.
 *
 * El frontend carga del backend:
 * 1. Valida campos obligatorios (user_id, amount_paid, payment_date, method, reference, status_id)
 * 2. Formatea la fecha según formato requerido por el modelo
 * 3. Normaliza campos opcionales (invoice_id, reservation_id, parking_assignment_id)
 * 4. Envía con autenticación JWT
 */
myForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!objForm.validateForm()) return;
  
  // Validaciones adicionales específicas del modelo Payment
  const amountPaid = document.getElementById('amount_paid').value;
  const paymentDate = document.getElementById('payment_date').value;
  const method = document.getElementById('method').value;
  const reference = document.getElementById('reference').value;
  
  if (!amountPaid || parseFloat(amountPaid) <= 0) {
    alert('El monto debe ser mayor a cero');
    return;
  }
  
  if (!paymentDate) {
    alert('La fecha de pago es obligatoria');
    return;
  }
  
  if (!method.trim()) {
    alert('El método de pago es obligatorio');
    return;
  }
  
  if (!reference.trim()) {
    alert('La referencia del pago es obligatoria para trazabilidad');
    return;
  }
  
  toggleLoading(true);
  
  // Determina el método HTTP y endpoint según la operación
  if (insertUpdate) {
    httpMethod = METHODS[1]; // POST para crear
    endpointUrl = URL_PAYMENT;
  } else {
    httpMethod = METHODS[2]; // PUT para editar
    endpointUrl = URL_PAYMENT + "/" + keyId;
  }
  
  documentData = objForm.getDataForm();
  
  // Formatea el monto como decimal
  documentData.amount_paid = parseFloat(documentData.amount_paid);
  
  // Formatea la fecha para el modelo backend (ISO format)
  documentData.payment_date = new Date(documentData.payment_date).toISOString();
  
  // Normaliza los IDs opcionales según requiere el modelo Payment
  ['invoice_id', 'reservation_id', 'parking_assignment_id'].forEach(field => {
    if (documentData[field] === '' || documentData[field] === '0') {
      documentData[field] = null;
    } else if (documentData[field]) {
      documentData[field] = parseInt(documentData[field]);
    }
  });
  
  // Convierte IDs obligatorios a enteros
  ['user_id', 'status_id'].forEach(field => {
    if (documentData[field]) {
      documentData[field] = parseInt(documentData[field]);
    }
  });
  
  console.log('Datos formateados para el modelo Payment:', documentData);

  // Obtiene el token de autenticación requerido por el backend
  const token = getAuthToken();

  const result = getServicesAuth(documentData, httpMethod, endpointUrl, token);
  result.then(r=>r.json()).then(d=>{
    if (d.error) {
      console.error('Error del backend:', d.error);
      alert('Error: ' + d.error);
    } else {
      console.log('Operación exitosa en modelo Payment:', insertUpdate ? 'Pago creado' : 'Pago actualizado');
      alert(insertUpdate ? 'Pago registrado exitosamente' : 'Pago actualizado exitosamente');
    }
  }).catch(err=>{
    console.error('Error de red o autenticación:', err);
    alert('Error de conexión o autenticación');
  }).finally(()=>{
    loadView();
    showHiddenModal(false);
    toggleLoading(false);
  });
});

/**
 * FUNCIÓN PARA AGREGAR UN NUEVO PAGO
 *
 * Prepara el formulario para crear un nuevo pago adaptándose completamente
 * al modelo Payment del backend. Establece valores por defecto y carga
 * dinámicamente todos los catálogos necesarios.
 *
 * El frontend carga del backend proporcionando todos los campos requeridos
 * por el modelo: user_id, amount_paid, payment_date, method, reference,
 * invoice_id, reservation_id, parking_assignment_id, status_id.
 */
function add(){
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
  
  // ESTABLECE VALORES POR DEFECTO SEGÚN EL MODELO PAYMENT
  // Fecha actual en formato datetime-local para el campo payment_date
  const now = new Date();
  // Ajusta la zona horaria local
  const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  document.getElementById('payment_date').value = localDateTime.toISOString().slice(0, 16);
  
  // Método de pago por defecto (se puede cambiar según necesidades del negocio)
  document.getElementById('method').value = '';
  
  // Monto por defecto vacío (obligatorio según modelo)
  document.getElementById('amount_paid').value = '';
  
  // Referencia vacía por defecto
  document.getElementById('reference').value = '';
  
  // Carga dinámicamente todos los catálogos antes de mostrar el modal
  // Esto asegura que todos los selects tengan datos actualizados del backend
  getDataSelects();
  
  console.log('Formulario de nuevo pago preparado con valores por defecto');
  showHiddenModal(true);
}

/**
 * FUNCIÓN PARA EDITAR UN PAGO EXISTENTE
 *
 * Prepara el formulario para editar un pago existente y carga dinámicamente
 * todos los catálogos necesarios. El frontend carga del modelo Payment
 * del backend obteniendo y mostrando todos los campos disponibles.
 *
 * @param {number} id - ID del pago a editar según el modelo Payment
 */
function edit(id){
  insertUpdate = false;
  keyId = id;
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
  
  // Carga dinámicamente todos los catálogos antes de obtener los datos del pago
  // Esto asegura que los selects tengan las opciones correctas cuando se muestren los datos
  getDataSelects();
  
  console.log('Preparando edición del pago ID:', id);
  getDataId(id);
}

/**
 * FUNCIÓN PARA ELIMINAR UN PAGO
 *
 * Elimina un pago específico del backend usando autenticación JWT.
 * El frontend carga del backend que requiere token para operaciones de eliminación.
 *
 * @param {number} id - El ID del pago a eliminar
 */
function delete_(id){
  if (!confirm('Confirmar eliminación')) return;
  
  // Obtiene el token de autenticación requerido por el backend
  const token = getAuthToken();
  
  const result = getServicesAuth('', METHODS[3], URL_PAYMENT + "/" + id, token);
  result.then(r=>r.json()).then(d=>{
    console.log('Pago eliminado exitosamente');
  }).catch(error => {
    console.error('Error al eliminar el pago:', error);
  }).finally(()=>loadView());
}

/**
 * FUNCIÓN PARA OBTENER UN PAGO ESPECÍFICO POR ID
 *
 * Obtiene los datos de un pago individual desde el backend para editar o visualizar.
 * El frontend carga del backend que requiere autenticación para acceder a los datos.
 *
 * @param {number} id - El ID del pago a consultar
 */
function getDataId(id){
  // Obtiene el token de autenticación requerido por el backend
  const token = getAuthToken();
  
  getServicesAuth('', METHODS[0], URL_PAYMENT + "/" + id, token).then(r=>r.json()).then(d=>{
    if (d.data) objForm.setDataFormJson(d.data);
  }).catch(error => {
    console.error('Error al obtener datos del pago:', error);
  }).finally(()=>showHiddenModal(true));
}

/**
 * El sistema formatea una fecha en formato legible en español
 * Convierte fechas ISO (2024-11-17) o datetime (2024-11-17T14:30:00) a formato DD/MM/YYYY
 * @param {string} dateString - Cadena de fecha en formato ISO
 * @returns {string} - Fecha formateada en español o el valor original si no es válido
 */
function formatDate(dateString) {
  // El sistema verifica que la fecha no esté vacía
  if (!dateString || dateString === '' || dateString === 'null') {
    return '—';
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

function createTable(data){
  objTableBody.innerHTML='';
  const rows = data.data || [];
  rows.forEach(row=>{
    // El sistema formatea la fecha de pago para mostrarla en formato legible
    const paymentDateFormatted = formatDate(row.payment_date);

    const tr = `<tr>
<td>${row.payment_id}</td>
<td>${row.user_name||row.user_id}</td>
<td>${row.amount_paid}</td>
<td>${paymentDateFormatted}</td>
<td>${row.method||''}</td>
<td>${row.reference||''}</td>
<td>${row.invoice_id||''}</td>
<td>${row.reservation_id||''}</td>
<td>${row.parking_assignment_id||''}</td>
<td>${row.status_id||''}</td>
<td>
<button class="btn btn-success" onclick="showId(${row.payment_id})"><i class='fas fa-eye'></i></button>
<button class="btn btn-primary" onclick="edit(${row.payment_id})"><i class='fas fa-edit'></i></button>
<button class="btn btn-danger" onclick="delete_(${row.payment_id})"><i class='fas fa-trash'></i></button>
</td>
</tr>`;
    objTableBody.innerHTML+=tr;
  });
}

/**
 * FUNCIÓN PARA OBTENER TODOS LOS PAGOS
 *
 * Obtiene la lista completa de pagos desde el backend usando autenticación JWT.
 * El frontend carga del backend que requiere token de autenticación.
 *
 * Flujo de conexión con backend:
 * 1. Obtiene el token JWT del almacenamiento local
 * 2. Llama a getServicesAuth() con el token
 * 3. El backend valida el token en authMiddleware
 * 4. PaymentController.getAllPayments() procesa la petición
 * 5. Se renderizan los datos en la tabla
 */
function getData(){
  toggleLoading(true);
  
  // Obtiene el token de autenticación del sistema AppStorage
  const token = getAuthToken();
  
  getServicesAuth('', METHODS[0], URL_PAYMENT, token).then(r=>r.json()).then(d=>{
    createTable(d);
  }).finally(()=>{new DataTable(appTable); toggleLoading(false);});
}

function showHiddenModal(type){
  if (type) objModal.show(); else objModal.hide();
}

/**
 * FUNCIÓN PARA CARGAR TODOS LOS CATÁLOGOS DEL FORMULARIO
 *
 * Carga dinámicamente todos los datos necesarios para el formulario de pagos.
 * El frontend se adapta completamente al modelo Payment del backend que requiere:
 * - Usuarios (obligatorio)
 * - Estados (obligatorio) 
 * - Facturas (opcional)
 * - Reservas (opcional)
 * - Asignaciones de parqueadero (opcional)
 *
 * Se cargan en paralelo para mejorar el rendimiento pero con manejo de errores independiente.
 */
function getDataSelects(){
  // Obtiene el token del sistema AppStorage que maneja la autenticación
  const token = getAuthToken();

  // CARGA LOS USUARIOS DISPONIBLES PARA EL SELECT (OBLIGATORIO)
  console.log('Cargando usuarios para formulario de pagos...');
  getServicesAuth('', METHODS[0], URL_PROFILE, token).then(r=>r.json()).then(d=>{
    if (d.data){
      objSelectUser.innerHTML='<option value="" selected disabled>Seleccione el usuario</option>';
      d.data.forEach(u=>{ 
        const displayName = u.full_name || u.username || 'Usuario ' + (u.user_id || u.id);
        objSelectUser.innerHTML+=`<option value="${u.user_id || u.id}">${displayName}</option>`;
      });
      console.log('Usuarios cargados exitosamente:', d.data.length, 'registros');
    }
  }).catch(error => {
    console.error('Error al cargar usuarios:', error);
    objSelectUser.innerHTML='<option value="" disabled style="color: red;">Error al cargar usuarios</option>';
  });
  
  // CARGA LOS ESTADOS DISPONIBLES PARA EL SELECT (OBLIGATORIO)
  // El sistema filtra los estados por la entidad payment
  console.log('Cargando estados para formulario de pagos...');
  getServicesAuth('', METHODS[0], URL_STATUS + '?entity=payment', token).then(r=>r.json()).then(d=>{
    if (d.data){
      objSelectStatus.innerHTML='<option value="" selected disabled>Seleccione el estado</option>';
      d.data.forEach(s=> objSelectStatus.innerHTML+=`<option value="${s.status_id}">${s.status_name || s.name}</option>`);
      console.log('Estados de payment cargados exitosamente:', d.data.length, 'registros');
    }
  }).catch(error => {
    console.error('Error al cargar estados de payment:', error);
    objSelectStatus.innerHTML='<option value="" disabled style="color: red;">Error al cargar estados</option>';
  });

  // CARGA LAS FACTURAS DISPONIBLES PARA EL SELECT (OPCIONAL)
  console.log('Cargando facturas para formulario de pagos...');
  getServicesAuth('', METHODS[0], URL_INVOICE, token).then(r=>r.json()).then(d=>{
    if (d.data){ 
      objSelectInvoice.innerHTML='<option value="" selected>Sin factura</option>'; 
      d.data.forEach(i=> {
        const invoiceDesc = i.description || i.concept || `Factura #${i.invoice_id || i.id}`;
        const invoiceAmount = i.total_amount ? ` - $${parseFloat(i.total_amount).toLocaleString()}` : '';
        objSelectInvoice.innerHTML+=`<option value="${i.invoice_id || i.id}">${invoiceDesc}${invoiceAmount}</option>`;
      });
      console.log('Facturas cargadas exitosamente:', d.data.length, 'registros');
    }
  }).catch(error => {
    console.error('Error al cargar facturas:', error);
    objSelectInvoice.innerHTML='<option value="" disabled style="color: red;">Error al cargar facturas</option>';
  });

  // CARGA LAS RESERVAS DISPONIBLES PARA EL SELECT (OPCIONAL)
  console.log('Cargando reservas para formulario de pagos...');
  getServicesAuth('', METHODS[0], URL_RESERVATION, token).then(r=>r.json()).then(d=>{
    if (d.data){ 
      objSelectReservation.innerHTML='<option value="" selected>Sin reserva</option>'; 
      d.data.forEach(r=> {
        const reserveDesc = r.description || r.amenity_name || `Reserva #${r.reservation_id || r.id}`;
        const reserveDate = r.reservation_date ? ` - ${new Date(r.reservation_date).toLocaleDateString()}` : '';
        objSelectReservation.innerHTML+=`<option value="${r.reservation_id || r.id}">${reserveDesc}${reserveDate}</option>`;
      });
      console.log('Reservas cargadas exitosamente:', d.data.length, 'registros');
    }
  }).catch(error => {
    console.error('Error al cargar reservas:', error);
    objSelectReservation.innerHTML='<option value="" disabled style="color: red;">Error al cargar reservas</option>';
  });

  // CARGA LAS ASIGNACIONES DE PARQUEADERO PARA EL SELECT (OPCIONAL)
  console.log('Cargando asignaciones de parqueadero para formulario de pagos...');
  getServicesAuth('', METHODS[0], URL_PARKINGASSIGNMENT.slice(0, -1), token).then(r=>r.json()).then(d=>{
    if (d.data){ 
      objSelectParking.innerHTML='<option value="" selected>Sin espacio</option>'; 
      d.data.forEach(p=> {
        const parkingDesc = `Espacio de parqueo ${p.parking_slot_number || p.slot_number || p.assignment_id}` + 
                           (p.zone_name ? ` - ${p.zone_name}` : '') +
                           (p.vehicle_plate ? ` (${p.vehicle_plate})` : '');
        objSelectParking.innerHTML+=`<option value="${p.assignment_id || p.id}">${parkingDesc}</option>`;
      });
      console.log('Asignaciones de parqueadero cargadas exitosamente:', d.data.length, 'registros');
    }
  }).catch(error => {
    console.error('Error al cargar asignaciones de parqueadero:', error);
    objSelectParking.innerHTML='<option value="" disabled style="color: red;">Error al cargar parqueaderos</option>';
  });
}

function loadView(){
  getData();
  getDataSelects();
}

window.addEventListener('load', ()=>{ loadView(); });

window.showId = function (id) { // expose for buttons
  objForm.resetForm(); objForm.disabledForm(); objForm.disabledButton(); objForm.hiddenButton(); getDataId(id);
}
window.delete_ = delete_;
window.edit = edit;

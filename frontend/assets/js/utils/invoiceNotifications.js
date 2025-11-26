/**
 * Sistema de Notificaciones para Facturas
 * Este archivo maneja las notificaciones automáticas para facturas próximas a vencer
 */

/**
 * Configuración de notificaciones
 */
const NOTIFICATION_CONFIG = {
  // Días antes del vencimiento para mostrar la notificación
  daysBeforeWarning: 7, // Notificar 7 días antes del vencimiento
  daysBeforeUrgent: 3,  // Notificar con urgencia 3 días antes

  // Intervalo de verificación (en milisegundos)
  // 3600000 ms = 1 hora (verifica cada hora si hay facturas por vencer)
  checkInterval: 3600000,

  // Mostrar notificaciones en el navegador
  showBrowserNotifications: true,

  // Habilitar notificaciones
  enabled: true
};

/**
 * Verifica si hay facturas próximas a vencer y muestra notificaciones
 * Esta función se puede llamar desde cualquier parte de la aplicación
 */
async function checkUpcomingInvoices() {
  // Si las notificaciones están deshabilitadas, no hace nada
  if (!NOTIFICATION_CONFIG.enabled) {
    return;
  }

  try {
    // Obtiene el token de autenticación
    const token = localStorage.getItem(KEY_TOKEN);
    if (!token) {
      console.log('No hay token de autenticación para verificar facturas');
      return;
    }

    // Obtiene todas las facturas pendientes del servidor
    const url = `${HOST}/invoice/pending`;
    const response = await getServicesAuth('', 'GET', url, token);
    const data = await response.json();

    const pendingInvoices = Array.isArray(data) ? data : (data.data || []);

    // Fecha actual
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetea horas para comparar solo fechas

    // Filtra facturas próximas a vencer
    const upcomingInvoices = pendingInvoices.filter(invoice => {
      const dueDate = new Date(invoice.due_date || invoice.Invoice_due_date);
      dueDate.setHours(0, 0, 0, 0);

      // Calcula días hasta el vencimiento
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      // Retorna true si está dentro del periodo de advertencia y aún no venció
      return daysUntilDue >= 0 && daysUntilDue <= NOTIFICATION_CONFIG.daysBeforeWarning;
    });

    // Si hay facturas próximas a vencer, muestra notificaciones
    if (upcomingInvoices.length > 0) {
      showInvoiceNotifications(upcomingInvoices);
    }

  } catch (error) {
    console.error('Error al verificar facturas próximas a vencer:', error);
  }
}

/**
 * Muestra notificaciones para facturas próximas a vencer
 * @param {Array} invoices - Array de facturas próximas a vencer
 */
function showInvoiceNotifications(invoices) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Separa las facturas urgentes de las normales
  const urgentInvoices = [];
  const warningInvoices = [];

  invoices.forEach(invoice => {
    const dueDate = new Date(invoice.due_date || invoice.Invoice_due_date);
    dueDate.setHours(0, 0, 0, 0);

    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilDue <= NOTIFICATION_CONFIG.daysBeforeUrgent) {
      urgentInvoices.push({ ...invoice, daysUntilDue });
    } else {
      warningInvoices.push({ ...invoice, daysUntilDue });
    }
  });

  // Muestra notificación en pantalla (toast notification)
  showToastNotification(urgentInvoices, warningInvoices);

  // Muestra notificación del navegador si está habilitado
  if (NOTIFICATION_CONFIG.showBrowserNotifications) {
    showBrowserNotification(urgentInvoices, warningInvoices);
  }

  // Guarda en localStorage la última vez que se mostró la notificación
  localStorage.setItem('lastInvoiceNotificationCheck', new Date().toISOString());
}

/**
 * Muestra una notificación tipo Toast en la página
 * @param {Array} urgentInvoices - Facturas urgentes
 * @param {Array} warningInvoices - Facturas con advertencia
 */
function showToastNotification(urgentInvoices, warningInvoices) {
  // Crea el contenedor de notificaciones si no existe
  let toastContainer = document.getElementById('invoice-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'invoice-toast-container';
    toastContainer.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999; max-width: 350px;';
    document.body.appendChild(toastContainer);
  }

  // Crea la notificación
  const toast = document.createElement('div');
  toast.className = 'alert alert-dismissible fade show shadow-lg';
  toast.role = 'alert';

  // Define el estilo según la urgencia
  if (urgentInvoices.length > 0) {
    toast.classList.add('alert-danger');
    const invoice = urgentInvoices[0];
    const daysText = invoice.daysUntilDue === 0 ? 'HOY' : `en ${invoice.daysUntilDue} día(s)`;

    toast.innerHTML = `
      <h6 class="alert-heading"><i class="bi bi-exclamation-triangle-fill me-2"></i>¡Factura Urgente!</h6>
      <p class="mb-1">La factura <strong>${invoice.invoice_number || invoice.Invoice_invoice_number}</strong> vence ${daysText}.</p>
      <p class="mb-0"><small>Monto: ${formatCurrency(invoice.total_amount || invoice.Invoice_total_amount)}</small></p>
      <hr>
      <a href="#invoice" class="alert-link">Ver todas las facturas</a>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
  } else if (warningInvoices.length > 0) {
    toast.classList.add('alert-warning');

    toast.innerHTML = `
      <h6 class="alert-heading"><i class="bi bi-clock-history me-2"></i>Facturas Próximas a Vencer</h6>
      <p class="mb-1">Tienes <strong>${warningInvoices.length}</strong> factura(s) próxima(s) a vencer.</p>
      <hr>
      <a href="#invoice" class="alert-link">Ver todas las facturas</a>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
  }

  // Agrega la notificación al contenedor
  toastContainer.appendChild(toast);

  // Auto-cierra la notificación después de 10 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 10000);
}

/**
 * Muestra una notificación del navegador (si tiene permisos)
 * @param {Array} urgentInvoices - Facturas urgentes
 * @param {Array} warningInvoices - Facturas con advertencia
 */
function showBrowserNotification(urgentInvoices, warningInvoices) {
  // Verifica si el navegador soporta notificaciones
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones de escritorio');
    return;
  }

  // Solicita permisos si no los tiene
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        sendBrowserNotification(urgentInvoices, warningInvoices);
      }
    });
  } else if (Notification.permission === 'granted') {
    sendBrowserNotification(urgentInvoices, warningInvoices);
  }
}

/**
 * Envía la notificación del navegador
 * @param {Array} urgentInvoices - Facturas urgentes
 * @param {Array} warningInvoices - Facturas con advertencia
 */
function sendBrowserNotification(urgentInvoices, warningInvoices) {
  let title, body, icon;

  if (urgentInvoices.length > 0) {
    const invoice = urgentInvoices[0];
    const daysText = invoice.daysUntilDue === 0 ? 'HOY' : `en ${invoice.daysUntilDue} día(s)`;

    title = '¡Factura Urgente!';
    body = `La factura ${invoice.invoice_number || invoice.Invoice_invoice_number} vence ${daysText}. ` +
           `Monto: ${formatCurrency(invoice.total_amount || invoice.Invoice_total_amount)}`;
    icon = '../../assets/img/icons/invoice-icon.png'; // Opcional: icono de factura
  } else {
    title = 'Facturas Próximas a Vencer';
    body = `Tienes ${warningInvoices.length} factura(s) próxima(s) a vencer. Haz clic para ver detalles.`;
    icon = '../../assets/img/icons/invoice-icon.png'; // Opcional: icono de factura
  }

  const notification = new Notification(title, {
    body: body,
    icon: icon || '../../assets/img/logos/logo.png', // Usa el logo de la app si no hay icono específico
    badge: icon || '../../assets/img/logos/logo.png',
    tag: 'invoice-notification', // Evita notificaciones duplicadas
    requireInteraction: urgentInvoices.length > 0 // Requiere interacción si es urgente
  });

  // Al hacer clic en la notificación, redirige a la página de facturas
  notification.onclick = function() {
    window.focus();
    window.location.hash = '#invoice';
    notification.close();
  };
}

/**
 * Formatea un número como moneda colombiana
 * @param {Number} amount - Monto a formatear
 * @returns {String} Monto formateado
 */
function formatCurrency(amount) {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount);
  } catch (e) {
    return '$' + (amount || 0);
  }
}

/**
 * Inicializa el sistema de notificaciones
 * Esta función se llama automáticamente cuando se carga la página
 */
function initInvoiceNotifications() {
  // Verifica inmediatamente al cargar
  checkUpcomingInvoices();

  // Configura la verificación periódica
  setInterval(checkUpcomingInvoices, NOTIFICATION_CONFIG.checkInterval);

  console.log('Sistema de notificaciones de facturas inicializado');
  console.log(`Verificando cada ${NOTIFICATION_CONFIG.checkInterval / 1000 / 60} minutos`);
}

/**
 * Función para habilitar o deshabilitar notificaciones
 * Puede ser llamada desde la consola del navegador o desde configuración
 * @param {Boolean} enabled - true para habilitar, false para deshabilitar
 */
function toggleInvoiceNotifications(enabled) {
  NOTIFICATION_CONFIG.enabled = enabled;
  localStorage.setItem('invoiceNotificationsEnabled', enabled ? 'true' : 'false');
  console.log(`Notificaciones de facturas ${enabled ? 'habilitadas' : 'deshabilitadas'}`);
}

// Carga la preferencia guardada del usuario
const savedPreference = localStorage.getItem('invoiceNotificationsEnabled');
if (savedPreference !== null) {
  NOTIFICATION_CONFIG.enabled = savedPreference === 'true';
}

// Inicializa automáticamente cuando el documento esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInvoiceNotifications);
} else {
  initInvoiceNotifications();
}

// Expone las funciones globalmente para poder usarlas desde la consola
window.checkUpcomingInvoices = checkUpcomingInvoices;
window.toggleInvoiceNotifications = toggleInvoiceNotifications;

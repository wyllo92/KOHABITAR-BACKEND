/* Dashboard controller
   - El sistema obtiene métricas de resumen y renderiza dos gráficos (fondo de reserva e incidencias)
   - El sistema utiliza getDataServices(url, method, body, token) de services.js y constantes de constants.js
   - El sistema consulta la entidad parking_slots para mostrar el total de espacios disponibles
   - El sistema filtra los parking slots por status_id === 1 (disponible) en la tarjeta de parqueaderos
   - El sistema actualiza automáticamente los datos cada vez que se recarga el dashboard
*/
(function () {
  const el = {
    users: document.getElementById('stat-users'),
    parkings: document.getElementById('stat-parkings'),
    properties: document.getElementById('stat-properties'),
    payments: document.getElementById('stat-payments'),
    updated: document.getElementById('dashboard-updated'),
    loading: document.getElementById('loading-screen')
  };

  // Utility to format money
  function fmtMoney(n){
    try{ return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits:0 }).format(n); }
    catch(e){ return '$'+(n||0); }
  }

  // Actualiza la sección de facturas en el dashboard
  function updateInvoicesSummary(invoices, overdueInvoices){
    try{
      // Filtra las facturas pendientes (estado "Pendiente")
      const pendingInvoices = invoices.filter(inv =>
        inv.status_name === 'Pendiente' || inv.status_id === 1
      );

      // Calcula el total pendiente de pago
      const totalPending = pendingInvoices.reduce((sum, inv) => {
        return sum + (Number(inv.amount) || 0);
      }, 0);

      // Actualiza los contadores en el HTML
      document.getElementById('invoice-pending-count').textContent = pendingInvoices.length;
      document.getElementById('invoice-overdue-count').textContent = overdueInvoices.length;
      document.getElementById('invoice-total-amount').textContent = fmtMoney(totalPending);

      // Muestra las facturas vencidas en una lista
      const overdueList = document.getElementById('invoice-overdue-list');
      if(overdueInvoices.length > 0){
        let html = '<div class="alert alert-danger mb-0"><strong>Facturas Vencidas:</strong><ul class="mb-0 mt-2">';
        overdueInvoices.slice(0, 5).forEach(inv => {
          const userName = inv.full_name || inv.username || 'Usuario';
          const amount = fmtMoney(inv.amount || 0);
          const dueDate = new Date(inv.due_date).toLocaleDateString('es-ES');
          html += `<li>${userName} - ${amount} (Vencimiento: ${dueDate})</li>`;
        });
        if(overdueInvoices.length > 5){
          html += `<li class="text-muted">...y ${overdueInvoices.length - 5} más</li>`;
        }
        html += '</ul></div>';
        overdueList.innerHTML = html;
      } else {
        overdueList.innerHTML = '<div class="alert alert-success mb-0"><i class="fas fa-check-circle me-2"></i>No hay facturas vencidas</div>';
      }
    }catch(e){
      console.error('Error updating invoices summary:', e);
    }
  }

  /**
   * El sistema obtiene todos los contadores y datos necesarios para el dashboard
   * Realiza peticiones paralelas a múltiples endpoints para optimizar el tiempo de carga
   */
  async function fetchCounts(){
    // El sistema obtiene el token de autenticación usando la constante KEY_TOKEN definida en constants.js
    // Esto asegura que se use la misma clave ('token-app') que el login usa para guardar el token
    const token = localStorage.getItem(KEY_TOKEN) || null;

    /**
     * El sistema define una función auxiliar para realizar peticiones autenticadas
     * @param {string} url - La URL del endpoint a consultar
     * @returns {Promise} Los datos obtenidos del servidor o null en caso de error
     */
    const fetchWithAuth = async (url)=>{
      try{
        if(token) {
          const r = await getServicesAuth('', 'GET', url, token);
          return await r.json();
        } else{
          const r = await getDataServices('', 'GET', url);
          return await r.json();
        }
      }catch(e){
        return null;
      }
    };

    // El sistema realiza todas las peticiones en paralelo para mejorar el rendimiento
    // Obtiene datos de usuarios, espacios de parqueadero, propiedades, pagos, PQRS e facturas
    const [u, pslot, prop, pay, pqrs, invoices, overdueInvoices] = await Promise.all([
      fetchWithAuth(URL_USER),
      fetchWithAuth(URL_PARKINGSLOT), // El sistema consulta todos los espacios de parqueadero
      fetchWithAuth(URL_PROPERTY),
      fetchWithAuth(URL_PAYMENT),
      fetchWithAuth(URL_CPCG),
      fetchWithAuth(URL_INVOICE),
      fetchWithAuth(URL_INVOICE + '/overdue')
    ]);

    // El sistema inicializa el objeto de salida con valores por defecto en cero
    const out = { users:0, parkingsAvailable:0, properties:0, paymentsTotal:0, pqrs:0 };

    // El sistema procesa el array de usuarios
    const usersArray = Array.isArray(u) ? u : (u && Array.isArray(u.data) ? u.data : []);
    out.users = usersArray.length;

    // El sistema procesa el array de espacios de parqueadero
    // Normaliza la respuesta porque puede venir como array directo o dentro de data
    const parkArray = Array.isArray(pslot) ? pslot : (pslot && Array.isArray(pslot.data) ? pslot.data : []);
    // El sistema filtra únicamente los espacios de parqueadero con estado disponible
    // Busca espacios donde status_name sea "Disponible" o que no estén reservados (is_reserved === 0)
    // Esto permite mostrar en el dashboard solo los espacios que están libres para asignar
    // El filtro maneja tanto el nombre del estado como el campo is_reserved para mayor precisión
    try{
      out.parkingsAvailable = parkArray.filter(p=>
        (p.status_name === 'Disponible' || p.status_id === 1 || p.status_id === '1') &&
        (p.is_reserved === 0 || p.is_reserved === '0' || p.is_reserved === false)
      ).length;
    } catch(e){
      // El sistema maneja errores en el filtrado mostrando el total de espacios sin filtrar
      out.parkingsAvailable = parkArray.length;
    }

    const propArray = Array.isArray(prop) ? prop : (prop && Array.isArray(prop.data) ? prop.data : []);
    out.properties = propArray.length;

    const payArray = Array.isArray(pay) ? pay : (pay && Array.isArray(pay.data) ? pay.data : []);
    out.paymentsTotal = payArray.reduce((s,it)=> s + (Number(it.amount_paid || it.Payment_amount_paid || 0)||0), 0);

    const pqrsArray = Array.isArray(pqrs) ? pqrs : (pqrs && Array.isArray(pqrs.data) ? pqrs.data : []);
    out.pqrs = pqrsArray.length;

    // Procesa las facturas
    const invoicesArray = Array.isArray(invoices) ? invoices : (invoices && Array.isArray(invoices.data) ? invoices.data : []);
    out.invoices = invoicesArray;

    const overdueArray = Array.isArray(overdueInvoices) ? overdueInvoices : (overdueInvoices && Array.isArray(overdueInvoices.data) ? overdueInvoices.data : []);
    out.overdueInvoices = overdueArray;

    return out;
  }

  // Mocked series generator for reserve fund if no real endpoint provided
  function mockReserveSeries(){
    const labels = [];
    const data = [];
    const now = new Date();
    for(let i=5;i>=0;i--){
      const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
      labels.push(d.toLocaleString('default',{month:'short', year:'2-digit'}));
      data.push(Math.round(5000000 + Math.random()*2000000 - i*200000));
    }
    return { labels, data };
  }

  // Incidents series from PQRS endpoint (group by month)
  async function incidentsSeries(){
    // Obtiene el token de autenticación usando la constante KEY_TOKEN
    const token = localStorage.getItem(KEY_TOKEN) || null;
    try{
      let resp;
      if(token) resp = await getServicesAuth('', 'GET', URL_CPCG, token);
      else resp = await getDataServices('', 'GET', URL_CPCG);
      const j = await resp.json();
      const items = Array.isArray(j) ? j : (j && Array.isArray(j.data) ? j.data : []);
      if(!items || items.length===0) return mockReserveSeries();
      const map = {};
      items.forEach(it=>{
        const d = new Date(it.CPCG_createAt || it.CPCG_created_at || it.created_at || Date.now());
        const key = d.getFullYear()+'-'+(d.getMonth()+1);
        map[key] = (map[key]||0)+1;
      });
      const keys = Object.keys(map).sort();
      const labels = keys.map(k=>{ const [y,m]=k.split('-'); return `${m}/${y.slice(2)}`; });
      const data = keys.map(k=>map[k]);
      return { labels, data };
    }catch(e){ return mockReserveSeries(); }
  }

  // Payments series using /payments to get real monthly totals
  async function paymentsSeries(months = 6){
    // Obtiene el token de autenticación usando la constante KEY_TOKEN
    const token = localStorage.getItem(KEY_TOKEN) || null;
    try{
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - (months-1), 1);
      const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
      // Utiliza el endpoint correcto /payments que está definido en payment.router.js
      const url = URL_PAYMENT;
      let resp;
      if(token) resp = await getServicesAuth('', 'GET', url, token);
      else resp = await getDataServices('', 'GET', url);
      const j = await resp.json();
      const items = Array.isArray(j) ? j : (j && Array.isArray(j.data) ? j.data : []);
      // Filtra los pagos por rango de fechas en el frontend
      const filtered = items.filter(it => {
        const paymentDate = new Date(it.payment_date || it.Payment_date || it.created_at);
        return paymentDate >= start && paymentDate <= end;
      });
      if(!filtered || filtered.length===0) return mockReserveSeries();
      const map = {};
      filtered.forEach(it=>{
        const d = new Date(it.payment_date || it.Payment_date || it.created_at || Date.now());
        const key = d.getFullYear()+'-'+(d.getMonth()+1);
        map[key] = (map[key]||0) + (Number(it.amount_paid || it.Payment_amount_paid || 0)||0);
      });
      const labels = [];
      const data = [];
      for(let i=months-1;i>=0;i--){
        const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
        const key = d.getFullYear()+'-'+(d.getMonth()+1);
        labels.push(d.toLocaleString('default',{month:'short', year:'2-digit'}));
        data.push(Math.round(map[key] || 0));
      }
      return { labels, data };
    }catch(e){ return mockReserveSeries(); }
  }

  // Create charts
  let reserveChart = null;
  let incidentsChart = null;
  function createLineChart(ctx, labels, data, label, color){
    return new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label, data, borderColor: color, backgroundColor: color+'44', tension: 0.25 }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  /**
   * El sistema inicializa el dashboard cargando todos los datos y gráficos
   * Esta función se ejecuta cuando la página termina de cargar
   */
  async function init(){
    try{
      // El sistema muestra el indicador de carga mientras obtiene los datos
      el.loading.style.display = 'flex';
    }catch(e){}

    // El sistema obtiene todos los contadores del servidor
    // Si hay un error, usa valores por defecto en cero para evitar que el dashboard falle
    const counts = await fetchCounts().catch(()=>({ users:0, parkingsAvailable:0, properties:0, paymentsTotal:0, pqrs:0, invoices:[], overdueInvoices:[] }));

    // El sistema actualiza las tarjetas del dashboard con los datos obtenidos
    el.users.textContent = counts.users;
    // El sistema actualiza la tarjeta de parqueaderos mostrando solo los espacios disponibles
    // Este valor se actualiza automáticamente cada vez que se llama a init() o se recargan los datos
    el.parkings.textContent = counts.parkingsAvailable;
    el.properties.textContent = counts.properties;
    el.payments.textContent = fmtMoney(counts.paymentsTotal);

    // Actualiza la sección de facturas pendientes y vencidas
    updateInvoicesSummary(counts.invoices || [], counts.overdueInvoices || []);

  // El sistema crea la gráfica del fondo de reserva con datos mensuales de pagos
  const reserve = await paymentsSeries(6);
    const reserveCtx = document.getElementById('chart-reserve').getContext('2d');
    // El sistema utiliza el color azul medio (#2980b9) para armonizar con la paleta del menú
    reserveChart = createLineChart(reserveCtx, reserve.labels, reserve.data, 'Fondo de Reserva', 'rgb(41,128,185)');

    // El sistema crea la gráfica de incidencias con datos agrupados por mes
    const inc = await incidentsSeries();
    const incCtx = document.getElementById('chart-incidents').getContext('2d');
    // El sistema utiliza el color verde (#27ae60) para armonizar con la paleta del menú
    incidentsChart = createLineChart(incCtx, inc.labels, inc.data, 'Incidencias', 'rgb(39,174,96)');

    try{ el.updated.textContent = new Date().toLocaleString(); }catch(e){}
    try{ el.loading.style.display = 'none'; }catch(e){}
  }
  // Initialize when DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    // small delay to ensure Chart lib loaded
    setTimeout(init, 120);
  });

})();
document.addEventListener('DOMContentLoaded', async ()=> {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
 
  await checkAuth();
  console.log('dashboard controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
  // Initialize the loading screen
    
});
/* Dashboard controller
   - Fetches summary metrics and renders two charts (reserve fund and incidents)
   - Uses getDataServices(url, method, body, token) from services.js and constants in constants.js
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

  async function fetchCounts(){
    const token = localStorage.getItem('token') || null;
    const fetchWithAuth = async (url)=>{
      try{
        if(token) {
          const r = await getServicesAuth('', 'GET', url, token);
          return await r.json();
        } else {
          const r = await getDataServices('', 'GET', url);
          return await r.json();
        }
      }catch(e){
        return null;
      }
    };

    const [u, pslot, prop, pay, pqrs] = await Promise.all([
      fetchWithAuth(URL_USER),
      fetchWithAuth(URL_PARKINGSLOT),
      fetchWithAuth(URL_PROPERTY),
      fetchWithAuth(URL_PAYMENT),
      fetchWithAuth(URL_PQRS)
    ]);

    const out = { users:0, parkingsAvailable:0, properties:0, paymentsTotal:0, pqrs:0 };

    const usersArray = Array.isArray(u) ? u : (u && Array.isArray(u.data) ? u.data : []);
    out.users = usersArray.length;

    const parkArray = Array.isArray(pslot) ? pslot : (pslot && Array.isArray(pslot.data) ? pslot.data : []);
    try{ out.parkingsAvailable = parkArray.filter(p=> p.Parkingslot_status_id === 1 || p.Parkingslot_status_id === '1').length; } catch(e){ out.parkingsAvailable = parkArray.length; }

    const propArray = Array.isArray(prop) ? prop : (prop && Array.isArray(prop.data) ? prop.data : []);
    out.properties = propArray.length;

    const payArray = Array.isArray(pay) ? pay : (pay && Array.isArray(pay.data) ? pay.data : []);
    out.paymentsTotal = payArray.reduce((s,it)=> s + (Number(it.amount_paid || it.Payment_amount_paid || 0)||0), 0);

    const pqrsArray = Array.isArray(pqrs) ? pqrs : (pqrs && Array.isArray(pqrs.data) ? pqrs.data : []);
    out.pqrs = pqrsArray.length;

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
    const token = localStorage.getItem('token') || null;
    try{
      let resp;
      if(token) resp = await getServicesAuth('', 'GET', URL_PQRS, token);
      else resp = await getDataServices('', 'GET', URL_PQRS);
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

  // Payments series using /payment/daterange to get real monthly totals
  async function paymentsSeries(months = 6){
    const token = localStorage.getItem('token') || null;
    try{
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - (months-1), 1);
      const end = new Date(now.getFullYear(), now.getMonth()+1, 0);
      const fmt = d => d.toISOString().slice(0,10);
      const url = URL_PAYMENT + `daterange?startDate=${fmt(start)}&endDate=${fmt(end)}`;
      let resp;
      if(token) resp = await getServicesAuth('', 'GET', url, token);
      else resp = await getDataServices('', 'GET', url);
      const j = await resp.json();
      const items = Array.isArray(j) ? j : (j && Array.isArray(j.data) ? j.data : []);
      if(!items || items.length===0) return mockReserveSeries();
      const map = {};
      items.forEach(it=>{
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

  async function init(){
    try{
      el.loading.style.display = 'flex';
    }catch(e){}

    const counts = await fetchCounts().catch(()=>({ users:0, parkingsAvailable:0, properties:0, paymentsTotal:0, pqrs:0 }));

    el.users.textContent = counts.users;
    el.parkings.textContent = counts.parkingsAvailable;
    el.properties.textContent = counts.properties;
    el.payments.textContent = fmtMoney(counts.paymentsTotal);

  // Reserve chart: try fetching real payments grouped monthly; fallback to mock
  const reserve = await paymentsSeries(6);
    const reserveCtx = document.getElementById('chart-reserve').getContext('2d');
    reserveChart = createLineChart(reserveCtx, reserve.labels, reserve.data, 'Fondo de Reserva', 'rgb(54,162,235)');

    // Incidents chart
    const inc = await incidentsSeries();
    const incCtx = document.getElementById('chart-incidents').getContext('2d');
    incidentsChart = createLineChart(incCtx, inc.labels, inc.data, 'Incidencias', 'rgb(255,99,132)');

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
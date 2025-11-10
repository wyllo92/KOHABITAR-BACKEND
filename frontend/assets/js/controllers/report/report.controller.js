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

  // Fetch summary from backend
  async function fetchSummary(){
    const token = localStorage.getItem('token') || null;
    try{
      let resp;
      if(token) resp = await getServicesAuth('', 'GET', URL_REPORT + 'summary', token);
      else resp = await getDataServices('', 'GET', URL_REPORT + 'summary');
      const j = await resp.json();
      return j.data || {};
    }catch(e){
      console.error('Error fetching summary:', e);
      return { users:0, parkingsAvailable:0, properties:0, payments: { total_amount: 0 }, pqrs:0 };
    }
  }

  // Fetch payments chart data from backend
  async function fetchPaymentsChart(months = 6){
    const token = localStorage.getItem('token') || null;
    try{
      let resp;
      if(token) resp = await getServicesAuth('', 'GET', URL_REPORT + `payments-chart?months=${months}`, token);
      else resp = await getDataServices('', 'GET', URL_REPORT + `payments-chart?months=${months}`);
      const j = await resp.json();
      return j.data || [];
    }catch(e){
      console.error('Error fetching payments chart:', e);
      return [];
    }
  }

  // Fetch PQRS chart data from backend
  async function fetchPqrsChart(months = 6){
    const token = localStorage.getItem('token') || null;
    try{
      let resp;
      if(token) resp = await getServicesAuth('', 'GET', URL_REPORT + `pqrs-chart?months=${months}`, token);
      else resp = await getDataServices('', 'GET', URL_REPORT + `pqrs-chart?months=${months}`);
      const j = await resp.json();
      return j.data || [];
    }catch(e){
      console.error('Error fetching PQRS chart:', e);
      return [];
    }
  }

  // Format chart data for Chart.js
  function formatChartData(backendData, months = 6){
    const now = new Date();
    const map = {};
    
    // Create map from backend data
    backendData.forEach(item => {
      const key = `${item.year}-${item.month}`;
      map[key] = item.total;
    });

    // Generate labels and data for all months
    const labels = [];
    const data = [];
    for(let i = months - 1; i >= 0; i--){
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      labels.push(d.toLocaleString('es-ES', { month: 'short', year: '2-digit' }));
      data.push(map[key] || 0);
    }

    return { labels, data };
  }

  // Create charts
  let reserveChart = null;
  let incidentsChart = null;
  function createLineChart(ctx, labels, data, label, color, chartInstance){
    if(chartInstance) chartInstance.destroy();
    
    return new Chart(ctx, {
      type: 'line',
      data: { 
        labels, 
        datasets: [{ 
          label, 
          data, 
          borderColor: color, 
          backgroundColor: color + '44', 
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }] 
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                if(label.includes('Fondo')) {
                  return fmtMoney(value);
                }
                return value;
              }
            }
          }
        }
      }
    });
  }

  // Update payments chart
  async function updatePaymentsChart(months = 6){
    const data = await fetchPaymentsChart(months);
    const formatted = formatChartData(data, months);
    const reserveCtx = document.getElementById('chart-reserve').getContext('2d');
    reserveChart = createLineChart(reserveCtx, formatted.labels, formatted.data, 'Fondo de Reserva (COP)', 'rgb(54,162,235)', reserveChart);
  }

  // Update PQRS chart
  async function updatePqrsChart(months = 6){
    const data = await fetchPqrsChart(months);
    const formatted = formatChartData(data, months);
    const incCtx = document.getElementById('chart-incidents').getContext('2d');
    incidentsChart = createLineChart(incCtx, formatted.labels, formatted.data, 'Incidencias', 'rgb(255,99,132)', incidentsChart);
  }

  // Export to PDF
  async function exportToPDF(){
    try{
      const token = localStorage.getItem('token') || null;
      let resp;
      if(token) resp = await getServicesAuth('', 'GET', URL_REPORT + 'full', token);
      else resp = await getDataServices('', 'GET', URL_REPORT + 'full');
      const j = await resp.json();
      
      if(!j || !j.data){
        throw new Error('No se pudieron obtener los datos del reporte');
      }
      
      const reportData = j.data;

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('Reporte General - Conjunto Residencial', 14, 20);
      doc.setFontSize(12);
      doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 30);

      let yPos = 40;

      // Summary section
      doc.setFontSize(14);
      doc.text('Resumen General', 14, yPos);
      yPos += 10;
      doc.setFontSize(10);
      doc.text(`Usuarios: ${reportData.summary?.users || 0}`, 20, yPos);
      yPos += 7;
      doc.text(`Propiedades: ${reportData.summary?.properties || 0}`, 20, yPos);
      yPos += 7;
      doc.text(`Parqueaderos Disponibles: ${reportData.summary?.parkingsAvailable || 0}`, 20, yPos);
      yPos += 7;
      doc.text(`Total Pagos: ${fmtMoney(reportData.summary?.payments?.total_amount || 0)}`, 20, yPos);
      yPos += 7;
      doc.text(`PQRS: ${reportData.summary?.pqrs || 0}`, 20, yPos);
      yPos += 15;

      // Charts data
      if(reportData.charts && reportData.charts.payments && reportData.charts.payments.length > 0){
        doc.setFontSize(12);
        doc.text('Evolución de Pagos (Últimos 12 meses)', 14, yPos);
        yPos += 10;
        const tableData = reportData.charts.payments.map(item => [
          `${item.month}/${item.year}`,
          fmtMoney(item.total)
        ]);
        doc.autoTable({
          startY: yPos,
          head: [['Mes', 'Total']],
          body: tableData,
          theme: 'striped'
        });
        yPos = doc.lastAutoTable.finalY + 15;
      }

      if(reportData.charts && reportData.charts.pqrs && reportData.charts.pqrs.length > 0){
        doc.setFontSize(12);
        doc.text('Evolución de PQRS (Últimos 12 meses)', 14, yPos);
        yPos += 10;
        const tableData = reportData.charts.pqrs.map(item => [
          `${item.month}/${item.year}`,
          item.total
        ]);
        doc.autoTable({
          startY: yPos,
          head: [['Mes', 'Cantidad']],
          body: tableData,
          theme: 'striped'
        });
      }

      doc.save(`reporte-${new Date().toISOString().split('T')[0]}.pdf`);
    }catch(e){
      console.error('Error exporting PDF:', e);
      alert('Error al exportar PDF: ' + e.message);
    }
  }

  // Export to Excel
  async function exportToExcel(){
    try{
      const token = localStorage.getItem('token') || null;
      let resp;
      if(token) resp = await getServicesAuth('', 'GET', URL_REPORT + 'full', token);
      else resp = await getDataServices('', 'GET', URL_REPORT + 'full');
      const j = await resp.json();
      
      if(!j || !j.data){
        throw new Error('No se pudieron obtener los datos del reporte');
      }
      
      const reportData = j.data;

      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ['Resumen General'],
        ['Usuarios', reportData.summary?.users || 0],
        ['Propiedades', reportData.summary?.properties || 0],
        ['Parqueaderos Disponibles', reportData.summary?.parkingsAvailable || 0],
        ['Total Pagos', reportData.summary?.payments?.total_amount || 0],
        ['PQRS', reportData.summary?.pqrs || 0]
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');

      // Payments chart sheet
      if(reportData.charts && reportData.charts.payments && reportData.charts.payments.length > 0){
        const paymentsData = [['Mes', 'Año', 'Total']];
        reportData.charts.payments.forEach(item => {
          paymentsData.push([item.month, item.year, item.total]);
        });
        const ws2 = XLSX.utils.aoa_to_sheet(paymentsData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Pagos');
      }

      // PQRS chart sheet
      if(reportData.charts && reportData.charts.pqrs && reportData.charts.pqrs.length > 0){
        const pqrsData = [['Mes', 'Año', 'Cantidad']];
        reportData.charts.pqrs.forEach(item => {
          pqrsData.push([item.month, item.year, item.total]);
        });
        const ws3 = XLSX.utils.aoa_to_sheet(pqrsData);
        XLSX.utils.book_append_sheet(wb, ws3, 'PQRS');
      }

      // Details sheets
      if(reportData.details && reportData.details.users && reportData.details.users.length > 0){
        const usersData = [['ID', 'Nombre', 'Email', 'Fecha Creación']];
        reportData.details.users.forEach(item => {
          usersData.push([item.user_id, item.user_name, item.profile_email || 'N/A', item.created_at || 'N/A']);
        });
        const ws4 = XLSX.utils.aoa_to_sheet(usersData);
        XLSX.utils.book_append_sheet(wb, ws4, 'Usuarios');
      }

      if(reportData.details && reportData.details.payments && reportData.details.payments.length > 0){
        const paymentsDetailData = [['ID', 'Usuario', 'Monto', 'Fecha', 'Método']];
        reportData.details.payments.forEach(item => {
          paymentsDetailData.push([
            item.payment_id,
            item.user_name || '',
            item.amount_paid || 0,
            item.payment_date || 'N/A',
            item.method || ''
          ]);
        });
        const ws5 = XLSX.utils.aoa_to_sheet(paymentsDetailData);
        XLSX.utils.book_append_sheet(wb, ws5, 'Pagos Detalle');
      }

      XLSX.writeFile(wb, `reporte-${new Date().toISOString().split('T')[0]}.xlsx`);
    }catch(e){
      console.error('Error exporting Excel:', e);
      alert('Error al exportar Excel: ' + e.message);
    }
  }

  async function init(){
    try{
      el.loading.style.display = 'flex';
    }catch(e){}

    // Fetch summary
    const summary = await fetchSummary();
    el.users.textContent = summary.users || 0;
    el.parkings.textContent = summary.parkingsAvailable || 0;
    el.properties.textContent = summary.properties || 0;
    el.payments.textContent = fmtMoney(summary.payments?.total_amount || 0);

    // Load charts
    await updatePaymentsChart(6);
    await updatePqrsChart(6);

    // Event listeners for month selectors
    document.getElementById('select-payments-months').addEventListener('change', (e) => {
      updatePaymentsChart(parseInt(e.target.value));
    });
    document.getElementById('select-pqrs-months').addEventListener('change', (e) => {
      updatePqrsChart(parseInt(e.target.value));
    });

    // Export buttons
    document.getElementById('btn-export-pdf').addEventListener('click', exportToPDF);
    document.getElementById('btn-export-excel').addEventListener('click', exportToExcel);
    document.getElementById('btn-refresh').addEventListener('click', () => {
      const btn = document.getElementById('btn-refresh');
      btn.classList.add('spinning');
      init().finally(() => {
        btn.classList.remove('spinning');
      });
    });

    try{ el.updated.textContent = new Date().toLocaleString('es-ES'); }catch(e){}
    try{ el.loading.style.display = 'none'; }catch(e){}
  }

  // Initialize when DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(init, 120);
  });

})();
document.addEventListener('DOMContentLoaded', async ()=> {
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
 
  await checkAuth();
  console.log('report controller has been loaded');
  fadeInElement(document.querySelector('body'), 1000);
});
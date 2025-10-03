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

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!objForm.validateForm()) return;
  toggleLoading(true);
  if (insertUpdate) {
    httpMethod = METHODS[1];
    endpointUrl = URL_PAYMENT;
  } else {
    httpMethod = METHODS[2];
    endpointUrl = URL_PAYMENT + keyId;
  }
  documentData = objForm.getDataForm();
  // Normalize optional ids
  ['invoice_id','reservation_id','parking_assignment_id'].forEach(k=>{
    if (documentData[k]==='') documentData[k]=null;
  });

  const result = getDataServices(documentData, httpMethod, endpointUrl);
  result.then(r=>r.json()).then(d=>{
    if (d.error) alert('Error: '+d.error);
  }).catch(err=>{
    console.error(err);
    alert('Network error');
  }).finally(()=>{
    loadView();
    showHiddenModal(false);
  });
});

function add(){
  insertUpdate = true;
  objForm.resetForm();
  objForm.enabledForm();
  objForm.enabledButton();
  objForm.showButton();
  showHiddenModal(true);
}

function edit(id){
  insertUpdate = false;
  keyId = id;
  objForm.resetForm();
  objForm.enabledEditForm();
  objForm.enabledButton();
  objForm.showButton();
  getDataId(id);
}

function delete_(id){
  if (!confirm('Confirmar eliminación')) return;
  const result = getDataServices('', METHODS[3], URL_PAYMENT+id);
  result.then(r=>r.json()).then(d=>{}).finally(()=>loadView());
}

function getDataId(id){
  getDataServices('', METHODS[0], URL_PAYMENT+id).then(r=>r.json()).then(d=>{
    if (d.data) objForm.setDataFormJson(d.data);
  }).finally(()=>showHiddenModal(true));
}

function createTable(data){
  objTableBody.innerHTML='';
  const rows = data.data || [];
  rows.forEach(row=>{
    const tr = `<tr>
<td>${row.payment_id}</td>
<td>${row.user_name||row.user_id}</td>
<td>${row.amount_paid}</td>
<td>${row.payment_date}</td>
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

function getData(){
  toggleLoading(true);
  getDataServices('', METHODS[0], URL_PAYMENT).then(r=>r.json()).then(d=>{
    createTable(d);
  }).finally(()=>{new DataTable(appTable); toggleLoading(false);});
}

function showHiddenModal(type){
  if (type) objModal.show(); else objModal.hide();
}

function getDataSelects(){
  getDataServices('', METHODS[0], URL_PROFILE).then(r=>r.json()).then(d=>{
    if (d.data){
      objSelectUser.innerHTML='';
      d.data.forEach(u=>{ objSelectUser.innerHTML+=`<option value="${u.user_id}">${u.user_name}</option>`});
    }
  });
  getDataServices('', METHODS[0], URL_STATUS).then(r=>r.json()).then(d=>{
    if (d.data){ objSelectStatus.innerHTML=''; d.data.forEach(s=> objSelectStatus.innerHTML+=`<option value="${s.status_id}">${s.status_name}</option>`)}
  });
  // invoices/reservations/parking can be added similarly if endpoints exist
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

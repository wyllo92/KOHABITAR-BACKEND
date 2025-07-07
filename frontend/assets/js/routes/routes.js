document.addEventListener('DOMContentLoaded', async function() {
const contentFrame = document.getElementById('contentFrame');
  document.querySelector('body').style.display = 'none';
  document.querySelector('body').style.opacity = 0;
await checkAuth();
console.log('Content controller has been loaded');
fadeInElement(document.querySelector('body'), 1000);

/*Routes for the application*/
const routes = {
  '#dashboard': 'views/dashboard/index.html',
  '#user': 'views/user/index.html',
  '#role': 'views/role/index.html',
  '#module': 'views/module/index.html',
  '#property': 'views/property/index.html',
  '#vehicle': 'views/vehicle/index.html',
  '#parkingslot': 'views/parkingslot/index.html',
  '#parkingzone': 'views/parkingzone/index.html',
  '#amenity': 'views/amenity/index.html',
  '#notification': 'views/notification/index.html',
  '#documentType': 'views/documentType/index.html',
  '#profile': 'views/profile/index.html',
  '#status': 'views/status/index.html',
  '#report': 'views/report/index.html'
};

function loadContent() {
  const hash = window.location.hash || '#dashboard';
  const viewPath = routes[hash] || routes['#dashboard'];
  
  // Agregar efecto de transición al cambiar vista
  const cardBody = document.querySelector('.card-body');
  cardBody.classList.add('content-loading');
  
  // Fade out del iframe actual
  contentFrame.classList.remove('loaded');
  
  // Cambiar la fuente después de un pequeño delay
  setTimeout(() => {
    contentFrame.src = viewPath;
    cardBody.classList.remove('content-loading');
  }, 50);
  
  // Actualizar enlaces activos
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === hash);
  });
}

// Función para manejar cuando el iframe termina de cargar
function handleIframeLoad() {
  setTimeout(() => {
    contentFrame.classList.add('loaded');
    document.querySelector('.card-body').classList.add('fade-in');
  }, 30);
}

// Event listeners
contentFrame.addEventListener('load', handleIframeLoad);
loadContent();
window.addEventListener('hashchange', loadContent);

});
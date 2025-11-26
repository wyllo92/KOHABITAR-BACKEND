/**
 * The function `getDataServices` is an asynchronous function that sends a request to a specified URL
 * with optional data using the specified method.
 * @param data - The `data` parameter is the data that you want to send in the request. If it's not
 * empty, it will be converted to a JSON string and included in the request body.
 * @param method - The `method` parameter in the `getDataServices` function specifies the HTTP method
 * to be used in the request. It can be one of the following values: 'GET', 'POST', 'PUT', 'DELETE',
 * etc. This determines how the server should process the request being sent.
 * @param url - The `url` parameter in the `getDataServices` function is the URL to which the HTTP
 * request will be sent. It specifies the location of the server resource that the request is being
 * made to.
 * @returns The `getDataServices` function is returning a Promise that resolves to the result of the
 * `fetch` function with the provided `url` and `parameters`. The `fetch` function is used to make a
 * network request to the specified URL with the specified parameters.
 */
async function getDataServices(data, method, url) {
  let parameters;
  // El sistema obtiene el token de autenticación si existe
  const token = localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN);

  parameters = {
    method: method,
    mode: 'cors',
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }
  }

  // El sistema incluye el token en los headers si existe
  if (token) {
    parameters.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data != "") {
    parameters.body = JSON.stringify(data);
  }

  return await fetch(url, parameters);
}
async function getServicesAuth(data, method, url, token) {
  let parameters;
    parameters = {
      method: method,
      mode: 'cors',
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      }
    }
    // El sistema incluye body solo si hay datos válidos (no null, no undefined, no string vacío)
    if (data != null && data != "" && data !== undefined) {
      parameters.body = JSON.stringify(data);
    }

  return await fetch(url, parameters);
}
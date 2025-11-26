/**
 * Author:Diego Casallas
 * Description: Clase para manejo y validación de formularios
 * Date:05/06/2025
 * File: Form.js
 */
class Form {

  /**
   * Constructor de la clase Form
   * @param {string} idForm - ID del formulario HTML
   * @param {string} classEditInput - Clase CSS para identificar inputs editables
   */
  constructor(idForm, classEditInput) {
    this.objForm = document.getElementById(idForm);
    this.classEdit = classEditInput;

    // Configuración de validaciones por tipo de input
    this.VALIDATIONS = {
      text: {
        messageError: "Por favor ingrese un texto válido (3-50 caracteres alfanuméricos)",
        regExp: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]{3,50}$/,
        validate: (value) => {
          const trimmed = value.trim();
          return trimmed.length >= 3 && trimmed.length <= 50;
        }
      },
      number: {
        messageError: "Por favor ingrese un número válido",
        regExp: /^[0-9]+$/,
        validate: (value) => {
          const num = parseInt(value);
          return !isNaN(num) && num >= 0;
        }
      },
      email: {
        messageError: "Por favor ingrese un email válido",
        regExp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        validate: (value) => {
          const email = value.trim().toLowerCase();
          return this.VALIDATIONS.email.regExp.test(email);
        }
      },
      password: {
        messageError: "La contraseña debe tener: 8-20 caracteres, minúscula, mayúscula, número y carácter especial",
        regExp: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
        validate: (value) => {
          return this.VALIDATIONS.password.regExp.test(value);
        }
      },
      tel: {
        messageError: "Por favor ingrese un número de teléfono válido",
        regExp: /^[\+]?[0-9\s\-\(\)]{7,15}$/,
        validate: (value) => {
          const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
          return cleanPhone.length >= 7 && cleanPhone.length <= 15;
        }
      },
      url: {
        messageError: "Por favor ingrese una URL válida",
        regExp: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        validate: (value) => {
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        }
      },
      date: {
        messageError: "Por favor ingrese una fecha válida",
        validate: (value) => {
          const date = new Date(value);
          return !isNaN(date.getTime());
        }
      },
      time: {
        messageError: "Por favor ingrese una hora válida",
        regExp: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        validate: (value) => {
          return this.VALIDATIONS.time.regExp.test(value);
        }
      },
      textarea: {
        messageError: "Por favor ingrese un texto válido (mínimo 10 caracteres)",
        validate: (value) => {
          const trimmed = value.trim();
          return trimmed.length >= 10;
        }
      },
      select: {
        messageError: "Por favor seleccione una opción válida",
        validate: (value) => {
          return value !== "" && value !== null && value !== undefined;
        }
      }
    };

    // Configuración de validaciones personalizadas
    this.CUSTOM_VALIDATIONS = {
      required: {
        messageError: "Este campo es obligatorio",
        validate: (value) => {
          return value !== "" && value !== null && value !== undefined;
        }
      },
      minLength: (min) => ({
        messageError: `Mínimo ${min} caracteres requeridos`,
        validate: (value) => {
          return value.trim().length >= min;
        }
      }),
      maxLength: (max) => ({
        messageError: `Máximo ${max} caracteres permitidos`,
        validate: (value) => {
          return value.trim().length <= max;
        }
      }),
      minValue: (min) => ({
        messageError: `El valor mínimo es ${min}`,
        validate: (value) => {
          const num = parseFloat(value);
          return !isNaN(num) && num >= min;
        }
      }),
      maxValue: (max) => ({
        messageError: `El valor máximo es ${max}`,
        validate: (value) => {
          const num = parseFloat(value);
          return !isNaN(num) && num <= max;
        }
      }),
      pattern: (regex, message) => ({
        messageError: message || "El formato no es válido",
        validate: (value) => {
          return regex.test(value);
        }
      })
    };
  }

  /**
   * Obtiene el elemento del formulario
   * @returns {HTMLElement} Elemento del formulario
   */
  getForm() {
    return this.objForm;
  }

  /**
   * Valida todo el formulario
   * @returns {boolean} true si el formulario es válido, false en caso contrario
   */
  validateForm() {
    const elementsForm = Array.from(this.objForm.querySelectorAll("input, select, textarea"));
    let isValid = true;

    for (const element of elementsForm) {
      // Saltar elementos con la clase de edición si están deshabilitados
      if (element.classList.contains(this.classEdit) && element.disabled) {
        continue;
      }

      if (!this.validateInputs(element)) {
        element.focus();
        isValid = false;
      }
    }
    return isValid;
  }

  /**
   * Valida un input específico
   * @param {HTMLElement} input - Elemento input a validar
   * @returns {boolean} true si el input es válido, false en caso contrario
   */
  validateInputs(input) {
    const type = input.type || input.tagName.toLowerCase();
    const value = input.value;
    
    // Validar campos requeridos
    if (input.hasAttribute('required') || input.classList.contains('required')) {
      const requiredValidation = this.CUSTOM_VALIDATIONS.required;
      if (!requiredValidation.validate(value)) {
        this.showError(input, requiredValidation.messageError);
        return false;
      }
    }

    // Si el campo está vacío y no es requerido, considerarlo válido
    if (value.trim() === '' && !input.hasAttribute('required')) {
      this.clearError(input);
      return true;
    }

    // Obtener validación según el tipo
    let validation = this.VALIDATIONS[type];
    
    // Si no hay validación específica para el tipo, usar validación genérica
    if (!validation) {
      validation = {
        messageError: "Por favor ingrese un valor válido",
        validate: (val) => val.trim().length > 0
      };
    }

    // Ejecutar validación
    const isValid = validation.validate ? validation.validate(value) : validation.regExp.test(value);

    if (!isValid) {
      this.showError(input, validation.messageError);
      return false;
    } else {
      this.clearError(input);
    }

    // Validar atributos personalizados
    return this.validateCustomAttributes(input);
  }

  /**
   * Valida atributos personalizados del input
   * @param {HTMLElement} input - Elemento input a validar
   * @returns {boolean} true si todas las validaciones personalizadas pasan
   */
  validateCustomAttributes(input) {
    const value = input.value;

    // Validar minlength
    if (input.hasAttribute('minlength')) {
      const minLength = parseInt(input.getAttribute('minlength'));
      const minLengthValidation = this.CUSTOM_VALIDATIONS.minLength(minLength);
      if (!minLengthValidation.validate(value)) {
        this.showError(input, minLengthValidation.messageError);
        return false;
      }
    }

    // Validar maxlength
    if (input.hasAttribute('maxlength')) {
      const maxLength = parseInt(input.getAttribute('maxlength'));
      const maxLengthValidation = this.CUSTOM_VALIDATIONS.maxLength(maxLength);
      if (!maxLengthValidation.validate(value)) {
        this.showError(input, maxLengthValidation.messageError);
        return false;
      }
    }

    // Validar min
    if (input.hasAttribute('min')) {
      const min = parseFloat(input.getAttribute('min'));
      const minValidation = this.CUSTOM_VALIDATIONS.minValue(min);
      if (!minValidation.validate(value)) {
        this.showError(input, minValidation.messageError);
        return false;
      }
    }

    // Validar max
    if (input.hasAttribute('max')) {
      const max = parseFloat(input.getAttribute('max'));
      const maxValidation = this.CUSTOM_VALIDATIONS.maxValue(max);
      if (!maxValidation.validate(value)) {
        this.showError(input, maxValidation.messageError);
        return false;
      }
    }

    // Validar pattern personalizado
    if (input.hasAttribute('data-pattern')) {
      const pattern = new RegExp(input.getAttribute('data-pattern'));
      const message = input.getAttribute('data-pattern-message') || "El formato no es válido";
      const patternValidation = this.CUSTOM_VALIDATIONS.pattern(pattern, message);
      if (!patternValidation.validate(value)) {
        this.showError(input, patternValidation.messageError);
        return false;
      }
    }

    return true;
  }

  /**
   * Muestra un error en el input
   * @param {HTMLElement} input - Elemento input
   * @param {string} message - Mensaje de error
   */
  showError(input, message) {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    
    // Buscar span de error existente
    let errorSpan = input.parentNode.querySelector(".error-message");
    
    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.classList.add("error-message", "text-danger", "small", "d-block", "mt-1");
      input.parentNode.insertBefore(errorSpan, input.nextSibling);
    }
    
    errorSpan.textContent = message;
    errorSpan.style.display = "block";
  }

  /**
   * Limpia el error del input
   * @param {HTMLElement} input - Elemento input
   */
  clearError(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    
    const errorSpan = input.parentNode.querySelector(".error-message");
    if (errorSpan) {
      errorSpan.style.display = "none";
      errorSpan.textContent = "";
    }
  }

  /**
   * Limpia todos los errores del formulario
   */
  clearAllErrors() {
    const elementsForm = this.objForm.querySelectorAll("input, select, textarea");
    elementsForm.forEach(element => {
      this.clearError(element);
    });
  }

  /**
   * Valida un input en tiempo real
   * @param {HTMLElement} input - Elemento input a validar
   */
  validateOnInput(input) {
    // Usar debounce para evitar demasiadas validaciones
    clearTimeout(input.validationTimeout);
    input.validationTimeout = setTimeout(() => {
      this.validateInputs(input);
    }, 300);
  }

  /**
   * Configura validación en tiempo real para todos los inputs del formulario
   */
  setupRealTimeValidation() {
    const elementsForm = this.objForm.querySelectorAll("input, select, textarea");
    elementsForm.forEach(element => {
      element.addEventListener('input', () => this.validateOnInput(element));
      element.addEventListener('blur', () => this.validateInputs(element));
      element.addEventListener('change', () => this.validateInputs(element));
    });
  }

  /**
   * The function `getDataFormData` retrieves form data from input, select, and textarea elements and
   * returns it as a FormData object.
   * @returns The `getDataFormData()` function returns a FormData object containing the data from the
   * form elements (input, select, textarea) that have a name or id attribute. The function iterates over the
   * form elements, checks their type (checkbox, select, textarea), and appends the element's name (or id) and
   * value (trimmed) to the FormData object.
   */
  getDataFormData() {
    var elementsForm = this.objForm.querySelectorAll('input, select, textarea');
    let fromData = new FormData();
    elementsForm.forEach(function (element) {
      // Usar 'name' si existe, sino usar 'id'
      const key = element.name || element.id;
      if (key) {
        if (element.tagName === 'INPUT') {
          if (element.type === 'checkbox') {
            fromData.append(key, element.checked);
          } else {
            fromData.append(key, element.value.trim());
          }
        } else if (element.tagName === 'SELECT') {
          fromData.append(key, element.value.trim());
        }
        else if (element.tagName === 'TEXTAREA') {
          fromData.append(key, element.value.trim());
        }
      }
    });
    return fromData;
  }

  /**
   * The function `setDataFormJson` populates form input fields with values from a JSON object based on
   * matching keys.
   * @param json - The `json` parameter in the `setDataFormJson` function is an object that contains
   * key-value pairs representing data that needs to be set in a form. The keys in the `json` object
   * correspond to the `id` attributes of form elements, and the values represent the data that should be
   */
  setDataFormJson(json) {
    let elements = this.objForm.querySelectorAll("input,select,textarea");
    let jsonKeys = Object.keys(json);
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].type == "checkbox") {
        if (jsonKeys.includes(elements[i].id)) {
          elements[i].checked = (json[elements[i].id] == 0) ? false : true;
        }
      } else if (elements[i].tagName === 'SELECT') {
        if (jsonKeys.includes(elements[i].id)) {
          elements[i].value = json[elements[i].id];
          elements[i].selected = true;
        }

      } else if (elements[i].tagName === 'TEXTAREA') {
        if (jsonKeys.includes(elements[i].id)) {
          elements[i].value = json[elements[i].id];
        }
      } else {
        if (jsonKeys.includes(elements[i].id)) {
          elements[i].value = json[elements[i].id];
        }
      }
    }
  }

  /**
   * The function `getDataForm` retrieves data from form elements and returns it as a JSON object.
   * @returns The `getDataForm()` function returns an object containing the data from the form elements
   * with IDs or names in the form. The data is collected based on the element type (input, select, textarea) and
   * stored in the object with the element NAME (or ID if name is not present) as the key and the trimmed value as the value.
   * If the element is a checkbox, the value stored is the checked status.
   */
  getDataForm() {
    var elementsForm = this.objForm.querySelectorAll('input, select, textarea');
    let getJson = {};
    elementsForm.forEach(function (element) {
      // Usar 'name' si existe, sino usar 'id'
      const key = element.name || element.id;
      if (key) {
        if (element.tagName === 'INPUT') {
          if (element.type === 'checkbox') {
            getJson[key] = element.checked;
          } else {
            getJson[key] = element.value.trim();
          }
        } else if (element.tagName === 'SELECT') {
          getJson[key] = element.value.trim();
        } else if (element.tagName === 'TEXTAREA') {
          getJson[key] = element.value.trim();
        }
      }
    });
    return getJson;
  }

  /**
   * The `resetForm` function clears the values of input fields and textareas within a specified form.
   */
  resetForm() {
    let elementInput = this.objForm.querySelectorAll('input,select');
    let elementTextarea = this.objForm.querySelectorAll('textarea');
    for (let i = 0; i < elementInput.length; i++) {
      elementInput[i].value = "";
    }
    for (let j = 0; j < elementTextarea.length; j++) {
      elementTextarea[j].value = "";
    }
    this.objForm.reset();
  }

  /**
   * The `disabledForm` function disables all input fields and textareas within a specified form and resets the form.
   */
  disabledForm() {
    let elementInput = this.objForm.querySelectorAll('input,select');
    let elementTextarea = this.objForm.querySelectorAll('textarea');
    for (let i = 0; i < elementInput.length; i++) {
      elementInput[i].disabled = true;
    }
    for (let j = 0; j < elementTextarea.length; j++) {
      elementTextarea[j].disabled = true;
    }
    this.objForm.reset();
  }

  /**
   * The `enabledForm` function enables all input fields and textareas within a specified form and resets the form.
   */
  enabledForm() {
    let elementInput = this.objForm.querySelectorAll('input,select');
    let elementTextarea = this.objForm.querySelectorAll('textarea');
    for (let i = 0; i < elementInput.length; i++) {
      elementInput[i].disabled = false;
    }
    for (let j = 0; j < elementTextarea.length; j++) {
      elementTextarea[j].disabled = false;
    }
    this.objForm.reset();
  }

  /**
   * The function `enabledEditForm` enables or disables form input elements based on their class names.
   */
  enabledEditForm() {
    let elementInput = this.objForm.querySelectorAll('input,select');
    let elementTextarea = this.objForm.querySelectorAll('textarea');

    for (let i = 0; i < elementInput.length; i++) {
      if (elementInput[i].classList.contains(this.classEdit)) {
        elementInput[i].disabled = true;
      } else {
        elementInput[i].disabled = false;
      }
    }
    for (let j = 0; j < elementTextarea.length; j++) {
      elementTextarea[j].disabled = false;
      if (elementTextarea[j].classList.contains(this.classEdit)) {
        elementTextarea[j].disabled = true;
      } else {
        elementTextarea[j].disabled = false;
      }
    }
    this.objForm.reset();
  }

  /**
   * The function `disabledButton` disables all buttons within a specified form.
   */
  disabledButton() {
    let elementButton = this.objForm.querySelectorAll('button');
    //console.log(elementButton);
    for (let i = 0; i < elementButton.length; i++) {
      elementButton[i].disabled = true;
    }
  }

  /**
   * The function `enabledButton` enables all buttons within a specified form element.
   */
  enabledButton() {
    let elementButton = this.objForm.querySelectorAll('button');
    for (let i = 0; i < elementButton.length; i++) {
      elementButton[i].disabled = false;
    }
  }
  /**
   * The `hiddenButton` function hides all buttons within a specified form element.
   */
  hiddenButton() {
    let elementButton = this.objForm.querySelectorAll('button');
    for (let i = 0; i < elementButton.length; i++) {
      elementButton[i].style.display = "none";
    }
  }
  /**
   * The `showButton` function selects all button elements within a form and sets their display style
   * to "block".
   */
  showButton() {
    let elementButton = this.objForm.querySelectorAll('button');
    for (let i = 0; i < elementButton.length; i++) {
      elementButton[i].style.display = "block";
    }
  }

  /**
   * Agrega una validación personalizada
   * @param {string} name - Nombre de la validación
   * @param {Function} validator - Función de validación
   * @param {string} message - Mensaje de error
   */
  addCustomValidation(name, validator, message) {
    this.CUSTOM_VALIDATIONS[name] = {
      messageError: message,
      validate: validator
    };
  }

  /**
   * Valida un campo específico por su ID
   * @param {string} fieldId - ID del campo a validar
   * @returns {boolean} true si es válido, false en caso contrario
   */
  validateField(fieldId) {
    const field = this.objForm.querySelector(`#${fieldId}`);
    if (field) {
      return this.validateInputs(field);
    }
    return false;
  }

  /**
   * Obtiene todos los errores del formulario
   * @returns {Array} Array de objetos con información de errores
   */
  getFormErrors() {
    const errors = [];
    const elementsForm = this.objForm.querySelectorAll("input, select, textarea");
    
    elementsForm.forEach(element => {
      if (element.classList.contains('is-invalid')) {
        const errorSpan = element.parentNode.querySelector(".error-message");
        errors.push({
          field: element.id || element.name,
          message: errorSpan ? errorSpan.textContent : 'Campo inválido',
          element: element
        });
      }
    });
    
    return errors;
  }

  /**
   * Verifica si el formulario tiene errores
   * @returns {boolean} true si hay errores, false en caso contrario
   */
  hasErrors() {
    return this.getFormErrors().length > 0;
  }

  /**
   * Valida formato de documento (cédula, pasaporte, etc.)
   * @param {string} value - Valor a validar
   * @param {string} type - Tipo de documento ('cedula', 'pasaporte', 'nit')
   * @returns {boolean} true si es válido
   */
  validateDocument(value, type = 'cedula') {
    const cleanValue = value.replace(/[^0-9]/g, '');
    
    switch(type) {
      case 'cedula':
        return cleanValue.length === 10;
      case 'pasaporte':
        return cleanValue.length >= 6 && cleanValue.length <= 12;
      case 'nit':
        return cleanValue.length >= 9 && cleanValue.length <= 15;
      default:
        return cleanValue.length >= 5;
    }
  }

  /**
   * Valida formato de código postal colombiano
   * @param {string} value - Valor a validar
   * @returns {boolean} true si es válido
   */
  validatePostalCode(value) {
    const cleanValue = value.replace(/[^0-9]/g, '');
    return cleanValue.length === 6;
  }

  /**
   * Valida formato de placa de vehículo colombiana
   * @param {string} value - Valor a validar
   * @returns {boolean} true si es válido
   */
  validateLicensePlate(value) {
    const plateRegex = /^[A-Z]{3}[0-9]{3}$|^[A-Z]{3}[0-9]{2}[A-Z]$/;
    return plateRegex.test(value.toUpperCase());
  }

  /**
   * Valida formato de tarjeta de crédito
   * @param {string} value - Valor a validar
   * @returns {boolean} true si es válido
   */
  validateCreditCard(value) {
    const cleanValue = value.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanValue)) return false;
    
    // Algoritmo de Luhn
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanValue.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanValue.charAt(i));
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Valida formato de fecha futura
   * @param {string} value - Valor de fecha a validar
   * @returns {boolean} true si es una fecha futura válida
   */
  validateFutureDate(value) {
    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return inputDate > today;
  }

  /**
   * Valida formato de fecha pasada
   * @param {string} value - Valor de fecha a validar
   * @returns {boolean} true si es una fecha pasada válida
   */
  validatePastDate(value) {
    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return inputDate < today;
  }

  /**
   * Valida edad mínima
   * @param {string} value - Valor de fecha de nacimiento
   * @param {number} minAge - Edad mínima requerida
   * @returns {boolean} true si cumple la edad mínima
   */
  validateMinAge(value, minAge = 18) {
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= minAge;
    }
    
    return age >= minAge;
  }
}


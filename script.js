document.addEventListener("DOMContentLoaded", init);

function init(){

// REGISTRAZIONE
  const regForm = document.querySelector("#register");
  const specialCharacters = "~`!@#$%^&*()_-+={}[],|:;<.>/?";

  if (regForm) {
    const formInputs = regForm.querySelectorAll("input");

    formInputs.forEach(input => {
    input.addEventListener("blur", () => {
      validateField(input);
    });
    input.addEventListener("input", () => {
      if (document.getElementById(input.name + "-error").textContent) {
        validateField(input);
      }
    });
    })

    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      //SE VALIDO INVIA
      let isValid = true;

      formInputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });

      if (isValid) {
        sendRegister();
      }

      
    });
  }

  // VALIDA FORM
  function validateField(input) {
  const value = input.name === "password"
      ? input.value
      : input.value.trim();
  let errorMsg = ""

    switch (input.name) {

    case "name":
      if (!value || value.split(/\s+/).length < 2) {
        errorMsg = "Inserisci nome e cognome";
      } else if (!/^[\p{L}\s'’‘ʼ`´]+$/u.test(value)) {
        errorMsg = "Il nome contiene caratteri non consentiti"
      }
      break;

    case "email":
      if (!value || input.validity.typeMismatch || !/^[^\s@]+@[^.\s@]+\.[^.\s@]+$/.test(value)) {
        errorMsg = "Inserisci un indirizzo email valido";
      }
      break;

    case "password":
      if (value.length < 8) {
        errorMsg = "La password deve contenere almeno 8 caratteri";
      } else if (!/[A-Z]/.test(value)) {
        errorMsg = "La password deve contenere almeno una lettera maiuscola";
      } else if (!/[0-9]/.test(value)) {
        errorMsg = ("La password deve contenere almeno un numero");
      } else if (![...specialCharacters].some(char => value.includes(char))) {
        errorMsg = "La password deve contenere almeno un carattere speciale";
      } else if ([...value].some(char =>!/[A-Za-z0-9]/.test(char) && !specialCharacters.includes(char))) {
        errorMsg = "La password contiene caratteri non consentiti";
        }
      break;

    case "tel":
      if (!/^[0-9]+$/.test(value)) {
        errorMsg = "Il telefono deve contenere solo numeri";
      }      
      break;
  }

  const errorMsgEl = document.getElementById(input.name + '-error')
   if (errorMsgEl) {
    errorMsgEl.textContent = errorMsg;
  }
  return errorMsg === "";
}
    
  // INVIA AL DB I CAMPI
  async function sendRegister() {

    // POTREBBE VARIARE A SECONDA DEL BACKEND
    const payload = {
        name: regForm.elements.name.value.trim(),
        email: regForm.elements.email.value.trim(),
        password: regForm.elements.password.value,
        telefono: regForm.elements.tel.value.trim()
      };

      try {
        const response = await fetch("/endpointdefinitivo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(
            `Errore HTTP ${response.status}: ${responseText}`
          );
        }

        const result = responseText
          ? JSON.parse(responseText)
          : {};

        console.log("Risposta del backend:", result);

      } catch (error) {
        console.error("Errore durante la registrazione:", error);
      }
  }

  // GENERATORE PASSWORD
  const upperCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberCharacters = "0123456789"
  const normalCharacters = "abcdefghijklmnopqrstuvwxyz"
  const allCharacters = [
    ...upperCharacters,
    ...normalCharacters,
    ...numberCharacters,
    ...specialCharacters
  ];

  const pswBtn = document.getElementById("psw-gen");
  const passwordInput = document.getElementById("password");
  const viewPswBtn = document.getElementById("view-psw");

  const nCharacters = 15;
  
  function randomIndex(max) {
    const array = new Uint32Array(1);
    const range = 2 ** 32;
    const limit = Math.floor(range / max) * max;

    do {
      crypto.getRandomValues(array);
    } while (array[0] >= limit);

    return array[0] % max;
  }

  function randomChar(characters) {
    return characters[randomIndex(characters.length)];
  }

  function generatePassword() {
    let password = [
      randomChar(upperCharacters),
      randomChar(numberCharacters),
      randomChar(specialCharacters),
      randomChar(normalCharacters)
    ];

    while (password.length < nCharacters) {
      password.push(randomChar(allCharacters));
    }

    // Mescola i caratteri
    for (let i = password.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);

      [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join("");
  }

  // GENERA PASSWORD
  if (pswBtn && passwordInput) {
    pswBtn.addEventListener("click", function () {
      passwordInput.value = generatePassword();
    });
  }

  // MOSTRA / NASCONDI PASSWORD
  if (viewPswBtn && passwordInput) {
    viewPswBtn.addEventListener("click", function () {
      viewPswBtn.classList.toggle("active");

      if (viewPswBtn.classList.contains("active")) {
        passwordInput.type = "text";
        viewPswBtn.setAttribute("aria-label", "Nascondi password");
      } else {
        passwordInput.type = "password";
        viewPswBtn.setAttribute("aria-label", "Mostra password");
      }
    });
  }

}
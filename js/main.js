// =====================================================
// Script principal - Nettoie Presto
// - Menu mobile (hamburger)
// - Réservation (date min + validation)
// - Affichage du message thankyou
// - Validation UX (Option X) -> UNIQUEMENT au submit
//   * Rouge seulement sur champs invalides au clic "Envoyer"
//   * Dès que l'utilisateur tape, on enlève rouge + message (immédiatement)
// - Remplissage Reply-To (FormSubmit)
// =====================================================

document.addEventListener("DOMContentLoaded", function () {
  /* =====================================================
     0️⃣ MENU MOBILE (HAMBURGER)
  ===================================================== */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobileNav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isHidden = mobileNav.classList.contains("hidden");

      mobileNav.classList.toggle("hidden");
      mobileNav.classList.toggle("show", isHidden);

      navToggle.setAttribute("aria-expanded", String(isHidden));
      navToggle.textContent = isHidden ? "✕" : "☰";
    });
  }

  /* =====================================================
     1️⃣ CONFIGURATION DU CHAMP DATE (Réservation)
     - Minimum = demain
     - Valeur par défaut = demain
  ===================================================== */
  const dateInput = document.getElementById("bookingDate");
  if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");

    dateInput.min = `${yyyy}-${mm}-${dd}`;
    dateInput.value = dateInput.min;
  }

  /* =====================================================
     2️⃣ AFFICHAGE DU MESSAGE THANKYOU (?thankyou=1)
  ===================================================== */
  const params = new URLSearchParams(window.location.search);
  if (params.get("thankyou") === "1") {
    const form = document.getElementById("bookingForm");
    const ty = document.getElementById("thankyou");

    if (form && ty) {
      form.style.display = "none";
      ty.classList.remove("hidden");
    }
  }

  /* =====================================================
     3️⃣ VALIDATION AU SUBMIT (Option X)
     - Pas de bulles navigateur
     - Rouge + message uniquement au clic sur "Envoyer"
     - Dès que l'utilisateur tape : on enlève rouge + message immédiatement
     - Reply-To rempli avec l’email client (FormSubmit)
  ===================================================== */
  const bookingForm = document.getElementById("bookingForm");
  if (!bookingForm) return;

  // Désactive les bulles de validation du navigateur
  bookingForm.setAttribute("novalidate", "novalidate");

  // Champs FormSubmit
  const emailInput =
    bookingForm.querySelector('input[name="email"]') ||
    bookingForm.querySelector('input[type="email"]');

  const replyToField =
    bookingForm.querySelector('input[name="_replyto"]') ||
    bookingForm.querySelector("#replyToField");

  // Helpers
  function getOrCreateErrorEl(label) {
    let err = label.querySelector(".error-message");
    if (!err) {
      err = document.createElement("div");
      err.className = "error-message";
      label.appendChild(err);
    }
    return err;
  }

  function setError(field, message) {
    const label = field.closest("label");
    if (!label) return;

    const err = getOrCreateErrorEl(label);
    err.textContent = message;

    label.classList.add("invalid", "shake");
    setTimeout(() => label.classList.remove("shake"), 300);
  }

  function clearError(field) {
    const label = field.closest("label");
    if (!label) return;

    label.classList.remove("invalid", "shake");

    const err = label.querySelector(".error-message");
    if (err) err.textContent = "";
  }

  function clearAllErrors() {
    bookingForm.querySelectorAll("label.invalid").forEach((label) => {
      label.classList.remove("invalid", "shake");
      const err = label.querySelector(".error-message");
      if (err) err.textContent = "";
    });
  }

  function defaultMessageFor(field) {
    const tag = field.tagName.toLowerCase();
    const type = (field.getAttribute("type") || "").toLowerCase();

    if (field.validity.valueMissing) {
      if (tag === "select") return "Veuillez choisir une option.";
      return "Ce champ est obligatoire.";
    }

    if (type === "email" && field.validity.typeMismatch) {
      return "Veuillez entrer une adresse email valide.";
    }

    if (
      type === "tel" &&
      (field.validity.typeMismatch || field.validity.patternMismatch)
    ) {
      return "Veuillez entrer un numéro de téléphone valide.";
    }

    if (field.validity.patternMismatch) return "Format invalide.";
    if (field.validity.tooShort) return "Valeur trop courte.";
    if (field.validity.tooLong) return "Valeur trop longue.";

    return "Veuillez vérifier ce champ.";
  }

  function validateBusinessDate() {
    const dateEl = document.getElementById("bookingDate");
    if (!dateEl || !dateEl.value) return { ok: true };

    const chosen = new Date(dateEl.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (chosen < today) {
      return {
        ok: false,
        field: dateEl,
        message: "Vous ne pouvez pas choisir une date passée.",
      };
    }
    if (chosen.getTime() === today.getTime()) {
      return {
        ok: false,
        field: dateEl,
        message: "Les réservations le jour même ne sont pas autorisées.",
      };
    }
    return { ok: true };
  }

  // ✅ IMPORTANT: dès que l'utilisateur touche un champ, on enlève l’erreur IMMÉDIATEMENT
  const fields = bookingForm.querySelectorAll("input, select, textarea");

  fields.forEach((field) => {
    if (field.type === "hidden" || field.name === "_honey") return;

    // input = frappe, change = select/date
    const removeNow = () => clearError(field);

    field.addEventListener("input", removeNow);
    field.addEventListener("change", removeNow);
    field.addEventListener("focus", removeNow);
  });

  // ✅ Validation uniquement au submit
  bookingForm.addEventListener("submit", function (e) {
    clearAllErrors();

    // Remplir Reply-To (plus fiable que "%email%")
    if (emailInput && replyToField) {
      replyToField.value = (emailInput.value || "").trim();
    }

    let firstInvalid = null;

    // Validation HTML5
    fields.forEach((field) => {
      if (field.type === "hidden" || field.name === "_honey") return;

      if (!field.checkValidity()) {
        if (!firstInvalid) firstInvalid = field;
        setError(field, defaultMessageFor(field));
      }
    });

    // Validation date métier
    const dateCheck = validateBusinessDate();
    if (!dateCheck.ok) {
      if (!firstInvalid) firstInvalid = dateCheck.field;
      setError(dateCheck.field, dateCheck.message);
    }

    // Bloque l'envoi si erreurs
    if (firstInvalid) {
      e.preventDefault();
      firstInvalid.focus();
      return false;
    }

    // ✅ Sinon, le formulaire s'envoie
  });
});

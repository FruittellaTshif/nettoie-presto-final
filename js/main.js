// =====================================================
// Script principal - Gestion réservation Nettoie Presto
// =====================================================

// On attend que tout le HTML soit chargé
document.addEventListener("DOMContentLoaded", function () {
  /* =====================================================
     1️⃣ CONFIGURATION DU CHAMP DATE
     - Définit la date minimale à demain
     - Pré-remplit automatiquement le champ
  ===================================================== */

  const dateInput = document.getElementById("bookingDate");

  if (dateInput) {
    // Date du jour
    const today = new Date();

    // Calcul de la date de demain
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Format requis par input[type="date"] => YYYY-MM-DD
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");

    // Date minimale autorisée
    dateInput.min = `${yyyy}-${mm}-${dd}`;

    // Valeur par défaut = demain
    dateInput.value = dateInput.min;
  }

  /* =====================================================
     2️⃣ AFFICHAGE DU MESSAGE DE CONFIRMATION
     - Basé sur ?thankyou=1 dans l’URL
  ===================================================== */

  const params = new URLSearchParams(window.location.search);

  if (params.get("thankyou") === "1") {
    const form = document.getElementById("bookingForm");

    if (form) {
      // Cache le formulaire
      form.style.display = "none";

      // Affiche le message "merci"
      const ty = document.getElementById("thankyou");
      if (ty) ty.classList.remove("hidden");
    }
  }

  /* =====================================================
     3️⃣ VALIDATION AVANT ENVOI DU FORMULAIRE
     - Interdit date passée
     - Interdit le jour même
     - Autorise à partir de demain
  ===================================================== */

  const bookingForm = document.getElementById("bookingForm");

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      const dateEl = document.getElementById("bookingDate");
      if (!dateEl || !dateEl.value) return;

      // Date choisie par l’utilisateur
      const chosen = new Date(dateEl.value);

      // Date du jour à minuit (pour comparaison fiable)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // ❌ Date passée
      if (chosen < today) {
        e.preventDefault();
        alert("Vous ne pouvez pas choisir une date passée.");
        dateEl.focus();
        return false;
      }

      // ❌ Réservation le jour même
      if (chosen.getTime() === today.getTime()) {
        e.preventDefault();
        alert("Les réservations le jour même ne sont pas autorisées.");
        dateEl.focus();
        return false;
      }

      // ✅ Sinon : formulaire autorisé à être envoyé
    });
  }
});

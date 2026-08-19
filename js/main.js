// main.js - JavaScript principal pour Coran Traduction

// Fonction pour changer la langue
function changeLanguage(lang) {
    console.log("Langue changée vers:", lang);
    // La fonction est définie dans index.html
    if (typeof window.loadVerses === "function") {
        // Recharger les versets avec la nouvelle langue
        window.loadVerses(window.currentSurah || 1, window.currentAyah || 1);
    }
}

// Fonction pour charger une sourate
function loadSurah(surah) {
    console.log("Chargement de la sourate:", surah);
    if (typeof window.loadSurah === "function") {
        window.loadSurah(surah);
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log(" Coran Traduction chargé");
});


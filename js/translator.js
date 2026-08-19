// translator.js - Gestion des traductions

// Configuration des langues
const LANGUAGES = {
    'fr': 'Français',
    'en': 'English',
    'ar': 'العربية',
    'es': 'Español',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'ru': 'Русский',
    'zh': '中文',
    'ja': '日本語',
    'ko': '한국어',
    'hi': 'हनद',
    'bn': 'বল',
    'pa': 'ਪਜਬ',
    'ur': 'اردو',
    'id': 'Bahasa Indonesia',
    'ms': 'Bahasa Melayu',
    'ta': 'தமழ',
    'te': 'తలగ',
    'ml': 'മലയള',
    'kn': 'ಕನನಡ',
    'mr': 'मरठ',
    'gu': 'ગજરત',
    'or': 'ଓଡଆ',
    'ne': 'नपल',
    'si': 'සහල',
    'th': 'ไทย',
    'vi': 'Tiếng Việt',
    'tl': 'Tagalog',
    'sw': 'Kiswahili',
    'ha': 'Hausa',
    'yo': 'Yorùbá',
    'ig': 'Igbo',
    'am': 'አማርኛ',
    'so': 'Soomaali',
    'zu': 'isiZulu'
};

// Variables globales
let currentLang = 'fr';
let currentSurah = 1;
let currentAyah = 1;

// Charger les versets
async function loadVerses(surah, ayah) {
    currentSurah = surah;
    currentAyah = ayah;
    
    const container = document.getElementById('translation-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading"> Chargement...</div>';
    
    try {
        // Essayer de charger le Coran depuis le fichier JSON
        const response = await fetch('data/quran_fr.json');
        if (!response.ok) throw new Error('Fichier Coran non trouvé');
        
        const quran = await response.json();
        
        // Trouver la sourate
        let surahData = null;
        for (const s of quran) {
            if (s.id === surah) {
                surahData = s;
                break;
            }
        }
        
        if (!surahData) {
            container.innerHTML = '<div class="error"> Sourate non trouvée</div>';
            return;
        }
        
        // Récupérer les versets
        const totalVerses = surahData.total_verses || surahData.verses.length;
        const start = ayah - 1;
        const end = Math.min(start + 7, totalVerses);
        
        const verses = [];
        for (let i = start; i < end; i++) {
            if (surahData.verses && surahData.verses[i]) {
                const v = surahData.verses[i];
                verses.push({
                    number: v.id || (i + 1),
                    arabic: v.text || '',
                    translation: v.translation || 'Traduction non disponible'
                });
            }
        }
        
        renderVerses({
            surah_name: surahData.translation || surahData.name || `Sourate ${surah}`,
            total_verses: totalVerses,
            verses: verses
        });
        
    } catch (error) {
        console.error('Erreur:', error);
        container.innerHTML = `<div class="error"> Erreur: ${error.message}</div>`;
    }
}

// Afficher les versets
function renderVerses(data) {
    const container = document.getElementById('translation-container');
    if (!container) return;
    
    let html = '<div class="translation-grid">';
    html += `<div style="margin-bottom:20px;font-size:1.2rem;font-weight:bold;color:#2c3e50;"> ${data.surah_name} - ${data.total_verses} versets</div>`;
    
    data.verses.forEach(v => {
        html += `
            <div class="verse-block">
                <div class="arabic-text">${v.arabic || ''}</div>
                <div class="translation-text">${v.translation || 'Traduction non disponible'}</div>
                <div class="verse-reference">
                    <span>Verset ${v.number}</span>
                    <span class="verse-number">#${v.number}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Changer de langue
function changeLanguage(lang) {
    currentLang = lang;
    loadVerses(currentSurah, currentAyah);
}

// Charger un verset spécifique
function loadAyah(ayah) {
    currentAyah = ayah;
    document.getElementById('ayah-display').textContent = ayah;
    loadVerses(currentSurah, ayah);
}

// Exporter pour utilisation globale
window.LANGUAGES = LANGUAGES;
window.loadVerses = loadVerses;
window.renderVerses = renderVerses;
window.changeLanguage = changeLanguage;
window.loadAyah = loadAyah;
window.currentLang = currentLang;
window.currentSurah = currentSurah;
window.currentAyah = currentAyah;




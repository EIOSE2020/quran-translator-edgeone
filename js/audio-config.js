// audio-config.js - Configuration des langues audio
const AUDIO_CONFIG = {
    // Langues disponibles avec leur voix TTS
    'fr': {
        name: 'Français',
        voice: 'fr-FR-Standard-A',
        gender: 'female'
    },
    'en': {
        name: 'English',
        voice: 'en-US-Standard-A',
        gender: 'female'
    },
    'ar': {
        name: 'العربية',
        voice: 'ar-XA-Standard-A',
        gender: 'male'
    },
    'es': {
        name: 'Español',
        voice: 'es-ES-Standard-A',
        gender: 'female'
    },
    'de': {
        name: 'Deutsch',
        voice: 'de-DE-Standard-A',
        gender: 'female'
    },
    'it': {
        name: 'Italiano',
        voice: 'it-IT-Standard-A',
        gender: 'female'
    },
    'pt': {
        name: 'Português',
        voice: 'pt-PT-Standard-A',
        gender: 'female'
    },
    'ru': {
        name: 'Русский',
        voice: 'ru-RU-Standard-A',
        gender: 'female'
    },
    'zh': {
        name: '中文',
        voice: 'zh-CN-Standard-A',
        gender: 'female'
    },
    'ja': {
        name: '日本語',
        voice: 'ja-JP-Standard-A',
        gender: 'female'
    },
    'ko': {
        name: '한국어',
        voice: 'ko-KR-Standard-A',
        gender: 'female'
    },
    'hi': {
        name: 'हनद',
        voice: 'hi-IN-Standard-A',
        gender: 'female'
    },
    'id': {
        name: 'Bahasa Indonesia',
        voice: 'id-ID-Standard-A',
        gender: 'female'
    },
    'ms': {
        name: 'Bahasa Melayu',
        voice: 'ms-MY-Standard-A',
        gender: 'female'
    },
    'th': {
        name: 'ไทย',
        voice: 'th-TH-Standard-A',
        gender: 'female'
    },
    'vi': {
        name: 'Tiếng Việt',
        voice: 'vi-VN-Standard-A',
        gender: 'female'
    },
    'tr': {
        name: 'Türkçe',
        voice: 'tr-TR-Standard-A',
        gender: 'female'
    },
    'tl': {
        name: 'Tagalog',
        voice: 'tl-PH-Standard-A',
        gender: 'female'
    }
};

// Fonction pour obtenir le chemin audio d'un verset
function getAudioPath(surah, ayah, lang = 'ar') {
    return `/audio/${lang}/surah_${surah}_ayah_${ayah}.mp3`;
}

// Fonction pour jouer l'audio
function playAudio(surah, ayah, lang = 'ar') {
    const audioPath = getAudioPath(surah, ayah, lang);
    const audio = new Audio(audioPath);
    audio.play().catch(e => {
        console.warn('Audio non disponible pour ce verset', e);
    });
}

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Pas besoin de __filename et __dirname avec CommonJS
// Ils sont déjà disponibles globalement

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Fonction pour lire un JSON en gérant le BOM
function readJSONFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        // Enlever le BOM si présent
        content = content.replace(/^\uFEFF/, '');
        return JSON.parse(content);
    } catch(e) {
        console.error(` Erreur lecture ${filePath}:`, e.message);
        return null;
    }
}

// Charger les données du Coran
let quranData = null;
let languagesData = null;

try {
    // Essayer de charger quran.json ou quran_fr.json
    if (fs.existsSync('data/quran.json')) {
        quranData = readJSONFile('data/quran.json');
        if (quranData) {
            console.log(' Quran chargé depuis quran.json');
        }
    } else if (fs.existsSync('data/quran_fr.json')) {
        quranData = readJSONFile('data/quran_fr.json');
        if (quranData) {
            console.log(' Quran chargé depuis quran_fr.json');
        }
    } else {
        console.log(' Aucun fichier Quran trouvé');
    }
    
    if (fs.existsSync('data/languages.json')) {
        languagesData = readJSONFile('data/languages.json');
        if (languagesData) {
            const count = languagesData.languages?.length || 0;
            console.log(` ${count} langues chargées`);
        }
    }
    
    if (fs.existsSync('data/surah_list.json')) {
        const surahList = readJSONFile('data/surah_list.json');
        if (surahList) {
            console.log(` ${surahList.length || 0} sourates chargées`);
        }
    }
    
    if (fs.existsSync('data/metadata.json')) {
        const metadata = readJSONFile('data/metadata.json');
        if (metadata) {
            console.log(` Métadonnées chargées`);
        }
    }
} catch(e) {
    console.error(' Erreur chargement données:', e);
}

// API: Récupérer les langues
app.get('/api/languages', (req, res) => {
    if (languagesData) {
        res.json(languagesData);
    } else {
        res.status(404).json({ error: 'Langues non trouvées' });
    }
});

// API: Récupérer les sourates
app.get('/api/surahs', (req, res) => {
    try {
        const surahList = readJSONFile('data/surah_list.json');
        if (surahList) {
            res.json(surahList);
        } else {
            res.status(404).json({ error: 'Liste des sourates non trouvée' });
        }
    } catch(e) {
        res.status(404).json({ error: 'Liste des sourates non trouvée' });
    }
});

// API: Tester le serveur
app.get('/api/test', (req, res) => {
    res.json({
        status: 'OK',
        quranLoaded: !!quranData,
        languagesLoaded: !!languagesData,
        deepseekKey: process.env.DEEPSEEK_API_KEY ? '' : '',
        timestamp: new Date().toISOString()
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log('');
    console.log(' Serveur démarré sur http://localhost:' + PORT);
    console.log(' Test: http://localhost:' + PORT + '/api/test');
    console.log(' Langues: http://localhost:' + PORT + '/api/languages');
    console.log(' Sourates: http://localhost:' + PORT + '/api/surahs');
    console.log('');
});